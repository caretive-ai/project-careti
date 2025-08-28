#!/usr/bin/env node

/**
 * Caret 모델 계산 디버그 스크립트
 * 정확한 문제점 찾기
 */

const fs = require("fs")
const path = require("path")

const apiFilePath = path.join(__dirname, "../src/shared/api.ts")
const content = fs.readFileSync(apiFilePath, "utf8")

console.log("🔍 모델 계산 디버그 스크립트 시작...\n")

// 1. 모든 모델 섹션 찾기
const sectionRegex = /export const (\w+Models) = \{([\s\S]*?)\} as const satisfies Record<string, ModelInfo>/g
const sections = []
let match

while ((match = sectionRegex.exec(content)) !== null) {
	const sectionName = match[1]
	const sectionContent = match[2]

	// 이 섹션의 모델들 찾기
	const modelRegex = /^\s*"([^"]+)"\s*:\s*\{/gm
	const models = []
	let modelMatch

	while ((modelMatch = modelRegex.exec(sectionContent)) !== null) {
		models.push(modelMatch[1])
	}

	sections.push({
		name: sectionName,
		count: models.length,
		models: models,
		startIndex: match.index,
	})
}

console.log("📋 **발견된 모델 섹션들:**\n")

let totalModels = 0
const duplicateSections = new Map()

sections.forEach((section, index) => {
	console.log(`${index + 1}. **${section.name}**: ${section.count}개 모델 (위치: ${section.startIndex})`)

	// 중복 섹션 체크
	if (duplicateSections.has(section.name)) {
		console.log(`   ⚠️  중복 발견! 이미 ${duplicateSections.get(section.name)}번째에 있음`)
	} else {
		duplicateSections.set(section.name, index + 1)
		totalModels += section.count
	}
})

console.log(`\n📊 **계산 결과:**`)
console.log(`🔢 총 섹션: ${sections.length}개`)
console.log(`🔢 중복 제거 후 섹션: ${duplicateSections.size}개`)
console.log(`🚀 총 모델: ${totalModels}개`)

// 2. 중복 섹션 상세 분석
console.log(`\n🔍 **중복 섹션 상세 분석:**\n`)

const sectionCounts = new Map()
sections.forEach((section) => {
	if (!sectionCounts.has(section.name)) {
		sectionCounts.set(section.name, [])
	}
	sectionCounts.get(section.name).push(section)
})

for (const [name, occurrences] of sectionCounts) {
	if (occurrences.length > 1) {
		console.log(`❌ **${name}** 중복됨:`)
		occurrences.forEach((occ, i) => {
			console.log(`   ${i + 1}. ${occ.count}개 모델 (위치: ${occ.startIndex})`)
			console.log(`      샘플: ${occ.models.slice(0, 3).join(", ")}`)
		})
		console.log("")
	}
}

// 3. accurate-merge-analysis.js와 비교
console.log(`\n🔄 **accurate-merge-analysis.js 실행해서 비교:**\n`)

const { exec } = require("child_process")
exec("node caret-scripts/accurate-merge-analysis.js | head -10", { cwd: path.dirname(__dirname) }, (error, stdout) => {
	if (error) {
		console.error("Error:", error)
		return
	}
	console.log(stdout)
	console.log("\n✅ 디버그 완료!")
})

console.log("📝 **결론**: 중복 제거 필요!")
