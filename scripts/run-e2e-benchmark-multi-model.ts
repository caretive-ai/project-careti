/**
 * Multi-Model E2E Benchmark
 *
 * 10개 테스트 케이스 × 4개 모델 = 40회 테스트
 *
 * 모델:
 * 1. Gemini 2.0 Flash
 * 2. ZAI GLM-4.7
 * 3. Upstage Solar Mini
 * 4. Claude Code CLI
 *
 * 실행:
 * cd /home/luke/dev/project-careti
 * npx ts-node --project ./tsconfig.unit-test.json scripts/run-e2e-benchmark-multi-model.ts
 */

import * as path from "path"
import * as fs from "fs/promises"
import * as fsSync from "fs"
import { execSync } from "child_process"
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
	}
}

const FIXTURES_DIR = path.join(__dirname, "../careti-src/core/editing/__tests__/fixtures/edit-targets")

// API 설정 - 8개 모델 (프로바이더별 최고/최저, 소스 기반)
const MODELS = {
	// ===== Claude (최고/최저) =====
	claude_best: {
		name: "Claude Opus 4.5 (최고)",
		token: "cli",
		url: "cli",
		model: "opus",
		provider: "Claude",
		tier: "best",
	},
	claude_worst: {
		name: "Claude Haiku 4.5 (최저)",
		token: "cli",
		url: "cli",
		model: "haiku",
		provider: "Claude",
		tier: "worst",
	},
	// ===== Gemini (최고/최저) =====
	gemini_best: {
		name: "Gemini 3 Pro (최고)",
		token: process.env.GEMINI_TOKEN,
		url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent",
		model: "gemini-3-pro-preview",
		provider: "Gemini",
		tier: "best",
	},
	gemini_worst: {
		name: "Gemini 2.0 Flash Lite (최저)",
		token: process.env.GEMINI_TOKEN,
		url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent",
		model: "gemini-2.0-flash-lite",
		provider: "Gemini",
		tier: "worst",
	},
	// ===== ZAI (최고/최저) =====
	zai_best: {
		name: "ZAI GLM-4.7 (최고)",
		token: process.env.ZAI_TOKEN,
		url: "https://api.z.ai/api/coding/paas/v4/chat/completions",
		model: "glm-4.7",
		provider: "ZAI",
		tier: "best",
	},
	zai_worst: {
		name: "ZAI GLM-4.5-air (최저)",
		token: process.env.ZAI_TOKEN,
		url: "https://api.z.ai/api/coding/paas/v4/chat/completions",
		model: "glm-4.5-air",
		provider: "ZAI",
		tier: "worst",
	},
	// ===== Upstage (최고/최저) =====
	upstage_best: {
		name: "Upstage Solar Pro2 (최고)",
		token: process.env.UPSTAGE_KEY,
		url: "https://api.upstage.ai/v1/solar/chat/completions",
		model: "solar-pro2",
		provider: "Upstage",
		tier: "best",
	},
	upstage_worst: {
		name: "Upstage Solar Mini (최저)",
		token: process.env.UPSTAGE_KEY,
		url: "https://api.upstage.ai/v1/solar/chat/completions",
		model: "solar-mini",
		provider: "Upstage",
		tier: "worst",
	},
}

// 10개 테스트 케이스
const TEST_CASES = [
	// 기본 공백 차이
	{
		id: 1,
		name: "스페이스 vs 탭",
		file: "simple-function.ts",
		instruction: "calculateSum 함수의 return 문에 console.log 추가",
	},
	{
		id: 2,
		name: "혼합 들여쓰기",
		file: "indent-variation.ts",
		instruction: "add 메서드에 validation 추가",
	},
	{
		id: 3,
		name: "한글 + 공백",
		file: "korean-comments.ts",
		instruction: "processUser 함수에 console.log 추가",
	},
	{
		id: 4,
		name: "라인 트림",
		file: "whitespace-variation.ts",
		instruction: "processData 함수에 null 체크 추가",
	},
	// 유사 이름 혼동
	{
		id: 5,
		name: "getData vs getDataList",
		file: "confusing-names.ts",
		instruction: "getData 함수(getDataList 아님)에 console.log 추가",
	},
	{
		id: 6,
		name: "setData vs setDataList",
		file: "confusing-names.ts",
		instruction: "setData 메서드(setDataList 아님)에 validation 추가",
	},
	{
		id: 7,
		name: "한글 함수명",
		file: "confusing-names.ts",
		instruction: "데이터가져오기 함수(데이터목록가져오기 아님)에 로그 추가",
	},
	// 복잡한 구조
	{
		id: 8,
		name: "클래스 메서드",
		file: "indent-variation.ts",
		instruction: "remove 메서드에 로그 추가",
	},
	{
		id: 9,
		name: "조건문 내부",
		file: "korean-comments.ts",
		instruction: "filterItems 함수의 if 문 안에 로그 추가",
	},
	{
		id: 10,
		name: "멀티라인 함수",
		file: "korean-comments.ts",
		instruction: "calculateAverage 함수의 reduce 전에 로그 추가",
	},
]

// Baseline: indexOf
function baselineMatch(content: string, search: string): boolean {
	return content.indexOf(search) !== -1
}

// SmartEditEngine
function smartMatch(content: string, search: string, replace: string): { success: boolean; method?: string } {
	const result = smartEditEngine.smartReplace(content, search, replace)
	return { success: result.success, method: result.matchedWith }
}

// 통합 API 호출 함수
type ModelKey = keyof typeof MODELS
async function callModel(modelKey: ModelKey, prompt: string): Promise<{ search: string; timeMs: number } | null> {
	const model = MODELS[modelKey]
	if (!model.token) return null

	const start = performance.now()

	try {
		// Claude CLI
		if (model.url === "cli") {
			const escapedPrompt = prompt.replace(/'/g, "'\\''")
			const result = execSync(`echo '${escapedPrompt}' | claude --model ${model.model} --print 2>/dev/null`, {
				timeout: 120000,
				encoding: "utf-8",
				maxBuffer: 1024 * 1024,
			})
			const timeMs = performance.now() - start
			const parsed = parseSearchBlock(result)
			return parsed ? { search: parsed, timeMs } : null
		}

		// Gemini API
		if (modelKey.startsWith("gemini")) {
			const response = await fetch(`${model.url}?key=${model.token}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contents: [{ parts: [{ text: prompt }] }],
					generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
				}),
			})
			const timeMs = performance.now() - start
			if (!response.ok) return null
			const data = await response.json()
			const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
			const parsed = parseSearchBlock(text)
			return parsed ? { search: parsed, timeMs } : null
		}

		// ZAI API
		if (modelKey.startsWith("zai")) {
			const response = await fetch(model.url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${model.token}`,
				},
				body: JSON.stringify({
					model: model.model,
					messages: [{ role: "user", content: prompt }],
					temperature: 0.3,
					max_tokens: 2000,
				}),
			})
			const timeMs = performance.now() - start
			if (!response.ok) return null
			const data = await response.json()
			const text = data.choices?.[0]?.message?.content || ""
			const parsed = parseSearchBlock(text)
			return parsed ? { search: parsed, timeMs } : null
		}

		// Upstage API
		if (modelKey.startsWith("upstage")) {
			const response = await fetch(model.url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${model.token}`,
				},
				body: JSON.stringify({
					model: model.model,
					messages: [{ role: "user", content: prompt }],
					temperature: 0.3,
					max_tokens: 2000,
				}),
			})
			const timeMs = performance.now() - start
			if (!response.ok) return null
			const data = await response.json()
			const text = data.choices?.[0]?.message?.content || ""
			const parsed = parseSearchBlock(text)
			return parsed ? { search: parsed, timeMs } : null
		}

		return null
	} catch { return null }
}

// SEARCH 블록 파싱 - 다양한 형식 지원
function parseSearchBlock(text: string): string | null {
	const patterns = [
		// Cline 형식: <<<<<<< SEARCH ... ======= ... >>>>>>> REPLACE
		/<<<<<<< SEARCH\n([\s\S]*?)\n=======/m,
		// 간단한 형식: SEARCH ... =======
		/SEARCH\n([\s\S]*?)\n=+/m,
		// 코드블록 형식
		/```(?:typescript|ts)?\n([\s\S]*?)\n```/m,
	]
	for (const p of patterns) {
		const m = text.match(p)
		if (m) {
			let result = m[1]
			// 마크다운 코드블록 제거 (중첩된 경우)
			result = result.replace(/^```(?:typescript|ts)?\n?/, "")
			result = result.replace(/\n?```$/, "")
			return result.trim()
		}
	}
	return null
}

// 프롬프트 생성 - Cline 실제 형식과 유사하게
function createPrompt(content: string, instruction: string): string {
	return `You are editing a TypeScript file. To make edits, you need to output a SEARCH/REPLACE block.

The SEARCH block must contain the EXACT code from the file (copy it exactly, including all whitespace and indentation).

FILE CONTENT:
\`\`\`typescript
${content}
\`\`\`

YOUR TASK: ${instruction}

Output format (copy the SEARCH content EXACTLY from the file above):
<<<<<<< SEARCH
[paste the exact original code here - must match the file exactly]
=======
[the modified code]
>>>>>>> REPLACE

IMPORTANT: The SEARCH block must be an EXACT copy from the file. Do not modify it.`
}

interface TestResult {
	testId: number
	testName: string
	model: string
	apiSuccess: boolean
	apiTimeMs: number
	baselineSuccess: boolean
	smartSuccess: boolean
	smartMethod?: string
}

async function runBenchmark() {
	console.log("=".repeat(80))
	console.log("Multi-Model E2E Benchmark")
	console.log("10 테스트 × 8 모델 = 80회")
	console.log("=".repeat(80))
	console.log("")

	// 사용 가능한 모델 확인
	const allModelKeys = Object.keys(MODELS) as ModelKey[]
	const availableModels: ModelKey[] = []

	for (const key of allModelKeys) {
		const model = MODELS[key]
		if (model.url === "cli") {
			// Claude CLI 확인
			try {
				execSync("which claude", { encoding: "utf-8" })
				availableModels.push(key)
			} catch {}
		} else if (model.token) {
			availableModels.push(key)
		}
	}

	console.log(`사용 가능한 모델 (${availableModels.length}개):`)
	for (const key of availableModels) {
		console.log(`  - ${MODELS[key].name}`)
	}
	console.log(`총 테스트 횟수: ${TEST_CASES.length} × ${availableModels.length} = ${TEST_CASES.length * availableModels.length}회`)
	console.log("")

	// 파일 로드
	const files = await fs.readdir(FIXTURES_DIR)
	const contents = new Map<string, string>()
	for (const f of files) {
		if (f.endsWith(".ts")) {
			contents.set(f, await fs.readFile(path.join(FIXTURES_DIR, f), "utf-8"))
		}
	}

	const results: TestResult[] = []
	let testNum = 0
	const totalTests = TEST_CASES.length * availableModels.length

	for (const test of TEST_CASES) {
		const content = contents.get(test.file)
		if (!content) continue

		for (const modelKey of availableModels) {
			testNum++
			const model = MODELS[modelKey]
			console.log(`[${testNum}/${totalTests}] ${test.name} × ${model.name}`)

			const prompt = createPrompt(content, test.instruction)
			const apiResult = await callModel(modelKey, prompt)

			if (!apiResult) {
				console.log(`  ❌ API 실패`)
				results.push({
					testId: test.id,
					testName: test.name,
					model: model.name,
					apiSuccess: false,
					apiTimeMs: 0,
					baselineSuccess: false,
					smartSuccess: false,
				})
				continue
			}

			const baseline = baselineMatch(content, apiResult.search)
			const smart = smartMatch(content, apiResult.search, "REPLACED")

			const bIcon = baseline ? "✅" : "❌"
			const sIcon = smart.success ? "✅" : "❌"
			const recovered = !baseline && smart.success ? " 🎯RECOVERED" : ""
			console.log(`  Baseline: ${bIcon} | SmartEdit: ${sIcon} ${smart.method || ""}${recovered} (${apiResult.timeMs.toFixed(0)}ms)`)

			results.push({
				testId: test.id,
				testName: test.name,
				model: model.name,
				apiSuccess: true,
				apiTimeMs: apiResult.timeMs,
				baselineSuccess: baseline,
				smartSuccess: smart.success,
				smartMethod: smart.method,
			})
		}
	}

	// 결과 요약
	console.log("")
	console.log("=".repeat(80))
	console.log("결과 요약")
	console.log("=".repeat(80))
	console.log("")

	// 모델별 통계
	for (const modelKey of availableModels) {
		const model = MODELS[modelKey as keyof typeof MODELS]
		const modelResults = results.filter(r => r.model === model.name && r.apiSuccess)
		const baselinePass = modelResults.filter(r => r.baselineSuccess).length
		const smartPass = modelResults.filter(r => r.smartSuccess).length
		const recovered = modelResults.filter(r => !r.baselineSuccess && r.smartSuccess).length
		const total = modelResults.length
		const avgTime = modelResults.reduce((sum, r) => sum + r.apiTimeMs, 0) / total

		console.log(`### ${model.name}`)
		console.log(`- 테스트: ${total}개`)
		console.log(`- Baseline 성공: ${baselinePass}/${total} (${((baselinePass/total)*100).toFixed(0)}%)`)
		console.log(`- SmartEdit 성공: ${smartPass}/${total} (${((smartPass/total)*100).toFixed(0)}%)`)
		console.log(`- 복구: ${recovered}개`)
		console.log(`- 평균 응답시간: ${avgTime.toFixed(0)}ms`)
		console.log("")
	}

	// 전체 통계
	const validResults = results.filter(r => r.apiSuccess)
	const totalBaseline = validResults.filter(r => r.baselineSuccess).length
	const totalSmart = validResults.filter(r => r.smartSuccess).length
	const totalRecovered = validResults.filter(r => !r.baselineSuccess && r.smartSuccess).length

	console.log("### 전체 통계")
	console.log(`- 총 테스트: ${validResults.length}회`)
	console.log(`- Baseline 성공: ${totalBaseline}/${validResults.length} (${((totalBaseline/validResults.length)*100).toFixed(0)}%)`)
	console.log(`- SmartEdit 성공: ${totalSmart}/${validResults.length} (${((totalSmart/validResults.length)*100).toFixed(0)}%)`)
	console.log(`- **복구된 케이스: ${totalRecovered}개**`)
	console.log("")

	// 복구된 케이스 상세
	if (totalRecovered > 0) {
		console.log("### 복구된 케이스 상세")
		const recoveredResults = validResults.filter(r => !r.baselineSuccess && r.smartSuccess)
		for (const r of recoveredResults) {
			console.log(`- ${r.testName} × ${r.model}: ${r.smartMethod}`)
		}
	}
}

runBenchmark().catch(console.error)
