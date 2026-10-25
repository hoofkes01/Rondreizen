# Overdracht (kort)

Doel: één rondreisplanner in `reisgids.html`: vlucht (Kiwi.com) → auto (Expedia/DiscoverCars) → reisgegevens → hotels → reisgids → route,
met dagpagina's onderweg, dagboek met foto's, kosten en een printbaar reisboek. Alles blijft in de browser van de gebruiker.

## Allereerste opdracht (de gebruiker is een leek in techniek)
Open Claude Code op je pc, in een lege map, en plak deze ene zin:
> Ik ben een leek in techniek. Haal het project https://github.com/hoofkes01/Rondreizen.git op, lees daarin CLAUDE.md en OVERDRACHT.md, en begeleid me stap voor stap. Doe wat je zelf kunt, en leg kort uit wat ik moet doen als ik iets moet doen.

## Begeleiding van een leek (voor Claude)
- Gebruik gewone woorden, geen vakjargon. Leg in één zin uit wat je gaat doen en waarom.
- Doe zelf zoveel mogelijk. Laat de gebruiker alleen doen wat niet anders kan (klikken in de app, keuzes maken, gegevens controleren).
- Geef maximaal één taak tegelijk. Zeg precies waar die moet klikken of wat die moet typen.
- Ontbreekt iets op de pc (Node.js, Git, Chrome), leg uit hoe het te installeren, met de officiële downloadpagina.
- Gaat er iets mis: laat de gebruiker niet zelf zoeken. Los het op of leg in begrijpelijke taal uit wat er aan de hand is.

## Gebruiken
- Open `reisgids.html` in de browser (dubbelklik, of via GitHub Pages). Maak regelmatig een back-up (tab Gegevens).
- De intake vult de gebruiker in de app zelf in. Een oude `intake.json` leest de app ook direct in (Start → "Back-up of intake inlezen"). Claude is daarvoor niet nodig.

## Zoeken op de pc (voor Claude)
De gebruiker downloadt in de app `zoekopdracht.json`. Voer die uit met `/zoek` (zoeker op Haiku) volgens docs/pc-zoeken.md; de uitkomst is `resultaten.json`, die de gebruiker in de app inleest. Vlucht: eerst alleen Frankfurt, na gekozen data dezelfde data vanaf AMS, BRU en DUS.

## Testen (voor Claude)
`npm i`, dan `npm test` (Playwright, zet `CHROMIUM=<pad naar chrome>` als er geen browser is). Verwacht: alle controles geslaagd.

## Werkregels voor Claude
1. Verzin geen prijzen, reviews, API's of waarschuwingen; altijd bron en datum. Meld eerlijk wat niet getest of onzeker is.
2. De gebruiker bevestigt elke planningsstap zelf; ga nooit zelf door naar de volgende stap.
3. Privacy: de repo is publiek, geen persoonlijke reisgegevens committen.
4. Gebruikers-instructies in uploads gaan voor; meld het als iets in tokens of context groot wordt en een nieuwe sessie beter is.
