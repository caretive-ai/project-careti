#!/usr/bin/env node

/**
 * Caret Branding System - Bidirectional Brand Conversion Script
 *
 * Level 1 Independent Module (caret-scripts/)
 *
 * Purpose: Convert branding between cline ↔ caret automatically
 * Features:
 * - Forward/Reverse conversion support
 * - CARET MODIFICATION comment recognition
 * - JSON field-specific transformation
 * - Dry-run mode for safe testing
 * - Atomic file operations with backup
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

class BrandingConverter {
	constructor() {
		this.brandConfig = null
		this.mappings = null
		this.reverseMappings = null
		this.isDryRun = false
		this.verbose = false
		this.backupPaths = []
		this.processedFiles = []

		this.loadConfiguration()
	}

	/**
	 * Load brand.json configuration
	 */
	loadConfiguration() {
		const configPath = path.join(__dirname, "../caret-assets/brand.json")

		try {
			const configData = fs.readFileSync(configPath, "utf8")
			this.brandConfig = JSON.parse(configData)

			// Create forward and reverse mappings
			this.mappings = this.brandConfig.brand_mappings.pairs
			this.reverseMappings = this.createReverseMappings(this.mappings)

			this.log(`✅ Configuration loaded: ${Object.keys(this.mappings).length} mapping pairs`)
		} catch (error) {
			this.error(`❌ Failed to load brand.json: ${error.message}`)
			process.exit(1)
		}
	}

	/**
	 * Create reverse mappings from pairs
	 */
	createReverseMappings(pairs) {
		return Object.fromEntries(Object.entries(pairs).map(([key, value]) => [value, key]))
	}

	/**
	 * Main conversion method
	 */
	convert(direction) {
		const isForward = direction === "forward"
		const currentMappings = isForward ? this.mappings : this.reverseMappings
		const sourceText = isForward ? this.brandConfig.brand_mappings.source : this.brandConfig.brand_mappings.target
		const targetText = isForward ? this.brandConfig.brand_mappings.target : this.brandConfig.brand_mappings.source

		this.log(`\n🚀 Starting ${direction} conversion: ${sourceText} → ${targetText}`)
		this.log(`📋 Processing ${Object.keys(this.brandConfig.target_files).length} file patterns`)

		if (this.isDryRun) {
			this.log(`🧪 DRY-RUN MODE: No files will be modified`)
		}

		try {
			this.processTargetFiles(currentMappings)
			this.generateReport()

			if (!this.isDryRun) {
				this.log(`✅ Conversion completed successfully!`)
				this.log(`📄 Modified files: ${this.processedFiles.length}`)
			} else {
				this.log(`✅ Dry-run completed - no changes made`)
			}
		} catch (error) {
			this.error(`❌ Conversion failed: ${error.message}`)
			this.rollbackChanges()
			process.exit(1)
		}
	}

	/**
	 * Process all target files from configuration
	 */
	processTargetFiles(mappings) {
		for (const [filePattern, fields] of Object.entries(this.brandConfig.target_files)) {
			this.processFilePattern(filePattern, fields, mappings)
		}
	}

	/**
	 * Process specific file pattern
	 */
	processFilePattern(pattern, fields, mappings) {
		this.log(`\n📁 Processing pattern: ${pattern}`)

		// Handle different file pattern types
		if (pattern.includes("*")) {
			this.processGlobPattern(pattern, fields, mappings)
		} else {
			this.processSingleFile(pattern, fields, mappings)
		}
	}

	/**
	 * Process glob patterns (e.g., webview-ui/src/caret/locale/star/common.json)
	 */
	processGlobPattern(pattern, fields, mappings) {
		const rootDir = path.join(__dirname, "..")
		const parts = pattern.split("*")

		if (parts.length !== 2) {
			this.warn(`⚠️ Complex glob patterns not supported: ${pattern}`)
			return
		}

		const [prefix, suffix] = parts
		const prefixPath = path.join(rootDir, prefix)
		const prefixDir = path.dirname(prefixPath)
		const prefixFile = path.basename(prefixPath)

		try {
			if (!fs.existsSync(prefixDir)) {
				this.warn(`⚠️ Directory not found: ${prefixDir}`)
				return
			}

			const entries = fs.readdirSync(prefixDir)
			for (const entry of entries) {
				const fullPath = path.join(prefixDir, entry, prefixFile + suffix)
				if (fs.existsSync(fullPath)) {
					this.processSingleFile(path.relative(rootDir, fullPath), fields, mappings)
				}
			}
		} catch (error) {
			this.warn(`⚠️ Error processing glob ${pattern}: ${error.message}`)
		}
	}

	/**
	 * Process single file
	 */
	processSingleFile(relativePath, fields, mappings) {
		const filePath = path.join(__dirname, "..", relativePath)

		if (!fs.existsSync(filePath)) {
			this.warn(`⚠️ File not found: ${relativePath}`)
			return
		}

		// Check if it's a directory
		const stat = fs.statSync(filePath)
		if (stat.isDirectory()) {
			this.warn(`⚠️ Skipping directory: ${relativePath}`)
			return
		}

		// Check for CARET MODIFICATION comments
		const caretModifications = this.detectCaretModifications(filePath)
		if (caretModifications.length > 0) {
			this.log(`🔍 CARET MODIFICATION detected in ${relativePath}:`)
			caretModifications.forEach((mod) => {
				this.log(`   Line ${mod.line}: ${mod.description}`)
			})
		}

		try {
			if (filePath.endsWith(".json")) {
				this.processJsonFile(filePath, fields, mappings)
			} else {
				this.processTextFile(filePath, fields, mappings)
			}

			this.processedFiles.push(relativePath)
		} catch (error) {
			this.error(`❌ Error processing ${relativePath}: ${error.message}`)
			throw error
		}
	}

	/**
	 * Process JSON files with field-specific transformation
	 */
	processJsonFile(filePath, fields, mappings) {
		const content = fs.readFileSync(filePath, "utf8")
		let jsonData

		try {
			jsonData = JSON.parse(content)
		} catch (error) {
			this.warn(`⚠️ Invalid JSON in ${filePath}: ${error.message}`)
			return
		}

		let modified = false

		if (Array.isArray(fields)) {
			// Transform specific fields
			for (const fieldPath of fields) {
				if (this.transformJsonField(jsonData, fieldPath, mappings)) {
					modified = true
				}
			}
		} else if (fields === "all_text_content") {
			// Transform all string values in JSON
			if (this.transformJsonAllStrings(jsonData, mappings)) {
				modified = true
			}
		}

		if (modified) {
			const newContent = JSON.stringify(jsonData, null, 2)
			this.writeFile(filePath, newContent)
			this.log(`✏️  Updated JSON: ${path.relative(path.join(__dirname, ".."), filePath)}`)
		}
	}

	/**
	 * Transform specific JSON field
	 */
	transformJsonField(jsonData, fieldPath, mappings) {
		const keys = fieldPath.split(".")
		let current = jsonData

		// Navigate to parent object
		for (let i = 0; i < keys.length - 1; i++) {
			if (current[keys[i]] === undefined) {
				return false // Field doesn't exist
			}
			current = current[keys[i]]
		}

		const finalKey = keys[keys.length - 1]
		if (current[finalKey] === undefined) {
			return false // Field doesn't exist
		}

		const originalValue = current[finalKey]
		if (typeof originalValue !== "string") {
			return false // Not a string field
		}

		const newValue = this.applyMappings(originalValue, mappings)
		if (newValue !== originalValue) {
			current[finalKey] = newValue
			return true // Modified
		}

		return false // No change
	}

	/**
	 * Transform all string values in JSON recursively
	 */
	transformJsonAllStrings(obj, mappings) {
		let modified = false

		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === "string") {
				const newValue = this.applyMappings(value, mappings)
				if (newValue !== value) {
					obj[key] = newValue
					modified = true
				}
			} else if (typeof value === "object" && value !== null) {
				if (this.transformJsonAllStrings(value, mappings)) {
					modified = true
				}
			}
		}

		return modified
	}

	/**
	 * Process text files with full content transformation
	 */
	processTextFile(filePath, fields, mappings) {
		const content = fs.readFileSync(filePath, "utf8")
		const newContent = this.applyMappings(content, mappings)

		if (newContent !== content) {
			this.writeFile(filePath, newContent)
			this.log(`✏️  Updated text: ${path.relative(path.join(__dirname, ".."), filePath)}`)
		}
	}

	/**
	 * Apply string mappings to text
	 */
	applyMappings(text, mappings) {
		let result = text

		for (const [source, target] of Object.entries(mappings)) {
			// Use global regex with word boundaries for accurate replacement
			const regex = new RegExp(this.escapeRegex(source), "g")
			result = result.replace(regex, target)
		}

		return result
	}

	/**
	 * Escape string for regex
	 */
	escapeRegex(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
	}

	/**
	 * Detect CARET MODIFICATION comments in file
	 */
	detectCaretModifications(filePath) {
		try {
			const content = fs.readFileSync(filePath, "utf8")
			const pattern = /\/\/ CARET MODIFICATION: (.+)/g
			const matches = [...content.matchAll(pattern)]

			return matches.map((match) => ({
				line: this.getLineNumber(content, match.index),
				description: match[1],
			}))
		} catch (error) {
			return []
		}
	}

	/**
	 * Get line number from string index
	 */
	getLineNumber(content, index) {
		return content.substring(0, index).split("\n").length
	}

	/**
	 * Write file with atomic operation
	 */
	writeFile(filePath, content) {
		if (this.isDryRun) {
			this.log(`🧪 Would write: ${filePath}`)
			return
		}

		// Create backup
		const backupPath = `${filePath}.t03-backup-${Date.now()}`
		fs.copyFileSync(filePath, backupPath)
		this.backupPaths.push(backupPath)

		// Atomic write
		const tempPath = `${filePath}.tmp`
		fs.writeFileSync(tempPath, content)
		fs.renameSync(tempPath, filePath)
	}

	/**
	 * Generate conversion report
	 */
	generateReport() {
		this.log(`\n📊 Conversion Report:`)
		this.log(`   Files processed: ${this.processedFiles.length}`)
		this.log(`   Backup files created: ${this.backupPaths.length}`)

		if (this.processedFiles.length > 0) {
			this.log(`\n📄 Modified files:`)
			this.processedFiles.forEach((file) => {
				this.log(`   - ${file}`)
			})
		}

		if (!this.isDryRun) {
			this.log(`\n🗑️  Cleanup backups with: rm -f *.t03-backup-*`)
		}
	}

	/**
	 * Rollback changes in case of error
	 */
	rollbackChanges() {
		if (this.isDryRun || this.backupPaths.length === 0) {
			return
		}

		this.log(`🔄 Rolling back changes...`)

		for (const backupPath of this.backupPaths) {
			try {
				const originalPath = backupPath.replace(/\.t03-backup-\d+$/, "")
				fs.copyFileSync(backupPath, originalPath)
				fs.unlinkSync(backupPath)
			} catch (error) {
				this.warn(`⚠️ Failed to rollback ${backupPath}: ${error.message}`)
			}
		}

		this.log(`✅ Rollback completed`)
	}

	/**
	 * Logging methods
	 */
	log(message) {
		console.log(message)
	}

	warn(message) {
		console.warn(message)
	}

	error(message) {
		console.error(message)
	}
}

/**
 * CLI Interface
 */
function showHelp() {
	console.log(`
🥕 Caret Branding System - Brand Conversion Tool

Usage: node brand-change.js [options]

Options:
  --direction=<forward|reverse>  Conversion direction (required)
                                 forward: cline → caret
                                 reverse: caret → cline
  
  --dry-run                     Preview changes without modifying files
  --verbose                     Enable detailed logging
  --help                        Show this help message

Examples:
  node brand-change.js --direction=forward
  node brand-change.js --direction=reverse --dry-run
  node brand-change.js --direction=forward --verbose

For more information, see: caret-docs/features/f03-branding-ui.mdx
    `)
}

function main() {
	const args = process.argv.slice(2)

	// Parse arguments
	let direction = null
	let isDryRun = false
	let verbose = false

	for (const arg of args) {
		if (arg.startsWith("--direction=")) {
			direction = arg.split("=")[1]
		} else if (arg === "--dry-run") {
			isDryRun = true
		} else if (arg === "--verbose") {
			verbose = true
		} else if (arg === "--help") {
			showHelp()
			process.exit(0)
		} else {
			console.error(`❌ Unknown argument: ${arg}`)
			showHelp()
			process.exit(1)
		}
	}

	// Validate direction
	if (!direction || !["forward", "reverse"].includes(direction)) {
		console.error(`❌ Invalid or missing direction. Use --direction=forward or --direction=reverse`)
		showHelp()
		process.exit(1)
	}

	// Create converter and run
	const converter = new BrandingConverter()
	converter.isDryRun = isDryRun
	converter.verbose = verbose

	converter.convert(direction)
}

// Run CLI if this script is executed directly
if (require.main === module) {
	main()
}

module.exports = BrandingConverter
