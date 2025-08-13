#!/usr/bin/env node

// Model Audit Script - Caret 독점 모델들의 제거 이유 분석
// 실제로 "독점"인지, 아니면 Cline에서 의도적으로 제거된 것인지 검수

const fs = require("fs")
const path = require("path")

console.log("🔍 모델 검수 스크립트 시작...\n")

// Caret에만 있는 모델들 (이전 분석 결과)
const caretOnlyModels = [
	{ id: "llama-4-scout-17b-16e-instruct", group: "cerebrasModels", provider: "Cerebras" },
	{ id: "llama3.1-8b", group: "cerebrasModels", provider: "Cerebras" },
	{ id: "anthropic--claude-4-sonnet", group: "sapAiCoreModels", provider: "SAP AI Core" },
	{ id: "anthropic--claude-4-opus", group: "sapAiCoreModels", provider: "SAP AI Core" },
	{ id: "gpt-5", group: "sapAiCoreModels", provider: "SAP AI Core" },
	{ id: "gpt-5-nano", group: "sapAiCoreModels", provider: "SAP AI Core" },
	{ id: "gpt-5-mini", group: "sapAiCoreModels", provider: "SAP AI Core" },
	{ id: "anthropic--claude-3.7-sonnet", group: "sapAiCoreModels", provider: "SAP AI Core" },
	{ id: "anthropic--claude-3.5-sonnet", group: "sapAiCoreModels", provider: "SAP AI Core" },
	{ id: "anthropic--claude-3-sonnet", group: "sapAiCoreModels", provider: "SAP AI Core" },
	{ id: "anthropic--claude-3-haiku", group: "sapAiCoreModels", provider: "SAP AI Core" },
	{ id: "anthropic--claude-3-opus", group: "sapAiCoreModels", provider: "SAP AI Core" },
	{ id: "gpt-4", group: "sapAiCoreModels", provider: "SAP AI Core" },
]

// Cline API 내용 분석
function analyzeProviderSupport(clineApiContent) {
	console.log("📊 === Cline 프로바이더 지원 현황 ===\n")

	// ApiProvider 타입에서 지원하는 프로바이더 확인
	const providerMatch = clineApiContent.match(/export\s+type\s+ApiProvider\s*=([^;]+);/s)
	const supportedProviders = []

	if (providerMatch) {
		const providerContent = providerMatch[1]
		const providers = providerContent.match(/"([^"]+)"/g)
		if (providers) {
			providers.forEach((provider) => {
				const cleanProvider = provider.replace(/"/g, "")
				supportedProviders.push(cleanProvider)
			})
		}
	}

	console.log("🏢 Cline에서 지원하는 프로바이더:")
	supportedProviders.sort().forEach((provider) => {
		console.log(`   ✅ ${provider}`)
	})

	// SAP AI Core 지원 여부 확인
	const hasSapAiCore = supportedProviders.includes("sapaicore")
	console.log(`\n🔍 SAP AI Core 지원: ${hasSapAiCore ? "✅ 지원함" : "❌ 지원 안함"}`)

	// Cerebras 지원 여부 확인
	const hasCerebras = supportedProviders.includes("cerebras")
	console.log(`🔍 Cerebras 지원: ${hasCerebras ? "✅ 지원함" : "❌ 지원 안함"}\n`)

	return { supportedProviders, hasSapAiCore, hasCerebras }
}

// 모델 그룹별 분석
function analyzeModelGroups(clineApiContent) {
	console.log("📋 === 모델 그룹 존재 여부 ===\n")

	const modelGroups = ["sapAiCoreModels", "cerebrasModels"]
	const results = {}

	modelGroups.forEach((group) => {
		const hasGroup = clineApiContent.includes(`export const ${group}`)
		results[group] = hasGroup
		console.log(`${hasGroup ? "✅" : "❌"} ${group}: ${hasGroup ? "존재함" : "존재 안함"}`)
	})

	console.log()
	return results
}

// 특정 모델의 Cline 버전과 비교
function compareSpecificModels(caretApiContent, clineApiContent) {
	console.log("🔍 === 특정 모델 상세 비교 ===\n")

	// 의심스러운 모델들 체크
	const suspiciousModels = ["llama3.1-8b", "anthropic--claude-4-sonnet", "gpt-5"]

	suspiciousModels.forEach((modelId) => {
		const inCaret = caretApiContent.includes(`"${modelId}"`)
		const inCline = clineApiContent.includes(`"${modelId}"`)

		console.log(`🔍 ${modelId}:`)
		console.log(`   Caret: ${inCaret ? "✅ 있음" : "❌ 없음"}`)
		console.log(`   Cline: ${inCline ? "✅ 있음" : "❌ 없음"}`)

		if (inCaret && !inCline) {
			console.log(`   ⚠️  Caret에만 존재 - 제거 검토 필요`)
		}
		console.log()
	})
}

// 권장사항 제시
function provideRecommendations(providerAnalysis, modelGroupAnalysis) {
	console.log("💡 === 검수 결과 및 권장사항 ===\n")

	// SAP AI Core 관련
	if (!providerAnalysis.hasSapAiCore && !modelGroupAnalysis.sapAiCoreModels) {
		console.log("🚨 **SAP AI Core 관련 권장사항:**")
		console.log("   - Cline에서 SAP AI Core 지원이 완전히 제거됨")
		console.log("   - Caret의 SAP AI Core 모델들(12개) 제거 검토 필요")
		console.log("   - 또는 Caret에서 독자적으로 유지할지 결정 필요\n")
	}

	// Cerebras 관련
	if (providerAnalysis.hasCerebras && modelGroupAnalysis.cerebrasModels) {
		console.log("🔄 **Cerebras 관련 권장사항:**")
		console.log("   - Cline에서 Cerebras는 지원하지만 일부 모델이 다름")
		console.log("   - 구모델(llama3.1-8b, llama-4-scout-17b-16e-instruct) 제거 검토")
		console.log("   - Cline의 최신 Cerebras 모델들로 교체 고려\n")
	}

	console.log("✅ **다음 단계:**")
	console.log("   1. SAP AI Core 모델들의 실제 가용성 확인")
	console.log("   2. Cerebras 구모델들의 지원 상태 확인")
	console.log("   3. 제거할 모델과 유지할 모델 결정")
	console.log("   4. 필요시 Caret 독자 모델로 유지하거나 제거")
}

// 메인 실행
try {
	const caretApiPath = path.join(__dirname, "..", "src", "shared", "api.ts")
	const clineApiPath = path.join(__dirname, "..", "cline-latest", "src", "shared", "api.ts")

	console.log("📁 파일 경로:")
	console.log(`   Caret: ${caretApiPath}`)
	console.log(`   Cline: ${clineApiPath}\n`)

	// 파일 읽기
	const caretApiContent = fs.readFileSync(caretApiPath, "utf8")
	const clineApiContent = fs.readFileSync(clineApiPath, "utf8")

	// 분석 실행
	console.log("🎯 **Caret 독점 모델 검수 대상 (13개):**")
	caretOnlyModels.forEach((model) => {
		console.log(`   • ${model.id} (${model.provider})`)
	})
	console.log()

	// 프로바이더 지원 분석
	const providerAnalysis = analyzeProviderSupport(clineApiContent)

	// 모델 그룹 분석
	const modelGroupAnalysis = analyzeModelGroups(clineApiContent)

	// 특정 모델 비교
	compareSpecificModels(caretApiContent, clineApiContent)

	// 권장사항 제시
	provideRecommendations(providerAnalysis, modelGroupAnalysis)

	console.log("\n🔍 검수 완료.")
} catch (error) {
	console.error("❌ 스크립트 실행 중 오류:", error.message)
	process.exit(1)
}
