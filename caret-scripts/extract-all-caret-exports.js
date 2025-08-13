#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Caret 원본 모든 export 추출...\n")

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
const caretApiPath = path.join(projectRoot, "src", "shared", "api.ts")
const compatiblePath = path.join(projectRoot, "src", "shared", "api-caret-compatible.ts")

// 파일들 읽기
const caretContent = fs.readFileSync(caretApiPath, "utf8")
const compatibleContent = fs.readFileSync(compatiblePath, "utf8")

// 모든 export 추출
function extractAllExports(content, source) {
	const exports = new Map()
	const lines = content.split("\n")

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// export type
		const typeMatch = line.match(/^export type (\w+)/)
		if (typeMatch) {
			exports.set(typeMatch[1], { type: "type", line: line, lineNum: i + 1 })
			continue
		}

		// export interface
		const interfaceMatch = line.match(/^export interface (\w+)/)
		if (interfaceMatch) {
			exports.set(interfaceMatch[1], { type: "interface", line: line, lineNum: i + 1 })
			continue
		}

		// export const
		const constMatch = line.match(/^export const (\w+)/)
		if (constMatch) {
			exports.set(constMatch[1], { type: "const", line: line, lineNum: i + 1 })
			continue
		}

		// export function
		const funcMatch = line.match(/^export function (\w+)/)
		if (funcMatch) {
			exports.set(funcMatch[1], { type: "function", line: line, lineNum: i + 1 })
			continue
		}
	}

	console.log(`📊 ${source}:`)
	console.log(`   총 export: ${exports.size}개`)

	const byType = {}
	for (const [name, info] of exports) {
		if (!byType[info.type]) byType[info.type] = []
		byType[info.type].push(name)
	}

	for (const [type, names] of Object.entries(byType)) {
		console.log(`   ${type}: ${names.length}개`)
	}

	return exports
}

// 메인 실행
try {
	console.log("🔍 1단계: Caret 원본 export 추출...")
	const caretExports = extractAllExports(caretContent, "Caret 원본")

	console.log("\n🔍 2단계: 호환 파일 export 추출...")
	const compatibleExports = extractAllExports(compatibleContent, "호환 파일")

	console.log("\n🔍 3단계: 누락된 export 분석...")

	const missing = []
	for (const [name, info] of caretExports) {
		if (!compatibleExports.has(name)) {
			missing.push({ name, ...info })
		}
	}

	console.log(`\n❌ 누락된 export: ${missing.length}개`)

	if (missing.length > 0) {
		const byType = {}
		for (const item of missing) {
			if (!byType[item.type]) byType[item.type] = []
			byType[item.type].push(item)
		}

		for (const [type, items] of Object.entries(byType)) {
			console.log(`\n📋 누락된 ${type} (${items.length}개):`)
			items.forEach((item) => {
				console.log(`   • ${item.name} (라인 ${item.lineNum})`)
				console.log(`     ${item.line}`)
			})
		}

		console.log(`\n🔧 해결 방법:`)
		console.log(`1. 이 export들을 api-caret-compatible.ts에 수동 추가`)
		console.log(`2. 또는 생성 스크립트 개선`)
	} else {
		console.log("✅ 모든 export가 완벽하게 보존되었습니다!")
	}
} catch (error) {
	console.error("❌ 추출 실행 중 오류:", error.message)
	process.exit(1)
}
