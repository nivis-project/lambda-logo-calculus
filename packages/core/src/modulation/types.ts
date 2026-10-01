export type ModulationCurve = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'step';

export type NamedTransfer = 'prototypeWidth' | 'prototypeXHeight';

export type ModulationResponse =
  | { readonly kind: 'curve'; readonly curve: ModulationCurve }
  | { readonly kind: 'named'; readonly name: NamedTransfer };

export type NestingField = 'copies' | 'rotation' | 'fit' | 'alpha';

export type ModulationSource =
  | { readonly kind: 'param'; readonly paramId: string }
  | { readonly kind: 'nesting'; readonly field: NestingField }
  | { readonly kind: 'copyIndex' }
  | { readonly kind: 'charPosition' }
  | { readonly kind: 'random'; readonly salt: string };

export type ModulationTarget =
  | { readonly kind: 'widthFactor' }
  | { readonly kind: 'xHeight' }
  | { readonly kind: 'stageParam'; readonly stageId: string; readonly paramId: string };

export interface ModulationEntry {
  readonly id: string;
  readonly source: ModulationSource;
  readonly target: ModulationTarget;
  readonly amount: number;
  readonly response: ModulationResponse;
}

export const CURVES: Readonly<Record<ModulationCurve, (t: number) => number>> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
  step: (t) => (t < 0.5 ? 0 : 1),
};

export const CURVE_NAMES = Object.keys(CURVES) as readonly ModulationCurve[];

export function applyCurve(curve: ModulationCurve, t: number): number {
  return CURVES[curve](Math.min(1, Math.max(0, t)));
}
