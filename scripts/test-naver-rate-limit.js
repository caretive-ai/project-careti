// CARETI MODIFICATION: Test script for Naver Cloud Rate Limit Detection
// Run: node scripts/test-naver-rate-limit.js

const fs = require('fs')
const path = require('path')

// Load .env
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
	fs.readFileSync(envPath, 'utf-8')
		.split('\n')
		.forEach((line) => {
			const match = line.match(/^([^=]+)=(.*)$/)
			if (match && !process.env[match[1]]) {
				process.env[match[1]] = match[2]
			}
		})
}

const NAVER_CLOUD_API_KEY = process.env.NAVER_CLOUD_API_KEY

if (!NAVER_CLOUD_API_KEY) {
	console.error('NAVER_CLOUD_API_KEY not found in .env')
	process.exit(1)
}

const NAVER_CLOUD_BASE_URL = 'https://clovastudio.stream.ntruss.com'

// Models to test
const MODELS = ['HCX-007', 'HCX-005', 'HCX-DASH-002']

// Model-specific request body builder
function buildRequestBody(modelId) {
	const base = {
		messages: [
			{ role: 'system', content: 'You are a helpful assistant. Be very brief.' },
			{ role: 'user', content: 'Say hi' },
		],
		temperature: 0,
	}

	// HCX-007 is a thinking model - uses different parameters
	if (modelId === 'HCX-007') {
		return {
			...base,
			maxCompletionTokens: 100,
			thinking: { effort: 'low' },
		}
	}

	// HCX-005, HCX-DASH-002 use maxTokens
	return {
		...base,
		maxTokens: 10,
	}
}

// Track results
const results = {
	totalRequests: 0,
	successfulRequests: 0,
	rateLimitHits: 0,
	otherErrors: 0,
	timings: [],
	rateLimitDetails: [],
}

async function makeRequest(modelId, requestNum) {
	const startTime = Date.now()

	try {
		const requestBody = buildRequestBody(modelId)
		const response = await fetch(`${NAVER_CLOUD_BASE_URL}/v3/chat-completions/${modelId}`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${NAVER_CLOUD_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		})

		const endTime = Date.now()
		const duration = endTime - startTime
		results.timings.push(duration)
		results.totalRequests++

		// Check rate limit headers
		const headers = {}
		response.headers.forEach((value, key) => {
			if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('limit') || key.toLowerCase().includes('retry')) {
				headers[key] = value
			}
		})

		if (response.status === 429) {
			results.rateLimitHits++
			const retryAfter = response.headers.get('retry-after')
			const errorText = await response.text()

			results.rateLimitDetails.push({
				requestNum,
				modelId,
				status: response.status,
				retryAfter,
				headers,
				error: errorText.substring(0, 200),
				timestamp: new Date().toISOString(),
			})

			console.log(`[${requestNum}] ${modelId} - RATE LIMITED (429) - Retry-After: ${retryAfter}`)
			if (Object.keys(headers).length > 0) {
				console.log(`    Headers: ${JSON.stringify(headers)}`)
			}
			return { success: false, rateLimited: true, duration }
		}

		if (!response.ok) {
			results.otherErrors++
			const errorText = await response.text()

			// Check for rate limit patterns in error message
			if (/too many requests|rate exceeded|rate limit/i.test(errorText)) {
				results.rateLimitHits++
				results.rateLimitDetails.push({
					requestNum,
					modelId,
					status: response.status,
					headers,
					error: errorText.substring(0, 200),
					timestamp: new Date().toISOString(),
				})
				console.log(`[${requestNum}] ${modelId} - RATE LIMITED (${response.status}) - ${errorText.substring(0, 100)}`)
				return { success: false, rateLimited: true, duration }
			}

			console.log(`[${requestNum}] ${modelId} - ERROR ${response.status}: ${errorText.substring(0, 100)}`)
			return { success: false, rateLimited: false, duration }
		}

		results.successfulRequests++
		const body = await response.json()
		const usage = body.result?.usage || body.usage

		console.log(`[${requestNum}] ${modelId} - OK (${duration}ms) - Tokens: ${usage?.totalTokens || 'N/A'}`)

		if (Object.keys(headers).length > 0) {
			console.log(`    Rate Headers: ${JSON.stringify(headers)}`)
		}

		return { success: true, rateLimited: false, duration, usage }
	} catch (error) {
		const endTime = Date.now()
		const duration = endTime - startTime
		results.totalRequests++
		results.otherErrors++

		console.log(`[${requestNum}] ${modelId} - EXCEPTION: ${error.message}`)
		return { success: false, rateLimited: false, duration, error: error.message }
	}
}

async function testBurstRequests(modelId, count, delayMs = 0) {
	console.log(`\n${'='.repeat(60)}`)
	console.log(`Burst Test: ${modelId} - ${count} requests with ${delayMs}ms delay`)
	console.log('='.repeat(60))

	const promises = []

	for (let i = 0; i < count; i++) {
		if (delayMs > 0 && i > 0) {
			await new Promise(resolve => setTimeout(resolve, delayMs))
		}
		promises.push(makeRequest(modelId, i + 1))
	}

	const requestResults = await Promise.all(promises)

	const successful = requestResults.filter(r => r.success).length
	const rateLimited = requestResults.filter(r => r.rateLimited).length
	const avgDuration = requestResults.reduce((sum, r) => sum + r.duration, 0) / requestResults.length

	console.log(`\nSummary: ${successful}/${count} successful, ${rateLimited} rate limited, avg ${avgDuration.toFixed(0)}ms`)

	return { successful, rateLimited, avgDuration }
}

async function testSequentialRequests(modelId, count, delayMs = 100) {
	console.log(`\n${'='.repeat(60)}`)
	console.log(`Sequential Test: ${modelId} - ${count} requests with ${delayMs}ms delay`)
	console.log('='.repeat(60))

	const requestResults = []

	for (let i = 0; i < count; i++) {
		const result = await makeRequest(modelId, i + 1)
		requestResults.push(result)

		if (result.rateLimited) {
			console.log(`Rate limit hit at request ${i + 1}, stopping test`)
			break
		}

		if (delayMs > 0 && i < count - 1) {
			await new Promise(resolve => setTimeout(resolve, delayMs))
		}
	}

	const successful = requestResults.filter(r => r.success).length
	const rateLimited = requestResults.filter(r => r.rateLimited).length
	const avgDuration = requestResults.reduce((sum, r) => sum + r.duration, 0) / requestResults.length

	console.log(`\nSummary: ${successful}/${requestResults.length} successful, ${rateLimited} rate limited, avg ${avgDuration.toFixed(0)}ms`)

	return { successful, rateLimited, avgDuration, total: requestResults.length }
}

async function main() {
	console.log('='.repeat(60))
	console.log('Naver Cloud Rate Limit Test')
	console.log('='.repeat(60))
	console.log('API Key:', NAVER_CLOUD_API_KEY.substring(0, 10) + '...')
	console.log('Base URL:', NAVER_CLOUD_BASE_URL)
	console.log('Start Time:', new Date().toISOString())

	const testResults = {}

	// Test 1: Burst requests (parallel) - 5 requests at once
	console.log('\n\n*** TEST 1: PARALLEL BURST (5 requests at once) ***')
	for (const model of MODELS) {
		testResults[`${model}_burst_5`] = await testBurstRequests(model, 5, 0)
		await new Promise(resolve => setTimeout(resolve, 2000)) // Wait between models
	}

	// Test 2: Burst requests (parallel) - 10 requests at once
	console.log('\n\n*** TEST 2: PARALLEL BURST (10 requests at once) ***')
	for (const model of MODELS) {
		testResults[`${model}_burst_10`] = await testBurstRequests(model, 10, 0)
		await new Promise(resolve => setTimeout(resolve, 2000))
	}

	// Test 3: Sequential rapid requests - no delay
	console.log('\n\n*** TEST 3: SEQUENTIAL RAPID (no delay, max 20) ***')
	for (const model of MODELS) {
		testResults[`${model}_seq_rapid`] = await testSequentialRequests(model, 20, 0)
		await new Promise(resolve => setTimeout(resolve, 2000))
	}

	// Test 4: Sequential with small delay - 100ms
	console.log('\n\n*** TEST 4: SEQUENTIAL WITH 100ms DELAY (max 10) ***')
	for (const model of MODELS) {
		testResults[`${model}_seq_100ms`] = await testSequentialRequests(model, 10, 100)
		await new Promise(resolve => setTimeout(resolve, 2000))
	}

	// Final Summary
	console.log('\n\n' + '='.repeat(60))
	console.log('FINAL SUMMARY')
	console.log('='.repeat(60))
	console.log('End Time:', new Date().toISOString())
	console.log('\nOverall Statistics:')
	console.log(`- Total Requests: ${results.totalRequests}`)
	console.log(`- Successful: ${results.successfulRequests}`)
	console.log(`- Rate Limited: ${results.rateLimitHits}`)
	console.log(`- Other Errors: ${results.otherErrors}`)

	if (results.timings.length > 0) {
		const avgTiming = results.timings.reduce((a, b) => a + b, 0) / results.timings.length
		const minTiming = Math.min(...results.timings)
		const maxTiming = Math.max(...results.timings)
		console.log(`\nResponse Times:`)
		console.log(`- Average: ${avgTiming.toFixed(0)}ms`)
		console.log(`- Min: ${minTiming}ms`)
		console.log(`- Max: ${maxTiming}ms`)
	}

	if (results.rateLimitDetails.length > 0) {
		console.log('\nRate Limit Details:')
		for (const detail of results.rateLimitDetails) {
			console.log(`- Request ${detail.requestNum} (${detail.modelId}): Status ${detail.status}, Retry-After: ${detail.retryAfter || 'N/A'}`)
		}
	}

	console.log('\nPer-Test Results:')
	for (const [testName, result] of Object.entries(testResults)) {
		console.log(`- ${testName}: ${result.successful}/${result.total || (result.successful + result.rateLimited)} OK, ${result.rateLimited} rate limited`)
	}

	console.log('\n' + '='.repeat(60))

	// Conclusion
	if (results.rateLimitHits > 0) {
		console.log('\n*** RATE LIMITING DETECTED ***')
		console.log('네이버클라우드 API에 속도 제한이 있습니다.')
	} else {
		console.log('\n*** NO RATE LIMITING DETECTED ***')
		console.log('테스트 범위 내에서 속도 제한이 감지되지 않았습니다.')
	}
}

main().catch(console.error)
