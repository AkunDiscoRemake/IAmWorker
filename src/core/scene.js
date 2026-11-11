// Base das cenas (agência e profissões) + motor de tarefas sequenciais.
import * as THREE from '../../lib/three.module.js';
import { Batch, model, TextPanel } from './build.js';
import { OK, NO, IDLE } from '../data/lines.js';
import { CONFETTI } from './fx.js';

const _v = new THREE.Vector3();

export function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

export class SceneBase {
  constructor(game) {
    this.game = game;
    this.w = game.world;
    this.root = new THREE.Group();
    this.sb = new Batch();          // geometria estática da sala (vira 1 malha)
    this.bg = 0x8ecae6;
    this.spawn = [0, 2.2, 0];       // x, z, yaw
    this.hat = '';
    this.music = [220, 0.28];
    this.$ = {};                    // referências nomeadas (usadas também pelos testes)
  }

  // ---------- atalhos de construção ----------
  anchor(x, y, z, parent) {
    const a = new THREE.Object3D();
    a.position.set(x, y, z);
    (parent || this.root).add(a);
    return a;
  }
  _anc(p) { return Array.isArray(p) ? this.anchor(p[0], p[1], p[2]) : p; }
  add(fn, x, y, z, parent) {
    const m = model(fn);
    m.position.set(x || 0, y || 0, z || 0);
    (parent || this.root).add(m);
    return m;
  }
  item(type, fn, x, y, z, o) { return this.w.addItem(type, typeof fn === 'function' ? model(fn) : fn, x, y, z, o); }
  zone(p, o) { return this.w.addZone(this._anc(p), o); }
  click(p, radius, fn) { return this.w.addClick(this._anc(p), radius, fn); }
  contact(p, o) { return this.w.addContact(this._anc(p), o); }
  after(sec, fn) { this.game.tweens.after(sec, fn); }
  tween(t, props, dur, o) { return this.game.tweens.to(t, props, dur, o); }
  sfx(n) { this.game.audio.sfx(n); }
  burst(obj, colors, n, o) {
    if (obj.isVector3) _v.copy(obj); else { obj.updateWorldMatrix(true, false); _v.setFromMatrixPosition(obj.matrixWorld); }
    this.game.fx.burst(_v, colors, n, o);
  }

  // Móvel sólido: desenha, vira superfície (itens pousam) e colisor (jogador não atravessa).
  // o: {top:cor do tampo, legs:true (mesa com pés), draw:false, noCollide}
  solid(x, z, w, d, h, color, o) {
    o = o || {};
    const b = this.sb;
    if (o.draw !== false) {
      if (o.legs) {
        b.box(w, 0.06, d, o.top || color, x, h - 0.03, z);
        const lx = w / 2 - 0.06, lz = d / 2 - 0.06;
        b.box(0.06, h - 0.06, 0.06, color, x - lx, (h - 0.06) / 2, z - lz);
        b.box(0.06, h - 0.06, 0.06, color, x + lx, (h - 0.06) / 2, z - lz);
        b.box(0.06, h - 0.06, 0.06, color, x - lx, (h - 0.06) / 2, z + lz);
        b.box(0.06, h - 0.06, 0.06, color, x + lx, (h - 0.06) / 2, z + lz);
      } else {
        b.box(w, h - 0.05, d, color, x, (h - 0.05) / 2, z);
        b.box(w + 0.04, 0.05, d + 0.04, o.top || color, x, h - 0.025, z);
      }
    }
    this.w.addSolid(x - w / 2, x + w / 2, z - d / 2, z + d / 2, h, o.noCollide);
  }

  // Sala retangular com piso xadrez, rodapé e meia-parede colorida.
  room(o) {
    const b = this.sb, w = o.w, d = o.d, h = o.h || 3.2, hw = w / 2, hd = d / 2;
    const f = o.floor || [0xf1e3c8, 0xe3d0ac];
    const ts = o.tile || 1;
    for (let i = 0; i < w / ts; i++) for (let j = 0; j < d / ts; j++) {
      b.plane(ts, ts, f[(i + j) % 2], -hw + ts / 2 + i * ts, 0, -hd + ts / 2 + j * ts);
    }
    const wc = o.wall || 0xfff6e0, lc = o.low || 0x8ecae6, tc = o.trim || 0x2b2d42;
    b.box(w + 0.4, h, 0.2, wc, 0, h / 2, -hd - 0.1);
    b.box(w + 0.4, h, 0.2, wc, 0, h / 2, hd + 0.1);
    b.box(0.2, h, d, wc, -hw - 0.1, h / 2, 0);
    b.box(0.2, h, d, wc, hw + 0.1, h / 2, 0);
    b.box(w, 1.0, 0.03, lc, 0, 0.5, -hd + 0.015);
    b.box(w, 1.0, 0.03, lc, 0, 0.5, hd - 0.015);
    b.box(0.03, 1.0, d, lc, -hw + 0.015, 0.5, 0);
    b.box(0.03, 1.0, d, lc, hw - 0.015, 0.5, 0);
    b.box(w, 0.06, 0.05, tc, 0, 1.03, -hd + 0.025);
    b.box(w, 0.06, 0.05, tc, 0, 1.03, hd - 0.025);
    b.box(0.05, 0.06, d, tc, -hw + 0.025, 1.03, 0);
    b.box(0.05, 0.06, d, tc, hw - 0.025, 1.03, 0);
    b.box(w + 0.4, 0.2, d + 0.4, o.ceil || 0xffffff, 0, h + 0.1, 0);
    const bd = this.w.bounds;
    bd.minx = -hw; bd.maxx = hw; bd.minz = -hd; bd.maxz = hd;
  }

  label(text, w, h, x, y, z, ry, o) {
    o = o || {};
    if (o.px === undefined) o.px = 256;
    if (o.size === undefined) o.size = Math.round(o.px * h / w * 0.62);
    if (o.bold === undefined) o.bold = true;
    o.text = text;
    const tp = new TextPanel(w, h, o);
    tp.mesh.position.set(x, y, z);
    tp.mesh.rotation.y = ry || 0;
    (o.parent || this.root).add(tp.mesh);
    return tp;
  }

  finishBuild() { this.root.add(this.sb.build()); this.sb = null; }
  build() {}
  enter() {}
  update() {}
  dispose() {}
}

// ---------- Profissão: lista de etapas com verificação real de estado ----------
export class JobBase extends SceneBase {
  constructor(game) {
    super(game);
    this.id = '';
    this.name = '';
    this.prefix = '';
    this.steps = [];           // {title, line, start(), check(), progress()}
    this.stepIndex = -1;
    this.busy = true;
    this.finished = false;
    this.mistakes = 0;
    this.time = 0;
    this.idleT = 0;
    this._pt = 0;
    this._lastFail = -10;
  }

  // Quadro de tarefas + placa de saída. Chamado pelo build() de cada profissão.
  fixtures(boardPos, boardRy, exitPos, exitRy) {
    this.board = new TextPanel(2.0, 1.0, { px: 512, size: 40, bg: '#243b53', fg: '#ffffff', tcolor: '#ffd60a', edge: '#ffd60a', border: 8 });
    this.board.mesh.position.set(boardPos[0], boardPos[1], boardPos[2]);
    this.board.mesh.rotation.y = boardRy || 0;
    this.root.add(this.board.mesh);
    const ex = new THREE.Group();
    ex.position.set(exitPos[0], exitPos[1], exitPos[2]);
    ex.rotation.y = exitRy || 0;
    this.root.add(ex);
    ex.add(model(function (b) {
      b.box(1.0, 2.1, 0.06, 0x8d5524, 0, -0.2, 0);
      b.box(1.12, 0.08, 0.08, 0x5c3a1e, 0, 0.87, 0);
      b.box(0.08, 2.1, 0.08, 0x5c3a1e, -0.54, -0.2, 0);
      b.box(0.08, 2.1, 0.08, 0x5c3a1e, 0.54, -0.2, 0);
      b.sph(0.045, 0xffd60a, 0.36, -0.25, 0.06);
    }));
    this.label('SAIR', 0.6, 0.26, 0, 0.45, 0.04, 0, { parent: ex, bg: '#d62828', fg: '#ffffff', edge: '#ffffff', border: 6 });
    this.$.exit = this.click(this.anchor(0, 0.2, 0.05, ex), 0.5, () => { this.game.gotoHub(); });
    this.exitAnchor = this.$.exit.anchor;
  }

  enter() {
    const r = this.game.robot;
    this.busy = true;
    this.board.set('Ouça o Marmita...', this.name.toUpperCase());
    r.say(this.prefix + '_intro', { onEnd: () => { this.busy = false; this.startStep(0); } });
  }

  startStep(i) {
    this.stepIndex = i;
    const s = this.steps[i];
    this._pt = 0;
    this._updateBoard();
    this.game.robot.setIdleText('TAREFA ' + (i + 1) + '/' + this.steps.length, s.title);
    this.game.robot.say(s.line);
    this.w.setHint(null);
    if (s.start) s.start.call(this);
  }

  _updateBoard() {
    const s = this.steps[this.stepIndex];
    if (!s) return;
    const extra = s.progress ? '\n' + s.progress.call(this) : '';
    this.board.set(s.title + extra, 'TAREFA ' + (this.stepIndex + 1) + '/' + this.steps.length);
  }

  // Conclui a etapa atual.
  next() {
    if (this.busy || this.finished) return;
    this.busy = true;
    this.w.setHint(null);
    this.sfx('success');
    this.game.robot.emote('happy');
    if (this.stepIndex >= this.steps.length - 1) { this.finish(); return; }
    this.game.robot.say(pick(OK), { interrupt: true });
    this.after(1.5, () => { this.busy = false; this.startStep(this.stepIndex + 1); });
  }

  // Erro do jogador: conta para as estrelas e o robô comenta.
  fail(line) {
    this.sfx('error');
    this.game.robot.emote('sad');
    if (this.time - this._lastFail < 1.5) return;
    this._lastFail = this.time;
    this.mistakes++;
    this.game.robot.say(line || pick(NO), { interrupt: true });
  }

  finish() {
    this.finished = true;
    const stars = this.mistakes <= 1 ? 3 : (this.mistakes <= 4 ? 2 : 1);
    const coins = this.game.save.finishJob(this.id, stars, this.time);
    const st = '★★★'.slice(0, stars) + '☆☆☆'.slice(0, 3 - stars);
    const m = Math.floor(this.time / 60), s = Math.floor(this.time % 60);
    this.board.set(st + '\n+' + coins + ' moedas   Tempo ' + m + ':' + (s < 10 ? '0' : '') + s, 'EXPEDIENTE ENCERRADO!');
    this.game.robot.setIdleText('FIM DO EXPEDIENTE', 'Clique na placa SAIR para voltar à agência.');
    this.sfx('fanfare');
    this.after(0.5, () => { this.sfx('coin'); this.burst(this.game.robot.group, CONFETTI, 40, { speed: 3, up: 3.5 }); });
    this.game.robot.say(this.prefix + '_done', { interrupt: true });
    this.game.robot.say('job_done');
    this.w.setHint(this.exitAnchor, 0.9);
  }

  update(dt) {
    if (this.stepIndex >= 0 && !this.finished) {
      this.time += dt;
      const s = this.steps[this.stepIndex];
      if (!this.busy) {
        if (s.check && s.check.call(this)) { this.next(); return; }
        this._pt -= dt;
        if (this._pt <= 0) { this._pt = 0.3; this._updateBoard(); }
        // comentário ocioso
        if (this.game.robot.silence > 45 && !this.game.robot.speaking) this.game.robot.say(pick(IDLE));
      }
    }
    if (this.tick) this.tick(dt);
  }
}
