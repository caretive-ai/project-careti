#!/bin/bash

# Script to replace 'Cline' strings with 'Caret' in documentation content
# Excludes what-is-caret.mdx files to preserve fork attribution
# Usage: ./cline-to-caret-content-replacer.sh [directory]

TARGET_DIR=${1:-.}

echo "🔄 Starting content replacement from 'Cline' to 'Caret' in: $TARGET_DIR"

# Find all .mdx and .md files, excluding what-is-caret files
find "$TARGET_DIR" -name "*.mdx" -o -name "*.md" | grep -v "what-is-caret" | while read -r file; do
    echo "📝 Processing: $file"
    
    # Use sed to replace various forms of Cline with Caret
    # -i flag modifies files in place
    sed -i 's/\bCline\b/Caret/g' "$file"
    sed -i 's/\bCLINE\b/CARET/g' "$file"
    sed -i 's/\bcline\b/caret/g' "$file"
    
    # Handle specific cases for titles and headers
    sed -i 's/title: "Cline/title: "Caret/g' "$file"
    sed -i 's/# Cline/# Caret/g' "$file"
    sed -i 's/## Cline/## Caret/g' "$file"
    sed -i 's/### Cline/### Caret/g' "$file"
    
    # Handle descriptions and documentation text
    sed -i 's/description: "Cline/description: "Caret/g' "$file"
done

# Process TypeScript files for sidebar configurations
find "$TARGET_DIR" -name "sidebars*.ts" | while read -r file; do
    echo "📝 Processing sidebar: $file"
    
    # Replace references in sidebar labels and IDs
    sed -i "s/'Cline/'Caret/g" "$file"
    sed -i 's/"Cline"/"Caret"/g' "$file"
    sed -i 's/\bCline\b/Caret/g' "$file"
done

# Process configuration files
find "$TARGET_DIR" -name "docusaurus.config.*" | while read -r file; do
    echo "📝 Processing config: $file"
    
    # Replace in configuration titles and descriptions
    sed -i 's/title: .Cline/title: '\''Caret/g' "$file"
    sed -i 's/"Cline"/"Caret"/g' "$file"
    sed -i "s/'Cline'/'Caret'/g" "$file"
done

echo "✅ Content replacement completed!"
echo "ℹ️  Note: what-is-caret.mdx files were excluded to preserve fork attribution"