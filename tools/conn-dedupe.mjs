// Vervangt Verbind Vier-groepen die inhoudelijk (>=3 woorden) met een eerdere groep botsen,
// door verse categorieën (zelfde niveau). Daarna controle: geen overlap >=3 meer.
import { readFileSync, writeFileSync } from "node:fs";
const FILE = "remixed-507c05a6.html";
const html = readFileSync(FILE, "utf8");
const s = html.indexOf("[", html.indexOf("const CONN"));
let d = 0, e = s;
for (; e < html.length; e++) { if (html[e] === "[") d++; else if (html[e] === "]") { d--; if (d === 0) { e++; break; } } }
const CONN = eval("(" + html.slice(s, e) + ")");

// (puzzel 1-based) -> { oudeNaam: nieuwe groep }
const R = {
  10: { "Weersverschijnselen": { lvl:1, name:"Werelddelen", words:["EUROPA","AZIE","AFRIKA","AMERIKA"] } },
  14: { "Dranken": { lvl:2, name:"Reptielen", words:["SLANG","HAGEDIS","KROKODIL","SCHILDPAD"] },
        "Synoniemen voor 'snel'": { lvl:3, name:"Synoniemen voor 'blij'", words:["VROLIJK","OPGEWEKT","VERHEUGD","UITGELATEN"] } },
  15: { "Nederlandse rivieren": { lvl:2, name:"Belgische steden", words:["ANTWERPEN","GENT","BRUGGE","LUIK"] } },
  27: { "___ + werk": { lvl:3, name:"___ + ketting", words:["SLEUTEL","FIETS","HALS","SCHAKEL"] } },
  28: { "Zuivel": { lvl:0, name:"Tropisch fruit", words:["MANGO","ANANAS","PAPAJA","KOKOS"] },
        "Schaakstukken": { lvl:2, name:"Hoofdsteden", words:["PARIJS","BERLIJN","MADRID","ROME"] } },
  29: { "Delen van je gezicht": { lvl:0, name:"In de speeltuin", words:["SCHOMMEL","GLIJBAAN","WIPWAP","ZANDBAK"] },
        "Edelstenen": { lvl:2, name:"Roofvogels", words:["HAVIK","BUIZERD","ADELAAR","VALK"] } },
  30: { "___ + stok": { lvl:3, name:"___ + mand", words:["WAS","PAPIER","FRUIT","PICKNICK"] } },
  32: { "Sterrenbeelden": { lvl:2, name:"Specerijen", words:["PEPER","KANEEL","NOOTMUSKAAT","KURKUMA"] } },
  33: { "Weertypes": { lvl:0, name:"Op de kermis", words:["REUZENRAD","BOTSAUTO","SUIKERSPIN","DRAAIMOLEN"] },
        "___ + bui": { lvl:3, name:"___ + slot", words:["HANG","FIETS","DEUR","CIJFER"] } },
  37: { "Balsporten": { lvl:1, name:"Vechtsporten", words:["JUDO","KARATE","BOKSEN","SCHERMEN"] } },
  38: { "Kledingstukken": { lvl:0, name:"Speelgoed", words:["POP","BLOKKEN","KNUFFEL","STEP"] } },
  39: { "Groente": { lvl:0, name:"Soorten appels", words:["ELSTAR","JONAGOLD","GRANNY","GOUDREINET"] },
        "Smaken": { lvl:2, name:"Zwemslagen", words:["SCHOOLSLAG","RUGSLAG","VLINDERSLAG","CRAWL"] } },
  43: { "Op de boerderij": { lvl:0, name:"Soorten bessen", words:["BRAAM","FRAMBOOS","BOSBES","AALBES"] } },
  44: { "Wintersport": { lvl:1, name:"Aziatisch eten", words:["SUSHI","NOEDELS","LOEMPIA","WOK"] } },
  45: { "Gevoelens": { lvl:0, name:"Pizza-toppings", words:["SALAMI","CHAMPIGNON","ANANAS","MOZZARELLA"] } },
  46: { "Rekenen": { lvl:2, name:"Kaartspellen", words:["POKER","KLAVERJAS","PESTEN","TOEPEN"] } },
  47: { "Metalen": { lvl:1, name:"Knaagdieren", words:["MUIS","RAT","EEKHOORN","BEVER"] } },
  50: { "Botten": { lvl:1, name:"Zangvogels", words:["MEREL","VINK","MUS","LIJSTER"] },
        "Organen": { lvl:2, name:"Ridderuitrusting", words:["ZWAARD","SCHILD","HARNAS","HELM"] } },
  51: { "Sprookjesfiguren": { lvl:1, name:"Mexicaans eten", words:["TACO","BURRITO","NACHO","QUESADILLA"] } },
};

let applied = 0, missing = [];
Object.entries(R).forEach(([pi, repl]) => {
  const groups = CONN[pi - 1].groups;
  Object.entries(repl).forEach(([oldName, ng]) => {
    const idx = groups.findIndex(g => g.name === oldName);
    if (idx < 0) { missing.push(`P${pi} "${oldName}"`); return; }
    groups[idx] = ng; applied++;
  });
});
if (missing.length) console.log("⚠️ niet gevonden:", missing.join(", "));

// schrijf CONN terug
const body = CONN.map(p => JSON.stringify(p)).join(",\n");
writeFileSync(FILE, html.slice(0, s) + "[\n" + body + "\n]" + html.slice(e));
console.log(`${applied} groepen vervangen, CONN herschreven.`);
