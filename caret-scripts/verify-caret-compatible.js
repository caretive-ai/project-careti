#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Caret 호환 파일 검증 스크립트...\n")

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
const compatiblePath = path.join(projectRoot, "src", "shared", "api-caret-compatible.ts")
const clineApiPath = path.join(projectRoot, "cline-latest", "src", "shared", "api.ts")
const caretApiPath = path.join(projectRoot, "src", "shared", "api.ts")

// 파일들 읽기
const compatibleContent = fs.readFileSync(compatiblePath, "utf8")
const clineContent = fs.readFileSync(clineApiPath, "utf8")
const caretContent = fs.readFileSync(caretApiPath, "utf8")

console.log(`📄 호환 파일: ${Math.round((compatibleContent.length / 1024) * 100) / 100} KB`)
console.log(`📄 Cline 원본: ${Math.round((clineContent.length / 1024) * 100) / 100} KB`)
console.log(`📄 Caret 원본: ${Math.round((caretContent.length / 1024) * 100) / 100} KB`)

// 모델 및 구조 분석
function analyzeStructure(content, source) {
	const models = new Map()
	const providers = new Set()
	const functions = []
	const types = []
	const hasCaretStructure = {
		apiHandlerOptions: false,
		apiConfiguration: false,
		singleModeFields: false,
		planActFields: false,
	}

	const lines = content.split("\n")

	// 프로바이더 추출
	const providerMatch = content.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (providerMatch) {
		const providerLines = providerMatch[0].split("\n")
		for (const line of providerLines) {
			const match = line.match(/^\s*\|\s*"([^"]+)"\s*/)
			if (match) {
				providers.add(match[1])
			}
		}
	}

	// 구조 검사
	hasCaretStructure.apiHandlerOptions = content.includes("export interface ApiHandlerOptions")
	hasCaretStructure.apiConfiguration = content.includes("export type ApiConfiguration = ApiHandlerOptions")
	hasCaretStructure.singleModeFields = content.includes("openAiModelId?:") && content.includes("ollamaModelId?:")
	hasCaretStructure.planActFields = content.includes("planModeApiModelId") || content.includes("actModeApiModelId")

	// 모델 추출
	let currentSection = ""
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		const sectionMatch = line.match(/export const (\w+Models) = \{/)
		if (sectionMatch) {
			currentSection = sectionMatch[1]
			continue
		}

		const modelMatch = line.match(/^\s*"([^"]+)"\s*:/)
		if (modelMatch && currentSection) {
			const modelId = modelMatch[1]
			const uniqueKey = `${currentSection}::${modelId}`
			models.set(uniqueKey, { modelId, _section: currentSection })
		}

		// 함수 추출
		const funcMatch = line.match(
			/^export const (\w+DefaultModelId|normalizeApiConfiguration|\w+DefaultURL|\w+DefaultApiVersion|\w+ModelInfoSaneDefaults|\w+GlobalModels)/,
		)
		if (funcMatch) {
			functions.push(funcMatch[1])
		}

		// 타입 추출
		const typeMatch = line.match(/^export type (\w+ModelId) =/)
		if (typeMatch) {
			types.push(typeMatch[1])
		}
	}

	const uniqueModelIds = new Set()
	for (const [key, model] of models) {
		uniqueModelIds.add(model.modelId)
	}

	console.log(`📊 ${source}:`)
	console.log(`   프로바이더: ${providers.size}개`)
	console.log(`   모델 정의: ${models.size}개 (유니크: ${uniqueModelIds.size}개)`)
	console.log(`   함수: ${functions.length}개`)
	console.log(`   타입: ${types.length}개`)
	console.log(`   구조: ${hasCaretStructure.singleModeFields ? "Caret" : "Cline"} 스타일`)

	return { models, providers, uniqueModelIds, functions, types, hasCaretStructure }
}

// 메인 실행
try {
	console.log("🔍 1단계: 각 파일 구조 분석...")
	const compatibleData = analyzeStructure(compatibleContent, "호환 파일")
	const clineData = analyzeStructure(clineContent, "Cline 원본")
	const caretData = analyzeStructure(caretContent, "Caret 원본")

	console.log("\n🔍 2단계: Caret 구조 호환성 검증...")

	const structureCheck = {
		hasCaretInterface: compatibleData.hasCaretStructure.apiHandlerOptions,
		hasCaretConfig: compatibleData.hasCaretStructure.apiConfiguration,
		hasSingleMode: compatibleData.hasCaretStructure.singleModeFields,
		noPlanAct: !compatibleData.hasCaretStructure.planActFields,
	}

	console.log(`   ✅ ApiHandlerOptions 인터페이스: ${structureCheck.hasCaretInterface ? "✅" : "❌"}`)
	console.log(`   ✅ ApiConfiguration 타입: ${structureCheck.hasCaretConfig ? "✅" : "❌"}`)
	console.log(`   ✅ 단일 모드 필드들: ${structureCheck.hasSingleMode ? "✅" : "❌"}`)
	console.log(`   ✅ Plan/Act 필드 없음: ${structureCheck.noPlanAct ? "✅" : "❌"}`)

	console.log("\n🔍 3단계: Cline 모델 동기화 검증...")

	// Cline과 호환 파일 모델 비교
	const missingFromCline = []
	const extraFromCline = []

	for (const [key, model] of clineData.models) {
		if (!compatibleData.models.has(key)) {
			missingFromCline.push(model)
		}
	}

	for (const [key, model] of compatibleData.models) {
		if (!clineData.models.has(key)) {
			extraFromCline.push(model)
		}
	}

	console.log(`   모델 동기화: ${missingFromCline.length === 0 ? "✅" : "❌"} (누락: ${missingFromCline.length}개)`)

	if (missingFromCline.length > 0) {
		console.log(`   누락된 모델들:`)
		missingFromCline.slice(0, 5).forEach((m) => console.log(`      • ${m.modelId} (${m._section})`))
		if (missingFromCline.length > 5) {
			console.log(`      ... 및 ${missingFromCline.length - 5}개 더`)
		}
	}

	console.log("\n🔍 4단계: Caret 함수 보존 검증...")

	// Caret 함수들이 호환 파일에 보존되었는지 확인
	const missingFunctions = caretData.functions.filter((f) => !compatibleData.functions.includes(f))
	const missingTypes = caretData.types.filter((t) => !compatibleData.types.includes(t))

	console.log(`   함수 보존: ${missingFunctions.length === 0 ? "✅" : "❌"} (누락: ${missingFunctions.length}개)`)
	console.log(`   타입 보존: ${missingTypes.length === 0 ? "✅" : "❌"} (누락: ${missingTypes.length}개)`)

	if (missingFunctions.length > 0) {
		console.log(`   누락된 함수들: ${missingFunctions.slice(0, 3).join(", ")}${missingFunctions.length > 3 ? "..." : ""}`)
	}

	console.log("\n🔍 5단계: 프로바이더 확장 검증...")

	const newProviders = [...compatibleData.providers].filter((p) => !caretData.providers.has(p))
	const lostProviders = [...caretData.providers].filter((p) => !compatibleData.providers.has(p))

	console.log(`   프로바이더 확장: ${newProviders.length >= 10 ? "✅" : "❌"} (${newProviders.length}개 추가)`)
	console.log(`   프로바이더 보존: ${lostProviders.length === 0 ? "✅" : "❌"} (${lostProviders.length}개 손실)`)

	console.log("\n🎯 **최종 평가:**")

	const isStructureGood = Object.values(structureCheck).every((v) => v)
	const isModelSyncGood = missingFromCline.length === 0
	const isFunctionGood = missingFunctions.length === 0 && missingTypes.length === 0
	const isProviderGood = newProviders.length >= 10 && lostProviders.length === 0

	if (isStructureGood && isModelSyncGood && isFunctionGood && isProviderGood) {
		console.log("🎉 **완벽한 Caret 호환 파일 생성 성공!**")
		console.log("✅ Caret 구조 100% 호환")
		console.log("✅ Cline 모델 100% 동기화")
		console.log("✅ Caret 함수/타입 100% 보존")
		console.log("✅ 프로바이더 대폭 확장")
		console.log("\n🚀 이제 안전하게 복붙하실 수 있습니다!")
	} else {
		console.log("⚠️ **일부 문제 발견**")
		console.log(`   Caret 구조: ${isStructureGood ? "✅" : "❌"}`)
		console.log(`   모델 동기화: ${isModelSyncGood ? "✅" : "❌"}`)
		console.log(`   함수 보존: ${isFunctionGood ? "✅" : "❌"}`)
		console.log(`   프로바이더: ${isProviderGood ? "✅" : "❌"}`)
	}

	console.log(`\n📊 **최종 수치:**`)
	console.log(
		`   프로바이더: ${compatibleData.providers.size}개 (원본 ${caretData.providers.size}개 → ${compatibleData.providers.size}개)`,
	)
	console.log(
		`   유니크 모델: ${compatibleData.uniqueModelIds.size}개 (원본 ${caretData.uniqueModelIds.size}개 → ${compatibleData.uniqueModelIds.size}개)`,
	)
	console.log(`   함수: ${compatibleData.functions.length}개`)
	console.log(`   타입: ${compatibleData.types.length}개`)
} catch (error) {
	console.error("❌ 검증 실행 중 오류:", error.message)
	process.exit(1)
}
