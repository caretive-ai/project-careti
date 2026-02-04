// CARETI MODIFICATION: E2E tests for cancel/interrupt functionality
import { expect } from "@playwright/test"
import { e2e, setupCaretiApiKey } from "./utils/helpers"

e2e.describe("Cancel and Interrupt System", () => {
	e2e("should show cancel button during streaming", async ({ sidebar }) => {
		// Setup Careti API key
		await setupCaretiApiKey(sidebar)

		// Verify chat input is visible and scroll into view
		const inputbox = sidebar.getByTestId("chat-input")
		await expect(inputbox).toBeVisible()
		await inputbox.scrollIntoViewIfNeeded()
		await inputbox.focus()

		// Send a message to trigger streaming - use type() instead of fill()
		await inputbox.click()
		await inputbox.type("Hello, please respond with a long message", { delay: 50 })
		await inputbox.press("Enter")

		// Wait for streaming to start - cancel button should appear
		const cancelButton = sidebar.getByRole("button", { name: /Cancel/i })
		await expect(cancelButton).toBeVisible({ timeout: 15000 })

		// Wait for streaming to complete
		await expect(cancelButton).not.toBeVisible({ timeout: 30000 })
	})

	e2e("should cancel streaming when cancel button clicked", async ({ sidebar }) => {
		// Setup Careti API key
		await setupCaretiApiKey(sidebar)

		const inputbox = sidebar.getByTestId("chat-input")
		await expect(inputbox).toBeVisible()
		await inputbox.scrollIntoViewIfNeeded()
		await inputbox.focus()

		// Send a message - use type() and Enter
		await inputbox.click()
		await inputbox.type("Generate a very long response please", { delay: 50 })
		await inputbox.press("Enter")

		// Wait for cancel button to appear (streaming started)
		const cancelButton = sidebar.getByRole("button", { name: /Cancel/i })
		await expect(cancelButton).toBeVisible({ timeout: 10000 })

		// Click cancel button
		await cancelButton.click()

		// Cancel button should disappear after cancellation
		await expect(cancelButton).not.toBeVisible({ timeout: 5000 })

		// After cancel, input should be enabled again
		await expect(inputbox).toBeVisible()
	})

	e2e("should allow keyboard shortcut to cancel (Escape)", async ({ sidebar, page }) => {
		// Setup Careti API key
		await setupCaretiApiKey(sidebar)

		const inputbox = sidebar.getByTestId("chat-input")
		await expect(inputbox).toBeVisible()
		await inputbox.scrollIntoViewIfNeeded()
		await inputbox.focus()

		// Send a message - use type() and Enter
		await inputbox.click()
		await inputbox.type("Hello, streaming test", { delay: 50 })
		await inputbox.press("Enter")

		// Wait for streaming to start
		const cancelButton = sidebar.getByRole("button", { name: /Cancel/i })
		await expect(cancelButton).toBeVisible({ timeout: 10000 })

		// Press Escape to cancel
		await page.keyboard.press("Escape")

		// Cancel button should disappear
		await expect(cancelButton).not.toBeVisible({ timeout: 5000 })
	})

	e2e("should show resume button after cancel", async ({ sidebar }) => {
		// Setup Careti API key
		await setupCaretiApiKey(sidebar)

		const inputbox = sidebar.getByTestId("chat-input")
		await expect(inputbox).toBeVisible()
		await inputbox.scrollIntoViewIfNeeded()
		await inputbox.focus()

		// Send a message - use type() and Enter
		await inputbox.click()
		await inputbox.type("Test message for cancel and resume", { delay: 50 })
		await inputbox.press("Enter")

		// Wait for cancel button
		const cancelButton = sidebar.getByRole("button", { name: /Cancel/i })
		await expect(cancelButton).toBeVisible({ timeout: 10000 })

		// Cancel the task
		await cancelButton.click()

		// Resume button should appear (or similar UI to continue)
		const resumeButton = sidebar.getByRole("button", { name: /Resume|Continue|Retry/i })
		await expect(resumeButton).toBeVisible({ timeout: 5000 })
	})
})
