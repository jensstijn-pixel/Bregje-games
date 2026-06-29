/* staff-build.mjs — zet de tekeningen + tekst uit ./staff/ in het HTML-bestand.
 *
 * Gebruik:   node tools/staff-build.mjs
 *
 * - Leest staff/staff.json (lijst met {file,name,aliases,role,age}).
 * - Comprimeert elke foto met `sips` (standaard op macOS) naar max 440px JPEG
 *   en zet 'm als base64 in de HTML — zo blijft alles in 1 bestand.
 * - Ontbreekt een foto, dan komt er een nette placeholder-tekening (letter in een
 *   gekleurde cirkel), zodat het spel altijd werkt. Foto later toevoegen +
 *   script opnieuw draaien vervangt 'm automatisch.
 * - Het script vervangt alleen het blok tussen de STAFF:START- en STAFF:END-markers.
 */
import { readFileSync, writeFileSync, existsSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;
const HTML = join(ROOT, 'remixed-507c05a6.html');
const STAFF_DIR = join(ROOT, 'staff');
const JSON_PATH = join(STAFF_DIR, 'staff.json');

const MARK_START = '/* STAFF:START */';
const MARK_END = '/* STAFF:END */';
const MAX = 600;       // langste zijde in px
const QUALITY = 78;    // JPEG-kwaliteit 0-100
const ASPECT = 0.75;   // breedte/hoogte van het uniforme frame (3:4)
const HEAD_PX = 150;   // grootte van de ronde kop-uitsnede (px)
const HEAD_Q = 82;     // JPEG-kwaliteit van de kop

function placeholder(name) {
  const letter = (name[0] || '?').toUpperCase();
  const colors = ['#ef5a2a', '#56ab46', '#5aa0e6', '#b072d8', '#e0a83a'];
  const c = colors[name.length % colors.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>` +
    `<rect width='300' height='300' rx='24' fill='#f0e6d6'/>` +
    `<circle cx='150' cy='118' r='66' fill='${c}'/>` +
    `<rect x='66' y='198' width='168' height='110' rx='52' fill='${c}'/>` +
    `<text x='150' y='140' font-family='sans-serif' font-size='74' font-weight='700' ` +
    `text-anchor='middle' fill='#fff'>${letter}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// --- mini BMP-gereedschap (sips levert 24-bit top-down BMP) ---
function readBmp24(path) {
  const b = readFileSync(path);
  if (b[0] !== 0x42 || b[1] !== 0x4D) throw new Error('geen BMP');
  const off = b.readUInt32LE(10);
  const w = b.readInt32LE(18);
  let h = b.readInt32LE(22);
  if (b.readUInt16LE(28) !== 24) throw new Error('verwacht 24bpp BMP');
  const topDown = h < 0; h = Math.abs(h);
  const rowSize = (((24 * w) + 31) >> 5) << 2;
  const px = (x, y) => { const row = topDown ? y : (h - 1 - y); const i = off + row * rowSize + x * 3; return [b[i + 2], b[i + 1], b[i]]; };
  return { w, h, px };
}
// kleinste rechthoek om alles wat niet (bijna-)wit is
function contentBbox(img, thr = 240) {
  let x0 = img.w, y0 = img.h, x1 = -1, y1 = -1;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    const [r, g, bl] = img.px(x, y);
    if (r < thr || g < thr || bl < thr) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) return null;
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
function writeBmp24(W, H, draw) {
  const rowSize = (((24 * W) + 31) >> 5) << 2;
  const size = 54 + rowSize * H;
  const b = Buffer.alloc(size, 0);
  b[0] = 0x42; b[1] = 0x4D; b.writeUInt32LE(size, 2); b.writeUInt32LE(54, 10);
  b.writeUInt32LE(40, 14); b.writeInt32LE(W, 18); b.writeInt32LE(-H, 22);
  b.writeUInt16LE(1, 26); b.writeUInt16LE(24, 28); b.writeUInt32LE(rowSize * H, 34);
  b.fill(0xff, 54); // witte achtergrond
  const set = (x, y, r, g, bl) => { const i = 54 + y * rowSize + x * 3; b[i] = bl; b[i + 1] = g; b[i + 2] = r; };
  draw(set);
  return b;
}

// schaal een BMP-buffer naar JPEG (data-URI) via sips
function bmpToJpeg(bmpBuf, scaleMax, quality) {
  const stamp = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const bmp = join(tmpdir(), 'staff-' + stamp + '.bmp');
  const jpg = join(tmpdir(), 'staff-' + stamp + '.jpg');
  try {
    writeFileSync(bmp, bmpBuf);
    execFileSync('sips', ['-Z', String(scaleMax), '-s', 'format', 'jpeg', '-s', 'formatOptions', String(quality), bmp, '--out', jpg], { stdio: 'ignore' });
    return 'data:image/jpeg;base64,' + readFileSync(jpg).toString('base64');
  } finally { [bmp, jpg].forEach(p => { try { rmSync(p); } catch (e) {} }); }
}

// maakt zowel de hele tekening (img) als een vierkante kop-uitsnede (head)
function encodeImages(file) {
  const stamp = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const bmpIn = join(tmpdir(), 'staff-in-' + stamp + '.bmp');
  try {
    // PNG -> BMP zodat we de pixels kunnen lezen
    execFileSync('sips', ['-s', 'format', 'bmp', file, '--out', bmpIn], { stdio: 'ignore' });
    const img = readBmp24(bmpIn);
    const bb = contentBbox(img);
    if (!bb) return { img: bmpToJpeg(readFileSync(bmpIn), MAX, QUALITY), head: null };

    // body: bijsnijden tot de figuur + centreren op een uniform 3:4-canvas met marge
    const vMar = Math.round(bb.h * 0.06);
    const canvasH = bb.h + vMar * 2;
    const canvasW = Math.max(Math.round(canvasH * ASPECT), bb.w + Math.round(bb.h * 0.04) * 2);
    const xOff = Math.round((canvasW - bb.w) / 2), yOff = vMar;
    const bodyBmp = writeBmp24(canvasW, canvasH, (set) => {
      for (let y = 0; y < bb.h; y++) for (let x = 0; x < bb.w; x++) {
        const [r, g, bl] = img.px(bb.x0 + x, bb.y0 + y);
        set(xOff + x, yOff + y, r, g, bl);
      }
    });

    // head: vierkante uitsnede van het gezicht bovenaan de bbox
    const side = Math.min(Math.round(bb.w * 0.66), img.w, img.h);
    const cx = bb.x0 + bb.w / 2;
    const hx = Math.max(0, Math.min(Math.round(cx - side / 2), img.w - side));
    const hy = Math.max(0, Math.min(bb.y0 - Math.round(side * 0.06), img.h - side));
    const headBmp = writeBmp24(side, side, (set) => {
      for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) {
        const [r, g, bl] = img.px(hx + x, hy + y);
        set(x, y, r, g, bl);
      }
    });

    return { img: bmpToJpeg(bodyBmp, MAX, QUALITY), head: bmpToJpeg(headBmp, HEAD_PX, HEAD_Q) };
  } finally { try { rmSync(bmpIn); } catch (e) {} }
}

const list = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
let withPhoto = 0;
const entries = list.map((s) => {
  const f = s.file ? join(STAFF_DIR, s.file) : null;
  let img, head = null;
  if (f && existsSync(f)) { ({ img, head } = encodeImages(f)); withPhoto++; console.log('  ✓ ' + s.name + ' (' + s.file + ')'); }
  else { img = placeholder(s.name); console.log('  … ' + s.name + ' (placeholder — foto ontbreekt)'); }
  return { name: s.name, aliases: s.aliases || [], role: s.role || '', age: s.age || null, img, head };
});

const block = MARK_START + '\nconst STAFF = ' + JSON.stringify(entries) + ';\n' + MARK_END;
const esc = (m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const re = new RegExp(esc(MARK_START) + '[\\s\\S]*?' + esc(MARK_END));
let html = readFileSync(HTML, 'utf8');
if (!re.test(html)) { console.error('FOUT: STAFF-markers niet gevonden in ' + HTML); process.exit(1); }
html = html.replace(re, block);
writeFileSync(HTML, html);

const kb = Math.round(Buffer.byteLength(block, 'utf8') / 1024);
console.log(`\nKlaar: ${entries.length} collega's in de HTML (${withPhoto} met foto, ${entries.length - withPhoto} placeholder). Datablok ~${kb} KB.`);
