#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 정확한 모델 병합 분석 스크립트 시작...\n")

// OS 무관 경로 설정 함수
function getProjectRoot() {
	let currentDir = __dirname
	while (currentDir !== path.dirname(currentDir)) {
		if (fs.existsSync(path.join(currentDir, "package.json"))) {
			return currentDir
		}
		currentDir = path.dirname(currentDir)
	}
	throw new Error("프로젝트 루트를 찾을 수 없습니다. package.json이 있는 디렉토리를 찾지 못했습니다.")
}

// OS 무관 파일 경로들
const projectRoot = getProjectRoot()
const caretApiPath = path.join(projectRoot, "src", "shared", "api.ts")
const clineApiPath = path.join(projectRoot, "cline-latest", "src", "shared", "api.ts")

console.log(`📁 프로젝트 루트: ${projectRoot}`)
console.log(`📄 Caret API: ${caretApiPath}`)
console.log(`📄 Cline API: ${clineApiPath}`)

// 파일 존재 확인
if (!fs.existsSync(caretApiPath)) {
	throw new Error(`Caret API 파일을 찾을 수 없습니다: ${caretApiPath}`)
}
if (!fs.existsSync(clineApiPath)) {
	throw new Error(`Cline API 파일을 찾을 수 없습니다: ${clineApiPath}`)
}

// API 파일들 읽기
const caretContent = fs.readFileSync(caretApiPath, "utf8")
const clineContent = fs.readFileSync(clineApiPath, "utf8")

// 간단하고 정확한 모델 정의 추출 함수 (awk와 동일한 방식)
function extractModels(content, source) {
	const models = new Map()
	const providers = new Set()

	// 프로바이더 타입 추출 (정확한 방식)
	const providerMatch = content.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (providerMatch) {
		const lines = providerMatch[0].split("\n")
		for (const line of lines) {
			const match = line.match(/^\s*\|\s*"([^"]+)"\s*$/)
			if (match) {
				providers.add(match[1])
			}
		}
	}

	console.log(`📍 ${source} 프로바이더: ${providers.size}개 -`, Array.from(providers).slice(0, 5).join(", ") + "...")

	// 모델 정의들 추출 (디버깅으로 검증된 정확한 방식)
	const lines = content.split("\n")
	let currentSection = ""

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// 모델 섹션 확인
		const sectionMatch = line.match(/export const (\w+Models) = \{/)
		if (sectionMatch) {
			currentSection = sectionMatch[1]
			continue
		}

		// 모델 정의 라인 확인 (awk 패턴과 정확히 동일)
		const modelMatch = line.match(/^\s*"([^"]+)"\s*:/)
		if (modelMatch && currentSection) {
			const modelId = modelMatch[1]

			// 고유 키 생성 (섹션 + 모델ID)
			const uniqueKey = `${currentSection}::${modelId}`

			models.set(uniqueKey, {
				modelId,
				_section: currentSection,
				_raw: line.trim(),
			})
		}
	}

	// 유니크 모델 ID 계산
	const uniqueModelIds = new Set()
	for (const [uniqueKey, modelData] of models) {
		uniqueModelIds.add(modelData.modelId)
	}

	console.log(`📍 ${source} 모델: ${models.size}개 (유니크 모델 ID: ${uniqueModelIds.size}개)`)
	return { models, providers, uniqueModelIds }
}

// 간단한 모델 설정 파싱 (정확성 우선)
function parseSimpleModelConfig(configStr) {
	const config = {}

	// 기본적인 속성들만 추출 (정확성 우선)
	const properties = [
		"maxTokens",
		"contextWindow",
		"supportsImages",
		"supportsPromptCache",
		"supportsGlobalEndpoint",
		"inputPrice",
		"outputPrice",
		"cacheWritesPrice",
		"cacheReadsPrice",
		"description",
	]

	properties.forEach((prop) => {
		// 더 정확한 정규식
		const regex = new RegExp(`${prop}\\s*:\\s*([^,\\n}]+(?:\\{[^}]*\\}[^,\\n}]*)*)`, "s")
		const match = configStr.match(regex)
		if (match) {
			let value = match[1].trim().replace(/,$/, "") // 끝에 쉼표 제거

			// 값 처리
			if (value.match(/^\d+$/)) {
				value = parseInt(value)
			} else if (value.match(/^\d+\.\d+$/)) {
				value = parseFloat(value)
			} else if (value === "true" || value === "false") {
				value = value === "true"
			} else if (value.startsWith('"') && value.endsWith('"')) {
				value = value.slice(1, -1)
			}

			config[prop] = value
		}
	})

	return config
}

// 모델 설정 파싱
function parseModelConfig(configStr) {
	const config = {}

	// 기본 속성들 추출
	const properties = [
		"maxTokens",
		"contextWindow",
		"supportsImages",
		"supportsPromptCache",
		"supportsGlobalEndpoint",
		"inputPrice",
		"outputPrice",
		"cacheWritesPrice",
		"cacheReadsPrice",
		"description",
	]

	properties.forEach((prop) => {
		const regex = new RegExp(`${prop}:\\s*([^,\\n}]+)`)
		const match = configStr.match(regex)
		if (match) {
			let value = match[1].trim()

			// 숫자 처리
			if (value.match(/^\d+(_\d+)*$/)) {
				value = parseInt(value.replace(/_/g, ""))
			} else if (value.match(/^\d+(\.\d+)?$/)) {
				value = parseFloat(value)
			} else if (value === "true" || value === "false") {
				value = value === "true"
			} else if (value.startsWith('"') && value.endsWith('"')) {
				value = value.slice(1, -1)
			}

			config[prop] = value
		}
	})

	return config
}

// 모델 비교 (고유 키 기반)
function compareModels(caretModels, clineModels) {
	const toAdd = [] // Cline에만 있는 것
	const toRemove = [] // Caret에만 있는 것 (caret 프로바이더 제외)
	const toUpdate = [] // 파라미터가 다른 것

	// Cline에만 있는 모델들 (추가해야 할 것들)
	for (const [uniqueKey, clineModel] of clineModels) {
		if (!caretModels.has(uniqueKey)) {
			toAdd.push({
				modelId: clineModel.modelId,
				section: clineModel._section,
				config: clineModel,
			})
		}
	}

	// Caret에만 있는 모델들 (삭제해야 할 것들, caret 프로바이더 제외)
	for (const [uniqueKey, caretModel] of caretModels) {
		if (!clineModels.has(uniqueKey) && caretModel._section !== "caretModels") {
			toRemove.push({
				modelId: caretModel.modelId,
				section: caretModel._section,
				config: caretModel,
			})
		}
	}

	// 둘 다 있지만 파라미터가 다른 모델들 (간단 버전 - 나중에 구현)
	// 지금은 비교를 위해서는 파라미터 파싱이 필요함

	return { toAdd, toRemove, toUpdate }
}

// 메인 실행
try {
	const caretData = extractModels(caretContent, "Caret")
	const clineData = extractModels(clineContent, "Cline")

	console.log(`\n📊 **현재 상태:**`)
	console.log(
		`🟦 Caret: ${caretData.providers.size}개 프로바이더, ${caretData.models.size}개 모델 (유니크: ${caretData.uniqueModelIds.size}개)`,
	)
	console.log(
		`🟩 Cline: ${clineData.providers.size}개 프로바이더, ${clineData.models.size}개 모델 (유니크: ${clineData.uniqueModelIds.size}개)`,
	)

	const comparison = compareModels(caretData.models, clineData.models)

	console.log(`\n🔍 **분석 결과:**`)

	// 추가해야 할 모델들
	if (comparison.toAdd.length > 0) {
		console.log(`\n➕ **추가해야 할 모델들 (${comparison.toAdd.length}개):**`)
		comparison.toAdd.forEach((item) => {
			console.log(`   • ${item.modelId} (${item.section})`)
		})
	}

	// 삭제해야 할 모델들
	if (comparison.toRemove.length > 0) {
		console.log(`\n❌ **삭제해야 할 모델들 (${comparison.toRemove.length}개):**`)
		comparison.toRemove.forEach((item) => {
			console.log(`   • ${item.modelId} (${item.section})`)
		})
	}

	// 수정해야 할 모델들
	if (comparison.toUpdate.length > 0) {
		console.log(`\n⚠️  **수정해야 할 모델들 (${comparison.toUpdate.length}개):**`)
		comparison.toUpdate.forEach((item) => {
			console.log(`   • ${item.modelId} (${item.section}):`)
			item.differences.forEach((diff) => {
				console.log(`     - ${diff.key}: ${JSON.stringify(diff.caretValue)} → ${JSON.stringify(diff.clineValue)}`)
			})
		})
	}

	// 최종 목표
	const finalProviderCount = clineData.providers.size + (caretData.providers.has("caret") ? 1 : 0)
	const finalModelCount = clineData.models.size + (caretData.models.get("caret-models") ? 1 : 0)
	const finalUniqueModelCount = clineData.uniqueModelIds.size + (caretData.uniqueModelIds.has("caret-specific-model") ? 1 : 0)

	console.log(`\n🎯 **최종 목표:**`)
	console.log(`   프로바이더: ${finalProviderCount}개 (Cline ${clineData.providers.size}개 + Caret 전용)`)
	console.log(`   모델 정의: ${finalModelCount}개 (전체) / 유니크 모델: ${finalUniqueModelCount}개`)
	console.log(`   📋 문서화용: "총 ${finalUniqueModelCount}개 고유 AI 모델을 ${finalProviderCount}개 프로바이더에서 지원"`)

	console.log(`\n✅ 분석 완료!`)
} catch (error) {
	console.error("❌ 스크립트 실행 중 오류:", error.message)
	process.exit(1)
}
