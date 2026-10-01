import {
  GRID,
  buildScene,
  computeNesting,
  createGlyphSetRegistry,
  createPaletteRegistry,
  createStageRegistry,
  createTemplateRegistry,
  glyphFor,
  prototypeModulation,
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
