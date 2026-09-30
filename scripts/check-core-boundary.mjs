#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CORE_DIST = join(ROOT, 'packages/core/dist');
const TEMPLATES_DIST = join(ROOT, 'packages/templates/dist');

const FORBIDDEN_SPECIFIERS = [
  'react',
  'react-dom',
  '@trefoil/render-svg',
  '@trefoil/export',
];

const FORBIDDEN_GLOBALS = [
  'document',
  'window',
  'navigator',
  'localStorage',
  'sessionStorage',
  'HTMLElement',
  'SVGElement',
  'requestAnimationFrame',
];

const FORBIDDEN_CALLS = [
  ['Math.random', /\bMath\s*\.\s*random\s*\(/],
  ['Date.now', /\bDate\s*\.\s*now\s*\(/],
  ['new Date', /\bnew\s+Date\s*\(/],
];

async function collectJs(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectJs(full)));
    } else if (entry.name.endsWith('.js')) {
      out.push(full);
    }
  }
  return out;
}

function stripCommentsAndStrings(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/`(?:\\.|[^`\\])*`/g, '``');
}

function importSpecifiers(source) {
  const found = [];
  const patterns = [
    /\bimport\s[^;]*?\sfrom\s*['"]([^'"]+)['"]/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
    /\bexport\s[^;]*?\sfrom\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1] !== undefined) found.push(match[1]);
    }
  }
  return found;
}

function contextAround(source, index) {
  const start = Math.max(0, index - 40);
  const end = Math.min(source.length, index + 40);
  return source.slice(start, end).replace(/\s+/g, ' ').trim();
}

const violations = [];

const files = [...(await collectJs(CORE_DIST)), ...(await collectJs(TEMPLATES_DIST))];

if (files.length === 0) {
  console.error('core-boundary: no built output found. Run pnpm build first.');
  process.exit(1);
}

for (const file of files) {
  const raw = await readFile(file, 'utf8');
  const code = stripCommentsAndStrings(raw);
  const shown = relative(ROOT, file);

  for (const specifier of importSpecifiers(raw)) {
    const bare = specifier.replace(/\/.*$/, '').replace(/^(@[^/]+\/[^/]+).*$/, '$1');
    if (FORBIDDEN_SPECIFIERS.includes(bare) || /render-|\/apps\//.test(specifier)) {
      violations.push(`${shown}: forbidden import "${specifier}"`);
    }
  }

  for (const name of FORBIDDEN_GLOBALS) {
    const pattern = new RegExp(`(?<![.\\w$])${name}(?![\\w$])`, 'g');
    for (const match of code.matchAll(pattern)) {
      violations.push(
        `${shown}: forbidden global "${name}" at ...${contextAround(code, match.index)}...`,
      );
    }
  }

  for (const [label, pattern] of FORBIDDEN_CALLS) {
    for (const match of code.matchAll(new RegExp(pattern.source, 'g'))) {
      violations.push(
        `${shown}: forbidden call "${label}" at ...${contextAround(code, match.index)}...`,
      );
    }
  }
}

const entry = join(CORE_DIST, 'index.js');
for (const name of ['document', 'window', 'HTMLElement', 'SVGElement']) {
  if (name in globalThis) {
    violations.push(`"${name}" exists in this process, so the DOM-free load proves nothing`);
  }
}

try {
  const loaded = await import(pathToFileURL(entry).href);
  if (typeof loaded.CORE_PACKAGE_VERSION !== 'number') {
    violations.push('the built core loaded, but CORE_PACKAGE_VERSION is not readable');
  }
} catch (error) {
  violations.push(`the built core failed to load in a DOM-free Node process: ${String(error)}`);
}

if (violations.length > 0) {
  console.error(`core-boundary: ${violations.length} violation(s)`);
  for (const line of violations) console.error(`  ${line}`);
  process.exit(1);
}

console.log(`core-boundary: ${files.length} built file(s) clean, core loads without a DOM`);
