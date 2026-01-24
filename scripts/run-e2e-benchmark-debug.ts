/**
 * Debug Benchmark - AI 출력 확인용
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
	}
}

const FIXTURES_DIR = path.join(__dirname, "../careti-src/core/editing/__tests__/fixtures/edit-targets")
const GEMINI_TOKEN = process.env.GEMINI_TOKEN
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

// 실패했던 테스트 케이스만 확인
const FAILED_TESTS = [
	{
		id: 4,
		name: "라인 트림",
		file: "whitespace-variation.ts",
		instruction: "processData 함수에 null 체크 추가",
	},
	{
		id: 8,
		name: "클래스 메서드",
		file: "indent-variation.ts",
		instruction: "remove 메서드에 로그 추가",
	},
]

async function callGemini(prompt: string): Promise<string | null> {
	if (!GEMINI_TOKEN) return null
	try {
		const response = await fetch(`${GEMINI_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
			}),
		})
		if (!response.ok) return null
		const data = await response.json()
		return data.candidates?.[0]?.content?.parts?.[0]?.text || null
	} catch { return null }
}

function createPrompt(content: string, instruction: string): string {
	return `Edit this TypeScript file. Output ONLY the SEARCH block (the exact code to find).

FILE:
\`\`\`typescript
${content}
\`\`\`

TASK: ${instruction}

Output format:
SEARCH
[exact code to find]
=======`
}

async function debug() {
	console.log("=".repeat(80))
	console.log("Debug: AI 출력 확인")
	console.log("=".repeat(80))
	console.log("")

	const files = await fs.readdir(FIXTURES_DIR)
	const contents = new Map<string, string>()
	for (const f of files) {
		if (f.endsWith(".ts")) {
			contents.set(f, await fs.readFile(path.join(FIXTURES_DIR, f), "utf-8"))
		}
	}

	for (const test of FAILED_TESTS) {
		console.log(`\n${"=".repeat(80)}`)
		console.log(`테스트: ${test.name}`)
		console.log(`파일: ${test.file}`)
		console.log(`지시: ${test.instruction}`)
		console.log("=".repeat(80))

		const content = contents.get(test.file)
		if (!content) continue

		console.log("\n### 원본 파일 내용:")
		console.log("```")
		console.log(content)
		console.log("```")

		const prompt = createPrompt(content, test.instruction)
		console.log("\n### AI에게 보낸 프롬프트:")
		console.log("```")
		console.log(prompt.substring(0, 500) + "...")
		console.log("```")

		const response = await callGemini(prompt)
		console.log("\n### AI 응답 (전체):")
		console.log("```")
		console.log(response)
		console.log("```")

		if (response) {
			// SEARCH 블록 파싱 시도
			const patterns = [
				/SEARCH\n([\s\S]*?)\n=+/m,
				/```(?:typescript|ts)?\n([\s\S]*?)\n```/m,
			]
			let parsed = null
			for (const p of patterns) {
				const m = response.match(p)
				if (m) {
					parsed = m[1]
					break
				}
			}

			if (parsed) {
				console.log("\n### 파싱된 SEARCH 블록:")
				console.log("```")
				console.log(parsed)
				console.log("```")

				// indexOf 확인
				const indexOfResult = content.indexOf(parsed)
				console.log(`\n### indexOf 결과: ${indexOfResult !== -1 ? "✅ 찾음 (위치: " + indexOfResult + ")" : "❌ 못찾음"}`)

				// SmartEditEngine 확인
				const smartResult = smartEditEngine.smartReplace(content, parsed, "REPLACED")
				console.log(`### SmartEdit 결과: ${smartResult.success ? "✅ 성공 (" + smartResult.matchedWith + ")" : "❌ 실패"}`)

				if (!smartResult.success) {
					console.log("\n### 왜 실패했는지 분석:")
					// 라인별 비교
					const parsedLines = parsed.split("\n")
					const contentLines = content.split("\n")

					console.log(`- SEARCH 블록 라인 수: ${parsedLines.length}`)
					console.log(`- 파일 라인 수: ${contentLines.length}`)

					// 첫 줄이 파일에 있는지 확인
					const firstLine = parsedLines[0].trim()
					const matchingLines = contentLines.filter(l => l.trim() === firstLine)
					console.log(`- 첫 줄 "${firstLine.substring(0, 50)}..." 일치 개수: ${matchingLines.length}`)
				}
			} else {
				console.log("\n### ❌ SEARCH 블록 파싱 실패")
			}
		}
	}
}

debug().catch(console.error)
