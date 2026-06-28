// Zoekt geldige 5x5 woordvierkanten: alle 5 rijen én alle 5 kolommen zijn echte
// woorden uit de woordenlijst die in het spel zit (OpenTaal).
// Garandeert dus dat elk across/down-woord bestaat. Aanwijzingen schrijf ik daarna.
import { readFileSync } from "node:fs";
const html = readFileSync("remixed-507c05a6.html", "utf8");
const grab = (re) => html.match(re)[1].trim().toUpperCase().split(/\s+/);
const VALID = grab(/VALID_RAW\s*=\s*"([^"]*)"/);
const ANSWERS = grab(/ANSWERS_RAW\s*=\s*"([^"]*)"/);

// kolommen mogen uit de hele lijst, rijen uit de gangbare -> daarna rangschikken op gangbaarheid
const universe = new Set([...VALID, ...ANSWERS].filter(w => w.length === 5));
// witte lijst: gangbare woorden die NIET in ANSWERS zitten maar wél prima te becijferen zijn
const ALLOW = "RATIO EVENT ZEBRA MANGA HAKEN KWAAL OKSEL WRAAK TOPAS KARAF ALARM ENORM KLANK HELFT AROMA SNELT OPRIT GRAAG KWEEK METER AORTA FLASH KENDE MISTE BENIG PEZIG ENGST LOGGE BEDEL STOPS BORGT ALIEN TUNER MOTTO SJERP LAPEL AGAAT REKEN STEEG NEGEN NOTEN LATEN REDEN GRENS DRANK STANK STOEL EINDE LEREN RENTE UNIEK ETAGE ARENA ENIGE ELLEN LENTE TANTE TEAMS ERNST ANGST ALLER ALLEN KLAAR KRAAN JEANS EERST SLAAN SLAAG SMELT TANGO ERGER START STORT BETER PATER STRAF APART".split(/\s+/);
const COMMON = new Set([...ANSWERS.filter(w => w.length === 5), ...ALLOW]);
// prefix-set voor snoeien
const prefixes = new Set();
for (const w of universe) for (let i = 1; i <= 5; i++) prefixes.add(w.slice(0, i));

// pool om uit te kiezen voor rijen (veelvoorkomend eerst): ANSWERS zijn gangbaarder
const rowPool = ANSWERS.filter(w => w.length === 5);

let seed = 12345;
const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (rand() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };

// vind 1 vierkant dat met firstRow begint
function findSquare(firstRow) {
  const rows = [firstRow];
  function colsOK(upto) {
    for (let c = 0; c < 5; c++) {
      let pref = "";
      for (let r = 0; r < upto; r++) pref += rows[r][c];
      if (!prefixes.has(pref)) return false;
    }
    return true;
  }
  function rec(r) {
    if (r === 5) {
      // ALLE kolommen moeten gangbaar/becijferbaar zijn (COMMON), niet alleen geldig
      for (let c = 0; c < 5; c++) { let col = ""; for (let rr = 0; rr < 5; rr++) col += rows[rr][c]; if (!COMMON.has(col)) return false; }
      const cols = []; for (let c = 0; c < 5; c++) { let col = ""; for (let rr = 0; rr < 5; rr++) col += rows[rr][c]; cols.push(col); }
      const all = new Set([...rows, ...cols]); if (all.size < 8) return false;
      return true;
    }
    for (const w of shuffle(rowPool)) {
      if (rows.includes(w)) continue;
      rows[r] = w;
      if (colsOK(r + 1) && rec(r + 1)) return true;
    }
    rows.length = r;
    return false;
  }
  return rec(1) ? rows.slice() : null;
}

const found = [];
const seen = new Set();
const firsts = shuffle(rowPool);
for (const fw of firsts) {
  if (found.length >= 400) break;
  const sq = findSquare(fw);
  if (sq) { const key = sq.join(""); if (!seen.has(key)) { seen.add(key); found.push(sq); } }
}

// score = aantal van de 10 woorden in de gangbare lijst (rijen zijn dat al, dus max 5 van kolommen)
function colsOf(sq) { const cols = []; for (let c = 0; c < 5; c++) { let col = ""; for (let r = 0; r < 5; r++) col += sq[r][c]; cols.push(col); } return cols; }
const scored = found.map(sq => { const cols = colsOf(sq); const common = cols.filter(w => COMMON.has(w)).length; return { sq, cols, common }; });
scored.sort((a, b) => b.common - a.common);

console.log(`Gevonden: ${found.length}. Top op gangbaarheid (kolommen die NIET gangbaar zijn met *):`);
for (const { sq, cols, common } of scored.slice(0, 40)) {
  const colstr = cols.map(w => COMMON.has(w) ? w : w + "*").join(" / ");
  console.log(`[${common}/5] ${sq.join(" / ")}   |   ↓ ${colstr}`);
}
