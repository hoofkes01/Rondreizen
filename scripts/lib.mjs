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
export const plusDagen = (d, n) => { const t = new Date(d + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
// Datums in een periode, elke `stap` dagen (altijd inclusief de eerste datum).
export const datumsInPeriode = (van, tot, stap = 7) => { const r = []; for (let d = van; d <= tot; d = plusDagen(d, stap)) r.push(d); return r; };
export const dagenTussen = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

const getal = s => parseInt(String(s).replace(/\./g, ''), 10);

// Leest losse aanbiedingen uit de paginatekst. Ongeverifieerd tegen de echte site: controleer in een testrun.
// prijsBasis: 'pp' (prijs per persoon, wordt x2) of 'totaal' (al voor 2 personen).
export function leesAanbod(tekst, { prijsBasis = 'pp', personen = 2 } = {}) {
  const regels = tekst.split('\n').map(r => r.trim()).filter(Boolean);
  const uit = [];
  let vorige = -1;
  regels.forEach((r, i) => {
    const p = r.match(/^€\s?([\d.]{2,7})(?!\d)/) || r.match(/€\s?([\d.]{2,7})\s*$/);
    if (!p) return;
    const prijs = getal(p[1]); if (!(prijs >= 30)) return;
    const blok = regels.slice(Math.max(vorige + 1, i - 25), i + 1).join(' | ');
    vorige = i;
    const duren = [...blok.matchAll(/(\d{1,2})\s*(?:u|uur|h)\.?(?:\s*(\d{1,2})(?:\s*(?:min|m))?)?(?!\d)/gi)]
      .map(d => Math.round((+d[1] + (d[2] ? +d[2] / 60 : 0)) * 10) / 10);
    const uren = duren.length ? Math.max(...duren) : null; // langste vliegtijd van heen en terug (conservatief)
    const direct = /\b(directe? vlucht|rechtstreeks|direct)\b/i.test(blok) && !/\d\s*(tussenstop|stop|overstap)/i.test(blok);
    uit.push({ totaal: prijsBasis === 'pp' ? prijs * personen : prijs, uren, direct, ruw: blok.slice(0, 200) });
  });
  const gezien = new Set();
  return uit.filter(o => { const k = `${o.totaal}|${o.uren}|${o.direct}`; if (gezien.has(k)) return false; gezien.add(k); return true; });
}

// Jouw regels: vliegtijd maximaal 14 uur per enkele reis (ook rechtstreeks). Rechtstreeks heeft voorkeur;
// overstap alleen als minstens 200 (100 p.p.) goedkoper dan de goedkoopste rechtstreekse vlucht naar dezelfde bestemming.
export function kiesBeste(aanbod, { maxUren = 14, minBesparing = 200 } = {}) {
  const afgekeurd = [], geldig = [];
  aanbod.forEach(o => {
    if (o.uren > maxUren) return afgekeurd.push({ ...o, reden: `vliegtijd ${o.uren} uur is meer dan ${maxUren} uur` });
    if (!o.direct && !(o.uren > 0)) return afgekeurd.push({ ...o, reden: 'reistijd onbekend' });
    geldig.push(o);
  });
  const basis = geldig.filter(o => o.direct).sort((a, c) => a.totaal - c.totaal)[0]?.totaal ?? null;
  const directe = geldig.filter(o => o.direct).sort((a, c) => a.totaal - c.totaal);
  const indirect = geldig.filter(o => !o.direct).sort((a, c) => a.totaal - c.totaal);
  indirect.filter(o => basis !== null && o.totaal > basis - minBesparing)
    .forEach(o => afgekeurd.push({ ...o, reden: `minder dan ${minBesparing} goedkoper dan rechtstreeks` }));
  const bruikbaar = indirect.filter(o => basis === null || o.totaal <= basis - minBesparing);
  return { beste: bruikbaar[0] ?? directe[0] ?? null, afgekeurd };
}

export const euro = n => '€ ' + Math.round(n).toLocaleString('nl-NL');

// Fase 1 (alleen Frankfurt): zoekt binnen de periode de goedkoopste data. `zoek(van, naar, heen, terug)` geeft
// { heen, terug, naar, beste } terug (beste = null als er niets bruikbaars is).
export async function fase1Data({ zoek, voorkeur, andere = [], van, tot, duurMin, duurMax, stap = 7, log = () => {} }) {
  const prijs = r => r?.beste?.totaal ?? Infinity;
  const midden = Math.round((duurMin + duurMax) / 2);
  const heenIn = d => d >= van && d <= tot;
  log('Fase 1a: grove scan vanaf Frankfurt');
  const scan = [];
  for (const h of datumsInPeriode(van, tot, stap)) scan.push(await zoek('FRA', voorkeur, h, plusDagen(h, midden)));
  const top2 = scan.filter(r => r.beste).sort((a, b) => prijs(a) - prijs(b)).slice(0, 2);
  if (!top2.length) return null;
  log('Fase 1b: verfijnen rond de goedkoopste heendatums');
  const kandidaten = [...scan];
  for (const t of top2) for (let o = -3; o <= 3; o++) {
    const h = plusDagen(t.heen, o);
    if (o && heenIn(h) && !kandidaten.some(k => k.heen === h)) kandidaten.push(await zoek('FRA', voorkeur, h, plusDagen(h, midden)));
  }
  const beste1 = kandidaten.filter(r => r.beste).sort((a, b) => prijs(a) - prijs(b))[0];
  log('Fase 1c: reisduur op de beste heendatum');
  const duren = kandidaten.filter(r => r.heen === beste1.heen);
  for (let n = duurMin; n <= duurMax; n++) if (n !== midden) duren.push(await zoek('FRA', voorkeur, beste1.heen, plusDagen(beste1.heen, n)));
  const top = duren.filter(r => r.beste).sort((a, b) => prijs(a) - prijs(b))[0];
  log(`Fase 1d: andere luchthavens op ${top.heen} → ${top.terug}`);
  const fra = [top];
  for (const code of andere) if (code !== voorkeur) fra.push(await zoek('FRA', code, top.heen, top.terug));
  return { scan, top, fra };
}
