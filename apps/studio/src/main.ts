import {
  MARK_PARAMS,
  NESTING_PARAMS,
  appearanceParams,
  randomizeParams,
  resolveParams,
  seededRandom,
  type ParamDef,
  type ParamValue,
} from '@trefoil/core';
import { sceneToSvg } from '@trefoil/render-svg';
import { buildControl, refreshControl } from './controls.js';
import { createRegistries, defaultProject, logoOf, type Project } from './project.js';
import './studio.css';

const AVAILABLE = 900;

const registries = createRegistries();
const project: Project = defaultProject();
const locked = new Set<string>();

const FIELD: Readonly<Record<string, keyof Project>> = {
  A: 'amplitude',
  copies: 'copies',
  rotation: 'rotation',
  fit: 'fit',
  alpha: 'alpha',
  paletteId: 'paletteId',
  endingId: 'endingId',
  shapePen: 'shapePen',
  markOn: 'markOn',
  markDistance: 'markDistance',
  markHeight: 'markHeight',
  markSize: 'markSize',
};

// A stage owns parameter names like "samples" and so does another stage, so the
// panel addresses them as "<stage>.<param>".
function scoped(stageId: string, def: ParamDef): ParamDef {
  return { ...def, id: `${stageId}.${def.id}` };
}

const STAGE_PARAMS: readonly ParamDef[] = project.stages.flatMap((entry) =>
  registries.stages.get(entry.id).params.map((def) => scoped(entry.id, def)),
);

const PARAMS: readonly ParamDef[] = [
  ...registries.templates.get(project.templateId).params,
  ...NESTING_PARAMS,
  ...appearanceParams(
    registries.palettes.list().map((palette) => palette.id),
    registries.endings.list().map((ending) => ending.id),
  ),
  ...MARK_PARAMS,
  ...STAGE_PARAMS,
];

project.stages = project.stages.map((entry) => ({
  ...entry,
  params: resolveParams(registries.stages.get(entry.id).params, entry.params ?? {}).values,
}));

function split(id: string): { readonly stage: string; readonly name: string } | null {
  const dot = id.indexOf('.');
  return dot === -1 ? null : { stage: id.slice(0, dot), name: id.slice(dot + 1) };
}

function read(id: string): ParamValue {
  const owner = split(id);
  if (owner !== null) {
    const entry = project.stages.find((item) => item.id === owner.stage);
    const value = entry?.params?.[owner.name];
    if (value === undefined) throw new Error(`the studio shows no parameter "${id}"`);
    return value;
  }

  const field = FIELD[id];
  if (field === undefined) throw new Error(`the studio shows no parameter "${id}"`);
  return project[field] as ParamValue;
}

function set(id: string, value: ParamValue): void {
  const owner = split(id);
  if (owner !== null) {
    project.stages = project.stages.map((item) =>
      item.id === owner.stage
        ? { ...item, params: { ...item.params, [owner.name]: value } }
        : item,
    );
    return;
  }

  const field = FIELD[id];
  if (field === undefined) return;
  (project as unknown as Record<string, ParamValue>)[field] = value;
}

function must<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`the studio could not find ${what}`);
  return value;
}

const app = must(document.querySelector<HTMLDivElement>('#app'), 'its root element');

app.innerHTML = `
  <header class="top">
    <h1>Trefoil Studio</h1>
    <div class="actions">
      <button type="button" data-testid="randomize">Randomize unlocked</button>
      <label class="toggle"><input type="checkbox" data-testid="show-advanced"> Advanced</label>
      <span class="note" data-testid="placement"></span>
    </div>
  </header>
  <main class="stage" data-testid="stage"></main>
  <div class="panel">
    <label class="field">
      <span>Text</span>
      <input id="text" data-testid="text-input" type="text" maxlength="80" autocomplete="off" spellcheck="false" />
    </label>
    <div class="grid" data-testid="controls"></div>
    <fieldset class="stages" data-testid="stages"><legend>What the shape changes</legend></fieldset>
  </div>
`;

const stage = must(app.querySelector<HTMLElement>('[data-testid="stage"]'), 'the stage');
const placement = must(app.querySelector<HTMLElement>('[data-testid="placement"]'), 'the note');
const textField = must(app.querySelector<HTMLInputElement>('#text'), 'the text field');
const panel = must(app.querySelector<HTMLElement>('[data-testid="controls"]'), 'the panel');
const stagesBox = must(app.querySelector<HTMLElement>('[data-testid="stages"]'), 'the stages');
const randomizeButton = must(
  app.querySelector<HTMLButtonElement>('[data-testid="randomize"]'),
  'the randomize button',
);
const advanced = must(
  app.querySelector<HTMLInputElement>('[data-testid="show-advanced"]'),
  'the advanced toggle',
);

textField.value = project.text;

// One path. Everything that changes the project calls this, and nothing else
// touches the drawing.
function redraw(): void {
  if (project.text.trim() === '') {
    stage.innerHTML =
      '<p class="empty" data-testid="empty">Type something to set it in Trefoil Type.</p>';
    placement.textContent = '';
    return;
  }

  const logo = logoOf(project, registries, AVAILABLE);
  stage.innerHTML = sceneToSvg(logo.scene);
  const lines = logo.lines.length;
  placement.textContent = `${logo.placement}, ${String(lines)} line${lines === 1 ? '' : 's'}`;
}

for (const def of PARAMS) {
  panel.append(
    buildControl(def, {
      read,
      write: (id, value) => {
        set(id, value);
        redraw();
      },
      isLocked: (id) => locked.has(id),
      setLocked: (id, on) => {
        if (on) locked.add(id);
        else locked.delete(id);
      },
    }),
  );
}

for (const entry of project.stages) {
  const label = document.createElement('label');
  label.className = 'switch';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = entry.enabled;
  box.setAttribute('data-testid', `stage-${entry.id}`);
  box.addEventListener('change', () => {
    project.stages = project.stages.map((item) =>
      item.id === entry.id ? { ...item, enabled: box.checked } : item,
    );
    redraw();
  });
  label.append(box, document.createTextNode(registries.stages.get(entry.id).label));
  stagesBox.append(label);
}

textField.addEventListener('input', () => {
  project.text = textField.value;
  redraw();
});

advanced.addEventListener('change', () => {
  panel.classList.toggle('show-advanced', advanced.checked);
});

randomizeButton.addEventListener('click', () => {
  const current = Object.fromEntries(PARAMS.map((def) => [def.id, read(def.id)]));
  const next = randomizeParams(PARAMS, current, locked, project.seed);

  for (const def of PARAMS) {
    const value = next[def.id];
    if (value === undefined) continue;
    set(def.id, value);
    refreshControl(def, value, panel);
  }

  // Advance the seed, so a second press is a different variant and every
  // variant can be reached again from the seed that made it.
  project.seed = `${project.seed}/${String(Math.floor(seededRandom(project.seed).next() * 1e9))}`;
  redraw();
});

redraw();
