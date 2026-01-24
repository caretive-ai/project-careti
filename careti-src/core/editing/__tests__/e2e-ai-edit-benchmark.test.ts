/**
 * E2E AI Edit Benchmark Test
 * CARETI MODIFICATION: Real AI-based editing benchmark
 *
 * This test uses actual AI API calls to measure edit success rates
 * comparing baseline (simple indexOf) vs improved (SmartEditEngine)
 *
 * Run with: GEMINI_TOKEN=xxx npm run test:unit -- --grep "E2E AI Edit Benchmark"
 */

import { expect } from "chai"
import { describe, it, before, after } from "mocha"
import * as fs from "fs/promises"
import * as path from "path"
import { smartEditEngine } from "../SmartEditEngine"

// Load environment variables
const GEMINI_TOKEN = process.env.GEMINI_TOKEN
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

// Test fixtures directory
const FIXTURES_DIR = path.join(__dirname, "fixtures/edit-targets")

// Results tracking
interface TestResult {
	testName: string
	fileContent: string
	aiSearchBlock: string
	aiReplaceBlock: string
	baselineSuccess: boolean
	improvedSuccess: boolean
	baselineError?: string
	improvedError?: string
	tokensSaved?: number
}

const results: TestResult[] = []

/**
 * Baseline implementation - simple indexOf (what Cline originally used)
 */
function baselineReplace(
	originalContent: string,
	searchBlock: string,
	replaceBlock: string
): { success: boolean; result?: string; error?: string } {
	// Simple exact match - this is what Cline's original diff.ts did
	const index = originalContent.indexOf(searchBlock)
	if (index === -1) {
		return {
			success: false,
			error: `SEARCH block not found in file (indexOf returned -1). Content length: ${originalContent.length}, Search length: ${searchBlock.length}`,
		}
	}
	const result = originalContent.slice(0, index) + replaceBlock + originalContent.slice(index + searchBlock.length)
	return { success: true, result }
}

/**
 * Improved implementation - SmartEditEngine with 9-stage fallback
 */
function improvedReplace(
	originalContent: string,
	searchBlock: string,
	replaceBlock: string
): { success: boolean; result?: string; error?: string; method?: string } {
	const result = smartEditEngine.smartReplace(originalContent, searchBlock, replaceBlock)
	if (result.success) {
		return { success: true, result: result.content, method: result.matchedWith }
	}
	return {
		success: false,
		error: result.error || "SmartEditEngine failed to find match",
	}
}

/**
 * Call Gemini API to generate edit instructions
 */
async function callGeminiForEdit(
	fileContent: string,
	editInstruction: string
): Promise<{ search: string; replace: string } | null> {
	if (!GEMINI_TOKEN) {
		return null
	}

	const prompt = `You are editing a TypeScript file. Given the file content and instruction, output ONLY the SEARCH and REPLACE blocks.

FILE CONTENT:
\`\`\`typescript
${fileContent}
\`\`\`

INSTRUCTION: ${editInstruction}

Output format (EXACTLY this format, no explanation):
------- SEARCH
[exact content to find]
=======
[new content]
+++++++ REPLACE`

	try {
		const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: {
					temperature: 0.1, // Low temperature for consistency
					maxOutputTokens: 2000,
				},
			}),
		})

		if (!response.ok) {
			console.error(`Gemini API error: ${response.status}`)
			return null
		}

		const data = await response.json()
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

		// Parse SEARCH/REPLACE blocks
		const searchMatch = text.match(/-------\s*SEARCH\n([\s\S]*?)\n=======/m)
		const replaceMatch = text.match(/=======\n([\s\S]*?)\n\+\+\+\+\+\+\+\s*REPLACE/m)

		if (searchMatch && replaceMatch) {
			return {
				search: searchMatch[1],
				replace: replaceMatch[1],
			}
		}

		// Try alternative parsing
		const altSearchMatch = text.match(/SEARCH\n([\s\S]*?)\n=======/m)
		const altReplaceMatch = text.match(/=======\n([\s\S]*?)\nREPLACE/m)

		if (altSearchMatch && altReplaceMatch) {
			return {
				search: altSearchMatch[1],
				replace: altReplaceMatch[1],
			}
		}

		console.error("Failed to parse AI response:", text.substring(0, 200))
		return null
	} catch (error) {
		console.error("Gemini API call failed:", error)
		return null
	}
}

/**
 * Simulated AI responses with common imperfections
 * These simulate what real AI models often produce
 */
const SIMULATED_AI_EDITS = {
	// Test 1: Exact match (should work in both)
	exactMatch: {
		file: "simple-function.ts",
		instruction: "Change calculateSum to add logging",
		search: `export function calculateSum(a: number, b: number): number {
	return a + b
}`,
		replace: `export function calculateSum(a: number, b: number): number {
	console.log(\`Adding \${a} + \${b}\`)
	return a + b
}`,
	},

	// Test 2: Whitespace difference (AI often normalizes spaces)
	whitespaceNormalized: {
		file: "whitespace-variation.ts",
		instruction: "Add validation to processData",
		// AI might output with different whitespace
		search: `export function processData(input: string): string {
    const trimmed = input.trim()
    const normalized = trimmed.toLowerCase()
    return normalized
}`,
		replace: `export function processData(input: string): string {
    if (!input) throw new Error("Input required")
    const trimmed = input.trim()
    const normalized = trimmed.toLowerCase()
    return normalized
}`,
	},

	// Test 3: Indentation difference (AI uses spaces vs tabs)
	indentationDiff: {
		file: "indent-variation.ts",
		instruction: "Add logging to the add method",
		// AI outputs with spaces instead of tabs
		search: `    add(item: string): void {
        this.data.push(item)
    }`,
		replace: `    add(item: string): void {
        console.log("Adding item:", item)
        this.data.push(item)
    }`,
	},

	// Test 4: Trailing whitespace (AI often strips it)
	trailingWhitespace: {
		file: "simple-function.ts",
		instruction: "Add type annotation to calculateProduct",
		search: `export function calculateProduct(a: number, b: number): number {
	return a * b
}`,
		replace: `export function calculateProduct(a: number, b: number): number {
	const result: number = a * b
	return result
}`,
	},

	// Test 5: Korean content (Unicode handling)
	koreanContent: {
		file: "korean-comments.ts",
		instruction: "Add error handling to processUser",
		search: `// 사용자 정보를 처리하는 함수
export function processUser(name: string, age: number): string {
	// 나이 검증
	if (age < 0 || age > 150) {
		throw new Error("유효하지 않은 나이입니다")
	}`,
		replace: `// 사용자 정보를 처리하는 함수
export function processUser(name: string, age: number): string {
	// 입력값 null 체크
	if (!name) {
		throw new Error("이름이 필요합니다")
	}
	// 나이 검증
	if (age < 0 || age > 150) {
		throw new Error("유효하지 않은 나이입니다")
	}`,
	},

	// Test 6: Mixed indentation (tabs and spaces mixed - common AI issue)
	mixedIndent: {
		file: "indent-variation.ts",
		instruction: "Modify the remove method to return the removed item",
		// AI might mix tabs and spaces
		search: `	remove(item: string): boolean {
		const index = this.data.indexOf(item)
		if (index > -1) {
			this.data.splice(index, 1)
			return true
		}
		return false
	}`,
		replace: `	remove(item: string): string | null {
		const index = this.data.indexOf(item)
		if (index > -1) {
			const removed = this.data.splice(index, 1)[0]
			return removed
		}
		return null
	}`,
	},

	// Test 7: Line ending differences
	lineEndingDiff: {
		file: "whitespace-variation.ts",
		instruction: "Add early return to validateInput",
		search: `export function validateInput(value: string): boolean {
	if (!value) {
		return false
	}
	if (value.length < 3) {
		return false
	}
	return true
}`,
		replace: `export function validateInput(value: string): boolean {
	if (!value || value.length < 3) {
		return false
	}
	return true
}`,
	},

	// Test 8: Partial context (AI gives less context than needed)
	partialContext: {
		file: "korean-comments.ts",
		instruction: "Change filter condition",
		// AI might provide partial context
		search: `	// 키워드 포함 항목만 필터링
	return items.filter((item) => item.includes(keyword))`,
		replace: `	// 키워드 포함 항목만 필터링 (대소문자 무시)
	return items.filter((item) => item.toLowerCase().includes(keyword.toLowerCase()))`,
	},
}

describe("E2E AI Edit Benchmark", function () {
	this.timeout(60000) // 60 seconds for API calls

	let fixtureContents: Map<string, string> = new Map()

	before(async () => {
		// Load all fixture files
		const files = await fs.readdir(FIXTURES_DIR)
		for (const file of files) {
			if (file.endsWith(".ts")) {
				const content = await fs.readFile(path.join(FIXTURES_DIR, file), "utf-8")
				fixtureContents.set(file, content)
			}
		}
		console.log(`\n  Loaded ${fixtureContents.size} fixture files`)
	})

	after(() => {
		// Print summary report
		console.log("\n" + "=".repeat(70))
		console.log("E2E AI EDIT BENCHMARK RESULTS")
		console.log("=".repeat(70))

		const baselineSuccesses = results.filter((r) => r.baselineSuccess).length
		const improvedSuccesses = results.filter((r) => r.improvedSuccess).length
		const total = results.length

		console.log(`\nTotal Tests: ${total}`)
		console.log(`Baseline (indexOf) Success: ${baselineSuccesses}/${total} (${((baselineSuccesses / total) * 100).toFixed(1)}%)`)
		console.log(`Improved (SmartEditEngine) Success: ${improvedSuccesses}/${total} (${((improvedSuccesses / total) * 100).toFixed(1)}%)`)
		console.log(`Improvement: +${improvedSuccesses - baselineSuccesses} tests (+${(((improvedSuccesses - baselineSuccesses) / total) * 100).toFixed(1)}%)`)

		console.log("\n" + "-".repeat(70))
		console.log("Detailed Results:")
		console.log("-".repeat(70))

		for (const result of results) {
			const baselineIcon = result.baselineSuccess ? "✅" : "❌"
			const improvedIcon = result.improvedSuccess ? "✅" : "❌"
			console.log(`\n${result.testName}:`)
			console.log(`  Baseline:  ${baselineIcon} ${result.baselineSuccess ? "PASS" : "FAIL"}`)
			console.log(`  Improved:  ${improvedIcon} ${result.improvedSuccess ? "PASS" : "FAIL"}`)
			if (!result.baselineSuccess && result.improvedSuccess) {
				console.log(`  >>> IMPROVEMENT: SmartEditEngine succeeded where indexOf failed!`)
			}
			if (result.baselineError) {
				console.log(`  Baseline Error: ${result.baselineError.substring(0, 80)}...`)
			}
		}

		console.log("\n" + "=".repeat(70))
	})

	describe("Simulated AI Edits (Controlled)", () => {
		for (const [testName, testCase] of Object.entries(SIMULATED_AI_EDITS)) {
			it(`should handle ${testName}`, async () => {
				const fileContent = fixtureContents.get(testCase.file)
				if (!fileContent) {
					console.log(`  Skipping: ${testCase.file} not found`)
					return
				}

				// Test baseline (indexOf)
				const baselineResult = baselineReplace(fileContent, testCase.search, testCase.replace)

				// Test improved (SmartEditEngine)
				const improvedResult = improvedReplace(fileContent, testCase.search, testCase.replace)

				// Record results
				results.push({
					testName: `Simulated: ${testName}`,
					fileContent: fileContent.substring(0, 100) + "...",
					aiSearchBlock: testCase.search.substring(0, 50) + "...",
					aiReplaceBlock: testCase.replace.substring(0, 50) + "...",
					baselineSuccess: baselineResult.success,
					improvedSuccess: improvedResult.success,
					baselineError: baselineResult.error,
					improvedError: improvedResult.error,
				})

				// At minimum, improved should not be worse than baseline
				if (baselineResult.success) {
					expect(improvedResult.success).to.be.true
				}

				// Log individual result
				console.log(`    Baseline: ${baselineResult.success ? "✅" : "❌"}, Improved: ${improvedResult.success ? "✅" : "❌"}`)
			})
		}
	})

	describe("Real AI API Edits", function () {
		before(function () {
			if (!GEMINI_TOKEN) {
				console.log("\n  ⚠️  GEMINI_TOKEN not set - skipping real AI tests")
				console.log("  Run with: GEMINI_TOKEN=xxx npm run test:unit -- --grep \"E2E AI Edit Benchmark\"")
				this.skip()
			}
		})

		const realAITests = [
			{
				name: "Add logging to function",
				file: "simple-function.ts",
				instruction: "Add a console.log statement at the start of calculateSum function that logs the input parameters",
			},
			{
				name: "Add error handling",
				file: "whitespace-variation.ts",
				instruction: "Add input validation to processData function - throw an error if input is empty",
			},
			{
				name: "Modify Korean code",
				file: "korean-comments.ts",
				instruction: "Add a console.log to filterItems function that logs how many items were filtered",
			},
		]

		for (const test of realAITests) {
			it(`Real AI: ${test.name}`, async function () {
				const fileContent = fixtureContents.get(test.file)
				if (!fileContent) {
					this.skip()
					return
				}

				console.log(`\n    Calling Gemini API for: ${test.instruction.substring(0, 50)}...`)

				const aiResponse = await callGeminiForEdit(fileContent, test.instruction)
				if (!aiResponse) {
					console.log("    ⚠️  AI response parsing failed")
					this.skip()
					return
				}

				console.log(`    AI generated SEARCH block (${aiResponse.search.length} chars)`)

				// Test both implementations
				const baselineResult = baselineReplace(fileContent, aiResponse.search, aiResponse.replace)
				const improvedResult = improvedReplace(fileContent, aiResponse.search, aiResponse.replace)

				results.push({
					testName: `Real AI: ${test.name}`,
					fileContent: fileContent.substring(0, 100) + "...",
					aiSearchBlock: aiResponse.search.substring(0, 100) + "...",
					aiReplaceBlock: aiResponse.replace.substring(0, 100) + "...",
					baselineSuccess: baselineResult.success,
					improvedSuccess: improvedResult.success,
					baselineError: baselineResult.error,
					improvedError: improvedResult.error,
				})

				console.log(`    Baseline: ${baselineResult.success ? "✅" : "❌"}, Improved: ${improvedResult.success ? "✅" : "❌"}`)

				// Improved should succeed
				expect(improvedResult.success).to.be.true
			})
		}
	})
})
