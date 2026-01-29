#!/bin/bash
# CARETI MODIFICATION: JSON test report for AI parsing
# Outputs machine-readable test results

set -e

RESULTS_DIR="/tmp/careti-test-results-json-$(date +%s)"
mkdir -p "$RESULTS_DIR"

# Run unit tests silently
npm run test:unit 2>&1 > "$RESULTS_DIR/unit-tests.txt" || true

# Run webview tests silently
npm run test:webview 2>&1 > "$RESULTS_DIR/webview-tests.txt" || true

# Extract unit test summary
UNIT_PASSING=$(grep -oP '\d+(?= passing)' "$RESULTS_DIR/unit-tests.txt" | tail -1 || echo "0")
UNIT_FAILING=$(grep -oP '\d+(?= failing)' "$RESULTS_DIR/unit-tests.txt" | tail -1 || echo "0")
UNIT_PENDING=$(grep -oP '\d+(?= pending)' "$RESULTS_DIR/unit-tests.txt" | tail -1 || echo "0")

# Extract webview test summary
WEBVIEW_PASSING=$(grep -oP '\d+(?= passed)' "$RESULTS_DIR/webview-tests.txt" | tail -1 || echo "0")
WEBVIEW_FAILING=$(grep -oP '\d+(?= failed)' "$RESULTS_DIR/webview-tests.txt" | grep -v "Test Files" | head -1 || echo "0")

# Get failing test names
FAILING_UNIT_TESTS=$(grep -oP '^\s+\d+\)\s+\K.*' "$RESULTS_DIR/unit-tests.txt" | head -10 | tr '\n' '|' | sed 's/|$//')
FAILING_WEBVIEW_TESTS=$(grep -B 1 "FAIL" "$RESULTS_DIR/webview-tests.txt" | grep -v "FAIL\|--" | head -10 | tr '\n' '|' | sed 's/|$//')

# Output JSON
cat <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "unit": {
    "passing": $UNIT_PASSING,
    "failing": $UNIT_FAILING,
    "pending": $UNIT_PENDING
  },
  "webview": {
    "passing": $WEBVIEW_PASSING,
    "failing": $WEBVIEW_FAILING
  },
  "total": {
    "passing": $((UNIT_PASSING + WEBVIEW_PASSING)),
    "failing": $((UNIT_FAILING + WEBVIEW_FAILING))
  },
  "status": "$([ $((UNIT_FAILING + WEBVIEW_FAILING)) -eq 0 ] && echo 'pass' || echo 'fail')",
  "resultsDir": "$RESULTS_DIR"
}
EOF
