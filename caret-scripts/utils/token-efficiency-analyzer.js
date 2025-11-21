#!/usr/bin/env node

/**
 * Token Efficiency Analyzer
 * Based on caret-main system-prompt-token-measurement.js
 * Measures token usage differences between formats
 */

const fs = require("fs")
const _path = require("path")

function estimateTokens(text) {
	const wordCount = text.split(/\s+/).length
	const charCount = text.length

	const estimates = {
		conservative: Math.ceil(wordCount * 0.75),
		standard: Math.ceil(wordCount * 1.0),
		aggressive: Math.ceil(wordCount * 1.33),
		charBased: Math.ceil(charCount / 4),
	}

	return {
		wordCount,
		charCount,
		...estimates,
		average: Math.ceil((estimates.conservative + estimates.standard + estimates.aggressive + estimates.charBased) / 4),
	}
}

function analyzeTokenEfficiency(files) {
	console.log("🔍 Token Efficiency Analysis Starting...\n")

	const results = []

	files.forEach(({ name, path: filePath, type }) => {
		const content = fs.readFileSync(filePath, "utf8")
		const tokens = estimateTokens(content)

		results.push({
			name,
			type,
			path: filePath,
			tokens,
			content,
		})

		console.log(`📄 ${name} (${type}):`)
		console.log(`   Characters: ${tokens.charCount.toLocaleString()}`)
		console.log(`   Words: ${tokens.wordCount.toLocaleString()}`)
		console.log(`   Token estimates:`)
		console.log(`     - Conservative: ${tokens.conservative.toLocaleString()}`)
		console.log(`     - Standard: ${tokens.standard.toLocaleString()}`)
		console.log(`     - Aggressive: ${tokens.aggressive.toLocaleString()}`)
		console.log(`     - Char-based: ${tokens.charBased.toLocaleString()}`)
		console.log(`     - Average: ${tokens.average.toLocaleString()}\n`)
	})

	// Compare efficiency between formats
	if (results.length === 2) {
		const [format1, format2] = results
		const savings = (((format1.tokens.average - format2.tokens.average) / format1.tokens.average) * 100).toFixed(1)
		const savingsAbs = format1.tokens.average - format2.tokens.average

		console.log("💰 Efficiency Comparison:")
		console.log(`   ${format1.name}: ${format1.tokens.average.toLocaleString()} tokens`)
		console.log(`   ${format2.name}: ${format2.tokens.average.toLocaleString()} tokens`)
		console.log(`   Savings: ${Math.abs(savings)}% (${Math.abs(savingsAbs).toLocaleString()} tokens)`)
		console.log(`   Winner: ${savingsAbs > 0 ? format2.name : format1.name} is more efficient\n`)
	}

	return results
}

// CLI usage
if (require.main === module) {
	const args = process.argv.slice(2)
	if (args.length < 2 || args.length % 3 !== 0) {
		console.log("Usage: node token-efficiency-analyzer.js <name1> <type1> <path1> [name2] [type2] [path2]...")
		console.log("Example: node token-efficiency-analyzer.js 'Markdown' 'md' 'file1.md' 'JSON' 'json' 'file2.json'")
		process.exit(1)
	}

	const files = []
	for (let i = 0; i < args.length; i += 3) {
		files.push({
			name: args[i],
			type: args[i + 1],
			path: args[i + 2],
		})
	}

	try {
		analyzeTokenEfficiency(files)
	} catch (error) {
		console.error("❌ Analysis failed:", error.message)
		process.exit(1)
	}
}

module.exports = { analyzeTokenEfficiency, estimateTokens }
