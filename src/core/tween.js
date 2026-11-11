// Tweens e temporizadores simples (limpos a cada troca de cena).
export const ease = {
  out: function (k) { return 1 - (1 - k) * (1 - k); },
  inOut: function (k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; },
  lin: function (k) { return k; },
  back: function (k) { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
};

export class Tweens {
  constructor() { this.list = []; }

  // target: objeto com propriedades numéricas (position, scale, rotation...)
  to(target, props, dur, o) {
    o = o || {};
    const t = { target: target, props: props, from: null, dur: Math.max(0.001, dur), t: -(o.delay || 0), ease: o.ease || ease.out, done: o.done };
    this.list.push(t);
    return t;
  }

  after(sec, fn) { this.list.push({ timer: true, t: -sec, done: fn }); }

  update(dt) {
    const l = this.list;
    for (let i = l.length - 1; i >= 0; i--) {
      const t = l[i];
      if (!t) continue;
      t.t += dt;
      if (t.t < 0) continue;
      if (t.timer) { l.splice(l.indexOf(t), 1); t.done(); continue; }
      if (!t.from) { t.from = {}; for (const k in t.props) t.from[k] = t.target[k]; }
      const k = Math.min(1, t.t / t.dur), e = t.ease(k);
      for (const p in t.props) t.target[p] = t.from[p] + (t.props[p] - t.from[p]) * e;
      if (k >= 1) { const idx = l.indexOf(t); if (idx >= 0) l.splice(idx, 1); if (t.done) t.done(); }
    }
  }

  clear() { this.list.length = 0; }
}
