#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("📋 복붙용 api.ts 형식 생성 스크립트...\n")

// OS 무관 경로 설정
function getProjectRoot() {
	let currentDir = __dirname
	while (currentDir !== path.dirname(currentDir)) {
		if (fs.existsSync(path.join(currentDir, "package.json"))) {
			return currentDir
		}
		currentDir = path.dirname(currentDir)
	}
	throw new Error("프로젝트 루트를 찾을 수 없습니다.")
}

const projectRoot = getProjectRoot()
const clineApiPath = path.join(projectRoot, "cline-latest", "src", "shared", "api.ts")
const caretApiPath = path.join(projectRoot, "src", "shared", "api.ts")
const outputPath = path.join(projectRoot, "src", "shared", "api-copyable.ts")

// 파일들 읽기
const clineContent = fs.readFileSync(clineApiPath, "utf8")
const caretContent = fs.readFileSync(caretApiPath, "utf8")

console.log(`📄 Cline API: ${Math.round((clineContent.length / 1024) * 100) / 100} KB`)
console.log(`📄 Caret API: ${Math.round((caretContent.length / 1024) * 100) / 100} KB`)

// Caret의 구조를 베이스로 하되, Cline의 모델 섹션들로 교체
function generateCopyableFormat() {
	const caretLines = caretContent.split("\n")
	const clineLines = clineContent.split("\n")

	// Cline에서 모델 섹션들 추출
	const clineModelSections = new Map()

	let currentSection = null
	let sectionLines = []
	let braceCount = 0
	let inSection = false

	for (let i = 0; i < clineLines.length; i++) {
		const line = clineLines[i]

		const sectionMatch = line.match(/^export const (\w+Models) = \{/)
		if (sectionMatch) {
			// 이전 섹션 저장
			if (currentSection && sectionLines.length > 0) {
				clineModelSections.set(currentSection, sectionLines.join("\n"))
			}

			currentSection = sectionMatch[1]
			sectionLines = [line]
			braceCount = 1
			inSection = true
			continue
		}

		if (inSection && currentSection) {
			sectionLines.push(line)

			for (const char of line) {
				if (char === "{") braceCount++
				if (char === "}") braceCount--
			}

			if (braceCount === 0) {
				clineModelSections.set(currentSection, sectionLines.join("\n"))
				currentSection = null
				sectionLines = []
				inSection = false
			}
		}
	}

	console.log(`🔍 Cline에서 추출한 모델 섹션: ${clineModelSections.size}개`)

	// Caret 베이스로 새 파일 생성
	const newLines = []
	let i = 0

	while (i < caretLines.length) {
		const line = caretLines[i]

		// 모델 섹션 발견 시 Cline 것으로 교체
		const modelSectionMatch = line.match(/^export const (\w+Models) = \{/)
		if (modelSectionMatch) {
			const sectionName = modelSectionMatch[1]
			const clineSection = clineModelSections.get(sectionName)

			if (clineSection) {
				// Cline 섹션으로 교체
				newLines.push(`// 🔄 ${sectionName} - Cline에서 업데이트됨`)
				newLines.push(clineSection)

				// Caret의 기존 섹션 건너뛰기
				let braceCount = 1
				i++ // 시작 라인 건너뛰기

				while (i < caretLines.length && braceCount > 0) {
					const currentLine = caretLines[i]
					for (const char of currentLine) {
						if (char === "{") braceCount++
						if (char === "}") braceCount--
					}
					i++
				}
				i-- // 다음 루프에서 i++되므로 하나 빼기
			} else {
				// Cline에 없는 섹션은 Caret 것 유지
				newLines.push(`// 🛡️ ${sectionName} - Caret 전용 섹션 보존`)
				newLines.push(line)
			}
		} else {
			// 일반 라인은 그대로 유지
			newLines.push(line)
		}

		i++
	}

	return newLines.join("\n")
}

// ApiProvider 타입 업데이트 (Cline 프로바이더들 추가)
function updateApiProvider(content) {
	// Cline에서 프로바이더 목록 추출
	const clineProviderMatch = clineContent.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (!clineProviderMatch) return content

	const clineProviders = new Set()
	const lines = clineProviderMatch[0].split("\n")
	for (const line of lines) {
		const match = line.match(/^\s*\|\s*"([^"]+)"\s*/)
		if (match) {
			clineProviders.add(match[1])
		}
	}

	// Caret에서 프로바이더 목록 추출
	const caretProviderMatch = content.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (!caretProviderMatch) return content

	const caretProviders = new Set()
	const caretLines = caretProviderMatch[0].split("\n")
	for (const line of caretLines) {
		const match = line.match(/^\s*\|\s*"([^"]+)"\s*/)
		if (match) {
			caretProviders.add(match[1])
		}
	}

	// 누락된 프로바이더들 찾기
	const missingProviders = [...clineProviders].filter((p) => !caretProviders.has(p))

	if (missingProviders.length > 0) {
		console.log(`➕ 추가할 프로바이더: ${missingProviders.join(", ")}`)

		// ApiProvider 타입에 누락된 프로바이더들 추가
		let updatedContent = content
		const insertPoint = content.indexOf('| "caret" // CARET MODIFICATION')

		if (insertPoint !== -1) {
			const beforeCaret = content.substring(0, insertPoint)
			const afterCaret = content.substring(insertPoint)

			const newProviders = missingProviders.map((p) => `\t| "${p}"`).join("\n") + "\n\t"
			updatedContent = beforeCaret + newProviders + afterCaret
		}

		return updatedContent
	}

	return content
}

// 메인 실행
try {
	console.log("\n🔍 1단계: Caret 베이스로 복붙용 파일 생성...")
	let newContent = generateCopyableFormat()

	console.log("🔍 2단계: ApiProvider 타입 업데이트...")
	newContent = updateApiProvider(newContent)

	console.log("🔍 3단계: 헤더 주석 추가...")
	const header = `// 🔄 Caret API - 복붙용 완성 버전
// 📅 생성 시간: ${new Date().toISOString()}
// 🎯 베이스: Caret 원본 구조 + Cline 모델 섹션들
// 📋 작업: 모든 Caret 함수/타입 보존 + Cline 모델 업데이트
//
// ✅ 이 파일을 src/shared/api.ts로 복붙하면 됩니다!
//

`

	newContent = header + newContent

	// 파일 저장
	fs.writeFileSync(outputPath, newContent, "utf8")

	const outputStats = fs.statSync(outputPath)
	const outputSizeKB = Math.round((outputStats.size / 1024) * 100) / 100

	console.log(`\n✅ 복붙용 파일 생성 완료!`)
	console.log(`📄 파일 크기: ${outputSizeKB} KB`)
	console.log(`📁 저장 위치: ${outputPath}`)

	console.log(`\n🚀 사용 방법:`)
	console.log(`1. ${outputPath} 파일 열기`)
	console.log(`2. 전체 내용 복사 (Ctrl+A, Ctrl+C)`)
	console.log(`3. src/shared/api.ts 파일 열기`)
	console.log(`4. 전체 내용 교체 (Ctrl+A, Ctrl+V)`)
	console.log(`5. 저장 후 빌드 테스트`)

	console.log(`\n📊 변경 사항:`)
	console.log(`- ✅ 모든 Caret 함수와 타입 보존`)
	console.log(`- 🔄 Cline 모델 섹션들로 업데이트`)
	console.log(`- ➕ 누락된 프로바이더들 추가`)
	console.log(`- 🛡️ CARET MODIFICATION 주석 보존`)
} catch (error) {
	console.error("❌ 생성 실행 중 오류:", error.message)
	console.error("스택 트레이스:", error.stack)
	process.exit(1)
}
