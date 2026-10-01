import type { ParamValues } from '../params/types.js';
import type { GlyphSet, GridMetrics } from '../glyph/types.js';
import { glyphFor } from '../glyph/registry.js';
import { DEFAULT_STAGE_LIST, runStages, type StageParamOverrides } from '../stage/pipeline.js';
import type { SkeletonStage, StageContext, StageListEntry } from '../stage/types.js';
import type { Registry } from '../registry/registry.js';
import type { ShapeTemplate } from '../template/types.js';
import type { NestingResult } from '../template/nesting.js';
import { outlineSkeleton, type RenderStyle } from '../stroke/outline.js';
import {
  advanceWithPairs,
  applyPatch,
  type GlyphPatches,
  type SpacingPair,
} from '../overrides/types.js';
import type { Ending } from '../stroke/endings.js';
import type { Join } from '../stroke/joins.js';
import { roundPen, shapePen } from '../stroke/pen.js';
import type { Palette } from '../style/palette.js';
import { passOpacity } from '../style/palette.js';
import { advanceOf } from '../layout/text.js';
import { groupNode, pathNode, type GroupNode, type Scene, type SceneNode } from './types.js';

export interface PerGlyphModulation {
  (
    charIndex: number,
    charCount: number,
  ): {
    readonly widthFactor: number;
    readonly xHeight: number;
    readonly stageParams?: StageParamOverrides;
  };
}

export interface SceneInput {
  readonly text: string;
  readonly glyphs: GlyphSet;
  readonly metrics: GridMetrics;
  readonly template: ShapeTemplate;
  readonly templateParams: ParamValues;
  readonly rotation: number;
  readonly nesting: NestingResult;
  readonly modulation: { readonly widthFactor: number; readonly xHeight: number };
  readonly modulationFor?: PerGlyphModulation;
  readonly stages: Registry<SkeletonStage>;
  readonly stageList?: readonly StageListEntry[];
  readonly ending: Ending;
  readonly join?: Join;
  readonly palette: Palette;
  readonly alpha: number;
  readonly shapePen: boolean;
  readonly style?: RenderStyle;
  readonly patches?: GlyphPatches;
  readonly pairs?: readonly SpacingPair[];
  readonly endingFor?: (endingId: string) => Ending | undefined;
}

export function buildScene(input: SceneInput): Scene {
  const characters = Array.from(input.text);
  const charCount = Math.max(1, characters.filter((c) => c !== ' ').length);

  const modulationAt = (
    charIndex: number,
  ): { widthFactor: number; xHeight: number; stageParams?: StageParamOverrides } =>
    input.modulationFor?.(charIndex, charCount) ?? input.modulation;

  const contextFor = (charIndex: number): Omit<StageContext, 'params'> => {
    const { widthFactor, xHeight } = modulationAt(charIndex);
    return {
      template: input.template,
      templateParams: input.templateParams,
      rotation: input.rotation,
      nesting: input.nesting,
      metrics: input.metrics,
      modulation: { widthFactor, xHeight },
    };
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
  let charIndex = -1;
  for (const [position, character] of characters.entries()) {
    const patch = input.patches?.[character];
    const advance = advanceWithPairs(
      characters,
      position,
      advanceOf(character, layout),
      patch,
      input.pairs ?? [],
    );
    if (character === ' ') {
      cursor += advance;
      continue;
    }

    charIndex++;
    const unpatched = runStages(
      glyphFor(input.glyphs, character),
      input.stageList ?? DEFAULT_STAGE_LIST,
      input.stages,
      contextFor(charIndex),
      modulationAt(charIndex).stageParams ?? {},
    );
    const skeleton = applyPatch(unpatched, patch);
    const ending =
      patch?.endingId === undefined
        ? input.ending
        : (input.endingFor?.(patch.endingId) ?? input.ending);

    const passes: SceneNode[] = [];
    for (let copy = 0; copy < copies; copy++) {
      const pen = pens[copy];
      if (pen === undefined) continue;

      const outline = outlineSkeleton(skeleton, {
        pen,
        ending,
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
      groupNode(passes, { translate: [cursor + input.metrics.sideBearing, 0] }, {
        character,
        index: position,
      }),
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
