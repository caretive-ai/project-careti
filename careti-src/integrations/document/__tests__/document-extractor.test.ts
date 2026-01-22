// CARETI MODIFICATION: TDD tests for unified document extractor

import { expect } from "chai"
import { describe, it } from "mocha"
import * as path from "path"

// Import the module under test (will fail until implemented)
import { DocumentExtractor } from "../document-extractor"

const FIXTURES_DIR = path.join(__dirname, "fixtures")

describe("DocumentExtractor", () => {
	let extractor: DocumentExtractor

	beforeEach(() => {
		extractor = new DocumentExtractor()
	})

	describe("extract", () => {
		describe("PDF extraction", () => {
			it("should extract text from PDF file", async () => {
				const pdfPath = path.join(FIXTURES_DIR, "sample.pdf")
				const result = await extractor.extract(pdfPath, { cwd: FIXTURES_DIR })

				expect(result.content).to.be.a("string")
				expect(result.content.length).to.be.greaterThan(0)
				expect(result.format).to.equal("pdf")
				expect(result.filePath).to.equal(pdfPath)
			})

			it("should handle relative paths", async () => {
				const result = await extractor.extract("sample.pdf", { cwd: FIXTURES_DIR })

				expect(result.content).to.be.a("string")
				expect(result.format).to.equal("pdf")
			})
		})

		describe("HWPX extraction", () => {
			it("should extract text from HWPX file", async () => {
				const hwpxPath = path.join(FIXTURES_DIR, "sample.hwpx")
				const result = await extractor.extract(hwpxPath, { cwd: FIXTURES_DIR })

				expect(result.content).to.be.a("string")
				expect(result.content.length).to.be.greaterThan(0)
				expect(result.format).to.equal("hwpx")
			})

			it("should extract Korean text from HWPX", async () => {
				const hwpxPath = path.join(FIXTURES_DIR, "sample.hwpx")
				const result = await extractor.extract(hwpxPath, { cwd: FIXTURES_DIR })

				expect(result.content).to.include("참여인력")
			})
		})

		describe("PPTX extraction", () => {
			it("should extract text from PPTX file", async () => {
				const pptxPath = path.join(FIXTURES_DIR, "sample.pptx")
				const result = await extractor.extract(pptxPath, { cwd: FIXTURES_DIR })

				expect(result.content).to.be.a("string")
				expect(result.content.length).to.be.greaterThan(0)
				expect(result.format).to.equal("pptx")
			})

			it("should extract Korean text from PPTX", async () => {
				const pptxPath = path.join(FIXTURES_DIR, "sample.pptx")
				const result = await extractor.extract(pptxPath, { cwd: FIXTURES_DIR })

				expect(result.content).to.include("캐릭터")
			})
		})

		describe("Error handling", () => {
			it("should throw error for non-existent file", async () => {
				try {
					await extractor.extract("nonexistent.pdf", { cwd: FIXTURES_DIR })
					expect.fail("Should have thrown an error")
				} catch (error) {
					expect((error as Error).message).to.include("not found")
				}
			})

			it("should throw error for unsupported format", async () => {
				try {
					// HWP (binary) is not supported in phase 1
					await extractor.extract("sample.hwp", { cwd: FIXTURES_DIR })
					expect.fail("Should have thrown an error")
				} catch (error) {
					expect((error as Error).message).to.match(/unsupported|not supported/i)
				}
			})

			it("should throw error for files exceeding size limit", async () => {
				const pdfPath = path.join(FIXTURES_DIR, "sample.pdf")

				try {
					// Set very small max file size
					await extractor.extract(pdfPath, {
						cwd: FIXTURES_DIR,
						maxFileSize: 100, // 100 bytes
					})
					expect.fail("Should have thrown an error")
				} catch (error) {
					expect((error as Error).message).to.match(/too large|size/i)
				}
			})
		})

		describe("Format detection", () => {
			it("should detect PDF format from extension", async () => {
				const result = await extractor.extract("sample.pdf", { cwd: FIXTURES_DIR })
				expect(result.format).to.equal("pdf")
			})

			it("should detect HWPX format from extension", async () => {
				const result = await extractor.extract("sample.hwpx", { cwd: FIXTURES_DIR })
				expect(result.format).to.equal("hwpx")
			})

			it("should detect PPTX format from extension", async () => {
				const result = await extractor.extract("sample.pptx", { cwd: FIXTURES_DIR })
				expect(result.format).to.equal("pptx")
			})
		})
	})

	describe("getSupportedFormats", () => {
		it("should return list of supported formats", () => {
			const formats = extractor.getSupportedFormats()

			expect(formats).to.be.an("array")
			expect(formats).to.include("pdf")
			expect(formats).to.include("docx")
			expect(formats).to.include("xlsx")
			expect(formats).to.include("pptx")
			expect(formats).to.include("hwpx")
			expect(formats).to.include("ipynb")
		})
	})

	describe("isSupported", () => {
		it("should return true for supported formats", () => {
			expect(extractor.isSupported("sample.pdf")).to.be.true
			expect(extractor.isSupported("sample.docx")).to.be.true
			expect(extractor.isSupported("sample.hwpx")).to.be.true
			expect(extractor.isSupported("sample.pptx")).to.be.true
		})

		it("should return false for unsupported formats", () => {
			expect(extractor.isSupported("sample.hwp")).to.be.false
			expect(extractor.isSupported("sample.ppt")).to.be.false
			expect(extractor.isSupported("sample.txt")).to.be.false
			expect(extractor.isSupported("sample.xyz")).to.be.false
		})
	})
})
