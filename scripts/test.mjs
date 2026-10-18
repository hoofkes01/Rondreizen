// Test alles wat zonder Skyscanner te testen is: luchthavens, straal, uitlezen, regels.
import assert from 'node:assert/strict';
import { bestemmingenVoorPlaats, leesAanbod, kiesBeste, dagenTussen, zoekUrl } from './lib.mjs';

const lis = bestemmingenVoorPlaats('Lissabon', 500);
assert.equal(lis.voorkeur, 'LIS');
assert.deepEqual(lis.bestemmingen.map(b => b.code).slice(0, 3), ['LIS', 'FAO', 'OPO']);
assert.equal(dagenTussen('2027-03-10', '2027-04-02'), 23);
assert.match(zoekUrl('FRA', 'LIS', '2027-03-10', '2027-04-02'), /fra\/lis\/270310\/270402\/\?adultsv2=2/);

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
console.log('Alle tests geslaagd');
