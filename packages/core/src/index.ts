import { builtInTemplates } from '@trefoil/templates';

export const CORE_PACKAGE_VERSION = 0 as const;

export const FONT_UNITS_PER_EM = 1000 as const;

export function registeredTemplateCount(): number {
  return builtInTemplates.length;
}
