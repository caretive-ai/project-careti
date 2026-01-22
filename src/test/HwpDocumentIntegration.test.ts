// CARETI MODIFICATION: Integration test for HWP document parsing
// Tests HWP 5.0 parser with real sample files
// Run with: npm run test:integration -- --grep "HWP Document"

import { describe, it } from "mocha"
import { expect } from "chai"
import * as fs from "fs/promises"
import * as path from "path"

import { parseHwp, parseHwpFromFile } from "@careti/integrations/document/hwp-parser"
import { DocumentExtractor } from "@careti/integrations/document/document-extractor"

const FIXTURES_DIR = path.resolve(__dirname, "../../careti-src/integrations/document/__tests__/fixtures")

describe("HWP Document Integration", function () {
	this.timeout(10000)

	describe("HWP Parser - Direct", () => {
		it("should parse sample.hwp file successfully", async () => {
			const hwpPath = path.join(FIXTURES_DIR, "sample.hwp")

			// Check file exists
			const exists = await fs
				.access(hwpPath)
				.then(() => true)
				.catch(() => false)
			expect(exists, `Sample HWP file should exist at: ${hwpPath}`).to.be.true

			const result = await parseHwpFromFile(hwpPath)

			expect(result).to.be.a("string")
			expect(result.length).to.be.greaterThan(0)
			console.log(`Extracted ${result.length} characters from HWP file`)
			console.log("Content preview:", result.substring(0, 200))
		})

		it("should extract Korean text from HWP", async () => {
			const hwpPath = path.join(FIXTURES_DIR, "sample.hwp")
			const result = await parseHwpFromFile(hwpPath)

			// Sample file contains "사업계획" (business plan)
			expect(result).to.include("사업계획")
		})

		it("should parse HWP from buffer", async () => {
			const hwpPath = path.join(FIXTURES_DIR, "sample.hwp")
			const buffer = await fs.readFile(hwpPath)

			const result = await parseHwp(buffer)

			expect(result).to.be.a("string")
			expect(result.length).to.be.greaterThan(0)
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
	})

	describe("DocumentExtractor - HWP Support", () => {
		let extractor: DocumentExtractor

		before(() => {
			extractor = new DocumentExtractor()
		})

		it("should recognize HWP as supported format", () => {
			expect(extractor.isSupported("test.hwp")).to.be.true
			expect(extractor.isSupported("test.HWP")).to.be.true
		})

		it("should extract HWP via DocumentExtractor", async () => {
			const hwpPath = path.join(FIXTURES_DIR, "sample.hwp")

			const result = await extractor.extract(hwpPath, {
				cwd: FIXTURES_DIR,
			})

			expect(result.format).to.equal("hwp")
			expect(result.content).to.be.a("string")
			expect(result.content.length).to.be.greaterThan(0)
			console.log(`DocumentExtractor: Extracted ${result.content.length} chars, format: ${result.format}`)
		})

		it("should list HWP in supported formats", () => {
			const formats = extractor.getSupportedFormats()
			expect(formats).to.include(".hwp")
		})
	})

	describe("HWP with LLM Analysis (simulated)", () => {
		it("should extract meaningful content for LLM consumption", async () => {
			const hwpPath = path.join(FIXTURES_DIR, "sample.hwp")
			const extractor = new DocumentExtractor()

			const result = await extractor.extract(hwpPath, {
				cwd: FIXTURES_DIR,
			})

			// Content should be clean text suitable for LLM
			expect(result.content).to.not.include("\\x") // No hex escapes
			expect(result.content).to.not.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/) // No control chars

			// Should have meaningful Korean content
			const koreanChars = result.content.match(/[\uAC00-\uD7AF]/g) || []
			console.log(`Korean characters found: ${koreanChars.length}`)
			expect(koreanChars.length).to.be.greaterThan(10)
		})
	})
})

// Additional test for HWPX (modern format) if fixture exists
describe("HWPX Document Integration", function () {
	this.timeout(10000)

	const hwpxPath = path.join(FIXTURES_DIR, "sample.hwpx")

	before(async function () {
		// Skip if no HWPX fixture
		const exists = await fs
			.access(hwpxPath)
			.then(() => true)
			.catch(() => false)
		if (!exists) {
			console.log("No HWPX fixture found, skipping HWPX tests")
			this.skip()
		}
	})

	it("should parse HWPX file", async () => {
		const extractor = new DocumentExtractor()
		const result = await extractor.extract(hwpxPath, {
			cwd: FIXTURES_DIR,
		})

		expect(result.format).to.equal("hwpx")
		expect(result.content.length).to.be.greaterThan(0)
	})
})
