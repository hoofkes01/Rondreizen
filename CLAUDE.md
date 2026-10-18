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
