#!/usr/bin/env node

const fs = require("fs")
const { analyzeSemanticEquivalence } = require("./utils/universal-semantic-analyzer.js")

// Original extraction logic from analyzer
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
			/careti.modification/gi,
			/compile|컴파일/gi,
			/test|테스트/gi,
			/restore|복원/gi,
			/safety|안전/gi,
			/protocol|프로토콜/gi,
		],
	}

	const relevantPatterns = patterns[analysisType] || patterns.workflow

	relevantPatterns.forEach((pattern) => {
		const matches = content.match(pattern) || []
		for (const match of matches) {
			elements.concepts.push(match.toLowerCase())
		}
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

// Debug test
console.log("🔍 DEBUG: Analyzing what gets extracted from each format\n")

const mdFile = ".agents/context/workflows/cline-modification.md"
const jsonFile = ".agents/context/json-converted/cline-modification-v3.json"

const mdContent = fs.readFileSync(mdFile, "utf8")
const jsonContent = fs.readFileSync(jsonFile, "utf8")

console.log("📄 MARKDOWN FILE EXTRACTION:")
const mdElements = extractSemanticElements(mdContent, false, "workflow")
console.log("Instructions found:", mdElements.instructions.length)
console.log("First 3 instructions:", mdElements.instructions.slice(0, 3))
console.log("Concepts found:", mdElements.concepts.length)
console.log("Unique concepts:", [...new Set(mdElements.concepts)])
console.log()

console.log("📋 JSON FILE EXTRACTION:")
const jsonElements = extractSemanticElements(jsonContent, true, "workflow")
console.log("Instructions found:", jsonElements.instructions.length)
console.log("First 3 instructions:", jsonElements.instructions.slice(0, 3))
console.log("Concepts found:", jsonElements.concepts.length)
console.log("Unique concepts:", [...new Set(jsonElements.concepts)])
console.log()

console.log("⚠️ DIFFERENCES:")
console.log("MD instructions:", mdElements.instructions.length, "vs JSON instructions:", jsonElements.instructions.length)
console.log("MD concepts:", mdElements.concepts.length, "vs JSON concepts:", jsonElements.concepts.length)

// Check what's missing
const mdInstructionSet = new Set(mdElements.instructions)
const jsonInstructionSet = new Set(jsonElements.instructions)

const missingInJson = [...mdInstructionSet].filter((x) => !jsonInstructionSet.has(x))
console.log("\n🚨 Instructions in MD but not in JSON:", missingInJson.length)
if (missingInJson.length > 0) {
	console.log("Examples:", missingInJson.slice(0, 5))
}
