import type { ParamDef } from '../params/types.js';

export interface Registered {
  readonly id: string;
  readonly version: number;
  readonly label: string;
  readonly params: readonly ParamDef[];
}

export class RegistryError extends Error {
  constructor(
    readonly kind: string,
    reason: string,
  ) {
    super(`${kind}: ${reason}`);
    this.name = 'RegistryError';
  }
}

export interface Registry<T extends Registered> {
  register(module: T): void;
  get(id: string): T;
  has(id: string): boolean;
  list(): readonly T[];
  readonly kind: string;
}

export function createRegistry<T extends Registered>(kind: string): Registry<T> {
  const modules = new Map<string, T>();

  return {
    kind,

    register(module) {
      if (typeof module.id !== 'string' || module.id.length === 0) {
        throw new RegistryError(kind, 'a module was registered without an id');
      }
      if (!Number.isInteger(module.version)) {
        throw new RegistryError(kind, `module "${module.id}" has no integer version`);
      }
      if (typeof module.label !== 'string' || module.label.length === 0) {
        throw new RegistryError(kind, `module "${module.id}" has no label`);
      }
      if (modules.has(module.id)) {
        throw new RegistryError(kind, `module "${module.id}" is already registered`);
      }
      modules.set(module.id, module);
    },

    get(id) {
      const found = modules.get(id);
      if (found === undefined) throw new RegistryError(kind, `no module with the id "${id}"`);
      return found;
    },

    has(id) {
      return modules.has(id);
    },

    list() {
      return [...modules.values()];
    },
  };
}
