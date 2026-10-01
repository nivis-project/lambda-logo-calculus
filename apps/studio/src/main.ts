import { createProjectStore, sceneFromProject } from '@trefoil/store';
import { createSvgRenderer } from '@trefoil/render-svg';
import { createRegistries } from './registries.js';
import { browserStorage } from './storage.js';

const registries = createRegistries();
const store = createProjectStore({ storage: browserStorage() });

const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  const status = document.createElement('p');
  status.id = 'status';

  const canvas = document.createElement('div');
  canvas.id = 'canvas';

  root.append(status, canvas);

  const renderer = createSvgRenderer();
  renderer.mount(canvas);

  const draw = (): void => {
    const project = store.getProject();
    const scene = sceneFromProject(project, registries);
    status.textContent = [
      `Templates registered: ${registries.templates.list().length}.`,
      `Template: ${project.templateId}.`,
      `Copies: ${project.copies}.`,
      `Glyph groups: ${scene.root.children.length}.`,
      `Undo: ${store.canUndo() ? 'yes' : 'no'}.`,
    ].join(' ');
    renderer.draw(scene);
  };

  store.subscribe(draw);
  draw();

  Object.assign(window as unknown as Record<string, unknown>, { trefoilStore: store });
}
