# Rondreisplanner – afspraken

De hele planner is één app: `reisgids.html` (geen build, geen server, geen Claude nodig; gegevens alleen in de browser). De gebruiker vult de intake in de app zelf in (of leest een oude intake.json in via Start → "Back-up of intake inlezen"); de app gaat daarna direct stap voor stap verder. Vluchten zoeken gebeurt in **Get-Roam**
(https://get-roam.com/flexible-search), autohuur in **DiscoverCars** (https://www.discovercars.com/), hotels alleen bij **Booking.com,
Agoda.com of de hotelwebsite zelf**. De app zoekt zelf niets: zij zet de zoekgegevens klaar (kopieerknoppen) en legt de keuzes vast.
Skyscanner en de bijbehorende scripts zijn verwijderd (zie de git-geschiedenis als naslag).

Gebruiker is een leek in techniek: gewone woorden, doe zelf wat kan, één taak tegelijk voor de gebruiker (zie OVERDRACHT.md).
Taal: Nederlands. Bedragen met punt als duizendtalscheiding, zonder decimalen (12.500).
Gebruiker is financieel adviseur: kritisch op fouten en zwakke aannames, geen verwijzing naar een adviseur.
De gebruiker beoordeelt prijzen en kiest zelf: toon altijd bron, datum en link; verzin geen prijzen, reviews of waarschuwingen.

## Werkwijze in de app (leidend)
Drie planningsstappen, elk door de gebruiker te bevestigen; de volgende blijft tot dan vergrendeld. Nooit automatisch doorgaan.
1. **Vlucht** → 2. **Auto** → 3. **Hotels**. Pas na bevestiging van de hotels opent de **interactieve reisgids**: Reisgids (intake, praktisch,
   voorbereiding), Route, Onderweg (dagpagina's), Dagboek en Reisboek/verslag. Start, Kosten en Gegevens zijn altijd open.
1. **Vlucht:** (na het zoeken in Get-Roam kan de gebruiker de tekst van de gekozen vlucht plakken; de app leest die heuristisch en toont een voorbeeld, pas "Neem over" vult stap 2; niet getest op echte Get-Roam-tekst) zoekcriteria voor Get-Roam (meerdere vertrek- en aankomstluchthavens als blokjes, periode, min/max dagen); luchthavens
   binnen een straal komen uit de eigen lijst (LUCHTHAVENS). De gekozen vlucht bepaalt de reisdata en de huurperiode (niet gevraagd).
2. **Auto:** eerst advies huurauto versus trein/bus; intake (klasse, versnelling, kilometers, brandstofbeleid, kinderzitjes, grens,
   volledige verzekering) en DiscoverCars-zoekprofiel. Full Coverage van DiscoverCars is een vergoedingspolis (eerst zelf betalen).
3. **Hotels:** criteria (max € 100; uitzondering tot € 150 alleen na bevestiging per plaats; Booking ≥ 8, Google ≥ 4; ≥ 25 reviews per
   bron; ≤ 10% slecht; gratis annuleerbaar met uiterste datum; ontbijt, parkeren, wifi, eigen badkamer, goede wijk; veiligheid altijd een
   eis), patroon van 1/2/3/4 nachten per plaats, routevoorstel met max km per dag, per verblijf 3 hotelopties; de gebruiker bevestigt er
   één. Prijzen alleen bij Booking.com, Agoda.com of de hotelwebsite (laagste telt). Na bevestiging staan adres en foto bij het verblijf.
4. **Interactieve reisgids:** dagpagina's met actieve dagboekvragen (hoogtepunt, wat deden jullie, eten en drinken, weer, onthouden) en
   een herinnering als het dagboek van vandaag leeg is; foto's per dag via in-app camera (elke foto direct bewaard), telefooncamera of
   galerij (verdeeld over de dagen op opnamedatum/EXIF); verwijderen gaat naar een prullenbak (herstelbaar). Een webpagina kan niet
   zelf in de fotorol kijken: volledig automatisch uploaden bestaat niet. Aan het eind van de reis: knop "Maak reisverslag" (Start, Onderweg laatste dag, Dagboek) → naslagwerk met inhoudsopgave, reisgegevens, route, hoogtepunten, waar we sliepen (foto), dagen, lokale informatie en tips, kosten, nawoord. Uitvoer: tab "Reisboek en verslag" (reisgids of verhalend
   reisverslag), elk blad en onderdeel apart af te drukken of als PDF op te slaan.

## Vaste voorkeuren vluchten (gelden voor de keuze in Get-Roam)
- Altijd 2 volwassenen, per persoon 1 koffer van 23 kg (Get-Roam kan daar niet op filteren: controleren bij de boeking).
- Reisduur 21 tot 25 dagen. Vertrek vanaf Frankfurt (FRA), Düsseldorf (DUS), Amsterdam (AMS), Brussel (BRU).
- Vliegtijd maximaal 14 uur per enkele reis, rechtstreeks heeft voorkeur; overstap alleen als het totaal minstens € 200 goedkoper is.
- Reiskosten naar de luchthaven: 30 liter benzine + € 200 parkeren, alleen in de kostenraming.

## Bestanden
- reisgids.html: de app. sw.js + manifest.webmanifest + icoon*: offline en installeerbaar op het beginscherm (alleen via https, bijv. GitHub Pages). index.html: doorverwijzing.
- scripts/test-reisgids.mjs: browsertest (`npm test`; Playwright; zet `CHROMIUM=<pad naar chrome>` als de standaardbrowser ontbreekt).
- docs/databronnen.md: bronnenregister. docs/*.md: wensen per onderdeel (lees alleen het onderdeel waar je aan werkt):
  vluchten.md, autohuur.md, hotels.md, reisgids.md.

## Privacy
De repo is publiek. Zet geen boekingsnummers, namen, hoteladressen, foto's of persoonlijke gegevens in de repo. Reisgegevens staan alleen
in de browser van de gebruiker (back-up als JSON buiten de repo). `reizen/`, `intake.json` en `resultaten/` staan in .gitignore.

## Nog niet gebouwd
Automatisch zoeken van vluchten/auto's/hotels, automatisch ophalen van reviews en prijzen, routeberekening via een routing-API,
live officiële waarschuwingen (alleen links), cloudopslag en synchronisatie. Zie ook de tab Gegevens in de app.
