import { describe, it, expect, vi, beforeEach } from "vitest"
import { PersonaInitializer } from "../persona-initializer"
import * as fs from "fs/promises"
import * as path from "path"
import { writeFile, fileExistsAtPath } from "@utils/fs"

// Mock vscode
vi.mock("vscode", () => ({
	ExtensionMode: {
		Development: 1,
		Production: 2,
		Test: 3,
	},
	env: {
		machineId: "mock-machine-id",
		onDidChangeTelemetryEnabled: vi.fn(),
	},
	workspace: {
		getConfiguration: vi.fn(() => ({
			get: vi.fn(),
		})),
	},
}))

// Mock MCP Hub to prevent initialization errors
vi.mock("@/services/mcp/McpHub", () => ({
	McpHub: vi.fn(() => ({
		getServers: vi.fn(() => []),
		dispose: vi.fn(),
	})),
}))

vi.mock("@/core/storage/disk", () => ({
	ensureSettingsDirectoryExists: vi.fn(() => Promise.resolve("/mock/settings")),
	ensureMcpServersDirectoryExists: vi.fn(() => Promise.resolve("/mock/mcp")),
	GlobalFileNames: {
		clineRules: ".clinerules",
	},
	ensureRulesDirectoryExists: vi.fn(() => Promise.resolve("/mock/home/Documents/Cline/Rules")),
}))

// 모듈 모킹
vi.mock("fs/promises")
vi.mock("path")
vi.mock("@utils/fs", () => ({
	writeFile: vi.fn(),
	fileExistsAtPath: vi.fn(),
	createDirectoriesForFile: vi.fn(),
}))

vi.mock("@/services/logging/Logger", () => ({
	Logger: {
		info: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
	},
}))

vi.mock("../persona-storage", () => ({
	personaStorage: {
		replacePersonaImageFromTemplate: vi.fn().mockResolvedValue(undefined),
	},
}))

vi.mock("../simple-persona-image", () => ({
	replacePersonaImage: vi.fn(),
}))

// 환경 변수 모킹
vi.stubEnv("HOME", "/mock/home")

describe("PersonaInitializer", () => {
	const mockContext = {
		extensionPath: "/mock/extension/path",
		globalStorageUri: { fsPath: "/mock/global/storage" },
	} as any

	// 템플릿 캐릭터 모킹 데이터
	const mockTemplateCharacters = [
		{
			character: "caret",
			en: {
				name: "Caret",
				description: "A friendly robot who loves to code.",
				customInstruction: { persona: { name: "Caret" } },
			},
			avatarUri: "asset:/assets/template_characters/caret.png",
			thinkingAvatarUri: "asset:/assets/template_characters/caret_thinking.png",
			isDefault: true,
		},
	]

	beforeEach(() => {
		vi.clearAllMocks()

		// 파일 시스템 모킹
		vi.mocked(fs.readFile).mockImplementation((filePath: any) => {
			if (filePath.includes("template_characters.json")) {
				return Promise.resolve(JSON.stringify(mockTemplateCharacters) as any)
			}
			return Promise.reject(new Error(`파일을 찾을 수 없음: ${filePath}`))
		})
		vi.mocked(fs.mkdir).mockResolvedValue(undefined as any)
		vi.mocked(fs.copyFile).mockResolvedValue(undefined as any)

		vi.mocked(path.join).mockImplementation((...args: string[]) => args.join("/"))
	})

	afterEach(() => {
		vi.mocked(fs.readFile).mockRestore()
	})

	it("persona.md 파일이 없을 때, 기본 페르소나로 파일을 생성해야 한다", async () => {
		vi.mocked(fileExistsAtPath).mockResolvedValue(false)

		const initializer = new PersonaInitializer(mockContext)
		await initializer.initialize()

		const expectedPath = "/mock/home/Documents/Cline/Rules/persona.md"
		const expectedContent = JSON.stringify({ persona: { name: "Caret" } }, null, 2)

		expect(writeFile).toHaveBeenCalledWith(expectedPath, expectedContent)
	})

	it("persona.md 파일이 이미 있을 경우, 초기화를 건너뛰어야 한다", async () => {
		vi.mocked(fileExistsAtPath).mockResolvedValue(true)

		const initializer = new PersonaInitializer(mockContext)
		await initializer.initialize()

		expect(writeFile).not.toHaveBeenCalled()
	})

	it("template_characters.json 파일 읽기 에러가 발생해도 프로그램이 중단되지 않아야 한다", async () => {
		vi.mocked(fs.readFile).mockRejectedValueOnce(new Error("파일 읽기 실패"))

		const initializer = new PersonaInitializer(mockContext)
		await initializer.initialize()

		expect(writeFile).not.toHaveBeenCalled()
	})

	it("기본 페르소나가 없는 경우, 첫 번째 페르소나를 사용해야 한다", async () => {
		const noDefaultMockData = [
			{
				character: "caret",
				en: {
					name: "Caret",
					description: "A friendly robot who loves to code.",
					customInstruction: { persona: { name: "Caret" } },
				},
				avatarUri: "asset:/assets/template_characters/caret.png",
				thinkingAvatarUri: "asset:/assets/template_characters/caret_thinking.png",
				isDefault: false,
			},
		]
		// 이 테스트 케이스에만 적용되는 특정 모킹
		vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(noDefaultMockData) as any)
		vi.mocked(fileExistsAtPath).mockResolvedValue(false)

		const initializer = new PersonaInitializer(mockContext)
		await initializer.initialize()

		const expectedPath = "/mock/home/Documents/Cline/Rules/persona.md"
		const expectedContent = JSON.stringify({ persona: { name: "Caret" } }, null, 2)

		expect(writeFile).toHaveBeenCalledWith(expectedPath, expectedContent)
	})
})
