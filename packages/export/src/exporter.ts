import { createRegistry, type ParamDef, type ParamValues, type Registry, type Scene } from '@trefoil/core';

export interface Rasteriser {
  (svg: string, width: number, height: number): Promise<Uint8Array>;
}

export interface ExportContext {
  readonly scene: Scene;
  readonly values: ParamValues;
  readonly name: string;
  readonly rasterise?: Rasteriser;
}

export interface ExportResult {
  readonly fileName: string;
  readonly mediaType: string;
  readonly bytes: Uint8Array;
}

export interface Exporter {
  readonly id: string;
  readonly version: number;
  readonly label: string;
  readonly params: readonly ParamDef[];
  readonly mediaType: string;
  readonly extension: string;
  run(context: ExportContext): Promise<ExportResult>;
}

export class ExportError extends Error {
  constructor(exporterId: string, reason: string) {
    super(`the "${exporterId}" export could not run: ${reason}`);
    this.name = 'ExportError';
  }
}

export function fileNameFor(name: string, extension: string): string {
  const stem = name
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `${stem === '' ? 'logo' : stem}.${extension}`;
}

export function createExporterRegistry(exporters: readonly Exporter[] = []): Registry<Exporter> {
  const registry = createRegistry<Exporter>('exporter');
  for (const exporter of exporters) registry.register(exporter);
  return registry;
}
