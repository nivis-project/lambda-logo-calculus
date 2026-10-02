import type { Contour, PathNode, Scene, SceneNode, Transform } from '@trefoil/core';

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

export function sceneToSvg(scene: Scene, decimals = 2): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${scene.viewBox.map((v) => v.toFixed(decimals)).join(' ')}">`,
    render(scene.root, 'root', decimals, 1, 1),
    '</svg>',
    '',
  ].join('\n');
}
