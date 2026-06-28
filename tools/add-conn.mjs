// Voegt nieuwe Verbind Vier-puzzels toe aan de CONN-array in de HTML.
// Draait idempotent: markeert toegevoegde puzzels niet apart, dus 1x draaien.
import { readFileSync, writeFileSync } from "node:fs";
const FILE = "remixed-507c05a6.html";

// lvl 0 = geel (makkelijk) ... 3 = paars (pittig, vaak woordspeling)
const NEW = [
  { groups: [
    { lvl:0, name:"Bestek", words:["VORK","MES","LEPEL","SPATEL"] },
    { lvl:1, name:"Citrusvruchten", words:["CITROEN","SINAASAPPEL","LIMOEN","MANDARIJN"] },
    { lvl:2, name:"Toetsen op je toetsenbord", words:["SHIFT","ENTER","SPATIE","TAB"] },
    { lvl:3, name:"___ + werk", words:["HUIS","VUUR","KUNST","NET"] },
  ]},
  { groups: [
    { lvl:0, name:"Zuivel", words:["KAAS","BOTER","YOGHURT","KWARK"] },
    { lvl:1, name:"Planeten", words:["MERCURIUS","VENUS","MARS","NEPTUNUS"] },
    { lvl:2, name:"Schaakstukken", words:["TOREN","LOPER","PAARD","KONING"] },
    { lvl:3, name:"___ + vis", words:["ZWAARD","GOUD","STOK","ZWEM"] },
  ]},
  { groups: [
    { lvl:0, name:"Delen van je gezicht", words:["NEUS","WANG","KIN","VOORHOOFD"] },
    { lvl:1, name:"Dagen van de week", words:["MAANDAG","DINSDAG","ZONDAG","VRIJDAG"] },
    { lvl:2, name:"Edelstenen", words:["DIAMANT","ROBIJN","SMARAGD","SAFFIER"] },
    { lvl:3, name:"___ + huis", words:["POP","ZIEKEN","RAAD","WAREN"] },
  ]},
  { groups: [
    { lvl:0, name:"Iets te drinken", words:["WATER","MELK","THEE","KOFFIE"] },
    { lvl:1, name:"Italiaanse gerechten", words:["PIZZA","PASTA","RISOTTO","LASAGNE"] },
    { lvl:2, name:"Kleuren", words:["TURKOOIS","MAGENTA","OKER","INDIGO"] },
    { lvl:3, name:"___ + stok", words:["WANDEL","BEZEM","HOCKEY","TOVER"] },
  ]},
  { groups: [
    { lvl:0, name:"Op de borrelplank", words:["BITTERBAL","NOOTJES","OLIJVEN","KAASBLOKJE"] },
    { lvl:1, name:"Koffievarianten", words:["ESPRESSO","CAPPUCCINO","LATTE","MACCHIATO"] },
    { lvl:2, name:"Werk in het restaurant", words:["KOK","OBER","GASTHEER","AFWASSER"] },
    { lvl:3, name:"___ + kaart", words:["MENU","WIJN","ANSICHT","SPEEL"] },
  ]},
  { groups: [
    { lvl:0, name:"Huisdieren", words:["HOND","KAT","KONIJN","HAMSTER"] },
    { lvl:1, name:"Zeezoogdieren", words:["WALVIS","DOLFIJN","ZEEHOND","ORKA"] },
    { lvl:2, name:"Sterrenbeelden", words:["RAM","STIER","LEEUW","SCHORPIOEN"] },
    { lvl:3, name:"___ + vogel", words:["ROOF","ZANG","TREK","SPOT"] },
  ]},
  { groups: [
    { lvl:0, name:"Weertypes", words:["HAGEL","ZON","WIND","MIST"] },
    { lvl:1, name:"Maanden", words:["MAART","MEI","JULI","OKTOBER"] },
    { lvl:2, name:"Muziekinstrumenten", words:["GITAAR","PIANO","VIOOL","TROMPET"] },
    { lvl:3, name:"___ + bui", words:["REGEN","LACH","STORT","HUIL"] },
  ]},
  { groups: [
    { lvl:0, name:"Fruit", words:["AARDBEI","BANAAN","KERS","DRUIF"] },
    { lvl:1, name:"Europese landen", words:["SPANJE","ITALIE","FRANKRIJK","ZWEDEN"] },
    { lvl:2, name:"Medisch specialist", words:["CHIRURG","RADIOLOOG","CARDIOLOOG","UROLOOG"] },
    { lvl:3, name:"___ + steen", words:["GRAF","MIJL","BAK","SLIJP"] },
  ]},
  { groups: [
    { lvl:0, name:"In de badkamer", words:["TANDENBORSTEL","HANDDOEK","ZEEP","SPIEGEL"] },
    { lvl:1, name:"Boomsoorten", words:["EIK","BEUK","BERK","WILG"] },
    { lvl:2, name:"Nederlandse schilders", words:["REMBRANDT","VERMEER","MONDRIAAN","JANSTEEN"] },
    { lvl:3, name:"___ + paal", words:["GRENS","SCHAND","TOTEM","DOEL"] },
  ]},
  { groups: [
    { lvl:0, name:"Ontbijt", words:["CROISSANT","JUS","EI","MUESLI"] },
    { lvl:1, name:"Soorten brood", words:["STOKBROOD","VOLKOREN","ROGGE","KRENTENBROOD"] },
    { lvl:2, name:"Sauzen", words:["MAYONAISE","KETCHUP","MOSTERD","AIOLI"] },
    { lvl:3, name:"___ + glas", words:["WIJN","BIER","BRILLEN","VERGROOT"] },
  ]},
  { groups: [
    { lvl:0, name:"Vervoer", words:["AUTO","FIETS","BUS","TREIN"] },
    { lvl:1, name:"Balsporten", words:["VOETBAL","TENNIS","GOLF","BASKETBAL"] },
    { lvl:2, name:"Dansen", words:["WALS","TANGO","SALSA","FLAMENCO"] },
    { lvl:3, name:"___ + weg", words:["SNEL","SPOOR","LUCHT","OM"] },
  ]},
  { groups: [
    { lvl:0, name:"Kledingstukken", words:["BROEK","TRUI","JAS","ROK"] },
    { lvl:1, name:"Schoeisel", words:["LAARS","SANDAAL","PUMP","GYMSCHOEN"] },
    { lvl:2, name:"Stoffen", words:["KATOEN","WOL","ZIJDE","LINNEN"] },
    { lvl:3, name:"___ + tas", words:["HAND","SCHOUDER","AKTE","BOODSCHAPPEN"] },
  ]},
  { groups: [
    { lvl:0, name:"Groente", words:["WORTEL","BROCCOLI","SPINAZIE","PAPRIKA"] },
    { lvl:1, name:"In de soep", words:["BOUILLON","VERMICELLI","BALLETJES","PREI"] },
    { lvl:2, name:"Smaken", words:["ZOET","ZUUR","ZOUT","BITTER"] },
    { lvl:3, name:"___ + pan", words:["KOEK","STEEL","BRAAD","WOK"] },
  ]},
  { groups: [
    { lvl:0, name:"Op kantoor", words:["BUREAU","STOEL","COMPUTER","PRINTER"] },
    { lvl:1, name:"Schrijfgerei", words:["PEN","POTLOOD","STIFT","MARKER"] },
    { lvl:2, name:"Vormen", words:["CIRKEL","VIERKANT","DRIEHOEK","OVAAL"] },
    { lvl:3, name:"___ + lijst", words:["WACHT","PRIJS","BOEKEN","NAAM"] },
  ]},
  { groups: [
    { lvl:0, name:"Een menu bij Bregje", words:["VOORGERECHT","HOOFDGERECHT","NAGERECHT","BIJGERECHT"] },
    { lvl:1, name:"Cocktails", words:["MOJITO","MARGARITA","NEGRONI","SPRITZ"] },
    { lvl:2, name:"Biersoorten", words:["PILS","WIT","TRIPEL","BOK"] },
    { lvl:3, name:"___ + tafel", words:["EET","SALON","PICKNICK","KLAP"] },
  ]},
  { groups: [
    { lvl:0, name:"Aan zee", words:["GOLF","STRAND","SCHELP","ZAND"] },
    { lvl:1, name:"Vissoorten", words:["HARING","KABELJAUW","ZALM","MAKREEL"] },
    { lvl:2, name:"Vaartuigen", words:["KANO","ZEILBOOT","VEERPONT","SLOEP"] },
    { lvl:3, name:"___ + bad", words:["ZONNE","MODDER","SCHUIM","VOET"] },
  ]},
  { groups: [
    { lvl:0, name:"Op de boerderij", words:["KOE","SCHAAP","VARKEN","KIP"] },
    { lvl:1, name:"Granen", words:["TARWE","GERST","HAVER","ROGGE"] },
    { lvl:2, name:"Op het land", words:["TRACTOR","PLOEG","MAAIER","DORSMACHINE"] },
    { lvl:3, name:"___ + land", words:["BOUW","WEI","VADER","EI"] },
  ]},
  { groups: [
    { lvl:0, name:"Winterse kou", words:["VORST","IJS","KOU","SLEE"] },
    { lvl:1, name:"Wintersport", words:["SKIEN","SCHAATSEN","SNOWBOARDEN","RODELEN"] },
    { lvl:2, name:"Warm drankje", words:["CHOCOMEL","GLUHWEIN","THEE","KOFFIE"] },
    { lvl:3, name:"___ + jas", words:["REGEN","WINTER","BAD","STOF"] },
  ]},
  { groups: [
    { lvl:0, name:"Gevoelens", words:["BLIJ","BOOS","BANG","VERDRIETIG"] },
    { lvl:1, name:"Hoe wijn smaakt", words:["DROOG","FRUITIG","KRACHTIG","ZACHT"] },
    { lvl:2, name:"Noten van de toonladder", words:["DO","RE","MI","FA"] },
    { lvl:3, name:"___ + spel", words:["TONEEL","SCHADUW","KAART","BORD"] },
  ]},
  { groups: [
    { lvl:0, name:"In de klas", words:["BORD","KRIJT","SCHRIFT","BOEK"] },
    { lvl:1, name:"Schoolvakken", words:["AARDRIJKSKUNDE","BIOLOGIE","GESCHIEDENIS","WISKUNDE"] },
    { lvl:2, name:"Rekenen", words:["PLUS","MIN","KEER","DELEN"] },
    { lvl:3, name:"___ + meester", words:["SCHOOL","GROOT","BOUW","KAPEL"] },
  ]},
  { groups: [
    { lvl:0, name:"In de gereedschapskist", words:["WATERPAS","DUIMSTOK","MOERSLEUTEL","SCHROEVENDRAAIER"] },
    { lvl:1, name:"Metalen", words:["IJZER","KOPER","ZILVER","GOUD"] },
    { lvl:2, name:"Bevestigingsmateriaal", words:["SCHROEF","BOUT","MOER","NAGEL"] },
    { lvl:3, name:"___ + haak", words:["VIS","WEER","KLEER","SLEEP"] },
  ]},
  { groups: [
    { lvl:0, name:"In het circus", words:["CLOWN","ACROBAAT","TENT","JONGLEUR"] },
    { lvl:1, name:"Roofdieren", words:["LEEUW","TIJGER","BEER","WOLF"] },
    { lvl:2, name:"Geluiden", words:["BOEM","KNAL","PIEP","RATEL"] },
    { lvl:3, name:"___ + pak", words:["ZWEM","TRAININGS","MAAT","DUIK"] },
  ]},
  { groups: [
    { lvl:0, name:"Gedekte tafel", words:["BORD","GLAS","SERVET","BESTEK"] },
    { lvl:1, name:"Kaassoorten", words:["BRIE","GOUDA","CAMEMBERT","ROQUEFORT"] },
    { lvl:2, name:"Toetjes", words:["TIRAMISU","SOESJE","MOUSSE","SORBET"] },
    { lvl:3, name:"___ + lepel", words:["SOEP","THEE","POL","SUIKER"] },
  ]},
  { groups: [
    { lvl:0, name:"Lichaamsdelen", words:["ARM","BEEN","HOOFD","RUG"] },
    { lvl:1, name:"Botten", words:["SCHEDEL","RIB","WERVEL","BEKKEN"] },
    { lvl:2, name:"Organen", words:["HART","LONG","LEVER","NIER"] },
    { lvl:3, name:"___ + been", words:["SCHEEN","DIJ","SLEUTEL","STUIT"] },
  ]},
  { groups: [
    { lvl:0, name:"Bij het kasteel", words:["TOREN","GRACHT","RIDDER","KROON"] },
    { lvl:1, name:"Sprookjesfiguren", words:["HEKS","FEE","REUS","DRAAK"] },
    { lvl:2, name:"Adellijke titels", words:["KONING","HERTOG","GRAAF","BARON"] },
    { lvl:3, name:"___ + brug", words:["OPHAAL","HANG","LOOP","TOL"] },
  ]},
];

const html = readFileSync(FILE, "utf8");
const marker = "const CONN = ";
const i = html.indexOf(marker);
const s = html.indexOf("[", i);
let d = 0, j = s;
for (; j < html.length; j++) { if (html[j] === "[") d++; else if (html[j] === "]") { d--; if (d === 0) break; } }
// j wijst nu naar de afsluitende ]
const before = html.slice(0, j);
const after = html.slice(j); // begint met ]
const addition = NEW.map(p => "\n  " + JSON.stringify(p)).join(",");
const out = before.replace(/\s*$/, "") + "," + addition + "\n" + after;
writeFileSync(FILE, out);
console.log(`Toegevoegd: ${NEW.length} Verbind Vier-puzzels.`);
