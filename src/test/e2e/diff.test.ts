import { expect } from "@playwright/test"
import { E2E_WORKSPACE_TYPES, e2e, setupCaretiApiKey } from "./utils/helpers"

e2e.describe("Diff Editor", () => {
	E2E_WORKSPACE_TYPES.forEach(({ title, workspaceType }) => {
		e2e.extend({
			workspaceType,
		})(title, async ({ page, sidebar }) => {
			// CARETI MODIFICATION: Use Careti onboarding flow with mock server for streaming responses
			await setupCaretiApiKey(sidebar, true)

			const inputbox = sidebar.getByTestId("chat-input")
			await expect(inputbox).toBeVisible()

			await inputbox.fill("[diff.test.ts] Hello, Careti!")
			await expect(inputbox).toHaveValue("[diff.test.ts] Hello, Careti!")
			await sidebar.getByTestId("send-button").click()
			await expect(inputbox).toHaveValue("")

			// CARETI MODIFICATION: Wait for mock server response instead of checking loading text
			// Mock server returns "Hello! I'm a mock Cline API response." for this message
			await expect(sidebar.getByText(/mock.*API response|Generated UUID/i).first()).toBeVisible({ timeout: 10000 })

			// Back to home page with history
			// CARETI MODIFICATION: Match both button names
			await sidebar.getByRole("button", { name: /New Task|Start New Task/i }).first().click()
			await expect(sidebar.getByText("Recent Tasks")).toBeVisible()
			await expect(sidebar.getByText("Hello, Careti!")).toBeVisible() // History with the previous sent message

			// Submit a file edit request
			await sidebar.getByTestId("chat-input").click()
			await sidebar.getByTestId("chat-input").fill("edit_request")
			await sidebar.getByTestId("send-button").click({ delay: 50 })

			// Wait for the sidebar to load the file edit request
			// CARETI MODIFICATION: match both Cline and Caret branding
			await sidebar.waitForSelector('span:has-text("wants to edit this file:")')

			// Diff Editor should open with the file name and diff
			await expect(page.getByText(/test\.ts: Original ↔ (Cline|Caret)'s/)).toBeVisible()

			// Diff editor should show the original and modified content
			const diffEditor = page.locator(
				".monaco-editor.modified-in-monaco-diff-editor > .overflow-guard > .monaco-scrollable-element.editor-scrollable > .lines-content > div:nth-child(4)",
			)
			await diffEditor.click()
			await expect(diffEditor).toBeVisible()

		})
	})
})
