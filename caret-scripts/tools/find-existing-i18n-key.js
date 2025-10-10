#!/usr/bin/env node

/**
 * i18n 키 존재 여부 확인 스크립트
 * 하드코딩된 텍스트에 해당하는 기존 i18n 키가 있는지 확인
 */

const fs = require("fs")
const path = require("path")

// locale 파일 경로
const LOCALE_DIR = path.join(__dirname, "..", "..", "webview-ui", "src", "caret", "locale")
const LANGUAGES = ["ko", "en", "ja", "zh"]

/**
 * 모든 locale 파일에서 키-값 매핑을 수집
 */
function loadAllLocaleKeys() {
	const allKeys = {}

	LANGUAGES.forEach((lang) => {
		const langDir = path.join(LOCALE_DIR, lang)
		if (!fs.existsSync(langDir)) {
			return
		}

		const jsonFiles = fs.readdirSync(langDir).filter((file) => file.endsWith(".json"))

		jsonFiles.forEach((file) => {
			const filePath = path.join(langDir, file)
			try {
				const content = JSON.parse(fs.readFileSync(filePath, "utf8"))
				const namespace = path.basename(file, ".json")

				// 중첩된 객체를 평면화하여 키 수집
				collectKeys(content, namespace, lang, allKeys, "", filePath)
			} catch (error) {
				console.warn(`Warning: Could not parse ${filePath}:`, error.message)
			}
		})
	})

	return allKeys
}

/**
 * 중첩 객체에서 키를 재귀적으로 수집
 */
function collectKeys(obj, namespace, lang, allKeys, prefix = "", filePath = "") {
	Object.keys(obj).forEach((key) => {
		const fullKey = prefix ? `${prefix}.${key}` : key
		const i18nKey = `${namespace}.${fullKey}`

		if (typeof obj[key] === "object" && obj[key] !== null) {
			collectKeys(obj[key], namespace, lang, allKeys, fullKey, filePath)
		} else {
			const value = obj[key]
			if (typeof value === "string") {
				if (!allKeys[i18nKey]) {
					allKeys[i18nKey] = {}
				}
				allKeys[i18nKey][lang] = {
					value: value,
					file: filePath,
					keyPath: fullKey,
				}
			}
		}
	})
}

/**
 * 텍스트와 유사한 기존 키 찾기 (대소문자 무시, 브랜드명 무시)
 */
function findSimilarKeys(searchText, allKeys) {
	const cleanText = cleanForComparison(searchText)
	const results = []

	Object.entries(allKeys).forEach(([key, translations]) => {
		Object.entries(translations).forEach(([lang, translation]) => {
			const value = typeof translation === "object" ? translation.value : translation
			const file = typeof translation === "object" ? translation.file : ""
			const keyPath = typeof translation === "object" ? translation.keyPath : ""

			const cleanValue = cleanForComparison(value)

			// 정확한 일치
			if (cleanValue === cleanText) {
				results.push({
					key,
					lang,
					value,
					file,
					keyPath,
					match: "exact",
					similarity: 1.0,
				})
			}
			// 부분 일치 (70% 이상)
			else {
				const similarity = calculateSimilarity(cleanText, cleanValue)
				if (similarity > 0.7) {
					results.push({
						key,
						lang,
						value,
						file,
						keyPath,
						match: "similar",
						similarity,
					})
				}
			}
		})
	})

	// 유사도 순으로 정렬
	return results.sort((a, b) => b.similarity - a.similarity)
}

/**
 * 비교를 위한 텍스트 정리 (브랜드명, 특수문자 제거)
 */
function cleanForComparison(text) {
	return text
		.toLowerCase()
		.replace(/cline|caret|codecenter/gi, "BRAND") // 브랜드명을 통일
		.replace(/[^\w\s]/g, "") // 특수문자 제거
		.replace(/\s+/g, " ") // 연속 공백 제거
		.trim()
}

/**
 * 두 문자열의 유사도 계산 (Levenshtein distance 기반)
 */
function calculateSimilarity(str1, str2) {
	const len1 = str1.length
	const len2 = str2.length
	const matrix = Array(len2 + 1)
		.fill()
		.map(() => Array(len1 + 1).fill(0))

	for (let i = 0; i <= len1; i++) {
		matrix[0][i] = i
	}
	for (let j = 0; j <= len2; j++) {
		matrix[j][0] = j
	}

	for (let j = 1; j <= len2; j++) {
		for (let i = 1; i <= len1; i++) {
			if (str1[i - 1] === str2[j - 1]) {
				matrix[j][i] = matrix[j - 1][i - 1]
			} else {
				matrix[j][i] = Math.min(
					matrix[j - 1][i] + 1, // deletion
					matrix[j][i - 1] + 1, // insertion
					matrix[j - 1][i - 1] + 1, // substitution
				)
			}
		}
	}

	const maxLen = Math.max(len1, len2)
	return maxLen === 0 ? 1 : (maxLen - matrix[len2][len1]) / maxLen
}

/**
 * 특정 텍스트에 대한 기존 키 검색 실행
 */
function searchForText(searchText) {
	console.log(`🔍 Searching for: "${searchText}"`)
	console.log("=" * 60)

	const allKeys = loadAllLocaleKeys()
	const results = findSimilarKeys(searchText, allKeys)

	if (results.length === 0) {
		console.log("❌ No existing keys found")
		console.log("✅ Safe to create new i18n key")
		return false
	}

	console.log(`✅ Found ${results.length} existing key(s):`)
	console.log()

	results.forEach((result, index) => {
		const matchIcon = result.match === "exact" ? "🎯" : "📍"
		const similarity = (result.similarity * 100).toFixed(1)

		console.log(`${matchIcon} [${index + 1}] Key: ${result.key}`)
		console.log(`   Language: ${result.lang}`)
		console.log(`   Value: "${result.value}"`)
		console.log(`   File: ${result.file}`)
		console.log(`   Key Path: ${result.keyPath}`)
		console.log(`   Similarity: ${similarity}%`)
		console.log()
	})

	console.log("⚠️  Please check existing keys before creating new ones!")
	return true
}

// CLI 사용법
if (require.main === module) {
	const searchText = process.argv[2]

	if (!searchText) {
		console.log('Usage: node find-existing-i18n-key.js "text to search"')
		console.log('Example: node find-existing-i18n-key.js "Cline wants to execute"')
		process.exit(1)
	}

	searchForText(searchText)
}

module.exports = { searchForText, loadAllLocaleKeys, findSimilarKeys }
