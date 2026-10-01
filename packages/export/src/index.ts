import { CORE_PACKAGE_VERSION } from '@trefoil/core';
import { svgExporter } from './svg.js';
import { pngExporter } from './png.js';
import { pdfExporter } from './pdf.js';
import { brandSheetExporter } from './sheet.js';

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

export type { ExportContext, ExportResult, Exporter, Rasteriser } from './exporter.js';
export { ExportError, createExporterRegistry, fileNameFor } from './exporter.js';
export { SVG_PARAMS, TEXT_FONT, sceneToSvg, svgExporter, svgTextFor } from './svg.js';
export { PNG_PARAMS, PNG_SCALES, pngExporter } from './png.js';
export { PDF_PARAMS, escapePdfText, flatPathsOf, pdfExporter, sceneToPdf } from './pdf.js';
export type { SheetContext, SheetInput, SheetStyle } from './sheet.js';
export {
  CLEAR_SPACE_FRACTION,
  SHEET_PAGE,
  SHEET_PARAMS,
  SHEET_STYLE,
  brandSheetExporter,
  clearSpaceFrame,
  clearSpaceOf,
  composeSheet,
} from './sheet.js';

export const BUILT_IN_EXPORTERS = [svgExporter, pngExporter, pdfExporter, brandSheetExporter] as const;
