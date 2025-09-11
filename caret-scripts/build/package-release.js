const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const projectRoot = path.resolve(__dirname, "..", "..")

function getTimestamp() {
	const now = new Date()
	const YYYY = now.getFullYear()
	const MM = String(now.getMonth() + 1).padStart(2, "0")
	const DD = String(now.getDate()).padStart(2, "0")
	const HH = String(now.getHours()).padStart(2, "0")
	const mm = String(now.getMinutes()).padStart(2, "0")
	return `${YYYY}${MM}${DD}${HH}${mm}`
}

function runCommand(command, description) {
	console.log(`\n📦 [${description}] Running command: ${command}`)
	console.log(`📁 Working directory: ${projectRoot}`)
	try {
		execSync(command, { stdio: "inherit", cwd: projectRoot })
		console.log(`✅ [${description}] Command completed successfully.`)
	} catch (error) {
		console.error(`❌ [${description}] Command failed: ${error.message}`)
		// execSync throws an error that includes stderr, so no need to log it separately
		process.exit(1)
	}
}

function cleanDirectory(directoryPath, description) {
	console.log(`\n🧹 [${description}] Cleaning directory: ${directoryPath}`)
	if (fs.existsSync(directoryPath)) {
		try {
			fs.rmSync(directoryPath, { recursive: true, force: true })
			console.log(`✅ [${description}] Directory cleaned successfully.`)
		} catch (error) {
			console.error(`❌ [${description}] Failed to clean directory: ${error.message}`)
			process.exit(1)
		}
	} else {
		console.log(`ℹ️ [${description}] Directory does not exist, skipping cleanup.`)
	}
}

console.log("🚀 Starting Caret VSIX release packaging process...")

// 1. Read version from package.json
let version
try {
	const packageJsonPath = path.join(projectRoot, "package.json")
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))
	version = packageJson.version
	if (!version) {
		throw new Error("Version not found in package.json")
	}
	console.log(`ℹ️ Project version: ${version}`)
} catch (error) {
	console.error(`❌ Failed to read version from package.json: ${error.message}`)
	process.exit(1)
}

// 2. Generate timestamp and VSIX filename/path
const timestamp = getTimestamp()
const vsixFilename = `caret-${version}-${timestamp}.vsix`
const outputDir = path.join(projectRoot, "output")
const outputPath = path.join(outputDir, vsixFilename)
console.log(`ℹ️ Target VSIX file: ${outputPath}`)

// 3. Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
	try {
		fs.mkdirSync(outputDir, { recursive: true })
		console.log(`✅ Output directory created: ${outputDir}`)
	} catch (error) {
		console.error(`❌ Failed to create output directory: ${error.message}`)
		process.exit(1)
	}
}

// 4. Clean build artifacts
const webviewUiBuildPath = path.join(projectRoot, "webview-ui", "build")
const rootDistPath = path.join(projectRoot, "dist") // vsce might create this
console.log(`📁 Project root path: ${projectRoot}`)
console.log(`📁 Webview UI build path: ${webviewUiBuildPath}`)
console.log(`📁 Root dist path: ${rootDistPath}`)
cleanDirectory(webviewUiBuildPath, "Webview UI Build Directory")
cleanDirectory(rootDistPath, "Root Dist Directory")

// 5. Run build commands
runCommand("npm run protos", "Protocol Buffers Compilation")
runCommand("npm run compile", "Backend TypeScript Compilation")
runCommand("npm run build:webview", "Webview UI Production Build")

// 6. Package with vsce
const vsceCmd = `npx vsce package --out "${outputPath}" --allow-missing-repository`
runCommand(vsceCmd, "VSIX Packaging with VSCE")

// 7. Check package size
function getFileSizeInMB(filePath) {
	const stats = fs.statSync(filePath)
	const fileSizeInBytes = stats.size
	const fileSizeInMB = fileSizeInBytes / (1024 * 1024)
	return fileSizeInMB.toFixed(2)
}

function formatSize(size) {
	if (size < 1) {
		return `${(size * 1024).toFixed(2)} KB`
	}
	return `${size} MB`
}

function analyzePackageSize() {
	console.log("\n📊 Analyzing package size...")

	try {
		const packageSizeInMB = getFileSizeInMB(outputPath)
		console.log(`📦 Package size: ${formatSize(packageSizeInMB)}`)

		// Warning thresholds
		const WARNING_THRESHOLD_MB = 300
		const CRITICAL_THRESHOLD_MB = 750

		if (packageSizeInMB > CRITICAL_THRESHOLD_MB) {
			console.log("\n❗❗❗ CRITICAL SIZE WARNING ❗❗❗")
			console.log(`📢 Package size is extremely large (${packageSizeInMB} MB)!`)
			console.log("📢 This may cause issues with extension installation and performance.")
			console.log("📢 Consider reviewing .vscodeignore to exclude unnecessary files.")
		} else if (packageSizeInMB > WARNING_THRESHOLD_MB) {
			console.log("\n⚠️ SIZE WARNING ⚠️")
			console.log(`📢 Package size is quite large (${packageSizeInMB} MB).`)
			console.log("📢 Consider optimizing the package by updating .vscodeignore.")
		} else {
			console.log("✅ Package size is within acceptable range.")
		}

		return packageSizeInMB
	} catch (error) {
		console.error(`❌ Failed to analyze package size: ${error.message}`)
		return null
	}
}

const packageSize = analyzePackageSize()

console.log(`\n🎉 Successfully packaged VSIX: ${outputPath}`)
console.log(`📦 Final package size: ${formatSize(packageSize)} MB`)
console.log("\n✨ Caret release packaging process completed! ✨")
console.log("\n👉 To examine which files are included in your VSIX package, you can:")
console.log("   1. Rename the .vsix file to .zip")
console.log("   2. Extract the contents")
console.log("   3. Check the 'extension' folder to see all included files")
console.log("\n👉 Or use the 'vsce ls' command to list files that will be included in the package")
