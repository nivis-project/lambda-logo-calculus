import type { ParamDef } from '../params/types.js';
import { createRegistry, type Registered, type Registry } from '../registry/registry.js';
import type { GridMetrics } from '../glyph/types.js';
import type { Vec2 } from '../stage/types.js';
import type { Bounds } from './bounds.js';

export interface LockupInputs {
  readonly mark: Bounds;
  readonly markScale: number;
  readonly gap: number;
  readonly lines: readonly string[];
  readonly lineWidths: readonly number[];
  readonly metrics: GridMetrics;
}

export interface Placement {
  readonly lockupId: string;
  readonly markPosition: Vec2;
  readonly markScale: number;
  readonly textPosition: Vec2;
  readonly baselines: readonly number[];
  readonly width: number;
  readonly height: number;
}

export interface Lockup extends Registered {
  place(inputs: LockupInputs): Placement;
}

function blockHeight(lines: number, metrics: GridMetrics): number {
  return metrics.capHeight + Math.max(0, lines - 1) * metrics.lineHeight;
}

function baselinesFrom(blockTop: number, lines: number, metrics: GridMetrics): readonly number[] {
  return Array.from(
    { length: lines },
    (_, i) => blockTop + metrics.capHeight + i * metrics.lineHeight,
  );
}

const DISTANCE: ParamDef = {
  id: 'distance',
  label: 'Distance',
  kind: 'number',
  min: 0,
  max: 1,
  step: 0.01,
  default: 0,
  lockable: true,
  group: 'Lockup',
};

const SIZE: ParamDef = {
  id: 'size',
  label: 'Mark size',
  kind: 'number',
  min: 0.2,
  max: 3,
  step: 0.01,
  default: 1,
  lockable: true,
  group: 'Lockup',
};

export const sideLockup: Lockup = {
  id: 'side',
  version: 1,
  label: 'Side by side',
  params: [DISTANCE, SIZE],
  place(inputs) {
    const markWidth = inputs.mark.width * inputs.markScale;
    const markHeight = inputs.mark.height * inputs.markScale;
    const lines = Math.max(1, inputs.lines.length);
    const textHeight = blockHeight(lines, inputs.metrics);
    const textLeft = markWidth + inputs.gap;
    const top = Math.max(markHeight, textHeight);

    const textTop = (top - textHeight) / 2;

    return {
      lockupId: 'side',
      markPosition: [0, (top - markHeight) / 2],
      markScale: inputs.markScale,
      textPosition: [textLeft, textTop],
      baselines: baselinesFrom(textTop, lines, inputs.metrics),
      width: textLeft + Math.max(...inputs.lineWidths, 0),
      height: top,
    };
  },
};

export const stackedLockup: Lockup = {
  id: 'stacked',
  version: 1,
  label: 'Stacked',
  params: [DISTANCE, SIZE],
  place(inputs) {
    const markWidth = inputs.mark.width * inputs.markScale;
    const markHeight = inputs.mark.height * inputs.markScale;
    const lines = Math.max(1, inputs.lines.length);
    const textHeight = blockHeight(lines, inputs.metrics);
    const textWidth = Math.max(...inputs.lineWidths, 0);
    const width = Math.max(markWidth, textWidth);

    const textTop = markHeight + inputs.gap;

    return {
      lockupId: 'stacked',
      markPosition: [(width - markWidth) / 2, 0],
      markScale: inputs.markScale,
      textPosition: [(width - textWidth) / 2, textTop],
      baselines: baselinesFrom(textTop, lines, inputs.metrics),
      width,
      height: textTop + textHeight,
    };
  },
};

export const BUILT_IN_LOCKUPS: readonly Lockup[] = [sideLockup, stackedLockup];

export function createLockupRegistry(): Registry<Lockup> {
  const registry = createRegistry<Lockup>('lockup');
  for (const lockup of BUILT_IN_LOCKUPS) registry.register(lockup);
  return registry;
}
