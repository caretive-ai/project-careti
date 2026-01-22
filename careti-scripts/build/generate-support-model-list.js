#!/usr/bin/env node

/**
 * 📋 Caret 지원 모델 리스트 생성 스크립트
 *
 * 기능:
 * 1. api.ts 파싱하여 정확한 프로바이더/모델 수 추출
 * 2. 기존 support-model-list.mdx 형식 유지
 * 3. 한국어/영어 표 형태 지원 모델 리스트 생성
 *
 * 작성자: Alpha Yang (AI Assistant) / Caret
 * 날짜: 2025-01-17
 */

const fs = require("fs")
const path = require("path")

// 프로젝트 루트 자동 감지
function getProjectRoot() {
	let currentDir = __dirname
	while (currentDir !== path.dirname(currentDir)) {
		if (fs.existsSync(path.join(currentDir, "package.json"))) {
			return currentDir
		}
		currentDir = path.dirname(currentDir)
	}
	throw new Error("package.json을 찾을 수 없습니다.")
}

const PROJECT_ROOT = getProjectRoot()
const API_FILE = path.join(PROJECT_ROOT, "src/shared/api.ts")

console.log("📋 Caret 지원 모델 리스트 생성 시작...")
console.log(`📁 프로젝트 루트: ${PROJECT_ROOT}`)

// API 파일에서 데이터 추출
function extractModelData() {
	const content = fs.readFileSync(API_FILE, "utf-8")

	// 프로바이더 추출 (더 견고한 방식)
	const providers = []
	const lines = content.split("\n")
	let inApiProvider = false

	for (const line of lines) {
		if (line.includes("export type ApiProvider =")) {
			inApiProvider = true
			continue
		}

		if (inApiProvider) {
			// ApiProvider 정의 끝 감지 (다음 export 또는 빈 줄이 아닌 비-| 줄)
			if (line.match(/^export\s/) || (line.trim() !== "" && !line.includes("|") && !line.includes("//"))) {
				break
			}

			const match = line.match(/\|\s*"([^"]+)"/)
			if (match) {
				providers.push(match[1])
			}
		}
	}

	// 모델 섹션별 데이터 추출
	const modelSections = []
	const modelSectionRegex = /export const (\w+Models) = \{([\s\S]*?)\} as const/g
	let match

	while ((match = modelSectionRegex.exec(content)) !== null) {
		const sectionName = match[1]
		const modelsContent = match[2]

		// 모델 정보 추출
		const models = []
		const modelRegex = /"([^"]+)":\s*\{([^}]+)\}/g
		let modelMatch

		while ((modelMatch = modelRegex.exec(modelsContent)) !== null) {
			const modelId = modelMatch[1]
			const modelInfo = modelMatch[2]

			// 모델 정보 파싱
			const maxTokensMatch = modelInfo.match(/maxTokens:\s*(\d+)/)
			const contextWindowMatch = modelInfo.match(/contextWindow:\s*(\d+)/)
			const supportsImagesMatch = modelInfo.match(/supportsImages:\s*(true|false)/)
			const inputPriceMatch = modelInfo.match(/inputPrice:\s*([\d.]+)/)
			const outputPriceMatch = modelInfo.match(/outputPrice:\s*([\d.]+)/)

			models.push({
				id: modelId,
				maxTokens: maxTokensMatch ? parseInt(maxTokensMatch[1], 10) : "N/A",
				contextWindow: contextWindowMatch ? parseInt(contextWindowMatch[1], 10) : "N/A",
				supportsImages: supportsImagesMatch ? supportsImagesMatch[1] === "true" : false,
				inputPrice: inputPriceMatch ? parseFloat(inputPriceMatch[1]) : "N/A",
				outputPrice: outputPriceMatch ? parseFloat(outputPriceMatch[1]) : "N/A",
			})
		}

		if (models.length > 0) {
			modelSections.push({
				name: sectionName,
				provider: sectionName.replace("Models", "").toLowerCase(),
				models: models,
			})
		}
	}

	// 통계 계산
	const allModels = modelSections.flatMap((section) => section.models)
	const uniqueModels = [...new Set(allModels.map((m) => m.id))]

	return {
		providers: providers.length,
		totalModels: allModels.length,
		uniqueModels: uniqueModels.length,
		modelSections,
		providerList: providers,
	}
}

// 프로바이더명 변환 (사용자 친화적 형태)
function getProviderName(provider) {
	// 동적으로 프로바이더명 변환
	return provider
		.replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase를 공백으로 분리
		.split(/[-_\s]+/) // 하이픈, 언더스코어, 공백으로 단어 분리
		.map((word) => {
			// 특수 약어들은 대문자로 유지
			const upperCaseWords = ["ai", "api", "aws", "llm", "vs", "sap", "maas", "openai"]
			if (upperCaseWords.includes(word.toLowerCase())) {
				return word.toUpperCase()
			}
			// 첫 글자만 대문자로
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		})
		.join(" ")
		.replace(/\bOpenai\b/g, "OpenAI") // OpenAI 특수 처리
		.replace(/\bVs Code\b/g, "VS Code") // VS Code 특수 처리
		.replace(/\bXai\b/g, "xAI") // xAI 특수 처리
		.replace(/\bNavercloud\b/g, "Naver Cloud") // Naver Cloud 특수 처리
}

// 한국어 지원 모델 리스트 생성
function generateKoreanModelList(data) {
	const today = new Date().toLocaleDateString("ko-KR")

	return `# 지원하는 AI 모델과 제공자

Caret은 다양한 AI 모델과 제공자를 지원하여 여러분의 필요에 가장 적합한 도구를 선택할 수 있는 자유를 제공합니다.

## 🚀 시작하기

1. **API 키 준비**: 원하는 제공자의 API 키를 준비하세요
2. **Caret 설정**: 웰컴 페이지에서 "시작하기" 버튼을 클릭하여 API를 설정하세요
3. **모델 선택**: 설정 페이지에서 사용하고 싶은 모델을 선택하세요


> 📝 **업데이트**: ${today}  
> 📧 **문의**: [GitHub Issues](https://github.com/caretive-ai/project-careti/issues)

# 📊 지원 모델 현황

총 **${data.modelSections.length}개 제공자**에서 **${data.uniqueModels}개 고유 모델** (총 ${data.totalModels}개 모델 정의)을 지원합니다.

## 🔍 제공자별 지원 모델

| 제공자 | 모델 수 | 주요 모델 |
|--------|---------|-----------|
${data.modelSections
	.map((section) => {
		const providerName = getProviderName(section.provider)
		const modelCount = section.models.length
		const topModels = section.models
			.slice(0, 3)
			.map((m) => `\`${m.id}\``)
			.join(", ")
		const moreText = section.models.length > 3 ? ` 외 ${section.models.length - 3}개` : ""
		return `| **${providerName}** | ${modelCount}개 | ${topModels}${moreText} |`
	})
	.join("\n")}

## 📋 전체 모델 상세 리스트

${data.modelSections
	.map((section) => {
		const providerName = getProviderName(section.provider)
		return `### ${providerName} (${section.models.length}개)

| 모델명 | 최대 토큰 | 컨텍스트 윈도우 | 이미지 지원 | 입력 가격 ($/1M토큰) | 출력 가격 ($/1M토큰) |
|--------|-----------|----------------|-------------|-----------|-----------|
${section.models
	.map((model) => {
		const maxTokens = model.maxTokens !== "N/A" ? model.maxTokens.toLocaleString() : "N/A"
		const contextWindow = model.contextWindow !== "N/A" ? model.contextWindow.toLocaleString() : "N/A"
		const supportsImages = model.supportsImages ? "✅" : "❌"
		const inputPrice = model.inputPrice !== "N/A" ? model.inputPrice : "N/A"
		const outputPrice = model.outputPrice !== "N/A" ? model.outputPrice : "N/A"
		return `| \`${model.id}\` | ${maxTokens} | ${contextWindow} | ${supportsImages} | ${inputPrice} | ${outputPrice} |`
	})
	.join("\n")}
`
	})
	.join("\n")}

---

**총 ${data.uniqueModels}개 고유 AI 모델을 ${data.modelSections.length}개 제공자에서 지원합니다.**

*이 문서는 자동으로 생성되었습니다. (\`careti-scripts/generate-support-model-list.js\`)*
`
}

// 영어 지원 모델 리스트 생성
function generateEnglishModelList(data) {
	const today = new Date().toLocaleDateString("en-US")

	return `# Supported AI Models and Providers

Caret supports a wide variety of AI models and providers, giving you the freedom to choose the best tool for your needs.

## 🚀 Getting Started

1. **Prepare API Keys**: Get API keys from your preferred providers
2. **Configure Caret**: Click "Get Started" on the welcome page to set up APIs
3. **Select Models**: Choose your desired models in the settings page

> 📝 **Updated**: ${today}  
> 📧 **Contact**: [GitHub Issues](https://github.com/caretive-ai/project-careti/issues)

# 📊 Model Support Overview

Total **${data.modelSections.length} providers** supporting **${data.uniqueModels} unique models** (${data.totalModels} total model definitions).

## 🔍 Models by Provider

| Provider | Model Count | Key Models |
|----------|-------------|------------|
${data.modelSections
	.map((section) => {
		const providerName = getProviderName(section.provider)
		const modelCount = section.models.length
		const topModels = section.models
			.slice(0, 3)
			.map((m) => `\`${m.id}\``)
			.join(", ")
		const moreText = section.models.length > 3 ? ` +${section.models.length - 3} more` : ""
		return `| **${providerName}** | ${modelCount} | ${topModels}${moreText} |`
	})
	.join("\n")}

## 📋 Complete Model Details

${data.modelSections
	.map((section) => {
		const providerName = getProviderName(section.provider)
		return `### ${providerName} (${section.models.length} models)

| Model Name | Max Tokens | Context Window | Image Support | Input Price ($/1M tokens) | Output Price ($/1M tokens) |
|------------|------------|----------------|---------------|-------------|--------------|
${section.models
	.map((model) => {
		const maxTokens = model.maxTokens !== "N/A" ? model.maxTokens.toLocaleString() : "N/A"
		const contextWindow = model.contextWindow !== "N/A" ? model.contextWindow.toLocaleString() : "N/A"
		const supportsImages = model.supportsImages ? "✅" : "❌"
		const inputPrice = model.inputPrice !== "N/A" ? model.inputPrice : "N/A"
		const outputPrice = model.outputPrice !== "N/A" ? model.outputPrice : "N/A"
		return `| \`${model.id}\` | ${maxTokens} | ${contextWindow} | ${supportsImages} | ${inputPrice} | ${outputPrice} |`
	})
	.join("\n")}
`
	})
	.join("\n")}

---

**Caret supports ${data.uniqueModels} unique AI models across ${data.modelSections.length} providers.**

*This document is automatically generated by \`careti-scripts/generate-support-model-list.js\`*
`
}

// 메인 실행
try {
	const data = extractModelData()

	console.log("📊 추출된 데이터:")
	console.log(`   🔹 프로바이더: ${data.providers}개`)
	console.log(`   🔹 총 모델: ${data.totalModels}개`)
	console.log(`   🔹 유니크 모델: ${data.uniqueModels}개`)
	console.log(`   🔹 모델 섹션: ${data.modelSections.length}개`)

	// 한국어 버전 생성
	const koContent = generateKoreanModelList(data)
	fs.writeFileSync(path.join(PROJECT_ROOT, "careti-docs/development/support-model-list.mdx"), koContent, "utf-8")
	console.log("✅ 한국어 지원 모델 리스트 생성: careti-docs/development/support-model-list.mdx")

	// 영어 버전 생성
	const enContent = generateEnglishModelList(data)
	fs.writeFileSync(path.join(PROJECT_ROOT, "careti-docs/development/support-model-list.en.mdx"), enContent, "utf-8")
	console.log("✅ 영어 지원 모델 리스트 생성: careti-docs/development/support-model-list.en.mdx")

	console.log("\n🎉 지원 모델 리스트 생성 완료!")
	console.log(`📋 문서화용 텍스트: "총 ${data.uniqueModels}개 고유 AI 모델을 ${data.modelSections.length}개 제공자에서 지원"`)
} catch (error) {
	console.error("❌ 오류 발생:", error.message)
	console.error("📍 스택 트레이스:", error.stack)

	// 디버깅 정보
	console.log("\n🔍 디버깅 정보:")
	console.log(`API 파일 존재: ${fs.existsSync(API_FILE)}`)
	if (fs.existsSync(API_FILE)) {
		const content = fs.readFileSync(API_FILE, "utf-8")
		console.log(`파일 크기: ${content.length} 문자`)
		console.log(`ApiProvider 검색: ${content.includes("export type ApiProvider")}`)
	}

	process.exit(1)
}
