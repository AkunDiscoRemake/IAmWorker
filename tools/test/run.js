// usage: node run.js <script.js> ; script exports async (page, shot) => {}
const { chromium } = require('playwright');
const path = require('path');
require('fs').mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message + '\n' + e.stack));
  await page.goto('http://localhost:8765/index.html');
  await page.waitForFunction(() => window.game, null, { timeout: 15000 }).catch(() => {});
  const shot = async (name) => { await page.evaluate(() => T.render()); await page.screenshot({ path: path.join(__dirname, 'shots', name + '.png') }); };
  try {
    if (await page.evaluate(() => !!window.game)) {
      await page.click('#btn-desk');
      await page.addScriptTag({ path: path.join(__dirname, 'harness.js') });
      await require(path.resolve(process.argv[2]))(page, shot);
    }
  } catch (e) { console.log('FAIL:', e.message.split('\n').slice(0, 6).join('\n')); }
  if (logs.length) console.log(logs.slice(0, 15).join('\n'));
  await browser.close();
})();
