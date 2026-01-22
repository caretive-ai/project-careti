// CARETI MODIFICATION: Integration-style test for OptimizeImageDataUrls handler.
import { OptimizeImageDataUrls } from "@/core/controller/persona/OptimizeImageDataUrls"
import type { Controller } from "@/core/controller"
import * as proto from "@/shared/proto"
import { describe, it } from "mocha"
import "should"
import sharp from "sharp"

describe("OptimizeImageDataUrls handler", () => {
	it("returns optimized webp data URLs", async () => {
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
		response.dataUrls[0].startsWith("data:image/webp;base64,").should.equal(true)
		response.dataUrls[0].length.should.be.lessThan(inputDataUrl.length)
	})
})
