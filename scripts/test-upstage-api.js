// CARETI MODIFICATION: Test script for Upstage Solar API integration
// Run: node scripts/test-upstage-api.js

const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2];
        }
    });
}

const UPSTAGE_API_KEY = process.env.UPSTAGE_KEY

if (!UPSTAGE_API_KEY) {
	console.error("❌ UPSTAGE_KEY not found in .env")
	process.exit(1)
}

async function testUpstageAPI() {
	console.log("🚀 Testing Upstage Solar API...")
	console.log("API Key:", UPSTAGE_API_KEY.substring(0, 10) + "..." + UPSTAGE_API_KEY.slice(-4))

	const url = "https://api.upstage.ai/v1/chat/completions"

	const body = {
		model: "solar-pro2",
		messages: [
			{ role: "system", content: "You are a helpful assistant." },
			{ role: "user", content: "Hello! Please respond with 'Upstage Solar is working!' if you can see this message." },
		],
		max_tokens: 100,
		stream: true,
	}

	console.log("\n📤 Request:")
	console.log("URL:", url)
	console.log("Model:", body.model)

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${UPSTAGE_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		})

		console.log("\n📥 Response Status:", response.status, response.statusText)

		if (!response.ok) {
			const errorText = await response.text()
			console.error("❌ API Error:", errorText)
			return false
		}

		// Process SSE streaming response
		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let buffer = ""
		let fullContent = ""

		console.log("\n📝 Streaming Response:")
		process.stdout.write("   ")

		while (true) {
			const { done, value } = await reader.read()
			if (done) break

			buffer += decoder.decode(value, { stream: true })
			const lines = buffer.split("\n")
			buffer = lines.pop() || ""

			for (const line of lines) {
				const trimmed = line.trim()
				if (!trimmed || !trimmed.startsWith("data: ")) continue

				const data = trimmed.slice(6)
				if (data === "[DONE]") continue

				try {
					const json = JSON.parse(data)
					const content = json.choices?.[0]?.delta?.content
					if (content) {
						fullContent += content
						process.stdout.write(content)
					}

					// Check usage in final chunk
					if (json.usage) {
						console.log("\n\n📊 Token Usage:")
						console.log("   Prompt tokens:", json.usage.prompt_tokens)
						console.log("   Completion tokens:", json.usage.completion_tokens)
						console.log("   Total tokens:", json.usage.total_tokens)
					}
				} catch {
					// Ignore parse errors for incomplete chunks
				}
			}
		}

		console.log("\n\n✅ Upstage Solar API test completed successfully!")
		console.log("Full response:", fullContent)
		return true
	} catch (error) {
		console.error("❌ Network Error:", error.message)
		return false
	}
}

// Test non-streaming as well
async function testUpstageAPINoStream() {
	console.log("\n\n🔄 Testing Non-Streaming Mode...")

	const url = "https://api.upstage.ai/v1/chat/completions"

	const body = {
		model: "solar-pro2",
		messages: [
			{ role: "system", content: "You are a helpful assistant." },
			{ role: "user", content: "What is 2 + 2? Answer with just the number." },
		],
		max_tokens: 50,
		stream: false,
	}

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${UPSTAGE_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		})

		console.log("Response Status:", response.status, response.statusText)

		if (!response.ok) {
			const errorText = await response.text()
			console.error("❌ API Error:", errorText)
			return false
		}

		const json = await response.json()
		console.log("Response:", json.choices?.[0]?.message?.content)
		console.log("Token Usage:", json.usage)
		console.log("✅ Non-streaming test passed!")
		return true
	} catch (error) {
		console.error("❌ Error:", error.message)
		return false
	}
}

async function main() {
	console.log("=" .repeat(60))
	console.log("Upstage Solar API Integration Test")
	console.log("=" .repeat(60))

	const streamingResult = await testUpstageAPI()
	const nonStreamingResult = await testUpstageAPINoStream()

	console.log("\n" + "=" .repeat(60))
	console.log("Test Summary:")
	console.log("- Streaming:", streamingResult ? "✅ PASS" : "❌ FAIL")
	console.log("- Non-streaming:", nonStreamingResult ? "✅ PASS" : "❌ FAIL")
	console.log("=" .repeat(60))

	process.exit(streamingResult && nonStreamingResult ? 0 : 1)
}

main()
