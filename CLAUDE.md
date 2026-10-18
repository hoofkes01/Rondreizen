# Rondreisplanner – afspraken

WERKWIJZE (leidend): lees eerst OVERDRACHT.md. Eén stap tegelijk; na elke stap STOP, korte melding (max 10 regels) en wacht op
de bevindingen van de gebruiker. Zuinig met tokens: lees geen hele bestanden, gebruik grep/head, laat scripts de pagina's uitlezen.
Zoekscripts draaien: delegeer aan de sub-agent `zoeker` (Haiku, .claude/agents/zoeker.md). Bouwen, uitleesfunctie aanpassen,
beoordelen en hotelafwegingen doe je zelf met het sterkere model. De gebruiker beoordeelt prijzen en kiest zelf:
geef altijd link, regels en ruw bestand erbij. Aan het eind: eindcheck met Opus (zie OVERDRACHT.md, stap 5).

Taal: Nederlands. Bedragen met punt als duizendtalscheiding, zonder decimalen (12.500).
Gebruiker is financieel adviseur: kritisch op fouten en zwakke aannames, geen verwijzing naar een adviseur.

## Vaste zoekregels
- Altijd 2 volwassenen, per persoon 1 koffer van 23 kg (prijs dus incl. ruimbagage).
- Reisduur 21 tot 25 dagen.
- Vertrek alleen vanaf Frankfurt (FRA), Düsseldorf (DUS), Amsterdam (AMS), Brussel (BRU).
- Twee fasen, in deze volgorde (andere vertrekluchthavens pas in fase 2):
  1. Fase 1, alleen Frankfurt: de gebruiker geeft een PERIODE (vroegste en laatste heendatum) en een plaats. Het script zoekt
     slim binnen die periode: grove scan elke 7 dagen, verfijnen rond de 2 goedkoopste heendatums, dan de reisduur 21 tot 25
     dagen, dan de luchthavens binnen 500 km op het gekozen datumpaar. Uitkomst: de goedkoopste data.
  2. Fase 2, pas op die data: zoek vanaf alle vier de vertrekluchthavens (ook Frankfurt) naar alle aankomstluchthavens binnen
     1000 km van de voorkeursluchthaven. Reden: de rondreis kan op meerdere plekken beginnen (eerste reis: USA).
- Vliegtijd maximaal 14 uur per enkele reis (heen en terug apart; ook rechtstreeks). Rechtstreeks heeft voorkeur.
  Overstap alleen als de totaalprijs minstens 200 lager (100 p.p.) is dan de goedkoopste rechtstreekse vlucht naar dezelfde
  bestemming. Zonder rechtstreekse vlucht: goedkoopste overstap binnen 14 uur.
- Toon voor de gekozen data altijd het prijsverschil tussen de vertrekluchthavens per aankomstluchthaven (t.o.v. Frankfurt en
  t.o.v. de goedkoopste). De scripts en de planner doen dit.
- Open vraag aan gebruiker: bij een rondreis kan heen naar A en terug vanuit B (open jaw) goedkoper of praktischer zijn dan
  heen en terug op dezelfde luchthaven. De scripts zoeken nu alleen heen en terug op dezelfde luchthaven.
- Let op omvang fase 2: 4 vertrekpunten x aankomstluchthavens = veel pagina's (standaard max 20 aankomsten = 80 pagina's).
  Meld het aantal vooraf aan de gebruiker; het script doet dat ook (--max2 beperkt het aantal).

## Bestanden
- index.html: de planner (luchthavens, links, prijsregels). Alles in één bestand, geen build.
- intake.html: intakeformulier (vlucht, reiskosten, autohuur, hotels, overig) → intake.json. Reiskosten naar de luchthaven staan vast
  op 30 liter benzine + 200 euro parkeren en komen alleen in de kostenraming van de reisgids (docs/reisgids.md).
- scripts/lib.mjs: luchthavens (leest LUCHTHAVENS uit index.html), straal, URL, uitlezen, regels.
- scripts/zoek.mjs: één zoekopdracht (VAN NAAR HEEN TERUG) → resultaten/*.json, .txt, .png.
- scripts/plan.mjs: de volledige routine in twee fasen (fase 1 alleen Frankfurt; fase 2 alle vertrekpunten x aankomsten binnen 1000 km).
- scripts/browser.mjs: zichtbare Chrome met vast profiel (.browser-profiel); gebruiker doet de robotcontrole.
- scripts/test.mjs: test alles wat zonder Skyscanner kan (`npm test`).

## Werkwijze op de pc (zuinig met tokens)
Het script leest de pagina's uit en Claude beoordeelt alleen de uitkomst. Claude leest NIET zelf hele
resultaatpagina's, tenzij het script niets kan uitlezen (dan: lees alleen het relevante deel van het .txt-bestand).
Gebruik voor het routinewerk (scripts draaien, resultaten ophalen) een lichter model (`/model`, bijv. Haiku);
het zwaardere model alleen voor de eindkeuze en bij fouten.
1. De gebruiker vult intake.html in en bewaart het bestand als `intake.json` in de repo-map (staat in .gitignore, NIET committen).
   Controleer eerst of bestemming en periode zijn ingevuld.
2. `node scripts/plan.mjs --intake=intake.json`, of met vlaggen:
   `node scripts/plan.mjs --plaats=Denver --van=2027-03-01 --tot=2027-05-31`
   (optioneel `--stap=7`, `--straal=500`, `--straal2=1000`, `--max2=20`, `--maxuren=14`, `--prijs=pp|totaal`). De gebruiker rondt de robotcontrole zelf af en
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

## Wensen per onderdeel (lees het bestand pas als je aan dat onderdeel werkt, bespaart tokens)
- Vluchten (zitplaatsen, maaltijden): docs/vluchten.md
- Autohuur: docs/autohuur.md
- Hotels (eisen, veiligheidstoets, beoordeling als onderbouwde afweging): docs/hotels.md
- Reisgids (voorbereidingspagina, dagkoers en betalen, avondadresje per dag): docs/reisgids.md

