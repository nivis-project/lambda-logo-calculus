import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BUILT_IN_ENDINGS,
  BUILT_IN_JOINS,
  BUILT_IN_PALETTES,
  GRID,
  resolveParams,
  sampleCurve,
  type ParamDef,
  type Scene,
  type ShapeTemplate,
  type Vec2,
  type WorkingSkeleton,
} from '@trefoil/core';
import {
  sceneFromProject,
  skeletonsFromProject,
  type ProjectStore,
  type SceneRegistries,
} from '@trefoil/store';
import { SceneView, sceneToDataUrl, useSceneImage } from './SceneSymbol.js';
import { ParamPanel } from './controls/ParamPanel.js';
import { StageList } from './controls/StageList.js';
import { Gallery } from './controls/Gallery.js';
import { NESTING_PARAMS } from './nestingParams.js';
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

const LETTER_PARAMS: readonly ParamDef[] = [
  {
    id: 'ending',
    label: 'Stroke ending',
    kind: 'enum',
    options: BUILT_IN_ENDINGS.map((e) => e.id),
    default: 'round',
    lockable: true,
    group: 'Letters',
  },
  {
    id: 'join',
    label: 'Join',
    kind: 'enum',
    options: ['none', ...BUILT_IN_JOINS.map((j) => j.id)],
    default: 'loop',
    lockable: true,
    group: 'Letters',
  },
  {
    id: 'palette',
    label: 'Palette',
    kind: 'enum',
    options: BUILT_IN_PALETTES.map((p) => p.id),
    default: 'analogous',
    lockable: true,
    group: 'Colour',
  },
  {
    id: 'shapePen',
    label: 'Shape as pen',
    kind: 'bool',
    default: true,
    lockable: true,
    group: 'Letters',
  },
];

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

  const template = registries.templates.get(project.templateId);
  const ending = BUILT_IN_ENDINGS.find((e) => e.id === project.endingId);

  const thumbnails = useMemo(() => {
    const made = new Map<string, Scene>();
    for (const candidate of registries.templates.list()) {
      made.set(
        candidate.id,
        sceneFromProject(
          {
            ...project,
            templateId: candidate.id,
            templateParams: resolveParams(candidate.params, {}).values,
            text: 'o',
          },
          registries,
        ),
      );
    }
    return made;
  }, [project.copies, project.rotation, project.paletteId, project.shapePen, registries]);

  const thumbnailFor = useCallback(
    (candidate: ShapeTemplate): string => {
      const scene = thumbnails.get(candidate.id);
      return scene === undefined ? '' : sceneToDataUrl(scene);
    },
    [thumbnails],
  );

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
        <p data-testid="template-name" hidden>
          {project.templateId}
        </p>

        <Gallery
          templates={registries.templates.list()}
          activeId={project.templateId}
          thumbnailFor={thumbnailFor}
          onChoose={(chosen) => {
            store.dispatch({
              kind: 'setTemplate',
              templateId: chosen.id,
              params: { ...resolveParams(chosen.params, {}).values },
            });
          }}
        />

        <ParamPanel
          title="Shape"
          testId="panel-template"
          defs={template.params}
          values={project.templateParams}
          locked={project.locked}
          onChange={(paramId, value) => {
            store.dispatch({ kind: 'setTemplateParam', paramId, value });
          }}
          onLock={(paramId, on) => {
            store.dispatch({ kind: 'setLock', paramId, locked: on });
          }}
        />

        <ParamPanel
          title="Nesting"
          testId="panel-nesting"
          defs={NESTING_PARAMS}
          values={{
            copies: project.copies,
            rotation: project.rotation,
            fit: project.fit,
            alpha: project.alpha,
          }}
          locked={project.locked}
          onChange={(paramId, value) => {
            const found = NESTING_PARAMS.find((p) => p.id === paramId);
            if (found !== undefined && typeof value === 'number') {
              store.dispatch({ kind: 'setNumber', field: found.field, value });
            }
          }}
          onLock={(paramId, on) => {
            store.dispatch({ kind: 'setLock', paramId, locked: on });
          }}
        />

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
        <p data-testid="ending-name" hidden>
          {project.endingId}
        </p>
        <p data-testid="palette-name" hidden>
          {project.paletteId}
        </p>
        <p data-testid="copies-count" hidden>
          {project.copies}
        </p>

        <ParamPanel
          title="Letters"
          testId="panel-letters"
          defs={LETTER_PARAMS}
          values={{
            ending: project.endingId,
            join: project.joinId ?? 'none',
            palette: project.paletteId,
            shapePen: project.shapePen,
          }}
          locked={project.locked}
          onChange={(paramId, value) => {
            if (paramId === 'ending' && typeof value === 'string') {
              store.dispatch({ kind: 'setEnding', endingId: value });
            }
            if (paramId === 'join' && typeof value === 'string') {
              store.dispatch({ kind: 'setJoin', joinId: value === 'none' ? null : value });
            }
            if (paramId === 'palette' && typeof value === 'string') {
              store.dispatch({ kind: 'setPalette', paletteId: value });
            }
            if (paramId === 'shapePen' && typeof value === 'boolean') {
              store.dispatch({ kind: 'setShapePen', on: value });
            }
          }}
          onLock={(paramId, on) => {
            store.dispatch({ kind: 'setLock', paramId, locked: on });
          }}
        />

        <ParamPanel
          title="Ending settings"
          testId="panel-ending"
          defs={ending?.params ?? []}
          values={{}}
          locked={project.locked}
          onChange={() => undefined}
          onLock={(paramId, on) => {
            store.dispatch({ kind: 'setLock', paramId, locked: on });
          }}
        />

        <StageList
          entries={project.stages}
          stages={registries.stages.list()}
          onToggle={(stageId, enabled) => {
            store.dispatch({ kind: 'setStageEnabled', stageId, enabled });
          }}
          onReorder={(entries) => {
            store.dispatch({ kind: 'setStages', stages: entries });
          }}
          onParam={(stageId, paramId, value) => {
            store.dispatch({
              kind: 'setStages',
              stages: project.stages.map((entry) =>
                entry.id === stageId
                  ? { ...entry, params: { ...entry.params, [paramId]: value } }
                  : entry,
              ),
            });
          }}
        />
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
