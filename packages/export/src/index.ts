import { CORE_PACKAGE_VERSION } from '@trefoil/core';

export const EXPORT_PACKAGE_VERSION = 0 as const;

export function exportFormatStamp(): string {
  return `trefoil-core-${CORE_PACKAGE_VERSION}`;
}
