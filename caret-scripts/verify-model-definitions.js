const fs = require("fs")
const path = require("path")
const esbuild = require("esbuild")

const CARE_API_PATH = path.join(__dirname, "..", "src", "shared", "api.ts")
const CLINE_API_PATH = path.join(__dirname, "..", "cline-latest", "src", "shared", "api.ts")

/**
 * Extracts model definition objects from the api.ts file content.
 * This version creates a self-contained script to evaluate in a new context,
 * handling dependencies between model definitions.
 * @param {string} fileContent The content of the api.ts file.
 * @param {string} filePath The path to the file, for logging purposes.
 * @returns {Map<string, Set<string>>} A map where keys are model group names
 *                                     and values are a Set of model IDs.
 */
function extractModels(fileContent, filePath) {
	console.log(`\n--- Parsing ${filePath} ---`)
	const modelsMap = new Map()

	try {
		// 1. Transpile TypeScript to JavaScript in memory using esbuild
		const result = esbuild.transformSync(fileContent, {
			loader: "ts",
		})

		// 2. Remove 'export' keywords, import statements, and function declarations from the JS code
		let code = result.code.replace(/export /g, "")
		code = code.replace(/^import .* from '.*';/gm, "")
		// This regex removes function declarations to avoid executing them.
		code = code.replace(/^function\s+\w+\s*\([\s\S]*?\)\s*\{[\s\S]*?^\}/gm, "")

		// 3. Find all top-level const variable names declared in the script
		const allConstsRegex = /const (\w+)\s*=/g
		let match
		const allNames = []
		while ((match = allConstsRegex.exec(code)) !== null) {
			allNames.push(match[1])
		}

		// We are interested in all declared constants to resolve dependencies
		const scriptToRun = code + `\nreturn { ${allNames.join(", ")} };`

		// 4. Execute the script in a new function scope to get all model objects
		const allObjects = new Function(scriptToRun)()

		// 5. Populate the map with model definitions
		for (const objectName in allObjects) {
			// We only care about objects that define models or arrays of model names
			if (!objectName.includes("Model") && objectName !== "allModels") {
				continue
			}

			const modelObject = allObjects[objectName]
			if (modelObject) {
				const modelIds = Array.isArray(modelObject) ? modelObject : Object.keys(modelObject)
				modelsMap.set(objectName, new Set(modelIds))
			}
		}
	} catch (e) {
		console.error(`Error evaluating model definitions from ${filePath}:`, e)
	}

	return modelsMap
}

/**
 * Compares two maps of models and logs the differences.
 * @param {Map<string, Set<string>>} caretModels
 * @param {Map<string, Set<string>>} clineModels
 */
function compareModels(caretModels, clineModels) {
	console.log("🔍 Starting model definition comparison...")
	let hasDiscrepancy = false

	for (const [clineModelGroup, clineModelIds] of clineModels.entries()) {
		const caretModelIds = caretModels.get(clineModelGroup)

		if (!caretModelIds) {
			console.log(`\n❌ Missing Model Group in Caret: ${clineModelGroup}`)
			hasDiscrepancy = true
			continue
		}

		const missingModels = []
		for (const clineModelId of clineModelIds) {
			if (!caretModelIds.has(clineModelId)) {
				missingModels.push(clineModelId)
			}
		}

		if (missingModels.length > 0) {
			console.log(`\n⚠️ Discrepancy found in "${clineModelGroup}":`)
			console.log("   (Models in Cline but missing in Caret)")
			missingModels.forEach((modelId) => {
				console.log(`   - ${modelId}`)
			})
			hasDiscrepancy = true
		}
	}

	if (!hasDiscrepancy) {
		console.log("\n✅ All model definitions in Cline are present in Caret. Sync is perfect!")
	} else {
		console.log("\n---")
		console.log("Review the discrepancies above.")
	}
}

function main() {
	try {
		const caretContent = fs.readFileSync(CARE_API_PATH, "utf-8")
		const clineContent = fs.readFileSync(CLINE_API_PATH, "utf-8")

		const caretModels = extractModels(caretContent, CARE_API_PATH)
		const clineModels = extractModels(clineContent, CLINE_API_PATH)

		if (caretModels.size === 0 || clineModels.size === 0) {
			console.error("Could not parse models from one or both files. Aborting comparison.")
			return
		}

		compareModels(caretModels, clineModels)
	} catch (error) {
		console.error("An error occurred during script execution:", error)
	}
}

main()
