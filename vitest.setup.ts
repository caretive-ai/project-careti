import { vi } from "vitest"

// Mock the 'vscode' module
vi.mock("vscode", () => {
	return {
		workspace: {
			getConfiguration: vi.fn(() => ({
				get: vi.fn(),
			})),
		},
		window: {
			showInformationMessage: vi.fn(),
		},
		Uri: {
			file: vi.fn((path) => ({ fsPath: path })),
		},
	}
})
