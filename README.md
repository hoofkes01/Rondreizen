# Rondreisplanner

Open `reisgids.html` in de browser. Plan een rondreis in zes stappen (vlucht, auto, reis, verblijf, reisgids, route), gebruik de
dagpagina's onderweg, houd een dagboek met foto's bij en print of bewaar het reisboek als PDF. Alles wat u invult blijft in uw eigen
browser; maak regelmatig een back-up (tab Gegevens). De app werkt zelfstandig: geen account, server of Claude nodig. Na afloop maakt u van het dagboek en de foto's een reisverslag (tab Reisboek en verslag).

- Vluchten zoekt u in Get-Roam, auto's in DiscoverCars, hotels bij Booking.com, Agoda.com of de hotelwebsite; de app zet de zoekgegevens klaar.
- Bronnen en voorwaarden: `docs/databronnen.md`. Afspraken: `CLAUDE.md`.

## Testen

    npm i
    npm test    # Playwright; CHROMIUM=/pad/naar/chrome als de standaardbrowser ontbreekt

## Een oude intake.json gebruiken

Start → "Back-up of intake inlezen" in de app. Er is geen tussenstap of script nodig.
