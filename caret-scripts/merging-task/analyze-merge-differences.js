/**
 * 머징 차이점 분석 가이드 스크립트
 * 
 * ⚠️ 주의: 이 결과를 맹신하지 마세요!
 * 단순히 "어디를 찾아봐야 할지" 힌트만 제공합니다.
 * 
 * 목적:
 * 1. Cline 최신 vs 현재 머징 결과 차이점
 * 2. Caret 원본 vs 현재 머징 결과 차이점
 * → 수동 검토할 영역을 좁혀주는 가이드
 */

const fs = require('fs');
const path = require('path');

function extractFunctions(filePath) {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // setter 함수들 추출 (set으로 시작하는 함수들)
    const setterMatches = content.match(/\b(set[A-Z][a-zA-Z]*)\s*:/g) || [];
    const setters = setterMatches.map(match => match.replace(':', '').trim());
    
    return setters;
}

function extractImports(filePath) {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // import 문들 추출
    const importMatches = content.match(/^import.*from\s+['"](.*?)['"];?$/gm) || [];
    const imports = importMatches.map(match => {
        const fromMatch = match.match(/from\s+['"](.*?)['"];?$/);
        return fromMatch ? fromMatch[1] : '';
    }).filter(Boolean);
    
    return imports;
}

function extractInterfaceProperties(filePath) {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // ExtensionStateContextType interface 내부의 property들 추출
    const interfaceMatch = content.match(/interface\s+ExtensionStateContextType[\s\S]*?^}/m);
    if (!interfaceMatch) {
        return [];
    }
    
    const interfaceContent = interfaceMatch[0];
    const propertyMatches = interfaceContent.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s*[?:]?\s*/gm) || [];
    const properties = propertyMatches
        .map(match => match.trim().replace(/[?:].*/g, ''))
        .filter(prop => prop && !prop.includes('interface') && !prop.includes('{') && !prop.includes('}'));
    
    return properties;
}

function analyzeAndReport(baseFile, currentFile, comparisonName) {
    console.log(`\n🔍 ${comparisonName}:`);
    console.log(`📂 기준: ${baseFile}`);
    console.log(`📂 현재: ${currentFile}`);
    
    if (!fs.existsSync(baseFile)) {
        console.log(`❌ 기준 파일 없음: ${baseFile}`);
        return { missing: [], extra: [] };
    }
    
    if (!fs.existsSync(currentFile)) {
        console.log(`❌ 현재 파일 없음: ${currentFile}`);
        return { missing: [], extra: [] };
    }
    
    // 1. Setter 함수들 비교
    const baseSetters = extractFunctions(baseFile);
    const currentSetters = extractFunctions(currentFile);
    const missingSetters = baseSetters.filter(item => !currentSetters.includes(item));
    const extraSetters = currentSetters.filter(item => !baseSetters.includes(item));
    
    // 2. Import 문들 비교
    const baseImports = extractImports(baseFile);
    const currentImports = extractImports(currentFile);
    const missingImports = baseImports.filter(item => !currentImports.includes(item));
    const extraImports = currentImports.filter(item => !baseImports.includes(item));
    
    // 3. Interface properties 비교
    const baseProps = extractInterfaceProperties(baseFile);
    const currentProps = extractInterfaceProperties(currentFile);
    const missingProps = baseProps.filter(item => !currentProps.includes(item));
    const extraProps = currentProps.filter(item => !baseProps.includes(item));
    
    // 결과 출력
    console.log(`\n📊 Setter 함수 차이:`);
    if (missingSetters.length > 0) {
        console.log(`❌ 기준에는 있지만 현재에는 없음 (${missingSetters.length}개):`);
        missingSetters.forEach(item => console.log(`   - ${item}`));
    }
    if (extraSetters.length > 0) {
        console.log(`✅ 현재에는 있지만 기준에는 없음 (${extraSetters.length}개):`);
        extraSetters.forEach(item => console.log(`   + ${item}`));
    }
    if (missingSetters.length === 0 && extraSetters.length === 0) {
        console.log(`✅ 차이 없음`);
    }
    
    console.log(`\n📦 Import 차이:`);
    if (missingImports.length > 0) {
        console.log(`❌ 기준에는 있지만 현재에는 없음 (${missingImports.length}개):`);
        missingImports.forEach(item => console.log(`   - ${item}`));
    }
    if (extraImports.length > 0) {
        console.log(`✅ 현재에는 있지만 기준에는 없음 (${extraImports.length}개):`);
        extraImports.forEach(item => console.log(`   + ${item}`));
    }
    if (missingImports.length === 0 && extraImports.length === 0) {
        console.log(`✅ 차이 없음`);
    }
    
    console.log(`\n🔧 Interface Properties 차이:`);
    if (missingProps.length > 0) {
        console.log(`❌ 기준에는 있지만 현재에는 없음 (${missingProps.length}개):`);
        missingProps.forEach(item => console.log(`   - ${item}`));
    }
    if (extraProps.length > 0) {
        console.log(`✅ 현재에는 있지만 기준에는 없음 (${extraProps.length}개):`);
        extraProps.forEach(item => console.log(`   + ${item}`));
    }
    if (missingProps.length === 0 && extraProps.length === 0) {
        console.log(`✅ 차이 없음`);
    }
    
    return {
        missing: missingSetters.length + missingImports.length + missingProps.length,
        extra: extraSetters.length + extraImports.length + extraProps.length
    };
}

function scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
    const files = [];
    
    function scanRecursive(currentPath) {
        if (!fs.existsSync(currentPath)) return;
        
        const items = fs.readdirSync(currentPath);
        for (const item of items) {
            const fullPath = path.join(currentPath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // node_modules, .git 등 제외
                if (!item.startsWith('.') && item !== 'node_modules') {
                    scanRecursive(fullPath);
                }
            } else if (stat.isFile()) {
                const ext = path.extname(item);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }
    
    scanRecursive(dirPath);
    return files;
}

function analyzeAllFiles(baseDir, currentDir, outputFile, comparisonName) {
    console.log(`\n🔍 ${comparisonName} - 전체 디렉토리 스캔`);
    console.log(`📂 기준: ${baseDir}`);
    console.log(`📂 현재: ${currentDir}`);
    
    if (!fs.existsSync(baseDir)) {
        console.log(`❌ 기준 디렉토리 없음: ${baseDir}`);
        return { totalMissing: 0, totalExtra: 0 };
    }
    
    if (!fs.existsSync(currentDir)) {
        console.log(`❌ 현재 디렉토리 없음: ${currentDir}`);
        return { totalMissing: 0, totalExtra: 0 };
    }
    
    const baseFiles = scanDirectory(baseDir);
    const currentFiles = scanDirectory(currentDir);
    
    // 상대 경로로 변환하여 비교
    const baseRelativeFiles = baseFiles.map(f => path.relative(baseDir, f));
    const currentRelativeFiles = currentFiles.map(f => path.relative(currentDir, f));
    
    const results = [];
    let totalMissing = 0;
    let totalExtra = 0;
    
    // 공통 파일들만 비교
    const commonFiles = baseRelativeFiles.filter(f => currentRelativeFiles.includes(f));
    
    console.log(`📊 비교 대상: ${commonFiles.length}개 파일`);
    
    for (const relativeFile of commonFiles) {
        const baseFile = path.join(baseDir, relativeFile);
        const currentFile = path.join(currentDir, relativeFile);
        
        // 각 파일별 분석
        const baseSetters = extractFunctions(baseFile);
        const currentSetters = extractFunctions(currentFile);
        const baseImports = extractImports(baseFile);
        const currentImports = extractImports(currentFile);
        const baseProps = extractInterfaceProperties(baseFile);
        const currentProps = extractInterfaceProperties(currentFile);
        
        const missingSetters = baseSetters.filter(item => !currentSetters.includes(item));
        const extraSetters = currentSetters.filter(item => !baseSetters.includes(item));
        const missingImports = baseImports.filter(item => !currentImports.includes(item));
        const extraImports = currentImports.filter(item => !baseImports.includes(item));
        const missingProps = baseProps.filter(item => !currentProps.includes(item));
        const extraProps = currentProps.filter(item => !baseProps.includes(item));
        
        const fileMissing = missingSetters.length + missingImports.length + missingProps.length;
        const fileExtra = extraSetters.length + extraImports.length + extraProps.length;
        
        if (fileMissing > 0 || fileExtra > 0) {
            results.push({
                file: relativeFile,
                missingSetters,
                extraSetters,
                missingImports,
                extraImports,
                missingProps,
                extraProps,
                totalMissing: fileMissing,
                totalExtra: fileExtra
            });
            
            totalMissing += fileMissing;
            totalExtra += fileExtra;
        }
    }
    
    // 누락된 파일들 (기준에는 있지만 현재에는 없음)
    const missingFiles = baseRelativeFiles.filter(f => !currentRelativeFiles.includes(f));
    const extraFiles = currentRelativeFiles.filter(f => !baseRelativeFiles.includes(f));
    
    // 결과를 파일로 저장
    const reportContent = generateDetailedReport(comparisonName, results, missingFiles, extraFiles, totalMissing, totalExtra);
    fs.writeFileSync(outputFile, reportContent, 'utf8');
    
    console.log(`📝 상세 리포트: ${outputFile}`);
    console.log(`📊 요약: ❌ ${totalMissing}개 누락, ✅ ${totalExtra}개 추가, 📁 ${missingFiles.length}개 파일 누락, 📁 ${extraFiles.length}개 파일 추가`);
    
    return { totalMissing, totalExtra, missingFiles: missingFiles.length, extraFiles: extraFiles.length };
}

function generateDetailedReport(comparisonName, results, missingFiles, extraFiles, totalMissing, totalExtra) {
    let report = `# ${comparisonName} - 상세 분석 리포트\n\n`;
    report += `⚠️ **주의**: 이 결과를 맹신하지 마세요! 참고용 가이드입니다.\n\n`;
    report += `## 📊 전체 요약\n\n`;
    report += `- ❌ **누락된 항목**: ${totalMissing}개\n`;
    report += `- ✅ **추가된 항목**: ${totalExtra}개\n`;
    report += `- 📁 **누락된 파일**: ${missingFiles.length}개\n`;
    report += `- 📁 **추가된 파일**: ${extraFiles.length}개\n\n`;
    
    if (missingFiles.length > 0) {
        report += `## 📁 누락된 파일들\n\n`;
        missingFiles.forEach(file => {
            report += `- \`${file}\`\n`;
        });
        report += `\n`;
    }
    
    if (extraFiles.length > 0) {
        report += `## 📁 추가된 파일들\n\n`;
        extraFiles.forEach(file => {
            report += `- \`${file}\`\n`;
        });
        report += `\n`;
    }
    
    if (results.length > 0) {
        report += `## 📋 파일별 상세 차이점\n\n`;
        
        // 누락이 많은 파일부터 정렬
        results.sort((a, b) => b.totalMissing - a.totalMissing);
        
        results.forEach((result, index) => {
            report += `### ${index + 1}. \`${result.file}\`\n\n`;
            report += `**요약**: ❌ ${result.totalMissing}개 누락, ✅ ${result.totalExtra}개 추가\n\n`;
            
            if (result.missingSetters.length > 0) {
                report += `#### ❌ 누락된 Setter 함수들\n`;
                result.missingSetters.forEach(item => report += `- \`${item}\`\n`);
                report += `\n`;
            }
            
            if (result.missingImports.length > 0) {
                report += `#### ❌ 누락된 Import들\n`;
                result.missingImports.forEach(item => report += `- \`${item}\`\n`);
                report += `\n`;
            }
            
            if (result.missingProps.length > 0) {
                report += `#### ❌ 누락된 Properties\n`;
                result.missingProps.forEach(item => report += `- \`${item}\`\n`);
                report += `\n`;
            }
            
            if (result.extraSetters.length > 0) {
                report += `#### ✅ 추가된 Setter 함수들\n`;
                result.extraSetters.forEach(item => report += `- \`${item}\`\n`);
                report += `\n`;
            }
            
            if (result.extraImports.length > 0) {
                report += `#### ✅ 추가된 Import들\n`;
                result.extraImports.forEach(item => report += `- \`${item}\`\n`);
                report += `\n`;
            }
            
            if (result.extraProps.length > 0) {
                report += `#### ✅ 추가된 Properties\n`;
                result.extraProps.forEach(item => report += `- \`${item}\`\n`);
                report += `\n`;
            }
            
            report += `---\n\n`;
        });
    }
    
    report += `## 💡 검토 가이드\n\n`;
    report += `1. **❌ 누락된 항목들**을 우선순위별로 검토\n`;
    report += `2. **Caret 고유 기능** (setUILanguage, setModeSystem 등) 최우선 보호\n`;
    report += `3. **삭제가 의도된 것인지** vs **실수로 누락된 것인지** 판단\n`;
    report += `4. **필요한 기능은 수동으로 복구**\n`;
    report += `5. **빌드 테스트**로 검증: \`npm run build\`\n\n`;
    
    return report;
}

function main() {
    console.log('🔍 머징 차이점 분석 가이드 시작...');
    console.log('⚠️  이 결과는 참고용입니다. 반드시 수동으로 검토하세요!\n');
    
    // 명령행 인수 처리
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // 특정 파일만 분석
        const specificFile = args[0];
        console.log(`🎯 특정 파일 분석 모드: ${specificFile}`);
        
        const clineLatestFile = `cline-latest/${specificFile}`;
        const caretOriginalFile = `main-caret/${specificFile}`;
        const currentFile = specificFile;
        
        analyzeAndReport(clineLatestFile, currentFile, `Cline 최신 vs 현재 (${specificFile})`);
        analyzeAndReport(caretOriginalFile, currentFile, `Caret 원본 vs 현재 (${specificFile})`);
        
        return;
    }
    
    // 전체 디렉토리 분석
    console.log('🌍 전체 프로젝트 분석 모드');
    
    // 1. Cline 최신 vs 현재 머징 결과 (전체)
    const clineComparison = analyzeAllFiles(
        'cline-latest/webview-ui/src',
        'webview-ui/src', 
        'caret-scripts/merging-task/cline-vs-current-report.md',
        'Cline 최신 vs 현재 머징'
    );
    
    // 2. Caret 원본 vs 현재 머징 결과 (전체)  
    const caretComparison = analyzeAllFiles(
        'main-caret/webview-ui/src',
        'webview-ui/src',
        'caret-scripts/merging-task/caret-vs-current-report.md', 
        'Caret 원본 vs 현재 머징'
    );
    
    // 총 요약
    console.log('\n📋 최종 검토 가이드:');
    console.log(`\n🔍 Cline 최신과의 차이:`);
    console.log(`   ❌ 체크 필요: ${clineComparison.totalMissing}개 항목`);
    console.log(`   ✅ 새로 추가: ${clineComparison.totalExtra}개 항목`);
    console.log(`   📁 파일 차이: ${clineComparison.missingFiles}개 누락, ${clineComparison.extraFiles}개 추가`);
    
    console.log(`\n🔍 Caret 원본과의 차이:`);
    console.log(`   ❌ 체크 필요: ${caretComparison.totalMissing}개 항목`);
    console.log(`   ✅ 새로 추가: ${caretComparison.totalExtra}개 항목`);
    console.log(`   📁 파일 차이: ${caretComparison.missingFiles}개 누락, ${caretComparison.extraFiles}개 추가`);
    
    console.log('\n📝 상세 리포트:');
    console.log('   📄 caret-scripts/merging-task/cline-vs-current-report.md');
    console.log('   📄 caret-scripts/merging-task/caret-vs-current-report.md');
    
    console.log('\n💡 다음 단계:');
    console.log('1. 상세 리포트 파일들을 열어서 검토');
    console.log('2. "❌ 체크 필요" 항목들을 우선순위별로 분석');
    console.log('3. Caret 고유 기능 우선 보호');
    console.log('4. 필요한 기능은 수동으로 복구');
    
    console.log('\n🎯 특정 파일만 분석하려면:');
    console.log('   node caret-scripts/merging-task/analyze-merge-differences.js webview-ui/src/context/ExtensionStateContext.tsx');
}

main();
