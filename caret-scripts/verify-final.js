#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🎯 최종 완벽 검증 스크립트...\n")

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
const fixedPath = path.join(projectRoot, "src", "shared", "api-caret-fixed.ts")
const clineApiPath = path.join(projectRoot, "cline-latest", "src", "shared", "api.ts")

// 파일들 읽기
const caretContent = fs.readFileSync(caretApiPath, "utf8")
const fixedContent = fs.readFileSync(fixedPath, "utf8")
const clineContent = fs.readFileSync(clineApiPath, "utf8")

console.log(`📄 Caret 원본: ${Math.round((caretContent.length / 1024) * 100) / 100} KB`)
console.log(`📄 수정된 파일: ${Math.round((fixedContent.length / 1024) * 100) / 100} KB`)
console.log(`📄 Cline 원본: ${Math.round((clineContent.length / 1024) * 100) / 100} KB`)

// 모든 export 추출
function extractAllExports(content) {
	const exports = new Map()
	const lines = content.split("\n")

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		const exportMatch = line.match(/^export (type|interface|const|function) (\w+)/)
		if (exportMatch) {
			exports.set(exportMatch[2], exportMatch[1])
		}
	}

	return exports
}

// 모델 추출
function extractModels(content) {
	const models = new Set()
	const lines = content.split("\n")

	let inModelSection = false
	for (const line of lines) {
		if (line.match(/export const \w+Models = \{/)) {
			inModelSection = true
			continue
		}

		if (inModelSection) {
			const modelMatch = line.match(/^\s*"([^"]+)"\s*:/)
			if (modelMatch) {
				models.add(modelMatch[1])
			}

			if (line.includes("}")) {
				inModelSection = false
			}
		}
	}

	return models
}

// 프로바이더 추출
function extractProviders(content) {
	const providers = new Set()
	const providerMatch = content.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)

	if (providerMatch) {
		const lines = providerMatch[0].split("\n")
		for (const line of lines) {
			const match = line.match(/^\s*\|\s*"([^"]+)"\s*/)
			if (match) {
				providers.add(match[1])
			}
		}
	}

	return providers
}

// 메인 실행
try {
	console.log("\n🔍 1단계: Export 완전성 검증...")

	const caretExports = extractAllExports(caretContent)
	const fixedExports = extractAllExports(fixedContent)

	const missingExports = []
	for (const [name, type] of caretExports) {
		if (!fixedExports.has(name)) {
			missingExports.push({ name, type })
		}
	}

	console.log(`   Caret 원본: ${caretExports.size}개 export`)
	console.log(`   수정된 파일: ${fixedExports.size}개 export`)
	console.log(`   누락: ${missingExports.length}개`)

	if (missingExports.length === 0) {
		console.log("   ✅ 모든 export 완벽 보존!")
	} else {
		console.log("   ❌ 여전히 누락된 export:")
		missingExports.forEach((e) => console.log(`      • ${e.name} (${e.type})`))
	}

	console.log("\n🔍 2단계: 모델 동기화 검증...")

	const clineModels = extractModels(clineContent)
	const fixedModels = extractModels(fixedContent)

	const missingModels = [...clineModels].filter((m) => !fixedModels.has(m))
	const extraModels = [...fixedModels].filter((m) => !clineModels.has(m))

	console.log(`   Cline 모델: ${clineModels.size}개`)
	console.log(`   수정된 파일 모델: ${fixedModels.size}개`)
	console.log(`   누락 모델: ${missingModels.length}개`)
	console.log(`   추가 모델: ${extraModels.length}개`)

	if (missingModels.length === 0) {
		console.log("   ✅ Cline 모델 100% 동기화!")
	} else {
		console.log("   ❌ 누락된 모델들:")
		missingModels.slice(0, 5).forEach((m) => console.log(`      • ${m}`))
	}

	console.log("\n🔍 3단계: 프로바이더 확장 검증...")

	const caretProviders = extractProviders(caretContent)
	const fixedProviders = extractProviders(fixedContent)
	const clineProviders = extractProviders(clineContent)

	const newProviders = [...fixedProviders].filter((p) => !caretProviders.has(p))
	const lostProviders = [...caretProviders].filter((p) => !fixedProviders.has(p))

	console.log(`   Caret 원본: ${caretProviders.size}개`)
	console.log(`   수정된 파일: ${fixedProviders.size}개`)
	console.log(`   Cline: ${clineProviders.size}개`)
	console.log(`   새로 추가: ${newProviders.length}개`)
	console.log(`   손실: ${lostProviders.length}개`)

	if (lostProviders.length === 0 && newProviders.length >= 10) {
		console.log("   ✅ 프로바이더 완벽 확장!")
	}

	console.log("\n🔍 4단계: Caret 구조 호환성 검증...")

	const hasApiHandlerOptions = fixedContent.includes("export interface ApiHandlerOptions")
	const hasApiConfiguration = fixedContent.includes("export type ApiConfiguration = ApiHandlerOptions")
	const hasSingleMode = fixedContent.includes("openAiModelId?:") && fixedContent.includes("ollamaModelId?:")
	const noPlanAct = !fixedContent.includes("planModeApiModelId") && !fixedContent.includes("actModeApiModelId")

	console.log(`   ApiHandlerOptions: ${hasApiHandlerOptions ? "✅" : "❌"}`)
	console.log(`   ApiConfiguration: ${hasApiConfiguration ? "✅" : "❌"}`)
	console.log(`   단일 모드 필드: ${hasSingleMode ? "✅" : "❌"}`)
	console.log(`   Plan/Act 필드 없음: ${noPlanAct ? "✅" : "❌"}`)

	const structureGood = hasApiHandlerOptions && hasApiConfiguration && hasSingleMode && noPlanAct

	console.log("\n🎯 **최종 평가:**")

	const exportGood = missingExports.length === 0
	const modelGood = missingModels.length === 0
	const providerGood = lostProviders.length === 0 && newProviders.length >= 10

	if (exportGood && modelGood && providerGood && structureGood) {
		console.log("🎉 **완벽한 Caret 호환 파일 완성!**")
		console.log("✅ Export 100% 보존")
		console.log("✅ Cline 모델 100% 동기화")
		console.log("✅ 프로바이더 대폭 확장")
		console.log("✅ Caret 구조 100% 호환")
		console.log("\n🚀 **이제 안전하게 복붙하세요!**")
		console.log(`📁 파일: ${fixedPath}`)
	} else {
		console.log("⚠️ **일부 문제 발견**")
		console.log(`   Export 보존: ${exportGood ? "✅" : "❌"}`)
		console.log(`   모델 동기화: ${modelGood ? "✅" : "❌"}`)
		console.log(`   프로바이더: ${providerGood ? "✅" : "❌"}`)
		console.log(`   구조 호환: ${structureGood ? "✅" : "❌"}`)
	}

	console.log(`\n📊 **최종 수치:**`)
	console.log(`   프로바이더: ${fixedProviders.size}개 (${caretProviders.size}개 → ${fixedProviders.size}개)`)
	console.log(`   모델: ${fixedModels.size}개 (유니크)`)
	console.log(`   Export: ${fixedExports.size}개`)
	console.log(`   파일 크기: ${Math.round((fixedContent.length / 1024) * 100) / 100} KB`)
} catch (error) {
	console.error("❌ 검증 실행 중 오류:", error.message)
	process.exit(1)
}
