#!/usr/bin/env python3
import os
import re
import sys
from pathlib import Path

def migrate_paths(file_path):
    """webview-ui 경로를 caret-webview-ui로 변경"""
    
    patterns = [
        # Import 문
        (r'from\s+"\.\.\/\.\.\/webview-ui\/', r'from "../../caret-webview-ui/'),
        (r'from\s+"\.\.\/webview-ui\/', r'from "../caret-webview-ui/'),
        (r'from\s+"\.\/webview-ui\/', r'from "./caret-webview-ui/'),
        (r'from\s+"webview-ui\/', r'from "caret-webview-ui/'),
        
        # 경로 문자열
        (r'\["webview-ui"', r'["caret-webview-ui"'),
        (r"'webview-ui/", r"'caret-webview-ui/"),
        (r'"webview-ui/', r'"caret-webview-ui/'),
        
        # 명령어
        (r'cd webview-ui', r'cd caret-webview-ui'),
        
        # 빌드 경로
        (r'webview-ui/build', r'caret-webview-ui/build'),
        (r'webview-ui/node_modules', r'caret-webview-ui/node_modules'),
        (r'webview-ui/src', r'caret-webview-ui/src'),
        
        # Join path
        (r'join\(([^,]+),\s*"webview-ui"', r'join(\1, "caret-webview-ui"'),
    ]
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Updated: {file_path}")
            return True
        else:
            print(f"⏭️  No changes: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 path-migration.py <directory_or_file>")
        sys.exit(1)
    
    target = sys.argv[1]
    updated_count = 0
    
    if os.path.isfile(target):
        if migrate_paths(target):
            updated_count += 1
    else:
        for root, dirs, files in os.walk(target):
            # node_modules 제외
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            
            for file in files:
                if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.json', '.mjs')):
                    file_path = os.path.join(root, file)
                    if migrate_paths(file_path):
                        updated_count += 1
    
    print(f"\n📊 Total files updated: {updated_count}")

if __name__ == "__main__":
    main()
