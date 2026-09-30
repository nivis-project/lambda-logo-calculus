#!/usr/bin/env node
import { findCoreBoundaryViolations } from './core-boundary.mjs';

const { fileCount, violations } = await findCoreBoundaryViolations();

if (violations.length > 0) {
  console.error(`core-boundary: ${violations.length} violation(s)`);
  for (const line of violations) console.error(`  ${line}`);
  process.exit(1);
}

console.log(`core-boundary: ${fileCount} built file(s) clean, core loads without a DOM`);
