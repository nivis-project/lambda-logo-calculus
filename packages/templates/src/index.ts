export const TEMPLATES_PACKAGE_VERSION = 0 as const;

export interface TemplateManifest {
  readonly id: string;
  readonly version: number;
}

export const builtInTemplates: readonly TemplateManifest[] = [];
