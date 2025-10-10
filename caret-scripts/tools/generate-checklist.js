#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

// Read the comprehensive report
const reportPath = path.join(__dirname, "i18n-comprehensive-report.txt")
const reportContent = fs.readFileSync(reportPath, "utf-8")

// Parse the report to extract file information
const lines = reportContent.split("\n")
let isInNoneSection = false
let isInUnnecessarySection = false
const noneFiles = []
const unnecessaryFiles = []

for (const line of lines) {
	if (line.includes("❌ NONE (")) {
		isInNoneSection = true
		isInUnnecessarySection = false
		continue
	}

	if (line.includes("➖ UNNECESSARY (")) {
		isInNoneSection = false
		isInUnnecessarySection = true
		continue
	}

	if (line.includes("📂 Files Needing i18n by Category:")) {
		isInNoneSection = false
		isInUnnecessarySection = false
		break
	}

	if (isInNoneSection && line.startsWith("   • ")) {
		const match = line.match(/• (.+) \(hardcoded:(\d+)\)/)
		if (match) {
			noneFiles.push({
				path: match[1],
				hardcodedCount: parseInt(match[2], 10),
			})
		}
	}

	if (isInUnnecessarySection && line.startsWith("   • ")) {
		const match = line.match(/• (.+) \(pure logic\/styling\)/)
		if (match) {
			unnecessaryFiles.push({
				path: match[1],
			})
		}
	}
}

// Categorize files
function categorizeFile(filePath) {
	const pathLower = filePath.toLowerCase()

	if (pathLower.includes("account\\") || pathLower.includes("account/")) {
		return "account"
	}
	if (pathLower.includes("chat\\") || pathLower.includes("chat/")) {
		return "chat"
	}
	if (pathLower.includes("cline-rules\\") || pathLower.includes("cline-rules/")) {
		return "cline-rules"
	}
	if (pathLower.includes("common\\") || pathLower.includes("common/")) {
		return "common"
	}
	if (pathLower.includes("history\\") || pathLower.includes("history/")) {
		return "history"
	}
	if (pathLower.includes("mcp\\") || pathLower.includes("mcp/")) {
		return "mcp"
	}
	if (pathLower.includes("settings\\") || pathLower.includes("settings/")) {
		return "settings"
	}
	if (pathLower.includes("welcome\\") || pathLower.includes("welcome/")) {
		return "welcome"
	}
	if (pathLower.includes("browser\\") || pathLower.includes("browser/")) {
		return "browser"
	}
	if (pathLower.includes("menu\\") || pathLower.includes("menu/")) {
		return "menu"
	}

	return "other"
}

// Group files by category
const categories = {
	account: { title: "Account 관련", files: [] },
	chat: { title: "Chat 관련", files: [] },
	"cline-rules": { title: "Cline Rules 관련", files: [] },
	common: { title: "Common 관련", files: [] },
	history: { title: "History 관련", files: [] },
	mcp: { title: "MCP 관련", files: [] },
	settings: { title: "Settings 관련", files: [] },
	welcome: { title: "Welcome 관련", files: [] },
	browser: { title: "Browser 관련", files: [] },
	menu: { title: "Menu 관련", files: [] },
	other: { title: "기타", files: [] },
}

noneFiles.forEach((file) => {
	const category = categorizeFile(file.path)
	if (categories[category]) {
		categories[category].files.push(file)
	} else {
		categories.other.files.push(file)
	}
})

// Generate checklist output
let output = ""
output += "## 2.3. i18n 적용 필요 파일 체크리스트\n"
output += `**총 154개 컴포넌트 중 146개 파일이 i18n 적용 필요**\n\n`

// Output by category
Object.entries(categories).forEach(([_key, category]) => {
	if (category.files.length > 0) {
		output += `### **${category.title} (${category.files.length}개)**\n`
		category.files.forEach((file) => {
			output += `[ ] \`webview-ui/src/components/${file.path}\` (하드코딩:${file.hardcodedCount})\n`
		})
		output += "\n"
	}
})

// Add unnecessary files
if (unnecessaryFiles.length > 0) {
	output += `### **불필요한 파일들 (${unnecessaryFiles.length}개) - i18n 적용 불필요**\n`
	unnecessaryFiles.forEach((file) => {
		output += `- \`webview-ui/src/components/${file.path}\` (순수 로직/스타일링)\n`
	})
	output += "\n"
}

output += "### **작업 진행 방법**\n"
output += "1. 각 파일을 열어서 하드코딩된 텍스트를 확인\n"
output += '2. `import { t } from "@/caret/utils/i18n"` 추가\n'
output += '3. 하드코딩 텍스트를 `t("key", "namespace")` 형식으로 변환\n'
output += "4. 필요한 JSON 키를 locale 파일에 추가\n"
output += "5. 체크박스를 체크하여 진행상황 추적\n\n"

// Write output
const outputPath = path.join(__dirname, "i18n-checklist-report.md")
fs.writeFileSync(outputPath, output, "utf-8")

console.log("✅ 체크리스트 보고서가 생성되었습니다: i18n-checklist-report.md")
console.log(`📊 총 ${noneFiles.length}개 파일이 i18n 적용 필요`)
console.log(`➖ ${unnecessaryFiles.length}개 파일은 적용 불필요`)
