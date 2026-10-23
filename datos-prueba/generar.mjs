// Genera una copia de MyCloset con ropa y conjuntos de PRUEBA (no es el armario real).
// Uso: node MyCloset/datos-prueba/generar.mjs  →  crea mycloset-prueba.json al lado.
// Se carga desde Ajustes → «Restaurar una copia» (reemplaza el armario actual).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ts = '2026-10-23T20:00:00.000Z';
const HEX = {
  Negro: '#1c1c1c', Blanco: '#f8f8f6', Gris: '#9a9a9a', Beige: '#d9c8a9', 'Marrón': '#7a5233',
  'Azul marino': '#1f2a44', Azul: '#3b6fb6', Celeste: '#9cc4e4', Caqui: '#8a8458',
};
// Siluetas sencillas por categoría (dibujos, no fotos reales).
const SHAPE = {
  top: 'M70 40 20 70l20 40 25-12v122h90V98l25 12 20-40-50-30c-6 16-20 25-35 25s-29-9-35-25z',
  bottom: 'M65 30h90l12 190h-44l-13-115-13 115H53z',
  outer: 'M80 30 110 55l30-25 50 25v165h-45V140h-70v80H30V55z',
  shoes: 'M25 150v-60l40-8 25 23 60 10c30 5 55 17 55 35v20H25z',
  acc: 'M110 125m-50 0a50 50 0 1 0 100 0a50 50 0 1 0-100 0M92 78l8-48h20l8 48M92 172l8 48h20l8-48',
};

// Fotos reales de Unsplash (licencia gratuita) en fotos/<id>.jpg; si falta alguna, se usa el dibujo.
function jpegSize(buf) {
  for (let i = 2; i < buf.length;) {
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xc3) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return { width: 0, height: 0 };
}

function image(id, category, color, garmentId) {
  const photo = fileURLToPath(new URL(`fotos/${garmentId}.jpg`, import.meta.url));
  if (existsSync(photo)) {
    const buf = readFileSync(photo);
    return { id, data: `data:image/jpeg;base64,${buf.toString('base64')}`, mimeType: 'image/jpeg', ...jpegSize(buf) };
  }
  const fill = HEX[color] || '#999';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 250"><rect width="220" height="250" fill="#efece6"/><path d="${SHAPE[category]}" fill="${fill}" stroke="#00000033" stroke-width="3" stroke-linejoin="round"/></svg>`;
  return { id, data: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`, mimeType: 'image/svg+xml', width: 220, height: 250 };
}

// [id, nombre, categoría, tipo, color, conFoto]
const G = [
  ['camiseta-blanca', 'Camiseta blanca', 'top', 'Camiseta', 'Blanco', true],
  ['camiseta-negra', 'Camiseta negra', 'top', 'Camiseta', 'Negro', true],
  ['sudadera-negra', 'Sudadera negra con capucha', 'top', 'Sudadera', 'Negro', true],
  ['jersey-gris', 'Jersey largo gris', 'top', 'Jersey', 'Gris', true],
  ['camisa-celeste', 'Camisa azul oscuro', 'top', 'Camisa', 'Azul marino', true],
  ['sobrecamisa-caqui', 'Sobrecamisa verde', 'top', 'Sobrecamisa', 'Verde', true],
  ['pantalon-beige', 'Pantalón beige de vestir', 'bottom', 'Pantalón de vestir', 'Beige', true],
  ['vaquero-azul', 'Vaquero azul recto', 'bottom', 'Vaquero', 'Azul', true],
  ['chino-marino', 'Vaquero oscuro', 'bottom', 'Vaquero', 'Azul marino', true],
  ['jogger-gris', 'Jogger negro con rayas', 'bottom', 'Jogger', 'Negro', true],
  ['abrigo-marron', 'Chaqueta de cuero marrón', 'outer', 'Chaqueta', 'Marrón', true],
  ['cazadora-negra', 'Cazadora de cuero negra', 'outer', 'Cazadora', 'Negro', true],
  ['zapatillas-blancas', 'Zapatillas blancas', 'shoes', 'Zapatillas', 'Blanco', true],
  ['botas-marrones', 'Botas marrones', 'shoes', 'Botas', 'Marrón', true],
  ['reloj-plateado', 'Reloj plateado', 'acc', 'Reloj', 'Gris', true],
];

const garments = [], images = [];
for (const [id, name, category, type, color, withPhoto] of G) {
  const hasRealPhoto = existsSync(fileURLToPath(new URL(`fotos/${id}.jpg`, import.meta.url)));
  const imageId = withPhoto || hasRealPhoto ? `img-${id}` : null;
  if (imageId) images.push(image(imageId, category, color, id));
  garments.push({ id, name, category, type, color, imageId, archived: false, createdAt: ts, updatedAt: ts });
}

const compatibilities = [
  ['pantalon-beige', 'sudadera-negra'], ['pantalon-beige', 'jersey-gris'], ['pantalon-beige', 'camisa-celeste'],
  ['pantalon-beige', 'zapatillas-blancas'], ['pantalon-beige', 'abrigo-marron'],
  ['vaquero-azul', 'camiseta-blanca'], ['vaquero-azul', 'sobrecamisa-caqui'], ['vaquero-azul', 'sudadera-negra'],
  ['vaquero-azul', 'botas-marrones'], ['chino-marino', 'camisa-celeste'], ['chino-marino', 'jersey-gris'],
  ['jogger-gris', 'camiseta-negra'], ['jogger-gris', 'zapatillas-blancas'], ['camiseta-blanca', 'sobrecamisa-caqui'],
].map(([a, b]) => (a < b ? { firstGarmentId: a, secondGarmentId: b } : { firstGarmentId: b, secondGarmentId: a }));

const outfits = [
  ['beige-sudadera', 'Beige con sudadera negra', ['pantalon-beige', 'sudadera-negra', 'zapatillas-blancas']],
  ['beige-jersey', 'Beige con jersey largo', ['pantalon-beige', 'jersey-gris', 'botas-marrones', 'reloj-plateado']],
  ['beige-arreglado', 'Beige con chaqueta de cuero', ['pantalon-beige', 'camisa-celeste', 'jersey-gris', 'abrigo-marron', 'botas-marrones']],
  ['vaquero-capas', 'Vaquero con sobrecamisa verde', ['vaquero-azul', 'camiseta-blanca', 'sobrecamisa-caqui', 'zapatillas-blancas']],
  ['vaquero-negro', 'Vaquero y negro', ['vaquero-azul', 'sudadera-negra', 'cazadora-negra', 'botas-marrones']],
  ['chino-camisa', 'Vaquero oscuro con camisa', ['chino-marino', 'camisa-celeste', 'zapatillas-blancas', 'reloj-plateado']],
  ['comodo', 'Cómodo para la biblioteca', ['jogger-gris', 'camiseta-negra', 'sudadera-negra', 'zapatillas-blancas']],
].map(([id, name, garmentIds]) => ({ id: `prueba-${id}`, name, garmentIds, createdAt: ts, updatedAt: ts }));

const backup = { app: 'MyCloset', schemaVersion: 1, exportedAt: ts, garments, images, compatibilities, outfits };
// No se guarda en dist/: así nunca se publica. serve.mjs lo sirve en local para el botón de Ajustes.
const out = fileURLToPath(new URL('mycloset-prueba.json', import.meta.url));
writeFileSync(out, JSON.stringify(backup, null, 2));
console.log(`${garments.length} prendas, ${compatibilities.length} combinaciones, ${outfits.length} conjuntos → ${out}`);
