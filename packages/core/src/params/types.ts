export type ParamKind = 'number' | 'int' | 'angle' | 'enum' | 'bool' | 'color';

export type ParamValue = number | string | boolean;

export interface RandomizeRange {
  readonly min: number;
  readonly max: number;
}

interface ParamDefBase {
  readonly id: string;
  readonly label: string;
  readonly lockable: boolean;
  readonly group?: string;
  readonly advanced?: boolean;
}

export interface NumericParamDef extends ParamDefBase {
  readonly kind: 'number' | 'int' | 'angle';
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly default: number;
  readonly randomize?: RandomizeRange | false;
}

export interface EnumParamDef extends ParamDefBase {
  readonly kind: 'enum';
  readonly options: readonly string[];
  readonly default: string;
  readonly randomize?: false;
}

export interface BoolParamDef extends ParamDefBase {
  readonly kind: 'bool';
  readonly default: boolean;
  readonly randomize?: false;
}

export interface ColorParamDef extends ParamDefBase {
  readonly kind: 'color';
  readonly default: string;
  readonly randomize?: false;
}

export type ParamDef = NumericParamDef | EnumParamDef | BoolParamDef | ColorParamDef;

export type ParamValues = Readonly<Record<string, ParamValue>>;

export function isNumericParam(def: ParamDef): def is NumericParamDef {
  return def.kind === 'number' || def.kind === 'int' || def.kind === 'angle';
}
