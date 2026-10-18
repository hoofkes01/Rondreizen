// Start een zichtbare Chrome met een vast profiel, zodat een eenmaal afgeronde robotcontrole bewaard blijft.
import { chromium } from 'playwright';
import readline from 'node:readline/promises';

export async function startBrowser() {
  const opties = { headless: false, locale: 'nl-NL', viewport: { width: 1280, height: 900 } };
  try { return await chromium.launchPersistentContext('.browser-profiel', { ...opties, channel: 'chrome' }); }
  catch { return await chromium.launchPersistentContext('.browser-profiel', opties); }
}

export async function wachtOpGebruiker(bericht) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await rl.question(bericht);
  rl.close();
}

// Wacht tot er prijzen op de pagina staan; vraagt anders eenmalig om de robotcontrole af te ronden.
export async function laadResultaten(page, url, eerste) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const klaar = () => page.waitForFunction(() => /€\s?\d/.test(document.body.innerText), null, { timeout: 25000 }).then(() => true, () => false);
  let ok = await klaar();
  if (!ok) {
    await wachtOpGebruiker('Rond de robotcontrole af (of stel het bagagefilter in: 1 koffer 23 kg p.p.) en druk op Enter... ');
    ok = await klaar();
  } else if (eerste) {
    await wachtOpGebruiker('Controleer dat het bagagefilter klopt (1 ruimbagage 23 kg per persoon) en druk op Enter... ');
  }
  await page.waitForTimeout(4000); // laat resultaten volledig laden
  return ok;
}
