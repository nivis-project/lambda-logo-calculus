import type { Vec2 } from '../stage/types.js';

export type CurveCommand =
  | { readonly kind: 'move'; readonly to: Vec2 }
  | { readonly kind: 'line'; readonly to: Vec2 }
  | { readonly kind: 'cubic'; readonly c1: Vec2; readonly c2: Vec2; readonly to: Vec2 }
  | { readonly kind: 'close' };

export type CurveContour = readonly CurveCommand[];

export function isWellFormedContour(contour: CurveContour): boolean {
  if (contour.length < 2) return false;
  if (contour[0]?.kind !== 'move') return false;
  if (contour[contour.length - 1]?.kind !== 'close') return false;
  return contour.slice(1, -1).every((command) => command.kind !== 'move' && command.kind !== 'close');
}

function at(command: CurveCommand): readonly Vec2[] {
  switch (command.kind) {
    case 'move':
    case 'line':
      return [command.to];
    case 'cubic':
      return [command.c1, command.c2, command.to];
    case 'close':
      return [];
  }
}

export function curvePoints(contour: CurveContour): readonly Vec2[] {
  return contour.flatMap(at);
}

export function curveToPathData(contour: CurveContour, decimals = 3): string {
  const n = (value: number): string => value.toFixed(decimals);
  return contour
    .map((command) => {
      switch (command.kind) {
        case 'move':
          return `M${n(command.to[0])} ${n(command.to[1])}`;
        case 'line':
          return `L${n(command.to[0])} ${n(command.to[1])}`;
        case 'cubic':
          return `C${n(command.c1[0])} ${n(command.c1[1])} ${n(command.c2[0])} ${n(command.c2[1])} ${n(command.to[0])} ${n(command.to[1])}`;
        case 'close':
          return 'Z';
      }
    })
    .join('');
}
