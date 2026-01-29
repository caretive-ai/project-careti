/**
 * E2E AI Edit Benchmark Script
 * Run: npx ts-node scripts/run-e2e-benchmark.ts
 */

import * as path from "path"
import * as fs from "fs/promises"
import { smartEditEngine } from "../careti-src/core/editing/SmartEditEngine"

const FIXTURES_DIR = path.join(__dirname, "../careti-src/core/editing/__tests__/fixtures/edit-targets")

// Baseline implementation (what Cline originally used - simple indexOf)
function baselineReplace(
	content: string,
	search: string,
	_replace: string
): { success: boolean; error?: string } {
	const idx = content.indexOf(search)
	if (idx === -1) {
		return { success: false, error: "indexOf returned -1" }
	}
	return { success: true }
}

// Improved implementation (SmartEditEngine with 9-stage fallback)
function improvedReplace(
	content: string,
	search: string,
	replace: string
): { success: boolean; method?: string; error?: string } {
	const result = smartEditEngine.smartReplace(content, search, replace)
	return {
		success: result.success,
		method: result.matchedWith,
		error: result.error,
	}
}

// Test cases simulating common AI imperfections
const TEST_CASES = [
	{
		name: "1. Exact match",
		file: "simple-function.ts",
		search: `export function calculateSum(a: number, b: number): number {
	return a + b
}`,
		replace: "REPLACED",
	},
	{
		name: "2. Spaces instead of tabs",
		file: "simple-function.ts",
		search: `export function calculateSum(a: number, b: number): number {
    return a + b
}`,
		replace: "REPLACED",
	},
	{
		name: "3. Extra trailing whitespace",
		file: "simple-function.ts",
		search: `export function calculateSum(a: number, b: number): number {
	return a + b
}`,
		replace: "REPLACED",
	},
	{
		name: "4. Mixed indentation",
		file: "indent-variation.ts",
		search: `	add(item: string): void {
        this.data.push(item)
    }`,
		replace: "REPLACED",
	},
	{
		name: "5. Korean content - exact",
		file: "korean-comments.ts",
		search: `// 사용자 정보를 처리하는 함수
export function processUser(name: string, age: number): string {`,
		replace: "REPLACED",
	},
	{
		name: "6. Korean content - spaces",
		file: "korean-comments.ts",
		search: `// 사용자 정보를 처리하는 함수
export function processUser(name: string, age: number): string {
    // 나이 검증`,
		replace: "REPLACED",
	},
	{
		name: "7. Line-trimmed match",
		file: "whitespace-variation.ts",
		search: `export function processData(input: string): string {
    const trimmed = input.trim()
    const normalized = trimmed.toLowerCase()
    return normalized
}`,
		replace: "REPLACED",
	},
	{
		name: "8. Partial context with anchor",
		file: "indent-variation.ts",
		search: `	remove(item: string): boolean {
		const index = this.data.indexOf(item)
		if (index > -1) {
			this.data.splice(index, 1)
			return true
		}
		return false
	}`,
		replace: "REPLACED",
	},
]

async function runBenchmark() {
	console.log("=" .repeat(70))
	console.log("E2E AI EDIT BENCHMARK: Baseline (indexOf) vs Improved (SmartEditEngine)")
	console.log("=".repeat(70))
	console.log("")

	// Load fixture files
	const files = await fs.readdir(FIXTURES_DIR)
	const contents = new Map<string, string>()
	for (const f of files) {
		if (f.endsWith(".ts")) {
			const content = await fs.readFile(path.join(FIXTURES_DIR, f), "utf-8")
			contents.set(f, content)
		}
	}
	console.log(`Loaded ${contents.size} fixture files: ${[...contents.keys()].join(", ")}`)
	console.log("")

	// Run tests
	let baselinePass = 0
	let improvedPass = 0
	const results: Array<{
		name: string
		baseline: boolean
		improved: boolean
		method?: string
	}> = []

	for (const test of TEST_CASES) {
		const content = contents.get(test.file)
		if (!content) {
			console.log(`⚠️  File not found: ${test.file}`)
			continue
		}

		const baseline = baselineReplace(content, test.search, test.replace)
		const improved = improvedReplace(content, test.search, test.replace)

		if (baseline.success) baselinePass++
		if (improved.success) improvedPass++

		results.push({
			name: test.name,
			baseline: baseline.success,
			improved: improved.success,
			method: improved.method,
		})
	}

	// Print results table
	console.log("| Test Case | Baseline (indexOf) | SmartEditEngine | Method Used |")
	console.log("|-----------|-------------------|-----------------|-------------|")
	for (const r of results) {
		const baseIcon = r.baseline ? "✅ PASS" : "❌ FAIL"
		const impIcon = r.improved ? "✅ PASS" : "❌ FAIL"
		const method = r.method || "-"
		console.log(`| ${r.name.padEnd(28)} | ${baseIcon.padEnd(17)} | ${impIcon.padEnd(15)} | ${method} |`)
	}

	// Print summary
	console.log("")
	console.log("-".repeat(70))
	console.log("SUMMARY")
	console.log("-".repeat(70))
	const total = TEST_CASES.length
	const baselineRate = ((baselinePass / total) * 100).toFixed(1)
	const improvedRate = ((improvedPass / total) * 100).toFixed(1)
	const improvement = improvedPass - baselinePass
	const improvementRate = ((improvement / total) * 100).toFixed(1)

	console.log(`Total Tests:     ${total}`)
	console.log(`Baseline:        ${baselinePass}/${total} (${baselineRate}%)`)
	console.log(`SmartEditEngine: ${improvedPass}/${total} (${improvedRate}%)`)
	console.log("")
	console.log(`🎯 IMPROVEMENT: +${improvement} tests (+${improvementRate}% success rate increase)`)
	console.log("")

	if (improvement > 0) {
		console.log("✨ SmartEditEngine successfully handles cases that simple indexOf fails on:")
		for (const r of results) {
			if (!r.baseline && r.improved) {
				console.log(`   - ${r.name} (via ${r.method})`)
			}
		}
	}

	console.log("")
	console.log("=".repeat(70))
}

runBenchmark().catch(console.error)
