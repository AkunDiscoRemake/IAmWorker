// Registro das profissões.
import { Office } from './office.js';
import { Kitchen } from './kitchen.js';
import { Market } from './market.js';
import { Garage } from './garage.js';
import { Space } from './space.js';
import { Hotel } from './hotel.js';

export const JOBS = [
  { id: 'office', name: 'Escritório', color: 0x4895ef, cls: Office },
  { id: 'kitchen', name: 'Cozinha', color: 0xef476f, cls: Kitchen },
  { id: 'market', name: 'Supermercado', color: 0x2a9d8f, cls: Market },
  { id: 'garage', name: 'Oficina', color: 0xf4a300, cls: Garage },
  { id: 'space', name: 'Estação Espacial', color: 0x7b2cbf, cls: Space },
  { id: 'hotel', name: 'Hotel', color: 0xb5179e, cls: Hotel }
];
