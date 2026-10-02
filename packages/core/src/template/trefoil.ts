import type { ParamDef, ParamValues } from '../params/types.js';
import type { ShapeTemplate } from './types.js';

export const AMPLITUDE_FLOOR = 1.15;
export const TREFOIL_LOBES = 3;

export const TREFOIL_PARAMS: readonly ParamDef[] = [
  {
    id: 'A',
    label: 'A/B ratio',
    kind: 'number',
    min: 1,
    max: 20,
    step: 0.1,
    default: 3,
    lockable: true,
    randomize: { min: 1.2, max: 8 },
  },
];

export function amplitudeOf(params: ParamValues): number {
  const given = params.A;
  return typeof given === 'number' ? given : 3;
}

export const trefoil: ShapeTemplate = {
  id: 'trefoil',
  version: 1,
  label: 'Trefoil',
  params: TREFOIL_PARAMS,
  symmetry: TREFOIL_LOBES,

  radius(theta, params) {
    return Math.max(amplitudeOf(params), AMPLITUDE_FLOOR) + Math.cos(TREFOIL_LOBES * theta);
  },

  maxRadius(params) {
    return Math.max(amplitudeOf(params), AMPLITUDE_FLOOR) + 1;
  },
};

export const builtInTemplates: readonly ShapeTemplate[] = [trefoil];
