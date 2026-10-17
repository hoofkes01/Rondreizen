// Gebruik: node scripts/zoek.mjs FRA LIS 2027-03-10 2027-04-02
// Opent Skyscanner zichtbaar. Rond zelf de "ik ben geen robot"-controle af en stel eventueel
// het bagagefilter in; druk daarna op Enter in de terminal. Paginatekst en screenshot worden bewaard.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import readline from 'node:readline/promises';

const [van, naar, heen, terug] = process.argv.slice(2);
if (!van || !naar || !heen || !terug) { console.error('Gebruik: node scripts/zoek.mjs VAN NAAR HEEN TERUG'); process.exit(1); }
const yymmdd = d => d.slice(2, 4) + d.slice(5, 7) + d.slice(8, 10);
const url = `https://www.skyscanner.nl/transport/vliegtickets/${van.toLowerCase()}/${naar.toLowerCase()}/${yymmdd(heen)}/${yymmdd(terug)}/?adultsv2=2&cabinclass=economy&preferdirects=true&currency=EUR&rtn=1`;

const browser = await chromium.launch({ headless: false });
const page = await (await browser.newContext({ locale: 'nl-NL' })).newPage();
await page.goto(url);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
await rl.question('Rond de controle af, wacht tot de resultaten zichtbaar zijn en druk op Enter... ');
rl.close();

mkdirSync('resultaten', { recursive: true });
const naam = `resultaten/${van}-${naar}-${heen}-${terug}`;
writeFileSync(`${naam}.txt`, `${url}\n\n${await page.innerText('body')}`);
await page.screenshot({ path: `${naam}.png`, fullPage: true });
console.log(`Bewaard: ${naam}.txt en ${naam}.png`);
await browser.close();
