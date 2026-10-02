import {
  DEFAULT_STAGE_LIST,
  GRID,
  buildLogo,
  computeNesting,
  createEndingRegistry,
  createGlyphSetRegistry,
  createPaletteRegistry,
  createStageRegistry,
  createTemplateRegistry,
  modulate,
  type Logo,
  type StageListEntry,
} from '@trefoil/core';

const DEG = Math.PI / 180;

export interface Project {
  text: string;
  templateId: string;
  amplitude: number;
  copies: number;
  rotation: number;
  fit: number;
  alpha: number;
  paletteId: string;
  endingId: string;
  shapePen: boolean;
  stages: StageListEntry[];
  markOn: boolean;
  markDistance: number;
  markHeight: number;
  markSize: number;
  seed: string;
}

export function defaultProject(): Project {
  return {
    text: 'Trefoil Type 26',
    templateId: 'trefoil',
    amplitude: 3,
    copies: 6,
    rotation: 24,
    fit: 0,
    alpha: 0.22,
    paletteId: 'Analogous',
    endingId: 'round',
    shapePen: true,
    stages: DEFAULT_STAGE_LIST.map((entry) => ({ ...entry })),
    markOn: true,
    markDistance: 0,
    markHeight: 0,
    markSize: 1,
    seed: 'trefoil',
  };
}

export interface Registries {
  readonly templates: ReturnType<typeof createTemplateRegistry>;
  readonly glyphSets: ReturnType<typeof createGlyphSetRegistry>;
  readonly palettes: ReturnType<typeof createPaletteRegistry>;
  readonly endings: ReturnType<typeof createEndingRegistry>;
  readonly stages: ReturnType<typeof createStageRegistry>;
}

export function createRegistries(): Registries {
  return {
    templates: createTemplateRegistry(),
    glyphSets: createGlyphSetRegistry(),
    palettes: createPaletteRegistry(),
    endings: createEndingRegistry(),
    stages: createStageRegistry(),
  };
}

// The studio holds no geometry. It resolves what the designer chose and hands
// it to the engine, which is where the parity comparison can see it.
export function logoOf(project: Project, registries: Registries, available: number): Logo {
  const template = registries.templates.get(project.templateId);
  const params = { A: project.amplitude };
  const rotation = project.rotation * DEG;
  const proportions = project.stages.some(
    (entry) => entry.id === 'proportions' && entry.enabled,
  );
  const curves = project.stages.some((entry) => entry.id === 'curves' && entry.enabled);
  const { widthFactor, xHeight } = modulate(project.amplitude, project.fit, GRID, proportions);

  return buildLogo({
    text: project.text,
    available,
    glyphs: registries.glyphSets.get('latin-basic'),
    metrics: GRID,
    template,
    templateParams: params,
    rotation,
    nesting: computeNesting({
      template,
      params,
      rotation,
      copies: project.copies,
      fit: project.fit,
    }),
    widthFactor,
    xHeight,
    stages: registries.stages,
    stageList: project.stages,
    ending: registries.endings.get(project.endingId),
    palette: registries.palettes.get(project.paletteId),
    alpha: project.alpha,
    shapePen: project.shapePen,
    joins: true,
    curvesOn: curves,
    mark: {
      on: project.markOn,
      distance: project.markDistance,
      height: project.markHeight,
      size: project.markSize,
    },
  });
}
