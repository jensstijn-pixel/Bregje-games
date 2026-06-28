// Voegt de 25 nieuwe Mini's (uit mini-data.mjs) toe aan de MINI-array in de HTML.
import { readFileSync, writeFileSync } from "node:fs";
import { NEW } from "./mini-data.mjs";
const FILE = "remixed-507c05a6.html";
const html = readFileSync(FILE, "utf8");
const i = html.indexOf("const MINI");
const s = html.indexOf("[", i);
let d = 0, j = s;
for (; j < html.length; j++) { if (html[j] === "[") d++; else if (html[j] === "]") { d--; if (d === 0) break; } }
const before = html.slice(0, j), after = html.slice(j);
const addition = NEW.map(p => "\n" + JSON.stringify(p)).join(",");
writeFileSync(FILE, before.replace(/\s*$/, "") + "," + addition + "\n" + after);
console.log(`Toegevoegd: ${NEW.length} Mini-puzzels.`);
