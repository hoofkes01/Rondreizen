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

## Op de telefoon gebruiken (GitHub Pages)

1. Zet de wijzigingen op de hoofdbranch (pull request samenvoegen).
2. GitHub → de repo → **Settings** → **Pages** → bij *Source* kiezen voor **Deploy from a branch**, branch = de standaardbranch, map = **/ (root)**, **Save**.
3. Na ongeveer een minuut staat de app op `https://<gebruikersnaam>.github.io/Rondreizen/reisgids.html`. Open die link op de telefoon en kies
   **Toevoegen aan beginscherm**. Na het eerste bezoek werkt de app ook zonder bereik; camera en foto's werken alleen via deze https-link.
4. Uw gegevens en foto's staan alleen op die telefoon (in de browser). Maak regelmatig een back-up (tab Gegevens).
