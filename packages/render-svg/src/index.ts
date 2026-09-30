import { FONT_UNITS_PER_EM } from '@trefoil/core';

export const RENDER_SVG_PACKAGE_VERSION = 0 as const;

export function viewBoxForEm(width: number, height: number): string {
  const scale = FONT_UNITS_PER_EM;
  return `0 0 ${width * scale} ${height * scale}`;
}
