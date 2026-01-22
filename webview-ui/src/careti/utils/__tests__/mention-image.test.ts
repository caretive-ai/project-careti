// CARETI MODIFICATION: Mention image attachment integration tests.
import { describe, expect, it, vi } from "vitest"
import { CaretSystemServiceClient } from "@/services/grpc-client"
import { optimizeImageDataUrl } from "@/careti/utils/imageOptimization"
import { prepareMentionImagePayload } from "../mention-image"

vi.mock("@/careti/utils/imageOptimization", () => ({
	optimizeImageDataUrl: vi.fn(async (value: string) => value),
}))

describe("prepareMentionImagePayload", () => {
	it("skips mention resolution when model does not support images", async () => {
		const getSettingSpy = vi.spyOn(CaretSystemServiceClient, "GetMentionImageSendSetting")
		const result = await prepareMentionImagePayload({
			text: "@/assets/bg.png",
			images: ["data:image/png;base64,existing"],
			files: [],
			supportsImages: false,
			maxAttachments: 4,
		})

		expect(result.images).toEqual(["data:image/png;base64,existing"])
		expect(getSettingSpy).not.toHaveBeenCalled()
	})

	it("attaches mention images when setting is enabled", async () => {
		vi.spyOn(CaretSystemServiceClient, "GetMentionImageSendSetting").mockResolvedValue({
			enabled: true,
		})
		vi.spyOn(CaretSystemServiceClient, "ResolveMentionImageDataUrls").mockResolvedValue({
			dataUrls: ["data:image/png;base64,mention"],
		})

		const result = await prepareMentionImagePayload({
			text: "@/assets/bg.png",
			images: ["data:image/png;base64,existing"],
			files: [],
			supportsImages: true,
			maxAttachments: 4,
		})

		expect(optimizeImageDataUrl).toHaveBeenCalledWith("data:image/png;base64,mention")
		expect(result.images).toEqual(["data:image/png;base64,mention", "data:image/png;base64,existing"])
	})

	it("prioritizes mention images when attachment slots are limited", async () => {
		vi.spyOn(CaretSystemServiceClient, "GetMentionImageSendSetting").mockResolvedValue({
			enabled: true,
		})
		vi.spyOn(CaretSystemServiceClient, "ResolveMentionImageDataUrls").mockResolvedValue({
			dataUrls: ["data:image/png;base64,mention"],
		})

		const result = await prepareMentionImagePayload({
			text: "@/assets/bg.png",
			images: ["data:image/png;base64,existing"],
			files: [],
			supportsImages: true,
			maxAttachments: 1,
		})

		expect(result.images).toEqual(["data:image/png;base64,mention"])
	})
})
