// Frankfurt-eerst-routine voor één plaats.
// Gebruik: node scripts/plan.mjs --plaats=Lissabon --data=2027-03-10:2027-04-02,2027-03-17:2027-04-09 [--straal=500] [--prijs=pp|totaal]
// 1) alle luchthavens binnen de straal vanaf FRA voor elke datumcombinatie; 2) voor de goedkoopste
// combinatie dezelfde bestemming en data vanaf DUS, AMS en BRU; 3) beste keuze volgens de regels.
import { mkdirSync, writeFileSync } from 'node:fs';
import { startBrowser, laadResultaten } from './browser.mjs';
import { bestemmingenVoorPlaats, zoekUrl, leesAanbod, kiesBeste, euro, dagenTussen } from './lib.mjs';

const v = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, ...r] = a.slice(2).split('='); return [k, r.join('=')]; }));
if (!v.plaats || !v.data) { console.error('Gebruik: --plaats=Lissabon --data=HEEN:TERUG,HEEN:TERUG'); process.exit(1); }
const paren = v.data.split(',').map(s => s.split(':'));
paren.forEach(([h, t]) => { const d = dagenTussen(h, t); if (d < 21 || d > 25) { console.error(`Datumpaar ${h}:${t} is ${d} dagen; moet 21 tot 25 zijn.`); process.exit(1); } });
const { voorkeur, bestemmingen } = bestemmingenVoorPlaats(v.plaats, +(v.straal || 500));
console.log(`Voorkeur: ${voorkeur}. Bestemmingen binnen ${v.straal || 500} km: ${bestemmingen.map(b => b.code).join(', ')}`);
console.log(`Aantal pagina's stap 1: ${bestemmingen.length * paren.length}`);

const ctx = await startBrowser();
const page = ctx.pages()[0] ?? await ctx.newPage();
mkdirSync('resultaten', { recursive: true });
let eerste = true;

async function zoek(van, naar, heen, terug) {
  const url = zoekUrl(van, naar, heen, terug);
  await laadResultaten(page, url, eerste); eerste = false;
  const tekst = await page.innerText('body');
  const aanbod = leesAanbod(tekst, { prijsBasis: v.prijs || 'pp' });
  const { beste } = kiesBeste(aanbod);
  writeFileSync(`resultaten/${van}-${naar}-${heen}-${terug}.txt`, `${url}\n\n${tekst}`);
  console.log(`  ${van}→${naar} ${heen}: ${aanbod.length} aanbiedingen, beste ${beste ? euro(beste.totaal) + (beste.direct ? ' direct' : ` overstap ${beste.uren}u`) : 'geen'}`);
  return { van, naar, heen, terug, url, beste, aantal: aanbod.length };
}

console.log('Stap 1: Frankfurt');
const fra = [];
for (const b of bestemmingen) for (const [h, t] of paren) fra.push(await zoek('FRA', b.code, h, t));
const metPrijs = fra.filter(r => r.beste).sort((a, b) => a.beste.totaal - b.beste.totaal);
if (!metPrijs.length) { console.log('Niets uitleesbaar. Laat Claude de .txt-bestanden in resultaten/ lezen.'); await ctx.close(); process.exit(0); }
const top = metPrijs[0];
console.log(`Goedkoopste vanaf FRA: ${top.naar} ${top.heen}→${top.terug} ${euro(top.beste.totaal)}`);

console.log('Stap 2: zelfde bestemming en data vanaf DUS, AMS, BRU');
const alle = [top];
for (const van of ['DUS', 'AMS', 'BRU']) alle.push(await zoek(van, top.naar, top.heen, top.terug));
const rang = alle.filter(r => r.beste).sort((a, b) => a.beste.totaal - b.beste.totaal);
console.log('\nUitkomst (zelfde bestemming en data):');
rang.forEach((r, i) => console.log(`${i === 0 ? '→' : ' '} ${r.van}: ${euro(r.beste.totaal)} ${r.beste.direct ? 'rechtstreeks' : `overstap, ${r.beste.uren} uur`}  ${r.url}`));
writeFileSync(`resultaten/uitkomst-${v.plaats}.json`, JSON.stringify({ plaats: v.plaats, fra, controle: alle }, null, 2));
await ctx.close();
