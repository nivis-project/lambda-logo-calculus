import type { ParamValues } from '../params/types.js';
import type { GlyphSet, GridMetrics } from '../glyph/types.js';
import { glyphFor } from '../glyph/registry.js';
import { DEFAULT_STAGE_LIST, runStages } from '../stage/pipeline.js';
import type { SkeletonStage, StageContext, StageListEntry } from '../stage/types.js';
import type { Registry } from '../registry/registry.js';
import type { ShapeTemplate } from '../template/types.js';
import type { NestingResult } from '../template/nesting.js';
import { outlineSkeleton, type RenderStyle } from '../stroke/outline.js';
import type { Ending } from '../stroke/endings.js';
import type { Join } from '../stroke/joins.js';
import { roundPen, shapePen } from '../stroke/pen.js';
import type { Palette } from '../style/palette.js';
import { passOpacity } from '../style/palette.js';
import { advanceOf } from '../layout/text.js';
import { groupNode, pathNode, type GroupNode, type Scene, type SceneNode } from './types.js';

export interface SceneInput {
  readonly text: string;
  readonly glyphs: GlyphSet;
  readonly metrics: GridMetrics;
  readonly template: ShapeTemplate;
  readonly templateParams: ParamValues;
  readonly rotation: number;
  readonly nesting: NestingResult;
  readonly modulation: { readonly widthFactor: number; readonly xHeight: number };
  readonly stages: Registry<SkeletonStage>;
  readonly stageList?: readonly StageListEntry[];
  readonly ending: Ending;
  readonly join?: Join;
  readonly palette: Palette;
  readonly alpha: number;
  readonly shapePen: boolean;
  readonly style?: RenderStyle;
}

export function buildScene(input: SceneInput): Scene {
  const stageContext: Omit<StageContext, 'params'> = {
    template: input.template,
    templateParams: input.templateParams,
    rotation: input.rotation,
    nesting: input.nesting,
    metrics: input.metrics,
    modulation: input.modulation,
  };

  const layout = {
    set: input.glyphs,
    metrics: input.metrics,
    widthFactor: input.modulation.widthFactor,
  };

  const copies = input.nesting.scales.length;
  const opacity = passOpacity(input.alpha);
  const glyphGroups: SceneNode[] = [];

  const pens = input.nesting.scales.map((scale, copy) =>
    input.shapePen
      ? shapePen(
          input.template,
          input.templateParams,
          (input.metrics.strokeWidth / 2) * scale,
          input.rotation * copy,
        )
      : roundPen(input.metrics.strokeWidth * scale),
  );

  const colours = input.nesting.scales.map((_scale, copy) =>
    input.palette.colorAt(copy, copies, {}),
  );

  let cursor = 0;
  for (const character of input.text) {
    const advance = advanceOf(character, layout);
    if (character === ' ') {
      cursor += advance;
      continue;
    }

    const skeleton = runStages(
      glyphFor(input.glyphs, character),
      input.stageList ?? DEFAULT_STAGE_LIST,
      input.stages,
      stageContext,
    );

    const passes: SceneNode[] = [];
    for (let copy = 0; copy < copies; copy++) {
      const pen = pens[copy];
      if (pen === undefined) continue;

      const outline = outlineSkeleton(skeleton, {
        pen,
        ending: input.ending,
        ...(input.join === undefined ? {} : { join: input.join }),
        shapeBuilt: input.shapePen,
        template: input.template,
        templateParams: input.templateParams,
        rotation: input.rotation * copy,
        copyIndex: copy,
        ...(input.style === undefined ? {} : { style: input.style }),
      });

      if (outline.contours.length === 0) continue;
      passes.push(
        pathNode(outline.contours, {
          fill: colours[copy] ?? '#000',
          opacity,
          fillRule: 'evenodd',
        }),
      );
    }

    glyphGroups.push(
      groupNode(passes, { translate: [cursor + input.metrics.sideBearing, 0] }),
    );
    cursor += advance;
  }

  const top = input.metrics.capHeight + input.metrics.strokeWidth;
  const bottom = input.metrics.descender - input.metrics.strokeWidth;
  const root: GroupNode = groupNode(glyphGroups, { scale: [1, -1] });

  return {
    viewBox: [0, -top, Math.max(cursor, 1), top - bottom],
    root,
  };
}
