import { describe, expect, it } from 'vitest';
import { RegistryError, createRegistry, type Registered } from '../src/index.js';

interface Palette extends Registered {
  readonly colorAt: (index: number) => string;
}

function palette(id: string, version = 1, label = 'A palette'): Palette {
  return { id, version, label, params: [], colorAt: () => '#000' };
}

describe('a registry', () => {
  it('holds a module and gives it back by id', () => {
    const registry = createRegistry<Palette>('palette');
    registry.register(palette('cool'));
    expect(registry.get('cool').id).toBe('cool');
    expect(registry.has('cool')).toBe(true);
    expect(registry.list()).toHaveLength(1);
  });

  it('knows its own kind and says so when it refuses', () => {
    const registry = createRegistry<Palette>('palette');
    expect(registry.kind).toBe('palette');
    expect(() => registry.get('nope')).toThrow(/^palette: /);
    expect(() => registry.get('nope')).toThrow(/"nope"/);
  });

  it('refuses a module missing its identity, naming what is missing', () => {
    const registry = createRegistry<Palette>('palette');
    expect(() => { registry.register({ ...palette('x'), id: '' }); }).toThrow(/without an id/);
    expect(() => { registry.register({ ...palette('x'), version: 1.5 }); }).toThrow(/integer version/);
    expect(() => { registry.register({ ...palette('x'), label: '' }); }).toThrow(/no label/);
  });

  it('refuses a duplicate id and leaves the first in place', () => {
    const registry = createRegistry<Palette>('palette');
    registry.register(palette('cool', 1, 'First'));
    expect(() => { registry.register(palette('cool', 2, 'Second')); }).toThrow(RegistryError);
    expect(() => { registry.register(palette('cool', 2, 'Second')); }).toThrow(/already registered/);
    expect(registry.get('cool').label).toBe('First');
  });

  it('keeps two registries of different kinds apart', () => {
    const palettes = createRegistry<Palette>('palette');
    const endings = createRegistry<Palette>('ending');
    palettes.register(palette('round'));
    expect(endings.has('round')).toBe(false);
    expect(() => endings.get('round')).toThrow(/^ending: /);
  });
});
