# Rondreisplanner

Open `reisgids.html` in de browser. Plan een rondreis in zes stappen (vlucht, auto, reis, verblijf, reisgids, route), gebruik de
dagpagina's onderweg, houd een dagboek met foto's bij en print of bewaar het reisboek als PDF. Alles wat u invult blijft in uw eigen
browser; maak regelmatig een back-up (tab Gegevens).

- Vluchten zoekt u in Get-Roam, auto's in DiscoverCars, hotels bij Booking.com, Agoda.com of de hotelwebsite; de app zet de zoekgegevens klaar.
- Bronnen en voorwaarden: `docs/databronnen.md`. Afspraken: `CLAUDE.md`.

## Testen

    npm i
    npm test    # Playwright; CHROMIUM=/pad/naar/chrome als de standaardbrowser ontbreekt

## Een intake.json omzetten

    npm run intake -- intake.json
