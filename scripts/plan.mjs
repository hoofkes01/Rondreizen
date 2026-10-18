// Twee fasen, zoals afgesproken.
// Gebruik: node scripts/plan.mjs --plaats=Denver --data=2027-03-10:2027-04-02,2027-03-17:2027-04-09
//          [--straal=500] [--straal2=1000] [--max2=20] [--prijs=pp|totaal]
// Fase 1: alleen vanaf Frankfurt, alle luchthavens binnen --straal van de plaats, voor alle datumparen.
//         Uitkomst: de goedkoopste data.
// Fase 2: pas dan, op die data: alle vier de vertrekluchthavens (ook Frankfurt) naar alle aankomstluchthavens
//         binnen --straal2 (standaard 1000 km) van de plaats. Dat geeft de beste combinatie, ook als de rondreis
//         op een andere plek in het gebied begint.
import { mkdirSync, writeFileSync } from 'node:fs';
import { startBrowser, laadResultaten } from './browser.mjs';
import { bestemmingenVoorPlaats, zoekUrl, leesAanbod, kiesBeste, euro, dagenTussen, VERTREK } from './lib.mjs';

const v = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, ...r] = a.slice(2).split('='); return [k, r.join('=')]; }));
if (!v.plaats || !v.data) { console.error('Gebruik: --plaats=Denver --data=HEEN:TERUG,HEEN:TERUG'); process.exit(1); }
const paren = v.data.split(',').map(s => s.split(':'));
paren.forEach(([h, t]) => { const d = dagenTussen(h, t); if (d < 21 || d > 25) { console.error(`Datumpaar ${h}:${t} is ${d} dagen; moet 21 tot 25 zijn.`); process.exit(1); } });
const straal1 = +(v.straal || 500), straal2 = +(v.straal2 || 1000), max2 = +(v.max2 || 20);
const fase1 = bestemmingenVoorPlaats(v.plaats, straal1, 15);
const fase2 = bestemmingenVoorPlaats(v.plaats, straal2, max2);
const aantal1 = fase1.bestemmingen.length * paren.length;
const aantal2 = VERTREK.length * fase2.bestemmingen.length;
console.log(`Voorkeur: ${fase1.voorkeur}`);
console.log(`Fase 1 (FRA, ${straal1} km): ${fase1.bestemmingen.map(b => b.code).join(', ')}  → ${aantal1} pagina's`);
console.log(`Fase 2 (alle vertrekpunten, ${straal2} km): ${fase2.bestemmingen.map(b => b.code).join(', ')}  → maximaal ${aantal2} pagina's`);
if (fase2.bestemmingen.length >= max2) console.log(`Let op: lijst begrensd op ${max2} aankomstluchthavens (--max2). Verhoog als je meer wilt.`);

const ctx = await startBrowser();
const page = ctx.pages()[0] ?? await ctx.newPage();
mkdirSync('resultaten', { recursive: true });
const gedaan = new Map();
let eerste = true;

async function zoek(van, naar, heen, terug) {
  const sleutel = `${van}-${naar}-${heen}-${terug}`;
  if (gedaan.has(sleutel)) return gedaan.get(sleutel);
  const url = zoekUrl(van, naar, heen, terug);
  await laadResultaten(page, url, eerste); eerste = false;
  const tekst = await page.innerText('body');
  const aanbod = leesAanbod(tekst, { prijsBasis: v.prijs || 'pp' });
  const { beste } = kiesBeste(aanbod);
  writeFileSync(`resultaten/${sleutel}.txt`, `${url}\n\n${tekst}`);
  console.log(`  ${van}→${naar} ${heen}: ${aanbod.length} aanbiedingen, beste ${beste ? euro(beste.totaal) + (beste.direct ? ' direct' : ` overstap ${beste.uren}u`) : 'geen'}`);
  const r = { van, naar, heen, terug, url, beste, aantal: aanbod.length };
  gedaan.set(sleutel, r);
  return r;
}

console.log('\nFase 1: alleen Frankfurt');
const fra = [];
for (const b of fase1.bestemmingen) for (const [h, t] of paren) fra.push(await zoek('FRA', b.code, h, t));
const metPrijs = fra.filter(r => r.beste).sort((a, b) => a.beste.totaal - b.beste.totaal);
if (!metPrijs.length) { console.log('Niets uitleesbaar. Laat Claude de .txt-bestanden in resultaten/ lezen.'); await ctx.close(); process.exit(0); }
const top = metPrijs[0];
console.log(`Goedkoopste data vanaf FRA: ${top.heen} → ${top.terug} (${top.naar}, ${euro(top.beste.totaal)})`);

console.log(`\nFase 2: ${top.heen} → ${top.terug}, alle vertrekpunten naar alle aankomsten binnen ${straal2} km`);
const alle = [];
for (const van of VERTREK) for (const b of fase2.bestemmingen) alle.push(await zoek(van, b.code, top.heen, top.terug));
const rang = alle.filter(r => r.beste).sort((a, b) => a.beste.totaal - b.beste.totaal);

const km = Object.fromEntries(fase2.bestemmingen.map(b => [b.code, b.km]));
console.log('\nTop 10 (zelfde data):');
rang.slice(0, 10).forEach((r, i) => console.log(`${i === 0 ? '→' : ' '} ${r.van}→${r.naar} (${km[r.naar]} km van ${fase1.voorkeur}): ${euro(r.beste.totaal)} ${r.beste.direct ? 'rechtstreeks' : `overstap, ${r.beste.uren} uur`}  ${r.url}`));
// Prijsverschil per aankomstluchthaven en vertrekpunt, voor de gekozen data (t.o.v. Frankfurt en t.o.v. de goedkoopste)
console.log('\nPrijsverschil per aankomst (Δ t.o.v. Frankfurt, * = goedkoopste vertrekpunt voor die aankomst):');
const kop = ['Aankomst'.padEnd(26), ...VERTREK.map(x => x.padStart(18))].join('');
console.log(kop);
const tabel = [];
for (const b of fase2.bestemmingen) {
  const rij = Object.fromEntries(VERTREK.map(x => [x, alle.find(r => r.van === x && r.naar === b.code)?.beste ?? null]));
  const prijzen = VERTREK.map(x => rij[x]?.totaal).filter(n => n > 0);
  if (!prijzen.length) continue;
  const laagste = Math.min(...prijzen), fraP = rij.FRA?.totaal;
  const cel = x => {
    const o = rij[x]; if (!o) return '-'.padStart(18);
    const delta = x === 'FRA' || fraP == null ? '' : ` (${o.totaal - fraP >= 0 ? '+' : '-'}${euro(Math.abs(o.totaal - fraP)).slice(2)})`;
    return `${o.totaal === laagste ? '*' : ' '}${euro(o.totaal)}${delta}${o.direct ? '' : ' ov'}`.padStart(18);
  };
  console.log(`${(b.naam + ' ' + b.code).slice(0, 25).padEnd(26)}${VERTREK.map(cel).join('')}`);
  tabel.push({ aankomst: b.code, laagste, perVertrek: Object.fromEntries(VERTREK.map(x => [x, rij[x]?.totaal ?? null])) });
}
console.log('ov = met overstap');

const zonder = alle.filter(r => !r.beste).map(r => `${r.van}→${r.naar}`);
if (zonder.length) console.log(`\nGeen uitleesbaar resultaat voor: ${zonder.join(', ')}`);
writeFileSync(`resultaten/uitkomst-${v.plaats}.json`, JSON.stringify({ plaats: v.plaats, straal1, straal2, fase1: fra, fase2: alle, verschillen: tabel }, null, 2));
await ctx.close();
