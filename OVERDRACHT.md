# Overdracht naar de pc

Laatst bijgewerkt: 18 oktober 2026. Branch: `ccr-c57c0a15-ye0aal` (nog niet op `main`).

## 1. Doel
Een rondreisplanner in vier stappen, in deze volgorde:
1. Vluchten zoeken (nu in aanbouw, eerst dit afmaken en goedkeuren)
2. Autohuur zoeken
3. Rondreisvoorstel op basis van parameters
4. Interactieve reisgids per dag, ter plekke bruikbaar op de telefoon

De eerste reis gaat naar de VS. Ga pas verder met stap 2 als de vluchtenzoeker je tevreden stelt.

## 2. Wat er staat
| Bestand | Inhoud |
|---|---|
| `index.html` | planner: plaats, luchthavens in een straal, Skyscanner-links, prijzen noteren, regels, prijsverschil per vertrekpunt |
| `intake.html` | intakeformulier (reis, vlucht, reiskosten, autohuur, hotels, overig); levert `intake.json` |
| `scripts/plan.mjs` | zoekt in twee fasen op Skyscanner via je eigen Chrome |
| `scripts/zoek.mjs` | één losse zoekopdracht (voor de ijking) |
| `scripts/lib.mjs`, `browser.mjs` | luchthavens, regels, uitlezen, browser |
| `scripts/test.mjs` | `npm test`, test alles wat zonder Skyscanner kan |
| `CLAUDE.md` | vaste afspraken, wordt automatisch gelezen door Claude Code |
| `docs/*.md` | wensen per onderdeel: vluchten, autohuur, hotels, reisgids |
| `OVERDRACHT.md` | dit bestand |

## 3. Afgesproken zoekmethode (vluchten)
- Altijd 2 volwassenen, 1 koffer van 23 kg per persoon, reisduur 21 tot 25 dagen.
- Vertrek: Frankfurt, Düsseldorf, Amsterdam, Brussel.
- **Fase 1, alleen Frankfurt:** jij geeft een periode (vroegste en laatste heendatum) en een plaats. Het script scant elke 7 dagen, verfijnt rond de twee goedkoopste heendatums, probeert dan de reisduur 21 tot 25 dagen, en controleert daarna de luchthavens binnen 500 km. Uitkomst: de goedkoopste data.
- **Fase 2, pas daarna:** op die data alle vier de vertrekpunten (ook Frankfurt) naar alle aankomstluchthavens binnen 1000 km. Toon het prijsverschil per vertrekpunt.
- **Regels:** vliegtijd maximaal 14 uur per enkele reis (ook rechtstreeks). Rechtstreeks heeft voorkeur. Overstap alleen als minstens € 200 totaal (€ 100 p.p.) goedkoper dan de goedkoopste rechtstreekse vlucht.
- **Reiskosten naar de luchthaven:** vast 30 liter benzine + € 200 parkeren. Alleen in de kostenraming van de reisgids, niet in de vergelijking.

## 4. Eerste keer op de pc
```
git clone https://github.com/hoofkes01/Rondreizen.git
cd Rondreizen
git checkout ccr-c57c0a15-ye0aal
npm i
npx playwright install chromium
npm test
claude
```
Zeg tegen Claude: *"Lees CLAUDE.md en OVERDRACHT.md. Voer de ijking uit."*

### De ijking (verplicht)
Het uitlezen van Skyscanner is nog nooit tegen de echte site getest.
1. `node scripts/zoek.mjs FRA LIS 2027-03-10 2027-04-02`
2. Rond de robotcontrole zelf af. Stel het bagagefilter in op 1 ruimbagage van 23 kg per persoon. Druk Enter.
3. Vergelijk met het scherm: aantal aanbiedingen, prijs (per persoon of totaal?), vliegtijd van heen en terug, rechtstreeks of niet.
4. Klopt iets niet: laat Claude `leesAanbod` in `scripts/lib.mjs` aanpassen op de echte tekst in `resultaten/*.txt`, voeg die tekst toe aan `scripts/test.mjs` en draai `npm test`.
5. Controleer ook: werken de links met `preferdirects`, de maandkalender (`oym`, `iym`) en de prijsweergave (inclusief koffers)?

Doe daarna een testrun met een korte periode:
`node scripts/plan.mjs --plaats=Denver --van=2027-03-01 --tot=2027-03-21`

## 5. Acceptatielijst: ben je tevreden over de vluchtenzoeker?
- [ ] Uitlezen klopt bij 3 verschillende zoekopdrachten (bijv. Lissabon, Bangkok, Denver)
- [ ] Prijs is voor 2 personen en inclusief koffers
- [ ] Regel voor 14 uur en € 200 klopt met handmatig gecontroleerde gevallen
- [ ] Fase 1 vindt dezelfde goedkope data als je handmatig in de Skyscanner-kalender ziet
- [ ] Fase 2: prijsverschil per vertrekpunt wordt goed getoond
- [ ] Straal rond de bestemming bevat de juiste luchthavens (VS-lijst is nog niet compleet)
- [ ] Tijd en tokens per zoektocht zijn acceptabel
- [ ] Vergelijking met je andere app geeft geen goedkopere optie die wij missen

## 6. Open punten waarop jouw antwoord nodig is
1. Open jaw (heen naar A, terug vanuit B) ook onderzoeken? Standaard in het formulier: ja. Het script ondersteunt het nog niet.
2. Als prijs en beenruimte botsen bij stoelen: wat gaat voor? Standaard: laagste prijs.
3. De 14 uur: totale reistijd inclusief wachttijd bij overstap? Standaard: ja.
4. Hotels: bij te dure hotels eerst een hogere prijs (+35%) of eerst een lagere waardering (Booking 7 / Google 3,5) toestaan? Standaard: eerst hogere prijs.
5. Literprijs benzine: € 2,45 is een voorstel uit een zoekresultaat, niet geverifieerd. Controleer bij de EU Weekly Oil Bulletin of ANWB.
6. Gebruik je de gids op je telefoon via een link of als bestand? Dat bepaalt of de repo privé moet.

## 7. Vaste afspraken voor Claude
- Nederlands, bedragen met punt als duizendtalscheiding en zonder decimalen.
- Kritisch op fouten en zwakke aannames. Gebruiker is financieel adviseur.
- Actuele cijfers (koersen, prijzen) altijd opzoeken en met bron en datum vermelden.
- Robotcontroles nooit omzeilen: de gebruiker klikt ze zelf weg.
- Tokens beperken: scripts lezen pagina's uit, Claude beoordeelt alleen de uitkomst. Lichter model (`/model`) voor routinewerk. Nieuwe sessie na elke bestemming.
- Hotels: eindoordeel is een onderbouwde afweging, met de redenen erbij. Veiligheid en lawaai nooit versoepelen.

## 8. Privacy en risico's
- **De repo is publiek.** Zet geen boekingsnummers, namen, hoteladressen of persoonlijke gegevens erin. `intake.json`, `resultaten/` en `reizen/` staan in `.gitignore`. Maak de repo privé voordat echte reizen erin komen.
- Prijzen op Skyscanner kunnen afwijken van wat je uiteindelijk betaalt. Controleer altijd op de site van de aanbieder voor je boekt.
- Kosten per tokens lopen op bij veel pagina's. Fase 2 kan tot 80 pagina's zijn. Beperk met `--max2`.

## 9. Wat nog gebouwd moet worden
1. Open jaw in de vluchtenzoeker
2. Maaltijden en stoelinformatie per vlucht uitlezen
3. Autohuur zoeken en vergelijken (DoYouSpain, Rentalcars, Alamo, Avis en lokale aanbieders)
4. Rondreisvoorstel op basis van parameters
5. Reisgids: dagprogramma, weer, waarschuwingen, entree, restaurants, avondadres, route naar hotel, dagkoers en betalen, voorbereidingspagina, kostenraming (offline bruikbaar)
6. Eventueel branch naar `main` brengen en GitHub Pages instellen
