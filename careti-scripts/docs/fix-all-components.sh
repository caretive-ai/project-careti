#!/bin/bash

# Fix All Components Script - Comprehensive Mintlify to Docusaurus converter
# This script handles ALL component conversions in one pass

set -e

TARGET_DIR="$1"

if [ -z "$TARGET_DIR" ]; then
    echo "Usage: $0 <target_directory>"
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Directory $TARGET_DIR does not exist"
    exit 1
fi

echo -e "\e[32m[INFO]\e[0m Comprehensive component conversion in: $TARGET_DIR"

# Count total MDX files
MDX_COUNT=$(find "$TARGET_DIR" -name "*.mdx" | wc -l)
echo -e "\e[32m[INFO]\e[0m Processing $MDX_COUNT MDX files"

# Function to process each file
process_file() {
    local file="$1"
    echo -e "\e[32m[INFO]\e[0m Processing: $(basename "$file")"
    
    # Create temporary file
    temp_file=$(mktemp)
    
    # Process the file line by line
    while IFS= read -r line; do
        # Remove Frame components (opening and closing tags)
        line=$(echo "$line" | sed 's/<Frame[^>]*>//g')
        line=$(echo "$line" | sed 's/<\/Frame>//g')
        
        # Convert Tip components
        if [[ $line =~ \<Tip[^>]*\> ]]; then
            echo ":::tip"
        elif [[ $line == "</Tip>" ]]; then
            echo ":::"
        
        # Convert Note components  
        elif [[ $line =~ \<Note[^>]*\> ]]; then
            echo ":::note"
        elif [[ $line == "</Note>" ]]; then
            echo ":::"
        
        # Convert Step components
        elif [[ $line =~ \<Step[^>]*\> ]]; then
            echo ":::info"
        elif [[ $line == "</Step>" ]]; then
            echo ":::"
        
        # Convert Card components
        elif [[ $line =~ \<Card[^>]*\> ]]; then
            echo ":::note"
        elif [[ $line == "</Card>" ]]; then
            echo ":::"
        
        # Convert AccordionGroup components
        elif [[ $line =~ \<AccordionGroup[^>]*\> ]]; then
            echo ":::info"
        elif [[ $line == "</AccordionGroup>" ]]; then
            echo ":::"
        
        # Convert Accordion components
        elif [[ $line =~ \<Accordion[^>]*title=\"([^\"]*)\"\> ]]; then
            title="${BASH_REMATCH[1]}"
            echo ":::details $title"
        elif [[ $line == "</Accordion>" ]]; then
            echo ":::"
        
        # Convert Warning components
        elif [[ $line =~ \<Warning[^>]*\> ]]; then
            echo ":::warning"
        elif [[ $line == "</Warning>" ]]; then
            echo ":::"
        
        # Convert Info components
        elif [[ $line =~ \<Info[^>]*\> ]]; then
            echo ":::info"
        elif [[ $line == "</Info>" ]]; then
            echo ":::"
        
        # Convert CodeGroup components
        elif [[ $line =~ \<CodeGroup[^>]*\> ]]; then
            echo ""  # Remove CodeGroup opening
        elif [[ $line == "</CodeGroup>" ]]; then
            echo ""  # Remove CodeGroup closing
        
        # Convert Check components
        elif [[ $line =~ \<Check[^>]*\> ]]; then
            echo ":::tip"
        elif [[ $line == "</Check>" ]]; then
            echo ":::"
        
        else
            echo "$line"
        fi
    done < "$file" > "$temp_file"
    
    # Replace original file with processed content
    mv "$temp_file" "$file"
}

export -f process_file

# Process all MDX files in parallel for speed
find "$TARGET_DIR" -name "*.mdx" -print0 | xargs -0 -P 4 -I {} bash -c 'process_file "$@"' _ {}

echo -e "\e[32m[SUCCESS]\e[0m All component conversions completed in $TARGET_DIR"

# Check if any Frame components remain
remaining_frames=$(find "$TARGET_DIR" -name "*.mdx" -exec grep -l "Frame" {} \; 2>/dev/null | wc -l)
if [ "$remaining_frames" -gt 0 ]; then
    echo -e "\e[33m[WARNING]\e[0m $remaining_frames files still contain Frame references"
    find "$TARGET_DIR" -name "*.mdx" -exec grep -l "Frame" {} \; 2>/dev/null | head -5
else
    echo -e "\e[32m[SUCCESS]\e[0m All Frame components successfully converted"
fi