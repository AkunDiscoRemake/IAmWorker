// Test harness injected into the page: drives the real input pipeline (ray aim + grab/move flags).
(function () {
  const g = window.game, THREE_V = g.input.origin.constructor;
  const T = window.T = { voices: [], errors: [] };
  g.renderer.setAnimationLoop(null);
  g.audio.playVoice = function (id, cb) { T.voices.push(id); if (cb) cb(); };
  g.audio.sfx = function () {};
  g.input.debug = { grab: false, move: false, aim: null };
  T.step = function (n, dt) { n = n || 1; for (let i = 0; i < n; i++) { g.step(dt || 1 / 60); g.scene.updateMatrixWorld(); } };
  T.wait = function (s) { T.step(Math.ceil(s * 30), 1 / 30); };
  T.render = function () { g.renderer.render(g.scene, g.camera); };
  T.pos = function (o) { const v = new THREE_V(); if (o.isVector3) return v.copy(o); if (o.obj) { g.world.center(o, v); return v; } const a = o.anchor || o; a.updateWorldMatrix(true, false); return v.setFromMatrixPosition(a.matrixWorld); };
  T.near = function (p, dist) {
    dist = dist || 1.3;
    const bd = g.world.bounds, cx = (bd.minx + bd.maxx) / 2, cz = (bd.minz + bd.maxz) / 2;
    let dx = cx - p.x, dz = cz - p.z; const l = Math.hypot(dx, dz) || 1;
    if (l < 0.3) { dx = 0; dz = 1; } else { dx /= l; dz /= l; }
    const x = p.x + dx * dist, z = p.z + dz * dist;
    g.player.teleport(x, z, Math.atan2(-(p.x - x), -(p.z - z)));
    T.step(2);
  };
  T.aim = function (o) { const p = T.pos(o); T.near(p); g.input.debug.aim = p; T.step(3); return p; };
  T.grab = function (it) {
    T.aim(it); g.input.debug.grab = true; T.step(4);
    if (g.world.held !== it) throw new Error('grab failed: ' + it.type + ' held=' + (g.world.held && g.world.held.type) + ' hover=' + (g.world.hover && (g.world.hover.type || 'click')));
  };
  T.drop = function (z) { T.aim(z); T.step(25); g.input.debug.grab = false; T.step(25); };
  T.move = function (it, z) { T.grab(it); T.drop(z); if (it.zone !== z) throw new Error('place failed: ' + it.type); };
  T.click = function (c) { T.aim(c); if (g.world.hover !== c) throw new Error('click target not hovered'); g.input.debug.grab = true; T.step(1); g.input.debug.grab = false; T.step(3); };
  T.use = function (it, c, secs) { T.grab(it); T.aim(c); T.wait(secs); g.input.debug.grab = false; T.step(30); };
  T.job = function () { return g.current; };
  T.state = function () { const j = g.current; return { step: j.stepIndex, busy: j.busy, finished: j.finished, mistakes: j.mistakes, board: j.board && j.board.text }; };
  T.goto = function (id) { g.input.debug.grab = false; g.input.debug.aim = null; T.step(3); g.startJob(id); T.wait(2); };
  T.expectStep = function (i) { T.wait(2.2); const j = g.current; if (j.finished ? i !== 'end' : j.stepIndex !== i) throw new Error('expected step ' + i + ' but at ' + j.stepIndex + ' finished=' + j.finished + ' board=' + j.board.text); };
  T.shot = function (x, z, yaw, pitch) { g.player.teleport(x, z, yaw); g.input.pitch = pitch || 0; g.input.debug.aim = null; T.step(2); T.render(); };
})();
