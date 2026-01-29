/**
 * 8개 모델 API 호출 확인
 */

import * as fsSync from "fs"
import { execSync } from "child_process"

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

interface ModelConfig {
	name: string
	type: "claude" | "gemini" | "zai" | "upstage"
	model?: string
	url?: string
	token?: string
}

const MODELS: Record<string, ModelConfig> = {
	claude_best: {
		name: "Claude Opus 4.5 (최고)",
		type: "claude",
		model: "opus",
	},
	claude_worst: {
		name: "Claude Haiku 4.5 (최저)",
		type: "claude",
		model: "haiku",
	},
	gemini_best: {
		name: "Gemini 3 Pro (최고)",
		type: "gemini",
		url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent",
		token: process.env.GEMINI_TOKEN,
	},
	gemini_worst: {
		name: "Gemini 2.0 Flash Lite (최저)",
		type: "gemini",
		url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent",
		token: process.env.GEMINI_TOKEN,
	},
	zai_best: {
		name: "ZAI GLM-4.7 (최고)",
		type: "zai",
		model: "glm-4.7",
		token: process.env.ZAI_TOKEN,
	},
	zai_worst: {
		name: "ZAI GLM-4.5-air (최저)",
		type: "zai",
		model: "glm-4.5-air",
		token: process.env.ZAI_TOKEN,
	},
	upstage_best: {
		name: "Upstage Solar Pro2 (최고)",
		type: "upstage",
		model: "solar-pro2",
		token: process.env.UPSTAGE_KEY,
	},
	upstage_worst: {
		name: "Upstage Solar Mini (최저)",
		type: "upstage",
		model: "solar-mini",
		token: process.env.UPSTAGE_KEY,
	},
}

const TEST_PROMPT = "Say 'Hello' in one word."

async function testClaude(model: string): Promise<{ success: boolean; time: number; error?: string }> {
	const start = performance.now()
	try {
		const result = execSync(`echo '${TEST_PROMPT}' | claude --model ${model} --print 2>/dev/null`, {
			timeout: 60000,
			encoding: "utf-8",
			maxBuffer: 1024 * 1024,
		})
		return { success: result.length > 0, time: performance.now() - start }
	} catch (e: any) {
		return { success: false, time: performance.now() - start, error: e.message?.substring(0, 50) }
	}
}

async function testGemini(url: string, token: string): Promise<{ success: boolean; time: number; error?: string }> {
	const start = performance.now()
	try {
		const response = await fetch(`${url}?key=${token}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contents: [{ parts: [{ text: TEST_PROMPT }] }],
				generationConfig: { temperature: 0.1, maxOutputTokens: 10 },
			}),
		})
		const time = performance.now() - start
		if (!response.ok) {
			const text = await response.text()
			return { success: false, time, error: `${response.status}: ${text.substring(0, 80)}` }
		}
		const data = await response.json()
		return { success: !!data.candidates?.[0], time }
	} catch (e: any) {
		return { success: false, time: performance.now() - start, error: e.message?.substring(0, 50) }
	}
}

async function testZai(model: string, token: string): Promise<{ success: boolean; time: number; error?: string }> {
	const start = performance.now()
	try {
		const response = await fetch("https://api.z.ai/api/coding/paas/v4/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			body: JSON.stringify({
				model: model,
				messages: [{ role: "user", content: TEST_PROMPT }],
				temperature: 0.1,
				max_tokens: 10,
			}),
		})
		const time = performance.now() - start
		if (!response.ok) {
			const text = await response.text()
			return { success: false, time, error: `${response.status}: ${text.substring(0, 80)}` }
		}
		const data = await response.json()
		return { success: !!data.choices?.[0], time }
	} catch (e: any) {
		return { success: false, time: performance.now() - start, error: e.message?.substring(0, 50) }
	}
}

async function testUpstage(model: string, token: string): Promise<{ success: boolean; time: number; error?: string }> {
	const start = performance.now()
	try {
		const response = await fetch("https://api.upstage.ai/v1/solar/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`,
			},
			body: JSON.stringify({
				model: model,
				messages: [{ role: "user", content: TEST_PROMPT }],
				temperature: 0.1,
				max_tokens: 10,
			}),
		})
		const time = performance.now() - start
		if (!response.ok) {
			const text = await response.text()
			return { success: false, time, error: `${response.status}: ${text.substring(0, 80)}` }
		}
		const data = await response.json()
		return { success: !!data.choices?.[0], time }
	} catch (e: any) {
		return { success: false, time: performance.now() - start, error: e.message?.substring(0, 50) }
	}
}

async function checkModels() {
	console.log("=".repeat(60))
	console.log("8개 모델 API 호출 확인")
	console.log("=".repeat(60))
	console.log("")

	const results: Array<{ name: string; success: boolean; time: number; error?: string }> = []

	for (const [key, config] of Object.entries(MODELS)) {
		process.stdout.write(`${config.name}... `)

		let result: { success: boolean; time: number; error?: string }

		if (config.type === "claude") {
			result = await testClaude(config.model!)
		} else if (config.type === "gemini") {
			if (!config.token) {
				result = { success: false, time: 0, error: "GEMINI_TOKEN 없음" }
			} else {
				result = await testGemini(config.url!, config.token)
			}
		} else if (config.type === "zai") {
			if (!config.token) {
				result = { success: false, time: 0, error: "ZAI_TOKEN 없음" }
			} else {
				result = await testZai(config.model!, config.token)
			}
		} else if (config.type === "upstage") {
			if (!config.token) {
				result = { success: false, time: 0, error: "UPSTAGE_KEY 없음" }
			} else {
				result = await testUpstage(config.model!, config.token)
			}
		} else {
			result = { success: false, time: 0, error: "알 수 없는 타입" }
		}

		if (result.success) {
			console.log(`✅ (${(result.time / 1000).toFixed(1)}초)`)
		} else {
			console.log(`❌ ${result.error || "실패"}`)
		}

		results.push({ name: config.name, ...result })
	}

	console.log("")
	console.log("=".repeat(60))
	console.log("요약")
	console.log("=".repeat(60))

	const successCount = results.filter(r => r.success).length
	console.log(`성공: ${successCount}/8`)
	console.log("")

	if (successCount < 8) {
		console.log("실패한 모델:")
		for (const r of results.filter(r => !r.success)) {
			console.log(`  - ${r.name}: ${r.error}`)
		}
	}
}

checkModels().catch(console.error)
