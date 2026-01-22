const fs = require("fs")
const path = require("path")

/**
 * ⚠️ 주의: 이 스크립트 실행 전 반드시 report-i18n-unused-key.js를 먼저 실행하세요!
 *
 * 사용법:
 *   1. node careti-scripts/tools/report-i18n-unused-key.js  # 최신 분석 생성
 *   2. node careti-scripts/tools/remove-i18n-unused-keys-safe.js  # 미사용 키 삭제
 *
 * 분석 스크립트가 스캔하는 디렉토리:
 *   - webview-ui/src/components
 *   - webview-ui/src/caret/components (Caret 전용)
 *   - webview-ui/src/caret/shared
 */

const reportPath = path.resolve(__dirname, "../i18n-unused-keys-report.md")
const localeBaseDir = path.resolve(__dirname, "../../webview-ui/src/caret/locale")
// Sovereign Cloud: 미국, 한국, 일본, 중국, 프랑스, 독일, 러시아
const supportedLocales = ["en", "ko", "ja", "zh", "fr", "de", "ru"]

// 동적 키 패턴 - 삭제하면 안되는 키들
const KEEP_PATTERNS = [
	// Announcement.tsx: t(`bullets.current.${i}`) where i = 1..5
	/^bullets\.current\.[1-5]$/,
	/^bullets\.current\.[1-5]-desc$/,
	/^bullets\.previous\.[1-5]$/,
	/^bullets\.previous\.[1-5]-desc$/,
	// SlashCommandMenu.tsx: t(title, "chat")
	/^slashCommandMenu\./,
	// QwenProvider.tsx: t(`...apiLineOptions.${line}`)
	/^providers\.qwen\.apiLineOptions\./,
	// FeatureSettingsSection.tsx: conditional keys
	/^features\.subagents\.(caretWarning|clineWarning|installed|notInstalled)$/,
	// Header/previous header (확인 필요)
	/^header$/,
	/^previousHeader$/,
]

function shouldKeep(key) {
	return KEEP_PATTERNS.some((pattern) => pattern.test(key))
}

function deleteNestedKey(obj, keyPath) {
	const keys = keyPath.split(".")
	let current = obj

	for (let i = 0; i < keys.length - 1; i++) {
		if (current[keys[i]] === undefined || typeof current[keys[i]] !== "object") {
			return false
		}
		current = current[keys[i]]
	}

	const finalKey = keys[keys.length - 1]
	if (current[finalKey] === undefined) {
		return false
	}

	delete current[finalKey]

	// Clean up empty parent objects
	for (let i = keys.length - 2; i >= 0; i--) {
		const parentObject = getNestedKey(obj, keys.slice(0, i).join("."))
		const childKey = keys[i]

		if (parentObject && parentObject[childKey] && Object.keys(parentObject[childKey]).length === 0) {
			delete parentObject[childKey]
		} else {
			break
		}
	}
	return true
}

function getNestedKey(obj, keyPath) {
	if (!keyPath) {
		return obj
	}
	return keyPath.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj)
}

function parseUnusedKeysFromReport() {
	console.log(`Reading report from: ${reportPath}`)
	const reportContent = fs.readFileSync(reportPath, "utf8")
	const unusedKeys = []

	const tableRegex = /## 🗑️ 미사용 키 목록[\s\S]*?\|-+\|(?<tableContent>[\s\S]*?)(?:\n##|$)/
	const match = reportContent.match(tableRegex)

	if (!match || !match.groups.tableContent) {
		console.error("Could not find the unused keys table in the report.")
		return []
	}

	const rows = match.groups.tableContent.trim().split("\n")
	let skippedCount = 0

	for (const row of rows) {
		const columns = row.split("|").map((c) => c.trim())
		if (columns.length >= 3) {
			const key = columns[1].replace(/`/g, "")
			const namespace = columns[2]
			if (key && namespace) {
				if (shouldKeep(key)) {
					console.log(`  ⏭️  Skipping dynamic key: ${namespace}.${key}`)
					skippedCount++
				} else {
					unusedKeys.push({ key, namespace })
				}
			}
		}
	}

	console.log(`\n📊 Summary:`)
	console.log(`   - Total unused keys in report: ${unusedKeys.length + skippedCount}`)
	console.log(`   - Skipped (dynamic keys): ${skippedCount}`)
	console.log(`   - To be removed: ${unusedKeys.length}`)

	return unusedKeys
}

function groupKeysByNamespace(keys) {
	const grouped = new Map()
	for (const { key, namespace } of keys) {
		if (!grouped.has(namespace)) {
			grouped.set(namespace, [])
		}
		grouped.get(namespace).push(key)
	}
	return grouped
}

function main() {
	console.log("🚀 Starting SAFE i18n unused key removal...\n")

	const unusedKeys = parseUnusedKeysFromReport()
	if (unusedKeys.length === 0) {
		console.log("\nNo unused keys to remove. Exiting.")
		return
	}

	const keysByNamespace = groupKeysByNamespace(unusedKeys)
	let totalRemovedCount = 0

	for (const [namespace, keysToRemove] of keysByNamespace.entries()) {
		console.log(`\n📁 Processing namespace: ${namespace}`)
		for (const locale of supportedLocales) {
			const filePath = path.join(localeBaseDir, locale, `${namespace}.json`)
			if (!fs.existsSync(filePath)) {
				console.warn(`  ⚠️  File not found for locale '${locale}', skipping: ${filePath}`)
				continue
			}

			try {
				const content = fs.readFileSync(filePath, "utf8")
				const data = JSON.parse(content)
				let removedCountInFile = 0

				for (const key of keysToRemove) {
					if (deleteNestedKey(data, key)) {
						removedCountInFile++
					}
				}

				if (removedCountInFile > 0) {
					fs.writeFileSync(filePath, JSON.stringify(data, null, "\t") + "\n", "utf8")
					console.log(`  ✅ Removed ${removedCountInFile} keys from ${locale}/${namespace}.json`)
					totalRemovedCount += removedCountInFile
				} else {
					console.log(`  ➖ No keys needed removal in ${locale}/${namespace}.json`)
				}
			} catch (error) {
				console.error(`  ❌ Error processing ${filePath}:`, error.message)
			}
		}
	}

	console.log(`\n✅ SAFE unused key removal completed!`)
	console.log(`   Total keys removed: ${totalRemovedCount}`)
}

main()
