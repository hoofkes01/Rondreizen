// Test alles wat zonder Skyscanner te testen is: luchthavens, straal, uitlezen, regels.
import assert from 'node:assert/strict';
import { fase1Data, datumsInPeriode, plusDagen, bestemmingenVoorPlaats, leesAanbod, kiesBeste, dagenTussen, zoekUrl } from './lib.mjs';

const lis = bestemmingenVoorPlaats('Lissabon', 500);
assert.equal(lis.voorkeur, 'LIS');
assert.deepEqual(lis.bestemmingen.map(b => b.code).slice(0, 3), ['LIS', 'FAO', 'OPO']);
assert.equal(dagenTussen('2027-03-10', '2027-04-02'), 23);
assert.match(zoekUrl('FRA', 'LIS', '2027-03-10', '2027-04-02'), /fra\/lis\/270310\/270402\/\?adultsv2=2/);

const den = bestemmingenVoorPlaats('Denver', 1000);
assert.equal(den.voorkeur, 'DEN');
for (const c of ['SLC', 'ABQ']) assert.ok(den.bestemmingen.some(b => b.code === c), c + ' hoort binnen 1000 km van Denver');
assert.ok(!den.bestemmingen.some(b => b.code === 'LAX'), 'LAX ligt buiten 1000 km van Denver');

// regels: overstap 12u en 250 goedkoper -> wint; 16u -> afgekeurd; 150 goedkoper -> afgekeurd
const a = [
  { totaal: 900, uren: 2.5, direct: true }, { totaal: 650, uren: 12, direct: false },
  { totaal: 500, uren: 16, direct: false }, { totaal: 760, uren: 9, direct: false }
];
const r = kiesBeste(a);
assert.equal(r.beste.totaal, 650);
assert.deepEqual(r.afgekeurd.map(x => x.reden).length, 2);
assert.equal(kiesBeste([{ totaal: 800, uren: 3, direct: true }, { totaal: 700, uren: 8, direct: false }]).beste.totaal, 800);
assert.equal(kiesBeste([{ totaal: 700, uren: 8, direct: false }]).beste.totaal, 700);

// uitlezen van voorbeeldtekst (indicatief, niet van de echte site)
const tekst = `Heen\n06:35\nFRA\n2 u 50\nDirecte vlucht\n09:25\nLIS\n€ 412\nTerug\n10:00\nLIS\n14 u 20\n1 tussenstop\n€ 289`;
const l = leesAanbod(tekst);
assert.equal(l.length, 2);
assert.equal(l[0].totaal, 824); assert.equal(l[0].direct, true); assert.equal(l[0].uren, 2.8);
// 14 uur geldt ook voor rechtstreeks; goedkoper bij overstap telt pas bij minstens 200 verschil
assert.equal(kiesBeste([{ totaal: 500, uren: 15, direct: true }, { totaal: 900, uren: 10, direct: false }]).beste.totaal, 900);
assert.equal(kiesBeste([{ totaal: 500, uren: 15, direct: true }]).beste, null);
assert.equal(kiesBeste([{ totaal: 900, uren: 10, direct: true }, { totaal: 650, uren: 14, direct: false }]).beste.totaal, 650);
assert.equal(kiesBeste([{ totaal: 900, uren: 10, direct: true }, { totaal: 650, uren: 14.5, direct: false }]).beste.totaal, 900);
// fase 1 met nepzoeker: de goedkoopste heendatum is 2027-04-08 met reisduur 22 dagen
assert.deepEqual(datumsInPeriode('2027-03-01', '2027-03-20', 7), ['2027-03-01', '2027-03-08', '2027-03-15']);
const aanroepen = [];
const nepZoek = async (van, naar, heen, terug) => {
  aanroepen.push(`${van}-${naar}-${heen}-${terug}`);
  const duur = dagenTussen(heen, terug), verschil = Math.abs(dagenTussen('2027-04-08', heen));
  return { heen, terug, naar, beste: { totaal: 1000 + verschil * 10 + Math.abs(duur - 22) * 5 + (naar === 'FAO' ? -30 : 0), direct: true, uren: 9 } };
};
const f1 = await fase1Data({ zoek: nepZoek, voorkeur: 'LIS', andere: ['LIS', 'FAO', 'OPO'], van: '2027-03-01', tot: '2027-05-31', duurMin: 21, duurMax: 25, stap: 7 });
assert.equal(f1.top.heen, '2027-04-08'); assert.equal(dagenTussen(f1.top.heen, f1.top.terug), 22);
assert.ok(f1.fra.some(r => r.naar === 'FAO') && f1.fra.length === 3);
assert.ok(aanroepen.every(a => a.startsWith('FRA-')), 'fase 1 zoekt alleen vanaf Frankfurt');
assert.ok(aanroepen.length < 45, 'aantal pagina\'s fase 1: ' + aanroepen.length);
assert.equal(new Set(aanroepen).size, aanroepen.length, 'geen dubbele zoekopdrachten');
console.log('Alle tests geslaagd');
