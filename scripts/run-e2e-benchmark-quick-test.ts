/**
 * Quick test - 프롬프트/파싱 확인용 (1개 모델, 2개 테스트)
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

function parseSearchBlock(text: string): string | null {
	const patterns = [
		/<<<<<<< SEARCH\n([\s\S]*?)\n=======/m,
		/SEARCH\n([\s\S]*?)\n=+/m,
		/```(?:typescript|ts)?\n([\s\S]*?)\n```/m,
	]
	for (const p of patterns) {
		const m = text.match(p)
		if (m) {
			let result = m[1]
			result = result.replace(/^```(?:typescript|ts)?\n?/, "")
			result = result.replace(/\n?```$/, "")
			return result.trim()
		}
	}
	return null
}

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

async function quickTest() {
	console.log("=".repeat(60))
	console.log("Quick Test: 프롬프트/파싱 확인")
	console.log("=".repeat(60))
	console.log("")

	const content = await fs.readFile(path.join(FIXTURES_DIR, "simple-function.ts"), "utf-8")

	console.log("### 파일 내용 (탭 표시):")
	console.log(content.replace(/\t/g, "→TAB→"))
	console.log("")

	const prompt = createPrompt(content, "calculateSum 함수에 console.log 추가")
	console.log("### AI에게 보낸 프롬프트 (일부):")
	console.log(prompt.substring(0, 300) + "...")
	console.log("")

	console.log("### AI 호출 중...")
	const response = await callGemini(prompt)

	if (!response) {
		console.log("❌ API 실패")
		return
	}

	console.log("### AI 응답 (전체):")
	console.log("-".repeat(40))
	console.log(response)
	console.log("-".repeat(40))
	console.log("")

	const parsed = parseSearchBlock(response)
	if (!parsed) {
		console.log("❌ 파싱 실패")
		return
	}

	console.log("### 파싱된 SEARCH 블록:")
	console.log("-".repeat(40))
	console.log(parsed)
	console.log("-".repeat(40))
	console.log("")

	console.log("### 들여쓰기 확인:")
	console.log("파일 원본 (탭):", content.includes("\t") ? "✅ 탭 사용" : "스페이스")
	console.log("AI 출력:", parsed.includes("\t") ? "탭 사용" : "❌ 스페이스 사용 (탭 아님)")
	console.log("")

	const indexOfResult = content.indexOf(parsed)
	console.log("### indexOf 결과:", indexOfResult !== -1 ? "✅ 찾음" : "❌ 못찾음")

	const smartResult = smartEditEngine.smartReplace(content, parsed, "REPLACED")
	console.log("### SmartEdit 결과:", smartResult.success ? `✅ 성공 (${smartResult.matchedWith})` : "❌ 실패")

	if (indexOfResult === -1 && smartResult.success) {
		console.log("")
		console.log("🎯 SmartEditEngine이 복구함!")
	}
}

quickTest().catch(console.error)
