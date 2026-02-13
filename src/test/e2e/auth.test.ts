// CARETI MODIFICATION: Rewritten for Careti onboarding flow
// (Welcome → Get Started → API Setup → Provider Selection → Save Settings → Persona → Chat)
import { expect } from "@playwright/test"
import { e2e } from "./utils/helpers"

// Test for setting up API keys via Careti onboarding
e2e("Views - can set up API keys and navigate to Chat from onboarding", async ({ sidebar }) => {
	// === Step 1: Verify initial state - Welcome page with "Get Started" button ===
	const getStartedButton = sidebar.getByRole("button", { name: /Get Started|시작하기/i })
	await expect(getStartedButton).toBeVisible({ timeout: 15000 })

	// === Step 2: Navigate to API setup ===
	await getStartedButton.click()

	// Wait for API setup page to appear
	const apiSetupPage = sidebar.getByTestId("careti-api-setup-page")
	await expect(apiSetupPage).toBeVisible({ timeout: 5000 })

	// === Step 3: Verify provider selector is visible ===
	const providerSelectorInput = sidebar.getByTestId("provider-selector-input")
	await expect(providerSelectorInput).toBeVisible()

	// === Step 4: Test Careti provider option ===
	await providerSelectorInput.click({ delay: 100 })
	// Wait for dropdown and find Careti option
	const caretiOption = sidebar.getByTestId("provider-option-careti")
	await expect(caretiOption).toBeVisible()
	await caretiOption.click({ delay: 100 })
	// Careti provider shows Login button (not Sign Up)
	await expect(sidebar.getByRole("button", { name: /Login|로그인/i })).toBeVisible()

	// === Step 5: Switch to OpenRouter and complete setup ===
	await providerSelectorInput.click({ delay: 100 })
	await sidebar.getByTestId("provider-option-openrouter").click({ delay: 100 })

	const apiKeyInput = sidebar.getByRole("textbox", { name: /API Key/i })
	await apiKeyInput.fill("test-api-key")
	await expect(apiKeyInput).toHaveValue("test-api-key")

	// Wait for debounce
	await sidebar.page().waitForTimeout(300)

	// === Step 6: Save settings ===
	await sidebar.getByRole("button", { name: /Save Settings|설정 저장|Continue/i }).click()

	// === Step 7: Handle persona selector ===
	const personaButton = sidebar.getByRole("button", { name: /^Select$|^선택$/i })
	await expect(personaButton.first()).toBeVisible({ timeout: 8000 })
	await personaButton.first().click()

	// Wait for transition
	await sidebar.page().waitForTimeout(500)

	// === Step 8: Verify chat view ===
	const chatInputBox = sidebar.getByTestId("chat-input")
	await expect(chatInputBox).toBeVisible({ timeout: 10000 })

	// Welcome page should no longer be visible
	await expect(getStartedButton).not.toBeVisible()
	await expect(providerSelectorInput).not.toBeVisible()

	// === Step 9: Close announcement banner if visible ===
	const closeButton = sidebar.getByTestId("close-announcement-button")
	if (await closeButton.isVisible().catch(() => false)) {
		await closeButton.click()
		await expect(closeButton).not.toBeVisible()
	}
})
