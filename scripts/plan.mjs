// Twee fasen, zoals afgesproken. Invoer: intake.json (uit intake.html) of vlaggen.
// Gebruik: node scripts/plan.mjs --intake=intake.json
//      of: node scripts/plan.mjs --plaats=Denver --van=2027-03-01 --tot=2027-05-31 [--stap=7] [--straal=500] [--straal2=1000]
//          [--max2=20] [--maxuren=14] [--besparing=200] [--duurmin=21] [--duurmax=25] [--prijs=pp|totaal]
// Fase 1 (alleen Frankfurt, binnen de opgegeven periode van heendatums):
//   a) grove scan: elke --stap dagen een heendatum, op de voorkeursluchthaven, met de middelste reisduur;
//   b) verfijnen: de 2 goedkoopste heendatums, 3 dagen eromheen (dag voor dag);
//   c) reisduur: op de beste heendatum alle duren van min tot max;
//   d) de andere luchthavens binnen --straal op het gekozen datumpaar.
//   Uitkomst: de goedkoopste data.
// Fase 2 (pas daarna): op die data alle vier de vertrekluchthavens (ook Frankfurt) naar alle aankomstluchthavens
//   binnen --straal2 (rondreis kan op meerdere plekken beginnen).
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { startBrowser, laadResultaten } from './browser.mjs';
import { bestemmingenVoorPlaats, zoekUrl, leesAanbod, kiesBeste, euro, dagenTussen, fase1Data, VERTREK } from './lib.mjs';

const v = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, ...r] = a.slice(2).split('='); return [k, r.join('=')]; }));
let intake = {};
if (v.intake) { try { intake = JSON.parse(readFileSync(v.intake, 'utf8')); } catch (e) { console.error(`Kan ${v.intake} niet lezen: ${e.message}`); process.exit(1); } }
const ir = intake.reis ?? {}, iv = intake.vlucht ?? {};
const cfg = {
  plaats: v.plaats ?? ir.plaats, van: v.van ?? ir.periodeVan, tot: v.tot ?? ir.periodeTot,
  duurMin: +(v.duurmin ?? ir.duurMin ?? 21), duurMax: +(v.duurmax ?? ir.duurMax ?? 25), stap: +(v.stap ?? 7),
  straal1: +(v.straal ?? iv.straal1 ?? 500), straal2: +(v.straal2 ?? iv.straal2 ?? 1000), max2: +(v.max2 ?? iv.max2 ?? 20),
  maxUren: +(v.maxuren ?? iv.maxUren ?? 14), besparing: +(v.besparing ?? iv.minBesparing ?? 200), prijsBasis: v.prijs ?? 'pp'
};
if (!cfg.plaats || !cfg.van || !cfg.tot) { console.error('Nodig: bestemming en periode (--intake=intake.json of --plaats, --van, --tot)'); process.exit(1); }
if (cfg.tot < cfg.van) { console.error('De laatste vertrekdatum ligt vóór de vroegste.'); process.exit(1); }
if (cfg.duurMin < 21 || cfg.duurMax > 25 || cfg.duurMin > cfg.duurMax) { console.error('Reisduur moet tussen 21 en 25 dagen liggen.'); process.exit(1); }
const regels = { maxUren: cfg.maxUren, minBesparing: cfg.besparing };
const midden = Math.round((cfg.duurMin + cfg.duurMax) / 2);
const fase1 = bestemmingenVoorPlaats(cfg.plaats, cfg.straal1, 15);
const fase2 = bestemmingenVoorPlaats(cfg.plaats, cfg.straal2, cfg.max2);
const scanDatums = datumsInPeriode(cfg.van, cfg.tot, cfg.stap);
console.log(`Voorkeur: ${fase1.voorkeur}. Periode heen: ${cfg.van} t/m ${cfg.tot}, reisduur ${cfg.duurMin}-${cfg.duurMax} dagen, max ${cfg.maxUren} uur per enkele reis`);
console.log(`Fase 1: ongeveer ${scanDatums.length} (scan) + 12 (verfijnen) + ${cfg.duurMax - cfg.duurMin} (reisduur) + ${fase1.bestemmingen.length - 1} (andere luchthavens binnen ${cfg.straal1} km) pagina's, alleen vanaf Frankfurt`);
console.log(`Fase 2: ${VERTREK.length} vertrekpunten x ${fase2.bestemmingen.length} aankomsten (${fase2.bestemmingen.map(b => b.code).join(', ')}) = maximaal ${VERTREK.length * fase2.bestemmingen.length} pagina's`);
if (fase2.bestemmingen.length >= cfg.max2) console.log(`Let op: fase 2 is begrensd op ${cfg.max2} aankomstluchthavens (--max2).`);

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
  const aanbod = leesAanbod(tekst, { prijsBasis: cfg.prijsBasis });
  const { beste } = kiesBeste(aanbod, regels);
  writeFileSync(`resultaten/${sleutel}.txt`, `${url}\n\n${tekst}`);
  console.log(`  ${van}→${naar} ${heen}: ${aanbod.length} aanbiedingen, beste ${beste ? euro(beste.totaal) + (beste.direct ? ' direct' : ` overstap ${beste.uren}u`) : 'geen'}`);
  const r = { van, naar, heen, terug, url, beste, aantal: aanbod.length };
  gedaan.set(sleutel, r);
  return r;
}

const vk = fase1.voorkeur;
const uitkomst1 = await fase1Data({ zoek, voorkeur: vk, andere: fase1.bestemmingen.map(b => b.code), van: cfg.van, tot: cfg.tot,
  duurMin: cfg.duurMin, duurMax: cfg.duurMax, stap: cfg.stap, log: t => console.log('\n' + t) });
if (!uitkomst1) { console.log('Niets uitleesbaar. Laat Claude de .txt-bestanden in resultaten/ lezen.'); await ctx.close(); process.exit(0); }
const { scan, top, fra } = uitkomst1;
const winnaar1 = fra.filter(r => r.beste).sort((a, b) => a.beste.totaal - b.beste.totaal)[0];
console.log(`Goedkoopste data vanaf FRA: ${top.heen} → ${top.terug} (${dagenTussen(top.heen, top.terug)} dagen; goedkoopste aankomst ${winnaar1.naar}, ${euro(winnaar1.beste.totaal)})`);

console.log(`\nFase 2: ${top.heen} → ${top.terug}, alle vertrekpunten naar alle aankomsten binnen ${cfg.straal2} km`);
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
writeFileSync(`resultaten/uitkomst-${cfg.plaats}.json`, JSON.stringify({ plaats: cfg.plaats, periode: [cfg.van, cfg.tot], datums: [top.heen, top.terug], fase1a: scan.map(r => ({ heen: r.heen, terug: r.terug, prijs: r.beste?.totaal ?? null })), fase1: fra, fase2: alle, verschillen: tabel }, null, 2));
// Overzicht dat je zonder Claude kunt nalezen en nacontroleren: elke regel heeft de Skyscanner-link en het bewaarde ruwe bestand.
const regel = (r, i) => `| ${i + 1} | ${r.van}→${r.naar} | ${r.heen} → ${r.terug} | ${euro(r.beste.totaal)} | ${r.beste.direct ? 'rechtstreeks' : `overstap, ${r.beste.uren} uur`} | [zoekopdracht](${r.url}) | resultaten/${r.van}-${r.naar}-${r.heen}-${r.terug}.txt |`;
writeFileSync(`resultaten/overzicht-${cfg.plaats}.md`, [
  `# Overzicht ${cfg.plaats}`, '', `Periode heen: ${cfg.van} t/m ${cfg.tot}. Gekozen data: ${top.heen} → ${top.terug}. Regels: max ${cfg.maxUren} uur per enkele reis, overstap alleen bij minstens ${euro(cfg.besparing)} voordeel.`,
  'Prijzen komen uit het script (aanname: prijs ' + (cfg.prijsBasis === 'pp' ? 'per persoon x 2' : 'totaal voor 2') + '). Controleer altijd in de zoekopdracht zelf voor je boekt.', '',
  '| # | Route | Data | Totaal 2 pers. | Type | Link | Ruw bestand |', '|---|---|---|---|---|---|---|', ...rang.slice(0, 15).map(regel)
].join('\n') + '\n');
console.log(`Overzicht om zelf na te lezen: resultaten/overzicht-${cfg.plaats}.md`);
await ctx.close();
