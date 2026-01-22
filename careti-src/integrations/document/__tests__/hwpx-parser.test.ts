// CARETI MODIFICATION: TDD tests for HWPX (한글) document parser

import { expect } from "chai"
import * as fs from "fs/promises"
import { describe, it } from "mocha"
import * as path from "path"

// Import the module under test (will fail until implemented)
import { parseHwpx, parseHwpxFromFile, getHwpxStructure } from "../hwpx-parser"

const FIXTURES_DIR = path.join(__dirname, "fixtures")

describe("HWPX Parser", () => {
	describe("parseHwpxFromFile", () => {
		it("should extract text from HWPX file", async () => {
			const hwpxPath = path.join(FIXTURES_DIR, "sample.hwpx")
			const result = await parseHwpxFromFile(hwpxPath)

			expect(result).to.be.a("string")
			expect(result.length).to.be.greaterThan(0)
		})

		it("should extract Korean text correctly", async () => {
			const hwpxPath = path.join(FIXTURES_DIR, "sample.hwpx")
			const result = await parseHwpxFromFile(hwpxPath)

			// sample.hwpx contains Korean text about "참여인력 이력사항"
			expect(result).to.include("참여인력")
		})

		it("should throw error for non-existent file", async () => {
			const invalidPath = path.join(FIXTURES_DIR, "nonexistent.hwpx")

			try {
				await parseHwpxFromFile(invalidPath)
				expect.fail("Should have thrown an error")
			} catch (error) {
				expect((error as Error).message).to.include("not found")
			}
		})

		it("should throw error for invalid HWPX file", async () => {
			// PDF is not a valid HWPX
			const invalidPath = path.join(FIXTURES_DIR, "sample.pdf")

			try {
				await parseHwpxFromFile(invalidPath)
				expect.fail("Should have thrown an error")
			} catch (error) {
				expect((error as Error).message).to.match(/invalid|not.*hwpx|zip/i)
			}
		})
	})

	describe("parseHwpx (from buffer)", () => {
		it("should extract text from HWPX buffer", async () => {
			const hwpxPath = path.join(FIXTURES_DIR, "sample.hwpx")
			const buffer = await fs.readFile(hwpxPath)
			const result = await parseHwpx(buffer)

			expect(result).to.be.a("string")
			expect(result.length).to.be.greaterThan(0)
		})

		it("should prefer Preview/PrvText.txt when available", async () => {
			const hwpxPath = path.join(FIXTURES_DIR, "sample.hwpx")
			const buffer = await fs.readFile(hwpxPath)
			const result = await parseHwpx(buffer)

			// Preview text should contain the same content
			expect(result).to.include("참여인력")
		})
	})

	describe("getHwpxStructure", () => {
		it("should return structure information", async () => {
			const hwpxPath = path.join(FIXTURES_DIR, "sample.hwpx")
			const buffer = await fs.readFile(hwpxPath)
			const structure = await getHwpxStructure(buffer)

			expect(structure).to.have.property("hasPreviewText")
			expect(structure).to.have.property("sectionCount")
			expect(structure).to.have.property("hasImages")

			// sample.hwpx has Preview/PrvText.txt
			expect(structure.hasPreviewText).to.be.true
			expect(structure.sectionCount).to.be.at.least(1)
		})
	})
})
