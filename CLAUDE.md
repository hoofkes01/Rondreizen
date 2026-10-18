# Rondreisplanner – afspraken

Taal: Nederlands. Bedragen met punt als duizendtalscheiding, zonder decimalen (12.500).
Gebruiker is financieel adviseur: kritisch op fouten en zwakke aannames, geen verwijzing naar een adviseur.

## Vaste zoekregels
- Altijd 2 volwassenen, per persoon 1 koffer van 23 kg (prijs dus incl. ruimbagage).
- Reisduur 21 tot 25 dagen.
- Vertrek alleen vanaf Frankfurt (FRA), Düsseldorf (DUS), Amsterdam (AMS), Brussel (BRU).
- Plaatsnaam opgegeven: zoek ook alle luchthavens binnen 500 km van de voorkeursluchthaven.
- Volgorde: eerst alles vanaf FRA. Is daar de goedkoopste combinatie van data/bestemming gevonden,
  controleer dan voor exact dezelfde data en bestemming DUS, AMS en BRU.
- Rechtstreeks heeft voorkeur. Overstap alleen als reistijd max 15 uur EN totaalprijs minstens
  200 lager (100 p.p.) dan de goedkoopste rechtstreekse vlucht naar dezelfde bestemming.
  Zonder rechtstreekse vlucht: overstap tot 15 uur toegestaan.
- Zoek slim: gebruik de maand-/prijskalender van Skyscanner om goedkope dagen te vinden vóór je
  exacte datumcombinaties opent.

## Bestanden
- index.html: de planner (luchthavens, links, prijsregels). Alles in één bestand, geen build.
- scripts/lib.mjs: luchthavens (leest LUCHTHAVENS uit index.html), straal, URL, uitlezen, regels.
- scripts/zoek.mjs: één zoekopdracht (VAN NAAR HEEN TERUG) → resultaten/*.json, .txt, .png.
- scripts/plan.mjs: de volledige routine (Frankfurt eerst, daarna DUS/AMS/BRU voor de winnaar).
- scripts/browser.mjs: zichtbare Chrome met vast profiel (.browser-profiel); gebruiker doet de robotcontrole.
- scripts/test.mjs: test alles wat zonder Skyscanner kan (`npm test`).

## Werkwijze op de pc (zuinig met tokens)
Het script leest de pagina's uit en Claude beoordeelt alleen de uitkomst. Claude leest NIET zelf hele
resultaatpagina's, tenzij het script niets kan uitlezen (dan: lees alleen het relevante deel van het .txt-bestand).
Gebruik voor het routinewerk (scripts draaien, resultaten ophalen) een lichter model (`/model`, bijv. Haiku);
het zwaardere model alleen voor de eindkeuze en bij fouten.
1. Vraag plaats(en) en vertrekperiode. Zoek de goedkope dagen via de Skyscanner-maandkalender
   (link uit index.html, stap 2) en kies 2 tot 3 datumparen van 21 tot 25 dagen.
2. `node scripts/plan.mjs --plaats=Lissabon --data=2027-03-10:2027-04-02,2027-03-17:2027-04-09`
   (optioneel `--straal=500`, `--prijs=pp|totaal`). De gebruiker rondt de robotcontrole zelf af en
   controleert het bagagefilter (1 ruimbagage 23 kg p.p.); omzeil die controle nooit.
3. Rapporteer per bestemming de beste keuze volgens de regels, met link, en noem wat je niet kon verifiëren.

## Eerste keer op de pc: ijking (verplicht, voor je de resultaten vertrouwt)
De uitleesfunctie `leesAanbod` en de URL-parameters zijn nooit tegen de echte site getest.
1. `npm i && npx playwright install chromium && npm test`
2. `node scripts/zoek.mjs FRA LIS 2027-03-10 2027-04-02` en vergelijk het resultaat met het scherm:
   aantal aanbiedingen, prijs (per persoon of totaal? stel `--prijs` in), reistijd, rechtstreeks ja/nee.
3. Klopt iets niet: pas `leesAanbod` in scripts/lib.mjs aan op de echte tekst in `resultaten/*.txt`, voeg
   die tekst toe als testgeval in scripts/test.mjs en draai `npm test`.
4. Controleer dat de prijs inclusief 2 koffers is en dat `preferdirects`/maandkalender-parameters werken.

## Overdracht van de cloudsessie naar de pc
Gebruiker werkt op de pc met Claude Code en de Chrome-koppeling. Daarmee kan Skyscanner in de
eigen Chrome worden bediend; de gebruiker rondt zelf een robotcontrole af.
Stand van zaken: planner (index.html) werkt; zoeken op Skyscanner is nog nooit uitgevoerd en de
URL-parameters zijn ongetest. Eerste taak op de pc: één testzoekopdracht (bijv. FRA-LIS, 23 dagen)
en controleren of de links, de maandkalender en het bagagefilter (2 x 23 kg) kloppen.
Daarna: Frankfurt-eerst-routine voor meerdere bestemmingen binnen 500 km uitvoeren.

## Roadmap (door gebruiker aangegeven, in deze volgorde)
1. Vluchten zoeken (nu in aanbouw, zie boven).
2. Autohuur zoeken.
3. Rondreisvoorstel op basis van parameters van de gebruiker (route, dagen, interesses, budget).
4. Interactieve reisgids per dag, ter plekke digitaal te gebruiken (telefoon, ook met slecht bereik), met:
   lokaal weer, weerbericht en weerwaarschuwingen, entreeprijzen, route naar en adres van het hotel,
   restaurants binnen een ingestelde prijsrange.

Ontwerpafspraken voor latere stappen (nog te bevestigen met de gebruiker):
- Reisgegevens per reis als aparte JSON in `reizen/<naam>.json`; de gids is een statische pagina die dat leest.
- Offline bruikbaar (PWA met service worker, gegevens vooraf opgehaald); weer ververst zodra er bereik is.
- Weer: Open-Meteo (gratis, geen sleutel). Waarschuwingen: officiële dienst per land (bijv. MeteoAlarm/KNMI/DWD).
- Entreeprijzen en restaurantprijzen: alleen uit officiële sites of een betaalde bron (bijv. Google Places API);
  nooit schatten zonder dat te vermelden. Prijs en datum van de bron altijd tonen.
- Routes naar hotel: deeplinks naar Google Maps/Apple Maps met het adres; geen eigen navigatie.
- PRIVACY: de repo is publiek. Zet geen boekingsnummers, namen, hoteladressen of persoonlijke gegevens in de repo.
  Houd reisgegevens lokaal of maak de repo privé voordat reizen erin komen.

## Wensen per onderdeel (door gebruiker opgegeven)
### Vluchten (aanvulling op de vaste zoekregels)
- Intercontinentaal: maaltijden en drankjes moeten inbegrepen zijn. Controleer de tariefvoorwaarden van de
  maatschappij (aggregators tonen dit vaak niet betrouwbaar); noteer per aanbieding "maaltijd/drank: ja/nee/onbekend".
- Zitplaatsadvies per vlucht en vliegtuigtype: (a) niemand naast ons, zodat we niet steeds iemand hoeven te vragen
  voor de wc (denk aan 2-stoelrijen, bijv. achterin bij het smaller wordende deel, of raam+gang van een rij met 3 stoelen
  als de middelste leeg blijft), (b) goedkoopste stoelen die naast elkaar zitten (let op kosten stoelkeuze per maatschappij),
  (c) beste beenruimte, (d) liefst zo ver mogelijk achterin. Noem de nadelen eerlijk (wc-nabijheid, geluid, beperkte
  verstelbaarheid, inchecken/uitstappen later). Baseer op de stoelenkaart van de maatschappij of het vliegtuigtype, nooit gokken.
### Autohuur
- Zoeken bij doyouspain.com, rentalcars.com, alamo.com en avis.com, en ook rechtstreeks bij aanbieders in het
  bestemmingsland (niet alleen Europese sites).
- Eisen: klasse intermediate, 2 personen, onbeperkt kilometers, brandstof vol/vol, zo mogelijk extra bestuurder,
  zo goedkoop mogelijk voor de gekozen periode, met volledige verzekering (nul eigen risico).
- Let op en noem altijd: bij brokers is "volledige verzekering" vaak een terugbetalingsverzekering (eerst eigen risico/borg
  betalen); borg op creditcard; leeftijds- en rijbewijseisen (internationaal rijbewijs?); kosten voor extra bestuurder,
  ophalen op luchthaven en eenrichtingsverkeer. Vergelijk daarom de totale kosten, niet alleen de dagprijs.
### Hotels
- Altijd in een veilige buurt: controleer Google-reviews en Booking-reviews, plus het officiële reisadvies (Buitenlandse Zaken).
- Vergelijk Booking, Agoda en de site van het hotel zelf (vaak goedkoper of betere voorwaarden).
- Zo dicht mogelijk bij de "place to be" met wat leven in de buurt, maar niet te druk (60+).
- Minimaal: waardering 8 of hoger, ontbijt inbegrepen, eigen badkamer, wifi. Specificeer de schaal erbij: Booking 8,0+ en
  Google 4,0+ met een minimum aantal reviews (nog vast te stellen met de gebruiker); gebruik nooit alleen één bron.
### Reisgids
- Extra pagina "Voorbereiding": stroomnet (stekker en voltage), weer, inentingen (RIVM/LCR), visum, tijdverschil,
  gebruiken ter plaatse, niet doen ter plaatse. Alleen officiële bronnen (overheid) voor visum, inentingen en reisadvies.
- Per dag: een gezellig adresje voor een drankje 's avonds, in de buurt van het hotel (veilig te bereiken, ook 's avonds).

### Reisgids: geld (per dag zichtbaar)
- Dagkoers van de lokale munt t.o.v. de euro, met bron en tijdstip. Bron: ECB-referentiekoersen (bijv. via Frankfurter API,
  gratis, geen sleutel). Offline: toon de laatst opgehaalde koers met datum, nooit een koers zonder datum.
- Rekenhulp: bedrag in lokale munt naar euro en omgekeerd, met de koers van vandaag.
- "Beste manier van betalen" en "geld opnemen" voor drie opties: creditcard, Revolut, Rabobank-pas. Voorwaarden
  (valutaopslag, opnamekosten, limieten, weekendtoeslag, geoblokkering/instellingen voor gebruik buiten Europa)
  staan NIET vast in de code: zet ze in `instellingen/kosten.json`, met bron-URL en controledatum, en laat de gebruiker
  die controleren vóór vertrek. Haal actuele voorwaarden op bij de officiële sites van Rabobank, Revolut en de creditcardmaatschappij.
- Altijd adviseren om in lokale munt te betalen (dus "Dynamic Currency Conversion" weigeren). Toon per land of
  pinnen/contactloos gebruikelijk is en of contant nodig is.
- Per land een korte tip: welke pinautomaten (bankgebonden) en waar niet (losse geldautomaten met hoge kosten).

### Hotels: veiligheidstoets (aanscherping door gebruiker)
Principe: één klacht zegt weinig, maar een patroon bij veel reviews betekent dat er iets mis is. Geen hotel in een achterbuurt.
1. Reviews: lees de recente reviews (laatste 24 maanden) op Booking en Google. Tel hoeveel reviews veiligheid noemen
   (zoek ook in de taal van het land en Engels: onveilig/unsafe, diefstal/theft/stolen, overval/robbery/mugged, dronken/
   drugs, donkere straat/dark, "niet 's avonds lopen", scam). Rapporteer aantal en aandeel van de reviews, en
   citeer 2 à 3 voorbeelden. Weinig reviews (onder ~100) = zwakke onderbouwing; zeg dat erbij.
   Afkeuren bij een duidelijk patroon (bijv. meerdere recente reviews over diefstal of onveilig voelen, of een aandeel
   dat opvallend hoger is dan bij vergelijkbare hotels in dezelfde stad).
2. Buurt: beoordeel de straat en directe omgeving, niet alleen het hotel. Gebruik Google Maps/Street View (staat, verlichting,
   leegstand, graffiti, winkels en horeca open 's avonds) en de looproute van het hotel naar de "place to be" en naar het
   avondadresje. Officieel reisadvies van Buitenlandse Zaken per regio; waar beschikbaar officiële misdaadkaarten van
   politie/gemeente. Indexen op basis van gebruikersmeldingen (bijv. Numbeo) zijn indicatief, geen bewijs.
3. Conclusie per hotel: "veilig", "twijfel" of "afgekeurd", met de reden in één of twee zinnen. Bij twijfel altijd noemen
   wat je niet kon verifiëren. Gebruik nooit alleen de waardering als bewijs van veiligheid.
4. Houd rekening met het verschil tussen kleine diefstal (zakkenrollers, vaak overal in toeristengebieden) en
   geweld/overvallen; benoem welk type voorkomt en wat te doen.

#### Harde afkeurregel hotels (door gebruiker bevestigd)
- Voorbeeld: bij ~100 reviews waarvan 50% "onveilig" of "rumoerig" noemt, nooit voorstellen.
- Tel onveilig en rumoerig APART en toon beide percentages. Onveilig = veiligheid/diefstal/overlast/buurt; rumoerig = geluidsoverlast
  (belangrijk voor 60+). Een hotel wordt afgekeurd als een van de twee ruim boven de drempel zit.
- Drempels (voorstel, door gebruiker te bevestigen): onveilig 15% of meer = afkeuren; 5 tot 15% = twijfel, alleen voorstellen met
  uitleg; onder 5% = geen bezwaar. Rumoerig 25% of meer = afkeuren, tenzij een stille kamer (achterzijde, hogere verdieping) bij de
  boeking gegarandeerd kan worden en dat in de reviews bevestigd wordt.
- Tel alleen reviews waarin het onderwerp negatief wordt genoemd, niet "veilig" of "rustig" in positieve zin.

#### Weinig reviews (nuancering na overleg)
- Weinig reviews is geen goed en geen slecht teken: het is onbekend. Niet automatisch afkeuren en niet automatisch goedkeuren.
- Op Booking wordt na verblijf bijna elke gast om een review gevraagd, dus weinig reviews betekent meestal weinig boekingen
  of een nieuw hotel, niet dat tevreden gasten zwijgen. Behandel dit als aanname en controleer het niet als feit.
- Bij weinig reviews (onder ~100): de buurttoets (Street View, reisadvies, looproutes) en de site van het hotel zelf wegen zwaarder;
  noem expliciet "weinig reviews, onderbouwing zwak". Met weinig reviews tellen percentages zwaar (één klacht bij 20 reviews = 5%):
  geef altijd het absolute aantal naast het percentage.

#### Aantal reviews is geen kwaliteitssignaal (aanvulling gebruiker)
- Het aantal reviews zegt niets over kwaliteit: het hangt af van de leeftijd van het hotel (nieuw = weinig reviews),
  grootte, aantal boekingen en hoe actief gasten om een review worden gevraagd (herhaalverzoeken, kortingsacties).
- Gebruik het aantal alleen om te bepalen hoe betrouwbaar de steekproef is, nooit als bewijs voor goed of slecht.
- Noteer per hotel: sinds wanneer op het platform/geopend, reviews in de laatste 12 maanden, en of er verdachte patronen zijn
  (veel 10/10 in korte tijd, bijna identieke teksten, reviews na een beloning). Meld dit, trek er geen harde conclusie uit.
- Bij een nieuw hotel met weinig reviews: wees extra zorgvuldig met buurttoets, eigen site, foto's van gasten en
  vergelijk met de ervaring van de hotelketen of eigenaar (andere locaties), voor zover aanwezig.
