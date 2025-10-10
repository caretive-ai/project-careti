const fs = require("fs")
const path = require("path")

const reportPath = path.resolve(__dirname, "../i18n-unused-keys-report.md")
const localeBaseDir = path.resolve(__dirname, "../../webview-ui/src/caret/locale")
const supportedLocales = ["en", "ko", "ja", "zh"]

/**
 * Deletes a nested key from an object and cleans up empty parent objects.
 * @param {object} obj The object to modify.
 * @param {string} keyPath The dot-separated path to the key.
 * @returns {boolean} True if a key was deleted, false otherwise.
 */
function deleteNestedKey(obj, keyPath) {
	const keys = keyPath.split(".")
	let current = obj

	// Traverse the path to the parent of the target key
	for (let i = 0; i < keys.length - 1; i++) {
		if (current[keys[i]] === undefined || typeof current[keys[i]] !== "object") {
			// Path doesn't exist or is not an object, so key cannot be deleted.
			return false
		}
		current = current[keys[i]]
	}

	const finalKey = keys[keys.length - 1]
	if (current[finalKey] === undefined) {
		return false // Key doesn't exist
	}

	delete current[finalKey]

	// Clean up empty parent objects by traversing back up the path
	for (let i = keys.length - 2; i >= 0; i--) {
		const _parentKey = keys.slice(0, i + 1).join(".")
		const parentObject = getNestedKey(obj, keys.slice(0, i).join("."))
		const childKey = keys[i]

		if (parentObject && parentObject[childKey] && Object.keys(parentObject[childKey]).length === 0) {
			delete parentObject[childKey]
		} else {
			// If the parent is not empty, we can stop cleaning up.
			break
		}
	}
	return true
}

/**
 * Gets a nested key's value from an object.
 * @param {object} obj The object.
 * @param {string} keyPath The dot-separated path.
 * @returns {any} The value or undefined.
 */
function getNestedKey(obj, keyPath) {
	if (!keyPath) {
		return obj
	}
	return keyPath.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj)
}

/**
 * Parses the markdown report to get a list of unused keys.
 * @returns {Array<{key: string, namespace: string}>}
 */
function parseUnusedKeysFromReport() {
	console.log(`Reading report from: ${reportPath}`)
	const reportContent = fs.readFileSync(reportPath, "utf8")
	const unusedKeys = []

	const tableRegex = /## 🗑️ 미사용 키 목록[\s\S]*?\|-+\|(?<tableContent>[\s\S]*?)(?:\n##|$)/
	const match = reportContent.match(tableRegex)

	if (!match || !match.groups.tableContent) {
		console.error("Could not find the unused keys table in the report.")
		return []
	}

	const rows = match.groups.tableContent.trim().split("\n")
	for (const row of rows) {
		const columns = row.split("|").map((c) => c.trim())
		if (columns.length >= 3) {
			const key = columns[1].replace(/`/g, "")
			const namespace = columns[2]
			if (key && namespace) {
				unusedKeys.push({ key, namespace })
			}
		}
	}
	console.log(`Found ${unusedKeys.length} unused keys to remove.`)
	return unusedKeys
}

/**
 * Groups keys by namespace.
 * @param {Array<{key: string, namespace: string}>} keys
 * @returns {Map<string, string[]>}
 */
function groupKeysByNamespace(keys) {
	const grouped = new Map()
	for (const { key, namespace } of keys) {
		if (!grouped.has(namespace)) {
			grouped.set(namespace, [])
		}
		grouped.get(namespace).push(key)
	}
	return grouped
}

/**
 * Main function to remove unused keys.
 */
function main() {
	const unusedKeys = parseUnusedKeysFromReport()
	if (unusedKeys.length === 0) {
		console.log("No unused keys to remove. Exiting.")
		return
	}

	const keysByNamespace = groupKeysByNamespace(unusedKeys)
	let totalRemovedCount = 0

	for (const [namespace, keysToRemove] of keysByNamespace.entries()) {
		console.log(`\nProcessing namespace: ${namespace}`)
		for (const locale of supportedLocales) {
			const filePath = path.join(localeBaseDir, locale, `${namespace}.json`)
			if (!fs.existsSync(filePath)) {
				console.warn(`  - File not found for locale '${locale}', skipping: ${filePath}`)
				continue
			}

			try {
				const content = fs.readFileSync(filePath, "utf8")
				const data = JSON.parse(content)
				let removedCountInFile = 0

				for (const key of keysToRemove) {
					if (deleteNestedKey(data, key)) {
						removedCountInFile++
					}
				}

				if (removedCountInFile > 0) {
					fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8")
					console.log(`  - Removed ${removedCountInFile} keys from ${locale}/${namespace}.json`)
					totalRemovedCount += removedCountInFile
				} else {
					console.log(`  - No keys needed removal in ${locale}/${namespace}.json`)
				}
			} catch (error) {
				console.error(`  - Error processing ${filePath}:`, error.message)
			}
		}
	}

	console.log(`\n✅ Unused key removal process completed. Total keys removed: ${totalRemovedCount}`)
}

main()
