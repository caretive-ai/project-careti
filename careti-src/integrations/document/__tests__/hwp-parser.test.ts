// CARETI MODIFICATION: TDD tests for HWP 5.0 (구형 한글) document parser

import { expect } from "chai"
import * as fs from "fs/promises"
import { describe, it } from "mocha"
import * as path from "path"

// Import the module under test (will fail until implemented)
import { parseHwp, parseHwpFromFile } from "../hwp-parser"

const FIXTURES_DIR = path.join(__dirname, "fixtures")

describe("HWP 5.0 Parser", () => {
	describe("parseHwpFromFile", () => {
		it("should extract text from HWP 5.0 file", async () => {
			const hwpPath = path.join(FIXTURES_DIR, "sample.hwp")
			const result = await parseHwpFromFile(hwpPath)

			expect(result).to.be.a("string")
			expect(result.length).to.be.greaterThan(0)
		})

		it("should extract Korean text correctly", async () => {
			const hwpPath = path.join(FIXTURES_DIR, "sample.hwp")
			const result = await parseHwpFromFile(hwpPath)

			// HWP files typically contain Korean text
			// Check that we get meaningful content (not just binary garbage)
			expect(result.length).to.be.greaterThan(10)
			// The sample contains "사업계획" (business plan)
			expect(result).to.include("사업계획")
		})

		it("should throw error for non-existent file", async () => {
			const invalidPath = path.join(FIXTURES_DIR, "nonexistent.hwp")

			try {
				await parseHwpFromFile(invalidPath)
				expect.fail("Should have thrown an error")
			} catch (error) {
				expect((error as Error).message).to.include("not found")
			}
		})

		it("should throw error for invalid HWP file", async () => {
			// PDF is not a valid HWP
			const invalidPath = path.join(FIXTURES_DIR, "sample.pdf")

			try {
				await parseHwpFromFile(invalidPath)
				expect.fail("Should have thrown an error")
			} catch (error) {
				expect((error as Error).message).to.match(/invalid|not.*hwp|parse/i)
			}
		})
	})

	describe("parseHwp (from buffer)", () => {
		it("should extract text from HWP buffer", async () => {
			const hwpPath = path.join(FIXTURES_DIR, "sample.hwp")
			const buffer = await fs.readFile(hwpPath)
			const result = await parseHwp(buffer)

			expect(result).to.be.a("string")
			expect(result.length).to.be.greaterThan(0)
		})

		it("should handle HWP 5.0 format correctly", async () => {
			const hwpPath = path.join(FIXTURES_DIR, "sample.hwp")
			const buffer = await fs.readFile(hwpPath)
			const result = await parseHwp(buffer)

			// Should return meaningful text content
			expect(result.trim().length).to.be.greaterThan(0)
		})
	})
})
