#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🧪 새 API 파일 검증 스크립트 시작...\n")

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
const newApiPath = path.join(projectRoot, "src", "shared", "api-new.ts")
const clineApiPath = path.join(projectRoot, "cline-latest", "src", "shared", "api.ts")

console.log(`📄 새 API: ${newApiPath}`)
console.log(`📄 Cline API: ${clineApiPath}`)

// 파일들 읽기
const newContent = fs.readFileSync(newApiPath, "utf8")
const clineContent = fs.readFileSync(clineApiPath, "utf8")

// 모델 추출 함수 (accurate-merge-analysis.js와 동일)
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

	console.log(`📍 ${source} 프로바이더: ${providers.size}개 -`, Array.from(providers).slice(0, 5).join(", ") + "...")

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

	console.log(`📍 ${source} 모델: ${models.size}개 (유니크 모델 ID: ${uniqueModelIds.size}개)`)
	return { models, providers, uniqueModelIds }
}

// 모델 비교 함수
function compareModels(newModels, clineModels) {
	const toAdd = [] // Cline에만 있는 것
	const toRemove = [] // 새 파일에만 있는 것
	const common = [] // 공통으로 있는 것

	// Cline에만 있는 모델들 (추가해야 할 것들)
	for (const [uniqueKey, clineModel] of clineModels) {
		if (!newModels.has(uniqueKey)) {
			toAdd.push({
				modelId: clineModel.modelId,
				section: clineModel._section,
				config: clineModel,
			})
		} else {
			common.push({
				modelId: clineModel.modelId,
				section: clineModel._section,
			})
		}
	}

	// 새 파일에만 있는 모델들 (잘못 추가된 것들)
	for (const [uniqueKey, newModel] of newModels) {
		if (!clineModels.has(uniqueKey)) {
			toRemove.push({
				modelId: newModel.modelId,
				section: newModel._section,
				config: newModel,
			})
		}
	}

	return { toAdd, toRemove, common }
}

// 메인 실행
try {
	const newData = extractModels(newContent, "새 API")
	const clineData = extractModels(clineContent, "Cline")

	console.log(`\n📊 **검증 결과:**`)
	console.log(
		`🆕 새 API: ${newData.providers.size}개 프로바이더, ${newData.models.size}개 모델 (유니크: ${newData.uniqueModelIds.size}개)`,
	)
	console.log(
		`🟩 Cline: ${clineData.providers.size}개 프로바이더, ${clineData.models.size}개 모델 (유니크: ${clineData.uniqueModelIds.size}개)`,
	)

	const comparison = compareModels(newData.models, clineData.models)

	console.log(`\n🔍 **모델 동기화 분석:**`)
	console.log(`✅ 공통 모델: ${comparison.common.length}개`)
	console.log(`❌ 누락된 모델: ${comparison.toAdd.length}개`)
	console.log(`⚠️  추가된 모델: ${comparison.toRemove.length}개`)

	// 누락된 모델들
	if (comparison.toAdd.length > 0) {
		console.log(`\n❌ **누락된 모델들 (${comparison.toAdd.length}개):**`)
		comparison.toAdd.slice(0, 10).forEach((item) => {
			console.log(`   • ${item.modelId} (${item.section})`)
		})
		if (comparison.toAdd.length > 10) {
			console.log(`   ... 및 ${comparison.toAdd.length - 10}개 더`)
		}
	}

	// 잘못 추가된 모델들
	if (comparison.toRemove.length > 0) {
		console.log(`\n⚠️  **예상외 추가된 모델들 (${comparison.toRemove.length}개):**`)
		comparison.toRemove.slice(0, 10).forEach((item) => {
			console.log(`   • ${item.modelId} (${item.section})`)
		})
		if (comparison.toRemove.length > 10) {
			console.log(`   ... 및 ${comparison.toRemove.length - 10}개 더`)
		}
	}

	// 프로바이더 비교
	const newProviders = [...newData.providers].filter((p) => !clineData.providers.has(p))
	const missingProviders = [...clineData.providers].filter((p) => !newData.providers.has(p))

	if (newProviders.length > 0) {
		console.log(`\n➕ **새 API에만 있는 프로바이더 (${newProviders.length}개):**`)
		newProviders.forEach((provider) => {
			console.log(`   • ${provider}`)
		})
	}

	if (missingProviders.length > 0) {
		console.log(`\n❌ **누락된 프로바이더 (${missingProviders.length}개):**`)
		missingProviders.forEach((provider) => {
			console.log(`   • ${provider}`)
		})
	}

	// 성공 여부 판단
	const isSuccess = comparison.toAdd.length === 0 && missingProviders.length === 0

	console.log(`\n🎯 **최종 평가:**`)
	if (isSuccess) {
		console.log("🎉 **완벽한 변환 성공!** 모든 모델과 프로바이더가 정확히 변환되었습니다.")
		console.log(`📊 최종 수치: ${newData.providers.size}개 프로바이더, ${newData.uniqueModelIds.size}개 유니크 모델`)
	} else {
		console.log("⚠️  **변환 미완료.** 추가 작업이 필요합니다.")
		console.log(`   - 누락된 모델: ${comparison.toAdd.length}개`)
		console.log(`   - 누락된 프로바이더: ${missingProviders.length}개`)
	}

	console.log(`\n✅ 검증 완료!`)
} catch (error) {
	console.error("❌ 검증 실행 중 오류:", error.message)
	process.exit(1)
}
