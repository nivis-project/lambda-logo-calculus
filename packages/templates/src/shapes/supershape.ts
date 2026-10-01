import type { ParamValues, ShapeTemplate } from '@trefoil/core';

function num(params: ParamValues, id: string, fallback: number): number {
  const value = params[id];
  return typeof value === 'number' ? value : fallback;
}

function shapeParam(
  id: string,
  label: string,
  def: number,
  min: number,
  max: number,
): ShapeTemplate['params'][number] {
  return {
    id,
    label,
    kind: 'number',
    min,
    max,
    step: 0.01,
    default: def,
    lockable: true,
    group: 'Shape',
  };
}

export const supershape: ShapeTemplate = {
  id: 'supershape',
  version: 1,
  label: 'Supershape',
  kind: 'polar',
  params: [
    {
      id: 'm',
      label: 'Symmetry',
      kind: 'int',
      min: 0,
      max: 20,
      default: 6,
      lockable: true,
      randomize: { min: 3, max: 12 },
      group: 'Shape',
    },
    shapeParam('n1', 'Pinch', 1, 0.2, 20),
    shapeParam('n2', 'Bulge', 1, 0.2, 20),
    shapeParam('n3', 'Sweep', 1, 0.2, 20),
    shapeParam('a', 'Width', 1, 0.2, 4),
    shapeParam('b', 'Height', 1, 0.2, 4),
  ],
  safety: {
    minAmplitude: { paramId: 'n1', value: 0.25 },
    minPerfectFit: 0.02,
    maxEffectiveScale: 1.5,
    maxCopyScale: 1.6,
  },
  radius(theta, params) {
    const m = num(params, 'm', 6);
    const n1 = Math.max(num(params, 'n1', 1), 0.05);
    const n2 = num(params, 'n2', 1);
    const n3 = num(params, 'n3', 1);
    const a = Math.max(num(params, 'a', 1), 0.05);
    const b = Math.max(num(params, 'b', 1), 0.05);

    const t1 = Math.pow(Math.abs(Math.cos((m * theta) / 4) / a), n2);
    const t2 = Math.pow(Math.abs(Math.sin((m * theta) / 4) / b), n3);
    const sum = t1 + t2;
    if (!(sum > 0) || !Number.isFinite(sum)) return 0;
    const r = Math.pow(sum, -1 / n1);
    return Number.isFinite(r) ? r : 0;
  },
};
