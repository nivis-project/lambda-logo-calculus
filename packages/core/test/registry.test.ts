import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { RegistryError, createRegistry, type Registered } from '../src/index.js';

interface Thing extends Registered {
  readonly make: () => string;
}

function thing(id: string): Thing {
  return { id, version: 1, label: `Thing ${id}`, params: [], make: () => id };
}

describe('a module registry', () => {
  it('returns a registered module by its id', () => {
    const r = createRegistry<Thing>('template');
    r.register(thing('trefoil'));
    expect(r.get('trefoil').make()).toBe('trefoil');
    expect(r.has('trefoil')).toBe(true);
  });

  it('rejects a module with no id', () => {
    const r = createRegistry<Thing>('template');
    expect(() => {
      r.register({ ...thing('x'), id: '' });
    }).toThrow(/without an id/);
  });

  it('rejects a module with no integer version', () => {
    const r = createRegistry<Thing>('template');
    expect(() => {
      r.register({ ...thing('x'), version: 1.5 });
    }).toThrow(/no integer version/);
  });

  it('rejects a module with no label', () => {
    const r = createRegistry<Thing>('template');
    expect(() => {
      r.register({ ...thing('x'), label: '' });
    }).toThrow(/has no label/);
  });

  it('rejects a module carrying an invalid parameter, naming both', () => {
    const r = createRegistry<Thing>('template');
    expect(() => {
      r.register({
        ...thing('rose'),
        params: [
          { id: 'k', label: 'Lobes', kind: 'number', min: 2, max: 12, default: 99, lockable: true },
        ],
      });
    }).toThrow(/module "rose" declares an invalid parameter.*parameter "k"/s);
  });

  it('rejects a duplicate id in one registry, naming the id', () => {
    const r = createRegistry<Thing>('template');
    r.register(thing('trefoil'));
    expect(() => {
      r.register(thing('trefoil'));
    }).toThrow(/module "trefoil" is already registered/);
  });

  it('accepts one id in two different registries', () => {
    const templates = createRegistry<Thing>('template');
    const endings = createRegistry<Thing>('ending');
    templates.register(thing('trefoil'));
    expect(() => {
      endings.register(thing('trefoil'));
    }).not.toThrow();
  });

  it('reports a miss naming the id and the registry', () => {
    const r = createRegistry<Thing>('ending');
    try {
      r.get('spur');
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(RegistryError);
      expect((error as RegistryError).registry).toBe('ending');
      expect((error as Error).message).toMatch(/no module with id "spur"/);
    }
    expect(r.find('spur')).toBeUndefined();
    expect(r.has('spur')).toBe(false);
  });

  it('lists everything registered', () => {
    const r = createRegistry<Thing>('palette');
    for (const id of ['warm', 'cool', 'triadic']) r.register(thing(id));
    expect(r.list().map((m) => m.id)).toEqual(['cool', 'triadic', 'warm']);
  });

  it('does not depend on registration order', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 6 }), {
          minLength: 1,
          maxLength: 8,
        }),
        fc.integer({ min: 0, max: 1000 }),
        (ids, shift) => {
          const a = createRegistry<Thing>('x');
          const b = createRegistry<Thing>('x');
          for (const id of ids) a.register(thing(id));
          const rotated = ids.map((_, i) => ids[(i + shift) % ids.length] ?? '');
          for (const id of [...new Set(rotated)]) b.register(thing(id));

          const sameList =
            a.list().map((m) => m.id).join() === b.list().map((m) => m.id).join();
          const sameLookups = ids.every((id) => a.get(id).make() === b.get(id).make());
          return sameList && sameLookups;
        },
      ),
    );
  });
});
