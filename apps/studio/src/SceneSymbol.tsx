import { useEffect, useRef, useState } from 'react';
import type { Scene } from '@trefoil/core';
import { createSvgRenderer } from '@trefoil/render-svg';

export interface SceneViewProps {
  readonly scene: Scene;
  readonly testId?: string;
}

export function SceneView({ scene, testId }: SceneViewProps): JSX.Element {
  const host = useRef<HTMLDivElement>(null);
  const renderer = useRef<ReturnType<typeof createSvgRenderer>>(null);

  useEffect(() => {
    if (host.current === null) return;
    const created = createSvgRenderer();
    created.mount(host.current);
    renderer.current = created;
  }, []);

  useEffect(() => {
    renderer.current?.draw(scene);
  }, [scene]);

  return <div ref={host} data-testid={testId} />;
}

export function sceneToDataUrl(scene: Scene): string {
  const host = document.createElement('div');
  const renderer = createSvgRenderer();
  renderer.mount(host);
  renderer.draw(scene);

  const svg = host.querySelector('svg');
  if (svg === null) return '';
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
}

export function useSceneImage(scene: Scene): string {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(sceneToDataUrl(scene));
  }, [scene]);

  return url;
}
