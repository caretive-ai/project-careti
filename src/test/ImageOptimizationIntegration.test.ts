// CARETI MODIFICATION: Integration-style test for shared image optimization logic.
import { optimizeImageDataUrl } from "@careti/utils/image-optimization"
import { describe, it } from "mocha"
import "should"
import sharp from "sharp"

// CARETI MODIFICATION: 이미지 최적화가 7500px 제한 검증 전용으로 변경됨
// (리사이즈/포맷 변환 없음 — cline-latest 동작과 일치, 대용량 처리는 서버 책임)
describe("Image optimization integration", () => {
	it("returns valid images unchanged (validation only)", async () => {
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

		optimized.should.equal(inputDataUrl)
	})

	it("rejects images exceeding the 7500px dimension limit", async () => {
		const inputBuffer = await sharp({
			create: {
				width: 7600,
				height: 4,
				channels: 3,
				background: { r: 0, g: 0, b: 0 },
			},
		})
			.png()
			.toBuffer()

		const inputDataUrl = `data:image/png;base64,${inputBuffer.toString("base64")}`
		await optimizeImageDataUrl(inputDataUrl).should.be.rejectedWith(/exceed maximum allowed size/)
	})
})
