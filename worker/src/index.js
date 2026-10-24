// MyCloset · servicio «look con IA» (Cloudflare Worker).
// Recibe las fotos de un conjunto desde la app y pide a Gemini una imagen de un maniquí con esa ropa.
// La clave de Gemini solo vive aquí, como secreto del Worker; nunca llega a la app ni al repositorio.
//
// Secretos (wrangler secret put): GEMINI_API_KEY, APP_TOKEN
// Variables (wrangler.toml):      ALLOWED_ORIGINS, MODEL, GEMINI_BASE (solo para pruebas locales)

const MAX_IMAGES = 8;
const MAX_IMAGE_CHARS = 1_500_000; // ~1,1 MB por foto en base64
const MIME_OK = new Set(['image/jpeg', 'image/png', 'image/webp']);

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

function corsHeaders(req, env) {
  const origin = req.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

// Comparación en tiempo constante para no filtrar la clave por tiempos de respuesta.
function sameSecret(a, b) {
  const x = new TextEncoder().encode(String(a));
  const y = new TextEncoder().encode(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function buildPrompt(items) {
  const list = items.map((it, i) => `${i + 1}. ${it.name} (${it.type}${it.color ? ', ' + it.color : ''})${it.hasImage ? '' : ' — sin foto, usa solo la descripción'}`).join('\n');
  return [
    'Fotografía de catálogo de moda, cuerpo entero, vista frontal.',
    'Un maniquí de tienda neutro, blanco mate y sin rostro, de pie, sobre un fondo claro liso, con luz de estudio suave.',
    'El maniquí lleva puestas EXACTAMENTE estas prendas, que aparecen en las imágenes de referencia en el mismo orden:',
    list,
    'Respeta colores, tejidos, estampados y logotipos de cada prenda. Coloca las capas de forma natural (por ejemplo, camisa abierta sobre camiseta).',
    'No añadas prendas, accesorios ni texto que no estén en la lista.',
  ].join('\n');
}

function validate(body) {
  if (!body || !Array.isArray(body.items) || !body.items.length) return 'Faltan las prendas del conjunto.';
  if (body.items.length > 12) return 'Demasiadas prendas en un conjunto.';
  const images = Array.isArray(body.images) ? body.images : [];
  if (images.length > MAX_IMAGES) return `Como mucho ${MAX_IMAGES} fotos por conjunto.`;
  for (const img of images) {
    if (!img || !MIME_OK.has(img.mime_type) || typeof img.data !== 'string') return 'Alguna foto no tiene un formato válido.';
    if (img.data.length > MAX_IMAGE_CHARS) return 'Alguna foto es demasiado grande.';
  }
  for (const it of body.items) {
    if (!it || typeof it.name !== 'string' || typeof it.type !== 'string') return 'Alguna prenda está incompleta.';
  }
  return null;
}

// Busca la imagen en la respuesta de la Interactions API (output_image o el último bloque de imagen).
function pickImage(data) {
  if (data?.output_image?.data) return { data: data.output_image.data, mime_type: data.output_image.mime_type || 'image/png' };
  for (const step of [...(data?.steps || [])].reverse()) {
    for (const part of [...(step?.content || [])].reverse()) {
      if (part?.type === 'image' && part.data) return { data: part.data, mime_type: part.mime_type || 'image/png' };
    }
  }
  return null;
}

export default {
  async fetch(req, env) {
    const cors = corsHeaders(req, env);
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') return cors ? new Response(null, { status: 204, headers: cors }) : new Response(null, { status: 403 });
    if (!cors) return json({ error: 'Origen no permitido.' }, 403, {});
    if (url.pathname !== '/look' || req.method !== 'POST') return json({ error: 'No encontrado.' }, 404, cors);
    if (!env.GEMINI_API_KEY || !env.APP_TOKEN) return json({ error: 'El servicio no está configurado.' }, 500, cors);

    const auth = req.headers.get('Authorization') || '';
    if (!sameSecret(auth.replace(/^Bearer\s+/i, ''), env.APP_TOKEN)) return json({ error: 'La clave de la app no es correcta.' }, 401, cors);

    let body;
    try { body = await req.json(); } catch { return json({ error: 'Petición no válida.' }, 400, cors); }
    const problem = validate(body);
    if (problem) return json({ error: problem }, 400, cors);

    const items = body.items.map((it) => ({ name: String(it.name).slice(0, 80), type: String(it.type).slice(0, 40), color: it.color ? String(it.color).slice(0, 30) : '', hasImage: Boolean(it.hasImage) }));
    const input = [
      { type: 'text', text: buildPrompt(items) },
      ...(body.images || []).map((img) => ({ type: 'image', mime_type: img.mime_type, data: img.data })),
    ];

    const base = env.GEMINI_BASE || 'https://generativelanguage.googleapis.com';
    let res;
    try {
      res = await fetch(`${base}/v1beta/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({
          model: env.MODEL || 'gemini-nano-banana-2.1',
          input,
          response_format: { type: 'image', aspect_ratio: '3:4', image_size: '1K' },
        }),
      });
    } catch {
      return json({ error: 'No se ha podido contactar con Gemini.' }, 502, cors);
    }

    if (!res.ok) {
      // No se reenvía el cuerpo de Google tal cual: solo un resumen sin datos sensibles.
      const status = res.status === 429 ? 429 : 502;
      const msg = res.status === 429 ? 'Gemini está saturado o has llegado a tu límite. Prueba en un rato.'
        : res.status === 400 ? 'Gemini ha rechazado la petición (puede que alguna foto no le valga).'
          : `Gemini ha respondido con un error (${res.status}).`;
      return json({ error: msg }, status, cors);
    }

    const image = pickImage(await res.json().catch(() => null));
    if (!image) return json({ error: 'Gemini no ha devuelto ninguna imagen. Prueba otra vez.' }, 502, cors);
    return json({ image }, 200, cors);
  },
};
