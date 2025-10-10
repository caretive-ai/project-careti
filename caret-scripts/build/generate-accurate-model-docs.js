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

// 3. 동적 프로바이더 이름 매핑 생성
function generateProviderMapping(content) {
	const mapping = {}

	// 주석에서 프로바이더명 추출 (예: // AskSage Models)
	const commentMappings = {
		askSageModels: "AskSage",
		nebiusModels: "Nebius AI Studio",
		sambanovaModels: "SambaNova",
		sapAiCoreModels: "SAP AI Core",
		moonshotModels: "Moonshot AI",
		huaweiCloudMaasModels: "Huawei Cloud MaaS",
		basetenModels: "Baseten",
		internationalZAiModels: "Z AI (International)",
		mainlandZAiModels: "Z AI (Mainland)",
		fireworksModels: "Fireworks AI",
		qwenCodeModels: "Qwen Code",
	}

	// 기본 매핑 (Model 섹션명 -> 표시명)
	const defaultMappings = {
		anthropicModels: "Anthropic Claude",
		claudeCodeModels: "Claude Code",
		bedrockModels: "AWS Bedrock",
		vertexModels: "Vertex AI",
		geminiModels: "Google Gemini",
		openAiNativeModels: "OpenAI Native",
		deepSeekModels: "DeepSeek",
		huggingFaceModels: "Hugging Face",
		internationalQwenModels: "Qwen (International)",
		mainlandQwenModels: "Qwen (Mainland)",
		doubaoModels: "Doubao",
		mistralModels: "Mistral",
		xaiModels: "X.AI",
		cerebrasModels: "Cerebras",
		groqModels: "Groq",
	}

	// 댓글 매핑과 기본 매핑을 결합
	return { ...defaultMappings, ...commentMappings }
}

// 3. 통계 계산
let totalModels = 0
const providerStats = new Map()

console.log("🔍 **프로바이더별 모델 수:**\n")

// 동적 프로바이더 매핑 생성
const providerMapping = generateProviderMapping(caretContent)

// 누락된 프로바이더 감지
const unmappedProviders = []

for (const [sectionName, models] of caretModels) {
	let providerName = providerMapping[sectionName]

	if (!providerName) {
		// 자동 생성: "xxxModels" -> "Xxx"
		providerName = sectionName
			.replace(/Models$/, "")
			.replace(/([A-Z])/g, " $1")
			.replace(/^./, (str) => str.toUpperCase())
			.trim()

		unmappedProviders.push({
			sectionName,
			generatedName: providerName,
			modelCount: models.length,
		})
	}

	const count = models.length
	providerStats.set(providerName, { count, models })
	totalModels += count
	console.log(`✅ **${providerName}**: ${count}개 모델`)
}

// 누락된 프로바이더 경고
if (unmappedProviders.length > 0) {
	console.log(`\n⚠️  **경고: 매핑되지 않은 프로바이더 발견** (${unmappedProviders.length}개)`)
	console.log("다음 프로바이더들을 스크립트에 추가해주세요:\n")

	for (const { sectionName, generatedName, modelCount } of unmappedProviders) {
		console.log(`  ${sectionName}: "${generatedName}" (${modelCount}개 모델)`)
	}
	console.log()
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
