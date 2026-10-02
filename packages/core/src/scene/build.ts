import type { ParamValues } from '../params/types.js';
import type { GlyphSet, GridMetrics } from '../glyph/types.js';
import { glyphFor } from '../glyph/registry.js';
import { DEFAULT_STAGE_LIST, runStages } from '../stage/pipeline.js';
import type { SkeletonStage, StageListEntry } from '../stage/types.js';
import type { Registry } from '../registry/registry.js';
import type { NestingResult } from '../template/nesting.js';
import type { ShapeTemplate } from '../template/types.js';
import { NIB_SIZE, roundPen, shapePen, type Pen } from '../stroke/pen.js';
import { outlineSkeleton, stampContour } from '../stroke/outline.js';
import type { Contour, Ending } from '../stroke/endings.js';
import { AMPLITUDE_FLOOR, amplitudeOf } from '../template/trefoil.js';
import { letterOpacity, type Palette } from '../style/palette.js';
import { advanceOf, type LayoutMetrics } from '../layout/text.js';
import {
  groupNode,
  pathNode,
  type GroupNode,
  type Guide,
  type Scene,
  type SceneNode,
} from './types.js';

export interface SceneInput {
  readonly lines: readonly string[];
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
  readonly originX: number;
  readonly originY: number;
  readonly guides?: boolean;
}

function pensFor(input: SceneInput): readonly Pen[] {
  return input.nesting.scales.map((scale, copy) =>
    input.shapePen
      ? shapePen(
          input.template,
          input.templateParams,
          NIB_SIZE * scale,
          input.rotation * copy,
        )
      : roundPen(input.metrics.strokeWidth),
  );
}

export function buildScene(input: SceneInput): Scene {
  const layout: LayoutMetrics = {
    set: input.glyphs,
    metrics: input.metrics,
    widthFactor: input.widthFactor,
  };

  const pens = pensFor(input);
  const opacity = letterOpacity(input.alpha);
  const copies = input.nesting.scales.length;
  const amplitude = Math.max(amplitudeOf(input.templateParams), AMPLITUDE_FLOOR);

  const children: SceneNode[] = [];
  const guides: Guide[] = [];
  let widest = 0;

  for (const [lineIndex, line] of input.lines.entries()) {
    const baseline = input.originY + lineIndex * input.metrics.lineHeight;
    let cursor = input.originX;

    for (const character of line) {
      const advance = advanceOf(character, layout);
      if (character === ' ') {
        cursor += advance;
        continue;
      }

      if (input.guides === true) {
        guides.push({
          kind: 'box',
          x: cursor,
          y: baseline - input.metrics.capHeight,
          width: advance,
          height: input.metrics.capHeight - input.metrics.descender,
        });
      }

      const skeleton = runStages(
        glyphFor(input.glyphs, character),
        input.stageList ?? DEFAULT_STAGE_LIST,
        input.stages,
        {
          template: input.template,
          templateParams: input.templateParams,
          rotation: input.rotation,
          metrics: input.metrics,
          modulation: { widthFactor: input.widthFactor, xHeight: input.xHeight },
        },
      );

      const passes: SceneNode[] = [];
      for (let copy = 0; copy < copies; copy++) {
        const pen = pens[copy];
        const scale = input.nesting.scales[copy];
        if (pen === undefined || scale === undefined) continue;

        const outline = outlineSkeleton(skeleton, {
          pen,
          ending: input.ending,
          shapeBuilt: input.shapePen,
          template: input.template,
          templateParams: input.templateParams,
          rotation: input.rotation * copy,
          copyIndex: copy,
          nibSize: NIB_SIZE * scale,
          amplitude,
          joins: input.joins,
          curvesOn: input.curvesOn,
          baseRotationDegrees: (input.rotation * 180) / Math.PI,
        });

        const fill = input.palette.colorAt(copy, copies);
        // Opacity goes on the pass group below, not here: a pass must flatten
        // before it goes transparent or its own overlaps blend twice.
        const style = { fill, opacity: 1, fillRule: 'evenodd' as const };

        const stamps: Contour[] = outline.stamps.map((stamp) =>
          stampContour(
            stamp.at,
            stamp.size * scale,
            {
              template: input.template,
              templateParams: input.templateParams,
              rotation: input.rotation * copy,
              shapeBuilt: input.shapePen,
            },
            input.metrics.strokeWidth,
          ),
        );

        // One path per thing drawn. Merging them would let a stamp covering a
        // joint cancel the letter under it through the fill rule.
        const drawn: SceneNode[] = [
          ...outline.outlineGroups.map((group) => pathNode(group, style)),
          ...outline.extras.map((extra) => pathNode([extra], style)),
          ...stamps.map((stamp) => pathNode([stamp], style)),
        ];
        if (drawn.length === 0) continue;

        passes.push(groupNode(drawn, undefined, { opacity }));
      }

      children.push(groupNode(passes, { translate: [cursor + input.metrics.sideBearing, baseline], scale: [1, -1] }));
      cursor += advance;
    }

    widest = Math.max(widest, cursor);
  }

  const top = input.originY - input.metrics.capHeight;
  const bottom =
    input.originY +
    (input.lines.length - 1) * input.metrics.lineHeight -
    input.metrics.descender;

  const root: GroupNode = groupNode(children);
  const width = Math.max(widest, 1);

  return {
    viewBox: [0, top, width, Math.max(bottom - top, 1)],
    root,
    ...(input.guides === true ? { guides: [...rulesFor(input, width), ...guides] } : {}),
  };
}

// The x-height is the one metric the sliders move, so the rule is drawn at the
// x-height the letters were built with, not at the grid's nominal one.
function rulesFor(input: SceneInput, width: number): readonly Guide[] {
  const levels: readonly (readonly [number, string])[] = [
    [0, 'baseline'],
    [input.xHeight, 'x-height'],
    [input.metrics.capHeight, 'cap'],
    [input.metrics.descender, 'descender'],
  ];

  return input.lines.flatMap((_line, lineIndex) => {
    const baseline = input.originY + lineIndex * input.metrics.lineHeight;
    return levels.map(([level, label]) => ({
      kind: 'rule' as const,
      y: baseline - level,
      x0: 0,
      x1: width,
      dashed: level !== 0,
      ...(lineIndex === 0 ? { label } : {}),
    }));
  });
}
