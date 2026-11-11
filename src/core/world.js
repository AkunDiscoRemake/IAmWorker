// Sistema de interação: itens que se pega, zonas onde se encaixa, coisas clicáveis
// e "contatos" (usar uma ferramenta segurada em um alvo por um tempo).
// O picking é por raio-esfera (barato e tolerante para um controle 3DoF).
import * as THREE from '../../lib/three.module.js';
import { disposeObject } from './build.js';

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _t = new THREE.Vector3(), _c = new THREE.Vector3();
const HOLD_DIST = 0.9;

// t ao longo do raio se ele passa a menos de `radius` do centro (com folga que cresce com a distância)
function rayHit(o, d, center, radius, maxT) {
  _a.subVectors(center, o);
  const t = _a.dot(d);
  if (t < 0.05 || t > maxT) return -1;
  const d2 = _a.lengthSq() - t * t;
  const r = radius + t * 0.03;
  return d2 <= r * r ? t : -1;
}

function matches(rule, it) {
  if (typeof rule === 'function') return !!rule(it);
  if (Array.isArray(rule)) return rule.indexOf(it.type) >= 0;
  return rule === it.type;
}

export class World {
  constructor(game) {
    this.game = game;
    this.root = null;
    this.reach = 3.4;
    this.locked = false;
    this.held = null;
    this.hover = null;
    this.hintTarget = null;
    this.hintY = 0.35;
    this.time = 0;
    this._lists();

    const sc = game.scene;
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.07, 6, 20), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    this.ring.visible = false;
    sc.add(this.ring);
    this.zoneRings = [];
    const zg = new THREE.TorusGeometry(1, 0.08, 6, 20);
    zg.rotateX(Math.PI / 2);
    const zm = new THREE.MeshBasicMaterial({ color: 0x6bff8f });
    for (let i = 0; i < 6; i++) {
      const r = new THREE.Mesh(zg, zm);
      r.visible = false;
      sc.add(r);
      this.zoneRings.push(r);
    }
    const ag = new THREE.ConeGeometry(0.09, 0.2, 6);
    ag.rotateX(Math.PI);
    this.arrow = new THREE.Mesh(ag, new THREE.MeshBasicMaterial({ color: 0xffd60a }));
    this.arrow.visible = false;
    sc.add(this.arrow);
    this.reticle = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    this.reticle.visible = false;
    sc.add(this.reticle);
  }

  _lists() {
    this.items = [];
    this.zones = [];
    this.clicks = [];
    this.contacts = [];
    this.surfaces = [];
    this.colliders = [];
    this.bounds = { minx: -4, maxx: 4, minz: -4, maxz: 4, miny: 0.35, maxy: 2.4 };
    this.zeroG = false;
  }

  reset(root) {
    this._lists();
    this.root = root;
    this.held = null;
    this.hover = null;
    this.hintTarget = null;
    this.ring.visible = false;
    this.arrow.visible = false;
    for (let i = 0; i < this.zoneRings.length; i++) this.zoneRings[i].visible = false;
  }

  // ---------- registro ----------
  addItem(type, mesh, x, y, z, o) {
    o = o || {};
    const obj = new THREE.Group();
    obj.position.set(x, y, z);
    if (mesh) obj.add(mesh);
    (o.parent || this.root).add(obj);
    const it = {
      type: type, obj: obj, mesh: mesh, radius: o.radius || 0.15, h: o.h === undefined ? 0.12 : o.h,
      state: 'rest', zone: null, vel: new THREE.Vector3(), prev: new THREE.Vector3(x, y, z),
      home: new THREE.Vector3(x, y, z), data: o.data || {}, grabbable: o.grabbable !== false, tool: !!o.tool,
      onGrab: o.onGrab || null, spin: 0
    };
    it.setMesh = function (m) {
      if (it.mesh) { obj.remove(it.mesh); disposeObject(it.mesh); }
      it.mesh = m;
      if (m) obj.add(m);
    };
    this.items.push(it);
    return it;
  }

  // o: {accepts, radius, slots:[[x,y,z]...], lock, onPlace, onTake, onReject, hover}
  addZone(anchor, o) {
    const slots = o.slots || [[0, 0, 0]];
    const z = {
      anchor: anchor, accepts: o.accepts, radius: o.radius || 0.3, slots: slots, items: slots.map(function () { return null; }),
      enabled: true, lock: !!o.lock, onPlace: o.onPlace || null, onTake: o.onTake || null, onReject: o.onReject || null,
      hover: o.hover === undefined ? 0.1 : o.hover
    };
    z.count = function () { let n = 0; for (let i = 0; i < z.items.length; i++) if (z.items[i]) n++; return n; };
    z.first = function () { for (let i = 0; i < z.items.length; i++) if (z.items[i]) return z.items[i]; return null; };
    this.zones.push(z);
    return z;
  }

  addClick(anchor, radius, fn) {
    const c = { anchor: anchor, radius: radius, fn: fn, enabled: true };
    this.clicks.push(c);
    return c;
  }

  // o: {tool, radius, time, when, onTick, onDone, repeat, tilt, sfx}
  addContact(anchor, o) {
    const c = {
      anchor: anchor, tool: o.tool, radius: o.radius || 0.15, time: o.time || 1, progress: 0, enabled: true,
      when: o.when || null, onTick: o.onTick || null, onDone: o.onDone || null, repeat: !!o.repeat,
      tilt: o.tilt || 0, sfx: o.sfx || 'scrub', done: false, _s: 0
    };
    this.contacts.push(c);
    return c;
  }

  addSolid(minx, maxx, minz, maxz, top, noCollide) {
    this.surfaces.push({ minx: minx, maxx: maxx, minz: minz, maxz: maxz, top: top });
    if (!noCollide) this.colliders.push({ minx: minx, maxx: maxx, minz: minz, maxz: maxz });
  }

  // ---------- ações ----------
  accepts(z, it) {
    return z.enabled && z.items.indexOf(null) >= 0 && matches(z.accepts, it);
  }

  place(it, z, instant) {
    const idx = z.items.indexOf(null);
    if (idx < 0) return false;
    if (it.zone) this._leaveZone(it);
    if (this.held === it) this.held = null;
    z.items[idx] = it;
    it.zone = z;
    it.state = 'placed';
    it.vel.set(0, 0, 0);
    z.anchor.updateWorldMatrix(true, false);
    z.anchor.attach(it.obj);
    const s = z.slots[idx];
    it.obj.rotation.set(0, 0, 0);
    if (instant) it.obj.position.set(s[0], s[1], s[2]);
    else {
      this.game.tweens.to(it.obj.position, { x: s[0], y: s[1], z: s[2] }, 0.14);
      this.game.audio.sfx('place');
    }
    if (z.lock) it.grabbable = false;
    if (z.onPlace) z.onPlace(it, z, idx);
    return true;
  }

  _leaveZone(it) {
    const z = it.zone;
    if (!z) return;
    const i = z.items.indexOf(it);
    if (i >= 0) z.items[i] = null;
    it.zone = null;
    this.root.attach(it.obj);
    if (z.onTake) z.onTake(it, z);
  }

  grab(it) {
    if (it.zone) this._leaveZone(it);
    else if (it.obj.parent !== this.root) this.root.attach(it.obj);
    it.state = 'held';
    it.prev.copy(it.obj.position);
    this.held = it;
    this.game.audio.sfx('grab');
    if (it.onGrab) it.onGrab(it);
  }

  remove(it) {
    if (this.held === it) this.held = null;
    if (it.zone) { const i = it.zone.items.indexOf(it); if (i >= 0) it.zone.items[i] = null; it.zone = null; }
    const k = this.items.indexOf(it);
    if (k >= 0) this.items.splice(k, 1);
    if (it.obj.parent) it.obj.parent.remove(it.obj);
    disposeObject(it.obj);
  }

  // devolve o item ao ponto de origem
  sendHome(it) {
    if (it.zone) this._leaveZone(it);
    if (this.held === it) this.held = null;
    it.state = 'rest';
    it.vel.set(0, 0, 0);
    it.obj.rotation.set(0, 0, 0);
    this.game.tweens.to(it.obj.position, { x: it.home.x, y: it.home.y, z: it.home.z }, 0.35);
  }

  groundAt(x, z, y) {
    let g = 0;
    const s = this.surfaces;
    for (let i = 0; i < s.length; i++) {
      const b = s[i];
      if (x >= b.minx && x <= b.maxx && z >= b.minz && z <= b.maxz && b.top <= y + 0.08 && b.top > g) g = b.top;
    }
    return g;
  }

  center(it, out) {
    out.setFromMatrixPosition(it.obj.matrixWorld);
    out.y += it.h * 0.5;
    return out;
  }

  setHint(anchor, y) {
    this.hintTarget = anchor || null;
    this.hintY = y === undefined ? 0.35 : y;
  }

  // ---------- frame ----------
  update(dt) {
    this.time += dt;
    this._physics(dt);
    const inp = this.game.input;
    for (let i = 0; i < this.zoneRings.length; i++) this.zoneRings[i].visible = false;
    this.ring.visible = false;
    this.reticle.visible = false;
    if (!this.root) return;
    if (this.held) this._updateHeld(dt, inp);
    else if (!this.locked) this._updateHover(inp);
    // seta de dica
    const ht = this.hintTarget;
    if (ht && !this.held) {
      _a.setFromMatrixPosition(ht.matrixWorld);
      this.arrow.visible = true;
      this.arrow.position.set(_a.x, _a.y + this.hintY + Math.sin(this.time * 4) * 0.05, _a.z);
      this.arrow.rotation.y = this.time * 2;
    } else this.arrow.visible = false;
  }

  _physics(dt) {
    const bd = this.bounds, its = this.items;
    for (let i = 0; i < its.length; i++) {
      const it = its[i], p = it.obj.position;
      if (it.state === 'fall') {
        const y0 = p.y;
        it.vel.y -= 9.8 * dt;
        p.addScaledVector(it.vel, dt);
        p.x = Math.max(bd.minx + 0.15, Math.min(bd.maxx - 0.15, p.x));
        p.z = Math.max(bd.minz + 0.15, Math.min(bd.maxz - 0.15, p.z));
        const g = this.groundAt(p.x, p.z, y0);
        if (p.y <= g) {
          p.y = g;
          if (it.vel.y < -2) { it.vel.y *= -0.3; it.vel.x *= 0.4; it.vel.z *= 0.4; this.game.audio.sfx('drop'); }
          else { it.state = 'rest'; it.vel.set(0, 0, 0); this.game.audio.sfx('drop'); }
        }
      } else if (it.state === 'float') {
        p.addScaledVector(it.vel, dt);
        it.vel.multiplyScalar(Math.max(0, 1 - 0.7 * dt));
        if (p.x < bd.minx + 0.3) { p.x = bd.minx + 0.3; it.vel.x = Math.abs(it.vel.x); }
        if (p.x > bd.maxx - 0.3) { p.x = bd.maxx - 0.3; it.vel.x = -Math.abs(it.vel.x); }
        if (p.z < bd.minz + 0.3) { p.z = bd.minz + 0.3; it.vel.z = Math.abs(it.vel.z); }
        if (p.z > bd.maxz - 0.3) { p.z = bd.maxz - 0.3; it.vel.z = -Math.abs(it.vel.z); }
        if (p.y < bd.miny) { p.y = bd.miny; it.vel.y = Math.abs(it.vel.y); }
        if (p.y > bd.maxy) { p.y = bd.maxy; it.vel.y = -Math.abs(it.vel.y); }
        it.obj.rotation.y += it.spin * dt;
        it.obj.rotation.x += it.spin * 0.6 * dt;
      }
    }
  }

  _updateHover(inp) {
    const o = inp.origin, d = inp.dir;
    let best = null, bestT = 1e9, isItem = false, bestR = 0.1;
    const its = this.items;
    for (let i = 0; i < its.length; i++) {
      const it = its[i];
      if (!it.grabbable || !it.obj.visible) continue;
      const t = rayHit(o, d, this.center(it, _b), it.radius, this.reach);
      if (t >= 0 && t < bestT) { best = it; bestT = t; isItem = true; bestR = it.radius; _c.copy(_b); }
    }
    const cl = this.clicks;
    for (let i = 0; i < cl.length; i++) {
      const c = cl[i];
      if (!c.enabled) continue;
      _b.setFromMatrixPosition(c.anchor.matrixWorld);
      const t = rayHit(o, d, _b, c.radius, this.reach);
      if (t >= 0 && t < bestT) { best = c; bestT = t; isItem = false; bestR = c.radius; _c.copy(_b); }
    }
    this.hover = best;
    if (best) {
      this.ring.visible = true;
      this.ring.position.copy(_c);
      this.ring.scale.setScalar(bestR * (1 + Math.sin(this.time * 8) * 0.06));
      this.ring.lookAt(o);
      this.ring.material.color.setHex(isItem ? 0xffffff : 0xffd60a);
      this.reticle.visible = true;
      this.reticle.position.copy(o).addScaledVector(d, bestT);
      if (inp.grabDown) {
        if (isItem) this.grab(best);
        else { this.game.audio.sfx('click'); best.fn(best); }
      } else if (inp.tap && !isItem) { this.game.audio.sfx('click'); best.fn(best); }
    }
  }

  _updateHeld(dt, inp) {
    const it = this.held, o = inp.origin, d = inp.dir, p = it.obj.position;
    // alvo apontado: zona ou contato de ferramenta
    let tz = null, tc = null, bestT = this.reach + 1;
    let ringN = 0;
    const zs = this.zones;
    for (let i = 0; i < zs.length; i++) {
      const z = zs[i];
      if (!z.enabled || z.anchor.parent === it.obj) continue;
      const ok = this.accepts(z, it);
      _b.setFromMatrixPosition(z.anchor.matrixWorld);
      if (ok && ringN < this.zoneRings.length) {
        const r = this.zoneRings[ringN++];
        r.visible = true;
        r.position.copy(_b);
        r.scale.setScalar(z.radius * (0.8 + Math.sin(this.time * 6) * 0.08));
      }
      if (!ok && !z.onReject) continue;
      const t = rayHit(o, d, _b, z.radius, this.reach + 0.6);
      if (t >= 0 && t < bestT) { bestT = t; tz = z; tc = null; }
    }
    const cs = this.contacts;
    let near = null, nearD = 1e9;
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];
      if (!c.enabled || c.done || !matches(c.tool, it) || (c.when && !c.when(it))) continue;
      _b.setFromMatrixPosition(c.anchor.matrixWorld);
      const t = rayHit(o, d, _b, c.radius, this.reach + 0.6);
      if (t >= 0 && t <= bestT) { bestT = t; tc = c; tz = null; }
      const dist = this.center(it, _a).distanceTo(_b);
      if (dist < c.radius + 0.1 && dist < nearD) { near = c; nearD = dist; }
    }

    // posição desejada do item
    if (tc) {
      _t.setFromMatrixPosition(tc.anchor.matrixWorld);
      _t.y -= it.h * 0.5;
    } else if (tz) {
      const idx = Math.max(0, tz.items.indexOf(null));
      const s = tz.slots[idx];
      _t.set(s[0], s[1], s[2]).applyMatrix4(tz.anchor.matrixWorld);
      _t.y += tz.hover;
    } else {
      _t.copy(o).addScaledVector(d, HOLD_DIST);
      _t.y -= it.h * 0.5;
      if (_t.y < 0.03) _t.y = 0.03;
    }
    it.prev.copy(p);
    p.lerp(_t, 1 - Math.exp(-16 * dt));
    it.obj.rotation.y = Math.atan2(-d.x, -d.z);
    this.reticle.visible = true;
    this.reticle.position.copy(_t);

    // uso de ferramenta por contato
    let tilt = 0;
    if (near) {
      tilt = near.tilt;
      near.progress += dt;
      near._s -= dt;
      if (near._s <= 0) { near._s = 0.22; if (near.sfx) this.game.audio.sfx(near.sfx); }
      if (near.onTick) near.onTick(near, dt, it);
      if (near.progress >= near.time) {
        if (near.repeat) near.progress = 0; else near.done = true;
        if (near.onDone) near.onDone(near, it);
      }
    }
    it.obj.rotation.z += (tilt - it.obj.rotation.z) * Math.min(1, dt * 10);
    if (near && !tilt) it.obj.rotation.z = Math.sin(this.time * 30) * 0.15;

    // soltar
    if (!inp.grab && this.held === it) {
      this.held = null;
      it.obj.rotation.z = 0;
      if (tz) {
        if (this.accepts(tz, it)) { this.place(it, tz); return; }
        if (tz.onReject) { tz.onReject(it, tz); if (it.state !== 'held') return; }
      }
      if (it.tool) { this.sendHome(it); return; }
      it.vel.subVectors(p, it.prev).multiplyScalar(1 / Math.max(dt, 0.008));
      if (it.vel.length() > 4) it.vel.setLength(4);
      if (this.zeroG) {
        it.state = 'float';
        it.vel.multiplyScalar(0.5);
        if (it.vel.length() < 0.05) it.vel.set((Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.08);
        it.spin = (Math.random() - 0.5) * 1.2;
      } else it.state = 'fall';
    }
  }
}
