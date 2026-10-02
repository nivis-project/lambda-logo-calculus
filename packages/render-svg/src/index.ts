import type { Contour, Guide, PathNode, Scene, SceneNode, Transform } from '@trefoil/core';

export const GUIDE_COLOR = '#8e9bab';

export const RENDER_SVG_PACKAGE_VERSION = 0 as const;

export function contourToPathData(contour: Contour, decimals = 2): string {
  const first = contour[0];
  if (first === undefined) return '';
  const n = (value: number): string => value.toFixed(decimals);
  const rest = contour.slice(1).map(([x, y]) => `L${n(x)} ${n(y)}`).join('');
  return `M${n(first[0])} ${n(first[1])}${rest}Z`;
}

export function pathData(node: PathNode, decimals = 2): string {
  return node.contours.map((contour) => contourToPathData(contour, decimals)).join('');
}

export function transformToAttribute(transform: Transform): string {
  const parts: string[] = [];
  if (transform.translate !== undefined) {
    parts.push(`translate(${String(transform.translate[0])} ${String(transform.translate[1])})`);
  }
  if (transform.rotate !== undefined) parts.push(`rotate(${String(transform.rotate)})`);
  if (transform.scale !== undefined) {
    parts.push(`scale(${String(transform.scale[0])} ${String(transform.scale[1])})`);
  }
  return parts.join(' ');
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

// Rounding is a statement about what the viewer can see, so it is made in the
// root's coordinate space. A group that scales its children by 400 buys them
// the decimals that scale costs.
export function decimalsAtScale(decimals: number, scale: number): number {
  return scale <= 1 ? decimals : decimals + Math.ceil(Math.log10(scale));
}

function scaleOf(transform: Transform | undefined): number {
  if (transform?.scale === undefined) return 1;
  return Math.max(Math.abs(transform.scale[0]), Math.abs(transform.scale[1]));
}

function render(
  node: SceneNode,
  path: string,
  decimals: number,
  depth: number,
  scale: number,
): string {
  const indent = '  '.repeat(depth);

  if (node.kind === 'path') {
    const rule =
      node.style.fillRule === undefined ? '' : ` fill-rule="${node.style.fillRule}"`;
    const alpha =
      node.style.opacity === 1 ? '' : ` opacity="${String(node.style.opacity)}"`;
    const places = decimalsAtScale(decimals, scale);
    return `${indent}<path id="${path}" d="${pathData(node, places)}" fill="${escapeAttribute(node.style.fill)}"${alpha}${rule}/>`;
  }

  const transform =
    node.transform === undefined
      ? ''
      : ` transform="${escapeAttribute(transformToAttribute(node.transform))}"`;
  const fill = node.fill === undefined ? '' : ` fill="${escapeAttribute(node.fill)}"`;
  const opacity = node.opacity === undefined ? '' : ` opacity="${String(node.opacity)}"`;
  const inner = scale * scaleOf(node.transform);
  const children = node.children
    .map((child, index) => render(child, `${path}-${String(index)}`, decimals, depth + 1, inner))
    .join('\n');

  return `${indent}<g id="${path}"${transform}${fill}${opacity}>\n${children}\n${indent}</g>`;
}

// A guide is drawn at a width that does not grow with the drawing, so it stays
// a hairline however far the viewBox is scaled.
export function guideToSvg(guide: Guide, decimals = 2): string {
  const n = (value: number): string => value.toFixed(decimals);
  const hair = `stroke="${GUIDE_COLOR}" stroke-width="1" vector-effect="non-scaling-stroke"`;

  if (guide.kind === 'box') {
    return `<rect x="${n(guide.x)}" y="${n(guide.y)}" width="${n(guide.width)}" height="${n(guide.height)}" fill="none" ${hair} stroke-opacity="0.5"/>`;
  }

  const dash = guide.dashed ? ' stroke-dasharray="4 4"' : '';
  const line = `<line x1="${n(guide.x0)}" x2="${n(guide.x1)}" y1="${n(guide.y)}" y2="${n(guide.y)}" ${hair}${dash}/>`;
  if (guide.label === undefined) return line;

  return `${line}<text x="3" y="${n(guide.y - 3)}" font-size="8" fill="${GUIDE_COLOR}">${escapeAttribute(guide.label)}</text>`;
}

export function guidesToSvg(scene: Scene, decimals = 2, depth = 1): string {
  if (scene.guides === undefined || scene.guides.length === 0) return '';
  const indent = '  '.repeat(depth);
  const drawn = scene.guides.map((guide) => `${indent}  ${guideToSvg(guide, decimals)}`);
  return `\n${indent}<g id="guides">\n${drawn.join('\n')}\n${indent}</g>`;
}

export function sceneToSvg(scene: Scene, decimals = 2): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${scene.viewBox.map((v) => v.toFixed(decimals)).join(' ')}">`,
    render(scene.root, 'root', decimals, 1, 1) + guidesToSvg(scene, decimals),
    '</svg>',
    '',
  ].join('\n');
}
