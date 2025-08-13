#!/usr/bin/env node

const fs = require("fs")

const caretContent = fs.readFileSync("/home/luke/caret/src/shared/api.ts", "utf8")

console.log("🔍 모델 섹션 디버깅:")

const lines = caretContent.split("\n")
let modelCount = 0
let currentSection = ""
const sectionCounts = {}

for (let i = 0; i < lines.length; i++) {
	const line = lines[i]

	// 모델 섹션 확인
	const sectionMatch = line.match(/export const (\w+Models) = \{/)
	if (sectionMatch) {
		currentSection = sectionMatch[1]
		sectionCounts[currentSection] = 0
		console.log(`📍 섹션 발견: ${currentSection} (라인 ${i + 1})`)
		continue
	}

	// 모델 정의 라인 확인
	const modelMatch = line.match(/^\s*"([^"]+)"\s*:/)
	if (modelMatch && currentSection) {
		modelCount++
		sectionCounts[currentSection]++
		if (sectionCounts[currentSection] <= 3) {
			console.log(`  • ${modelMatch[1]}`)
		}
	}
}

console.log(`\n📊 총 모델 수: ${modelCount}`)
console.log(`📋 섹션별 모델 수:`, Object.keys(sectionCounts).length, "개 섹션")
Object.entries(sectionCounts).forEach(([section, count]) => {
	console.log(`  ${section}: ${count}개`)
})
