import { isNumericParam, type ParamDef, type ParamValue } from '@trefoil/core';

export interface ControlHandlers {
  readonly read: (id: string) => ParamValue;
  readonly write: (id: string, value: ParamValue) => void;
  readonly isLocked: (id: string) => boolean;
  readonly setLocked: (id: string, locked: boolean) => void;
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

function format(def: ParamDef, value: ParamValue): string {
  if (!isNumericParam(def)) return String(value);
  const places = def.kind === 'int' ? 0 : (def.step ?? 0.01) < 0.1 ? 2 : 1;
  return def.kind === 'angle'
    ? `${Number(value).toFixed(places)}°`
    : Number(value).toFixed(places);
}

function inputFor(def: ParamDef, value: ParamValue): HTMLInputElement | HTMLSelectElement {
  if (isNumericParam(def)) {
    const slider = element('input', {
      type: 'range',
      'data-control': def.id,
      'data-testid': `slider-${def.id}`,
      min: String(def.min),
      max: String(def.max),
      step: String(def.step ?? (def.kind === 'int' ? 1 : 0.01)),
    });
    slider.value = String(value);
    return slider;
  }

  if (def.kind === 'enum') {
    const select = element('select', {
      'data-control': def.id,
      'data-testid': `select-${def.id}`,
    });
    for (const option of def.options) {
      const item = element('option', { value: option });
      item.textContent = option;
      select.append(item);
    }
    select.value = String(value);
    return select;
  }

  const box = element('input', {
    type: 'checkbox',
    'data-control': def.id,
    'data-testid': `check-${def.id}`,
  });
  box.checked = value === true;
  return box;
}

function valueOf(def: ParamDef, field: HTMLInputElement | HTMLSelectElement): ParamValue {
  if (isNumericParam(def)) return Number(field.value);
  if (def.kind === 'enum') return field.value;
  return field instanceof HTMLInputElement && field.checked;
}

// A control is a reading of a declaration. Nothing here knows a range, a
// default or a step: those live with the parameter, in one place.
export function buildControl(def: ParamDef, handlers: ControlHandlers): HTMLElement {
  const wrap = element('div', {
    class: `control${def.advanced === true ? ' advanced' : ''}`,
    'data-testid': `control-${def.id}`,
  });

  const row = element('div', { class: 'control-row' });
  const label = element('label');
  label.textContent = def.label;

  const reading = element('output', { 'data-testid': `value-${def.id}` });
  reading.textContent = format(def, handlers.read(def.id));

  row.append(label, reading);

  if (def.lockable) {
    const lock = element('label', { class: 'lock' });
    const box = element('input', { type: 'checkbox', 'data-testid': `lock-${def.id}` });
    box.checked = handlers.isLocked(def.id);
    box.addEventListener('change', () => {
      handlers.setLocked(def.id, box.checked);
    });
    lock.append(box, document.createTextNode('Lock'));
    row.append(lock);
  }

  const reset = element('button', {
    type: 'button',
    class: 'reset',
    'data-testid': `reset-${def.id}`,
    title: `Reset ${def.label}`,
  });
  reset.textContent = 'Reset';
  row.append(reset);

  const field = inputFor(def, handlers.read(def.id));

  const apply = (value: ParamValue): void => {
    handlers.write(def.id, value);
    reading.textContent = format(def, value);
  };

  field.addEventListener('input', () => {
    apply(valueOf(def, field));
  });
  field.addEventListener('change', () => {
    apply(valueOf(def, field));
  });

  reset.addEventListener('click', () => {
    field.value = String(def.default);
    if (field instanceof HTMLInputElement && field.type === 'checkbox') {
      field.checked = def.default === true;
    }
    apply(def.default);
  });

  wrap.append(row, field);
  return wrap;
}

export function refreshControl(def: ParamDef, value: ParamValue, root: ParentNode): void {
  const field = root.querySelector<HTMLInputElement | HTMLSelectElement>(
    `[data-control="${def.id}"]`,
  );
  const reading = root.querySelector<HTMLElement>(`[data-testid="value-${def.id}"]`);
  if (field === null || reading === null) return;

  if (field instanceof HTMLInputElement && field.type === 'checkbox') field.checked = value === true;
  else field.value = String(value);

  reading.textContent = format(def, value);
}
