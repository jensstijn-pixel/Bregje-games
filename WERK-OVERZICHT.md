# Werkoverzicht — nacht van 29 → 30 juni 2026

Goeiemorgen Jens! 👋 Hieronder precies wat ik vannacht heb gedaan.

## TL;DR
- ✅ **Git opgezet** — alles in versiebeheer, elke stap los terug te draaien.
- ✅ **Fase 1 — uiterlijk moderner & speelser** (af, maar visueel nog niet door mij bekeken — zie ⚠️).
- ✅ **Fase 2 — puzzels naar 50 per spel** (af én geverifieerd):
  - Verbind Vier: 26 → **51**
  - Woordlijn: 25 → **50**
  - Mini Kruiswoord: 25 → **50**
- ✅ **Controle-scripts gebouwd** die elke puzzel automatisch checken.

> ✅ **Update: ik heb alles uiteindelijk WÉL in de browser kunnen bekijken** (de extensie
> verbond later alsnog). Lichte én donkere modus, het nieuwe logo, de vier spellen en een
> 5-koloms Woordlijn-puzzel: allemaal gecontroleerd en in orde. Daarbij vond ik nog **één
> echt zichtbaar probleem** dat ik meteen heb gefixt (zie hieronder). De **puzzels** zijn
> daarnaast met scripts hard geverifieerd. Kijk gerust zelf rond — bevalt iets niet, dan
> draai ik het in één tel terug (alles staat in git).

---

## Zo bekijk je het
1. Dubbelklik `remixed-507c05a6.html` → opent in je browser.
2. Begin op het startscherm; speel van elk spel een potje (let op de nieuwe kleuren,
   rondere vakjes en de **confetti** als je wint 🎉).
3. Iets terugdraaien? Vraag het me, of we kijken samen in git.

---

## Fase 1 — Uiterlijk (moderner & speelser) ✅
- **Frisser kleurenpalet** (lichte én donkere modus): warmer en levendiger, met een
  duidelijke oranje accentkleur en een tweede (turquoise) accent.
- **Rondere, zachtere vormen**: tegels, kaarten, knoppen en toetsen hebben grotere
  afgeronde hoeken → moderner gevoel.
- **Meer beweging**: verende ("springy") animaties op kaarten en tegels.
- **Confetti bij winst** in alle vier de spellen, en een extra grote knal bij
  **Grootmeester** 👑. (Respecteert "minder beweging" in je systeeminstellingen.)
- **Nieuw, licht logo**: het oude logo was een afbeelding van **310 KB** (meer dan de helft
  van het bestand!). Vervangen door een speels wordmark — "BREGJE" als gekleurde tegeltjes
  die bij het openen inpoppen. Het bestand is daardoor **303 KB lichter** (sneller op je
  telefoon) en alles is nu pure code (makkelijker aan te passen).
- Kleine fix: header zei "twee spellen", nu "vier spellen".

## Fase 2 — Puzzels ✅
Aanpak: ik heb eerst **gereedschap** gebouwd zodat geen enkele nieuwe puzzel stuk kan zijn.
- **Verbind Vier (+25, nu 51):** met de hand geschreven, veel leuke "woordspeling"-groepen
  (paars) en een paar **horeca-knipogen** (borrelplank, koffievarianten, "Een menu bij
  Bregje", biersoorten…). Geverifieerd: 4 groepen, 16 unieke woorden per puzzel.
- **Woordlijn (+25, nu 50):** gemaakt met een zelfgeschreven **solver** die per thema een
  geldig rooster zoekt (woorden aaneengesloten, elke letter precies 1×, spangram van rand
  tot rand). 25 nieuwe thema's (Bakkerij, Zeedieren, Ruimtevaart, Brandweer, Op het terras…).
  Onafhankelijk nagecheckt: 0 fouten.
- **Mini Kruiswoord (+25, nu 50):** roosters automatisch gevuld met een **invuller** die
  alleen echte woorden uit de woordenlijst van het spel gebruikt (dus elk across- én
  down-woord bestáát gegarandeerd). De **aanwijzingen heb ik met de hand geschreven.**

**Bug die ik onderweg vond en heb gefixt:** de Woordlijn-roosters gingen uit van precies 6
kolommen. Een paar nieuwe puzzels hebben er 5 → die zou je verkeerd hebben zien staan.
Nu zet de code de kolombreedte dynamisch; alle formaten kloppen.

---

## Wat ik tijdens het bekijken nog heb gefixt
- **Kaart-titels onleesbaar in donkere modus**: de spelkaarten zijn knoppen, en knoppen
  erven de tekstkleur niet — de titels werden zwart op een donkere kaart. Opgelost (dit zat
  er al vóór vannacht in, maar viel nu pas op).
- **Woordlijn met 5 kolommen**: rendert nu correct (zie Fase 2).

## Even checken / aandachtspunten (eerlijk)
1. **Mini-aanwijzingen**: de woorden zijn gegarandeerd echt, maar een paar zijn wat formeel
   (bijv. *grand*, *wade* = kuit, *meent*). Lees de aanwijzingen gerust kritisch; zie je
   er een die niet lekker loopt, noem het nummer en ik pas 'm aan.
3. **Verbind Vier**: even snel de groepen scannen of ze logisch voelen — taal is subjectief.
4. Niets aan de **Woordle** (Raad het Woord) gewijzigd; die had al 1000 woorden.

## Hoe de controle-tools werken (in map `tools/`)
- `node tools/validate.mjs` — checkt álle puzzels in het spel (draai dit na elke wijziging).
- De overige scripts (`strands-solver`, `mini-fill`, …) zijn waarmee ik de nieuwe puzzels
  heb gemaakt; handig als we er later méér willen toevoegen.

## Daarna (jouw keuze vanochtend)
- **Online zetten** (gratis, eigen linkje zodat collega's het op hun telefoon openen), of
- **Nieuwe gamemodus** toevoegen.
Zeg maar waar je zin in hebt, dan pakken we dat op.
