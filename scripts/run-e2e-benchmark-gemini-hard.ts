/**
 * Hard E2E Benchmark with Gemini - Tests with confusing similar names
 */

import * as path from "path"
import * as fs from "fs/promises"
import * as fsSync from "fs"
import { smartEditEngine } from "../careti-src/core/editing/SmartEditEngine"

// Load .env
const envPaths = ["/home/luke/dev/project-careti/.env"]
for (const envPath of envPaths) {
	if (fsSync.existsSync(envPath)) {
		const envContent = fsSync.readFileSync(envPath, "utf-8")
		for (const line of envContent.split("\n")) {
			const match = line.match(/^([^=]+)=(.*)$/)
			if (match && !process.env[match[1]]) {
				process.env[match[1]] = match[2]
			}
		}
	}
}

const GEMINI_TOKEN = process.env.GEMINI_TOKEN
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
const FIXTURES_DIR = path.join(__dirname, "../careti-src/core/editing/__tests__/fixtures/edit-targets")

function baselineReplace(content: string, search: string): { success: boolean } {
	return { success: content.indexOf(search) !== -1 }
}

function improvedReplace(content: string, search: string, replace: string): { success: boolean; method?: string } {
	const result = smartEditEngine.smartReplace(content, search, replace)
	return { success: result.success, method: result.matchedWith }
}

async function callGemini(prompt: string, temperature = 0.3): Promise<string | null> {
	try {
		const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: { temperature, maxOutputTokens: 2000 },
			}),
		})
		if (!response.ok) return null
		const data = await response.json()
		return data.candidates?.[0]?.content?.parts?.[0]?.text || null
	} catch {
		return null
	}
}

function parseSearchReplace(text: string): { search: string; replace: string } | null {
	const patterns = [
		/SEARCH\n([\s\S]*?)\n=+\n([\s\S]*?)\n.*?REPLACE/m,
		/SEARCH\n([\s\S]*?)\n=+[\s\S]*?REPLACE\n([\s\S]*?)$/m,
		/---+\s*SEARCH\n([\s\S]*?)\n=+\n([\s\S]*?)\n\++\s*REPLACE/m,
	]
	for (const p of patterns) {
		const m = text.match(p)
		if (m) return { search: m[1], replace: m[2]?.trim() || "" }
	}
	return null
}

// Tests designed to confuse AI with similar names
const HARD_TESTS = [
	{
		name: "getData vs getDataList (exact)",
		file: "confusing-names.ts",
		instruction: "Add console.log('fetching') to the getData function. NOT getDataList, NOT getDataItem.",
		temperature: 0.1,
	},
	{
		name: "getData vs getDataList (high temp)",
		file: "confusing-names.ts",
		instruction: "Add console.log to getData function only",
		temperature: 0.7, // Higher = more random/mistakes
	},
	{
		name: "setData in class",
		file: "confusing-names.ts",
		instruction: "Modify setData method (not setDataList) to validate that value array is not empty",
		temperature: 0.3,
	},
	{
		name: "Korean: 데이터가져오기",
		file: "confusing-names.ts",
		instruction: "데이터가져오기 함수 (not 데이터목록가져오기) 에 console.log 추가",
		temperature: 0.3,
	},
	{
		name: "processUser variables",
		file: "confusing-names.ts",
		instruction: "In processUser function, add a log for the userInfo variable (not user, not userList)",
		temperature: 0.5,
	},
	{
		name: "addData method",
		file: "confusing-names.ts",
		instruction: "Add validation to addData method (not addDataList) to check item is not empty string",
		temperature: 0.4,
	},
]

async function runBenchmark() {
	console.log("=".repeat(75))
	console.log("HARD E2E BENCHMARK WITH GEMINI - Confusing Similar Names")
	console.log("=".repeat(75))

	if (!GEMINI_TOKEN) {
		console.log("❌ GEMINI_TOKEN not found")
		return
	}

	const files = await fs.readdir(FIXTURES_DIR)
	const contents = new Map<string, string>()
	for (const f of files) {
		if (f.endsWith(".ts")) {
			contents.set(f, await fs.readFile(path.join(FIXTURES_DIR, f), "utf-8"))
		}
	}
	console.log(`Loaded ${contents.size} fixture files\n`)

	let baselinePass = 0, improvedPass = 0, recovered = 0
	const results: Array<{ name: string; baseline: boolean; improved: boolean; method?: string }> = []

	for (const test of HARD_TESTS) {
		console.log(`🤖 ${test.name} (temp=${test.temperature})`)
		const content = contents.get(test.file)
		if (!content) { console.log("  File not found\n"); continue }

		const prompt = `Edit TypeScript file. Output ONLY the SEARCH/REPLACE block.

FILE:
\`\`\`typescript
${content}
\`\`\`

TASK: ${test.instruction}

Format (EXACT):
------- SEARCH
[exact content to find in file]
=======
[new content to replace with]
+++++++ REPLACE`

		console.log(`  Calling Gemini...`)
		const response = await callGemini(prompt, test.temperature)
		if (!response) { console.log("  API failed\n"); continue }

		const parsed = parseSearchReplace(response)
		if (!parsed) {
			console.log(`  Parse failed: ${response.substring(0, 80)}...\n`)
			continue
		}

		console.log(`  SEARCH: "${parsed.search.substring(0, 50).replace(/\n/g, "\\n")}..."`)

		const baseline = baselineReplace(content, parsed.search)
		const improved = improvedReplace(content, parsed.search, parsed.replace)

		if (baseline.success) baselinePass++
		if (improved.success) improvedPass++
		if (!baseline.success && improved.success) recovered++

		results.push({ name: test.name, baseline: baseline.success, improved: improved.success, method: improved.method })

		console.log(`  Result: Baseline ${baseline.success ? "✅" : "❌"} | SmartEditEngine ${improved.success ? "✅" : "❌"} ${improved.method || ""}`)
		if (!baseline.success && improved.success) console.log(`  >>> RECOVERED!`)
		console.log("")
	}

	console.log("=".repeat(75))
	console.log("RESULTS SUMMARY")
	console.log("=".repeat(75))
	console.log("")
	for (const r of results) {
		const bIcon = r.baseline ? "✅" : "❌"
		const iIcon = r.improved ? "✅" : "❌"
		const rec = !r.baseline && r.improved ? " 🎯RECOVERED" : ""
		console.log(`${r.name.padEnd(35)} | ${bIcon} | ${iIcon} ${r.method || ""}${rec}`)
	}

	const total = results.length
	console.log("")
	console.log("-".repeat(75))
	console.log(`Baseline (indexOf):  ${baselinePass}/${total} (${((baselinePass / total) * 100).toFixed(0)}%)`)
	console.log(`SmartEditEngine:     ${improvedPass}/${total} (${((improvedPass / total) * 100).toFixed(0)}%)`)
	if (recovered > 0) {
		console.log(`🎯 RECOVERED:        ${recovered} tests that indexOf failed!`)
	}
	console.log("=".repeat(75))
}

runBenchmark().catch(console.error)
