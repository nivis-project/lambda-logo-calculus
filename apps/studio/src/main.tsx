import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createProjectStore } from '@trefoil/store';
import { App } from './App.js';
import { createRegistries } from './registries.js';
import { browserStorage } from './storage.js';

const registries = createRegistries();
const store = createProjectStore({ storage: browserStorage() });

Object.assign(window as unknown as Record<string, unknown>, { trefoilStore: store });

const host = document.querySelector('#app');
if (host !== null) {
  createRoot(host).render(
    <StrictMode>
      <App store={store} registries={registries} />
    </StrictMode>,
  );
}
