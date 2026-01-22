// CARETI MODIFICATION: cross-platform CLI multi-platform build dispatcher.
import { execSync } from "child_process"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const isWindows = process.platform === "win32"

try {
	if (isWindows) {
		execSync(
			`powershell -ExecutionPolicy Bypass -File "${path.join(root, "scripts", "build-cli-all-platforms.ps1")}"`,
			{ stdio: "inherit" },
		)
	} else {
		execSync(`bash "${path.join(root, "scripts", "build-cli-all-platforms-careti.sh")}"`, { stdio: "inherit" })
	}
} catch (error) {
	console.error("CLI multi-platform build failed:", error?.message || error)
	process.exit(1)
}
