#!/usr/bin/env node

/**
 * Provider i18n Keys Validator
 *
 * OpenRouter 작업에서 얻은 교훈을 바탕으로 만든 검증 스크립트
 * 모든 프로바이더의 i18n 키 구조를 체계적으로 검증합니다.
 */

const fs = require("fs")
const path = require("path")
const glob = require("glob")

// 설정
const LOCALE_DIR = path.join(__dirname, "../webview-ui/src/caret/locale")
const COMPONENTS_DIR = path.join(__dirname, "../webview-ui/src/components")
const LANGUAGES = ["en", "ko", "ja", "zh"]

// 색상 출력
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

// 1. 현재 프로바이더 구조 분석
function analyzeCurrentProviderStructure() {
	log("blue", "\n🔍 현재 프로바이더 구조 분석")

	const enSettingsPath = path.join(LOCALE_DIR, "en/settings.json")
	const settings = JSON.parse(fs.readFileSync(enSettingsPath, "utf8"))

	const analysis = {
		modernProviders: [], // providers.* 구조
		legacyProviders: [], // *Provider 구조
		legacyModelPickers: [], // *ModelPicker 구조
		inconsistencies: [],
	}

	// Modern providers 찾기
	if (settings.providers) {
		analysis.modernProviders = Object.keys(settings.providers)
		log("green", `✅ Modern providers (${analysis.modernProviders.length}): ${analysis.modernProviders.join(", ")}`)
	}

	// Legacy providers 찾기
	Object.keys(settings).forEach((key) => {
		if (key.endsWith("Provider") && key !== "providers") {
			analysis.legacyProviders.push(key)
		}
		if (key.endsWith("ModelPicker")) {
			analysis.legacyModelPickers.push(key)
		}
	})

	if (analysis.legacyProviders.length > 0) {
		log("yellow", `⚠️  Legacy providers (${analysis.legacyProviders.length}): ${analysis.legacyProviders.join(", ")}`)
	}

	if (analysis.legacyModelPickers.length > 0) {
		log(
			"yellow",
			`⚠️  Legacy model pickers (${analysis.legacyModelPickers.length}): ${analysis.legacyModelPickers.join(", ")}`,
		)
	}

	return analysis
}

// 2. 언어별 일관성 검증
function validateLanguageConsistency() {
	log("blue", "\n🌐 언어별 일관성 검증")

	const inconsistencies = []
	const baseSettings = JSON.parse(fs.readFileSync(path.join(LOCALE_DIR, "en/settings.json"), "utf8"))

	LANGUAGES.slice(1).forEach((lang) => {
		const settingsPath = path.join(LOCALE_DIR, `${lang}/settings.json`)
		if (!fs.existsSync(settingsPath)) {
			inconsistencies.push(`❌ ${lang}/settings.json 파일이 없음`)
			return
		}

		const langSettings = JSON.parse(fs.readFileSync(settingsPath, "utf8"))

		// providers 구조 비교
		if (!langSettings.providers) {
			inconsistencies.push(`❌ ${lang}: providers 섹션이 없음`)
		} else {
			const baseProviders = Object.keys(baseSettings.providers || {})
			const langProviders = Object.keys(langSettings.providers)

			const missing = baseProviders.filter((p) => !langProviders.includes(p))
			const extra = langProviders.filter((p) => !baseProviders.includes(p))

			if (missing.length > 0) {
				inconsistencies.push(`❌ ${lang}: 누락된 providers: ${missing.join(", ")}`)
			}
			if (extra.length > 0) {
				inconsistencies.push(`❌ ${lang}: 추가된 providers: ${extra.join(", ")}`)
			}
		}
	})

	if (inconsistencies.length === 0) {
		log("green", "✅ 모든 언어의 providers 구조가 일관됨")
	} else {
		inconsistencies.forEach((issue) => log("red", issue))
	}

	return inconsistencies
}

// 3. TypeScript 코드에서 키 사용 현황 분석
function analyzeTypeScriptUsage() {
	log("blue", "\n💻 TypeScript 코드 키 사용 현황")

	const tsFiles = glob.sync(`${COMPONENTS_DIR}/**/*.{ts,tsx}`)
	const keyUsage = {
		modernKeys: [], // providers.* 사용
		legacyKeys: [], // *Provider, *ModelPicker 사용
		files: new Set(),
	}

	tsFiles.forEach((filePath) => {
		const content = fs.readFileSync(filePath, "utf8")
		const relativePath = path.relative(process.cwd(), filePath)

		// Modern keys 찾기 (providers.*)
		const modernMatches = content.match(/t\("providers\.[^"]+"/g)
		if (modernMatches) {
			modernMatches.forEach((match) => {
				keyUsage.modernKeys.push({ key: match, file: relativePath })
			})
			keyUsage.files.add(relativePath)
		}

		// Legacy keys 찾기 (*Provider, *ModelPicker)
		const legacyMatches = content.match(/t\("[^"]*(?:Provider|ModelPicker)\.[^"]+"/g)
		if (legacyMatches) {
			legacyMatches.forEach((match) => {
				keyUsage.legacyKeys.push({ key: match, file: relativePath })
			})
			keyUsage.files.add(relativePath)
		}
	})

	log("green", `✅ Modern key 사용: ${keyUsage.modernKeys.length}개`)
	if (keyUsage.legacyKeys.length > 0) {
		log("yellow", `⚠️  Legacy key 사용: ${keyUsage.legacyKeys.length}개`)
		keyUsage.legacyKeys.slice(0, 10).forEach((usage) => {
			log("yellow", `   ${usage.key} in ${usage.file}`)
		})
		if (keyUsage.legacyKeys.length > 10) {
			log("yellow", `   ... 그리고 ${keyUsage.legacyKeys.length - 10}개 더`)
		}
	} else {
		log("green", "✅ Legacy key 사용 없음")
	}

	return keyUsage
}

// 4. 누락된 키 검증
function validateMissingKeys(keyUsage) {
	log("blue", "\n🔍 누락된 키 검증")

	const enSettings = JSON.parse(fs.readFileSync(path.join(LOCALE_DIR, "en/settings.json"), "utf8"))
	const missingKeys = []

	// TypeScript에서 사용하는 키가 실제로 존재하는지 확인
	keyUsage.modernKeys.forEach(({ key, file }) => {
		const cleanKey = key.replace('t("', "").replace('"', "")
		const keyPath = cleanKey.split(".")

		let current = enSettings
		let found = true

		for (const segment of keyPath) {
			if (current && typeof current === "object" && segment in current) {
				current = current[segment]
			} else {
				found = false
				break
			}
		}

		if (!found) {
			missingKeys.push({ key: cleanKey, file })
		}
	})

	if (missingKeys.length === 0) {
		log("green", "✅ 모든 사용된 키가 존재함")
	} else {
		log("red", `❌ 누락된 키 ${missingKeys.length}개:`)
		missingKeys.forEach(({ key, file }) => {
			log("red", `   ${key} in ${file}`)
		})
	}

	return missingKeys
}

// 5. 통합 권장 사항 생성
function generateConsolidationRecommendations(analysis) {
	log("blue", "\n🎯 통합 권장 사항")

	const recommendations = []

	// Legacy providers 통합 권장
	if (analysis.legacyProviders.length > 0) {
		recommendations.push({
			type: "provider",
			priority: "high",
			items: analysis.legacyProviders,
			action: "providers.* 구조로 통합 필요",
		})
	}

	// Legacy model pickers 통합 권장
	if (analysis.legacyModelPickers.length > 0) {
		recommendations.push({
			type: "modelPicker",
			priority: "high",
			items: analysis.legacyModelPickers,
			action: "providers.*.modelPicker 구조로 통합 필요",
		})
	}

	// 우선순위별 정렬
	const highPriority = recommendations.filter((r) => r.priority === "high")

	if (highPriority.length === 0) {
		log("green", "✅ 모든 프로바이더가 현대적 구조를 사용함")
	} else {
		log("yellow", "⚠️  통합이 필요한 항목들:")
		highPriority.forEach((rec) => {
			log("yellow", `   ${rec.type}: ${rec.items.join(", ")}`)
			log("white", `      → ${rec.action}`)
		})
	}

	return recommendations
}

// 6. 상세 보고서 생성
function generateDetailedReport(analysis, inconsistencies, keyUsage, missingKeys, recommendations) {
	const report = {
		timestamp: new Date().toISOString(),
		summary: {
			modernProviders: analysis.modernProviders.length,
			legacyProviders: analysis.legacyProviders.length,
			legacyModelPickers: analysis.legacyModelPickers.length,
			languageInconsistencies: inconsistencies.length,
			modernKeyUsage: keyUsage.modernKeys.length,
			legacyKeyUsage: keyUsage.legacyKeys.length,
			missingKeys: missingKeys.length,
			recommendations: recommendations.length,
		},
		details: {
			analysis,
			inconsistencies,
			keyUsage,
			missingKeys,
			recommendations,
		},
	}

	const reportPath = path.join(__dirname, "../caret-docs/work-logs/luke/provider-i18n-validation-report.json")
	fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

	log("cyan", `\n📊 상세 보고서 생성됨: ${reportPath}`)

	return report
}

// 메인 실행
function main() {
	log("cyan", "🚀 Provider i18n Keys Validator 시작\n")
	log("white", "OpenRouter 작업 경험을 바탕으로 전체 프로바이더 구조를 검증합니다.\n")

	try {
		const analysis = analyzeCurrentProviderStructure()
		const inconsistencies = validateLanguageConsistency()
		const keyUsage = analyzeTypeScriptUsage()
		const missingKeys = validateMissingKeys(keyUsage)
		const recommendations = generateConsolidationRecommendations(analysis)

		const report = generateDetailedReport(analysis, inconsistencies, keyUsage, missingKeys, recommendations)

		// 최종 요약
		log("cyan", "\n📋 검증 완료 요약:")
		log("white", `   Modern providers: ${report.summary.modernProviders}개`)
		log("white", `   Legacy providers: ${report.summary.legacyProviders}개`)
		log("white", `   Legacy model pickers: ${report.summary.legacyModelPickers}개`)
		log("white", `   언어 불일치: ${report.summary.languageInconsistencies}개`)
		log("white", `   누락된 키: ${report.summary.missingKeys}개`)
		log("white", `   통합 권장사항: ${report.summary.recommendations}개`)

		if (report.summary.legacyProviders + report.summary.legacyModelPickers + report.summary.missingKeys > 0) {
			log("yellow", "\n⚠️  개선이 필요한 항목들이 발견되었습니다.")
			log("white", "   자세한 내용은 생성된 보고서를 확인해주세요.")
		} else {
			log("green", "\n✅ 모든 검증을 통과했습니다!")
		}
	} catch (error) {
		log("red", `❌ 검증 중 오류 발생: ${error.message}`)
		process.exit(1)
	}
}

// CLI에서 직접 실행된 경우
if (require.main === module) {
	main()
}

module.exports = {
	analyzeCurrentProviderStructure,
	validateLanguageConsistency,
	analyzeTypeScriptUsage,
	validateMissingKeys,
	generateConsolidationRecommendations,
	generateDetailedReport,
}
