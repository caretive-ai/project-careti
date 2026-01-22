// CARETI MODIFICATION: Integration-style test for shared image optimization logic.
import { optimizeImageDataUrl } from "@careti/utils/image-optimization"
import { describe, it } from "mocha"
import "should"
import sharp from "sharp"

describe("Image optimization integration", () => {
	it("resizes large images and converts to webp", async () => {
		const inputBuffer = await sharp({
			create: {
				width: 3000,
				height: 2000,
				channels: 3,
				background: { r: 120, g: 80, b: 200 },
			},
		})
			.png()
			.toBuffer()

		const inputDataUrl = `data:image/png;base64,${inputBuffer.toString("base64")}`
		const optimized = await optimizeImageDataUrl(inputDataUrl)

		optimized.startsWith("data:image/webp;base64,").should.equal(true)
		optimized.length.should.be.lessThan(inputDataUrl.length)

		const optimizedBase64 = optimized.split(",")[1] || ""
		const optimizedBuffer = Buffer.from(optimizedBase64, "base64")
		const metadata = await sharp(optimizedBuffer).metadata()
		if (!metadata.width || !metadata.height) {
			throw new Error("Missing optimized image dimensions.")
		}
		metadata.width.should.be.lessThanOrEqual(1024)
		metadata.height.should.be.lessThanOrEqual(1024)
	})
})
