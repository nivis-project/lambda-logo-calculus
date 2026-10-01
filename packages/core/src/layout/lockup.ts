import type { GridMetrics } from '../glyph/types.js';
import { wrapText, type LayoutMetrics } from './text.js';

export const OPTICAL_ENLARGEMENT = 1.06;

export interface MarkBounds {
  readonly width: number;
  readonly height: number;
}

export interface MarkSettings {
  readonly enabled: boolean;
  readonly distance: number;
  readonly height: number;
  readonly size: number;
}

export interface LockupInput {
  readonly text: string;
  readonly available: number;
  readonly mark: MarkBounds;
  readonly settings: MarkSettings;
  readonly layout: LayoutMetrics;
  readonly metrics: GridMetrics;
}

export interface LockupResult {
  readonly placement: 'none' | 'side' | 'stacked';
  readonly lines: readonly string[];
  readonly markScale: number;
  readonly gap: number;
  readonly reserved: number;
}

function markScaleFor(
  lineCount: number,
  input: LockupInput,
  stacked: boolean,
): number {
  const { metrics, mark, settings } = input;
  const blockHeight = stacked
    ? metrics.capHeight
    : metrics.capHeight + (Math.min(lineCount, 2) - 1) * metrics.lineHeight;
  const byHeight = (blockHeight * OPTICAL_ENLARGEMENT) / mark.height;
  const byWidth = (input.available * (stacked ? 0.6 : 0.3)) / mark.width;
  return Math.min(byHeight, byWidth) * settings.size;
}

export function layoutLockup(input: LockupInput): LockupResult {
  if (!input.settings.enabled) {
    const { lines } = wrapText(input.text, input.available, input.layout);
    return { placement: 'none', lines, markScale: 0, gap: 0, reserved: 0 };
  }

  let lineCount = 1;
  let scale = 0;
  let gap = 0;
  let reserved = 0;
  let lines: readonly string[] = [];
  let brokeMidWord = false;

  for (let iteration = 0; iteration < 4; iteration++) {
    scale = markScaleFor(lineCount, input, false);
    gap = ((scale * input.mark.height) / 2) * (0.6 + 0.8 * input.settings.distance);
    reserved = Math.max(0, input.mark.width * scale + gap);

    const wrapped = wrapText(input.text, Math.max(60, input.available - reserved), input.layout);
    lines = wrapped.lines;
    brokeMidWord = wrapped.brokeMidWord;
    if (lines.length === lineCount) break;
    lineCount = lines.length;
  }

  if (brokeMidWord) {
    const stackedScale = markScaleFor(1, input, true);
    const stacked = wrapText(input.text, input.available, input.layout);
    return {
      placement: 'stacked',
      lines: stacked.lines,
      markScale: stackedScale,
      gap,
      reserved: 0,
    };
  }

  return { placement: 'side', lines, markScale: scale, gap, reserved };
}
