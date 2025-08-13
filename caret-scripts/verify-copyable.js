#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 복붙용 파일 검증 스크립트...\n")

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
const copyablePath = path.join(projectRoot, "src", "shared", "api-copyable.ts")
const clineApiPath = path.join(projectRoot, "cline-latest", "src", "shared", "api.ts")
const caretApiPath = path.join(projectRoot, "src", "shared", "api.ts")

// 파일들 읽기
const copyableContent = fs.readFileSync(copyablePath, "utf8")
const clineContent = fs.readFileSync(clineApiPath, "utf8")
const caretContent = fs.readFileSync(caretApiPath, "utf8")

console.log(`📄 복붙용 파일: ${Math.round((copyableContent.length / 1024) * 100) / 100} KB`)
console.log(`📄 Cline 원본: ${Math.round((clineContent.length / 1024) * 100) / 100} KB`)
console.log(`📄 Caret 원본: ${Math.round((caretContent.length / 1024) * 100) / 100} KB`)

// 모델 및 함수 추출
function analyzeContent(content, source) {
	const models = new Map()
	const providers = new Set()
	const functions = []
	const types = []

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

	return { models, providers, uniqueModelIds, functions, types }
}

// 메인 실행
try {
	console.log("🔍 1단계: 각 파일 분석...")
	const copyableData = analyzeContent(copyableContent, "복붙용 파일")
	const clineData = analyzeContent(clineContent, "Cline 원본")
	const caretData = analyzeContent(caretContent, "Caret 원본")

	console.log("\n🔍 2단계: 모델 동기화 검증...")

	// Cline과 복붙용 파일 모델 비교
	const missingFromCline = []
	const extraFromCline = []

	for (const [key, model] of clineData.models) {
		if (!copyableData.models.has(key)) {
			missingFromCline.push(model)
		}
	}

	for (const [key, model] of copyableData.models) {
		if (!clineData.models.has(key)) {
			extraFromCline.push(model)
		}
	}

	if (missingFromCline.length === 0 && extraFromCline.length === 0) {
		console.log("✅ 모델 동기화 완벽!")
	} else {
		console.log(`❌ 모델 동기화 문제: 누락 ${missingFromCline.length}개, 추가 ${extraFromCline.length}개`)
	}

	console.log("\n🔍 3단계: Caret 함수 보존 검증...")

	// Caret 함수들이 복붙용 파일에 보존되었는지 확인
	const missingFunctions = caretData.functions.filter((f) => !copyableData.functions.includes(f))
	const missingTypes = caretData.types.filter((t) => !copyableData.types.includes(t))

	if (missingFunctions.length === 0 && missingTypes.length === 0) {
		console.log("✅ Caret 함수/타입 완벽 보존!")
	} else {
		console.log(`❌ 누락된 함수: ${missingFunctions.length}개`)
		console.log(`❌ 누락된 타입: ${missingTypes.length}개`)

		if (missingFunctions.length > 0) {
			console.log("누락 함수들:", missingFunctions.slice(0, 5).join(", "))
		}
		if (missingTypes.length > 0) {
			console.log("누락 타입들:", missingTypes.slice(0, 5).join(", "))
		}
	}

	console.log("\n🔍 4단계: 프로바이더 확장 검증...")

	const newProviders = [...copyableData.providers].filter((p) => !caretData.providers.has(p))
	const lostProviders = [...caretData.providers].filter((p) => !copyableData.providers.has(p))

	if (newProviders.length > 0) {
		console.log(`➕ 새 프로바이더 (${newProviders.length}개): ${newProviders.join(", ")}`)
	}
	if (lostProviders.length > 0) {
		console.log(`❌ 손실 프로바이더 (${lostProviders.length}개): ${lostProviders.join(", ")}`)
	}

	console.log("\n🎯 **최종 평가:**")

	const isModelPerfect = missingFromCline.length === 0 && extraFromCline.length === 0
	const isFunctionPerfect = missingFunctions.length === 0 && missingTypes.length === 0
	const isProviderGood = lostProviders.length === 0

	if (isModelPerfect && isFunctionPerfect && isProviderGood) {
		console.log("🎉 **완벽한 복붙용 파일 생성 성공!**")
		console.log("✅ Cline 모델 100% 동기화")
		console.log("✅ Caret 함수/타입 100% 보존")
		console.log("✅ 프로바이더 확장 완료")
		console.log("\n🚀 이제 안전하게 복붙하실 수 있습니다!")
	} else {
		console.log("⚠️ **일부 문제 발견**")
		console.log(`   모델 동기화: ${isModelPerfect ? "✅" : "❌"}`)
		console.log(`   함수 보존: ${isFunctionPerfect ? "✅" : "❌"}`)
		console.log(`   프로바이더: ${isProviderGood ? "✅" : "❌"}`)
	}

	console.log(`\n📊 **최종 수치:**`)
	console.log(`   프로바이더: ${copyableData.providers.size}개`)
	console.log(`   유니크 모델: ${copyableData.uniqueModelIds.size}개`)
	console.log(`   함수: ${copyableData.functions.length}개`)
	console.log(`   타입: ${copyableData.types.length}개`)
} catch (error) {
	console.error("❌ 검증 실행 중 오류:", error.message)
	process.exit(1)
}
