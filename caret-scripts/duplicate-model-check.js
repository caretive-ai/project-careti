#!/usr/bin/env node

const fs = require("fs")

console.log("🔍 중복 모델 ID 체크:")

function checkDuplicateModels(content) {
	const lines = content.split("\n")
	let currentSection = ""
	const modelIds = []
	const modelsBySection = {}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// 모델 섹션 확인
		const sectionMatch = line.match(/export const (\w+Models) = \{/)
		if (sectionMatch) {
			currentSection = sectionMatch[1]
			modelsBySection[currentSection] = []
			continue
		}

		// 모델 정의 라인 확인
		const modelMatch = line.match(/^\s*"([^"]+)"\s*:/)
		if (modelMatch && currentSection) {
			const modelId = modelMatch[1]
			modelIds.push(modelId)
			modelsBySection[currentSection].push(modelId)
		}
	}

	// 중복 찾기
	const modelCounts = {}
	modelIds.forEach((id) => {
		modelCounts[id] = (modelCounts[id] || 0) + 1
	})

	const duplicates = Object.entries(modelCounts).filter(([id, count]) => count > 1)

	console.log(`📊 총 모델 ID: ${modelIds.length}개`)
	console.log(`📊 중복 모델 ID: ${duplicates.length}개`)

	if (duplicates.length > 0) {
		console.log("\n🚨 중복된 모델 ID들:")
		duplicates.forEach(([id, count]) => {
			console.log(`  • ${id} (${count}번 나타남)`)

			// 어느 섹션에서 나타나는지 확인
			Object.entries(modelsBySection).forEach(([section, models]) => {
				if (models.includes(id)) {
					console.log(`    - ${section} 섹션`)
				}
			})
		})
	}

	return { totalModels: modelIds.length, uniqueModels: Object.keys(modelCounts).length, duplicates }
}

const caretContent = fs.readFileSync("/home/luke/caret/src/shared/api.ts", "utf8")
const result = checkDuplicateModels(caretContent)

console.log(`\n📊 결과 요약:`)
console.log(`  전체 모델 정의: ${result.totalModels}개`)
console.log(`  고유 모델 ID: ${result.uniqueModels}개`)
console.log(`  중복으로 인한 손실: ${result.totalModels - result.uniqueModels}개`)
