#!/usr/bin/env python3
import sys
import re

def resolve_conflict(file_path, strategy="caret"):
    """
    Resolve merge conflicts in a file.
    strategy: "caret" (keep HEAD), "cline" (keep upstream), "manual" (require manual review)
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if file has conflicts
    if '<<<<<<< HEAD' not in content:
        return False, "No conflicts found"
    
    # Pattern to match merge conflicts
    conflict_pattern = r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> upstream/main'
    
    def replace_conflict(match):
        head_content = match.group(1)
        upstream_content = match.group(2)
        
        # Check for CARET MODIFICATION markers
        if 'CARET MODIFICATION' in head_content:
            # Always keep Caret modifications
            return head_content
        elif strategy == "caret":
            return head_content
        elif strategy == "cline":
            return upstream_content
        else:
            # For manual strategy, keep conflict markers
            return match.group(0)
    
    # Replace conflicts
    resolved_content = re.sub(conflict_pattern, replace_conflict, content, flags=re.DOTALL)
    
    # Write resolved content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(resolved_content)
    
    conflicts_resolved = content.count('<<<<<<< HEAD')
    return True, f"Resolved {conflicts_resolved} conflicts"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python merge-conflict-resolver.py <file_path> [strategy]")
        sys.exit(1)
    
    file_path = sys.argv[1]
    strategy = sys.argv[2] if len(sys.argv) > 2 else "caret"
    
    success, message = resolve_conflict(file_path, strategy)
    print(f"{file_path}: {message}")