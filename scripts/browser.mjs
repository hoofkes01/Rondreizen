// Start een zichtbare Chrome met een vast profiel, zodat een eenmaal afgeronde robotcontrole bewaard blijft.
import { chromium } from 'playwright';

export async function startBrowser() {
  const opties = { headless: false, locale: 'nl-NL', viewport: { width: 1280, height: 900 } };
  try { return await chromium.launchPersistentContext('.browser-profiel', { ...opties, channel: 'chrome' }); }
  catch { return await chromium.launchPersistentContext('.browser-profiel', opties); }
}

// Geen Enter nodig (werkt ook als een sub-agent het script draait): het script wacht en kijkt zelf of er prijzen staan.
const pauze = ms => new Promise(r => setTimeout(r, ms));
const heeftPrijzen = page => page.evaluate(() => /€\s?\d/.test(document.body.innerText)).catch(() => false);

// Wacht tot er prijzen op de pagina staan. Staat er een robotcontrole, rond die dan zelf af in het Chrome-venster.
export async function laadResultaten(page, url, eerste) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const limiet = Date.now() + 5 * 60 * 1000;
  let gemeld = false;
  while (!(await heeftPrijzen(page))) {
    if (Date.now() > limiet) return false;
    if (!gemeld) { console.log('Nog geen prijzen zichtbaar. Rond zo nodig de robotcontrole af in het Chrome-venster (maximaal 5 minuten)...'); gemeld = true; }
    await pauze(2000);
  }
  if (eerste) {
    const s = +(process.env.BAGAGE_WACHT ?? 45);
    console.log(`Eerste zoekopdracht: stel nu in het Chrome-venster het bagagefilter in (1 ruimbagage 23 kg per persoon). Doorgaan over ${s} seconden...`);
    await pauze(s * 1000);
  }
  await pauze(4000); // laat resultaten volledig laden
  return true;
}
