import {
  GRID,
  buildScene,
  computeNesting,
  createGlyphSetRegistry,
  createPaletteRegistry,
  createStageRegistry,
  createTemplateRegistry,
  OPTICAL_ENLARGEMENT,
  boundsOfScene,
  glyphFor,
  groupNode,
  prototypeModulation,
  sideLockup,
  stackedLockup,
  resolveParams,
  runStages,
  type Ending,
  type GlyphSet,
  type Join,
  type Scene,
  type ShapeTemplate,
  type WorkingSkeleton,
} from '@trefoil/core';
import type { ProjectState } from './state.js';

export type ArtboardKind = 'mark' | 'side' | 'stacked';

export function lockupSceneFromProject(
  project: ProjectState,
  registries: SceneRegistries,
  lockupId: 'side' | 'stacked',
): Scene {
  const wordmark = sceneFromProject(project, registries);
  const mark = sceneFromProject({ ...project, text: 'o' }, registries);

  const markBounds = boundsOfScene(mark);
  if (markBounds === null || !project.mark.enabled) return wordmark;

  const lockup = lockupId === 'side' ? sideLockup : stackedLockup;
  const textBounds = boundsOfScene(wordmark);
  const textWidth = textBounds === null ? wordmark.viewBox[2] : textBounds.width;

  const scale =
    ((GRID.capHeight * OPTICAL_ENLARGEMENT) / Math.max(markBounds.height, 1)) * project.mark.size;
  const gap = ((scale * markBounds.height) / 2) * (0.6 + 0.8 * project.mark.distance);

  const placement = lockup.place({
    mark: markBounds,
    markScale: scale,
    gap,
    lines: [project.text],
    lineWidths: [textWidth],
    metrics: GRID,
  });

  const pad = GRID.strokeWidth;
  const baseline = placement.baselines[0] ?? 0;

  return {
    viewBox: [-pad, -pad, placement.width + 2 * pad, placement.height + 2 * pad],
    root: groupNode([
      groupNode([mark.root], {
        translate: [
          placement.markPosition[0] - markBounds.x0 * scale,
          placement.markPosition[1] - markBounds.y0 * scale,
        ],
        scale: [scale, scale],
      }),
      groupNode([wordmark.root], { translate: [placement.textPosition[0], baseline] }),
    ]),
  };
}

const DEG = Math.PI / 180;

export interface SceneRegistries {
  readonly templates: ReturnType<typeof createTemplateRegistry>;
  readonly glyphSets: ReturnType<typeof createGlyphSetRegistry>;
  readonly palettes: ReturnType<typeof createPaletteRegistry>;
  readonly stages: ReturnType<typeof createStageRegistry>;
  readonly endings: ReadonlyMap<string, Ending>;
  readonly joins: ReadonlyMap<string, Join>;
  readonly glyphSetId: string;
}

export function skeletonsFromProject(
  project: ProjectState,
  registries: SceneRegistries,
): readonly WorkingSkeleton[] {
  const template = registries.templates.get(project.templateId);
  const { values } = resolveParams(template.params, project.templateParams);
  const rotation = project.rotation * DEG;
  const amplitude = typeof values['A'] === 'number' ? values['A'] : 3;
  const glyphs = registries.glyphSets.get(registries.glyphSetId);

  const context = {
    template,
    templateParams: values,
    rotation,
    nesting: computeNesting({
      template,
      params: values,
      rotation,
      copies: project.copies,
      fit: project.fit,
    }),
    metrics: GRID,
    modulation: prototypeModulation({ amplitude, fit: project.fit, metrics: GRID }),
  };

  return Array.from(project.text)
    .filter((character) => character !== ' ')
    .map((character) =>
      runStages(glyphFor(glyphs, character), project.stages, registries.stages, context),
    );
}

export function sceneFromProject(project: ProjectState, registries: SceneRegistries): Scene {
  const template: ShapeTemplate = registries.templates.get(project.templateId);
  const { values } = resolveParams(template.params, project.templateParams);
  const rotation = project.rotation * DEG;

  const nesting = computeNesting({
    template,
    params: values,
    rotation,
    copies: project.copies,
    fit: project.fit,
  });

  const ending = registries.endings.get(project.endingId);
  if (ending === undefined) throw new Error(`no ending "${project.endingId}"`);

  const join = project.joinId === null ? undefined : registries.joins.get(project.joinId);
  const glyphs: GlyphSet = registries.glyphSets.get(registries.glyphSetId);
  const amplitude = typeof values['A'] === 'number' ? values['A'] : 3;

  return buildScene({
    text: project.text,
    glyphs,
    metrics: GRID,
    template,
    templateParams: values,
    rotation,
    nesting,
    modulation: prototypeModulation({ amplitude, fit: project.fit, metrics: GRID }),
    stages: registries.stages,
    stageList: project.stages,
    ending,
    ...(join === undefined ? {} : { join }),
    palette: registries.palettes.get(project.paletteId),
    alpha: project.alpha,
    shapePen: project.shapePen,
  });
}
