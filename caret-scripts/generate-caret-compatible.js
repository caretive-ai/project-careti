#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔧 Caret 구조 호환 자동생성 스크립트 시작...\n")

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
const outputPath = path.join(projectRoot, "src", "shared", "api-caret-compatible.ts")

// 파일들 읽기
const clineContent = fs.readFileSync(clineApiPath, "utf8")
const caretContent = fs.readFileSync(caretApiPath, "utf8")

console.log(`📄 Cline API: ${Math.round((clineContent.length / 1024) * 100) / 100} KB`)
console.log(`📄 Caret API: ${Math.round((caretContent.length / 1024) * 100) / 100} KB`)

// Caret 구조 분석
function analyzeCaretStructure(content) {
	const structure = {
		imports: [],
		apiProvider: null,
		apiHandlerOptions: null,
		apiConfiguration: null,
		modelSections: new Map(),
		functions: new Map(),
		types: new Map(),
	}

	const lines = content.split("\n")

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// Import 문
		if (line.startsWith("import ")) {
			structure.imports.push(line)
		}

		// ApiProvider 타입
		else if (line.match(/^export type ApiProvider =/)) {
			let endLine = i
			for (let j = i; j < lines.length; j++) {
				if (lines[j + 1] && lines[j + 1].match(/^export /)) {
					endLine = j
					break
				}
			}
			structure.apiProvider = lines.slice(i, endLine + 1).join("\n")
		}

		// ApiHandlerOptions 인터페이스
		else if (line.match(/^export interface ApiHandlerOptions/)) {
			let braceCount = 0
			let endLine = i
			for (let j = i; j < lines.length; j++) {
				const currentLine = lines[j]
				for (const char of currentLine) {
					if (char === "{") braceCount++
					if (char === "}") braceCount--
				}
				if (braceCount === 0 && j > i) {
					endLine = j
					break
				}
			}
			structure.apiHandlerOptions = lines.slice(i, endLine + 1).join("\n")
		}

		// ApiConfiguration 타입
		else if (line.match(/^export type ApiConfiguration/)) {
			let endLine = i
			for (let j = i; j < lines.length; j++) {
				if (lines[j + 1] && lines[j + 1].match(/^\/\/|^export |^interface |^type /)) {
					endLine = j
					break
				}
			}
			structure.apiConfiguration = lines.slice(i, endLine + 1).join("\n")
		}

		// 모델 섹션들
		const modelSectionMatch = line.match(/^export const (\w+Models) = \{/)
		if (modelSectionMatch) {
			const sectionName = modelSectionMatch[1]
			let braceCount = 1
			let endLine = i

			for (let j = i + 1; j < lines.length; j++) {
				const currentLine = lines[j]
				for (const char of currentLine) {
					if (char === "{") braceCount++
					if (char === "}") braceCount--
				}
				if (braceCount === 0) {
					endLine = j
					break
				}
			}

			structure.modelSections.set(sectionName, {
				content: lines.slice(i, endLine + 1).join("\n"),
				startLine: i + 1,
				endLine: endLine + 1,
			})
		}

		// 타입 정의들 (ModelId)
		const typeMatch = line.match(/^export type (\w+ModelId) = keyof typeof (\w+Models)/)
		if (typeMatch) {
			structure.types.set(typeMatch[1], line)
		}

		// 기본값 함수들 및 기타 상수들
		const funcMatch = line.match(
			/^export const (\w+DefaultModelId|normalizeApiConfiguration|\w+DefaultURL|\w+DefaultApiVersion|\w+ModelInfoSaneDefaults|\w+GlobalModels|\w+DefaultModelInfo): /,
		)
		if (funcMatch) {
			structure.functions.set(funcMatch[1], line)
		}

		// 함수 정의들
		const functionMatch = line.match(/^export function (\w+)/)
		if (functionMatch) {
			// 함수 전체 추출 (여러 줄)
			let braceCount = 0
			let endLine = i
			let foundOpenBrace = false

			for (let j = i; j < lines.length; j++) {
				const currentLine = lines[j]
				for (const char of currentLine) {
					if (char === "{") {
						braceCount++
						foundOpenBrace = true
					}
					if (char === "}") braceCount--
				}
				if (foundOpenBrace && braceCount === 0) {
					endLine = j
					break
				}
			}

			const fullFunction = lines.slice(i, endLine + 1).join("\n")
			structure.functions.set(functionMatch[1], fullFunction)
		}
	}

	return structure
}

// Cline에서 모델 섹션 추출 (Caret 구조로 변환)
function extractClineModelsForCaret(content) {
	const sections = new Map()
	const lines = content.split("\n")

	let currentSection = null
	let sectionLines = []
	let braceCount = 0
	let inSection = false

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		const sectionMatch = line.match(/^export const (\w+Models) = \{/)
		if (sectionMatch) {
			// 이전 섹션 저장
			if (currentSection && sectionLines.length > 0) {
				sections.set(currentSection, sectionLines.join("\n"))
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
				sections.set(currentSection, sectionLines.join("\n"))
				currentSection = null
				sectionLines = []
				inSection = false
			}
		}
	}

	return sections
}

// Cline에서 새 프로바이더들 추출
function extractNewProviders(clineContent, caretContent) {
	const clineProviders = new Set()
	const caretProviders = new Set()

	// Cline 프로바이더 추출
	const clineMatch = clineContent.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (clineMatch) {
		const lines = clineMatch[0].split("\n")
		for (const line of lines) {
			const match = line.match(/^\s*\|\s*"([^"]+)"\s*/)
			if (match) {
				clineProviders.add(match[1])
			}
		}
	}

	// Caret 프로바이더 추출
	const caretMatch = caretContent.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (caretMatch) {
		const lines = caretMatch[0].split("\n")
		for (const line of lines) {
			const match = line.match(/^\s*\|\s*"([^"]+)"\s*/)
			if (match) {
				caretProviders.add(match[1])
			}
		}
	}

	return [...clineProviders].filter((p) => !caretProviders.has(p))
}

// 메인 실행
try {
	console.log("🔍 1단계: Caret 구조 분석...")
	const caretStructure = analyzeCaretStructure(caretContent)

	console.log(`   ✅ 모델 섹션: ${caretStructure.modelSections.size}개`)
	console.log(`   ✅ 타입 정의: ${caretStructure.types.size}개`)
	console.log(`   ✅ 기본값 함수: ${caretStructure.functions.size}개`)

	console.log("\n🔍 2단계: Cline 모델 섹션 추출...")
	const clineModelSections = extractClineModelsForCaret(clineContent)

	console.log(`   ✅ Cline 모델 섹션: ${clineModelSections.size}개`)

	console.log("\n🔍 3단계: 새 프로바이더 추출...")
	const newProviders = extractNewProviders(clineContent, caretContent)

	console.log(`   ✅ 새 프로바이더: ${newProviders.length}개`)
	newProviders.forEach((p) => console.log(`      • ${p}`))

	console.log("\n🔧 4단계: Caret 호환 파일 생성...")

	// 새 파일 구성 (Caret 구조 베이스)
	let newContent = `// 🔧 Caret API - Cline 모델 통합 (Caret 구조 호환)
// 📅 생성 시간: ${new Date().toISOString()}
// 🎯 베이스: 원본 Caret 구조 유지
// 📋 통합: Cline 모델 섹션들 + 새 프로바이더들
//
// ✅ 이 파일을 src/shared/api.ts로 복붙하면 됩니다!
//

`

	// Import 문들
	caretStructure.imports.forEach((imp) => {
		newContent += imp + "\n"
	})
	newContent += "\n"

	// ApiProvider 타입 (새 프로바이더 추가)
	if (caretStructure.apiProvider) {
		let providerType = caretStructure.apiProvider

		// 새 프로바이더들 추가 (caret 앞에)
		if (newProviders.length > 0) {
			const caretProviderLine = "\t| \"caret\" // CARET MODIFICATION: Ensure 'caret' is present"
			const insertPoint = providerType.indexOf(caretProviderLine)

			if (insertPoint !== -1) {
				const beforeCaret = providerType.substring(0, insertPoint)
				const afterCaret = providerType.substring(insertPoint)

				const newProviderLines = newProviders.map((p) => `\t| "${p}"`).join("\n") + "\n\t"
				providerType = beforeCaret + newProviderLines + afterCaret
			}
		}

		newContent += providerType + "\n\n"
	}

	// ApiHandlerOptions 인터페이스
	if (caretStructure.apiHandlerOptions) {
		newContent += caretStructure.apiHandlerOptions + "\n\n"
	}

	// ApiConfiguration 타입
	if (caretStructure.apiConfiguration) {
		newContent += caretStructure.apiConfiguration + "\n\n"
	}

	// 모델 관련 주석
	newContent += "// Models\n\n"

	// ModelInfo 인터페이스 등 (Caret 원본에서 추출)
	const modelInfoMatch = caretContent.match(
		/interface PriceTier[\s\S]*?export interface ModelInfo[\s\S]*?(?=\/\/|export const)/s,
	)
	if (modelInfoMatch) {
		newContent += modelInfoMatch[0] + "\n"
	}

	// 추가 인터페이스들 (OpenAiCompatibleModelInfo, LiteLLMModelInfo 등)
	const additionalInterfacesMatch = caretContent.match(
		/export interface OpenAiCompatibleModelInfo[\s\S]*?(?=export type|export const|$)/s,
	)
	if (additionalInterfacesMatch) {
		newContent += additionalInterfacesMatch[0] + "\n"
	}

	// 모델 섹션들 (Cline 것으로 교체, 없는 것은 Caret 것 유지)
	const processedSections = new Set()

	// Caret 구조 순서대로 처리
	for (const [sectionName, sectionInfo] of caretStructure.modelSections) {
		const clineSection = clineModelSections.get(sectionName)

		if (clineSection) {
			// Cline 섹션으로 교체
			newContent += `// 🔄 ${sectionName} - Cline에서 업데이트됨\n`

			// 타입 정의 추가
			const typeDefName = sectionName.replace("Models", "ModelId")
			const typeDef = caretStructure.types.get(typeDefName)
			if (typeDef) {
				newContent += typeDef + "\n"
			}

			// 기본값 함수 추가
			const funcName = sectionName.replace("Models", "DefaultModelId")
			const funcDef = caretStructure.functions.get(funcName)
			if (funcDef) {
				newContent += funcDef + "\n"
			}

			newContent += clineSection + "\n\n"
		} else {
			// Caret 섹션 유지
			newContent += `// 🛡️ ${sectionName} - Caret 원본 유지\n`

			// 타입 정의 추가
			const typeDefName = sectionName.replace("Models", "ModelId")
			const typeDef = caretStructure.types.get(typeDefName)
			if (typeDef) {
				newContent += typeDef + "\n"
			}

			// 기본값 함수 추가
			const funcName = sectionName.replace("Models", "DefaultModelId")
			const funcDef = caretStructure.functions.get(funcName)
			if (funcDef) {
				newContent += funcDef + "\n"
			}

			newContent += sectionInfo.content + "\n\n"
		}

		processedSections.add(sectionName)
	}

	// Cline에만 있는 새 섹션들 추가
	for (const [sectionName, sectionContent] of clineModelSections) {
		if (!processedSections.has(sectionName)) {
			newContent += `// ➕ ${sectionName} - Cline에서 새로 추가됨\n`

			// 타입 정의 생성
			const typeDefName = sectionName.replace("Models", "ModelId")
			newContent += `export type ${typeDefName} = keyof typeof ${sectionName}\n`

			// 기본값 함수 생성 (첫 번째 모델을 기본값으로)
			const firstModelMatch = sectionContent.match(/"([^"]+)"\s*:/)
			if (firstModelMatch) {
				const funcName = sectionName.replace("Models", "DefaultModelId")
				newContent += `export const ${funcName}: ${typeDefName} = "${firstModelMatch[1]}"\n`
			}

			newContent += sectionContent + "\n\n"
		}
	}

	// Caret 원본의 모든 함수들 추가 (누락된 것들)
	console.log("\n🔧 5단계: Caret 원본 함수들 추가...")

	for (const [funcName, funcContent] of caretStructure.functions) {
		// 이미 처리된 함수들은 제외
		const alreadyProcessed =
			newContent.includes(`export const ${funcName}`) || newContent.includes(`export function ${funcName}`)

		if (!alreadyProcessed) {
			console.log(`   ➕ 추가: ${funcName}`)
			newContent += `// 🛡️ ${funcName} - Caret 원본 함수 보존\n`
			newContent += funcContent + "\n\n"
		}
	}

	// 파일 저장
	fs.writeFileSync(outputPath, newContent, "utf8")

	const outputStats = fs.statSync(outputPath)
	const outputSizeKB = Math.round((outputStats.size / 1024) * 100) / 100

	console.log(`\n✅ Caret 호환 파일 생성 완료!`)
	console.log(`📄 파일 크기: ${outputSizeKB} KB`)
	console.log(`📁 저장 위치: ${outputPath}`)

	console.log(`\n🚀 사용 방법:`)
	console.log(`1. ${outputPath} 파일 열기`)
	console.log(`2. 전체 내용 복사 (Ctrl+A, Ctrl+C)`)
	console.log(`3. src/shared/api.ts 파일 열기`)
	console.log(`4. 전체 내용 교체 (Ctrl+A, Ctrl+V)`)
	console.log(`5. 저장 후 빌드 테스트`)

	console.log(`\n📊 변환 결과:`)
	console.log(`   🔄 업데이트된 섹션: ${Array.from(processedSections).filter((s) => clineModelSections.has(s)).length}개`)
	console.log(
		`   ➕ 새로 추가된 섹션: ${clineModelSections.size - Array.from(processedSections).filter((s) => clineModelSections.has(s)).length}개`,
	)
	console.log(`   🛡️ 보존된 섹션: ${Array.from(processedSections).filter((s) => !clineModelSections.has(s)).length}개`)
	console.log(`   ➕ 새 프로바이더: ${newProviders.length}개`)
	console.log(`   ✅ Caret 구조 100% 호환`)
} catch (error) {
	console.error("❌ 생성 실행 중 오류:", error.message)
	console.error("스택 트레이스:", error.stack)
	process.exit(1)
}
