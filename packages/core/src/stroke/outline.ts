import type { ParamValues } from '../params/types.js';
import type { Polyline, Vec2, WorkingSkeleton } from '../stage/types.js';
import type { ShapeTemplate } from '../template/types.js';
import type { Ending, EndingBuildContext } from './endings.js';
import { findCorners, type Join, type JoinBuildContext } from './joins.js';
import type { Pen } from './pen.js';
import { flareProfile, taperProfile, PROTOTYPE_PROFILE } from './profile.js';
import { strokeRing, strokeRun, UNIFORM_WIDTH, type Contour } from './stroker.js';

export type RenderStyle = 'letter' | 'ornament';

export interface OutlineOptions {
  readonly pen: Pen;
  readonly ending: Ending;
  readonly join?: Join;
  readonly shapeBuilt: boolean;
  readonly template: ShapeTemplate;
  readonly templateParams: ParamValues;
  readonly rotation: number;
  readonly copyIndex: number;
  readonly endingParams?: ParamValues;
  readonly joinParams?: ParamValues;
  readonly style?: RenderStyle;
}

export interface GlyphOutline {
  readonly contours: readonly Contour[];
  readonly dots: readonly { readonly x: number; readonly y: number; readonly r: number }[];
  readonly style: RenderStyle;
}

function direction(from: Vec2, to: Vec2): Vec2 {
  const dx = from[0] - to[0];
  const dy = from[1] - to[1];
  const length = Math.hypot(dx, dy) || 1;
  return [dx / length, dy / length];
}

function isCurved(run: Polyline): boolean {
  if (run.length < 3) return false;
  let total = 0;
  for (let j = 1; j < run.length - 1; j++) {
    const a = run[j - 1];
    const b = run[j];
    const c = run[j + 1];
    if (a === undefined || b === undefined || c === undefined) continue;
    const a1 = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const a2 = Math.atan2(c[1] - b[1], c[0] - b[0]);
    const d = Math.abs(a2 - a1);
    total += d > Math.PI ? Math.PI * 2 - d : d;
  }
  return total > Math.PI / 6;
}

export function outlineSkeleton(
  skeleton: WorkingSkeleton,
  options: OutlineOptions,
): GlyphOutline {
  const endingContext: EndingBuildContext = {
    shapeBuilt: options.shapeBuilt,
    template: options.template,
    templateParams: options.templateParams,
    rotation: options.rotation,
    copyIndex: options.copyIndex,
    params: options.endingParams ?? {},
  };
  const joinContext: JoinBuildContext = {
    shapeBuilt: options.shapeBuilt,
    template: options.template,
    templateParams: options.templateParams,
    rotation: options.rotation,
    params: options.joinParams ?? {},
  };

  const contours: Contour[] = [];

  for (const run of skeleton.runs) {
    const profileOptions = { freeStart: true, freeEnd: true, ...PROTOTYPE_PROFILE };
    const profile =
      options.ending.id === 'tapered'
        ? taperProfile(run, profileOptions)
        : options.ending.id === 'flared'
          ? flareProfile(run, profileOptions)
          : UNIFORM_WIDTH;

    const stroked = strokeRun(run, options.pen, profile);
    if (stroked === undefined) continue;
    contours.push(...stroked.contours);

    const curved = isCurved(run);
    const first = run[0];
    const second = run[1];
    const last = run[run.length - 1];
    const penultimate = run[run.length - 2];

    if (first !== undefined && second !== undefined) {
      const left = stroked.left[0];
      const right = stroked.right[0];
      contours.push(
        ...options.ending.build(
          {
            point: first,
            outward: direction(first, second),
            halfWidth: Math.max(
              Math.hypot((left?.[0] ?? first[0]) - first[0], (left?.[1] ?? first[1]) - first[1]),
              Math.hypot((right?.[0] ?? first[0]) - first[0], (right?.[1] ?? first[1]) - first[1]),
              1,
            ),
            curved,
            leftOffset: left ?? first,
            rightOffset: right ?? first,
          },
          endingContext,
        ),
      );
    }

    if (last !== undefined && penultimate !== undefined) {
      const left = stroked.left[stroked.left.length - 1];
      const right = stroked.right[stroked.right.length - 1];
      contours.push(
        ...options.ending.build(
          {
            point: last,
            outward: direction(last, penultimate),
            halfWidth: Math.max(
              Math.hypot((left?.[0] ?? last[0]) - last[0], (left?.[1] ?? last[1]) - last[1]),
              Math.hypot((right?.[0] ?? last[0]) - last[0], (right?.[1] ?? last[1]) - last[1]),
              1,
            ),
            curved,
            leftOffset: left ?? last,
            rightOffset: right ?? last,
          },
          endingContext,
        ),
      );
    }

    if (options.join !== undefined) {
      for (const corner of findCorners(run)) {
        contours.push(...options.join.build(corner, joinContext));
      }
    }
  }

  for (const ring of skeleton.rings) {
    const stroked = strokeRing(ring, options.pen);
    if (stroked !== undefined) contours.push(...stroked.contours);
  }

  return { contours, dots: skeleton.dots, style: options.style ?? 'letter' };
}
