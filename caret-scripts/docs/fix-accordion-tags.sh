#!/bin/bash
# Fix AccordionGroup and Accordion tags Script
# Specifically handles remaining AccordionGroup components after main conversion

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    echo "Usage: $0 <docs-directory>"
    echo "Example: $0 ./docs-en"
    echo ""
    echo "This script fixes remaining AccordionGroup and Accordion tags:"
    echo "  - AccordionGroup → :::info"
    echo "  - </AccordionGroup> → :::"
    echo "  - Accordion → :::details"
    echo "  - </Accordion> → :::"
}

if [ $# -eq 0 ]; then
    print_error "No directory specified"
    show_usage
    exit 1
fi

DOCS_DIR="$1"

if [ ! -d "$DOCS_DIR" ]; then
    print_error "Directory '$DOCS_DIR' does not exist"
    exit 1
fi

print_status "Fixing AccordionGroup and Accordion tags in: $DOCS_DIR"

# Find all MDX files with remaining AccordionGroup or Accordion tags
AFFECTED_FILES=$(find "$DOCS_DIR" -name "*.mdx" -exec grep -l "AccordionGroup\|<Accordion" {} \; 2>/dev/null)

if [ -z "$AFFECTED_FILES" ]; then
    print_status "No files with AccordionGroup or Accordion tags found"
    exit 0
fi

FILE_COUNT=$(echo "$AFFECTED_FILES" | wc -l)
print_status "Found $FILE_COUNT files with AccordionGroup/Accordion tags"

# Process each affected file
PROCESSED=0
while IFS= read -r file; do
    if [ -f "$file" ]; then
        print_status "Processing: $(basename "$file")"
        
        # Apply fixes with sed
        sed -i \
            -e 's/<AccordionGroup[^>]*>/:::info/g' \
            -e 's|</AccordionGroup>|:::|g' \
            -e 's/<Accordion[^>]*>/:::details/g' \
            -e 's|</Accordion>|:::|g' \
            "$file"
        
        ((PROCESSED++))
    fi
done <<< "$AFFECTED_FILES"

print_status "AccordionGroup fix completed!"
print_status "Processed: $PROCESSED files"

# Verify the fix worked
print_status "Checking for remaining AccordionGroup/Accordion tags..."
REMAINING=$(find "$DOCS_DIR" -name "*.mdx" -exec grep -l "AccordionGroup\|<Accordion" {} \; 2>/dev/null)

if [ -n "$REMAINING" ]; then
    print_warning "Still found some files with AccordionGroup/Accordion tags:"
    echo "$REMAINING"
    echo ""
    print_warning "Manual review may be needed for complex cases"
else
    print_status "✅ All AccordionGroup and Accordion tags have been fixed!"
fi

print_status "🎉 AccordionGroup fix complete!"