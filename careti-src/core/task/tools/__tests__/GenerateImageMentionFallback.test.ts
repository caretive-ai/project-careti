// CARETI MODIFICATION: Ensure mention image attachments can be reused as tool references.
import { ImageRegistry } from "@careti/core/task/images/ImageRegistry"
import { ImageScopeManager } from "@careti/core/task/images/ImageScopeManager"
import { resolveReferenceImages } from "@careti/core/task/tools/handlers/GenerateImageToolHandler"
import { formatResponse } from "@core/prompts/responses"
import type { TaskConfig } from "@core/task/tools/types/TaskConfig"
import type { ClineContent } from "@shared/messages/content"
import { before, describe, it } from "mocha"
import "should"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { HostProvider } from "@/hosts/host-provider"
import { ErrorService } from "@/services/error/ErrorService"
import sharp from "sharp"

const writeTestImage = async (
	filePath: string,
	format: "png" | "jpeg",
	background: { r: number; g: number; b: number },
) => {
	const pipeline = sharp({
		create: {
			width: 32,
			height: 32,
			channels: 3,
			background,
		},
	})
	const buffer = format === "png" ? await pipeline.png().toBuffer() : await pipeline.jpeg().toBuffer()
	await fs.mkdir(path.dirname(filePath), { recursive: true })
	await fs.writeFile(filePath, buffer)
}

describe("GenerateImageToolHandler mention fallback", () => {
	before(async () => {
		try {
			await ErrorService.initialize()
		} catch (error) {
			if (!(error instanceof Error) || !error.message.includes("already been initialized")) {
				throw error
			}
		}
	})

	it("uses the latest mention attachment set when scoped images are missing", async () => {
		const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "careti-mention-fallback-"))
		try {
			HostProvider.reset()
			HostProvider.initialize(
				(() => ({} as any)),
				(() => ({} as any)),
				{
					workspaceClient: {
						getWorkspacePaths: async () => ({ paths: [] }),
					},
					envClient: {},
					windowClient: {},
					diffClient: {},
				} as any,
				() => {},
				async () => "http://example.com",
				async () => "/mock/path",
				"/mock/extension",
				tempRoot,
			)

			const registry = new ImageRegistry("test-task")
			const scopeManager = new ImageScopeManager(registry)
			const dataUrl = "data:image/png;base64,AAAA"

			const userContent: ClineContent[] = [
				{ type: "text", text: "<user_message>\n@/assets/ref.png\n</user_message>" },
				...formatResponse.imageBlocks([dataUrl]),
			]

			await scopeManager.applyScope(userContent, Date.now())

			const mentionSet = registry.getLatestAttachmentSet("mention")
			mentionSet?.imageIds.should.have.length(1)

			const config = {
				taskState: {},
				services: {
					imageRegistry: registry,
				},
			} as unknown as TaskConfig

			const resolved = await resolveReferenceImages(config)
			resolved?.should.deepEqual([dataUrl])
		} finally {
			HostProvider.reset()
			await fs.rm(tempRoot, { recursive: true, force: true })
		}
	})

	it("ignores non-data URL reference_images and falls back to mention attachments", async () => {
		const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "careti-mention-fallback-"))
		try {
			HostProvider.reset()
			HostProvider.initialize(
				(() => ({} as any)),
				(() => ({} as any)),
				{
					workspaceClient: {
						getWorkspacePaths: async () => ({ paths: [] }),
					},
					envClient: {},
					windowClient: {},
					diffClient: {},
				} as any,
				() => {},
				async () => "http://example.com",
				async () => "/mock/path",
				"/mock/extension",
				tempRoot,
			)

			const registry = new ImageRegistry("test-task")
			const scopeManager = new ImageScopeManager(registry)
			const dataUrl = "data:image/png;base64,BBBB"

			const userContent: ClineContent[] = [
				{ type: "text", text: "<user_message>\n@/assets/ref.png\n</user_message>" },
				...formatResponse.imageBlocks([dataUrl]),
			]

			await scopeManager.applyScope(userContent, Date.now())

			const config = {
				taskState: {},
				services: {
					imageRegistry: registry,
				},
				cwd: tempRoot,
			} as unknown as TaskConfig

			const resolved = await resolveReferenceImages(config, '["/assets/ref.png"]')
			resolved?.should.deepEqual([dataUrl])
		} finally {
			HostProvider.reset()
			await fs.rm(tempRoot, { recursive: true, force: true })
		}
	})

	it("converts reference image file paths to data URLs when files exist", async () => {
		const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "careti-mention-fallback-"))
		try {
			HostProvider.reset()
			HostProvider.initialize(
				(() => ({} as any)),
				(() => ({} as any)),
				{
					workspaceClient: {
						getWorkspacePaths: async () => ({ paths: [] }),
					},
					envClient: {},
					windowClient: {},
					diffClient: {},
				} as any,
				() => {},
				async () => "http://example.com",
				async () => "/mock/path",
				"/mock/extension",
				tempRoot,
			)

			const registry = new ImageRegistry("test-task")
			const filePath = path.join(tempRoot, "data", "ref.png")
			await writeTestImage(filePath, "png", { r: 25, g: 50, b: 75 })

			const config = {
				taskState: {},
				services: {
					imageRegistry: registry,
				},
				cwd: tempRoot,
			} as unknown as TaskConfig

			const resolved = await resolveReferenceImages(config, '["data/ref.png"]')
			resolved?.length.should.equal(1)
			// CARETI MODIFICATION: 이미지 최적화가 검증 전용으로 바뀌어(포맷 변환 없음) 원본 mime 유지
			resolved?.[0].startsWith("data:image/png;base64,").should.equal(true)
		} finally {
			HostProvider.reset()
			await fs.rm(tempRoot, { recursive: true, force: true })
		}
	})

	it("parses newline-delimited reference_images paths", async () => {
		const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "careti-mention-fallback-"))
		try {
			HostProvider.reset()
			HostProvider.initialize(
				(() => ({} as any)),
				(() => ({} as any)),
				{
					workspaceClient: {
						getWorkspacePaths: async () => ({ paths: [] }),
					},
					envClient: {},
					windowClient: {},
					diffClient: {},
				} as any,
				() => {},
				async () => "http://example.com",
				async () => "/mock/path",
				"/mock/extension",
				tempRoot,
			)

			const registry = new ImageRegistry("test-task")
			const filePathA = path.join(tempRoot, "data", "ref.png")
			const filePathB = path.join(tempRoot, "data", "ref2.jpg")
			await writeTestImage(filePathA, "png", { r: 25, g: 50, b: 75 })
			await writeTestImage(filePathB, "jpeg", { r: 200, g: 100, b: 50 })

			const config = {
				taskState: {},
				services: {
					imageRegistry: registry,
				},
				cwd: tempRoot,
			} as unknown as TaskConfig

			const resolved = await resolveReferenceImages(config, "data/ref.png\ndata/ref2.jpg")
			resolved?.length.should.equal(2)
			// CARETI MODIFICATION: 포맷 변환 없이 원본 mime(png/jpeg) 유지
			resolved?.every((item) => item.startsWith("data:image/")).should.equal(true)
		} finally {
			HostProvider.reset()
			await fs.rm(tempRoot, { recursive: true, force: true })
		}
	})
})
