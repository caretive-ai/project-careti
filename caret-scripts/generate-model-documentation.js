#!/usr/bin/env node

/**
 * 📋 Caret 모델 문서화 자동생성 스크립트
 *
 * 기능:
 * 1. README.md 자동 업데이트 (한/영)
 * 2. 지원 모델리스트 자동생성 (한/영)
 * 3. api.ts 파싱하여 정확한 수치 반영
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
	throw new Error("package.json을 찾을 수 없습니다. 프로젝트 루트에서 실행해주세요.")
}

const PROJECT_ROOT = getProjectRoot()
const API_FILE = path.join(PROJECT_ROOT, "src/shared/api.ts")

console.log("📋 Caret 모델 문서화 자동생성 시작...")
console.log(`📁 프로젝트 루트: ${PROJECT_ROOT}`)

// API 파일 파싱
function parseApiFile() {
	if (!fs.existsSync(API_FILE)) {
		throw new Error(`API 파일을 찾을 수 없습니다: ${API_FILE}`)
	}

	const content = fs.readFileSync(API_FILE, "utf-8")

	// 프로바이더 추출
	const providerMatch = content.match(/export type ApiProvider = ([^}]+})/s)
	if (!providerMatch) {
		throw new Error("ApiProvider 타입을 찾을 수 없습니다")
	}

	const providers = providerMatch[1]
		.split("|")
		.map((p) => p.trim().replace(/["|']/g, ""))
		.filter((p) => p && !p.includes("//") && !p.includes("/*"))

	// 모델 정의 추출 (더 견고한 파싱)
	const modelSections = []

	// 각 모델 섹션을 개별적으로 찾기
	const modelSectionNames = [
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
		"deepSeekModels",
		"requestyModels",
		"fireworksModels",
		"togetherModels",
		"nebiusModels",
		"mainlandQwenModels",
		"internationalQwenModels",
		"mistralModels",
		"doubaoModels",
		"vsCodeLmModels",
		"clineModels",
		"liteLlmModels",
		"askSageModels",
		"xaiModels",
		"sambanovaModels",
		"cerebrasModels",
		"sapAiCoreModels",
		"huggingFaceModels",
		"groqModels",
		"moonshotModels",
		"huaweiCloudMaasModels",
		"basetenModels",
	]

	modelSectionNames.forEach((sectionName) => {
		const regex = new RegExp(`export const ${sectionName} = \\{([\\s\\S]*?)\\} as const`, "g")
		const match = regex.exec(content)

		if (match) {
			const modelsContent = match[1]
			const modelIds = []

			// 모델 ID 추출 (더 정확한 정규식)
			const modelIdRegex = /["']([^"']+)["']:\s*\{/g
			let modelMatch

			while ((modelMatch = modelIdRegex.exec(modelsContent)) !== null) {
				modelIds.push(modelMatch[1])
			}

			if (modelIds.length > 0) {
				modelSections.push({
					name: sectionName,
					models: modelIds,
				})
			}
		}
	})

	// 총 모델 수 계산
	const allModels = modelSections.flatMap((section) => section.models)
	const uniqueModels = [...new Set(allModels)]

	return {
		providers: providers.length,
		totalModels: allModels.length,
		uniqueModels: uniqueModels.length,
		modelSections,
		providerList: providers,
	}
}

// README 업데이트
function updateReadme(stats) {
	const readmeFiles = [
		{ path: path.join(PROJECT_ROOT, "README.md"), lang: "ko" },
		{ path: path.join(PROJECT_ROOT, "README.en.md"), lang: "en" },
	]

	readmeFiles.forEach(({ path: filePath, lang }) => {
		if (!fs.existsSync(filePath)) {
			console.log(`⚠️  README 파일이 없습니다: ${filePath}`)
			return
		}

		let content = fs.readFileSync(filePath, "utf-8")

		// 통계 업데이트
		if (lang === "ko") {
			// 한국어 버전
			content = content.replace(/지원 프로바이더:\s*\*\*\d+개\*\*/g, `지원 프로바이더: **${stats.providers}개**`)
			content = content.replace(/지원 유니크 모델:\s*\*\*\d+개\*\*/g, `지원 유니크 모델: **${stats.uniqueModels}개**`)
			content = content.replace(/총 모델 정의:\s*\*\*\d+개\*\*/g, `총 모델 정의: **${stats.totalModels}개**`)
			// 문서화용 텍스트
			content = content.replace(
				/총 \d+개 고유 AI 모델을 \d+개 프로바이더에서 지원/g,
				`총 ${stats.uniqueModels}개 고유 AI 모델을 ${stats.providers}개 프로바이더에서 지원`,
			)
		} else {
			// 영어 버전
			content = content.replace(/Supported Providers:\s*\*\*\d+\*\*/g, `Supported Providers: **${stats.providers}**`)
			content = content.replace(/Unique Models:\s*\*\*\d+\*\*/g, `Unique Models: **${stats.uniqueModels}**`)
			content = content.replace(
				/Total Model Definitions:\s*\*\*\d+\*\*/g,
				`Total Model Definitions: **${stats.totalModels}**`,
			)
			// 문서화용 텍스트
			content = content.replace(
				/supports \d+ unique AI models across \d+ providers/g,
				`supports ${stats.uniqueModels} unique AI models across ${stats.providers} providers`,
			)
		}

		fs.writeFileSync(filePath, content, "utf-8")
		console.log(`✅ README 업데이트 완료: ${path.basename(filePath)}`)
	})
}

// 지원 모델리스트 생성
function generateModelList(stats) {
	const docsDir = path.join(PROJECT_ROOT, "docs")
	if (!fs.existsSync(docsDir)) {
		fs.mkdirSync(docsDir, { recursive: true })
	}

	// 한국어 버전
	const koContent = `# Caret 지원 모델 리스트

> **업데이트**: ${new Date().toLocaleDateString("ko-KR")}  
> **총 프로바이더**: ${stats.providers}개  
> **총 모델 정의**: ${stats.totalModels}개  
> **유니크 모델**: ${stats.uniqueModels}개  

## 📊 프로바이더별 모델 현황

${stats.modelSections
	.map((section) => {
		const providerName = section.name.replace("Models", "")
		return `### ${providerName.toUpperCase()} (${section.models.length}개 모델)

${section.models.map((model) => `- \`${model}\``).join("\n")}
`
	})
	.join("\n")}

## 🔍 전체 프로바이더 목록

${stats.providerList.map((provider) => `- **${provider}**`).join("\n")}

---

**총 ${stats.uniqueModels}개 고유 AI 모델을 ${stats.providers}개 프로바이더에서 지원합니다.**

*이 문서는 자동으로 생성되었습니다. (\`caret-scripts/generate-model-documentation.js\`)*
`

	// 영어 버전
	const enContent = `# Caret Supported Models List

> **Updated**: ${new Date().toLocaleDateString("en-US")}  
> **Total Providers**: ${stats.providers}  
> **Total Model Definitions**: ${stats.totalModels}  
> **Unique Models**: ${stats.uniqueModels}  

## 📊 Models by Provider

${stats.modelSections
	.map((section) => {
		const providerName = section.name.replace("Models", "")
		return `### ${providerName.toUpperCase()} (${section.models.length} models)

${section.models.map((model) => `- \`${model}\``).join("\n")}
`
	})
	.join("\n")}

## 🔍 All Providers

${stats.providerList.map((provider) => `- **${provider}**`).join("\n")}

---

**Caret supports ${stats.uniqueModels} unique AI models across ${stats.providers} providers.**

*This document is automatically generated by \`caret-scripts/generate-model-documentation.js\`*
`

	// 파일 저장
	fs.writeFileSync(path.join(docsDir, "supported-models.ko.md"), koContent, "utf-8")
	fs.writeFileSync(path.join(docsDir, "supported-models.en.md"), enContent, "utf-8")

	console.log("✅ 지원 모델리스트 생성 완료:")
	console.log("   📄 docs/supported-models.ko.md (한국어)")
	console.log("   📄 docs/supported-models.en.md (영어)")
}

// 메인 실행
try {
	const stats = parseApiFile()

	console.log("📊 파싱 결과:")
	console.log(`   🔹 프로바이더: ${stats.providers}개`)
	console.log(`   🔹 총 모델: ${stats.totalModels}개`)
	console.log(`   🔹 유니크 모델: ${stats.uniqueModels}개`)
	console.log(`   🔹 모델 섹션: ${stats.modelSections.length}개`)

	updateReadme(stats)
	generateModelList(stats)

	console.log("\n🎉 문서화 자동생성 완료!")
	console.log(`📋 문서화용 텍스트: "총 ${stats.uniqueModels}개 고유 AI 모델을 ${stats.providers}개 프로바이더에서 지원"`)
} catch (error) {
	console.error("❌ 오류 발생:", error.message)
	process.exit(1)
}
