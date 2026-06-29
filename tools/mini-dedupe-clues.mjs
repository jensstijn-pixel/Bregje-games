// Maakt alle aanwijzing-teksten in de Mini's uniek.
// In puzzelvolgorde: eerste keer dat een tekst voorkomt blijft staan; elke herhaling
// krijgt een nieuwe, kloppende aanwijzing uit CLUES (per woord). Grids/woorden blijven gelijk.
import { readFileSync, writeFileSync } from "node:fs";
const FILE = "remixed-507c05a6.html";
const html = readFileSync(FILE, "utf8");
const start = html.indexOf("[", html.indexOf("const MINI"));
let dd = 0, end = start;
for (; end < html.length; end++) { if (html[end] === "[") dd++; else if (html[end] === "]") { dd--; if (dd === 0) { end++; break; } } }
const MINI = JSON.parse(html.slice(start, end));
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

// Bank met alternatieve, kloppende aanwijzingen per woord (genoeg voor het aantal herhalingen).
const CLUES = {
  EINDE:["Het slot, de finish","Waar iets ophoudt","De allerlaatste fase","Tegenovergestelde van het begin","Punt waarop het stopt","Afsluiting van een verhaal"],
  EDELE:["Voorname, nobele","Van adellijke afkomst","Ridderlijke, hooggeboren","Grootmoedig van inborst","Verheven en deftig"],
  TEST:["Proef of toets","Uitprobeersel","Controle of iets werkt","Examentje"],
  ELK:["Ieder afzonderlijk","Een voor een, stuk voor stuk"],
  ELKE:["Iedere (… dag opnieuw)","Stuk voor stuk","Zonder uitzondering allemaal"],
  ADRES:["Straat en huisnummer","Waar de post heen moet","Woonplek op de envelop","Vindplaats van een huis"],
  IDEE:["Inval of plan","Goede gedachte","Plotselinge inval","Wat je opeens bedenkt","Plannetje in je hoofd","Bedenksel","Geestelijke vondst","Voorstel dat opkomt"],
  RARE:["Vreemde, gekke","Niet normale","Eigenaardige","Zonderlinge"],
  OLIE:["Om in te bakken","Smeermiddel voor de motor","Vloeistof uit een olijf","Komt uit de grond (… boring)"],
  EEN:["Het getal na nul","Het cijfer 1","Onbepaald lidwoord"],
  REEDS:["Al, voorheen","Eerder al","Nu al; alvast"],
  REDE:["Toespraak; ook: verstand","Speech voor publiek","Gezond verstand"],
  ARIA:["Solostuk in een opera","Zangsolo op het toneel","Operasolo","Lied voor één zanger","Beroemd stuk uit een opera"],
  TENT:["Kampeeronderkomen van doek","Slaap je in op de camping","Onderkomen van zeildoek","Zet je op een kampeerplaats","Onderdak met haringen en stokken"],
  ALLEE:["Brede laan met bomen","Statige bomenlaan","Oprijlaan met bomen"],
  TEEN:["Vinger aan je voet","Eindigt onderaan in een nagel","Heb je er tien van, onderaan"],
  ALERT:["Oplettend, waakzaam","Scherp en bij de les","Op zijn hoede"],
  ERMEE:["Daar … (= met dat)","Daarmee, met dat ding","Hou … op! (stoppen)"],
  ZWERM:["Grote groep bijen of vogels","Wolk van insecten of vogels"],
  PADEN:["Wandelroutes door het bos","Smalle wegen om over te lopen"],
  OVER:["Voorbij; aan de overkant","Afgelopen; ook: naar de andere kant"],
  TERM:["Vakwoord of begrip","Vakuitdrukking"],
  NARE:["Vervelende, akelige","Onaangename"],
  SAMEN:["Met elkaar, niet alleen","Gezamenlijk"],
  NET:["Zojuist; ook: om vis te vangen","Keurig; of: zojuist gebeurd"],
  MOTIE:["Voorstel in de Tweede Kamer","Stemvoorstel in de politiek"],
  ROOD:["Kleur van bloed","Kleur van een rijpe tomaat"],
  MOTEL:["Hotel langs de snelweg","Overnachtingsplek voor automobilisten"],
  KILO:["Duizend gram","Maat van een zak aardappelen"],
  TEEF:["Vrouwtjeshond","Vrouwelijke hond"],
  LANGE:["Niet korte","Tegenovergestelde van korte"],
  DIEPE:["Niet ondiepe","Ver naar beneden reikende"],
  MEENT:["Denkt, is van mening (hij …)","Bedoelt het serieus (hij … het)","Is van oordeel (hij … van wel)"],
  EET:["Neemt voedsel","Nuttigt een maaltijd","Doet zich te goed"],
  LIEVE:["Aardig en zacht","Vriendelijke en zoete"],
  PEN:["Waarmee je schrijft","Schrijfgerei met inkt","Vulpen of balpen","Pak je om te tekenen"],
  EVEN:["Heel kort; ook: deelbaar door twee","Eventjes; niet oneven"],
  RAKET:["Voertuig dat de ruimte in vliegt","Vliegt de ruimte in","Lanceert naar de maan","Vuurpijl naar de sterren"],
  ARENA:["Strijdperk; grote sportzaal","Stadion voor wedstrijden"],
  WAKEN:["Wakker blijven om te bewaken","'s Nachts de wacht houden"],
  KWART:["Een vierde deel","25 procent"],
  HARDE:["Niet zachte","Stevige, onbuigzame"],
  ETEN:["Voedsel; aan tafel gaan","Voedsel tot je nemen","Een maaltijd nuttigen","Wat op je bord ligt"],
  AMEN:["Slotwoord van een gebed","Zo zij het, na het bidden"],
  HARE:["Van haar (bezittelijk)","Het … (= dat van haar)"],
  VUIST:["Gebalde hand","Hand klaar om te slaan"],
  RAAR:["Vreemd, gek","Niet gewoon"],
  TWEE:["Het getal na één","Eén plus één"],
  AARD:["Karakter, soort","Inborst, natuur"],
  OPEN:["Niet dicht","Geopend"],
  GIN:["Sterke drank in een gin-tonic","Jeneverachtige drank"],
  DIEET:["Aangepast eetpatroon om af te vallen","Lijnen via je voeding"],
  REGIO:["Streek, gebied","Landsdeel"],
  OGEN:["Waarmee je kijkt (meervoud)","Twee … in je gezicht"],
  OMA:["Moeder van je vader of moeder","Grootmoeder"],
  ARTS:["Dokter","Medicus in het ziekenhuis"],
  BUREN:["Mensen die naast je wonen","Je naasten in de straat"],
  GRENS:["Lijn tussen twee landen","Scheiding tussen landen"],
  HAAR:["Groeit op je hoofd","Zit op je hoofd; of: van haar"],
  ENIGE:["Als enige; ook: heel leuk","De enige die er is"],
  OPENT:["Maakt open","Doet van het slot"],
  UNIE:["Verbond, bijv. de Europese …","Samenwerkingsverband van landen"],
  TEN:["… slotte; … minste","… einde raad; … slotte"],
  OME:["Broer van je vader, informeel","Ome … (oom, informeel)"],
  ERGE:["Heel nare, vervelende","Zeer vervelende"],
  TAK:["Zijtak van een boom","Houten arm van een boom","Deel van een boom met bladeren"],
};

const used = new Set();
const ran = [];
let changes = 0;
MINI.forEach((p, pi) => {
  entries(p).forEach(e => {
    const cur = p[e.dir][e.num];
    if (!used.has(cur)) { used.add(cur); return; }
    // collision -> kies nieuwe uit bank
    const bank = CLUES[e.word] || [];
    const next = bank.find(c => !used.has(c));
    if (!next) { ran.push(`${e.word} (M${pi+1})`); return; }
    p[e.dir][e.num] = next; used.add(next); changes++;
  });
});

if (ran.length) { console.log("⚠️ Geen alternatief meer voor:", ran.join(", ")); }
console.log(`${changes} aanwijzingen vervangen.`);

const addition = MINI.map(p => JSON.stringify(p)).join(",\n");
writeFileSync(FILE, html.slice(0, start) + "[\n" + addition + "\n]" + html.slice(end));
console.log("MINI-array herschreven.");
