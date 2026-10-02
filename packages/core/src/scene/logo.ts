import type { ParamValues } from '../params/types.js';
import type { GlyphSet, GridMetrics } from '../glyph/types.js';
import type { Registry } from '../registry/registry.js';
import type { SkeletonStage, StageListEntry } from '../stage/types.js';
import type { NestingResult } from '../template/nesting.js';
import type { ShapeTemplate, Vec2 } from '../template/types.js';
import type { Ending } from '../stroke/endings.js';
import { boundsOf, type Bounds } from '../layout/bounds.js';
import { layoutLockup, type MarkSettings } from '../layout/lockup.js';
import type { LayoutMetrics } from '../layout/text.js';
import { markOpacity, type Palette } from '../style/palette.js';
import { buildScene } from './build.js';
import { groupNode, pathNode, type Scene, type SceneNode } from './types.js';

export interface LogoInput {
  readonly text: string;
  readonly available: number;
  readonly glyphs: GlyphSet;
  readonly metrics: GridMetrics;
  readonly template: ShapeTemplate;
  readonly templateParams: ParamValues;
  readonly rotation: number;
  readonly nesting: NestingResult;
  readonly widthFactor: number;
  readonly xHeight: number;
  readonly stages: Registry<SkeletonStage>;
  readonly stageList?: readonly StageListEntry[];
  readonly ending: Ending;
  readonly palette: Palette;
  readonly alpha: number;
  readonly shapePen: boolean;
  readonly joins: boolean;
  readonly curvesOn: boolean;
  readonly mark: MarkSettings;
}

// The mark is the nested stack itself, drawn once at unit size so it can be
// measured by what it draws rather than by the box it was drawn into.
export function markContours(input: LogoInput): readonly (readonly Vec2[])[] {
  const peak = input.template.maxRadius(input.templateParams);
  const out: (readonly Vec2[])[] = [];

  for (const [copy, scale] of input.nesting.scales.entries()) {
    const ring: Vec2[] = [];
    const samples = 144;
    for (let k = 0; k < samples; k++) {
      const t = (k / samples) * Math.PI * 2;
      const r = (input.template.radius(t, input.templateParams) / peak) * scale;
      const angle = t + input.rotation * copy;
      ring.push([r * Math.cos(angle), r * Math.sin(angle)]);
    }
    out.push(ring);
  }

  return out;
}

export function markBounds(input: LogoInput): Bounds | null {
  return boundsOf(markContours(input).flat());
}

export interface Logo {
  readonly scene: Scene;
  readonly lines: readonly string[];
  readonly placement: 'none' | 'side' | 'stacked';
}

export function buildLogo(input: LogoInput): Logo {
  const layout: LayoutMetrics = {
    set: input.glyphs,
    metrics: input.metrics,
    widthFactor: input.widthFactor,
  };

  const drawn = markBounds(input);
  const lockup = layoutLockup({
    text: input.text,
    available: input.available,
    mark: drawn ?? { x0: 0, y0: 0, x1: 1, y1: 1, width: 1, height: 1 },
    settings: input.mark,
    layout,
    metrics: input.metrics,
  });

  const above = lockup.placement === 'stacked';
  const markHeight = (drawn?.height ?? 0) * lockup.markScale;
  const markWidth = (drawn?.width ?? 0) * lockup.markScale;
  const gapBelow = above ? markHeight * 0.45 * (1 - 0.8 * input.mark.height) : 0;

  const originX = above ? 0 : lockup.reserved;
  const originY = above ? markHeight + gapBelow + input.metrics.capHeight : 0;

  const text = buildScene({
    lines: lockup.lines,
    glyphs: input.glyphs,
    metrics: input.metrics,
    template: input.template,
    templateParams: input.templateParams,
    rotation: input.rotation,
    nesting: input.nesting,
    widthFactor: input.widthFactor,
    xHeight: input.xHeight,
    stages: input.stages,
    ...(input.stageList === undefined ? {} : { stageList: input.stageList }),
    ending: input.ending,
    palette: input.palette,
    alpha: input.alpha,
    shapePen: input.shapePen,
    joins: input.joins,
    curvesOn: input.curvesOn,
    originX,
    originY,
  });

  if (lockup.placement === 'none' || drawn === null) {
    return { scene: text, lines: lockup.lines, placement: lockup.placement };
  }

  const copies = input.nesting.scales.length;
  const opacity = markOpacity(input.alpha);

  // Placed by its drawn extent: the stack's own corner, not the curve's centre.
  const lines = Math.min(lockup.lines.length, 2);
  const centreY = above
    ? markHeight / 2 - input.metrics.capHeight
    : (input.metrics.capHeight + (lines - 1) * input.metrics.lineHeight) / 2 -
      input.metrics.capHeight -
      input.mark.height * input.metrics.capHeight * 0.5;

  const translate: Vec2 = [
    -drawn.x0 * lockup.markScale,
    centreY - ((drawn.y0 + drawn.y1) / 2) * lockup.markScale,
  ];

  const markNode: SceneNode = groupNode(
    markContours(input).map((ring, copy) =>
      pathNode([ring], {
        fill: input.palette.colorAt(copy, copies),
        opacity,
        fillRule: 'evenodd',
      }),
    ),
    { translate, scale: [lockup.markScale, lockup.markScale] },
  );

  const root = groupNode([markNode, ...text.root.children]);

  // The mark's placed extent, worked out rather than measured, because its
  // contours sit in the group's own space.
  const markX0 = 0;
  const markX1 = markWidth;
  const markY0 = centreY - markHeight / 2;
  const markY1 = centreY + markHeight / 2;

  const x0 = Math.min(text.viewBox[0], markX0);
  const y0 = Math.min(text.viewBox[1], markY0);
  const x1 = Math.max(text.viewBox[0] + text.viewBox[2], markX1);
  const y1 = Math.max(text.viewBox[1] + text.viewBox[3], markY1);

  return {
    scene: { viewBox: [x0, y0, x1 - x0, y1 - y0], root },
    lines: lockup.lines,
    placement: lockup.placement,
  };
}
