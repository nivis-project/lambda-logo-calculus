import { CORE_PACKAGE_VERSION } from '@trefoil/core';

export const EXPORT_PACKAGE_VERSION = 0 as const;

export function exportFormatStamp(): string {
  return `trefoil-core-${CORE_PACKAGE_VERSION}`;
}

export type { BooleanEngine, Polygon, Ring } from './boolean.js';
export {
  BooleanEngineError,
  SNAP_STEPS,
  createBooleanEngineRegistry,
  polygonClippingEngine,
  signedArea,
  usableRing,
} from './boolean.js';
export { DEFAULT_FIT_TOLERANCE, fitPolygon, fitRing } from './fit.js';
export type { CleanOptions } from './clean.js';
export { cleanPass, cleanPathNode, cleanScene } from './clean.js';
