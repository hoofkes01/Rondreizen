---
description: Voer zoekopdracht.json uit (vlucht, auto, hotels) met de goedkope zoeker
argument-hint: vlucht | auto | hotels | alles
---
Lees docs/pc-zoeken.md en zoekopdracht.json. Voer het onderdeel "$ARGUMENTS" uit (bij leeg of "alles": vlucht, dan auto, dan hotels, één voor één).

Laat het zoekwerk zelf doen door de subagent `zoeker` (draait op Haiku, zodat het zoeken zo weinig tokens kost). Geef die per keer één onderdeel (bij hotels één verblijf per keer), met een duidelijke opdracht en de relevante stukken uit zoekopdracht.json.

Controleer daarna zelf, voordat u klaar meldt:
- resultaten.json bestaat, is geldig JSON en heeft `"soort": "rondreisplanner-resultaten"`.
- Prijzen hebben bron, datum en link; niets lijkt verzonnen; de criteria uit zoekopdracht.json zijn gehaald (anders: opmerking of weglaten).
Meld de gebruiker in gewone woorden wat is gevonden, wat niet is gelukt, en dat hij resultaten.json in de app moet inlezen (Vlucht, Auto of Hotels → "Resultaten inlezen"). Als een controle "bent u een mens" opduikt: zeg precies wat te klikken.
