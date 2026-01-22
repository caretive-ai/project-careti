// CARETI MODIFICATION: Tests for legacy PPT format detection (not supported)

import { expect } from "chai"
import { describe, it } from "mocha"
import * as path from "path"

import { DocumentExtractor } from "../document-extractor"

const FIXTURES_DIR = path.join(__dirname, "fixtures")

describe("Legacy PPT Format Detection", () => {
	const extractor = new DocumentExtractor()

	describe("when extracting .ppt file", () => {
		it("should throw a helpful error message", async () => {
			const pptPath = path.join(FIXTURES_DIR, "sample.ppt")

			try {
				await extractor.extract(pptPath, { cwd: FIXTURES_DIR })
				expect.fail("Should have thrown an error")
			} catch (error) {
				const message = (error as Error).message
				expect(message).to.include("Legacy PowerPoint (.ppt)")
				expect(message).to.include("not supported")
				expect(message).to.include(".pptx")
			}
		})
	})

	describe("isSupported", () => {
		it("should return false for .ppt files", () => {
			expect(extractor.isSupported("test.ppt")).to.be.false
		})

		it("should return true for .pptx files", () => {
			expect(extractor.isSupported("test.pptx")).to.be.true
		})
	})
})
