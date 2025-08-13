#!/usr/bin/env node

/**
 * 통합 모델 분석 스크립트
 * Caret vs Cline 정확한 비교 및 문서 생성용 데이터 출력
 */

const fs = require("fs")
const path = require("path")

console.log("🔍 통합 모델 분석 스크립트 시작...\n")

// 파일 읽기
const caretApiPath = path.join(__dirname, "../src/shared/api.ts")
const clineApiPath = path.join(__dirname, "../cline-latest/src/shared/api.ts")
const caretContent = fs.readFileSync(caretApiPath, "utf8")
const clineContent = fs.readFileSync(clineApiPath, "utf8")

// 프로바이더 추출 함수
function extractProviders(content) {
	const providerMatch = content.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (!providerMatch) return []

	const providers = []
	const lines = providerMatch[0].split("\n")

	for (const line of lines) {
		const match = line.match(/^\s*\|\s*"([^"]+)"\s*$/)
		if (match) {
			providers.push(match[1])
		}
	}

	return providers
}

// 모델 섹션 추출 함수 (중복 제거)
function extractModelSections(content) {
	const sectionRegex = /export const (\w+Models) = \{([\s\S]*?)\} as const satisfies Record<string, ModelInfo>/g
	const sections = new Map()
	let match

	while ((match = sectionRegex.exec(content)) !== null) {
		const sectionName = match[1]
		const sectionContent = match[2]

		// 중복 스킵 (첫 번째만 유지)
		if (sections.has(sectionName)) continue

		// 모델들 찾기
		const modelRegex = /^\s*"([^"]+)"\s*:\s*\{/gm
		const models = []
		let modelMatch

		while ((modelMatch = modelRegex.exec(sectionContent)) !== null) {
			models.push(modelMatch[1])
		}

		sections.set(sectionName, models)
	}

	return sections
}

// 1. Caret 분석
const caretProviders = extractProviders(caretContent)
const caretSections = extractModelSections(caretContent)
let caretTotalModels = 0
caretSections.forEach((models) => (caretTotalModels += models.length))

console.log("🔍 **Caret 현황:**")
console.log(`📍 프로바이더: ${caretProviders.length}개`)
console.log(`🚀 모델: ${caretTotalModels}개`)
console.log(`📋 섹션: ${caretSections.size}개\n`)

// 2. Cline 분석
const clineProviders = extractProviders(clineContent)
const clineSections = extractModelSections(clineContent)
let clineTotalModels = 0
clineSections.forEach((models) => (clineTotalModels += models.length))

console.log("🔍 **Cline 현황:**")
console.log(`📍 프로바이더: ${clineProviders.length}개`)
console.log(`🚀 모델: ${clineTotalModels}개`)
console.log(`📋 섹션: ${clineSections.size}개\n`)

// 3. 비교 분석
console.log("📊 **비교 결과:**")
console.log(`🎯 달성률: ${Math.round((caretTotalModels / clineTotalModels) * 100)}%`)
console.log(`📊 모델 차이: ${clineTotalModels - caretTotalModels}개 (${caretTotalModels} vs ${clineTotalModels})`)
console.log(
	`📊 프로바이더 차이: ${clineProviders.length - caretProviders.length}개 (${caretProviders.length} vs ${clineProviders.length})\n`,
)

// 4. 누락/추가 분석
const missingProviders = clineProviders.filter((p) => !caretProviders.includes(p))
const extraProviders = caretProviders.filter((p) => !clineProviders.includes(p))

if (missingProviders.length > 0) {
	console.log(`➕ **누락된 프로바이더 (${missingProviders.length}개):**`)
	missingProviders.forEach((p) => console.log(`   • ${p}`))
	console.log()
}

if (extraProviders.length > 0) {
	console.log(`🔥 **Caret 전용 프로바이더 (${extraProviders.length}개):**`)
	extraProviders.forEach((p) => console.log(`   • ${p}`))
	console.log()
}

// 5. 섹션별 상세 비교
console.log("📋 **섹션별 비교:**\n")

const allSectionNames = new Set([...caretSections.keys(), ...clineSections.keys()])
let totalMissingModels = 0
const missingSection = []

for (const sectionName of allSectionNames) {
	const caretModels = caretSections.get(sectionName) || []
	const clineModels = clineSections.get(sectionName) || []

	if (caretModels.length === 0 && clineModels.length > 0) {
		console.log(`❌ **${sectionName}**: 누락됨 (Cline ${clineModels.length}개)`)
		missingSection.push({ name: sectionName, count: clineModels.length, models: clineModels })
		totalMissingModels += clineModels.length
	} else if (caretModels.length > 0 && clineModels.length === 0) {
		console.log(`🔥 **${sectionName}**: Caret 전용 (${caretModels.length}개)`)
	} else if (caretModels.length !== clineModels.length) {
		const diff = clineModels.length - caretModels.length
		if (diff > 0) {
			console.log(`⚠️  **${sectionName}**: ${diff}개 부족 (Caret ${caretModels.length} vs Cline ${clineModels.length})`)
			totalMissingModels += diff
		} else {
			console.log(
				`🎯 **${sectionName}**: ${Math.abs(diff)}개 초과 (Caret ${caretModels.length} vs Cline ${clineModels.length})`,
			)
		}
	} else {
		console.log(`✅ **${sectionName}**: 동일 (${caretModels.length}개)`)
	}
}

// 6. README 업데이트용 데이터
if (process.argv.includes("--readme")) {
	console.log("\n📝 **README 업데이트용 데이터:**\n")
	console.log(
		`Caret supports **${caretTotalModels} models** from **${caretProviders.length} providers**, giving you the freedom to choose the tools that best fit your needs.\n`,
	)

	// 상위 프로바이더 추출
	const sortedSections = Array.from(caretSections.entries())
		.sort((a, b) => b[1].length - a[1].length)
		.slice(0, 6)

	console.log("### 🔥 Key Providers\n")

	const providerMapping = {
		anthropicModels: "Anthropic Claude",
		geminiModels: "Google Gemini",
		vertexModels: "Vertex AI",
		internationalQwenModels: "International Qwen",
		openAiNativeModels: "OpenAI Native",
		bedrockModels: "AWS Bedrock",
	}

	sortedSections.forEach(([sectionName, models]) => {
		const providerName = providerMapping[sectionName] || sectionName.replace("Models", "")
		const topModels = models.slice(0, 3)
		console.log(`- **${providerName}** (${models.length} models): ${topModels.join(", ")} with advanced capabilities`)
	})
}

console.log(`\n📊 **최종 요약:**`)
console.log(`🎯 목표: Cline ${clineTotalModels}개 수준 달성`)
console.log(`📈 현재: ${caretTotalModels}개 (${Math.round((caretTotalModels / clineTotalModels) * 100)}%)`)
console.log(`➕ 추가 필요: ${totalMissingModels}개 모델, ${missingSection.length}개 섹션`)

console.log("\n✅ 통합 분석 완료!")
