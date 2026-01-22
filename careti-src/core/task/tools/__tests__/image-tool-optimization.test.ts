// CARETI MODIFICATION: Image validation tests - 7500px pixel limit only (matches cline-latest)

import { optimizeImageDataUrl } from "@careti/utils/image-optimization"
import { expect } from "chai"
import * as fs from "fs/promises"
import { after, afterEach, before, beforeEach, describe, it } from "mocha"
import { tmpdir } from "os"
import * as path from "path"
import * as sharp from "sharp"

describe("Image Validation (7500px limit)", () => {
	const testImagesDir = path.join(tmpdir(), "careti-image-tests")
	let testImagePaths: string[] = []

	before(async () => {
		await fs.mkdir(testImagesDir, { recursive: true })
	})

	after(async () => {
		for (const filePath of testImagePaths) {
			try {
				await fs.unlink(filePath)
			} catch {
				// Ignore cleanup errors
			}
		}
		try {
			await fs.rmdir(testImagesDir)
		} catch {
			// Ignore cleanup errors
		}
	})

	beforeEach(() => {
		testImagePaths = []
	})

	afterEach(async () => {
		for (const filePath of testImagePaths) {
			try {
				await fs.unlink(filePath)
			} catch {
				// Ignore cleanup errors
			}
		}
	})

	describe("Pixel Dimension Validation", () => {
		it("should return original image when under 7500px", async () => {
			// Create a real 100x100 PNG image
			const imageBuffer = await sharp.default({
				create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } },
			})
				.png()
				.toBuffer()
			const dataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`

			const result = await optimizeImageDataUrl(dataUrl)
			expect(result).to.equal(dataUrl) // No modification
		})

		it("should return original image for 1024px (no longer resizes)", async () => {
			// Create a real 1024x1024 image
			const imageBuffer = await sharp.default({
				create: { width: 1024, height: 1024, channels: 3, background: { r: 0, g: 255, b: 0 } },
			})
				.png()
				.toBuffer()
			const dataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`

			const result = await optimizeImageDataUrl(dataUrl)
			expect(result).to.equal(dataUrl) // No modification, original returned
		})

		it("should return original image for 2000px (no longer resizes)", async () => {
			// Create a real 2000x2000 image
			const imageBuffer = await sharp.default({
				create: { width: 2000, height: 2000, channels: 3, background: { r: 0, g: 0, b: 255 } },
			})
				.png()
				.toBuffer()
			const dataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`

			const result = await optimizeImageDataUrl(dataUrl)
			expect(result).to.equal(dataUrl) // No modification, original returned
		})

		it("should throw error for >7500px image", async () => {
			// Create a real 8000x100 image (exceeds 7500px on one dimension)
			const imageBuffer = await sharp.default({
				create: { width: 8000, height: 100, channels: 3, background: { r: 128, g: 128, b: 128 } },
			})
				.png()
				.toBuffer()
			const dataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`

			try {
				await optimizeImageDataUrl(dataUrl)
				expect.fail("Should have thrown an error")
			} catch (error) {
				expect((error as Error).message).to.include("7500px")
			}
		})
	})

	describe("Format Handling", () => {
		it("should accept PNG format", async () => {
			const imageBuffer = await sharp.default({
				create: { width: 50, height: 50, channels: 3, background: { r: 255, g: 255, b: 255 } },
			})
				.png()
				.toBuffer()
			const dataUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`

			const result = await optimizeImageDataUrl(dataUrl)
			expect(result).to.equal(dataUrl)
		})

		it("should accept JPEG format", async () => {
			const imageBuffer = await sharp.default({
				create: { width: 50, height: 50, channels: 3, background: { r: 255, g: 255, b: 255 } },
			})
				.jpeg()
				.toBuffer()
			const dataUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`

			const result = await optimizeImageDataUrl(dataUrl)
			expect(result).to.equal(dataUrl)
		})

		it("should accept WebP format", async () => {
			const imageBuffer = await sharp.default({
				create: { width: 50, height: 50, channels: 3, background: { r: 255, g: 255, b: 255 } },
			})
				.webp()
				.toBuffer()
			const dataUrl = `data:image/webp;base64,${imageBuffer.toString("base64")}`

			const result = await optimizeImageDataUrl(dataUrl)
			expect(result).to.equal(dataUrl)
		})
	})

	describe("Error Handling", () => {
		it("should handle invalid data URL format", async () => {
			const invalidDataUrl = "not-a-data-url"

			try {
				await optimizeImageDataUrl(invalidDataUrl)
				expect.fail("Should have thrown an error")
			} catch (error) {
				expect((error as Error).message).to.include("Invalid data URL")
			}
		})

		it("should handle corrupted image data", async () => {
			const corruptedDataUrl = "data:image/png;base64,corrupted_base64_data!!!"

			try {
				await optimizeImageDataUrl(corruptedDataUrl)
				expect.fail("Should have thrown an error")
			} catch (error) {
				// Sharp throws error for corrupted data
				expect(error).to.be.instanceOf(Error)
			}
		})
	})

	describe("File Read Integration", () => {
		it("should read image file from path", async () => {
			const testImage = await createRealTestImageFile(testImagesDir, "test-png.png", 100, 100)
			testImagePaths.push(testImage)

			const buffer = await fs.readFile(testImage)
			expect(buffer.length).to.be.greaterThan(0)
		})

		it("should handle non-existent file gracefully", async () => {
			const nonExistentPath = path.join(testImagesDir, "non-existent.png")

			try {
				await fs.readFile(nonExistentPath)
				expect.fail("Should have thrown an error")
			} catch (error) {
				const nodeError = error as NodeJS.ErrnoException
				expect(nodeError.code).to.equal("ENOENT")
			}
		})

		it("should validate image after file read (returns original)", async () => {
			const testImage = await createRealTestImageFile(testImagesDir, "test-large.jpg", 1500, 1500)
			testImagePaths.push(testImage)

			const buffer = await fs.readFile(testImage)
			const dataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`
			const result = await optimizeImageDataUrl(dataUrl)

			// Should return original (no optimization)
			expect(result).to.equal(dataUrl)
		})
	})
})

async function createRealTestImageFile(dir: string, filename: string, width: number, height: number): Promise<string> {
	const filePath = path.join(dir, filename)
	const ext = path.extname(filename).toLowerCase()

	let imageBuffer: Buffer
	const sharpInstance = sharp.default({
		create: { width, height, channels: 3, background: { r: 100, g: 150, b: 200 } },
	})

	if (ext === ".jpg" || ext === ".jpeg") {
		imageBuffer = await sharpInstance.jpeg().toBuffer()
	} else if (ext === ".webp") {
		imageBuffer = await sharpInstance.webp().toBuffer()
	} else {
		imageBuffer = await sharpInstance.png().toBuffer()
	}

	await fs.writeFile(filePath, imageBuffer)
	return filePath
}
