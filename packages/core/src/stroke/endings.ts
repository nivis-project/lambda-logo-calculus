import type { ParamValues } from '../params/types.js';
import { createRegistry, type Registered, type Registry } from '../registry/registry.js';
import { sampleCurve } from '../template/sample.js';
import type { ShapeTemplate, Vec2 } from '../template/types.js';
import { cross, normalise } from './geometry.js';

const DEG = Math.PI / 180;

export type Contour = readonly Vec2[];

export interface EndContext {
  readonly at: Vec2;
  readonly outward: Vec2;
  readonly halfWidth: number;
  readonly index: number;
  readonly left: Vec2;
  readonly right: Vec2;
  readonly curved: boolean;
}

export interface EndingBuildContext {
  readonly shapeBuilt: boolean;
  readonly template: ShapeTemplate;
  readonly templateParams: ParamValues;
  readonly rotation: number;
  readonly copyIndex: number;
  readonly nibSize: number;
}

export interface Ending extends Registered {
  // Shapes added beside the stroke's own outline.
  build(end: EndContext, context: EndingBuildContext): readonly Contour[];
  // Some endings cut the outline instead of adding to it.
  cut?(end: EndContext, context: EndingBuildContext): { readonly left: Vec2; readonly right: Vec2 };
  // Taper and flare change the width along the run rather than adding anything.
  readonly profile?: 'taper' | 'flare';
}

function ringOfShape(
  centre: Vec2,
  radius: number,
  context: EndingBuildContext,
  steps = 64,
): Contour {
  const sampled = sampleCurve(context.template, context.templateParams, steps);
  return sampled.map(({ x, y }): Vec2 => {
    const cos = Math.cos(context.rotation);
    const sin = Math.sin(context.rotation);
    return [centre[0] + (x * cos - y * sin) * radius, centre[1] + (x * sin + y * cos) * radius];
  });
}

function circle(centre: Vec2, radius: number, steps = 48): Contour {
  const out: Vec2[] = [];
  for (let k = 0; k < steps; k++) {
    const t = (k / steps) * Math.PI * 2;
    out.push([centre[0] + radius * Math.cos(t), centre[1] + radius * Math.sin(t)]);
  }
  return out;
}

function flatSerif(end: EndContext): boolean {
  return Math.abs(end.outward[1]) > 0.5;
}

function frame(end: EndContext): { readonly inward: Vec2; readonly across: Vec2 } {
  if (flatSerif(end)) {
    return { inward: [0, -Math.sign(end.outward[1])], across: [1, 0] };
  }
  return { inward: [-end.outward[0], -end.outward[1]], across: [-end.outward[1], end.outward[0]] };
}

function cutAlong(point: Vec2, along: Vec2, at: Vec2, direction: Vec2, limit: number): Vec2 {
  const denominator = cross(along, direction);
  if (Math.abs(denominator) < 0.25) return point;
  const distance = cross([at[0] - point[0], at[1] - point[1]], direction) / denominator;
  const moved = Math.max(-limit, Math.min(limit, distance));
  return [point[0] + along[0] * moved, point[1] + along[1] * moved];
}

function ending(
  id: string,
  label: string,
  build: Ending['build'],
  extra: Partial<Ending> = {},
): Ending {
  return { id, version: 1, label, params: [], build, ...extra };
}

export const roundEnding = ending('round', 'Round', (end, context) =>
  context.shapeBuilt
    ? [ringOfShape(end.at, context.nibSize, context)]
    : [circle(end.at, end.halfWidth)],
);

export const flatEnding = ending('flat', 'Flat', () => []);

export const angledEnding = ending('angled', 'Angled', () => [], {
  cut(end, context) {
    const degrees = context.shapeBuilt
      ? 60 + (context.rotation / DEG) * (context.copyIndex + 1)
      : 60;
    const radians = degrees * DEG;
    const direction: Vec2 = [Math.cos(radians), Math.sin(radians)];
    const { inward } = frame(end);
    const limit = end.halfWidth * 2;
    return {
      left: cutAlong(end.left, inward, end.at, direction, limit),
      right: cutAlong(end.right, inward, end.at, direction, limit),
    };
  },
});

export const taperEnding = ending(
  'taper',
  'Tapered',
  (end, context) => {
    if (!context.shapeBuilt) return [];
    return [ringOfShape(end.at, context.nibSize * 0.35, context)];
  },
  { profile: 'taper' },
);

export const flareEnding = ending('flare', 'Flared', () => [], { profile: 'flare' });

export const wedgeEnding = ending('wedge', 'Wedge serif', (end, context) => {
  const width = end.halfWidth * 0.9;
  const { inward, across } = frame(end);
  const sides: readonly (readonly [Vec2, number])[] = flatSerif(end)
    ? [
        [[end.at[0] + end.halfWidth * 0.8, end.at[1]], 1],
        [[end.at[0] - end.halfWidth * 0.8, end.at[1]], -1],
      ]
    : [
        [end.left, 1],
        [end.right, -1],
      ];

  return sides.map(([corner, side]) => {
    const out: Vec2 = [across[0] * side, across[1] * side];
    if (context.shapeBuilt) {
      const centre: Vec2 = [
        corner[0] + out[0] * width * 0.35 + inward[0] * width * 0.35,
        corner[1] + out[1] * width * 0.35 + inward[1] * width * 0.35,
      ];
      return ringOfShape(centre, width * 0.9, context, 32);
    }
    return [
      [corner[0] + out[0] * width, corner[1] + out[1] * width],
      corner,
      [corner[0] + inward[0] * width * 1.8, corner[1] + inward[1] * width * 1.8],
    ] as Contour;
  });
});

function slabLike(id: string, label: string, reach: number, thickness: number): Ending {
  return ending(id, label, (end, context) => {
    const half = end.halfWidth + reach;
    const { inward, across } = frame(end);

    if (context.shapeBuilt) {
      const centre: Vec2 = [
        end.at[0] + (inward[0] * thickness) / 2,
        end.at[1] + (inward[1] * thickness) / 2,
      ];
      return [ringOfShape(centre, half * 0.55, context, 32)];
    }

    return [
      [
        [end.at[0] + across[0] * half, end.at[1] + across[1] * half],
        [
          end.at[0] + across[0] * half + inward[0] * thickness,
          end.at[1] + across[1] * half + inward[1] * thickness,
        ],
        [
          end.at[0] - across[0] * half + inward[0] * thickness,
          end.at[1] - across[1] * half + inward[1] * thickness,
        ],
        [end.at[0] - across[0] * half, end.at[1] - across[1] * half],
      ] as Contour,
    ];
  });
}

export const slabEnding = slabLike('slab', 'Slab serif', 6, 6);
export const hairEnding = slabLike('hair', 'Hairline serif', 8, 1.6);

export const ballEnding = ending('ball', 'Ball', (end, context) => {
  if (!end.curved) return [];
  const radius = end.halfWidth * 1.35;
  const centre: Vec2 = [
    end.at[0] + end.outward[0] * radius * 0.35,
    end.at[1] + end.outward[1] * radius * 0.35,
  ];
  return context.shapeBuilt
    ? [ringOfShape(centre, radius * 1.15, context, 32)]
    : [circle(centre, radius)];
});

export const builtInEndings: readonly Ending[] = [
  roundEnding,
  flatEnding,
  angledEnding,
  taperEnding,
  flareEnding,
  wedgeEnding,
  slabEnding,
  hairEnding,
  ballEnding,
];

export function createEndingRegistry(): Registry<Ending> {
  const registry = createRegistry<Ending>('stroke-ending');
  for (const item of builtInEndings) registry.register(item);
  return registry;
}

export { normalise };
