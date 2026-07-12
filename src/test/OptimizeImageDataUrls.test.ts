// CARETI MODIFICATION: Integration-style test for OptimizeImageDataUrls handler.
import { OptimizeImageDataUrls } from "@/core/controller/persona/OptimizeImageDataUrls"
import type { Controller } from "@/core/controller"
import * as proto from "@/shared/proto"
import { describe, it } from "mocha"
import "should"
import sharp from "sharp"

describe("OptimizeImageDataUrls handler", () => {
	// CARETI MODIFICATION: 이미지 최적화가 7500px 검증 전용으로 변경(포맷 변환/리사이즈 제거)되어
	// 유효한 이미지는 원본 data URL이 그대로 반환된다
	it("returns validated data URLs unchanged", async () => {
		const inputBuffer = await sharp({
			create: {
				width: 2400,
				height: 1600,
				channels: 3,
				background: { r: 10, g: 120, b: 240 },
			},
		})
			.png()
			.toBuffer()

		const inputDataUrl = `data:image/png;base64,${inputBuffer.toString("base64")}`
		const request = proto.careti.OptimizeImageDataUrlsRequest.create({
			dataUrls: [inputDataUrl],
		})

		const response = await OptimizeImageDataUrls({} as Controller, request)
		response.dataUrls.should.have.length(1)
		response.dataUrls[0].should.equal(inputDataUrl)
	})
})
