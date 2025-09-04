#!/usr/bin/env node

/**
 * i18n Unused Key Detection and Report Generator
 *
 * Analyzes i18n locale files and component files to detect:
 * 1. Keys defined in JSON but never used in components
 * 2. Missing translations across different locales
 * 3. Usage patterns and recommendations for cleanup
 *
 * This script generates a comprehensive report for i18n key maintenance.
 */

const fs = require("fs")
const path = require("path")

// Configuration
const config = {
	localeDir: path.resolve(__dirname, "../../webview-ui/src/caret/locale"),
	componentsDir: path.resolve(__dirname, "../../webview-ui/src/components"),
	outputFile: path.resolve(__dirname, "../i18n-unused-keys-report.md"),
	supportedLocales: ["ko", "en", "ja", "zh"],
	namespaces: ["announcement", "chat", "common", "models", "persona", "settings", "validate-api-conf", "welcome"],
}

class I18nUnusedKeyAnalyzer {
	constructor() {
		this.allKeys = new Map() // namespace.key -> { locales: Set, usageCount: number }
		this.componentUsage = new Map() // component -> Set of keys used
		this.undefinedKeys = new Map() // component -> Set of undefined keys used
		this.results = {
			unusedKeys: [],
			missingTranslations: [],
			undefinedKeys: [],
			duplicateKeys: [],
			statistics: {
				totalKeys: 0,
				usedKeys: 0,
				unusedKeys: 0,
				undefinedKeys: 0,
				filesScanned: 0,
			},
		}
	}

	/**
	 * Load all i18n keys from locale files
	 */
	loadI18nKeys() {
		console.log("📖 Loading i18n keys from locale files...")

		for (const locale of config.supportedLocales) {
			const localeDir = path.join(config.localeDir, locale)

			if (!fs.existsSync(localeDir)) {
				console.warn(`⚠️ Locale directory not found: ${localeDir}`)
				continue
			}

			for (const namespace of config.namespaces) {
				const filePath = path.join(localeDir, `${namespace}.json`)

				if (!fs.existsSync(filePath)) {
					console.warn(`⚠️ Locale file not found: ${filePath}`)
					continue
				}

				try {
					const content = fs.readFileSync(filePath, "utf8")
					const data = JSON.parse(content)

					this.extractKeysFromObject(data, namespace, locale)
				} catch (error) {
					console.error(`❌ Error reading ${filePath}:`, error.message)
				}
			}
		}

		this.results.statistics.totalKeys = this.allKeys.size
		console.log(`✅ Loaded ${this.results.statistics.totalKeys} unique keys`)
	}

	/**
	 * Recursively extract keys from nested JSON objects
	 */
	extractKeysFromObject(obj, namespace, locale, prefix = "") {
		for (const [key, value] of Object.entries(obj)) {
			const fullKey = prefix ? `${prefix}.${key}` : key
			const namespacedKey = `${namespace}.${fullKey}`

			if (typeof value === "object" && value !== null) {
				// Nested object - recurse
				this.extractKeysFromObject(value, namespace, locale, fullKey)
			} else {
				// Leaf value - this is a translatable key
				if (!this.allKeys.has(namespacedKey)) {
					this.allKeys.set(namespacedKey, {
						locales: new Set(),
						usageCount: 0,
						namespaceKey: fullKey,
						namespace: namespace,
					})
				}

				this.allKeys.get(namespacedKey).locales.add(locale)
			}
		}
	}

	/**
	 * Scan component files for i18n key usage
	 */
	scanComponentUsage() {
		console.log("🔍 Scanning component files for i18n usage...")

		const componentFiles = this.findComponentFiles(config.componentsDir)
		this.results.statistics.filesScanned = componentFiles.length

		for (const filePath of componentFiles) {
			try {
				const content = fs.readFileSync(filePath, "utf8")
				const usedKeys = this.extractI18nKeysFromContent(content)

				if (usedKeys.size > 0) {
					this.componentUsage.set(filePath, usedKeys)

					// Separate defined and undefined keys
					const undefinedKeysInFile = new Set()

					for (const key of usedKeys) {
						if (this.allKeys.has(key)) {
							this.allKeys.get(key).usageCount++
						} else {
							// Key is used in code but not defined in JSON
							undefinedKeysInFile.add(key)
						}
					}

					if (undefinedKeysInFile.size > 0) {
						this.undefinedKeys.set(filePath, undefinedKeysInFile)
					}
				}
			} catch (error) {
				console.error(`❌ Error reading ${filePath}:`, error.message)
			}
		}

		console.log(`✅ Scanned ${componentFiles.length} component files`)
	}

	/**
	 * Find all component files recursively
	 */
	findComponentFiles(dir) {
		const files = []

		const scanDir = (currentDir) => {
			if (!fs.existsSync(currentDir)) return

			const entries = fs.readdirSync(currentDir)

			for (const entry of entries) {
				const fullPath = path.join(currentDir, entry)
				const stat = fs.statSync(fullPath)

				if (stat.isDirectory()) {
					scanDir(fullPath)
				} else if (entry.match(/\.(tsx?|jsx?)$/)) {
					files.push(fullPath)
				}
			}
		}

		scanDir(dir)
		return files
	}

	/**
	 * Extract i18n keys from component content using regex patterns
	 */
	extractI18nKeysFromContent(content) {
		const keys = new Set()

		// Pattern 1: t('namespace.key') or t("namespace.key")
		const tFunctionPattern = /t\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*['"`][^'"`]*['"`])?\s*\)/g
		let match

		while ((match = tFunctionPattern.exec(content)) !== null) {
			keys.add(match[1])
		}

		// Pattern 2: t('key', 'namespace') format
		const tWithNamespacePattern = /t\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\s*\)/g

		while ((match = tWithNamespacePattern.exec(content)) !== null) {
			const key = match[1]
			const namespace = match[2]
			keys.add(`${namespace}.${key}`)
		}

		return keys
	}

	/**
	 * Analyze results and generate findings
	 */
	analyzeResults() {
		console.log("📊 Analyzing results...")

		// Find unused keys
		for (const [key, info] of this.allKeys.entries()) {
			if (info.usageCount === 0) {
				this.results.unusedKeys.push({
					key,
					namespace: info.namespace,
					namespaceKey: info.namespaceKey,
					locales: Array.from(info.locales),
					localeCount: info.locales.size,
				})
			}
		}

		// Find missing translations
		for (const [key, info] of this.allKeys.entries()) {
			if (info.locales.size < config.supportedLocales.length) {
				const missingLocales = config.supportedLocales.filter((locale) => !info.locales.has(locale))

				this.results.missingTranslations.push({
					key,
					namespace: info.namespace,
					namespaceKey: info.namespaceKey,
					availableLocales: Array.from(info.locales),
					missingLocales,
					usageCount: info.usageCount,
				})
			}
		}

		// Find undefined keys
		for (const [component, keys] of this.undefinedKeys.entries()) {
			for (const key of keys) {
				this.results.undefinedKeys.push({
					key,
					component: component,
					relativePath: component.replace(config.componentsDir, "").replace(/\\/g, "/"),
				})
			}
		}

		// Calculate statistics
		this.results.statistics.unusedKeys = this.results.unusedKeys.length
		this.results.statistics.undefinedKeys = this.results.undefinedKeys.length
		this.results.statistics.usedKeys = this.results.statistics.totalKeys - this.results.statistics.unusedKeys

		console.log(`✅ Analysis complete:`)
		console.log(`   - Total keys: ${this.results.statistics.totalKeys}`)
		console.log(`   - Used keys: ${this.results.statistics.usedKeys}`)
		console.log(`   - Unused keys: ${this.results.statistics.unusedKeys}`)
	}

	/**
	 * Generate comprehensive markdown report
	 */
	generateReport() {
		console.log("📝 Generating report...")

		const report = this.createMarkdownReport()

		fs.writeFileSync(config.outputFile, report, "utf8")
		console.log(`✅ Report generated: ${config.outputFile}`)
	}

	/**
	 * Create the markdown report content
	 */
	createMarkdownReport() {
		const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19)

		return `# i18n 미사용 키 분석 보고서

**생성일시**: ${timestamp}
**분석기**: report-i18n-unused-key.js
**프로젝트**: Caret 프론트엔드 i18n 시스템

## 📊 요약 통계

- **총 키 개수**: ${this.results.statistics.totalKeys}개
- **사용중인 키**: ${this.results.statistics.usedKeys}개
- **미사용 키**: ${this.results.statistics.unusedKeys}개
- **스캔한 파일**: ${this.results.statistics.filesScanned}개
- **사용률**: ${((this.results.statistics.usedKeys / this.results.statistics.totalKeys) * 100).toFixed(1)}%

## 🗑️ 미사용 키 목록 (${this.results.unusedKeys.length}개)

locale 파일에 정의되어 있지만 컴포넌트에서 참조되지 않는 키들:

${
	this.results.unusedKeys.length === 0
		? "*미사용 키가 없습니다 - 모든 키가 활발히 사용중입니다!* ✅"
		: this.createUnusedKeysTable()
}

## 🌍 누락된 번역 (${this.results.missingTranslations.length}개)

일부 언어에서 번역이 누락된 키들:

${
	this.results.missingTranslations.length === 0
		? "*모든 키가 전체 언어로 완전히 번역되어 있습니다!* ✅"
		: this.createMissingTranslationsTable()
}

## ❓ 정의되지 않은 키 (${this.results.undefinedKeys.length}개)

코드에서 t() 함수로 사용하지만 JSON 파일에 정의되지 않은 키들:

${
	this.results.undefinedKeys.length === 0
		? "*모든 사용된 키가 JSON 파일에 정의되어 있습니다!* ✅"
		: this.createUndefinedKeysTable()
}

## 📂 컴포넌트 사용 분석

i18n 키를 사용하는 컴포넌트들:

${this.createComponentUsageAnalysis()}

## 🛠️ 정리 권장사항

${this.createCleanupRecommendations()}

## 📋 t03-3 작업 진행 현황

${this.createWorkProgressAnalysis()}

## 🔧 스크립트 사용법

이 보고서를 다시 생성하려면:
\`\`\`bash
node caret-scripts/tools/report-i18n-unused-key.js
\`\`\`

## 📋 설정 정보

- **지원 언어**: ${config.supportedLocales.join(", ")}
- **네임스페이스**: ${config.namespaces.join(", ")}
- **컴포넌트 디렉토리**: \`${config.componentsDir}\`
- **Locale 디렉토리**: \`${config.localeDir}\`

---
*Caret i18n 분석 도구로 생성됨*
`
	}

	createUnusedKeysTable() {
		let table = `| Key | Namespace | Available Locales | Count |
|-----|-----------|------------------|-------|
`

		// Sort by namespace then by key
		const sortedUnused = this.results.unusedKeys.sort((a, b) => {
			if (a.namespace !== b.namespace) {
				return a.namespace.localeCompare(b.namespace)
			}
			return a.namespaceKey.localeCompare(b.namespaceKey)
		})

		for (const item of sortedUnused) {
			const localesStr = item.locales.join(", ")
			table += `| \`${item.namespaceKey}\` | ${item.namespace} | ${localesStr} | ${item.localeCount} |\n`
		}

		return table
	}

	createMissingTranslationsTable() {
		let table = `| Key | Namespace | Missing Locales | Used | Available |
|-----|-----------|----------------|------|-----------|
`

		// Sort by usage count (descending) then by namespace
		const sortedMissing = this.results.missingTranslations.sort((a, b) => {
			if (a.usageCount !== b.usageCount) {
				return b.usageCount - a.usageCount // Descending
			}
			if (a.namespace !== b.namespace) {
				return a.namespace.localeCompare(b.namespace)
			}
			return a.namespaceKey.localeCompare(b.namespaceKey)
		})

		for (const item of sortedMissing) {
			const missingStr = item.missingLocales.join(", ")
			const availableStr = item.availableLocales.join(", ")
			const priority = item.usageCount > 0 ? "🔥" : "⚪"

			table += `| \`${item.namespaceKey}\` ${priority} | ${item.namespace} | ${missingStr} | ${item.usageCount} | ${availableStr} |\n`
		}

		return table + `\n🔥 = 고우선순위 (키가 사용중)\n⚪ = 저우선순위 (키가 현재 미사용)\n`
	}

	createUndefinedKeysTable() {
		let table = `| 키 | 컴포넌트 | 네임스페이스 추정 | 우선순위 |
|-----|-----------|------------------|----------|
`

		// Group by key for better analysis
		const keyGroups = new Map()
		for (const item of this.results.undefinedKeys) {
			if (!keyGroups.has(item.key)) {
				keyGroups.set(item.key, [])
			}
			keyGroups.get(item.key).push(item)
		}

		// Sort by key name
		const sortedKeys = Array.from(keyGroups.entries()).sort(([a], [b]) => a.localeCompare(b))

		for (const [key, components] of sortedKeys) {
			const componentNames = components.map((c) => path.basename(c.relativePath)).join(", ")
			const [estimatedNamespace, keyName] = key.includes(".") ? key.split(".") : ["common", key]
			const priority = components.length > 1 ? "🔥" : "⚪"

			table += `| \`${key}\` | ${componentNames} | ${estimatedNamespace} | ${priority} |\n`
		}

		return table + `\n🔥 = 고우선순위 (여러 컴포넌트에서 사용)\n⚪ = 저우선순위 (단일 컴포넌트 사용)\n`
	}

	createComponentUsageAnalysis() {
		if (this.componentUsage.size === 0) {
			return "*No components are currently using i18n keys.*"
		}

		let analysis = `Total components using i18n: **${this.componentUsage.size}**\n\n`

		// Sort components by number of keys used
		const sortedComponents = Array.from(this.componentUsage.entries()).sort((a, b) => {
			return b[1].size - a[1].size
		})

		analysis += `| Component | Keys Used | Sample Keys |\n`
		analysis += `|-----------|-----------|-------------|\n`

		for (const [component, keys] of sortedComponents) {
			const relativePath = path.relative(config.componentsDir, component)
			const keyList = Array.from(keys)
			const sampleKeys = keyList
				.slice(0, 3)
				.map((k) => `\`${k}\``)
				.join(", ")
			const moreCount = keyList.length > 3 ? ` (+${keyList.length - 3} more)` : ""

			analysis += `| \`${relativePath}\` | ${keys.size} | ${sampleKeys}${moreCount} |\n`
		}

		return analysis
	}

	createCleanupRecommendations() {
		const recommendations = []

		if (this.results.unusedKeys.length > 0) {
			recommendations.push(`### 🗑️ 미사용 키 제거
- **작업**: locale 파일에서 ${this.results.unusedKeys.length}개의 미사용 키 제거
- **효과**: 번들 크기 감소 및 유지보수 부담 경감
- **우선순위**: 낮음 (향후 기능을 위한 플레이스홀더가 아닌 경우)`)
		}

		if (this.results.missingTranslations.length > 0) {
			const highPriority = this.results.missingTranslations.filter((t) => t.usageCount > 0).length

			recommendations.push(`### 🌍 누락 번역 완성
- **작업**: ${this.results.missingTranslations.length}개의 누락된 번역 추가
- **고우선순위**: ${highPriority}개 (현재 사용중인 키들)
- **효과**: 비영어권 사용자 경험 향상`)
		}

		if (this.componentUsage.size === 0) {
			recommendations.push(`### 🔧 i18n 통합 구현
- **작업**: 컴포넌트들이 아직 i18n 시스템을 사용하지 않음
- **다음 단계**: t03-3 작업 계획에 따라 i18n 호출 통합
- **우선순위**: 높음 (핵심 기능)`)
		}

		recommendations.push(`### 📋 유지보수 모범 사례
- **정기 정리**: 이 스크립트를 매월 실행하여 미사용 키 식별
- **번역 워크플로우**: 모든 새 키가 전체 언어로 번역되도록 보장
- **코드 리뷰**: 하드코딩된 문자열 대신 i18n 키 사용 확인
- **테스팅**: i18n 통합이 기존 기능을 손상시키지 않는지 검증`)

		return recommendations.join("\n\n")
	}

	createWorkProgressAnalysis() {
		return `이 보고서는 **머징 작업 후 i18n 시스템 관리**를 위한 3가지 핵심 분석을 제공합니다.

## 📋 i18n 시스템 관리 체크리스트

### 2.1. [ ] 누락 번역 분석 
**목적**: 일부 언어에서만 번역이 누락된 키들을 식별하여 완전한 다국어 지원 보장
**필요 처리**: 
- 고우선순위(🔥 사용중인 키) 번역 우선 추가
- 저우선순위(⚪ 미사용 키) 번역은 2.3 작업 후 결정
- 누락된 locale 파일에 해당 키와 번역 추가
**현재 상태**: ${this.results.missingTranslations.length}개 키에서 번역 누락

### 2.2. [ ] 정의되지 않은 키 탐지
**목적**: 코드에서 t() 함수로 사용하지만 JSON 파일에 정의되지 않은 키들을 식별
**필요 처리**: 
- 각 컴포넌트 파일에서 사용하는 t() 키들을 수동 확인
- 해당 키가 locale JSON 파일에 존재하는지 검증
- 누락된 키들을 적절한 namespace JSON 파일에 추가
**현재 상태**: AccountView.tsx 등 "완료"로 표시된 파일에서도 다수 키 누락 확인됨

### 2.3. [ ] 미사용 키 탐지 (정리 작업)
**목적**: JSON 파일에 정의되어 있지만 실제 코드에서 사용되지 않는 키들을 식별하여 정리
**필요 처리**: 
- 미사용 키 ${this.results.unusedKeys.length}개에 대한 검토
- 향후 사용 예정인지, 레거시 키인지 판단
- 확실한 불필요 키들은 locale 파일에서 제거
- 번들 크기 최적화 및 유지보수성 향상
**현재 상태**: ${this.results.unusedKeys.length}개 미사용 키 탐지 (사용률 ${((this.results.statistics.usedKeys / this.results.statistics.totalKeys) * 100).toFixed(1)}%)

## 🔄 권장 작업 순서
1. **2.1 → 2.2**: 현재 사용 중인 시스템 완성 (번역 누락 + 키 정의 누락)
2. **2.3**: 시스템 완성 후 불필요한 키 정리
3. **검증**: 전체 시스템 테스트 및 빌드 확인`
	}

	/**
	 * Run the complete analysis
	 */
	async run() {
		console.log("🚀 Starting i18n unused key analysis...\n")

		try {
			this.loadI18nKeys()
			this.scanComponentUsage()
			this.analyzeResults()
			this.generateReport()

			console.log("\n✅ Analysis complete!")
			console.log(`📄 Report: ${config.outputFile}`)

			return this.results
		} catch (error) {
			console.error("❌ Analysis failed:", error)
			throw error
		}
	}
}

// Run the analyzer if called directly
if (require.main === module) {
	const analyzer = new I18nUnusedKeyAnalyzer()
	analyzer.run().catch(console.error)
}

module.exports = { I18nUnusedKeyAnalyzer, config }
