// CARETI MODIFICATION: E2E tests for cancel/interrupt functionality
import { expect } from "@playwright/test"
import { e2e, setupCaretiApiKey } from "./utils/helpers"

e2e.describe("Cancel and Interrupt System", () => {
	e2e("should show cancel button during streaming", async ({ sidebar }) => {
		// Setup Careti API key
		await setupCaretiApiKey(sidebar)

		// DEBUG: Screenshot after setup
		await sidebar.page().screenshot({ path: "/tmp/e2e-1-after-setup.png" })
		console.log("📸 Screenshot 1: After setup")

		// Verify chat input is visible and scroll into view
		const inputbox = sidebar.getByTestId("chat-input")
		await expect(inputbox).toBeVisible()
		await inputbox.scrollIntoViewIfNeeded()
		await inputbox.focus()

		// DEBUG: Screenshot before sending message
		await sidebar.page().screenshot({ path: "/tmp/e2e-2-before-message.png" })
		console.log("📸 Screenshot 2: Before message")

		// Send a message to trigger streaming - use type() instead of fill()
		await inputbox.click()
		await inputbox.type("Hello, please respond with a long message", { delay: 50 })
		await inputbox.press("Enter")

		// DEBUG: Screenshot after sending message
		await sidebar.page().waitForTimeout(2000)
		await sidebar.page().screenshot({ path: "/tmp/e2e-3-after-message.png" })
		console.log("📸 Screenshot 3: After message (2s)")

		// Wait for streaming to start - cancel button should appear
		const cancelButton = sidebar.getByRole("button", { name: /Cancel/i })
		await expect(cancelButton).toBeVisible({ timeout: 15000 })

		// DEBUG: Screenshot when cancel button visible
		await sidebar.page().screenshot({ path: "/tmp/e2e-4-cancel-visible.png" })
		console.log("📸 Screenshot 4: Cancel button visible")

		// CARETI MODIFICATION: Cancel the streaming using double-press pattern instead of waiting
		// This makes the test more reliable and faster
		await cancelButton.click()
		await sidebar.page().waitForTimeout(500)
		await cancelButton.click()

		// Wait for cancel to complete
		await expect(cancelButton).not.toBeVisible({ timeout: 10000 })

		// DEBUG: Screenshot after cancel
		await sidebar.page().screenshot({ path: "/tmp/e2e-5-after-cancel.png" })
		console.log("📸 Screenshot 5: After cancel")
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

		// CARETI MODIFICATION: Double-press pattern requires two clicks to cancel
		// First click shows warning "Press again to cancel"
		await cancelButton.click()
		await sidebar.page().waitForTimeout(500)
		// Second click actually cancels
		await cancelButton.click()

		// Cancel button should disappear after cancellation
		await expect(cancelButton).not.toBeVisible({ timeout: 10000 })

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

		// CARETI MODIFICATION: Double-press pattern requires pressing Escape twice
		// First press shows warning
		await page.keyboard.press("Escape")
		await sidebar.page().waitForTimeout(500)
		// Second press actually cancels
		await page.keyboard.press("Escape")

		// Cancel button should disappear
		await expect(cancelButton).not.toBeVisible({ timeout: 10000 })
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

		// CARETI MODIFICATION: Cancel the task using double-press pattern
		await cancelButton.click()
		await sidebar.page().waitForTimeout(500)
		await cancelButton.click()

		// Resume button should appear (or similar UI to continue)
		const resumeButton = sidebar.getByRole("button", { name: /Resume|Continue|Retry/i })
		await expect(resumeButton).toBeVisible({ timeout: 10000 })
	})
})
