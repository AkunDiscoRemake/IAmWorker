// Profissão 1: Escritório.
import { JobBase } from '../core/scene.js';
import { model } from '../core/build.js';

const mug = function (full) {
  return function (b) {
    b.cyl(0.05, 0.11, 0xffffff, 0, 0.055, 0, { seg: 10 });
    b.tor(0.035, 0.012, 0xffffff, 0.06, 0.055, 0, { seg: 8 });
    b.cyl(0.042, 0.01, full ? 0x6f4518 : 0xdedede, 0, 0.108, 0, { seg: 10 });
    b.box(0.03, 0.03, 0.004, 0xe63946, 0, 0.06, 0.05);
  };
};
const report = function (stamped) {
  return function (b) {
    b.box(0.21, 0.008, 0.29, 0xffffff, 0, 0.004, 0);
    b.box(0.15, 0.002, 0.02, 0x8d99ae, 0, 0.009, -0.09);
    b.box(0.15, 0.002, 0.02, 0x8d99ae, 0, 0.009, -0.04);
    b.box(0.1, 0.002, 0.02, 0x8d99ae, -0.025, 0.009, 0.01);
    if (stamped) b.cyl(0.04, 0.003, 0xd62828, 0.04, 0.0095, 0.08, { seg: 10 });
  };
};
const folder = function (c) {
  return function (b) {
    b.box(0.24, 0.035, 0.32, c, 0, 0.018, 0);
    b.box(0.08, 0.036, 0.04, 0xffffff, 0.05, 0.019, 0.17);
  };
};
const COLORS = [0xe63946, 0x4895ef, 0x52b788];

export class Office extends JobBase {
  constructor(game) {
    super(game);
    this.id = 'office'; this.name = 'Escritório'; this.prefix = 'of'; this.hat = 'office';
    this.bg = 0xcfe8ff; this.music = [220, 0.3];
    this.printed = 0; this.watered = false; this.answered = false; this.ringing = false; this.ringT = 0;
  }

  build() {
    const b = this.sb, $ = this.$;
    this.room({ w: 7, d: 7, floor: [0x9db4c0, 0x8fa9b6], wall: 0xfdf6e3, low: 0x4895ef });
    this.fixtures([0, 2.55, -3.47], 0, [-3.46, 1.25, 2.6], Math.PI / 2);

    // --- mesa do jogador ---
    this.solid(0, -2.75, 2.2, 0.9, 0.78, 0xb08968, { top: 0xddb892 });
    b.box(0.7, 0.45, 0.05, 0x2b2d42, 0, 1.2, -3.05);
    b.box(0.62, 0.37, 0.01, 0x4cc9f0, 0, 1.2, -3.02, { glow: true });
    b.box(0.3, 0.02, 0.012, 0xffffff, -0.1, 1.27, -3.012, { glow: true });
    b.box(0.4, 0.02, 0.012, 0xffffff, -0.05, 1.2, -3.012, { glow: true });
    b.box(0.2, 0.02, 0.012, 0xffd60a, -0.15, 1.13, -3.012, { glow: true });
    b.box(0.08, 0.2, 0.06, 0x2b2d42, 0, 0.88, -3.05);
    b.box(0.3, 0.02, 0.2, 0x2b2d42, 0, 0.79, -3.05);
    b.box(0.5, 0.02, 0.17, 0x3a3f5c, 0, 0.79, -2.7);
    $.badge = this.item('badge', function (m) {
      m.box(0.09, 0.012, 0.13, 0xffffff, 0, 0.006, 0);
      m.box(0.05, 0.004, 0.05, 0xff8a1f, 0, 0.014, -0.02);
      m.box(0.06, 0.004, 0.015, 0x2b2d42, 0, 0.014, 0.035);
      m.box(0.02, 0.012, 0.06, 0x4895ef, 0, 0.006, -0.09);
    }, -0.75, 0.78, -2.6, { h: 0.04, radius: 0.13 });
    this.phone = this.add(function (m) {
      m.box(0.2, 0.06, 0.2, 0xd62828, 0, 0.03, 0);
      m.box(0.24, 0.045, 0.06, 0x9d0208, 0, 0.085, -0.05);
      m.cyl(0.05, 0.01, 0xffffff, 0, 0.062, 0.04, { seg: 8 });
    }, 0.8, 0.78, -2.65);
    $.phone = this.click([0.8, 0.86, -2.65], 0.2, () => {
      if (!this.ringing) return;
      this.ringing = false;
      this.phone.rotation.z = 0;
      this.game.robot.say('of_phone', { interrupt: true, onEnd: () => { this.answered = true; } });
    });

    // --- relógio de ponto (parede esquerda, ao lado da porta) ---
    b.box(0.1, 0.5, 0.36, 0x3a3f5c, -3.45, 1.45, 1.5);
    b.box(0.02, 0.16, 0.24, 0x80ed99, -3.39, 1.55, 1.5, { glow: true });
    b.box(0.03, 0.05, 0.2, 0xffd60a, -3.38, 1.3, 1.5);
    this.label('PONTO', 0.36, 0.14, -3.44, 1.82, 1.5, Math.PI / 2, { bg: '#3a3f5c', fg: '#ffffff', edge: '#ffd60a' });
    $.clock = this.zone([-3.33, 1.3, 1.5], { accepts: 'badge', lock: true, radius: 0.3, hover: 0,
      onPlace: (it) => { this.sfx('beep'); this.burst(it.obj, 0x80ed99, 14); } });

    // --- cantinho do café (parede esquerda) ---
    this.solid(-3.05, -1.0, 0.8, 1.8, 0.85, 0xffffff, { top: 0x6c757d });
    b.box(0.36, 0.5, 0.42, 0xe63946, -3.2, 1.1, -1.4);
    b.box(0.3, 0.12, 0.3, 0x2b2d42, -3.02, 1.29, -1.4);
    b.box(0.26, 0.02, 0.3, 0x6c757d, -2.92, 0.86, -1.4);
    b.cyl(0.03, 0.02, 0x80ed99, -3.02, 1.2, -1.25, { seg: 8, r: [0, 0, Math.PI / 2], glow: true });
    this.stream = this.add(function (m) { m.cyl(0.012, 0.22, 0x6f4518, 0, 0, 0, { seg: 6 }); }, -2.92, 1.1, -1.4);
    this.stream.visible = false;
    $.coffee = this.zone([-2.92, 0.87, -1.4], { accepts: 'mug', radius: 0.25 });
    $.machine = this.click([-3.15, 1.25, -1.4], 0.26, () => this._brew());
    $.mug = this.item('mug', mug(false), -2.95, 0.85, -0.55, { h: 0.11, radius: 0.13, data: { full: false } });

    // --- mesa do chefe (um cacto de gravata) ---
    this.solid(2.45, -2.75, 1.5, 0.9, 0.78, 0x6f4518, { top: 0x8d5524 });
    b.cyl(0.14, 0.18, 0xd9480f, 3.0, 0.87, -3.05, { seg: 8, rt: 0.17 });
    b.cyl(0.11, 0.5, 0x52b788, 3.0, 1.2, -3.05, { seg: 8 });
    b.sph(0.11, 0x52b788, 3.0, 1.45, -3.05);
    b.cyl(0.04, 0.16, 0x52b788, 3.16, 1.25, -3.05, { seg: 6 });
    b.cyl(0.04, 0.16, 0x52b788, 2.84, 1.15, -3.05, { seg: 6 });
    b.sph(0.03, 0xffffff, 2.96, 1.4, -2.95); b.sph(0.03, 0xffffff, 3.04, 1.4, -2.95);
    b.sph(0.014, 0x2b2d42, 2.96, 1.4, -2.925); b.sph(0.014, 0x2b2d42, 3.04, 1.4, -2.925);
    b.box(0.04, 0.16, 0.02, 0xd62828, 3.0, 1.17, -2.935);
    this.label('CHEFE', 0.5, 0.16, 2.45, 0.5, -2.285, 0, { bg: '#ffd60a', edge: '#6f4518' });
    b.plane(0.2, 0.2, 0xffd60a, 2.15, 0.782, -2.6);
    $.boss = this.zone([2.15, 0.79, -2.6], { accepts: (it) => it.type === 'mug' && it.data.full, radius: 0.28, lock: true,
      onReject: (it) => { if (it.type === 'mug') this.fail('of_nocup'); },
      onPlace: (it) => { this.burst(it.obj, 0xffd60a, 12); } });

    // --- bancada de impressão (parede direita) ---
    this.solid(3.05, 0.2, 0.8, 3.4, 0.85, 0xffffff, { top: 0x6c757d });
    // bandeja de saída
    b.box(0.3, 0.03, 0.38, 0x4895ef, 3.0, 0.865, -1.2);
    this.label('SAÍDA', 0.34, 0.12, 3.44, 1.25, -1.2, -Math.PI / 2, { bg: '#4895ef', fg: '#ffffff', edge: '#ffffff' });
    $.outbox = this.zone([3.0, 0.885, -1.2], { accepts: (it) => it.type === 'report' && it.data.stamped, lock: true, radius: 0.28,
      slots: [[0, 0, 0], [0, 0.012, 0]], onReject: (it) => { if (it.type === 'report') this.fail(); } });
    // carimbo + almofada
    $.stamp = this.item('stamp', function (m) {
      m.box(0.08, 0.04, 0.08, 0x9d0208, 0, 0.02, 0);
      m.cyl(0.025, 0.08, 0x7f5539, 0, 0.08, 0, { seg: 8 });
      m.sph(0.04, 0x7f5539, 0, 0.13, 0);
    }, 3.0, 0.85, -0.68, { h: 0.1, radius: 0.13, tool: true });
    b.box(0.3, 0.015, 0.38, 0x52b788, 3.0, 0.858, -0.15);
    this.label('CARIMBO', 0.4, 0.12, 3.44, 1.25, -0.15, -Math.PI / 2, { bg: '#52b788', fg: '#ffffff', edge: '#ffffff' });
    $.pad = this.zone([3.0, 0.868, -0.15], { accepts: 'report', radius: 0.28 });
    $.stamping = this.contact($.pad.anchor, { tool: 'stamp', radius: 0.16, time: 0.45, repeat: true, sfx: '',
      when: () => { const r = $.pad.first(); return !!r && !r.data.stamped; },
      onDone: () => {
        const r = $.pad.first();
        r.data.stamped = true;
        r.setMesh(model(report(true)));
        this.sfx('chop');
        this.burst(r.obj, 0xd62828, 10);
      } });
    // impressora
    b.box(0.5, 0.26, 0.56, 0xe9ecef, 3.12, 0.98, 0.75);
    b.box(0.4, 0.06, 0.46, 0x3a3f5c, 3.12, 1.14, 0.75);
    b.box(0.3, 0.02, 0.36, 0xadb5bd, 2.78, 0.88, 0.75);
    b.box(0.02, 0.04, 0.1, 0x80ed99, 2.865, 1.05, 0.95, { glow: true });
    $.feed = this.zone([3.12, 1.17, 0.75], { accepts: 'paper', lock: true, radius: 0.28 });
    $.printer = this.click([3.12, 1.0, 0.75], 0.25, () => this._print());
    $.paper = this.item('paper', function (m) {
      m.box(0.22, 0.06, 0.3, 0xffffff, 0, 0.03, 0);
      m.box(0.225, 0.03, 0.305, 0x4895ef, 0, 0.03, 0);
    }, 3.0, 0.85, 1.55, { h: 0.06, radius: 0.16 });

    // --- nichos de pastas (fundo, à esquerda) ---
    this.solid(-2.3, -3.2, 1.6, 0.5, 1.25, 0xddb892, { top: 0xb08968 });
    $.cubby = [];
    for (let i = 0; i < 3; i++) {
      const x = -2.8 + i * 0.5;
      b.box(0.44, 0.34, 0.06, COLORS[i], x, 0.95, -2.96);
      b.box(0.44, 0.03, 0.14, COLORS[i], x, 0.775, -2.9);
      const c = COLORS[i];
      $.cubby.push(this.zone([x, 0.8, -2.86], { accepts: (it) => it.type === 'folder' && it.data.c === c, lock: true, radius: 0.24, hover: 0.04,
        onReject: (it) => { if (it.type === 'folder') this.fail(); } }));
    }
    const fp = [[-1.6, 0, -1.1], [-0.3, 0.78, -2.5], [1.5, 0, 0.7]];
    $.folders = [];
    for (let i = 0; i < 3; i++) $.folders.push(this.item('folder', folder(COLORS[i]), fp[i][0], fp[i][1], fp[i][2], { h: 0.04, radius: 0.18, data: { c: COLORS[i] } }));

    // --- lixeira e bolinhas de papel ---
    b.cyl(0.16, 0.36, 0x3a3f5c, 1.4, 0.18, -2.8, { seg: 10, rt: 0.2 });
    b.cyl(0.18, 0.02, 0x2b2d42, 1.4, 0.35, -2.8, { seg: 10 });
    $.bin = this.zone([1.4, 0.42, -2.8], { accepts: 'ball', lock: true, radius: 0.3, hover: 0.15,
      slots: [[0, -0.3, 0], [0.04, -0.24, 0.03], [-0.04, -0.18, -0.02], [0, -0.1, 0]] });
    const bp = [[-0.8, -0.5], [0.9, -1.2], [-1.9, 1.3], [1.9, 2.0]];
    $.balls = [];
    for (let i = 0; i < 4; i++) $.balls.push(this.item('ball', function (m) { m.sph(0.06, 0xf8f9fa, 0, 0.06, 0, { seg: 6, hseg: 4 }); }, bp[i][0], 0, bp[i][1], { radius: 0.13 }));

    // --- planta e regador ---
    b.cyl(0.2, 0.36, 0xd9480f, 2.9, 0.18, 2.9, { seg: 8, rt: 0.26 });
    b.cyl(0.24, 0.03, 0x5c3a1e, 2.9, 0.35, 2.9, { seg: 8 });
    this.plant = this.add(function (m) {
      m.cyl(0.03, 0.5, 0x40916c, 0, 0.25, 0, { seg: 6 });
      m.sph(0.16, 0x52b788, -0.14, 0.32, 0, { s: [1, 0.5, 0.7] });
      m.sph(0.16, 0x74c69d, 0.14, 0.4, 0.04, { s: [1, 0.5, 0.7] });
      m.sph(0.14, 0x52b788, 0, 0.5, -0.1, { s: [0.7, 0.5, 1] });
    }, 2.9, 0.36, 2.9);
    this.plant.scale.setScalar(0.55);
    this.plant.rotation.z = 0.35;
    this.flower = this.add(function (m) {
      m.sph(0.07, 0xffd60a, 0, 0, 0);
      for (let i = 0; i < 6; i++) m.sph(0.07, 0xff70a6, Math.cos(i * 1.047) * 0.1, 0, Math.sin(i * 1.047) * 0.1, { s: [1, 0.5, 1] });
    }, 2.9, 0.98, 2.9);
    this.flower.visible = false;
    $.can = this.item('can', function (m) {
      m.cyl(0.08, 0.16, 0x4cc9f0, 0, 0.08, 0, { seg: 8 });
      m.cyl(0.015, 0.2, 0x4cc9f0, 0.13, 0.12, 0, { seg: 6, r: [0, 0, -0.9] });
      m.tor(0.06, 0.012, 0x1982c4, -0.09, 0.1, 0, { seg: 8 });
    }, 2.2, 0, 2.9, { h: 0.16, radius: 0.16, tool: true });
    $.water = this.contact([2.9, 0.95, 2.9], { tool: 'can', radius: 0.3, time: 2, tilt: -0.9, sfx: 'pour',
      onTick: (c) => {
        const k = Math.min(1, c.progress / c.time);
        this.plant.scale.setScalar(0.55 + 0.45 * k);
        this.plant.rotation.z = 0.35 * (1 - k);
        if (Math.random() < 0.3) this.burst(this.plant, 0x4cc9f0, 1, { speed: 0.4, up: 0 });
      },
      onDone: () => { this.flower.visible = true; this.flower.scale.setScalar(0.1); this.tween(this.flower.scale, { x: 1, y: 1, z: 1 }, 0.5); this.burst(this.flower, [0xff70a6, 0xffd60a], 20); this.watered = true; } });

    this.steps = [
      { title: 'Bata o ponto: leve o crachá ao relógio de ponto.', line: 'of_1',
        start: () => this.w.setHint($.badge.obj, 0.25), check: () => $.clock.count() === 1 },
      { title: 'Faça café na cafeteira e leve a caneca cheia à mesa do chefe.', line: 'of_2',
        start: () => this.w.setHint($.mug.obj, 0.3), check: () => $.boss.count() === 1 },
      { title: 'Imprima, carimbe e arquive 2 relatórios.', line: 'of_3',
        start: () => this.w.setHint($.paper.obj, 0.3), check: () => $.outbox.count() === 2,
        progress: () => 'Arquivados: ' + $.outbox.count() + '/2' },
      { title: 'Bolinhas no lixo e pastas no nicho da mesma cor.', line: 'of_4',
        check: () => $.bin.count() === 4 && this._folders() === 3,
        progress: () => 'Lixo: ' + $.bin.count() + '/4   Pastas: ' + this._folders() + '/3' },
      { title: 'Regue a planta com o regador.', line: 'of_5',
        start: () => this.w.setHint($.can.obj, 0.35), check: () => this.watered },
      { title: 'Atenda o telefone!', line: 'of_6',
        start: () => { this.ringing = true; this.w.setHint($.phone.anchor, 0.3); }, check: () => this.answered }
    ];
  }

  _folders() { let n = 0; for (let i = 0; i < 3; i++) n += this.$.cubby[i].count(); return n; }

  _brew() {
    const m = this.$.coffee.first();
    if (this.brewing) return;
    if (!m || m.data.full) { this.fail('of_nocup'); return; }
    this.brewing = true;
    m.grabbable = false;
    this.stream.visible = true;
    for (let i = 0; i < 8; i++) this.after(i * 0.25, () => this.sfx('pour'));
    this.after(2.1, () => {
      m.data.full = true;
      m.setMesh(model(mug(true)));
      m.grabbable = true;
      this.brewing = false;
      this.stream.visible = false;
      this.sfx('ding');
      this.burst(m.obj, 0xffffff, 8, { speed: 0.5, up: 1, gravity: -0.5 });
      if (this.stepIndex === 1) this.w.setHint(this.$.boss.anchor, 0.3);
    });
  }

  _print() {
    if (this.printing) return;
    if (this.$.feed.count() === 0) { this.fail('of_nopaper'); return; }
    if (this.printed >= 2) { this.sfx('error'); return; }
    this.printing = true;
    this.printed++;
    this.sfx('print');
    const r = this.item('report', report(false), 3.0, 0.895 + this.printed * 0.012, 0.75, { h: 0.03, radius: 0.17, data: { stamped: false }, grabbable: false });
    this.tween(r.obj.position, { x: 2.78 }, 0.9, { done: () => { r.grabbable = true; this.printing = false; this.sfx('ding'); } });
  }

  tick(dt) {
    if (this.ringing) {
      this.ringT -= dt;
      this.phone.rotation.z = Math.sin(this.time * 40) * 0.08;
      if (this.ringT <= 0) { this.ringT = 1.6; this.sfx('ring'); }
    }
  }
}
