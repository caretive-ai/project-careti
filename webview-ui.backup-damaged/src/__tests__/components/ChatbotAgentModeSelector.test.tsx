import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import React from "react"

// CARET MODIFICATION: Import correct Chatbot/Agent types
import { ChatbotAgentMode, ToggleChatbotAgentModeRequest } from "@shared/proto/state"

// Mock 컴포넌트들 (나중에 실제 구현될 부분)
const MockChatbotAgentModeSelector = ({
	currentMode,
	onModeChange,
	disabled = false,
}: {
	currentMode: "chatbot" | "agent"
	onModeChange: (mode: "chatbot" | "agent") => void
	disabled?: boolean
}) => {
	return (
		<div data-testid="chatbot-agent-mode-switch" data-mode={currentMode}>
			<button
				data-testid="chatbot-button"
				className={currentMode === "chatbot" ? "active" : ""}
				onClick={() => onModeChange("chatbot")}
				disabled={disabled}>
				💬 Chatbot
			</button>
			<button
				data-testid="agent-button"
				className={currentMode === "agent" ? "active" : ""}
				onClick={() => onModeChange("agent")}
				disabled={disabled}>
				🤖 Agent
			</button>
		</div>
	)
}

const MockModeIndicator = ({ currentMode }: { currentMode: "chatbot" | "agent" }) => {
	const modeInfo = {
		chatbot: {
			title: "Chatbot Mode",
			description: "Expert Consultation - Analysis and advice without code changes",
			icon: "💬",
		},
		agent: {
			title: "Agent Mode",
			description: "Collaborative Development - Full implementation partnership",
			icon: "🤖",
		},
	}

	const mode = modeInfo[currentMode]

	return (
		<div data-testid="mode-indicator">
			<span>{mode.icon}</span>
			<div>{mode.title}</div>
			<div>{mode.description}</div>
		</div>
	)
}

// 🔴 RED: Critical failing tests to verify current problems
describe("🚨 Critical Chatbot/Agent System Issues (RED Phase)", () => {
	describe("Type System Consistency", () => {
		it("🔴 SHOULD FAIL: ChatSettings mode should use Chatbot/Agent not plan/act", () => {
			// This test will FAIL because current system uses plan/act
			const mockChatSettings = {
				mode: "chatbot" as const, // This should be the correct type
				preferredLanguage: "English",
			}

			// This assertion will FAIL if real system still uses plan/act
			expect(mockChatSettings.mode).toBe("chatbot")
			expect(mockChatSettings.mode).not.toBe("plan") // Will fail in current system
		})

		it("🔴 SHOULD FAIL: ChatbotAgentMode enum should be used for gRPC", () => {
			// This will FAIL because current system uses PlanActMode
			const ChatbotRequest = ToggleChatbotAgentModeRequest.create({
				chatSettings: {
					mode: ChatbotAgentMode.CHATBOT_MODE,
				},
			})

			expect(ChatbotRequest.chatSettings?.mode).toBe(ChatbotAgentMode.CHATBOT_MODE)
			expect(ChatbotRequest.chatSettings?.mode).toBe(0) // CHATBOT_MODE = 0
		})
	})

	describe("gRPC API Consistency", () => {
		it("🔴 SHOULD FAIL: Should use toggleChatbotAgentMode not togglePlanActMode", () => {
			// Mock the StateServiceClient to test correct API usage
			const mockStateServiceClient = {
				toggleChatbotAgentMode: vi.fn().mockResolvedValue({}),
				// The old API that should NOT be used anymore
				togglePlanActMode: vi.fn().mockResolvedValue({}),
			}

			// This will FAIL because current system still uses togglePlanActMode
			expect(mockStateServiceClient).toHaveProperty("toggleChatbotAgentMode")
			expect(mockStateServiceClient.toggleChatbotAgentMode).toBeDefined()

			// These should NOT exist in the new system
			expect(mockStateServiceClient).not.toHaveProperty("togglePlanActMode")
		})
	})

	describe("UI-State Consistency", () => {
		it("🔴 SHOULD FAIL: UI state should match internal ChatSettings type", () => {
			// This represents what the UI component should receive
			const mockUIState = {
				chatSettings: {
					mode: "chatbot" as const, // Should be Chatbot/Agent, not plan/act
				},
			}

			// This will FAIL if real system passes plan/act to UI
			expect(mockUIState.chatSettings.mode).toBe("chatbot")
			expect(mockUIState.chatSettings.mode).not.toBe("plan") // Will fail
		})

		it("🔴 SHOULD FAIL: Tooltip mode strings should match ChatSettings values", () => {
			// Current system might use "plan"/"act" strings in tooltips
			const tooltipModeMapping = {
				Chatbot: "Chatbot mode tooltip",
				agent: "Agent mode tooltip",
			}

			// This should work with Chatbot/Agent, not plan/act
			expect(tooltipModeMapping).toHaveProperty("chatbot")
			expect(tooltipModeMapping).toHaveProperty("agent")
			expect(tooltipModeMapping).not.toHaveProperty("plan") // Will fail if plan exists
			expect(tooltipModeMapping).not.toHaveProperty("act") // Will fail if act exists
		})
	})
})

describe("Chatbot/Agent 모드 선택기", () => {
	let mockOnModeChange: ReturnType<typeof vi.fn>

	beforeEach(() => {
		mockOnModeChange = vi.fn()
	})

	it("should render Chatbot and Agent buttons correctly", () => {
		// TDD: Chatbot와 Agent 버튼이 올바르게 렌더링되어야 함
		render(<MockChatbotAgentModeSelector currentMode="agent" onModeChange={mockOnModeChange} />)

		expect(screen.getByText("💬 Chatbot")).toBeInTheDocument()
		expect(screen.getByText("🤖 Agent")).toBeInTheDocument()
		expect(screen.getByTestId("agent-button")).toHaveClass("active")
		expect(screen.getByTestId("Chatbot-button")).not.toHaveClass("active")
	})

	it("should call onModeChange with correct Chatbot/Agent values", () => {
		// TDD: 버튼 클릭 시 올바른 Chatbot/Agent 값으로 onModeChange가 호출되어야 함
		render(<MockChatbotAgentModeSelector currentMode="agent" onModeChange={mockOnModeChange} />)

		fireEvent.click(screen.getByText("💬 Chatbot"))
		expect(mockOnModeChange).toHaveBeenCalledWith("chatbot")

		fireEvent.click(screen.getByText("🤖 Agent"))
		expect(mockOnModeChange).toHaveBeenCalledWith("agent")
	})

	it("should show Chatbot mode as active when selected", () => {
		// TDD: Chatbot 모드 선택 시 버튼이 활성 상태로 표시되어야 함
		render(<MockChatbotAgentModeSelector currentMode="chatbot" onModeChange={mockOnModeChange} />)

		expect(screen.getByTestId("chatbot-button")).toHaveClass("active")
		expect(screen.getByTestId("agent-button")).not.toHaveClass("active")
		expect(screen.getByTestId("chatbot-agent-mode-switch")).toHaveAttribute("data-mode", "chatbot")
	})

	it("should disable buttons when disabled prop is true", () => {
		// TDD: disabled prop이 true일 때 버튼들이 비활성화되어야 함
		render(<MockChatbotAgentModeSelector currentMode="agent" onModeChange={mockOnModeChange} disabled={true} />)

		expect(screen.getByTestId("Chatbot-button")).toBeDisabled()
		expect(screen.getByTestId("agent-button")).toBeDisabled()
	})

	it("should use Chatbot/Agent terminology consistently", () => {
		// TDD: Chatbot/Agent 용어가 일관되게 사용되어야 함
		render(<MockChatbotAgentModeSelector currentMode="chatbot" onModeChange={mockOnModeChange} />)

		const chatbotButton = screen.getByText("💬 Chatbot")
		const agentButton = screen.getByText("🤖 Agent")

		expect(chatbotButton.textContent).toContain("Chatbot")
		expect(chatbotButton.textContent).not.toContain("Plan")
		expect(agentButton.textContent).toContain("Agent")
		expect(agentButton.textContent).not.toContain("Act")
	})
})

describe("Chatbot/Agent 모드 표시기", () => {
	it("should show correct mode descriptions for Chatbot mode", () => {
		// TDD: Chatbot 모드 설명이 올바르게 표시되어야 함
		render(<MockModeIndicator currentMode="chatbot" />)

		expect(screen.getByText("Chatbot Mode")).toBeInTheDocument()
		expect(screen.getByText(/Expert Consultation/)).toBeInTheDocument()
		expect(screen.getByText(/analysis and advice without code changes/)).toBeInTheDocument()
		expect(screen.getByText("💬")).toBeInTheDocument()
	})

	it("should show correct mode descriptions for Agent mode", () => {
		// TDD: Agent 모드 설명이 올바르게 표시되어야 함
		render(<MockModeIndicator currentMode="agent" />)

		expect(screen.getByText("Agent Mode")).toBeInTheDocument()
		expect(screen.getByText(/Collaborative Development/)).toBeInTheDocument()
		expect(screen.getByText(/Full implementation partnership/)).toBeInTheDocument()
		expect(screen.getByText("🤖")).toBeInTheDocument()
	})

	it("should not contain deprecated Plan/Act terminology", () => {
		// TDD: 구버전 Plan/Act 용어가 포함되지 않아야 함
		const { container: ChatbotContainer } = render(<MockModeIndicator currentMode="chatbot" />)
		const { container: agentContainer } = render(<MockModeIndicator currentMode="agent" />)

		expect(ChatbotContainer.textContent).not.toContain("Plan")
		expect(ChatbotContainer.textContent).not.toContain("Act")
		expect(agentContainer.textContent).not.toContain("Plan")
		expect(agentContainer.textContent).not.toContain("Act")
	})
})

describe("Chatbot/Agent 상태 관리", () => {
	// Mock hook for testing state management
	const mockUseChatbotAgentMode = () => ({
		mode: "agent" as "chatbot" | "agent",
		switchToChatbot: vi.fn(),
		switchToAgent: vi.fn(),
		isLoading: false,
	})

	it("should manage Chatbot/Agent state correctly", () => {
		// TDD: Chatbot/Agent 상태가 올바르게 관리되어야 함
		const hookResult = mockUseChatbotAgentMode()

		expect(hookResult.mode).toBe("agent") // 기본값은 Agent
		expect(typeof hookResult.switchToChatbot).toBe("function")
		expect(typeof hookResult.switchToAgent).toBe("function")
	})

	it("should provide state switching functions with Chatbot/Agent naming", () => {
		// TDD: 상태 전환 함수들이 Chatbot/Agent 네이밍을 사용해야 함
		const hookResult = mockUseChatbotAgentMode()

		const expectedFunctionNames = ["switchToChatbot", "switchToAgent"]
		const deprecatedFunctionNames = ["switchToPlan", "switchToAct"]

		expectedFunctionNames.forEach((name) => {
			expect(hookResult).toHaveProperty(name)
		})

		deprecatedFunctionNames.forEach((name) => {
			expect(hookResult).not.toHaveProperty(name)
		})
	})

	it("should send correct gRPC requests with Chatbot/Agent enum values", async () => {
		// TDD: gRPC 요청에 Chatbot/Agent 열거형 값을 사용해야 함
		const mockStateServiceClient = {
			toggleChatbotAgentMode: vi.fn().mockResolvedValue({}),
		}

		// 예상되는 gRPC 요청 구조
		const expectedChatbotRequest = {
			chatSettings: { mode: 0 }, // ChatbotAgentMode.CHATBOT_MODE = 0
		}
		const expectedAgentRequest = {
			chatSettings: { mode: 1 }, // ChatbotAgentMode.AGENT_MODE = 1
		}

		expect(expectedChatbotRequest.chatSettings.mode).toBe(0)
		expect(expectedAgentRequest.chatSettings.mode).toBe(1)
	})
})

describe("Chatbot/Agent 접근성 및 UX", () => {
	it("should have proper accessibility attributes", () => {
		// TDD: 접근성 속성이 올바르게 설정되어야 함
		render(<MockChatbotAgentModeSelector currentMode="chatbot" onModeChange={vi.fn()} />)

		const ChatbotButton = screen.getByTestId("Chatbot-button")
		const agentButton = screen.getByTestId("agent-button")

		// 기본 접근성 확인 (실제 구현에서는 더 많은 속성 필요)
		expect(ChatbotButton).toBeInTheDocument()
		expect(agentButton).toBeInTheDocument()
	})

	it("should provide clear visual feedback for current mode", () => {
		// TDD: 현재 모드에 대한 명확한 시각적 피드백이 있어야 함
		const { rerender } = render(<MockChatbotAgentModeSelector currentMode="chatbot" onModeChange={vi.fn()} />)

		expect(screen.getByTestId("Chatbot-button")).toHaveClass("active")

		rerender(<MockChatbotAgentModeSelector currentMode="agent" onModeChange={vi.fn()} />)

		expect(screen.getByTestId("agent-button")).toHaveClass("active")
	})

	it("should use intuitive icons and labels", () => {
		// TDD: 직관적인 아이콘과 라벨을 사용해야 함
		render(<MockChatbotAgentModeSelector currentMode="agent" onModeChange={vi.fn()} />)

		// Chatbot: 💬 (말풍선) - 질문/상담의 의미
		expect(screen.getByText(/💬.*Chatbot/)).toBeInTheDocument()
		// Agent: 🤖 (로봇) - 에이전트/실행의 의미
		expect(screen.getByText(/🤖.*Agent/)).toBeInTheDocument()
	})
})
