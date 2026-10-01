import type { ParamValues, ShapeTemplate } from '@trefoil/core';

function num(params: ParamValues, id: string, fallback: number): number {
  const value = params[id];
  return typeof value === 'number' ? value : fallback;
}

export const roundedPolygon: ShapeTemplate = {
  id: 'rounded-polygon',
  version: 1,
  label: 'Rounded polygon',
  kind: 'polar',
  params: [
    {
      id: 'sides',
      label: 'Sides',
      kind: 'int',
      min: 3,
      max: 16,
      default: 5,
      lockable: true,
      randomize: { min: 3, max: 9 },
      group: 'Shape',
    },
    {
      id: 'corner',
      label: 'Corner radius',
      kind: 'number',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.35,
      lockable: true,
      randomize: { min: 0.1, max: 0.8 },
      group: 'Shape',
    },
    {
      id: 'star',
      label: 'Star depth',
      kind: 'number',
      min: 0,
      max: 0.9,
      step: 0.01,
      default: 0,
      lockable: true,
      randomize: { min: 0, max: 0.6 },
      group: 'Shape',
    },
  ],
  safety: {
    minPerfectFit: 0.02,
    maxEffectiveScale: 1.5,
    maxCopyScale: 1.6,
  },
  radius(theta, params) {
    const sides = Math.max(3, Math.round(num(params, 'sides', 5)));
    const corner = Math.min(1, Math.max(0, num(params, 'corner', 0.35)));
    const star = Math.min(0.9, Math.max(0, num(params, 'star', 0)));

    const wedge = (Math.PI * 2) / sides;
    const within = ((theta % wedge) + wedge) % wedge;
    const fromCentre = Math.abs(within - wedge / 2);

    const flat = Math.cos(wedge / 2) / Math.cos(fromCentre);
    const round = 1;
    const base = corner * round + (1 - corner) * flat;

    return base * (1 - star * Math.cos((fromCentre * Math.PI) / wedge));
  },
  symmetryFor(params) {
    return Math.max(3, Math.round(num(params, 'sides', 5)));
  },
};
