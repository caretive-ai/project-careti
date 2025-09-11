#!/usr/bin/env node

/**
 * Caret 정확한 모델 문서 생성 스크립트
 * 배포 시 모델 개수 업데이트용
 */

const fs = require("fs")
const path = require("path")

// api.ts 파일 읽기
const caretApiPath = path.join(__dirname, "../../src/shared/api.ts")
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

// 실제 발견된 프로바이더 개수 계산
const actualProviderCount = providerStats.size

console.log(`\n📊 **총 집계:**`)
console.log(`🔥 **프로바이더**: ${actualProviderCount}개`)
console.log(`🚀 **모델**: ${totalModels}개`)

// 4. README 업데이트용 마크다운 생성
console.log(`\n📝 **README 업데이트용 마크다운:**\n`)

console.log(`Caret supports **${totalModels} models** from **${actualProviderCount} providers**.\n`)

console.log("✅ 문서 생성 스크립트 완료!")
