#!/usr/bin/env node

const fs = require("fs")

console.log("🔍 섹션별 모델 수 분석:")

function analyzeSectionModels(content) {
	const lines = content.split("\n")
	let currentSection = ""
	const sectionCounts = {}
	let totalCount = 0

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// 모델 섹션 확인
		const sectionMatch = line.match(/export const (\w+Models) = \{/)
		if (sectionMatch) {
			currentSection = sectionMatch[1]
			sectionCounts[currentSection] = 0
			continue
		}

		// 모델 정의 라인 확인
		const modelMatch = line.match(/^\s*"([^"]+)"\s*:/)
		if (modelMatch && currentSection) {
			sectionCounts[currentSection]++
			totalCount++
		}
	}

	return { sectionCounts, totalCount }
}

const caretContent = fs.readFileSync("/home/luke/caret/src/shared/api.ts", "utf8")
const caretResult = analyzeSectionModels(caretContent)

console.log("📊 각 섹션별 모델 수:")
Object.entries(caretResult.sectionCounts).forEach(([section, count]) => {
	console.log(`  ${section}: ${count}개`)
})

console.log(`\n📊 총합: ${caretResult.totalCount}개`)
console.log(`📊 예상: 274개`)
console.log(`📊 차이: ${274 - caretResult.totalCount}개 누락`)

// 가장 많은 모델을 가진 섹션들 확인
console.log("\n🔍 모델이 많은 섹션들:")
const sorted = Object.entries(caretResult.sectionCounts)
	.sort(([, a], [, b]) => b - a)
	.slice(0, 5)

sorted.forEach(([section, count]) => {
	console.log(`  ${section}: ${count}개`)
})
