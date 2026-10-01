import type { ParamValues, ShapeTemplate } from '@trefoil/core';

function amplitude(params: ParamValues): number {
  const a = params['A'];
  return typeof a === 'number' ? a : 3;
}

function lobes(params: ParamValues): number {
  const k = params['k'];
  return typeof k === 'number' ? Math.round(k) : 3;
}

export const rose: ShapeTemplate = {
  id: 'rose',
  version: 1,
  label: 'Rose',
  kind: 'polar',
  params: [
    {
      id: 'A',
      label: 'Amplitude',
      kind: 'number',
      min: 1,
      max: 20,
      step: 0.01,
      default: 3,
      lockable: true,
      randomize: { min: 1.15, max: 8 },
      group: 'Shape',
    },
    {
      id: 'k',
      label: 'Lobes',
      kind: 'int',
      min: 2,
      max: 12,
      default: 5,
      lockable: true,
      randomize: { min: 2, max: 8 },
      group: 'Shape',
    },
  ],
  safety: {
    minAmplitude: { paramId: 'A', value: 1.15 },
    minPerfectFit: 0.02,
    maxEffectiveScale: 1.5,
    maxCopyScale: 1.6,
  },
  radius(theta, params) {
    return amplitude(params) + Math.cos(lobes(params) * theta);
  },
  maxRadius(params) {
    return amplitude(params) + 1;
  },
  symmetryFor(params) {
    return lobes(params);
  },
};
