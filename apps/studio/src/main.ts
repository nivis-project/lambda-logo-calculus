import { sceneToSvg } from '@trefoil/render-svg';
import { createRegistries, defaultProject, logoOf, type Project } from './project.js';
import './studio.css';

const AVAILABLE = 900;

const registries = createRegistries();
const project: Project = defaultProject();

function must<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`the studio could not find ${what}`);
  return value;
}

const app = must(document.querySelector<HTMLDivElement>('#app'), 'its root element');

app.innerHTML = `
  <header class="top">
    <h1>Trefoil Studio</h1>
    <span class="note" data-testid="placement"></span>
  </header>
  <main class="stage" data-testid="stage"></main>
  <footer class="controls">
    <label class="field">
      <span>Text</span>
      <input id="text" data-testid="text-input" type="text" maxlength="80" autocomplete="off" spellcheck="false" />
    </label>
  </footer>
`;

const stage = must(app.querySelector<HTMLElement>('[data-testid="stage"]'), 'the stage');
const placement = must(app.querySelector<HTMLElement>('[data-testid="placement"]'), 'the placement note');
const textField = must(app.querySelector<HTMLInputElement>('#text'), 'the text field');

textField.value = project.text;

// One path. Everything that changes the project calls this and nothing else
// touches the page.
export function redraw(): void {
  if (project.text.trim() === '') {
    stage.innerHTML = '<p class="empty" data-testid="empty">Type something to set it in Trefoil Type.</p>';
    placement.textContent = '';
    return;
  }

  const logo = logoOf(project, registries, AVAILABLE);
  stage.innerHTML = sceneToSvg(logo.scene);
  placement.textContent = `${logo.placement}, ${String(logo.lines.length)} line${logo.lines.length === 1 ? '' : 's'}`;
}

textField.addEventListener('input', () => {
  project.text = textField.value;
  redraw();
});

redraw();
