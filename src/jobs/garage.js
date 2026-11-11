// Profissão 4: Oficina mecânica.
import * as THREE from '../../lib/three.module.js';
import { JobBase } from '../core/scene.js';
import { model } from '../core/build.js';

const CAR = 0x2ec4b6, CAR2 = 0x1b9aaa;
const wheel = function (flat) {
  return function (b) {
    b.cyl(0.32, 0.2, 0x212529, 0, 0.32, 0, { seg: 12, r: [Math.PI / 2, 0, 0], s: flat ? [1, 1, 1] : [1, 1, 1] });
    b.cyl(0.17, 0.21, 0xdee2e6, 0, 0.32, 0, { seg: 8, r: [Math.PI / 2, 0, 0] });
    b.cyl(0.06, 0.23, 0x6c757d, 0, 0.32, 0, { seg: 6, r: [Math.PI / 2, 0, 0] });
    if (flat) { b.box(0.5, 0.06, 0.22, 0x212529, 0, 0.03, 0); b.cone(0.03, 0.12, 0xadb5bd, 0.2, 0.52, 0.1, { seg: 5, r: [0.6, 0, -0.6] }); }
  };
};
const pan = function (full) {
  return function (b) {
    b.box(0.5, 0.06, 0.4, 0x495057, 0, 0.03, 0);
    b.box(0.44, 0.01, 0.34, full ? 0x1b1b1b : 0x868e96, 0, 0.062, 0);
  };
};
const battery = function (c, bolt) {
  return function (b) {
    b.box(0.26, 0.18, 0.17, c, 0, 0.09, 0);
    b.box(0.27, 0.03, 0.18, 0x212529, 0, 0.17, 0);
    b.cyl(0.02, 0.04, 0xe63946, -0.08, 0.2, 0, { seg: 6 });
    b.cyl(0.02, 0.04, 0x4895ef, 0.08, 0.2, 0, { seg: 6 });
    if (bolt) b.box(0.05, 0.08, 0.005, 0xffd60a, 0, 0.09, 0.087, { glow: true });
  };
};

export class Garage extends JobBase {
  constructor(game) {
    super(game);
    this.id = 'garage'; this.name = 'Oficina'; this.prefix = 'gr'; this.hat = 'garage';
    this.bg = 0xe9ecef; this.music = [174, 0.3];
    this.phase = 'off'; this.loose = 0; this.tight = 0; this.hoodOpen = false; this.drained = false;
    this.oilDone = false; this.started = false; this.painted = 0; this.washed = 0; this.delivered = false; this.shake = 0;
  }

  build() {
    const b = this.sb, $ = this.$;
    this.room({ w: 7, d: 7, floor: [0xadb5bd, 0xa3abb3], wall: 0xf1f3f5, low: 0xf4a300, trim: 0x2b2d42 });
    this.fixtures([-1.0, 2.7, -3.47], 0, [-1.6, 1.25, 3.46], Math.PI);
    this.label('OFICINA DO MARMITA', 2.2, 0.36, 1.7, 2.7, -3.47, 0, { px: 512, bg: '#2b2d42', fg: '#ffd60a', edge: '#f4a300' });
    // faixas no chão
    for (let i = 0; i < 9; i++) { b.plane(0.3, 0.12, i % 2 ? 0x2b2d42 : 0xffd60a, -1.6 + i * 0.4, 0.006, -0.3); }
    b.plane(0.7, 0.5, 0x6c757d, -0.6, 0.005, 0.9);

    // ===== carro =====
    const car = this.car = new THREE.Group();
    car.position.set(0, 0, -1.3);
    this.root.add(car);
    this.carCol = { minx: -1.7, maxx: 1.7, minz: -2.15, maxz: -0.45 };
    this.w.colliders.push(this.carCol);
    car.add(model(function (m) {
      m.box(2.3, 0.5, 1.5, CAR, -0.45, 0.55, 0);                 // corpo traseiro/meio
      m.box(0.9, 0.42, 1.5, CAR, 1.15, 0.51, 0);                 // frente (mais baixa: cofre do motor)
      m.box(0.9, 0.16, 0.05, CAR, 1.15, 0.8, 0.725);
      m.box(0.9, 0.16, 0.05, CAR, 1.15, 0.8, -0.725);
      m.box(0.05, 0.16, 1.5, CAR, 1.58, 0.8, 0);
      m.box(1.7, 0.5, 1.36, CAR, -0.4, 1.05, 0);                 // cabine
      m.box(1.75, 0.06, 1.42, CAR2, -0.4, 1.32, 0);
      m.box(1.3, 0.3, 1.38, 0x264653, -0.4, 1.07, 0);            // vidros laterais
      m.box(1.72, 0.3, 1.1, 0x264653, -0.4, 1.07, 0);            // para-brisa e traseiro
      m.box(3.24, 0.1, 1.54, 0xfff1d0, 0, 0.45, 0);              // faixa creme
      m.box(0.1, 0.14, 1.56, 0x6c757d, 1.62, 0.36, 0);
      m.box(0.1, 0.14, 1.56, 0x6c757d, -1.62, 0.36, 0);
      m.box(0.04, 0.1, 0.24, 0xe63946, -1.61, 0.62, 0.5, { glow: true });
      m.box(0.04, 0.1, 0.24, 0xe63946, -1.61, 0.62, -0.5, { glow: true });
      m.box(0.6, 0.1, 0.6, 0x6c757d, 1.2, 0.74, -0.25);          // bloco do motor
      m.box(0.1, 0.06, 0.5, 0xe63946, 1.2, 0.81, -0.25);
      m.cyl(0.05, 0.06, 0xffd60a, 1.38, 0.76, 0.42, { seg: 8 }); // bocal do óleo
      m.box(0.3, 0.02, 0.2, 0x343a40, 0.95, 0.73, 0.42);
      m.cyl(0.035, 0.05, 0xe63946, 0.5, 0.33, 0.76, { seg: 8, r: [Math.PI / 2, 0, 0] }); // bujão
      m.box(0.16, 0.05, 0.02, 0xdee2e6, -0.6, 0.78, 0.755);      // maçaneta
    }));
    const wpos = [[-1.0, 0.75], [-1.0, -0.75], [1.0, -0.75]];
    for (let i = 0; i < 3; i++) { const wm = model(wheel(false)); wm.position.set(wpos[i][0], 0, wpos[i][1]); car.add(wm); }
    this.lights = model(function (m) { m.box(0.04, 0.12, 0.26, 0xfff3b0, 1.61, 0.62, 0.5, { glow: true }); m.box(0.04, 0.12, 0.26, 0xfff3b0, 1.61, 0.62, -0.5, { glow: true }); });
    car.add(this.lights);
    this.lights.visible = false;
    // capô
    this.hood = this.anchor(0.7, 0.88, 0, car);
    this.add(function (m) { m.box(0.92, 0.05, 1.5, CAR, 0.46, 0.025, 0); m.box(0.5, 0.01, 0.1, CAR2, 0.5, 0.055, 0); }, 0, 0, 0, this.hood);
    $.hood = this.click(this.anchor(1.15, 1.0, 0.35, car), 0.36, () => this._hood());
    // medidor de óleo
    this.gauge = this.add(function (m) { m.box(0.04, 0.2, 0.04, 0xffd60a, 0, 0.1, 0, { glow: true }); }, 1.52, 0.8, 0.6, car);
    this.gauge.scale.y = 0.05; this.gauge.visible = false;

    // roda dianteira (furada) + parafusos
    $.hub = this.zone(this.anchor(1.0, 0, 0.78, car), { accepts: 'tire', lock: true, radius: 0.4, hover: 0,
      onPlace: (it) => { if (it.type !== 'tire') return; this.phase = 'on'; for (let i = 0; i < 3; i++) { $.bolts[i].done = false; $.bolts[i].progress = 0; } this.w.setHint($.wrench.obj, 0.3); } });
    $.hub.anchor.position.y = 0;
    $.flat = this.item('flat', wheel(true), 0, 0, 0, { h: 0.64, radius: 0.3 });
    this.w.place($.flat, $.hub, true);
    $.bolts = [];
    this.boltMesh = [];
    for (let i = 0; i < 3; i++) {
      const a = i * 2.094 + 0.5, bx = 1.0 + Math.cos(a) * 0.115, by = 0.32 + Math.sin(a) * 0.115;
      const bm = this.add(function (m) { m.cyl(0.03, 0.05, 0xffd60a, 0, 0, 0, { seg: 6, r: [Math.PI / 2, 0, 0] }); }, bx, by, 0.9, car);
      this.boltMesh.push(bm);
      $.bolts.push(this.contact(this.anchor(bx, by, 0.92, car), { tool: 'wrench', radius: 0.07, time: 0.6, sfx: 'drill',
        when: () => (this.phase === 'off' && this.loose < 3) || this.phase === 'on',
        onDone: () => {
          if (this.phase === 'off') {
            bm.visible = false; this.loose++; this.sfx('pop'); this.burst(bm, 0xffd60a, 6, { speed: 1 });
            if (this.loose === 3) { $.flat.grabbable = true; this.w.setHint($.flat.obj, 0.5); }
          } else {
            bm.visible = true; this.tight++; this.sfx('ding');
          }
        } }));
    }

    // bandeja + bujão + óleo
    $.panZone = this.zone([0.5, 0.01, -0.3], { accepts: 'pan', lock: true, radius: 0.4 });
    $.pan = this.item('pan', pan(false), -1.6, 0, 1.3, { h: 0.08, radius: 0.28 });
    this.oilStream = this.add(function (m) { m.cyl(0.015, 0.26, 0x1b1b1b, 0, 0, 0, { seg: 6 }); }, 0.5, 0.2, 0.86, car);
    this.oilStream.visible = false;
    $.plug = this.click(this.anchor(0.5, 0.33, 0.8, car), 0.12, () => this._drain());
    $.fill = this.contact(this.anchor(1.38, 0.86, 0.42, car), { tool: 'oil', radius: 0.15, time: 2, tilt: -1.0, sfx: 'pour',
      when: () => this.hoodOpen && this.drained && !this.oilDone,
      onTick: (c) => { this.gauge.visible = true; this.gauge.scale.y = Math.max(0.05, c.progress / c.time); },
      onDone: () => { this.oilDone = true; this.sfx('ding'); this.burst(this.gauge, 0xffd60a, 12); } });

    // bateria
    $.batZone = this.zone(this.anchor(0.95, 0.74, 0.42, car), { accepts: 'batNew', lock: true, radius: 0.25,
      onPlace: (it) => { if (it.type === 'batNew') { this.sfx('beep'); this.w.setHint($.key.anchor, 0.25); } } });
    $.batOld = this.item('batOld', battery(0x6c757d, false), 0, 0, 0, { h: 0.2, radius: 0.18 });
    this.w.place($.batOld, $.batZone, true);
    this.add(function (m) { m.cyl(0.05, 0.02, 0xffd60a, 0, 0, 0, { seg: 8, r: [Math.PI / 2, 0, 0] }); m.box(0.1, 0.025, 0.02, 0xffd60a, 0.09, 0, 0); m.box(0.02, 0.05, 0.02, 0xffd60a, 0.12, -0.03, 0); }, -0.1, 1.07, 0.71, car);
    $.key = this.click(this.anchor(-0.05, 1.07, 0.74, car), 0.16, () => this._ignite());

    // arranhões e lama
    $.scratches = [];
    const sp = [[-1.15, 0.62], [-0.55, 0.58], [0.1, 0.64]];
    for (let i = 0; i < 3; i++) {
      const sm = this.add(function (m) { m.box(0.22, 0.012, 0.01, 0x343a40, 0, 0, 0, { r: [0, 0, 0.5] }); m.box(0.18, 0.012, 0.01, 0xdee2e6, 0.02, 0.03, 0, { r: [0, 0, 0.3] }); m.box(0.14, 0.012, 0.01, 0x343a40, -0.03, -0.03, 0, { r: [0, 0, 0.7] }); }, sp[i][0], sp[i][1], 0.757, car);
      $.scratches.push(this.contact(this.anchor(sp[i][0], sp[i][1], 0.78, car), { tool: 'spray', radius: 0.14, time: 1.0, sfx: 'scrub',
        onTick: (c) => { sm.scale.setScalar(Math.max(0.01, 1 - c.progress / c.time)); if (Math.random() < 0.4) this.burst(sm, CAR, 1, { speed: 0.5, up: 0.2 }); },
        onDone: () => { sm.visible = false; this.painted++; this.sfx('ding'); this.burst(sm, [CAR, 0xffffff], 10); } }));
    }
    $.mud = [];
    const mp = [[-1.42, 0.62, 0.76], [-0.8, 0.42, 0.76], [0.42, 0.7, 0.76], [-0.3, 1.33, 0.5]];
    for (let i = 0; i < 4; i++) {
      const mm = this.add(function (m) { m.sph(0.11, 0x7f5539, 0, 0, 0, { s: [1, 0.8, 0.25] }); m.sph(0.06, 0x6f4518, 0.1, 0.06, 0, { s: [1, 1, 0.3] }); m.sph(0.05, 0x7f5539, -0.09, -0.07, 0, { s: [1, 1, 0.3] }); }, mp[i][0], mp[i][1], mp[i][2], car);
      if (i === 3) mm.rotation.x = -Math.PI / 2;
      $.mud.push(this.contact(this.anchor(mp[i][0], mp[i][1], mp[i][2] + 0.03, car), { tool: 'hose', radius: 0.15, time: 0.8, sfx: 'pour',
        when: () => this.stepIndex >= 4,
        onTick: (c) => { mm.scale.setScalar(Math.max(0.01, 1 - c.progress / c.time)); if (Math.random() < 0.6) this.burst(mm, 0x4cc9f0, 1, { speed: 0.9, up: 0.3 }); },
        onDone: () => { mm.visible = false; this.washed++; this.sfx('ding'); this.burst(mm, [0xffffff, 0x4cc9f0], 12); } }));
    }

    // ===== bancada de ferramentas (parede esquerda) =====
    this.solid(-3.05, -0.1, 0.8, 2.8, 0.9, 0xe63946, { top: 0x495057 });
    b.box(0.04, 1.0, 2.6, 0xddb892, -3.47, 1.75, -0.1);
    for (let i = 0; i < 5; i++) b.box(0.03, 0.4, 0.06, i % 2 ? 0xadb5bd : 0xf4a300, -3.44, 1.75, -1.1 + i * 0.5, { r: [0.3 * (i - 2), 0, 0] });
    $.wrench = this.item('wrench', function (m) {
      m.box(0.035, 0.03, 0.3, 0xadb5bd, 0, 0.03, 0.05);
      m.box(0.3, 0.035, 0.035, 0xadb5bd, 0, 0.03, -0.1);
      m.cyl(0.035, 0.06, 0x6c757d, 0, 0.03, -0.13, { seg: 6, r: [Math.PI / 2, 0, 0] });
    }, -3.0, 0.9, 1.05, { h: 0.06, radius: 0.17, tool: true });
    $.oil = this.item('oil', function (m) {
      m.box(0.12, 0.2, 0.08, 0xffd60a, 0, 0.1, 0);
      m.cyl(0.025, 0.07, 0x2b2d42, 0.03, 0.23, 0, { seg: 6 });
      m.box(0.07, 0.07, 0.085, 0x2b2d42, 0, 0.1, 0);
    }, -3.0, 0.9, 0.5, { h: 0.25, radius: 0.15, tool: true });
    $.batNew = this.item('batNew', battery(0x4895ef, true), -3.0, 0.9, -0.05, { h: 0.2, radius: 0.18 });
    $.spray = this.item('spray', function (m) {
      m.cyl(0.05, 0.12, CAR, 0, 0.19, 0, { seg: 8 });
      m.box(0.04, 0.12, 0.05, 0x495057, 0, 0.06, 0.02);
      m.box(0.04, 0.04, 0.12, 0x495057, 0, 0.12, -0.05);
      m.cone(0.025, 0.05, 0xadb5bd, 0, 0.12, -0.13, { seg: 6, r: [-Math.PI / 2, 0, 0] });
    }, -3.0, 0.9, -0.6, { h: 0.2, radius: 0.15, tool: true });
    $.hose = this.item('hose', function (m) {
      m.cyl(0.025, 0.2, 0x52b788, 0, 0.03, 0.02, { seg: 6, r: [Math.PI / 2, 0, 0] });
      m.cone(0.035, 0.08, 0xffd60a, 0, 0.03, -0.11, { seg: 6, r: [-Math.PI / 2, 0, 0] });
      m.box(0.03, 0.08, 0.04, 0x40916c, 0, -0.0, 0.06);
    }, -3.0, 0.93, -1.15, { h: 0.08, radius: 0.15, tool: true });
    b.tor(0.18, 0.04, 0x52b788, -3.43, 1.2, -1.75, { r: [0, Math.PI / 2, 0] });
    $.tire = this.item('tire', wheel(false), -3.1, 0, 1.75, { h: 0.64, radius: 0.3 });

    // descarte de pneus + reciclagem
    b.tor(0.26, 0.1, 0x212529, 2.9, 0.1, 2.4, { r: [Math.PI / 2, 0, 0] });
    b.tor(0.26, 0.1, 0x343a40, 2.92, 0.3, 2.38, { r: [Math.PI / 2, 0, 0] });
    this.w.addSolid(2.5, 3.3, 2.0, 2.8, 0.4);
    this.label('DESCARTE', 0.7, 0.2, 3.47, 1.4, 2.4, -Math.PI / 2, { bg: '#2b2d42', fg: '#ffffff', edge: '#f4a300' });
    $.discard = this.zone([2.9, 0.42, 2.4], { accepts: 'flat', lock: true, radius: 0.42 });
    this.solid(2.95, 1.2, 0.7, 0.7, 0.45, 0x40916c, { top: 0x2d6a4f });
    this.label('RECICLAGEM', 0.7, 0.2, 3.47, 1.4, 1.2, -Math.PI / 2, { bg: '#40916c', fg: '#ffffff', edge: '#ffffff' });
    $.recycle = this.zone([2.95, 0.46, 1.2], { accepts: 'batOld', lock: true, radius: 0.36 });

    // portão (parede direita) e botão
    b.box(0.03, 2.3, 2.3, 0x90e0ef, 3.475, 1.15, -1.3);
    b.box(0.032, 0.5, 2.3, 0x52b788, 3.474, 0.25, -1.3);
    b.box(0.034, 0.3, 1.2, 0x6c757d, 3.473, 0.15, -1.3);
    b.sph(0.2, 0xffd60a, 3.46, 1.9, -0.7, { s: [0.1, 1, 1] });
    b.box(0.1, 2.4, 0.1, 0x2b2d42, 3.44, 1.2, -2.5);
    b.box(0.1, 2.4, 0.1, 0x2b2d42, 3.44, 1.2, -0.1);
    b.box(0.1, 0.1, 2.5, 0x2b2d42, 3.44, 2.35, -1.3);
    this.gate = this.anchor(3.45, 2.3, -1.3);
    this.add(function (m) { for (let i = 0; i < 8; i++) m.box(0.04, 0.27, 2.3, i % 2 ? 0xced4da : 0xadb5bd, 0, -0.145 - i * 0.2875, 0); }, 0, 0, 0, this.gate);
    b.box(0.06, 0.24, 0.2, 0x2b2d42, 3.46, 1.3, 0.3);
    this.gateBtn = this.add(function (m) { m.cyl(0.06, 0.04, 0x80ed99, 0, 0, 0, { seg: 8, r: [0, 0, Math.PI / 2], glow: true }); }, 3.42, 1.3, 0.3);
    $.gate = this.click([3.42, 1.3, 0.3], 0.18, () => this._gate());

    this.steps = [
      { title: 'Troque o pneu: solte os 3 parafusos, descarte o velho, ponha o novo e aperte.', line: 'gr_1',
        start: () => this.w.setHint($.wrench.obj, 0.3), check: () => this.phase === 'on' && this.tight === 3,
        progress: () => this.phase === 'off' ? 'Soltos: ' + this.loose + '/3' : 'Apertados: ' + this.tight + '/3' },
      { title: 'Abra o capô, ponha a bandeja sob o bujão, escoe e despeje óleo novo.', line: 'gr_2',
        start: () => { if (!this.hoodOpen) this.w.setHint($.hood.anchor, 0.3); }, check: () => this.oilDone,
        progress: () => this.drained ? 'Óleo velho escoado. Falta o novo!' : 'Óleo velho no motor' },
      { title: 'Bateria velha na reciclagem, nova no carro, e gire a chave.', line: 'gr_3',
        start: () => this.w.setHint($.batOld.obj, 0.3), check: () => this.started },
      { title: 'Cubra os 3 arranhões com a pistola de pintura.', line: 'gr_4',
        start: () => this.w.setHint($.spray.obj, 0.35), check: () => this.painted === 3,
        progress: () => 'Arranhões: ' + this.painted + '/3' },
      { title: 'Lave as 4 manchas de lama e abra o portão para entregar.', line: 'gr_5',
        start: () => { if (this.hoodOpen) { this.hoodOpen = false; this.tween(this.hood.rotation, { z: 0 }, 0.4); } this.w.setHint($.hose.obj, 0.3); },
        check: () => this.delivered, progress: () => 'Lama: ' + this.washed + '/4' }
    ];
  }

  _hood() {
    if (this.hoodOpen) return;
    this.hoodOpen = true;
    this.$.hood.enabled = false;
    this.sfx('pop');
    this.tween(this.hood.rotation, { z: 1.05 }, 0.5);
    if (this.$.batOld.zone === this.$.batZone) this.$.batOld.grabbable = true;
    if (this.stepIndex === 1) this.w.setHint(this.$.pan.obj, 0.3);
  }

  _drain() {
    const $ = this.$;
    if (this.drained || this.draining) return;
    if ($.panZone.count() === 0) { this.fail('gr_nopan'); return; }
    this.draining = true;
    this.oilStream.visible = true;
    for (let i = 0; i < 7; i++) this.after(i * 0.25, () => this.sfx('pour'));
    this.after(1.8, () => {
      this.oilStream.visible = false;
      this.draining = false;
      this.drained = true;
      $.pan.setMesh(model(pan(true)));
      this.sfx('ding');
      this.w.setHint($.oil.obj, 0.35);
    });
  }

  _ignite() {
    const $ = this.$, bt = $.batZone.first();
    if (this.started) return;
    if (!bt || bt.type !== 'batNew') { this.fail('gr_nobattery'); return; }
    this.sfx('engine');
    this.shake = 1.4;
    this.lights.visible = true;
    this.after(1.4, () => { this.started = true; });
  }

  _gate() {
    if (this.opening) return;
    if (this.stepIndex < 4 || this.washed < 4) { this.fail(this.stepIndex >= 4 ? 'gr_dirty' : undefined); return; }
    this.opening = true;
    this.sfx('whoosh');
    this.tween(this.gate.scale, { y: 0.06 }, 1.0);
    this.after(1.0, () => {
      this.sfx('engine');
      const i = this.w.colliders.indexOf(this.carCol);
      if (i >= 0) this.w.colliders.splice(i, 1);
      this.tween(this.car.position, { x: 6.5 }, 2.2, { ease: (k) => k * k, done: () => { this.car.visible = false; this.delivered = true; } });
    });
  }

  tick(dt) {
    if (this.shake > 0) {
      this.shake -= dt;
      this.car.position.y = this.shake > 0 ? Math.abs(Math.sin(this.time * 50)) * 0.012 : 0;
    }
  }
}
