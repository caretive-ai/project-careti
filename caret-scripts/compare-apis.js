#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 API 파일 비교 스크립트 시작...\n")

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
const originalPath = path.join(projectRoot, "src", "shared", "api.ts")
const newPath = path.join(projectRoot, "src", "shared", "api-new.ts")

// 파일들 읽기
const originalContent = fs.readFileSync(originalPath, "utf8")
const newContent = fs.readFileSync(newPath, "utf8")

// 모델 추출 함수 (기존 스크립트와 동일)
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

	console.log(`📍 ${source}: ${providers.size}개 프로바이더, ${models.size}개 모델 (유니크: ${uniqueModelIds.size}개)`)
	return { models, providers, uniqueModelIds }
}

// 비교 실행
try {
	console.log("📊 파일 크기 비교:")
	console.log(`   원본: ${Math.round((originalContent.length / 1024) * 100) / 100} KB`)
	console.log(`   신규: ${Math.round((newContent.length / 1024) * 100) / 100} KB`)

	console.log("\n🔍 모델 및 프로바이더 비교:")
	const originalData = extractModels(originalContent, "원본 Caret")
	const newData = extractModels(newContent, "신규 생성")

	console.log("\n📈 변화 요약:")
	console.log(
		`   프로바이더: ${originalData.providers.size} → ${newData.providers.size} (${newData.providers.size - originalData.providers.size > 0 ? "+" : ""}${newData.providers.size - originalData.providers.size})`,
	)
	console.log(
		`   모델 정의: ${originalData.models.size} → ${newData.models.size} (${newData.models.size - originalData.models.size > 0 ? "+" : ""}${newData.models.size - originalData.models.size})`,
	)
	console.log(
		`   유니크 모델: ${originalData.uniqueModelIds.size} → ${newData.uniqueModelIds.size} (${newData.uniqueModelIds.size - originalData.uniqueModelIds.size > 0 ? "+" : ""}${newData.uniqueModelIds.size - originalData.uniqueModelIds.size})`,
	)

	// 새로 추가된 프로바이더들
	const newProviders = [...newData.providers].filter((p) => !originalData.providers.has(p))
	if (newProviders.length > 0) {
		console.log(`\n➕ 새로 추가된 프로바이더 (${newProviders.length}개):`)
		newProviders.forEach((provider) => {
			console.log(`   • ${provider}`)
		})
	}

	// 제거된 프로바이더들
	const removedProviders = [...originalData.providers].filter((p) => !newData.providers.has(p))
	if (removedProviders.length > 0) {
		console.log(`\n❌ 제거된 프로바이더 (${removedProviders.length}개):`)
		removedProviders.forEach((provider) => {
			console.log(`   • ${provider}`)
		})
	}

	// 모델 차이점 간단 분석
	const addedModels = []
	const removedModels = []

	for (const [key, model] of newData.models) {
		if (!originalData.models.has(key)) {
			addedModels.push(model)
		}
	}

	for (const [key, model] of originalData.models) {
		if (!newData.models.has(key)) {
			removedModels.push(model)
		}
	}

	if (addedModels.length > 0) {
		console.log(`\n➕ 새로 추가된 모델 (${addedModels.length}개):`)
		addedModels.slice(0, 10).forEach((model) => {
			console.log(`   • ${model.modelId} (${model._section})`)
		})
		if (addedModels.length > 10) {
			console.log(`   ... 및 ${addedModels.length - 10}개 더`)
		}
	}

	if (removedModels.length > 0) {
		console.log(`\n❌ 제거된 모델 (${removedModels.length}개):`)
		removedModels.slice(0, 10).forEach((model) => {
			console.log(`   • ${model.modelId} (${model._section})`)
		})
		if (removedModels.length > 10) {
			console.log(`   ... 및 ${removedModels.length - 10}개 더`)
		}
	}

	console.log("\n✅ 비교 완료!")

	// 성공 여부 판단
	const isSuccess = newData.providers.size >= 30 && newData.models.size >= 270 && newData.uniqueModelIds.size >= 200
	if (isSuccess) {
		console.log("🎉 변환 성공! 예상 목표치에 도달했습니다.")
	} else {
		console.log("⚠️  목표치 미달. 추가 검토가 필요합니다.")
	}
} catch (error) {
	console.error("❌ 비교 실행 중 오류:", error.message)
	process.exit(1)
}
