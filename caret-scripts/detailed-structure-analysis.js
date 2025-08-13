#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Caret 원본 vs 생성된 파일 구조적 차이 분석...\n")

// OS 무관 경로 설정
function getProjectRoot() {
	let currentDir = __dirname
	while (currentDir !== path.dirname(currentDir)) {
		if (fs.existsSync(path.join(currentDir, "package.json"))) {
			return currentDir
		}
		currentDir = path.dirname(currentDir)
	}
	throw new Error("프로젝트 루트를 찾을 수 없습니다.")
}

const projectRoot = getProjectRoot()
const originalPath = path.join(projectRoot, "src", "shared", "api.ts")
const newPath = path.join(projectRoot, "src", "shared", "api-new.ts")

// 파일들 읽기
const originalContent = fs.readFileSync(originalPath, "utf8")
const newContent = fs.readFileSync(newPath, "utf8")

console.log(`📄 원본 Caret: ${Math.round((originalContent.length / 1024) * 100) / 100} KB`)
console.log(`📄 생성된 파일: ${Math.round((newContent.length / 1024) * 100) / 100} KB`)

// 구조적 요소들 추출 함수
function analyzeStructure(content, source) {
	const structure = {
		imports: [],
		types: [],
		interfaces: [],
		constants: [],
		functions: [],
		exports: [],
		comments: [],
		caretModifications: [],
	}

	const lines = content.split("\n")

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim()

		// Import 문
		if (line.startsWith("import ")) {
			structure.imports.push(line)
		}

		// Type 정의
		else if (line.startsWith("export type ") || line.match(/^type \w+/)) {
			const typeName = line.match(/type (\w+)/)?.[1]
			structure.types.push(typeName || line)
		}

		// Interface 정의
		else if (line.startsWith("export interface ") || line.match(/^interface \w+/)) {
			const interfaceName = line.match(/interface (\w+)/)?.[1]
			structure.interfaces.push(interfaceName || line)
		}

		// Constant 정의 (모델 섹션들)
		else if (line.startsWith("export const ")) {
			const constName = line.match(/export const (\w+)/)?.[1]
			structure.constants.push(constName || line)
		}

		// Function 정의
		else if (line.match(/^export (function|const \w+ = |async function)/)) {
			const funcName = line.match(/(function|const) (\w+)/)?.[2]
			structure.functions.push(funcName || line)
		}

		// Export 문
		else if (line.startsWith("export ") && !line.includes("const") && !line.includes("type") && !line.includes("interface")) {
			structure.exports.push(line)
		}

		// CARET MODIFICATION 주석
		if (line.includes("CARET MODIFICATION")) {
			structure.caretModifications.push({
				line: i + 1,
				content: line,
				context: lines.slice(Math.max(0, i - 1), i + 2),
			})
		}

		// 중요한 주석들
		if (
			line.startsWith("//") &&
			(line.includes("TODO") || line.includes("FIXME") || line.includes("NOTE") || line.includes("CARET"))
		) {
			structure.comments.push({
				line: i + 1,
				content: line,
			})
		}
	}

	console.log(`\n📊 ${source} 구조 분석:`)
	console.log(`   📥 Imports: ${structure.imports.length}개`)
	console.log(`   🏷️  Types: ${structure.types.length}개`)
	console.log(`   🔧 Interfaces: ${structure.interfaces.length}개`)
	console.log(`   📦 Constants: ${structure.constants.length}개`)
	console.log(`   ⚙️  Functions: ${structure.functions.length}개`)
	console.log(`   📤 Exports: ${structure.exports.length}개`)
	console.log(`   💬 중요 주석: ${structure.comments.length}개`)
	console.log(`   🎯 CARET 수정사항: ${structure.caretModifications.length}개`)

	return structure
}

// 특정 패턴들 검사
function checkSpecificPatterns(content, source) {
	const patterns = {
		apiConfiguration: content.includes("ApiConfiguration"),
		modelInfo: content.includes("ModelInfo"),
		apiHandlerOptions: content.includes("ApiHandlerOptions"),
		caretProvider: content.includes('"caret"'),
		clineProvider: content.includes('"cline"'),
		caretApiKey: content.includes("caretApiKey"),
		clineApiKey: content.includes("clineApiKey"),
		planMode: content.includes("planMode"),
		actMode: content.includes("actMode"),
		favoritedModelIds: content.includes("favoritedModelIds"),
		defaultModel: content.includes("defaultModel") || content.includes("DEFAULT_MODEL"),
		getModelMaxTokens: content.includes("getModelMaxTokens"),
		getModelSupportsImages: content.includes("getModelSupportsImages"),
		getModelInfo: content.includes("getModelInfo"),
	}

	console.log(`\n🔍 ${source} 핵심 패턴 검사:`)
	Object.entries(patterns).forEach(([key, exists]) => {
		const status = exists ? "✅" : "❌"
		console.log(`   ${status} ${key}: ${exists ? "존재" : "없음"}`)
	})

	return patterns
}

// 누락된 함수들 찾기
function findMissingFunctions(originalContent, newContent) {
	const originalFunctions = []
	const newFunctions = []

	// 함수 정의 패턴들
	const functionPatterns = [/export\s+(function|const)\s+(\w+)/g, /export\s+\{[^}]*\}/g]

	functionPatterns.forEach((pattern) => {
		let match
		while ((match = pattern.exec(originalContent)) !== null) {
			if (match[2]) originalFunctions.push(match[2])
		}

		pattern.lastIndex = 0 // 정규식 리셋
		while ((match = pattern.exec(newContent)) !== null) {
			if (match[2]) newFunctions.push(match[2])
		}
	})

	const missing = originalFunctions.filter((func) => !newFunctions.includes(func))
	const added = newFunctions.filter((func) => !originalFunctions.includes(func))

	return { missing, added, originalFunctions, newFunctions }
}

// 메인 실행
try {
	console.log("🔍 1단계: 구조적 요소 분석...")
	const originalStructure = analyzeStructure(originalContent, "원본 Caret")
	const newStructure = analyzeStructure(newContent, "생성된 파일")

	console.log("\n🔍 2단계: 핵심 패턴 검사...")
	const originalPatterns = checkSpecificPatterns(originalContent, "원본 Caret")
	const newPatterns = checkSpecificPatterns(newContent, "생성된 파일")

	console.log("\n🔍 3단계: 함수 및 유틸리티 비교...")
	const functionComparison = findMissingFunctions(originalContent, newContent)

	if (functionComparison.missing.length > 0) {
		console.log(`\n❌ **누락된 함수들 (${functionComparison.missing.length}개):**`)
		functionComparison.missing.forEach((func) => {
			console.log(`   • ${func}`)
		})
	}

	if (functionComparison.added.length > 0) {
		console.log(`\n➕ **새로 추가된 함수들 (${functionComparison.added.length}개):**`)
		functionComparison.added.forEach((func) => {
			console.log(`   • ${func}`)
		})
	}

	console.log("\n🔍 4단계: CARET 고유 기능 보존 확인...")

	// CARET MODIFICATION 비교
	const originalCaretMods = originalStructure.caretModifications.length
	const newCaretMods = newStructure.caretModifications.length

	console.log(`   CARET MODIFICATION: 원본 ${originalCaretMods}개 → 생성 ${newCaretMods}개`)

	if (originalCaretMods > newCaretMods) {
		console.log(`   ⚠️  ${originalCaretMods - newCaretMods}개 CARET 수정사항이 누락되었을 수 있습니다!`)
	}

	// 중요한 누락 사항들 체크
	const criticalMissing = []

	if (originalPatterns.getModelMaxTokens && !newPatterns.getModelMaxTokens) {
		criticalMissing.push("getModelMaxTokens 함수")
	}
	if (originalPatterns.getModelSupportsImages && !newPatterns.getModelSupportsImages) {
		criticalMissing.push("getModelSupportsImages 함수")
	}
	if (originalPatterns.getModelInfo && !newPatterns.getModelInfo) {
		criticalMissing.push("getModelInfo 함수")
	}
	if (originalPatterns.defaultModel && !newPatterns.defaultModel) {
		criticalMissing.push("기본 모델 설정")
	}

	console.log("\n🎯 **최종 평가:**")

	if (criticalMissing.length > 0) {
		console.log("❌ **구조적 문제 발견!** 다음 중요 기능들이 누락되었습니다:")
		criticalMissing.forEach((item) => {
			console.log(`   • ${item}`)
		})
		console.log("\n🚨 **권장사항**: 단순 교체하지 말고 누락된 부분을 수동으로 병합해야 합니다!")
	} else if (functionComparison.missing.length > 0) {
		console.log("⚠️  **일부 함수 누락.** 검토 후 수동 병합을 권장합니다.")
	} else {
		console.log("✅ **구조적으로 안전함.** 교체 가능하지만 CARET 고유 부분 확인 필요.")
	}

	console.log(`\n📋 **요약:**`)
	console.log(`   원본 크기: ${Math.round((originalContent.length / 1024) * 100) / 100} KB`)
	console.log(`   생성 크기: ${Math.round((newContent.length / 1024) * 100) / 100} KB`)
	console.log(`   누락 함수: ${functionComparison.missing.length}개`)
	console.log(`   CARET 수정사항: ${originalCaretMods} → ${newCaretMods}`)
	console.log(`   중요 누락: ${criticalMissing.length}개`)
} catch (error) {
	console.error("❌ 분석 실행 중 오류:", error.message)
	process.exit(1)
}
