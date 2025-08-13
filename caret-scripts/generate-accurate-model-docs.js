#!/usr/bin/env node

/**
 * Caret 정확한 모델 문서 생성 스크립트
 * accurate-merge-analysis.js의 정확한 계산 방식 기반
 */

const fs = require("fs")
const path = require("path")

// api.ts 파일 읽기
const caretApiPath = path.join(__dirname, "../src/shared/api.ts")
const caretContent = fs.readFileSync(caretApiPath, "utf8")

console.log("📊 Caret 정확한 모델 문서 생성 스크립트\n")

// 1. ApiProvider 추출 (정확한 방식)
const providerMatch = caretContent.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
if (!providerMatch) {
	console.error("❌ ApiProvider 타입을 찾을 수 없습니다.")
	process.exit(1)
}

const caretProviders = []
const providerContent = providerMatch[0]
const providerLines = providerContent.split("\n")

for (const line of providerLines) {
	const match = line.match(/^\s*\|\s*"([^"]+)"\s*$/)
	if (match) {
		caretProviders.push(match[1])
	}
}

// 2. 모델 정의 정확히 추출
function extractModelsFromContent(content) {
	const models = new Map()

	// 모든 모델 정의 찾기
	const modelDefRegex = /export const (\w+Models) = \{([\s\S]*?)\} as const satisfies Record<string, ModelInfo>/g
	let match

	while ((match = modelDefRegex.exec(content)) !== null) {
		const sectionName = match[1]
		const modelsBlock = match[2]

		// 모델 이름들 추출
		const modelNames = []
		const modelRegex = /^\s*"([^"]+)"\s*:\s*\{/gm
		let modelMatch

		while ((modelMatch = modelRegex.exec(modelsBlock)) !== null) {
			modelNames.push(modelMatch[1])
		}

		if (modelNames.length > 0) {
			models.set(sectionName, modelNames)
		}
	}

	return models
}

const caretModels = extractModelsFromContent(caretContent)

// 3. 통계 계산
let totalModels = 0
const providerStats = new Map()

console.log("🔍 **프로바이더별 모델 수:**\n")

// 프로바이더 매핑 (섹션명 -> 프로바이더명)
const providerMapping = {
	anthropicModels: "Anthropic Claude",
	claudeCodeModels: "Claude Code",
	openRouterModels: "OpenRouter",
	bedrockModels: "AWS Bedrock",
	vertexModels: "Vertex AI",
	openAiModels: "OpenAI",
	ollamaModels: "Ollama",
	lmStudioModels: "LM Studio",
	geminiModels: "Google Gemini",
	openAiNativeModels: "OpenAI Native",
	requestyModels: "Requesty",
	togetherModels: "Together",
	deepSeekModels: "DeepSeek",
	qwenModels: "Qwen",
	doubaoModels: "Doubao",
	mistralModels: "Mistral",
	groqModels: "Groq",
	huggingFaceModels: "HuggingFace",
	xaiModels: "X.AI",
	internationalQwenModels: "International Qwen",
	cerebrasModels: "Cerebras",
	liteLlmModels: "LiteLLM",
	moonshotModels: "Moonshot",
	nebiusModels: "Nebius",
	fireworksModels: "Fireworks",
	asksageModels: "AskSage",
	sambaNovaModels: "SambaNova",
	sapAiCoreModels: "SAP AI Core",
	huaweiCloudMaasModels: "Huawei Cloud MaaS",
	basetenModels: "Baseten",
}

for (const [sectionName, models] of caretModels) {
	const providerName = providerMapping[sectionName] || sectionName
	const count = models.length
	providerStats.set(providerName, { count, models })
	totalModels += count
	console.log(`✅ **${providerName}**: ${count}개 모델`)
}

console.log(`\n📊 **총 집계:**`)
console.log(`🔥 **프로바이더**: ${caretProviders.length}개`)
console.log(`🚀 **모델**: ${totalModels}개`)

// 4. 주요 프로바이더 상세 정보
console.log(`\n🌟 **주요 프로바이더 TOP 8:**\n`)

const sortedProviders = Array.from(providerStats.entries())
	.sort((a, b) => b[1].count - a[1].count)
	.slice(0, 8)

for (const [name, data] of sortedProviders) {
	const sampleModels = data.models.slice(0, 3).join(", ")
	const moreText = data.count > 3 ? ` 외 ${data.count - 3}개` : ""
	console.log(`- **${name}** (${data.count}개): ${sampleModels}${moreText}`)
}

// 5. README 업데이트용 마크다운 생성
console.log(`\n📝 **README 업데이트용 마크다운:**\n`)

console.log(
	`Caret supports **${totalModels} models** from **${caretProviders.length} providers**, giving you the freedom to choose the tools that best fit your needs.\n`,
)

console.log(`### 🔥 Key Providers\n`)

// 주요 프로바이더 5개만 표시
const topProviders = sortedProviders.slice(0, 5)
for (const [name, data] of topProviders) {
	const sampleModels = data.models.slice(0, 3)
	const description = getProviderDescription(name)
	console.log(`- **${name}** (${data.count} models): ${sampleModels.join(", ")} ${description}`)
}

function getProviderDescription(providerName) {
	const descriptions = {
		"Anthropic Claude": "with latest high-performance models",
		"Google Gemini": "with fast responses and versatile capabilities",
		"OpenAI Native": "with the most comprehensive model lineup",
		"International Qwen": "with specialized coding and multilingual models",
		"AWS Bedrock": "with enterprise-grade stability",
		"Vertex AI": "with Google Cloud integration",
		"X.AI": "with Grok models for advanced reasoning",
		Cerebras: "with ultra-fast inference speeds",
		Mistral: "with European privacy-focused models",
		Groq: "with lightning-fast inference",
	}
	return descriptions[providerName] || "with specialized capabilities"
}

// 6. 지원 모델 리스트 MDX 파일 생성용 데이터
if (process.argv.includes("--generate-mdx")) {
	console.log(`\n📋 **MDX 파일 생성용 데이터:**\n`)

	console.log(`# 지원하는 AI 모델과 제공자\n`)
	console.log(
		`Caret은 다양한 AI 모델과 제공자를 지원하여 여러분의 필요에 가장 적합한 도구를 선택할 수 있는 자유를 제공합니다.\n`,
	)
	console.log(`## 📊 지원 모델 현황\n`)
	console.log(`총 **${caretProviders.length}개 제공자**에서 **${totalModels}개 모델**을 지원합니다.\n`)

	console.log(`## 🤖 제공자별 지원 모델\n`)

	// 카테고리별 정리
	const categories = {
		"🔥 주요 제공자": ["Anthropic Claude", "Google Gemini", "OpenAI Native", "International Qwen"],
		"🌐 클라우드 제공자": ["AWS Bedrock", "Vertex AI", "OpenRouter"],
		"🚀 고속 추론": ["Groq", "Cerebras", "X.AI"],
		"🌍 국제 제공자": ["Qwen", "Doubao", "Mistral", "Moonshot"],
		"🏠 로컬 실행": ["Ollama", "LM Studio", "VSCode LM"],
	}

	for (const [categoryName, providerList] of Object.entries(categories)) {
		console.log(`### ${categoryName}\n`)
		console.log(`| 제공자 | 모델 수 | 주요 모델 | 특징 |`)
		console.log(`|--------|---------|-----------|------|`)

		for (const providerName of providerList) {
			const stats = providerStats.get(providerName)
			if (stats) {
				const topModels = stats.models.slice(0, 2).join(", ")
				const description = getProviderDescription(providerName)
				console.log(`| **${providerName}** | ${stats.count}개 | ${topModels} | ${description} |`)
			}
		}
		console.log()
	}
}

console.log("✅ 문서 생성 스크립트 완료!")
