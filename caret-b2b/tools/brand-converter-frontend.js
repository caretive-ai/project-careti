#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// 로그 함수
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// 프로젝트 루트 찾기
function findProjectRoot() {
    let currentDir = __dirname;
    while (currentDir !== path.dirname(currentDir)) {
        if (fs.existsSync(path.join(currentDir, 'package.json'))) {
            const pkg = JSON.parse(fs.readFileSync(path.join(currentDir, 'package.json'), 'utf8'));
            if (pkg.name === 'claude-dev' || pkg.name === 'caret') {
                return currentDir;
            }
        }
        currentDir = path.dirname(currentDir);
    }
    throw new Error('Could not find project root');
}

// 백업 생성
function createBackup(filePath) {
    const backupPath = filePath + '.backup';
    if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, backupPath);
        log(`Backup created: ${path.basename(backupPath)}`, 'cyan');
    }
}

// 백업 복원
function restoreBackup(filePath) {
    const backupPath = filePath + '.backup';
    if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
        log(`Restored from backup: ${path.basename(filePath)}`, 'green');
    }
}

// Import 문 추가
function addImport(content, importStatement) {
    // 이미 import가 있는지 확인
    if (content.includes(importStatement)) {
        return content;
    }
    
    // 다른 import 문 뒤에 추가
    const importRegex = /^import .* from .*$/m;
    const lastImportMatch = content.match(importRegex);
    
    if (lastImportMatch) {
        // 마지막 import 문 찾기
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(importRegex)) {
                lastImportIndex = i;
            }
        }
        
        if (lastImportIndex >= 0) {
            lines.splice(lastImportIndex + 1, 0, importStatement);
            return lines.join('\n');
        }
    }
    
    // import 문이 없으면 파일 시작 부분에 추가
    return importStatement + '\n\n' + content;
}

// Cline to Caret 변환
function convertClineToCaret(projectRoot, mappingsPath) {
    log('\n=== Starting Cline → Caret Conversion ===', 'bright');
    
    const mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));
    let totalReplacements = 0;
    
    for (const [filePath, config] of Object.entries(mappings.files)) {
        const fullPath = path.join(projectRoot, filePath);
        
        if (!fs.existsSync(fullPath)) {
            log(`File not found: ${filePath}`, 'yellow');
            continue;
        }
        
        log(`\nProcessing: ${filePath}`, 'blue');
        
        // 백업 생성
        createBackup(fullPath);
        
        let content = fs.readFileSync(fullPath, 'utf8');
        let fileReplacements = 0;
        
        // Import 추가
        if (config.import) {
            content = addImport(content, config.import);
        }
        
        // 텍스트 치환
        for (const [search, replace] of Object.entries(config.replacements)) {
            const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = content.match(regex);
            
            if (matches) {
                content = content.replace(regex, replace);
                fileReplacements += matches.length;
                log(`  Replaced: "${search}" → "${replace}" (${matches.length} times)`, 'green');
            }
        }
        
        if (fileReplacements > 0) {
            fs.writeFileSync(fullPath, content, 'utf8');
            log(`  Total replacements in file: ${fileReplacements}`, 'cyan');
            totalReplacements += fileReplacements;
        } else {
            // 변경사항이 없으면 백업 삭제
            const backupPath = fullPath + '.backup';
            if (fs.existsSync(backupPath)) {
                fs.unlinkSync(backupPath);
            }
            log(`  No changes needed`, 'yellow');
        }
    }
    
    log(`\n=== Conversion Complete ===`, 'bright');
    log(`Total replacements: ${totalReplacements}`, 'green');
    
    // common.json 파일 확인 및 CARET.BRAND 키 추가
    ensureBrandKey(projectRoot, 'Caret');
}

// Caret to Cline 변환 (역변환)
function convertCaretToCline(projectRoot) {
    log('\n=== Starting Caret → Cline Conversion (Restore) ===', 'bright');
    
    const mappingsPath = path.join(projectRoot, 'caret-b2b/brands/caret/frontend-text-mappings.json');
    const mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));
    
    for (const filePath of Object.keys(mappings.files)) {
        const fullPath = path.join(projectRoot, filePath);
        
        if (fs.existsSync(fullPath + '.backup')) {
            restoreBackup(fullPath);
        } else {
            log(`No backup found for: ${filePath}`, 'yellow');
        }
    }
    
    log(`\n=== Restore Complete ===`, 'bright');
}

// CARET.BRAND 키 확인 및 추가
function ensureBrandKey(projectRoot, brandName) {
    const locales = ['en', 'ko', 'ja', 'zh'];
    
    log('\n=== Checking locale files for CARET.BRAND key ===', 'bright');
    
    for (const locale of locales) {
        const commonPath = path.join(projectRoot, `webview-ui/src/caret/locale/${locale}/common.json`);
        
        if (!fs.existsSync(commonPath)) {
            log(`Creating ${locale}/common.json`, 'yellow');
            const dir = path.dirname(commonPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(commonPath, JSON.stringify({
                "CARET": {
                    "BRAND": brandName
                }
            }, null, 2), 'utf8');
        } else {
            let common = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
            
            if (!common.CARET || !common.CARET.BRAND) {
                if (!common.CARET) {
                    common.CARET = {};
                }
                common.CARET.BRAND = brandName;
                fs.writeFileSync(commonPath, JSON.stringify(common, null, 2), 'utf8');
                log(`Added CARET.BRAND to ${locale}/common.json`, 'green');
            } else {
                log(`CARET.BRAND already exists in ${locale}/common.json`, 'cyan');
            }
        }
    }
}

// 메인 함수
function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node brand-converter-frontend.js [cline-to-caret|caret-to-cline]');
        console.log('\nCommands:');
        console.log('  cline-to-caret    Convert hardcoded Cline text to i18n keys');
        console.log('  caret-to-cline    Restore original Cline text from backups');
        process.exit(1);
    }
    
    try {
        const projectRoot = findProjectRoot();
        const command = args[0];
        
        log(`Project root: ${projectRoot}`, 'cyan');
        
        switch (command) {
            case 'cline-to-caret':
                const mappingsPath = path.join(projectRoot, 'caret-b2b/brands/caret/frontend-text-mappings.json');
                if (!fs.existsSync(mappingsPath)) {
                    throw new Error(`Mappings file not found: ${mappingsPath}`);
                }
                convertClineToCaret(projectRoot, mappingsPath);
                break;
                
            case 'caret-to-cline':
                convertCaretToCline(projectRoot);
                break;
                
            default:
                throw new Error(`Unknown command: ${command}`);
        }
        
        log('\n✅ Operation completed successfully!', 'green');
        
    } catch (error) {
        log(`\n❌ Error: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 실행
main();