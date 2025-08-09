// TDD GREEN Phase: UI 색깔 통일성 테스트 (실제 파일 검증)
import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

describe("UI Color Consistency", () => {
	describe("Chatbot/Agent Mode Button Colors", () => {
		// 실제 ChatTextArea.tsx 파일에서 색깔 값을 추출하는 헬퍼 함수
		const getChatTextAreaColors = () => {
			const filePath = join(process.cwd(), "caret-caret-webview-ui/src/components/chat/ChatTextArea.tsx")
			const fileContent = readFileSync(filePath, "utf-8")

			// CHATBOT_MODE_COLOR 값 추출
			const chatbotColorMatch = fileContent.match(/const CHATBOT_MODE_COLOR = "([^"]+)"/)
			const chatbotColor = chatbotColorMatch ? chatbotColorMatch[1] : null

			// Slider 컴포넌트에서 agent color 추출 (var(--vscode-focusBorder))
			const agentColorMatch = fileContent.match(/: "var\(--vscode-focusBorder\)"\)/)
			const agentColor = agentColorMatch ? "var(--vscode-focusBorder)" : null

			return { chatbotColor, agentColor }
		}

		it("should have chatbot button color with high visibility", () => {
			const { chatbotColor } = getChatTextAreaColors()

			// 가시성이 부족한 색깔은 사용하지 않아야 함
			expect(chatbotColor).not.toBe("var(--vscode-textLink-foreground)")
			expect(chatbotColor).toBeDefined()
		})

		it("should have consistent visibility between chatbot and agent buttons", () => {
			const { chatbotColor, agentColor } = getChatTextAreaColors()

			// 두 버튼이 동일한 가시성을 가져야 함
			expect(chatbotColor).toBe(agentColor)
		})

		it("should use VSCode theme-aware color for better accessibility", () => {
			const { chatbotColor } = getChatTextAreaColors()

			// focusBorder 또는 더 선명한 색깔을 사용해야 함
			const expectedColors = [
				"var(--vscode-focusBorder)",
				"var(--vscode-button-background)",
				"var(--vscode-progressBar-background)",
			]

			expect(expectedColors).toContain(chatbotColor)
		})
	})
})
