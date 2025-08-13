#!/usr/bin/env node

/**
 * Caret 지원 모델 문서 생성 스크립트
 * - 정확한 프로바이더 수와 모델 수 계산
 * - 각 프로바이더별 모델 리스트 생성
 * - README 및 문서 업데이트용 데이터 출력
 */

const fs = require("fs")
const path = require("path")

// api.ts 파일 읽기
const apiFilePath = path.join(__dirname, "../src/shared/api.ts")
const apiContent = fs.readFileSync(apiFilePath, "utf8")

console.log("🔍 Caret 지원 모델 분석 스크립트 시작...\n")

// 1. ApiProvider 타입에서 프로바이더 추출
const providerMatch = apiContent.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
if (!providerMatch) {
	console.error("❌ ApiProvider 타입을 찾을 수 없습니다.")
	process.exit(1)
}

const providers = []
const providerLines = providerMatch[0].split("\n")
for (const line of providerLines) {
	const match = line.match(/\|\s*"([^"]+)"/)
	if (match) {
		providers.push(match[1])
	}
}

console.log(`📍 총 프로바이더: ${providers.length}개`)
console.log(`📋 프로바이더 목록: ${providers.join(", ")}\n`)

// 2. 각 프로바이더별 모델 수 계산
const modelCounts = {}
let totalModels = 0

// 모델 정의 섹션들 찾기
const modelSections = [
	"anthropicModels",
	"claudeCodeModels",
	"openRouterModels",
	"bedrockModels",
	"vertexModels",
	"openAiModels",
	"ollamaModels",
	"lmStudioModels",
	"geminiModels",
	"openAiNativeModels",
	"requestyModels",
	"togetherModels",
	"deepSeekModels",
	"qwenModels",
	"doubaoModels",
	"mistralModels",
	"groqModels",
	"huggingFaceModels",
	"xaiModels",
	"internationalQwenModels",
	"cerebrasModels",
	"liteLlmModels",
	"moonshotModels",
	"nebiusModels",
	"fireworksModels",
	"asksageModels",
	"sambaNovaModels",
	"sapAiCoreModels",
	"huaweiCloudMaasModels",
	"basetenModels",
]

// 각 섹션에서 모델 수 계산
for (const section of modelSections) {
	const regex = new RegExp(`export const ${section} = \\{([\\s\\S]*?)\\} as const satisfies Record`, "g")
	const match = regex.exec(apiContent)

	if (match) {
		const modelsBlock = match[1]
		const modelMatches = modelsBlock.match(/"[^"]+"\s*:/g)
		const count = modelMatches ? modelMatches.length : 0

		if (count > 0) {
			const providerName = section
				.replace("Models", "")
				.replace(/([A-Z])/g, " $1")
				.trim()
			modelCounts[providerName] = count
			totalModels += count
			console.log(`✅ ${providerName}: ${count}개 모델`)
		}
	}
}

console.log(`\n📊 **총계**: ${totalModels}개 모델, ${providers.length}개 프로바이더\n`)

// 3. 주요 프로바이더별 상세 정보
console.log("🔥 **주요 프로바이더 상세 정보:**\n")

const keyProviders = {
	anthropic: "Anthropic Claude",
	gemini: "Google Gemini",
	"openai-native": "OpenAI Native",
	qwen: "Qwen",
	bedrock: "AWS Bedrock",
	groq: "Groq",
	xai: "X.AI",
	cerebras: "Cerebras",
}

for (const [key, name] of Object.entries(keyProviders)) {
	const section = key.replace("-", "") + "Models"
	const count = modelCounts[key.replace("-", "")] || modelCounts[key.replace("-", " ")] || 0
	if (count > 0) {
		console.log(`- **${name}** (${count} models): Latest high-performance models`)
	}
}

// 4. README 업데이트용 데이터 출력
console.log("\n📝 **README 업데이트용 데이터:**\n")
console.log(`Caret supports **${totalModels} models** from **${providers.length} providers**\n`)

// 5. 각 프로바이더별 모델 리스트 생성 (선택사항)
if (process.argv.includes("--detailed")) {
	console.log("\n📋 **상세 모델 리스트:**\n")

	for (const section of modelSections) {
		const regex = new RegExp(`export const ${section} = \\{([\\s\\S]*?)\\} as const satisfies Record`, "g")
		const match = regex.exec(apiContent)

		if (match) {
			const modelsBlock = match[1]
			const modelMatches = modelsBlock.match(/"([^"]+)"\s*:/g)

			if (modelMatches && modelMatches.length > 0) {
				const providerName = section
					.replace("Models", "")
					.replace(/([A-Z])/g, " $1")
					.trim()
				console.log(`### ${providerName} (${modelMatches.length}개)`)

				const models = modelMatches.map((m) => m.match(/"([^"]+)"/)[1])
				for (const model of models) {
					console.log(`- ${model}`)
				}
				console.log("")
			}
		}
	}
}

console.log("✅ 분석 완료!")
