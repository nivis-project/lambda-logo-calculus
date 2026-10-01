import { createTemplateRegistry, resolveParams, computeNesting } from '@trefoil/core';
import { builtInShapeTemplates } from '@trefoil/templates';
import { viewBoxForEm } from '@trefoil/render-svg';

const templates = createTemplateRegistry();
for (const template of builtInShapeTemplates) {
  templates.register(template);
}

const trefoil = templates.get('trefoil');
const { values } = resolveParams(trefoil.params, {});
const nesting = computeNesting({
  template: trefoil,
  params: values,
  rotation: (24 * Math.PI) / 180,
  copies: 6,
  fit: 0,
});

const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  root.textContent = [
    'Trefoil Studio.',
    `Templates registered: ${templates.list().length}.`,
    `perfectFit: ${nesting.perfectFit.toFixed(4)}.`,
    `Viewbox: ${viewBoxForEm(1, 1)}`,
  ].join(' ');
}
