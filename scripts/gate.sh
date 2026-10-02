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

echo "==> [1/3] build"
pnpm build || fail "the build" "tsc could not compile the workspace. Run 'pnpm build' in the dev shell to see it."

echo "==> [2/3] lint"
pnpm lint || fail "lint" "eslint found something. Run 'pnpm lint' in the dev shell to see it."

echo "==> [3/3] test"
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

echo ""
echo "gate: passed, $PASSED of $TOTAL tests"
