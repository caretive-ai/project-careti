/**
 * Integration Tests for Vision Model Tool System
 *
 * Tests that tool descriptions are correctly generated based on model capabilities:
 * - Vision models get extended read_file description (image reading)
 * - Non-vision models get original read_file description
 * - analyze_image is available for ALL models (not excluded for vision models)
 */
import * as path from "path"
import "should"
import { HostProvider } from "@/hosts/host-provider"
import { JsonTemplateLoader } from "@careti/core/prompts/system/JsonTemplateLoader"
import { PromptSystemManager } from "@careti/core/prompts/system/PromptSystemManager"
import { CaretSystemPromptContext } from "@careti/core/prompts/system/types"
import { CARETI_MODES } from "@careti/shared/constants/PromptSystemConstants"

// IMPORTANT: Import and call registerClineToolSets to register all tool variants
// Without this, ClineToolSet.variants will be empty and tools won't load
import { registerClineToolSets } from "@/core/prompts/system-prompt/tools/init"

describe("Vision Model Tool Integration Tests", function () {
	this.timeout(30000) // Increase timeout for integration tests

	before(async () => {
		// Initialize HostProvider with minimal mocks for logging
		HostProvider.reset()
		HostProvider.initialize(
			(() => ({} as any)),
			(() => ({} as any)),
			{
				workspaceClient: { getWorkspacePaths: async () => ({ paths: [] }) },
				envClient: {},
				windowClient: {},
				diffClient: {},
			} as any,
			() => {}, // logToChannel
			async () => "http://localhost:1234/",
			async (n) => `/mock/path/${n}`,
			"/mock/extension",
			"/mock/globalstorage",
		)
		const sectionsDirPath = path.resolve(__dirname, "../sections")
		await JsonTemplateLoader.getInstance().initialize(sectionsDirPath)

		// Register all tool variants - this is crucial for tools to be available
		registerClineToolSets()
	})

	describe("Tool Description Generation", () => {
		it("should NOT include image reading capability in read_file for non-vision model (GLM-4.7)", async () => {
			const manager = new PromptSystemManager()
			const context: CaretSystemPromptContext & { modeSystem: "careti" } = {
				modeSystem: "careti",
				mode: CARETI_MODES.AGENT,
				ide: "vscode",
				providerInfo: {
					providerId: "zai",
					model: {
						id: "glm-4.7",
						info: {
							supportsImages: false, // GLM-4.7 does NOT support images
							supportsPromptCache: true,
							maxTokens: 128_000,
							contextWindow: 200_000,
						},
					},
				},
			}

			const prompt = await manager.getPrompt(context)

			// read_file should NOT have image reading capability for non-vision models
			prompt.should.containEql("read_file")
			prompt.should.not.containEql("You can also read image files (PNG, JPG, GIF, WebP)")
			prompt.should.containEql("May not be suitable for other types of binary files")
		})

		it("should include image reading capability in read_file for vision model (Gemini)", async () => {
			const manager = new PromptSystemManager()
			const context: CaretSystemPromptContext & { modeSystem: "careti" } = {
				modeSystem: "careti",
				mode: CARETI_MODES.AGENT,
				ide: "vscode",
				providerInfo: {
					providerId: "gemini",
					model: {
						id: "gemini-2.5-flash",
						info: {
							supportsImages: true, // Gemini DOES support images
							supportsPromptCache: true,
							maxTokens: 65536,
							contextWindow: 1_048_576,
						},
					},
				},
			}

			const prompt = await manager.getPrompt(context)

			// read_file SHOULD have image reading capability for vision models
			prompt.should.containEql("read_file")
			prompt.should.containEql("You can also read image files (PNG, JPG, GIF, WebP)")
		})

		it("should include analyze_image tool for non-vision model (GLM-4.7)", async () => {
			const manager = new PromptSystemManager()
			const context: CaretSystemPromptContext & { modeSystem: "careti" } = {
				modeSystem: "careti",
				mode: CARETI_MODES.AGENT,
				ide: "vscode",
				providerInfo: {
					providerId: "zai",
					model: {
						id: "glm-4.7",
						info: {
							supportsImages: false,
							supportsPromptCache: true,
						},
					},
				},
				toolSettings: {
					analyzeImages: true, // Explicitly enabled
				},
			}

			const prompt = await manager.getPrompt(context)

			// analyze_image should be available for non-vision models
			prompt.should.containEql("analyze_image")
			prompt.should.containEql("Analyze an image file using vision AI")
		})

		// CARETI MODIFICATION: 비전 모델은 read_file로 이미지를 직접 열람하므로 analyze_image가
		// 의도적으로 제외됨 (CaretiJsonAdapter 참조) — 현재 설계에 맞게 기대값 갱신
		it("should exclude analyze_image tool for vision model (read_file covers images)", async () => {
			const manager = new PromptSystemManager()
			const context: CaretSystemPromptContext & { modeSystem: "careti" } = {
				modeSystem: "careti",
				mode: CARETI_MODES.AGENT,
				ide: "vscode",
				providerInfo: {
					providerId: "gemini",
					model: {
						id: "gemini-2.5-flash",
						info: {
							supportsImages: true, // Vision model
							supportsPromptCache: true,
						},
					},
				},
				toolSettings: {
					analyzeImages: true,
				},
			}

			const prompt = await manager.getPrompt(context)

			// Vision models view images (incl. generated ones on disk) via read_file,
			// so analyze_image is excluded from their tool list
			prompt.should.not.containEql("analyze_image")
		})

		it("should exclude analyze_image when disabled in settings", async () => {
			const manager = new PromptSystemManager()
			const context: CaretSystemPromptContext & { modeSystem: "careti" } = {
				modeSystem: "careti",
				mode: CARETI_MODES.AGENT,
				ide: "vscode",
				providerInfo: {
					providerId: "zai",
					model: {
						id: "glm-4.7",
						info: {
							supportsImages: false,
							supportsPromptCache: true,
						},
					},
				},
				toolSettings: {
					analyzeImages: false, // Explicitly disabled
				},
			}

			const prompt = await manager.getPrompt(context)

			// analyze_image should NOT be available when disabled
			prompt.should.not.containEql("## analyze_image")
		})

		it("should replace PLAN/ACT terminology with CHATBOT/AGENT", async () => {
			const manager = new PromptSystemManager()
			const context: CaretSystemPromptContext & { modeSystem: "careti" } = {
				modeSystem: "careti",
				mode: CARETI_MODES.AGENT,
				ide: "vscode",
				providerInfo: {
					providerId: "zai",
					model: {
						id: "glm-4.7",
						info: {
							supportsImages: false,
							supportsPromptCache: true,
						},
					},
				},
			}

			const prompt = await manager.getPrompt(context)

			// Should use Careti terminology, not Cline terminology
			prompt.should.containEql("CHATBOT")
			prompt.should.containEql("AGENT")

			// Extract TOOL USAGE SYSTEM section to verify terminology replacement
			const toolSection = prompt.match(/# TOOL USAGE SYSTEM[\s\S]*?(?=\n# |$)/)?.[0]
			if (toolSection) {
				// Tool descriptions should NOT contain Cline terminology (PLAN MODE/ACT MODE)
				// Note: The system prompt header may contain "FORGET ALL PLAN MODE" as a warning,
				// but tool descriptions should be transformed to CHATBOT/AGENT terminology
				toolSection.should.not.containEql("toggle to Act mode")
				toolSection.should.not.containEql("switch to Plan mode")
			}
		})
	})

	describe("Tool Availability Verification", () => {
		it("GLM-4.7 should have access to image tools", async () => {
			const manager = new PromptSystemManager()
			const context: CaretSystemPromptContext & { modeSystem: "careti" } = {
				modeSystem: "careti",
				mode: CARETI_MODES.AGENT,
				ide: "vscode",
				providerInfo: {
					providerId: "zai",
					model: {
						id: "glm-4.7",
						info: {
							supportsImages: false,
							supportsPromptCache: true,
						},
					},
				},
				toolSettings: {
					analyzeImages: true,
					generateImages: true,
				},
			}

			const prompt = await manager.getPrompt(context)

			// Verify all expected tools are present
			prompt.should.containEql("analyze_image")
			prompt.should.containEql("generate_image")
			prompt.should.containEql("read_file")

			// Log for manual verification
			console.log("\n=== GLM-4.7 Tool Verification ===")
			console.log("analyze_image present:", prompt.includes("analyze_image"))
			console.log("generate_image present:", prompt.includes("generate_image"))
			console.log("read_file present:", prompt.includes("read_file"))
			console.log("Image reading capability (should be false):", prompt.includes("You can also read image files"))
		})

		it("Gemini should have extended read_file with image capability", async () => {
			const manager = new PromptSystemManager()
			const context: CaretSystemPromptContext & { modeSystem: "careti" } = {
				modeSystem: "careti",
				mode: CARETI_MODES.AGENT,
				ide: "vscode",
				providerInfo: {
					providerId: "gemini",
					model: {
						id: "gemini-2.5-flash",
						info: {
							supportsImages: true,
							supportsPromptCache: true,
						},
					},
				},
				toolSettings: {
					analyzeImages: true,
					generateImages: true,
				},
			}

			const prompt = await manager.getPrompt(context)

			// Verify all expected tools are present
			// CARETI MODIFICATION: 비전 모델은 analyze_image 대신 확장된 read_file을 사용
			prompt.should.not.containEql("analyze_image")
			prompt.should.containEql("generate_image")
			prompt.should.containEql("read_file")
			prompt.should.containEql("You can also read image files (PNG, JPG, GIF, WebP)")

			// Log for manual verification
			console.log("\n=== Gemini Tool Verification ===")
			console.log("analyze_image present:", prompt.includes("analyze_image"))
			console.log("generate_image present:", prompt.includes("generate_image"))
			console.log("read_file present:", prompt.includes("read_file"))
			console.log("Image reading capability (should be true):", prompt.includes("You can also read image files"))
		})
	})
})
