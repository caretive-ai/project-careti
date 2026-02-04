// CARETI MODIFICATION: Simple test to verify chat functionality
import { expect } from "@playwright/test"
import { e2e, setupCaretiApiKey } from "./utils/helpers"

e2e("Simple chat test - send message and check response", async ({ sidebar }) => {
	await setupCaretiApiKey(sidebar)

	const inputbox = sidebar.getByTestId("chat-input")
	await expect(inputbox).toBeVisible()
	console.log("✅ Chat input visible")

	// Send a simple message
	await inputbox.fill("Say hello")
	console.log("✅ Message filled")

	const sendButton = sidebar.getByTestId("send-button")
	await sendButton.click()
	console.log("✅ Send button clicked")

	// Wait and check what happens
	await sidebar.page().waitForTimeout(3000)

	// Check for any error message or response
	const errorText = sidebar.getByText(/error|failed|invalid/i)
	const hasError = await errorText.isVisible().catch(() => false)
	console.log(`Error visible: ${hasError}`)

	// Check for cancel button (means streaming started)
	const cancelButton = sidebar.getByRole("button", { name: /Cancel/i })
	const hasCancelButton = await cancelButton.isVisible().catch(() => false)
	console.log(`Cancel button visible: ${hasCancelButton}`)

	// Check for any response text
	const responseArea = sidebar.locator('[data-testid="message-content"]')
	const hasResponse = await responseArea.first().isVisible().catch(() => false)
	console.log(`Response visible: ${hasResponse}`)

	// Take screenshot for debugging
	await sidebar.page().screenshot({ path: "/tmp/chat-test-result.png" })
	console.log("✅ Screenshot saved to /tmp/chat-test-result.png")
})
