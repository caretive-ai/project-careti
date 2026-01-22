// CARETI MODIFICATION: cross-platform CLI build dispatcher.
import { execSync } from "child_process"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")

const isWindows = process.platform === "win32"

try {
	if (isWindows) {
		execSync(
			`powershell -ExecutionPolicy Bypass -File "${path.join(root, "scripts", "build-cli.ps1")}"`,
			{ stdio: "inherit" },
		)
	} else {
		execSync(`bash "${path.join(root, "scripts", "build-cli.sh")}"`, { stdio: "inherit" })
	}
} catch (error) {
	console.error("CLI build failed:", error?.message || error)
	process.exit(1)
}
