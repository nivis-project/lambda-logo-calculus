import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  GRID,
  buildScene,
  computeNesting,
  createGlyphSetRegistry,
  createPaletteRegistry,
  createStageRegistry,
  createTemplateRegistry,
  curveToPathData,
  isWellFormedContour,
  loopJoin,
  prototypeModulation,
  resolveParams,
  roundEnding,
  type PathNode,
  type Scene,
  type SceneNode,
  type Vec2,
} from '@trefoil/core';
import { builtInShapeTemplates, latinGlyphSet } from '@trefoil/templates';
import { DEFAULT_FIT_TOLERANCE, cleanPass, cleanScene, fitPolygon } from '@trefoil/export';

const DEG = Math.PI / 180;
const WORD = 'Hamburgefonstiv';

interface Settings {
  readonly amplitude: number;
  readonly rotation: number;
  readonly copies: number;
  readonly text?: string;
}

function sceneFor(settings: Settings): Scene {
  const templates = createTemplateRegistry();
  for (const template of builtInShapeTemplates) templates.register(template);

  const glyphSets = createGlyphSetRegistry();
  glyphSets.register(latinGlyphSet);

  const template = templates.get('trefoil');
  const { values } = resolveParams(template.params, { A: settings.amplitude });
  const rotation = settings.rotation * DEG;

  return buildScene({
    text: settings.text ?? WORD,
    glyphs: glyphSets.get('latin-basic'),
    metrics: GRID,
    template,
    templateParams: values,
    rotation,
    nesting: computeNesting({
      template,
      params: values,
      rotation,
      copies: settings.copies,
      fit: 0,
    }),
    modulation: prototypeModulation({ amplitude: settings.amplitude, fit: 0, metrics: GRID }),
    stages: createStageRegistry(),
    ending: roundEnding,
    join: loopJoin,
    palette: createPaletteRegistry().get('analogous'),
    alpha: 0.22,
    shapePen: true,
  });
}

function pathNodesOf(node: SceneNode): readonly PathNode[] {
  return node.kind === 'path' ? [node] : node.children.flatMap(pathNodesOf);
}

function polylineData(contour: readonly Vec2[]): string {
  const [first, ...rest] = contour;
  if (first === undefined) return '';
  return `M${first[0].toFixed(3)} ${first[1].toFixed(3)}${rest
    .map(([x, y]) => `L${x.toFixed(3)} ${y.toFixed(3)}`)
    .join('')}Z`;
}

const DEFAULT_SCENE = sceneFor({ amplitude: 3, rotation: 24, copies: 1 });

describe('cleaning a real wordmark', () => {
  it('returns well formed rings for every pass of every glyph', () => {
    for (const node of pathNodesOf(DEFAULT_SCENE.root)) {
      for (const polygon of cleanPass(node.contours)) {
        for (const ring of polygon) {
          expect(ring.length).toBeGreaterThanOrEqual(4);
          expect(ring[0]).toEqual(ring[ring.length - 1]);
          const distinct = new Set(ring.map(([x, y]) => `${x},${y}`));
          expect(distinct.size).toBeGreaterThanOrEqual(3);
          for (const [x, y] of ring) {
            expect(Number.isFinite(x)).toBe(true);
            expect(Number.isFinite(y)).toBe(true);
          }
        }
      }
    }
  });

  it('stays well formed over random settings', { timeout: 120_000 }, () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.5, max: 9, noNaN: true }),
        fc.double({ min: 0, max: 180, noNaN: true }),
        fc.integer({ min: 1, max: 3 }),
        (amplitude, rotation, copies) => {
          const scene = sceneFor({ amplitude, rotation, copies, text: 'eagn' });
          for (const node of pathNodesOf(scene.root)) {
            for (const polygon of cleanPass(node.contours)) {
              for (const ring of polygon) {
                expect(ring.length).toBeGreaterThanOrEqual(4);
                expect(ring[0]).toEqual(ring[ring.length - 1]);
                for (const [x, y] of ring) {
                  expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
                }
              }
            }
          }
        },
      ),
      { numRuns: 60 },
    );
  });
});

describe('fitting a real wordmark', () => {
  const measured = (() => {
    let points = 0;
    let segments = 0;
    let polylineBytes = 0;
    let curveBytes = 0;

    for (const node of pathNodesOf(DEFAULT_SCENE.root)) {
      for (const contour of node.contours) polylineBytes += polylineData(contour).length;
      for (const polygon of cleanPass(node.contours)) {
        const fitted = fitPolygon(polygon);
        for (const ring of polygon) points += ring.length;
        for (const contour of fitted) {
          segments += contour.length - 2;
          curveBytes += curveToPathData(contour).length;
        }
      }
    }

    return { points, segments, polylineBytes, curveBytes };
  })();

  it('holds fewer than half as many segments as the rings hold points', () => {
    expect(measured.segments).toBeLessThan(measured.points / 2);
  });

  it('writes less path data than the polylines it replaces', () => {
    expect(measured.curveBytes).toBeLessThan(measured.polylineBytes);
  });

  it('is measured at the figures the testing strategy records', () => {
    expect(measured.points).toBe(8581);
    expect(measured.segments).toBe(2212);
    expect(measured.polylineBytes).toBe(107297);
    expect(measured.curveBytes).toBe(76350);
    expect(DEFAULT_FIT_TOLERANCE).toBe(0.2);
  });

  it('writes a path that opens with a move and closes with a close', () => {
    for (const node of pathNodesOf(cleanScene(DEFAULT_SCENE).root)) {
      for (const contour of node.curves ?? []) {
        expect(isWellFormedContour(contour)).toBe(true);
      }
    }
  });
});
