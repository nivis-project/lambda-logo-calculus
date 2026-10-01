import { describe, expect, it } from 'vitest';
import {
  BUILT_IN_LOCKUPS,
  GRID,
  boundsOfScene,
  createLockupRegistry,
  groupNode,
  pathNode,
  sideLockup,
  stackedLockup,
  type Bounds,
  type LockupInputs,
  type Scene,
} from '../src/index.js';

function sceneOf(contours: readonly (readonly (readonly [number, number])[])[]): Scene {
  return {
    viewBox: [0, 0, 1000, 1000],
    root: groupNode(contours.map((c) => pathNode([c], { fill: '#000', opacity: 1 }))),
  };
}

const MARK: Bounds = { x0: 0, y0: 0, x1: 100, y1: 100, width: 100, height: 100 };

function inputs(overrides: Partial<LockupInputs> = {}): LockupInputs {
  return {
    mark: MARK,
    markScale: 1,
    gap: 20,
    lines: ['Trefoil'],
    lineWidths: [400],
    metrics: GRID,
    ...overrides,
  };
}

describe('measuring a scene', () => {
  it('reports the drawn geometry, not the viewBox', () => {
    const scene = sceneOf([
      [
        [10, 20],
        [40, 20],
        [40, 60],
      ],
    ]);
    expect(boundsOfScene(scene)).toEqual({
      x0: 10,
      y0: 20,
      x1: 40,
      y1: 60,
      width: 30,
      height: 40,
    });
  });

  it('follows group transforms', () => {
    const scene: Scene = {
      viewBox: [0, 0, 100, 100],
      root: groupNode(
        [
          groupNode(
            [
              pathNode(
                [
                  [
                    [0, 0],
                    [10, 0],
                    [10, 10],
                  ],
                ],
                { fill: '#000', opacity: 1 },
              ),
            ],
            { translate: [5, 5] },
          ),
        ],
        { scale: [2, 2] },
      ),
    };
    expect(boundsOfScene(scene)).toMatchObject({ x0: 10, y0: 10, x1: 30, y1: 30 });
  });

  it('reports nothing to place for an empty scene', () => {
    expect(boundsOfScene({ viewBox: [0, 0, 10, 10], root: groupNode([]) })).toBeNull();
  });
});

describe('the lockup registry', () => {
  it('contains exactly side and stacked', () => {
    expect(createLockupRegistry().list().map((l) => l.id)).toEqual(['side', 'stacked']);
    expect(BUILT_IN_LOCKUPS).toHaveLength(2);
  });

  it('is pure', () => {
    for (const lockup of BUILT_IN_LOCKUPS) {
      expect(lockup.place(inputs())).toEqual(lockup.place(inputs()));
    }
  });
});

describe('a placement', () => {
  it('measures downward from the top left, as SVG does', () => {
    const placement = sideLockup.place(inputs({ lines: ['one', 'two'], lineWidths: [400, 300] }));
    expect(placement.markPosition[1]).toBeGreaterThanOrEqual(0);
    expect(placement.textPosition[1]).toBeGreaterThanOrEqual(0);
    expect(Math.max(...placement.baselines)).toBeLessThanOrEqual(placement.height);
  });

  it('carries positions and no geometry', () => {
    for (const lockup of BUILT_IN_LOCKUPS) {
      const placement = lockup.place(inputs());
      expect(Object.keys(placement).sort()).toEqual([
        'baselines',
        'height',
        'lockupId',
        'markPosition',
        'markScale',
        'textPosition',
        'width',
      ]);
      expect(JSON.stringify(placement)).not.toMatch(/contour|fill|opacity/i);
    }
  });

  it('gives one baseline per line, a line height apart', () => {
    for (const lockup of BUILT_IN_LOCKUPS) {
      const placement = lockup.place(inputs({ lines: ['one', 'two'], lineWidths: [400, 300] }));
      expect(placement.baselines).toHaveLength(2);
      expect((placement.baselines[1] ?? 0) - (placement.baselines[0] ?? 0)).toBe(GRID.lineHeight);
    }
  });
});

describe('the side lockup', () => {
  it('puts the mark left of the text', () => {
    const placement = sideLockup.place(inputs());
    const markRight = placement.markPosition[0] + MARK.width * placement.markScale;
    expect(markRight).toBeLessThanOrEqual(placement.textPosition[0]);
  });

  it('widens the space as the gap grows', () => {
    const near = sideLockup.place(inputs({ gap: 10 }));
    const far = sideLockup.place(inputs({ gap: 90 }));
    expect(far.textPosition[0]).toBeGreaterThan(near.textPosition[0]);
  });

  it('is at least as wide as the mark plus the gap plus the longest line', () => {
    const placement = sideLockup.place(inputs());
    expect(placement.width).toBe(100 + 20 + 400);
  });
});

describe('the stacked lockup', () => {
  it('puts the mark above the text', () => {
    const placement = stackedLockup.place(inputs());
    const markBottom = placement.markPosition[1] + MARK.height * placement.markScale;
    expect(markBottom).toBeLessThanOrEqual(placement.textPosition[1]);
  });

  it('centres both on the same axis', () => {
    const placement = stackedLockup.place(inputs());
    const markCentre = placement.markPosition[0] + MARK.width * placement.markScale * 0.5;
    const textCentre = placement.textPosition[0] + 400 * 0.5;
    expect(markCentre).toBeCloseTo(textCentre, 9);
  });

  it('is as wide as the wider of the two', () => {
    expect(stackedLockup.place(inputs({ lineWidths: [40] })).width).toBe(100);
    expect(stackedLockup.place(inputs({ lineWidths: [400] })).width).toBe(400);
  });
});
