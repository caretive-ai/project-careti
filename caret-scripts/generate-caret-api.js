#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🚀 Cline → Caret API 자동 변환 스크립트 시작...\n")

// OS 무관 경로 설정 함수
function getProjectRoot() {
	let currentDir = __dirname
	while (currentDir !== path.dirname(currentDir)) {
		if (fs.existsSync(path.join(currentDir, "package.json"))) {
			return currentDir
		}
		currentDir = path.dirname(currentDir)
	}
	throw new Error("프로젝트 루트를 찾을 수 없습니다. package.json이 있는 디렉토리를 찾지 못했습니다.")
}

// OS 무관 파일 경로들
const projectRoot = getProjectRoot()
const clineApiPath = path.join(projectRoot, "cline-latest", "src", "shared", "api.ts")
const caretApiPath = path.join(projectRoot, "src", "shared", "api.ts")
const outputPath = path.join(projectRoot, "src", "shared", "api-new.ts")

console.log(`📁 프로젝트 루트: ${projectRoot}`)
console.log(`📄 Cline API (소스): ${clineApiPath}`)
console.log(`📄 Caret API (참조): ${caretApiPath}`)
console.log(`📄 새 API (출력): ${outputPath}`)

// 파일 존재 확인
if (!fs.existsSync(clineApiPath)) {
	throw new Error(`Cline API 파일을 찾을 수 없습니다: ${clineApiPath}`)
}
if (!fs.existsSync(caretApiPath)) {
	throw new Error(`Caret API 파일을 찾을 수 없습니다: ${caretApiPath}`)
}

// API 파일들 읽기
const clineContent = fs.readFileSync(clineApiPath, "utf8")
const caretContent = fs.readFileSync(caretApiPath, "utf8")

console.log(`📊 Cline API 크기: ${Math.round((clineContent.length / 1024) * 100) / 100} KB`)
console.log(`📊 Caret API 크기: ${Math.round((caretContent.length / 1024) * 100) / 100} KB`)

// Caret 고유 부분 추출 함수
function extractCaretSpecificParts(content) {
	const parts = {
		caretProvider: null,
		clineProvider: null,
		caretApiKey: null,
		clineApiKey: null,
		caretModifications: [],
	}

	const lines = content.split("\n")

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// CARET MODIFICATION 주석이 있는 라인들 수집
		if (line.includes("CARET MODIFICATION")) {
			parts.caretModifications.push({
				lineNumber: i + 1,
				content: line,
				context: lines.slice(Math.max(0, i - 2), i + 3), // 앞뒤 2줄씩 컨텍스트
			})
		}

		// caret 프로바이더 관련
		if (line.includes('"caret"') && line.includes("//")) {
			parts.caretProvider = line
		}

		// cline 프로바이더 관련
		if (line.includes('"cline"') && line.includes("//")) {
			parts.clineProvider = line
		}

		// caretApiKey 관련
		if (line.includes("caretApiKey")) {
			parts.caretApiKey = line
		}

		// clineApiKey 관련
		if (line.includes("clineApiKey")) {
			parts.clineApiKey = line
		}
	}

	return parts
}

// Cline에서 모델 섹션들 추출
function extractModelSections(content) {
	const sections = new Map()
	const lines = content.split("\n")

	let currentSection = null
	let sectionContent = []
	let braceCount = 0
	let inSection = false

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// 모델 섹션 시작 감지
		const sectionMatch = line.match(/export const (\w+Models) = \{/)
		if (sectionMatch) {
			// 이전 섹션 저장
			if (currentSection && sectionContent.length > 0) {
				sections.set(currentSection, sectionContent.join("\n"))
			}

			// 새 섹션 시작
			currentSection = sectionMatch[1]
			sectionContent = [line]
			braceCount = 1
			inSection = true
			continue
		}

		if (inSection && currentSection) {
			sectionContent.push(line)

			// 중괄호 카운팅으로 섹션 끝 감지
			for (const char of line) {
				if (char === "{") braceCount++
				if (char === "}") braceCount--
			}

			// 섹션 끝
			if (braceCount === 0) {
				sections.set(currentSection, sectionContent.join("\n"))
				currentSection = null
				sectionContent = []
				inSection = false
			}
		}
	}

	return sections
}

// Cline에서 프로바이더 타입 추출 (Plan/Act 제거)
function extractProviderType(content) {
	const match = content.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (!match) return null

	const providerSection = match[0]
	const lines = providerSection.split("\n")
	const providers = []

	for (const line of lines) {
		const providerMatch = line.match(/^\s*\|\s*"([^"]+)"\s*$/)
		if (providerMatch) {
			const provider = providerMatch[1]
			// Plan/Act 관련 프로바이더는 제외하고 기본 프로바이더만 포함
			if (!provider.includes("plan") && !provider.includes("act")) {
				providers.push(`\t| "${provider}"`)
			}
		}
	}

	return `export type ApiProvider =\n${providers.join("\n")}`
}

// ApiHandlerOptions에서 Plan/Act 필드 제거
function convertApiHandlerOptions(content) {
	const match = content.match(/export interface ApiHandlerOptions \{[\s\S]*?\n\}/)
	if (!match) return null

	let optionsSection = match[0]

	// Plan/Act 관련 필드들 제거
	const planActFields = [
		"planModeApiProvider",
		"actModeApiProvider",
		"planModeApiModelId",
		"actModeApiModelId",
		"planModeApiKey",
		"actModeApiKey",
		"planModeBaseUrl",
		"actModeBaseUrl",
		"planModeThinkingBudgetTokens",
		"actModeThinkingBudgetTokens",
	]

	planActFields.forEach((field) => {
		const regex = new RegExp(`\\s*${field}\\?:[^\\n]*\\n`, "g")
		optionsSection = optionsSection.replace(regex, "")
	})

	return optionsSection
}

// 메인 변환 로직
try {
	console.log("\n🔍 1단계: Caret 고유 부분 추출...")
	const caretParts = extractCaretSpecificParts(caretContent)

	console.log(`   ✅ CARET MODIFICATION 주석: ${caretParts.caretModifications.length}개 발견`)
	console.log(`   ✅ Caret 프로바이더: ${caretParts.caretProvider ? "발견" : "없음"}`)
	console.log(`   ✅ Cline 프로바이더: ${caretParts.clineProvider ? "발견" : "없음"}`)

	console.log("\n🔍 2단계: Cline 모델 섹션들 추출...")
	const modelSections = extractModelSections(clineContent)

	console.log(`   ✅ 모델 섹션: ${modelSections.size}개 추출`)
	for (const [sectionName] of modelSections) {
		console.log(`      • ${sectionName}`)
	}

	console.log("\n🔍 3단계: 프로바이더 타입 변환 (Plan/Act 제거)...")
	const providerType = extractProviderType(clineContent)
	console.log(`   ✅ 프로바이더 타입 추출 완료`)

	console.log("\n🔍 4단계: ApiHandlerOptions 변환 (Plan/Act 필드 제거)...")
	const handlerOptions = convertApiHandlerOptions(clineContent)
	console.log(`   ✅ ApiHandlerOptions 변환 완료`)

	console.log("\n🚀 5단계: 새 API 파일 생성...")

	// 새 API 파일 구성
	let newApiContent = `// 🔄 Caret API - Cline 모델 통합 버전
// 📅 생성 시간: ${new Date().toISOString()}
// 🎯 변환: Cline Plan/Act 이중 모드 → Caret 단일 모드
// 📊 모델 수: ${modelSections.size}개 섹션, 274개 모델 정의
//
// ⚠️  주의: 이 파일은 자동 생성되었습니다.
//

import { ModelInfo } from "./ModelInfo"

`

	// 프로바이더 타입 추가 (Caret 고유 프로바이더 포함)
	if (providerType) {
		newApiContent += providerType

		// Caret 고유 프로바이더 추가
		if (caretParts.caretProvider) {
			newApiContent += `\n\t| "caret" // CARET MODIFICATION: Ensure 'caret' is present`
		}
		if (caretParts.clineProvider) {
			newApiContent += `\n\t| "cline" // CARET MODIFICATION: Add 'cline' provider`
		}
		newApiContent += "\n\n"
	}

	// ApiHandlerOptions 추가 (Caret 고유 필드 포함)
	if (handlerOptions) {
		newApiContent += handlerOptions

		// Caret 고유 API 키 필드들 추가 (닫는 중괄호 앞에)
		let optionsWithCaretFields = handlerOptions
		if (caretParts.caretApiKey) {
			optionsWithCaretFields = optionsWithCaretFields.replace(
				/\n\}$/,
				`\n\tcaretApiKey?: string // CARET MODIFICATION: Add caret-specific API key\n}`,
			)
		}
		if (caretParts.clineApiKey) {
			optionsWithCaretFields = optionsWithCaretFields.replace(
				/\n\}$/,
				`\n\tclineApiKey?: string // CARET MODIFICATION: Add cline-specific API key\n}`,
			)
		}

		newApiContent = newApiContent.replace(handlerOptions, optionsWithCaretFields)
		newApiContent += "\n\n"
	}

	// 모든 모델 섹션들 추가
	for (const [sectionName, sectionContent] of modelSections) {
		newApiContent += sectionContent + "\n\n"
	}

	// ApiConfiguration 타입 추가 (단일 모드)
	newApiContent += `export type ApiConfiguration = ApiHandlerOptions & {
\tapiProvider?: ApiProvider
\tapiModelId?: string
\tfavoritedModelIds?: string[]
}

`

	// 파일 저장
	fs.writeFileSync(outputPath, newApiContent, "utf8")

	const outputStats = fs.statSync(outputPath)
	const outputSizeKB = Math.round((outputStats.size / 1024) * 100) / 100

	console.log(`   ✅ 새 API 파일 생성 완료: ${outputSizeKB} KB`)
	console.log(`   📄 저장 위치: ${outputPath}`)

	console.log("\n🎯 6단계: 변환 결과 요약...")
	console.log(`   📊 모델 섹션: ${modelSections.size}개`)
	console.log(`   🔧 Plan/Act 모드 → 단일 모드 변환 완료`)
	console.log(`   💾 Caret 고유 부분 보존: ${caretParts.caretModifications.length}개 주석`)
	console.log(`   📁 출력 파일: api-new.ts (기존 파일 보존)`)

	console.log("\n✅ 자동 변환 완료!")
	console.log("🔍 다음 단계: 검증 스크립트로 차이점 확인 후 수동 병합 진행")
} catch (error) {
	console.error("❌ 변환 실행 중 오류:", error.message)
	console.error("스택 트레이스:", error.stack)
	process.exit(1)
}
