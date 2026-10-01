import { useMemo, useState, type JSX } from 'react';
import { resolveParams, type ParamValue, type ParamValues, type Scene } from '@trefoil/core';
import { BUILT_IN_EXPORTERS, createExporterRegistry } from '@trefoil/export';
import { ParamPanel } from './ParamPanel.js';
import { browserRasteriser } from '../rasterise.js';

export interface ExportPanelProps {
  readonly scene: Scene;
  readonly name: string;
}

const REGISTRY = createExporterRegistry([...BUILT_IN_EXPORTERS]);

export function ExportPanel({ scene, name }: ExportPanelProps): JSX.Element {
  const [exporterId, setExporterId] = useState('svg');
  const [values, setValues] = useState<ParamValues>({});
  const [report, setReport] = useState('');

  const exporter = useMemo(() => REGISTRY.get(exporterId), [exporterId]);
  const resolved = useMemo(() => resolveParams(exporter.params, values).values, [exporter, values]);

  const run = async (): Promise<void> => {
    try {
      const result = await exporter.run({
        scene,
        values: resolved,
        name,
        rasterise: browserRasteriser(),
      });

      const url = URL.createObjectURL(new Blob([result.bytes], { type: result.mediaType }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.fileName;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setReport('');
    } catch (error) {
      setReport((error as Error).message);
    }
  };

  return (
    <section data-testid="panel-export">
      <h2>Export</h2>
      <label>
        Format
        <select
          data-testid="export-format"
          value={exporterId}
          onChange={(event) => {
            setExporterId(event.target.value);
            setValues({});
            setReport('');
          }}
        >
          {REGISTRY.list().map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
      </label>

      <ParamPanel
        title={exporter.label}
        testId={`export-params-${exporter.id}`}
        defs={exporter.params}
        values={resolved}
        locked={[]}
        onChange={(paramId: string, value: ParamValue) => {
          setValues((before) => ({ ...before, [paramId]: value }));
        }}
        onLock={() => undefined}
      />

      <button type="button" data-testid="export-run" onClick={() => void run()}>
        Export {exporter.label}
      </button>

      <p data-testid="export-report" hidden={report === ''}>
        {report}
      </p>
    </section>
  );
}
