import { useCallback, useEffect, useMemo, useState } from 'react';
import { GRID, sampleCurve, type Scene, type Vec2, type WorkingSkeleton } from '@trefoil/core';
import {
  sceneFromProject,
  skeletonsFromProject,
  type ProjectStore,
  type SceneRegistries,
} from '@trefoil/store';
import { SceneView, useSceneImage } from './SceneSymbol.js';
import { useStoreState } from './useStore.js';
import {
  NO_OVERLAYS,
  OVERLAY_IDS,
  overlayNodes,
  withOverlays,
  type OverlayId,
  type OverlayState,
} from './overlays.js';

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
export const SMALL_SIZES = [16, 32, 64, 128] as const;
export const TONES = ['light', 'dark'] as const;

const EMPTY_SCENE: Scene = {
  viewBox: [0, 0, 1, 1],
  root: { kind: 'group', children: [] },
};

const LOCKUPS = [
  { id: 'side', label: 'Horizontal lockup' },
  { id: 'stacked', label: 'Stacked lockup' },
] as const;

export interface AppProps {
  readonly store: ProjectStore;
  readonly registries: SceneRegistries;
}

export function App({ store, registries }: AppProps): JSX.Element {
  const project = useStoreState(store).project;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Vec2>([0, 0]);
  const [overlays, setOverlays] = useState<OverlayState>(NO_OVERLAYS);

  const [wordmarkBase, setWordmarkBase] = useState<Scene>(EMPTY_SCENE);
  const [markBase, setMarkBase] = useState<Scene>(EMPTY_SCENE);

  useEffect(() => {
    let cancelled = false;
    const build = (): void => {
      if (cancelled) return;
      setWordmarkBase(sceneFromProject(project, registries));
      setMarkBase(sceneFromProject({ ...project, text: 'o' }, registries));
    };
    const handle = setTimeout(build, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [project, registries]);

  const skeletons = useMemo((): readonly WorkingSkeleton[] => {
    if (!overlays.skeletons) return [];
    return skeletonsFromProject(project, registries);
  }, [overlays.skeletons, project, registries]);

  const nib = useMemo((): readonly Vec2[] => {
    if (!overlays.nib) return [];
    try {
      return sampleCurve(
        registries.templates.get(project.templateId),
        project.templateParams,
        72,
      ).map(({ x, y }) => [x * GRID.strokeWidth + 20, y * GRID.strokeWidth + 20] as Vec2);
    } catch {
      return [];
    }
  }, [overlays.nib, project.templateId, project.templateParams, registries]);

  const decorate = useCallback(
    (scene: Scene): Scene =>
      withOverlays(
        scene,
        overlayNodes({ scene, overlays, skeletons, nib, width: scene.viewBox[2] }),
      ),
    [overlays, skeletons, nib],
  );

  const wordmark = useMemo(() => decorate(wordmarkBase), [decorate, wordmarkBase]);
  const mark = useMemo(() => decorate(markBase), [decorate, markBase]);
  const previewUrl = useSceneImage(wordmarkBase);

  const zoomBy = useCallback((factor: number) => {
    setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current * factor)));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan([0, 0]);
  }, []);

  const toggleOverlay = useCallback((id: OverlayId) => {
    setOverlays((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomBy(1.25);
        return;
      }
      if (event.key === '-') {
        event.preventDefault();
        zoomBy(1 / 1.25);
        return;
      }
      if (event.key === '0') {
        event.preventDefault();
        resetView();
        return;
      }
      const index = Number(event.key);
      if (Number.isInteger(index) && index >= 1 && index <= OVERLAY_IDS.length) {
        event.preventDefault();
        const id = OVERLAY_IDS[index - 1];
        if (id !== undefined) toggleOverlay(id);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [store, zoomBy, resetView, toggleOverlay]);

  return (
    <div className="studio">
      <header className="top-bar">
        <h1>Trefoil Studio</h1>
        <button type="button" data-testid="undo" disabled={!store.canUndo()} onClick={() => store.undo()}>
          Undo
        </button>
        <button type="button" data-testid="redo" disabled={!store.canRedo()} onClick={() => store.redo()}>
          Redo
        </button>
        <button type="button" data-testid="zoom-in" onClick={() => { zoomBy(1.25); }}>
          Zoom in
        </button>
        <button type="button" data-testid="zoom-out" onClick={() => { zoomBy(1 / 1.25); }}>
          Zoom out
        </button>
        <button type="button" data-testid="reset-view" onClick={resetView}>
          Reset view
        </button>
        <span data-testid="zoom-level">{zoom.toFixed(2)}</span>
      </header>

      <aside className="panel panel-left" data-testid="panel-left">
        <h2>Shape</h2>
        <p data-testid="template-name">{project.templateId}</p>
        <h2>Overlays</h2>
        {OVERLAY_IDS.map((id) => (
          <label className="toggle" key={id}>
            <input
              type="checkbox"
              data-testid={`overlay-${id}`}
              checked={overlays[id]}
              onChange={() => { toggleOverlay(id); }}
            />
            {id}
          </label>
        ))}
      </aside>

      <main
        className="canvas"
        data-testid="canvas"
        onPointerDown={(event) => {
          if (event.button !== 1 && !event.altKey) return;
          const start: Vec2 = [event.clientX - pan[0], event.clientY - pan[1]];
          const move = (next: PointerEvent): void => {
            setPan([next.clientX - start[0], next.clientY - start[1]]);
          };
          const stop = (): void => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', stop);
          };
          window.addEventListener('pointermove', move);
          window.addEventListener('pointerup', stop);
        }}
      >
        <div
          className="artboards"
          data-testid="artboards"
          style={{ transform: `translate(${pan[0]}px, ${pan[1]}px) scale(${zoom})` }}
        >
          <figure className="artboard" data-testid="artboard-mark">
            <figcaption>Mark</figcaption>
            <div className="artboard-stage">
              <SceneView scene={mark} testId="mark-defs" />
            </div>
          </figure>
          {LOCKUPS.map((lockup) => (
            <figure className="artboard" key={lockup.id} data-testid={`artboard-${lockup.id}`}>
              <figcaption>{lockup.label}</figcaption>
              <div className="artboard-stage">
                {lockup.id === 'side' ? (
                  <SceneView scene={wordmark} testId="wordmark-defs" />
                ) : (
                  <img src={previewUrl} alt="" className="artboard-preview" />
                )}
              </div>
            </figure>
          ))}
        </div>
      </main>

      <aside className="panel panel-right" data-testid="panel-right">
        <h2>Letters and lockup</h2>
        <p data-testid="ending-name">{project.endingId}</p>
        <p data-testid="palette-name">{project.paletteId}</p>
        <p data-testid="copies-count">{project.copies}</p>
      </aside>

      <footer className="bottom" data-testid="bottom">
        <div className="text-field">
          <label htmlFor="wordmark-text">Text</label>
          <input
            id="wordmark-text"
            data-testid="text-input"
            value={project.text}
            onChange={(event) => {
              store.dispatch({ kind: 'setText', text: event.target.value });
            }}
          />
        </div>
        <div className="sizes" data-testid="sizes">
          {SMALL_SIZES.map((size) =>
            TONES.map((tone) => (
              <figure
                className={`size-sample ${tone}`}
                key={`${size}-${tone}`}
                data-testid={`size-${size}-${tone}`}
              >
                <img src={previewUrl} alt="" height={size} />
                <figcaption>{`${size} px ${tone}`}</figcaption>
              </figure>
            )),
          )}
        </div>
      </footer>
    </div>
  );
}
