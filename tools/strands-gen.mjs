// Genereert geldige Woordlijn-puzzels uit thema-specs en voegt ze toe aan de STRANDS-array.
// node tools/strands-gen.mjs --test   -> alleen solven + rapporteren (schrijft niets)
// node tools/strands-gen.mjs          -> solven en in de HTML injecteren
import { readFileSync, writeFileSync } from "node:fs";
import { solve } from "./strands-solver.mjs";

// Per spec: theme, spangram, words (incl. spangram). rows/cols worden auto-gekozen.
const SPECS = [
  { theme: "Bakkerij", spangram: "BAKKERIJ", words: ["BAKKERIJ","CROISSANT","BESCHUIT","KOEKJE","BROOD","SOEZEN"] },
  { theme: "Zuivel", spangram: "ZUIVEL", words: ["ZUIVEL","YOGHURT","KWARK","BOTER","KAAS","KARNEMELK"] },
  { theme: "Zeedieren", spangram: "ZEEDIEREN", words: ["ZEEDIEREN","OCTOPUS","GARNAAL","ZEESTER","KWAL","KRAB","HAAI"] },
  { theme: "Op het terras", spangram: "TERRAS", words: ["TERRAS","PARASOL","KOFFIE","KUSSEN","BORREL","STOEL","MENU"] },
  { theme: "Kruiden", spangram: "KRUIDEN", words: ["KRUIDEN","BASILICUM","OREGANO","TIJM","PETERSELIE","DILLE"] },
  { theme: "Vogels", spangram: "VOGELS", words: ["VOGELS","OOIEVAAR","ZWALUW","SPECHT","MEREL","KRAAI","REIGER"] },
  { theme: "Insecten", spangram: "INSECTEN", words: ["INSECTEN","VLINDER","SPRINKHAAN","KEVER","WESP","MIER","RUPS"] },
  { theme: "In de keuken", spangram: "KEUKEN", words: ["KEUKEN","KOELKAST","FORNUIS","SPATEL","GARDE","VERGIET","PAN"] },
  { theme: "Herfst", spangram: "HERFST", words: ["HERFST","BLADEREN","KASTANJE","PADDENSTOEL","REGEN","WIND"] },
  { theme: "Bloemen", spangram: "BLOEMEN", words: ["BLOEMEN","ZONNEBLOEM","MARGRIET","NARCIS","TULP","ROOS","LIS"] },
  { theme: "In de garage", spangram: "GARAGE", words: ["GARAGE","SLEUTEL","MOTOR","BUMPER","KRIK","BAND","ACCU","OLIE"] },
  { theme: "Camping", spangram: "CAMPING", words: ["CAMPING","TENT","SLAAPZAK","VELDBED","KAMPVUUR","LUCHTBED"] },
  { theme: "Het zwembad", spangram: "ZWEMBAD", words: ["ZWEMBAD","GLIJBAAN","ZWEMBRIL","BADPAK","DUIKEN","PLONS"] },
  { theme: "Supermarkt", spangram: "SUPERMARKT", words: ["SUPERMARKT","KARRETJE","KASSIER","MANDJE","KASSA","AANBOD"] },
  { theme: "Op kantoor", spangram: "KANTOOR", words: ["KANTOOR","COMPUTER","PRINTER","BUREAU","AGENDA","ORDNER"] },
  { theme: "Het ziekenhuis", spangram: "ZIEKENHUIS", words: ["ZIEKENHUIS","OPERATIE","VERBAND","DOKTER","SPUIT","ZUSTER"] },
  { theme: "Ruimtevaart", spangram: "RUIMTEVAART", words: ["RUIMTEVAART","ASTRONAUT","KOMEET","RAKET","MAAN","PLANEET"] },
  { theme: "Verjaardag", spangram: "VERJAARDAG", words: ["VERJAARDAG","SLINGER","BALLON","CADEAU","KAARSJE"] },
  { theme: "De bouwplaats", spangram: "BOUWPLAATS", words: ["BOUWPLAATS","BAKSTEEN","STEIGER","CEMENT","KRAAN","HELM"] },
  { theme: "Brandweer", spangram: "BRANDWEER", words: ["BRANDWEER","BLUSSEN","LADDER","SIRENE","SLANG","VUUR","ALARM"] },
  { theme: "Het station", spangram: "STATION", words: ["STATION","KAARTJE","PERRON","TREIN","RAILS","WISSEL"] },
  { theme: "Drankjes", spangram: "DRANKJES", words: ["DRANKJES","LIMONADE","WATER","COLA","BIER","WIJN","SAP"] },
  { theme: "Picknick", spangram: "PICKNICK", words: ["PICKNICK","BROODJE","THERMOS","KLEED","APPEL","MAND"] },
  { theme: "Snoep", spangram: "SNOEP", words: ["SNOEP","KAUWGOM","ZUURTJE","TOFFEE","LOLLY","DROPS"] },
  { theme: "In het theater", spangram: "THEATER", words: ["THEATER","APPLAUS","GORDIJN","SCHMINK","ACTEUR","COULISSE"] },
];

function autoSize(sum, spanLen) {
  const cands = [[6,7],[7,6],[6,6],[7,7],[6,8],[8,6],[5,7],[7,5],[5,8],[8,5],[6,5],[5,6],[5,5],[7,8],[8,7],[6,9],[9,6]];
  for (const [c, r] of cands) if (c * r === sum && spanLen >= Math.min(c, r)) return { cols: c, rows: r };
  return null;
}

const results = [], failed = [];
for (const spec of SPECS) {
  const sum = spec.words.reduce((a, w) => a + w.length, 0);
  const sz = autoSize(sum, spec.spangram.length);
  if (!sz) { failed.push(`${spec.theme}: geen rooster voor ${sum} letters (spangram ${spec.spangram.length})`); continue; }
  const t0 = Date.now();
  let res = null;
  try { res = solve({ ...spec, rows: sz.rows, cols: sz.cols }); } catch (e) { failed.push(`${spec.theme}: ${e.message}`); continue; }
  const ms = Date.now() - t0;
  if (res) { results.push(res); console.log(`✅ ${spec.theme.padEnd(18)} ${sz.cols}×${sz.rows}  ${ms}ms`); }
  else { failed.push(`${spec.theme}: GEEN tiling gevonden (${ms}ms)`); console.log(`❌ ${spec.theme.padEnd(18)} FAILED ${ms}ms`); }
}

if (failed.length) { console.log("\nMislukt:\n" + failed.map(f => "  - " + f).join("\n")); }
console.log(`\n${results.length}/${SPECS.length} gelukt.`);

if (process.argv.includes("--test")) process.exit(failed.length ? 1 : 0);

// injecteren in HTML
if (results.length) {
  const FILE = "remixed-507c05a6.html";
  const html = readFileSync(FILE, "utf8");
  const i = html.indexOf("const STRANDS");
  const s = html.indexOf("[", i);
  let d = 0, j = s;
  for (; j < html.length; j++) { if (html[j] === "[") d++; else if (html[j] === "]") { d--; if (d === 0) break; } }
  const before = html.slice(0, j), after = html.slice(j);
  const addition = results.map(r => "\n" + JSON.stringify(r)).join(",");
  writeFileSync(FILE, before.replace(/\s*$/, "") + "," + addition + "\n" + after);
  console.log(`In HTML gezet: ${results.length} Woordlijn-puzzels.`);
}
