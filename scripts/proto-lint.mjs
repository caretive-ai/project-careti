// CARETI MODIFICATION: cross-platform proto lint runner.
import { execSync } from "child_process"

const root = process.cwd()

function run(command, options = {}) {
	execSync(command, { stdio: "inherit", cwd: root, ...options })
}

try {
	run("npx buf lint")
	run("npx buf format -w --exit-code")
} catch (error) {
	console.error("Proto lint failed:", error?.message || error)
	process.exit(1)
}

try {
	run('rg -n --glob "*.proto" "rpc .*[A-Z][A-Z].*\\("')
	console.error("Error: Proto RPC names cannot contain repeated capital letters")
	process.exit(1)
} catch (error) {
	if (error?.status === 1) {
		process.exit(0)
	}
	console.error("Proto RPC name scan failed:", error?.message || error)
	process.exit(1)
}
