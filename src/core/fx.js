// Partículas: um único THREE.Points reaproveitado (1 draw call).
import * as THREE from '../../lib/three.module.js';

const N = 120;
const _c = new THREE.Color();
export const CONFETTI = [0xff595e, 0xffca3a, 0x8ac926, 0x1982c4, 0xb5179e, 0xffffff];

export class FX {
  constructor(scene) {
    this.pos = new Float32Array(N * 3);
    this.col = new Float32Array(N * 3);
    this.vel = new Float32Array(N * 3);
    this.life = new Float32Array(N);
    this.grav = new Float32Array(N);
    for (let i = 0; i < N; i++) this.pos[i * 3 + 1] = -100;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    this.geo = g;
    this.points = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.045, vertexColors: true, sizeAttenuation: true }));
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.next = 0;
  }

  // colors: hex ou array de hex; o: {speed, gravity, life, up, spread}
  burst(p, colors, n, o) {
    o = o || {};
    const sp = o.speed === undefined ? 1.6 : o.speed;
    for (let k = 0; k < n; k++) {
      const i = this.next;
      this.next = (this.next + 1) % N;
      const a = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1, s = Math.sqrt(1 - u * u);
      const v = sp * (0.4 + Math.random() * 0.6);
      this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
      this.vel[i * 3] = Math.cos(a) * s * v + (o.vx || 0);
      this.vel[i * 3 + 1] = u * v + (o.up === undefined ? 1.2 : o.up);
      this.vel[i * 3 + 2] = Math.sin(a) * s * v + (o.vz || 0);
      this.life[i] = (o.life || 0.9) * (0.6 + Math.random() * 0.4);
      this.grav[i] = o.gravity === undefined ? 5 : o.gravity;
      _c.set(Array.isArray(colors) ? colors[(Math.random() * colors.length) | 0] : colors);
      this.col[i * 3] = _c.r; this.col[i * 3 + 1] = _c.g; this.col[i * 3 + 2] = _c.b;
    }
    this.geo.attributes.color.needsUpdate = true;
  }

  update(dt) {
    let any = false;
    for (let i = 0; i < N; i++) {
      if (this.life[i] <= 0) continue;
      any = true;
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.pos[i * 3 + 1] = -100; continue; }
      this.vel[i * 3 + 1] -= this.grav[i] * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
    }
    if (any || this._dirty) this.geo.attributes.position.needsUpdate = true;
    this._dirty = any;
  }
}
