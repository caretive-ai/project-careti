#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { findI18nMissingFiles } = require("./report-i18n-missing-file.js")

async function generateDetailedReport() {
	const componentsDir = path.join(process.cwd(), "../../webview-ui/src/components")
	const result = await findI18nMissingFiles(componentsDir)

	// Generate detailed JSON report
	const detailedReport = {
		timestamp: new Date().toISOString(),
		scannedDirectory: componentsDir,
		summary: result.summary,
		categorized: result.categorized,
		detailedAnalysis: result.analysis.map((analysis) => ({
			file: path.relative(componentsDir, analysis.file),
			needsI18n: analysis.needsI18n,
			hardcodedTextCount: analysis.hardcodedTexts.length,
			brandReferences: analysis.brandReferences,
			hasI18nImport: analysis.hasI18nImport,
			sampleHardcodedTexts: analysis.hardcodedTexts.slice(0, 5), // First 5 examples
		})),
		filesList: {
			missingI18n: result.missingFiles.map((f) => path.relative(componentsDir, f)),
			readyFiles: result.analysis.filter((a) => !a.needsI18n).map((a) => path.relative(componentsDir, a.file)),
		},
	}

	// Save JSON report
	const jsonReportPath = path.join(__dirname, "i18n-detailed-report.json")
	fs.writeFileSync(jsonReportPath, JSON.stringify(detailedReport, null, 2))

	// Generate markdown report
	const markdownReport = generateMarkdownReport(detailedReport)
	const mdReportPath = path.join(__dirname, "i18n-analysis-report.md")
	fs.writeFileSync(mdReportPath, markdownReport)

	console.log(`📄 Detailed reports generated:`)
	console.log(`   • JSON: ${jsonReportPath}`)
	console.log(`   • Markdown: ${mdReportPath}`)
	console.log(`   • Text: ${path.join(__dirname, "i18n-missing-files-report.txt")}`)
}

function generateMarkdownReport(data) {
	return `# i18n Analysis Report

Generated: ${data.timestamp}
Scanned Directory: \`${data.scannedDirectory}\`

## 📊 Summary

| Metric | Count |
|--------|--------|
| Total Files Scanned | ${data.summary.totalFiles} |
| Files Needing i18n | ${data.summary.missingI18nCount} |
| i18n Ready Files | ${data.summary.i18nReadyCount} |
| Coverage | ${((data.summary.i18nReadyCount / data.summary.totalFiles) * 100).toFixed(1)}% |

## 🚨 Files Needing i18n (${data.summary.missingI18nCount} files)

${data.filesList.missingI18n.map((file) => `- [ ] \`webview-ui/src/components/${file}\``).join("\n")}

## ✅ i18n Ready Files (${data.summary.i18nReadyCount} files)

${data.filesList.readyFiles.map((file) => `- [x] \`webview-ui/src/components/${file}\``).join("\n")}

## 📋 Detailed Analysis

### Files with Brand References

${
	data.detailedAnalysis
		.filter((item) => item.brandReferences.length > 0)
		.map((item) => `- **${item.file}**: ${item.brandReferences.join(", ")} (${item.hardcodedTextCount} hardcoded texts)`)
		.join("\n") || "No brand references found"
}

### Top Files by Hardcoded Text Count

${data.detailedAnalysis
	.sort((a, b) => b.hardcodedTextCount - a.hardcodedTextCount)
	.slice(0, 10)
	.map((item, index) => `${index + 1}. **${item.file}**: ${item.hardcodedTextCount} hardcoded texts`)
	.join("\n")}

## 🎯 Recommended Action Plan

Based on this analysis:

1. **Priority 1**: Files with "Cline" brand references (${data.detailedAnalysis.filter((item) => item.brandReferences.includes("Cline")).length} files)
2. **Priority 2**: Welcome and Chat components (user-facing)
3. **Priority 3**: Settings components (frequently used)
4. **Priority 4**: Common components (reused across app)
5. **Priority 5**: Remaining components

## 📈 Progress Tracking

Use this checklist to track i18n implementation progress:

${data.filesList.missingI18n.map((file) => `- [ ] ${file}`).join("\n")}
`
}

// Run if called directly
if (require.main === module) {
	generateDetailedReport().catch(console.error)
}

module.exports = { generateDetailedReport }
