#!/usr/bin/env node

// CARET MODIFICATION: Download protoc for Windows

const https = require("https")
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const PROTOC_VERSION = "25.1" // Latest stable version
const PROTOC_URL = `https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/protoc-${PROTOC_VERSION}-win64.zip`
const TEMP_DIR = path.resolve("protoc-temp")
const ZIP_PATH = path.join(TEMP_DIR, "protoc.zip")

async function downloadFile(url, dest) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(dest)
		https
			.get(url, (response) => {
				if (response.statusCode === 302 || response.statusCode === 301) {
					// Handle redirect
					https
						.get(response.headers.location, (redirectResponse) => {
							redirectResponse.pipe(file)
							file.on("finish", () => {
								file.close(resolve)
							})
						})
						.on("error", reject)
				} else {
					response.pipe(file)
					file.on("finish", () => {
						file.close(resolve)
					})
				}
			})
			.on("error", reject)
	})
}

async function main() {
	console.log("Downloading protoc for Windows...")

	// Create temp directory
	if (!fs.existsSync(TEMP_DIR)) {
		fs.mkdirSync(TEMP_DIR, { recursive: true })
	}

	// Check if protoc already exists
	const protocPath = path.join(TEMP_DIR, "bin", "protoc.exe")
	if (fs.existsSync(protocPath)) {
		console.log("protoc.exe already exists at", protocPath)
		return
	}

	try {
		// Download protoc
		console.log("Downloading from:", PROTOC_URL)
		await downloadFile(PROTOC_URL, ZIP_PATH)

		// Extract zip using PowerShell
		console.log("Extracting protoc...")
		execSync(`powershell -Command "Expand-Archive -Path '${ZIP_PATH}' -DestinationPath '${TEMP_DIR}' -Force"`, {
			stdio: "inherit",
		})

		// Clean up zip file
		fs.unlinkSync(ZIP_PATH)

		console.log("✅ protoc downloaded successfully to", protocPath)
	} catch (error) {
		console.error("Error downloading protoc:", error)
		process.exit(1)
	}
}

main()
