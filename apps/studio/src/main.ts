import { registeredTemplateCount } from '@trefoil/core';
import { viewBoxForEm } from '@trefoil/render-svg';

const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  root.textContent = `Trefoil Studio. Templates registered: ${registeredTemplateCount()}. Viewbox: ${viewBoxForEm(1, 1)}`;
}
