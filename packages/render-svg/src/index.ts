import type { PathNode, Scene, SceneNode, Transform } from '@trefoil/core';
import { FONT_UNITS_PER_EM } from '@trefoil/core';

export const RENDER_SVG_PACKAGE_VERSION = 0 as const;

const SVG_NS = 'http://www.w3.org/2000/svg';

export function viewBoxForEm(width: number, height: number): string {
  const scale = FONT_UNITS_PER_EM;
  return `0 0 ${width * scale} ${height * scale}`;
}

export function contourToPathData(contour: readonly (readonly [number, number])[]): string {
  if (contour.length === 0) return '';
  const [first, ...rest] = contour;
  if (first === undefined) return '';
  const head = `M${first[0].toFixed(3)} ${first[1].toFixed(3)}`;
  const tail = rest.map(([x, y]) => `L${x.toFixed(3)} ${y.toFixed(3)}`).join('');
  return `${head}${tail}Z`;
}

export function pathData(node: PathNode): string {
  return node.contours.map(contourToPathData).join('');
}

export function transformToAttribute(transform: Transform): string {
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

export interface Renderer {
  mount(element: Element): void;
  draw(scene: Scene): void;
  readonly idPrefix: string;
}

let instanceCounter = 0;

export function createSvgRenderer(): Renderer {
  const idPrefix = `tsr${++instanceCounter}`;
  let host: Element | undefined;
  let nextId = 0;

  const makeId = (): string => `${idPrefix}-${nextId++}`;

  const buildNode = (document: Document, node: SceneNode): Element => {
    if (node.kind === 'path') {
      const element = document.createElementNS(SVG_NS, 'path');
      element.setAttribute('id', makeId());
      element.setAttribute('d', pathData(node));
      element.setAttribute('fill', node.style.fill);
      element.setAttribute('opacity', String(node.style.opacity));
      if (node.style.fillRule !== undefined) {
        element.setAttribute('fill-rule', node.style.fillRule);
      }
      return element;
    }

    const group = document.createElementNS(SVG_NS, 'g');
    group.setAttribute('id', makeId());
    if (node.transform !== undefined) {
      group.setAttribute('transform', transformToAttribute(node.transform));
    }
    for (const child of node.children) group.append(buildNode(document, child));
    return group;
  };

  return {
    idPrefix,
    mount(element: Element): void {
      host = element;
    },
    draw(scene: Scene): void {
      if (host === undefined) throw new Error('the renderer has not been mounted');
      const document = host.ownerDocument;
      nextId = 0;
      host.replaceChildren();

      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('xmlns', SVG_NS);
      svg.setAttribute('viewBox', scene.viewBox.join(' '));
      svg.append(buildNode(document, scene.root));
      host.append(svg);
    },
  };
}
