#!/bin/bash
# Script to resolve merge conflicts by choosing Caret (HEAD) version

echo "Resolving merge conflicts by choosing Caret version..."

# Find all files with merge conflicts
files_with_conflicts=$(grep -l "<<<<<<< HEAD" webview-ui/src/**/*.tsx webview-ui/src/**/*.ts 2>/dev/null)

for file in $files_with_conflicts; do
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file="${file}.tmp"
    
    # Process the file to keep Caret (HEAD) version
    awk '
    /^<<<<<<< HEAD$/ { in_conflict=1; keep_head=1; next }
    /^=======$/ { keep_head=0; next }
    /^>>>>>>> upstream\/main$/ { in_conflict=0; next }
    { if (!in_conflict || keep_head) print }
    ' "$file" > "$temp_file"
    
    # Replace original file
    mv "$temp_file" "$file"
    echo "  ✓ Resolved conflicts in $file"
done

echo "All conflicts resolved!"