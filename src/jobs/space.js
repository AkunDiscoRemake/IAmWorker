// Profissão 5: Estação espacial Jabuticaba Um (gravidade zero: o que você solta, flutua).
import { JobBase } from '../core/scene.js';

const DIAL = [0xe63946, 0xffd60a, 0x52b788, 0x4895ef];
const filter = function (dirty) {
  return function (b) {
    b.cyl(0.11, 0.1, dirty ? 0x6c584c : 0xffffff, 0, 0.05, 0, { seg: 10 });
    b.cyl(0.118, 0.02, dirty ? 0x432818 : 0x4cc9f0, 0, 0.02, 0, { seg: 10 });
    b.cyl(0.118, 0.02, dirty ? 0x432818 : 0x4cc9f0, 0, 0.08, 0, { seg: 10 });
    if (dirty) { b.sph(0.03, 0x99582a, 0.06, 0.1, 0.03); b.sph(0.025, 0x99582a, -0.05, 0.1, -0.04); }
  };
};
const JUNK = [
  function (b) { b.cyl(0.05, 0.12, 0xe63946, 0, 0.06, 0, { seg: 8 }); b.cyl(0.052, 0.04, 0xffffff, 0, 0.06, 0, { seg: 8 }); },          // lata
  function (b) { b.box(0.16, 0.02, 0.11, 0xc77dff, 0, 0.04, 0, { r: [0.3, 0.2, 0.2] }); b.box(0.06, 0.022, 0.11, 0xffd60a, 0, 0.04, 0, { r: [0.3, 0.2, 0.2] }); }, // embalagem
  function (b) { b.cyl(0.035, 0.14, 0xffffff, 0, 0.07, 0, { seg: 6 }); b.box(0.07, 0.05, 0.12, 0xffffff, 0, 0.02, 0.03); b.box(0.072, 0.02, 0.05, 0xe63946, 0, 0.03, 0.07); }, // meia
  function (b) { b.box(0.03, 0.14, 0.03, 0xffd60a, -0.03, 0.07, 0, { r: [0, 0, 0.4] }); b.box(0.03, 0.14, 0.03, 0xffd60a, 0.03, 0.07, 0, { r: [0, 0, -0.4] }); b.box(0.03, 0.12, 0.03, 0xf4a300, 0, 0.07, 0.03, { r: [0.5, 0, 0] }); }, // casca de banana
  function (b) { b.cyl(0.05, 0.03, 0xadb5bd, 0, 0.04, 0, { seg: 6 }); b.cyl(0.02, 0.1, 0x868e96, 0, 0.06, 0, { seg: 6 }); }                 // parafuso
];

export class Space extends JobBase {
  constructor(game) {
    super(game);
    this.id = 'space'; this.name = 'Estação Espacial'; this.prefix = 'sp'; this.hat = 'space';
    this.bg = 0x0b132b; this.music = [147, 0.36];
    this.hatchOpen = false; this.hatchDone = false; this.dial = [0, 2, 1]; this.target = [2, 0, 3];
    this.grown = 0; this.sealed = 0; this.ejected = false; this.alarmT = 0; this.leakT = 0;
  }

  build() {
    const b = this.sb, $ = this.$;
    this.w.zeroG = true;
    this.room({ w: 7, d: 7, floor: [0xdee2e6, 0xced4da], wall: 0xf8f9fa, low: 0x3a0ca3, trim: 0x4cc9f0, ceil: 0xe9ecef });
    this.fixtures([0, 2.62, -3.47], 0, [1.6, 1.25, 3.46], Math.PI);
    // detalhes de módulo espacial
    for (let i = 0; i < 4; i++) { b.box(0.12, 3.2, 0.12, 0xadb5bd, -3.42, 1.6, -3.42 + i * 2.28); b.box(0.12, 3.2, 0.12, 0xadb5bd, 3.42, 1.6, -3.42 + i * 2.28); }
    for (let i = 0; i < 3; i++) b.box(6.9, 0.08, 0.3, 0x4cc9f0, 0, 3.17, -2.3 + i * 2.3, { glow: true });
    // janela com a Terra
    b.box(2.5, 1.3, 0.06, 0x495057, 0, 1.45, -3.46);
    b.box(2.3, 1.1, 0.06, 0x03071e, 0, 1.45, -3.44);
    b.sph(0.42, 0x4895ef, 0.45, 1.42, -3.43, { s: [1, 1, 0.03], seg: 16, hseg: 10, glow: true });
    b.sph(0.15, 0x52b788, 0.33, 1.52, -3.415, { s: [1.3, 0.8, 0.03], glow: true });
    b.sph(0.11, 0x52b788, 0.6, 1.3, -3.415, { s: [1, 1.2, 0.03], glow: true });
    b.sph(0.1, 0xffffff, 0.5, 1.72, -3.41, { s: [1.6, 0.5, 0.03], glow: true });
    b.sph(0.09, 0xdee2e6, -0.75, 1.25, -3.43, { s: [1, 1, 0.03], seg: 10, glow: true });
    b.box(2.5, 0.55, 0.1, 0xf8f9fa, 0, 0.62, -3.44);
    const st = [[-1.0, 1.9], [-0.7, 1.3], [-0.9, 1.6], [0.9, 1.9], [0.2, 1.85], [-0.3, 1.75], [1.05, 1.5], [-0.5, 1.95]];
    for (let i = 0; i < st.length; i++) b.box(0.025, 0.025, 0.01, 0xffffff, st[i][0], st[i][1], -3.405, { glow: true });

    // ===== 1) filtro de oxigênio =====
    b.box(0.1, 0.8, 0.9, 0x6c757d, -3.45, 1.3, -1.5);
    b.box(0.12, 0.6, 0.7, 0x212529, -3.43, 1.3, -1.5);
    this.label('O2', 0.4, 0.22, -3.47, 1.92, -1.5, Math.PI / 2, { bg: '#e63946', fg: '#ffffff', edge: '#ffffff' });
    this.alarm = this.add(function (m) { m.sph(0.08, 0xff0a54, 0, 0, 0, { glow: true }); }, -3.38, 2.2, -1.5);
    this.hatch = this.anchor(-3.36, 1.3, -1.9);
    this.add(function (m) { m.box(0.04, 0.7, 0.8, 0xffd60a, 0, 0, 0.4); m.box(0.05, 0.1, 0.1, 0x2b2d42, 0.02, 0, 0.68); for (let i = 0; i < 3; i++) m.box(0.045, 0.06, 0.5, 0x2b2d42, 0, -0.2 + i * 0.2, 0.36); }, 0, 0, 0, this.hatch);
    $.hatch = this.click(this.anchor(0.06, 0, 0.4, this.hatch), 0.3, () => this._hatch());
    $.slot = this.zone([-3.32, 1.25, -1.5], { accepts: 'filterClean', lock: true, radius: 0.3, hover: 0,
      onPlace: (it) => { if (it.type === 'filterClean') { this.sfx('beep'); this.w.setHint($.hatch.anchor, 0.45); } } });
    $.slot.enabled = false;
    $.dirty = this.item('filterDirty', filter(true), 0, 0, 0, { h: 0.1, radius: 0.17 });
    this.w.place($.dirty, $.slot, true);
    // reciclador
    b.box(0.5, 1.3, 0.8, 0x52b788, -3.22, 0.65, 0.3);
    b.box(0.3, 0.3, 0.5, 0x081c15, -3.05, 1.05, 0.3);
    b.box(0.52, 0.1, 0.82, 0x2d6a4f, -3.22, 1.33, 0.3);
    this.w.addSolid(-3.5, -2.95, -0.1, 0.7, 1.35);
    this.label('RECICLADOR', 0.7, 0.18, -2.96, 0.6, 0.3, Math.PI / 2, { bg: '#2d6a4f', fg: '#ffffff', edge: '#ffffff' });
    $.recycler = this.zone([-2.95, 1.0, 0.3], { accepts: 'filterDirty', radius: 0.32, hover: 0,
      onPlace: (it) => { this.sfx('whoosh'); this.burst(it.obj, 0x52b788, 16); this.after(0.25, () => this.w.remove(it)); this.recycled = true; this.w.setHint($.clean[0].obj, 0.3); } });
    $.clean = [
      this.item('filterClean', filter(false), 3.1, 1.2, 2.45, { h: 0.1, radius: 0.17 }),
      this.item('filterClean', filter(false), 3.1, 1.2, 2.05, { h: 0.1, radius: 0.17 })
    ];
    b.box(0.5, 0.04, 1.0, 0xadb5bd, 3.2, 1.18, 2.25);

    // ===== 2) painéis solares: seletores =====
    b.box(1.7, 1.0, 0.08, 0x3a0ca3, 2.1, 1.45, -3.45);
    this.label('ENERGIA SOLAR', 1.2, 0.18, 2.1, 2.06, -3.44, 0, { px: 512, bg: '#3a0ca3', fg: '#ffd60a', edge: '#ffd60a' });
    this.dialMesh = [];
    $.dials = [];
    for (let i = 0; i < 3; i++) {
      const x = 1.6 + i * 0.5;
      b.sph(0.07, DIAL[this.target[i]], x, 1.75, -3.4, { glow: true });
      b.cyl(0.13, 0.06, 0x212529, x, 1.3, -3.39, { seg: 10, r: [Math.PI / 2, 0, 0] });
      const set = [];
      for (let k = 0; k < 4; k++) {
        const c = DIAL[k];
        const dm = this.add(function (m) { m.cyl(0.09, 0.04, c, 0, 0, 0, { seg: 10, r: [Math.PI / 2, 0, 0], glow: true }); m.box(0.03, 0.09, 0.02, 0xffffff, 0, 0.05, 0.03, { glow: true }); }, x, 1.3, -3.35);
        dm.rotation.z = -k * Math.PI / 2;
        dm.visible = k === this.dial[i];
        set.push(dm);
      }
      this.dialMesh.push(set);
      const idx = i;
      $.dials.push(this.click([x, 1.3, -3.33], 0.17, () => {
        if (this._aligned()) return;
        set[this.dial[idx]].visible = false;
        this.dial[idx] = (this.dial[idx] + 1) % 4;
        set[this.dial[idx]].visible = true;
        if (this.dial[idx] === this.target[idx]) { this.sfx('ding'); this.burst(set[this.dial[idx]], DIAL[this.dial[idx]], 8, { speed: 0.8 }); }
      }));
    }

    // ===== 3) horta espacial =====
    b.box(0.5, 0.06, 2.2, 0xadb5bd, 3.2, 0.95, -0.7);
    b.box(0.08, 0.95, 0.08, 0xadb5bd, 3.3, 0.47, -1.7); b.box(0.08, 0.95, 0.08, 0xadb5bd, 3.3, 0.47, 0.3);
    b.box(0.1, 0.06, 2.2, 0xc77dff, 3.4, 1.9, -0.7, { glow: true });
    this.w.addSolid(2.95, 3.5, -1.8, 0.4, 0.98);
    this.label('HORTA', 0.6, 0.2, 3.47, 2.15, -0.7, -Math.PI / 2, { bg: '#40916c', fg: '#ffffff', edge: '#ffffff' });
    $.pots = [];
    this.sprouts = [];
    $.waterings = [];
    for (let i = 0; i < 3; i++) {
      const z = -1.4 + i * 0.7;
      b.cyl(0.11, 0.16, 0xffffff, 3.15, 1.06, z, { seg: 8, rt: 0.14 });
      b.cyl(0.12, 0.02, 0x6f4518, 3.15, 1.14, z, { seg: 8 });
      const sp = this.add(function (m) {
        m.cyl(0.015, 0.26, 0x40916c, 0, 0.13, 0, { seg: 5 });
        m.sph(0.08, 0x52b788, -0.07, 0.2, 0, { s: [1, 0.4, 0.6] });
        m.sph(0.08, 0x74c69d, 0.07, 0.25, 0, { s: [1, 0.4, 0.6] });
        m.sph(0.05, i === 1 ? 0xffd60a : 0xe63946, 0, 0.3, 0);
      }, 3.15, 1.15, z);
      sp.visible = false;
      this.sprouts.push(sp);
      const pot = this.zone([3.15, 1.17, z], { accepts: 'seed', lock: true, radius: 0.24, hover: 0.08,
        onPlace: (it) => { this.sfx('pop'); this.tween(it.obj.scale, { x: 0.3, y: 0.3, z: 0.3 }, 0.3); } });
      $.pots.push(pot);
      $.waterings.push(this.contact([3.15, 1.28, z], { tool: 'water', radius: 0.17, time: 1.0, sfx: 'pour',
        when: () => pot.count() === 1,
        onTick: () => { if (Math.random() < 0.5) this.burst(pot.anchor, 0x4cc9f0, 1, { speed: 0.3, up: 0, gravity: 0 }); },
        onDone: () => { sp.visible = true; sp.scale.setScalar(0.05); this.tween(sp.scale, { x: 1, y: 1, z: 1 }, 0.7); this.grown++; this.sfx('ding'); this.burst(sp, 0x80ed99, 12, { gravity: 0 }); } }));
    }
    $.seeds = [];
    const sd = [[1.5, 1.3, 1.7], [1.85, 1.1, 1.95], [1.4, 1.0, 2.2]];
    for (let i = 0; i < 3; i++) $.seeds.push(this.item('seed', function (m) { m.sph(0.06, 0xb08968, 0, 0.06, 0, { s: [0.8, 1.1, 0.8] }); m.cone(0.02, 0.05, 0x80ed99, 0, 0.14, 0, { seg: 5 }); }, sd[i][0], sd[i][1], sd[i][2], { h: 0.12, radius: 0.13 }));
    $.water = this.item('water', function (m) { m.sph(0.085, 0x4cc9f0, 0, 0.085, 0, { seg: 10, hseg: 8, glow: true }); m.sph(0.03, 0xffffff, 0.03, 0.12, 0.05, { glow: true }); }, 2.5, 1.5, 1.0, { h: 0.17, radius: 0.15, tool: true });

    // ===== 4) furos no casco =====
    const holes = [[-3.44, 1.75, 1.3, 0], [-2.2, 1.55, -3.44, 1]];
    $.holes = [];
    $.welds = [];
    this.holeMesh = [];
    for (let i = 0; i < 2; i++) {
      const h = holes[i];
      const hm = this.add(function (m) {
        m.sph(0.09, 0x03071e, 0, 0, 0);
        m.box(0.3, 0.015, 0.015, 0x343a40, 0, 0, 0, { r: h[3] ? [0, 0, 0.6] : [0.6, 0, 0] });
        m.box(0.26, 0.015, 0.015, 0x343a40, 0, 0, 0, { r: h[3] ? [0, 0, -0.9] : [-0.9, 0, 0] });
        if (h[3]) m.box(0.015, 0.22, 0.015, 0x343a40, 0, 0, 0); else m.box(0.015, 0.22, 0.015, 0x343a40, 0, 0, 0, { r: [0.2, 0, 0] });
      }, h[0], h[1], h[2]);
      hm.visible = false;
      this.holeMesh.push(hm);
      const ax = h[3] ? h[0] : h[0] + 0.1, az = h[3] ? h[2] + 0.1 : h[2];
      const hz = this.zone([ax, h[1] - 0.1, az], { accepts: 'patch', lock: true, radius: 0.28, hover: 0,
        onPlace: () => { this.sfx('pop'); } });
      hz.enabled = false;
      $.holes.push(hz);
      const wc = this.contact([ax, h[1], az], { tool: 'torch', radius: 0.18, time: 1.5, sfx: 'spark',
        when: () => hz.count() === 1,
        onTick: () => { this.burst(hz.anchor, [0xffd60a, 0xff8a1f, 0xffffff], 2, { speed: 1.4, up: 0.2, gravity: 0, life: 0.4 }); },
        onDone: () => { this.sealed++; this.sfx('ding'); hm.visible = false; this.burst(hz.anchor, 0x80ed99, 16, { gravity: 0 }); } });
      $.welds.push(wc);
    }
    $.patches = [];
    for (let i = 0; i < 2; i++) $.patches.push(this.item('patch', function (m) {
      m.sph(0.15, 0xadb5bd, 0, 0.1, 0, { s: [1, 1, 1], seg: 8, hseg: 6 });
      m.tor(0.15, 0.02, 0xffd60a, 0, 0.1, 0, { seg: 10 });
      m.tor(0.15, 0.02, 0xffd60a, 0, 0.1, 0, { seg: 10, r: [0, Math.PI / 2, 0] });
      m.tor(0.15, 0.02, 0xffd60a, 0, 0.1, 0, { seg: 10, r: [Math.PI / 2, 0, 0] });
    }, -1.6 + i * 0.4, 1.0 + i * 0.25, 1.7 + i * 0.3, { h: 0.2, radius: 0.18 }));
    $.torch = this.item('torch', function (m) {
      m.cyl(0.03, 0.2, 0xe63946, 0, 0.1, 0, { seg: 6 });
      m.cyl(0.015, 0.1, 0xadb5bd, 0, 0.24, -0.03, { seg: 5, r: [-0.6, 0, 0] });
      m.sph(0.025, 0x4cc9f0, 0, 0.29, -0.065, { glow: true });
    }, -0.9, 1.3, 2.3, { h: 0.3, radius: 0.15, tool: true });

    // ===== 5) câmara de descarte =====
    b.box(0.5, 0.9, 0.9, 0x6c757d, -3.22, 1.15, 2.5);
    b.box(0.3, 0.6, 0.6, 0x03071e, -3.05, 1.15, 2.5);
    b.box(0.52, 0.08, 0.92, 0xffd60a, -3.22, 1.63, 2.5);
    b.box(0.52, 0.08, 0.92, 0xffd60a, -3.22, 0.67, 2.5);
    this.label('DESCARTE', 0.7, 0.18, -3.47, 1.95, 2.5, Math.PI / 2, { bg: '#ffd60a', fg: '#2b2d42' });
    $.chamber = this.zone([-2.95, 1.1, 2.5], { accepts: 'junk', lock: true, radius: 0.36, hover: 0,
      slots: [[0, -0.15, -0.15], [0, -0.15, 0.15], [0, 0.05, 0], [0, 0.2, -0.15], [0, 0.2, 0.15]] });
    b.box(0.06, 0.24, 0.2, 0x2b2d42, -3.46, 1.2, 1.8);
    this.add(function (m) { m.cyl(0.06, 0.04, 0xe63946, 0, 0, 0, { seg: 8, r: [0, 0, Math.PI / 2], glow: true }); }, -3.42, 1.2, 1.8);
    $.eject = this.click([-3.42, 1.2, 1.8], 0.17, () => this._eject());

    this.steps = [
      { title: 'Filtro de O2: abra a escotilha, recicle o filtro sujo, instale um novo e feche.', line: 'sp_1',
        start: () => this.w.setHint($.hatch.anchor, 0.45), check: () => this.hatchDone },
      { title: 'Clique nos 3 seletores até cada um ficar da cor da luz acima dele.', line: 'sp_2',
        start: () => this.w.setHint($.dials[1].anchor, 0.7), check: () => this._aligned(),
        progress: () => 'Alinhados: ' + this._alignedCount() + '/3' },
      { title: 'Plante uma semente em cada vaso e regue com a bolha de água.', line: 'sp_3',
        start: () => this.w.setHint($.seeds[0].obj, 0.3), check: () => this.grown === 3,
        progress: () => 'Plantas: ' + this.grown + '/3' },
      { title: 'Tampe os 2 furos do casco com as placas e solde com o maçarico.', line: 'sp_4',
        start: () => { for (let i = 0; i < 2; i++) { this.holeMesh[i].visible = true; $.holes[i].enabled = true; this.burst(this.holeMesh[i], 0xffffff, 20, { speed: 2, gravity: 0 }); } this.sfx('drop'); this.w.setHint($.patches[0].obj, 0.35); },
        check: () => this.sealed === 2, progress: () => 'Soldados: ' + this.sealed + '/2' },
      { title: 'Junte os 5 lixos flutuantes na câmara de descarte e aperte o botão.', line: 'sp_5',
        start: () => this._junk(), check: () => this.ejected,
        progress: () => 'Na câmara: ' + $.chamber.count() + '/5' }
    ];
  }

  _alignedCount() { let n = 0; for (let i = 0; i < 3; i++) if (this.dial[i] === this.target[i]) n++; return n; }
  _aligned() { return this._alignedCount() === 3; }

  _hatch() {
    const $ = this.$;
    if (this.hatchDone) return;
    if (!this.hatchOpen) {
      this.hatchOpen = true;
      this.sfx('pop');
      this.tween(this.hatch.rotation, { y: 1.8 }, 0.5);
      $.slot.enabled = true;
      if ($.dirty.zone === $.slot) $.dirty.grabbable = true;
      this.w.setHint($.dirty.obj, 0.3);
      return;
    }
    const f = $.slot.first();
    if (!f || f.type !== 'filterClean') { this.fail('sp_hatch'); return; }
    this.hatchOpen = false;
    this.tween(this.hatch.rotation, { y: 0 }, 0.5, { done: () => { this.hatchDone = true; this.alarm.visible = false; } });
    this.sfx('place');
  }

  _junk() {
    const $ = this.$;
    $.junk = [];
    const p = [[-1.2, 1.9, -1.0], [0.8, 1.2, -0.3], [1.9, 2.0, 0.6], [-0.4, 0.8, 0.8], [0.3, 1.7, -1.9]];
    for (let i = 0; i < 5; i++) {
      const it = this.item('junk', JUNK[i], p[i][0], p[i][1], p[i][2], { h: 0.12, radius: 0.15 });
      it.state = 'float';
      it.vel.set((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.25);
      it.spin = 0.6 + Math.random();
      this.burst(it.obj, 0xffffff, 6, { gravity: 0 });
      $.junk.push(it);
    }
    this.sfx('pop');
    this.w.setHint($.chamber.anchor, 0.7);
  }

  _eject() {
    const $ = this.$;
    if (this.ejected || this.ejecting) return;
    if (this.stepIndex < 4 || $.chamber.count() < 5) { this.fail(this.stepIndex >= 4 ? 'sp_trash' : undefined); return; }
    this.ejecting = true;
    this.sfx('whoosh');
    this.game.robot.say('sp_eject', { interrupt: true });
    const its = $.chamber.items.slice();
    for (let i = 0; i < its.length; i++) {
      const it = its[i];
      this.tween(it.obj.position, { x: -1.2 }, 0.5, { ease: (k) => k * k, done: () => this.w.remove(it) });
    }
    this.after(1.6, () => { this.ejected = true; });
  }

  tick(dt) {
    // alarme de oxigênio piscando até a escotilha ser fechada com filtro novo
    if (!this.hatchDone) {
      this.alarm.visible = Math.sin(this.time * 8) > 0;
      this.alarmT -= dt;
      if (this.alarmT <= 0 && this.stepIndex === 0) { this.alarmT = 2.6; this.sfx('alarm'); }
    }
    // vazamento de ar pelos furos ainda abertos
    if (this.stepIndex === 3) {
      this.leakT -= dt;
      if (this.leakT <= 0) {
        this.leakT = 0.18;
        for (let i = 0; i < 2; i++) if (this.$.holes[i].count() === 0) this.burst(this.holeMesh[i], 0xffffff, 2, { speed: 0.7, up: 0, gravity: 0, life: 0.5 });
      }
    }
    // a bolha de água balança
    const wt = this.$.water;
    if (wt.mesh) wt.mesh.scale.set(1 + Math.sin(this.time * 5) * 0.06, 1 - Math.sin(this.time * 5) * 0.06, 1);
  }
}
