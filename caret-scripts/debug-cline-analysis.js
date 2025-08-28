#!/usr/bin/env node

/**
 * Cline 모델 정확한 분석 디버그 스크립트
 */

const fs = require("fs")
const path = require("path")

// Cline api.ts 읽기
const clineApiPath = path.join(__dirname, "../cline-latest/src/shared/api.ts")
const clineContent = fs.readFileSync(clineApiPath, "utf8")

console.log("🔍 Cline 모델 정확한 분석 시작...\n")

// 1. Cline ApiProvider 분석
const providerMatch = clineContent.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
if (!providerMatch) {
	console.error("❌ Cline ApiProvider 타입을 찾을 수 없습니다.")
	process.exit(1)
}

const clineProviders = []
const providerLines = providerMatch[0].split("\n")

for (const line of providerLines) {
	const match = line.match(/^\s*\|\s*"([^"]+)"\s*$/)
	if (match) {
		clineProviders.push(match[1])
	}
}

console.log(`📍 Cline 프로바이더: ${clineProviders.length}개`)
console.log(`📋 리스트: ${clineProviders.join(", ")}\n`)

// 2. Cline 모델 섹션들 분석 (중복 제거)
const sectionRegex = /export const (\w+Models) = \{([\s\S]*?)\} as const satisfies Record<string, ModelInfo>/g
const sections = new Map()
let match

while ((match = sectionRegex.exec(clineContent)) !== null) {
	const sectionName = match[1]
	const sectionContent = match[2]

	// 중복 체크
	if (sections.has(sectionName)) {
		console.log(`⚠️  중복 섹션 ${sectionName} 발견됨`)
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

// 3. 통계 출력
let totalModels = 0
console.log("📋 **Cline 모델 섹션들:**\n")

for (const [sectionName, data] of sections) {
	console.log(`✅ ${sectionName}: ${data.count}개 모델`)
	totalModels += data.count
}

console.log(`\n📊 **Cline 최종 통계:**`)
console.log(`🚀 프로바이더: ${clineProviders.length}개`)
console.log(`🎯 모델: ${totalModels}개`)
console.log(`📋 섹션: ${sections.size}개`)

// 4. TOP 10 섹션
const sortedSections = Array.from(sections.entries())
	.sort((a, b) => b[1].count - a[1].count)
	.slice(0, 10)
console.log(`\n🏆 **TOP 10 모델 섹션:**\n`)

sortedSections.forEach(([name, data], index) => {
	const samples = data.models.slice(0, 3).join(", ")
	console.log(`${index + 1}. **${name}**: ${data.count}개 (${samples}...)`)
})

console.log("\n✅ Cline 분석 완료!")
