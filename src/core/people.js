// Personagens humanos estilizados (clientes e hóspedes): corpo de "feijão", cabeça redonda.
import { model } from './build.js';

// c: {skin, hair, top, bottom}. A frente do personagem é +z.
export function person(c) {
  return model(function (b) {
    b.cyl(0.2, 0.55, c.bottom, 0, 0.3, 0, { seg: 10, rt: 0.17 });
    b.cyl(0.17, 0.5, c.top, 0, 0.82, 0, { seg: 10, rt: 0.2 });
    b.sph(0.2, c.top, 0, 1.07, 0, { s: [1, 0.6, 1] });
    b.cyl(0.06, 0.08, c.skin, 0, 1.2, 0, { seg: 8 });
    b.sph(0.2, c.skin, 0, 1.4, 0, { seg: 10, hseg: 8 });
    b.sph(0.215, c.hair, 0, 1.46, -0.03, { s: [1, 0.8, 1], seg: 10, hseg: 6 });
    if (c.bun) b.sph(0.1, c.hair, 0, 1.66, -0.05);
    b.sph(0.028, 0x2b2d42, -0.07, 1.4, 0.18);
    b.sph(0.028, 0x2b2d42, 0.07, 1.4, 0.18);
    b.box(0.08, 0.02, 0.02, 0xd62828, 0, 1.31, 0.185);
    b.cyl(0.045, 0.4, c.top, -0.25, 0.86, 0.02, { seg: 6, r: [0.2, 0, -0.25] });
    b.cyl(0.045, 0.4, c.top, 0.25, 0.86, 0.02, { seg: 6, r: [0.2, 0, 0.25] });
    b.sph(0.055, c.skin, -0.3, 0.66, 0.06);
    b.sph(0.055, c.skin, 0.3, 0.66, 0.06);
    b.box(0.14, 0.06, 0.22, 0x2b2d42, -0.09, 0.03, 0.04);
    b.box(0.14, 0.06, 0.22, 0x2b2d42, 0.09, 0.03, 0.04);
  });
}
