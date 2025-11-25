import { refreshClineRulesToggles } from "@core/context/instructions/user-instructions/cline-rules"
import { refreshExternalRulesToggles } from "@core/context/instructions/user-instructions/external-rules"
import * as fs from "fs/promises"
import * as path from "path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import * as vscode from "vscode"

import { Controller } from "@/core/controller"

vi.mock("@/services/logging/Logger")
vi.mock("@/services/mcp/McpHub")
vi.mock("@/hosts/host-provider", () => ({
	HostProvider: {
		get: vi.fn(() => ({
			logToChannel: vi.fn(),
		})),
	},
}))
vi.mock("vscode", () => ({
	workspace: {
		getConfiguration: vi.fn().mockReturnValue({
			get: vi.fn(),
		}),
	},
	Uri: {
		file: (path: string) => ({ fsPath: path, with: vi.fn(), toString: () => path }),
	},
	env: {
		uriScheme: "vscode",
		onDidChangeTelemetryEnabled: vi.fn(),
	},
}))

import { StateManager } from "@/core/storage/StateManager"
import { AuthService } from "@/services/auth/AuthService"

// Mock dependencies
vi.mock("@/core/storage/StateManager")
vi.mock("@/services/auth/AuthService")

describe("Rule Discovery System Test", () => {
	let controller: Controller
	const workspaceDir = path.join(process.cwd(), ".tmp-rule-discovery-workspace")

	beforeEach(async () => {
		await fs.rm(workspaceDir, { recursive: true, force: true }).catch(() => undefined)
		await fs.mkdir(workspaceDir, { recursive: true })

		const workspaceState = new Map<string, unknown>()
		workspaceState.set("localCaretRulesToggles", {})
		workspaceState.set("localClineRulesToggles", {})
		workspaceState.set("localCursorRulesToggles", {})
		workspaceState.set("localWindsurfRulesToggles", {})

		const mockStateManager = {
			initialize: vi.fn().mockResolvedValue(undefined),
			getWorkspaceStateKey: vi.fn((key: string) => workspaceState.get(key)),
			setWorkspaceState: vi.fn((key: string, value: unknown) => workspaceState.set(key, value)),
			getApiConfiguration: vi.fn().mockReturnValue({}),
			getGlobalStateKey: vi.fn(),
			setGlobalState: vi.fn(),
			onPersistenceError: vi.fn(),
		}
		const StateManagerMock = StateManager as unknown as {
			mockImplementation: (impl: () => unknown) => void
		}
		StateManagerMock.mockImplementation(() => mockStateManager)

		const mockAuthService = {
			restoreRefreshTokenAndRetrieveAuthInfo: vi.fn(),
		}
		const getAuthServiceMock = AuthService.getInstance as unknown as {
			mockReturnValue: (value: unknown) => void
		}
		getAuthServiceMock.mockReturnValue(mockAuthService)

		const context = {
			globalStorageUri: vscode.Uri.file(path.join(workspaceDir, ".global")),
			workspaceState: { get: vi.fn(), update: vi.fn() },
			extension: { packageJSON: { version: "0.0.1" } },
		} as unknown as vscode.ExtensionContext

		controller = new Controller(context, "test-client-id")
	})

	afterEach(async () => {
		await fs.rm(workspaceDir, { recursive: true, force: true }).catch(() => undefined)
		vi.clearAllMocks()
	})

	it("should activate .caretrules even if it contains non-.md files", async () => {
		// Setup: Create .caretrules with a .yaml file and .clinerules with a .md file
		await fs.mkdir(path.join(workspaceDir, ".caretrules"), { recursive: true })
		await fs.writeFile(path.join(workspaceDir, ".caretrules", "rule.yaml"), "caret rule content")
		await fs.mkdir(path.join(workspaceDir, ".clinerules"), { recursive: true })
		await fs.writeFile(path.join(workspaceDir, ".clinerules", "rule.md"), "cline rule content")

		// Action: Refresh toggles
		const { localToggles: clineToggles } = await refreshClineRulesToggles(controller, workspaceDir)
		const { activeSource, caretLocalToggles, clineLocalToggles } = await refreshExternalRulesToggles(
			controller,
			workspaceDir,
			{
				clineLocalToggles: clineToggles,
			},
		)

		// Assertion: .caretrules should be active, and .clinerules should be inactive
		const caretRulePath = path.join(workspaceDir, ".caretrules", "rule.yaml")

		expect(activeSource).toBe("caret")
		expect(caretLocalToggles[caretRulePath]).toBe(true)
		expect(Object.keys(clineLocalToggles).length).toBe(0)
	})
})
