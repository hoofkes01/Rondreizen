# PC-zoekmodus: Claude zoekt in Chrome, de app bewaart de keuzes

Dit bestand is de opdracht voor Claude Code op de pc (met de Chrome-koppeling aan). Open in Claude Code de map van deze repository en zeg:
"Lees docs/pc-zoeken.md en voer zoekopdracht.json uit." De gebruiker (leek in techniek, financieel adviseur, Nederlands, bedragen met punt als
duizendtalscheiding en zonder decimalen) vult de app in, downloadt `zoekopdracht.json`, en leest `resultaten.json` weer in. Claude kiest niets
voor de gebruiker: Claude zoekt, vergelijkt en legt opties vast met bron, datum en link. De gebruiker beslist en bevestigt in de app.

## Algemene regels
- Verzin niets. Wat niet gelezen of geverifieerd is, laat u leeg of zet u in `opmerking`. Geen geschatte prijzen, scores of waarschuwingen.
- Bij elke prijs: bron, datum (vandaag), link naar de plek waar de prijs staat. Noem of het de totaalprijs is, voor wie, en met welke voorwaarden.
- Controle "bent u een mens", cookiemelding of inlog: stop, zeg de gebruiker precies wat te klikken, wacht, ga door. Nooit proberen die controle te omzeilen.
- Werk stap voor stap en meld kort de voortgang. Zoek efficiënt (zie per onderdeel): eerst smal vergelijken, dan pas details ophalen van de beste kandidaten.
- Schrijf alleen `resultaten.json` in de hoofdmap. Zet nooit boekingen, namen of persoonlijke gegevens in de repository. `zoekopdracht.json` en `resultaten.json` staan in .gitignore.
- Boek of betaal nooit iets. Maak geen account aan.
- Het resultaat per onderdeel mag ook gedeeltelijk zijn: schrijf wat u hebt en zeg wat ontbreekt.

## 1. Vlucht (`vlucht` in zoekopdracht.json)
Doel: de goedkoopste vlucht die aan alle criteria voldoet.
1. Zoek in Skyscanner (https://www.skyscanner.nl) in Chrome. Kiwi.com (`vlucht.startlinks.kiwi`) is een tweede bron ter controle van dezelfde vlucht.
2. Criteria: 2 volwassenen (`reizigers`), heen binnen `heenvluchtVan` tot `heenvluchtTot`, terug binnen `terugvluchtVan` tot `terugvluchtTot`
   (of verblijf `verblijfMinDagen` tot `verblijfMaxDagen`), alle `vertrekluchthavens` naar alle `aankomstluchthavens`, vliegtijd per richting maximaal
   `maxVliegurenPerRichting`, 1 ruimbagage van 23 kg per persoon in de prijs (controleer en tel zo nodig bij), geen zelf-overstap.
3. Rechtstreeks heeft voorkeur. Een vlucht met overstap alleen opnemen als de totaalprijs minstens 200 lager is dan de goedkoopste rechtstreekse; zet dat in `opmerking`.
4. Werkwijze: gebruik de maandweergave/prijskalender om de goedkoopste datumcombinaties te vinden (per luchthavencombinatie), neem de beste 3 tot 5 combinaties en haal daar de echte vluchten op. Controleer de beste 3 daarna op Kiwi.com.
5. Noteer per optie de totaalprijs voor alle reizigers met bagage (`prijsPer`: "groep") of per persoon ("pp"), maatschappij, tijden, vluchtnummers, overstappen en reistijd per richting (uu:mm).
6. Geef maximaal 8 opties, goedkoopste eerst.

## 2. Auto (`auto` in zoekopdracht.json)
Doel: de goedkoopste huurauto die aan de criteria voldoet.
1. Zoek op DiscoverCars (`auto.startlinks.discovercars`) met ophaal- en inleverplaats, data en tijden, klasse, versnelling, onbeperkte kilometers.
2. Filter op: volledige verzekering (Full Coverage van DiscoverCars is een vergoedingspolis: eerst zelf betalen, noteer dat), brandstofbeleid vol-vol, bestuurdersleeftijd, kinderzitjes en grens volgens de zoekopdracht.
3. Vergelijk de totaalprijs inclusief alle verplichte toeslagen. Noteer borg, eigen risico en kilometerbeleid. Controleer eventueel dezelfde klasse op Expedia (`auto.startlinks.expedia`).
4. Geef maximaal 6 opties, goedkoopste eerst.

## 3. Hotels (`hotels` en `hotelCriteria` in zoekopdracht.json)
Doel: per verblijf 3 opties: (A) laagste prijs, (B) hoogste score, (C) beste verhouding, allemaal binnen de criteria.
1. Alleen Booking.com (of Agoda, of de website van het hotel zelf). Begin met `startlinkBooking` van het verblijf: die heeft plaats, data, gasten, score, gratis annuleren, maximumprijs, ontbijt en wifi al ingesteld. Voeg het filter gratis parkeren toe.
2. Criteria: `maxPrijsPerNacht` alles inbegrepen (belastingen en toeslagen meetellen; de uitzondering boven dat bedrag alleen als de gebruiker die heeft bevestigd), Booking-score ≥ `minBooking`, Google-score ≥ `minGoogle`, minstens `minReviewsPerBron` reviews per bron, hoogstens `maxNegatiefPct` procent slechte reviews, gratis annuleren met uiterste datum, ontbijt, parkeren, wifi, eigen badkamer, goede wijk. Veiligheid is altijd een eis.
3. Neem de kandidaten uit de zoekresultaten en controleer per kandidaat op de hotelpagina: totaalprijs met belastingen (let op "niet inbegrepen"), parkeerkosten, ontbijt, annuleertermijn, aantal en verdeling van reviews. Zoek daarna de Google-score en het aantal reviews van dat hotel op Google Maps; lukt dat niet, laat de velden leeg en zeg het.
4. Veiligheid: alleen een bron noemen als u die echt hebt gelezen (bijv. buurtinformatie of overheidsadvies), met datum; anders `veilig`: "onvoldoende" laten staan.
5. Geef per verblijf maximaal 3 opties.

## Bestandsformaat van resultaten.json
Alle onderdelen zijn optioneel. Teksten zonder verzonnen waarden; bedragen als getal zonder valutateken.
```json
{
  "soort": "rondreisplanner-resultaten", "versie": 1, "gemaakt": "2026-10-25T10:00:00Z",
  "vlucht": { "notitie": "Bron en datum van het zoeken, wat er niet gelukt is", "opties": [{
    "maatschappij": "KLM", "van": "AMS", "naar": "DFW", "heenDatum": "2027-03-05", "heenVertrek": "10:25", "heenAankomst": "14:05", "heenNr": "KL0000",
    "terugDatum": "2027-03-28", "terugVertrek": "16:00", "terugAankomst": "07:30", "terugNr": "KL0001", "stops": 0,
    "prijs": 3050, "prijsValuta": "USD", "prijsPer": "groep", "bron": "Skyscanner", "link": "https://...", "reistijdHeen": "10:40", "reistijdTerug": "10:20", "opmerking": "rechtstreeks, 2 x 23 kg inbegrepen" }] },
  "auto": { "notitie": "", "opties": [{
    "verhuurder": "Hertz", "ophaalPlaats": "Dallas", "ophaalDatum": "2027-03-05", "ophaalTijd": "15:00", "inleverPlaats": "Dallas", "inleverDatum": "2027-03-28", "inleverTijd": "10:30",
    "klasse": "suv", "versnelling": "automaat", "kmType": "onbeperkt", "verzekeringKeuze": "volledig", "prijs": 1234, "prijsValuta": "USD", "prijsPer": "groep", "bron": "DiscoverCars", "link": "https://...", "opmerking": "Full Coverage is een vergoedingspolis" }] },
  "hotels": [{ "plaats": "Austin", "van": "2027-03-06", "opties": [{
    "naam": "Hotel Voorbeeld", "adres": "", "site": "", "prijsB": 95, "linkB": "https://www.booking.com/...", "prijsType": "exact", "prijsDatum": "2026-10-25",
    "ontbijt": "ja", "parkeren": "gratis", "wifi": "ja", "badkamer": "eigen", "belasting": 0, "annulerenGratis": "ja", "annuleerTot": "2027-03-01", "annuleren": "gratis tot 1 maart",
    "bScore": 8.4, "bN": 120, "bNeg": 4, "bLink": "https://...", "gScore": 4.3, "gN": 300, "gNeg": 12, "gLink": "https://...", "revDatum": "2026-10-25",
    "afstandCentrum": 2, "wijk": "goed", "veilig": "onvoldoende", "veiligNotitie": "", "ligging": "", "notitie": "" }] }]
}
```
Toegestane waarden: `ontbijt` onbekend, ja, extra, nee; `parkeren` onbekend, gratis, betaald, nee; `wifi` onbekend, ja, nee; `badkamer` onbekend, eigen, gedeeld; `annulerenGratis` onbekend, ja, nee;
`wijk` onbekend, goed, matig, slecht; `veilig` onvoldoende, geen (geen duidelijke waarschuwingen gevonden), aandacht; `prijsType` exact, schatting. `klasse` bij auto: de waarden die de app toont (bijv. suv, intermediate).
Hotels worden in de app gekoppeld op `plaats` (en `van`); ze komen in opties A, B en C van dat verblijf, ongeacht eerdere inhoud van die opties, behalve bij een al bevestigd hotel.

## Wat de gebruiker daarna doet
In de app: Resultaten inlezen. Vlucht en auto: bij "Kies" komt de optie eerst in een voorbeeld; pas "Neem over" vult de velden. Hotels: in de opties van het verblijf controleren en zelf één bevestigen.
