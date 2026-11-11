// Entrada unificada.
//  - WebXR Gamepad API (prioridade: Oculus Go, 3DoF, 1 controle):
//      gatilho  = buttons[0]  -> andar na direção apontada
//      touchpad = buttons[2]  -> pegar / segurar / soltar / clicar
//  - Desktop: mouse + teclado.
// O resto do jogo só enxerga: origin, dir, move, grab, grabDown, tap.
import * as THREE from '../../lib/three.module.js';
import { model } from './build.js';

const TAP_TIME = 0.25;

// Lê gatilho/touchpad de um XRInputSource conforme o perfil do controle.
export function readSource(src) {
  const out = { trigger: false, pad: false, kind: 'none' };
  if (!src || !src.gamepad) return out;
  const gp = src.gamepad, b = gp.buttons || [];
  const down = function (i) { return !!(b[i] && b[i].pressed); };
  const pulled = function (i) { return !!(b[i] && (b[i].pressed || b[i].value > 0.5)); };
  const profiles = src.profiles || [];
  let touchpadProfile = false, thumbstickProfile = false;
  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i];
    if (p === 'oculus-go' || p === 'samsung-gearvr' || p.indexOf('touchpad') >= 0 || p.indexOf('daydream') >= 0) touchpadProfile = true;
    if (p.indexOf('thumbstick') >= 0 || p.indexOf('oculus-touch') >= 0 || p.indexOf('meta-quest') >= 0) thumbstickProfile = true;
  }
  if (gp.mapping === 'xr-standard' || profiles.length) {
    // Layout xr-standard: 0 gatilho, 1 squeeze, 2 touchpad, 3 thumbstick, 4+ botões de face.
    out.trigger = pulled(0);
    if (touchpadProfile && !thumbstickProfile) {
      out.kind = 'touchpad';           // Oculus Go / Gear VR
      out.pad = down(2);
      // alguns builds antigos do Oculus Browser expõem só 2 botões: [gatilho, touchpad]
      if (b.length === 2) out.pad = down(1);
    } else {
      out.kind = 'thumbstick';         // Quest/Touch e afins: grip, stick ou A/X fazem o papel do touchpad
      out.pad = down(2) || pulled(1) || down(3) || down(4);
    }
  } else {
    // Mapeamento legado (era WebVR) do Oculus Go: buttons[0] = touchpad, buttons[1] = gatilho.
    out.kind = 'legacy';
    out.pad = down(0);
    out.trigger = pulled(1);
  }
  return out;
}

export class Input {
  constructor(game) {
    this.game = game;
    this.origin = new THREE.Vector3(0, 1.6, 0);
    this.dir = new THREE.Vector3(0, 0, -1);
    this.move = false;
    this.grab = false;
    this.grabDown = false;
    this.tap = false;
    this.fwd = 0;
    this.strafe = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.keys = {};
    this.mouseL = false;
    this.mouseR = false;
    this.locked = false;
    this.debug = null;          // usado pelos testes automatizados: {grab, move, aim:Vector3}
    this.kind = 'desktop';
    this._pg = false;
    this._pm = false;
    this._mt = 0;
    this.active = null;
    this.ctrls = [];
    this._bindDesktop();
    this._bindXR();
  }

  _bindDesktop() {
    const cv = this.game.renderer.domElement;
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space' || e.code.indexOf('Arrow') === 0) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    cv.addEventListener('mousedown', (e) => {
      if (!this.game.started) return;
      if (!this.locked && cv.requestPointerLock) cv.requestPointerLock();
      if (e.button === 0) this.mouseL = true;
      if (e.button === 2) this.mouseR = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseL = false;
      if (e.button === 2) this.mouseR = false;
    });
    cv.addEventListener('contextmenu', (e) => { e.preventDefault(); });
    document.addEventListener('pointerlockchange', () => { this.locked = document.pointerLockElement === cv; });
    document.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.yaw -= (e.movementX || 0) * 0.0023;
      this.pitch -= (e.movementY || 0) * 0.0023;
      this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch));
    });
  }

  _bindXR() {
    const xr = this.game.renderer.xr;
    for (let i = 0; i < 2; i++) {
      const c = xr.getController(i);
      c.userData.src = null;
      c.userData.sel = false;
      c.addEventListener('connected', (e) => { c.userData.src = e.data; c.visible = true; });
      c.addEventListener('disconnected', () => { c.userData.src = null; c.userData.sel = false; c.visible = false; if (this.active === c) this.active = null; });
      c.addEventListener('selectstart', () => { c.userData.sel = true; });
      c.addEventListener('selectend', () => { c.userData.sel = false; });
      // varinha + laser (modelo próprio, bem leve)
      const wand = model(function (b) {
        b.box(0.035, 0.03, 0.14, 0x3a3f5c, 0, 0, 0.05);
        b.cyl(0.024, 0.012, 0xffb703, 0, 0.018, 0.0, { seg: 8 });
        b.box(0.02, 0.02, 0.02, 0xef476f, 0, -0.02, -0.01);
        b.box(0.004, 0.004, 2.6, 0x9be7ff, 0, 0, -1.35, { glow: true });
      });
      c.add(wand);
      c.visible = false;
      this.game.rig.add(c);
      this.ctrls.push(c);
    }
  }

  update(dt) {
    const g = this.game;
    let move = false, grab = false;
    this.fwd = 0;
    this.strafe = 0;

    if (g.renderer.xr.isPresenting) {
      // ---------- WebXR ----------
      let best = null, bestState = null;
      for (let i = 0; i < this.ctrls.length; i++) {
        const c = this.ctrls[i];
        if (!c.userData.src) continue;
        const st = readSource(c.userData.src);
        if (st.kind === 'none') st.pad = c.userData.sel;   // sem gamepad: "select" vira pegar/clicar
        if (!best || ((st.trigger || st.pad) && !(bestState.trigger || bestState.pad)) || (c === this.active && !(bestState.trigger || bestState.pad))) {
          best = c; bestState = st;
        }
      }
      if (best) {
        this.active = best;
        this.kind = bestState.kind;
        move = bestState.trigger;
        grab = bestState.pad;
        const rig = g.rig;
        rig.updateMatrix();
        this.origin.copy(best.position).applyMatrix4(rig.matrix);
        this.dir.set(0, 0, -1).applyQuaternion(best.quaternion).applyQuaternion(rig.quaternion).normalize();
      } else {
        // nenhum controle acordado: mira pelo olhar
        this.kind = 'gaze';
        this.origin.setFromMatrixPosition(g.camera.matrixWorld);
        this.dir.set(0, 0, -1).transformDirection(g.camera.matrixWorld);
      }
    } else {
      // ---------- Desktop ----------
      this.kind = 'desktop';
      const k = this.keys;
      if (k.ArrowLeft) this.yaw += dt * 1.8;
      if (k.ArrowRight) this.yaw -= dt * 1.8;
      if (k.ArrowUp) this.pitch = Math.min(1.45, this.pitch + dt * 1.4);
      if (k.ArrowDown) this.pitch = Math.max(-1.45, this.pitch - dt * 1.4);
      g.rig.rotation.y = this.yaw;
      g.camera.rotation.set(this.pitch, 0, 0);
      g.rig.updateMatrixWorld(true);
      this.origin.setFromMatrixPosition(g.camera.matrixWorld);
      this.dir.set(0, 0, -1).transformDirection(g.camera.matrixWorld);
      move = this.mouseR || !!k.Space;
      grab = this.mouseL || !!k.KeyE;
      this.fwd = (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0);
      this.strafe = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0);
    }

    if (this.debug) {
      if (this.debug.aim) this.dir.copy(this.debug.aim).sub(this.origin).normalize();
      if (this.debug.grab !== undefined) grab = this.debug.grab;
      if (this.debug.move !== undefined) move = this.debug.move;
    }

    this.grabDown = grab && !this._pg;
    this.tap = false;
    if (move) this._mt += dt;
    else { if (this._pm && this._mt < TAP_TIME) this.tap = true; this._mt = 0; }
    this._pg = grab;
    this._pm = move;
    this.move = move;
    this.grab = grab;
  }
}
