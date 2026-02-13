import { mkdtempSync, type PathLike, readFileSync, type RmOptions, rmSync } from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { type ElectronApplication, expect, type Frame, type Page, test } from "@playwright/test"
import { downloadAndUnzipVSCode, SilentReporter } from "@vscode/test-electron"
import { _electron } from "playwright"
import { ClineApiServerMock } from "../fixtures/server"

// CARETI MODIFICATION: Load E2E test environment variables
function loadEnvFile(): Record<string, string> {
	const envVars: Record<string, string> = {}
	try {
		const envPath = path.join(__dirname, "../fixtures/workspace/evals.env")
		const content = readFileSync(envPath, "utf-8")
		for (const line of content.split("\n")) {
			const trimmed = line.trim()
			if (trimmed && !trimmed.startsWith("#")) {
				const [key, ...valueParts] = trimmed.split("=")
				const value = valueParts.join("=")
				if (key && value) {
					envVars[key] = value
				}
			}
		}
	} catch (error) {
		console.warn("⚠️ Could not load evals.env:", error)
	}
	return envVars
}

const e2eEnvVars = loadEnvFile()

interface E2ETestDirectories {
	workspaceDir: string
	multiRootWorkspaceDir: string
	userDataDir: string
	extensionsDir: string
}

export interface E2ETestConfigs {
	workspaceType: "single" | "multi"
	channel: "stable" | "insiders"
}

export class E2ETestHelper {
	// Constants
	public static readonly CODEBASE_ROOT_DIR = path.resolve(__dirname, "..", "..", "..", "..")
	public static readonly E2E_TESTS_DIR = path.join(E2ETestHelper.CODEBASE_ROOT_DIR, "src", "test", "e2e")

	// Instance properties for caching
	private cachedFrame: Frame | null = null

	// Path utilities
	public static escapeToPath(text: string): string {
		return text.trim().toLowerCase().replaceAll(/\W/g, "_")
	}

	public static getResultsDir(testName = "", label?: string): string {
		const testDir = path.join(
			E2ETestHelper.CODEBASE_ROOT_DIR,
			"test-results",
			"playwright",
			E2ETestHelper.escapeToPath(testName),
		)
		return label ? path.join(testDir, label) : testDir
	}

	/**
	 * Generates a filename for gRPC recorder logs based on test information
	 * @param testTitle The title of the test
	 * @param projectName The name of the test project (optional)
	 * @returns A sanitized filename suitable for gRPC recorder logs
	 */
	public static generateTestFileName(testTitle: string, projectName?: string): string {
		// Create a base name from the test title
		const baseName = E2ETestHelper.escapeToPath(testTitle)

		// Add project name if provided and different from default
		const projectSuffix = projectName && projectName !== "e2e tests" ? `_${E2ETestHelper.escapeToPath(projectName)}` : ""

		return `${baseName}${projectSuffix}`
	}

	public static async waitUntil(predicate: () => boolean | Promise<boolean>, maxDelay = 10000): Promise<void> {
		let delay = 10
		const start = Date.now()

		while (!(await predicate())) {
			if (Date.now() - start > maxDelay) {
				throw new Error(`waitUntil timeout after ${maxDelay}ms`)
			}
			await new Promise((resolve) => setTimeout(resolve, delay))
			delay = Math.min(delay << 1, 1000) // Cap at 1s
		}
	}

	public async getSidebar(page: Page): Promise<Frame> {
		const findSidebarFrame = async (): Promise<Frame | null> => {
			// Check cached frame first
			if (this.cachedFrame && !this.cachedFrame.isDetached()) {
				return this.cachedFrame
			}

			for (const frame of page.frames()) {
				if (frame.isDetached()) {
					continue
				}

				try {
					const title = await frame.title()
					if (title.startsWith("Cline") || title.startsWith("Caret")) {
						this.cachedFrame = frame
						return frame
					}
				} catch (error: any) {
					if (!error.message.includes("detached") && !error.message.includes("navigation")) {
						throw error
					}
				}
			}
			return null
		}

		await E2ETestHelper.waitUntil(async () => (await findSidebarFrame()) !== null)
		return (await findSidebarFrame()) || page.mainFrame()
	}

	public static async rmForRetries(path: PathLike, options?: RmOptions): Promise<void> {
		const maxAttempts = 3 // Reduced from 5

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				rmSync(path, options)
				return
			} catch (error) {
				if (attempt === maxAttempts) {
					throw new Error(`Failed to rmSync ${path} after ${maxAttempts} attempts: ${error}`)
				}
				await new Promise((resolve) => setTimeout(resolve, 50 * attempt)) // Progressive delay
			}
		}
	}

	public async signin(webview: Frame): Promise<void> {
		await webview.getByRole("button", { name: /Login to (Cline|Caret)/ }).click({ delay: 100 })

		// Verify start up page is no longer visible
		await expect(webview.getByRole("button", { name: /Login to (Cline|Caret)/ })).not.toBeVisible()
	}

	public static async openClineSidebar(page: Page): Promise<void> {
		await page.getByRole("tab", { name: /Cline|Caret/ }).locator("a").click()
	}

	public static async runCommandPalette(page: Page, command: string): Promise<void> {
		const editorMenu = page.locator("li").filter({ hasText: "[Extension Development Host]" }).first()
		await editorMenu.click({ delay: 100 })
		const editorSearchBar = page.getByRole("textbox", {
			name: "Search files by name (append",
		})
		await editorSearchBar.click({ delay: 100 }) // Ensure focus
		await editorSearchBar.fill(`>${command}`)
		await page.keyboard.press("Enter")
	}

	// Clear cached frame when needed
	public clearCachedFrame(): void {
		this.cachedFrame = null
	}
}

/**
 * NOTE: Use the `e2e` test fixture for all E2E tests to test the Cline extension.
 *
 * Extended Playwright test configuration for Cline E2E testing.
 *
 * This test configuration provides a comprehensive setup for end-to-end testing of the Cline VS Code extension,
 * including server mocking, temporary directories, VS Code instance management, and helper utilities.
 *
 * NOTE: Default to run in single-root workspace; use `e2eMultiRoot` for multi-root workspace tests.
 *
 * @extends test - Base Playwright test with multiple fixture extensions
 *
 * Fixtures provided:
 * - `server`: Shared ClineApiServerMock instance for API mocking (reused across all tests)
 * - `workspaceDir`: Path to the test workspace directory
 * - `userDataDir`: Temporary directory for VS Code user data
 * - `extensionsDir`: Temporary directory for VS Code extensions
 * - `openVSCode`: Function that returns a Promise resolving to an ElectronApplication instance
 * - `app`: ElectronApplication instance with automatic cleanup
 * - `helper`: E2ETestHelper instance for test utilities
 * - `page`: Playwright Page object representing the main VS Code window with Cline sidebar opened
 * - `sidebar`: Playwright Frame object representing the Cline extension's sidebar iframe
 *
 * @returns Extended test object with all fixtures available for E2E test scenarios:
 * - **server**: Automatically starts and manages a ClineApiServerMock instance
 * - **workspaceDir**: Sets up a test workspace directory from fixtures
 * - **userDataDir**: Creates a temporary directory for VS Code user data
 * - **extensionsDir**: Creates a temporary directory for VS Code extensions
 * - **openVSCode**: Factory function that launches VS Code with proper configuration for testing
 * - **app**: Manages the VS Code ElectronApplication lifecycle with automatic cleanup
 * - **helper**: Provides E2ETestHelper utilities for test operations
 * - **page**: Configures the main VS Code window with notifications disabled and Cline sidebar open
 * - **sidebar**: Provides access to the Cline extension's sidebar frame
 *
 * @example
 * ```typescript
 * e2e('should perform basic operations', async ({ sidebar, helper }) => {
 *   // Test implementation using the configured sidebar and helper
 * });
 * ```
 *
 * @remarks
 * - Automatically handles VS Code download and setup
 * - Installs the Cline extension in development mode
 * - Records test videos for debugging
 * - Performs cleanup of temporary directories after each test
 * - Configures VS Code with disabled updates, workspace trust, and welcome screens
 */
export const e2e = test
	.extend<{ server: ClineApiServerMock | null }>({
		server: async ({}, use) => {
			// Start server if it doesn't exist
			if (!ClineApiServerMock.globalSharedServer) {
				await ClineApiServerMock.startGlobalServer()
			}
			await use(ClineApiServerMock.globalSharedServer)
		},
	})
	.extend<E2ETestDirectories>({
		workspaceDir: async ({}, use) => {
			await use(path.join(E2ETestHelper.E2E_TESTS_DIR, "fixtures", "workspace"))
		},
		multiRootWorkspaceDir: async ({}, use) => {
			// DOCS: https://code.visualstudio.com/docs/editing/workspaces/multi-root-workspaces
			await use(path.join(E2ETestHelper.E2E_TESTS_DIR, "fixtures", "multiroots.code-workspace"))
		},
		userDataDir: async ({}, use) => {
			await use(mkdtempSync(path.join(os.tmpdir(), "vsce")))
		},
		extensionsDir: async ({}, use) => {
			await use(mkdtempSync(path.join(os.tmpdir(), "vsce")))
		},
	})
	.extend<E2ETestConfigs>({
		workspaceType: "single",
		channel: "stable",
	})
	.extend<{ openVSCode: (workspacePath: string) => Promise<ElectronApplication> }>({
		openVSCode: async ({ userDataDir, channel }, use, testInfo) => {
			const executablePath = await downloadAndUnzipVSCode(channel, undefined, new SilentReporter())

			await use(async (workspacePath: string) => {
				const app = await _electron.launch({
					executablePath,
					env: {
						...process.env,
						...e2eEnvVars, // CARETI MODIFICATION: Pass E2E env vars (GEMINI_TOKEN, etc.)
						TEMP_PROFILE: "true",
						E2E_TEST: "true",
						CLINE_ENVIRONMENT: "local",
						GRPC_RECORDER_FILE_NAME: E2ETestHelper.generateTestFileName(testInfo.title, testInfo.project.name),
						// GRPC_RECORDER_ENABLED: "true",
						// GRPC_RECORDER_TESTS_FILTERS_ENABLED: "true"
						// IS_DEV: "true",
						// DEV_WORKSPACE_FOLDER: E2ETestHelper.CODEBASE_ROOT_DIR,
					},
					recordVideo: {
						dir: E2ETestHelper.getResultsDir(testInfo.title, "recordings"),
					},
					args: [
						"--no-sandbox",
						"--disable-updates",
						"--disable-workspace-trust",
						"--disable-extensions", // Run VS Code with all extensions disabled other than the one under test.
						"--skip-welcome",
						"--skip-release-notes",
						`--user-data-dir=${userDataDir}`,
						`--install-extension=${path.join(E2ETestHelper.CODEBASE_ROOT_DIR, "dist", "e2e.vsix")}`,
						`--extensionDevelopmentPath=${E2ETestHelper.CODEBASE_ROOT_DIR}`,
						workspacePath,
					],
				})
				await E2ETestHelper.waitUntil(() => app.windows().length > 0)
				return app
			})
		},
	})
	.extend<{ app: ElectronApplication }>({
		app: async ({ openVSCode, userDataDir, extensionsDir, workspaceType, workspaceDir, multiRootWorkspaceDir }, use) => {
			const workspacePath = workspaceType === "single" ? workspaceDir : multiRootWorkspaceDir
			const app = await openVSCode(workspacePath)

			try {
				await use(app)
			} finally {
				await app.close()
				// Cleanup in parallel
				await Promise.allSettled([
					E2ETestHelper.rmForRetries(userDataDir, { recursive: true }),
					E2ETestHelper.rmForRetries(extensionsDir, { recursive: true }),
				])
			}
		},
	})
	.extend<{ helper: E2ETestHelper }>({
		helper: async ({}, use) => {
			const helper = new E2ETestHelper()
			await use(helper)
		},
	})
	.extend({
		page: async ({ app }, use) => {
			const page = await app.firstWindow()
			try {
				await use(page)
			} finally {
				// Ensure proper cleanup: Close the page if it's still open and not already closed by app.close()
				// This provides a common teardown mechanism for all e2e tests without requiring explicit page.close() calls
				if (!page.isClosed()) {
					await page.close()
				}
			}
		},
	})
	.extend<{ sidebar: Frame }>({
		sidebar: async ({ page, helper, server }, use) => {
			await E2ETestHelper.openClineSidebar(page)
			const sidebar = await helper.getSidebar(page)
			await use(sidebar)
		},
	})

export const E2E_WORKSPACE_TYPES = [
	{ title: "Single Root", workspaceType: "single" },
	{ title: "Multi-Roots", workspaceType: "multi" },
] as const

/**
 * CARETI MODIFICATION: Careti 온보딩 플로우를 통해 API 설정
 * Flow: Welcome → Get Started → API Setup → Save Settings → Persona Selector → Chat View
 *
 * @param useMockServer - If true, use OpenAI Compatible provider with mock server URL
 *                        for tests that need controlled streaming responses (diff, cancel).
 *                        If false (default), use OpenRouter with a fake key (simplest setup).
 */
export async function setupCaretiApiKey(sidebar: Frame, useMockServer = false): Promise<void> {
	const log = (msg: string) => console.log(`[setupCaretiApiKey] ${msg}`)
	const screenshot = async (label: string) => {
		await sidebar.page().screenshot({ path: `/tmp/e2e-setup-${label}.png` })
		log(`Screenshot saved: /tmp/e2e-setup-${label}.png`)
	}

	const chatInputBox = sidebar.getByTestId("chat-input")
	const getStartedButton = sidebar.getByRole("button", { name: /Get Started|시작하기/i })

	// Wait for either chat input or "Get Started" button to appear (webview loading)
	log("Waiting for webview to load...")
	try {
		await expect(chatInputBox.or(getStartedButton)).toBeVisible({ timeout: 15000 })
	} catch {
		log("Timed out waiting for webview")
		await screenshot("01-webview-timeout")
		await expect(chatInputBox).toBeVisible({ timeout: 10000 })
		return
	}

	// Check which state we're in
	const isChatInputVisible = await chatInputBox.isVisible().catch(() => false)
	if (isChatInputVisible) {
		log("Chat input already visible, skipping onboarding")
		return
	}

	const isGetStartedVisible = await getStartedButton.isVisible().catch(() => false)
	log(`UI State: GetStarted=${isGetStartedVisible}, ChatInput=${isChatInputVisible}`)

	if (!isGetStartedVisible) {
		log("Unexpected state - neither visible after .or() wait")
		await screenshot("01-unexpected-state")
		await expect(chatInputBox).toBeVisible({ timeout: 15000 })
		return
	}

	// === Step 1: Click "Get Started" ===
	log("Step 1: Clicking Get Started...")
	await getStartedButton.click()
	await sidebar.page().waitForTimeout(500)

	// === Step 2: Wait for API setup page ===
	const apiSetupPage = sidebar.getByTestId("careti-api-setup-page")
	try {
		await apiSetupPage.waitFor({ state: "visible", timeout: 5000 })
		log("Step 2: API setup page visible")
	} catch {
		log("Step 2: API setup page NOT found by testid, continuing anyway...")
		await screenshot("03-no-api-setup-page")
	}

	// === Step 3: Select provider ===
	const providerSelector = sidebar.getByTestId("provider-selector-input")
	const isProviderVisible = await providerSelector.isVisible().catch(() => false)
	log(`Step 3: Provider selector visible=${isProviderVisible}, useMockServer=${useMockServer}`)

	if (isProviderVisible) {
		await providerSelector.click({ delay: 100 })
		await sidebar.page().waitForTimeout(300)

		if (useMockServer) {
			// Use OpenAI Compatible provider to route chat through mock server
			const openaiOption = sidebar.getByTestId("provider-option-openai")
			if (await openaiOption.isVisible().catch(() => false)) {
				await openaiOption.click({ delay: 100 })
				await sidebar.page().waitForTimeout(300)
				log("Step 3: Selected OpenAI Compatible provider (mock server mode)")
			}
		} else {
			// Use OpenRouter (simplest: only needs API key)
			const openrouterOption = sidebar.getByTestId("provider-option-openrouter")
			if (await openrouterOption.isVisible().catch(() => false)) {
				await openrouterOption.click({ delay: 100 })
				await sidebar.page().waitForTimeout(300)
				log("Step 3: Selected OpenRouter provider")
			}
		}
	}

	// === Step 4: Fill provider fields ===
	const testApiKey = "test-e2e-api-key"

	if (useMockServer) {
		// OpenAI Compatible: needs Base URL + API Key + Model ID
		// Fill Base URL
		const baseUrlField = sidebar.getByRole("textbox", { name: /Base URL/i })
		if (await baseUrlField.isVisible().catch(() => false)) {
			await baseUrlField.fill("http://localhost:7777/api/v1")
			log("Step 4: Base URL set to mock server")
		}
		await sidebar.page().waitForTimeout(200)

		// Fill API Key
		const apiKeyField = sidebar.getByRole("textbox", { name: /API Key/i })
		if (await apiKeyField.isVisible().catch(() => false)) {
			await apiKeyField.fill(testApiKey)
			log("Step 4: API key filled")
		}
		await sidebar.page().waitForTimeout(200)

		// Fill Model ID
		const modelIdField = sidebar.getByRole("textbox", { name: /Model ID/i })
		if (await modelIdField.isVisible().catch(() => false)) {
			await modelIdField.fill("gpt-4")
			log("Step 4: Model ID filled")
		}
	} else {
		// OpenRouter: only needs API key
		const apiKeyByRole = sidebar.getByRole("textbox", { name: /API Key/i })
		if (await apiKeyByRole.isVisible().catch(() => false)) {
			await apiKeyByRole.fill(testApiKey)
			log("Step 4: API key filled (by role)")
		} else {
			const apiKeyByInput = sidebar.locator('vscode-text-field[type="password"] input, input[type="password"]').first()
			if (await apiKeyByInput.isVisible().catch(() => false)) {
				await apiKeyByInput.fill(testApiKey)
				log("Step 4: API key filled (by input selector)")
			} else {
				log("Step 4: WARNING - Could not find API key input!")
				await screenshot("06-no-api-key-input")
			}
		}
	}
	// Wait for debounce to propagate
	await sidebar.page().waitForTimeout(300)

	// === Step 5: Click Save Settings ===
	const saveButton = sidebar.getByRole("button", { name: /Save Settings|저장|Continue/i })
	const isSaveVisible = await saveButton.isVisible().catch(() => false)
	log(`Step 5: Save button visible=${isSaveVisible}`)

	if (isSaveVisible) {
		await saveButton.click()
		await sidebar.page().waitForTimeout(500)
		log("Step 5: Clicked Save Settings")
	} else {
		log("Step 5: WARNING - Save button not found!")
		await screenshot("07-no-save-button")
	}

	// === Step 6: Handle persona selector ===
	// Button text: "Select" (en) / "선택" (ko) / fallback "Select This Persona"
	// VSCodeButton renders as <vscode-button> web component - try multiple selectors
	let personaClicked = false

	// Strategy 1: getByRole button with Select text
	try {
		const personaByRole = sidebar.getByRole("button", { name: /^Select$|^선택$|Select This Persona/i })
		await personaByRole.first().waitFor({ state: "visible", timeout: 8000 })
		await personaByRole.first().click()
		personaClicked = true
		log("Step 6: Persona selected (by role)")
	} catch {
		log("Step 6: getByRole failed, trying text-based...")
	}

	// Strategy 2: Click text "Select" directly
	if (!personaClicked) {
		try {
			const personaByText = sidebar.getByText(/^Select$|^선택$/, { exact: true }).last()
			await personaByText.waitFor({ state: "visible", timeout: 3000 })
			await personaByText.click()
			personaClicked = true
			log("Step 6: Persona selected (by text)")
		} catch {
			log("Step 6: getByText failed, trying CSS selector...")
		}
	}

	// Strategy 3: CSS selector for vscode-button containing "Select"
	if (!personaClicked) {
		try {
			const personaByCss = sidebar.locator('vscode-button:has-text("Select")').last()
			await personaByCss.waitFor({ state: "visible", timeout: 3000 })
			await personaByCss.click()
			personaClicked = true
			log("Step 6: Persona selected (by CSS)")
		} catch {
			log("Step 6: All persona strategies failed")
			await screenshot("09-no-persona")
		}
	}

	if (personaClicked) {
		await sidebar.page().waitForTimeout(500)
	}

	// === Step 7: Wait for chat input ===
	const finalChatVisible = await chatInputBox.isVisible().catch(() => false)
	log(`Step 7: Chat input visible=${finalChatVisible}`)

	if (!finalChatVisible) {
		// Recovery: check if we're stuck on a banner or announcement
		const closeAnnouncement = sidebar.getByTestId("close-announcement-button")
		if (await closeAnnouncement.isVisible().catch(() => false)) {
			await closeAnnouncement.click()
			await sidebar.page().waitForTimeout(500)
		}

		const closeBanner = sidebar.getByTestId("close-button")
		if (await closeBanner.isVisible().catch(() => false)) {
			await closeBanner.click()
			await sidebar.page().waitForTimeout(500)
		}
	}

	await expect(chatInputBox).toBeVisible({ timeout: 20000 })

	// Close release/announcement banners if visible
	const closeButton = sidebar.getByTestId("close-announcement-button")
	if (await closeButton.isVisible().catch(() => false)) {
		await closeButton.click()
	}

	log("Onboarding complete, chat input visible")
}
