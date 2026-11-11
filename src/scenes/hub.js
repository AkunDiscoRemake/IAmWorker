// Agência Pega no Batente: menu principal em 3D, tutorial e seleção das seis profissões.
import { SceneBase, pick } from '../core/scene.js';
import { model, TextPanel } from '../core/build.js';
import { JOBS } from '../jobs/index.js';
import { HUB_IDLE } from '../data/lines.js';
import { CONFETTI } from '../core/fx.js';

const ICONS = {
  office: function (b) {      // maleta
    b.box(0.5, 0.34, 0.14, 0x7f5539, 0, 0.2, 0);
    b.box(0.52, 0.06, 0.16, 0x5c3a1e, 0, 0.3, 0);
    b.tor(0.09, 0.02, 0x5c3a1e, 0, 0.4, 0, { seg: 10 });
    b.box(0.07, 0.07, 0.17, 0xffd60a, 0, 0.3, 0);
  },
  kitchen: function (b) {     // panela
    b.cyl(0.2, 0.22, 0xd62828, 0, 0.16, 0, { seg: 12, rt: 0.23 });
    b.cyl(0.24, 0.03, 0x9d0208, 0, 0.29, 0, { seg: 12 });
    b.sph(0.04, 0x2b2d42, 0, 0.33, 0);
    b.box(0.12, 0.03, 0.05, 0x2b2d42, 0.28, 0.22, 0);
    b.box(0.12, 0.03, 0.05, 0x2b2d42, -0.28, 0.22, 0);
  },
  market: function (b) {      // cesta de compras
    b.box(0.44, 0.22, 0.3, 0x2a9d8f, 0, 0.16, 0);
    b.tor(0.17, 0.018, 0x264653, 0, 0.27, 0, { seg: 10 });
    b.sph(0.08, 0xff595e, -0.1, 0.3, 0.04);
    b.sph(0.07, 0xffca3a, 0.08, 0.3, -0.03);
    b.box(0.1, 0.2, 0.08, 0x8ac926, 0.02, 0.34, 0.07);
  },
  garage: function (b) {      // chave + pneu
    b.tor(0.17, 0.07, 0x2b2d42, -0.08, 0.26, 0, { seg: 12 });
    b.cyl(0.08, 0.06, 0xc9d1d9, -0.08, 0.26, 0, { seg: 8, r: [Math.PI / 2, 0, 0] });
    b.box(0.06, 0.42, 0.03, 0xc9d1d9, 0.22, 0.26, 0, { r: [0, 0, -0.3] });
    b.tor(0.06, 0.02, 0xc9d1d9, 0.29, 0.47, 0, { seg: 8 });
  },
  space: function (b) {       // foguete
    b.cyl(0.11, 0.34, 0xffffff, 0, 0.3, 0, { seg: 10 });
    b.cone(0.11, 0.2, 0xef476f, 0, 0.57, 0, { seg: 10 });
    b.box(0.34, 0.14, 0.03, 0xef476f, 0, 0.17, 0);
    b.box(0.03, 0.14, 0.34, 0xef476f, 0, 0.17, 0);
    b.sph(0.045, 0x4cc9f0, 0, 0.38, 0.1, { glow: true });
    b.cone(0.07, 0.14, 0xffb703, 0, 0.07, 0, { seg: 8, r: [Math.PI, 0, 0], glow: true });
  },
  hotel: function (b) {       // sineta de recepção
    b.cyl(0.22, 0.05, 0x7f5539, 0, 0.08, 0, { seg: 12 });
    b.sph(0.18, 0xffd60a, 0, 0.11, 0, { s: [1, 0.85, 1], seg: 10 });
    b.cyl(0.02, 0.06, 0xb08900, 0, 0.29, 0, { seg: 6 });
    b.sph(0.035, 0xb08900, 0, 0.33, 0);
  }
};

export class Hub extends SceneBase {
  constructor(game) {
    super(game);
    this.bg = 0xbde0fe;
    this.spawn = [0, 3.4, 0];
    this.music = [196, 0.3];
    this.tut = -1;
    this.icons = [];
    this.t = 0;
  }

  build() {
    const g = this.game, b = this.sb, save = g.save;
    this.room({ w: 10, d: 10, h: 3.6, floor: [0xffe8b6, 0xffd98e], wall: 0xfff6e0, low: 0xff8a1f, trim: 0x2b2d42 });

    // letreiro
    const done = save.doneCount();
    this.logo = new TextPanel(3.6, 1.7, { px: 512, size: 38, tsize: 74, bg: '#2b2d42', fg: '#ffffff', tcolor: '#ffd60a', edge: '#ff8a1f', border: 10 });
    this.logo.set('Agência Pega no Batente\nMoedas: ' + save.data.coins + '  ·  Concluídas: ' + done + '/6', 'I AM WORKER');
    this.logo.mesh.position.set(0, 2.65, -4.97);
    this.root.add(this.logo.mesh);

    // seis estandes em arco
    for (let i = 0; i < JOBS.length; i++) {
      const J = JOBS[i], a = (-75 + i * 30) * Math.PI / 180;
      const x = Math.sin(a) * 3.9, z = 0.6 - Math.cos(a) * 3.9, ry = -a;
      b.cyl(0.5, 0.5, J.color, x, 0.25, z, { seg: 12, rt: 0.42 });
      b.cyl(0.46, 0.05, 0xffffff, x, 0.525, z, { seg: 12 });
      this.w.addSolid(x - 0.4, x + 0.4, z - 0.4, z + 0.4, 0.55);
      const icon = this.add(ICONS[J.id], x, 0.62, z);
      icon.scale.setScalar(1.25);
      this.icons.push(icon);
      const sv = save.job(J.id);
      const stars = sv.done ? '★★★'.slice(0, sv.stars) + '☆☆☆'.slice(0, 3 - sv.stars) : 'Vaga aberta!';
      const sign = this.label(stars, 1.15, 0.5, x, 1.95, z, ry, { px: 256, size: 34, tsize: 40, title: J.name, bg: '#fffdf2', tcolor: '#' + ('00000' + J.color.toString(16)).slice(-6), bold: true });
      sign.mesh.position.y = 1.95;
      b.box(0.05, 1.3, 0.05, 0x2b2d42, x - Math.sin(a) * 0.1, 1.1, z + Math.cos(a) * 0.1);
      if (sv.done) {
        // troféu da profissão concluída
        b.cyl(0.07, 0.05, 0x7f5539, x + Math.cos(a) * 0.62, 0.025, z + Math.sin(a) * 0.62, { seg: 8 });
        b.cyl(0.02, 0.2, 0xffd60a, x + Math.cos(a) * 0.62, 0.15, z + Math.sin(a) * 0.62, { seg: 6 });
        b.sph(0.09, 0xffd60a, x + Math.cos(a) * 0.62, 0.32, z + Math.sin(a) * 0.62, { s: [1, 1, 0.5] });
      }
      const id = J.id;
      const ck = this.click([x, 1.0, z], 0.6, () => {
        if (!save.data.tutorial) { g.audio.sfx('error'); g.robot.emote('sad'); return; }
        g.startJob(id);
      });
      this.$['job_' + id] = ck;
    }

    // ----- área do tutorial -----
    b.plane(1.3, 1.3, 0x52b788, 0, 0.012, 1.3);
    b.plane(1.0, 1.0, 0x95d5b2, 0, 0.016, 1.3);
    this.$.mat = this.anchor(0, 0.02, 1.3);
    const ped = (x, z, c) => {
      b.cyl(0.24, 0.85, c, x, 0.425, z, { seg: 10, rt: 0.2 });
      b.cyl(0.27, 0.05, 0xffffff, x, 0.875, z, { seg: 10 });
      this.w.addSolid(x - 0.25, x + 0.25, z - 0.25, z + 0.25, 0.9);
    };
    ped(-0.95, -0.4, 0x4895ef);
    ped(0.95, -0.4, 0xffd60a);
    ped(0, -1.0, 0x8d99ae);
    this.$.book = this.item('book', function (m) {
      m.box(0.2, 0.035, 0.27, 0x1d4ed8, 0, 0.02, 0);
      m.box(0.19, 0.02, 0.26, 0xffffff, 0.006, 0.02, 0);
      m.box(0.1, 0.006, 0.06, 0xffd60a, 0, 0.041, -0.04);
    }, -0.95, 0.9, -0.4, { h: 0.06, radius: 0.17 });
    b.box(0.36, 0.03, 0.3, 0xf4a300, 0.95, 0.915, -0.4);
    this.$.tray = this.zone([0.95, 0.935, -0.4], { accepts: 'book', radius: 0.3 });
    b.cyl(0.14, 0.05, 0x2b2d42, 0, 0.925, -1.0, { seg: 10 });
    this.button = this.add(function (m) { m.cyl(0.1, 0.07, 0xe63946, 0, 0.035, 0, { seg: 10 }); }, 0, 0.95, -1.0);
    this.$.button = this.click([0, 1.0, -1.0], 0.2, () => this._press());

    // refazer tutorial
    b.cyl(0.2, 0.9, 0x8d99ae, -3.6, 0.45, 3.6, { seg: 8 });
    this.w.addSolid(-3.8, -3.4, 3.4, 3.8, 0.9);
    this.add(function (m) { m.cyl(0.1, 0.06, 0x52b788, 0, 0.03, 0, { seg: 10 }); }, -3.6, 0.9, 3.6);
    this.label('TUTORIAL', 0.6, 0.2, -3.6, 1.35, 3.6, Math.PI * 0.75, { bg: '#52b788', fg: '#ffffff', edge: '#ffffff' });
    this.$.redo = this.click([-3.6, 0.95, 3.6], 0.25, () => { if (this.tut < 0) this._tutorial(false); });

    // decoração
    b.cyl(0.22, 0.4, 0xb5651d, 4.3, 0.2, 4.3, { seg: 8, rt: 0.28 });
    b.sph(0.45, 0x52b788, 4.3, 0.85, 4.3);
    b.sph(0.3, 0x74c69d, 4.15, 1.25, 4.2);
    b.cyl(0.22, 0.4, 0xb5651d, -4.3, 0.2, -4.3, { seg: 8, rt: 0.28 });
    b.sph(0.45, 0x52b788, -4.3, 0.85, -4.3);
    b.cyl(0.22, 0.4, 0xb5651d, 4.3, 0.2, -4.3, { seg: 8, rt: 0.28 });
    b.sph(0.45, 0x52b788, 4.3, 0.85, -4.3);
    if (done >= JOBS.length) {
      this.label('★ FUNCIONÁRIO DO MÊS ★\nVocê!', 1.8, 0.8, 4.97, 2.0, 0.6, -Math.PI / 2, { px: 512, size: 60, bg: '#ffd60a', fg: '#2b2d42', edge: '#ff8a1f', border: 14 });
    }
  }

  enter() {
    const g = this.game, save = g.save;
    if (!save.data.tutorial) { this._tutorial(true); return; }
    if (save.doneCount() >= JOBS.length && !save.data.allSeen) {
      save.data.allSeen = true;
      save.write();
      g.robot.say('hub_all');
      g.robot.emote('happy');
      g.audio.sfx('fanfare');
    } else g.robot.say('hub_back');
    g.robot.setIdleText('AGÊNCIA', 'Aponte para a placa de uma profissão e clique para começar.');
  }

  _tutorial(first) {
    const r = this.game.robot;
    this.tut = 0;
    if (this.$.book.zone || this.$.book.state !== 'rest') this.w.sendHome(this.$.book);
    this.w.sendHome(this.$.book);
    if (first) r.say('hub_welcome', { interrupt: true });
    r.say('tut_move', { interrupt: !first });
    r.setIdleText('TUTORIAL 1/3', 'Segure o GATILHO apontando para o tapete verde para andar até ele.');
    this.w.setHint(this.$.mat, 0.6);
  }

  _press() {
    const g = this.game;
    this.tween(this.button.position, { y: 0.92 }, 0.08, { done: () => this.tween(this.button.position, { y: 0.95 }, 0.15) });
    this.burst(this.button, CONFETTI, 40, { speed: 3, up: 4 });
    g.audio.sfx('pop');
    if (this.tut === 2) {
      this.tut = -1;
      g.save.data.tutorial = true;
      g.save.write();
      g.audio.sfx('fanfare');
      g.robot.emote('happy');
      g.robot.say('tut_done', { interrupt: true });
      g.robot.setIdleText('AGÊNCIA', 'Aponte para a placa de uma profissão e clique para começar.');
      this.w.setHint(null);
    }
  }

  update(dt) {
    const g = this.game, r = g.robot;
    this.t += dt;
    for (let i = 0; i < this.icons.length; i++) {
      this.icons[i].rotation.y = this.t * 0.8 + i;
      this.icons[i].position.y = 0.62 + Math.sin(this.t * 2 + i) * 0.03;
    }
    if (this.tut === 0) {
      const h = g.player.head;
      if (Math.abs(h.x) < 0.65 && Math.abs(h.z - 1.3) < 0.65) {
        this.tut = 1;
        g.audio.sfx('success');
        r.emote('happy');
        r.say('tut_move_ok', { interrupt: true });
        r.say('tut_grab');
        r.setIdleText('TUTORIAL 2/3', 'Aperte e SEGURE o touchpad na carteira azul. Aponte para a bandeja amarela e solte.');
        this.w.setHint(this.$.book.obj, 0.3);
      }
    } else if (this.tut === 1) {
      if (this.w.held === this.$.book) this.w.setHint(this.$.tray.anchor, 0.3);
      else if (this.$.tray.count() === 0) this.w.setHint(this.$.book.obj, 0.3);
      if (this.$.tray.count() === 1) {
        this.tut = 2;
        g.audio.sfx('success');
        r.emote('happy');
        r.say('tut_place_ok', { interrupt: true });
        r.say('tut_click');
        r.setIdleText('TUTORIAL 3/3', 'Aponte para o botão vermelho e CLIQUE o touchpad.');
        this.w.setHint(this.$.button.anchor, 0.25);
      }
    } else if (this.tut < 0 && r.silence > 40 && !r.speaking) r.say(pick(HUB_IDLE));
  }
}
