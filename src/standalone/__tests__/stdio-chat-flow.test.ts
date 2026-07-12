// CARETI MODIFICATION: Integration test for standalone stdio mode chat flow
import { expect } from "chai"
import { describe, it } from "mocha"
import { spawn, ChildProcess } from "child_process"
import * as fs from "fs"
import * as path from "path"

interface StdioResponse {
	type: "grpc_response"
	grpc_response: {
		message: any
		request_id: string
		is_streaming: boolean
		error?: string
	}
}

/**
 * Helper to send a request to cline-core via stdio and wait for response
 */
function sendStdioRequest(
	coreProcess: ChildProcess,
	request: any,
	timeoutMs: number = 5000
): Promise<StdioResponse[]> {
	return new Promise((resolve, reject) => {
		const responses: StdioResponse[] = []
		const requestId = request.grpc_request.request_id
		let resolved = false

		const timeout = setTimeout(() => {
			if (!resolved) {
				resolved = true
				resolve(responses)
			}
		}, timeoutMs)

		const onData = (data: Buffer) => {
			const lines = data.toString().split("\n").filter(Boolean)
			for (const line of lines) {
				try {
					const parsed = JSON.parse(line)
					if (parsed.type === "grpc_response" && parsed.grpc_response?.request_id === requestId) {
						responses.push(parsed)
						// If not streaming, we got our response
						if (!parsed.grpc_response.is_streaming) {
							clearTimeout(timeout)
							if (!resolved) {
								resolved = true
								resolve(responses)
							}
						}
					}
				} catch {
					// Not JSON, skip
				}
			}
		}

		coreProcess.stdout?.on("data", onData)

		// Send request
		coreProcess.stdin?.write(JSON.stringify(request) + "\n")
	})
}

describe("Standalone Stdio Chat Flow", function () {
	// Increase timeout for integration tests
	this.timeout(30000)

	let coreProcess: ChildProcess | null = null
	const coreJsPath = path.join(process.cwd(), "dist-standalone", "cline-core.js")

	beforeEach(function (done) {
		// CARETI MODIFICATION: standalone 번들과 extension 자산이 없는 환경(CI의 ci:build,
		// compile-standalone 미실행 로컬)에서는 spawn이 반드시 실패하므로 skip 처리
		// (CLI 통합 테스트가 실행 중 인스턴스 없으면 skip하는 관례와 동일)
		const extensionPackageJson = path.join(process.cwd(), "dist-standalone", "extension", "package.json")
		if (!fs.existsSync(coreJsPath) || !fs.existsSync(extensionPackageJson)) {
			this.skip()
		}
		let isDone = false
		const callDone = (err?: Error) => {
			if (!isDone) {
				isDone = true
				done(err)
			}
		}

		// Spawn cline-core in stdio mode
		coreProcess = spawn("node", [coreJsPath, "--stdio"], {
			stdio: ["pipe", "pipe", "pipe"],
			env: { ...process.env, NODE_ENV: "test" },
		})

		// Wait for ready signal
		const onData = (data: Buffer) => {
			const lines = data.toString().split("\n").filter(Boolean)
			for (const line of lines) {
				try {
					const parsed = JSON.parse(line)
					if (parsed.grpc_response?.request_id === "init" && parsed.grpc_response?.message?.ready) {
						coreProcess?.stdout?.removeListener("data", onData)
						callDone()
						return
					}
				} catch {
					// Not JSON, skip
				}
			}
		}

		coreProcess.stdout?.on("data", onData)

		coreProcess.on("error", (err) => {
			callDone(err)
		})

		// Timeout if not ready in 10 seconds
		setTimeout(() => {
			callDone(new Error("cline-core did not start in time"))
		}, 10000)
	})

	afterEach(function () {
		if (coreProcess) {
			coreProcess.kill()
			coreProcess = null
		}
	})

	describe("Provider Configuration", () => {
		it("should handle JSON string enum values in updateApiConfigurationProto", async function () {
			if (!coreProcess) {
				throw new Error("coreProcess not initialized")
			}

			const request = {
				type: "grpc_request",
				grpc_request: {
					service: "ModelsService",
					method: "updateApiConfigurationProto",
					message: {
						apiConfiguration: {
							planModeApiProvider: "UPSTAGE",
							actModeApiProvider: "GEMINI",
							planModeApiModelId: "solar-pro2-preview",
						},
					},
					request_id: "test-provider-update",
					is_streaming: false,
				},
			}

			const responses = await sendStdioRequest(coreProcess, request)

			expect(responses).to.have.lengthOf(1)
			expect(responses[0].grpc_response.error).to.be.undefined
			expect(responses[0].grpc_response.request_id).to.equal("test-provider-update")
		})

		it("should handle numeric enum values in updateApiConfigurationProto", async function () {
			if (!coreProcess) {
				throw new Error("coreProcess not initialized")
			}

			const request = {
				type: "grpc_request",
				grpc_request: {
					service: "ModelsService",
					method: "updateApiConfigurationProto",
					message: {
						apiConfiguration: {
							planModeApiProvider: 40, // UPSTAGE
							actModeApiProvider: 7, // GEMINI
						},
					},
					request_id: "test-provider-numeric",
					is_streaming: false,
				},
			}

			const responses = await sendStdioRequest(coreProcess, request)

			expect(responses).to.have.lengthOf(1)
			expect(responses[0].grpc_response.error).to.be.undefined
		})
	})

	describe("State Subscription", () => {
		it("should receive initial state on subscription", async function () {
			if (!coreProcess) {
				throw new Error("coreProcess not initialized")
			}

			const request = {
				type: "grpc_request",
				grpc_request: {
					service: "StateService",
					method: "subscribeToState",
					message: {},
					request_id: "test-state-sub",
					is_streaming: true,
				},
			}

			const responses = await sendStdioRequest(coreProcess, request, 3000)

			expect(responses.length).to.be.greaterThan(0)
			const firstResponse = responses[0]
			expect(firstResponse.grpc_response.message).to.have.property("stateJson")

			// Parse and verify state structure
			const state = JSON.parse(firstResponse.grpc_response.message.stateJson)
			expect(state).to.have.property("apiConfiguration")
		})
	})

	describe("UI Initialization", () => {
		it("should successfully initialize webview", async function () {
			if (!coreProcess) {
				throw new Error("coreProcess not initialized")
			}

			const request = {
				type: "grpc_request",
				grpc_request: {
					service: "UiService",
					method: "initializeWebview",
					message: {},
					request_id: "test-init-webview",
					is_streaming: false,
				},
			}

			const responses = await sendStdioRequest(coreProcess, request)

			expect(responses).to.have.lengthOf(1)
			expect(responses[0].grpc_response.error).to.be.undefined
		})
	})

	describe("Task Flow", () => {
		it("should create a new task successfully", async function () {
			if (!coreProcess) {
				throw new Error("coreProcess not initialized")
			}

			const request = {
				type: "grpc_request",
				grpc_request: {
					service: "TaskService",
					method: "newTask",
					message: {
						text: "Hello, this is a test message",
					},
					request_id: "test-new-task",
					is_streaming: false,
				},
			}

			const responses = await sendStdioRequest(coreProcess, request, 5000)

			expect(responses).to.have.lengthOf(1)
			expect(responses[0].grpc_response.error).to.be.undefined
		})

		it("should handle askResponse after newTask", async function () {
			if (!coreProcess) {
				throw new Error("coreProcess not initialized")
			}

			// First create a new task
			const newTaskRequest = {
				type: "grpc_request",
				grpc_request: {
					service: "TaskService",
					method: "newTask",
					message: {
						text: "Hello test",
					},
					request_id: "test-new-task-2",
					is_streaming: false,
				},
			}

			await sendStdioRequest(coreProcess, newTaskRequest, 3000)

			// Then try to send askResponse (simulating user follow-up)
			const askResponseRequest = {
				type: "grpc_request",
				grpc_request: {
					service: "TaskService",
					method: "askResponse",
					message: {
						responseType: "messageResponse",
						text: "Follow up message",
					},
					request_id: "test-ask-response",
					is_streaming: false,
				},
			}

			const responses = await sendStdioRequest(coreProcess, askResponseRequest, 3000)

			// Should get a response (even if it's an error about no pending ask)
			expect(responses).to.have.lengthOf(1)
		})
	})
})
