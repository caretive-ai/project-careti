#!/usr/bin/env node

/**
 * Provider i18n Keys Consolidator
 *
 * OpenRouter 성공 사례를 바탕으로 다른 프로바이더들을 자동으로 통합하는 스크립트
 * 안전하고 체계적인 통합을 위해 단계별로 진행합니다.
 */

const fs = require("fs")
const path = require("path")
const glob = require("glob")

// 설정
const LOCALE_DIR = path.join(__dirname, "../webview-ui/src/caret/locale")
const COMPONENTS_DIR = path.join(__dirname, "../webview-ui/src/components")
const LANGUAGES = ["en", "ko", "ja", "zh"]

const colors = {
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	reset: "\x1b[0m",
}

function log(color, message) {
	console.log(`${colors[color]}${message}${colors.reset}`)
}

// 백업 생성
function createBackup() {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
	const backupDir = path.join(__dirname, `../backups/provider-i18n-${timestamp}`)

	log("blue", `📦 백업 생성 중: ${backupDir}`)

	if (!fs.existsSync(path.dirname(backupDir))) {
		fs.mkdirSync(path.dirname(backupDir), { recursive: true })
	}
	fs.mkdirSync(backupDir, { recursive: true })

	// 모든 locale 파일 백업
	LANGUAGES.forEach((lang) => {
		const sourceDir = path.join(LOCALE_DIR, lang)
		const targetDir = path.join(backupDir, "locale", lang)

		if (fs.existsSync(sourceDir)) {
			fs.mkdirSync(targetDir, { recursive: true })
			const files = fs.readdirSync(sourceDir)
			files.forEach((file) => {
				fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file))
			})
		}
	})

	// 컴포넌트 파일들도 백업
	const componentsBackupDir = path.join(backupDir, "components")
	fs.mkdirSync(componentsBackupDir, { recursive: true })

	const tsFiles = glob.sync(`${COMPONENTS_DIR}/**/*.{ts,tsx}`)
	tsFiles.forEach((filePath) => {
		const relativePath = path.relative(COMPONENTS_DIR, filePath)
		const targetPath = path.join(componentsBackupDir, relativePath)
		const targetDir = path.dirname(targetPath)

		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true })
		}
		fs.copyFileSync(filePath, targetPath)
	})

	log("green", "✅ 백업 완료")
	return backupDir
}

// 특정 프로바이더의 현재 구조 분석
function analyzeProviderStructure(providerId) {
	log("blue", `🔍 ${providerId} 구조 분석`)

	const enSettingsPath = path.join(LOCALE_DIR, "en/settings.json")
	const settings = JSON.parse(fs.readFileSync(enSettingsPath, "utf8"))

	const analysis = {
		providerId,
		hasModernStructure: false,
		legacyKeys: {},
		modernKeys: {},
		relatedKeys: [],
	}

	// Modern structure 확인
	if (settings.providers && settings.providers[providerId]) {
		analysis.hasModernStructure = true
		analysis.modernKeys = settings.providers[providerId]
		log("green", `✅ ${providerId}는 이미 modern structure 사용 중`)
		return analysis
	}

	// Legacy structures 찾기
	const legacyProviderKey = `${providerId}Provider`
	const legacyModelPickerKey = `${providerId}ModelPicker`

	if (settings[legacyProviderKey]) {
		analysis.legacyKeys.provider = settings[legacyProviderKey]
		analysis.relatedKeys.push(legacyProviderKey)
		log("yellow", `📋 찾음: ${legacyProviderKey}`)
	}

	if (settings[legacyModelPickerKey]) {
		analysis.legacyKeys.modelPicker = settings[legacyModelPickerKey]
		analysis.relatedKeys.push(legacyModelPickerKey)
		log("yellow", `📋 찾음: ${legacyModelPickerKey}`)
	}

	// 기타 관련 키들 찾기 (camelCase variations)
	const variations = [
		providerId.toLowerCase(),
		providerId.charAt(0).toLowerCase() + providerId.slice(1),
		providerId.charAt(0).toUpperCase() + providerId.slice(1),
	]

	variations.forEach((variation) => {
		Object.keys(settings).forEach((key) => {
			if (
				key.toLowerCase().includes(variation.toLowerCase()) &&
				!analysis.relatedKeys.includes(key) &&
				key !== "providers"
			) {
				analysis.relatedKeys.push(key)
				log("yellow", `📋 관련 키 발견: ${key}`)
			}
		})
	})

	return analysis
}

// Modern structure로 통합
function consolidateToModernStructure(providerId, analysis) {
	if (analysis.hasModernStructure) {
		log("green", `✅ ${providerId}는 이미 통합되어 있음`)
		return
	}

	if (Object.keys(analysis.legacyKeys).length === 0) {
		log("yellow", `⚠️  ${providerId}에 대한 legacy keys를 찾을 수 없음`)
		return
	}

	log("blue", `🔧 ${providerId} 통합 시작`)

	LANGUAGES.forEach((lang) => {
		const settingsPath = path.join(LOCALE_DIR, `${lang}/settings.json`)
		if (!fs.existsSync(settingsPath)) {
			log("yellow", `⚠️  ${lang}/settings.json 없음, 건너뜀`)
			return
		}

		const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"))

		// providers 섹션이 없으면 생성
		if (!settings.providers) {
			settings.providers = {}
		}

		// 새로운 구조 생성
		const newProviderStructure = {}

		// 기본 정보 설정
		if (analysis.legacyKeys.provider) {
			// provider 키들을 복사
			Object.assign(newProviderStructure, analysis.legacyKeys.provider)
		}

		// modelPicker가 있으면 추가
		if (analysis.legacyKeys.modelPicker) {
			newProviderStructure.modelPicker = analysis.legacyKeys.modelPicker
		}

		// providers에 추가
		settings.providers[providerId] = newProviderStructure

		// legacy 키들 제거
		analysis.relatedKeys.forEach((key) => {
			if (settings[key]) {
				delete settings[key]
				log("green", `✅ ${lang}: ${key} 제거됨`)
			}
		})

		// 파일 저장
		fs.writeFileSync(settingsPath, JSON.stringify(settings, null, "\t"))
		log("green", `✅ ${lang}/settings.json 업데이트 완료`)
	})
}

// TypeScript 파일에서 키 참조 업데이트
function updateTypeScriptReferences(providerId, analysis) {
	if (analysis.hasModernStructure || Object.keys(analysis.legacyKeys).length === 0) {
		return
	}

	log("blue", `💻 ${providerId} TypeScript 참조 업데이트`)

	const tsFiles = glob.sync(`${COMPONENTS_DIR}/**/*.{ts,tsx}`)
	let updatedFiles = 0

	tsFiles.forEach((filePath) => {
		const content = fs.readFileSync(filePath, "utf8")
		let newContent = content
		let hasChanges = false

		// Legacy provider keys 업데이트
		analysis.relatedKeys.forEach((legacyKey) => {
			const regex = new RegExp(`t\\("${legacyKey}\\.([^"]+)"`, "g")
			const matches = content.match(regex)

			if (matches) {
				matches.forEach((match) => {
					const keyPart = match.match(/t\("([^"]+)"/)[1]
					const subKey = keyPart.replace(`${legacyKey}.`, "")

					let newKey
					if (legacyKey.endsWith("ModelPicker")) {
						newKey = `providers.${providerId}.modelPicker.${subKey}`
					} else {
						newKey = `providers.${providerId}.${subKey}`
					}

					newContent = newContent.replace(match, `t("${newKey}"`)
					hasChanges = true
					log("green", `   ${match} → t("${newKey}"`)
				})
			}
		})

		if (hasChanges) {
			fs.writeFileSync(filePath, newContent)
			updatedFiles++
			const relativePath = path.relative(process.cwd(), filePath)
			log("green", `✅ 업데이트됨: ${relativePath}`)
		}
	})

	log("green", `✅ ${updatedFiles}개 TypeScript 파일 업데이트 완료`)
}

// 통합 검증
function validateConsolidation(providerId) {
	log("blue", `🔍 ${providerId} 통합 검증`)

	// 1. 모든 언어에 providers.{providerId} 존재 확인
	const issues = []

	LANGUAGES.forEach((lang) => {
		const settingsPath = path.join(LOCALE_DIR, `${lang}/settings.json`)
		if (!fs.existsSync(settingsPath)) {
			issues.push(`❌ ${lang}/settings.json 없음`)
			return
		}

		const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"))
		if (!settings.providers || !settings.providers[providerId]) {
			issues.push(`❌ ${lang}: providers.${providerId} 없음`)
		}
	})

	// 2. TypeScript 파일에서 legacy key 사용 확인
	const tsFiles = glob.sync(`${COMPONENTS_DIR}/**/*.{ts,tsx}`)
	const legacyUsages = []

	tsFiles.forEach((filePath) => {
		const content = fs.readFileSync(filePath, "utf8")
		const relativePath = path.relative(process.cwd(), filePath)

		// Legacy pattern 찾기
		const legacyPatterns = [
			`${providerId}Provider`,
			`${providerId}ModelPicker`,
			`${providerId.toLowerCase()}Provider`,
			`${providerId.toLowerCase()}ModelPicker`,
		]

		legacyPatterns.forEach((pattern) => {
			const regex = new RegExp(`t\\("${pattern}\\.[^"]+`, "g")
			const matches = content.match(regex)
			if (matches) {
				matches.forEach((match) => {
					legacyUsages.push({ file: relativePath, usage: match })
				})
			}
		})
	})

	if (legacyUsages.length > 0) {
		issues.push(`❌ TypeScript에서 여전히 legacy key 사용:`)
		legacyUsages.forEach(({ file, usage }) => {
			issues.push(`   ${usage} in ${file}`)
		})
	}

	if (issues.length === 0) {
		log("green", `✅ ${providerId} 통합 검증 통과`)
		return true
	} else {
		log("red", `❌ ${providerId} 통합 검증 실패:`)
		for (const issue of issues) {
			log("red", issue)
		}
		return false
	}
}

// 특정 프로바이더 통합 실행
function consolidateProvider(providerId) {
	log("cyan", `\n🎯 ${providerId} 프로바이더 통합 시작`)

	try {
		// 1. 분석
		const analysis = analyzeProviderStructure(providerId)

		// 2. 통합
		consolidateToModernStructure(providerId, analysis)

		// 3. TypeScript 참조 업데이트
		updateTypeScriptReferences(providerId, analysis)

		// 4. 검증
		const isValid = validateConsolidation(providerId)

		if (isValid) {
			log("green", `✅ ${providerId} 통합 완료!`)
		} else {
			log("red", `❌ ${providerId} 통합 실패`)
			return false
		}

		return true
	} catch (error) {
		log("red", `❌ ${providerId} 통합 중 오류: ${error.message}`)
		return false
	}
}

// 모든 프로바이더 자동 감지 및 통합
function consolidateAllProviders() {
	log("cyan", "🚀 모든 프로바이더 자동 통합 시작\n")

	// 백업 생성
	const backupDir = createBackup()

	try {
		// Legacy providers 찾기
		const enSettingsPath = path.join(LOCALE_DIR, "en/settings.json")
		const settings = JSON.parse(fs.readFileSync(enSettingsPath, "utf8"))

		const legacyProviders = new Set()

		Object.keys(settings).forEach((key) => {
			if (key.endsWith("Provider") && key !== "providers") {
				const providerId = key.replace("Provider", "").toLowerCase()
				legacyProviders.add(providerId)
			}
			if (key.endsWith("ModelPicker")) {
				const providerId = key.replace("ModelPicker", "").toLowerCase()
				legacyProviders.add(providerId)
			}
		})

		const providerIds = Array.from(legacyProviders).sort()

		if (providerIds.length === 0) {
			log("green", "✅ 통합할 legacy provider가 없습니다!")
			return
		}

		log("white", `찾은 legacy providers: ${providerIds.join(", ")}\n`)

		let successful = 0
		let failed = 0

		// 각 프로바이더 통합
		for (const providerId of providerIds) {
			if (consolidateProvider(providerId)) {
				successful++
			} else {
				failed++
			}
		}

		// 최종 결과
		log("cyan", `\n📊 통합 완료 요약:`)
		log("green", `✅ 성공: ${successful}개`)
		if (failed > 0) {
			log("red", `❌ 실패: ${failed}개`)
		}
		log("white", `📦 백업 위치: ${backupDir}`)

		if (failed === 0) {
			log("green", "\n🎉 모든 프로바이더 통합 완료!")
		} else {
			log("yellow", "\n⚠️  일부 프로바이더 통합 실패. 백업을 확인하여 복구하세요.")
		}
	} catch (error) {
		log("red", `❌ 통합 중 오류 발생: ${error.message}`)
		log("yellow", `📦 백업을 사용해 복구하세요: ${backupDir}`)
	}
}

// CLI 처리
function main() {
	const args = process.argv.slice(2)

	if (args.length === 0) {
		log("cyan", "🔧 Provider i18n Keys Consolidator")
		log("white", "\n사용법:")
		log("white", "  node provider-i18n-consolidator.js <providerId>  # 특정 프로바이더 통합")
		log("white", "  node provider-i18n-consolidator.js --all        # 모든 프로바이더 자동 통합")
		log("white", "\n예시:")
		log("white", "  node provider-i18n-consolidator.js ollama")
		log("white", "  node provider-i18n-consolidator.js anthropic")
		log("white", "  node provider-i18n-consolidator.js --all")
		return
	}

	const command = args[0]

	if (command === "--all") {
		consolidateAllProviders()
	} else {
		// 백업 생성
		const backupDir = createBackup()
		log("white", `📦 백업 위치: ${backupDir}\n`)

		const success = consolidateProvider(command)
		if (!success) {
			log("yellow", `📦 문제가 있다면 백업을 사용해 복구하세요: ${backupDir}`)
		}
	}
}

// CLI에서 실행된 경우
if (require.main === module) {
	main()
}

module.exports = {
	analyzeProviderStructure,
	consolidateToModernStructure,
	updateTypeScriptReferences,
	validateConsolidation,
	consolidateProvider,
	consolidateAllProviders,
}
