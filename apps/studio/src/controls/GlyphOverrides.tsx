import { BUILT_IN_ENDINGS, type GlyphPatch } from '@trefoil/core';

export interface GlyphOverridesProps {
  readonly character: string | null;
  readonly patch: GlyphPatch | undefined;
  readonly onChange: (patch: GlyphPatch | null) => void;
  readonly onClose: () => void;
}

export function GlyphOverrides({
  character,
  patch,
  onChange,
  onClose,
}: GlyphOverridesProps): JSX.Element {
  if (character === null) {
    return (
      <section data-testid="glyph-overrides">
        <h2>Glyph</h2>
        <p data-testid="glyph-hint">Click a letter on the canvas to adjust it.</p>
      </section>
    );
  }

  const current = patch ?? {};
  const offset = current.offset ?? [0, 0];

  const update = (next: Partial<GlyphPatch>): void => {
    onChange({ ...current, ...next });
  };

  return (
    <section data-testid="glyph-overrides">
      <h2>
        Glyph <span data-testid="glyph-character">{character}</span>
      </h2>

      <div className="control">
        <div className="control-head">
          <label htmlFor="glyph-dx">Nudge across</label>
          <output data-testid="glyph-dx-value">{offset[0]}</output>
        </div>
        <input
          id="glyph-dx"
          type="range"
          data-testid="glyph-dx"
          min={-40}
          max={40}
          step={1}
          value={offset[0]}
          onChange={(event) => { update({ offset: [Number(event.target.value), offset[1]] }); }}
        />
      </div>

      <div className="control">
        <div className="control-head">
          <label htmlFor="glyph-dy">Nudge up</label>
          <output data-testid="glyph-dy-value">{offset[1]}</output>
        </div>
        <input
          id="glyph-dy"
          type="range"
          data-testid="glyph-dy"
          min={-40}
          max={40}
          step={1}
          value={offset[1]}
          onChange={(event) => { update({ offset: [offset[0], Number(event.target.value)] }); }}
        />
      </div>

      <div className="control">
        <div className="control-head">
          <label htmlFor="glyph-scale">Scale</label>
          <output data-testid="glyph-scale-value">{current.scale ?? 1}</output>
        </div>
        <input
          id="glyph-scale"
          type="range"
          data-testid="glyph-scale"
          min={0.5}
          max={2}
          step={0.01}
          value={current.scale ?? 1}
          onChange={(event) => { update({ scale: Number(event.target.value) }); }}
        />
      </div>

      <div className="control">
        <div className="control-head">
          <label htmlFor="glyph-ending">Ending</label>
        </div>
        <select
          id="glyph-ending"
          data-testid="glyph-ending"
          value={current.endingId ?? 'inherit'}
          onChange={(event) => {
            const value = event.target.value;
            update(value === 'inherit' ? { endingId: undefined } : { endingId: value });
          }}
        >
          <option value="inherit">inherit</option>
          {BUILT_IN_ENDINGS.map((ending) => (
            <option key={ending.id} value={ending.id}>
              {ending.id}
            </option>
          ))}
        </select>
      </div>

      <button type="button" data-testid="glyph-clear" onClick={() => { onChange(null); }}>
        Clear
      </button>
      <button type="button" data-testid="glyph-close" onClick={onClose}>
        Close
      </button>
    </section>
  );
}
