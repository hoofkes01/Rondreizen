# Reisgids

- Extra pagina "Voorbereiding": stroomnet (stekker en voltage), weer, inentingen (RIVM/LCR), visum, tijdverschil,
  gebruiken ter plaatse, niet doen ter plaatse. Alleen officiële bronnen (overheid) voor visum, inentingen en reisadvies.
- Per dag: een gezellig adresje voor een drankje 's avonds, in de buurt van het hotel (veilig te bereiken, ook 's avonds).

## Geld (per dag zichtbaar)
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
