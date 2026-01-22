// CARETI MODIFICATION: Integration-style test for image registry persistence limits.
import { ImageRegistry } from "@careti/core/task/images/ImageRegistry"
import { describe, it } from "mocha"
import "should"
import fs from "fs/promises"
import os from "os"
import path from "path"
import { HostProvider } from "@/hosts/host-provider"

const createDataUrl = (sizeInBytes: number): string => {
	return `data:image/png;base64,${"a".repeat(sizeInBytes)}`
}

describe("ImageRegistry persistence limits", () => {
	it("drops oversized data URLs when saving the snapshot", async () => {
		const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "careti-image-registry-"))
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

			const smallDataUrl = createDataUrl(1024)
			const largeDataUrl = createDataUrl(10 * 1024 * 1024)

			registry.registerDataUrls([smallDataUrl, largeDataUrl], "user", Date.now())
			await registry.save()

			const savedPath = path.join(tempRoot, "tasks", "test-task", "image_registry.json")
			const saved = JSON.parse(await fs.readFile(savedPath, "utf8")) as {
				images: Array<{ dataUrl?: string }>
			}

			const persisted = saved.images.map((record) => record.dataUrl).filter(Boolean)
			persisted.should.containEql(smallDataUrl)
			persisted.should.not.containEql(largeDataUrl)
		} finally {
			HostProvider.reset()
			await fs.rm(tempRoot, { recursive: true, force: true })
		}
	})
})
