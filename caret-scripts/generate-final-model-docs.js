#!/usr/bin/env node

/**
 * 최종 정확한 모델 문서 생성 스크립트
 * 중복 제거 후 정확한 180개 모델, 18개 프로바이더 기반
 */

const fs = require("fs")
const path = require("path")

const apiFilePath = path.join(__dirname, "../src/shared/api.ts")
const content = fs.readFileSync(apiFilePath, "utf8")

console.log("📊 최종 정확한 모델 문서 생성 스크립트\n")

// 1. ApiProvider 추출
const providerMatch = content.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
const providers = []
const providerLines = providerMatch[0].split("\n")

for (const line of providerLines) {
	const match = line.match(/^\s*\|\s*"([^"]+)"\s*$/)
	if (match) {
		providers.push(match[1])
	}
}

// 2. 모델 섹션들 정확히 추출 (중복 제거)
const sectionRegex = /export const (\w+Models) = \{([\s\S]*?)\} as const satisfies Record<string, ModelInfo>/g
const sections = new Map() // 중복 방지용 Map
let match

while ((match = sectionRegex.exec(content)) !== null) {
	const sectionName = match[1]
	const sectionContent = match[2]

	// 이미 존재하는 섹션이면 스킵 (첫 번째 것만 유지)
	if (sections.has(sectionName)) {
		console.log(`⚠️  중복 섹션 ${sectionName} 스킵됨`)
		continue
	}

	// 모델들 찾기
	const modelRegex = /^\s*"([^"]+)"\s*:\s*\{/gm
	const models = []
	let modelMatch

	while ((modelMatch = modelRegex.exec(sectionContent)) !== null) {
		models.push(modelMatch[1])
	}

	sections.set(sectionName, {
		count: models.length,
		models: models,
	})
}

// 3. 통계 계산
let totalModels = 0
sections.forEach((section) => (totalModels += section.count))

console.log("🔍 **최종 정확한 통계:**\n")
console.log(`🚀 **프로바이더**: ${providers.length}개`)
console.log(`🎯 **모델**: ${totalModels}개`)
console.log(`📋 **섹션**: ${sections.size}개\n`)

// 4. 주요 프로바이더 TOP 8
const providerMapping = {
	anthropicModels: "Anthropic Claude",
	claudeCodeModels: "Claude Code",
	bedrockModels: "AWS Bedrock",
	vertexModels: "Vertex AI",
	geminiModels: "Google Gemini",
	openAiNativeModels: "OpenAI Native",
	internationalQwenModels: "International Qwen",
	mainlandQwenModels: "Qwen",
	mistralModels: "Mistral",
	xaiModels: "X.AI",
	cerebrasModels: "Cerebras",
	groqModels: "Groq",
	huggingFaceModels: "HuggingFace",
}

const providerStats = []
for (const [sectionName, data] of sections) {
	const providerName = providerMapping[sectionName] || sectionName
	providerStats.push([providerName, data])
}

const topProviders = providerStats.sort((a, b) => b[1].count - a[1].count).slice(0, 8)

console.log("🌟 **주요 프로바이더 TOP 8:**\n")
topProviders.forEach(([name, data]) => {
	const sampleModels = data.models.slice(0, 3).join(", ")
	console.log(`- **${name}** (${data.count}개): ${sampleModels}${data.count > 3 ? ` 외 ${data.count - 3}개` : ""}`)
})

// 5. README 업데이트용 마크다운
console.log("\n📝 **README 업데이트용 마크다운:**\n")
console.log(
	`Caret supports **${totalModels} models** from **${providers.length} providers**, giving you the freedom to choose the tools that best fit your needs.\n`,
)

console.log("### 🔥 Key Providers\n")
topProviders.slice(0, 6).forEach(([name, data]) => {
	const topModels = data.models.slice(0, 3)
	const description = getProviderDescription(name)
	console.log(`- **${name}** (${data.count} models): ${topModels.join(", ")} ${description}`)
})

function getProviderDescription(providerName) {
	const descriptions = {
		"International Qwen": "with specialized coding and multilingual models",
		"Vertex AI": "with Google Cloud integration and enterprise features",
		"AWS Bedrock": "with enterprise-grade stability and security",
		"Google Gemini": "with fast responses and versatile capabilities",
		"X.AI": "with Grok models for advanced reasoning",
		"OpenAI Native": "with the latest GPT models and features",
		Mistral: "with European privacy-focused models",
		Cerebras: "with ultra-fast inference speeds",
		"Anthropic Claude": "with latest high-performance models",
		Groq: "with lightning-fast inference",
	}
	return descriptions[providerName] || "with specialized capabilities"
}

console.log("\n✅ 최종 문서 생성 완료!")
