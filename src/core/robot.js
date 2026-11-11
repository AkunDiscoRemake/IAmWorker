// Marmita: o robô-supervisor. Design próprio: uma marmita de três andares sobre uma roda,
// com cabeça de cúpula, olhos luminosos e um acessório diferente para cada profissão.
import * as THREE from '../../lib/three.module.js';
import { model, TextPanel, disposeObject } from './build.js';
import { LINES } from '../data/lines.js';
import { CONFETTI } from './fx.js';

const ORANGE = 0xff8a1f, CREAM = 0xfff1d0, TEAL = 0x1fb5a8, STEEL = 0xc9d1d9, DARK = 0x2b2d42;
const _v = new THREE.Vector3();

const HATS = {
  office: function (b) {            // gravata
    b.box(0.05, 0.05, 0.02, 0xd62828, 0, -0.1, 0.235);
    b.box(0.06, 0.16, 0.02, 0xd62828, 0, -0.2, 0.24, { r: [0, 0, 0] });
    b.cone(0.045, 0.06, 0xd62828, 0, -0.3, 0.24, { seg: 4, r: [Math.PI, 0, 0] });
  },
  kitchen: function (b) {           // chapéu de chef
    b.cyl(0.13, 0.12, 0xffffff, 0, 0.42, 0, { seg: 10 });
    b.sph(0.17, 0xffffff, 0, 0.54, 0, { s: [1, 0.6, 1] });
  },
  market: function (b) {            // boné
    b.sph(0.17, 0x2a9d8f, 0, 0.36, 0, { s: [1, 0.6, 1] });
    b.box(0.2, 0.02, 0.16, 0x2a9d8f, 0, 0.36, 0.2);
  },
  garage: function (b) {            // capacete de obra
    b.sph(0.2, 0xffd60a, 0, 0.35, 0, { s: [1, 0.7, 1] });
    b.cyl(0.23, 0.02, 0xffd60a, 0, 0.34, 0.02, { seg: 12 });
    b.box(0.04, 0.1, 0.3, 0xf4a300, 0, 0.47, 0);
  },
  space: function (b) {             // antena parabólica
    b.cyl(0.012, 0.16, STEEL, 0.1, 0.44, 0, { seg: 6 });
    b.cone(0.1, 0.06, STEEL, 0.1, 0.53, 0, { seg: 10, r: [Math.PI, 0, 0] });
    b.sph(0.02, 0xef476f, 0.1, 0.56, 0, { glow: true });
  },
  hotel: function (b) {             // chapéu de mensageiro
    b.cyl(0.13, 0.1, 0xb5179e, 0, 0.41, 0, { seg: 12 });
    b.cyl(0.135, 0.02, 0xffd60a, 0, 0.37, 0, { seg: 12 });
    b.sph(0.02, 0xffd60a, 0, 0.47, 0);
  }
};

export class Robot {
  constructor(game) {
    this.game = game;
    this.group = new THREE.Group();
    this.target = new THREE.Vector3();
    this.queue = [];
    this.speaking = false;
    this.idleText = '';
    this.idleTitle = '';
    this.silence = 0;
    this.t = 0;
    this.emoteT = 0;
    this.emoteKind = '';
    this.blink = 2;
    this.offTimer = 0;

    this.body = model(function (b) {
      b.cyl(0.13, 0.08, DARK, 0, 0.13, 0, { seg: 12, r: [0, 0, Math.PI / 2] });
      b.cyl(0.06, 0.1, ORANGE, 0, 0.13, 0, { seg: 8, r: [0, 0, Math.PI / 2] });
      b.box(0.03, 0.2, 0.05, STEEL, 0.07, 0.22, 0);
      b.box(0.03, 0.2, 0.05, STEEL, -0.07, 0.22, 0);
      b.cyl(0.21, 0.16, ORANGE, 0, 0.38, 0, { seg: 12, rt: 0.23 });
      b.cyl(0.245, 0.025, STEEL, 0, 0.47, 0, { seg: 12 });
      b.cyl(0.23, 0.15, CREAM, 0, 0.555, 0, { seg: 12 });
      b.cyl(0.245, 0.025, STEEL, 0, 0.64, 0, { seg: 12 });
      b.cyl(0.23, 0.13, TEAL, 0, 0.715, 0, { seg: 12, rt: 0.2 });
      b.box(0.03, 0.4, 0.05, STEEL, 0.245, 0.55, 0);
      b.box(0.03, 0.4, 0.05, STEEL, -0.245, 0.55, 0);
      b.cyl(0.05, 0.012, 0xffd60a, 0, 0.56, 0.235, { seg: 8, r: [Math.PI / 2, 0, 0], glow: true });
    });
    this.group.add(this.body);

    this.head = new THREE.Group();
    this.head.position.y = 0.8;
    this.head.add(model(function (b) {
      b.cyl(0.07, 0.06, DARK, 0, 0.02, 0, { seg: 8 });
      b.sph(0.2, CREAM, 0, 0.2, 0, { s: [1.12, 0.86, 1], seg: 10, hseg: 7 });
      b.box(0.34, 0.15, 0.06, DARK, 0, 0.2, 0.155);
      b.cyl(0.04, 0.05, ORANGE, 0.225, 0.2, 0, { seg: 8, r: [0, 0, Math.PI / 2] });
      b.cyl(0.04, 0.05, ORANGE, -0.225, 0.2, 0, { seg: 8, r: [0, 0, Math.PI / 2] });
      b.cyl(0.01, 0.12, STEEL, -0.08, 0.42, 0, { seg: 5 });
      b.sph(0.03, 0xffd60a, -0.08, 0.49, 0, { glow: true });
    }));
    this.eyeL = model(function (b) { b.sph(0.042, 0x9bf6ff, 0, 0, 0, { glow: true, s: [1, 1, 0.5] }); });
    this.eyeR = model(function (b) { b.sph(0.042, 0x9bf6ff, 0, 0, 0, { glow: true, s: [1, 1, 0.5] }); });
    this.eyeL.position.set(-0.08, 0.225, 0.19);
    this.eyeR.position.set(0.08, 0.225, 0.19);
    this.mouth = model(function (b) { b.box(0.09, 0.016, 0.01, 0xffd60a, 0, 0, 0, { glow: true }); });
    this.mouth.position.set(0, 0.15, 0.19);
    this.head.add(this.eyeL, this.eyeR, this.mouth);
    this.group.add(this.head);

    const arm = function () {
      return model(function (b) {
        b.box(0.045, 0.2, 0.045, STEEL, 0, -0.1, 0);
        b.sph(0.06, 0xffffff, 0, -0.24, 0);
      });
    };
    this.armL = arm(); this.armL.position.set(-0.3, 0.66, 0);
    this.armR = arm(); this.armR.position.set(0.3, 0.66, 0);
    this.group.add(this.armL, this.armR);
    this.hat = null;

    this.bubble = new TextPanel(1.05, 0.5, { round: true, px: 512, size: 44, border: 12 });
    this.bubble.mesh.position.set(0, 1.72, 0);
    this.bubble.mesh.renderOrder = 5;
    this.group.add(this.bubble.mesh);
    this.bubble.mesh.visible = false;

    game.scene.add(this.group);
  }

  setHat(kind) {
    if (this.hat) { this.hat.parent.remove(this.hat); disposeObject(this.hat); this.hat = null; }
    if (HATS[kind]) {
      this.hat = model(HATS[kind]);
      (kind === 'office' ? this.group : this.head).add(this.hat);
      if (kind === 'office') this.hat.position.y = 0.8;
    }
  }

  // Coloca o robô ao lado do jogador (ao trocar de cena).
  warp() {
    const p = this.game.player;
    this._desired(_v);
    this.group.position.set(_v.x, 0, _v.z);
    this.target.copy(this.group.position);
    this.group.rotation.y = Math.atan2(p.head.x - _v.x, p.head.z - _v.z);
  }

  _desired(out) {
    const p = this.game.player, f = p.forward, bd = this.game.world.bounds;
    out.set(p.head.x + f.x * 1.6 - f.z * 1.15, 0, p.head.z + f.z * 1.6 + f.x * 1.15);
    out.x = Math.max(bd.minx + 0.45, Math.min(bd.maxx - 0.45, out.x));
    out.z = Math.max(bd.minz + 0.45, Math.min(bd.maxz - 0.45, out.z));
    return out;
  }

  // o: {interrupt, onEnd}
  say(id, o) {
    o = o || {};
    if (o.interrupt) {
      this.queue.length = 0;
      this.game.audio.stopVoice();
      this.speaking = false;
    }
    this.queue.push({ id: id, onEnd: o.onEnd });
    if (!this.speaking) this._next();
  }

  hush() {
    this.queue.length = 0;
    this.game.audio.stopVoice();
    this.speaking = false;
    this._showIdle();
  }

  _next() {
    const q = this.queue.shift();
    if (!q) { this.speaking = false; this._showIdle(); return; }
    this.speaking = true;
    this.silence = 0;
    this.bubble.o.bg = '#fffdf2';
    this.bubble.set(LINES[q.id] || q.id, '');
    this.bubble.mesh.visible = true;
    this.game.audio.playVoice(q.id, () => {
      if (q.onEnd) q.onEnd();
      this._next();
    });
  }

  setIdleText(title, text) {
    this.idleTitle = title || '';
    this.idleText = text || '';
    if (!this.speaking) this._showIdle();
  }

  _showIdle() {
    if (this.idleText) {
      this.bubble.o.bg = '#e8f7ff';
      this.bubble.set(this.idleText, this.idleTitle);
      this.bubble.mesh.visible = true;
    } else this.bubble.mesh.visible = false;
  }

  emote(kind) {
    this.emoteKind = kind;
    this.emoteT = kind === 'happy' ? 0.9 : 0.7;
    if (kind === 'happy') {
      _v.copy(this.group.position); _v.y = 1.3;
      this.game.fx.burst(_v, CONFETTI, 26, { speed: 2.2, up: 2.2 });
    }
  }

  update(dt) {
    const g = this.game, p = g.player, pos = this.group.position;
    this.t += dt;
    this.silence += dt;

    // seguir o jogador com histerese (não fica "sambando" a cada virada de cabeça)
    this._desired(_v);
    const off = Math.sqrt((_v.x - this.target.x) * (_v.x - this.target.x) + (_v.z - this.target.z) * (_v.z - this.target.z));
    if (off > 1.5) { this.offTimer += dt; if (this.offTimer > 0.7 || off > 3) { this.target.copy(_v); this.offTimer = 0; } }
    else this.offTimer = 0;
    const dx = this.target.x - pos.x, dz = this.target.z - pos.z, d = Math.sqrt(dx * dx + dz * dz);
    let moving = false;
    if (d > 0.03) {
      const sp = Math.min(3.2, 0.6 + d * 2.5) * dt;
      pos.x += dx / d * Math.min(sp, d);
      pos.z += dz / d * Math.min(sp, d);
      moving = d > 0.15;
    }
    // não invadir o espaço do jogador
    const px = pos.x - p.head.x, pz = pos.z - p.head.z, pd = Math.sqrt(px * px + pz * pz);
    if (pd < 1.25 && pd > 0.001) { pos.x = p.head.x + px / pd * 1.25; pos.z = p.head.z + pz / pd * 1.25; }

    // olhar para o jogador
    const want = Math.atan2(p.head.x - pos.x, p.head.z - pos.z);
    let da = want - this.group.rotation.y;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    this.group.rotation.y += da * Math.min(1, dt * 6);

    // animações
    let y = Math.abs(Math.sin(this.t * 2.2)) * 0.015, spin = 0, shake = 0;
    if (this.emoteT > 0) {
      this.emoteT -= dt;
      const k = Math.max(0, this.emoteT);
      if (this.emoteKind === 'happy') { y += Math.abs(Math.sin(k * 10)) * 0.22; spin = (0.9 - k) / 0.9 * Math.PI * 2; }
      else shake = Math.sin(k * 40) * 0.35;
    }
    pos.y = y;
    this.body.rotation.y = spin;
    this.body.rotation.z = moving ? Math.sin(this.t * 9) * 0.05 : 0;
    this.head.rotation.y = shake + Math.sin(this.t * 0.7) * 0.08;
    this.head.rotation.z = Math.sin(this.t * 1.1) * 0.05;
    const lvl = this.speaking ? g.audio.level : 0;
    const talk = this.speaking ? Math.max(lvl, g.audio.voiceSrc ? 0 : (0.3 + 0.3 * Math.sin(this.t * 18))) : 0;
    this.mouth.scale.set(1 - talk * 0.25, 1 + talk * 5, 1);
    this.armL.rotation.z = -0.25 - talk * 0.6 - (this.emoteKind === 'happy' && this.emoteT > 0 ? 2.2 : 0);
    this.armR.rotation.z = 0.25 + talk * 0.4 + (this.emoteKind === 'happy' && this.emoteT > 0 ? 2.2 : 0);
    this.armL.rotation.x = Math.sin(this.t * 3) * (moving ? 0.5 : 0.08);
    this.armR.rotation.x = -Math.sin(this.t * 3) * (moving ? 0.5 : 0.08);
    this.blink -= dt;
    let ey = 1;
    if (this.blink < 0.12) ey = 0.15;
    if (this.blink < 0) this.blink = 2 + Math.random() * 3;
    if (this.emoteKind === 'happy' && this.emoteT > 0) ey = 0.45;
    this.eyeL.scale.y = ey;
    this.eyeR.scale.y = ey;
  }
}
