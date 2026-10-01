import type { ParamDef, ParamValues } from '../params/types.js';
import { createRegistry, type Registered, type Registry } from '../registry/registry.js';
import type { Vec2 } from '../stage/types.js';
import { maxRadius, radiusAt } from '../template/sample.js';
import type { ShapeTemplate } from '../template/types.js';
import type { Contour } from './stroker.js';

const DEG = Math.PI / 180;

export interface EndContext {
  readonly point: Vec2;
  readonly outward: Vec2;
  readonly halfWidth: number;
  readonly curved: boolean;
  readonly leftOffset: Vec2;
  readonly rightOffset: Vec2;
}
import { FULL_QUALITY, type SampleQuality } from '../perf/quality.js';

export interface EndingBuildContext {
  readonly quality?: SampleQuality;
  readonly shapeBuilt: boolean;
  readonly template: ShapeTemplate;
  readonly templateParams: ParamValues;
  readonly rotation: number;
  readonly copyIndex: number;
  readonly params: ParamValues;
}

export interface Ending extends Registered {
  build(end: EndContext, context: EndingBuildContext): readonly Contour[];
}

function circle(cx: number, cy: number, r: number, steps = 48): Contour {
  const out: Vec2[] = [];
  for (let k = 0; k < steps; k++) {
    const t = (k / steps) * Math.PI * 2;
    out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
  }
  const first = out[0];
  if (first !== undefined) out.push(first);
  return out;
}

function shapeRing(
  cx: number,
  cy: number,
  r: number,
  context: EndingBuildContext,
  steps = context.quality?.ringSteps ?? FULL_QUALITY.ringSteps,
): Contour {
  const params = context.templateParams;
  const peak = maxRadius(context.template, params);
  const out: Vec2[] = [];
  for (let k = 0; k < steps; k++) {
    const t = (k / steps) * Math.PI * 2;
    const rho = Math.max(0.35, radiusAt(context.template, t - context.rotation, params) / peak);
    out.push([cx + r * rho * Math.cos(t), cy + r * rho * Math.sin(t)]);
  }
  const first = out[0];
  if (first !== undefined) out.push(first);
  return out;
}

function flatSerif(end: EndContext): boolean {
  return Math.abs(end.outward[1]) > 0.5;
}

function closePolygon(points: readonly Vec2[]): Contour {
  const first = points[0];
  if (first === undefined) return points;
  return [...points, first];
}

const ADVANCED = { group: 'Endings', advanced: true } as const;

function sizeParam(id: string, label: string, def: number, max: number): ParamDef {
  return {
    id,
    label,
    kind: 'number',
    min: 0,
    max,
    step: 0.1,
    default: def,
    lockable: true,
    ...ADVANCED,
  };
}

export const roundEnding: Ending = {
  id: 'round',
  version: 1,
  label: 'Round',
  params: [],
  build(end, context) {
    return [
      context.shapeBuilt
        ? shapeRing(end.point[0], end.point[1], end.halfWidth, context)
        : circle(end.point[0], end.point[1], end.halfWidth),
    ];
  },
};

export const flatEnding: Ending = {
  id: 'flat',
  version: 1,
  label: 'Flat',
  params: [],
  build() {
    return [];
  },
};

export const angledEnding: Ending = {
  id: 'angled',
  version: 1,
  label: 'Angled',
  params: [sizeParam('angle', 'Cut angle', 60, 180)],
  build(end, context) {
    const base = typeof context.params['angle'] === 'number' ? context.params['angle'] : 60;
    const turn = context.shapeBuilt ? base + (context.rotation / DEG) * (context.copyIndex + 1) : base;
    const ca = turn * DEG;
    const cut: Vec2 = [Math.cos(ca), Math.sin(ca)];
    const reach = end.halfWidth * 2;
    const [ex, ey] = end.point;
    return [
      closePolygon([
        [ex + cut[0] * reach, ey + cut[1] * reach],
        [ex - cut[0] * reach, ey - cut[1] * reach],
        [ex - cut[0] * reach + end.outward[0] * reach, ey - cut[1] * reach + end.outward[1] * reach],
        [ex + cut[0] * reach + end.outward[0] * reach, ey + cut[1] * reach + end.outward[1] * reach],
      ]),
    ];
  },
};

export const taperedEnding: Ending = {
  id: 'tapered',
  version: 1,
  label: 'Tapered',
  params: [sizeParam('length', 'Taper length', 22, 80)],
  build(end, context) {
    if (!context.shapeBuilt) return [];
    return [shapeRing(end.point[0], end.point[1], end.halfWidth * 0.35, context, Math.max(8, Math.round((context.quality?.ringSteps ?? FULL_QUALITY.ringSteps) / 2)))];
  },
};

export const flaredEnding: Ending = {
  id: 'flared',
  version: 1,
  label: 'Flared',
  params: [sizeParam('length', 'Flare length', 16, 60)],
  build() {
    return [];
  },
};

export const wedgeEnding: Ending = {
  id: 'wedge',
  version: 1,
  label: 'Wedge serif',
  params: [sizeParam('size', 'Wedge size', 0.9, 4)],
  build(end, context) {
    const scale = typeof context.params['size'] === 'number' ? context.params['size'] : 0.9;
    const sw = end.halfWidth * scale;
    const flat = flatSerif(end);
    const tIn: Vec2 = flat
      ? [0, -Math.sign(end.outward[1])]
      : [-end.outward[0], -end.outward[1]];
    const normal: Vec2 = flat ? [1, 0] : [-end.outward[1], end.outward[0]];

    const bases: readonly (readonly [Vec2, number])[] = flat
      ? [
          [[end.point[0] + end.halfWidth * 0.8, end.point[1]], 1],
          [[end.point[0] - end.halfWidth * 0.8, end.point[1]], -1],
        ]
      : [
          [end.leftOffset, 1],
          [end.rightOffset, -1],
        ];

    if (context.shapeBuilt) {
      return bases.map(([base, side]) =>
        shapeRing(
          base[0] + normal[0] * side * sw * 0.35 + tIn[0] * sw * 0.35,
          base[1] + normal[1] * side * sw * 0.35 + tIn[1] * sw * 0.35,
          sw * 0.9,
          context,
          32,
        ),
      );
    }

    return bases.map(([base, side]) =>
      closePolygon([
        [base[0] + normal[0] * side * sw, base[1] + normal[1] * side * sw],
        base,
        [base[0] + tIn[0] * sw * 1.8, base[1] + tIn[1] * sw * 1.8],
      ]),
    );
  },
};

function serif(end: EndContext, reachBonus: number, thickness: number): readonly Contour[] {
  const flat = flatSerif(end);
  const tIn: Vec2 = flat ? [0, -Math.sign(end.outward[1])] : [-end.outward[0], -end.outward[1]];
  const normal: Vec2 = flat ? [1, 0] : [-end.outward[1], end.outward[0]];
  const reach = end.halfWidth + reachBonus;
  const [ex, ey] = end.point;
  return [
    closePolygon([
      [ex + normal[0] * reach, ey + normal[1] * reach],
      [ex + normal[0] * reach + tIn[0] * thickness, ey + normal[1] * reach + tIn[1] * thickness],
      [ex - normal[0] * reach + tIn[0] * thickness, ey - normal[1] * reach + tIn[1] * thickness],
      [ex - normal[0] * reach, ey - normal[1] * reach],
    ]),
  ];
}

export const slabEnding: Ending = {
  id: 'slab',
  version: 1,
  label: 'Slab serif',
  params: [sizeParam('reach', 'Slab reach', 6, 30), sizeParam('thickness', 'Slab thickness', 6, 20)],
  build(end, context) {
    const reach = typeof context.params['reach'] === 'number' ? context.params['reach'] : 6;
    const thickness =
      typeof context.params['thickness'] === 'number' ? context.params['thickness'] : 6;
    return serif(end, reach, context.shapeBuilt ? thickness * 1.1 : thickness);
  },
};

export const hairlineEnding: Ending = {
  id: 'hairline',
  version: 1,
  label: 'Hairline serif',
  params: [
    sizeParam('reach', 'Hairline reach', 8, 30),
    sizeParam('thickness', 'Hairline thickness', 1.6, 10),
  ],
  build(end, context) {
    const reach = typeof context.params['reach'] === 'number' ? context.params['reach'] : 8;
    const thickness =
      typeof context.params['thickness'] === 'number' ? context.params['thickness'] : 1.6;
    return serif(end, reach, context.shapeBuilt ? thickness * 1.1 : thickness);
  },
};

export const ballEnding: Ending = {
  id: 'ball',
  version: 1,
  label: 'Ball',
  params: [sizeParam('size', 'Ball size', 1.35, 4)],
  build(end, context) {
    if (!end.curved) return [];
    const scale = typeof context.params['size'] === 'number' ? context.params['size'] : 1.35;
    const rb = end.halfWidth * scale;
    const cx = end.point[0] + end.outward[0] * rb * 0.35;
    const cy = end.point[1] + end.outward[1] * rb * 0.35;
    return [
      context.shapeBuilt ? shapeRing(cx, cy, rb * 1.15, context) : circle(cx, cy, rb),
    ];
  },
};

export const BUILT_IN_ENDINGS: readonly Ending[] = [
  roundEnding,
  flatEnding,
  angledEnding,
  taperedEnding,
  flaredEnding,
  wedgeEnding,
  slabEnding,
  hairlineEnding,
  ballEnding,
];

export function createEndingRegistry(): Registry<Ending> {
  const registry = createRegistry<Ending>('ending');
  for (const ending of BUILT_IN_ENDINGS) registry.register(ending);
  return registry;
}
