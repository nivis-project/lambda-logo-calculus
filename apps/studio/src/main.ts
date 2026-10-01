import {
  GRID,
  buildScene,
  computeNesting,
  createGlyphSetRegistry,
  createPaletteRegistry,
  createStageRegistry,
  createTemplateRegistry,
  loopJoin,
  prototypeModulation,
  resolveParams,
  roundEnding,
} from '@trefoil/core';
import { builtInShapeTemplates, latinGlyphSet } from '@trefoil/templates';
import { createSvgRenderer } from '@trefoil/render-svg';

const DEG = Math.PI / 180;

const templates = createTemplateRegistry();
for (const template of builtInShapeTemplates) templates.register(template);

const glyphSets = createGlyphSetRegistry();
glyphSets.register(latinGlyphSet);

const palettes = createPaletteRegistry();
const stages = createStageRegistry();

const trefoil = templates.get('trefoil');
const { values } = resolveParams(trefoil.params, {});
const rotation = 24 * DEG;
const nesting = computeNesting({ template: trefoil, params: values, rotation, copies: 6, fit: 0 });

const scene = buildScene({
  text: 'Trefoil Type 26',
  glyphs: glyphSets.get('latin-basic'),
  metrics: GRID,
  template: trefoil,
  templateParams: values,
  rotation,
  nesting,
  modulation: prototypeModulation({ amplitude: 3, fit: 0, metrics: GRID }),
  stages,
  ending: roundEnding,
  join: loopJoin,
  palette: palettes.get('analogous'),
  alpha: 0.22,
  shapePen: true,
});

const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  const status = document.createElement('p');
  status.id = 'status';
  status.textContent = [
    `Templates registered: ${templates.list().length}.`,
    `perfectFit: ${nesting.perfectFit.toFixed(4)}.`,
    `Copies: ${nesting.scales.length}.`,
    `Glyph groups: ${scene.root.children.length}.`,
  ].join(' ');

  const canvas = document.createElement('div');
  canvas.id = 'canvas';

  root.append(status, canvas);

  const renderer = createSvgRenderer();
  renderer.mount(canvas);
  renderer.draw(scene);
}
