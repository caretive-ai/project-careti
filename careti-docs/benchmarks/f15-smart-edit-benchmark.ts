/**
 * F15 SmartEditEngine 벤치마크
 *
 * 실행 방법:
 * cd /home/luke/dev/project-careti
 * npx ts-node --project ./tsconfig.unit-test.json careti-docs/benchmarks/f15-smart-edit-benchmark.ts
 *
 * 이 벤치마크는 AI가 생성하는 SEARCH 블록의 일반적인 오류를 시뮬레이션하여
 * Baseline (indexOf) vs SmartEditEngine (9단계 Fuzzy Matching)의 성공률을 비교합니다.
 */

import * as path from "path"
import * as fs from "fs/promises"
import { smartEditEngine } from "../../careti-src/core/editing/SmartEditEngine"

const FIXTURES_DIR = path.join(__dirname, "../../careti-src/core/editing/__tests__/fixtures/edit-targets")

// Baseline: Cline 원본 방식 (단순 indexOf)
function baselineReplace(content: string, search: string): { success: boolean; timeMs: number } {
	const start = performance.now()
	const idx = content.indexOf(search)
	const timeMs = performance.now() - start
	return { success: idx !== -1, timeMs }
}

// Improved: SmartEditEngine 9단계 Fuzzy Matching
function improvedReplace(content: string, search: string, replace: string): { success: boolean; timeMs: number; method?: string } {
	const start = performance.now()
	const result = smartEditEngine.smartReplace(content, search, replace)
	const timeMs = performance.now() - start
	return { success: result.success, timeMs, method: result.matchedWith }
}

// AI가 생성하는 일반적인 오류를 시뮬레이션한 테스트 케이스
const TEST_CASES = [
	{
		id: 1,
		name: "정확한 매칭",
		description: "AI가 정확한 코드를 출력한 경우",
		file: "simple-function.ts",
		search: `export function calculateSum(a: number, b: number): number {
	return a + b
}`,
		replace: "REPLACED",
		expectedBaseline: true,
		expectedImproved: true,
	},
	{
		id: 2,
		name: "스페이스 vs 탭",
		description: "AI가 탭 대신 스페이스 4개를 출력한 경우",
		file: "simple-function.ts",
		search: `export function calculateSum(a: number, b: number): number {
    return a + b
}`,
		replace: "REPLACED",
		expectedBaseline: false,
		expectedImproved: true,
	},
	{
		id: 3,
		name: "트레일링 공백",
		description: "정확히 일치하는 경우",
		file: "simple-function.ts",
		search: `export function calculateSum(a: number, b: number): number {
	return a + b
}`,
		replace: "REPLACED",
		expectedBaseline: true,
		expectedImproved: true,
	},
	{
		id: 4,
		name: "혼합 들여쓰기",
		description: "AI가 클래스 메서드에서 탭 대신 스페이스 출력",
		file: "indent-variation.ts",
		search: `    add(item: string): void {
        this.data.push(item)
    }`,
		replace: "REPLACED",
		expectedBaseline: false,
		expectedImproved: true,
	},
	{
		id: 5,
		name: "한글 콘텐츠 (정확)",
		description: "한글 주석이 포함된 코드 정확 매칭",
		file: "korean-comments.ts",
		search: `// 사용자 정보를 처리하는 함수
export function processUser(name: string, age: number): string {`,
		replace: "REPLACED",
		expectedBaseline: true,
		expectedImproved: true,
	},
	{
		id: 6,
		name: "한글 + 스페이스 차이",
		description: "한글 코드에서 AI가 탭 대신 스페이스 출력",
		file: "korean-comments.ts",
		search: `// 사용자 정보를 처리하는 함수
export function processUser(name: string, age: number): string {
    // 나이 검증`,
		replace: "REPLACED",
		expectedBaseline: false,
		expectedImproved: true,
	},
	{
		id: 7,
		name: "라인 트림 매칭",
		description: "AI가 함수 전체에서 탭 대신 스페이스 출력",
		file: "whitespace-variation.ts",
		search: `export function processData(input: string): string {
    const trimmed = input.trim()
    const normalized = trimmed.toLowerCase()
    return normalized
}`,
		replace: "REPLACED",
		expectedBaseline: false,
		expectedImproved: true,
	},
	{
		id: 8,
		name: "부분 컨텍스트",
		description: "정확히 일치하는 경우",
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
		expectedBaseline: true,
		expectedImproved: true,
	},
]

async function runBenchmark() {
	console.log("=".repeat(80))
	console.log("F15 SmartEditEngine 벤치마크")
	console.log("=".repeat(80))
	console.log("")
	console.log("비교 대상:")
	console.log("  - Baseline: indexOf (Cline 원본 방식)")
	console.log("  - SmartEditEngine: 9단계 Fuzzy Matching (Careti 개선)")
	console.log("")

	// Load fixture files
	const files = await fs.readdir(FIXTURES_DIR)
	const contents = new Map<string, string>()
	for (const f of files) {
		if (f.endsWith(".ts")) {
			contents.set(f, await fs.readFile(path.join(FIXTURES_DIR, f), "utf-8"))
		}
	}
	console.log(`Fixture 파일 로드: ${contents.size}개`)
	console.log("")

	// Run tests
	const results: Array<{
		id: number
		name: string
		description: string
		baseline: boolean
		improved: boolean
		method?: string
		baselineTimeMs: number
		improvedTimeMs: number
	}> = []

	let baselinePass = 0, improvedPass = 0
	let baselineTotalTime = 0, improvedTotalTime = 0

	for (const test of TEST_CASES) {
		const content = contents.get(test.file)
		if (!content) {
			console.log(`⚠️ 파일 없음: ${test.file}`)
			continue
		}

		const baseline = baselineReplace(content, test.search)
		const improved = improvedReplace(content, test.search, test.replace)

		if (baseline.success) baselinePass++
		if (improved.success) improvedPass++
		baselineTotalTime += baseline.timeMs
		improvedTotalTime += improved.timeMs

		results.push({
			id: test.id,
			name: test.name,
			description: test.description,
			baseline: baseline.success,
			improved: improved.success,
			method: improved.method,
			baselineTimeMs: baseline.timeMs,
			improvedTimeMs: improved.timeMs,
		})
	}

	// Print results
	console.log("## 테스트 결과")
	console.log("")
	console.log("| # | 테스트 | 설명 | Baseline | SmartEditEngine | Replacer |")
	console.log("|---|--------|------|----------|-----------------|----------|")
	for (const r of results) {
		const bIcon = r.baseline ? "✅" : "❌"
		const iIcon = r.improved ? "✅" : "❌"
		console.log(`| ${r.id} | ${r.name} | ${r.description} | ${bIcon} | ${iIcon} | ${r.method || "-"} |`)
	}

	// Summary
	const total = TEST_CASES.length
	const recovered = results.filter(r => !r.baseline && r.improved).length

	console.log("")
	console.log("=".repeat(80))
	console.log("## 요약")
	console.log("=".repeat(80))
	console.log("")
	console.log(`총 테스트: ${total}개`)
	console.log("")
	console.log("### 성공률")
	console.log(`- Baseline (indexOf):  ${baselinePass}/${total} (${(baselinePass / total * 100).toFixed(1)}%)`)
	console.log(`- SmartEditEngine:     ${improvedPass}/${total} (${(improvedPass / total * 100).toFixed(1)}%)`)
	console.log(`- 개선:                +${improvedPass - baselinePass}개 (+${((improvedPass - baselinePass) / total * 100).toFixed(0)}%)`)
	console.log("")

	if (recovered > 0) {
		console.log("### 복구된 케이스")
		const recoveredCases = results.filter(r => !r.baseline && r.improved)
		for (const r of recoveredCases) {
			console.log(`- #${r.id} ${r.name}: ${r.description} → ${r.method}`)
		}
		console.log("")
	}

	console.log("### 처리 시간")
	console.log(`- Baseline 총 시간:      ${baselineTotalTime.toFixed(4)}ms`)
	console.log(`- SmartEditEngine 총 시간: ${improvedTotalTime.toFixed(4)}ms`)
	console.log(`- 차이:                  +${(improvedTotalTime - baselineTotalTime).toFixed(4)}ms`)
	console.log(`- 평균 (1개 테스트):     Baseline ${(baselineTotalTime / total).toFixed(4)}ms, SmartEditEngine ${(improvedTotalTime / total).toFixed(4)}ms`)
	console.log("")
	console.log("=".repeat(80))
}

runBenchmark().catch(console.error)
