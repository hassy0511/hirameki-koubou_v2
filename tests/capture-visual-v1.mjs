// 390px幅で visual-v1 の代表画面を保存する。ローカルサーバと Playwright が必要。
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://127.0.0.1:8901/index.html';
const OUTPUT = path.resolve('docs/screenshots/visual-v1');

fs.mkdirSync(OUTPUT, { recursive: true });

const browser = await chromium.launch({ executablePath: chromium.executablePath() });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await context.newPage();

async function shot(name) {
  await page.screenshot({ path: path.join(OUTPUT, name), fullPage: true });
}

async function openBoard(line, stage, type, name) {
  await page.goto(BASE + '?capture=' + line + '-' + stage + '#dev/' + line + '/' + stage + '/24680', { waitUntil: 'networkidle' });
  for (let i = 0; i < 8; i += 1) {
    const current = await page.evaluate(() => window.__hirameki.question()?.board?.type || null);
    if (current === type) {
      await shot(name);
      return;
    }
    await page.evaluate(() => window.__hirameki.autoAnswer());
    await page.evaluate(() => window.__hirameki.autoAnswer());
  }
  throw new Error(type + ' not found in ' + line + '/' + stage);
}

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.click('[data-intro-next]');
await shot('01-intro-stopped-workshop.png');

await page.evaluate(() => {
  localStorage.setItem('hirameki-v2', JSON.stringify({ version: 1, progress: {}, plays: 0, flags: { intro: true, lines: {} } }));
});
await page.goto(BASE + '?capture=home', { waitUntil: 'networkidle' });
await shot('02-home-device-icons.png');

await openBoard('shape', 0, 'object-card', '03-object-card.png');
await openBoard('measure', 5, 'cups', '04-capacity-cups.png');
await openBoard('subtraction', 0, 'hidden-split', '05-hidden-box.png');
await openBoard('solve', 9, 'share-people', '06-share-people.png');
await openBoard('shape', 1, 'solid', '07-wooden-solid.png');
await openBoard('solve', 1, 'rows-compare', '08-polished-pieces.png');
await openBoard('measure', 2, 'block-ruler', '09-block-ruler.png');

await page.goto(BASE + '?capture=result#dev/number/0/24680', { waitUntil: 'networkidle' });
for (let i = 0; i < 8; i += 1) {
  await page.evaluate(() => window.__hirameki.autoAnswer());
  await page.evaluate(() => window.__hirameki.autoAnswer());
}
await page.waitForTimeout(2500);
await shot('10-repair-result.png');

await browser.close();
console.log('saved screenshots:', OUTPUT);
