#!/bin/bash
# CARETI MODIFICATION: Test report script for AI-assisted testing
# This script runs all tests and generates a summary report

set -e

echo "========================================"
echo "  Careti Standalone Test Report"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create temp directory for results
RESULTS_DIR="/tmp/careti-test-results-$(date +%s)"
mkdir -p "$RESULTS_DIR"

echo "Running Unit Tests..."
echo "----------------------------------------"
npm run test:unit 2>&1 | tee "$RESULTS_DIR/unit-tests.txt" | tail -20

# Extract unit test summary
UNIT_PASSING=$(grep -oP '\d+(?= passing)' "$RESULTS_DIR/unit-tests.txt" | tail -1 || echo "0")
UNIT_FAILING=$(grep -oP '\d+(?= failing)' "$RESULTS_DIR/unit-tests.txt" | tail -1 || echo "0")
UNIT_PENDING=$(grep -oP '\d+(?= pending)' "$RESULTS_DIR/unit-tests.txt" | tail -1 || echo "0")

echo ""
echo "Running Webview Tests..."
echo "----------------------------------------"
npm run test:webview 2>&1 | tee "$RESULTS_DIR/webview-tests.txt" | tail -20

# Extract webview test summary
WEBVIEW_PASSING=$(grep -oP '\d+(?= passed)' "$RESULTS_DIR/webview-tests.txt" | tail -1 || echo "0")
WEBVIEW_FAILING=$(grep -oP '\d+(?= failed)' "$RESULTS_DIR/webview-tests.txt" | grep -oP '^\d+' | head -1 || echo "0")

echo ""
echo "========================================"
echo "           TEST SUMMARY"
echo "========================================"
echo ""
echo "Unit Tests (mocha):"
echo -e "  ${GREEN}Passing:${NC} $UNIT_PASSING"
echo -e "  ${RED}Failing:${NC} $UNIT_FAILING"
echo -e "  ${YELLOW}Pending:${NC} $UNIT_PENDING"
echo ""
echo "Webview Tests (vitest):"
echo -e "  ${GREEN}Passing:${NC} $WEBVIEW_PASSING"
echo -e "  ${RED}Failing:${NC} $WEBVIEW_FAILING"
echo ""

# Calculate totals
TOTAL_PASSING=$((UNIT_PASSING + WEBVIEW_PASSING))
TOTAL_FAILING=$((UNIT_FAILING + WEBVIEW_FAILING))

echo "----------------------------------------"
echo -e "Total: ${GREEN}$TOTAL_PASSING passed${NC}, ${RED}$TOTAL_FAILING failed${NC}"
echo "----------------------------------------"
echo ""

# List failing tests
if [ "$TOTAL_FAILING" -gt 0 ]; then
    echo "FAILING TESTS:"
    echo "----------------------------------------"

    if [ "$UNIT_FAILING" -gt 0 ]; then
        echo "Unit Test Failures:"
        grep -A 3 "^\s*[0-9]*)" "$RESULTS_DIR/unit-tests.txt" | head -30 || true
    fi

    if [ "$WEBVIEW_FAILING" -gt 0 ]; then
        echo ""
        echo "Webview Test Failures:"
        grep -B 1 "FAIL\|AssertionError" "$RESULTS_DIR/webview-tests.txt" | head -30 || true
    fi
fi

echo ""
echo "Full results saved to: $RESULTS_DIR"
echo "========================================"

# Return non-zero if any tests failed
if [ "$TOTAL_FAILING" -gt 0 ]; then
    exit 1
fi
