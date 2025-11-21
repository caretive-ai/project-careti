#!/bin/bash
# Mintlify to Docusaurus Converter Script
# Converts Mintlify MDX components to Docusaurus-compatible format

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 <docs-directory>"
    echo "Example: $0 ./docs-en"
    echo ""
    echo "This script converts Mintlify MDX components to Docusaurus format:"
    echo "  - Frame → figure"
    echo "  - Tip → :::tip"
    echo "  - Note → :::note"
    echo "  - Warning → :::warning"
    echo "  - Info → :::info"
    echo "  - Caution → :::caution"
    echo "  - Accordion → :::details"
    echo "  - CardGroup → :::info"
    echo "  - Card → :::note"
    echo "  - Removes sidebarTitle (not supported in Docusaurus)"
}

# Check if directory is provided
if [ $# -eq 0 ]; then
    print_error "No directory specified"
    show_usage
    exit 1
fi

DOCS_DIR="$1"

# Check if directory exists
if [ ! -d "$DOCS_DIR" ]; then
    print_error "Directory '$DOCS_DIR' does not exist"
    exit 1
fi

print_status "Starting Mintlify to Docusaurus conversion in: $DOCS_DIR"

# Backup the directory first (to parent directory to avoid recursive copy)
BACKUP_DIR="../$(basename ${DOCS_DIR})_backup_$(date +%Y%m%d_%H%M%S)"
print_status "Creating backup: $BACKUP_DIR"
cp -r "$DOCS_DIR" "$BACKUP_DIR"

# Find all MDX files
MDX_FILES=$(find "$DOCS_DIR" -name "*.mdx" -type f)
FILE_COUNT=$(echo "$MDX_FILES" | wc -l)

if [ -z "$MDX_FILES" ]; then
    print_warning "No MDX files found in $DOCS_DIR"
    exit 0
fi

print_status "Found $FILE_COUNT MDX files to process"

# Counter for processed files
PROCESSED=0

# Process each file
while IFS= read -r file; do
    if [ -f "$file" ]; then
        print_status "Processing: $(basename "$file")"
        
        # Create temporary file
        TEMP_FILE=$(mktemp)
        
        # Apply all conversions in multiple passes to handle edge cases
        # Pass 1: Convert opening tags
        sed \
            -e 's/<Frame[^>]*>/<figure>/g' \
            -e 's/<Tip>/:::tip/g' \
            -e 's/<Note>/:::note/g' \
            -e 's/<Warning>/:::warning/g' \
            -e 's/<Info>/:::info/g' \
            -e 's/<Caution>/:::caution/g' \
            -e 's/<Accordion[^>]*title="[^"]*"[^>]*>/:::details Accordion/g' \
            -e 's/<CardGroup>/:::info/g' \
            -e 's/<Card[^>]*>/:::note/g' \
            "$file" > "$TEMP_FILE"
        
        # Pass 2: Convert closing tags (including any remaining ones)
        sed -i \
            -e 's|</Frame>|</figure>|g' \
            -e 's|</Tip>|:::|g' \
            -e 's|</Note>|:::|g' \
            -e 's|</Warning>|:::|g' \
            -e 's|</Info>|:::|g' \
            -e 's|</Caution>|:::|g' \
            -e 's|</Accordion>|:::|g' \
            -e 's|</CardGroup>|:::|g' \
            -e 's|</Card>|:::|g' \
            -e '/^sidebarTitle:/d' \
            "$TEMP_FILE"
        
        # Replace original file
        mv "$TEMP_FILE" "$file"
        
        ((PROCESSED++))
    fi
done <<< "$MDX_FILES"

print_status "Conversion completed!"
print_status "Processed: $PROCESSED files"
print_status "Backup created at: $BACKUP_DIR"

# Summary of changes made
echo ""
echo -e "${GREEN}=== CONVERSION SUMMARY ===${NC}"
echo "✅ Frame components → HTML figure tags"
echo "✅ Tip components → Docusaurus :::tip admonitions"  
echo "✅ Note components → Docusaurus :::note admonitions"
echo "✅ Warning components → Docusaurus :::warning admonitions"
echo "✅ Info components → Docusaurus :::info admonitions"
echo "✅ Caution components → Docusaurus :::caution admonitions"
echo "✅ Accordion components → Docusaurus :::details admonitions"
echo "✅ CardGroup components → Docusaurus :::info admonitions"
echo "✅ Card components → Docusaurus :::note admonitions"
echo "✅ Removed sidebarTitle properties (not supported in Docusaurus)"
echo ""

# Check for remaining unconverted components
print_status "Checking for remaining Mintlify components..."
REMAINING=$(find "$DOCS_DIR" -name "*.mdx" -exec grep -l "<[A-Z][^>]*>" {} \; | head -5)

if [ -n "$REMAINING" ]; then
    print_warning "Found files that may still have unconverted components:"
    echo "$REMAINING"
    echo ""
    print_warning "You may want to manually review these files"
else
    print_status "No remaining Mintlify components detected!"
fi

echo ""
print_status "🎉 Conversion complete! Your docs are now Docusaurus-ready."
print_status "Remember to test your Docusaurus site: npm start"