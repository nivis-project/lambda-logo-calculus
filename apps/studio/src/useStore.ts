import { useSyncExternalStore } from 'react';
import type { ProjectStore, StoreState } from '@trefoil/store';

export function useStoreState(store: ProjectStore): StoreState {
  return useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getState(),
    () => store.getState(),
  );
}
