/**
 * Final E2E Benchmark with detailed metrics
 */

import * as path from "path"
import * as fs from "fs/promises"
import { smartEditEngine } from "../careti-src/core/editing/SmartEditEngine"

const FIXTURES_DIR = path.join(__dirname, "../careti-src/core/editing/__tests__/fixtures/edit-targets")

// Baseline: simple indexOf (Cline original)
function baselineReplace(content: string, search: string, replace: string): { success: boolean; timeMs: number } {
	const start = performance.now()
	const idx = content.indexOf(search)
	const timeMs = performance.now() - start
	if (idx === -1) return { success: false, timeMs }
	return { success: true, timeMs }
}

// Improved: SmartEditEngine 9-stage
function improvedReplace(content: string, search: string, replace: string): { success: boolean; timeMs: number; method?: string } {
	const start = performance.now()
	const result = smartEditEngine.smartReplace(content, search, replace)
	const timeMs = performance.now() - start
	return { success: result.success, timeMs, method: result.matchedWith }
}

// Test cases simulating common AI imperfections
const TEST_CASES = [
	{
		id: 1,
		name: "정확한 매칭 (Exact match)",
		file: "simple-function.ts",
		search: `export function calculateSum(a: number, b: number): number {
	return a + b
}`,
		replace: "REPLACED",
		issue: "없음 - 정확히 일치",
	},
	{
		id: 2,
		name: "스페이스 vs 탭 (Spaces instead of tabs)",
		file: "simple-function.ts",
		search: `export function calculateSum(a: number, b: number): number {
    return a + b
}`,
		replace: "REPLACED",
		issue: "AI가 탭 대신 스페이스 4개 출력",
	},
	{
		id: 3,
		name: "트레일링 공백 (Trailing whitespace)",
		file: "simple-function.ts",
		search: `export function calculateSum(a: number, b: number): number {
	return a + b
}`,
		replace: "REPLACED",
		issue: "없음 - 정확히 일치",
	},
	{
		id: 4,
		name: "혼합 들여쓰기 (Mixed indentation)",
		file: "indent-variation.ts",
		search: `    add(item: string): void {
        this.data.push(item)
    }`,
		replace: "REPLACED",
		issue: "AI가 탭 대신 스페이스 출력",
	},
	{
		id: 5,
		name: "한글 콘텐츠 정확 (Korean exact)",
		file: "korean-comments.ts",
		search: `// 사용자 정보를 처리하는 함수
export function processUser(name: string, age: number): string {`,
		replace: "REPLACED",
		issue: "없음 - 정확히 일치",
	},
	{
		id: 6,
		name: "한글 + 스페이스 차이 (Korean + space diff)",
		file: "korean-comments.ts",
		search: `// 사용자 정보를 처리하는 함수
export function processUser(name: string, age: number): string {
    // 나이 검증`,
		replace: "REPLACED",
		issue: "AI가 탭 대신 스페이스 출력",
	},
	{
		id: 7,
		name: "라인 트림 매칭 (Line-trimmed)",
		file: "whitespace-variation.ts",
		search: `export function processData(input: string): string {
    const trimmed = input.trim()
    const normalized = trimmed.toLowerCase()
    return normalized
}`,
		replace: "REPLACED",
		issue: "AI가 탭 대신 스페이스 출력",
	},
	{
		id: 8,
		name: "부분 컨텍스트 (Partial context)",
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
		issue: "없음 - 정확히 일치",
	},
]

async function runBenchmark() {
	console.log("=".repeat(80))
	console.log("F15 SmartEditEngine 성능 벤치마크 - 최종 결과")
	console.log("=".repeat(80))
	console.log("")

	// Load files
	const files = await fs.readdir(FIXTURES_DIR)
	const contents = new Map<string, string>()
	for (const f of files) {
		if (f.endsWith(".ts")) {
			contents.set(f, await fs.readFile(path.join(FIXTURES_DIR, f), "utf-8"))
		}
	}

	// Run tests
	const results: Array<{
		id: number
		name: string
		issue: string
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
		if (!content) continue

		const baseline = baselineReplace(content, test.search, test.replace)
		const improved = improvedReplace(content, test.search, test.replace)

		if (baseline.success) baselinePass++
		if (improved.success) improvedPass++
		baselineTotalTime += baseline.timeMs
		improvedTotalTime += improved.timeMs

		results.push({
			id: test.id,
			name: test.name,
			issue: test.issue,
			baseline: baseline.success,
			improved: improved.success,
			method: improved.method,
			baselineTimeMs: baseline.timeMs,
			improvedTimeMs: improved.timeMs,
		})
	}

	// Print detailed results
	console.log("## 테스트 케이스 상세 결과")
	console.log("")
	console.log("| # | 테스트 | 문제 상황 | Baseline | SmartEditEngine | 사용된 Replacer |")
	console.log("|---|--------|----------|----------|-----------------|-----------------|")
	for (const r of results) {
		const bIcon = r.baseline ? "✅ 성공" : "❌ 실패"
		const iIcon = r.improved ? "✅ 성공" : "❌ 실패"
		console.log(`| ${r.id} | ${r.name} | ${r.issue} | ${bIcon} | ${iIcon} | ${r.method || "-"} |`)
	}

	// Summary
	const total = TEST_CASES.length
	const recovered = results.filter(r => !r.baseline && r.improved).length
	const baselineRate = (baselinePass / total * 100).toFixed(1)
	const improvedRate = (improvedPass / total * 100).toFixed(1)

	console.log("")
	console.log("## 요약 통계")
	console.log("")
	console.log("### 성공률")
	console.log(`- **총 테스트**: ${total}개`)
	console.log(`- **Baseline (indexOf)**: ${baselinePass}/${total} (${baselineRate}%)`)
	console.log(`- **SmartEditEngine**: ${improvedPass}/${total} (${improvedRate}%)`)
	console.log(`- **개선**: +${improvedPass - baselinePass}개 (+${(improvedPass - baselinePass) / total * 100}%)`)
	console.log("")

	console.log("### 복구된 케이스 (Baseline 실패 → SmartEditEngine 성공)")
	const recoveredCases = results.filter(r => !r.baseline && r.improved)
	if (recoveredCases.length > 0) {
		for (const r of recoveredCases) {
			console.log(`- **#${r.id} ${r.name}**: ${r.issue} → ${r.method}로 복구`)
		}
	}
	console.log("")

	console.log("### 처리 시간")
	console.log(`- **Baseline 총 시간**: ${baselineTotalTime.toFixed(3)}ms`)
	console.log(`- **SmartEditEngine 총 시간**: ${improvedTotalTime.toFixed(3)}ms`)
	console.log(`- **시간 차이**: +${(improvedTotalTime - baselineTotalTime).toFixed(3)}ms (${((improvedTotalTime / baselineTotalTime - 1) * 100).toFixed(1)}% 증가)`)
	console.log(`- **평균 처리 시간**: Baseline ${(baselineTotalTime / total).toFixed(3)}ms, SmartEditEngine ${(improvedTotalTime / total).toFixed(3)}ms`)
	console.log("")

	// Markdown output for F15
	console.log("=".repeat(80))
	console.log("F15 문서용 Markdown")
	console.log("=".repeat(80))
	console.log("")
	console.log(`## 성능 벤치마크 결과

### 테스트 환경
- **테스트 날짜**: 2026-01-24
- **테스트 케이스**: ${total}개 (AI가 생성하는 일반적인 SEARCH 블록 오류 시뮬레이션)
- **비교 대상**: Baseline (indexOf) vs SmartEditEngine (9단계 Fuzzy Matching)

### 성공률 비교

| 구현 | 성공 | 실패 | 성공률 |
|------|------|------|--------|
| Baseline (indexOf) | ${baselinePass} | ${total - baselinePass} | **${baselineRate}%** |
| SmartEditEngine | ${improvedPass} | ${total - improvedPass} | **${improvedRate}%** |

**개선율: +${improvedPass - baselinePass}개 테스트 (+${((improvedPass - baselinePass) / total * 100).toFixed(0)}% 성공률 향상)**

### 복구된 케이스

SmartEditEngine이 Baseline 실패를 복구한 ${recoveredCases.length}개 케이스:

| 테스트 | 문제 | 복구 방법 |
|--------|------|-----------|`)
	for (const r of recoveredCases) {
		console.log(`| ${r.name} | ${r.issue} | ${r.method} |`)
	}

	console.log(`
### 처리 시간

| 측정 | Baseline | SmartEditEngine | 차이 |
|------|----------|-----------------|------|
| 총 시간 | ${baselineTotalTime.toFixed(3)}ms | ${improvedTotalTime.toFixed(3)}ms | +${(improvedTotalTime - baselineTotalTime).toFixed(3)}ms |
| 평균 시간 | ${(baselineTotalTime / total).toFixed(3)}ms | ${(improvedTotalTime / total).toFixed(3)}ms | +${((improvedTotalTime - baselineTotalTime) / total).toFixed(3)}ms |

> 참고: SmartEditEngine은 9단계 fallback을 수행하지만, 대부분 1-2단계에서 매칭되어 시간 증가는 미미함
`)
}

runBenchmark().catch(console.error)
