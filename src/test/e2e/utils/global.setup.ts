import { readFileSync, rmSync } from "node:fs"
import { join } from "node:path"
import { test as setup } from "@playwright/test"
import { E2ETestHelper } from "./helpers"

// CARETI MODIFICATION: Load E2E test environment variables
function loadEnvFile() {
	try {
		const envPath = join(__dirname, "../fixtures/workspace/evals.env")
		const content = readFileSync(envPath, "utf-8")
		for (const line of content.split("\n")) {
			const trimmed = line.trim()
			if (trimmed && !trimmed.startsWith("#")) {
				const [key, ...valueParts] = trimmed.split("=")
				const value = valueParts.join("=")
				if (key && value && !process.env[key]) {
					process.env[key] = value
					console.log(`📝 Loaded env: ${key}=${value.substring(0, 15)}...`)
				}
			}
		}
	} catch (error) {
		console.warn("⚠️ Could not load evals.env:", error)
	}
}

loadEnvFile()

setup("setup test environment", async () => {
	try {
		const path = E2ETestHelper.getResultsDir()
		const options = { recursive: true, force: true }

		const maxAttempts = 2

		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			try {
				rmSync(path, options)
				return
			} catch (error) {
				if (attempt === maxAttempts) {
					throw new Error(`Failed to rmSync ${path} after ${maxAttempts} attempts: ${error}`)
				}
				console.error(`Failed to rmSync ${path} after ${attempt} attempts: ${error}`)
				await new Promise((resolve) => setTimeout(resolve, 50 * attempt)) // Progressive delay
			}
		}
	} catch (error) {
		console.error(`Error during setup: ${error}`)
	}
})
