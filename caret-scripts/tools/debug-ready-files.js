#!/usr/bin/env node

const { findI18nMissingFiles } = require("./report-i18n-missing-file.js")
const path = require("path")

async function debugReadyFiles() {
	const componentsDir = path.join(process.cwd(), "../../webview-ui/src/components")
	const result = await findI18nMissingFiles(componentsDir)

	console.log(`📊 Summary:`)
	console.log(`   Total files: ${result.summary.totalFiles}`)
	console.log(`   Missing i18n: ${result.summary.missingI18nCount}`)
	console.log(`   Ready: ${result.summary.i18nReadyCount}`)

	// Find all files that were scanned
	const fs = require("fs")

	const scanDirectory = (dir) => {
		const items = fs.readdirSync(dir)
		let files = []

		for (const item of items) {
			const fullPath = path.join(dir, item)
			const stat = fs.statSync(fullPath)

			if (stat.isDirectory()) {
				if (!item.startsWith("__tests__") && item !== "node_modules") {
					files = files.concat(scanDirectory(fullPath))
				}
			} else if (item.endsWith(".tsx")) {
				files.push(fullPath)
			}
		}

		return files
	}

	const allFiles = scanDirectory(componentsDir)
	console.log(`\n🔍 All TSX files found: ${allFiles.length}`)

	// Find files that are NOT in missing list
	const readyFiles = allFiles.filter((file) => !result.missingFiles.includes(file))

	console.log(`\n✅ Files NOT in missing list (${readyFiles.length}):`)
	readyFiles.forEach((file) => {
		const relativePath = path.relative(componentsDir, file)
		console.log(`   • ${relativePath}`)
	})

	// Manually check each ready file
	console.log(`\n🔍 Manual analysis of "ready" files:`)
	for (const file of readyFiles) {
		const content = fs.readFileSync(file, "utf-8")
		const hasI18nImport = content.includes("from '@/caret/utils/i18n'") || content.includes('from "@/caret/utils/i18n"')
		const hasTFunction = content.includes("t(")
		const hasHardcodedStrings = /["'`][^"'`]{5,}[^"'`]*["'`]/.test(content)

		const relativePath = path.relative(componentsDir, file)
		console.log(`   📄 ${relativePath}:`)
		console.log(`      - Has i18n import: ${hasI18nImport}`)
		console.log(`      - Uses t() function: ${hasTFunction}`)
		console.log(`      - Has potential hardcoded strings: ${hasHardcodedStrings}`)
	}
}

debugReadyFiles().catch(console.error)
