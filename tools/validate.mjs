// Controle-script voor alle puzzeldata in Bregje Games.
// Haalt CONN / STRANDS / MINI uit de HTML en checkt of elke puzzel structureel klopt.
// Gebruik:  node tools/validate.mjs [pad-naar-html]
import { readFileSync } from "node:fs";
import * as pips from "./pips-core.mjs";

const FILE = process.argv[2] || "remixed-507c05a6.html";
const html = readFileSync(FILE, "utf8");

// ---- data uit de HTML trekken (bracket-matching op de array) ----
function grabArray(name) {
  const i = html.indexOf("const " + name);
  if (i < 0) throw new Error("Kan const " + name + " niet vinden");
  const s = html.indexOf("[", i);
  let d = 0, j = s;
  for (; j < html.length; j++) {
    if (html[j] === "[") d++;
    else if (html[j] === "]") { d--; if (d === 0) { j++; break; } }
  }
  // CONN gebruikt JS-object-literals (keys zonder quotes) -> eval; rest is JSON.
  return eval("(" + html.slice(s, j) + ")");
}

let errors = 0, warnings = 0;
const err = (game, idx, msg) => { errors++; console.log(`  ❌ ${game} #${idx}: ${msg}`); };
const warn = (game, idx, msg) => { warnings++; console.log(`  ⚠️  ${game} #${idx}: ${msg}`); };

// ================= VERBIND VIER =================
function validateConn(list) {
  console.log(`\n=== VERBIND VIER (${list.length} puzzels) ===`);
  list.forEach((p, idx) => {
    if (!p.groups || p.groups.length !== 4) return err("CONN", idx, `moet 4 groepen hebben, heeft ${p.groups?.length}`);
    const lvls = p.groups.map(g => g.lvl).sort();
    if (JSON.stringify(lvls) !== "[0,1,2,3]") err("CONN", idx, `levels moeten 0,1,2,3 zijn, zijn ${lvls}`);
    const all = [];
    p.groups.forEach(g => {
      if (!g.name || !g.name.trim()) err("CONN", idx, `groep zonder naam`);
      if (!g.words || g.words.length !== 4) err("CONN", idx, `groep "${g.name}" heeft ${g.words?.length} woorden ipv 4`);
      g.words.forEach(w => all.push(String(w).toUpperCase().trim()));
    });
    const uniq = new Set(all);
    if (uniq.size !== 16) err("CONN", idx, `16 unieke woorden verwacht, ${uniq.size} gevonden (dubbel?)`);
  });
}

// ================= WOORDLIJN (STRANDS) =================
function validateStrands(list) {
  console.log(`\n=== WOORDLIJN (${list.length} puzzels) ===`);
  list.forEach((p, idx) => {
    const { rows, cols, letters, words, theme, spangram } = p;
    const tag = `"${theme}"`;
    if (!letters || letters.length !== rows * cols) return err("STRANDS", idx, `${tag}: letters-lengte ${letters?.length} ≠ ${rows}×${cols}=${rows*cols}`);
    if (!theme) warn("STRANDS", idx, "geen thema");
    const adj = (a, b) => {
      const ra = (a / cols) | 0, ca = a % cols, rb = (b / cols) | 0, cb = b % cols;
      return Math.max(Math.abs(ra - rb), Math.abs(ca - cb)) === 1;
    };
    const cover = new Array(rows * cols).fill(0);
    let spanCount = 0;
    words.forEach(wd => {
      const { w, path, span } = wd;
      if (path.length !== w.length) err("STRANDS", idx, `${tag}: woord ${w} pad-lengte ${path.length} ≠ ${w.length}`);
      // indices geldig + uniek binnen woord
      const seen = new Set();
      path.forEach(i => { if (i < 0 || i >= rows*cols) err("STRANDS", idx, `${tag}: ${w} index ${i} buiten bord`); if (seen.has(i)) err("STRANDS", idx, `${tag}: ${w} gebruikt cel ${i} dubbel`); seen.add(i); cover[i]++; });
      // adjacency
      for (let k = 1; k < path.length; k++) if (!adj(path[k-1], path[k])) err("STRANDS", idx, `${tag}: ${w} cellen ${path[k-1]}→${path[k]} niet aangrenzend`);
      // letters spellen het woord
      const spelled = path.map(i => letters[i]).join("").toUpperCase();
      if (spelled !== w.toUpperCase()) err("STRANDS", idx, `${tag}: pad spelt "${spelled}" ipv "${w}"`);
      if (span) spanCount++;
    });
    // elke cel precies 1x
    const uncovered = cover.filter(c => c === 0).length;
    const overlap = cover.filter(c => c > 1).length;
    if (uncovered) err("STRANDS", idx, `${tag}: ${uncovered} cellen niet bedekt`);
    if (overlap) err("STRANDS", idx, `${tag}: ${overlap} cellen dubbel bedekt`);
    // precies 1 spangram, en die raakt twee tegenoverliggende randen
    if (spanCount !== 1) err("STRANDS", idx, `${tag}: ${spanCount} spangrammen (moet 1)`);
    const sp = words.find(w => w.span);
    if (sp) {
      if (spangram && sp.w.toUpperCase() !== spangram.toUpperCase()) warn("STRANDS", idx, `${tag}: spangram-veld "${spangram}" ≠ span-woord "${sp.w}"`);
      const rset = sp.path.map(i => (i / cols) | 0), cset = sp.path.map(i => i % cols);
      const touchLR = cset.includes(0) && cset.includes(cols - 1);
      const touchTB = rset.includes(0) && rset.includes(rows - 1);
      if (!touchLR && !touchTB) err("STRANDS", idx, `${tag}: spangram "${sp.w}" raakt geen twee tegenoverliggende randen`);
    }
  });
}

// ================= MINI KRUISWOORD =================
function validateMini(list) {
  console.log(`\n=== MINI KRUISWOORD (${list.length} puzzels) ===`);
  list.forEach((p, idx) => {
    const N = 5;
    const g = p.grid.map(r => r.split(""));
    if (g.length !== N || g.some(r => r.length !== N)) return err("MINI", idx, `rooster niet ${N}×${N}`);
    const black = (r, c) => g[r][c] === "#";
    // numbering + entries
    let num = Array.from({ length: N }, () => Array(N).fill(0)), n = 0;
    const across = [], down = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (black(r, c)) continue;
      const sA = (c === 0 || black(r, c-1)) && (c+1 < N && !black(r, c+1));
      const sD = (r === 0 || black(r-1, c)) && (r+1 < N && !black(r+1, c));
      if (sA || sD) { num[r][c] = ++n; }
      if (sA) { let cc = c, w = ""; while (cc < N && !black(r, cc)) { w += g[r][cc]; cc++; } across.push({ num: num[r][c], word: w }); }
      if (sD) { let rr = r, w = ""; while (rr < N && !black(rr, c)) { w += g[rr][c]; rr++; } down.push({ num: num[r][c], word: w }); }
    }
    // clue-nummers moeten exact matchen met entries
    const aNums = across.map(e => String(e.num)).sort();
    const dNums = down.map(e => String(e.num)).sort();
    const aClues = Object.keys(p.across || {}).sort();
    const dClues = Object.keys(p.down || {}).sort();
    if (JSON.stringify(aNums) !== JSON.stringify(aClues)) err("MINI", idx, `across clue-nummers ${aClues} ≠ entries ${aNums}`);
    if (JSON.stringify(dNums) !== JSON.stringify(dClues)) err("MINI", idx, `down clue-nummers ${dClues} ≠ entries ${dNums}`);
    // lege clue-teksten?
    [["across", p.across], ["down", p.down]].forEach(([dir, obj]) => {
      Object.entries(obj || {}).forEach(([k, v]) => { if (!v || !String(v).trim()) err("MINI", idx, `${dir} ${k}: lege aanwijzing`); });
    });
    // letters moeten hoofdletters/letters zijn
    g.forEach((row, r) => row.forEach((ch, c) => { if (ch !== "#" && !/[A-Z]/.test(ch)) err("MINI", idx, `cel ${r},${c} = "${ch}" geen hoofdletter`); }));
    // entries minstens 2 lang
    across.concat(down).forEach(e => { if (e.word.length < 2) warn("MINI", idx, `entry "${e.word}" korter dan 2`); });
  });
}

// ================= PIPS =================
function validatePips(list) {
  console.log(`\n=== PIPS (${list.length} puzzels) ===`);
  list.forEach((pz, idx) => {
    const info = pips.parse(pz);
    const ncell = info.cells.length;
    for (const g in info.regCells) if (!pz.rules[g]) err("PIPS", idx, `regio "${g}" zonder regel`);
    const cover = {};
    pz.solution.forEach(pl => pl.cells.forEach(c => { cover[c.join(',')] = (cover[c.join(',')] || 0) + 1; }));
    if (Object.keys(cover).length !== ncell) err("PIPS", idx, `solution dekt ${Object.keys(cover).length}/${ncell} cellen`);
    if (Object.values(cover).some(x => x > 1)) err("PIPS", idx, `cellen dubbel bedekt`);
    const val = new Array(ncell).fill(null);
    pz.solution.forEach(pl => { val[info.idOf[pl.cells[0].join(',')]] = pl.vals[0]; val[info.idOf[pl.cells[1].join(',')]] = pl.vals[1]; });
    if (!pips.rulesOK(pz, info, val)) err("PIPS", idx, `solution voldoet niet aan de regels`);
    const cnt = pips.countSolutions(pz, info, 2);
    if (cnt !== 1) err("PIPS", idx, `${cnt} oplossing(en) (moet 1)`);
  });
}

// ---- draaien ----
try {
  validateConn(grabArray("CONN"));
  validateStrands(grabArray("STRANDS"));
  validateMini(grabArray("MINI"));
  validatePips(grabArray("PIPS"));
  console.log(`\n${"=".repeat(40)}`);
  if (errors === 0) console.log(`✅ Alles structureel in orde. (${warnings} waarschuwingen)`);
  else console.log(`❌ ${errors} fouten, ${warnings} waarschuwingen.`);
  process.exit(errors ? 1 : 0);
} catch (e) {
  console.error("Script-fout:", e.message);
  process.exit(2);
}
