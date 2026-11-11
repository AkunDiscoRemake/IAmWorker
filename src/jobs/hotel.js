// Profissão 6: Hotel Soneca Palace (recepção + quarto 204).
import { JobBase } from '../core/scene.js';
import { model } from '../core/build.js';
import { person } from '../core/people.js';

const KEYS = [307, 101, 204];
const suitcase = function (c) {
  return function (b) {
    b.box(0.5, 0.34, 0.2, c, 0, 0.19, 0);
    b.box(0.52, 0.04, 0.22, 0x2b2d42, 0, 0.19, 0);
    b.tor(0.07, 0.015, 0x2b2d42, 0, 0.39, 0, { seg: 8 });
    b.box(0.06, 0.02, 0.06, 0x2b2d42, -0.18, 0.01, 0); b.box(0.06, 0.02, 0.06, 0x2b2d42, 0.18, 0.01, 0);
  };
};
const pillow = function (b) { b.sph(0.2, 0xffffff, 0, 0.08, 0, { s: [1.5, 0.4, 0.9], seg: 8, hseg: 5 }); b.box(0.5, 0.02, 0.05, 0x90e0ef, 0, 0.12, 0.1); };

export class Hotel extends JobBase {
  constructor(game) {
    super(game);
    this.id = 'hotel'; this.name = 'Hotel'; this.prefix = 'ht'; this.hat = 'hotel';
    this.bg = 0xf8edeb; this.music = [233, 0.32];
    this.spawn = [-2.0, 2.3, 0];
    this.dusted = 0; this.rung = false;
  }

  build() {
    const b = this.sb, $ = this.$;
    this.room({ w: 8, d: 7, floor: [0xb5651d, 0xa85a17], wall: 0xfff1e6, low: 0xb5179e, trim: 0xffd60a });
    this.fixtures([-2.0, 2.62, -3.47], 0, [-3.96, 1.25, 2.6], Math.PI / 2);

    // divisória recepção | quarto, com vão de porta
    b.box(0.16, 3.2, 3.9, 0xfff1e6, 0.5, 1.6, -1.55);
    b.box(0.16, 3.2, 1.5, 0xfff1e6, 0.5, 1.6, 2.75);
    b.box(0.16, 1.0, 1.6, 0xfff1e6, 0.5, 2.7, 1.2);
    b.box(0.2, 2.2, 0.1, 0x7f5539, 0.5, 1.1, 0.4); b.box(0.2, 2.2, 0.1, 0x7f5539, 0.5, 1.1, 2.0); b.box(0.2, 0.1, 1.7, 0x7f5539, 0.5, 2.2, 1.2);
    this.w.colliders.push({ minx: 0.4, maxx: 0.6, minz: -3.5, maxz: 0.42 }, { minx: 0.4, maxx: 0.6, minz: 1.98, maxz: 3.5 });
    this.label('204', 0.4, 0.2, 0.41, 2.4, 1.2, -Math.PI / 2, { bg: '#ffd60a', edge: '#7f5539' });
    // carpete do quarto
    b.plane(3.4, 6.9, 0x9d4edd, 2.3, 0.006, 0);
    b.plane(3.0, 6.5, 0xc77dff, 2.3, 0.009, 0);
    b.plane(2.0, 1.4, 0xd62828, -2.0, 0.006, -0.3);
    b.plane(1.7, 1.1, 0xe5383b, -2.0, 0.009, -0.3);

    // ===== recepção =====
    this.solid(-2.0, -1.6, 2.4, 0.7, 0.95, 0x7f5539, { top: 0xf8f9fa });
    b.box(2.4, 0.1, 0.04, 0xffd60a, -2.0, 0.6, -1.24);
    this.label('HOTEL SONECA PALACE  ★★★★★', 2.6, 0.3, -1.9, 1.75, -3.47, 0, { px: 512, bg: '#b5179e', fg: '#ffd60a', edge: '#ffd60a' });
    b.cyl(0.07, 0.02, 0x2b2d42, -1.1, 0.96, -1.6, { seg: 8 }); b.sph(0.06, 0xffd60a, -1.1, 0.98, -1.6, { s: [1, 0.8, 1] });
    b.plane(0.3, 0.22, 0x80ed99, -2.0, 0.953, -1.55);
    $.keyTray = this.zone([-2.0, 0.96, -1.55], { accepts: (it) => it.type === 'key' && it.data.n === 204, lock: true, radius: 0.3,
      onReject: (it) => { if (it.type === 'key') { this.fail('ht_key'); this.w.sendHome(it); } },
      onPlace: () => { this.tween(this.guest.position, { y: 0.25 }, 0.18, { done: () => this.tween(this.guest.position, { y: 0 }, 0.2) }); this.burst(this.guest, 0xff70a6, 14, { up: 3 }); } });
    this.guest = person({ skin: 0xc68642, hair: 0x2b2d42, top: 0x4cc9f0, bottom: 0xf4a300, bun: false });
    this.guest.position.set(-2.0, 0, -2.6);
    this.root.add(this.guest);
    // quadro de chaves
    b.box(0.05, 0.7, 1.7, 0x7f5539, -3.96, 1.45, 0);
    $.keys = [];
    for (let i = 0; i < 3; i++) {
      const z = -0.55 + i * 0.55, n = KEYS[i];
      this.label(String(n), 0.34, 0.16, -3.92, 1.68, z, Math.PI / 2, { bg: '#fff1e6', edge: '#7f5539' });
      b.cyl(0.012, 0.06, 0xffd60a, -3.9, 1.53, z, { seg: 5, r: [0, 0, Math.PI / 2] });
      $.keys.push(this.item('key', function (m) {
        m.tor(0.035, 0.01, 0xffd60a, 0, 0.2, 0, { seg: 8, r: [0, Math.PI / 2, 0] });
        m.box(0.012, 0.11, 0.02, 0xffd60a, 0, 0.115, 0);
        m.box(0.012, 0.02, 0.04, 0xffd60a, 0, 0.075, 0.02);
        m.box(0.02, 0.09, 0.07, i === 0 ? 0x4895ef : (i === 1 ? 0x52b788 : 0xe63946), 0, 0.03, 0);
      }, -3.86, 1.28, z, { h: 0.24, radius: 0.13, data: { n: n } }));
    }
    // vaso
    b.cyl(0.2, 0.4, 0xffd60a, -3.5, 0.2, -3.0, { seg: 8, rt: 0.26 }); b.sph(0.42, 0x40916c, -3.5, 0.85, -3.0); b.sph(0.28, 0x52b788, -3.4, 1.25, -2.95);

    // malas
    $.bags = [
      this.item('bag', suitcase(0xe63946), -0.55, 0, -2.5, { h: 0.4, radius: 0.26 }),
      this.item('bag', suitcase(0x4895ef), -0.1, 0, -2.1, { h: 0.4, radius: 0.26 })
    ];

    // ===== quarto =====
    // cama
    b.box(1.8, 0.3, 2.2, 0x7f5539, 2.6, 0.15, -2.3);
    b.box(1.74, 0.25, 2.1, 0xf8f9fa, 2.6, 0.425, -2.3);
    b.box(1.9, 1.1, 0.1, 0x7f5539, 2.6, 0.55, -3.43);
    b.box(1.5, 0.3, 0.06, 0xffd60a, 2.6, 0.9, -3.37);
    this.w.addSolid(1.7, 3.5, -3.45, -1.2, 0.55);
    $.dirty = this.item('sheetDirty', function (m) {
      m.sph(0.3, 0xd4c9a8, 0, 0.1, 0, { s: [1.5, 0.5, 1.2], seg: 7, hseg: 5 });
      m.sph(0.2, 0xc2b594, 0.3, 0.12, 0.2, { s: [1.2, 0.6, 1], seg: 6, hseg: 4 });
      m.sph(0.18, 0xd4c9a8, -0.3, 0.1, -0.2, { s: [1.2, 0.6, 1], seg: 6, hseg: 4 });
    }, 2.6, 0.55, -2.0, { h: 0.2, radius: 0.4 });
    $.bed = this.zone([2.6, 0.555, -2.0], { accepts: 'sheetClean', lock: true, radius: 0.6, hover: 0.15,
      onPlace: (it) => {
        it.setMesh(model(function (m) { m.box(1.78, 0.05, 1.5, 0x90e0ef, 0, 0.025, 0.07); m.box(1.78, 0.052, 0.25, 0xffffff, 0, 0.026, -0.56); }));
        this.sfx('whoosh');
        this.burst(it.obj, 0xffffff, 14);
        this.w.setHint($.pillows[0].obj, 0.35);
      } });
    $.pillowZone = this.zone([2.6, 0.56, -3.0], { accepts: (it) => it.type === 'pillow' && $.bed.count() === 1, lock: true, radius: 0.6,
      slots: [[-0.42, 0, 0], [0.42, 0, 0]], onReject: (it) => { if (it.type === 'pillow') this.fail('ht_sheet'); } });
    $.pillows = [this.item('pillow', pillow, 1.25, 0, -0.9, { h: 0.16, radius: 0.28 }), this.item('pillow', pillow, 3.4, 0, -0.5, { h: 0.16, radius: 0.28 })];
    // cesto de roupa
    b.cyl(0.24, 0.6, 0xddb892, 1.05, 0.3, 0.0, { seg: 10, rt: 0.3 });
    b.cyl(0.31, 0.03, 0xb08968, 1.05, 0.6, 0.0, { seg: 10 });
    $.hamper = this.zone([1.05, 0.62, 0.0], { accepts: 'sheetDirty', lock: true, radius: 0.4, hover: 0.15, slots: [[0, -0.12, 0]],
      onPlace: (it) => { this.tween(it.obj.scale, { x: 0.6, y: 0.6, z: 0.6 }, 0.2); this.w.setHint($.clean.obj, 0.3); } });
    // criado-mudo + abajur, TV, quadro (pontos de poeira)
    this.solid(3.72, -3.15, 0.45, 0.5, 0.55, 0x7f5539, { top: 0x5c3a1e });
    b.cyl(0.07, 0.03, 0x2b2d42, 3.72, 0.565, -3.15, { seg: 8 }); b.cyl(0.015, 0.25, 0x2b2d42, 3.72, 0.7, -3.15, { seg: 5 });
    b.cyl(0.14, 0.2, 0xffd60a, 3.72, 0.92, -3.15, { seg: 8, rt: 0.09, glow: true });
    this.solid(3.72, 0.6, 0.5, 1.4, 0.6, 0x5c3a1e, { top: 0x7f5539 });
    b.box(0.06, 0.7, 1.2, 0x2b2d42, 3.94, 1.5, 0.6);
    b.box(0.02, 0.6, 1.1, 0x4cc9f0, 3.9, 1.5, 0.6, { glow: true });
    b.box(1.0, 0.7, 0.05, 0xffd60a, 2.6, 2.0, -3.46);
    b.box(0.86, 0.56, 0.05, 0x90e0ef, 2.6, 2.0, -3.45);
    b.sph(0.14, 0xff8a1f, 2.75, 2.08, -3.43, { s: [1, 1, 0.1] });
    b.cone(0.3, 0.3, 0x40916c, 2.4, 1.87, -3.42, { seg: 4, s: [1, 1, 0.1] });
    const dp = [[3.72, 0.95, -3.0], [3.84, 1.5, 0.6], [2.6, 2.0, -3.38]];
    $.dust = [];
    for (let i = 0; i < 3; i++) {
      const dm = this.add(function (m) {
        m.sph(0.1, 0xadb5bd, 0, 0, 0, { seg: 6, hseg: 4 });
        m.sph(0.07, 0xced4da, 0.1, 0.05, 0.02, { seg: 6, hseg: 4 });
        m.sph(0.07, 0x9aa5b1, -0.09, -0.04, 0.03, { seg: 6, hseg: 4 });
        m.sph(0.05, 0xced4da, 0.02, -0.1, 0.02, { seg: 6, hseg: 4 });
      }, dp[i][0], dp[i][1], dp[i][2]);
      $.dust.push(this.contact([dp[i][0], dp[i][1], dp[i][2]], { tool: 'duster', radius: 0.2, time: 0.8, sfx: 'scrub',
        onTick: (c) => { dm.scale.setScalar(Math.max(0.01, 1 - c.progress / c.time)); if (Math.random() < 0.5) this.burst(dm, 0xced4da, 1, { speed: 0.6 }); },
        onDone: () => { dm.visible = false; this.dusted++; this.sfx('ding'); this.burst(dm, [0xffffff, 0xffd60a], 12); } }));
    }
    // lixo e lixeira
    b.cyl(0.16, 0.4, 0x6c757d, 3.7, 0.2, 1.75, { seg: 8, rt: 0.2 });
    $.bin = this.zone([3.7, 0.5, 1.75], { accepts: 'trash', lock: true, radius: 0.32, hover: 0.12, slots: [[0, -0.3, 0], [0.03, -0.2, 0.02]] });
    $.trash = [
      this.item('trash', function (m) { m.sph(0.07, 0xf8f9fa, 0, 0.07, 0, { seg: 6, hseg: 4 }); }, 2.0, 0, 0.1, { radius: 0.14 }),
      this.item('trash', function (m) { m.cyl(0.045, 0.12, 0xe63946, 0, 0.045, 0, { seg: 8, r: [0, 0, Math.PI / 2] }); }, 3.1, 0, 2.0, { radius: 0.14 })
    ];
    // suporte de bagagem
    this.solid(3.2, 3.05, 1.3, 0.6, 0.4, 0x7f5539, { legs: true, top: 0xddb892 });
    $.rack = this.zone([3.2, 0.41, 3.05], { accepts: 'bag', lock: true, radius: 0.55, slots: [[-0.32, 0, 0], [0.32, 0, 0]] });
    // carrinho de serviço
    this.solid(1.5, 2.95, 1.4, 0.6, 0.9, 0xadb5bd, { top: 0xdee2e6 });
    $.clean = this.item('sheetClean', function (m) { m.box(0.3, 0.1, 0.24, 0x90e0ef, 0, 0.05, 0); m.box(0.31, 0.02, 0.25, 0xffffff, 0, 0.05, 0); }, 0.98, 0.9, 2.95, { h: 0.1, radius: 0.16 });
    $.duster = this.item('duster', function (m) {
      m.cyl(0.012, 0.25, 0x7f5539, 0, 0.125, 0, { seg: 5 });
      m.sph(0.08, 0xff70a6, 0, 0.3, 0, { s: [1, 1.5, 1], seg: 6, hseg: 5 });
      m.sph(0.06, 0xffd60a, 0, 0.4, 0, { seg: 6, hseg: 4 });
    }, 1.3, 0.9, 2.95, { h: 0.6, radius: 0.15, tool: true });
    $.dish = this.item('dish', function (m) {
      m.cyl(0.1, 0.015, 0xffffff, 0, 0.008, 0, { seg: 10, rt: 0.12 });
      m.sph(0.1, 0xced4da, 0, 0.015, 0, { s: [1, 0.8, 1], seg: 8, hseg: 6 });
      m.sph(0.02, 0x6c757d, 0, 0.1, 0);
    }, 1.58, 0.9, 2.95, { h: 0.1, radius: 0.13 });
    $.juice = this.item('juice', function (m) { m.cyl(0.035, 0.13, 0xffa200, 0, 0.065, 0, { seg: 8, rt: 0.045 }); m.cyl(0.006, 0.1, 0xe63946, 0.02, 0.15, 0, { seg: 5, r: [0, 0, -0.3] }); }, 1.84, 0.9, 2.95, { h: 0.13, radius: 0.12 });
    $.flower = this.item('flower', function (m) {
      m.cyl(0.035, 0.1, 0x4cc9f0, 0, 0.05, 0, { seg: 8, rt: 0.025 });
      m.cyl(0.008, 0.14, 0x40916c, 0, 0.16, 0, { seg: 5 });
      m.sph(0.045, 0xff70a6, 0, 0.25, 0); m.sph(0.02, 0xffd60a, 0, 0.25, 0.04);
    }, 2.08, 0.9, 2.95, { h: 0.25, radius: 0.12 });
    // mesinha com bandeja e sineta
    b.cyl(0.42, 0.04, 0xddb892, 2.3, 0.7, 0.95, { seg: 12 });
    b.cyl(0.05, 0.68, 0x7f5539, 2.3, 0.34, 0.95, { seg: 6 });
    b.cyl(0.25, 0.03, 0x7f5539, 2.3, 0.015, 0.95, { seg: 8 });
    this.w.addSolid(1.95, 2.65, 0.6, 1.3, 0.72);
    b.box(0.56, 0.02, 0.3, 0xadb5bd, 2.3, 0.73, 1.02);
    $.tray = this.zone([2.3, 0.742, 1.02], { accepts: ['dish', 'juice', 'flower'], lock: true, radius: 0.36,
      slots: [[-0.17, 0, 0], [0.02, 0, 0.02], [0.19, 0, -0.02]] });
    this.bell = this.add(function (m) { m.cyl(0.06, 0.015, 0x2b2d42, 0, 0.008, 0, { seg: 8 }); m.sph(0.05, 0xffd60a, 0, 0.015, 0, { s: [1, 0.85, 1] }); m.cyl(0.01, 0.03, 0x2b2d42, 0, 0.07, 0, { seg: 5 }); }, 2.3, 0.72, 0.72);
    $.bell = this.click([2.3, 0.78, 0.72], 0.13, () => {
      this.tween(this.bell.scale, { y: 0.7 }, 0.06, { done: () => this.tween(this.bell.scale, { y: 1 }, 0.12) });
      this.sfx('ding');
      if (this.stepIndex < 4 || $.tray.count() < 3) { this.fail(this.stepIndex >= 4 ? 'ht_tray' : undefined); return; }
      this.rung = true;
    });

    this.steps = [
      { title: 'Check-in: pegue a chave do quarto 204 e ponha no balcão.', line: 'ht_1',
        start: () => this.w.setHint($.keys[1].obj, 0.6), check: () => $.keyTray.count() === 1 },
      { title: 'Leve as 2 malas até o suporte de bagagem do quarto.', line: 'ht_2',
        start: () => this.w.setHint($.bags[0].obj, 0.5), check: () => $.rack.count() === 2,
        progress: () => 'Malas: ' + $.rack.count() + '/2' },
      { title: 'Lençol usado no cesto; lençol limpo e 2 travesseiros na cama.', line: 'ht_3',
        start: () => this.w.setHint($.dirty.obj, 0.5), check: () => $.hamper.count() === 1 && $.bed.count() === 1 && $.pillowZone.count() === 2,
        progress: () => 'Travesseiros: ' + $.pillowZone.count() + '/2' },
      { title: 'Espane os 3 pontos de poeira e jogue os 2 lixos na lixeira.', line: 'ht_4',
        start: () => this.w.setHint($.duster.obj, 0.7), check: () => this.dusted === 3 && $.bin.count() === 2,
        progress: () => 'Poeira: ' + this.dusted + '/3   Lixo: ' + $.bin.count() + '/2' },
      { title: 'Monte a bandeja (prato, suco e flor) na mesinha e toque a sineta.', line: 'ht_5',
        start: () => this.w.setHint($.dish.obj, 0.3), check: () => this.rung,
        progress: () => 'Na bandeja: ' + $.tray.count() + '/3' }
    ];
  }

  tick() {
    this.guest.rotation.y = Math.sin(this.time * 0.8) * 0.15;
  }
}
