#!/usr/bin/env node

/**
 * Caret vs Cline Comprehensive Comparison Tool
 * Based on caret-main accurate-caret-cline-comparison.js
 * Enhanced for current project structure
 */

const fs = require("fs")
const path = require("path")

console.log("🔍 Caret vs Cline 정확한 비교 스크립트 시작...\n")

// 파일 읽기 함수
function safeReadFile(filePath) {
	try {
		return fs.readFileSync(filePath, "utf8")
	} catch (_error) {
		console.warn(`⚠️ 파일을 읽을 수 없습니다: ${filePath}`)
		return null
	}
}

// 프로바이더 추출 함수
function extractProviders(content) {
	if (!content) {
		return []
	}

	const providerMatch = content.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (!providerMatch) {
		return []
	}

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
	if (!content) {
		return new Map()
	}

	const sectionRegex = /export const (\w+Models) = \{([\s\S]*?)\} as const satisfies Record<string, ModelInfo>/g
	const sections = new Map()
	let match

	while ((match = sectionRegex.exec(content)) !== null) {
		const sectionName = match[1]
		const sectionContent = match[2]

		// 중복 스킵
		if (sections.has(sectionName)) {
			continue
		}

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

// 메인 비교 함수
function compareCaretCline() {
	// 파일 경로 설정
	const caretApiPath = path.join(process.cwd(), "src/shared/api.ts")
	const clineApiPath = path.join(process.cwd(), "cline-latest/src/shared/api.ts")

	const caretContent = safeReadFile(caretApiPath)
	const clineContent = safeReadFile(clineApiPath)

	if (!caretContent || !clineContent) {
		console.error("❌ API 파일들을 찾을 수 없습니다. 프로젝트 루트에서 실행해주세요.")
		return
	}

	// 1. 프로바이더 비교
	const caretProviders = extractProviders(caretContent)
	const clineProviders = extractProviders(clineContent)

	console.log("📍 **프로바이더 비교:**")
	console.log(`🟦 Caret: ${caretProviders.length}개`)
	console.log(`🟩 Cline: ${clineProviders.length}개`)
	console.log(`📊 차이: ${clineProviders.length - caretProviders.length}개\n`)

	// 누락된 프로바이더
	const missingProviders = clineProviders.filter((p) => !caretProviders.includes(p))
	const extraProviders = caretProviders.filter((p) => !clineProviders.includes(p))

	if (missingProviders.length > 0) {
		console.log(`➕ **Caret에 누락된 프로바이더 (${missingProviders.length}개):**`)
		missingProviders.forEach((p) => console.log(`   • ${p}`))
		console.log()
	}

	if (extraProviders.length > 0) {
		console.log(`🔥 **Caret 전용 프로바이더 (${extraProviders.length}개):**`)
		extraProviders.forEach((p) => console.log(`   • ${p}`))
		console.log()
	}

	// 2. 모델 섹션 비교
	const caretSections = extractModelSections(caretContent)
	const clineSections = extractModelSections(clineContent)

	let caretTotalModels = 0
	let clineTotalModels = 0

	caretSections.forEach((models) => (caretTotalModels += models.length))
	clineSections.forEach((models) => (clineTotalModels += models.length))

	console.log("📍 **모델 비교:**")
	console.log(`🟦 Caret: ${caretTotalModels}개 모델 (${caretSections.size}개 섹션)`)
	console.log(`🟩 Cline: ${clineTotalModels}개 모델 (${clineSections.size}개 섹션)`)
	console.log(`📊 차이: ${clineTotalModels - caretTotalModels}개 모델\n`)

	// 섹션별 비교
	console.log("📋 **섹션별 상세 비교:**\n")

	const allSectionNames = new Set([...caretSections.keys(), ...clineSections.keys()])
	let missingSections = 0
	let missingModels = 0

	for (const sectionName of allSectionNames) {
		const caretModels = caretSections.get(sectionName) || []
		const clineModels = clineSections.get(sectionName) || []

		if (caretModels.length === 0 && clineModels.length > 0) {
			console.log(`❌ **${sectionName}**: Caret에 누락됨 (Cline ${clineModels.length}개)`)
			missingSections++
			missingModels += clineModels.length
		} else if (caretModels.length > 0 && clineModels.length === 0) {
			console.log(`🔥 **${sectionName}**: Caret 전용 (${caretModels.length}개)`)
		} else if (caretModels.length !== clineModels.length) {
			console.log(`⚠️  **${sectionName}**: Caret ${caretModels.length}개 vs Cline ${clineModels.length}개`)
			if (clineModels.length > caretModels.length) {
				missingModels += clineModels.length - caretModels.length
			}
		} else {
			console.log(`✅ **${sectionName}**: 동일 (${caretModels.length}개)`)
		}
	}

	// 3. 요약
	console.log(`\n📊 **최종 요약:**`)
	console.log(`🎯 **목표**: Cline과 동일한 수준 + Caret 전용 기능`)
	console.log(`📈 **현재 달성률**: ${Math.round((caretTotalModels / clineTotalModels) * 100)}%`)
	console.log(`➕ **추가 필요**: ~${missingModels}개 모델, ${missingSections}개 섹션`)
	console.log(`🔥 **Caret 우위**: ${extraProviders.length}개 전용 프로바이더`)

	console.log("\n✅ 정확한 비교 분석 완료!")

	return {
		providers: { caret: caretProviders, cline: clineProviders, missing: missingProviders, extra: extraProviders },
		models: { caret: caretTotalModels, cline: clineTotalModels, missing: missingModels },
		sections: { caret: caretSections, cline: clineSections },
	}
}

// CLI 실행
if (require.main === module) {
	compareCaretCline()
}

module.exports = { compareCaretCline, extractProviders, extractModelSections }
