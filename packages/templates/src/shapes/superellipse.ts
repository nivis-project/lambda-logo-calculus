import type { ParamValues, ShapeTemplate } from '@trefoil/core';

function num(params: ParamValues, id: string, fallback: number): number {
  const value = params[id];
  return typeof value === 'number' ? value : fallback;
}

export const superellipse: ShapeTemplate = {
  id: 'superellipse',
  version: 1,
  label: 'Superellipse',
  kind: 'polar',
  params: [
    {
      id: 'a',
      label: 'Width',
      kind: 'number',
      min: 0.2,
      max: 4,
      step: 0.01,
      default: 1,
      lockable: true,
      randomize: { min: 0.6, max: 2 },
      group: 'Shape',
    },
    {
      id: 'b',
      label: 'Height',
      kind: 'number',
      min: 0.2,
      max: 4,
      step: 0.01,
      default: 1,
      lockable: true,
      randomize: { min: 0.6, max: 2 },
      group: 'Shape',
    },
    {
      id: 'n',
      label: 'Squareness',
      kind: 'number',
      min: 0.4,
      max: 12,
      step: 0.01,
      default: 4,
      lockable: true,
      randomize: { min: 1.5, max: 8 },
      group: 'Shape',
    },
  ],
  safety: {
    minAmplitude: { paramId: 'n', value: 0.5 },
    minPerfectFit: 0.02,
    maxEffectiveScale: 1.5,
    maxCopyScale: 1.6,
  },
  radius(theta, params) {
    const a = num(params, 'a', 1);
    const b = num(params, 'b', 1);
    const n = Math.max(num(params, 'n', 4), 0.05);
    const cos = Math.abs(Math.cos(theta) / a);
    const sin = Math.abs(Math.sin(theta) / b);
    const sum = Math.pow(cos, n) + Math.pow(sin, n);
    return sum <= 0 ? 0 : Math.pow(sum, -1 / n);
  },
};
