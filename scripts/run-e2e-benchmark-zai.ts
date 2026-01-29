/**
 * E2E AI Edit Benchmark with ZAI (GLM-4.7)
 * Run: npx ts-node scripts/run-e2e-benchmark-zai.ts
 */

import * as path from "path"
import * as fs from "fs/promises"
import * as fsSync from "fs"
import { smartEditEngine } from "../careti-src/core/editing/SmartEditEngine"

// Load .env
const envPaths = ["/home/luke/dev/project-careti/.env", "/home/luke/dev/project-careti-env.env"]
for (const envPath of envPaths) {
	if (fsSync.existsSync(envPath)) {
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

const ZAI_TOKEN = process.env.ZAI_TOKEN
const ZAI_API_URL = "https://api.z.ai/api/coding/paas/v4/chat/completions"
const FIXTURES_DIR = path.join(__dirname, "../careti-src/core/editing/__tests__/fixtures/edit-targets")

function baselineReplace(content: string, search: string): { success: boolean } {
	return { success: content.indexOf(search) !== -1 }
}

function improvedReplace(content: string, search: string, replace: string): { success: boolean; method?: string } {
	const result = smartEditEngine.smartReplace(content, search, replace)
	return { success: result.success, method: result.matchedWith }
}

async function callZAI(fileContent: string, instruction: string): Promise<{ search: string; replace: string } | null> {
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
		const response = await fetch(ZAI_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ZAI_TOKEN}`,
			},
			body: JSON.stringify({
				model: "glm-4.7",
				messages: [{ role: "user", content: prompt }],
				max_tokens: 2000,
				temperature: 0.1,
				stream: false,
			}),
		})

		if (!response.ok) {
			const text = await response.text()
			console.log(`  API Error: ${response.status} - ${text.substring(0, 100)}`)
			return null
		}

		const data = await response.json()
		const text = data.choices?.[0]?.message?.content || ""

		const searchMatch = text.match(/SEARCH\n([\s\S]*?)\n=======/m)
		const replaceMatch = text.match(/=======\n([\s\S]*?)\n.*?REPLACE/m)

		if (searchMatch && replaceMatch) {
			return { search: searchMatch[1], replace: replaceMatch[1] }
		}

		// Alternative parsing
		const altMatch = text.match(/```[\s\S]*?SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n.*?REPLACE/m)
		if (altMatch) {
			return { search: altMatch[1], replace: altMatch[2] }
		}

		console.log(`  Parse failed. Response preview: ${text.substring(0, 150)}...`)
		return null
	} catch (e) {
		console.log(`  API Error: ${e}`)
		return null
	}
}

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
	console.log("E2E AI EDIT BENCHMARK WITH ZAI (GLM-4-Flash)")
	console.log("=".repeat(75))

	if (!ZAI_TOKEN) {
		console.log("❌ ZAI_TOKEN not found")
		return
	}
	console.log("✅ ZAI_TOKEN loaded")

	const files = await fs.readdir(FIXTURES_DIR)
	const contents = new Map<string, string>()
	for (const f of files) {
		if (f.endsWith(".ts")) {
			contents.set(f, await fs.readFile(path.join(FIXTURES_DIR, f), "utf-8"))
		}
	}
	console.log(`Loaded ${contents.size} fixture files\n`)

	let baselinePass = 0
	let improvedPass = 0
	const results: Array<{ name: string; baseline: boolean; improved: boolean; method?: string }> = []

	for (const test of AI_TESTS) {
		console.log(`🤖 Test: ${test.name}`)
		const content = contents.get(test.file)
		if (!content) continue

		console.log(`  Calling ZAI API...`)
		const aiResponse = await callZAI(content, test.instruction)

		if (!aiResponse) {
			console.log(`  ⚠️ Failed to get AI response\n`)
			continue
		}

		console.log(`  AI SEARCH block: ${aiResponse.search.length} chars`)
		console.log(`  Preview: "${aiResponse.search.substring(0, 60).replace(/\n/g, "\\n")}..."`)

		const baseline = baselineReplace(content, aiResponse.search)
		const improved = improvedReplace(content, aiResponse.search, aiResponse.replace)

		if (baseline.success) baselinePass++
		if (improved.success) improvedPass++

		results.push({ name: test.name, baseline: baseline.success, improved: improved.success, method: improved.method })

		const baseIcon = baseline.success ? "✅" : "❌"
		const impIcon = improved.success ? "✅" : "❌"
		console.log(`  Baseline: ${baseIcon}, SmartEditEngine: ${impIcon} ${improved.method ? `(${improved.method})` : ""}`)
		console.log("")
	}

	console.log("=".repeat(75))
	console.log("ZAI (GLM-4-Flash) TEST RESULTS")
	console.log("=".repeat(75))
	console.log("")
	console.log("| Test | Baseline | SmartEditEngine | Method |")
	console.log("|------|----------|-----------------|--------|")
	for (const r of results) {
		console.log(`| ${r.name.substring(0, 25).padEnd(25)} | ${r.baseline ? "✅ PASS" : "❌ FAIL"} | ${r.improved ? "✅ PASS" : "❌ FAIL"} | ${r.method || "-"} |`)
	}

	const total = results.length
	console.log("")
	console.log(`Baseline (indexOf):  ${baselinePass}/${total} (${((baselinePass / total) * 100).toFixed(1)}%)`)
	console.log(`SmartEditEngine:     ${improvedPass}/${total} (${((improvedPass / total) * 100).toFixed(1)}%)`)

	if (improvedPass > baselinePass) {
		console.log("")
		console.log(`🎯 IMPROVEMENT: +${improvedPass - baselinePass} tests recovered by SmartEditEngine!`)
	}
	console.log("=".repeat(75))
}

runBenchmark().catch(console.error)
