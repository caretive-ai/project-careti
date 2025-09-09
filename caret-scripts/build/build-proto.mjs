#!/usr/bin/env node

import chalk from "chalk"
import { execSync } from "child_process"
import * as fs from "fs/promises"
import { globby } from "globby"
import { createRequire } from "module"
import os from "os"
import * as path from "path"
import { rmrf } from "./file-utils.mjs"
import { main as generateHostBridgeClient } from "./generate-host-bridge-client.mjs"
import { main as generateProtoBusSetup } from "./generate-protobus-setup.mjs"
import { loadProtoDescriptorSet } from "./proto-utils.mjs"

const require = createRequire(import.meta.url)
// CARET MODIFICATION: Use downloaded protoc instead of grpc-tools version for Windows compatibility
const PROTOC = path.resolve("protoc-temp/bin/protoc.exe")

const PROTO_DIR = path.resolve("proto")
const TS_OUT_DIR = path.resolve("src/shared/proto")
const GRPC_JS_OUT_DIR = path.resolve("src/generated/grpc-js")
const NICE_JS_OUT_DIR = path.resolve("src/generated/nice-grpc")
const DESCRIPTOR_OUT_DIR = path.resolve("dist-standalone/proto")

const isWindows = process.platform === "win32"
const TS_PROTO_PLUGIN = isWindows
	? path.resolve("node_modules/.bin/protoc-gen-ts_proto.cmd") // Use the .bin directory path for Windows
	: require.resolve("ts-proto/protoc-gen-ts_proto")

const TS_PROTO_OPTIONS = [
	"env=node",
	"esModuleInterop=true",
	"outputServices=generic-definitions", // output generic ServiceDefinitions
	"outputIndex=true", // output an index file for each package which exports all protos in the package.
	"useOptionals=messages", // Message fields are optional, scalars are not.
	"useDate=false", // Timestamp fields will not be automatically converted to Date.
]

async function main() {
	await cleanup()
	await compileProtos()
	await checkProtos()
	await generateProtoBusSetup()
	await generateHostBridgeClient()
	await postProcessGeneratedFiles() // CARET MODIFICATION: Add post-processing step AFTER all generation
}
async function compileProtos() {
	console.log(chalk.bold.blue("Compiling Protocol Buffers..."))

	// Check for Apple Silicon compatibility before proceeding
	checkAppleSiliconCompatibility()

	// Create output directories if they don't exist
	for (const dir of [TS_OUT_DIR, GRPC_JS_OUT_DIR, NICE_JS_OUT_DIR, DESCRIPTOR_OUT_DIR]) {
		await fs.mkdir(dir, { recursive: true })
	}

	// Process all proto files
	const protoFiles = await globby("**/*.proto", { cwd: PROTO_DIR, realpath: true })
	console.log(chalk.cyan(`Processing ${protoFiles.length} proto files from`), PROTO_DIR)

	tsProtoc(TS_OUT_DIR, protoFiles, TS_PROTO_OPTIONS)
	// grpc-js is used to generate service impls for the ProtoBus service.
	tsProtoc(GRPC_JS_OUT_DIR, protoFiles, ["outputServices=grpc-js,outputClientImpl=false", ...TS_PROTO_OPTIONS])
	// nice-js is used for the Host Bridge client impls because it uses promises.
	tsProtoc(NICE_JS_OUT_DIR, protoFiles, ["outputServices=nice-grpc,useExactTypes=false", ...TS_PROTO_OPTIONS])

	const descriptorFile = path.join(DESCRIPTOR_OUT_DIR, "descriptor_set.pb")
	const descriptorProtocCommand = [
		PROTOC,
		`--proto_path="${PROTO_DIR}"`,
		`--descriptor_set_out="${descriptorFile}"`,
		"--include_imports",
		...protoFiles,
	].join(" ")
	try {
		log_verbose(chalk.cyan("Generating descriptor set..."))
		execSync(descriptorProtocCommand, { stdio: "inherit" })
	} catch (error) {
		console.error(chalk.red("Error generating descriptor set for proto file:"), error)
		process.exit(1)
	}

	log_verbose(chalk.green("Protocol Buffer code generation completed successfully."))
	log_verbose(chalk.green(`TypeScript files generated in: ${TS_OUT_DIR}`))
}

// CARET MODIFICATION: Post-process generated files to fix common issues
async function postProcessGeneratedFiles() {
	console.log(chalk.bold.blue("Post-processing generated files..."))

	// Find all generated TypeScript files in specific directories
	const generatedFiles = await globby(
		["src/generated/**/*.ts", "src/shared/proto/**/*.ts", "webview-ui/src/services/grpc-client.ts"],
		{
			realpath: true,
			ignore: ["node_modules/**", "dist/**"],
		},
	)

	let filesFixed = 0

	for (const file of generatedFiles) {
		try {
			let content = await fs.readFile(file, "utf-8")
			let modified = false

			// Fix 1: Replace String(value) with globalThis.String(value) in object reduce functions
			if (content.includes("acc[key] = String(value);")) {
				content = content.replace(/acc\[key\] = String\(value\);/g, "acc[key] = globalThis.String(value);")
				modified = true
			}

			// Fix 2: Fix import paths for Caret-specific controllers
			if (content.includes("@core/controller/caretSystem/")) {
				content = content.replace(/@core\/controller\/caretSystem\//g, "@caret/core/controller/caretSystem/")
				modified = true
			}

			// Fix 3: Fix namespace issues in all generated files with Caret references
			const caretMatches = content.match(/(cline\.Caret|"cline\.Caret)[A-Za-z]*/g) || []
			if (caretMatches.length > 0) {
				console.log(chalk.cyan(`Processing ${file} for namespace fixes...`))
				console.log(chalk.gray(`File path: ${file}`))
				console.log(
					chalk.yellow(
						`Found ${caretMatches.length} cline.Caret* patterns: ${caretMatches.slice(0, 3).join(", ")}${caretMatches.length > 3 ? "..." : ""}`,
					),
				)

				// Simple and direct approach - replace all Caret-related cline references
				const originalContent = content

				// Fix service registration
				content = content.replace(/cline\.CaretAccountServiceService/g, "caret.CaretAccountServiceService")
				content = content.replace(/cline\.CaretSystemServiceService/g, "caret.CaretSystemServiceService")

				// Fix string references in service definitions
				content = content.replace(/"cline\.CaretAccountService"/g, '"caret.CaretAccountService"')
				content = content.replace(/"cline\.CaretSystemService"/g, '"caret.CaretSystemService"')

				// Fix all Caret type references
				content = content.replace(/cline\.CaretAuthState/g, "caret.CaretAuthState")
				content = content.replace(/cline\.CaretAuthStateChangedRequest/g, "caret.CaretAuthStateChangedRequest")
				content = content.replace(/cline\.CaretUserCreditsData/g, "caret.CaretUserCreditsData")
				content = content.replace(
					/cline\.GetCaretOrganizationCreditsRequest/g,
					"caret.GetCaretOrganizationCreditsRequest",
				)
				content = content.replace(/cline\.CaretOrganizationCreditsData/g, "caret.CaretOrganizationCreditsData")
				content = content.replace(/cline\.CaretUserOrganizationsResponse/g, "caret.CaretUserOrganizationsResponse")
				content = content.replace(
					/cline\.CaretUserOrganizationUpdateRequest/g,
					"caret.CaretUserOrganizationUpdateRequest",
				)

				// Fix CaretSystem service types
				content = content.replace(/cline\.SetPromptSystemModeRequest/g, "caret.SetPromptSystemModeRequest")
				content = content.replace(/cline\.SetPromptSystemModeResponse/g, "caret.SetPromptSystemModeResponse")
				content = content.replace(/cline\.GetPromptSystemModeRequest/g, "caret.GetPromptSystemModeRequest")
				content = content.replace(/cline\.GetPromptSystemModeResponse/g, "caret.GetPromptSystemModeResponse")
				content = content.replace(/cline\.SetCaretModeRequest/g, "caret.SetCaretModeRequest")
				content = content.replace(/cline\.SetCaretModeResponse/g, "caret.SetCaretModeResponse")
				content = content.replace(/cline\.GetCaretModeRequest/g, "caret.GetCaretModeRequest")
				content = content.replace(/cline\.GetCaretModeResponse/g, "caret.GetCaretModeResponse")

				const changesCount =
					originalContent !== content ? (originalContent.match(/cline\.(Caret|GetCaret)/g) || []).length : 0

				if (content !== originalContent) {
					console.log(chalk.green(`  - Fixed ${changesCount} Caret namespace references`))
					modified = true
				} else if (caretMatches.length > 0) {
					console.log(chalk.red(`  - WARNING: Found ${caretMatches.length} patterns but no changes made!`))
				}
			}

			if (modified) {
				await fs.writeFile(file, content, "utf-8")
				filesFixed++
			}
		} catch (error) {
			console.warn(chalk.yellow(`Warning: Could not process file ${file}:`, error.message))
		}
	}

	if (filesFixed > 0) {
		console.log(chalk.green(`✅ Fixed ${filesFixed} generated files`))
	} else {
		console.log(chalk.cyan("No files needed fixing"))
	}
}

async function tsProtoc(outDir, protoFiles, protoOptions) {
	// Build the protoc command with proper path handling for cross-platform
	const command = [
		PROTOC,
		`--proto_path="${PROTO_DIR}"`,
		`--plugin=protoc-gen-ts_proto="${TS_PROTO_PLUGIN}"`,
		`--ts_proto_out="${outDir}"`,
		`--ts_proto_opt=${protoOptions.join(",")} `,
		...protoFiles.map((s) => `"${s}"`),
	].join(" ")
	try {
		log_verbose(chalk.cyan(`Generating TypeScript code in ${outDir} for:\n${protoFiles.join("\n")}...`))
		log_verbose(command)
		execSync(command, { stdio: "inherit" })
	} catch (error) {
		console.error(chalk.red("Error generating TypeScript for proto files:"), error)
		process.exit(1)
	}
}

async function cleanup() {
	// Clean up existing generated files
	log_verbose(chalk.cyan("Cleaning up existing generated TypeScript files..."))
	await rmrf(TS_OUT_DIR)
	await rmrf("src/generated")

	// Clean up generated files that were moved.
	await rmrf("src/standalone/services/host-grpc-client.ts")
	await rmrf("src/standalone/server-setup.ts")
	await rmrf("src/hosts/vscode/host-grpc-service-config.ts")
	await rmrf("src/core/controller/grpc-service-config.ts")
	const oldhostbridgefiles = [
		"src/hosts/vscode/workspace/methods.ts",
		"src/hosts/vscode/workspace/index.ts",
		"src/hosts/vscode/diff/methods.ts",
		"src/hosts/vscode/diff/index.ts",
		"src/hosts/vscode/env/methods.ts",
		"src/hosts/vscode/env/index.ts",
		"src/hosts/vscode/window/methods.ts",
		"src/hosts/vscode/window/index.ts",
		"src/hosts/vscode/watch/methods.ts",
		"src/hosts/vscode/watch/index.ts",
		"src/hosts/vscode/uri/methods.ts",
		"src/hosts/vscode/uri/index.ts",
	]
	const oldprotobusfiles = [
		"src/core/controller/account/index.ts",
		"src/core/controller/account/methods.ts",
		"src/core/controller/browser/index.ts",
		"src/core/controller/browser/methods.ts",
		"src/core/controller/checkpoints/index.ts",
		"src/core/controller/checkpoints/methods.ts",
		"src/core/controller/file/index.ts",
		"src/core/controller/file/methods.ts",
		"src/core/controller/mcp/index.ts",
		"src/core/controller/mcp/methods.ts",
		"src/core/controller/models/index.ts",
		"src/core/controller/models/methods.ts",
		"src/core/controller/slash/index.ts",
		"src/core/controller/slash/methods.ts",
		"src/core/controller/state/index.ts",
		"src/core/controller/state/methods.ts",
		"src/core/controller/task/index.ts",
		"src/core/controller/task/methods.ts",
		"src/core/controller/ui/index.ts",
		"src/core/controller/ui/methods.ts",
		"src/core/controller/web/index.ts",
		"src/core/controller/web/methods.ts",
	]
	for (const file of [...oldhostbridgefiles, ...oldprotobusfiles]) {
		await rmrf(file)
	}
}

// Check for Apple Silicon compatibility
function checkAppleSiliconCompatibility() {
	// Only run check on macOS
	if (process.platform !== "darwin") {
		return
	}

	// Check if running on Apple Silicon
	const cpuArchitecture = os.arch()
	if (cpuArchitecture === "arm64") {
		try {
			// Check if Rosetta is installed
			const rosettaCheck = execSync('/usr/bin/pgrep oahd || echo "NOT_INSTALLED"').toString().trim()

			if (rosettaCheck === "NOT_INSTALLED") {
				console.log(chalk.yellow("Detected Apple Silicon (ARM64) architecture."))
				console.log(
					chalk.red("Rosetta 2 is NOT installed. The npm version of protoc is not compatible with Apple Silicon."),
				)
				console.log(chalk.cyan("Please install Rosetta 2 using the following command:"))
				console.log(chalk.cyan("  softwareupdate --install-rosetta --agree-to-license"))
				console.log(chalk.red("Aborting build process."))
				process.exit(1)
			}
		} catch (_error) {
			console.log(chalk.yellow("Could not determine Rosetta installation status. Proceeding anyway."))
		}
	}
}

const int64TypeNames = ["TYPE_INT64", "TYPE_UINT64", "TYPE_SINT64", "TYPE_FIXED64", "TYPE_SFIXED64"]

async function checkProtos() {
	const proto = await loadProtoDescriptorSet()
	const int64Fields = []

	for (const [packageName, packageDef] of Object.entries(proto)) {
		for (const [messageName, def] of Object.entries(packageDef)) {
			// Skip service definitions
			if (def && typeof def === "object" && "service" in def) {
				continue
			}
			// Check message fields
			if (def && def.type && def.type.field) {
				for (const field of def.type.field) {
					if (int64TypeNames.includes(field.type)) {
						const name = `${packageName}.${messageName}.${field.name}`
						int64Fields.push({
							name: name,
							type: field.type,
						})
					}
				}
			}
		}
	}

	if (int64Fields.length > 0) {
		console.log(chalk.yellow(`\nWarning: Found ${int64Fields.length} fields using 64-bit integer types`))
		for (const field of int64Fields) {
			const typeNames = {
				TYPE_INT64: "int64",
				TYPE_UINT64: "uint64",
				TYPE_SINT64: "sint64",
				TYPE_FIXED64: "fixed64",
				TYPE_SFIXED64: "sfixed64",
			}
			log_verbose(chalk.yellow(`  - ${field.name} (${typeNames[field.type]})`))
		}
		log_verbose(chalk.yellow("\nWARNING: 64-bit integer fields detected in proto definitions"))
		log_verbose(chalk.yellow("JavaScript cannot safely represent integers larger than 2^53-1 (Number.MAX_SAFE_INTEGER)."))
		log_verbose(chalk.yellow("Consider using string representation for large numbers or implementing BigInt support.\n"))
	}
}

function log_verbose(s) {
	if (process.argv.includes("-v") || process.argv.includes("--verbose")) {
		console.log(s)
	}
}

// Run the main function
main().catch((error) => {
	console.error(chalk.red("Error:"), error)
	process.exit(1)
})
