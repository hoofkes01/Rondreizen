# Databronnen reisgids (free-first)

Er is geen betaalde API, geen API-sleutel en geen betaalaccount nodig. "Nog te controleren" = de actuele voorwaarden eerst bij de bron
bevestigen vóór commercieel of grootschalig gebruik. Dezelfde tabel staat in de app (tab Gegevens).

| Bron | Gegeven | Hoe | Licentie / attributie | Kosten | Fallback |
|---|---|---|---|---|---|
| Open-Meteo Geocoding | plaats → coördinaten, tijdzone | API, op knopdruk | CC BY 4.0 (o.a. GeoNames); gratis niet-commercieel; limieten nog te controleren | gratis | tijdzone handmatig |
| Open-Meteo Forecast | weersverwachting, recente dagen | API, op knopdruk | CC BY 4.0, "Weather data by Open-Meteo.com"; niet-commercieel; nog te controleren | gratis | geen weer tonen |
| Open-Meteo Historical (ERA5-analyse) | historisch weer | API, op knopdruk | idem; geen meetstation, enkele dagen vertraging | gratis | handmatige weerbeschrijving |
| Frankfurter (ECB-koersen) | wisselkoers | API, op knopdruk | ECB-koersen; voorwaarden nog te controleren | gratis | koers handmatig |
| Google Maps | route, zoeken | alleen externe links | gewoon gebruik | geen (geen API-aanroepen) | adres kopiëren |
| Overheids- en weerdiensten | reisadvies, inreis, gezondheid, waarschuwingen | alleen links | n.v.t. | gratis | zelf controleren |
| Eigen luchthavenlijst (in de app) | luchthavens binnen een straal | in reisgids.html | eigen lijst; coördinaten bij benadering | gratis | luchthavens zelf invullen |
| Browseropslag | uw gegevens en foto's | localStorage / IndexedDB | n.v.t. | gratis | JSON-back-up |

Regels in de app: geen gegevens zonder bron of label; voorspelling, historische analyse en eigen beschrijving blijven altijd als zodanig gelabeld;
onbekende bedragen tellen niet als nul; reviewgegevens zijn handmatig en een hotel wordt nooit stilzwijgend goedgekeurd.
