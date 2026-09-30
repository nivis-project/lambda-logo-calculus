import { describe, expect, it } from 'vitest';
// @ts-expect-error the boundary checker is plain ESM with no declarations
import { findCoreBoundaryViolations } from '../scripts/core-boundary.mjs';

describe('core boundary, against the built bundle', () => {
  it('finds no forbidden import, global or clock read', async () => {
    const { fileCount, violations } = await findCoreBoundaryViolations();

    expect(violations).toEqual([]);
    expect(fileCount).toBeGreaterThan(0);
  });
});
