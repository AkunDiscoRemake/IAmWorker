// Profissão 3: Supermercado Bom Preço Mesmo.
import { JobBase } from '../core/scene.js';
import { TextPanel } from '../core/build.js';
import { person } from '../core/people.js';

const PROD = {
  milk: function (b) { b.box(0.11, 0.2, 0.11, 0xffffff, 0, 0.1, 0); b.box(0.115, 0.07, 0.115, 0x4895ef, 0, 0.09, 0); b.box(0.11, 0.04, 0.06, 0xffffff, 0, 0.22, 0); },
  cereal: function (b) { b.box(0.17, 0.25, 0.07, 0xff8a1f, 0, 0.125, 0); b.box(0.1, 0.1, 0.075, 0xffd60a, 0, 0.15, 0); },
  can: function (b) { b.cyl(0.055, 0.13, 0xc9d1d9, 0, 0.065, 0, { seg: 10 }); b.cyl(0.057, 0.08, 0xe63946, 0, 0.065, 0, { seg: 10 }); }
};
const TYPES = ['milk', 'cereal', 'can'];
const NAMES = ['LEITE', 'CEREAL', 'LATAS'];
const GROC = [
  { p: 6, m: function (b) { b.sph(0.1, 0xe9a03b, 0, 0.07, 0, { s: [1.5, 0.7, 0.9] }); } },                                          // pão
  { p: 9, m: function (b) { b.box(0.1, 0.19, 0.08, 0xffa200, 0, 0.095, 0); b.box(0.105, 0.05, 0.085, 0x52b788, 0, 0.13, 0); } },     // suco
  { p: 15, m: function (b) { b.cyl(0.1, 0.07, 0xffd60a, 0, 0.035, 0, { seg: 6 }); b.cyl(0.02, 0.072, 0xf4a300, 0.04, 0.035, 0.02, { seg: 5 }); } }, // queijo
  { p: 8, m: function (b) { b.cyl(0.05, 0.16, 0xc77dff, 0, 0.08, 0, { seg: 8 }); b.cyl(0.02, 0.05, 0xffffff, 0, 0.185, 0, { seg: 6 }); } }  // sabão
];
const NOTES = [[10, 0xe63946], [10, 0xe63946], [5, 0xc77dff], [2, 0x4895ef], [2, 0x4895ef], [2, 0x4895ef]];

export class Market extends JobBase {
  constructor(game) {
    super(game);
    this.id = 'market'; this.name = 'Supermercado'; this.prefix = 'mk'; this.hat = 'market';
    this.bg = 0xd8f3dc; this.music = [262, 0.27];
    this.total = 0; this.tagged = 0; this.mopped = 0; this.drawerOpen = false;
  }

  build() {
    const b = this.sb, $ = this.$;
    this.room({ w: 7, d: 7, floor: [0xf8f9fa, 0xdee2e6], wall: 0xffffff, low: 0x2a9d8f });
    this.fixtures([-1.2, 2.75, -3.47], 0, [-3.46, 1.25, 2.7], Math.PI / 2);

    // ===== gôndola do fundo =====
    this.w.addSolid(-3.0, 3.0, -3.45, -2.9, 2.05);
    b.box(6.0, 2.0, 0.08, 0x264653, 0, 1.0, -3.42);
    for (let i = 0; i < 4; i++) b.box(6.0, 0.05, 0.5, 0xe9ecef, 0, 0.1 + i * 0.5, -3.17);
    for (let i = 0; i < 4; i++) b.box(0.06, 2.0, 0.5, 0x264653, -3 + i * 2, 1.0, -3.17);
    $.shelf = [];
    for (let s = 0; s < 3; s++) {
      const x = -2 + s * 2, t = TYPES[s];
      this.label(NAMES[s], 0.9, 0.24, x, 2.18, -3.38, 0, { bg: '#2a9d8f', fg: '#ffffff', edge: '#ffffff' });
      // produtos de enfeite nas prateleiras de baixo e de cima
      for (let k = 0; k < 4; k++) {
        const px = x - 0.6 + k * 0.4;
        if (t === 'milk') { b.box(0.11, 0.2, 0.11, 0xffffff, px, 0.725, -3.17); b.box(0.115, 0.07, 0.115, 0x4895ef, px, 0.715, -3.17); b.box(0.11, 0.2, 0.11, 0xffffff, px, 1.725, -3.17); b.box(0.115, 0.07, 0.115, 0x4895ef, px, 1.715, -3.17); }
        else if (t === 'cereal') { b.box(0.17, 0.25, 0.07, 0xff8a1f, px, 0.75, -3.17); b.box(0.17, 0.25, 0.07, 0xff8a1f, px, 1.75, -3.17); }
        else { b.cyl(0.055, 0.13, 0xe63946, px, 0.69, -3.17, { seg: 8 }); b.cyl(0.055, 0.13, 0xe63946, px, 1.69, -3.17, { seg: 8 }); }
      }
      b.plane(0.9, 0.3, 0xffd60a, x, 1.128, -3.12);
      $.shelf.push(this.zone([x, 1.135, -3.12], { accepts: t, lock: true, radius: 0.45, slots: [[-0.2, 0, 0], [0.2, 0, 0]],
        onReject: (it) => { if (TYPES.indexOf(it.type) >= 0) this.fail(); } }));
    }
    // estrado com a mercadoria
    this.solid(0, -1.3, 1.3, 0.8, 0.3, 0xb08968, { top: 0xddb892 });
    $.stock = [];
    const order = ['can', 'milk', 'cereal', 'milk', 'can', 'cereal'];
    for (let i = 0; i < 6; i++) $.stock.push(this.item(order[i], PROD[order[i]], -0.45 + (i % 3) * 0.45, 0.3, -1.48 + ((i / 3) | 0) * 0.36, { h: 0.2, radius: 0.14 }));

    // ===== banca de ofertas (parede esquerda) =====
    this.solid(-3.05, -0.3, 0.8, 1.7, 0.8, 0xffd60a, { top: 0xf4a300 });
    this.label('OFERTA!', 1.0, 0.3, -3.47, 1.75, -0.3, Math.PI / 2, { bg: '#e63946', fg: '#ffd60a', edge: '#ffd60a' });
    $.tags = [];
    this.tagMesh = [];
    for (let i = 0; i < 3; i++) {
      const z = -0.9 + i * 0.45;
      b.cyl(0.07, 0.14, 0x9d0208, -3.05, 0.87, z, { seg: 8 });
      b.cyl(0.06, 0.03, 0xffffff, -3.05, 0.955, z, { seg: 8 });
      const tg = this.add(function (m) { m.box(0.012, 0.07, 0.09, 0xffffff, 0, 0, 0); m.box(0.014, 0.03, 0.06, 0xe63946, 0, 0, 0); }, -2.975, 0.87, z);
      tg.visible = false;
      this.tagMesh.push(tg);
      $.tags.push(this.contact([-3.0, 0.9, z], { tool: 'tagger', radius: 0.13, time: 0.45, sfx: '',
        onDone: () => { tg.visible = true; this.tagged++; this.sfx('beep'); this.burst(tg, 0xffd60a, 8, { speed: 0.8 }); } }));
    }
    $.tagger = this.item('tagger', function (m) {
      m.box(0.05, 0.07, 0.16, 0xff8a1f, 0, 0.09, 0);
      m.box(0.04, 0.1, 0.04, 0x2b2d42, 0, 0.03, 0.04);
      m.box(0.055, 0.03, 0.03, 0xffffff, 0, 0.09, -0.09);
    }, -2.95, 0.8, 0.38, { h: 0.12, radius: 0.14, tool: true });

    // ===== caixa =====
    this.solid(2.35, 0.75, 0.7, 3.6, 0.92, 0x2a9d8f, { top: 0xe9ecef });
    b.box(0.5, 0.012, 1.1, 0x343a40, 2.35, 0.927, 1.95);
    b.box(0.34, 0.012, 0.3, 0x212529, 2.35, 0.927, 1.05);
    b.box(0.26, 0.006, 0.03, 0xff0a54, 2.35, 0.936, 1.05, { glow: true });
    b.box(0.06, 0.3, 0.06, 0x3a3f5c, 2.62, 1.07, 1.05);
    $.scan = this.contact([2.35, 1.02, 1.05], { tool: (it) => it.type === 'grocery' && !it.data.scanned, radius: 0.16, time: 0.22, repeat: true, sfx: '',
      onDone: (c, it) => {
        it.data.scanned = true;
        this.total += it.data.price;
        this.sfx('beep');
        this.burst(it.obj, 0xff0a54, 6, { speed: 0.6 });
        this._display();
      } });
    // sacola
    b.box(0.3, 0.26, 0.02, 0xddb892, 2.35, 1.05, 0.36);
    b.box(0.3, 0.26, 0.02, 0xddb892, 2.35, 1.05, 0.64);
    b.box(0.02, 0.26, 0.28, 0xddb892, 2.5, 1.05, 0.5);
    b.box(0.02, 0.2, 0.28, 0xddb892, 2.2, 1.02, 0.5);
    $.bag = this.zone([2.35, 1.1, 0.5], { accepts: (it) => it.type === 'grocery' && it.data.scanned, lock: true, radius: 0.28, hover: 0.12,
      slots: [[-0.07, -0.16, -0.06], [0.07, -0.16, 0.06], [-0.07, -0.16, 0.06], [0.07, -0.16, -0.06]],
      onReject: (it) => { if (it.type === 'grocery') this.fail('mk_noscan'); } });
    // bandeja de pagamento / troco
    b.box(0.26, 0.02, 0.3, 0xffd60a, 2.5, 0.93, -0.05);
    $.change = this.zone([2.5, 0.945, -0.05], { accepts: 'note', radius: 0.24, hover: 0.06,
      slots: [[0, 0, 0], [0, 0.008, 0], [0, 0.016, 0], [0, 0.024, 0], [0, 0.032, 0], [0, 0.04, 0]],
      onPlace: () => this._change() });
    // registradora
    b.box(0.4, 0.3, 0.5, 0x3a3f5c, 2.4, 1.07, -0.7);
    b.box(0.3, 0.2, 0.4, 0x495057, 2.45, 1.3, -0.7);
    this.display = new TextPanel(0.38, 0.2, { px: 256, size: 44, bg: '#081c15', fg: '#80ed99', edge: '#495057', border: 4, bold: true });
    this.display.mesh.position.set(2.29, 1.32, -0.7);
    this.display.mesh.rotation.y = -Math.PI / 2;
    this.root.add(this.display.mesh);
    this.drawer = this.add(function (m) {
      m.box(0.32, 0.02, 0.46, 0xadb5bd, 0, 0, 0);
      m.box(0.02, 0.07, 0.46, 0x6c757d, -0.16, 0.035, 0);
      m.box(0.32, 0.07, 0.02, 0x6c757d, 0, 0.035, -0.23);
      m.box(0.32, 0.07, 0.02, 0x6c757d, 0, 0.035, 0.23);
      m.cyl(0.02, 0.03, 0xffd60a, -0.175, 0.04, 0, { seg: 6, r: [0, 0, Math.PI / 2] });
    }, 2.3, 0.95, -0.7);
    $.drawer = this.click([2.12, 1.0, -0.7], 0.2, () => this._openDrawer());
    $.till = this.zone([1.9, 0.975, -0.7], { accepts: 'bill50', lock: true, radius: 0.22, hover: 0.08 });
    $.till.enabled = false;
    $.notes = [];
    for (let i = 0; i < NOTES.length; i++) {
      const c = NOTES[i][1];
      const n = this.item('note', function (m) { m.box(0.1, 0.006, 0.06, c, 0, 0.003, 0); }, 1.8 + ((i / 3) | 0) * 0.17, 0.965, -0.86 + (i % 3) * 0.16,
        { h: 0.03, radius: 0.075, grabbable: false, data: { v: NOTES[i][0] } });
      const l = this.label(String(NOTES[i][0]), 0.05, 0.04, 0, 0.0075, 0, 0, { parent: n.obj, px: 64, size: 40, bg: '#ffffff', border: 0 });
      l.mesh.rotation.x = -Math.PI / 2;
      l.mesh.rotation.z = -Math.PI / 2;
      n.obj.visible = false;
      $.notes.push(n);
    }
    this._display();

    // cliente
    this.cust = person({ skin: 0xf2c6a0, hair: 0x6f1d1b, top: 0xff70a6, bottom: 0x7b2cbf, bun: true });
    this.cust.position.set(3.15, 0, 4.4);
    this.cust.rotation.y = -Math.PI / 2;
    this.cust.visible = false;
    this.root.add(this.cust);

    // ===== limpeza =====
    b.plane(0.5, 0.5, 0xffd60a, -1.1, 0.008, 0.65);
    b.plane(0.4, 0.4, 0xf8f9fa, -1.1, 0.011, 0.65);
    $.mark = this.zone([-1.1, 0.02, 0.65], { accepts: 'sign', radius: 0.35, hover: 0.1 });
    $.mop = this.item('mop', function (m) {
      m.cyl(0.015, 1.3, 0xb08968, 0, 0.7, 0, { seg: 6 });
      m.box(0.3, 0.06, 0.1, 0x4895ef, 0, 0.04, 0);
      for (let i = 0; i < 5; i++) m.box(0.04, 0.03, 0.14, 0xffffff, -0.12 + i * 0.06, 0.015, 0.02);
    }, -3.2, 0, 1.6, { h: 0.1, radius: 0.24, tool: true });
    $.sign = this.item('sign', function (m) {
      m.box(0.3, 0.5, 0.02, 0xffd60a, 0, 0.25, 0.07, { r: [0.25, 0, 0] });
      m.box(0.3, 0.5, 0.02, 0xffd60a, 0, 0.25, -0.07, { r: [-0.25, 0, 0] });
      m.cone(0.07, 0.12, 0x2b2d42, 0, 0.3, 0.14, { seg: 3, r: [0.25, 0, 0] });
    }, -3.2, 0, 2.05, { h: 0.5, radius: 0.24 });
    $.puddles = [];
    this.puddleMesh = [];
    const pp = [[-1.7, 1.2], [-0.5, 0.15]];
    for (let i = 0; i < 2; i++) {
      const pm = this.add(function (m) { m.cyl(0.32, 0.01, 0x90e0ef, 0, 0, 0, { seg: 9 }); m.cyl(0.16, 0.012, 0xcaf0f8, 0.2, 0, 0.12, { seg: 7 }); }, pp[i][0], 0.012, pp[i][1]);
      pm.visible = false;
      this.puddleMesh.push(pm);
      const ct = this.contact([pp[i][0], 0.08, pp[i][1]], { tool: 'mop', radius: 0.3, time: 1.2, sfx: 'scrub',
        onTick: (c) => { pm.scale.setScalar(Math.max(0.05, 1 - c.progress / c.time)); },
        onDone: () => { pm.visible = false; this.mopped++; this.sfx('ding'); this.burst(pm, [0xffffff, 0x90e0ef], 12); } });
      ct.enabled = false;
      $.puddles.push(ct);
    }

    this.steps = [
      { title: 'Reponha: cada produto do estrado na prateleira certa.', line: 'mk_1',
        start: () => this.w.setHint($.stock[1].obj, 0.35), check: () => this._stocked() === 6,
        progress: () => 'Repostos: ' + this._stocked() + '/6' },
      { title: 'Etiquete os 3 potes da banca de ofertas.', line: 'mk_2',
        start: () => this.w.setHint($.tagger.obj, 0.3), check: () => this.tagged === 3,
        progress: () => 'Etiquetados: ' + this.tagged + '/3' },
      { title: 'Passe cada produto no leitor e coloque na sacola.', line: 'mk_3',
        start: () => this._customer(), check: () => $.bag.count() === 4,
        progress: () => 'Na sacola: ' + $.bag.count() + '/4' },
      { title: 'Total R$ 38. Guarde a nota de R$ 50 na gaveta e dê R$ 12 de troco.', line: 'mk_4',
        start: () => this._pay(), check: () => $.till.count() === 1 && this._sum() === 12,
        progress: () => 'Troco na bandeja: R$ ' + this._sum() + ',00' },
      { title: 'Seque as 2 poças com o esfregão e ponha a placa na marca amarela.', line: 'mk_5',
        start: () => this._spill(), check: () => this.mopped === 2 && $.mark.count() === 1,
        progress: () => 'Poças: ' + this.mopped + '/2' }
    ];
  }

  _stocked() { let n = 0; for (let i = 0; i < 3; i++) n += this.$.shelf[i].count(); return n; }
  _sum() { let s = 0; const it = this.$.change.items; for (let i = 0; i < it.length; i++) if (it[i]) s += it[i].data.v; return s; }
  _display() { this.display.set('R$ ' + this.total + ',00', ''); }

  _customer() {
    const $ = this.$;
    this.cust.visible = true;
    this.tween(this.cust.position, { z: 0.9 }, 1.6, { done: () => {
      $.groc = [];
      for (let i = 0; i < GROC.length; i++) {
        const it = this.item('grocery', GROC[i].m, 2.35, 0.94, 2.32 - i * 0.26, { h: 0.14, radius: 0.13, data: { price: GROC[i].p, scanned: false } });
        it.obj.scale.setScalar(0.1);
        this.tween(it.obj.scale, { x: 1, y: 1, z: 1 }, 0.25, { delay: i * 0.15 });
        $.groc.push(it);
      }
      this.sfx('pop');
      this.w.setHint($.groc[3].obj, 0.3);
    } });
  }

  _pay() {
    const $ = this.$;
    $.bill = this.item('bill50', function (m) { m.box(0.14, 0.006, 0.07, 0x80ed99, 0, 0.003, 0); }, 2.5, 0.95, -0.05, { h: 0.03, radius: 0.12 });
    const l = this.label('50', 0.07, 0.045, 0, 0.0075, 0, 0, { parent: $.bill.obj, px: 64, size: 40, bg: '#ffffff', border: 0 });
    l.mesh.rotation.x = -Math.PI / 2;
    l.mesh.rotation.z = -Math.PI / 2;
    this.sfx('coin');
    this.w.setHint($.drawer.anchor, 0.25);
  }

  _openDrawer() {
    const $ = this.$;
    if (this.drawerOpen) return;
    this.drawerOpen = true;
    $.drawer.enabled = false;
    $.till.enabled = true;
    this.sfx('coin');
    this.tween(this.drawer.position, { x: 1.93 }, 0.3, { done: () => {
      for (let i = 0; i < $.notes.length; i++) { $.notes[i].obj.visible = true; $.notes[i].grabbable = true; }
    } });
    if ($.bill) this.w.setHint($.bill.obj, 0.25);
  }

  _change() {
    const $ = this.$, s = this._sum();
    if (s > 12) {
      this.fail('mk_change');
      const it = $.change.items.slice();
      for (let i = 0; i < it.length; i++) if (it[i]) this.w.sendHome(it[i]);
    } else if (s === 12) this.sfx('coin');
  }

  _spill() {
    const $ = this.$;
    this.tween(this.cust.position, { z: 4.4 }, 1.6, { done: () => { this.cust.visible = false; } });
    for (let i = 0; i < 2; i++) {
      this.puddleMesh[i].visible = true;
      $.puddles[i].enabled = true;
      this.burst(this.puddleMesh[i], 0x90e0ef, 14, { speed: 1.5 });
    }
    this.sfx('drop');
    this.w.setHint($.mop.obj, 0.5);
  }

  tick() {
    if (this.cust.visible) this.cust.position.y = Math.abs(Math.sin(this.time * 2)) * 0.02;
  }
}
