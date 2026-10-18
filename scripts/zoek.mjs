// Gebruik: node scripts/zoek.mjs FRA LIS 2027-03-10 2027-04-02 [--prijs=pp|totaal]
import { mkdirSync, writeFileSync } from 'node:fs';
import { startBrowser, laadResultaten } from './browser.mjs';
import { zoekUrl, leesAanbod, kiesBeste, euro, dagenTussen } from './lib.mjs';

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const vlag = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => a.slice(2).split('=')));
const [van, naar, heen, terug] = args;
if (!terug) { console.error('Gebruik: node scripts/zoek.mjs VAN NAAR HEEN TERUG [--prijs=pp|totaal]'); process.exit(1); }
const d = dagenTussen(heen, terug);
if (d < 21 || d > 25) console.warn(`Let op: ${d} dagen, gewenst 21 tot 25.`);

const ctx = await startBrowser();
const page = ctx.pages()[0] ?? await ctx.newPage();
const url = zoekUrl(van, naar, heen, terug);
await laadResultaten(page, url, true);
const tekst = await page.innerText('body');
const aanbod = leesAanbod(tekst, { prijsBasis: vlag.prijs ?? 'pp' });
const { beste } = kiesBeste(aanbod);
mkdirSync('resultaten', { recursive: true });
const naam = `resultaten/${van}-${naar}-${heen}-${terug}`;
writeFileSync(`${naam}.txt`, `${url}\n\n${tekst}`);
writeFileSync(`${naam}.json`, JSON.stringify({ van, naar, heen, terug, url, aanbod, beste }, null, 2));
await page.screenshot({ path: `${naam}.png` });
console.log(`${aanbod.length} aanbiedingen gevonden. Beste volgens regel: ${beste ? `${euro(beste.totaal)} (${beste.direct ? 'rechtstreeks' : 'overstap, ' + beste.uren + ' uur'})` : 'geen'}`);
console.log(`Bewaard in ${naam}.json/.txt/.png. Klopt het niet met het scherm? Laat Claude het .txt-bestand lezen.`);
await ctx.close();
