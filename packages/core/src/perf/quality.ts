export interface SampleQuality {
  readonly id: string;
  readonly label: string;
  readonly supportEntries: number;
  readonly penSamples: number;
  readonly ringSteps: number;
  readonly joinSamples: number;
  readonly fitSamples: number;
}

export const FULL_QUALITY: SampleQuality = {
  id: 'full',
  label: 'Full',
  supportEntries: 360,
  penSamples: 144,
  ringSteps: 64,
  joinSamples: 72,
  fitSamples: 720,
};

export const DRAFT_QUALITY: SampleQuality = {
  id: 'draft',
  label: 'Draft',
  supportEntries: 120,
  penSamples: 48,
  ringSteps: 24,
  joinSamples: 24,
  fitSamples: 180,
};

export const QUALITIES: readonly SampleQuality[] = [FULL_QUALITY, DRAFT_QUALITY];
