import { createRegistry, type Registry } from '../registry/registry.js';
import { builtInTemplates } from './trefoil.js';
import type { ShapeTemplate } from './types.js';

export function createTemplateRegistry(): Registry<ShapeTemplate> {
  const registry = createRegistry<ShapeTemplate>('shape-template');
  for (const template of builtInTemplates) registry.register(template);
  return registry;
}
