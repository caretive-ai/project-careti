#!/usr/bin/env node

const fs = require("fs")

console.log("🔍 메인 스크립트와 디버깅 스크립트 차이 분석:")

function runMainLogic(content, source) {
	const models = new Map()
	const lines = content.split("\n")
	let currentSection = ""
	let sectionCount = 0

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// 모델 섹션 확인
		const sectionMatch = line.match(/export const (\w+Models) = \{/)
		if (sectionMatch) {
			currentSection = sectionMatch[1]
			sectionCount++
			console.log(`📍 섹션 ${sectionCount}: ${currentSection}`)
			continue
		}

		// 모델 정의 라인 확인
		const modelMatch = line.match(/^\s*"([^"]+)"\s*:/)
		if (modelMatch && currentSection) {
			const modelId = modelMatch[1]
			models.set(modelId, {
				_section: currentSection,
				_raw: line.trim(),
			})

			if (models.size <= 5) {
				console.log(`  • 모델 ${models.size}: ${modelId}`)
			}
		}
	}

	return models
}

const caretContent = fs.readFileSync("/home/luke/caret/src/shared/api.ts", "utf8")
const caretModels = runMainLogic(caretContent, "Caret")

console.log(`\n📊 메인 로직 결과: ${caretModels.size}개 모델`)
console.log(`📊 예상 결과: 274개 모델`)
console.log(`📊 차이: ${274 - caretModels.size}개 누락`)
