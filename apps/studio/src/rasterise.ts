import type { Rasteriser } from '@trefoil/export';

export function browserRasteriser(): Rasteriser {
  return async (svg, width, height) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    try {
      const image = new Image(width, height);
      await new Promise<void>((resolve, reject) => {
        image.onload = () => {
          resolve();
        };
        image.onerror = () => {
          reject(new Error('the browser could not read the SVG it was given'));
        };
        image.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context === null) throw new Error('this browser gave no 2d canvas context');
      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });
      if (blob === null) throw new Error('the canvas produced no PNG');
      return new Uint8Array(await blob.arrayBuffer());
    } finally {
      URL.revokeObjectURL(url);
    }
  };
}
