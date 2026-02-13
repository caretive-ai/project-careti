import { expect } from "@playwright/test"
import { e2e, setupCaretiApiKey } from "./utils/helpers"

e2e("Chat - can send messages and switch between modes", async ({ sidebar, page }) => {
	// CARETI MODIFICATION: Use Careti onboarding flow with mock server to avoid hanging connections
	await setupCaretiApiKey(sidebar, true)

	// Submit a message
	const inputbox = sidebar.getByTestId("chat-input")
	await expect(inputbox).toBeVisible()
	await inputbox.fill("Hello, Careti!")
	await expect(inputbox).toHaveValue("Hello, Careti!")
	await sidebar.getByTestId("send-button").click()
	await expect(inputbox).toHaveValue("")

	// CARETI MODIFICATION: Wait for mock server response to complete before navigating
	await expect(sidebar.getByText(/mock.*API response|Generated UUID/i).first()).toBeVisible({ timeout: 10000 })

	// Starting a new task should clear the current chat view and show the recent tasks
	// CARETI MODIFICATION: Match both Cline and Caret button names
	const newTaskButton = sidebar.getByRole("button", { name: /New Task|Start New Task/i }).first()
	await newTaskButton.click()
	await expect(sidebar.getByText("Recent Tasks")).toBeVisible()
	await expect(sidebar.getByText("Hello, Careti!")).toBeVisible()

	// === slash commands preserve following text ===
	// CARETI MODIFICATION: Start new task to get back to chat view with empty input
	await expect(inputbox).toBeVisible()
	await expect(inputbox).toHaveValue("")
	// Type partial slash command to trigger menu
	await inputbox.fill("/newt")

	// Wait for menu to be visible and click on menu item
	await inputbox.focus()
	await sidebar.getByText("newtask", { exact: false }).click()
	await expect(inputbox).toHaveValue("/newtask ")

	// Add following text to verify it works correctly
	await inputbox.pressSequentially("following text should be preserved")
	await expect(inputbox).toHaveValue("/newtask following text should be preserved")

	// === @ mentions preserve following text ===
	await inputbox.fill("")
	await expect(inputbox).toHaveValue("")

	// Type partial @ mention to trigger menu
	await inputbox.fill("@prob")

	// Wait for menu to be visible and click on menu item
	await sidebar.getByText("Problems", { exact: false }).first().click()
	await expect(inputbox).toHaveValue("@problems ")

	// Add following text to verify it works correctly
	await inputbox.pressSequentially("following text should be preserved")
	await expect(inputbox).toHaveValue("@problems following text should be preserved")

})
