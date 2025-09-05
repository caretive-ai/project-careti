#!/usr/bin/env node

/**
 * Frontend Brand Converter
 *
 * Caret ↔ CodeCenter 프론트엔드 브랜드 변환 전용 스크립트
 * brand-convert.js와 독립적으로 동작하며 빌드를 수행하지 않음
 *
 * 주요 기능:
 * - i18n locale 파일 브랜드 변환
 * - 비용 숨김 기능 (CodeCenter 전용)
 * - 안전한 백업 및 복구 시스템
 * - JSON 파일 검증
 */

const fs = require("fs")
const path = require("path")

// Configuration
const config = {
	projectRoot: path.resolve(__dirname, "../.."),
	configFile: null, // Will be set dynamically
	logFile: null,
	dryRun: false,
	verbose: false,
}

class FrontendBrandConverter {
	constructor(configPath, options = {}) {
		this.configPath = configPath
		this.options = options
		this.config = null
		this.logs = []

		config.dryRun = options.dryRun || false
		config.verbose = options.verbose || false
		config.logFile = path.join(config.projectRoot, "caret-scripts/frontend-brand-conversion.log")

		this.loadConfig()
	}

	/**
	 * Load brand configuration
	 */
	loadConfig() {
		try {
			const configContent = fs.readFileSync(this.configPath, "utf8")
			this.config = JSON.parse(configContent)
			this.log(`✅ Configuration loaded: ${this.config.metadata.name}`)
		} catch (error) {
			throw new Error(`❌ Failed to load config: ${error.message}`)
		}
	}

	/**
	 * Log message with timestamp
	 */
	log(message, level = "INFO") {
		const timestamp = new Date().toISOString()
		const logEntry = `[${timestamp}] ${level}: ${message}`

		this.logs.push(logEntry)

		if (config.verbose || level === "ERROR") {
			console.log(logEntry)
		}
	}

	/**
	 * Save logs to file
	 */
	saveLogs() {
		const logContent = this.logs.join("\n") + "\n"

		try {
			fs.appendFileSync(config.logFile, logContent)
		} catch (error) {
			console.error(`❌ Failed to save logs: ${error.message}`)
		}
	}

	/**
	 * Backup current locale files
	 */
	async backupCurrentLocale() {
		const source = path.resolve(config.projectRoot, this.config.file_paths.locale_target)
		const destination = path.resolve(config.projectRoot, this.config.file_paths.locale_backup)

		this.log(`🔄 Backing up current locale: ${source} → ${destination}`)

		if (config.dryRun) {
			this.log(`[DRY RUN] Would backup locale files`, "DEBUG")
			return
		}

		try {
			// Create backup directory
			fs.mkdirSync(path.dirname(destination), { recursive: true })

			// Remove existing backup
			if (fs.existsSync(destination)) {
				fs.rmSync(destination, { recursive: true, force: true })
			}

			// Copy current locale to backup
			this.copyDirectory(source, destination)

			this.log(`✅ Locale backup completed`)
		} catch (error) {
			throw new Error(`❌ Backup failed: ${error.message}`)
		}
	}

	/**
	 * Copy directory recursively
	 */
	copyDirectory(src, dest) {
		if (!fs.existsSync(src)) {
			throw new Error(`Source directory not found: ${src}`)
		}

		fs.mkdirSync(dest, { recursive: true })

		const entries = fs.readdirSync(src)
		for (const entry of entries) {
			const srcPath = path.join(src, entry)
			const destPath = path.join(dest, entry)

			const stat = fs.statSync(srcPath)
			if (stat.isDirectory()) {
				this.copyDirectory(srcPath, destPath)
			} else {
				fs.copyFileSync(srcPath, destPath)
			}
		}
	}

	/**
	 * Apply brand replacements to locale files
	 */
	async applyBrandReplacements() {
		const localeDir = path.resolve(config.projectRoot, this.config.file_paths.locale_target)
		const replacements = this.config.brand_mappings.locale_files.brand_replacements

		this.log(
			`🔄 Applying brand replacements: ${this.config.brand_mappings.locale_files.source_brand} → ${this.config.brand_mappings.locale_files.target_brand}`,
		)

		if (config.dryRun) {
			this.log(`[DRY RUN] Would apply ${Object.keys(replacements).length} replacements`, "DEBUG")
			return
		}

		let totalReplacements = 0

		// Find all JSON files recursively
		const jsonFiles = this.findJsonFiles(localeDir)

		for (const jsonFile of jsonFiles) {
			try {
				let content = fs.readFileSync(jsonFile, "utf8")
				let fileReplacements = 0

				// Apply each replacement
				for (const [search, replace] of Object.entries(replacements)) {
					const regex = new RegExp(search, "g")
					const matches = content.match(regex)
					if (matches) {
						content = content.replace(regex, replace)
						fileReplacements += matches.length
					}
				}

				if (fileReplacements > 0) {
					// Validate JSON before writing
					try {
						JSON.parse(content)
						fs.writeFileSync(jsonFile, content, "utf8")
						totalReplacements += fileReplacements

						const relativePath = path.relative(config.projectRoot, jsonFile)
						this.log(`✅ ${relativePath}: ${fileReplacements} replacements`)
					} catch (jsonError) {
						this.log(`❌ Invalid JSON after replacement in ${jsonFile}: ${jsonError.message}`, "ERROR")
					}
				}
			} catch (error) {
				this.log(`❌ Failed to process ${jsonFile}: ${error.message}`, "ERROR")
			}
		}

		this.log(`✅ Brand replacements completed: ${totalReplacements} total replacements`)
	}

	/**
	 * Find all JSON files in directory
	 */
	findJsonFiles(dir) {
		const files = []

		const scan = (currentDir) => {
			const entries = fs.readdirSync(currentDir)
			for (const entry of entries) {
				const fullPath = path.join(currentDir, entry)
				const stat = fs.statSync(fullPath)

				if (stat.isDirectory()) {
					scan(fullPath)
				} else if (entry.endsWith(".json")) {
					files.push(fullPath)
				}
			}
		}

		scan(dir)
		return files
	}

	/**
	 * Apply cost hiding feature
	 */
	async applyCostHiding() {
		if (!this.config.features.cost_hiding.enabled) {
			this.log(`ℹ️ Cost hiding is disabled`)
			return
		}

		this.log(`🔄 Applying cost hiding feature`)

		const styleFiles = this.config.file_paths.style_files
		const targets = this.config.features.cost_hiding.targets

		if (config.dryRun) {
			this.log(`[DRY RUN] Would apply cost hiding to ${styleFiles.length} files`, "DEBUG")
			return
		}

		for (const styleFile of styleFiles) {
			const filePath = path.resolve(config.projectRoot, styleFile)

			try {
				if (!fs.existsSync(filePath)) {
					this.log(`⚠️ Style file not found: ${styleFile}`, "WARN")
					continue
				}

				let content = fs.readFileSync(filePath, "utf8")
				let modifications = 0

				// Apply cost hiding for each target
				for (const target of targets) {
					const result = this.applyCostHidingToContent(content, target)
					content = result.content
					modifications += result.modifications
				}

				if (modifications > 0) {
					fs.writeFileSync(filePath, content, "utf8")
					this.log(`✅ ${styleFile}: ${modifications} cost hiding modifications applied`)
				}
			} catch (error) {
				this.log(`❌ Failed to process style file ${styleFile}: ${error.message}`, "ERROR")
			}
		}

		this.log(`✅ Cost hiding feature applied`)
	}

	/**
	 * Apply cost hiding to specific content
	 */
	applyCostHidingToContent(content, target) {
		let modifications = 0

		if (target.type === "css_class") {
			// Add CSS class for hiding
			const hideClass = `caret-codecenter-hide-cost`
			const classRegex = new RegExp(`className=["']([^"']*)${target.selector.replace(".", "")}([^"']*)["']`, "g")

			content = content.replace(classRegex, (match, _before, _after) => {
				if (!match.includes(hideClass)) {
					modifications++
					return match.replace(/className=["']([^"']*)["']/, `className="$1 ${hideClass}"`)
				}
				return match
			})
		}

		return { content, modifications }
	}

	/**
	 * Validate JSON files
	 */
	async validateJsonFiles() {
		const localeDir = path.resolve(config.projectRoot, this.config.file_paths.locale_target)
		const jsonFiles = this.findJsonFiles(localeDir)

		this.log(`🔄 Validating ${jsonFiles.length} JSON files`)

		let validFiles = 0
		let invalidFiles = 0

		for (const jsonFile of jsonFiles) {
			try {
				const content = fs.readFileSync(jsonFile, "utf8")
				JSON.parse(content)
				validFiles++
			} catch (error) {
				const relativePath = path.relative(config.projectRoot, jsonFile)
				this.log(`❌ Invalid JSON: ${relativePath} - ${error.message}`, "ERROR")
				invalidFiles++
			}
		}

		if (invalidFiles > 0) {
			throw new Error(`❌ JSON validation failed: ${invalidFiles} invalid files`)
		}

		this.log(`✅ JSON validation completed: ${validFiles} files valid`)
	}

	/**
	 * Copy locale files from source to target
	 */
	async copyLocaleFiles() {
		const source = path.resolve(config.projectRoot, this.config.file_paths.locale_source)
		const target = path.resolve(config.projectRoot, this.config.file_paths.locale_target)

		this.log(`🔄 Copying locale files: ${source} → ${target}`)

		if (config.dryRun) {
			this.log(`[DRY RUN] Would copy locale files`, "DEBUG")
			return
		}

		try {
			// Remove existing target
			if (fs.existsSync(target)) {
				fs.rmSync(target, { recursive: true, force: true })
			}

			// Copy from source
			this.copyDirectory(source, target)

			this.log(`✅ Locale files copied successfully`)
		} catch (error) {
			throw new Error(`❌ Failed to copy locale files: ${error.message}`)
		}
	}

	/**
	 * Restore locale backup
	 */
	async restoreLocaleBackup() {
		const source = path.resolve(config.projectRoot, this.config.file_paths.locale_backup)
		const target = path.resolve(config.projectRoot, this.config.file_paths.locale_target)

		this.log(`🔄 Restoring locale backup: ${source} → ${target}`)

		if (config.dryRun) {
			this.log(`[DRY RUN] Would restore locale backup`, "DEBUG")
			return
		}

		try {
			if (!fs.existsSync(source)) {
				throw new Error(`Backup not found: ${source}`)
			}

			// Remove current files
			if (fs.existsSync(target)) {
				fs.rmSync(target, { recursive: true, force: true })
			}

			// Restore from backup
			this.copyDirectory(source, target)

			this.log(`✅ Locale backup restored successfully`)
		} catch (error) {
			throw new Error(`❌ Failed to restore backup: ${error.message}`)
		}
	}

	/**
	 * Convert Caret to CodeCenter
	 */
	async convertToCodeCenter() {
		this.log(`🚀 Starting Caret → CodeCenter conversion`)

		try {
			// Pre-conversion
			await this.backupCurrentLocale()

			// Main conversion
			await this.copyLocaleFiles()
			await this.applyBrandReplacements()
			await this.applyCostHiding()

			// Post-conversion
			await this.validateJsonFiles()

			this.log(`✅ Caret → CodeCenter conversion completed successfully`)
			return true
		} catch (error) {
			this.log(`❌ Conversion failed: ${error.message}`, "ERROR")

			// Try to restore backup on failure
			try {
				await this.restoreLocaleBackup()
				this.log(`✅ Backup restored after conversion failure`)
			} catch (restoreError) {
				this.log(`❌ Failed to restore backup: ${restoreError.message}`, "ERROR")
			}

			throw error
		}
	}

	/**
	 * Convert CodeCenter back to Caret
	 */
	async convertToCaret() {
		this.log(`🔄 Starting CodeCenter → Caret conversion (rollback)`)

		try {
			await this.restoreLocaleBackup()

			this.log(`✅ CodeCenter → Caret conversion completed successfully`)
			return true
		} catch (error) {
			this.log(`❌ Rollback failed: ${error.message}`, "ERROR")
			throw error
		}
	}

	/**
	 * Run conversion
	 */
	async run(direction = "forward") {
		try {
			this.log(`🔧 Frontend Brand Converter v${this.config.metadata.version}`)
			this.log(`📋 Config: ${this.config.metadata.description}`)
			this.log(`🎯 Direction: ${direction}`)
			this.log(`🏗️ Dry run: ${config.dryRun}`)

			if (direction === "forward") {
				await this.convertToCodeCenter()
			} else if (direction === "backward" || direction === "rollback") {
				await this.convertToCaret()
			} else {
				throw new Error(`Invalid direction: ${direction}. Use 'forward' or 'backward'.`)
			}

			return true
		} catch (error) {
			this.log(`💥 Conversion failed: ${error.message}`, "ERROR")
			return false
		} finally {
			this.saveLogs()
		}
	}
}

// CLI interface
if (require.main === module) {
	const [, , configPath, direction = "forward", ...flags] = process.argv

	if (!configPath) {
		console.error(`
❌ Usage: node frontend-brand-converter.js <config-path> [direction] [flags]

Examples:
  # Convert Caret → CodeCenter
  node frontend-brand-converter.js caret-b2b/brands/codecenter/brand-config-front.json forward
  
  # Convert CodeCenter → Caret (rollback)
  node frontend-brand-converter.js caret-b2b/brands/codecenter/brand-config-front.json backward
  
  # Dry run
  node frontend-brand-converter.js caret-b2b/brands/codecenter/brand-config-front.json forward --dry-run
  
  # Verbose mode
  node frontend-brand-converter.js caret-b2b/brands/codecenter/brand-config-front.json forward --verbose

Directions:
  forward   - Convert Caret → CodeCenter (apply branding + cost hiding)
  backward  - Convert CodeCenter → Caret (restore from backup)
  rollback  - Same as backward

Flags:
  --dry-run - Show what would be done without making changes
  --verbose - Show detailed logging
`)
		process.exit(1)
	}

	const options = {
		dryRun: flags.includes("--dry-run"),
		verbose: flags.includes("--verbose"),
	}

	const converter = new FrontendBrandConverter(configPath, options)

	converter
		.run(direction)
		.then((success) => {
			process.exit(success ? 0 : 1)
		})
		.catch((error) => {
			console.error("💥 Fatal error:", error.message)
			process.exit(1)
		})
}

module.exports = { FrontendBrandConverter }
