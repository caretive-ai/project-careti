#!/bin/bash

# Script to rename files from 'cline' to 'caret' in documentation
# Usage: ./cline-to-caret-renamer.sh [directory]

TARGET_DIR=${1:-.}

echo "🔄 Starting file renaming from 'cline' to 'caret' in: $TARGET_DIR"

# Find and rename files containing 'cline' in their names
find "$TARGET_DIR" -name "*cline*" -type f | while read -r file; do
    # Get directory and filename
    dir=$(dirname "$file")
    filename=$(basename "$file")
    
    # Create new filename by replacing 'cline' with 'caret'
    new_filename=$(echo "$filename" | sed 's/cline/caret/g')
    
    # Only rename if the filename actually changed
    if [ "$filename" != "$new_filename" ]; then
        new_file="$dir/$new_filename"
        echo "📝 Renaming: $file → $new_file"
        mv "$file" "$new_file"
    fi
done

# Find and rename directories containing 'cline' in their names
find "$TARGET_DIR" -name "*cline*" -type d | sort -r | while read -r dir; do
    # Get parent directory and directory name
    parent_dir=$(dirname "$dir")
    dir_name=$(basename "$dir")
    
    # Create new directory name by replacing 'cline' with 'caret'
    new_dir_name=$(echo "$dir_name" | sed 's/cline/caret/g')
    
    # Only rename if the directory name actually changed
    if [ "$dir_name" != "$new_dir_name" ]; then
        new_dir="$parent_dir/$new_dir_name"
        echo "📁 Renaming directory: $dir → $new_dir"
        mv "$dir" "$new_dir"
    fi
done

echo "✅ File and directory renaming completed!"