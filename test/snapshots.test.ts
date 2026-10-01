import { describe, expect, it } from 'vitest';
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
  type Scene,
} from '@trefoil/core';
import { builtInShapeTemplates, latinGlyphSet } from '@trefoil/templates';
import { contourToPathData } from '@trefoil/render-svg';

const DEG = Math.PI / 180;
export const TEST_STRING = 'Hamburgefonstiv 0123';

function sceneToSvg(scene: Scene): string {
  const render = (node: Scene['root'] | Scene['root']['children'][number], depth: number): string => {
    const pad = '  '.repeat(depth);
    if (node.kind === 'path') {
      const rule = node.style.fillRule === undefined ? '' : ` fill-rule="${node.style.fillRule}"`;
      return `${pad}<path d="${node.contours.map(contourToPathData).join('')}" fill="${node.style.fill}" opacity="${node.style.opacity}"${rule}/>`;
    }
    const transform =
      node.transform === undefined
        ? ''
        : ` transform="${[
            node.transform.translate === undefined
              ? ''
              : `translate(${node.transform.translate[0]} ${node.transform.translate[1]})`,
            node.transform.rotate === undefined ? '' : `rotate(${node.transform.rotate})`,
            node.transform.scale === undefined
              ? ''
              : `scale(${node.transform.scale[0]} ${node.transform.scale[1]})`,
          ]
            .filter(Boolean)
            .join(' ')}"`;
    const children = node.children.map((child) => render(child, depth + 1)).join('\n');
    return `${pad}<g${transform}>\n${children}\n${pad}</g>`;
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${scene.viewBox.join(' ')}">\n${render(scene.root, 1)}\n</svg>\n`;
}

function sceneFor(templateId: string): Scene {
  const templates = createTemplateRegistry();
  for (const template of builtInShapeTemplates) templates.register(template);

  const glyphSets = createGlyphSetRegistry();
  glyphSets.register(latinGlyphSet);

  const template = templates.get(templateId);
  const { values } = resolveParams(template.params, {});
  const rotation = 24 * DEG;
  const amplitude = typeof values['A'] === 'number' ? values['A'] : 3;

  return buildScene({
    text: TEST_STRING,
    glyphs: glyphSets.get('latin-basic'),
    metrics: GRID,
    template,
    templateParams: values,
    rotation,
    nesting: computeNesting({ template, params: values, rotation, copies: 6, fit: 0 }),
    modulation: prototypeModulation({ amplitude, fit: 0, metrics: GRID }),
    stages: createStageRegistry(),
    ending: roundEnding,
    join: loopJoin,
    palette: createPaletteRegistry().get('analogous'),
    alpha: 0.22,
    shapePen: true,
  });
}

describe('golden snapshots', () => {
  for (const template of builtInShapeTemplates) {
    it(`${template.id} against the test string is unchanged`, async () => {
      const svg = sceneToSvg(sceneFor(template.id));
      await expect(svg).toMatchFileSnapshot(`./snapshots/${template.id}.svg`);
    });
  }

  it('renders the same SVG on every run', () => {
    expect(sceneToSvg(sceneFor('trefoil'))).toBe(sceneToSvg(sceneFor('trefoil')));
  });

  it('uses a test string that exercises the alphabet', () => {
    expect(TEST_STRING).toBe('Hamburgefonstiv 0123');
    for (const character of TEST_STRING.replace(' ', '')) {
      expect(latinGlyphSet.glyphs[character], character).toBeDefined();
    }
  });
});
