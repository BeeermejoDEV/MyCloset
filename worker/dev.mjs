// Banco de pruebas local del Worker, sin Cloudflare ni Gemini reales.
// Uso: node MyCloset/worker/dev.mjs  →  servicio en http://127.0.0.1:8787/look
// Lee la configuración de worker/.dev.vars (no se sube a Git). Con GEMINI_BASE=mock arranca una
// Gemini simulada que devuelve una foto de datos-prueba, para probar la app sin gastar nada.
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import worker from './src/index.js';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const env = { ALLOWED_ORIGINS: 'http://localhost:5190,http://127.0.0.1:5190', MODEL: 'gemini-nano-banana-2.1' };
if (existsSync(here('.dev.vars'))) {
  for (const line of readFileSync(here('.dev.vars'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
}

if (env.GEMINI_BASE === 'mock') {
  const sample = readFileSync(here('../datos-prueba/fotos/camisa-celeste.jpg')).toString('base64');
  createServer((req, res) => {
    let size = 0;
    req.on('data', (c) => { size += c.length; });
    req.on('end', () => {
      console.log(`[gemini simulada] ${req.method} ${req.url} · ${Math.round(size / 1024)} KB · clave ${req.headers['x-goog-api-key'] ? 'recibida' : 'FALTA'}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 'mock', output_image: { data: sample, mime_type: 'image/jpeg' } }));
    });
  }).listen(8788, '127.0.0.1');
  env.GEMINI_BASE = 'http://127.0.0.1:8788';
}

createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request(`http://127.0.0.1:8787${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : Buffer.concat(chunks),
  });
  const out = await worker.fetch(request, env);
  res.writeHead(out.status, Object.fromEntries(out.headers));
  res.end(Buffer.from(await out.arrayBuffer()));
}).listen(8787, '127.0.0.1', () => console.log(`Servicio de looks en http://127.0.0.1:8787/look (Gemini ${env.GEMINI_BASE?.includes('127.0.0.1') ? 'simulada' : 'real'})`));
