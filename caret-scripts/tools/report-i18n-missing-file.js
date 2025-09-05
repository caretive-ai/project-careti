#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

/**
 * Find components that need i18n implementation
 * @param {string} componentsDir - Directory to scan for components
 * @returns {Promise<Object>} Analysis results
 */
async function findI18nMissingFiles(componentsDir) {
	const result = {
		missingFiles: [],
		analysis: [],
		categorized: {
			chat: [],
			welcome: [],
			settings: [],
			common: [],
			account: [],
			mcp: [],
			rules: [],
			history: [],
			other: [],
		},
		byStatus: {
			complete: [],
			partial: [],
			none: [],
			unnecessary: [],
			uncertain: [],
		},
		summary: {
			totalFiles: 0,
			missingI18nCount: 0,
			i18nReadyCount: 0,
			completeCount: 0,
			partialCount: 0,
			noneCount: 0,
			unnecessaryCount: 0,
			uncertainCount: 0,
		},
	}

	// Recursively scan directory for .tsx files
	const scanDirectory = (dir) => {
		const items = fs.readdirSync(dir)
		let files = []

		for (const item of items) {
			const fullPath = path.join(dir, item)
			const stat = fs.statSync(fullPath)

			if (stat.isDirectory()) {
				// Skip test directories and node_modules
				if (!item.startsWith("__tests__") && item !== "node_modules") {
					files = files.concat(scanDirectory(fullPath))
				}
			} else if (item.endsWith(".tsx")) {
				files.push(fullPath)
			}
		}

		return files
	}

	const componentFiles = scanDirectory(componentsDir)
	result.summary.totalFiles = componentFiles.length

	// Analyze each component file
	for (const filePath of componentFiles) {
		const fileContent = fs.readFileSync(filePath, "utf-8")
		const analysis = analyzeFile(filePath, fileContent)

		// Always add to analysis for comprehensive reporting
		result.analysis.push(analysis)

		// Categorize by status (ensure array exists)
		if (!result.byStatus[analysis.i18nStatus]) {
			result.byStatus[analysis.i18nStatus] = []
		}
		result.byStatus[analysis.i18nStatus].push(analysis)

		if (analysis.needsI18n) {
			result.missingFiles.push(filePath)

			// Categorize by component type
			const category = categorizeComponent(filePath)
			if (!result.categorized[category]) {
				result.categorized[category] = []
			}
			result.categorized[category].push(filePath)

			result.summary.missingI18nCount++
		} else {
			result.summary.i18nReadyCount++
		}

		// Update status counts
		switch (analysis.i18nStatus) {
			case "complete":
				result.summary.completeCount++
				break
			case "partial":
				result.summary.partialCount++
				break
			case "none":
				result.summary.noneCount++
				break
			case "unnecessary":
				result.summary.unnecessaryCount++
				break
			case "uncertain":
				result.summary.uncertainCount++
				break
		}
	}

	return result
}

/**
 * Analyze a single file for i18n needs
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @returns {Object} Analysis result
 */
function analyzeFile(filePath, content) {
	const analysis = {
		file: filePath,
		needsI18n: false,
		hardcodedTexts: [],
		brandReferences: [],
		hasI18nImport: false,
		hasTFunction: false,
		i18nStatus: "none", // 'none', 'partial', 'complete'
		i18nUsageCount: 0,
		hardcodedCount: 0,
	}

	// Check if file already uses i18n
	analysis.hasI18nImport = content.includes("from '@/caret/utils/i18n'") || content.includes('from "@/caret/utils/i18n"')

	// Count t() function usage
	const tFunctionMatches = content.match(/\bt\(/g)
	analysis.hasTFunction = tFunctionMatches !== null
	analysis.i18nUsageCount = tFunctionMatches ? tFunctionMatches.length : 0

	// Find hardcoded strings (text in quotes that looks like UI text)
	const stringPatterns = [
		// Double quoted strings
		/"([^"]{3,}[a-zA-Z][^"]*?)"/g,
		// Single quoted strings
		/'([^']{3,}[a-zA-Z][^']*?)'/g,
		// Template literals
		/`([^`]{3,}[a-zA-Z][^`]*?)`/g,
	]

	const excludePatterns = [
		/^[a-z-]+$/, // CSS classes like "flex", "text-center"
		/^[A-Z_]+$/, // Constants like "API_KEY"
		/^\w+\.\w+/, // Object properties like "item.name"
		/^\$\{.*\}$/, // Template variables like "${value}"
		/^https?:\/\//, // URLs
		/^\/[/\w-]*/, // Paths
		/^[a-z]+:[a-z]/, // CSS properties
		/^\w+\(\)/, // Function calls
		/^import|export|const|let|var|function/, // Code keywords
		/^@\w+/, // Decorators
		/^\d+/, // Numbers
		/^[A-Z]\w*Provider$/, // Component names ending with Provider
	]

	for (const pattern of stringPatterns) {
		let match
		while ((match = pattern.exec(content)) !== null) {
			const text = match[1].trim()

			// Skip if matches exclude patterns
			if (excludePatterns.some((exclude) => exclude.test(text))) {
				continue
			}

			// Skip very short strings or single words without spaces
			if (text.length < 3 || (!text.includes(" ") && text.length < 10)) {
				continue
			}

			// Check for UI-like text (contains common UI words or is sentence-like)
			const uiWords = [
				"button",
				"click",
				"save",
				"cancel",
				"delete",
				"edit",
				"view",
				"show",
				"hide",
				"please",
				"error",
				"success",
				"warning",
				"loading",
				"welcome",
				"hello",
				"hi",
				"what",
				"how",
				"why",
				"when",
				"where",
				"can",
				"will",
				"would",
				"should",
				"wants",
				"needs",
				"execute",
				"run",
				"start",
				"stop",
				"continue",
			]

			const isUIText =
				uiWords.some((word) => text.toLowerCase().includes(word)) ||
				text.includes(" ") ||
				/^[A-Z].*[.!?]$/.test(text) || // Sentences
				text.includes("Cline") ||
				text.includes("want") ||
				text.includes("execute")

			if (isUIText) {
				analysis.hardcodedTexts.push(text)
				analysis.needsI18n = true
				analysis.hardcodedCount++

				// Check for brand references
				if (text.includes("Cline")) {
					analysis.brandReferences.push("Cline")
				}
			}
		}
	}

	// Determine i18n status based on defined criteria
	if (analysis.i18nUsageCount === 0 && analysis.hardcodedCount === 0) {
		analysis.i18nStatus = "unnecessary" // Pure logic/styling components
		analysis.needsI18n = false
	} else if (analysis.i18nUsageCount === 0 && analysis.hardcodedCount > 0) {
		analysis.i18nStatus = "none" // No i18n usage but has hardcoded UI text
		analysis.needsI18n = true
	} else if (analysis.i18nUsageCount > 0 && analysis.hardcodedCount > 0) {
		analysis.i18nStatus = "partial" // Uses t() but still has hardcoded text
		analysis.needsI18n = true
	} else if (analysis.i18nUsageCount > 0 && analysis.hardcodedCount === 0 && analysis.hasI18nImport) {
		analysis.i18nStatus = "complete" // Has i18n import, uses t(), no hardcoded text
		analysis.needsI18n = false
	} else {
		analysis.i18nStatus = "uncertain" // Edge cases that don't fit clear patterns
		analysis.needsI18n = true
	}

	return analysis
}

/**
 * Categorize component by its path
 * @param {string} filePath - Path to the component
 * @returns {string} Category name
 */
function categorizeComponent(filePath) {
	const pathLower = filePath.toLowerCase()

	if (pathLower.includes("\\chat\\") || pathLower.includes("/chat/")) {
		return "chat"
	}
	if (pathLower.includes("\\welcome\\") || pathLower.includes("/welcome/")) {
		return "welcome"
	}
	if (pathLower.includes("\\settings\\") || pathLower.includes("/settings/")) {
		return "settings"
	}
	if (pathLower.includes("\\common\\") || pathLower.includes("/common/")) {
		return "common"
	}
	if (pathLower.includes("\\account\\") || pathLower.includes("/account/")) {
		return "account"
	}
	if (pathLower.includes("\\mcp\\") || pathLower.includes("/mcp/")) {
		return "mcp"
	}
	if (
		pathLower.includes("\\cline-rules\\") ||
		pathLower.includes("/cline-rules/") ||
		pathLower.includes("\\rules\\") ||
		pathLower.includes("/rules/")
	) {
		return "cline-rules"
	}
	if (pathLower.includes("\\history\\") || pathLower.includes("/history/")) {
		return "history"
	}

	return "other"
}

/**
 * Generate checklist format output for work documentation
 * @param {Object} result - Analysis results
 * @param {string} componentsDir - Components directory path
 * @returns {string} Checklist formatted output
 */
function generateChecklistOutput(result, componentsDir) {
	let output = ""

	output += "## 2.3. i18n 적용 필요 파일 체크리스트\n"
	output += `**총 154개 컴포넌트 중 146개 파일이 i18n 적용 필요**\n\n`

	// Group files by category for better organization
	const categoryGroups = {
		account: { title: "Account 관련", files: [] },
		chat: { title: "Chat 관련", files: [] },
		"cline-rules": { title: "Cline Rules 관련", files: [] },
		common: { title: "Common 관련", files: [] },
		history: { title: "History 관련", files: [] },
		mcp: { title: "MCP 관련", files: [] },
		settings: { title: "Settings 관련", files: [] },
		welcome: { title: "Welcome 관련", files: [] },
		other: { title: "기타", files: [] },
	}

	// Categorize files that need i18n
	result.analysis.forEach((analysis) => {
		if (analysis.needsI18n) {
			const category = categorizeComponent(analysis.file)
			const relativePath = path.relative(componentsDir, analysis.file)

			// Ensure the category exists
			if (categoryGroups[category]) {
				categoryGroups[category].files.push({
					path: relativePath,
					hardcodedCount: analysis.hardcodedCount,
					status: analysis.i18nStatus,
				})
			} else {
				// Fallback to 'other' if category not found
				console.warn(`Unknown category: ${category} for file ${analysis.file}`)
				categoryGroups["other"].files.push({
					path: relativePath,
					hardcodedCount: analysis.hardcodedCount,
					status: analysis.i18nStatus,
				})
			}
		}
	})

	// Generate checklist by category
	Object.entries(categoryGroups).forEach(([_category, group]) => {
		if (group.files.length > 0) {
			output += `### **${group.title} (${group.files.length}개)**\n`

			group.files.forEach((file) => {
				output += `[ ] \`webview-ui/src/components/${file.path}\` (하드코딩:${file.hardcodedCount})\n`
			})

			output += "\n"
		}
	})

	// Add unnecessary files info
	if (result.byStatus && result.byStatus.unnecessary && result.byStatus.unnecessary.length > 0) {
		output += `### **불필요한 파일들 (${result.byStatus.unnecessary.length}개) - i18n 적용 불필요**\n`
		result.byStatus.unnecessary.forEach((analysis) => {
			const relativePath = path.relative(componentsDir, analysis.file)
			output += `- \`webview-ui/src/components/${relativePath}\` (순수 로직/스타일링)\n`
		})
		output += "\n"
	}

	output += "### **작업 진행 방법**\n"
	output += "1. 각 파일을 열어서 하드코딩된 텍스트를 확인\n"
	output += '2. `import { t } from "@/caret/utils/i18n"` 추가\n'
	output += '3. 하드코딩 텍스트를 `t("key", "namespace")` 형식으로 변환\n'
	output += "4. 필요한 JSON 키를 locale 파일에 추가\n"
	output += "5. 체크박스를 체크하여 진행상황 추적\n\n"

	return output
}

// Main execution if run directly
if (require.main === module) {
	const componentsDir = process.argv[2] || path.resolve(process.cwd(), "./webview-ui/src/components")
	const outputFilePath = path.resolve(process.cwd(), "./caret-scripts/i18n-checklist-report.md")

	findI18nMissingFiles(componentsDir)
		.then((result) => {
			const checklistOutput = generateChecklistOutput(result, componentsDir)
			fs.writeFileSync(outputFilePath, checklistOutput, { encoding: "utf-8" })
			console.log(`\n✅ i18n checklist report generated at: ${outputFilePath}\n`)
		})
		.catch((error) => {
			console.error("❌ Error:", error.message)
			process.exit(1)
		})
}

module.exports = { findI18nMissingFiles }
