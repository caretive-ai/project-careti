#!/usr/bin/env node

/**
 * Detailed Semantic Equivalence Analyzer
 * Enhanced version that provides detailed breakdowns like Mission 1B
 * Extracts real scores instead of hardcoded values
 */

const fs = require("fs")
const _path = require("path")

// Tool comparison analysis
function analyzeToolCoverage(system1Data, system2Data) {
	const system1Tools = extractTools(system1Data)
	const system2Tools = extractTools(system2Data)

	const commonTools = system1Tools.filter((tool) => system2Tools.includes(tool))
	const system1Only = system1Tools.filter((tool) => !system2Tools.includes(tool))
	const system2Only = system2Tools.filter((tool) => !system1Tools.includes(tool))

	const coveragePercentage = Math.round((commonTools.length / system1Tools.length) * 100)

	return {
		system1_tools: system1Tools,
		system2_tools: system2Tools,
		common_tools: commonTools,
		system1_only: system1Only,
		system2_only: system2Only,
		total_system1: system1Tools.length,
		total_system2: system2Tools.length,
		coverage_percentage: coveragePercentage,
		missing_count: system1Only.length,
	}
}

function extractTools(data) {
	const tools = new Set()
	const dataStr = typeof data === "string" ? data : JSON.stringify(data)

	// Extract tool definitions (various patterns)
	const toolPatterns = [
		/##\s+(\w+)/g, // Markdown headers
		/"(\w+)"\s*:/g, // JSON keys
		/execute_command|read_file|write_to_file|replace_in_file|search_files|list_files|list_code_definition_names|browser_action|use_mcp_tool|access_mcp_resource|ask_followup_question|attempt_completion|new_task|load_mcp_documentation/g,
	]

	toolPatterns.forEach((pattern) => {
		let match
		while ((match = pattern.exec(dataStr)) !== null) {
			if (match[1]) {
				tools.add(match[1])
			} else {
				tools.add(match[0])
			}
		}
	})

	return Array.from(tools).filter(
		(tool) => tool.length > 2 && !["the", "and", "for", "with", "this"].includes(tool.toLowerCase()),
	)
}

// Parameter compatibility analysis
function analyzeParameterCompatibility(system1Data, system2Data) {
	const system1Params = extractParameters(system1Data)
	const system2Params = extractParameters(system2Data)

	const commonParams = system1Params.filter((param) => system2Params.includes(param))
	const compatibilityPercentage =
		system1Params.length > 0 ? Math.round((commonParams.length / system1Params.length) * 100) : 100

	return {
		system1_parameters: system1Params,
		system2_parameters: system2Params,
		common_parameters: commonParams,
		compatibility_percentage: compatibilityPercentage,
		parameter_gaps: system1Params.filter((param) => !system2Params.includes(param)),
	}
}

function extractParameters(data) {
	const params = new Set()
	const dataStr = typeof data === "string" ? data : JSON.stringify(data)

	// Extract parameter patterns
	const paramPatterns = [
		/"(\w+)":\s*{[^}]*"type":/g, // JSON schema parameters
		/\$\{([^}]+)\}/g, // Template parameters
		/--(\w+)/g, // CLI parameters
		/@param\s+(\w+)/g, // JSDoc parameters
	]

	paramPatterns.forEach((pattern) => {
		let match
		while ((match = pattern.exec(dataStr)) !== null) {
			if (match[1]) {
				params.add(match[1])
			}
		}
	})

	return Array.from(params)
}

// Mode system analysis
function analyzeModeSystem(system1Data, system2Data) {
	const system1Modes = extractModes(system1Data)
	const system2Modes = extractModes(system2Data)

	// Check for functional equivalence even if named differently
	const functionalEquivalence = calculateModeEquivalence(system1Modes, system2Modes)

	return {
		system1_modes: system1Modes,
		system2_modes: system2Modes,
		mode_equivalence_percentage: functionalEquivalence,
		different_approach:
			system1Modes.length > 0 && system2Modes.length > 0 && !system1Modes.some((mode) => system2Modes.includes(mode)),
	}
}

function extractModes(data) {
	const modes = new Set()
	const dataStr = typeof data === "string" ? data : JSON.stringify(data)

	const modePatterns = [/plan|act|planning|acting/gi, /chatbot|agent|chat|conversation/gi, /mode|state|context/gi]

	modePatterns.forEach((pattern) => {
		const matches = dataStr.match(pattern) || []
		matches.forEach((match) => modes.add(match.toLowerCase()))
	})

	return Array.from(modes)
}

function calculateModeEquivalence(modes1, modes2) {
	// Functional equivalence mapping
	const equivalentPairs = [
		["plan", "planning"],
		["act", "acting"],
		["chatbot", "chat"],
		["agent", "conversation"],
		["plan", "agent"], // Different approaches but similar function
		["act", "chatbot"], // Different approaches but similar function
	]

	let matchCount = 0
	const totalModes = Math.max(modes1.length, modes2.length)

	if (totalModes === 0) {
		return 100
	}

	modes1.forEach((mode1) => {
		const hasDirectMatch = modes2.includes(mode1)
		const hasEquivalentMatch = modes2.some((mode2) =>
			equivalentPairs.some((pair) => (pair[0] === mode1 && pair[1] === mode2) || (pair[1] === mode1 && pair[0] === mode2)),
		)

		if (hasDirectMatch) {
			matchCount += 1
		} else if (hasEquivalentMatch) {
			matchCount += 0.9 // 90% for equivalent but different
		}
	})

	return Math.round((matchCount / totalModes) * 100)
}

// User experience analysis
function analyzeUserExperience(system1Data, system2Data) {
	const system1UX = extractUserExperienceElements(system1Data)
	const system2UX = extractUserExperienceElements(system2Data)

	const commonUXElements = system1UX.filter((element) => system2UX.some((el) => semanticallySimilar(element, el)))

	const uxEquivalence = system1UX.length > 0 ? Math.round((commonUXElements.length / system1UX.length) * 100) : 100

	return {
		system1_ux_elements: system1UX,
		system2_ux_elements: system2UX,
		common_ux_elements: commonUXElements,
		ux_equivalence_percentage: uxEquivalence,
		representation_differences: system1UX.length !== system2UX.length,
	}
}

function extractUserExperienceElements(data) {
	const elements = new Set()
	const dataStr = typeof data === "string" ? data : JSON.stringify(data)

	// Extract UX-related patterns
	const uxPatterns = [
		/button|click|input|select|form|menu|dialog/gi,
		/message|notification|alert|warning|error/gi,
		/interface|ui|ux|user|experience|interaction/gi,
		/command|action|operation|function|feature/gi,
	]

	uxPatterns.forEach((pattern) => {
		const matches = dataStr.match(pattern) || []
		matches.forEach((match) => elements.add(match.toLowerCase()))
	})

	return Array.from(elements)
}

function semanticallySimilar(str1, str2) {
	// Simple semantic similarity check
	const similarity = calculateStringSimilarity(str1.toLowerCase(), str2.toLowerCase())
	return similarity > 0.6
}

function calculateStringSimilarity(str1, str2) {
	const words1 = new Set(str1.split(/\W+/))
	const words2 = new Set(str2.split(/\W+/))

	const intersection = new Set([...words1].filter((x) => words2.has(x)))
	const union = new Set([...words1, ...words2])

	return intersection.size / union.size
}

// Technical integration analysis
function analyzeTechnicalIntegration(system1Data, system2Data) {
	const system1APIs = extractAPIPatterns(system1Data)
	const system2APIs = extractAPIPatterns(system2Data)

	const commonAPIs = system1APIs.filter((api) => system2APIs.includes(api))
	const integrationPercentage = system1APIs.length > 0 ? Math.round((commonAPIs.length / system1APIs.length) * 100) : 100

	return {
		system1_apis: system1APIs,
		system2_apis: system2APIs,
		common_apis: commonAPIs,
		integration_percentage: integrationPercentage,
		identical_patterns: integrationPercentage === 100,
	}
}

function extractAPIPatterns(data) {
	const apis = new Set()
	const dataStr = typeof data === "string" ? data : JSON.stringify(data)

	const apiPatterns = [
		/api|endpoint|request|response|http|rest/gi,
		/function|method|call|invoke|execute/gi,
		/vscode|extension|webview|message/gi,
		/mcp|protocol|server|client/gi,
	]

	apiPatterns.forEach((pattern) => {
		const matches = dataStr.match(pattern) || []
		matches.forEach((match) => apis.add(match.toLowerCase()))
	})

	return Array.from(apis)
}

// Main analysis function
function performDetailedSemanticAnalysis(system1Path, system2Path, system1Name = "System 1", system2Name = "System 2") {
	console.log("🔍 Detailed Semantic Equivalence Analysis Starting...\n")

	const system1Data = fs.readFileSync(system1Path, "utf8")
	const system2Data = fs.readFileSync(system2Path, "utf8")

	let system2ParsedData = system2Data
	try {
		system2ParsedData = JSON.parse(system2Data)
	} catch (_e) {
		// Keep as string if not valid JSON
	}

	// Perform individual analyses
	const toolAnalysis = analyzeToolCoverage(system1Data, system2ParsedData)
	const parameterAnalysis = analyzeParameterCompatibility(system1Data, system2ParsedData)
	const modeAnalysis = analyzeModeSystem(system1Data, system2ParsedData)
	const uxAnalysis = analyzeUserExperience(system1Data, system2ParsedData)
	const integrationAnalysis = analyzeTechnicalIntegration(system1Data, system2ParsedData)

	// Calculate overall semantic score (Mission 1B methodology)
	const semanticScore =
		toolAnalysis.coverage_percentage * 0.4 +
		parameterAnalysis.compatibility_percentage * 0.15 +
		modeAnalysis.mode_equivalence_percentage * 0.15 +
		uxAnalysis.ux_equivalence_percentage * 0.15 +
		integrationAnalysis.integration_percentage * 0.15

	// Generate detailed report
	console.log("📊 DETAILED SEMANTIC EQUIVALENCE ANALYSIS")
	console.log("=".repeat(60))
	console.log(`${system1Name} vs ${system2Name}`)
	console.log()

	console.log("🔧 Tool Coverage Analysis:")
	console.log(`   ${system1Name}: ${toolAnalysis.total_system1} tools`)
	console.log(`   ${system2Name}: ${toolAnalysis.total_system2} tools`)
	console.log(`   Common tools: ${toolAnalysis.common_tools.length}`)
	console.log(`   Coverage: ${toolAnalysis.coverage_percentage}%`)
	if (toolAnalysis.system1_only.length > 0) {
		console.log(`   Missing in ${system2Name}: ${toolAnalysis.system1_only.join(", ")}`)
	}
	console.log()

	console.log("⚙️ Parameter Compatibility:")
	console.log(`   Compatibility: ${parameterAnalysis.compatibility_percentage}%`)
	if (parameterAnalysis.parameter_gaps.length > 0) {
		console.log(`   Parameter gaps: ${parameterAnalysis.parameter_gaps.join(", ")}`)
	}
	console.log()

	console.log("🔄 Mode System Analysis:")
	console.log(`   ${system1Name} modes: ${modeAnalysis.system1_modes.join(", ") || "None detected"}`)
	console.log(`   ${system2Name} modes: ${modeAnalysis.system2_modes.join(", ") || "None detected"}`)
	console.log(`   Mode equivalence: ${modeAnalysis.mode_equivalence_percentage}%`)
	console.log(`   Different approach: ${modeAnalysis.different_approach ? "Yes" : "No"}`)
	console.log()

	console.log("👤 User Experience:")
	console.log(`   UX equivalence: ${uxAnalysis.ux_equivalence_percentage}%`)
	console.log(`   Representation differences: ${uxAnalysis.representation_differences ? "Yes" : "No"}`)
	console.log()

	console.log("🔗 Technical Integration:")
	console.log(`   Integration: ${integrationAnalysis.integration_percentage}%`)
	console.log(`   Identical patterns: ${integrationAnalysis.identical_patterns ? "Yes" : "No"}`)
	console.log()

	console.log("🏆 OVERALL SEMANTIC SCORE:")
	console.log(`   Final Score: ${semanticScore.toFixed(1)}%`)
	console.log()

	console.log("📋 BREAKDOWN:")
	console.log(`   • Core Tools: ${toolAnalysis.coverage_percentage}% (weight: 40%)`)
	console.log(`   • Parameters: ${parameterAnalysis.compatibility_percentage}% (weight: 15%)`)
	console.log(`   • Mode System: ${modeAnalysis.mode_equivalence_percentage}% (weight: 15%)`)
	console.log(`   • User Experience: ${uxAnalysis.ux_equivalence_percentage}% (weight: 15%)`)
	console.log(`   • Technical Integration: ${integrationAnalysis.integration_percentage}% (weight: 15%)`)
	console.log()

	// Identify problem areas
	const scores = [
		{ name: "Core Tools", score: toolAnalysis.coverage_percentage },
		{ name: "Parameters", score: parameterAnalysis.compatibility_percentage },
		{ name: "Mode System", score: modeAnalysis.mode_equivalence_percentage },
		{ name: "User Experience", score: uxAnalysis.ux_equivalence_percentage },
		{ name: "Technical Integration", score: integrationAnalysis.integration_percentage },
	]

	const problemAreas = scores.filter((item) => item.score < 95).sort((a, b) => a.score - b.score)

	if (problemAreas.length > 0) {
		console.log("⚠️ AREAS NEEDING ATTENTION:")
		problemAreas.forEach((area, index) => {
			console.log(`   ${index + 1}. ${area.name}: ${area.score}% ${area.score < 90 ? "🚨" : "⚠️"}`)
		})
	} else {
		console.log("✅ ALL AREAS ABOVE 95% THRESHOLD")
	}

	return {
		overall_score: parseFloat(semanticScore.toFixed(1)),
		breakdown: {
			core_tools: toolAnalysis.coverage_percentage,
			parameters: parameterAnalysis.compatibility_percentage,
			mode_system: modeAnalysis.mode_equivalence_percentage,
			user_experience: uxAnalysis.ux_equivalence_percentage,
			technical_integration: integrationAnalysis.integration_percentage,
		},
		problem_areas: problemAreas,
		detailed_analysis: {
			tools: toolAnalysis,
			parameters: parameterAnalysis,
			modes: modeAnalysis,
			ux: uxAnalysis,
			integration: integrationAnalysis,
		},
	}
}

// CLI usage
if (require.main === module) {
	const args = process.argv.slice(2)
	if (args.length < 2) {
		console.log("Usage: node detailed-semantic-analyzer.js <system1-file> <system2-file> [system1-name] [system2-name]")
		console.log("Example: node detailed-semantic-analyzer.js cline-prompt.txt caret-prompt.json 'Cline' 'Caret'")
		process.exit(1)
	}

	const [system1Path, system2Path, system1Name, system2Name] = args
	try {
		performDetailedSemanticAnalysis(system1Path, system2Path, system1Name, system2Name)
	} catch (error) {
		console.error("❌ Analysis failed:", error.message)
		process.exit(1)
	}
}

module.exports = { performDetailedSemanticAnalysis }
