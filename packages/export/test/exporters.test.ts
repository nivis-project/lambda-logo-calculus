import { describe, expect, it } from 'vitest';
import { groupNode, pathNode, textNode, type Scene, type Vec2 } from '@trefoil/core';
import {
  BUILT_IN_EXPORTERS,
  DEFAULT_FIT_TOLERANCE,
  ExportError,
  PNG_SCALES,
  createExporterRegistry,
  escapePdfText,
  fileNameFor,
  pdfExporter,
  pngExporter,
  sceneToPdf,
  sceneToSvg,
  svgExporter,
  type ExportContext,
  type Exporter,
} from '../src/index.js';

const OUTER: Vec2[] = [
  [0, 0],
  [60, 0],
  [60, 60],
  [0, 60],
];

const COUNTER: Vec2[] = Array.from({ length: 48 }, (_, i): Vec2 => {
  const angle = (2 * Math.PI * i) / 48;
  return [30 + 12 * Math.cos(angle), 30 + 12 * Math.sin(angle)];
});

const SCENE: Scene = {
  viewBox: [0, -70, 80, 90],
  root: groupNode(
    [
      groupNode(
        [
          pathNode([OUTER, COUNTER], { fill: 'hsl(210 70% 50%)', opacity: 0.55, fillRule: 'evenodd' }),
          pathNode([OUTER], { fill: '#ff8800', opacity: 1, fillRule: 'evenodd' }),
        ],
        { translate: [9, 0] },
        { character: 'o', index: 0 },
      ),
    ],
    { scale: [1, -1] },
  ),
};

function context(over: Partial<ExportContext> = {}): ExportContext {
  return { scene: SCENE, values: {}, name: 'Trefoil Type', ...over };
}

const text = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

describe('the exporter registry', () => {
  it('holds every built-in format', () => {
    const registry = createExporterRegistry([...BUILT_IN_EXPORTERS]);
    expect(registry.list().map((exporter) => exporter.id).sort()).toEqual([
      'brand-sheet',
      'pdf',
      'png',
      'svg',
    ]);
  });

  it('refuses a duplicate id', () => {
    const registry = createExporterRegistry([...BUILT_IN_EXPORTERS]);
    expect(() => {
      registry.register(svgExporter);
    }).toThrow(/svg/);
  });

  it('gives each exporter a media type, an extension and parameter definitions', () => {
    for (const exporter of BUILT_IN_EXPORTERS) {
      expect(exporter.mediaType).toMatch(/\//);
      expect(exporter.extension).toMatch(/^[a-z]+(\.[a-z]+)*$/);
      expect(exporter.params.length).toBeGreaterThan(0);
      for (const def of exporter.params) {
        expect(def.id).not.toBe('');
        expect(def.kind).not.toBe('');
        expect(def).toHaveProperty('default');
      }
    }
  });

  it('runs a fourth exporter through the same call', async () => {
    const plain: Exporter = {
      id: 'plain',
      version: 1,
      label: 'Plain',
      params: [],
      mediaType: 'text/plain',
      extension: 'txt',
      run: (given) =>
        Promise.resolve({
          fileName: fileNameFor(given.name, 'txt'),
          mediaType: 'text/plain',
          bytes: new TextEncoder().encode('here'),
        }),
    };

    const registry = createExporterRegistry([...BUILT_IN_EXPORTERS, plain]);
    const result = await registry.get('plain').run(context());
    expect(result.fileName).toBe('trefoil-type.txt');
    expect(text(result.bytes)).toBe('here');
  });

  it('names the file after the project', () => {
    expect(fileNameFor('Trefoil Type 26', 'svg')).toBe('trefoil-type-26.svg');
    expect(fileNameFor('   ', 'png')).toBe('logo.png');
    expect(fileNameFor('!!!', 'pdf')).toBe('logo.pdf');
  });
});

describe('the SVG exporter', () => {
  it('writes the same bytes for the same scene', async () => {
    const first = await svgExporter.run(context());
    const second = await svgExporter.run(context());
    expect(text(first.bytes)).toBe(text(second.bytes));
    expect(first.fileName).toBe('trefoil-type.svg');
    expect(first.mediaType).toBe('image/svg+xml');
  });

  it('uses no mask, no clip path and no use element', () => {
    const svg = sceneToSvg(SCENE);
    expect(svg).not.toMatch(/<mask|<clipPath|<use|clip-path=/);
  });

  it('writes cubic commands and a non-zero fill rule', () => {
    const svg = sceneToSvg(SCENE);
    expect(svg).toMatch(/d="M[^"]*C/);
    expect(svg).toContain('fill-rule="nonzero"');
    expect(svg).not.toContain('fill-rule="evenodd"');
  });

  it('keeps the viewBox, the glyph markers, the fills and the opacities', () => {
    const svg = sceneToSvg(SCENE);
    expect(svg).toContain('viewBox="0 -70 80 90"');
    expect(svg).toContain('data-glyph="o"');
    expect(svg).toContain('data-glyph-index="0"');
    expect(svg).toContain('fill="hsl(210 70% 50%)"');
    expect(svg).toContain('opacity="0.55"');
  });

  it('gives every element an id that comes from where it sits in the scene', () => {
    const svg = sceneToSvg(SCENE);
    expect(svg).toContain('id="root"');
    expect(svg).toContain('id="root-0"');
    expect(svg).toContain('id="root-0-0"');
    expect(svg).toContain('id="root-0-1"');
  });

  it('takes the tolerance and the decimal places from its parameters', async () => {
    const loose = text((await svgExporter.run(context({ values: { tolerance: 2, decimals: 1 } }))).bytes);
    const tight = text((await svgExporter.run(context({ values: { tolerance: 0.05, decimals: 4 } }))).bytes);
    expect(loose.length).toBeLessThan(tight.length);
    expect(loose).toMatch(/d="M[-\d]+\.\d /);
  });
});

describe('the PNG exporter', () => {
  it('offers 1x, 2x and 4x', () => {
    expect(PNG_SCALES).toEqual([1, 2, 4]);
    const scale = pngExporter.params.find((def) => def.id === 'scale');
    expect(scale?.kind).toBe('enum');
    expect(scale?.kind === 'enum' ? scale.options : []).toEqual(['1', '2', '4']);
  });

  it('asks the rasteriser for the scene size times the scale', async () => {
    for (const [scale, expected] of [
      ['1', [80, 90]],
      ['2', [160, 180]],
      ['4', [320, 360]],
    ] as const) {
      const asked: number[] = [];
      await pngExporter.run(
        context({
          values: { scale },
          rasterise: (_svg, width, height) => {
            asked.push(width, height);
            return Promise.resolve(new Uint8Array([137, 80, 78, 71]));
          },
        }),
      );
      expect(asked).toEqual([...expected]);
    }
  });

  it('hands the rasteriser the SVG it would have exported', async () => {
    let given = '';
    const result = await pngExporter.run(
      context({
        rasterise: (svg) => {
          given = svg;
          return Promise.resolve(new Uint8Array([137, 80, 78, 71]));
        },
      }),
    );
    expect(given).toContain('<svg');
    expect(given).toContain('data-glyph="o"');
    expect(result.fileName).toBe('trefoil-type.png');
    expect([...result.bytes]).toEqual([137, 80, 78, 71]);
  });

  it('refuses when there is no rasteriser, and says what is missing', async () => {
    await expect(pngExporter.run(context())).rejects.toThrow(ExportError);
    await expect(pngExporter.run(context())).rejects.toThrow(/rasteriser/);
  });
});

describe('the PDF exporter', () => {
  const pdf = (): string => text(sceneToPdf(SCENE, DEFAULT_FIT_TOLERANCE, 1));

  it('opens with a header and ends with the end-of-file marker', () => {
    const written = pdf();
    expect(written.startsWith('%PDF-1.7')).toBe(true);
    expect(written.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('points its cross-reference table at every object', () => {
    const written = pdf();
    const table = /xref\n0 (\d+)\n([\s\S]*?)trailer/.exec(written);
    if (table === null) throw new Error('no cross-reference table');

    const count = Number(table[1]);
    const rows = (table[2] ?? '').trimEnd().split('\n');
    expect(rows).toHaveLength(count);

    for (const [index, row] of rows.entries()) {
      if (index === 0) {
        expect(row).toBe('0000000000 65535 f ');
        continue;
      }
      const offset = Number(row.slice(0, 10));
      expect(written.slice(offset)).toMatch(new RegExp(`^${index} 0 obj`));
    }

    const startxref = /startxref\n(\d+)/.exec(written);
    expect(written.slice(Number(startxref?.[1]))).toMatch(/^xref/);
  });

  it('writes a page sized from the scene', () => {
    expect(pdf()).toContain('/MediaBox [0 0 80.000 90.000]');
    expect(text(sceneToPdf(SCENE, DEFAULT_FIT_TOLERANCE, 2))).toContain('/MediaBox [0 0 160.000 180.000]');
  });

  it('holds path operators and no image', () => {
    const written = pdf();
    expect(written).toMatch(/\d+\.\d+ \d+\.\d+ m\n/);
    expect(written).toMatch(/ c\n/);
    expect(written).toContain('\nf\n');
    expect(written).not.toMatch(/\/Subtype\s*\/Image|\/XObject|BI\s/);
  });

  it('carries the opacity as a graphics state rather than in the colour', () => {
    const written = pdf();
    expect(written).toMatch(/\/GS\d+ << \/Type \/ExtGState \/ca 0\.550 \/CA 0\.550 >>/);
    expect(written).toMatch(/\/GS\d+ gs/);
  });

  it('writes the palette colour as device RGB', () => {
    const written = pdf();
    expect(written).toContain('1.000 0.533 0.000 rg');
  });

  it('runs through the exporter interface', async () => {
    const result = await pdfExporter.run(context());
    expect(result.fileName).toBe('trefoil-type.pdf');
    expect(result.mediaType).toBe('application/pdf');
    expect(text(result.bytes).startsWith('%PDF')).toBe(true);
  });
});

describe('text in an export', () => {
  const withText: Scene = {
    viewBox: [0, 0, 200, 100],
    root: groupNode([
      pathNode([OUTER], { fill: '#000000', opacity: 1 }),
      textNode([12, 40], 'Palette (cool) \\ 50%', 18, '#223344'),
    ]),
  };

  it('writes the string into the SVG at its position', () => {
    const svg = sceneToSvg(withText);
    expect(svg).toContain('<text id="root-1" x="12.00" y="40.00" font-size="18.00"');
    expect(svg).toContain('fill="#223344"');
    expect(svg).toContain('Palette (cool) \\ 50%');
  });

  it('names a standard font in the PDF and shows the string', () => {
    const written = text(sceneToPdf(withText, 0.2, 1));
    expect(written).toContain('/Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >>');
    expect(written).toContain('/F1 18.000 Tf');
    expect(written).toContain('Tj');
  });

  it('undoes the page flip so the text is the right way up', () => {
    expect(text(sceneToPdf(withText, 0.2, 1))).toMatch(/1 0 0 -1 12\.000 40\.000 Tm/);
  });

  it('escapes a bracket and a backslash', () => {
    const written = text(sceneToPdf(withText, 0.2, 1));
    expect(written).toContain('(Palette \\(cool\\) \\\\ 50%) Tj');
    expect(escapePdfText('a(b)c\\d')).toBe('a\\(b\\)c\\\\d');
  });
});
