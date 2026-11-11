// Construção low-poly: tudo vira geometria mesclada com cor por vértice.
// Um material só (Lambert, sem sombras) => pouquíssimas draw calls no Adreno 530.
import * as THREE from '../../lib/three.module.js';

export const MAT = new THREE.MeshLambertMaterial({ vertexColors: true });
export const MAT_GLOW = new THREE.MeshBasicMaterial({ vertexColors: true });

const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler();
const _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();

export class Batch {
  constructor() {
    this.lit = { p: [], n: [], c: [] };
    this.glow = { p: [], n: [], c: [] };
  }

  // o: { r:[rx,ry,rz], s:number|[sx,sy,sz], smooth:bool, glow:bool }
  add(geo, color, x, y, z, o) {
    o = o || {};
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (!o.smooth) g.computeVertexNormals();
    const r = o.r || [0, 0, 0];
    _e.set(r[0], r[1], r[2]);
    _q.setFromEuler(_e);
    const s = o.s;
    if (s === undefined) _s.set(1, 1, 1);
    else if (typeof s === 'number') _s.set(s, s, s);
    else _s.set(s[0], s[1], s[2]);
    _p.set(x || 0, y || 0, z || 0);
    _m.compose(_p, _q, _s);
    g.applyMatrix4(_m);
    const t = o.glow ? this.glow : this.lit;
    const pa = g.attributes.position.array, na = g.attributes.normal.array;
    _c.set(color);
    for (let i = 0; i < pa.length; i += 3) {
      t.p.push(pa[i], pa[i + 1], pa[i + 2]);
      t.n.push(na[i], na[i + 1], na[i + 2]);
      t.c.push(_c.r, _c.g, _c.b);
    }
    if (g !== geo) g.dispose();
    geo.dispose();
    return this;
  }

  box(w, h, d, c, x, y, z, o) { return this.add(new THREE.BoxGeometry(w, h, d), c, x, y, z, o); }
  // cilindro: r = raio da base, o.rt = raio do topo (padrão r)
  cyl(r, h, c, x, y, z, o) {
    o = o || {};
    return this.add(new THREE.CylinderGeometry(o.rt === undefined ? r : o.rt, r, h, o.seg || 10), c, x, y, z, o);
  }
  sph(r, c, x, y, z, o) {
    o = o || {};
    return this.add(new THREE.SphereGeometry(r, o.seg || 8, o.hseg || 6), c, x, y, z, o);
  }
  cone(r, h, c, x, y, z, o) {
    o = o || {};
    return this.add(new THREE.ConeGeometry(r, h, o.seg || 8), c, x, y, z, o);
  }
  tor(r, t, c, x, y, z, o) {
    o = o || {};
    return this.add(new THREE.TorusGeometry(r, t, 6, o.seg || 12), c, x, y, z, o);
  }
  // plano horizontal virado para cima
  plane(w, d, c, x, y, z, o) {
    const g = new THREE.PlaneGeometry(w, d);
    g.rotateX(-Math.PI / 2);
    return this.add(g, c, x, y, z, o);
  }

  _geo(t) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(t.p), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(t.n), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(t.c), 3));
    g.computeBoundingSphere();
    return g;
  }

  build() {
    let mesh = null;
    if (this.lit.p.length) mesh = new THREE.Mesh(this._geo(this.lit), MAT);
    if (this.glow.p.length) {
      const gm = new THREE.Mesh(this._geo(this.glow), MAT_GLOW);
      if (mesh) mesh.add(gm); else mesh = gm;
    }
    if (!mesh) mesh = new THREE.Group();
    this.lit = this.glow = null;
    return mesh;
  }
}

export function model(fn) {
  const b = new Batch();
  fn(b);
  return b.build();
}

export function disposeObject(o) {
  o.traverse(function (n) {
    if (n.geometry) n.geometry.dispose();
    if (n.material && n.material.userData && n.material.userData.own) {
      if (n.material.map) n.material.map.dispose();
      n.material.dispose();
    }
  });
}

// Painel de texto (canvas -> textura). Só redesenha quando o texto muda.
export class TextPanel {
  constructor(w, h, o) {
    o = o || {};
    this.o = o;
    const px = o.px || 512;
    this.cv = document.createElement('canvas');
    this.cv.width = px;
    this.cv.height = Math.max(32, Math.round(px * h / w));
    this.ctx = this.cv.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.cv);
    this.tex.minFilter = THREE.LinearFilter;
    this.tex.generateMipmaps = false;
    const mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: !!o.round });
    mat.userData.own = true;
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    this.text = null;
    this.title = null;
    this.set(o.text || '', o.title || '');
  }

  _wrap(text, font, maxW) {
    const ctx = this.ctx;
    ctx.font = font;
    const out = [];
    const paras = String(text).split('\n');
    for (let p = 0; p < paras.length; p++) {
      const words = paras[p].split(' ');
      let line = '';
      for (let i = 0; i < words.length; i++) {
        const t = line ? line + ' ' + words[i] : words[i];
        if (line && ctx.measureText(t).width > maxW) { out.push(line); line = words[i]; }
        else line = t;
      }
      out.push(line);
    }
    return out;
  }

  set(text, title) {
    title = title || '';
    if (text === this.text && title === this.title) return;
    this.text = text;
    this.title = title;
    const o = this.o, ctx = this.ctx, W = this.cv.width, H = this.cv.height;
    const pad = Math.round(W * 0.05);
    const fam = '"Trebuchet MS", "Segoe UI", Roboto, Arial, sans-serif';
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = o.bg || '#fffdf2';
    const bw = o.border === undefined ? 10 : o.border;
    if (o.round) {
      const r = Math.min(W, H) * 0.16;
      ctx.beginPath();
      ctx.moveTo(r, 0); ctx.lineTo(W - r, 0); ctx.quadraticCurveTo(W, 0, W, r);
      ctx.lineTo(W, H - r); ctx.quadraticCurveTo(W, H, W - r, H);
      ctx.lineTo(r, H); ctx.quadraticCurveTo(0, H, 0, H - r);
      ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fill();
      if (bw) { ctx.lineWidth = bw; ctx.strokeStyle = o.edge || '#2b2d42'; ctx.save(); ctx.clip(); ctx.stroke(); ctx.restore(); }
    } else {
      ctx.fillRect(0, 0, W, H);
      if (bw) { ctx.lineWidth = bw * 2; ctx.strokeStyle = o.edge || '#2b2d42'; ctx.strokeRect(0, 0, W, H); }
    }
    let size = o.size || Math.round(H * 0.2);
    const tsize = o.tsize || Math.round(size * 1.15);
    let top = pad;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    if (title) {
      ctx.font = 'bold ' + tsize + 'px ' + fam;
      ctx.fillStyle = o.tcolor || '#e85d04';
      ctx.fillText(title, W / 2, top, W - pad * 2);
      top += tsize * 1.25;
    }
    const availH = H - top - pad;
    let lines;
    const weight = o.bold ? 'bold ' : '';
    for (let k = 0; k < 12; k++) {
      lines = this._wrap(text, weight + size + 'px ' + fam, W - pad * 2);
      if (lines.length * size * 1.2 <= availH || size <= 12) break;
      size = Math.floor(size * 0.9);
    }
    ctx.font = weight + size + 'px ' + fam;
    ctx.fillStyle = o.fg || '#2b2d42';
    let y = top + Math.max(0, (availH - lines.length * size * 1.2) / 2);
    for (let i = 0; i < lines.length; i++) { ctx.fillText(lines[i], W / 2, y, W - pad * 2); y += size * 1.2; }
    this.tex.needsUpdate = true;
  }
}
