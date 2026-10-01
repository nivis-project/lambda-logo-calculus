import {
  resolveParams,
  rgbOf,
  type CurveContour,
  type ParamDef,
  type Scene,
  type SceneNode,
  type Transform,
  type Vec2,
} from '@trefoil/core';
import { cleanScene } from './clean.js';
import { DEFAULT_FIT_TOLERANCE } from './fit.js';
import { fileNameFor, type Exporter } from './exporter.js';

export const PDF_PARAMS: readonly ParamDef[] = [
  {
    id: 'tolerance',
    label: 'Curve tolerance',
    kind: 'number',
    min: 0.05,
    max: 2,
    step: 0.05,
    default: DEFAULT_FIT_TOLERANCE,
    lockable: false,
    randomize: false,
    group: 'Export',
  },
  {
    id: 'pageScale',
    label: 'Points per font unit',
    kind: 'number',
    min: 0.25,
    max: 8,
    step: 0.25,
    default: 1,
    lockable: false,
    randomize: false,
    group: 'Export',
  },
];

type Matrix = readonly [number, number, number, number, number, number];

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function multiply(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

function matrixOf(transform: Transform | undefined): Matrix {
  if (transform === undefined) return IDENTITY;
  let matrix = IDENTITY;
  if (transform.translate !== undefined) {
    matrix = multiply(matrix, [1, 0, 0, 1, transform.translate[0], transform.translate[1]]);
  }
  if (transform.rotate !== undefined) {
    const radians = (transform.rotate * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    matrix = multiply(matrix, [cos, sin, -sin, cos, 0, 0]);
  }
  if (transform.scale !== undefined) {
    matrix = multiply(matrix, [transform.scale[0], 0, 0, transform.scale[1], 0, 0]);
  }
  return matrix;
}

function moved(point: Vec2, matrix: Matrix): Vec2 {
  return [
    matrix[0] * point[0] + matrix[2] * point[1] + matrix[4],
    matrix[1] * point[0] + matrix[3] * point[1] + matrix[5],
  ];
}

interface FlatPath {
  readonly contours: readonly CurveContour[];
  readonly fill: string;
  readonly opacity: number;
}

function flatten(node: SceneNode, matrix: Matrix, out: FlatPath[]): void {
  if (node.kind === 'group') {
    const inner = multiply(matrix, matrixOf(node.transform));
    for (const child of node.children) flatten(child, inner, out);
    return;
  }

  const contours = (node.curves ?? []).map((contour) =>
    contour.map((command) => {
      switch (command.kind) {
        case 'move':
          return { kind: 'move' as const, to: moved(command.to, matrix) };
        case 'line':
          return { kind: 'line' as const, to: moved(command.to, matrix) };
        case 'cubic':
          return {
            kind: 'cubic' as const,
            c1: moved(command.c1, matrix),
            c2: moved(command.c2, matrix),
            to: moved(command.to, matrix),
          };
        case 'close':
          return { kind: 'close' as const };
      }
    }),
  );

  if (contours.length === 0) return;
  out.push({ contours, fill: node.style.fill, opacity: node.style.opacity });
}

export function flatPathsOf(scene: Scene): readonly FlatPath[] {
  const out: FlatPath[] = [];
  flatten(scene.root, IDENTITY, out);
  return out;
}

function contentFor(paths: readonly FlatPath[], states: ReadonlyMap<number, string>): string {
  const n = (value: number): string => value.toFixed(3);
  const lines: string[] = [];

  for (const path of paths) {
    const [r, g, b] = rgbOf(path.fill);
    lines.push('q');
    const state = states.get(path.opacity);
    if (state !== undefined) lines.push(`/${state} gs`);
    lines.push(`${n(r)} ${n(g)} ${n(b)} rg`);

    for (const contour of path.contours) {
      for (const command of contour) {
        if (command.kind === 'move') lines.push(`${n(command.to[0])} ${n(command.to[1])} m`);
        else if (command.kind === 'line') lines.push(`${n(command.to[0])} ${n(command.to[1])} l`);
        else if (command.kind === 'cubic') {
          lines.push(
            `${n(command.c1[0])} ${n(command.c1[1])} ${n(command.c2[0])} ${n(command.c2[1])} ${n(command.to[0])} ${n(command.to[1])} c`,
          );
        } else lines.push('h');
      }
    }

    lines.push('f');
    lines.push('Q');
  }

  return lines.join('\n');
}

export function sceneToPdf(scene: Scene, tolerance: number, pageScale: number): Uint8Array {
  const cleaned = cleanScene(scene, { tolerance });
  const paths = flatPathsOf(cleaned);

  const [vx, vy, vw, vh] = cleaned.viewBox;
  const width = vw * pageScale;
  const height = vh * pageScale;

  const opacities = [...new Set(paths.map((path) => path.opacity))].sort((a, b) => a - b);
  const states = new Map<number, string>(opacities.map((value, index) => [value, `GS${index}`]));

  const extGState = opacities
    .map((value, index) => `/GS${index} << /Type /ExtGState /ca ${value.toFixed(3)} /CA ${value.toFixed(3)} >>`)
    .join(' ');

  const page = [
    'q',
    `${pageScale} 0 0 ${-pageScale} ${-vx * pageScale} ${(vy + vh) * pageScale} cm`,
    contentFor(paths, states),
    'Q',
    '',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width.toFixed(3)} ${height.toFixed(3)}] /Resources << /ExtGState << ${extGState} >> >> /Contents 4 0 R >>`,
    `<< /Length ${page.length} >>\nstream\n${page}endstream`,
  ];

  let body = '%PDF-1.7\n';
  const offsets: number[] = [];
  for (const [index, object] of objects.entries()) {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }

  const startxref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    body += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return new TextEncoder().encode(body);
}

export const pdfExporter: Exporter = {
  id: 'pdf',
  version: 1,
  label: 'PDF',
  params: PDF_PARAMS,
  mediaType: 'application/pdf',
  extension: 'pdf',

  run(context) {
    const { values } = resolveParams(PDF_PARAMS, context.values);
    const tolerance = typeof values['tolerance'] === 'number' ? values['tolerance'] : DEFAULT_FIT_TOLERANCE;
    const pageScale = typeof values['pageScale'] === 'number' ? values['pageScale'] : 1;

    return Promise.resolve({
      fileName: fileNameFor(context.name, 'pdf'),
      mediaType: 'application/pdf',
      bytes: sceneToPdf(context.scene, tolerance, pageScale),
    });
  },
};
