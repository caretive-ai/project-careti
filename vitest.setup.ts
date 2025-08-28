import { vi } from "vitest"
import { HostProvider } from "./src/hosts/host-provider"

// HostProvider 초기화
HostProvider.initialize(
	() => ({}) as any, // createWebviewProvider
	() => ({}) as any, // createDiffViewProvider
	{
		// hostBridge
		watchServiceClient: {} as any,
		workspaceClient: {} as any,
		envClient: {} as any,
		windowClient: {} as any,
		diffClient: {} as any,
	},
	() => {}, // logToChannel
	async () => "", // getCallbackUri
)

// VSCode API 모킹
vi.mock("vscode", () => ({
	env: {
		machineId: "test-machine-id",
		sessionId: "test-session-id",
		language: "en",
		remoteName: undefined,
		shell: "/bin/bash",
		onDidChangeTelemetryEnabled: vi.fn(),
	},
	window: {
		showErrorMessage: vi.fn(),
		showWarningMessage: vi.fn(),
		showInformationMessage: vi.fn(),
		createOutputChannel: vi.fn(() => ({
			appendLine: vi.fn(),
			show: vi.fn(),
		})),
		createTextEditorDecorationType: vi.fn(() => ({
			dispose: vi.fn(),
		})),
		activeTextEditor: undefined,
		visibleTextEditors: [],
		onDidChangeActiveTextEditor: vi.fn(),
		onDidChangeVisibleTextEditors: vi.fn(),
		onDidChangeTextEditorSelection: vi.fn(),
		onDidChangeTextEditorViewColumn: vi.fn(),
		onDidChangeTextEditorVisibleRanges: vi.fn(),
		showTextDocument: vi.fn(),
		showQuickPick: vi.fn(),
		showInputBox: vi.fn(),
	},
	workspace: {
		getConfiguration: vi.fn(() => ({
			get: vi.fn(),
			update: vi.fn(),
		})),
	},
	commands: {
		registerCommand: vi.fn(),
	},
	Uri: {
		file: vi.fn((path: string) => ({ fsPath: path })),
		parse: vi.fn((path: string) => ({ fsPath: path })),
	},
	ExtensionContext: vi.fn(),
	ConfigurationTarget: {
		Global: 1,
		Workspace: 2,
		WorkspaceFolder: 3,
	},
}))

// Node.js 모듈 모킹 (필요시)
vi.mock("os", async () => {
	const actual = (await vi.importActual("os")) as typeof import("os")
	return {
		...actual,
		platform: vi.fn(() => "win32"),
		release: vi.fn(() => "10.0.26100"),
		homedir: vi.fn(() => "/mock/home"),
	}
})

vi.mock("path", async () => {
	const actual = (await vi.importActual("path")) as typeof import("path")
	return {
		...actual,
		join: vi.fn((...args: string[]) => args.join("/")),
		resolve: vi.fn((...args: string[]) => args.join("/")),
	}
})
