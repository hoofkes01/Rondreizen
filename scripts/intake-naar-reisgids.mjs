// Zet een intake.json (uit het oude intakeformulier) om naar een back-upbestand voor reisgids.html.
// Gebruik: node scripts/intake-naar-reisgids.mjs intake.json [uitvoer.json]
// Inlezen in de app: tab Start of Gegevens, "Back-up inlezen". Alle stappen staan daarna nog open (niets is bevestigd).
// De uitvoer komt standaard in reizen/ (staat in .gitignore: persoonlijke reisgegevens horen niet in de openbare repo).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VERTREK = ['FRA', 'DUS', 'AMS', 'BRU'];
const hier = path.dirname(fileURLToPath(import.meta.url));
/* luchthavenlijst uit reisgids.html: [code, naam, land, breedtegraad, lengtegraad] */
const lijstTekst = readFileSync(path.join(hier, '..', 'reisgids.html'), 'utf8').match(/const LUCHTHAVENS = (\[[\s\S]*?\n\]);/);
if (!lijstTekst) throw new Error('LUCHTHAVENS niet gevonden in reisgids.html');
const LUCHTHAVENS = new Function(`return ${lijstTekst[1]}`)();
const norm = x => (x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ');
const km = (a, b) => { const r = Math.PI / 180, dl = (b[4] - a[4]) * r, p1 = a[3] * r, p2 = b[3] * r, x = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
function bestemmingenVoorPlaats(plaats, straal = 500, max = 15) {
  const n = norm(plaats).trim(), tr = LUCHTHAVENS.filter(l => norm(`${l[1]} ${l[2]} ${l[0]}`).includes(n)).sort((a, b) => (norm(a[1]).startsWith(n) ? 0 : 1) - (norm(b[1]).startsWith(n) ? 0 : 1));
  if (!n || !tr.length) throw new Error(`Geen luchthaven gevonden voor "${plaats}"`);
  return { voorkeur: tr[0][0], bestemmingen: LUCHTHAVENS.map(l => ({ code: l[0], naam: l[1], km: Math.round(km(tr[0], l)) })).filter(x => x.km <= straal).sort((a, b) => a.km - b.km).slice(0, max) };
}

const [invoer, uitvoer] = process.argv.slice(2);
if (!invoer) { console.error('Gebruik: node scripts/intake-naar-reisgids.mjs intake.json [uitvoer.json]'); process.exit(1); }
const i = JSON.parse(readFileSync(invoer, 'utf8'));
const g = (o, k, d = null) => (o && o[k] !== undefined && o[k] !== '' ? o[k] : d);
const num = v => (v === '' || v == null || !isFinite(+v)) ? null : +v;
const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const notities = [];

const r = i.reis || {}, v = i.vlucht || {}, k = i.reiskosten || {}, a = i.auto || {}, h = i.hotels || {}, o = i.overig || {};

/* luchthavens binnen de straal van de gekozen plaats (uit de lijst van de planner) */
let naar = '';
try { naar = bestemmingenVoorPlaats(r.plaats, num(v.straal1) || 500, 15).bestemmingen.map(x => x.code).join(', '); }
catch (e) { notities.push(`Geen luchthavens gevonden voor "${r.plaats}": vul de aankomstluchthavens zelf in (${e.message}).`); }

/* interesses (vrije tekst) naar de keuzes in de app */
const tekst = String(o.interesses || '').toLowerCase(), ints = new Set();
for (const [re, sleutel] of [[/histor|architect|stad|steden/, 'stad'], [/museum|musea/, 'musea'], [/casino|theater|festival/, 'uitgaan'], [/strand|wandel|natuur/, 'strand'], [/muziek|jazz|rock|country/, 'muziek'], [/\bbar\b|caf[eé]|eten|restaurant/, 'eten'], [/sport|rodeo/, 'sport'], [/shop|winkel|outlet/, 'winkelen'], [/rust|comfort/, 'rust']]) if (re.test(tekst)) ints.add(sleutel);
if (/\bbar\b|caf[eé]/.test(tekst)) ints.add('uitgaan');

/* wat de app (nog) niet kent, noteren we in plaats van weg te laten */
const vluchtNotitie = [
  v.maaltijden ? 'Maaltijden en drankjes moeten inbegrepen zijn.' : '', v.stoelenNaastElkaar ? 'Stoelen naast elkaar.' : '', v.stoelZonderVreemde ? 'Liefst niemand naast ons (geen vreemde naast ons).' : '', v.achterin ? 'Liefst achterin.' : '',
  v.stoelPrioriteit ? `Bij botsende stoelwensen telt: ${v.stoelPrioriteit}.` : '', v.openJaw === 'nee' ? 'Heen en terug op dezelfde luchthaven (geen open jaw).' : v.openJaw ? `Open jaw: ${v.openJaw}.` : '',
  num(v.minOverstaptijd) != null ? `Minimale overstaptijd ${v.minOverstaptijd} uur.` : '', num(v.minBesparing) != null ? `Overstap alleen als het minstens € ${v.minBesparing} goedkoper is dan rechtstreeks.` : '', v.wijzigbaar === false ? 'Wijzigbaar tarief niet nodig.' : '', v.aankomstVoor ? `Aankomst vóór ${v.aankomstVoor}.` : ''
].filter(Boolean).join(' ');
if (num(h.prijsRuimte) != null) notities.push(`Uw intake had ${h.prijsRuimte}% prijsruimte (€ ${Math.round(100 * (1 + h.prijsRuimte / 100))}); de app gebruikt uw latere afspraak: normaal max. € 100, uitzondering tot € 150 alleen na uw bevestiging per plaats.`);
if (h.versoepelVolgorde) notities.push(`Versoepelen van de waardering (Booking ${h.minWaarderingSoepel}, Google ${h.minGoogleSoepel}) kent de app niet: de eisen blijven Booking ${h.minWaardering} en Google ${h.minGoogle}.`);
if (h.stops && h.stops.some(x => x.plaats)) notities.push('Plaatsen uit de intake zijn niet overgenomen; geef ze op in stap 4.');
if (num(o.wandelen) != null) notities.push(`Wandelen: ${o.wandelen} (eenheid onbekend) is als wens genoteerd.`);

const trip = {
  id, naam: r.naam || 'Reis uit intake', gemaakt: new Date().toISOString(), demo: false, bevestigd: {},
  reis: { landen: /\bvs\b|usa|verenigde|amerika/i.test(`${r.naam} ${r.plaats}`) ? 'Verenigde Staten' : '', startplaats: r.plaats || '', volw: num(r.personen) || 2, kind: 0, tempo: o.tempo || 'normaal', valuta: 'EUR', budget: num(o.totaalBudget),
    wensen: [o.interesses ? `Interesses: ${o.interesses}.` : '', num(o.wandelen) != null ? `Wandelen: ${o.wandelen}.` : '', o.notities || ''].filter(Boolean).join(' ') },
  vlucht: { nodig: true, zoekVan: VERTREK.join(', '), zoekNaar: naar, zoekPlaats: r.plaats || '', straal: num(v.straal1) || 500, maandVan: (r.periodeVan || '').slice(0, 7), maandTot: (r.periodeTot || '').slice(0, 7), exactVan: r.periodeVan || '', exactTot: r.periodeTot || '',
    dagenMin: num(r.duurMin), dagenMax: num(r.duurMax), maxStops: v.maxOverstappen === 0 ? '0' : v.maxOverstappen === 1 ? '1' : v.maxOverstappen === 2 ? '2' : '', maxUren: num(v.maxUren), maxPrijsUsd: null,
    bagage: '1 koffer van 23 kg per persoon', liters: num(k.liters) ?? 30, literprijs: num(k.literprijs) ?? 2.45, parkeren: num(k.parkeren) ?? 200, notitie: vluchtNotitie },
  auto: { land: /\bvs\b|usa|verenigde|amerika/i.test(`${r.naam} ${r.plaats}`) ? 'Verenigde Staten' : '', klasse: a.klasse || 'intermediate', versnelling: a.automaat === false ? 'maakt niet uit' : 'automaat', kmType: a.km === false ? 'beperkt' : 'onbeperkt',
    brandstofBeleid: a.brandstof === false ? 'anders' : 'vol-vol', verzekeringKeuze: a.verzekering === false ? 'basis' : 'volledig', tweede: !!a.extraBestuurder,
    notitie: [a.afleveren === 'zelfde' ? 'Inleveren op dezelfde locatie.' : a.afleverPlaats ? `Inleveren in ${a.afleverPlaats}.` : '', a.oneWayToeslagOk === false ? 'Geen eenrichtingstoeslag gewenst.' : '', num(a.maxDagprijs) != null ? `Maximale dagprijs € ${a.maxDagprijs}.` : ''].filter(Boolean).join(' ') },
  hotels: { crit: { maxPrijs: num(h.prijsDoel) ?? 100, maxUitz: 150, minBooking: num(h.minWaardering) ?? 8, minGoogle: num(h.minGoogle) ?? 4, ontbijt: h.ontbijt === false ? 'nee' : 'ja', badkamer: h.badkamer === false ? 'nee' : 'ja', wifi: h.wifi === false ? 'nee' : 'ja', parkeren: h.parkeerHotel === false ? 'nee' : 'ja',
    ligging: [h.buurt ? `${h.buurt} buurt` : '', h.buitenCentrum ? 'buiten het centrum is toegestaan' : ''].filter(Boolean).join('; '), wensen: [h.airco ? 'airco' : '', h.lift ? 'lift' : ''].filter(Boolean).join(' en ') + (h.airco || h.lift ? ' gewenst' : '') }, lijst: [] },
  gids: { interesses: [...ints], maxKm: num(h.maxKmPerVerplaatsing), maxUren: num(h.maxRijuren), rustdagen: o.rustdag ? 'ja, rustdag(en) inplannen' : '', extra: o.bufferDag ? 'Bufferdag inplannen.' : '' },
  prakt: { ipr: !!o.rijbewijs }
};

const bestand = uitvoer || path.join('reizen', `${(trip.naam || 'reis').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`);
mkdirSync(path.dirname(bestand), { recursive: true });
writeFileSync(bestand, JSON.stringify({ versie: 1, gemaakt: new Date().toISOString(), actief: id, reizen: { [id]: trip }, fotos: {} }, null, 2));
console.log(`Geschreven: ${bestand}`);
console.log(`Aankomstluchthavens binnen ${num(v.straal1) || 500} km van ${r.plaats}: ${naar || '(geen)'}`);
console.log(`Vertrek: ${trip.vlucht.zoekVan} · periode ${r.periodeVan} t/m ${r.periodeTot} · ${r.duurMin}-${r.duurMax} dagen · ${trip.reis.volw} personen`);
notities.forEach(n => console.log('LET OP: ' + n));
