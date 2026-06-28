# Werkoverzicht — nacht van 29 → 30 juni 2026

Goeiemorgen Jens! Hieronder wat ik vannacht heb gedaan. Ik werk van boven naar beneden;
dit bestand werk ik bij terwijl ik bezig ben, dus de status onderaan is het meest actueel.

## TL;DR (lees dit eerst)
- ✅ **Git opgezet** — alles staat veilig in versiebeheer, elke stap is terug te draaien.
- ✅ **Controle-script gebouwd** (`tools/validate.mjs`) dat elke puzzel automatisch checkt.
- 🔄 **Fase 1 — uiterlijk moderner/speelser** (bezig)
- 🔄 **Fase 2 — puzzels naar 50 per spel** (bezig)

> ⚠️ **Belangrijk & eerlijk:** de browser-extensie was niet verbonden, dus ik kon het
> uiterlijk **niet zelf bekijken**. De CSS-wijzigingen zijn zorgvuldig en veilig (en via
> git terug te draaien), maar **visueel bevestigen doen we samen** vanochtend. De
> **puzzels** heb ik wél hard geverifieerd met het controle-script.

---

## Hoe je het bekijkt
- Open `remixed-507c05a6.html` in je browser (dubbelklik).
- Wil je een eerdere versie terug? Alles staat in git. Vraag me en ik draai het terug.
- Het controle-script draaien: `node tools/validate.mjs`

---

## Detail per onderdeel

### Stap 0 — Veiligstellen ✅
- `git init` + baseline-commit van de werkende versie.
- Backup-kopie `.baseline-backup.html` (buiten git) als extra vangnet.

### Controle-script ✅
- `tools/validate.mjs` haalt de puzzeldata uit de HTML en controleert:
  - **Verbind Vier:** 4 groepen, levels 0–3, 16 unieke woorden.
  - **Woordlijn:** rooster volledig + precies één keer bedekt, paden aangrenzend en
    spellen het juiste woord, precies één spangram dat van rand tot rand loopt.
  - **Mini:** rooster 5×5, clue-nummers matchen de woorden, geen lege aanwijzingen.
- Resultaat op de bestaande 25×3 puzzels: **alles in orde, 0 fouten.**

### Fase 1 — Uiterlijk (moderner/speelser) 🔄
(bijwerken terwijl ik bezig ben)

### Fase 2 — Puzzels naar 50 per spel 🔄
(bijwerken terwijl ik bezig ben)

---

## Wat NIET af is / aandachtspunten
(bijwerken aan het eind — eerlijk overzicht van wat nog moet)
