import { expect } from "@playwright/test"
import { test } from "./fixtures/e2e"
import { cleanChatView } from "./utils/helpers"

test.extend({
	// eslint-disable-next-line no-empty-pattern
	page: async ({ page, sidebar, helper }, use) => {
		await sidebar.show()
		await helper.run("Toggle_File_Watchers")
		await use(page)
	},
})

test("Diff editor", async ({ page, sidebar, helper }) => {
	const freeButton = sidebar.getByRole("button", { name: /Start for Free|Get Started for Free/ })
	await freeButton.click({ delay: 100 })
	// Submit a message
	await cleanChatView(page)
	const inputbox = sidebar.getByPlaceholder("Ask a question or type '/' for commands")
	await inputbox.fill("Hello, Caret!")
	await expect(inputbox).toHaveValue("Hello, Caret!")
	await sidebar.getByTestId("send-button").click({ delay: 100 })
	await expect(inputbox).toHaveValue("")

	// Back to home page with history
	await sidebar.getByRole("button", { name: "Start New Task" }).click()
	await expect(sidebar.getByText("Recent Tasks")).toBeVisible()
	await expect(sidebar.getByText("Hello, Caret!")).toBeVisible() // History with the previous sent message
	await expect(sidebar.getByText("Tokens:")).toBeVisible() // History with token usage

	// Wait for the sidebar to load the file edit request
	await sidebar.waitForSelector(
		'span:has-text("Caret wants to edit this file:"), span:has-text("Cline wants to edit this file:")',
	)

	// Diff Editor should open with the file name and diff
	await expect(page.getByText(/test\.ts: Original ↔ (Caret's|Cline's)/)).toBeVisible()
})
