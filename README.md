# Rondreisplanner

`index.html` is de planner (open in de browser). De scripts in `scripts/` zoeken op Skyscanner via een
zichtbare Chrome op je eigen pc. Afspraken, regels en werkwijze staan in `CLAUDE.md`.

## Starten op de pc

    git clone https://github.com/hoofkes01/Rondreizen.git
    cd Rondreizen
    git checkout ccr-c57c0a15-ye0aal
    npm i
    npx playwright install chromium
    npm test
    claude

Zeg tegen Claude: "Lees CLAUDE.md en voer de ijking uit (eerste keer op de pc)."

## Zoeken

    node scripts/plan.mjs --intake=intake.json

Of zonder formulier: `node scripts/plan.mjs --plaats=Denver --van=2027-03-01 --tot=2027-05-31`
