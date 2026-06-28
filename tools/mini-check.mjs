// Controleert kandidaat-Mini's: structuur + 5-letterwoorden tegen de woordenlijst,
// en toont alle across/down-woorden zodat korte woorden met het oog te checken zijn.
// Importeer een array NEW (zelfde vorm als de MINI-data) en draai: node tools/mini-check.mjs
import { readFileSync } from "node:fs";
import { NEW } from "./mini-data.mjs";

const html = readFileSync("remixed-507c05a6.html", "utf8");
const grab = (re) => new Set(html.match(re)[1].trim().toUpperCase().split(/\s+/));
const VALID = grab(/VALID_RAW\s*=\s*"([^"]*)"/);
const ANSW = grab(/ANSWERS_RAW\s*=\s*"([^"]*)"/);
const DICT = new Set([...VALID, ...ANSW]);

let problems = 0;
NEW.forEach((p, idx) => {
  const N = 5;
  const g = p.grid.map(r => r.split(""));
  const black = (r, c) => g[r][c] === "#";
  let num = Array.from({ length: N }, () => Array(N).fill(0)), n = 0;
  const across = [], down = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (black(r, c)) continue;
    const sA = (c === 0 || black(r, c-1)) && (c+1 < N && !black(r, c+1));
    const sD = (r === 0 || black(r-1, c)) && (r+1 < N && !black(r+1, c));
    if (sA || sD) num[r][c] = ++n;
    if (sA) { let cc = c, w = ""; while (cc < N && !black(r, cc)) { w += g[r][cc]; cc++; } across.push({ num: num[r][c], word: w }); }
    if (sD) { let rr = r, w = ""; while (rr < N && !black(rr, c)) { w += g[rr][c]; rr++; } down.push({ num: num[r][c], word: w }); }
  }
  const aNums = across.map(e => String(e.num)).sort();
  const dNums = down.map(e => String(e.num)).sort();
  const aClues = Object.keys(p.across || {}).sort();
  const dClues = Object.keys(p.down || {}).sort();
  const issues = [];
  if (JSON.stringify(aNums) !== JSON.stringify(aClues)) issues.push(`across-nummers ${aClues} ≠ ${aNums}`);
  if (JSON.stringify(dNums) !== JSON.stringify(dClues)) issues.push(`down-nummers ${dClues} ≠ ${dNums}`);
  across.concat(down).forEach(e => {
    if (e.word.length === 5 && !DICT.has(e.word)) issues.push(`5-letterwoord "${e.word}" NIET in woordenlijst`);
    Object.values(p.across).concat(Object.values(p.down)).forEach(()=>{});
  });
  // lege clues
  [["across",p.across],["down",p.down]].forEach(([d,o])=>Object.entries(o||{}).forEach(([k,v])=>{if(!v||!String(v).trim())issues.push(`${d} ${k} lege clue`);}));

  const tag = `Mini ${idx+1}`;
  if (issues.length) { problems += issues.length; console.log(`❌ ${tag}: ${issues.join(" | ")}`); }
  else {
    const aw = across.map(e=>e.word).join(",");
    const dw = down.map(e=>e.word).join(",");
    console.log(`✅ ${tag}  →: ${aw}   ↓: ${dw}`);
  }
});
console.log(problems ? `\n${problems} probleem(en).` : `\nAlle ${NEW.length} kandidaten OK (structuur + 5-letterwoorden).`);
