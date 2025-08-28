#!/usr/bin/env node

// Enhanced Model Coverage Verification Script
// 프로바이더별 통계, 파라미터 검증, 상세 분석

const fs = require("fs")
const path = require("path")

console.log("🔍 Enhanced 모델 커버리지 검증 스크립트 시작...\n")

// 파일 읽기 함수
function readApiFile(filePath) {
	try {
		const content = fs.readFileSync(filePath, "utf8")
		return content
	} catch (error) {
		console.error(`❌ 파일 읽기 실패: ${filePath}`, error.message)
		process.exit(1)
	}
}

// 모델 추출 함수 (개선된 버전)
function extractModelsFromContent(content, fileName) {
	const models = {}
	const providers = {}

	// 모든 모델 객체 찾기 (정규식 개선)
	const modelObjectRegex = /export\s+const\s+(\w+Models)\s*=\s*{([^}]+(?:{[^}]*}[^}]*)*)}[^}]*as\s+const/gs
	let match

	while ((match = modelObjectRegex.exec(content)) !== null) {
		const modelGroupName = match[1]
		const modelContent = match[2]

		// 각 모델 이름 추출
		const modelNameRegex = /["']([^"']+)["']\s*:\s*{([^}]+(?:{[^}]*}[^}]*)*)/gs
		let modelMatch

		while ((modelMatch = modelNameRegex.exec(modelContent)) !== null) {
			const modelId = modelMatch[1]
			const modelData = modelMatch[2]

			// 모델 파라미터 파싱
			const params = parseModelParameters(modelData)

			models[modelId] = {
				group: modelGroupName,
				...params,
			}
		}

		// 프로바이더별 통계
		const providerName = modelGroupName.replace("Models", "")
		const modelCount = Object.keys(models).filter((id) => models[id].group === modelGroupName).length
		providers[providerName] = modelCount
	}

	return { models, providers }
}

// 모델 파라미터 파싱 함수
function parseModelParameters(modelData) {
	const params = {
		maxTokens: null,
		contextWindow: null,
		supportsImages: null,
		supportsPromptCache: null,
		inputPrice: null,
		outputPrice: null,
		cacheReadsPrice: null,
		cacheWritesPrice: null,
		description: null,
	}

	// 각 파라미터 추출
	const extractValue = (key, regex) => {
		const match = modelData.match(new RegExp(`${key}\\s*:\\s*(${regex})`))
		return match ? match[1] : null
	}

	params.maxTokens = extractValue("maxTokens", "[\\d_,]+")
	params.contextWindow = extractValue("contextWindow", "[\\d_,]+")
	params.supportsImages = extractValue("supportsImages", "true|false")
	params.supportsPromptCache = extractValue("supportsPromptCache", "true|false")
	params.inputPrice = extractValue("inputPrice", "[\\d.]+")
	params.outputPrice = extractValue("outputPrice", "[\\d.]+")
	params.cacheReadsPrice = extractValue("cacheReadsPrice", "[\\d.]+")
	params.cacheWritesPrice = extractValue("cacheWritesPrice", "[\\d.]+")

	const descMatch = modelData.match(/description\s*:\s*["']([^"']+)["']/)
	params.description = descMatch ? descMatch[1] : null

	return params
}

// 파라미터 차이 비교 함수
function compareModelParameters(caretModel, clineModel, modelId) {
	const differences = []
	const keysToCheck = [
		"maxTokens",
		"contextWindow",
		"supportsImages",
		"supportsPromptCache",
		"inputPrice",
		"outputPrice",
		"cacheReadsPrice",
		"cacheWritesPrice",
	]

	keysToCheck.forEach((key) => {
		const caretVal = caretModel[key]
		const clineVal = clineModel[key]

		if (caretVal !== clineVal && !(caretVal === null && clineVal === null)) {
			differences.push({
				parameter: key,
				caret: caretVal,
				cline: clineVal,
			})
		}
	})

	return differences
}

// 메인 실행
try {
	const caretApiPath = path.join(__dirname, "..", "src", "shared", "api.ts")
	const clineApiPath = path.join(__dirname, "..", "cline-latest", "src", "shared", "api.ts")

	console.log("📁 파일 경로:")
	console.log(`   Caret: ${caretApiPath}`)
	console.log(`   Cline: ${clineApiPath}\n`)

	// API 파일들 읽기
	const caretContent = readApiFile(caretApiPath)
	const clineContent = readApiFile(clineApiPath)

	// 모델 추출
	console.log("🔄 모델 데이터 추출 중...")
	const caretData = extractModelsFromContent(caretContent, "caret")
	const clineData = extractModelsFromContent(clineContent, "cline")

	console.log("✅ 추출 완료!\n")

	// === 기본 통계 ===
	console.log("📊 === 기본 통계 ===")
	console.log(`📊 Caret 모델 수: ${Object.keys(caretData.models).length}`)
	console.log(`📊 Cline 모델 수: ${Object.keys(clineData.models).length}`)
	console.log(`📊 Caret 프로바이더 수: ${Object.keys(caretData.providers).length}`)
	console.log(`📊 Cline 프로바이더 수: ${Object.keys(clineData.providers).length}\n`)

	// === 프로바이더별 상세 통계 ===
	console.log("🏢 === 프로바이더별 모델 수 ===")
	console.log("Format: Provider (Caret모델수 | Cline모델수)\n")

	const allProviders = new Set([...Object.keys(caretData.providers), ...Object.keys(clineData.providers)])

	;[...allProviders].sort().forEach((provider) => {
		const caretCount = caretData.providers[provider] || 0
		const clineCount = clineData.providers[provider] || 0
		const status = caretCount === clineCount ? "✅" : caretCount > clineCount ? "📈" : "📉"

		console.log(
			`${status} ${provider.padEnd(20)} (${caretCount.toString().padStart(3)} | ${clineCount.toString().padStart(3)})`,
		)
	})

	// === 모델 차이 분석 ===
	const caretModelIds = new Set(Object.keys(caretData.models))
	const clineModelIds = new Set(Object.keys(clineData.models))

	const onlyInCaret = [...caretModelIds].filter((id) => !clineModelIds.has(id))
	const onlyInCline = [...clineModelIds].filter((id) => !caretModelIds.has(id))
	const inBoth = [...caretModelIds].filter((id) => clineModelIds.has(id))

	console.log("\n🔍 === 모델 차이 분석 ===")
	console.log(`✅ 공통 모델: ${inBoth.length}개`)
	console.log(`📈 Caret에만 있는 모델: ${onlyInCaret.length}개`)
	console.log(`📉 Cline에만 있는 모델: ${onlyInCline.length}개\n`)

	// Caret에만 있는 모델들
	if (onlyInCaret.length > 0) {
		console.log("📈 **Caret에만 있는 모델들:**")
		onlyInCaret.forEach((modelId) => {
			const model = caretData.models[modelId]
			console.log(`   • ${modelId} (${model.group})`)
		})
		console.log()
	}

	// Cline에만 있는 모델들 (누락된 모델들)
	if (onlyInCline.length > 0) {
		console.log("⚠️ **Cline에만 있는 모델들 (Caret에서 누락):**")
		onlyInCline.forEach((modelId) => {
			const model = clineData.models[modelId]
			console.log(`   • ${modelId} (${model.group})`)
		})
		console.log()
	}

	// === 파라미터 차이 분석 ===
	console.log("⚙️ === 파라미터 차이 분석 ===")
	let paramDifferences = 0
	const parameterIssues = []

	inBoth.forEach((modelId) => {
		const caretModel = caretData.models[modelId]
		const clineModel = clineData.models[modelId]

		const diffs = compareModelParameters(caretModel, clineModel, modelId)

		if (diffs.length > 0) {
			paramDifferences++
			parameterIssues.push({
				modelId,
				differences: diffs,
			})
		}
	})

	if (parameterIssues.length > 0) {
		console.log(`⚠️ 파라미터가 다른 모델: ${parameterIssues.length}개\n`)

		// 처음 5개만 자세히 표시
		parameterIssues.slice(0, 5).forEach((issue) => {
			console.log(`🔧 ${issue.modelId}:`)
			issue.differences.forEach((diff) => {
				console.log(`   ${diff.parameter}: Caret="${diff.caret}" vs Cline="${diff.cline}"`)
			})
			console.log()
		})

		if (parameterIssues.length > 5) {
			console.log(`   ... 그리고 ${parameterIssues.length - 5}개 더\n`)
		}
	} else {
		console.log("✅ 모든 공통 모델의 파라미터가 일치합니다!\n")
	}

	// === 최종 결과 ===
	console.log("🎯 === 최종 검증 결과 ===")

	if (onlyInCline.length === 0) {
		console.log("✅ 완벽합니다! Caret은 Cline의 모든 모델을 포함하고 있습니다.")
		if (onlyInCaret.length > 0) {
			console.log(`✨ 추가로 Caret에는 ${onlyInCaret.length}개의 독점 모델이 있습니다!`)
		}
	} else {
		console.log(`❌ Caret에서 ${onlyInCline.length}개의 Cline 모델이 누락되었습니다.`)
		console.log("🔧 누락된 모델들을 추가해주세요.")
	}

	if (parameterIssues.length > 0) {
		console.log(`⚠️ ${parameterIssues.length}개 모델의 파라미터를 확인해주세요.`)
	}

	console.log("\n🔍 검증 완료.")
} catch (error) {
	console.error("❌ 스크립트 실행 중 오류가 발생했습니다:", error.message)
	console.error(error.stack)
	process.exit(1)
}
