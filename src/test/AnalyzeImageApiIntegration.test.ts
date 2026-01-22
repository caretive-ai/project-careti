// CARETI MODIFICATION: Integration test for Analyze Image API with actual Gemini API calls
// This test requires GEMINI_TOKEN in .env file
// Run with: npm run test:integration -- --grep "Analyze Image API"

import { expect } from "chai"
import * as fs from "fs"
import { before, describe, it } from "mocha"
import * as path from "path"
import sharp from "sharp"

// Load .env manually (avoid dotenv dependency)
const envPath = path.resolve(__dirname, "../../.env")
if (fs.existsSync(envPath)) {
	const envContent = fs.readFileSync(envPath, "utf-8")
	envContent.split("\n").forEach((line) => {
		const match = line.match(/^([^=]+)=(.*)$/)
		if (match && !process.env[match[1]]) {
			process.env[match[1]] = match[2]
		}
	})
}

const GEMINI_TOKEN = process.env.GEMINI_TOKEN
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

// Skip tests if no token
const describeWithToken = GEMINI_TOKEN ? describe : describe.skip

describeWithToken("Analyze Image API Integration", function () {
	// Increase timeout for API calls
	this.timeout(30000)

	let testImageDataUrl: string

	before(async () => {
		// Create a simple test image with text-like pattern
		const imageBuffer = await sharp({
			create: {
				width: 200,
				height: 100,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			},
		})
			.composite([
				{
					input: Buffer.from(
						`<svg width="200" height="100">
							<rect width="200" height="100" fill="white"/>
							<text x="20" y="50" font-size="24" fill="black">Hello Test</text>
							<circle cx="150" cy="50" r="30" fill="blue"/>
						</svg>`,
					),
					top: 0,
					left: 0,
				},
			])
			.png()
			.toBuffer()

		testImageDataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`
		console.log(`Test image created: ${testImageDataUrl.length} chars`)
	})

	it("should analyze image and return description via Gemini API", async () => {
		const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								inlineData: {
									mimeType: "image/png",
									data: testImageDataUrl.split(",")[1],
								},
							},
							{
								text: "Describe what you see in this image. Include any text and shapes.",
							},
						],
					},
				],
			}),
		})

		expect(response.ok, `API call failed: ${response.status} ${response.statusText}`).to.be.true

		const result = await response.json()
		console.log("Gemini response:", JSON.stringify(result, null, 2))

		expect(result.candidates).to.be.an("array").with.length.greaterThan(0)
		expect(result.candidates[0].content.parts[0].text).to.be.a("string")

		const analysisText = result.candidates[0].content.parts[0].text.toLowerCase()
		// Should detect the blue circle or some visual elements
		expect(analysisText.length).to.be.greaterThan(10)
	})

	it("should handle large images (1000x1000px)", async function () {
		this.timeout(60000)

		// Create a larger test image
		const largeImageBuffer = await sharp({
			create: {
				width: 1000,
				height: 1000,
				channels: 3,
				background: { r: 100, g: 150, b: 200 },
			},
		})
			.png()
			.toBuffer()

		const largeImageDataUrl = `data:image/png;base64,${largeImageBuffer.toString("base64")}`
		console.log(`Large image size: ${largeImageDataUrl.length} chars (${Math.round(largeImageBuffer.length / 1024)}KB)`)

		const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								inlineData: {
									mimeType: "image/png",
									data: largeImageDataUrl.split(",")[1],
								},
							},
							{
								text: "What color is this image?",
							},
						],
					},
				],
			}),
		})

		expect(response.ok, `API call failed: ${response.status}`).to.be.true

		const result = await response.json()
		expect(result.candidates).to.be.an("array").with.length.greaterThan(0)

		const analysisText = result.candidates[0].content.parts[0].text.toLowerCase()
		// Should detect blue color
		expect(analysisText).to.match(/blue|cyan|sky|light/i)
	})

	it("should return error for invalid API key", async () => {
		const response = await fetch(`${GEMINI_API_URL}?key=INVALID_KEY`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: "Hello",
							},
						],
					},
				],
			}),
		})

		expect(response.ok).to.be.false
		expect(response.status).to.be.oneOf([400, 401, 403])
	})
})

// Test without image - just text to verify API connectivity
describeWithToken("Gemini API Connectivity", function () {
	this.timeout(15000)

	it("should respond to simple text prompt", async () => {
		const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_TOKEN}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: "Reply with exactly: OK",
							},
						],
					},
				],
			}),
		})

		expect(response.ok).to.be.true

		const result = await response.json()
		expect(result.candidates[0].content.parts[0].text).to.include("OK")
	})
})

// ============================================================================
// Careti API Tests (uses CARET_KEY to access Gemini via Careti proxy)
// ============================================================================

const CARET_KEY = process.env.CARET_KEY
const CARET_API_URL = "https://api.careti.ai/v1/chat/completions"

const describeWithCaretKey = CARET_KEY ? describe : describe.skip

describeWithCaretKey("Careti API Integration (Gemini via proxy)", function () {
	this.timeout(60000)

	let testImageDataUrl: string

	before(async () => {
		// Create test image
		const imageBuffer = await sharp({
			create: {
				width: 200,
				height: 100,
				channels: 4,
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			},
		})
			.composite([
				{
					input: Buffer.from(
						`<svg width="200" height="100">
							<rect width="200" height="100" fill="white"/>
							<text x="20" y="50" font-size="24" fill="black">Careti Test</text>
							<rect x="140" y="20" width="50" height="60" fill="red"/>
						</svg>`,
					),
					top: 0,
					left: 0,
				},
			])
			.png()
			.toBuffer()

		testImageDataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`
	})

	it("should analyze image via Careti API (OpenAI-compatible format)", async () => {
		const response = await fetch(CARET_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-AnyLLM-Key": `Bearer ${CARET_KEY}`,
			},
			body: JSON.stringify({
				model: "gemini/gemini-2.5-flash",
				messages: [
					{
						role: "user",
						content: [
							{
								type: "image_url",
								image_url: {
									url: testImageDataUrl,
								},
							},
							{
								type: "text",
								text: "Describe what you see in this image briefly.",
							},
						],
					},
				],
				max_tokens: 1024,
			}),
		})

		console.log("Careti API response status:", response.status)

		if (!response.ok) {
			const errorText = await response.text()
			console.error("Error response:", errorText)
		}

		expect(response.ok, `Careti API call failed: ${response.status}`).to.be.true

		const result = await response.json()
		console.log("Careti API result:", JSON.stringify(result, null, 2))

		expect(result.choices).to.be.an("array").with.length.greaterThan(0)
		expect(result.choices[0].message.content).to.be.a("string")
		expect(result.choices[0].message.content.length).to.be.greaterThan(10)
	})

	it("should handle text-only requests via Careti API", async () => {
		const response = await fetch(CARET_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-AnyLLM-Key": `Bearer ${CARET_KEY}`,
			},
			body: JSON.stringify({
				model: "gemini/gemini-2.5-flash",
				messages: [
					{
						role: "user",
						content: "Reply with exactly one word: PONG",
					},
				],
				max_tokens: 10,
			}),
		})

		expect(response.ok).to.be.true

		const result = await response.json()
		expect(result.choices[0].message.content.toUpperCase()).to.include("PONG")
	})

	it("should test with larger image (746KB equivalent)", async function () {
		this.timeout(90000)

		// Create image similar to luke3.png size (573x736)
		const largeImageBuffer = await sharp({
			create: {
				width: 573,
				height: 736,
				channels: 4,
				background: { r: 200, g: 180, b: 160, alpha: 1 },
			},
		})
			.png()
			.toBuffer()

		const largeImageDataUrl = `data:image/png;base64,${largeImageBuffer.toString("base64")}`
		console.log(`Test image size: ${Math.round(largeImageBuffer.length / 1024)}KB, ${largeImageDataUrl.length} chars`)

		const response = await fetch(CARET_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-AnyLLM-Key": `Bearer ${CARET_KEY}`,
			},
			body: JSON.stringify({
				model: "gemini/gemini-2.5-flash",
				messages: [
					{
						role: "user",
						content: [
							{
								type: "image_url",
								image_url: {
									url: largeImageDataUrl,
								},
							},
							{
								type: "text",
								text: "What color is this image?",
							},
						],
					},
				],
				max_tokens: 100,
			}),
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error("Large image error:", response.status, errorText)
		}

		expect(response.ok, `Large image failed with status ${response.status}`).to.be.true

		const result = await response.json()
		expect(result.choices[0].message.content).to.be.a("string")
	})
})
