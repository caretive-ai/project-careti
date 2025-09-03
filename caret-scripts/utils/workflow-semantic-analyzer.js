#!/usr/bin/env node

/**
 * Workflow Semantic Equivalence Analyzer
 * Specifically for comparing .caretrules Markdown vs JSON workflows
 * NOT for system prompt comparison
 */

const fs = require("fs")
const path = require("path")

// Extract core workflow instructions
function extractWorkflowInstructions(content, isJSON = false) {
	const instructions = new Set()

	if (isJSON) {
		const data = typeof content === "string" ? JSON.parse(content) : content

		// Extract from JSON structure
		function extractFromObject(obj) {
			for (const [_key, value] of Object.entries(obj)) {
				if (typeof value === "string" && value.length > 10) {
					// Extract meaningful instructions
					if (
						value.includes("cp ") ||
						value.includes("git ") ||
						value.includes("npm ") ||
						value.includes("CARET MODIFICATION") ||
						value.toLowerCase().includes("backup")
					) {
						instructions.add(normalizeInstruction(value))
					}
				} else if (Array.isArray(value)) {
					value.forEach((item) => {
						if (typeof item === "string" && item.length > 5) {
							instructions.add(normalizeInstruction(item))
						}
					})
				} else if (typeof value === "object" && value !== null) {
					extractFromObject(value)
				}
			}
		}

		extractFromObject(data)
	} else {
		// Extract from Markdown
		const lines = content.split("\n")

		lines.forEach((line) => {
			const trimmed = line.trim()

			// Extract code blocks, commands, and key instructions
			if (
				trimmed.startsWith("```") ||
				trimmed.includes("cp ") ||
				trimmed.includes("git ") ||
				trimmed.includes("npm ") ||
				trimmed.includes("CARET MODIFICATION") ||
				trimmed.match(/^\d+\.\s/) ||
				(trimmed.startsWith("- ") && trimmed.length > 10)
			) {
				instructions.add(normalizeInstruction(trimmed))
			}
		})
	}

	return Array.from(instructions).filter((inst) => inst.length > 3)
}

function normalizeInstruction(instruction) {
	return instruction
		.replace(/^\d+\.\s*/, "") // Remove numbering
		.replace(/^[-*]\s*/, "") // Remove bullets
		.replace(/```\w*/, "") // Remove code markers
		.replace(/^\s*|\s*$/g, "") // Trim
		.toLowerCase()
}

// Extract workflow concepts (backup, verification, etc.)
function extractWorkflowConcepts(content) {
	const concepts = new Set()
	const contentStr = typeof content === "string" ? content : JSON.stringify(content)

	const conceptPatterns = [
		/backup|백업/gi,
		/verification|검증|verify/gi,
		/modification|수정|modify/gi,
		/caret.modification/gi,
		/compile|컴파일/gi,
		/test|테스트/gi,
		/restore|복원/gi,
		/safety|안전/gi,
		/protocol|프로토콜/gi,
	]

	conceptPatterns.forEach((pattern) => {
		const matches = contentStr.match(pattern) || []
		matches.forEach((match) => concepts.add(match.toLowerCase()))
	})

	return Array.from(concepts)
}

// Calculate instruction equivalence
function calculateInstructionEquivalence(instructions1, instructions2) {
	if (instructions1.length === 0 && instructions2.length === 0) {
		return 100
	}
	if (instructions1.length === 0 || instructions2.length === 0) {
		return 0
	}

	let matchCount = 0

	instructions1.forEach((inst1) => {
		const hasMatch = instructions2.some((inst2) => {
			// Semantic similarity check
			const similarity = calculateSimilarity(inst1, inst2)
			return similarity > 0.7
		})
		if (hasMatch) {
			matchCount++
		}
	})

	return Math.round((matchCount / Math.max(instructions1.length, instructions2.length)) * 100)
}

function calculateSimilarity(str1, str2) {
	// Extract key terms
	const terms1 = new Set(str1.split(/\W+/).filter((w) => w.length > 2))
	const terms2 = new Set(str2.split(/\W+/).filter((w) => w.length > 2))

	const intersection = new Set([...terms1].filter((x) => terms2.has(x)))
	const union = new Set([...terms1, ...terms2])

	return intersection.size / union.size
}

// Analyze workflow completeness
function analyzeWorkflowCompleteness(content, _isJSON = false) {
	const contentStr = typeof content === "string" ? content : JSON.stringify(content)

	const essentialElements = {
		backup_command: /cp\s+[\w.-]+\s+[\w.-]+\.cline/i,
		caret_comment: /caret.modification/i,
		verification: /npm\s+run\s+compile|npm\s+run\s+test/i,
		file_protection: /cline|backup/i,
		restoration: /restore|복원/i,
	}

	const completeness = {}
	let foundCount = 0

	Object.entries(essentialElements).forEach(([element, pattern]) => {
		completeness[element] = pattern.test(contentStr)
		if (completeness[element]) {
			foundCount++
		}
	})

	return {
		completeness_percentage: Math.round((foundCount / Object.keys(essentialElements).length) * 100),
		missing_elements: Object.keys(completeness).filter((key) => !completeness[key]),
		found_elements: Object.keys(completeness).filter((key) => completeness[key]),
		details: completeness,
	}
}

// Main workflow comparison function
function compareWorkflowFormats(markdownPath, jsonPath) {
	console.log("🔍 Workflow Format Semantic Equivalence Analysis\n")

	const markdownContent = fs.readFileSync(markdownPath, "utf8")
	const jsonContent = fs.readFileSync(jsonPath, "utf8")

	// Extract analysis data
	const markdownInstructions = extractWorkflowInstructions(markdownContent, false)
	const jsonInstructions = extractWorkflowInstructions(jsonContent, true)

	const markdownConcepts = extractWorkflowConcepts(markdownContent)
	const jsonConcepts = extractWorkflowConcepts(jsonContent)

	const markdownCompleteness = analyzeWorkflowCompleteness(markdownContent, false)
	const jsonCompleteness = analyzeWorkflowCompleteness(jsonContent, true)

	// Calculate semantic scores
	const instructionEquivalence = calculateInstructionEquivalence(markdownInstructions, jsonInstructions)
	const conceptEquivalence = calculateInstructionEquivalence(markdownConcepts, jsonConcepts)
	const completenessEquivalence = Math.min(
		markdownCompleteness.completeness_percentage,
		jsonCompleteness.completeness_percentage,
	)

	// Token efficiency
	const markdownTokens = Math.ceil(markdownContent.length / 4)
	const jsonTokens = Math.ceil(jsonContent.length / 4)
	const tokenEfficiency = (((markdownTokens - jsonTokens) / markdownTokens) * 100).toFixed(1)

	// Overall semantic score (workflow-specific weights)
	const overallScore =
		instructionEquivalence * 0.5 + // Instructions are most important
		conceptEquivalence * 0.25 + // Concepts coverage
		completenessEquivalence * 0.25 // Essential elements present

	// Display results
	console.log("📄 WORKFLOW FORMAT COMPARISON")
	console.log("=".repeat(50))
	console.log(`Markdown file: ${path.basename(markdownPath)}`)
	console.log(`JSON file: ${path.basename(jsonPath)}`)
	console.log()

	console.log("📊 TOKEN EFFICIENCY:")
	console.log(`   Markdown: ${markdownTokens.toLocaleString()} tokens (${markdownContent.length} chars)`)
	console.log(`   JSON: ${jsonTokens.toLocaleString()} tokens (${jsonContent.length} chars)`)
	console.log(`   Efficiency gain: ${tokenEfficiency}%`)
	console.log()

	console.log("🔧 INSTRUCTION EQUIVALENCE:")
	console.log(`   Markdown instructions: ${markdownInstructions.length}`)
	console.log(`   JSON instructions: ${jsonInstructions.length}`)
	console.log(`   Equivalence: ${instructionEquivalence}%`)
	console.log()

	console.log("💭 CONCEPT COVERAGE:")
	console.log(`   Markdown concepts: ${markdownConcepts.join(", ")}`)
	console.log(`   JSON concepts: ${jsonConcepts.join(", ")}`)
	console.log(`   Concept equivalence: ${conceptEquivalence}%`)
	console.log()

	console.log("✅ WORKFLOW COMPLETENESS:")
	console.log(`   Markdown completeness: ${markdownCompleteness.completeness_percentage}%`)
	console.log(`   JSON completeness: ${jsonCompleteness.completeness_percentage}%`)
	console.log(`   Missing in Markdown: ${markdownCompleteness.missing_elements.join(", ") || "None"}`)
	console.log(`   Missing in JSON: ${jsonCompleteness.missing_elements.join(", ") || "None"}`)
	console.log()

	console.log("🏆 OVERALL SEMANTIC EQUIVALENCE:")
	console.log(`   Final Score: ${overallScore.toFixed(1)}%`)
	console.log()

	console.log("📋 DETAILED BREAKDOWN:")
	console.log(`   • Instruction Equivalence: ${instructionEquivalence}% (weight: 50%)`)
	console.log(`   • Concept Coverage: ${conceptEquivalence}% (weight: 25%)`)
	console.log(`   • Workflow Completeness: ${completenessEquivalence}% (weight: 25%)`)
	console.log()

	// Problem areas
	const scores = [
		{ name: "Instruction Equivalence", score: instructionEquivalence },
		{ name: "Concept Coverage", score: conceptEquivalence },
		{ name: "Workflow Completeness", score: completenessEquivalence },
	]

	const problemAreas = scores.filter((item) => item.score < 95).sort((a, b) => a.score - b.score)

	if (problemAreas.length > 0) {
		console.log("⚠️ AREAS NEEDING ATTENTION:")
		problemAreas.forEach((area, index) => {
			console.log(`   ${index + 1}. ${area.name}: ${area.score}% ${area.score < 80 ? "🚨" : "⚠️"}`)
		})
	} else {
		console.log("✅ ALL AREAS ABOVE 95% THRESHOLD")
	}

	// Recommendations
	console.log("\n💡 RECOMMENDATIONS:")
	if (instructionEquivalence < 90) {
		console.log("   • Ensure all critical instructions are present in JSON format")
		console.log("   • Review semantic mapping between markdown steps and JSON structure")
	}
	if (conceptEquivalence < 90) {
		console.log("   • Add missing workflow concepts to JSON version")
	}
	if (completenessEquivalence < 95) {
		console.log("   • Include all essential workflow elements in both formats")
	}
	if (tokenEfficiency > 0) {
		console.log(`   ✅ JSON format achieves ${tokenEfficiency}% token efficiency`)
	}

	return {
		overall_score: parseFloat(overallScore.toFixed(1)),
		token_efficiency: parseFloat(tokenEfficiency),
		breakdown: {
			instruction_equivalence: instructionEquivalence,
			concept_coverage: conceptEquivalence,
			workflow_completeness: completenessEquivalence,
		},
		problem_areas: problemAreas,
	}
}

// CLI usage
if (require.main === module) {
	const args = process.argv.slice(2)
	if (args.length !== 2) {
		console.log("Usage: node workflow-semantic-analyzer.js <markdown-file> <json-file>")
		console.log("Example: node workflow-semantic-analyzer.js backup-protocol.md backup-protocol.json")
		process.exit(1)
	}

	const [markdownPath, jsonPath] = args
	try {
		compareWorkflowFormats(markdownPath, jsonPath)
	} catch (error) {
		console.error("❌ Analysis failed:", error.message)
		process.exit(1)
	}
}

module.exports = { compareWorkflowFormats }
