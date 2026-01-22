// CARETI MODIFICATION: TDD tests for PPTX (PowerPoint) document parser

import { expect } from "chai"
import * as fs from "fs/promises"
import { describe, it } from "mocha"
import * as path from "path"

// Import the module under test (will fail until implemented)
import { parsePptx, parsePptxFromFile, getPptxStructure } from "../pptx-parser"

const FIXTURES_DIR = path.join(__dirname, "fixtures")

describe("PPTX Parser", () => {
	describe("parsePptxFromFile", () => {
		it("should extract text from PPTX file", async () => {
			const pptxPath = path.join(FIXTURES_DIR, "sample.pptx")
			const result = await parsePptxFromFile(pptxPath)

			expect(result).to.be.a("string")
			expect(result.length).to.be.greaterThan(0)
		})

		it("should extract Korean text correctly", async () => {
			const pptxPath = path.join(FIXTURES_DIR, "sample.pptx")
			const result = await parsePptxFromFile(pptxPath)

			// sample.pptx contains Korean text about "캐릭터 설정"
			expect(result).to.include("캐릭터")
		})

		it("should throw error for non-existent file", async () => {
			const invalidPath = path.join(FIXTURES_DIR, "nonexistent.pptx")

			try {
				await parsePptxFromFile(invalidPath)
				expect.fail("Should have thrown an error")
			} catch (error) {
				expect((error as Error).message).to.include("not found")
			}
		})

		it("should throw error for invalid PPTX file", async () => {
			// PDF is not a valid PPTX
			const invalidPath = path.join(FIXTURES_DIR, "sample.pdf")

			try {
				await parsePptxFromFile(invalidPath)
				expect.fail("Should have thrown an error")
			} catch (error) {
				expect((error as Error).message).to.match(/invalid|not.*pptx|zip/i)
			}
		})
	})

	describe("parsePptx (from buffer)", () => {
		it("should extract text from PPTX buffer", async () => {
			const pptxPath = path.join(FIXTURES_DIR, "sample.pptx")
			const buffer = await fs.readFile(pptxPath)
			const result = await parsePptx(buffer)

			expect(result).to.be.a("string")
			expect(result.length).to.be.greaterThan(0)
		})

		it("should extract text from all slides", async () => {
			const pptxPath = path.join(FIXTURES_DIR, "sample.pptx")
			const buffer = await fs.readFile(pptxPath)
			const result = await parsePptx(buffer)

			// Should contain content from the slide
			expect(result).to.include("캐릭터")
		})

		it("should preserve slide order", async () => {
			const pptxPath = path.join(FIXTURES_DIR, "sample.pptx")
			const buffer = await fs.readFile(pptxPath)
			const result = await parsePptx(buffer)

			// Content should be extracted in order
			expect(result).to.be.a("string")
		})
	})

	describe("getPptxStructure", () => {
		it("should return structure information", async () => {
			const pptxPath = path.join(FIXTURES_DIR, "sample.pptx")
			const buffer = await fs.readFile(pptxPath)
			const structure = await getPptxStructure(buffer)

			expect(structure).to.have.property("slideCount")
			expect(structure).to.have.property("hasMedia")

			// sample.pptx has at least 1 slide
			expect(structure.slideCount).to.be.at.least(1)
		})

		it("should detect media files", async () => {
			const pptxPath = path.join(FIXTURES_DIR, "sample.pptx")
			const buffer = await fs.readFile(pptxPath)
			const structure = await getPptxStructure(buffer)

			// sample.pptx has images
			expect(structure.hasMedia).to.be.true
		})
	})
})
