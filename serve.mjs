// Servidor estático mínimo para probar MyCloset en local y desde el iPhone (misma wifi).
// Uso: node MyCloset/serve.mjs  →  http://localhost:5190 (solo este Mac)
//      HOST=0.0.0.0 node MyCloset/serve.mjs  →  también desde otros dispositivos de tu wifi
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const port = Number(process.env.PORT) || 5190;
// Por defecto solo escucha en este ordenador (IPv4 e IPv6, para que «localhost» funcione siempre).
// Con HOST=0.0.0.0 escucha en todas las direcciones, también para otros dispositivos de tu wifi.
const wifi = process.env.HOST === '0.0.0.0';
const hosts = wifi ? ['::'] : process.env.HOST ? [process.env.HOST] : ['127.0.0.1', '::1'];
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json',
};

async function handle(req, res) {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  // Los datos de prueba solo existen en local: no están en dist/ y no se publican.
  const file = path === '/mycloset-prueba.json'
    ? join(root, '..', 'datos-prueba', 'mycloset-prueba.json')
    : join(root, path.endsWith('/') ? path + 'index.html' : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404).end('No encontrado');
  }
}

hosts.forEach((h, i) => createServer(handle).listen(port, h, () => {
  if (i) return;
  console.log(`MyCloset en http://localhost:${port}`);
  if (!wifi) return;
  for (const nets of Object.values(networkInterfaces())) {
    for (const n of nets || []) if (n.family === 'IPv4' && !n.internal) console.log(`Desde el iPhone (misma wifi): http://${n.address}:${port}`);
  }
}));
