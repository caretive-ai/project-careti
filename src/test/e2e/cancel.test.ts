// CARETI MODIFICATION: E2E tests for cancel/interrupt functionality
// Uses Escape key pattern for cancellation (more reliable than button clicks)
import { expect } from "@playwright/test"
import { e2e, setupCaretiApiKey } from "./utils/helpers"

e2e.describe("Cancel and Interrupt System", () => {
	e2e("should show cancel button during streaming and cancel via Escape", async ({ sidebar, page }) => {
		// Setup Careti API key with mock server for controlled streaming
		await setupCaretiApiKey(sidebar, true)

		const inputbox = sidebar.getByTestId("chat-input")
		await expect(inputbox).toBeVisible()
		await inputbox.scrollIntoViewIfNeeded()
		await inputbox.focus()

		// Send a message to trigger streaming
		await inputbox.click()
		await inputbox.type("Hello, please respond with a long message", { delay: 30 })
		await inputbox.press("Enter")

		// Cancel button should appear during streaming
		const cancelButton = sidebar.getByRole("button", { name: /Cancel/i })
		await expect(cancelButton).toBeVisible({ timeout: 15000 })

		// Cancel using Escape key (double-press pattern)
		await page.keyboard.press("Escape")
		await sidebar.page().waitForTimeout(500)
		await page.keyboard.press("Escape")

		// Cancel button should disappear
		await expect(cancelButton).not.toBeVisible({ timeout: 10000 })

		// Input should be enabled again after cancel
		await expect(inputbox).toBeVisible()
	})

	e2e("should show resume button after cancel", async ({ sidebar, page }) => {
		// Setup Careti API key with mock server
		await setupCaretiApiKey(sidebar, true)

		const inputbox = sidebar.getByTestId("chat-input")
		await expect(inputbox).toBeVisible()
		await inputbox.scrollIntoViewIfNeeded()
		await inputbox.focus()

		// Send a message
		await inputbox.click()
		await inputbox.type("Test message for cancel and resume", { delay: 30 })
		await inputbox.press("Enter")

		// Wait for cancel button
		const cancelButton = sidebar.getByRole("button", { name: /Cancel/i })
		await expect(cancelButton).toBeVisible({ timeout: 10000 })

		// Cancel using Escape
		await page.keyboard.press("Escape")
		await sidebar.page().waitForTimeout(500)
		await page.keyboard.press("Escape")

		// Wait for cancel to complete
		await expect(cancelButton).not.toBeVisible({ timeout: 10000 })

		// Resume button should appear
		const resumeButton = sidebar.getByRole("button", { name: /Resume|Continue|Retry/i })
		await expect(resumeButton).toBeVisible({ timeout: 10000 })
	})
})
