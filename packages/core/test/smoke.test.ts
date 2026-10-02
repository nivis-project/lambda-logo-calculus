// Scaffolding. This test proves the toolchain compiles TypeScript, that the
// runner finds a test and that the gate goes green for the right reason. It
// says nothing about the product. Delete it when you write the first real test
// in this package. Required by name in openspec change add-nix-flake-and-gate,
// task 2.5.
import { describe, expect, it } from 'vitest';
import { CORE_PACKAGE_VERSION } from '../src/index.js';

describe('the toolchain', () => {
  it('compiles TypeScript, finds this file and runs it', () => {
    expect(CORE_PACKAGE_VERSION).toBe(0);
  });
});
