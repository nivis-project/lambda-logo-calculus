import {
  boundsOfScene,
  groupNode,
  pathNode,
  placeScene,
  resolveParams,
  textNode,
  type Bounds,
  type ParamDef,
  type Scene,
  type SceneNode,
  type Vec2,
} from '@trefoil/core';
import { fileNameFor, type ExportContext, type Exporter } from './exporter.js';
import { sceneToSvg } from './svg.js';
import { DEFAULT_FIT_TOLERANCE } from './fit.js';

export const CLEAR_SPACE_FRACTION = 0.25;

export const SHEET_PAGE: { readonly width: number; readonly height: number } = {
  width: 1200,
  height: 1600,
};

export interface SheetInput {
  readonly title: string;
  readonly mark: Scene;
  readonly side: Scene;
  readonly stacked: Scene;
  readonly colors: readonly string[];
  readonly ink: string;
  readonly paper: string;
}

export interface SheetStyle {
  readonly margin: number;
  readonly headingSize: number;
  readonly labelSize: number;
  readonly rowGap: number;
}

export const SHEET_STYLE: SheetStyle = {
  margin: 80,
  headingSize: 28,
  labelSize: 18,
  rowGap: 56,
};

export function clearSpaceOf(mark: Scene): number {
  const bounds = boundsOfScene(mark);
  return bounds === null ? 0 : bounds.height * CLEAR_SPACE_FRACTION;
}

function rect(x: number, y: number, width: number, height: number, fill: string): SceneNode {
  const contour: Vec2[] = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
  return pathNode([contour], { fill, opacity: 1 });
}

export function clearSpaceFrame(at: Bounds, margin: number, fill: string): readonly SceneNode[] {
  return [
    rect(at.x0 - margin, at.y0 - margin, at.width + 2 * margin, margin, fill),
    rect(at.x0 - margin, at.y1, at.width + 2 * margin, margin, fill),
    rect(at.x0 - margin, at.y0, margin, at.height, fill),
    rect(at.x1, at.y0, margin, at.height, fill),
  ];
}

function fittedPlacement(
  scene: Scene,
  box: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
): { readonly at: Vec2; readonly scale: number } | null {
  const bounds = boundsOfScene(scene);
  if (bounds === null || bounds.width === 0 || bounds.height === 0) return null;

  const scale = Math.min(box.width / bounds.width, box.height / bounds.height);
  return {
    at: [
      box.x + (box.width - bounds.width * scale) / 2 - bounds.x0 * scale,
      box.y + (box.height - bounds.height * scale) / 2 - bounds.y0 * scale,
    ],
    scale,
  };
}

function section(
  scene: Scene,
  heading: string,
  box: { readonly x: number; readonly y: number; readonly width: number; readonly height: number },
  style: SheetStyle,
  ink: string,
): readonly SceneNode[] {
  const nodes: SceneNode[] = [textNode([box.x, box.y], heading, style.headingSize, ink)];
  const inner = {
    x: box.x,
    y: box.y + style.headingSize * 0.6,
    width: box.width,
    height: box.height - style.headingSize * 0.6,
  };
  const placed = fittedPlacement(scene, inner);
  if (placed !== null) nodes.push(placeScene(scene, placed.at, placed.scale));
  return nodes;
}

export function composeSheet(input: SheetInput, style: SheetStyle = SHEET_STYLE): Scene {
  const { margin, headingSize, labelSize, rowGap } = style;
  const width = SHEET_PAGE.width - 2 * margin;
  const rowHeight = (SHEET_PAGE.height - 2 * margin - headingSize * 2 - rowGap * 4) / 4;

  const nodes: SceneNode[] = [
    rect(0, 0, SHEET_PAGE.width, SHEET_PAGE.height, input.paper),
    textNode([margin, margin + headingSize], input.title, headingSize * 1.4, input.ink),
  ];

  let top = margin + headingSize * 2 + rowGap;

  const markBox = { x: margin, y: top, width: width / 2, height: rowHeight };
  nodes.push(...section(input.mark, 'Mark', markBox, style, input.ink));

  const clearBox = { x: margin + width / 2, y: top, width: width / 2, height: rowHeight };
  nodes.push(textNode([clearBox.x, clearBox.y], 'Clear space', headingSize, input.ink));
  const clearInner = {
    x: clearBox.x + rowHeight * CLEAR_SPACE_FRACTION,
    y: clearBox.y + headingSize * 0.6 + rowHeight * CLEAR_SPACE_FRACTION,
    width: clearBox.width - 2 * rowHeight * CLEAR_SPACE_FRACTION,
    height: clearBox.height - headingSize * 0.6 - 2 * rowHeight * CLEAR_SPACE_FRACTION,
  };
  const clearPlaced = fittedPlacement(input.mark, clearInner);
  const markBounds = boundsOfScene(input.mark);
  if (clearPlaced !== null && markBounds !== null) {
    const drawn: Bounds = {
      x0: clearPlaced.at[0] + markBounds.x0 * clearPlaced.scale,
      y0: clearPlaced.at[1] + markBounds.y0 * clearPlaced.scale,
      x1: clearPlaced.at[0] + markBounds.x1 * clearPlaced.scale,
      y1: clearPlaced.at[1] + markBounds.y1 * clearPlaced.scale,
      width: markBounds.width * clearPlaced.scale,
      height: markBounds.height * clearPlaced.scale,
    };
    nodes.push(...clearSpaceFrame(drawn, clearSpaceOf(input.mark) * clearPlaced.scale, input.ink));
    nodes.push(placeScene(input.mark, clearPlaced.at, clearPlaced.scale));
  }

  top += rowHeight + rowGap;
  nodes.push(
    ...section(input.side, 'Lockup, beside', { x: margin, y: top, width, height: rowHeight }, style, input.ink),
  );

  top += rowHeight + rowGap;
  nodes.push(
    ...section(input.stacked, 'Lockup, stacked', { x: margin, y: top, width, height: rowHeight }, style, input.ink),
  );

  top += rowHeight + rowGap;
  nodes.push(textNode([margin, top], 'Palette', headingSize, input.ink));
  const swatchTop = top + headingSize * 0.6;
  const swatchWidth = width / Math.max(1, input.colors.length);
  const swatchHeight = rowHeight - headingSize * 0.6 - labelSize * 1.6;

  for (const [index, color] of input.colors.entries()) {
    const x = margin + index * swatchWidth;
    nodes.push(rect(x, swatchTop, swatchWidth - 8, swatchHeight, color));
    nodes.push(textNode([x, swatchTop + swatchHeight + labelSize * 1.2], color, labelSize, input.ink));
  }

  return {
    viewBox: [0, 0, SHEET_PAGE.width, SHEET_PAGE.height],
    root: groupNode(nodes),
  };
}

export const SHEET_PARAMS: readonly ParamDef[] = [
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
    id: 'ink',
    label: 'Ink',
    kind: 'color',
    default: '#111111',
    lockable: false,
    randomize: false,
    group: 'Export',
  },
  {
    id: 'paper',
    label: 'Paper',
    kind: 'color',
    default: '#ffffff',
    lockable: false,
    randomize: false,
    group: 'Export',
  },
];

export interface SheetContext extends ExportContext {
  readonly sheet?: Omit<SheetInput, 'ink' | 'paper'>;
}

export const brandSheetExporter: Exporter = {
  id: 'brand-sheet',
  version: 1,
  label: 'Brand sheet',
  params: SHEET_PARAMS,
  mediaType: 'image/svg+xml',
  extension: 'sheet.svg',

  run(context) {
    const given = (context as SheetContext).sheet;
    const { values } = resolveParams(SHEET_PARAMS, context.values);
    const tolerance = typeof values['tolerance'] === 'number' ? values['tolerance'] : DEFAULT_FIT_TOLERANCE;
    const ink = String(values['ink'] ?? '#111111');
    const paper = String(values['paper'] ?? '#ffffff');

    const input: SheetInput = {
      title: given?.title ?? context.name,
      mark: given?.mark ?? context.scene,
      side: given?.side ?? context.scene,
      stacked: given?.stacked ?? context.scene,
      colors: given?.colors ?? [],
      ink,
      paper,
    };

    const svg = sceneToSvg(composeSheet(input), 2, { tolerance });
    return Promise.resolve({
      fileName: fileNameFor(context.name, 'sheet.svg'),
      mediaType: 'image/svg+xml',
      bytes: new TextEncoder().encode(svg),
    });
  },
};
