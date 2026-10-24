# Rondreisplanner

> Vluchten zoeken gebeurt nu in Get-Roam en autohuur in DiscoverCars, via `reisgids.html`. De Skyscanner-planner hieronder is vervallen en alleen bewaard als naslag.

`index.html` is de planner (open in de browser). De scripts in `scripts/` zoeken op Skyscanner via een
zichtbare Chrome op je eigen pc. Afspraken, regels en werkwijze staan in `CLAUDE.md`.

## Starten op de pc

    git clone https://github.com/hoofkes01/Rondreizen.git
    cd Rondreizen
    npm i
    npx playwright install chromium
    npm test
    claude

Zeg tegen Claude: "Lees CLAUDE.md en voer de ijking uit (eerste keer op de pc)."

## Zoeken

    node scripts/plan.mjs --intake=intake.json

Of zonder formulier: `node scripts/plan.mjs --plaats=Denver --van=2027-03-01 --tot=2027-05-31`

## Reisgids (intake, route, kosten, dagboek, reisboek)

Open `reisgids.html` in de browser (of via GitHub Pages als die aan staat). Alles wat u invult blijft in uw eigen browser;
niets wordt in deze openbare repo opgeslagen. Maak regelmatig een back-up (tab Gegevens). Het reisboek maakt u met
"Afdrukken / opslaan als PDF" op het tabblad Reisboek. Bronnen en voorwaarden: `docs/databronnen.md`.

    npm i
    CHROMIUM=/pad/naar/chrome npm run test:gids   # CHROMIUM alleen nodig als Playwright zijn eigen browser niet heeft
