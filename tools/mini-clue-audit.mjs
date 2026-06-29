// Analyseert alle Mini's: welke aanwijzing-teksten komen meer dan 1x voor?
// En per woord: welke (verschillende) aanwijzingen worden gebruikt.
import { readFileSync } from "node:fs";
const html = readFileSync("remixed-507c05a6.html", "utf8");
const i = html.indexOf("const MINI");
const s = html.indexOf("[", i);
let d = 0, j = s;
for (; j < html.length; j++) { if (html[j] === "[") d++; else if (html[j] === "]") { d--; if (d === 0) { j++; break; } } }
const MINI = JSON.parse(html.slice(s, j));
const N = 5;
function entries(p) {
  const g = p.grid.map(r => r.split(""));
  const bl = (r, c) => g[r][c] === "#";
  let num = Array.from({ length: N }, () => Array(N).fill(0)), n = 0;
  const out = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (bl(r, c)) continue;
    const sA = (c === 0 || bl(r, c-1)) && c+1 < N && !bl(r, c+1);
    const sD = (r === 0 || bl(r-1, c)) && r+1 < N && !bl(r+1, c);
    if (sA || sD) num[r][c] = ++n;
    if (sA) { let cc = c, w = ""; while (cc < N && !bl(r, cc)) { w += g[r][cc]; cc++; } out.push({ dir: "across", num: num[r][c], word: w }); }
    if (sD) { let rr = r, w = ""; while (rr < N && !bl(rr, c)) { w += g[rr][c]; rr++; } out.push({ dir: "down", num: num[r][c], word: w }); }
  }
  return out;
}
const clueMap = new Map(); // clueText -> [{pi,dir,num,word}]
const wordClues = new Map(); // word -> Set(clueText)
MINI.forEach((p, pi) => {
  entries(p).forEach(e => {
    const clue = (p[e.dir] && p[e.dir][e.num]) || "";
    if (!clueMap.has(clue)) clueMap.set(clue, []);
    clueMap.get(clue).push({ pi, dir: e.dir, num: e.num, word: e.word });
    if (!wordClues.has(e.word)) wordClues.set(e.word, new Set());
    wordClues.get(e.word).add(clue);
  });
});
console.log(`Totaal ${MINI.length} Mini's.\n=== Aanwijzing-teksten die >1x voorkomen ===`);
let dupCount = 0;
[...clueMap.entries()].filter(([c, l]) => l.length > 1).sort((a,b)=>b[1].length-a[1].length).forEach(([clue, list]) => {
  dupCount++;
  const where = list.map(x => `M${x.pi+1}:${x.dir==="across"?"→":"↓"}${x.num}(${x.word})`).join(", ");
  console.log(`  ${list.length}×  "${clue}"  -> ${where}`);
});
console.log(`\n${dupCount} aanwijzing-teksten komen meer dan 1x voor.`);
