// Browsertest voor reisgids.html (npm run test:gids). Vereist Playwright + Chromium.
// Gebruikt geen internet: plaats-, weer- en koersaanroepen worden nagebootst.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';


// geldige PNG (effen rood) zonder extra pakketten
import { deflateSync } from 'node:zlib';
function maakPng(b, h) {
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = buf => { let c = 0xffffffff; for (const x of buf) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const blok = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(b, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const rij = Buffer.concat([Buffer.from([0]), Buffer.from(Array(b).fill([200, 30, 30]).flat())]);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), blok('IHDR', ihdr), blok('IDAT', deflateSync(Buffer.concat(Array(h).fill(rij)))), blok('IEND', Buffer.alloc(0))]);
}

const hier = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(hier, '..', 'reisgids.html')).href;
let fouten = 0, ok = 0;
const check = (naam, waar, extra = '') => { if (waar) { ok++; console.log('  ok   ' + naam); } else { fouten++; console.log('  FOUT ' + naam + (extra ? ' – ' + extra : '')); } };
const bijna = (a, b) => Math.abs(a - b) < 0.01;

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const consoleFouten = [];
page.on('pageerror', e => consoleFouten.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/ERR_INTERNET_DISCONNECTED/.test(m.text())) consoleFouten.push('console: ' + m.text()); });
await page.route('https://geocoding-api.open-meteo.com/**', r => r.fulfill({ json: { results: [{ name: 'Lissabon', admin1: 'Lissabon', country: 'Portugal', latitude: 38.72, longitude: -9.14, timezone: 'Europe/Lisbon' }] } }));
await page.route('https://api.open-meteo.com/**', r => r.fulfill({ json: { timezone: 'Europe/Lisbon', daily: { time: ['x'], temperature_2m_min: [11.2], temperature_2m_max: [19.8], precipitation_sum: [0.4], wind_speed_10m_max: [22] } } }));
await page.route('https://archive-api.open-meteo.com/**', r => r.fulfill({ json: { timezone: 'Europe/Lisbon', daily: { time: ['x'], temperature_2m_min: [8], temperature_2m_max: [15], precipitation_sum: [2], wind_speed_10m_max: [30] } } }));
await page.route('https://api.frankfurter.dev/**', r => r.fulfill({ json: { date: '2026-10-23', rates: { USD: 1.1 } } }));

console.log('Start en demo');
await page.goto(url);
check('pagina laadt met Start-tab', await page.locator('h2:has-text("Welkom")').count() === 1);
await page.click('[data-a=demo]');
check('demo-reis geladen en als DEMO gemarkeerd', (await page.textContent('#app')).includes('DEMO – verzonnen gegevens'));

console.log('Kosten (handmatig nagerekend)');
const k = await page.evaluate(() => { const t = __rr.T(), R = __rr.kostenRegels(t), s = __rr.kostenSom(R); return { R: R.map(x => [x.key.split('-').slice(0, 2).join('-'), x.b]), s }; });
const val = key => k.R.find(x => x[0] === key)?.[1];
check('vlucht 480', val('vlucht') === 480);
check('brandstof naar luchthaven 30 x 2,45 = 73,50', bijna(val('vlucht-brandstof'), 73.5));
check('auto-brandstof 630 km x 6/100 x 1,90 = 71,82', bijna(val('auto-brandstof'), 71.82));
check('hotel Lissabon 2 x 95 + 2 x 15 parkeren = 220', k.R.filter(x => x[0] === 'hotel-' + k.R[0][0].slice(0, 0) || x[0].startsWith('hotel')).some(x => x[1] === 220));
check('hotel Porto 2 x 85 + ontbijt 9 x 2 pers. x 2 nachten = 206', k.R.some(x => x[0].startsWith('hotel') && x[1] === 206));
check('activiteiten 12 x 2 pers. = 24', val('gids-act') === 24);
check('eten 5 dagen x (15+30) x 2 = 450', val('gids-eten') === 450);
check('buffer 10% over bekende bedragen', bijna(val('buffer'), 191.532));
check('totaal bekend = 2.106,85', bijna(k.s.bekend, 2106.852), String(k.s.bekend));
check('4 onbekende extra posten worden niet als 0 geteld', k.s.onb === 4, String(k.s.onb));

console.log('Hotelreviews en tijdzones');
const ho = await page.evaluate(() => { const t = __rr.T(); return t.hotels.lijst.map(h => __rr.hotelOordeel(t, h).s); });
check('hotel 1 (6,7% negatief, beide bronnen >= 25): aanbevolen', ho[0] === 'aanbevolen', ho[0]);
check('hotel 2 (Google 20% negatief): afgewezen, ondanks onvoldoende Booking-data', ho[1] === 'afgewezen', ho[1]);
const onv = await page.evaluate(() => { const t = __rr.T(), h = { ...t.hotels.lijst[0], bN: 10, bNeg: 0 }; const o = __rr.hotelOordeel(t, h); const h2 = { ...h, gN: null }; return [o.s, __rr.hotelOordeel(t, h2).s, __rr.hotelOordeel(t, h2).g.s, __rr.hotelOordeel(t, { ...h, bNeg: null, bN: 50 }).b.s]; });
check('24 reviews of minder = onvoldoende gegevens, niet stilzwijgend goed', onv[0] === 'onvoldoende gegevens', onv[0]);
check('ontbrekende reviewdata = niet verifieerbaar', onv[2] === 'niet verifieerbaar' && onv[3] === 'niet verifieerbaar', onv.join('|'));
const tz = await page.evaluate(() => [__rr.tzOffsetMin('America/Los_Angeles', '2027-03-13'), __rr.tzOffsetMin('America/Los_Angeles', '2027-03-14'), __rr.tzOffsetMin('Europe/Lisbon', '2027-05-10'), __rr.tzOffsetMin('Asia/Kolkata', '2027-05-10')]);
check('tijdzoneverschil neemt zomertijd mee (Los Angeles 13 en 14 maart 2027)', tz[0] === -480 && tz[1] === -420, tz.join(','));
check('Lissabon in mei = +60, Kolkata = +330', tz[2] === 60 && tz[3] === 330);
const wissel = await page.evaluate(() => { const t = __rr.T(); t.dagen[3].tz = 'America/New_York'; return __rr.tzWissel(t, 3); });
check('tijdzonewissel wordt gemeld', /Tijdzonewissel.*5 uur terug/.test(wissel || ''), wissel);
await page.evaluate(() => { __rr.T().dagen[3].tz = 'Europe/Lisbon'; });

console.log('Alle tabbladen, mobiel zonder horizontaal scrollen');
await page.setViewportSize({ width: 375, height: 800 });
for (const t of ['start', 'reis', 'vlucht', 'auto', 'verblijf', 'gids', 'route', 'dag', 'dagboek', 'kosten', 'boek', 'data']) {
  await page.evaluate(x => { location.hash = x; }, t);
  await page.reload();
  await page.waitForTimeout(150);
  const breed = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  check(`tab ${t}: past op 375 px (${breed[0]} <= ${breed[1]})`, breed[0] <= breed[1] + 1);
}
await page.setViewportSize({ width: 1100, height: 900 });

console.log('Invoer, opslag en verversen');
await page.evaluate(() => { location.hash = 'verblijf'; }); await page.reload();
const vOud = await page.textContent('[data-calc=kosten][data-o=Verblijf]');
await page.fill('#f_hotels_lijst_0_prijs', '100');
const vNieuw = await page.textContent('[data-calc=kosten][data-o=Verblijf]');
check('kostenbox rekent direct mee bij invoer', vOud !== vNieuw && vNieuw.includes('€'), vOud + ' => ' + vNieuw);
await page.waitForTimeout(400); await page.reload();
check('invoer blijft na verversen bestaan', (await page.inputValue('#f_hotels_lijst_0_prijs')) === '100');

console.log('Weer: gemockte bronnen, juiste etikettering');
await page.evaluate(() => { location.hash = 'dag'; }); await page.reload();
await page.click('[data-a=weer]');
await page.waitForTimeout(300);
check('datum ver in de toekomst: geen weer verzonnen', await page.evaluate(() => __rr.T().dagen[0].weer === null));
const wmeld = await page.textContent('#melding'); check('melding legt uit waarom er geen weer is', /geen betrouwbare voorspelling/.test(wmeld), wmeld);
await page.evaluate(() => { const d = __rr.T().dagen[0]; const v = new Date(); d.datum = new Date(v.getTime() + 2 * 864e5).toISOString().slice(0, 10); });
await page.click('[data-a=weer]'); await page.waitForTimeout(300);
check('voorspelling heet voorspelling, met bron en ophaalmoment', await page.evaluate(() => { const w = __rr.T().dagen[0].weer; return w && w.type === 'voorspelling' && w.bron.includes('Forecast') && !!w.opgehaald && w.tmax === 19.8; }));
await page.evaluate(() => { const d = __rr.T().dagen[0]; d.datum = new Date(Date.now() - 40 * 864e5).toISOString().slice(0, 10); });
await page.click('[data-a=weer]'); await page.waitForTimeout(300);
check('verleden: historische analyse, niet als voorspelling', await page.evaluate(() => __rr.T().dagen[0].weer.type === 'historisch'));
await page.evaluate(() => { __rr.T().dagen[0].datum = '2027-05-10'; __rr.T().dagen[0].weer = null; });
const stuk = r => r.abort('internetdisconnected');
await page.route('https://api.open-meteo.com/**', stuk); await page.route('https://geocoding-api.open-meteo.com/**', stuk);
await page.evaluate(() => { const d = __rr.T().dagen[0]; d.datum = new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10); });
await page.click('[data-a=weer]'); await page.waitForTimeout(400);
check('bron onbereikbaar: foutmelding, geen crash, geen gok', await page.evaluate(() => __rr.T().dagen[0].weer === null) && /mislukt/.test(await page.textContent('#melding')), await page.textContent('#melding'));
await page.unroute('https://api.open-meteo.com/**', stuk); await page.unroute('https://geocoding-api.open-meteo.com/**', stuk);
await page.evaluate(() => { __rr.T().dagen[0].datum = '2027-05-10'; });

console.log('Dagboek met foto');
await page.evaluate(() => { location.hash = 'dagboek'; }); await page.reload();
await page.fill('#f_dagen_0_dagboek_tekst', 'Mooie eerste dag in de stad.');
const png = join(mkdtempSync(join(tmpdir(), 'rr-')), 'foto.png');
writeFileSync(png, maakPng(16, 16));
await page.setInputFiles('input[type=file][data-ch=fotoToevoegen]', png);
await page.waitForSelector('img[data-foto]', { state: 'attached' });
await page.fill('input[data-b$=".fotos.0.cap"]', 'Eerste foto');
await page.waitForTimeout(400); await page.reload();
await page.waitForSelector('img[data-foto]', { state: 'attached' }); await page.waitForTimeout(300);
const geladen = await page.evaluate(async () => { const im = document.querySelector('img[data-foto]'); await im.decode().catch(() => { }); return im.naturalWidth; });
check('foto staat na verversen nog in IndexedDB en wordt getoond', geladen > 0, String(geladen));
check('onderschrift bewaard', (await page.inputValue('input[data-b$=".fotos.0.cap"]')) === 'Eerste foto');

console.log('Reisboek, PDF en back-up');
await page.evaluate(() => { location.hash = 'boek'; }); await page.reload();
await page.waitForSelector('#boekUit .voorblad');
await page.waitForTimeout(300);
const boek = await page.textContent('#boekUit');
for (const s of ['REISBOEK', 'Route in één oogopslag', 'Kostenoverzicht', 'Voorbereiding', 'Hotelbeoordeling', 'Dag 1 ·', 'Dag 5 ·', 'Mooie eerste dag', 'Eerste foto', 'Bronnen, peildata']) check(`reisboek bevat "${s}"`, boek.includes(s));
check('boekingsnummers staan standaard NIET in het reisboek', !(await page.evaluate(() => __rr.T().boek.refs)));
check('onbekende bedragen staan als "nog in te vullen"', boek.includes('nog in te vullen'));
const pdf = join(mkdtempSync(join(tmpdir(), 'rr-')), 'boek.pdf');
await page.emulateMedia({ media: 'print' });
await page.pdf({ path: pdf, format: 'A4', printBackground: true, margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' } });
const printKop = await page.evaluate(() => getComputedStyle(document.querySelector('header.top')).display);
await page.emulateMedia({ media: 'screen' });
const pb = readFileSync(pdf, 'latin1'); const paginas = (pb.match(/\/Type\s*\/Page[^s]/g) || []).length;
check(`PDF heeft meerdere A4-pagina's (voorblad + secties + 5 dagen): ${paginas}`, paginas >= 9, String(paginas));
console.log('  (pdf: ' + pdf + ')');
check('in printweergave verdwijnt de menubalk', printKop === 'none', printKop);
const [dl] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => { location.hash = 'data'; }).then(() => page.reload()).then(() => page.click('[data-a=export][data-f="1"]'))]);
const backup = JSON.parse(readFileSync(await dl.path(), 'utf8'));
check('back-up bevat reis en foto', Object.keys(backup.reizen).length === 1 && Object.keys(backup.fotos).length === 1);

console.log('Meer reizen en verwijderen');
await page.evaluate(() => { location.hash = 'start'; }); await page.reload();
page.once('dialog', d => d.accept('Tweede reis'));
await page.click('[data-a=nieuw]');
check('tweede reis aangemaakt en gekozen', await page.evaluate(() => Object.keys(__rr.DB().reizen).length === 2 && __rr.T().naam === 'Tweede reis'));
const leeg = await page.evaluate(() => { const t = __rr.T(), R = __rr.kostenRegels(t); return [__rr.kostenSom(R).bekend, R.some(x => x.b === 0)]; });
check('lege reis: geen bedragen verzonnen (geen € 0-posten behalve eigen invoer)', leeg[1] === false, JSON.stringify(leeg));

check('geen scriptfouten in de console', consoleFouten.length === 0, consoleFouten.join(' | '));
await browser.close();
console.log(`\n${ok} geslaagd, ${fouten} mislukt`);
process.exit(fouten ? 1 : 0);
