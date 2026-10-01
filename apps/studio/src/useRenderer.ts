import { useEffect, useMemo, useRef, useState } from 'react';
import * as Comlink from 'comlink';
import type { ProjectState } from '@trefoil/store';
import { buildScenes, type SceneBuilder, type SceneSet } from './scenes.worker.js';

export function useDragging(): boolean {
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const down = (event: PointerEvent): void => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type === 'range') setDragging(true);
    };
    const up = (): void => {
      setDragging(false);
    };

    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  return dragging;
}

export type Builder = (project: ProjectState, draft: boolean) => Promise<SceneSet>;

export function useSceneBuilder(): Builder {
  const worker = useRef<Worker | null>(null);
  const remote = useRef<Comlink.Remote<SceneBuilder> | null>(null);

  useEffect(() => {
    return () => {
      worker.current?.terminate();
      worker.current = null;
      remote.current = null;
    };
  }, []);

  return useMemo<Builder>(() => {
    return async (project, draft) => {
      if (remote.current === null) {
        try {
          worker.current = new Worker(new URL('./scenes.worker.js', import.meta.url), {
            type: 'module',
          });
          remote.current = Comlink.wrap<SceneBuilder>(worker.current);
        } catch {
          return buildScenes(project, draft);
        }
      }

      try {
        return await remote.current.build(project, draft);
      } catch {
        return buildScenes(project, draft);
      }
    };
  }, []);
}
