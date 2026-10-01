import type { ParamValues } from '../params/types.js';
import { RegistryError, createRegistry, type Registry } from '../registry/registry.js';
import type { ShapeTemplate } from './types.js';

export function symmetryOf(template: ShapeTemplate, params: ParamValues): number | undefined {
  if (template.symmetryFor !== undefined) return template.symmetryFor(params);
  return template.symmetry;
}

export function createTemplateRegistry(): Registry<ShapeTemplate> {
  const inner = createRegistry<ShapeTemplate>('template');

  return {
    ...inner,
    register(template: ShapeTemplate): void {
      if (template.kind === 'polar' && typeof template.radius !== 'function') {
        throw new RegistryError(
          'template',
          `module "${template.id}" declares kind "polar" but provides no radius function`,
        );
      }
      if (template.kind === 'parametric' && typeof template.point !== 'function') {
        throw new RegistryError(
          'template',
          `module "${template.id}" declares kind "parametric" but provides no point function`,
        );
      }
      if (template.symmetry !== undefined && !Number.isInteger(template.symmetry)) {
        throw new RegistryError(
          'template',
          `module "${template.id}" declares a non-integer symmetry`,
        );
      }
      if (template.symmetry !== undefined && template.symmetryFor !== undefined) {
        throw new RegistryError(
          'template',
          `module "${template.id}" declares both a fixed symmetry and a symmetryFor function`,
        );
      }
      inner.register(template);
    },
  };
}
