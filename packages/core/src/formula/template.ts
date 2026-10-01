import type { NumericParamDef, ParamValues } from '../params/types.js';
import { validateParamDefs } from '../params/validate.js';
import type { Point, ShapeTemplate, TemplateSafety } from '../template/types.js';
import { evaluateFormula } from './evaluate.js';
import { parseFormula, type ParsedFormula } from './parse.js';

export const POLAR_VARIABLE = 'theta';
export const PARAMETRIC_VARIABLE = 't';

export const DEFAULT_CUSTOM_SAFETY: TemplateSafety = {
  minPerfectFit: 0.02,
  maxEffectiveScale: 1.5,
  maxCopyScale: 1.6,
};

export interface CustomTemplateDefinition {
  readonly id: string;
  readonly label: string;
  readonly version?: number;
  readonly kind: 'polar' | 'parametric';
  readonly params: readonly NumericParamDef[];
  readonly radiusFormula?: string;
  readonly xFormula?: string;
  readonly yFormula?: string;
  readonly safety?: TemplateSafety;
}

export interface CustomTemplate extends ShapeTemplate {
  readonly definition: CustomTemplateDefinition;
  readonly parsed: Readonly<Record<string, ParsedFormula>>;
}

function bindingsFor(params: ParamValues, variable: string, value: number): Record<string, number> {
  const bindings: Record<string, number> = { [variable]: value };
  for (const [id, raw] of Object.entries(params)) {
    if (typeof raw === 'number') bindings[id] = raw;
  }
  return bindings;
}

export function buildCustomTemplate(definition: CustomTemplateDefinition): CustomTemplate {
  validateParamDefs(definition.params);

  const names = definition.params.map((p) => p.id);
  const variable = definition.kind === 'polar' ? POLAR_VARIABLE : PARAMETRIC_VARIABLE;
  const allowed = [...names, variable];

  const parsed: Record<string, ParsedFormula> = {};

  if (definition.kind === 'polar') {
    if (definition.radiusFormula === undefined) {
      throw new Error(`custom template "${definition.id}" is polar but declares no radius formula`);
    }
    parsed['radius'] = parseFormula(definition.radiusFormula, allowed);
  } else {
    if (definition.xFormula === undefined || definition.yFormula === undefined) {
      throw new Error(
        `custom template "${definition.id}" is parametric but declares no x and y formulas`,
      );
    }
    parsed['x'] = parseFormula(definition.xFormula, allowed);
    parsed['y'] = parseFormula(definition.yFormula, allowed);
  }

  const evaluateAt = (key: string, params: ParamValues, value: number): number => {
    const formula = parsed[key];
    if (formula === undefined) return 0;
    const result = evaluateFormula(formula, bindingsFor(params, variable, value));
    return result.ok ? result.value : 0;
  };

  const base = {
    id: definition.id,
    version: definition.version ?? 1,
    label: definition.label,
    params: definition.params,
    kind: definition.kind,
    safety: definition.safety ?? DEFAULT_CUSTOM_SAFETY,
    definition,
    parsed,
  };

  return definition.kind === 'polar'
    ? {
        ...base,
        radius: (theta: number, params: ParamValues): number =>
          evaluateAt('radius', params, theta),
      }
    : {
        ...base,
        point: (t: number, params: ParamValues): Point => [
          evaluateAt('x', params, t * Math.PI * 2),
          evaluateAt('y', params, t * Math.PI * 2),
        ],
      };
}
