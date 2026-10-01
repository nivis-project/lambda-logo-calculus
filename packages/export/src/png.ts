import { resolveParams, type ParamDef } from '@trefoil/core';
import { DEFAULT_FIT_TOLERANCE } from './fit.js';
import { sceneToSvg } from './svg.js';
import { ExportError, fileNameFor, type Exporter } from './exporter.js';

export const PNG_SCALES = [1, 2, 4] as const;

export const PNG_PARAMS: readonly ParamDef[] = [
  {
    id: 'scale',
    label: 'Scale',
    kind: 'enum',
    options: PNG_SCALES.map(String),
    default: '2',
    lockable: false,
    randomize: false,
    group: 'Export',
  },
  {
    id: 'tolerance',
    label: 'Curve tolerance',
    kind: 'number',
    min: 0.05,
    max: 2,
    step: 0.05,
    default: DEFAULT_FIT_TOLERANCE,
    lockable: false,
    randomize: false,
    group: 'Export',
  },
];

export const pngExporter: Exporter = {
  id: 'png',
  version: 1,
  label: 'PNG',
  params: PNG_PARAMS,
  mediaType: 'image/png',
  extension: 'png',

  async run(context) {
    if (context.rasterise === undefined) {
      throw new ExportError('png', 'no rasteriser was given, and a PNG needs a canvas to draw on');
    }

    const { values } = resolveParams(PNG_PARAMS, context.values);
    const scale = Number(values['scale'] ?? 2);
    const tolerance = typeof values['tolerance'] === 'number' ? values['tolerance'] : DEFAULT_FIT_TOLERANCE;

    const [, , width, height] = context.scene.viewBox;
    const svg = sceneToSvg(context.scene, 3, { tolerance });
    const bytes = await context.rasterise(
      svg,
      Math.max(1, Math.round(width * scale)),
      Math.max(1, Math.round(height * scale)),
    );

    return { fileName: fileNameFor(context.name, 'png'), mediaType: 'image/png', bytes };
  },
};
