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
- scripts/zoek.mjs: opent Skyscanner zichtbaar in jouw browser, wacht tot de gebruiker de
  "ik ben geen robot"-controle heeft afgerond en bewaart paginatekst + screenshot in `resultaten/`.

## Werkwijze in een sessie met browser (pc)
1. Vraag bestemming(en) en vertrekperiode.
2. Gebruik de luchthavenlijst in index.html (LUCHTHAVENS) voor de straal van 500 km.
3. Draai `node scripts/zoek.mjs <FRA|DUS|AMS|BRU> <BESTEMMING> <heen YYYY-MM-DD> <terug YYYY-MM-DD>`
   of gebruik de browserkoppeling direct. Laat de gebruiker de robotcontrole zelf aanklikken;
   omzeil die controle nooit.
4. Lees `resultaten/*.txt`, pas de regels hierboven toe en rapporteer de beste keuze per bestemming.

## Let op
- De Skyscanner-URL-parameters (`oym`, `iym`, `preferdirects`) zijn niet geverifieerd; controleer ze.
- Bagagefilter kan niet via de URL: stel het in de pagina in (1 ruimbagage p.p., 23 kg).
