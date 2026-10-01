import { useRef, useState, type JSX } from 'react';
import { loadProject, reportOf, saveProject, type ProjectState } from '@trefoil/store';

export interface ProjectFileProps {
  readonly project: ProjectState;
  readonly onOpen: (project: ProjectState) => void;
}

function fileNameFor(project: ProjectState): string {
  const stem = project.text.trim().replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${stem === '' ? 'project' : stem.toLowerCase()}.trefoil.json`;
}

export function ProjectFile({ project, onOpen }: ProjectFileProps): JSX.Element {
  const [report, setReport] = useState<string>('');
  const input = useRef<HTMLInputElement>(null);

  const save = (): void => {
    const blob = new Blob([saveProject(project)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileNameFor(project);
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const open = async (file: File): Promise<void> => {
    const result = loadProject(await file.text());
    if (!result.ok) {
      setReport(reportOf(result.problems));
      return;
    }
    setReport('');
    onOpen(result.project);
  };

  return (
    <>
      <button type="button" data-testid="file-save" onClick={save}>
        Save
      </button>
      <button
        type="button"
        data-testid="file-open"
        onClick={() => {
          input.current?.click();
        }}
      >
        Open
      </button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        data-testid="file-input"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file !== undefined) void open(file);
        }}
      />
      <p data-testid="file-report" hidden={report === ''}>
        {report}
      </p>
    </>
  );
}
