// Gedeelde logica: luchthavens (uit index.html), straal, URL, uitlezen van resultaten en de regels.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const VERTREK = ['FRA', 'DUS', 'AMS', 'BRU'];
const hier = path.dirname(fileURLToPath(import.meta.url));

export function laadLuchthavens() {
  const html = readFileSync(path.join(hier, '..', 'index.html'), 'utf8');
  const m = html.match(/const LUCHTHAVENS = (\[[\s\S]*?\n\]);/);
  if (!m) throw new Error('LUCHTHAVENS niet gevonden in index.html');
  return new Function(`return ${m[1]}`)();
}

const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ');

export function afstandKm(a, b) {
  const r = Math.PI / 180, dl = (b[4] - a[4]) * r, p1 = a[3] * r, p2 = b[3] * r;
  const x = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
}

// Zoekt de plaats en geeft de voorkeursluchthaven plus alle luchthavens binnen de straal (dichtstbij eerst).
export function bestemmingenVoorPlaats(plaats, straal = 500, max = 15) {
  const alle = laadLuchthavens(), n = norm(plaats).trim();
  const treffers = alle.filter(l => norm(`${l[1]} ${l[2]} ${l[0]}`).includes(n))
    .sort((a, b) => (norm(a[1]).startsWith(n) ? 0 : 1) - (norm(b[1]).startsWith(n) ? 0 : 1));
  if (!treffers.length) throw new Error(`Geen luchthaven gevonden voor "${plaats}"`);
  const voorkeur = treffers[0];
  const dichtbij = alle.map(l => ({ code: l[0], naam: l[1], land: l[2], km: Math.round(afstandKm(voorkeur, l)) }))
    .filter(x => x.km <= straal).sort((a, b) => a.km - b.km).slice(0, max);
  return { voorkeur: voorkeur[0], bestemmingen: dichtbij };
}

const yymmdd = d => d.slice(2, 4) + d.slice(5, 7) + d.slice(8, 10);
export const zoekUrl = (van, naar, heen, terug) =>
  `https://www.skyscanner.nl/transport/vliegtickets/${van.toLowerCase()}/${naar.toLowerCase()}/${yymmdd(heen)}/${yymmdd(terug)}/?adultsv2=2&cabinclass=economy&preferdirects=true&currency=EUR&rtn=1`;
export const dagenTussen = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

const getal = s => parseInt(String(s).replace(/\./g, ''), 10);

// Leest losse aanbiedingen uit de paginatekst. Ongeverifieerd tegen de echte site: controleer in een testrun.
// prijsBasis: 'pp' (prijs per persoon, wordt x2) of 'totaal' (al voor 2 personen).
export function leesAanbod(tekst, { prijsBasis = 'pp', personen = 2 } = {}) {
  const regels = tekst.split('\n').map(r => r.trim()).filter(Boolean);
  const uit = [];
  regels.forEach((r, i) => {
    const p = r.match(/^€\s?([\d.]{2,7})(?!\d)/) || r.match(/€\s?([\d.]{2,7})\s*$/);
    if (!p) return;
    const prijs = getal(p[1]); if (!(prijs >= 30)) return;
    const blok = regels.slice(Math.max(0, i - 14), i + 3).join(' | ');
    const dur = blok.match(/(\d{1,2})\s*(?:u|uur|h)\.?(?:\s*(\d{1,2})(?:\s*(?:min|m))?)?(?!\d)/i);
    const uren = dur ? Math.round((+dur[1] + (dur[2] ? +dur[2] / 60 : 0)) * 10) / 10 : null;
    const direct = /\b(directe? vlucht|rechtstreeks|direct)\b/i.test(blok) && !/\d\s*(tussenstop|stop|overstap)/i.test(blok);
    uit.push({ totaal: prijsBasis === 'pp' ? prijs * personen : prijs, uren, direct, ruw: blok.slice(0, 200) });
  });
  const gezien = new Set();
  return uit.filter(o => { const k = `${o.totaal}|${o.uren}|${o.direct}`; if (gezien.has(k)) return false; gezien.add(k); return true; });
}

// Jouw regel: rechtstreeks heeft voorkeur; overstap alleen bij max 15 uur EN minstens 200 (100 p.p.) goedkoper.
export function kiesBeste(aanbod, { maxUren = 15, minBesparing = 200 } = {}) {
  const directe = aanbod.filter(o => o.direct).sort((a, b) => a.totaal - b.totaal);
  const basis = directe[0]?.totaal ?? null;
  const afgekeurd = [], geldig = [];
  aanbod.forEach(o => {
    if (o.direct) return geldig.push(o);
    if (!(o.uren > 0)) return afgekeurd.push({ ...o, reden: 'reistijd onbekend' });
    if (o.uren > maxUren) return afgekeurd.push({ ...o, reden: `langer dan ${maxUren} uur` });
    if (basis !== null && o.totaal > basis - minBesparing) return afgekeurd.push({ ...o, reden: `minder dan ${minBesparing} goedkoper dan rechtstreeks` });
    geldig.push(o);
  });
  const goedkoopstIndirect = geldig.filter(o => !o.direct).sort((a, b) => a.totaal - b.totaal)[0];
  const goedkoopstDirect = geldig.filter(o => o.direct).sort((a, b) => a.totaal - b.totaal)[0];
  const beste = goedkoopstIndirect && (!goedkoopstDirect || goedkoopstIndirect.totaal <= basis - minBesparing) ? goedkoopstIndirect : goedkoopstDirect;
  return { beste: beste ?? null, afgekeurd };
}

export const euro = n => '€ ' + Math.round(n).toLocaleString('nl-NL');
