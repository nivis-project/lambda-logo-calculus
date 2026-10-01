import type { ShapeTemplate } from '@trefoil/core';

export interface GalleryProps {
  readonly templates: readonly ShapeTemplate[];
  readonly activeId: string;
  readonly thumbnailFor: (template: ShapeTemplate) => string;
  readonly onChoose: (template: ShapeTemplate) => void;
}

export function Gallery({ templates, activeId, thumbnailFor, onChoose }: GalleryProps): JSX.Element {
  return (
    <section data-testid="gallery">
      <h2>Template</h2>
      <div className="gallery">
        {templates.map((template) => (
          <button
            type="button"
            key={template.id}
            className={template.id === activeId ? 'thumb active' : 'thumb'}
            data-testid={`template-${template.id}`}
            aria-pressed={template.id === activeId}
            onClick={() => { onChoose(template); }}
          >
            <img src={thumbnailFor(template)} alt="" data-testid={`thumb-${template.id}`} />
            <span>{template.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
