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
1. **Vlucht** → 2. **Auto** → 3. **Hotels**. Pas na bevestiging van de hotels opent de **interactieve reisgids**: Reisgids (intake,
   voorbereiding), Route, Onderweg (dagpagina's), Dagboek en Reisboek/verslag. Start, Te regelen (visum, stekkers, valuta, voorbereiding), Kosten en Gegevens zijn altijd open.
1. **Vlucht:** (na het zoeken in Get-Roam kan de gebruiker de tekst van de gekozen vlucht plakken; de app leest die heuristisch en toont een voorbeeld, pas "Neem over" vult stap 2; niet getest op echte Get-Roam-tekst) zoekcriteria voor Get-Roam (meerdere vertrek- en aankomstluchthavens als blokjes, periode heenvlucht en periode terugvlucht (verblijf optioneel); Kiwi.com is de basis om te zoeken; Skyscanner en Get-Roam dienen ter controle van dezelfde vlucht (`controleVlucht`: Skyscanner-link met codes en data, op de echte site gecontroleerd; Get-Roam met één dag heen en vast aantal nachten). Naast Get-Roam is er een Kiwi.com-knop (`kiwiLink`) die met één tik een vooringevulde zoekopdracht opent: Kiwi gebruikt plaatsnamen (stad-staat-land) uit de tabel `KIWI` (op 24-10-2026 gecontroleerd; Brussel niet gevonden; één onbekende naam laat Kiwi alles negeren), periode heenvlucht, verblijf min-max of terugperiode, volwassenen, goedkoopste eerst. Get-Roam beveiligt zijn formulier met een CSRF-token en kan dus niet vooraf worden ingevuld: er staat alleen een gewone link en een lijst met de waarden om met de hand in te vullen (de bladwijzer-aanpak is vervallen); luchthavens
   binnen een straal komen uit de eigen lijst (LUCHTHAVENS). De gekozen vlucht bepaalt de reisdata en de huurperiode (niet gevraagd). Het gekozen aanbod (vlucht én auto) kan worden geplakt (heuristische lezer met voorbeeld; pas "Neem over" vult; andere valuta dan de reis wordt niet overgenomen; niet getest op echte sitetekst) en als screenshot worden bewaard (alleen op het apparaat; in het reisboek bij "boekingsnummers opnemen"). Tekst in screenshots wordt niet uitgelezen (geen OCR).
2. **Auto:** eerst advies huurauto versus trein/bus; intake (klasse, versnelling, kilometers, brandstofbeleid, kinderzitjes, grens,
   volledige verzekering), een vooringevulde Expedia-zoeklink (`autoLink`: gedocumenteerde deeplink met luchthavencode, data en tijden; op de echte site gecontroleerd) en het DiscoverCars-zoekprofiel (DiscoverCars kan niet vooraf worden ingevuld: eigen locatie-id's). Full Coverage van DiscoverCars is een vergoedingspolis (eerst zelf betalen).
3. **Rondreis (tabblad, altijd open, vóór Hotels):** plaatsen + nachten (ook plakken), per se zien, routevoorstel en een dag-voor-dag-tabel met km en rijtijd per dag (`dagTabelRijen`, volgorde zoals de gebruiker hem invult); pas na "Ik bevestig deze rondreis" (`rondreisOk`) kan bij Hotels "Maak dagen en verblijven aan" en start het hotelzoekdeel. 3. **Hotels:** criteria (max € 100; uitzondering tot € 150 alleen na bevestiging per plaats; Booking ≥ 8, Google ≥ 4; ≥ 25 reviews per
   bron; ≤ 10% slecht; gratis annuleerbaar met uiterste datum; ontbijt, parkeren, wifi, eigen badkamer, goede wijk; veiligheid altijd een
   eis), patroon van 1/2/3/4 nachten per plaats, routevoorstel met max km per dag, per verblijf 3 hotelopties; de gebruiker bevestigt er
   één. Een lijst "Wat wilt u per se zien?" (bezienswaardigheid + plaats; de app controleert of de plaats in de route staat en toont ze op de dagpagina; verzint niets). De route moet een echte rondreis zijn: `routeHerhaling` meldt ritten die over dezelfde weg lopen als een eerdere rit (schatting op hemelslijn) en het routevoorstel straft dat af. Prijzen alleen bij Booking.com, Agoda.com of de hotelwebsite (laagste telt). Per verblijf een vooringevulde Booking.com-zoeklink (`bookingLink`: plaats, datums, gasten, score 8+, gratis annuleren, maximumprijs, ontbijt, wifi; gecontroleerd op de echte site). Agoda laat zich niet vooraf invullen (datums gaan verloren); Tripadvisor is geen bron in de criteria. Na bevestiging staan adres en foto bij het verblijf.
4. **Interactieve reisgids:** dagpagina's met actieve dagboekvragen (hoogtepunt, wat deden jullie, eten en drinken, weer, onthouden) en
   een herinnering als het dagboek van vandaag leeg is; foto's per dag via in-app camera (elke foto direct bewaard), telefooncamera of
   galerij (verdeeld over de dagen op opnamedatum/EXIF); verwijderen gaat naar een prullenbak (herstelbaar). Een webpagina kan niet
   zelf in de fotorol kijken: volledig automatisch uploaden bestaat niet. Aan het eind van de reis: knop "Maak reisverslag" (Start, Onderweg laatste dag, Dagboek) → naslagwerk met inhoudsopgave, reisgegevens, route, hoogtepunten, waar we sliepen (foto), dagen, lokale informatie en tips, kosten, nawoord. Aan het eind van de reis: knop "Maak reisverslag" (Start, laatste dagpagina, Dagboek) → naslagwerk met inhoudsopgave, reisgegevens, route, hoogtepunten, waar we sliepen (foto), dagen, lokale informatie en tips, kosten, nawoord. Uitvoer: tab "Reisboek en verslag" (reisgids of verhalend
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
