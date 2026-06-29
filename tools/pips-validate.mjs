// Onafhankelijke controle van alle PIPS-puzzels in de HTML:
//  - grid/regions zelfde vorm; rules dekken alle regio's
//  - solution is een geldige tegeling (cellen aangrenzend, elke cel precies 1x)
//  - dominoset == solution-waarden (multiset)
//  - solution voldoet aan alle regels
//  - EXACT 1 oplossing (uniciteit)
import { readFileSync } from "node:fs";
import * as core from "./pips-core.mjs";

const html = readFileSync(process.argv[2] || "remixed-507c05a6.html", "utf8");
const s = html.indexOf("[", html.indexOf("const PIPS"));
let d = 0, e = s; for (; e < html.length; e++) { if (html[e] === "[") d++; else if (html[e] === "]") { d--; if (d === 0) { e++; break; } } }
const PIPS = JSON.parse(html.slice(s, e));

let errors = 0;
const ms = (k) => k.split(',').map(Number);
PIPS.forEach((pz, idx) => {
  const tag = `Pips #${idx + 1}`;
  const info = core.parse(pz);
  const ncell = info.cells.length;
  const err = (m) => { errors++; console.log(`  ❌ ${tag}: ${m}`); };
  // vorm
  if (pz.regions.length !== pz.grid.length || pz.regions.some((r, i) => r.length !== pz.grid[i].length)) err("regions-vorm ≠ grid");
  // elke regio heeft een regel
  for (const g in info.regCells) if (!pz.rules[g]) err(`regio "${g}" zonder regel`);
  // solution dekt bord precies 1x, aangrenzend
  const cover = {}; let bad = false;
  pz.solution.forEach(pl => {
    const [a, b] = pl.cells;
    const ai = info.idOf[a.join(',')], bi = info.idOf[b.join(',')];
    if (ai == null || bi == null) { err(`solution-cel buiten bord`); bad = true; return; }
    if (!info.adj[ai].includes(bi)) err(`solution-paar niet aangrenzend: ${a}/${b}`);
    [a.join(','), b.join(',')].forEach(k => cover[k] = (cover[k] || 0) + 1);
  });
  if (!bad) {
    const covered = Object.keys(cover).length, dbl = Object.values(cover).filter(x => x > 1).length;
    if (covered !== ncell) err(`solution dekt ${covered}/${ncell} cellen`);
    if (dbl) err(`${dbl} cellen dubbel bedekt`);
  }
  // dominoset == solution-waarden (multiset)
  const bag = (arr) => { const m = {}; arr.forEach(([a, b]) => { const k = Math.min(a, b) + ',' + Math.max(a, b); m[k] = (m[k] || 0) + 1; }); return m; };
  const b1 = bag(pz.dominoes), b2 = bag(pz.solution.map(p => p.vals));
  if (JSON.stringify(Object.entries(b1).sort()) !== JSON.stringify(Object.entries(b2).sort())) err("dominoset ≠ solution-waarden");
  // solution voldoet aan regels
  const val = new Array(ncell).fill(null);
  pz.solution.forEach(pl => { val[info.idOf[pl.cells[0].join(',')]] = pl.vals[0]; val[info.idOf[pl.cells[1].join(',')]] = pl.vals[1]; });
  if (!core.rulesOK(pz, info, val)) err("solution voldoet niet aan de regels");
  // uniciteit
  const cnt = core.countSolutions(pz, info, 2);
  if (cnt !== 1) err(`${cnt === 0 ? 'GEEN' : 'meerdere'} oplossing(en) (telt ${cnt})`);
});

console.log("=".repeat(40));
console.log(errors ? `❌ ${errors} fout(en) in ${PIPS.length} puzzels.` : `✅ Alle ${PIPS.length} Pips-puzzels geldig + uniek oplosbaar.`);
process.exit(errors ? 1 : 0);
