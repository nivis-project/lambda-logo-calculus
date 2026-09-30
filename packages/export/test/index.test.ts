import { describe, expect, it } from 'vitest';
import { EXPORT_PACKAGE_VERSION, exportFormatStamp } from '../src/index.js';

describe('export package', () => {
  it('declares its version', () => {
    expect(EXPORT_PACKAGE_VERSION).toBe(0);
  });

  it('stamps the core version it was built against', () => {
    expect(exportFormatStamp()).toBe('trefoil-core-0');
  });
});
