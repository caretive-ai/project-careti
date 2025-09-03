#!/usr/bin/env node

/**
 * Universal Semantic Equivalence Analyzer
 * Core patent technology: JSON transformation with semantic preservation
 *
 * Use cases:
 * 1. Workflow format comparison (Markdown vs JSON)
 * 2. System prompt transformation verification
 * 3. Documentation format migration validation
 * 4. API specification equivalence checking
 *
 * Based on Mission 1B methodology achieving 95.2% baseline
 */

const fs = require("fs")
const path = require("path")

// Configuration for different analysis types
const ANALYSIS_CONFIGS = {
	workflow: {
		weights: { instructions: 0.5, concepts: 0.25, completeness: 0.25 },
		target_score: 95.0,
		token_efficiency_target: 30.0,
	},
	system_prompt: {
		weights: { tools: 0.4, parameters: 0.15, modes: 0.15, ux: 0.15, integration: 0.15 },
		target_score: 95.2,
		token_efficiency_target: 45.0,
	},
	documentation: {
		weights: { content: 0.6, structure: 0.2, references: 0.2 },
		target_score: 90.0,
		token_efficiency_target: 25.0,
	},
	api: {
		weights: { endpoints: 0.4, parameters: 0.3, responses: 0.2, examples: 0.1 },
		target_score: 98.0,
		token_efficiency_target: 20.0,
	},
}

// Universal content extraction
function extractSemanticElements(content, isJSON = false, analysisType = "workflow") {
	const elements = {
		instructions: [],
		concepts: [],
		tools: [],
		parameters: [],
		structure: [],
	}

	let parsedContent = content
	if (isJSON && typeof content === "string") {
		try {
			parsedContent = JSON.parse(content)
		} catch (_e) {
			// Keep as string if not valid JSON
			parsedContent = content
		}
	}

	if (isJSON && typeof parsedContent === "object") {
		extractFromJSONStructure(parsedContent, elements, analysisType)
	} else {
		extractFromTextStructure(parsedContent, elements, analysisType)
	}

	return elements
}

function extractFromJSONStructure(data, elements, analysisType) {
	function traverse(obj, path = "") {
		for (const [key, value] of Object.entries(obj)) {
			const currentPath = path ? `${path}.${key}` : key

			if (typeof value === "string") {
				categorizeContent(key, value, elements, analysisType)
			} else if (Array.isArray(value)) {
				value.forEach((item, index) => {
					if (typeof item === "string") {
						categorizeContent(`${key}[${index}]`, item, elements, analysisType)
					} else if (typeof item === "object") {
						traverse(item, `${currentPath}[${index}]`)
					}
				})
			} else if (typeof value === "object" && value !== null) {
				traverse(value, currentPath)
			}
		}
	}

	traverse(data)
}

function extractFromTextStructure(content, elements, analysisType) {
	const lines = content.split("\n")

	lines.forEach((line, _index) => {
		const trimmed = line.trim()
		if (trimmed.length < 3) {
			return
		}

		// Categorize based on patterns
		if (trimmed.match(/^\d+\.\s/) || trimmed.match(/^[-*]\s/) || trimmed.includes("```")) {
			elements.instructions.push(normalizeText(trimmed))
		}

		if (trimmed.match(/##|###|\*\*.*\*\*/)) {
			elements.structure.push(normalizeText(trimmed))
		}

		// Extract domain-specific patterns
		extractDomainPatterns(trimmed, elements, analysisType)
	})
}

function categorizeContent(key, value, elements, analysisType) {
	const normalizedKey = key.toLowerCase()
	const normalizedValue = normalizeText(value)

	if (value.length < 3) {
		return
	}

	// Instructions
	if (
		normalizedKey.includes("step") ||
		normalizedKey.includes("instruction") ||
		normalizedKey.includes("command") ||
		normalizedKey.includes("action") ||
		value.includes("cp ") ||
		value.includes("npm ") ||
		value.includes("git ")
	) {
		elements.instructions.push(normalizedValue)
	}

	// Tools
	if (
		normalizedKey.includes("tool") ||
		normalizedKey.includes("function") ||
		value.match(/execute_|read_|write_|search_|list_/)
	) {
		elements.tools.push(normalizedValue)
	}

	// Parameters
	if (
		normalizedKey.includes("param") ||
		normalizedKey.includes("arg") ||
		normalizedKey.includes("option") ||
		normalizedKey.includes("config")
	) {
		elements.parameters.push(normalizedValue)
	}

	// Concepts
	extractDomainPatterns(value, elements, analysisType)
}

function extractDomainPatterns(content, elements, analysisType) {
	const patterns = {
		workflow: [
			/backup|백업/gi,
			/verification|검증|verify/gi,
			/modification|수정|modify/gi,
			/caret.modification/gi,
			/compile|컴파일/gi,
			/test|테스트/gi,
			/restore|복원/gi,
			/safety|안전/gi,
			/protocol|프로토콜/gi,
		],
		system_prompt: [
			/agent|chatbot|plan|act/gi,
			/browser|mcp|tool|function/gi,
			/prompt|instruction|guide/gi,
			/model|api|provider/gi,
		],
		documentation: [/guide|tutorial|example/gi, /reference|api|specification/gi, /usage|implementation|integration/gi],
		api: [/endpoint|route|path/gi, /request|response|parameter/gi, /authentication|authorization/gi, /error|status|code/gi],
	}

	const relevantPatterns = patterns[analysisType] || patterns.workflow

	relevantPatterns.forEach((pattern) => {
		const matches = content.match(pattern) || []
		matches.forEach((match) => elements.concepts.push(match.toLowerCase()))
	})
}

function normalizeText(text) {
	return text
		.replace(/^\d+\.\s*/, "")
		.replace(/^[-*]\s*/, "")
		.replace(/```\w*/, "")
		.replace(/#+\s*/, "")
		.replace(/\*\*(.*?)\*\*/g, "$1")
		.replace(/^\s*|\s*$/g, "")
		.toLowerCase()
}

// Calculate semantic similarity
function calculateSimilarity(arr1, arr2) {
	if (arr1.length === 0 && arr2.length === 0) {
		return 100
	}
	if (arr1.length === 0 || arr2.length === 0) {
		return 0
	}

	const set1 = new Set(arr1.map((item) => item.toLowerCase()))
	const set2 = new Set(arr2.map((item) => item.toLowerCase()))

	let matches = 0

	for (const item1 of set1) {
		for (const item2 of set2) {
			if (calculateTextSimilarity(item1, item2) > 0.7) {
				matches++
				break
			}
		}
	}

	return Math.round((matches / Math.max(set1.size, set2.size)) * 100)
}

function calculateTextSimilarity(str1, str2) {
	const words1 = new Set(str1.split(/\W+/).filter((w) => w.length > 2))
	const words2 = new Set(str2.split(/\W+/).filter((w) => w.length > 2))

	const intersection = new Set([...words1].filter((x) => words2.has(x)))
	const union = new Set([...words1, ...words2])

	return union.size > 0 ? intersection.size / union.size : 0
}

// Main analysis function
function analyzeSemanticEquivalence(file1Path, file2Path, analysisType = "workflow", format1 = "text", format2 = "json") {
	console.log(`🔍 Semantic Equivalence Analysis: ${analysisType.toUpperCase()}`)
	console.log("=".repeat(60))
	console.log(`Comparing: ${path.basename(file1Path)} vs ${path.basename(file2Path)}`)
	console.log(`Analysis Type: ${analysisType}`)
	console.log(`Formats: ${format1} → ${format2}`)
	console.log()

	const content1 = fs.readFileSync(file1Path, "utf8")
	const content2 = fs.readFileSync(file2Path, "utf8")

	const elements1 = extractSemanticElements(content1, format1 === "json", analysisType)
	const elements2 = extractSemanticElements(content2, format2 === "json", analysisType)

	// Calculate individual scores
	const scores = {}
	const config = ANALYSIS_CONFIGS[analysisType] || ANALYSIS_CONFIGS.workflow

	Object.keys(config.weights).forEach((aspect) => {
		const key = getElementKey(aspect)
		if (elements1[key] && elements2[key]) {
			scores[aspect] = calculateSimilarity(elements1[key], elements2[key])
		} else {
			scores[aspect] = 100 // Default for missing elements
		}
	})

	// Calculate overall score
	const overallScore = Object.entries(config.weights).reduce((total, [aspect, weight]) => {
		return total + scores[aspect] * weight
	}, 0)

	// Token efficiency
	const tokens1 = Math.ceil(content1.length / 4)
	const tokens2 = Math.ceil(content2.length / 4)
	const tokenEfficiency = ((tokens1 - tokens2) / tokens1) * 100

	// Display results
	displayResults({
		file1: path.basename(file1Path),
		file2: path.basename(file2Path),
		analysisType,
		overallScore,
		scores,
		config,
		tokens1,
		tokens2,
		tokenEfficiency,
		elements1,
		elements2,
	})

	return {
		overall_score: parseFloat(overallScore.toFixed(1)),
		token_efficiency: parseFloat(tokenEfficiency.toFixed(1)),
		individual_scores: scores,
		meets_target: overallScore >= config.target_score,
		efficient_enough: tokenEfficiency >= config.token_efficiency_target,
	}
}

function getElementKey(aspect) {
	const mapping = {
		instructions: "instructions",
		concepts: "concepts",
		tools: "tools",
		parameters: "parameters",
		modes: "concepts",
		ux: "instructions",
		integration: "tools",
		content: "instructions",
		structure: "structure",
		references: "concepts",
		completeness: "instructions",
		endpoints: "tools",
		responses: "structure",
	}
	return mapping[aspect] || "instructions"
}

function displayResults(data) {
	console.log("📊 TOKEN EFFICIENCY:")
	console.log(`   ${data.file1}: ${data.tokens1.toLocaleString()} tokens`)
	console.log(`   ${data.file2}: ${data.tokens2.toLocaleString()} tokens`)
	console.log(
		`   Efficiency: ${data.tokenEfficiency.toFixed(1)}% ${data.tokenEfficiency >= data.config.token_efficiency_target ? "✅" : "⚠️"}`,
	)
	console.log()

	console.log("🎯 SEMANTIC EQUIVALENCE BREAKDOWN:")
	Object.entries(data.scores).forEach(([aspect, score]) => {
		const weight = data.config.weights[aspect]
		const status = score >= 90 ? "✅" : score >= 80 ? "⚠️" : "🚨"
		console.log(
			`   ${aspect.charAt(0).toUpperCase() + aspect.slice(1)}: ${score}% (${(weight * 100).toFixed(0)}% weight) ${status}`,
		)
	})
	console.log()

	console.log("🏆 OVERALL RESULTS:")
	console.log(`   Semantic Score: ${data.overallScore.toFixed(1)}%`)
	console.log(`   Target Score: ${data.config.target_score}%`)
	console.log(`   Status: ${data.overallScore >= data.config.target_score ? "✅ PASSED" : "❌ NEEDS IMPROVEMENT"}`)
	console.log()

	const problemAreas = Object.entries(data.scores)
		.filter(([_, score]) => score < 85)
		.sort((a, b) => a[1] - b[1])

	if (problemAreas.length > 0) {
		console.log("⚠️ PROBLEM AREAS:")
		problemAreas.forEach(([aspect, score], index) => {
			console.log(`   ${index + 1}. ${aspect}: ${score}% ${score < 70 ? "🚨 CRITICAL" : "⚠️ ATTENTION NEEDED"}`)
		})
		console.log()
	}

	console.log("💡 RECOMMENDATIONS:")
	if (data.overallScore < data.config.target_score) {
		console.log("   • Review and improve low-scoring areas")
		console.log("   • Ensure semantic mapping preserves all critical elements")
	}
	if (data.tokenEfficiency < data.config.token_efficiency_target) {
		console.log("   • Consider more aggressive compression techniques")
	} else {
		console.log(`   ✅ Excellent ${data.tokenEfficiency.toFixed(1)}% token efficiency achieved`)
	}

	console.log()
	console.log("📋 PATENT TECHNOLOGY STATUS:")
	console.log(
		`   JSON Transformation Quality: ${data.overallScore >= 90 ? "🏆 EXCELLENT" : data.overallScore >= 80 ? "✅ GOOD" : "⚠️ NEEDS WORK"}`,
	)
	console.log(`   Efficiency Innovation: ${data.tokenEfficiency >= 25 ? "🚀 SIGNIFICANT" : "📈 MODERATE"}`)
}

// CLI usage
if (require.main === module) {
	const args = process.argv.slice(2)
	if (args.length < 2) {
		console.log("Universal Semantic Equivalence Analyzer")
		console.log("Core patent technology: JSON transformation with semantic preservation")
		console.log()
		console.log("Usage: node universal-semantic-analyzer.js <file1> <file2> [analysis-type] [format1] [format2]")
		console.log()
		console.log("Analysis types:")
		console.log("  workflow      - Workflow/process documentation (default)")
		console.log("  system_prompt - AI system prompt comparison")
		console.log("  documentation - General documentation")
		console.log("  api           - API specification")
		console.log()
		console.log("Formats: text, json, markdown")
		console.log()
		console.log("Examples:")
		console.log("  node universal-semantic-analyzer.js backup.md backup.json")
		console.log("  node universal-semantic-analyzer.js cline-prompt.txt caret-prompt.json system_prompt text json")
		process.exit(1)
	}

	const [file1, file2, analysisType = "workflow", format1 = "text", format2 = "json"] = args

	try {
		analyzeSemanticEquivalence(file1, file2, analysisType, format1, format2)
	} catch (error) {
		console.error("❌ Analysis failed:", error.message)
		process.exit(1)
	}
}

module.exports = { analyzeSemanticEquivalence, ANALYSIS_CONFIGS }
