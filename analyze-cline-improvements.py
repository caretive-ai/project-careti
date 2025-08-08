#!/usr/bin/env python3
"""
Analyze Cline improvements in merge conflicts
Helps identify bug fixes, performance improvements, and new features
"""
import re
import sys
from typing import List, Dict, Tuple
import difflib

class ClineImprovementAnalyzer:
    def __init__(self):
        self.improvements = {
            'bug_fixes': [],
            'performance': [],
            'new_features': [],
            'refactoring': [],
            'security': []
        }
        
        # Patterns to detect improvements
        self.patterns = {
            'bug_fixes': [
                r'fix\s*\(',
                r'fixed\s+',
                r'bugfix',
                r'prevent\s+',
                r'handle\s+error',
                r'catch\s*\(',
                r'null\s*check',
                r'undefined\s*check',
                r'memory\s*leak',
                r'race\s*condition'
            ],
            'performance': [
                r'optimize',
                r'performance',
                r'faster',
                r'reduce\s+',
                r'cache',
                r'memoize',
                r'lazy\s+load',
                r'debounce',
                r'throttle'
            ],
            'new_features': [
                r'add\s+',
                r'new\s+',
                r'feature',
                r'support\s+',
                r'implement\s+',
                r'introduce\s+'
            ],
            'security': [
                r'sanitize',
                r'validate',
                r'escape',
                r'security',
                r'vulnerability',
                r'xss',
                r'injection'
            ]
        }
    
    def analyze_file(self, file_path: str) -> Dict[str, List[Dict]]:
        """Analyze a file with merge conflicts"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            return {'error': f'Cannot read file: {file_path}'}
        
        conflicts = self.extract_conflicts(content)
        
        for idx, (caret_code, cline_code, line_num) in enumerate(conflicts):
            self.analyze_conflict(caret_code, cline_code, file_path, line_num, idx)
        
        return self.improvements
    
    def extract_conflicts(self, content: str) -> List[Tuple[str, str, int]]:
        """Extract all conflicts from file content"""
        conflicts = []
        lines = content.split('\n')
        
        i = 0
        while i < len(lines):
            if lines[i].strip() == '<<<<<<< HEAD':
                start_line = i
                caret_lines = []
                i += 1
                
                # Collect HEAD (Caret) content
                while i < len(lines) and lines[i].strip() != '=======':
                    caret_lines.append(lines[i])
                    i += 1
                
                if i >= len(lines):
                    break
                    
                i += 1  # Skip =======
                cline_lines = []
                
                # Collect upstream (Cline) content
                while i < len(lines) and not lines[i].startswith('>>>>>>> upstream/main'):
                    cline_lines.append(lines[i])
                    i += 1
                
                if i < len(lines):
                    conflicts.append((
                        '\n'.join(caret_lines),
                        '\n'.join(cline_lines),
                        start_line + 1  # 1-based line number
                    ))
            i += 1
        
        return conflicts
    
    def analyze_conflict(self, caret_code: str, cline_code: str, file_path: str, line_num: int, idx: int):
        """Analyze a single conflict"""
        # Always analyze differences
        caret_has_modification = 'CARET MODIFICATION' in caret_code
        
        # Check if Cline code is significantly different or contains improvements
        cline_lower = cline_code.lower()
        caret_lower = caret_code.lower()
        
        # Check for Cline-specific improvements
        improvement_found = False
        categories_matched = []
        
        for category, patterns in self.patterns.items():
            for pattern in patterns:
                # Check if pattern exists in Cline but not in Caret
                if re.search(pattern, cline_lower) and not re.search(pattern, caret_lower):
                    categories_matched.append((category, pattern))
                    improvement_found = True
        
        # Also check for structural differences that might be improvements
        if not improvement_found:
            # Check for new functionality (Cline has content, Caret doesn't)
            if len(cline_code.strip()) > 10 and len(caret_code.strip()) < 10:
                categories_matched.append(('new_features', 'new_code_block'))
                improvement_found = True
            # Check for refactoring (significantly different structure)
            elif len(cline_code) > 50 and len(caret_code) > 50:
                similarity = difflib.SequenceMatcher(None, caret_lower, cline_lower).ratio()
                if similarity < 0.7:  # Less than 70% similar
                    categories_matched.append(('refactoring', 'structural_change'))
                    improvement_found = True
        
        if improvement_found or not caret_has_modification:
            # Compute diff for better understanding
            diff = list(difflib.unified_diff(
                caret_code.splitlines(keepends=True),
                cline_code.splitlines(keepends=True),
                fromfile='Caret',
                tofile='Cline',
                n=3
            ))
            
            for category, pattern in categories_matched:
                improvement = {
                    'file': file_path,
                    'line': line_num,
                    'conflict_index': idx,
                    'pattern_matched': pattern,
                    'has_caret_modification': caret_has_modification,
                    'caret_snippet': caret_code[:200] + '...' if len(caret_code) > 200 else caret_code,
                    'cline_snippet': cline_code[:200] + '...' if len(cline_code) > 200 else cline_code,
                    'diff_preview': ''.join(diff[:15])  # First 15 lines of diff
                }
                
                self.improvements[category].append(improvement)

def generate_report(improvements: Dict[str, List[Dict]]) -> str:
    """Generate a human-readable report"""
    report = []
    report.append("# Cline Improvements Analysis Report\n")
    report.append("이 보고서는 Cline의 개선사항을 분석하여 선택적으로 병합할 수 있도록 도와줍니다.\n")
    
    total_improvements = sum(len(items) for items in improvements.values())
    report.append(f"총 발견된 잠재적 개선사항: {total_improvements}개\n")
    
    categories = [
        ('bug_fixes', '🐛 버그 수정', '안정성을 향상시킬 수 있는 잠재적 버그 수정'),
        ('security', '🔒 보안', '보안 관련 개선사항'),
        ('performance', '⚡ 성능', '성능 최적화'),
        ('new_features', '✨ 새 기능', 'Cline이 추가한 새로운 기능'),
        ('refactoring', '🔧 리팩토링', '코드 구조 개선')
    ]
    
    for key, title, description in categories:
        items = improvements.get(key, [])
        if items:
            report.append(f"\n## {title}\n")
            report.append(f"{description} ({len(items)}개 항목)\n")
            
            # Group by file
            by_file = {}
            for item in items:
                file = item['file']
                if file not in by_file:
                    by_file[file] = []
                by_file[file].append(item)
            
            for file, file_items in by_file.items():
                report.append(f"\n### {file}\n")
                for item in file_items:
                    report.append(f"\n#### 충돌 #{item['conflict_index']} (라인 {item['line']})")
                    if item.get('has_caret_modification'):
                        report.append("  - ⚠️ **Caret 수정 사항 있음** - 주의 깊게 검토 필요")
                    report.append(f"  - 패턴: `{item['pattern_matched']}`")
                    
                    # Show both sides
                    report.append("\n  **Caret 코드:**")
                    report.append("  ```typescript")
                    report.append("  " + item['caret_snippet'][:200].replace('\n', '\n  '))
                    if len(item['caret_snippet']) > 200:
                        report.append("  ...")
                    report.append("  ```")
                    
                    report.append("\n  **Cline 코드:**")
                    report.append("  ```typescript")
                    report.append("  " + item['cline_snippet'][:200].replace('\n', '\n  '))
                    if len(item['cline_snippet']) > 200:
                        report.append("  ...")
                    report.append("  ```")
                    
                    # Recommendation
                    if key == 'bug_fixes':
                        report.append("\n  💡 **권장사항:** 버그 수정은 일반적으로 병합하는 것이 좋습니다.")
                    elif key == 'security':
                        report.append("\n  💡 **권장사항:** 보안 개선사항은 반드시 검토 후 병합해야 합니다.")
                    elif key == 'performance':
                        report.append("\n  💡 **권장사항:** 성능 개선이 Caret의 기능을 해치지 않는지 확인하세요.")
                    elif key == 'new_features':
                        report.append("\n  💡 **권장사항:** 새 기능이 Caret과 충돌하지 않는지 확인하세요.")
                    elif key == 'refactoring':
                        report.append("\n  💡 **권장사항:** 리팩토링이 Caret의 확장 기능을 깨뜨리지 않는지 확인하세요.")
    
    return '\n'.join(report)

def generate_selective_merge_script(improvements: Dict[str, List[Dict]], output_file: str = 'selective-merge.sh'):
    """Generate a shell script for selective merging"""
    script_lines = ['#!/bin/bash', '# Selective merge script for Cline improvements', '']
    
    # Group by file
    by_file = {}
    for category, items in improvements.items():
        if category in ['bug_fixes', 'security', 'performance']:  # High priority categories
            for item in items:
                file = item['file']
                if file not in by_file:
                    by_file[file] = []
                by_file[file].append((item['conflict_index'], category))
    
    script_lines.append('echo "This script will help you selectively merge Cline improvements"')
    script_lines.append('echo "Review each change carefully before applying"')
    script_lines.append('')
    
    for file, conflicts in by_file.items():
        script_lines.append(f'# File: {file}')
        script_lines.append(f'echo "\\nProcessing {file}..."')
        
        for conflict_idx, category in conflicts:
            script_lines.append(f'echo "  Conflict #{conflict_idx} ({category}) - Review and merge manually"')
        
        script_lines.append(f'# Open file in editor for manual review')
        script_lines.append(f'# code "{file}"')
        script_lines.append('')
    
    with open(output_file, 'w') as f:
        f.write('\n'.join(script_lines))
    
    return output_file

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze-cline-improvements.py <file_or_directory>")
        print("       python analyze-cline-improvements.py --all  # Analyze all conflicts")
        sys.exit(1)
    
    analyzer = ClineImprovementAnalyzer()
    
    if sys.argv[1] == '--all':
        # Find all files with conflicts
        import subprocess
        result = subprocess.run(
            'find . -type f \\( -name "*.ts" -o -name "*.tsx" \\) -exec grep -l "<<<<<<< HEAD" {} \\;',
            shell=True, capture_output=True, text=True
        )
        files = result.stdout.strip().split('\n') if result.stdout else []
    else:
        files = [sys.argv[1]]
    
    all_improvements = {
        'bug_fixes': [],
        'performance': [],
        'new_features': [],
        'refactoring': [],
        'security': []
    }
    
    for file in files:
        if file:
            print(f"Analyzing {file}...")
            file_improvements = analyzer.analyze_file(file)
            
            # Merge results
            for category, items in file_improvements.items():
                if category != 'error':
                    all_improvements[category].extend(items)
    
    # Generate report
    report = generate_report(all_improvements)
    
    # Save report
    with open('cline-improvements-report.md', 'w') as f:
        f.write(report)
    
    print("\nReport saved to: cline-improvements-report.md")
    
    # Generate selective merge script
    if any(all_improvements.values()):
        script_file = generate_selective_merge_script(all_improvements)
        print(f"Selective merge script saved to: {script_file}")
        
    # Summary
    print("\nSummary:")
    for category, items in all_improvements.items():
        if items:
            print(f"  {category}: {len(items)} potential improvements")