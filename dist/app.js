'use strict';

/* =========================================================
   MyCloset — MVP
   Web estática. Datos en IndexedDB (solo en este dispositivo).
   ========================================================= */

const SCHEMA_VERSION = 1;
const DB_NAME = 'mycloset';
const STORES = ['garments', 'images', 'compatibilities', 'outfits'];
const DEMO_URL = 'mycloset-prueba.json';

const CATEGORIES = [
  { id: 'top', label: 'Parte de arriba', short: 'Arriba', types: ['Camiseta', 'Polo', 'Camisa', 'Sobrecamisa', 'Sudadera', 'Jersey', 'Cárdigan', 'Otro'] },
  { id: 'bottom', label: 'Parte de abajo', short: 'Abajo', types: ['Vaquero', 'Chino', 'Pantalón de vestir', 'Jogger', 'Pantalón corto', 'Otro'] },
  { id: 'outer', label: 'Abrigo', short: 'Abrigo', types: ['Chaqueta', 'Cazadora', 'Abrigo', 'Chaleco', 'Otro'] },
  { id: 'shoes', label: 'Calzado', short: 'Calzado', types: ['Zapatillas', 'Zapatos', 'Botas', 'Sandalias', 'Otro'] },
  { id: 'acc', label: 'Accesorios', short: 'Accesorios', types: ['Cinturón', 'Gorra', 'Bufanda', 'Reloj', 'Otro'] },
];
const CAT = Object.fromEntries(CATEGORIES.map((c, i) => [c.id, { ...c, order: i }]));

// Colores por familia. Los nombres antiguos (Gris, Azul, Beige…) se mantienen para no cambiar prendas ya guardadas.
const COLOR_GROUPS = [
  ['Negros y grises', [['Negro', '#1c1c1c'], ['Gris oscuro', '#4a4a4a'], ['Gris', '#9a9a9a'], ['Gris claro', '#cfcfcf']]],
  ['Blancos y beiges', [['Blanco', '#f8f8f6'], ['Crudo', '#efe8da'], ['Beige', '#d9c8a9'], ['Arena', '#c8b28a'], ['Camel', '#b8875a']]],
  ['Marrones', [['Marrón claro', '#a0724a'], ['Marrón', '#7a5233'], ['Marrón oscuro', '#4b3121']]],
  ['Azules', [['Celeste', '#9cc4e4'], ['Azul claro', '#7aa7d8'], ['Azul', '#3b6fb6'], ['Azul vaquero', '#4a6a8f'], ['Azul oscuro', '#26406e'], ['Azul marino', '#1f2a44']]],
  ['Verdes', [['Verde claro', '#9cc79a'], ['Verde', '#4f7a4a'], ['Verde oliva', '#6b6b3a'], ['Caqui', '#8a8458'], ['Verde botella', '#1f4a33']]],
  ['Rojos y rosas', [['Rosa', '#e4a3b4'], ['Rojo', '#b83a32'], ['Granate', '#6e1f2a'], ['Burdeos', '#5a1a26']]],
  ['Amarillos y naranjas', [['Amarillo', '#e6c44a'], ['Mostaza', '#c99a2e'], ['Naranja', '#d9783a'], ['Teja', '#b0573a']]],
  ['Morados', [['Lila', '#b9a3d6'], ['Morado', '#6d4a8a']]],
  ['Otros', [['Multicolor', 'conic-gradient(#d33, #e6c44a, #4f7a4a, #3b6fb6, #6d4a8a, #d33)']]],
];
const COLORS = COLOR_GROUPS.flatMap(([, list]) => list);
const COLOR = Object.fromEntries(COLORS);

const ICON = {
  top: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 3.5 3 6.5l2 4 2.5-1.2V20.5h9V9.3L19 10.5l2-4-5.5-3c-.6 1.6-2 2.5-3.5 2.5s-2.9-.9-3.5-2.5z"/></svg>',
  bottom: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h10l1.2 17h-4.4L12 10l-1.8 10.5H5.8z"/><path d="M7.2 6.5h9.6"/></svg>',
  outer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3.5 12 6l3-2.5 5 2.5v14.5h-4.5M9 3.5 4 6v14.5h4.5"/><path d="M12 6v14.5M8.5 20.5V13M15.5 20.5V13"/></svg>',
  shoes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17V10.5l4-.8 2.5 2.3 6 1c3 .5 5.5 1.7 5.5 3.5V18H3z"/><path d="M3 18.5h18M11 12.6l1-1.6M13.5 13l1-1.6"/></svg>',
  acc: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M9.2 7.8 10 3.5h4l.8 4.3M9.2 16.2l.8 4.3h4l.8-4.3M12 10v2.2l1.4 1"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
  hanger: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6a2 2 0 1 1 3 1.7c-.6.4-1 .8-1 1.5V10l8.6 5.2c1 .6.6 2.3-.6 2.3H4c-1.2 0-1.6-1.7-.6-2.3L12 10"/></svg>',
  layers: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 3 7.5l9 4.5 9-4.5z"/><path d="m3 12 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>',
  camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  archive: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 4.5h17v4h-17zM5 8.5v11h14v-11M10 12h4"/></svg>',
};

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });
const nowISO = () => new Date().toISOString();
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  // randomUUID solo existe en contexto seguro (https/localhost); fallback para la red local.
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/* ---------- Base de datos ---------- */
let db;

function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB no disponible'));
    const req = indexedDB.open(DB_NAME, SCHEMA_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      for (const s of STORES) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAll(store) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Ejecuta escrituras en una única transacción: o se guarda todo o nada.
function write(stores, fn) {
  return new Promise((resolve, reject) => {
    let t;
    try { t = db.transaction(stores, 'readwrite'); } catch (e) { return reject(e); }
    const o = Object.fromEntries(stores.map((s) => [s, t.objectStore(s)]));
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('Operación cancelada'));
    try { fn(o); } catch (e) { try { t.abort(); } catch (_) { /* ya abortada */ } reject(e); }
  });
}

function saveErrorMessage(e) {
  if (e && (e.name === 'QuotaExceededError' || /quota/i.test(e.message || ''))) {
    return 'No hay espacio suficiente en el dispositivo para guardar. No se ha perdido nada de lo que ya estaba guardado.';
  }
  return 'No se ha podido guardar. Vuelve a intentarlo; lo que ya estaba guardado sigue intacto.';
}

/* ---------- Estado en memoria (reflejo de la base de datos) ---------- */
const S = { garments: new Map(), images: new Map(), compat: new Map(), outfits: new Map() };

async function loadAll() {
  const [g, i, c, o] = await Promise.all(STORES.map(getAll));
  S.garments = new Map(g.map((x) => [x.id, x]));
  S.images = new Map(i.map((x) => [x.id, x]));
  S.compat = new Map(c.map((x) => [x.id, x]));
  S.outfits = new Map(o.map((x) => [x.id, x]));
}

const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const pairOf = (a, b) => {
  const [first, second] = a < b ? [a, b] : [b, a];
  return { id: `${first}|${second}`, firstGarmentId: first, secondGarmentId: second };
};

function byCatThenName(a, b) {
  return (CAT[a.category]?.order ?? 99) - (CAT[b.category]?.order ?? 99) || collator.compare(a.name, b.name);
}
const byName = (a, b) => collator.compare(a.name, b.name);

const activeGarments = () => [...S.garments.values()].filter((g) => !g.archived).sort(byCatThenName);
const archivedGarments = () => [...S.garments.values()].filter((g) => g.archived).sort(byCatThenName);

function relatedIds(id) {
  const out = new Set();
  for (const c of S.compat.values()) {
    if (c.firstGarmentId === id) out.add(c.secondGarmentId);
    else if (c.secondGarmentId === id) out.add(c.firstGarmentId);
  }
  return out;
}
const outfitGarments = (o) => o.garmentIds.map((id) => S.garments.get(id)).filter(Boolean);
const outfitsWith = (id) => [...S.outfits.values()].filter((o) => o.garmentIds.includes(id)).sort(byName);
const isAvailable = (o) => outfitGarments(o).length === o.garmentIds.length && outfitGarments(o).every((g) => !g.archived);
const matches = (g, q) => !q || norm(g.name).includes(q) || norm(g.type).includes(q) || norm(g.color).includes(q);

/* ---------- Piezas de interfaz ---------- */
function thumb(g, cls = '') {
  const img = g.imageId && S.images.get(g.imageId);
  if (img) return `<div class="thumb ${cls}"><img src="${img.data}" alt="" loading="lazy" decoding="async"></div>`;
  const col = COLOR[g.color];
  return `<div class="thumb thumb-empty ${col ? '' : 'no-color'} ${cls}" style="--swatch:${col || 'transparent'}">${ICON[g.category] || ICON.top}</div>`;
}

function garmentCard(g) {
  return `<a class="g-card" href="#/prenda/${g.id}">
    ${thumb(g)}
    ${g.archived ? '<span class="badge badge-muted">Archivada</span>' : ''}
    <span class="g-name">${esc(g.name)}</span>
    <span class="g-sub">${esc(g.type)}${g.color ? ' · ' + esc(g.color) : ''}</span>
  </a>`;
}

function selectCard(g, selected) {
  return `<button type="button" class="g-card selectable" data-id="${g.id}" aria-pressed="${selected}">
    ${thumb(g)}
    <span class="check" aria-hidden="true">${ICON.check}</span>
    <span class="g-name">${esc(g.name)}</span>
    <span class="g-sub">${esc(g.type)}${g.color ? ' · ' + esc(g.color) : ''}</span>
  </button>`;
}

function collage(o, cls = '') {
  const gs = outfitGarments(o);
  const shown = gs.slice(0, 4);
  return `<div class="collage n${Math.max(1, shown.length)} ${cls}" aria-hidden="true">
    ${shown.map((g) => thumb(g)).join('')}
    ${gs.length > 4 ? `<span class="more">+${gs.length - 4}</span>` : ''}
  </div>`;
}

function outfitCard(o) {
  const gs = outfitGarments(o);
  return `<a class="o-card" href="#/conjunto/${o.id}">
    ${collage(o)}
    <span class="o-name">${esc(o.name)}</span>
    <span class="o-items">${gs.map((g) => esc(g.name)).join(' · ')}</span>
    ${isAvailable(o) ? '' : '<span class="badge">Con ropa archivada</span>'}
  </a>`;
}

function emptyState({ icon = ICON.hanger, title, text, href, label, small = false }) {
  return `<div class="empty ${small ? 'small' : ''}">
    ${small ? '' : `<div class="empty-art">${icon}</div>`}
    ${title ? `<h2>${esc(title)}</h2>` : ''}
    <p>${text}</p>
    ${href ? `<a class="btn btn-primary" href="${href}">${esc(label)}</a>` : ''}
  </div>`;
}

const addAction = (href, label) => `<a class="icon-btn" href="${href}">${ICON.plus}<span>${esc(label)}</span></a>`;

function colorOptions(current) {
  const opt = (name) => `<option ${name === current ? 'selected' : ''}>${esc(name)}</option>`;
  // Un color que ya no está en la lista (p. ej. de una copia antigua) se conserva.
  const unknown = current && !COLOR[current] ? opt(current) : '';
  return `<option value="">Sin indicar</option>${unknown}` +
    COLOR_GROUPS.map(([label, list]) => `<optgroup label="${esc(label)}">${list.map(([name]) => opt(name)).join('')}</optgroup>`).join('');
}

function chipsHTML(filters, current, label) {
  return `<div class="chips" role="group" aria-label="${esc(label)}">
    ${filters.map((f) => `<button type="button" class="chip ${f.ref ? 'chip-ref' : ''}" data-filter="${f.id}" aria-pressed="${f.id === current}">${esc(f.label)}</button>`).join('')}
  </div>`;
}
const CATEGORY_FILTERS = [{ id: 'all', label: 'Todo' }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.short }))];

/* ---------- Toast y diálogos ---------- */
let toastTimer;
function toast(msg, isError = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('error', isError);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), isError ? 5000 : 2400);
}

function confirmDialog({ title, body, confirm = 'Aceptar', danger = false }) {
  return new Promise((resolve) => {
    const d = $('#dialog');
    d.innerHTML = `<form method="dialog">
      <h2>${esc(title)}</h2>
      <p>${body}</p>
      <div class="dialog-actions">
        <button class="btn" value="cancel">Cancelar</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" value="ok">${esc(confirm)}</button>
      </div>
    </form>`;
    d.returnValue = '';
    d.onclose = () => resolve(d.returnValue === 'ok');
    d.showModal();
  });
}

/* ---------- Selector de prendas reutilizable ---------- */
// Mantiene la selección aunque cambien la búsqueda o el filtro.
function createPicker({ candidates, selected, extra = [], initialFilter = 'all', onToggle }) {
  const st = { q: '', f: initialFilter };
  const filters = [...extra.map((e) => ({ ...e, ref: true })), ...CATEGORY_FILTERS];

  function list() {
    const q = norm(st.q.trim());
    const ex = extra.find((e) => e.id === st.f);
    return candidates.filter((g) =>
      (st.f === 'all' || (ex ? ex.ids.has(g.id) : g.category === st.f)) && matches(g, q));
  }

  function results() {
    const l = list();
    if (!l.length) {
      const ex = extra.find((e) => e.id === st.f);
      const text = ex && !st.q ? ex.emptyText : 'No hay prendas que coincidan con la búsqueda o el filtro.';
      return emptyState({ small: true, text: `${text}<br><br><button type="button" class="btn" data-clear>Ver todo el armario</button>` });
    }
    return `<div class="g-grid">${l.map((g) => selectCard(g, selected.has(g.id))).join('')}</div>`;
  }

  const html = `<div class="picker">
    <label class="search">${ICON.search}<span class="sr-only">Buscar prenda</span>
      <input type="search" placeholder="Buscar por nombre, tipo o color" autocomplete="off" enterkeyhint="search">
    </label>
    ${chipsHTML(filters, st.f, 'Filtrar prendas')}
    <div class="picker-results">${results()}</div>
  </div>`;

  function bind(root) {
    const input = $('input[type="search"]', root);
    const box = $('.picker-results', root);
    const refresh = () => { box.innerHTML = results(); };
    const setFilter = (f) => {
      st.f = f;
      $$('[data-filter]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
      refresh();
    };
    input.addEventListener('input', () => { st.q = input.value; refresh(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
    $('.chips', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (b) setFilter(b.dataset.filter);
    });
    box.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear]')) { st.q = ''; input.value = ''; setFilter('all'); return; }
      const card = e.target.closest('[data-id]');
      if (!card) return;
      const id = card.dataset.id;
      if (selected.has(id)) selected.delete(id); else selected.add(id);
      card.setAttribute('aria-pressed', String(selected.has(id)));
      onToggle?.(id);
    });
  }

  return { html, bind, sync(id) { $$(`.picker [data-id="${id}"]`).forEach((c) => c.setAttribute('aria-pressed', String(selected.has(id)))); } };
}

/* =========================================================
   Vistas
   ========================================================= */

/* ---------- Qué me pongo ---------- */
function viewToday() {
  const all = [...S.outfits.values()];
  const avail = all.filter(isAvailable).sort(byName);
  let html;
  if (!S.garments.size) {
    html = emptyState({ title: 'Añade tu primera prenda', text: 'Empieza registrando la ropa que de verdad usas. La foto es opcional: puedes ponerla después.', href: '#/prenda/nueva', label: 'Añadir prenda' });
  } else if (!all.length) {
    html = emptyState({
      icon: ICON.layers, title: 'Aún no tienes conjuntos',
      text: activeGarments().length >= 2
        ? 'Junta prendas de tu armario y guárdalas como un conjunto listo para ponerte.'
        : 'Para crear un conjunto necesitas al menos dos prendas. Añade alguna más.',
      href: activeGarments().length >= 2 ? '#/conjunto/nuevo' : '#/prenda/nueva',
      label: activeGarments().length >= 2 ? 'Crear mi primer conjunto' : 'Añadir prenda',
    });
  } else if (!avail.length) {
    html = emptyState({ icon: ICON.layers, title: 'Ningún conjunto disponible', text: 'Todos tus conjuntos llevan alguna prenda archivada. Restaura esa prenda o crea un conjunto nuevo.', href: '#/conjuntos', label: 'Ver conjuntos guardados' });
  } else {
    html = `<p class="lead">${avail.length === 1 ? 'Tienes 1 conjunto listo para ponerte.' : `Tienes ${avail.length} conjuntos listos para ponerte.`}</p>
      <div class="o-grid">${avail.map(outfitCard).join('')}</div>`;
  }
  if (S.garments.size) {
    html += `<p class="hint" style="margin-top:22px">¿Ya sabes qué prenda quieres llevar hoy? <a href="#/ropa">Búscala en Mi ropa</a> y mira sus conjuntos.</p>`;
  }
  return { title: 'Qué me pongo', tab: 'today', html, action: all.length && activeGarments().length >= 2 ? addAction('#/conjunto/nuevo', 'Conjunto') : '' };
}

/* ---------- Mi ropa: carpetas y subcarpetas ---------- */
// La carpeta sale de la categoría y el tipo de cada prenda: no se guarda nada nuevo.
// Una carpeta sin `types` recoge todos los tipos de su categoría; `fallback` recoge tipos no listados.
const FOLDERS = [
  { id: 'camisetas', label: 'Camisetas', category: 'top', types: ['Camiseta', 'Polo'] },
  { id: 'camisas', label: 'Camisas', category: 'top', types: ['Camisa', 'Sobrecamisa'] },
  { id: 'sudaderas', label: 'Sudaderas', category: 'top', types: ['Sudadera'] },
  { id: 'jerseys', label: 'Jerseys', category: 'top', types: ['Jersey', 'Cárdigan'] },
  { id: 'otras-arriba', label: 'Otras de arriba', category: 'top', types: ['Otro'], fallback: true },
  { id: 'pantalones', label: 'Pantalones', category: 'bottom' },
  { id: 'abrigos', label: 'Chaquetas y abrigos', category: 'outer' },
  { id: 'calzado', label: 'Calzado', category: 'shoes' },
  { id: 'accesorios', label: 'Accesorios', category: 'acc' },
];
const FOLDER = Object.fromEntries(FOLDERS.map((f) => [f.id, f]));

const TYPE_PLURAL = {
  Camiseta: 'Camisetas', Polo: 'Polos', Camisa: 'Camisas', Sobrecamisa: 'Sobrecamisas', Sudadera: 'Sudaderas',
  Jersey: 'Jerseys', 'Cárdigan': 'Cárdigans', Vaquero: 'Vaqueros', Chino: 'Chinos', 'Pantalón de vestir': 'Pantalones de vestir',
  Jogger: 'Joggers', 'Pantalón corto': 'Pantalones cortos', Chaqueta: 'Chaquetas', Cazadora: 'Cazadoras', Abrigo: 'Abrigos',
  Chaleco: 'Chalecos', 'Cinturón': 'Cinturones', Gorra: 'Gorras', Bufanda: 'Bufandas', Reloj: 'Relojes', Otro: 'Otros',
};
const typePlural = (t) => TYPE_PLURAL[t] || t;

function folderOf(g) {
  return FOLDERS.find((f) => f.category === g.category && (!f.types || f.types.includes(g.type)))
    || FOLDERS.find((f) => f.category === g.category && f.fallback)
    || FOLDERS.find((f) => f.category === g.category);
}

const typeOrder = (g) => CAT[g.category]?.types.indexOf(g.type) ?? 99;
const byTypeThenName = (a, b) => typeOrder(a) - typeOrder(b) || collator.compare(a.name, b.name);
const folderGarments = (f) => activeGarments().filter((g) => folderOf(g) === f).sort(byTypeThenName);
const typesIn = (gs) => [...new Set(gs.map((g) => g.type))];

function newGarmentHref(category, type) {
  const p = new URLSearchParams();
  if (category) p.set('cat', category);
  if (type) p.set('tipo', type);
  const qs = p.toString();
  return `#/prenda/nueva${qs ? '?' + qs : ''}`;
}

const CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

// Cabecera de sección que abre su carpeta.
const folderHead = (href, label, n) => `<div class="section-head">
    <a class="folder-link" href="${href}"><h2>${esc(label)} <span class="count">${n}</span></h2>${CHEVRON}</a>
  </div>`;

const wardrobeState = { q: '', cat: 'all' };

function wardrobeResults() {
  const q = norm(wardrobeState.q.trim());
  const list = activeGarments().filter((g) => (wardrobeState.cat === 'all' || g.category === wardrobeState.cat) && matches(g, q));
  if (!list.length) {
    return emptyState({ small: true, text: 'No hay prendas que coincidan con la búsqueda o el filtro.<br><br><button type="button" class="btn" data-clear>Quitar filtros</button>' });
  }
  if (q) {
    return `<p class="lead">${plural(list.length, 'prenda', 'prendas')}</p><div class="g-grid">${list.map(garmentCard).join('')}</div>`;
  }
  return FOLDERS.map((f) => {
    const items = list.filter((g) => folderOf(g) === f).sort(byTypeThenName);
    if (!items.length) return '';
    return `<section class="section" style="margin-top:18px">
      ${folderHead(`#/ropa/${f.id}`, f.label, items.length)}
      <div class="g-grid">${items.map(garmentCard).join('')}</div>
    </section>`;
  }).join('');
}

function viewWardrobe() {
  const active = activeGarments();
  const archivedCount = archivedGarments().length;
  const archiveLink = archivedCount ? `<a class="list-link" href="#/archivo" style="margin-top:28px">${ICON.archive}<b style="flex:1">Archivo</b><span>${plural(archivedCount, 'prenda', 'prendas')}</span></a>` : '';
  if (!active.length) {
    return {
      title: 'Mi ropa', tab: 'wardrobe',
      html: emptyState({ title: 'Añade tu primera prenda', text: archivedCount ? 'No tienes prendas activas. Puedes añadir una nueva o restaurar alguna del archivo.' : 'Registra tu ropa poco a poco. Solo hace falta nombre, categoría y tipo.', href: '#/prenda/nueva', label: 'Añadir prenda' }) + archiveLink,
      action: '',
    };
  }
  const noCompat = !S.compat.size && active.length >= 2
    ? '<p class="hint" style="margin-bottom:14px">Consejo: abre una prenda y pulsa «Editar combinaciones» para marcar con qué te gusta llevarla.</p>' : '';
  const html = `
    ${noCompat}
    <label class="search">${ICON.search}<span class="sr-only">Buscar prenda</span>
      <input id="w-search" type="search" placeholder="Buscar por nombre, tipo o color" value="${esc(wardrobeState.q)}" autocomplete="off" enterkeyhint="search">
    </label>
    ${chipsHTML(CATEGORY_FILTERS, wardrobeState.cat, 'Filtrar por categoría')}
    <div id="w-results">${wardrobeResults()}</div>
    ${archiveLink}`;
  return {
    title: 'Mi ropa', tab: 'wardrobe', html, action: addAction('#/prenda/nueva', 'Prenda'),
    bind() {
      const input = $('#w-search');
      const box = $('#w-results');
      const refresh = () => { box.innerHTML = wardrobeResults(); };
      const setCat = (c) => {
        wardrobeState.cat = c;
        $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === c)));
        refresh();
      };
      input.addEventListener('input', () => { wardrobeState.q = input.value; refresh(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
      $('.chips').addEventListener('click', (e) => { const b = e.target.closest('[data-filter]'); if (b) setCat(b.dataset.filter); });
      box.addEventListener('click', (e) => {
        if (e.target.closest('[data-clear]')) { wardrobeState.q = ''; input.value = ''; setCat('all'); }
      });
    },
  };
}

// Carpeta: «Todos» + un chip por subtipo (si hay más de uno). El subtipo va en la ruta.
function viewFolder(folderId, rawType) {
  const f = FOLDER[folderId];
  if (!f) return viewNotFound('Esta carpeta no existe.');
  const type = rawType ? decodeURIComponent(rawType) : null;
  const all = folderGarments(f);
  const types = typesIn(all);
  const action = addAction(newGarmentHref(f.category, type || (types.length === 1 && f.types ? types[0] : '')), 'Prenda');

  if (!all.length) {
    return {
      title: f.label, tab: 'wardrobe', back: '#/ropa', action,
      html: emptyState({ title: 'Carpeta vacía', text: 'No tienes prendas activas aquí.', href: newGarmentHref(f.category), label: 'Añadir prenda' }),
    };
  }

  const shown = type ? all.filter((g) => g.type === type) : all;
  const chips = types.length > 1 ? `<nav class="chips" aria-label="Subcarpetas">
      <a class="chip" href="#/ropa/${f.id}" aria-current="${type ? 'false' : 'page'}">Todos</a>
      ${types.map((t) => `<a class="chip" href="#/ropa/${f.id}/${encodeURIComponent(t)}" aria-current="${t === type ? 'page' : 'false'}">${esc(typePlural(t))}</a>`).join('')}
    </nav>` : '';
  const grid = shown.length
    ? `<div class="g-grid">${shown.map(garmentCard).join('')}</div>`
    : emptyState({ small: true, text: 'No te queda ninguna prenda activa de este tipo.' });

  return { title: f.label, tab: 'wardrobe', back: '#/ropa', action, html: chips + grid };
}

/* ---------- Archivo ---------- */
function viewArchive() {
  const list = archivedGarments();
  const html = list.length
    ? `<p class="lead">Ropa retirada. Sus combinaciones y conjuntos se conservan; los conjuntos que la llevan no salen en «Qué me pongo».</p>
       <div class="g-grid">${list.map(garmentCard).join('')}</div>`
    : emptyState({ icon: ICON.archive, title: 'Archivo vacío', text: 'Cuando retires una prenda de tu armario aparecerá aquí y podrás restaurarla.', href: '#/ropa', label: 'Volver a Mi ropa' });
  return { title: 'Archivo', tab: 'wardrobe', back: '#/ropa', html };
}

/* ---------- Ficha de prenda ---------- */
function viewGarment(id) {
  const g = S.garments.get(id);
  if (!g) return viewNotFound('Esta prenda no existe.');
  const rel = [...relatedIds(id)].map((x) => S.garments.get(x)).filter(Boolean).sort(byCatThenName);
  const outs = outfitsWith(id);
  const col = COLOR[g.color];

  const relHTML = rel.length
    ? `<div class="mini-list">${rel.map(garmentCard).join('')}</div>`
    : `<p class="hint">Aún no has marcado con qué combina.${g.archived ? '' : ` <a href="#/prenda/${id}/combina">Marcar combinaciones</a>`}</p>`;
  const outHTML = outs.length
    ? `<div class="o-grid">${outs.map(outfitCard).join('')}</div>`
    : `<p class="hint">Todavía no está en ningún conjunto.${g.archived ? '' : ` <a href="#/conjunto/nuevo?desde=${id}">Crear uno con esta prenda</a>`}</p>`;

  const html = `
    <div class="hero">${thumb(g)}</div>
    <h2 class="detail-title">${esc(g.name)}</h2>
    <p class="meta">
      <span>${esc(CAT[g.category]?.label || g.category)}</span><span aria-hidden="true">·</span>
      <span>${esc(g.type)}</span>
      ${g.color ? `<span aria-hidden="true">·</span><span><i class="dot" style="background:${col}"></i>${esc(g.color)}</span>` : ''}
    </p>
    ${g.archived ? `<div class="notice"><strong>Prenda archivada</strong>No aparece en tu armario ni al crear conjuntos. Sus conjuntos se conservan, pero no salen como disponibles.</div>` : ''}
    <div class="actions">
      ${g.archived ? '' : `<a class="btn btn-primary" href="#/conjunto/nuevo?desde=${id}">${ICON.layers}Crear conjunto con esta prenda</a>`}
      <div class="btn-row">
        <a class="btn" href="#/prenda/${id}/editar">${ICON.edit}Editar</a>
        ${g.archived ? '' : `<a class="btn" href="#/prenda/${id}/combina">${ICON.link}Combinaciones</a>`}
      </div>
    </div>
    <section class="section">
      <div class="section-head"><h3>Combina con <span class="count">${rel.length || ''}</span></h3></div>
      ${relHTML}
    </section>
    <section class="section">
      <div class="section-head"><h3>Conjuntos con esta prenda <span class="count">${outs.length || ''}</span></h3></div>
      ${outHTML}
    </section>
    <div class="danger-zone">
      ${g.archived
        ? `<button type="button" class="btn btn-primary btn-block" id="toggle-archive">Restaurar al armario</button>`
        : `<button type="button" class="btn btn-block btn-ghost-danger" id="toggle-archive">${ICON.archive}Archivar prenda</button>
           <p class="small-print" style="text-align:center">Archivar la retira del armario sin borrar sus combinaciones ni conjuntos.</p>`}
    </div>`;

  return {
    title: 'Prenda', tab: 'wardrobe', back: g.archived ? '#/archivo' : `#/ropa/${folderOf(g).id}`, html,
    bind() { $('#toggle-archive').addEventListener('click', () => setArchived(g, !g.archived)); },
  };
}

async function setArchived(g, archived) {
  const outs = outfitsWith(g.id);
  if (archived) {
    const ok = await confirmDialog({
      title: `¿Archivar «${g.name}»?`,
      body: outs.length
        ? (outs.length === 1
          ? 'Está en 1 conjunto. Se conservará, pero dejará de aparecer en «Qué me pongo» hasta que la restaures.'
          : `Está en ${outs.length} conjuntos. Se conservarán, pero dejarán de aparecer en «Qué me pongo» hasta que la restaures.`)
        : 'Dejará de aparecer en tu armario y al crear conjuntos. Podrás restaurarla desde el Archivo.',
      confirm: 'Archivar',
    });
    if (!ok) return;
  }
  const next = { ...g, archived, updatedAt: nowISO() };
  try {
    await write(['garments'], (s) => s.garments.put(next));
  } catch (e) {
    toast(saveErrorMessage(e), true);
    return;
  }
  S.garments.set(next.id, next);
  if (archived) {
    toast('Prenda archivada');
  } else {
    const back = outs.filter(isAvailable).length;
    toast(back ? `Prenda restaurada · ${plural(back, 'conjunto vuelve', 'conjuntos vuelven')} a estar disponible${back === 1 ? '' : 's'}` : 'Prenda restaurada');
  }
  render();
}

/* ---------- Alta / edición de prenda ---------- */
async function processImage(file) {
  const okType = file.type ? file.type.startsWith('image/') : /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i.test(file.name);
  if (!okType) throw new Error('Ese archivo no es una imagen. Elige una foto (JPG, PNG, HEIC…).');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Este formato de imagen no se puede abrir en este navegador. Prueba con una foto JPG o PNG.'));
      i.src = url;
    });
    const max = 1200;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const data = canvas.toDataURL('image/jpeg', 0.85);
    if (!data.startsWith('data:image/jpeg')) throw new Error('No se ha podido procesar la imagen.');
    return { data, mimeType: 'image/jpeg', width: w, height: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function viewGarmentForm(id, prefill = {}) {
  const existing = id ? S.garments.get(id) : null;
  if (id && !existing) return viewNotFound('Esta prenda no existe.');
  // Al crear desde una carpeta, llega con categoría (y tipo) ya elegidos.
  const preCat = CAT[prefill.cat] ? prefill.cat : '';
  const preType = preCat && CAT[preCat].types.includes(prefill.tipo) ? prefill.tipo : '';
  const newBack = preCat ? `#/ropa/${folderOf({ category: preCat, type: preType || CAT[preCat].types[0] }).id}` : '#/ropa';
  const f = {
    name: existing?.name || '',
    category: existing?.category || preCat,
    type: existing?.type || preType,
    color: existing?.color || '',
    image: existing?.imageId ? S.images.get(existing.imageId) || null : null,
    imageChanged: false,
  };
  const typeOptions = (cat, current) => cat
    ? `<option value="">Elige el tipo</option>` + CAT[cat].types.map((t) => `<option ${t === current ? 'selected' : ''}>${esc(t)}</option>`).join('')
    : '<option value="">Elige primero la categoría</option>';
  const photoPreview = () => thumb({ category: f.category || 'top', color: f.color, imageId: f.image ? '__preview' : null });

  const html = `
    <form class="form" id="g-form" novalidate>
      <div class="field">
        <span>Foto <span class="opt">(opcional)</span></span>
        <div class="photo-field">
          <div id="photo-preview">${photoPreviewHTML()}</div>
          <div class="photo-actions">
            <label class="btn file-label">${ICON.camera}<span id="photo-label">${f.image ? 'Cambiar foto' : 'Añadir foto'}</span>
              <input type="file" id="g-photo" accept="image/*">
            </label>
            <button type="button" class="btn btn-ghost-danger" id="photo-remove" ${f.image ? '' : 'hidden'}>Quitar foto</button>
          </div>
        </div>
        <p class="error" id="photo-error" role="alert"></p>
      </div>

      <label class="field">
        <span>Nombre</span>
        <input type="text" id="g-name" value="${esc(f.name)}" placeholder="Ej.: Pantalón beige de vestir" autocomplete="off" autocapitalize="sentences" maxlength="80" aria-describedby="name-error">
        <p class="error" id="name-error"></p>
      </label>

      <label class="field">
        <span>Categoría</span>
        <select id="g-category" aria-describedby="category-error">
          <option value="">Elige la categoría</option>
          ${CATEGORIES.map((c) => `<option value="${c.id}" ${c.id === f.category ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}
        </select>
        <p class="error" id="category-error"></p>
      </label>

      <label class="field">
        <span>Tipo</span>
        <select id="g-type" ${f.category ? '' : 'disabled'} aria-describedby="type-error">${typeOptions(f.category, f.type)}</select>
        <p class="error" id="type-error"></p>
      </label>

      <label class="field">
        <span>Color principal <span class="opt">(opcional)</span></span>
        <select id="g-color">${colorOptions(f.color)}</select>
      </label>

      <p class="error form-error" id="form-error" role="alert"></p>

      <div class="btn-stack">
        <button type="submit" class="btn btn-primary btn-block">${existing ? 'Guardar cambios' : 'Guardar prenda'}</button>
        ${existing ? '' : '<button type="button" class="btn btn-block" id="save-another">Guardar y añadir otra</button>'}
        <a class="btn btn-block" href="${existing ? `#/prenda/${id}` : newBack}" id="cancel">Cancelar</a>
      </div>
    </form>`;

  function photoPreviewHTML() {
    if (f.image) return `<div class="thumb"><img src="${f.image.data}" alt="Foto seleccionada"></div>`;
    return photoPreview();
  }

  return {
    title: existing ? 'Editar prenda' : 'Nueva prenda',
    tab: 'wardrobe', tabs: false,
    back: existing ? `#/prenda/${id}` : newBack,
    html,
    bind() {
      const form = $('#g-form');
      const name = $('#g-name'), cat = $('#g-category'), type = $('#g-type'), color = $('#g-color'), photo = $('#g-photo');
      const refreshPreview = () => {
        $('#photo-preview').innerHTML = photoPreviewHTML();
        $('#photo-label').textContent = f.image ? 'Cambiar foto' : 'Añadir foto';
        $('#photo-remove').hidden = !f.image;
      };
      const markDirty = () => { dirty = true; };

      name.addEventListener('input', () => { f.name = name.value; markDirty(); setErr(name, 'name-error', ''); });
      cat.addEventListener('change', () => {
        f.category = cat.value;
        if (!CAT[f.category]?.types.includes(f.type)) f.type = '';
        type.innerHTML = typeOptions(f.category, f.type);
        type.disabled = !f.category;
        markDirty(); setErr(cat, 'category-error', ''); refreshPreview();
      });
      type.addEventListener('change', () => { f.type = type.value; markDirty(); setErr(type, 'type-error', ''); });
      color.addEventListener('change', () => { f.color = color.value; markDirty(); refreshPreview(); });

      photo.addEventListener('change', async () => {
        const file = photo.files?.[0];
        photo.value = '';
        if (!file) return;
        $('#photo-error').textContent = '';
        $('#photo-label').textContent = 'Procesando…';
        try {
          f.image = await processImage(file);
          f.imageChanged = true;
          markDirty();
        } catch (e) {
          $('#photo-error').textContent = e.message;
        }
        refreshPreview();
      });
      $('#photo-remove').addEventListener('click', () => { f.image = null; f.imageChanged = true; markDirty(); refreshPreview(); });
      $('#cancel').addEventListener('click', () => { dirty = false; });

      async function save(another) {
        $('#form-error').textContent = '';
        const nm = f.name.trim();
        let bad = null;
        if (!f.type) { setErr(type, 'type-error', 'Elige el tipo de prenda.'); bad = type; }
        if (!f.category) { setErr(cat, 'category-error', 'Elige una categoría.'); bad = cat; }
        if (!nm) { setErr(name, 'name-error', 'Ponle un nombre que reconozcas.'); bad = name; }
        if (bad) { bad.focus(); return; }

        const ts = nowISO();
        const g = existing
          ? { ...existing, name: nm, category: f.category, type: f.type, color: f.color || null, updatedAt: ts }
          : { id: uid(), name: nm, category: f.category, type: f.type, color: f.color || null, imageId: null, archived: false, createdAt: ts, updatedAt: ts };
        let newImg = null, oldImgId = null;
        if (f.imageChanged) {
          oldImgId = existing?.imageId || null;
          if (f.image) { newImg = { id: uid(), ...f.image }; g.imageId = newImg.id; } else g.imageId = null;
        }
        try {
          await write(['garments', 'images'], (s) => {
            s.garments.put(g);
            if (newImg) s.images.put(newImg);
            if (oldImgId) s.images.delete(oldImgId);
          });
        } catch (e) {
          $('#form-error').textContent = saveErrorMessage(e);
          return;
        }
        S.garments.set(g.id, g);
        if (newImg) S.images.set(newImg.id, newImg);
        if (oldImgId) S.images.delete(oldImgId);
        dirty = false;
        toast(existing ? 'Cambios guardados' : 'Prenda guardada');
        if (another) render(true); else go(`#/prenda/${g.id}`);
      }
      form.addEventListener('submit', (e) => { e.preventDefault(); save(false); });
      $('#save-another')?.addEventListener('click', () => save(true));
    },
  };
}

function setErr(input, errId, msg) {
  $('#' + errId).textContent = msg;
  input.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

/* ---------- Editor de combinaciones ---------- */
function viewCompatEditor(id) {
  const g = S.garments.get(id);
  if (!g) return viewNotFound('Esta prenda no existe.');
  if (g.archived) return viewGarment(id);
  const candidates = activeGarments().filter((x) => x.id !== id);
  const initial = new Set([...relatedIds(id)].filter((x) => candidates.some((c) => c.id === x)));
  const selected = new Set(initial);
  const counter = () => `${plural(selected.size, 'prenda seleccionada', 'prendas seleccionadas')}`;

  if (!candidates.length) {
    return {
      title: 'Combinaciones', tab: 'wardrobe', back: `#/prenda/${id}`,
      html: emptyState({ title: 'Necesitas más ropa', text: 'Para marcar combinaciones necesitas al menos otra prenda activa en tu armario.', href: '#/prenda/nueva', label: 'Añadir prenda' }),
    };
  }

  const picker = createPicker({ candidates, selected, onToggle: () => { dirty = true; $('#compat-count').textContent = counter(); } });
  const html = `
    <p class="lead">Marca las prendas que te gusta llevar con <b>${esc(g.name)}</b>. La relación se verá desde las dos prendas.</p>
    <p class="hint" id="compat-count" style="margin:-4px 0 14px" aria-live="polite">${counter()}</p>
    ${picker.html}`;
  const footer = `<div class="actionbar"><div class="actionbar-inner">
      <button type="button" class="btn" id="c-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="c-save">Guardar combinaciones</button>
    </div></div>`;

  return {
    title: 'Combinaciones', tab: 'wardrobe', tabs: false, back: `#/prenda/${id}`, html, footer,
    bind() {
      picker.bind($('#view'));
      $('#c-cancel').addEventListener('click', () => { dirty = false; go(`#/prenda/${id}`); });
      $('#c-save').addEventListener('click', async () => {
        const toAdd = [...selected].filter((x) => !initial.has(x)).map((x) => pairOf(id, x));
        const toRemove = [...initial].filter((x) => !selected.has(x)).map((x) => pairKey(id, x));
        try {
          await write(['compatibilities'], (s) => {
            toAdd.forEach((c) => s.compatibilities.put(c));
            toRemove.forEach((k) => s.compatibilities.delete(k));
          });
        } catch (e) { toast(saveErrorMessage(e), true); return; }
        toAdd.forEach((c) => S.compat.set(c.id, c));
        toRemove.forEach((k) => S.compat.delete(k));
        dirty = false;
        toast('Combinaciones guardadas');
        go(`#/prenda/${id}`);
      });
    },
  };
}

/* ---------- Conjuntos ---------- */
function viewOutfits() {
  const all = [...S.outfits.values()].sort(byName);
  const canCreate = activeGarments().length >= 2;
  let html;
  if (!all.length) {
    html = emptyState({
      icon: ICON.layers, title: 'Crea tu primer conjunto',
      text: canCreate ? 'Elige varias prendas de tu armario y guárdalas juntas para no tener que pensarlo cada vez.' : 'Necesitas al menos dos prendas en tu armario para crear un conjunto.',
      href: canCreate ? '#/conjunto/nuevo' : '#/prenda/nueva',
      label: canCreate ? 'Crear mi primer conjunto' : 'Añadir prenda',
    });
  } else {
    const unavailable = all.filter((o) => !isAvailable(o)).length;
    html = `<p class="lead">${plural(all.length, 'conjunto guardado', 'conjuntos guardados')}${unavailable ? ` · ${unavailable} con ropa archivada` : ''}</p>
      <div class="o-grid">${all.map(outfitCard).join('')}</div>`;
  }
  return { title: 'Conjuntos', tab: 'outfits', html, action: all.length && canCreate ? addAction('#/conjunto/nuevo', 'Conjunto') : '' };
}

function viewOutfit(id) {
  const o = S.outfits.get(id);
  if (!o) return viewNotFound('Este conjunto no existe.');
  const gs = outfitGarments(o);
  const archived = gs.filter((g) => g.archived);
  const html = `
    ${collage(o, 'collage-lg')}
    <h2 class="detail-title">${esc(o.name)}</h2>
    <p class="meta">${plural(gs.length, 'prenda', 'prendas')}</p>
    ${archived.length ? `<div class="notice"><strong>Contiene ropa archivada</strong>${archived.map((g) => `«${esc(g.name)}»`).join(', ')}. Por eso no aparece en «Qué me pongo» hasta que la restaures.</div>` : ''}
    <section class="section">
      <div class="section-head"><h3>Prendas</h3></div>
      <div class="mini-list">${gs.map(garmentCard).join('')}</div>
    </section>
    <div class="actions">
      <a class="btn btn-primary" href="#/conjunto/${id}/editar">${ICON.edit}Editar conjunto</a>
    </div>
    <div class="danger-zone">
      <button type="button" class="btn btn-block btn-ghost-danger" id="o-delete">Eliminar conjunto</button>
      <p class="small-print" style="text-align:center">Sus prendas y combinaciones no se borran.</p>
    </div>`;
  return {
    title: 'Conjunto', tab: 'outfits', back: '#/conjuntos', html,
    bind() {
      $('#o-delete').addEventListener('click', async () => {
        const ok = await confirmDialog({ title: `¿Eliminar «${o.name}»?`, body: 'Se borrará esta selección guardada. Las prendas y sus combinaciones se mantienen.', confirm: 'Eliminar', danger: true });
        if (!ok) return;
        try { await write(['outfits'], (s) => s.outfits.delete(id)); } catch (e) { toast(saveErrorMessage(e), true); return; }
        S.outfits.delete(id);
        toast('Conjunto eliminado');
        go('#/conjuntos');
      });
    },
  };
}

function viewOutfitEditor(id, fromId) {
  const existing = id ? S.outfits.get(id) : null;
  if (id && !existing) return viewNotFound('Este conjunto no existe.');
  const ref = fromId ? S.garments.get(fromId) : null;
  const candidates = activeGarments();
  const selected = new Set(existing ? existing.garmentIds : (ref && !ref.archived ? [ref.id] : []));
  const backHref = existing ? `#/conjunto/${id}` : (ref ? `#/prenda/${ref.id}` : '#/conjuntos');
  let name = existing?.name || '';

  if (!existing && candidates.length < 2) {
    return {
      title: 'Nuevo conjunto', tab: 'outfits', back: backHref,
      html: emptyState({ title: 'Necesitas más ropa', text: 'Un conjunto necesita al menos dos prendas activas en tu armario.', href: '#/prenda/nueva', label: 'Añadir prenda' }),
    };
  }

  const extra = [];
  if (ref && !ref.archived) {
    const ids = relatedIds(ref.id);
    extra.push({
      id: 'compat', label: `Combina con «${ref.name}»`, ids,
      emptyText: `Aún no has marcado con qué combina «${esc(ref.name)}». Puedes elegir igualmente cualquier prenda del armario.`,
    });
  }

  const summaryHTML = () => {
    const items = [...selected].map((x) => S.garments.get(x)).filter(Boolean);
    return `<div class="summary-head">Tu selección <span>${plural(items.length, 'prenda', 'prendas')}</span></div>
      ${items.length ? `<div class="summary-list">${items.map((g) => `<div class="summary-item">
          ${thumb(g)}<span>${esc(g.name)}${g.archived ? ' (archivada)' : ''}</span>
          <button type="button" data-remove="${g.id}" aria-label="Quitar ${esc(g.name)}">${ICON.close}</button>
        </div>`).join('')}</div>` : '<p class="summary-empty">Toca las prendas de abajo para añadirlas.</p>'}`;
  };

  const picker = createPicker({
    candidates, selected, extra,
    initialFilter: extra.length && extra[0].ids.size ? 'compat' : 'all',
    onToggle: () => { dirty = true; $('#summary').innerHTML = summaryHTML(); $('#o-error').textContent = ''; },
  });

  const html = `
    <label class="field">
      <span>Nombre del conjunto</span>
      <input type="text" id="o-name" value="${esc(name)}" placeholder="Ej.: Beige con sudadera negra" maxlength="80" autocomplete="off" autocapitalize="sentences" enterkeyhint="done">
    </label>
    <div class="summary" id="summary" aria-live="polite">${summaryHTML()}</div>
    <p class="error form-error" id="o-error" role="alert" style="margin-bottom:14px"></p>
    ${picker.html}`;
  const footer = `<div class="actionbar"><div class="actionbar-inner">
      <button type="button" class="btn" id="o-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="o-save">Guardar conjunto</button>
    </div></div>`;

  return {
    title: existing ? 'Editar conjunto' : 'Nuevo conjunto', tab: 'outfits', tabs: false, back: backHref, html, footer,
    bind() {
      picker.bind($('#view'));
      const nameInput = $('#o-name');
      nameInput.addEventListener('input', () => { name = nameInput.value; dirty = true; nameInput.setAttribute('aria-invalid', 'false'); });
      nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); nameInput.blur(); } });
      $('#summary').addEventListener('click', (e) => {
        const b = e.target.closest('[data-remove]');
        if (!b) return;
        selected.delete(b.dataset.remove);
        picker.sync(b.dataset.remove);
        dirty = true;
        $('#summary').innerHTML = summaryHTML();
      });
      $('#o-cancel').addEventListener('click', () => { dirty = false; go(backHref); });
      $('#o-save').addEventListener('click', async () => {
        const err = $('#o-error');
        const nm = name.trim();
        const ids = [...selected].filter((x) => S.garments.has(x));
        if (!nm) { err.textContent = 'Ponle un nombre al conjunto.'; nameInput.setAttribute('aria-invalid', 'true'); nameInput.focus(); return; }
        if (ids.length < 2) { err.textContent = 'Un conjunto necesita al menos dos prendas.'; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
        const ts = nowISO();
        const o = existing
          ? { ...existing, name: nm, garmentIds: ids, updatedAt: ts }
          : { id: uid(), name: nm, garmentIds: ids, createdAt: ts, updatedAt: ts };
        try { await write(['outfits'], (s) => s.outfits.put(o)); } catch (e) { err.textContent = saveErrorMessage(e); return; }
        S.outfits.set(o.id, o);
        dirty = false;
        toast(existing ? 'Conjunto actualizado' : 'Conjunto guardado');
        go(`#/conjunto/${o.id}`);
      });
    },
  };
}

/* ---------- Ajustes y copia de seguridad ---------- */
function viewSettings() {
  const html = `
    <div class="stats">
      <div class="stat"><b>${activeGarments().length}</b><span>prendas</span></div>
      <div class="stat"><b>${S.compat.size}</b><span>combinaciones</span></div>
      <div class="stat"><b>${S.outfits.size}</b><span>conjuntos</span></div>
    </div>

    <section class="section card">
      <h2>Copia de seguridad</h2>
      <p>Tu armario se guarda solo en este navegador y en este dispositivo. Haz una copia de vez en cuando: incluye prendas, fotos, combinaciones y conjuntos.</p>
      <button type="button" class="btn btn-primary btn-block" id="export">Exportar copia</button>
    </section>

    <section class="section card">
      <h2>Restaurar una copia</h2>
      <p>Importar <b>reemplaza</b> todo el armario actual por el de la copia. Antes se comprueba que el archivo esté completo; si falla, no se toca nada.</p>
      <label class="btn btn-block file-label">Elegir archivo de copia
        <input type="file" id="import" accept="application/json,.json">
      </label>
      <p class="error" id="import-error" role="alert" style="margin-top:10px"></p>
    </section>

    <section class="section card" id="demo-card" hidden>
      <h2>Datos de prueba</h2>
      <p>Carga 15 prendas y 7 conjuntos de ejemplo para ver cómo funciona. <b>Reemplaza</b> el armario actual: no lo uses si ya tienes tu ropa real.</p>
      <button type="button" class="btn btn-block" id="demo">Cargar datos de prueba</button>
    </section>

    <a class="list-link section" href="#/archivo">${ICON.archive}<b style="flex:1">Archivo</b><span>${plural(archivedGarments().length, 'prenda', 'prendas')}</span></a>

    <p class="small-print section" id="storage-info">Los datos de Safari y los de la app añadida a la pantalla de inicio pueden ser independientes: comprueba en tu iPhone desde dónde la usas y exporta copias.</p>`;

  return {
    title: 'Ajustes', tab: 'settings', html,
    bind() {
      $('#export').addEventListener('click', exportBackup);
      $('#import').addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (file) await importBackup(file);
      });
      // El botón solo aparece si el servidor tiene el archivo de prueba (lo crea datos-prueba/generar.mjs).
      fetch(DEMO_URL, { method: 'HEAD' }).then((r) => { if (r.ok && $('#demo-card')) $('#demo-card').hidden = false; }).catch(() => {});
      $('#demo').addEventListener('click', async () => {
        try {
          const res = await fetch(DEMO_URL);
          if (!res.ok) throw new Error();
          await importBackup(new File([await res.text()], 'mycloset-prueba.json', { type: 'application/json' }));
        } catch (e) {
          $('#import-error').textContent = 'No se han podido descargar los datos de prueba.';
        }
      });
      navigator.storage?.estimate?.().then(({ usage }) => {
        if (usage == null) return;
        const mb = (usage / 1024 / 1024).toFixed(1);
        $('#storage-info')?.insertAdjacentHTML('afterbegin', `Espacio usado: ${mb} MB. `);
      }).catch(() => {});
    },
  };
}

async function exportBackup() {
  const backup = {
    app: 'MyCloset',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowISO(),
    garments: [...S.garments.values()],
    images: [...S.images.values()],
    compatibilities: [...S.compat.values()].map(({ firstGarmentId, secondGarmentId }) => ({ firstGarmentId, secondGarmentId })),
    outfits: [...S.outfits.values()],
  };
  const name = `mycloset-copia-${backup.exportedAt.slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
  // En iPhone, compartir permite «Guardar en Archivos»; en ordenador, se descarga.
  try {
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.maxTouchPoints > 0 && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Copia de MyCloset' });
      toast('Copia lista');
      return;
    }
  } catch (e) {
    if (e.name === 'AbortError') return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  toast('Copia exportada');
}

// Valida la copia entera antes de tocar nada. Lanza un Error con un mensaje claro.
function validateBackup(b) {
  const fail = (m) => { throw new Error(m); };
  const isStr = (x) => typeof x === 'string' && x.length > 0;
  if (!b || typeof b !== 'object' || b.app !== 'MyCloset') fail('El archivo no es una copia de MyCloset.');
  if (b.schemaVersion !== SCHEMA_VERSION) fail(`Versión de copia no compatible (${esc(b.schemaVersion)}).`);
  for (const k of ['garments', 'images', 'compatibilities', 'outfits']) if (!Array.isArray(b[k])) fail(`A la copia le falta la lista «${k}».`);

  const images = new Map();
  for (const i of b.images) {
    if (!isStr(i?.id) || images.has(i.id)) fail('La copia tiene imágenes con identificador inválido o repetido.');
    if (typeof i.data !== 'string' || !i.data.startsWith('data:image/')) fail('La copia tiene una imagen dañada.');
    images.set(i.id, { id: i.id, data: i.data, mimeType: String(i.mimeType || 'image/jpeg'), width: Number(i.width) || 0, height: Number(i.height) || 0 });
  }
  const garments = new Map();
  for (const g of b.garments) {
    if (!isStr(g?.id) || garments.has(g.id)) fail('La copia tiene prendas con identificador inválido o repetido.');
    if (!isStr(g.name) || !CAT[g.category] || !isStr(g.type)) fail(`La prenda «${esc(g.name || g.id)}» tiene datos incompletos.`);
    if (g.imageId != null && !images.has(g.imageId)) fail(`Falta la foto de la prenda «${esc(g.name)}».`);
    garments.set(g.id, {
      id: g.id, name: g.name, category: g.category, type: g.type, color: g.color || null,
      imageId: g.imageId ?? null, archived: Boolean(g.archived),
      createdAt: String(g.createdAt || nowISO()), updatedAt: String(g.updatedAt || nowISO()),
    });
  }
  const compat = new Map();
  for (const c of b.compatibilities) {
    const a = c?.firstGarmentId, z = c?.secondGarmentId;
    if (!garments.has(a) || !garments.has(z) || a === z) fail('La copia tiene una combinación que apunta a prendas inexistentes.');
    const p = pairOf(a, z);
    if (compat.has(p.id)) fail('La copia tiene combinaciones repetidas.');
    compat.set(p.id, p);
  }
  const outfits = new Map();
  for (const o of b.outfits) {
    if (!isStr(o?.id) || outfits.has(o.id)) fail('La copia tiene conjuntos con identificador inválido o repetido.');
    if (!isStr(o.name) || !Array.isArray(o.garmentIds) || o.garmentIds.length < 2) fail(`El conjunto «${esc(o.name || o.id)}» está incompleto.`);
    if (new Set(o.garmentIds).size !== o.garmentIds.length) fail(`El conjunto «${esc(o.name)}» repite prendas.`);
    if (!o.garmentIds.every((x) => garments.has(x))) fail(`El conjunto «${esc(o.name)}» apunta a prendas inexistentes.`);
    outfits.set(o.id, { id: o.id, name: o.name, garmentIds: [...o.garmentIds], createdAt: String(o.createdAt || nowISO()), updatedAt: String(o.updatedAt || nowISO()) });
  }
  // Fotos que ninguna prenda usa: no se importan.
  const used = new Set([...garments.values()].map((g) => g.imageId).filter(Boolean));
  for (const k of images.keys()) if (!used.has(k)) images.delete(k);
  return { garments, images, compat, outfits };
}

async function importBackup(file) {
  const errBox = $('#import-error');
  errBox.textContent = '';
  let data;
  try {
    data = validateBackup(JSON.parse(await file.text()));
  } catch (e) {
    errBox.textContent = `No se ha importado nada. ${e instanceof SyntaxError ? 'El archivo no es una copia válida (JSON dañado).' : e.message}`;
    return;
  }
  const ok = await confirmDialog({
    title: '¿Reemplazar tu armario?',
    body: `La copia tiene ${plural(data.garments.size, 'prenda', 'prendas')}, ${plural(data.compat.size, 'combinación', 'combinaciones')} y ${plural(data.outfits.size, 'conjunto', 'conjuntos')}. Lo que tienes ahora (${plural(S.garments.size, 'prenda', 'prendas')}, ${plural(S.outfits.size, 'conjunto', 'conjuntos')}) se sustituirá.`,
    confirm: 'Reemplazar', danger: true,
  });
  if (!ok) return;
  try {
    await write(STORES, (s) => {
      STORES.forEach((k) => s[k].clear());
      data.garments.forEach((x) => s.garments.put(x));
      data.images.forEach((x) => s.images.put(x));
      data.compat.forEach((x) => s.compatibilities.put(x));
      data.outfits.forEach((x) => s.outfits.put(x));
    });
  } catch (e) {
    errBox.textContent = saveErrorMessage(e);
    return;
  }
  Object.assign(S, data);
  toast('Copia restaurada');
  render();
}

function viewNotFound(msg = 'Esta página no existe.') {
  return { title: 'No encontrado', html: emptyState({ title: 'No encontrado', text: esc(msg), href: '#/', label: 'Ir al inicio' }) };
}

/* =========================================================
   Router
   ========================================================= */
const routes = [
  [/^#\/?$/, viewToday],
  [/^#\/ropa$/, viewWardrobe],
  [/^#\/ropa\/([\w-]+)(?:\/([^/]+))?$/, viewFolder],
  [/^#\/archivo$/, viewArchive],
  [/^#\/prenda\/nueva(?:\?(.*))?$/, (qs) => viewGarmentForm(null, Object.fromEntries(new URLSearchParams(qs || '')))],
  [/^#\/prenda\/([\w-]+)\/editar$/, viewGarmentForm],
  [/^#\/prenda\/([\w-]+)\/combina$/, viewCompatEditor],
  [/^#\/prenda\/([\w-]+)$/, viewGarment],
  [/^#\/conjuntos$/, viewOutfits],
  [/^#\/conjunto\/nuevo(?:\?desde=([\w-]+))?$/, (from) => viewOutfitEditor(null, from)],
  [/^#\/conjunto\/([\w-]+)\/editar$/, (id) => viewOutfitEditor(id)],
  [/^#\/conjunto\/([\w-]+)$/, viewOutfit],
  [/^#\/ajustes$/, viewSettings],
];

let dirty = false;
let lastHash = location.hash;
let suppressNext = false;

function go(hash) {
  if (location.hash === hash) render(true);
  else location.hash = hash;
}

function render(routeChanged = false) {
  const h = location.hash || '#/';
  let v = null;
  for (const [re, fn] of routes) {
    const m = h.match(re);
    if (m) { v = fn(...m.slice(1)); break; }
  }
  v ||= viewNotFound();

  document.title = v.title === 'Qué me pongo' ? 'MyCloset' : `${v.title} · MyCloset`;
  $('#title').textContent = v.title;
  const back = $('#back');
  back.hidden = !v.back;
  if (v.back) back.href = v.back;
  $('#top-action').innerHTML = v.action || '';
  $('#view').innerHTML = v.html;
  $('#footer').innerHTML = v.footer || '';
  document.body.classList.toggle('no-tabs', v.tabs === false);
  document.body.classList.toggle('has-footer', Boolean(v.footer));
  $$('.tabbar a').forEach((a) => {
    if (a.dataset.tab === v.tab) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  v.bind?.();
  if (routeChanged) {
    window.scrollTo(0, 0);
    $('#title').focus({ preventScroll: true });
  }
}

async function onHashChange() {
  if (suppressNext) { suppressNext = false; return; }
  if (dirty) {
    const target = location.hash;
    suppressNext = true;
    location.hash = lastHash;
    const ok = await confirmDialog({ title: '¿Salir sin guardar?', body: 'Tienes cambios sin guardar. Si sales ahora, se perderán.', confirm: 'Salir sin guardar', danger: true });
    if (!ok) return;
    dirty = false;
    location.hash = target;
    return;
  }
  dirty = false;
  lastHash = location.hash;
  render(true);
}

async function init() {
  if (!location.hash) history.replaceState(null, '', '#/');
  lastHash = location.hash;
  try {
    db = await openDB();
    await loadAll();
  } catch (e) {
    $('#view').innerHTML = emptyState({ title: 'No se puede abrir el armario', text: 'Este navegador no permite guardar datos (¿modo privado?). Ábrelo en una pestaña normal.' });
    return;
  }
  // Pide al navegador que no borre los datos por falta de espacio.
  navigator.storage?.persist?.().catch(() => {});
  // Guarda la app en el dispositivo para abrirla sin conexión (necesita https o localhost).
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  window.addEventListener('hashchange', onHashChange);
  window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  render(true);
}

init();
