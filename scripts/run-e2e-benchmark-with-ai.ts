/**
 * E2E AI Edit Benchmark Script with Real AI API
 * Run: npx ts-node scripts/run-e2e-benchmark-with-ai.ts
 *
 * Requires GEMINI_TOKEN in .env file
 */

import * as path from "path"
import * as fs from "fs/promises"
import * as fsSync from "fs"
import { smartEditEngine } from "../careti-src/core/editing/SmartEditEngine"

// Load .env manually (check multiple locations)
const envPaths = [
	"/home/luke/dev/project-careti-env.env",
	path.join(__dirname, "../.env"),
	path.join(__dirname, "../../my-envs/project-careti-env.env"),
]
for (const envPath of envPaths) {
	if (fsSync.existsSync(envPath)) {
		console.log(`Loading env from: ${envPath}`)
		const envContent = fsSync.readFileSync(envPath, "utf-8")
		for (const line of envContent.split("\n")) {
			const match = line.match(/^([^=]+)=(.*)$/)
			if (match && !process.env[match[1]]) {
				process.env[match[1]] = match[2]
			}
		}
		break
	}
}

const GEMINI_TOKEN = process.env.GEMINI_TOKEN
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
const FIXTURES_DIR = path.join(__dirname, "../careti-src/core/editing/__tests__/fixtures/edit-targets")

// Baseline implementation (what Cline originally used - simple indexOf)
function baselineReplace(content: string, search: string): { success: boolean } {
	const idx = content.indexOf(search)
	return { success: idx !== -1 }
}

// Improved implementation (SmartEditEngine)
function improvedReplace(content: string, search: string, replace: string): { success: boolean; method?: string } {
	const result = smartEditEngine.smartReplace(content, search, replace)
	return { success: result.success, method: result.matchedWith }
}

// Call Gemini API
async function callGemini(fileContent: string, instruction: string): Promise<{ search: string; replace: string } | null> {
	const prompt = `You are editing a TypeScript file. Output ONLY the SEARCH/REPLACE block.

FILE:
\`\`\`typescript
${fileContent}
\`\`\`

INSTRUCTION: ${instruction}

Output format (EXACTLY):
------- SEARCH
[content to find]
=======
[new content]
+++++++ REPLACE`

	try {
		const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
			}),
		})

		if (!response.ok) {
			console.log(`  API Error: ${response.status}`)
			return null
		}

		const data = await response.json()
		const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

		// Parse response
		const searchMatch = text.match(/SEARCH\n([\s\S]*?)\n=======/m)
		const replaceMatch = text.match(/=======\n([\s\S]*?)\n.*?REPLACE/m)

		if (searchMatch && replaceMatch) {
			return { search: searchMatch[1], replace: replaceMatch[1] }
		}
		return null
	} catch (e) {
		console.log(`  API Error: ${e}`)
		return null
	}
}

// AI Test cases
const AI_TESTS = [
	{
		name: "Add logging to calculateSum",
		file: "simple-function.ts",
		instruction: "Add console.log at the start of calculateSum that logs the parameters a and b",
	},
	{
		name: "Add validation to processData",
		file: "whitespace-variation.ts",
		instruction: "Add a check at the beginning of processData that throws an error if input is empty",
	},
	{
		name: "Modify Korean function",
		file: "korean-comments.ts",
		instruction: "Add a console.log statement inside filterItems that logs the keyword parameter",
	},
	{
		name: "Add method to class",
		file: "indent-variation.ts",
		instruction: "Modify the add method to also log the item being added",
	},
]

async function runBenchmark() {
	console.log("=".repeat(75))
	console.log("E2E AI EDIT BENCHMARK WITH REAL AI (Gemini 2.0 Flash)")
	console.log("=".repeat(75))

	if (!GEMINI_TOKEN) {
		console.log("❌ GEMINI_TOKEN not found in .env")
		return
	}

	// Load files
	const files = await fs.readdir(FIXTURES_DIR)
	const contents = new Map<string, string>()
	for (const f of files) {
		if (f.endsWith(".ts")) {
			contents.set(f, await fs.readFile(path.join(FIXTURES_DIR, f), "utf-8"))
		}
	}
	console.log(`\nLoaded ${contents.size} fixture files`)
	console.log("")

	// Run AI tests
	let baselinePass = 0
	let improvedPass = 0
	const results: Array<{ name: string; baseline: boolean; improved: boolean; method?: string }> = []

	console.log("Running real AI tests...\n")

	for (const test of AI_TESTS) {
		console.log(`🤖 Test: ${test.name}`)
		const content = contents.get(test.file)
		if (!content) {
			console.log(`  ⚠️ File not found: ${test.file}`)
			continue
		}

		console.log(`  Calling Gemini API...`)
		const aiResponse = await callGemini(content, test.instruction)

		if (!aiResponse) {
			console.log(`  ⚠️ Failed to get AI response`)
			continue
		}

		console.log(`  AI SEARCH block: ${aiResponse.search.length} chars`)
		console.log(`  Preview: "${aiResponse.search.substring(0, 60).replace(/\n/g, "\\n")}..."`)

		const baseline = baselineReplace(content, aiResponse.search)
		const improved = improvedReplace(content, aiResponse.search, aiResponse.replace)

		if (baseline.success) baselinePass++
		if (improved.success) improvedPass++

		results.push({
			name: test.name,
			baseline: baseline.success,
			improved: improved.success,
			method: improved.method,
		})

		console.log(`  Baseline: ${baseline.success ? "✅" : "❌"}, SmartEditEngine: ${improved.success ? "✅" : "❌"} ${improved.method ? `(${improved.method})` : ""}`)
		console.log("")
	}

	// Print summary
	console.log("=".repeat(75))
	console.log("REAL AI TEST RESULTS")
	console.log("=".repeat(75))
	console.log("")
	console.log("| Test | Baseline | SmartEditEngine | Method |")
	console.log("|------|----------|-----------------|--------|")
	for (const r of results) {
		console.log(`| ${r.name.substring(0, 25).padEnd(25)} | ${r.baseline ? "✅ PASS" : "❌ FAIL"} | ${r.improved ? "✅ PASS" : "❌ FAIL"} | ${r.method || "-"} |`)
	}

	console.log("")
	const total = results.length
	console.log(`Baseline (indexOf):  ${baselinePass}/${total} (${((baselinePass / total) * 100).toFixed(1)}%)`)
	console.log(`SmartEditEngine:     ${improvedPass}/${total} (${((improvedPass / total) * 100).toFixed(1)}%)`)

	if (improvedPass > baselinePass) {
		console.log("")
		console.log(`🎯 IMPROVEMENT: +${improvedPass - baselinePass} tests with real AI-generated SEARCH blocks`)
	}

	console.log("")
	console.log("=".repeat(75))
}

runBenchmark().catch(console.error)
