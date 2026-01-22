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

describe("Rule Priority System Integration Test", () => {
	let controller: Controller
	const workspaceDir = path.join(process.cwd(), ".tmp-rule-priority-workspace")

	beforeEach(async () => {
		await fs.rm(workspaceDir, { recursive: true, force: true }).catch(() => undefined)
		await fs.mkdir(path.join(workspaceDir, ".agents/context"), { recursive: true })
		await fs.writeFile(path.join(workspaceDir, ".agents/context", "rule1.md"), "careti rule content")

		const workspaceState = new Map<string, unknown>()
		workspaceState.set("localCaretRulesToggles", {})
		workspaceState.set("localAgentsRulesToggles", {})

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

		// CARETI MODIFICATION: Controller now requires clientId as second parameter (merge fix)
		controller = new Controller(context)
	})

	afterEach(async () => {
		await fs.rm(workspaceDir, { recursive: true, force: true }).catch(() => undefined)
		vi.clearAllMocks()
	})

	it("should activate .agents/context when it exists", async () => {
		await fs.writeFile(path.join(workspaceDir, ".agents/context", "my-rule.txt"), "This is a careti rule.")
		const { caretLocalToggles, agentsLocalToggles, activeSource } = await refreshExternalRulesToggles(
			controller,
			workspaceDir,
		)

		// Assertion
		const caretRulePath = path.join(workspaceDir, ".agents/context", "my-rule.txt")

		expect(caretLocalToggles[caretRulePath]).toBe(true)
		expect(Object.keys(agentsLocalToggles).length).toBe(0)
		expect(activeSource).toBe("careti")
	})

	it("should activate .agents/context even if it contains non-.md files", async () => {
		// Setup: Create .agents/context with a .yaml file and .agents/context with a .md file
		await fs.mkdir(path.join(workspaceDir, ".agents/context"), { recursive: true })
		await fs.writeFile(path.join(workspaceDir, ".agents/context", "rule.yaml"), "careti rule content")
		await fs.mkdir(path.join(workspaceDir, ".agents/context"), { recursive: true })
		await fs.writeFile(path.join(workspaceDir, ".agents/context", "rule.md"), "cline rule content")

		// Action: Refresh toggles
		const { activeSource, caretLocalToggles, agentsLocalToggles } = await refreshExternalRulesToggles(
			controller,
			workspaceDir,
		)

		// Assertion: .agents/context should be active, and .agents/context should be inactive
		const caretRulePath = path.join(workspaceDir, ".agents/context", "rule.yaml")

		expect(activeSource).toBe("careti")
		expect(caretLocalToggles[caretRulePath]).toBe(true)
		expect(Object.keys(agentsLocalToggles).length).toBe(0)
	})
})
