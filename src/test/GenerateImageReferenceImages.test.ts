// CARETI MODIFICATION: Integration-style test for generate_image reference image logging and parsing.
import { ImageRegistry } from "@careti/core/task/images/ImageRegistry"
import { resolveReferenceImages } from "@careti/core/task/tools/handlers/GenerateImageToolHandler"
import type { TaskConfig } from "@core/task/tools/types/TaskConfig"
import { describe, it } from "mocha"
import "should"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { HostProvider } from "@/hosts/host-provider"
import { ErrorService } from "@/services/error/ErrorService"
import sharp from "sharp"

describe("GenerateImage reference images integration", () => {
	it("logs reference image parsing and resolution for newline-delimited paths", async () => {
		const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "careti-generate-image-"))
		const logs: string[] = []
		try {
			try {
				await ErrorService.initialize()
			} catch (error) {
				if (!(error instanceof Error) || !error.message.includes("already been initialized")) {
					throw error
				}
			}
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
				(message: string) => {
					logs.push(message)
				},
				() => Promise.resolve("http://example.com"),
				() => Promise.resolve("/mock/path"),
				"/mock/extension",
				tempRoot,
			)

			const registry = new ImageRegistry("test-task")
			const filePathA = path.join(tempRoot, "data", "ref.png")
			const filePathB = path.join(tempRoot, "data", "ref2.jpg")
			await fs.mkdir(path.dirname(filePathA), { recursive: true })
			const pngBuffer = await sharp({
				create: {
					width: 64,
					height: 64,
					channels: 3,
					background: { r: 10, g: 20, b: 30 },
				},
			})
				.png()
				.toBuffer()
			const jpegBuffer = await sharp({
				create: {
					width: 64,
					height: 64,
					channels: 3,
					background: { r: 40, g: 50, b: 60 },
				},
			})
				.jpeg()
				.toBuffer()
			await fs.writeFile(filePathA, pngBuffer)
			await fs.writeFile(filePathB, jpegBuffer)

			const config = {
				taskState: {},
				services: {
					imageRegistry: registry,
				},
				cwd: tempRoot,
			} as unknown as TaskConfig

			const resolved = await resolveReferenceImages(config, "data/ref.png\ndata/ref2.jpg")
			resolved?.length.should.equal(2)

			const joined = logs.join("\n")
			joined.should.match(/reference_images param received/)
			joined.should.match(/reference_images parsed/)
			joined.should.match(/Reference image roots/)
			joined.should.match(/Reference images resolved/)
		} finally {
			HostProvider.reset()
			await fs.rm(tempRoot, { recursive: true, force: true })
		}
	})

	it("parses XML <image> tag format from Gemini-style models", async () => {
		const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "careti-generate-image-xml-"))
		const logs: string[] = []
		try {
			try {
				await ErrorService.initialize()
			} catch (error) {
				if (!(error instanceof Error) || !error.message.includes("already been initialized")) {
					throw error
				}
			}
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
				(message: string) => {
					logs.push(message)
				},
				() => Promise.resolve("http://example.com"),
				() => Promise.resolve("/mock/path"),
				"/mock/extension",
				tempRoot,
			)

			const registry = new ImageRegistry("test-task")
			const filePathA = path.join(tempRoot, "data", "alpha", "images", "alpha_yang_front.png")
			const filePathB = path.join(tempRoot, "data", "cafelua", "design", "cafe_lua_logo_cleaned.png")
			await fs.mkdir(path.dirname(filePathA), { recursive: true })
			await fs.mkdir(path.dirname(filePathB), { recursive: true })

			const pngBuffer = await sharp({
				create: {
					width: 64,
					height: 64,
					channels: 3,
					background: { r: 10, g: 20, b: 30 },
				},
			})
				.png()
				.toBuffer()
			await fs.writeFile(filePathA, pngBuffer)
			await fs.writeFile(filePathB, pngBuffer)

			const config = {
				taskState: {},
				services: {
					imageRegistry: registry,
				},
				cwd: tempRoot,
			} as unknown as TaskConfig

			// Test XML format that Gemini uses
			const xmlInput = `<image>data/alpha/images/alpha_yang_front.png</image>
<image>data/cafelua/design/cafe_lua_logo_cleaned.png</image>`

			const resolved = await resolveReferenceImages(config, xmlInput)
			resolved?.length.should.equal(2)

			const joined = logs.join("\n")
			joined.should.match(/reference_images param received/)
			joined.should.match(/reference_images parsed/)
			joined.should.match(/filePaths=2/)
			joined.should.match(/Reference images resolved/)
		} finally {
			HostProvider.reset()
			await fs.rm(tempRoot, { recursive: true, force: true })
		}
	})
})
