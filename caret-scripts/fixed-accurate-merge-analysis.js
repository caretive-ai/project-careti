#!/usr/bin/env node

/**
 * 완전히 수정된 정확한 모델 병합 분석 스크립트
 * awk와 동일한 방식으로 정확하게 계산
 */

const fs = require("fs")
const path = require("path")

console.log("🔧 수정된 정확한 모델 병합 분석 스크립트 시작...\n")

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

// 모델 수 계산 함수 (awk와 동일한 방식)
function countModels(content) {
	let count = 0
	let inModelSection = false

	const lines = content.split("\n")

	for (const line of lines) {
		// 모델 섹션 시작 체크
		if (/export const.*Models = \{/.test(line)) {
			inModelSection = true
			continue
		}

		// 모델 섹션 종료 체크
		if (inModelSection && /\} as const satisfies Record/.test(line)) {
			inModelSection = false
			continue
		}

		// 모델 정의 라인 체크 (awk와 동일한 패턴)
		if (inModelSection && /^\s*"[^"]*"\s*:/.test(line)) {
			count++
		}
	}

	return count
}

// 모델 이름들 추출 함수
function extractModelNames(content) {
	const models = new Set()
	let inModelSection = false

	const lines = content.split("\n")

	for (const line of lines) {
		// 모델 섹션 시작 체크
		if (/export const.*Models = \{/.test(line)) {
			inModelSection = true
			continue
		}

		// 모델 섹션 종료 체크
		if (inModelSection && /\} as const satisfies Record/.test(line)) {
			inModelSection = false
			continue
		}

		// 모델 이름 추출
		if (inModelSection) {
			const match = line.match(/^\s*"([^"]+)"\s*:/)
			if (match) {
				models.add(match[1])
			}
		}
	}

	return Array.from(models)
}

// 분석 실행
console.log("📍 **프로바이더 분석:**")
const caretProviders = extractProviders(caretContent)
const clineProviders = extractProviders(clineContent)
console.log(`🟦 Caret: ${caretProviders.length}개 프로바이더`)
console.log(`🟩 Cline: ${clineProviders.length}개 프로바이더\n`)

console.log("📍 **모델 수 분석:**")
const caretModelCount = countModels(caretContent)
const clineModelCount = countModels(clineContent)
console.log(`🟦 Caret: ${caretModelCount}개 모델`)
console.log(`🟩 Cline: ${clineModelCount}개 모델`)
console.log(`📊 차이: ${clineModelCount - caretModelCount}개\n`)

// 상세 비교
if (caretModelCount === clineModelCount) {
	console.log("✅ **완벽한 동기화!** Caret과 Cline의 모델 수가 완전히 일치합니다! 🎊")
} else {
	console.log(`⚠️  **동기화 필요**: ${Math.abs(clineModelCount - caretModelCount)}개 모델 차이`)

	// 모델 이름 상세 비교
	const caretModels = new Set(extractModelNames(caretContent))
	const clineModels = new Set(extractModelNames(clineContent))

	const missingInCaret = Array.from(clineModels).filter((model) => !caretModels.has(model))
	const extraInCaret = Array.from(caretModels).filter((model) => !clineModels.has(model))

	if (missingInCaret.length > 0) {
		console.log(`\n➕ **Caret에 누락된 모델들 (${missingInCaret.length}개):**`)
		missingInCaret.slice(0, 10).forEach((model) => console.log(`   • ${model}`))
		if (missingInCaret.length > 10) {
			console.log(`   ... 및 ${missingInCaret.length - 10}개 더`)
		}
	}

	if (extraInCaret.length > 0) {
		console.log(`\n🔥 **Caret 전용 모델들 (${extraInCaret.length}개):**`)
		extraInCaret.slice(0, 10).forEach((model) => console.log(`   • ${model}`))
		if (extraInCaret.length > 10) {
			console.log(`   ... 및 ${extraInCaret.length - 10}개 더`)
		}
	}
}

console.log("\n✅ 수정된 분석 완료!")
