#!/bin/bash
# Fix broken HTML tags and MDX syntax issues

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
    echo "This script fixes broken HTML tags and MDX syntax:"
    echo "  - Fix unclosed img tags"
    echo "  - Fix malformed closing tags"
    echo "  - Replace :::details with :::info (Docusaurus compatibility)"
    echo "  - Fix broken self-closing tags"
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

print_status "Fixing broken tags and syntax in: $DOCS_DIR"

# Find all MDX files
MDX_FILES=$(find "$DOCS_DIR" -name "*.mdx" -type f)

if [ -z "$MDX_FILES" ]; then
    print_warning "No MDX files found in $DOCS_DIR"
    exit 0
fi

FILE_COUNT=$(echo "$MDX_FILES" | wc -l)
print_status "Processing $FILE_COUNT MDX files"

PROCESSED=0

while IFS= read -r file; do
    if [ -f "$file" ]; then
        print_status "Processing: $(basename "$file")"
        
        # Fix various tag issues
        sed -i \
            -e 's/<img\([^>]*\) \/$/&>/g' \
            -e 's/<img\([^>]*\) \/$/<img\1 \/>/g' \
            -e 's/:::details/:::info/g' \
            -e 's/<\/$/:::/g' \
            -e 's/< /:::/g' \
            -e 's/<Step[^>]*>/:::info/g' \
            -e 's|</Step>|:::|g' \
            -e 's/<Card[^>]*>/:::note/g' \
            -e 's|</Card>|:::|g' \
            "$file"
        
        ((PROCESSED++))
    fi
done <<< "$MDX_FILES"

print_status "Tag fix completed!"
print_status "Processed: $PROCESSED files"

print_status "🎉 All tags have been fixed!"