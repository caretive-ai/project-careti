#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 생성된 파일이 Cline에서 정확히 추출되었는지 검증...\n")

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
const generatedApiPath = path.join(projectRoot, "src", "shared", "api-new.ts")

// 파일들 읽기
const clineContent = fs.readFileSync(clineApiPath, "utf8")
const generatedContent = fs.readFileSync(generatedApiPath, "utf8")

console.log(`📄 Cline 원본: ${Math.round((clineContent.length / 1024) * 100) / 100} KB`)
console.log(`📄 생성된 파일: ${Math.round((generatedContent.length / 1024) * 100) / 100} KB`)

// 모델 추출 함수
function extractModels(content, source) {
	const models = new Map()
	const providers = new Set()

	// 프로바이더 타입 추출
	const providerMatch = content.match(/export type ApiProvider =[\s\S]*?(?=export|interface|type|const|$)/)
	if (providerMatch) {
		const lines = providerMatch[0].split("\n")
		for (const line of lines) {
			const match = line.match(/^\s*\|\s*"([^"]+)"\s*/)
			if (match) {
				providers.add(match[1])
			}
		}
	}

	console.log(`📍 ${source} 프로바이더: ${providers.size}개`)

	// 모델 정의들 추출
	const lines = content.split("\n")
	let currentSection = ""

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]

		// 모델 섹션 확인
		const sectionMatch = line.match(/export const (\w+Models) = \{/)
		if (sectionMatch) {
			currentSection = sectionMatch[1]
			continue
		}

		// 모델 정의 라인 확인
		const modelMatch = line.match(/^\s*"([^"]+)"\s*:/)
		if (modelMatch && currentSection) {
			const modelId = modelMatch[1]
			const uniqueKey = `${currentSection}::${modelId}`

			models.set(uniqueKey, {
				modelId,
				_section: currentSection,
				_raw: line.trim(),
			})
		}
	}

	// 유니크 모델 ID 계산
	const uniqueModelIds = new Set()
	for (const [uniqueKey, modelData] of models) {
		uniqueModelIds.add(modelData.modelId)
	}

	console.log(`📍 ${source} 모델: ${models.size}개 (유니크: ${uniqueModelIds.size}개)`)
	return { models, providers, uniqueModelIds }
}

// 모델 섹션별 상세 비교
function compareModelSections(clineContent, generatedContent) {
	const clineLines = clineContent.split("\n")
	const generatedLines = generatedContent.split("\n")

	// Cline에서 모델 섹션들 추출
	const clineModelSections = new Map()
	let currentSection = null
	let sectionLines = []
	let braceCount = 0
	let inSection = false

	for (let i = 0; i < clineLines.length; i++) {
		const line = clineLines[i]

		const sectionMatch = line.match(/export const (\w+Models) = \{/)
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

	// 생성된 파일에서 모델 섹션들 추출
	const generatedModelSections = new Map()
	currentSection = null
	sectionLines = []
	braceCount = 0
	inSection = false

	for (let i = 0; i < generatedLines.length; i++) {
		const line = generatedLines[i]

		const sectionMatch = line.match(/export const (\w+Models) = \{/)
		if (sectionMatch) {
			if (currentSection && sectionLines.length > 0) {
				generatedModelSections.set(currentSection, sectionLines.join("\n"))
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
				generatedModelSections.set(currentSection, sectionLines.join("\n"))
				currentSection = null
				sectionLines = []
				inSection = false
			}
		}
	}

	return { clineModelSections, generatedModelSections }
}

// 메인 실행
try {
	console.log("\n🔍 1단계: 전체 모델 및 프로바이더 비교...")
	const clineData = extractModels(clineContent, "Cline 원본")
	const generatedData = extractModels(generatedContent, "생성된 파일")

	console.log("\n📊 **비교 결과:**")
	console.log(`   프로바이더: Cline ${clineData.providers.size}개 vs 생성 ${generatedData.providers.size}개`)
	console.log(`   모델 정의: Cline ${clineData.models.size}개 vs 생성 ${generatedData.models.size}개`)
	console.log(`   유니크 모델: Cline ${clineData.uniqueModelIds.size}개 vs 생성 ${generatedData.uniqueModelIds.size}개`)

	// 프로바이더 차이점
	const missingProviders = [...clineData.providers].filter((p) => !generatedData.providers.has(p))
	const extraProviders = [...generatedData.providers].filter((p) => !clineData.providers.has(p))

	if (missingProviders.length > 0) {
		console.log(`\n❌ **누락된 프로바이더 (${missingProviders.length}개):**`)
		missingProviders.forEach((p) => console.log(`   • ${p}`))
	}

	if (extraProviders.length > 0) {
		console.log(`\n➕ **추가된 프로바이더 (${extraProviders.length}개):**`)
		extraProviders.forEach((p) => console.log(`   • ${p}`))
	}

	// 모델 차이점
	const missingModels = []
	const extraModels = []

	for (const [key, model] of clineData.models) {
		if (!generatedData.models.has(key)) {
			missingModels.push(model)
		}
	}

	for (const [key, model] of generatedData.models) {
		if (!clineData.models.has(key)) {
			extraModels.push(model)
		}
	}

	if (missingModels.length > 0) {
		console.log(`\n❌ **누락된 모델 (${missingModels.length}개):**`)
		missingModels.slice(0, 10).forEach((m) => console.log(`   • ${m.modelId} (${m._section})`))
		if (missingModels.length > 10) {
			console.log(`   ... 및 ${missingModels.length - 10}개 더`)
		}
	}

	if (extraModels.length > 0) {
		console.log(`\n➕ **추가된 모델 (${extraModels.length}개):**`)
		extraModels.slice(0, 10).forEach((m) => console.log(`   • ${m.modelId} (${m._section})`))
		if (extraModels.length > 10) {
			console.log(`   ... 및 ${extraModels.length - 10}개 더`)
		}
	}

	console.log("\n🔍 2단계: 모델 섹션별 상세 비교...")
	const { clineModelSections, generatedModelSections } = compareModelSections(clineContent, generatedContent)

	console.log(`   Cline 모델 섹션: ${clineModelSections.size}개`)
	console.log(`   생성된 모델 섹션: ${generatedModelSections.size}개`)

	// 섹션별 일치 여부 확인
	let perfectSections = 0
	let differentSections = 0

	for (const [sectionName, clineSection] of clineModelSections) {
		const generatedSection = generatedModelSections.get(sectionName)

		if (!generatedSection) {
			console.log(`   ❌ 누락된 섹션: ${sectionName}`)
			differentSections++
		} else if (clineSection === generatedSection) {
			perfectSections++
		} else {
			console.log(`   ⚠️  다른 내용: ${sectionName}`)
			differentSections++
		}
	}

	console.log(`\n📊 **섹션별 비교 결과:**`)
	console.log(`   ✅ 완전 일치: ${perfectSections}개`)
	console.log(`   ⚠️  차이 있음: ${differentSections}개`)

	// 최종 평가
	const isExtractionPerfect =
		missingProviders.length === 0 && missingModels.length === 0 && differentSections === 0 && extraProviders.length <= 1 // caret 프로바이더 허용

	console.log(`\n🎯 **최종 평가:**`)
	if (isExtractionPerfect) {
		console.log("✅ **완벽한 추출 성공!** Cline의 모든 내용이 정확히 추출되었습니다.")
	} else {
		console.log("❌ **추출 불완전.** 일부 내용이 누락되거나 다릅니다.")
		console.log(`   - 누락 프로바이더: ${missingProviders.length}개`)
		console.log(`   - 누락 모델: ${missingModels.length}개`)
		console.log(`   - 다른 섹션: ${differentSections}개`)
	}

	console.log("\n✅ 검증 완료!")
} catch (error) {
	console.error("❌ 검증 실행 중 오류:", error.message)
	process.exit(1)
}
