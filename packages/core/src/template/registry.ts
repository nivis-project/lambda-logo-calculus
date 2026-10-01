import { RegistryError, createRegistry, type Registry } from '../registry/registry.js';
import type { ShapeTemplate } from './types.js';

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
      inner.register(template);
    },
  };
}
