/**
 * Hard E2E Benchmark - Tests designed to make AI produce imperfect SEARCH blocks
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

const UPSTAGE_KEY = process.env.UPSTAGE_KEY
const UPSTAGE_API_URL = "https://api.upstage.ai/v1/chat/completions"
const FIXTURES_DIR = path.join(__dirname, "../careti-src/core/editing/__tests__/fixtures/edit-targets")

function baselineReplace(content: string, search: string): { success: boolean } {
	return { success: content.indexOf(search) !== -1 }
}

function improvedReplace(content: string, search: string, replace: string): { success: boolean; method?: string } {
	const result = smartEditEngine.smartReplace(content, search, replace)
	return { success: result.success, method: result.matchedWith }
}

async function callUpstage(prompt: string): Promise<string | null> {
	try {
		const response = await fetch(UPSTAGE_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${UPSTAGE_KEY}`,
			},
			body: JSON.stringify({
				model: "solar-mini",
				messages: [{ role: "user", content: prompt }],
				max_tokens: 2000,
				temperature: 0.3, // Higher temperature = more mistakes
			}),
		})

		if (!response.ok) return null
		const data = await response.json()
		return data.choices?.[0]?.message?.content || null
	} catch {
		return null
	}
}

function parseSearchReplace(text: string): { search: string; replace: string } | null {
	// Multiple patterns
	const patterns = [
		/SEARCH\n([\s\S]*?)\n=+\n([\s\S]*?)\n.*?REPLACE/m,
		/SEARCH\n([\s\S]*?)\n=+[\s\S]*?REPLACE\n([\s\S]*?)$/m,
		/```[\s\S]*?SEARCH\n([\s\S]*?)\n=+\n([\s\S]*?)\n.*?REPLACE/m,
	]
	for (const p of patterns) {
		const m = text.match(p)
		if (m) return { search: m[1], replace: m[2]?.trim() || "" }
	}
	return null
}

// Hard test cases - designed to confuse AI
const HARD_TESTS = [
	{
		name: "Similar func: getData vs getDataList",
		file: "confusing-names.ts",
		// Intentionally vague instruction
		instruction: "Add logging to the getData function (not getDataList, not getDataItem)",
	},
	{
		name: "Similar method: setData vs setDataList",
		file: "confusing-names.ts",
		instruction: "Modify setData method in DataService to validate input (not setDataList)",
	},
	{
		name: "Korean similar: 데이터가져오기",
		file: "confusing-names.ts",
		instruction: "데이터가져오기 함수에 로깅 추가 (데이터목록가져오기나 데이터항목가져오기 아님)",
	},
	{
		name: "Ambiguous: addData",
		file: "confusing-names.ts",
		instruction: "Add validation to addData method to check if item is not empty",
	},
]

async function runBenchmark() {
	console.log("=".repeat(75))
	console.log("HARD E2E BENCHMARK - Confusing Similar Names")
	console.log("=".repeat(75))

	if (!UPSTAGE_KEY) {
		console.log("❌ UPSTAGE_KEY not found")
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

	let baselinePass = 0, improvedPass = 0, baselineFail = 0, improvedRecovered = 0
	const results: Array<{ name: string; baseline: boolean; improved: boolean; method?: string; searchPreview?: string }> = []

	for (const test of HARD_TESTS) {
		console.log(`🤖 ${test.name}`)
		const content = contents.get(test.file)
		if (!content) { console.log("  File not found\n"); continue }

		const prompt = `Edit this TypeScript file. Output ONLY SEARCH/REPLACE block.

FILE:
\`\`\`typescript
${content}
\`\`\`

TASK: ${test.instruction}

Format:
------- SEARCH
[exact content to find]
=======
[new content]
+++++++ REPLACE`

		console.log(`  Calling API...`)
		const response = await callUpstage(prompt)
		if (!response) { console.log("  API failed\n"); continue }

		const parsed = parseSearchReplace(response)
		if (!parsed) {
			console.log(`  Parse failed: ${response.substring(0, 100)}...\n`)
			continue
		}

		console.log(`  SEARCH (${parsed.search.length} chars): "${parsed.search.substring(0, 50).replace(/\n/g, "\\n")}..."`)

		const baseline = baselineReplace(content, parsed.search)
		const improved = improvedReplace(content, parsed.search, parsed.replace)

		if (baseline.success) baselinePass++
		else baselineFail++
		if (improved.success) improvedPass++
		if (!baseline.success && improved.success) improvedRecovered++

		results.push({
			name: test.name,
			baseline: baseline.success,
			improved: improved.success,
			method: improved.method,
			searchPreview: parsed.search.substring(0, 40),
		})

		console.log(`  Baseline: ${baseline.success ? "✅" : "❌"}, SmartEditEngine: ${improved.success ? "✅" : "❌"} ${improved.method || ""}`)
		if (!baseline.success && improved.success) {
			console.log(`  >>> RECOVERED by SmartEditEngine!`)
		}
		console.log("")
	}

	console.log("=".repeat(75))
	console.log("HARD TEST RESULTS")
	console.log("=".repeat(75))
	console.log("")
	console.log("| Test | Baseline | SmartEditEngine | Method |")
	console.log("|------|----------|-----------------|--------|")
	for (const r of results) {
		console.log(`| ${r.name.substring(0, 30).padEnd(30)} | ${r.baseline ? "✅" : "❌"} | ${r.improved ? "✅" : "❌"} | ${r.method || "-"} |`)
	}

	const total = results.length
	console.log("")
	console.log(`Baseline:        ${baselinePass}/${total} (${((baselinePass / total) * 100).toFixed(0)}%)`)
	console.log(`SmartEditEngine: ${improvedPass}/${total} (${((improvedPass / total) * 100).toFixed(0)}%)`)
	console.log(`Recovered:       ${improvedRecovered} tests`)
	console.log("=".repeat(75))
}

runBenchmark().catch(console.error)
