// Emulates an Oculus Go (3DoF headset, one controller: trigger + touchpad, no local-floor) with IWER
// and drives the real WebXR session path of the game.
const { chromium } = require('playwright');
const path = require('path');
require('fs').mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  await page.addInitScript({ path: path.join(__dirname, 'node_modules/iwer/build/iwer.min.js') });
  await page.addInitScript(() => {
    const pad = { mapping: 'xr-standard',
      buttons: [{ id: 'trigger', type: 'analog', eventTrigger: 'select' }, null, { id: 'touchpad', type: 'binary' }],
      axes: [{ id: 'touchpad', type: 'x-axis' }, { id: 'touchpad', type: 'y-axis' }] };
    const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const go = { name: 'Oculus Go',
      controllerConfig: { profileId: 'oculus-go', fallbackProfileIds: ['generic-trigger-touchpad'],
        layout: { right: { gamepad: pad, gripOffsetMatrix: I, numHapticActuators: 0 }, left: { gamepad: pad, gripOffsetMatrix: I, numHapticActuators: 0 } } },
      supportedSessionModes: ['inline', 'immersive-vr'], supportedFeatures: ['viewer', 'local'],
      supportedFrameRates: [60, 72], isSystemKeyboardSupported: false, internalNominalFrameRate: 60,
      environmentBlendModes: { 'immersive-vr': 'opaque' }, interactionMode: 'world-space',
      userAgent: 'Mozilla/5.0 (Linux; Android 7.1.2; Pacific) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/8.1.0 SamsungBrowser/4.0 Chrome/79.0.3945.136 Mobile VR Safari/537.36' };
    const dev = new IWER.XRDevice(go, { stereoEnabled: true });
    dev.installRuntime({ forceInstall: true });
    dev.controllers.left.connected = false;
    window.xrdev = dev;
  });
  await page.goto('http://localhost:8765/index.html');
  await page.waitForFunction(() => window.game && !document.getElementById('btn-vr').disabled, null, { timeout: 15000 });
  console.log('VR button:', await page.textContent('#btn-vr'));
  await page.click('#btn-vr');
  await page.waitForFunction(() => game.renderer.xr.isPresenting && game.started, null, { timeout: 10000 });
  await page.waitForTimeout(800);
  const info = () => page.evaluate(() => ({ presenting: game.renderer.xr.isPresenting, floor: game.xrFloor, rigY: game.rig.position.y,
    kind: game.input.kind, profiles: game.input.active && game.input.active.userData.src && Array.from(game.input.active.userData.src.profiles),
    buttons: game.input.active && game.input.active.userData.src.gamepad.buttons.length, head: game.player.head.toArray().map(v => +v.toFixed(2)),
    origin: game.input.origin.toArray().map(v => +v.toFixed(2)), dir: game.input.dir.toArray().map(v => +v.toFixed(2)),
    tut: game.current.tut, held: game.world.held && game.world.held.type, move: game.input.move, grab: game.input.grab }));
  console.log('session:', JSON.stringify(await info()));
  // point the controller at a world target
  const aim = (name) => page.evaluate((name) => {
    const g = game, h = g.current, V = g.input.origin.constructor, Q = g.rig.quaternion.constructor;
    const tgt = new V(); const o = name === 'mat' ? h.$.mat : (name === 'book' ? h.$.book.obj : (name === 'tray' ? h.$.tray.anchor : h.$.button.anchor));
    o.updateWorldMatrix(true, false); tgt.setFromMatrixPosition(o.matrixWorld); if (name === 'book') tgt.y += 0.03;
    const c = xrdev.controllers.right, hp = xrdev.position;
    c.position.set(hp.x + 0.2, hp.y - 0.3, hp.z - 0.3);
    // world position of controller = rig * local(reference space). Solve direction in rig-local space.
    const rigInv = g.rig.quaternion.clone().invert();
    const local = tgt.clone().sub(g.input.origin).applyQuaternion(rigInv).normalize();
    const q = new Q().setFromUnitVectors(new V(0, 0, -1), local);
    c.quaternion.set(q.x, q.y, q.z, q.w);
  }, name);
  const btn = (id, v) => page.evaluate(([id, v]) => xrdev.controllers.right.updateButtonValue(id, v), [id, v]);
  // 1) trigger held: walk toward the green mat
  for (let i = 0; i < 40; i++) { await aim('mat'); await btn('trigger', 1); await page.waitForTimeout(100); if ((await info()).tut !== 0) break; }
  await btn('trigger', 0); await page.waitForTimeout(200);
  console.log('after walk:', JSON.stringify(await info()));
  // 2) touchpad press on the booklet: grab; keep held; aim at tray; release
  for (let i = 0; i < 5; i++) { await aim('book'); await page.waitForTimeout(120); }
  await btn('touchpad', 1); await page.waitForTimeout(400);
  console.log('after touchpad down:', JSON.stringify(await info()));
  for (let i = 0; i < 8; i++) { await aim('tray'); await page.waitForTimeout(120); }
  await btn('touchpad', 0); await page.waitForTimeout(600);
  console.log('after release:', JSON.stringify(await info()));
  // 3) touchpad click on the red button
  for (let i = 0; i < 5; i++) { await aim('button'); await page.waitForTimeout(120); }
  await btn('touchpad', 1); await page.waitForTimeout(150); await btn('touchpad', 0); await page.waitForTimeout(500);
  console.log('after click:', JSON.stringify(await info()), 'tutorial saved:', await page.evaluate(() => game.save.data.tutorial));
  await page.screenshot({ path: path.join(__dirname, 'shots', 'xr.png') });
  if (logs.length) console.log('LOGS:\n' + logs.slice(0, 10).join('\n'));
  await browser.close();
})().catch((e) => { console.log('FAIL', e.message.split('\n')[0]); process.exit(1); });
