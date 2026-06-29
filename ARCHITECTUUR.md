# Architectuur — Bregje Games

Korte naslag over hoe dit project in elkaar zit, zodat we het niet telkens opnieuw hoeven uit te zoeken.

## Het grote plaatje
- **Alles zit in één bestand:** `index.html`. Geen build-stap, geen frameworks, geen
  dependencies. Pure HTML + CSS + JavaScript. Je opent het door te dubbelklikken.
- **Mappen / bestanden:**
  - `tools/` — losse Node-scripts (`.mjs`) om puzzeldata te genereren/valideren. Draai met `node tools/<naam>.mjs`.
  - `staff/` — bronmateriaal voor "Raad het Personeel": de tekeningen + `staff.json`.
  - PWA-bestanden (online-versie): `manifest.webmanifest`, `sw.js` (service worker, offline),
    `icon-192.png`/`icon-512.png`/`icon-512-maskable.png`/`apple-touch-icon.png`.
  - `ARCHITECTUUR.md` (dit bestand), `WERK-OVERZICHT.md` (changelog).
- **Opslag:** voortgang/stats staan in de browser (`localStorage`) via de helpers `store(key,val)` en
  `load(key,def)`. Niets wordt naar een server gestuurd.
- **Thema's:** licht/donker via CSS-variabelen (`--bg`, `--accent`, `--correct`, …) op `:root` en
  `[data-theme="dark"]`.

## Hoe het bestand is opgebouwd (volgorde)
1. `<style>` — alle CSS, per spel een blok met een commentaarkop (bv. `/* ---------- PIPS ---------- */`).
2. `<header>` — titelbalk met terug/help/stats/thema-knoppen.
3. `<main>` — per spel één `<section class="screen" id="screen-XXX">`. De home is `#screen-home` met
   `.card`-knoppen (`id="card-XXX"`).
4. Overlays (`.overlay` met daarin `.modal`): per spel een help-, stats- en lijst-popup.
5. `<script>` — eerst de **DATA** (grote `const`-arrays), daarna per spel de logica, dan badges, dan
   `showScreen`/navigatie, dan een `init()`-IIFE onderaan die alles laadt.

## Een spel = 6 vaste haakjes
Elk spel (behalve Woordle, dat net iets anders is) volgt hetzelfde stramien. Gebruik **Pips** als
kopieer-voorbeeld. Voor een nieuw spel met prefix `xx`:

1. **Data:** een `const XX = [ … ]` in het DATA-blok bovenin het script.
2. **Home-kaart:** een `<button class="card" id="card-xx">` in `<div class="cards">`.
3. **Scherm:** een `<section class="screen" id="screen-xx">` in `<main>`.
4. **Overlays:** `xx-help`, `xx-stats`, `xx-list` (kopie van Pips, ids aanpassen).
5. **Logica:** een JS-blok met o.a. `xxStart(mode,idx)`, `xxDailyIdx()`, render-functies en `xxWin()`.
   Patroon voor de dagpuzzel: `xxDailyIdx = ((dayNumber()%XX.length)+XX.length)%XX.length`.
6. **Inhaken op het systeem:**
   - `showScreen(name)` — voeg de titel-regel toe voor jouw scherm.
   - Klik-handler naast de andere `card-...`-handlers: `showScreen('xx')` + eerste keer initialiseren.
   - `btnHelp`/`btnStats` — voeg jouw scherm toe aan de ternary/if-keten.
   - **`gameList()`** — voeg `{id:'xx', label:'…', done:xxDone.size, total:XX.length}` toe. Hiermee doet
     het spel **automatisch** mee in de medailles (`medalInfo`, `checkBadges`, `renderBadges`) en de
     **Grootmeester**-telling. Geen aparte badge-code nodig.
   - `init()` — laad `xxDone`, `xxstats`, `xxHelpSeen` net als de andere spellen.

## Belangrijke gedeelde functies (in het script)
- `store(key,val)` / `load(key,def)` — opslaan/laden (localStorage).
- `showScreen(name)` — wisselt van scherm (zet `.active` op de juiste `<section>`).
- `dayNumber()` — dagnummer sinds 2024-01-01, basis voor de "puzzel van de dag".
- `shuffle(arr)`, `toast(msg)`, `confetti(opts)`, `show(id)`/`hide(id)` (overlays).
- `gameList()` → `medalInfo()` → `checkBadges()` → `renderBadges()` — het medaille-/badgesysteem.
  Drempels: brons 10, zilver 25, goud = alles. Alle spellen goud = **Grootmeester**.

## De spellen
| Spel | id | Data-const | Bijzonder |
|------|------|-----------|-----------|
| Raad het Woord | `woordle` | `ANSWERS_RAW`/`VALID_RAW` | Wordle-kloon, dagwoord uit grote pool |
| Verbind Vier | `connect` | `CONN` | 4 groepen van 4 |
| Woordlijn | `strands` | `STRANDS` | letterrooster + spangram, SVG-lijnen |
| Mini Kruiswoord | `mini` | `MINI` | 5×5 tegen de klok |
| Pips | `pips` | `PIPS` | domino's op gekleurde gebieden |
| Raad het Personeel | `staff` | `STAFF` | tekening → naam typen (zie hieronder) |

## Raad het Personeel (`staff`)
- **Data** staat tussen de markers `/* STAFF:START */ … /* STAFF:END */` in het script en wordt
  **gegenereerd**, niet met de hand bewerkt.
- **Bron:** map `staff/` met de tekeningen + `staff.json` (lijst van `{file,name,aliases,role,age}`).
- **Genereren:** `node tools/staff-build.mjs`. Dat script comprimeert elke foto met `sips` (max 440px,
  JPEG kwaliteit 70), zet 'm als base64 in de HTML, en vult het STAFF-blok. Ontbreekt een foto, dan komt
  er een placeholder-tekening, zodat het spel altijd werkt. Foto toevoegen + script opnieuw draaien
  vervangt de placeholder.
- **Spel:** speler typt de naam. Matching is ongevoelig voor hoofdletters/spaties/accenten en accepteert
  `aliases` (bijnamen). Hint onthult eerst de functie, daarna letter voor letter de naam. Bij goed:
  naam + functie + leeftijd + confetti.

## Online zetten (PWA + GitHub Pages)
- De app is een **PWA**: `manifest.webmanifest` (naam/icoon/kleuren) + `sw.js` (service worker die de
  app cachet → installeerbaar op de telefoon en werkt offline). De `<head>` van `index.html` heeft de
  manifest- en iOS-tags; onderaan staat de SW-registratie + een "Installeer"-knop (Android/Chrome).
- Service workers werken **alleen via http(s)**, niet via `file:`. Dubbelklikken blijft werken (de SW
  wordt dan netjes overgeslagen); installeren/offline werkt pas op de online https-link.
- **Hosting:** GitHub Pages, vanaf `main` / root. Updaten = committen + `git push` → site ververst.
  **Belangrijk bij elke release:** hoog de cache-versie in `sw.js` op (`VERSION = 'bregje-vN'`) zodat
  collega's de nieuwe versie binnenkrijgen i.p.v. de oude uit de cache.
- Iconen hergenereren (uit het logo) kan met headless Chrome; zie de git-historie van de icon-commit.

## Verifiëren
- `node tools/validate.mjs` — checkt de puzzels van de woord-/cijferspellen.
- JS-syntax van het hele bestand snel checken: het `<script>`-blok eruit knippen en `node --check` erop.
- In de browser: dubbelklik het HTML-bestand en speel elk spel een potje.
