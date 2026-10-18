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

    node scripts/plan.mjs --plaats=Denver --data=2027-03-10:2027-04-02,2027-03-17:2027-04-09
