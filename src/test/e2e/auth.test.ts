import { expect, test } from "@playwright/test"
import { Sidebar } from "./fixtures/sidebar"

test("can sign in with API key", async ({ page }) => {
	const sidebar = new Sidebar(page)
	await sidebar.show()

	// Verify initial state - try both new and old button texts
	const freeButton = sidebar.getByRole("button", { name: /Start for Free|Get Started for Free/ })
	const ownKeyButton = sidebar.getByRole("button", { name: /Use Your Own API Key|Use your own API key/ })
	await expect(freeButton).toBeVisible()
	await expect(ownKeyButton).toBeVisible()

	await ownKeyButton.click()

	// Wait for API key input to appear
	const apiKeyInput = sidebar.getByPlaceholder("Enter your API key")
	await expect(apiKeyInput).toBeVisible()

	// Test Caret/Cline provider option
	await sidebar.getByTestId("provider-select").click({ delay: 100 })

	// Wait for dropdown to appear and find Caret or Cline option
	const caretOption = sidebar.getByTestId("provider-option-caret")
	const clineOption = sidebar.getByTestId("provider-option-cline")
	try {
		await expect(caretOption).toBeVisible({ timeout: 2000 })
		await caretOption.click({ delay: 100 })
		await expect(sidebar.getByRole("button", { name: /Sign Up with Caret|Sign Up with Cline/ })).toBeVisible()
	} catch {
		await expect(clineOption).toBeVisible()
		await clineOption.click({ delay: 100 })
		await expect(sidebar.getByRole("button", { name: /Sign Up with Caret|Sign Up with Cline/ })).toBeVisible()
	}

	// Enter API key and submit
	await apiKeyInput.fill("test-api-key")
	const submitButton = sidebar.getByRole("button", { name: /Let's Go!|Let's go!/ })
	await submitButton.click()

	// Verify that the welcome screen is gone
	await expect(freeButton).not.toBeVisible()

	// Verify that the chat view is visible
	const chatInput = sidebar.getByPlaceholder("Ask a question or type '/' for commands")
	await expect(chatInput).toBeVisible()

	// Verify that the logo is visible
	const logo = sidebar.getByRole("img").filter({ hasText: /^$/ }).locator("path")
	await expect(logo).toBeVisible()

	// Verify the help improve banner is visible and can be closed.
	const helpBanner = sidebar.getByText(/Help Improve (Caret|Cline)/)
	await expect(helpBanner).toBeVisible()
	await sidebar.getByRole("button", { name: "Close banner and enable" }).click()
	await expect(helpBanner).not.toBeVisible()
})
