// CARETI MODIFICATION: Test script for Naver Cloud HyperCLOVA X Tool Calling
// Run: node scripts/test-naver-tool-calling.js

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
const MODEL_ID = 'HCX-005' // Use HCX-005 for tool calling tests

// Tool definitions (OpenAI format)
const tools = [
	{
		type: 'function',
		function: {
			name: 'get_weather',
			description: 'Get the current weather for a specific location',
			parameters: {
				type: 'object',
				properties: {
					location: {
						type: 'string',
						description: 'City name (e.g., Seoul, Tokyo, New York)',
					},
					unit: {
						type: 'string',
						enum: ['celsius', 'fahrenheit'],
						description: 'Temperature unit',
					},
				},
				required: ['location'],
			},
		},
	},
	{
		type: 'function',
		function: {
			name: 'search_files',
			description: 'Search for files in a directory',
			parameters: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'Search query or keyword',
					},
					path: {
						type: 'string',
						description: 'Directory path to search in',
					},
				},
				required: ['query'],
			},
		},
	},
]

// Simulated tool execution
function executeToolCall(name, args) {
	console.log(`\n[Tool Execution] ${name}(${JSON.stringify(args)})`)

	if (name === 'get_weather') {
		const weather = {
			location: args.location,
			temperature: 15,
			unit: args.unit || 'celsius',
			condition: 'Partly cloudy',
			humidity: 65,
		}
		return JSON.stringify(weather)
	}

	if (name === 'search_files') {
		const results = [
			{ file: `${args.path || 'src'}/naver-cloud.ts`, matches: 3 },
			{ file: `${args.path || 'src'}/api-handler.ts`, matches: 1 },
		]
		return JSON.stringify(results)
	}

	return JSON.stringify({ error: 'Unknown tool' })
}

// Parse SSE event
function parseSSEEvent(rawEvent) {
	const lines = rawEvent.split('\n')
	let eventType = ''
	const dataLines = []

	for (const line of lines) {
		const trimmed = line.replace(/\r$/, '')
		if (trimmed.startsWith('event:')) {
			eventType = trimmed.slice('event:'.length).trim()
		} else if (trimmed.startsWith('data:')) {
			dataLines.push(trimmed.slice('data:'.length).trim())
		}
	}

	const dataString = dataLines.join('\n')
	if (!dataString || dataString === '[DONE]') {
		return null
	}

	try {
		return { eventType, data: JSON.parse(dataString) }
	} catch {
		return null
	}
}

// Process streaming response
async function processStream(response) {
	const reader = response.body.getReader()
	const decoder = new TextDecoder()
	let buffer = ''

	const result = {
		content: '',
		reasoning: '',
		toolCalls: [],
		usage: null,
	}

	// Track accumulated tool call state
	const toolCallState = {}

	while (true) {
		const { done, value } = await reader.read()
		if (done) break

		buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')

		let separatorIndex = buffer.indexOf('\n\n')
		while (separatorIndex !== -1) {
			const rawEvent = buffer.slice(0, separatorIndex)
			buffer = buffer.slice(separatorIndex + 2)

			if (rawEvent.trim().length > 0) {
				const parsed = parseSSEEvent(rawEvent)
				if (parsed) {
					const { eventType, data } = parsed

					if (data.status?.code && data.status.code !== '20000') {
						throw new Error(`API Error: ${data.status.message || data.status.code}`)
					}

					if (eventType === 'token') {
						// Text content
						if (data.message?.content) {
							result.content += data.message.content
							process.stdout.write(data.message.content)
						}

						// Thinking content
						if (data.message?.thinkingContent) {
							result.reasoning += data.message.thinkingContent
						}

						// Tool calls (Naver Cloud uses toolCalls, not tool_calls)
						const toolCalls = data.message?.toolCalls || data.message?.tool_calls
						if (Array.isArray(toolCalls)) {
							for (let i = 0; i < toolCalls.length; i++) {
								const toolCall = toolCalls[i]
								const index = toolCall.index ?? i

								// Initialize state for new tool call
								if (!toolCallState[index]) {
									toolCallState[index] = { id: '', name: '', arguments: '' }
								}

								// Accumulate tool call data
								if (toolCall.id) {
									toolCallState[index].id = toolCall.id
								}
								if (toolCall.function?.name) {
									toolCallState[index].name = toolCall.function.name
									console.log(`\n[Tool Call Detected] ${toolCall.function.name}`)
								}
								// Naver Cloud streams arguments as partialJson
								if (toolCall.function?.partialJson) {
									toolCallState[index].arguments += toolCall.function.partialJson
								}
								if (toolCall.function?.arguments) {
									// Final chunk may have full arguments
									if (typeof toolCall.function.arguments === 'string') {
										toolCallState[index].arguments = toolCall.function.arguments
									} else {
										toolCallState[index].arguments = JSON.stringify(toolCall.function.arguments)
									}
								}
							}
						}
					}

					if (eventType === 'result') {
						// Process final tool calls from result event
						const finalToolCalls = data.message?.toolCalls || data.message?.tool_calls
						if (Array.isArray(finalToolCalls)) {
							for (let i = 0; i < finalToolCalls.length; i++) {
								const toolCall = finalToolCalls[i]
								const index = toolCall.index ?? i

								if (!toolCallState[index]) {
									toolCallState[index] = { id: '', name: '', arguments: '' }
								}

								if (toolCall.id) toolCallState[index].id = toolCall.id
								if (toolCall.function?.name) toolCallState[index].name = toolCall.function.name
								if (toolCall.function?.arguments) {
									if (typeof toolCall.function.arguments === 'string') {
										toolCallState[index].arguments = toolCall.function.arguments
									} else {
										toolCallState[index].arguments = JSON.stringify(toolCall.function.arguments)
									}
								}
							}
						}

						// Final usage stats
						if (data.usage) {
							result.usage = {
								promptTokens: data.usage.promptTokens || 0,
								completionTokens: data.usage.completionTokens || 0,
								totalTokens: data.usage.totalTokens || 0,
							}
						}
					}
				}
			}

			separatorIndex = buffer.indexOf('\n\n')
		}
	}

	// Finalize tool calls
	for (const [index, state] of Object.entries(toolCallState)) {
		if (state.id && state.name && state.arguments) {
			try {
				result.toolCalls.push({
					id: state.id,
					name: state.name,
					arguments: JSON.parse(state.arguments),
				})
			} catch {
				console.error(`[Warning] Failed to parse tool call arguments: ${state.arguments}`)
			}
		}
	}

	return result
}

// Make API request
async function makeRequest(messages, includeTools = false) {
	const body = {
		messages,
		temperature: 0,
	}

	// Note: maxTokens cannot be used together with tools parameter
	if (includeTools) {
		body.tools = tools
		body.tool_choice = 'auto'
	} else {
		body.maxTokens = 1024
	}

	const response = await fetch(`${NAVER_CLOUD_BASE_URL}/v3/chat-completions/${MODEL_ID}`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${NAVER_CLOUD_API_KEY}`,
			'Content-Type': 'application/json',
			Accept: 'text/event-stream',
		},
		body: JSON.stringify(body),
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`HTTP ${response.status}: ${errorText}`)
	}

	return response
}

// Test 1: Simple tool calling
async function testSimpleToolCall() {
	console.log('\n' + '='.repeat(60))
	console.log('Test 1: Simple Tool Call (get_weather)')
	console.log('='.repeat(60))

	const messages = [
		{ role: 'system', content: 'You are a helpful assistant. Use the provided tools to answer questions.' },
		{ role: 'user', content: "What's the weather like in Seoul?" },
	]

	console.log('\n[Request] Sending message with tools...')
	console.log('[User Message]', messages[1].content)

	try {
		const response = await makeRequest(messages, true)
		console.log('\n[Response Status]', response.status, response.statusText)

		const result = await processStream(response)

		console.log('\n\n[Result Summary]')
		console.log('- Content:', result.content || '(empty)')
		console.log('- Tool Calls:', result.toolCalls.length)

		if (result.toolCalls.length > 0) {
			console.log('\n[Tool Calls Received]')
			for (const tc of result.toolCalls) {
				console.log(`  - ${tc.name}(${JSON.stringify(tc.arguments)})`)
				console.log(`    ID: ${tc.id}`)
			}

			// Verify tool call structure
			const tc = result.toolCalls[0]
			const checks = {
				hasId: !!tc.id,
				hasName: tc.name === 'get_weather',
				hasLocation: !!tc.arguments?.location,
				argsValid: typeof tc.arguments === 'object',
			}

			console.log('\n[Verification]')
			console.log('  - Has ID:', checks.hasId ? 'PASS' : 'FAIL')
			console.log('  - Function name correct:', checks.hasName ? 'PASS' : 'FAIL')
			console.log('  - Has location arg:', checks.hasLocation ? 'PASS' : 'FAIL')
			console.log('  - Arguments valid JSON:', checks.argsValid ? 'PASS' : 'FAIL')

			return Object.values(checks).every(Boolean)
		} else if (result.content) {
			console.log('\n[Note] Model responded with text instead of tool call')
			console.log('This may indicate the model chose not to use tools')
			return false
		}

		return false
	} catch (error) {
		console.error('\n[Error]', error.message)
		return false
	}
}

// Test 2: Tool result → final response flow
async function testToolResultFlow() {
	console.log('\n' + '='.repeat(60))
	console.log('Test 2: Tool Result → Final Response Flow')
	console.log('='.repeat(60))

	// Step 1: Initial request
	const messages = [
		{ role: 'system', content: 'You are a helpful assistant. Use tools when needed.' },
		{ role: 'user', content: "What's the weather in Seoul today? Please give a brief summary." },
	]

	console.log('\n[Step 1] Sending initial request...')

	try {
		const response1 = await makeRequest(messages, true)
		const result1 = await processStream(response1)

		if (result1.toolCalls.length === 0) {
			console.log('\n[Note] No tool call received')
			return result1.content ? true : false
		}

		const toolCall = result1.toolCalls[0]
		console.log(`\n\n[Step 2] Executing tool: ${toolCall.name}`)

		// Execute tool
		const toolResult = executeToolCall(toolCall.name, toolCall.arguments)
		console.log('[Tool Result]', toolResult)

		// Step 3: Send tool result back
		// Naver Cloud uses different format for tool results
		console.log('\n[Step 3] Sending tool result to model...')

		// Naver Cloud format: toolCalls with arguments as object (not string)
		const messagesWithToolResult = [
			...messages,
			{
				role: 'assistant',
				content: '',
				toolCalls: [
					{
						id: toolCall.id,
						type: 'function',
						function: {
							name: toolCall.name,
							arguments: toolCall.arguments, // Object, not string
						},
					},
				],
			},
			{
				role: 'tool',
				toolCallId: toolCall.id,
				content: toolResult,
			},
		]

		const response2 = await makeRequest(messagesWithToolResult, true)
		const result2 = await processStream(response2)

		console.log('\n\n[Final Response]')
		console.log(result2.content || '(empty)')

		if (result2.usage) {
			console.log('\n[Token Usage]')
			console.log('  - Prompt:', result2.usage.promptTokens)
			console.log('  - Completion:', result2.usage.completionTokens)
		}

		// Verify we got a text response
		const success = !!result2.content && result2.content.length > 0
		console.log('\n[Verification]')
		console.log('  - Got final text response:', success ? 'PASS' : 'FAIL')

		return success
	} catch (error) {
		console.error('\n[Error]', error.message)
		return false
	}
}

// Test 3: Multiple parameters tool call
async function testMultiParamToolCall() {
	console.log('\n' + '='.repeat(60))
	console.log('Test 3: Multi-parameter Tool Call (search_files)')
	console.log('='.repeat(60))

	const messages = [
		{ role: 'system', content: 'You are a helpful assistant. Use tools to help users.' },
		{ role: 'user', content: 'Search for files containing "NaverCloud" in the src/ directory.' },
	]

	console.log('\n[Request] Sending message with tools...')

	try {
		const response = await makeRequest(messages, true)
		const result = await processStream(response)

		console.log('\n\n[Result Summary]')
		console.log('- Content:', result.content || '(empty)')
		console.log('- Tool Calls:', result.toolCalls.length)

		if (result.toolCalls.length > 0) {
			const tc = result.toolCalls[0]
			console.log('\n[Tool Call Details]')
			console.log(`  - Name: ${tc.name}`)
			console.log(`  - Arguments: ${JSON.stringify(tc.arguments)}`)

			const checks = {
				correctTool: tc.name === 'search_files',
				hasQuery: !!tc.arguments?.query,
				hasPath: !!tc.arguments?.path,
			}

			console.log('\n[Verification]')
			console.log('  - Correct tool:', checks.correctTool ? 'PASS' : 'FAIL')
			console.log('  - Has query param:', checks.hasQuery ? 'PASS' : 'FAIL')
			console.log('  - Has path param:', checks.hasPath ? 'PASS' : 'FAIL')

			return checks.correctTool && checks.hasQuery
		}

		return false
	} catch (error) {
		console.error('\n[Error]', error.message)
		return false
	}
}

// Main
async function main() {
	console.log('='.repeat(60))
	console.log('Naver Cloud HyperCLOVA X Tool Calling Test')
	console.log('='.repeat(60))
	console.log('API Key:', NAVER_CLOUD_API_KEY.substring(0, 10) + '...' + NAVER_CLOUD_API_KEY.slice(-4))
	console.log('Model:', MODEL_ID)

	const results = {
		simpleToolCall: await testSimpleToolCall(),
		toolResultFlow: await testToolResultFlow(),
		multiParamToolCall: await testMultiParamToolCall(),
	}

	console.log('\n' + '='.repeat(60))
	console.log('Test Summary')
	console.log('='.repeat(60))
	console.log('- Simple tool call:', results.simpleToolCall ? 'PASS' : 'FAIL')
	console.log('- Tool result flow:', results.toolResultFlow ? 'PASS' : 'FAIL')
	console.log('- Multi-param tool:', results.multiParamToolCall ? 'PASS' : 'FAIL')

	const allPassed = Object.values(results).every(Boolean)
	console.log('\nOverall:', allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED')
	console.log('='.repeat(60))

	process.exit(allPassed ? 0 : 1)
}

main()
