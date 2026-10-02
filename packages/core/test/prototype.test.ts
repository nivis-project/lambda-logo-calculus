import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const referenceDir = join(here, '..', '..', '..', 'reference');
const prototypePath = join(referenceDir, 'trefoil-type.html');
const digestPath = join(referenceDir, 'DIGEST');

function readOrExplain(path: string, what: string): Buffer {
  try {
    return readFileSync(path);
  } catch {
    throw new Error(
      `${what} is missing at ${path}. The prototype is the authority this project is measured against; without it nothing here means anything.`,
    );
  }
}

function recorded(): { sha256: string; bytes: number } {
  const text = readOrExplain(digestPath, 'the recorded digest').toString('utf8');
  const sha256 = /^sha256\s+([0-9a-f]{64})$/m.exec(text)?.[1];
  const bytes = /^bytes\s+(\d+)$/m.exec(text)?.[1];
  if (sha256 === undefined || bytes === undefined) {
    throw new Error(`${digestPath} does not hold a sha256 line and a bytes line`);
  }
  return { sha256, bytes: Number(bytes) };
}

describe('the frozen prototype', () => {
  it('is the file the digest records', () => {
    const file = readOrExplain(prototypePath, 'the prototype');
    const { sha256, bytes } = recorded();

    expect(
      file.byteLength,
      'the prototype changed size. Every spec written against it and every comparison made with it is now suspect. See reference/README.md.',
    ).toBe(bytes);

    expect(
      createHash('sha256').update(file).digest('hex'),
      'the prototype changed. Every spec written against it and every comparison made with it is now suspect. See reference/README.md.',
    ).toBe(sha256);
  });
});
