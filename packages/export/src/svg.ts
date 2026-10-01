import {
  curveToPathData,
  resolveParams,
  type ParamDef,
  type PathNode,
  type Scene,
  type SceneNode,
  type Transform,
} from '@trefoil/core';
import { cleanScene, type CleanOptions } from './clean.js';
import { DEFAULT_FIT_TOLERANCE } from './fit.js';
import { fileNameFor, type ExportContext, type Exporter } from './exporter.js';

export const SVG_PARAMS: readonly ParamDef[] = [
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
    id: 'decimals',
    label: 'Decimals',
    kind: 'number',
    min: 1,
    max: 4,
    step: 1,
    default: 2,
    lockable: false,
    randomize: false,
    group: 'Export',
  },
];

function transformAttribute(transform: Transform): string {
  const parts: string[] = [];
  if (transform.translate !== undefined) {
    parts.push(`translate(${transform.translate[0]} ${transform.translate[1]})`);
  }
  if (transform.rotate !== undefined) parts.push(`rotate(${transform.rotate})`);
  if (transform.scale !== undefined) {
    parts.push(`scale(${transform.scale[0]} ${transform.scale[1]})`);
  }
  return parts.join(' ');
}

function pathData(node: PathNode, decimals: number): string {
  if (node.curves !== undefined) {
    return node.curves.map((contour) => curveToPathData(contour, decimals)).join('');
  }
  return node.contours
    .map((contour) => {
      const [first, ...rest] = contour;
      if (first === undefined) return '';
      return `M${first[0].toFixed(decimals)} ${first[1].toFixed(decimals)}${rest
        .map(([x, y]) => `L${x.toFixed(decimals)} ${y.toFixed(decimals)}`)
        .join('')}Z`;
    })
    .join('');
}

export const TEXT_FONT = 'Helvetica, Arial, sans-serif';

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function render(node: SceneNode, path: string, decimals: number, depth: number): string {
  const indent = '  '.repeat(depth);

  if (node.kind === 'path') {
    const rule = node.style.fillRule === undefined ? '' : ` fill-rule="${node.style.fillRule}"`;
    return `${indent}<path id="${path}" d="${pathData(node, decimals)}" fill="${escapeAttribute(node.style.fill)}" opacity="${node.style.opacity}"${rule}/>`;
  }

  if (node.kind === 'text') {
    return `${indent}<text id="${path}" x="${node.at[0].toFixed(decimals)}" y="${node.at[1].toFixed(decimals)}" font-size="${node.size.toFixed(decimals)}" font-family="${TEXT_FONT}" fill="${escapeAttribute(node.fill)}">${escapeText(node.text)}</text>`;
  }

  const transform =
    node.transform === undefined ? '' : ` transform="${escapeAttribute(transformAttribute(node.transform))}"`;
  const glyph =
    node.glyph === undefined
      ? ''
      : ` data-glyph="${escapeAttribute(node.glyph.character)}" data-glyph-index="${node.glyph.index}"`;
  const children = node.children
    .map((child, index) => render(child, `${path}-${index}`, decimals, depth + 1))
    .join('\n');

  return `${indent}<g id="${path}"${transform}${glyph}>\n${children}\n${indent}</g>`;
}

export function sceneToSvg(scene: Scene, decimals = 2, options: CleanOptions = {}): string {
  const cleaned = cleanScene(scene, options);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cleaned.viewBox.join(' ')}">`,
    render(cleaned.root, 'root', decimals, 1),
    '</svg>',
    '',
  ].join('\n');
}

export function svgTextFor(context: ExportContext): string {
  const { values } = resolveParams(SVG_PARAMS, context.values);
  const tolerance = typeof values['tolerance'] === 'number' ? values['tolerance'] : DEFAULT_FIT_TOLERANCE;
  const decimals = typeof values['decimals'] === 'number' ? values['decimals'] : 2;
  return sceneToSvg(context.scene, decimals, { tolerance });
}

export const svgExporter: Exporter = {
  id: 'svg',
  version: 1,
  label: 'SVG',
  params: SVG_PARAMS,
  mediaType: 'image/svg+xml',
  extension: 'svg',

  run(context) {
    return Promise.resolve({
      fileName: fileNameFor(context.name, 'svg'),
      mediaType: 'image/svg+xml',
      bytes: new TextEncoder().encode(svgTextFor(context)),
    });
  },
};
