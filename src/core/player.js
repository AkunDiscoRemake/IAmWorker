// Jogador: locomoção suave na direção apontada (gatilho) + colisão simples com AABBs.
import * as THREE from '../../lib/three.module.js';

const SPEED = 1.9, RADIUS = 0.28;

export class Player {
  constructor(game) {
    this.game = game;
    this.head = new THREE.Vector3(0, 1.6, 0);
    this.forward = new THREE.Vector3(0, 0, -1);
  }

  teleport(x, z, yaw) {
    const g = this.game;
    g.rig.position.x = x;
    g.rig.position.z = z;
    if (yaw !== undefined) {
      g.input.yaw = yaw;
      g.input.pitch = 0;
      g.rig.rotation.y = yaw;   // em VR isto define para onde fica a "frente" da sala
      this.forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    }
    this.head.set(x, 1.6, z);
  }

  update(dt) {
    const g = this.game, inp = g.input, rig = g.rig, w = g.world;
    // cabeça no mundo (matrixWorld do último frame; em XR o three atualiza no render)
    this.head.setFromMatrixPosition(g.camera.matrixWorld);
    this.forward.set(0, 0, -1).transformDirection(g.camera.matrixWorld);
    this.forward.y = 0;
    if (this.forward.lengthSq() < 0.01) this.forward.set(0, 0, -1);
    this.forward.normalize();

    let vx = 0, vz = 0;
    if (inp.move && !w.locked) {
      const h = Math.sqrt(inp.dir.x * inp.dir.x + inp.dir.z * inp.dir.z);
      if (h > 0.25) { vx += inp.dir.x / h; vz += inp.dir.z / h; }
    }
    if ((inp.fwd || inp.strafe) && !w.locked) {
      const f = this.forward;
      vx += f.x * inp.fwd - f.z * inp.strafe;
      vz += f.z * inp.fwd + f.x * inp.strafe;
    }
    const len = Math.sqrt(vx * vx + vz * vz);
    if (len < 0.001) return;
    vx = vx / Math.max(1, len) * SPEED * dt;
    vz = vz / Math.max(1, len) * SPEED * dt;

    // posição da cabeça (o que colide) = rig + deslocamento local
    const ox = this.head.x - rig.position.x, oz = this.head.z - rig.position.z;
    let x = this.head.x + vx, z = this.head.z + vz;
    const bd = w.bounds;
    x = Math.max(bd.minx + RADIUS, Math.min(bd.maxx - RADIUS, x));
    z = Math.max(bd.minz + RADIUS, Math.min(bd.maxz - RADIUS, z));
    const cs = w.colliders;
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];
      if (x > c.minx - RADIUS && x < c.maxx + RADIUS && z > c.minz - RADIUS && z < c.maxz + RADIUS) {
        // empurra para fora pelo eixo de menor penetração
        const dl = x - (c.minx - RADIUS), dr = (c.maxx + RADIUS) - x;
        const dn = z - (c.minz - RADIUS), df = (c.maxz + RADIUS) - z;
        const m = Math.min(dl, dr, dn, df);
        if (m === dl) x = c.minx - RADIUS; else if (m === dr) x = c.maxx + RADIUS;
        else if (m === dn) z = c.minz - RADIUS; else z = c.maxz + RADIUS;
      }
    }
    rig.position.x = x - ox;
    rig.position.z = z - oz;
    this.head.x = x;
    this.head.z = z;
  }
}
