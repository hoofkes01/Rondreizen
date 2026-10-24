# Rondreisplanner – afspraken

De hele planner is één app: `reisgids.html` (geen build, gegevens alleen in de browser). Vluchten zoeken gebeurt in **Get-Roam**
(https://get-roam.com/flexible-search), autohuur in **DiscoverCars** (https://www.discovercars.com/), hotels alleen bij **Booking.com,
Agoda.com of de hotelwebsite zelf**. De app zoekt zelf niets: zij zet de zoekgegevens klaar (kopieerknoppen) en legt de keuzes vast.
Skyscanner en de bijbehorende scripts zijn verwijderd (zie de git-geschiedenis als naslag).

Gebruiker is een leek in techniek: gewone woorden, doe zelf wat kan, één taak tegelijk voor de gebruiker (zie OVERDRACHT.md).
Taal: Nederlands. Bedragen met punt als duizendtalscheiding, zonder decimalen (12.500).
Gebruiker is financieel adviseur: kritisch op fouten en zwakke aannames, geen verwijzing naar een adviseur.
De gebruiker beoordeelt prijzen en kiest zelf: toon altijd bron, datum en link; verzin geen prijzen, reviews of waarschuwingen.

## Werkwijze in de app (leidend)
Zes planningsstappen: 1 Vlucht → 2 Auto → 3 Reis → 4 Verblijf → 5 Reisgids → 6 Route. Elke stap moet door de gebruiker worden bevestigd;
de volgende stap blijft tot dan vergrendeld. Nooit automatisch doorgaan. Onderweg, Dagboek, Kosten, Reisboek en Gegevens zijn altijd open.
1. **Vlucht:** zoekcriteria voor Get-Roam (meerdere vertrek- en aankomstluchthavens, periode, min/max dagen); luchthavens binnen een
   straal komen uit de eigen lijst in de app (LUCHTHAVENS). De gekozen vlucht bepaalt de reisdata; de auto-tijden volgen de vluchttijden.
2. **Auto:** eerst advies huurauto versus trein/bus; de huurperiode (plaats, datum, tijd) volgt automatisch uit de goedgekeurde vlucht en wordt niet gevraagd (alleen als de gebruiker afwijkt); intake (klasse, versnelling, kilometers, brandstofbeleid, kinderzitjes, grens,
   volledige verzekering) en DiscoverCars-zoekprofiel. Full Coverage van DiscoverCars is een vergoedingspolis (eerst zelf betalen).
3. **Reis**, 4. **Verblijf:** hotelcriteria (max € 100; uitzondering tot € 150 alleen na bevestiging per plaats; Booking ≥ 8, Google ≥ 4;
   ≥ 25 reviews per bron; ≤ 10% slecht; gratis annuleerbaar (verplicht, met uiterste datum); ontbijt, parkeren, wifi, eigen badkamer, goede wijk; veiligheid altijd een eis), patroon van
   1/2/3/4 nachten per plaats, routevoorstel met max km per dag, per verblijf 3 hotelopties; de gebruiker bevestigt er één. Na bevestiging
   staan adres en foto bij het verblijf, op de dagpagina en in het reisboek.
5. **Reisgids**, 6. **Route**, dagpagina's, dagboek met foto's, kosten, reisboek. Elk blad en elk reisboekonderdeel is apart af te drukken.

## Vaste voorkeuren vluchten (gelden voor de keuze in Get-Roam)
- Altijd 2 volwassenen, per persoon 1 koffer van 23 kg (Get-Roam kan daar niet op filteren: controleren bij de boeking).
- Reisduur 21 tot 25 dagen. Vertrek vanaf Frankfurt (FRA), Düsseldorf (DUS), Amsterdam (AMS), Brussel (BRU).
- Vliegtijd maximaal 14 uur per enkele reis, rechtstreeks heeft voorkeur; overstap alleen als het totaal minstens € 200 goedkoper is.
- Reiskosten naar de luchthaven: 30 liter benzine + € 200 parkeren, alleen in de kostenraming.

## Bestanden
- reisgids.html: de app. sw.js: offline-schil. index.html: doorverwijzing naar reisgids.html.
- scripts/intake-naar-reisgids.mjs: zet een intake.json om naar een reis voor de app (`npm run intake -- intake.json`); uitvoer in reizen/ (gitignored).
- scripts/test-reisgids.mjs: browsertest (`npm test`; Playwright; zet `CHROMIUM=<pad naar chrome>` als de standaardbrowser ontbreekt).
- docs/databronnen.md: bronnenregister. docs/*.md: wensen per onderdeel (lees alleen het onderdeel waar je aan werkt):
  vluchten.md, autohuur.md, hotels.md, reisgids.md.

## Privacy
De repo is publiek. Zet geen boekingsnummers, namen, hoteladressen, foto's of persoonlijke gegevens in de repo. Reisgegevens staan alleen
in de browser van de gebruiker (back-up als JSON buiten de repo). `reizen/`, `intake.json` en `resultaten/` staan in .gitignore.

## Nog niet gebouwd
Automatisch zoeken van vluchten/auto's/hotels, automatisch ophalen van reviews en prijzen, routeberekening via een routing-API,
live officiële waarschuwingen (alleen links), cloudopslag en synchronisatie. Zie ook de tab Gegevens in de app.
