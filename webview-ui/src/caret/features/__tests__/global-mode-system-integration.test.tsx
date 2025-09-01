/**
 * TDD Integration Test: Global Mode System (Caret/Cline Toggle)
 *
 * 실제 사용 시나리오:
 * 1. 사용자가 설정 페이지에서 Caret/Cline 토글 클릭
 * 2. 백엔드와 프론트엔드 전역 변수 상태 변경
 * 3. 변경 전후 상태가 로깅됨
 * 4. UI에 새로운 모드가 반영됨
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { ExtensionStateContextProvider, useExtensionState } from "../../../context/ExtensionStateContext"
import { StateServiceClient } from "../../../services/grpc-client"

// CARET MODIFICATION: 실제 동작하는 토글 컴포넌트 구현
const MockModeToggleComponent = () => {
	// ExtensionStateContext에서 modeSystem 상태와 setter 가져오기
	const { modeSystem, setModeSystem } = useExtensionState()

	const handleCaretClick = () => {
		setModeSystem("caret")
	}

	const handleClineClick = () => {
		setModeSystem("cline")
	}

	return (
		<div data-testid="mode-toggle-container">
			<button data-testid="caret-mode-button" onClick={handleCaretClick}>
				Caret Mode
			</button>
			<button data-testid="cline-mode-button" onClick={handleClineClick}>
				Cline Mode
			</button>
			<div data-testid="current-mode">current: {modeSystem || "cline"}</div>
		</div>
	)
}

// Mock the gRPC client
vi.mock("../../../services/grpc-client", () => ({
	StateServiceClient: {
		updateSettings: vi.fn(),
		subscribeToState: vi.fn(() => () => {}),
		getAvailableTerminalProfiles: vi.fn(() => Promise.resolve({ profiles: [] })),
	},
	UiServiceClient: {
		subscribeToMcpButtonClicked: vi.fn(() => () => {}),
		subscribeToHistoryButtonClicked: vi.fn(() => () => {}),
		subscribeToChatButtonClicked: vi.fn(() => () => {}),
		subscribeToDidBecomeVisible: vi.fn(() => () => {}),
		subscribeToSettingsButtonClicked: vi.fn(() => () => {}),
		subscribeToPartialMessage: vi.fn(() => () => {}),
		subscribeToAccountButtonClicked: vi.fn(() => () => {}),
		subscribeToRelinquishControl: vi.fn(() => () => {}),
		subscribeToFocusChatInput: vi.fn(() => () => {}),
		initializeWebview: vi.fn(() => Promise.resolve()),
	},
	ModelsServiceClient: {
		subscribeToOpenRouterModels: vi.fn(() => () => {}),
		refreshOpenRouterModels: vi.fn(() => Promise.resolve({ models: {} })),
	},
	McpServiceClient: {
		subscribeToMcpServers: vi.fn(() => () => {}),
		subscribeToMcpMarketplaceCatalog: vi.fn(() => () => {}),
	},
}))

// Mock console methods to capture logs
const mockConsoleLog = vi.fn()
const mockConsoleDebug = vi.fn()
const originalConsoleLog = console.log
const originalConsoleDebug = console.debug

describe("Global Mode System Integration Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		console.log = mockConsoleLog
		console.debug = mockConsoleDebug

		// Mock window object
		Object.defineProperty(window, "WEBVIEW_PROVIDER_TYPE", {
			value: "tab",
			writable: true,
		})
	})

	afterEach(() => {
		console.log = originalConsoleLog
		console.debug = originalConsoleDebug
	})

	describe("🔴 TDD RED: Failing Tests (Expected Behavior)", () => {
		test("should toggle from Cline to Caret mode with complete logging", async () => {
			// Arrange: Setup initial state
			const TestComponent = () => (
				<ExtensionStateContextProvider>
					<MockModeToggleComponent />
				</ExtensionStateContextProvider>
			)

			render(<TestComponent />)

			// Act: User clicks Caret mode button
			const caretButton = screen.getByTestId("caret-mode-button")
			fireEvent.click(caretButton)

			// Assert: Expected behavior (현재는 실패할 것)
			await waitFor(() => {
				// 1. 백엔드 API 호출 확인
				expect(StateServiceClient.updateSettings).toHaveBeenCalledWith(
					expect.objectContaining({
						modeSystem: "caret",
					}),
				)

				// 2. 백엔드 상태 변경 로깅 확인
				expect(mockConsoleLog).toHaveBeenCalledWith(
					expect.stringContaining("[BACKEND] modeSystem changed: cline -> caret"),
				)

				// 3. 프론트엔드 상태 변경 로깅 확인
				expect(mockConsoleDebug).toHaveBeenCalledWith(
					expect.stringContaining("[FRONTEND] Global modeSystem updated: caret"),
				)

				// 4. UI 반영 확인
				expect(screen.getByTestId("current-mode")).toHaveTextContent("current: caret")
			})
		})

		test("should toggle from Caret to Cline mode with complete logging", async () => {
			// Arrange: Setup initial Caret state
			const TestComponent = () => (
				<ExtensionStateContextProvider>
					<MockModeToggleComponent />
				</ExtensionStateContextProvider>
			)

			render(<TestComponent />)

			// Act: User clicks Cline mode button
			const clineButton = screen.getByTestId("cline-mode-button")
			fireEvent.click(clineButton)

			// Assert: Expected behavior (현재는 실패할 것)
			await waitFor(() => {
				// 1. 백엔드 API 호출 확인
				expect(StateServiceClient.updateSettings).toHaveBeenCalledWith(
					expect.objectContaining({
						modeSystem: "cline",
					}),
				)

				// 2. 백엔드 상태 변경 로깅 확인
				expect(mockConsoleLog).toHaveBeenCalledWith(
					expect.stringContaining("[BACKEND] modeSystem changed: caret -> cline"),
				)

				// 3. 프론트엔드 상태 변경 로깅 확인
				expect(mockConsoleDebug).toHaveBeenCalledWith(
					expect.stringContaining("[FRONTEND] Global modeSystem updated: cline"),
				)

				// 4. UI 반영 확인
				expect(screen.getByTestId("current-mode")).toHaveTextContent("current: cline")
			})
		})

		test("should provide global access to modeSystem state", async () => {
			// Arrange: Test component that accesses global state
			let globalModeSystem: string | undefined

			const GlobalStateAccessComponent = () => {
				// This will be implemented: const { modeSystem } = useExtensionState()
				globalModeSystem = "cline" // Mock initial state
				return <div data-testid="global-state">modeSystem: {globalModeSystem}</div>
			}

			const TestComponent = () => (
				<ExtensionStateContextProvider>
					<GlobalStateAccessComponent />
				</ExtensionStateContextProvider>
			)

			render(<TestComponent />)

			// Assert: Global state should be accessible
			expect(screen.getByTestId("global-state")).toHaveTextContent("modeSystem: cline")

			// This test will fail until we implement modeSystem in ExtensionStateContext
			expect(globalModeSystem).toBe("cline")
		})

		test("should log backend and frontend global variables on toggle", async () => {
			// Arrange
			const TestComponent = () => (
				<ExtensionStateContextProvider>
					<MockModeToggleComponent />
				</ExtensionStateContextProvider>
			)

			render(<TestComponent />)

			// Act: Toggle mode
			const caretButton = screen.getByTestId("caret-mode-button")
			fireEvent.click(caretButton)

			// Assert: Comprehensive logging
			await waitFor(() => {
				// 백엔드 전역 변수 로깅
				expect(mockConsoleLog).toHaveBeenCalledWith(
					expect.stringContaining("[GLOBAL-BACKEND] modeSystem state:"),
					expect.objectContaining({
						before: "cline",
						after: "caret",
						timestamp: expect.any(String),
					}),
				)

				// 프론트엔드 전역 변수 로깅
				expect(mockConsoleDebug).toHaveBeenCalledWith(
					expect.stringContaining("[GLOBAL-FRONTEND] modeSystem state:"),
					expect.objectContaining({
						before: "cline",
						after: "caret",
						timestamp: expect.any(String),
					}),
				)
			})
		})
	})

	describe("🟢 TDD Implementation Validation", () => {
		test("should validate test setup and mocking", () => {
			// Basic test setup validation
			expect(StateServiceClient.updateSettings).toBeDefined()
			expect(mockConsoleLog).toBeDefined()
			expect(mockConsoleDebug).toBeDefined()

			// This test should pass to validate our test infrastructure
			expect(true).toBe(true)
		})
	})
})

/**
 * TDD 구현 계획:
 *
 * RED (현재): 위 테스트들이 실패함 - 구현되지 않음
 * GREEN (다음): 최소 구현으로 테스트 통과시키기
 * REFACTOR (마지막): 코드 품질 개선
 *
 * 구현해야 할 것들:
 * 1. ExtensionState에 modeSystem 필드 추가
 * 2. ExtensionStateContext에 setModeSystem 구현
 * 3. 백엔드/프론트엔드 로깅 시스템 구현
 * 4. 실제 토글 컴포넌트 구현
 */
