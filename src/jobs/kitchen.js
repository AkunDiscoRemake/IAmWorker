// Profissão 2: Cozinha do restaurante Colher de Pau.
import { JobBase } from '../core/scene.js';
import { model } from '../core/build.js';

const VEG = {
  tomato: { c: 0xe63946, whole: function (b) { b.sph(0.065, 0xe63946, 0, 0.06, 0, { s: [1, 0.85, 1] }); b.cyl(0.02, 0.02, 0x40916c, 0, 0.115, 0, { seg: 5 }); } },
  carrot: { c: 0xff8a1f, whole: function (b) { b.cone(0.04, 0.2, 0xff8a1f, 0, 0.04, 0, { seg: 6, r: [0, 0, Math.PI / 2] }); b.box(0.04, 0.05, 0.02, 0x40916c, -0.115, 0.045, 0); } },
  onion: { c: 0xc77dff, whole: function (b) { b.sph(0.06, 0xc77dff, 0, 0.055, 0); b.cone(0.02, 0.05, 0xe0aaff, 0, 0.125, 0, { seg: 5 }); } }
};
const chopped = function (c) {
  return function (b) {
    const p = [[-0.04, -0.03], [0.03, -0.04], [0, 0.02], [-0.05, 0.04], [0.05, 0.03], [0.01, -0.01]];
    for (let i = 0; i < p.length; i++) b.box(0.035, 0.03, 0.035, c, p[i][0], 0.015 + (i === 5 ? 0.03 : 0), p[i][1], { r: [0, i, 0] });
  };
};
const PATTY = { raw: 0xe5989b, done: 0x7f4f24, burnt: 0x1b1b1b };
const patty = function (c) { return function (b) { b.cyl(0.075, 0.028, c, 0, 0.014, 0, { seg: 10 }); }; };
const bowl = function (full) {
  return function (b) {
    b.cyl(0.06, 0.07, 0x4895ef, 0, 0.035, 0, { seg: 10, rt: 0.115 });
    b.cyl(0.1, 0.008, full ? 0xff8a1f : 0xe9ecef, 0, 0.066, 0, { seg: 10 });
    if (full) { b.box(0.03, 0.01, 0.03, 0xe63946, 0.03, 0.072, 0.02); b.box(0.03, 0.01, 0.03, 0xc77dff, -0.04, 0.072, -0.01); }
  };
};
const ladle = function (full) {
  return function (b) {
    b.cyl(0.01, 0.26, 0xadb5bd, 0, 0.17, 0, { seg: 6 });
    b.sph(0.05, 0xadb5bd, 0, 0.04, 0, { s: [1, 0.7, 1] });
    if (full) b.cyl(0.04, 0.01, 0xff8a1f, 0, 0.062, 0, { seg: 8 });
  };
};
const glass = function (full) {
  return function (b) {
    b.cyl(0.035, 0.13, 0xcaf0f8, 0, 0.065, 0, { seg: 8, rt: 0.045 });
    b.cyl(0.038, 0.01, full ? 0xffa200 : 0xffffff, 0, 0.128, 0, { seg: 8 });
    if (full) b.cyl(0.006, 0.12, 0xe63946, 0.02, 0.16, 0, { seg: 5, r: [0, 0, -0.3] });
  };
};
const dish = function (clean) {
  return function (b) {
    b.cyl(0.09, 0.02, 0xffffff, 0, 0.01, 0, { seg: 12, rt: 0.13 });
    if (!clean) { b.cyl(0.05, 0.004, 0x7f5539, 0.03, 0.022, 0.01, { seg: 6 }); b.cyl(0.03, 0.004, 0xbc6c25, -0.05, 0.022, -0.03, { seg: 6 }); }
    else b.cyl(0.08, 0.003, 0xcaf0f8, 0, 0.0215, 0, { seg: 12 });
  };
};
const ORDER = ['bunB', 'patty', 'cheese', 'lettuce', 'bunT'];

export class Kitchen extends JobBase {
  constructor(game) {
    super(game);
    this.id = 'kitchen'; this.name = 'Cozinha'; this.prefix = 'kt'; this.hat = 'kitchen';
    this.bg = 0xffe5d9; this.music = [247, 0.26];
    this.fireA = false; this.fireB = false; this.cookT = 0; this.soupReady = false;
    this.water = false; this.served = {}; this.fxT = 0; this.open = false;
  }

  build() {
    const b = this.sb, $ = this.$;
    this.room({ w: 7, d: 7, floor: [0xffffff, 0xe63946], wall: 0xfff8f0, low: 0xffd6a5, tile: 0.7 });
    this.fixtures([0, 2.6, -3.47], 0, [3.46, 1.25, 3.0], -Math.PI / 2);

    // ===== bancada do fundo =====
    this.solid(0.6, -3.05, 5.6, 0.8, 0.9, 0xf4f1de, { top: 0x8d99ae });
    // tábua + faca
    b.box(0.42, 0.025, 0.32, 0xddb892, -1.6, 0.912, -3.0);
    $.board = this.zone([-1.6, 0.928, -3.0], { accepts: (it) => it.type === 'veg' && !it.data.chopped, radius: 0.26 });
    $.knife = this.item('knife', function (m) {
      m.box(0.03, 0.02, 0.1, 0x2b2d42, 0, 0.012, 0.11);
      m.box(0.008, 0.045, 0.2, 0xdee2e6, 0, 0.024, -0.04);
    }, -2.05, 0.9, -3.0, { h: 0.05, radius: 0.14, tool: true });
    $.chop = this.contact($.board.anchor, { tool: 'knife', radius: 0.17, time: 0.9, repeat: true, sfx: 'chop',
      when: () => { const v = $.board.first(); return !!v && !v.data.chopped; },
      onDone: () => {
        const v = $.board.first();
        v.data.chopped = true;
        v.setMesh(model(chopped(VEG[v.data.kind].c)));
        this.burst(v.obj, VEG[v.data.kind].c, 10, { speed: 1 });
        this.sfx('pop');
      } });
    $.ladle = this.item('ladle', ladle(false), -1.08, 0.9, -3.0, { h: 0.3, radius: 0.15, tool: true, data: { full: false } });

    // fogão
    b.box(1.6, 0.03, 0.74, 0x2b2d42, 0, 0.905, -3.03);
    b.box(1.6, 0.22, 0.03, 0x2b2d42, 0, 0.74, -2.64);
    b.cyl(0.17, 0.02, 0x495057, -0.4, 0.925, -3.0, { seg: 10 });
    b.cyl(0.17, 0.02, 0x495057, 0.4, 0.925, -3.0, { seg: 10 });
    const flame = function (m) { for (let i = 0; i < 6; i++) m.cone(0.03, 0.07, i % 2 ? 0xffd60a : 0xff8a1f, Math.cos(i * 1.047) * 0.14, 0.035, Math.sin(i * 1.047) * 0.14, { seg: 5, glow: true }); };
    this.flameA = this.add(flame, -0.4, 0.93, -3.0); this.flameA.visible = false;
    this.flameB = this.add(flame, 0.4, 0.93, -3.0); this.flameB.visible = false;
    this.knobA = this.add(function (m) { m.cyl(0.05, 0.04, 0xe63946, 0, 0, 0, { seg: 8, r: [Math.PI / 2, 0, 0] }); m.box(0.015, 0.05, 0.02, 0xffffff, 0, 0.02, 0.025); }, -0.4, 0.74, -2.61);
    this.knobB = this.add(function (m) { m.cyl(0.05, 0.04, 0xe63946, 0, 0, 0, { seg: 8, r: [Math.PI / 2, 0, 0] }); m.box(0.015, 0.05, 0.02, 0xffffff, 0, 0.02, 0.025); }, 0.4, 0.74, -2.61);
    $.knobA = this.click(this.knobA, 0.14, () => this._fireA());
    $.knobB = this.click(this.knobB, 0.14, () => {
      this.fireB = !this.fireB;
      this.flameB.visible = this.fireB;
      this.knobB.rotation.z = this.fireB ? 1.2 : 0;
    });
    // panela
    b.cyl(0.19, 0.2, 0xd62828, -0.4, 1.035, -3.0, { seg: 12, rt: 0.21 });
    b.box(0.08, 0.025, 0.05, 0x2b2d42, -0.65, 1.1, -3.0);
    b.box(0.08, 0.025, 0.05, 0x2b2d42, -0.15, 1.1, -3.0);
    this.soup = this.add(function (m) { m.cyl(0.185, 0.02, 0x90e0ef, 0, 0, 0, { seg: 12 }); }, -0.4, 1.0, -3.0);
    $.pot = this.zone([-0.4, 1.17, -3.0], { accepts: (it) => it.type === 'veg' && it.data.chopped, lock: true, radius: 0.27,
      slots: [[0.05, -0.1, 0.04], [-0.06, -0.09, -0.02], [0, -0.08, -0.06]],
      onReject: (it) => { if (it.type === 'veg') this.fail(); },
      onPlace: () => { this.sfx('pop'); this.soup.position.y = 1.0 + $.pot.count() * 0.035; this.burst($.pot.anchor, 0x90e0ef, 8, { speed: 0.8 }); } });
    $.scoop = this.contact($.pot.anchor, { tool: 'ladle', radius: 0.2, time: 0.5, sfx: 'pour',
      when: () => this.soupReady && !$.ladle.data.full,
      onDone: () => { $.ladle.data.full = true; $.ladle.setMesh(model(ladle(true))); this.sfx('pop'); if (this.stepIndex === 1) this.w.setHint($.bowl.obj, 0.3); } });
    // frigideira
    b.cyl(0.15, 0.035, 0x343a40, 0.4, 0.95, -3.0, { seg: 12, rt: 0.18 });
    b.box(0.26, 0.025, 0.04, 0x2b2d42, 0.7, 0.96, -3.0);
    $.pan = this.zone([0.4, 0.972, -3.0], { accepts: 'patty', radius: 0.25, hover: 0.06 });

    // prato de montagem + ingredientes
    $.plate = this.item('plate', function (m) { m.cyl(0.11, 0.02, 0xffffff, 0, 0.01, 0, { seg: 12, rt: 0.16 }); m.cyl(0.1, 0.004, 0xffd6a5, 0, 0.021, 0, { seg: 12 }); },
      1.4, 0.9, -2.98, { h: 0.1, radius: 0.2, grabbable: false });
    $.stack = this.zone(this.anchor(0, 0.022, 0, $.plate.obj), { lock: true, radius: 0.26, hover: 0.05,
      slots: [[0, 0, 0], [0, 0.03, 0], [0, 0.058, 0], [0, 0.07, 0], [0, 0.083, 0]],
      accepts: (it) => it.type === ORDER[$.stack.count()] && (it.type !== 'patty' || it.data.state === 'done'),
      onReject: (it) => { if (ORDER.indexOf(it.type) >= 0) this.fail('kt_order'); },
      onPlace: () => { if ($.stack.count() === 5) { $.plate.grabbable = true; $.plate.data.ready = true; this.sfx('ding'); this.w.setHint($.service.anchor, 0.3); } } });
    b.box(1.5, 0.02, 0.36, 0x52b788, 2.55, 0.91, -3.0);
    $.bunB = this.item('bunB', function (m) { m.cyl(0.085, 0.03, 0xe9a03b, 0, 0.015, 0, { seg: 10 }); }, 2.0, 0.92, -3.0, { h: 0.04, radius: 0.13 });
    $.cheese = this.item('cheese', function (m) { m.box(0.15, 0.012, 0.15, 0xffd60a, 0, 0.006, 0); }, 2.36, 0.92, -3.0, { h: 0.03, radius: 0.13 });
    $.lettuce = this.item('lettuce', function (m) { m.cyl(0.095, 0.014, 0x80ed99, 0, 0.007, 0, { seg: 7 }); }, 2.72, 0.92, -3.0, { h: 0.03, radius: 0.13 });
    $.bunT = this.item('bunT', function (m) { m.sph(0.088, 0xe9a03b, 0, 0.03, 0, { s: [1, 0.62, 1] }); }, 3.08, 0.92, -3.0, { h: 0.05, radius: 0.13 });

    // ===== geladeira (parede esquerda) =====
    b.box(0.06, 1.9, 0.9, 0xdee2e6, -3.42, 0.95, -2.0);
    b.box(0.8, 1.9, 0.05, 0xdee2e6, -3.05, 0.95, -2.43);
    b.box(0.8, 1.9, 0.05, 0xdee2e6, -3.05, 0.95, -1.57);
    b.box(0.8, 0.06, 0.9, 0xdee2e6, -3.05, 1.9, -2.0);
    b.box(0.8, 0.3, 0.9, 0xdee2e6, -3.05, 0.15, -2.0);
    b.box(0.74, 0.02, 0.82, 0xcaf0f8, -3.05, 0.8, -2.0);
    b.box(0.74, 0.02, 0.82, 0xcaf0f8, -3.05, 1.25, -2.0);
    b.box(0.02, 1.5, 0.82, 0xa8dadc, -3.38, 1.1, -2.0);
    this.w.addSolid(-3.45, -2.65, -2.45, -1.55, 1.95);
    this.door = this.anchor(-2.65, 0, -1.55);
    this.add(function (m) {
      m.box(0.06, 1.84, 0.9, 0xf8f9fa, 0.03, 0.97, -0.45);
      m.box(0.04, 0.5, 0.04, 0x8d99ae, 0.09, 1.1, -0.8);
      m.box(0.01, 0.2, 0.3, 0xe63946, 0.065, 1.5, -0.4);
    }, 0, 0, 0, this.door);
    $.fridge = this.click([-2.6, 1.1, -2.0], 0.42, () => this._openFridge());
    $.veg = [];
    const kinds = ['tomato', 'carrot', 'onion'];
    for (let i = 0; i < 3; i++) $.veg.push(this.item('veg', VEG[kinds[i]].whole, -3.05, 1.26, -2.25 + i * 0.25, { h: 0.1, radius: 0.12, grabbable: false, data: { kind: kinds[i], chopped: false } }));
    $.patties = [];
    this._patty(-2.2); this._patty(-1.8);
    $.oranges = [];
    for (let i = 0; i < 3; i++) $.oranges.push(this.item('orange', function (m) { m.sph(0.06, 0xffa200, 0, 0.06, 0); m.cyl(0.012, 0.015, 0x40916c, 0, 0.122, 0, { seg: 5 }); }, -3.05, 0.31, -2.25 + i * 0.25, { h: 0.12, radius: 0.12, grabbable: false }));

    // lixeira
    b.cyl(0.17, 0.5, 0x6c757d, -3.1, 0.25, -0.9, { seg: 10, rt: 0.21 });
    b.cyl(0.19, 0.02, 0x2b2d42, -3.1, 0.5, -0.9, { seg: 10 });
    $.trash = this.zone([-3.1, 0.6, -0.9], { accepts: 'patty', radius: 0.3, hover: 0.1, slots: [[0, -0.2, 0]],
      onPlace: (it) => { this.after(0.25, () => { this.w.remove(it); this._patty(-2.0); }); } });

    // ===== balcão de pedidos (parede esquerda, frente) =====
    this.solid(-3.05, 1.2, 0.8, 2.0, 0.9, 0xf4f1de, { top: 0xe63946 });
    b.box(0.06, 0.9, 1.5, 0x3a3f5c, -3.46, 1.75, 1.2);
    b.box(0.08, 0.08, 1.6, 0xffd60a, -3.44, 2.24, 1.2);
    this.label('PEDIDOS', 0.8, 0.22, -3.42, 2.42, 1.2, Math.PI / 2, { bg: '#e63946', fg: '#ffffff', edge: '#ffffff' });
    b.plane(0.4, 0.4, 0xffd60a, -3.0, 0.903, 1.3);
    $.service = this.zone([-3.0, 0.91, 1.3], { accepts: ['bowl', 'plate', 'glass'], radius: 0.3 });
    this.bell = this.add(function (m) { m.cyl(0.08, 0.02, 0x2b2d42, 0, 0.01, 0, { seg: 10 }); m.sph(0.065, 0xffd60a, 0, 0.02, 0, { s: [1, 0.8, 1] }); m.cyl(0.012, 0.03, 0x2b2d42, 0, 0.085, 0, { seg: 5 }); }, -2.95, 0.9, 0.6);
    $.bell = this.click([-2.95, 0.96, 0.6], 0.16, () => this._bell());
    $.bowl = this.item('bowl', bowl(false), -3.0, 0.9, 1.95, { h: 0.07, radius: 0.15, data: { full: false } });
    $.serve = this.contact($.bowl.obj, { tool: 'ladle', radius: 0.18, time: 0.5, sfx: 'pour', tilt: 0.8,
      when: () => $.ladle.data.full && !$.bowl.data.full,
      onDone: () => {
        $.bowl.data.full = true; $.bowl.setMesh(model(bowl(true)));
        $.ladle.data.full = false; $.ladle.setMesh(model(ladle(false)));
        this.sfx('pop');
        if (this.stepIndex === 1) this.w.setHint($.service.anchor, 0.3);
      } });

    // ===== bancada da direita: liquidificador, pia, escorredor =====
    this.solid(3.05, 0.45, 0.8, 4.0, 0.9, 0xf4f1de, { top: 0x8d99ae });
    b.box(0.24, 0.14, 0.24, 0x3a3f5c, 3.05, 0.97, -1.0);
    this.jar = this.add(function (m) { m.cyl(0.085, 0.24, 0xcaf0f8, 0, 0.12, 0, { seg: 8, rt: 0.11 }); m.box(0.03, 0.12, 0.05, 0xcaf0f8, -0.13, 0.14, 0); }, 3.05, 1.04, -1.0);
    this.btn = this.add(function (m) { m.cyl(0.035, 0.03, 0x80ed99, 0, 0, 0, { seg: 8, r: [0, 0, Math.PI / 2], glow: true }); }, 2.92, 0.97, -1.0);
    $.jar = this.zone([3.05, 1.3, -1.0], { accepts: 'orange', lock: true, radius: 0.24, slots: [[0, -0.14, 0], [0, -0.04, 0]] });
    $.blend = this.click([2.9, 0.97, -1.0], 0.13, () => this._blend());
    b.plane(0.22, 0.22, 0xffd60a, 2.95, 0.903, -0.55);
    $.spot = this.zone([2.95, 0.91, -0.55], { accepts: 'glass', radius: 0.2 });
    $.glass = this.item('glass', glass(false), 3.1, 0.9, -0.1, { h: 0.13, radius: 0.12, data: { full: false } });
    // pia
    b.box(0.5, 0.02, 0.7, 0x495057, 3.0, 0.905, 0.9);
    b.box(0.06, 0.26, 0.06, 0xadb5bd, 3.3, 1.03, 0.9);
    b.box(0.2, 0.05, 0.05, 0xadb5bd, 3.2, 1.16, 0.9);
    this.tap = this.add(function (m) { m.cyl(0.035, 0.05, 0x4895ef, 0, 0, 0, { seg: 8 }); m.box(0.1, 0.02, 0.02, 0x4895ef, 0, 0.03, 0); }, 3.3, 1.2, 0.9);
    this.stream = this.add(function (m) { m.cyl(0.015, 0.22, 0x90e0ef, 0, 0, 0, { seg: 6 }); }, 3.12, 1.03, 0.9);
    this.stream.visible = false;
    $.tap = this.click([3.3, 1.2, 0.9], 0.15, () => { this.water = !this.water; this.stream.visible = this.water; this.tap.rotation.y = this.water ? 1.2 : 0; if (this.water) this.sfx('pour'); });
    $.sink = this.zone([3.0, 0.92, 0.9], { accepts: (it) => it.type === 'dish' && !it.data.clean, radius: 0.36, slots: [[0, 0, -0.22], [0, 0, 0], [0, 0, 0.22]] });
    $.sponge = this.item('sponge', function (m) { m.box(0.12, 0.04, 0.08, 0xffd60a, 0, 0.02, 0); m.box(0.12, 0.015, 0.08, 0x52b788, 0, 0.047, 0); }, 3.0, 0.9, 0.3, { h: 0.06, radius: 0.13, tool: true });
    // escorredor
    b.box(0.4, 0.03, 0.56, 0xffd60a, 3.0, 0.915, 1.85);
    for (let i = 0; i < 4; i++) b.box(0.3, 0.12, 0.012, 0xf4a300, 3.0, 0.99, 1.62 + i * 0.155);
    $.rack = this.zone([3.0, 0.94, 1.85], { accepts: (it) => it.type === 'dish' && it.data.clean, lock: true, radius: 0.34, slots: [[0, 0, -0.15], [0, 0, 0], [0, 0, 0.15]],
      onReject: (it) => { if (it.type === 'dish') this.fail(); } });
    $.dishes = [];
    for (let i = 0; i < 3; i++) {
      const d = this.item('dish', dish(false), 3.0, 0.9 + i * 0.022, 2.3, { h: 0.03, radius: 0.16, data: { clean: false } });
      $.dishes.push(d);
      d.scrub = this.contact(d.obj, { tool: 'sponge', radius: 0.15, time: 1.0, sfx: 'scrub',
        when: () => d.zone === $.sink && this.water && !d.data.clean,
        onDone: () => { d.data.clean = true; d.setMesh(model(dish(true))); this.burst(d.obj, [0xffffff, 0x90e0ef], 14); this.sfx('ding'); } });
    }

    this.steps = [
      { title: 'Abra a geladeira, corte os 3 legumes na tábua e jogue na panela.', line: 'kt_1',
        start: () => { if (!this.open) this.w.setHint($.fridge.anchor, 0.5); }, check: () => $.pot.count() === 3,
        progress: () => 'Na panela: ' + $.pot.count() + '/3' },
      { title: 'Acenda o fogo, sirva a sopa na tigela com a concha, leve ao balcão e toque a campainha.', line: 'kt_2',
        start: () => this.w.setHint(this.knobA, 0.2), check: () => !!this.served.soup,
        progress: () => this.soupReady ? 'Sopa pronta!' : (this.fireA ? 'Cozinhando...' : 'Fogo apagado') },
      { title: 'Frite a carne e monte: pão, carne, queijo, alface, pão. Balcão e campainha!', line: 'kt_3',
        start: () => this.w.setHint($.patties[0].obj, 0.25), check: () => !!this.served.burger,
        progress: () => 'Montagem: ' + ($.stack.enabled ? $.stack.count() : 5) + '/5' },
      { title: '2 laranjas no liquidificador, copo ao lado, e clique para bater. Sirva!', line: 'kt_4',
        start: () => this.w.setHint($.jar.anchor, 0.2), check: () => !!this.served.juice,
        progress: () => 'Laranjas: ' + $.jar.count() + '/2' },
      { title: 'Lave os 3 pratos na pia (torneira aberta + esponja) e guarde no escorredor.', line: 'kt_5',
        start: () => this.w.setHint($.dishes[2].obj, 0.3), check: () => $.rack.count() === 3,
        progress: () => 'No escorredor: ' + $.rack.count() + '/3' }
    ];
  }

  _patty(z) {
    const p = this.item('patty', patty(PATTY.raw), -3.05, 0.81, z, { h: 0.03, radius: 0.12, grabbable: this.open, data: { state: 'raw', cook: 0 } });
    this.$.patties.push(p);
    return p;
  }

  _openFridge() {
    if (this.open) return;
    this.open = true;
    this.$.fridge.enabled = false;
    this.tween(this.door.rotation, { y: -1.9 }, 0.5);
    this.sfx('pop');
    const all = this.$.veg.concat(this.$.patties, this.$.oranges);
    for (let i = 0; i < all.length; i++) all[i].grabbable = true;
    if (this.stepIndex === 0) this.w.setHint(this.$.veg[0].obj, 0.25);
  }

  _fireA() {
    if (this.fireA) return;
    if (this.$.pot.count() < 3) { this.fail('kt_fire'); return; }
    this.fireA = true;
    this.flameA.visible = true;
    this.knobA.rotation.z = 1.2;
    this.cookT = 4;
    this.w.setHint(null);
  }

  _bell() {
    const $ = this.$, it = $.service.first();
    this.tween(this.bell.scale, { y: 0.7 }, 0.06, { done: () => this.tween(this.bell.scale, { y: 1 }, 0.12) });
    this.sfx('ding');
    let what = '';
    if (it) {
      if (it.type === 'bowl' && it.data.full) what = 'soup';
      else if (it.type === 'plate' && it.data.ready) what = 'burger';
      else if (it.type === 'glass' && it.data.full) what = 'juice';
    }
    if (!what) { this.fail('kt_bell'); return; }
    it.grabbable = false;
    this.burst(it.obj, 0xffd60a, 14);
    this.tween(it.obj.position, { x: -0.6 }, 0.6, { delay: 0.2, ease: (k) => k * k, done: () => {
      if (it === $.plate) { $.stack.enabled = false; for (let i = 0; i < 5; i++) if ($.stack.items[i]) this.w.remove($.stack.items[i]); }
      this.w.remove(it);
      this.served[what] = true;
    } });
  }

  _blend() {
    const $ = this.$, g = $.spot.first();
    if (this.blending) return;
    if ($.jar.count() < 2 || !g || g.data.full) { this.fail(); return; }
    this.blending = true;
    g.grabbable = false;
    for (let i = 0; i < 9; i++) this.after(i * 0.2, () => { this.sfx('drill'); this.burst(this.jar, 0xffa200, 2, { speed: 0.6 }); });
    this.after(1.9, () => {
      this.blending = false;
      this.jar.rotation.z = 0;
      const o = $.jar.items.slice();
      for (let i = 0; i < o.length; i++) if (o[i]) this.w.remove(o[i]);
      g.data.full = true; g.setMesh(model(glass(true))); g.grabbable = true;
      this.sfx('ding');
      this.w.setHint($.service.anchor, 0.3);
    });
  }

  tick(dt) {
    const $ = this.$;
    this.fxT -= dt;
    const pulse = this.fxT <= 0;
    if (pulse) this.fxT = 0.35;
    if (this.blending) this.jar.rotation.z = Math.sin(this.time * 60) * 0.06;
    // sopa
    if (this.fireA && !this.soupReady) {
      this.cookT -= dt;
      if (pulse) { this.burst($.pot.anchor, 0xffffff, 2, { speed: 0.3, up: 0.8, gravity: -0.5 }); this.sfx('sizzle'); }
      if (this.cookT <= 0) {
        this.soupReady = true;
        this.sfx('ding');
        this.soup.position.y = 1.11;
        this.burst($.pot.anchor, 0xff8a1f, 14);
        if (this.stepIndex === 1) this.w.setHint($.ladle.obj, 0.4);
      }
    }
    // carne na frigideira
    const p = $.pan.first();
    if (p && this.fireB && p.data.state !== 'burnt') {
      p.data.cook += dt;
      if (pulse) { this.sfx('sizzle'); this.burst(p.obj, 0xdee2e6, 1, { speed: 0.3, up: 0.7, gravity: -0.5 }); }
      if (p.data.state === 'raw' && p.data.cook >= 4) {
        p.data.state = 'done'; p.setMesh(model(patty(PATTY.done))); this.sfx('ding');
        this.burst(p.obj, 0xffd60a, 10);
      } else if (p.data.state === 'done' && p.data.cook >= 12) {
        p.data.state = 'burnt'; p.setMesh(model(patty(PATTY.burnt)));
        this.burst(p.obj, 0x343a40, 20, { speed: 0.8, up: 1.5, gravity: -1 });
        this.fail('kt_burn');
        this.w.setHint($.trash.anchor, 0.3);
      }
    }
  }
}
