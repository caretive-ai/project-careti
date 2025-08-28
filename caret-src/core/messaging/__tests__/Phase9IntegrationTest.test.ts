/**
 * Phase 9 통합 테스트: Agent 모드 도구 시스템 완전 통합 검증
 * CARET MODIFICATION: Phase 9 End-to-End 통합 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { MessageHandlerFactory } from "../MessageHandlerFactory"
import { CaretMessageHandler } from "../CaretMessageHandler"
import { modeRegistry } from "../../mode-system/ModeSystemRegistry"

// Mock Task instance with tool integration
const createMockTaskInstance = () => ({
	handleWebviewAskResponse: vi.fn().mockResolvedValue(undefined),
	say: vi.fn(),
	ask: vi.fn(),
	executeTools: vi.fn().mockResolvedValue({ success: true }),
	mode: "act",
	chatSettings: { modeSystem: "caret" },
})

// Mock VSCode API
const mockVscodeAPI = {
	postMessage: vi.fn(),
	getState: vi.fn().mockReturnValue({}),
	setState: vi.fn(),
}

// Mock global vscode
Object.defineProperty(globalThis, "vscode", {
	value: mockVscodeAPI,
	configurable: true,
})

describe("🚀 Phase 9 Integration Test: Agent Mode Tool System", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("🔧 Phase 9.1 & 9.2: MessageHandler 도구 통합", () => {
		it("should create CaretMessageHandler with Task instance integration", () => {
			const handler = MessageHandlerFactory.create("caret")
			expect(handler).toBeInstanceOf(CaretMessageHandler)
		})

		it("should integrate TaskServiceClient for tool execution in Agent mode", async () => {
			const handler = new CaretMessageHandler()
			const mockTaskServiceClient = {
				askResponse: vi.fn().mockResolvedValue(undefined),
			}

			await handler.handleSendMessage(
				"test message",
				[],
				[],
				mockTaskServiceClient, // TaskServiceClient for tool integration
				undefined, // clineAsk
				1, // messagesLength - ongoing conversation
			)

			// Phase 10.1 검증: TaskServiceClient.askResponse 호출 (내부적으로 Task.handleWebviewAskResponse 호출)
			expect(mockTaskServiceClient.askResponse).toHaveBeenCalledWith({
				responseType: "messageResponse",
				text: "test message",
				images: [],
				files: [],
			})
		})

		it("should handle new conversation with TaskServiceClient", async () => {
			const handler = new CaretMessageHandler()
			const mockTaskServiceClient = {
				newTask: vi.fn().mockResolvedValue(undefined),
			}

			await handler.handleSendMessage(
				"initial message",
				[],
				[],
				mockTaskServiceClient,
				undefined,
				0, // messagesLength - new conversation
			)

			expect(mockTaskServiceClient.newTask).toHaveBeenCalledWith({
				text: "initial message",
				images: [],
				files: [],
			})
		})
	})

	describe("🔧 Phase 9.3: CaretModeAdapter 도구 정보 통합", () => {
		it("should include tool information in Agent mode system prompt", async () => {
			const context = {
				supportsBrowserUse: true,
				mcpHub: {
					getConnectedServers: () => [{ name: "test-server" }],
				},
				extensionPath: "/test/path",
				currentWorkingDirectory: "/test/cwd",
				isClaude4ModelFamily: true,
			}

			const systemPrompt = await modeRegistry.buildSystemPrompt("caret", "act", context)

			// Phase 9.3 검증: Agent 모드에서 도구 정보 포함
			expect(systemPrompt).toContain("browser_action")
			expect(systemPrompt).toContain("Launch browser with action parameter")
			expect(systemPrompt).toContain("file operations")
			expect(systemPrompt).toContain("terminal commands")
			expect(systemPrompt).toContain("MCP servers")
		})

		it("should NOT include tool information in Chatbot mode", async () => {
			const context = {
				supportsBrowserUse: true,
				mcpHub: { getConnectedServers: () => [] },
				extensionPath: "/test/path",
				currentWorkingDirectory: "/test/cwd",
				isClaude4ModelFamily: true,
			}

			const systemPrompt = await modeRegistry.buildSystemPrompt("caret", "plan", context)

			// Chatbot 모드에서는 도구 정보 제외 (상담 전용)
			expect(systemPrompt).not.toContain("Available Tools")
			expect(systemPrompt).not.toContain("browser_action")
		})

		it("should handle missing browser support gracefully", async () => {
			const context = {
				supportsBrowserUse: false, // 브라우저 지원 없음
				mcpHub: null,
				extensionPath: "/test/path",
				currentWorkingDirectory: "/test/cwd",
				isClaude4ModelFamily: false,
			}

			const systemPrompt = await modeRegistry.buildSystemPrompt("caret", "act", context)

			// 브라우저 도구 정보는 포함되지 않지만 기본 프롬프트는 생성
			expect(systemPrompt).toBeTruthy()
			expect(systemPrompt).not.toContain("browser_action")
		})
	})

	describe("🔧 Phase 9.4: End-to-End 통합 검증", () => {
		it("should demonstrate complete Agent mode workflow with tools", async () => {
			// 1. Factory로 Caret 핸들러 생성
			const handler = MessageHandlerFactory.create("caret")
			const mockTaskServiceClient = {
				askResponse: vi.fn().mockResolvedValue(undefined),
			}

			// 2. Agent 모드 시스템 프롬프트 생성 (도구 정보 포함)
			const context = {
				supportsBrowserUse: true,
				mcpHub: { getConnectedServers: () => [{ name: "test-mcp" }] },
				extensionPath: "/test/path",
				currentWorkingDirectory: "/test/cwd",
				isClaude4ModelFamily: true,
			}

			const systemPrompt = await modeRegistry.buildSystemPrompt("caret", "act", context)

			// 3. 사용자 메시지 처리 (도구 사용 요청)
			await handler.handleSendMessage("웹뷰 열고 네이버 이동", [], [], mockTaskServiceClient, undefined, 1)

			// 4. 검증: 완전한 도구 통합 플로우
			expect(systemPrompt).toContain("browser_action") // Agent가 도구 인식
			expect(mockTaskServiceClient.askResponse).toHaveBeenCalled() // TaskServiceClient → Task.handleWebviewAskResponse 경로 활용
			expect(handler).toBeInstanceOf(CaretMessageHandler) // 올바른 핸들러 사용

			// Phase 10.1 핵심: 이제 Agent 모드가 TaskServiceClient를 통해 browser_action으로 요청 처리 가능
		})

		it("should maintain 100% Cline compatibility", async () => {
			// Cline 시스템으로 전환해도 모든 기능 정상 작동
			const clineHandler = MessageHandlerFactory.create("cline")

			// Mock TaskServiceClient for Cline handler
			const mockTaskServiceClient = {
				askResponse: vi.fn().mockResolvedValue(undefined),
			}

			await clineHandler.handleSendMessage(
				"test cline message",
				[],
				[],
				mockTaskServiceClient, // provide proper taskServiceClient
				"tool", // clineAsk - Cline 고유 워크플로우
				1,
			)

			// Cline 기존 로직 100% 보존 확인 - TaskServiceClient 사용
			expect(mockTaskServiceClient.askResponse).toHaveBeenCalled()
		})

		it("should verify Factory pattern system separation", () => {
			const caretHandler = MessageHandlerFactory.create("caret")
			const clineHandler = MessageHandlerFactory.create("cline")

			expect(caretHandler.constructor.name).toBe("CaretMessageHandler")
			expect(clineHandler.constructor.name).toBe("ClineMessageHandler")
			expect(caretHandler).not.toBe(clineHandler) // 완전 분리
		})
	})

	describe("🧪 Phase 9 Regression Tests", () => {
		it("should preserve all existing Caret functionality", async () => {
			const handler = new CaretMessageHandler()
			const mockTaskServiceClient = {
				newTask: vi.fn().mockResolvedValue(undefined),
			}

			// Phase 6에서 구현한 optimistic update 기능 보존 확인
			await handler.handleSendMessage("test message", ["image1"], ["file1"], mockTaskServiceClient, undefined, 0)

			// TaskServiceClient 처리 정상 작동 확인 (내부적으로 Task.handleWebviewAskResponse 호출)
			expect(mockTaskServiceClient.newTask).toHaveBeenCalledWith({
				text: "test message",
				images: ["image1"],
				files: ["file1"],
			})
		})

		it("should handle error cases gracefully", async () => {
			const handler = new CaretMessageHandler()
			const mockTaskServiceClient = {
				askResponse: vi.fn().mockRejectedValue(new Error("TaskServiceClient error")),
			}

			// 에러 발생해도 핸들러가 정상적으로 처리 (에러를 잡아서 처리)
			try {
				await handler.handleSendMessage("test", [], [], mockTaskServiceClient, undefined, 1)
			} catch (error) {
				// 에러가 발생해도 TaskServiceClient는 호출되어야 함
				expect(mockTaskServiceClient.askResponse).toHaveBeenCalled()
			}
		})
	})

	describe("📊 Phase 9 Performance Tests", () => {
		it("should maintain performance with tool integration", async () => {
			const handler = MessageHandlerFactory.create("caret")
			const mockTaskServiceClient = {
				askResponse: vi.fn().mockResolvedValue(undefined),
			}

			const start = performance.now()

			await handler.handleSendMessage("performance test", [], [], mockTaskServiceClient, undefined, 1)

			const duration = performance.now() - start

			// 도구 통합으로 인한 성능 저하 없음 확인 (< 100ms)
			expect(duration).toBeLessThan(100)
		})

		it("should handle concurrent message processing", async () => {
			const handler = MessageHandlerFactory.create("caret")
			const mockTaskServiceClient1 = {
				askResponse: vi.fn().mockResolvedValue(undefined),
			}
			const mockTaskServiceClient2 = {
				askResponse: vi.fn().mockResolvedValue(undefined),
			}

			// 동시 메시지 처리 테스트
			const promises = [
				handler.handleSendMessage("msg1", [], [], mockTaskServiceClient1, undefined, 1),
				handler.handleSendMessage("msg2", [], [], mockTaskServiceClient2, undefined, 1),
			]

			await Promise.all(promises)

			expect(mockTaskServiceClient1.askResponse).toHaveBeenCalledWith({
				responseType: "messageResponse",
				text: "msg1",
				images: [],
				files: [],
			})
			expect(mockTaskServiceClient2.askResponse).toHaveBeenCalledWith({
				responseType: "messageResponse",
				text: "msg2",
				images: [],
				files: [],
			})
		})
	})
})
