import type { ParamValues, ShapeTemplate } from '@trefoil/core';

export const TREFOIL_LOBES = 3 as const;

function amplitude(params: ParamValues): number {
  const a = params['A'];
  return typeof a === 'number' ? a : 3;
}

export const trefoil: ShapeTemplate = {
  id: 'trefoil',
  version: 1,
  label: 'Trefoil',
  kind: 'polar',
  symmetry: TREFOIL_LOBES,
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
  ],
  safety: {
    minAmplitude: { paramId: 'A', value: 1.15 },
    minPerfectFit: 0.02,
    maxEffectiveScale: 1.5,
    maxCopyScale: 1.6,
  },
  radius(theta, params) {
    return amplitude(params) + Math.cos(TREFOIL_LOBES * theta);
  },
  maxRadius(params) {
    return amplitude(params) + 1;
  },
};
