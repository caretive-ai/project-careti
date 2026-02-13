import { expect } from "@playwright/test"
import { addSelectedCodeToClineWebview, openTab, toggleNotifications } from "./utils/common"
import { E2E_WORKSPACE_TYPES, e2e, setupCaretiApiKey } from "./utils/helpers"

e2e.describe("Code Actions and Editor Panel", () => {
	E2E_WORKSPACE_TYPES.forEach(({ title, workspaceType }) => {
		e2e.extend({
			workspaceType,
		})(title, async ({ page, sidebar }) => {
			// CARETI MODIFICATION: Use Careti onboarding flow instead of Cline signin
			await setupCaretiApiKey(sidebar)
			// Sidebar - input should start empty
			const sidebarInput = sidebar.getByTestId("chat-input")
			await sidebarInput.click()
			await toggleNotifications(page)
			await expect(sidebarInput).toBeEmpty()

			// Open file tree and select code from file
			await openTab(page, "Explorer ")
			await page.getByRole("treeitem", { name: "index.html" }).locator("a").click()
			await expect(sidebarInput).not.toBeFocused()

			// Sidebar should be opened and visible after adding code to Cline
			await addSelectedCodeToClineWebview(page)
			await expect(sidebarInput).not.toBeEmpty()
			await expect(sidebarInput).toBeFocused()
		})
	})
})
