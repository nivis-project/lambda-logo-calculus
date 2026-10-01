import type { ParamDef } from '../params/types.js';
import { validateParamDefs } from '../params/validate.js';

export interface Registered {
  readonly id: string;
  readonly version: number;
  readonly label: string;
  readonly params: readonly ParamDef[];
}

export class RegistryError extends Error {
  readonly registry: string;

  constructor(registry: string, message: string) {
    super(`registry "${registry}": ${message}`);
    this.name = 'RegistryError';
    this.registry = registry;
  }
}

export interface Registry<T extends Registered> {
  readonly kind: string;
  register(module: T): void;
  get(id: string): T;
  find(id: string): T | undefined;
  has(id: string): boolean;
  list(): readonly T[];
}

export function createRegistry<T extends Registered>(kind: string): Registry<T> {
  const modules = new Map<string, T>();

  const register = (module: T): void => {
    if (typeof module.id !== 'string' || module.id.length === 0) {
      throw new RegistryError(kind, 'a module was registered without an id');
    }
    if (!Number.isInteger(module.version)) {
      throw new RegistryError(kind, `module "${module.id}" has no integer version`);
    }
    if (typeof module.label !== 'string' || module.label.length === 0) {
      throw new RegistryError(kind, `module "${module.id}" has no label`);
    }
    try {
      validateParamDefs(module.params);
    } catch (error) {
      throw new RegistryError(
        kind,
        `module "${module.id}" declares an invalid parameter: ${(error as Error).message}`,
      );
    }
    if (modules.has(module.id)) {
      throw new RegistryError(kind, `module "${module.id}" is already registered`);
    }
    modules.set(module.id, module);
  };

  const find = (id: string): T | undefined => modules.get(id);

  const get = (id: string): T => {
    const found = modules.get(id);
    if (found === undefined) {
      throw new RegistryError(kind, `no module with id "${id}"`);
    }
    return found;
  };

  const list = (): readonly T[] =>
    [...modules.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  return { kind, register, get, find, has: (id) => modules.has(id), list };
}
