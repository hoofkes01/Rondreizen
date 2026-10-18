# Overdracht naar de pc (kort, stap voor stap)

Branch: `main`. Stand: 18 oktober 2026.
Doel: rondreisplanner in 4 stappen (vluchten, autohuur, rondreisvoorstel, reisgids). Nu: stap 1, vluchten.

## Werkregels voor Claude (lees dit eerst)
1. **Eén stap tegelijk.** Na elke stap: STOP, meld de uitkomst in maximaal 10 regels (gelukt / niet gelukt / wat afweek), en wacht op de
   bevindingen van de gebruiker. Begin nooit zelf aan de volgende stap.
2. **Zuinig met tokens.**
   - Lees geen hele bestanden of resultaatpagina's. Gebruik `grep`, `head`, of lees alleen de nodige regels.
   - Lees `docs/*.md` alleen voor het onderdeel waar je nu aan werkt. Lees `index.html` niet (groot); de scripts lezen daar zelf uit.
   - Laat scripts de pagina's uitlezen. Rapporteer alleen de uitkomst (tabel), niet de ruwe tekst.
   - Geen schermafbeeldingen lezen als tekst genoeg is.
3. **Model.** Bouwen met het sterkere model (Sonnet). Scripts draaien laat je door de sub-agent `zoeker` doen (Haiku, .claude/agents/zoeker.md):
   zeg "laat de zoeker dit draaien". De scripts zelf gebruiken geen AI en kosten geen tokens. Schakel naar een sterker model voor: de uitleesfunctie `leesAanbod` aanpassen (stap 1B), een uitkomst beoordelen,
   hotelafwegingen, en bij fouten die je met Haiku niet oplost.
4. **Eerlijk melden** wat niet getest of onzeker is. Geen gokken met prijzen; altijd bron en datum.
5. **Robotcontrole** laat de gebruiker zelf afronden. Nooit omzeilen.
6. **Privacy:** repo is publiek. Geen persoonlijke reisgegevens committen (`intake.json`, `resultaten/`, `reizen/` staan in `.gitignore`).
7. Nieuwe sessie starten als de context groot wordt (meld dat), of na elke afgeronde stap.

## Stap 0: installeren (Haiku volstaat)
```
git clone https://github.com/hoofkes01/Rondreizen.git && cd Rondreizen
npm i && npx playwright install chromium && npm test
```
Verwacht: "Alle tests geslaagd". **STOP en meld het resultaat.**

## Stap 1A: één testzoekopdracht (Haiku volstaat)
`node scripts/zoek.mjs FRA LIS 2027-03-10 2027-04-02`
Gebruiker: in het Chrome-venster de robotcontrole afronden en het bagagefilter instellen (1 ruimbagage 23 kg per persoon). Geen Enter nodig; het script wacht zelf (bagage: 45 seconden, aanpasbaar met BAGAGE_WACHT).
Claude toont alleen: aantal aanbiedingen, beste prijs, vliegtijd, rechtstreeks ja/nee. Gebruiker vergelijkt met het scherm.
**STOP. Wacht op de bevindingen van de gebruiker.**

## Stap 1B: uitlezen verbeteren (sterker model)
Alleen als 1A afwijkt. Pas `leesAanbod` in `scripts/lib.mjs` aan op de echte tekst in `resultaten/*.txt`. Lees alleen het relevante
stuk van het .txt-bestand. Voeg die tekst toe als testgeval in `scripts/test.mjs`, draai `npm test`, herhaal 1A tot het klopt.
Controleer ook: prijs per persoon of totaal (`--prijs`), vliegtijd van heen én terug, en of de prijs de koffers bevat.
**STOP. Gebruiker bevestigt.**

## Stap 1C: korte periode (Haiku volstaat)
`node scripts/plan.mjs --plaats=Denver --van=2027-03-01 --tot=2027-03-21`
Meld vooraf het aantal pagina's. Vergelijk met de Skyscanner-kalender: vindt het script dezelfde goedkope data?
**STOP. Gebruiker bevestigt.**

## Stap 1D: volledige run met intake (Haiku volstaat)
Gebruiker vult `intake.html` in, bewaart als `intake.json`. Run: `node scripts/plan.mjs --intake=intake.json`.
Claude toont alleen: goedkoopste data, top 10, prijsverschil per vertrekpunt, met link naar het overzicht. Beperk pagina's met `--max2`.
**STOP. Gebruiker beoordeelt de uitkomst en vergelijkt met zijn andere app.**

## Stap 1E: aanvullingen vluchten (sterker model)
Open jaw, maaltijden en stoelinformatie. Alleen starten na akkoord op 1A t/m 1D.

## Stap 5: eindcheck met Opus (als alles af is)
Start een nieuwe sessie met Opus (`/model`). Opdracht: *"Doe een eindcheck van Rondreizen. Lees CLAUDE.md en OVERDRACHT.md."*
Opus controleert, en meldt per punt gevonden / niet gevonden / niet te controleren (alleen bevindingen, geen herschrijving):
- Klopt de logica van de regels (14 uur, € 200, fasen, straal) met CLAUDE.md? Zijn er randgevallen die falen? Draai `npm test`.
- Staan er dubbele of tegenstrijdige afspraken in CLAUDE.md, docs/ en OVERDRACHT.md?
- Privacy: staat er persoonlijke informatie of een boekingsgegeven in de repo of in de geschiedenis? Is de repo publiek terwijl dat niet mag?
- Foutgevoelige plekken: uitlezen, prijs per persoon of totaal, valuta, datums over de jaarwisseling.
- Is alles zonder Claude te gebruiken (zie "Zonder Claude werken")?
Opus beoordeelt NIET of prijzen kloppen; dat doet de gebruiker zelf. De check bewijst niet dat de uitkomsten goed zijn.

## Stap 2: autohuur, 3: rondreisvoorstel, 4: reisgids
Pas starten als de gebruiker stap 1 heeft goedgekeurd. Wensen staan in `docs/autohuur.md`, `docs/hotels.md`, `docs/reisgids.md`.
Elke stap eindigt met testen en bevindingen van de gebruiker voordat de volgende begint.

## Wie beoordeelt wat
- De gebruiker beoordeelt de prijzen en kiest. Claude toont en legt uit, maar neemt geen beslissing over boeken.
- Claude geeft nooit alleen een conclusie: altijd de link, de gebruikte regels en het bewaarde ruwe bestand erbij, zodat jij het zelf kunt nakijken.
- `plan.mjs` schrijft `resultaten/overzicht-<plaats>.md` met de top 15, links en ruwe bestanden. Dat lees je zonder Claude.

## Zonder Claude werken
- Planner: open `index.html` en `intake.html` in de browser. Dat werkt volledig lokaal.
- Zoeken: `node scripts/plan.mjs --intake=intake.json` draait zonder AI. Lees daarna `resultaten/overzicht-<plaats>.md`.
- Je hebt geen API-sleutel nodig en niets in de scripts roept een AI-model aan.

## Vaste zoekregels (samenvatting)
- 2 volwassenen, 1 koffer 23 kg p.p., reisduur 21 tot 25 dagen, vertrek FRA / DUS / AMS / BRU.
- Fase 1 (alleen Frankfurt, binnen opgegeven periode): grove scan elke 7 dagen, verfijnen, reisduur, luchthavens binnen 500 km.
- Fase 2 (pas daarna, gekozen data): alle vier de vertrekpunten naar alle aankomsten binnen 1000 km, met prijsverschil per vertrekpunt.
- Vliegtijd maximaal 14 uur per enkele reis. Rechtstreeks heeft voorkeur. Overstap alleen als minstens € 200 totaal goedkoper.
- Reiskosten naar luchthaven (30 liter benzine + € 200 parkeren): alleen in de kostenraming van de reisgids.
- Bedragen: punt als duizendtalscheiding, geen decimalen. Kritisch op fouten. Gebruiker is financieel adviseur.

## Open punten (antwoord gebruiker nodig, vóór stap 1E)
1. Open jaw onderzoeken? (voorstel: ja)
2. Stoelen: bij botsing prijs of beenruimte? (voorstel: prijs)
3. 14 uur inclusief wachttijd bij overstap? (voorstel: ja)
4. Hotels bij te dure opties: eerst +35% prijs of eerst lagere waardering (Booking 7 / Google 3,5)? (voorstel: eerst prijs)
5. Literprijs benzine € 2,45 controleren (EU Weekly Oil Bulletin of ANWB).
6. Gids op telefoon via link of als bestand (bepaalt of de repo privé moet).

## Goedkeuringslijst stap 1 (afvinken door gebruiker)
- [ ] Uitlezen klopt bij 3 zoekopdrachten (bijv. Lissabon, Bangkok, Denver)
- [ ] Prijs is voor 2 personen en inclusief koffers
- [ ] Regels (14 uur, € 200) kloppen bij handmatig gecontroleerde gevallen
- [ ] Fase 1 vindt dezelfde goedkope data als de Skyscanner-kalender
- [ ] Fase 2 toont het prijsverschil per vertrekpunt goed
- [ ] Luchthavens in de straal kloppen (VS-lijst is nog niet compleet)
- [ ] Tijd en tokens per zoektocht acceptabel
- [ ] Geen goedkopere optie in de andere app
