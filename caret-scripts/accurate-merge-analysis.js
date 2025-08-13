#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 정확한 모델 병합 분석 스크립트 시작...\n")

// 파일 경로들
const caretApiPath = "/home/luke/caret/src/shared/api.ts"
const clineApiPath = "/home/luke/caret/cline-latest/src/shared/api.ts"

// API 파일들 읽기
const caretContent = fs.readFileSync(caretApiPath, "utf8")
const clineContent = fs.readFileSync(clineApiPath, "utf8")

// 모델 정의 추출 함수
function extractModels(content, source) {
	const models = new Map()
	const providers = new Set()

	// 프로바이더 타입 추출 (멀티라인)
	const providerMatch = content.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (providerMatch) {
		const providerTypes = providerMatch[0].match(/"[^"]+"/g) || []
		providerTypes.forEach((p) => providers.add(p.replace(/"/g, "")))
	}

	console.log(`📍 ${source} 프로바이더들:`, Array.from(providers).join(", "))

	// 모델 정의들 추출 (각 프로바이더별)
	const modelSections = [
		"anthropicModels",
		"claudeCodeModels",
		"bedrockModels",
		"vertexModels",
		"geminiModels",
		"openAiNativeModels",
		"openAiModels",
		"azureOpenAiModels",
		"openRouterModels",
		"deepSeekModels",
		"huggingFaceModels",
		"internationalQwenModels",
		"xaiModels",
		"mistralModels",
		"cerebrasModels",
		"groqModels",
		"sapAiCoreModels",
		"moonshotModels",
		"huaweiCloudMaasModels",
		"basetenModels",
		"caretModels", // Caret 전용
	]

	modelSections.forEach((section) => {
		// 각 모델 섹션의 모델들 추출
		const sectionRegex = new RegExp(`export const ${section}[\\s\\S]*?= \\{([\\s\\S]*?)\\}\\s*(?:export|$)`, "m")
		const sectionMatch = content.match(sectionRegex)

		if (sectionMatch) {
			const sectionContent = sectionMatch[1]
			const modelMatches = sectionContent.matchAll(/"([^"]+)":\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g)

			for (const match of modelMatches) {
				const modelId = match[1]
				const modelConfig = match[2]

				// 모델 설정 파싱
				const parsed = parseModelConfig(modelConfig)
				models.set(modelId, {
					...parsed,
					_section: section,
					_raw: modelConfig.trim(),
				})
			}
		}
	})

	return { models, providers }
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

// 모델 비교
function compareModels(caretModels, clineModels) {
	const toAdd = [] // Cline에만 있는 것
	const toRemove = [] // Caret에만 있는 것 (caret 프로바이더 제외)
	const toUpdate = [] // 파라미터가 다른 것

	// Cline에만 있는 모델들 (추가해야 할 것들)
	for (const [modelId, clineModel] of clineModels) {
		if (!caretModels.has(modelId)) {
			toAdd.push({
				modelId,
				section: clineModel._section,
				config: clineModel,
			})
		}
	}

	// Caret에만 있는 모델들 (삭제해야 할 것들, caret 프로바이더 제외)
	for (const [modelId, caretModel] of caretModels) {
		if (!clineModels.has(modelId) && caretModel._section !== "caretModels") {
			toRemove.push({
				modelId,
				section: caretModel._section,
				config: caretModel,
			})
		}
	}

	// 둘 다 있지만 파라미터가 다른 모델들
	for (const [modelId, clineModel] of clineModels) {
		if (caretModels.has(modelId)) {
			const caretModel = caretModels.get(modelId)

			// 파라미터 비교
			const differences = []
			const allKeys = new Set([...Object.keys(clineModel), ...Object.keys(caretModel)])

			for (const key of allKeys) {
				if (key.startsWith("_")) continue // 내부 키 제외

				const clineValue = clineModel[key]
				const caretValue = caretModel[key]

				if (JSON.stringify(clineValue) !== JSON.stringify(caretValue)) {
					differences.push({
						key,
						clineValue,
						caretValue,
					})
				}
			}

			if (differences.length > 0) {
				toUpdate.push({
					modelId,
					section: clineModel._section,
					differences,
				})
			}
		}
	}

	return { toAdd, toRemove, toUpdate }
}

// 메인 실행
try {
	const caretData = extractModels(caretContent, "Caret")
	const clineData = extractModels(clineContent, "Cline")

	console.log(`\n📊 **현재 상태:**`)
	console.log(`🟦 Caret: ${caretData.providers.size}개 프로바이더, ${caretData.models.size}개 모델`)
	console.log(`🟩 Cline: ${clineData.providers.size}개 프로바이더, ${clineData.models.size}개 모델`)

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

	console.log(`\n🎯 **최종 목표:**`)
	console.log(`   프로바이더: ${finalProviderCount}개 (Cline ${clineData.providers.size}개 + Caret 전용 프로바이더)`)
	console.log(`   모델: ${finalModelCount}개 (Cline 모든 모델 + Caret 전용 모델)`)

	console.log(`\n✅ 분석 완료!`)
} catch (error) {
	console.error("❌ 스크립트 실행 중 오류:", error.message)
	process.exit(1)
}
