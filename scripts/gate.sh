#!/usr/bin/env bash
# The one gate. Build, lint, test. Each step announced, each stopping the gate.
set -euo pipefail

REPORT="${TMPDIR:-/tmp}/vitest-report.json"

fail() {
  echo ""
  echo "gate: FAILED at $1"
  echo "gate: $2"
  exit 1
}

echo "==> [1/4] build"
pnpm build || fail "the build" "tsc could not compile the workspace. Run 'pnpm build' in the dev shell to see it."

echo "==> [2/4] lint"
pnpm lint || fail "lint" "eslint found something. Run 'pnpm lint' in the dev shell to see it."

echo "==> [3/4] test"
set +e
pnpm exec vitest run --reporter=default --reporter=json --outputFile="$REPORT"
TEST_STATUS=$?
set -e

if [[ ! -f "$REPORT" ]]; then
  fail "test" "the run produced no report at $REPORT, so nothing can be said about it."
fi

COUNTS="$(node -e '
const report = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"));
console.log(`${report.numTotalTests ?? 0} ${report.numPassedTests ?? 0}`);
' "$REPORT")"
TOTAL="${COUNTS% *}"
PASSED="${COUNTS#* }"

if [[ "$TOTAL" -eq 0 ]]; then
  fail "test" "the suite found no tests. A gate that passes an empty project reports a verdict it did not reach. Write a test."
fi

if [[ "$TEST_STATUS" -ne 0 || "$PASSED" -ne "$TOTAL" ]]; then
  fail "test" "$((TOTAL - PASSED)) of $TOTAL tests failed. The run is above."
fi

echo "==> [4/4] coverage"
set +e
pnpm exec vitest run --coverage --reporter=default
COVERAGE_STATUS=$?
set -e

SUMMARY="coverage/coverage-summary.json"
if [[ -f "$SUMMARY" ]]; then
  node -e '
const total = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).total;
const line = (name) => `  ${name.padEnd(11)} ${String(total[name].pct).padStart(6)}%  (${total[name].covered}/${total[name].total})`;
console.log("gate: coverage");
for (const name of ["statements", "branches", "functions", "lines"]) console.log(line(name));
' "$SUMMARY"
fi

if [[ "$COVERAGE_STATUS" -ne 0 ]]; then
  fail "coverage" "coverage fell below a threshold. The figures are above, and the floors are in vitest.config.ts: 70 percent overall, 80 percent on the core. See docs/testing-strategy.md for what the number is and is not evidence of."
fi

echo ""
echo "gate: passed, $PASSED of $TOTAL tests"
