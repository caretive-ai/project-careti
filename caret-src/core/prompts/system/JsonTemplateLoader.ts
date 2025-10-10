import * as fs from "fs/promises"
import * as path from "path"

/**
 * Loads and caches JSON templates from a specified directory using a singleton pattern.
 */
export class JsonTemplateLoader {
	private static instance: JsonTemplateLoader
	private cache: Map<string, any> = new Map()
	private isInitialized = false

	private constructor() {}

	/**
	 * Gets the singleton instance of the JsonTemplateLoader.
	 */
	public static getInstance(): JsonTemplateLoader {
		if (!JsonTemplateLoader.instance) {
			JsonTemplateLoader.instance = new JsonTemplateLoader()
		}
		return JsonTemplateLoader.instance
	}

	/**
	 * Initializes the loader by reading all JSON files from the sections directory.
	 * This method must be called before getting any templates.
	 * @param sectionsDirPath The absolute path to the directory containing JSON sections.
	 */
	public async initialize(sectionsDirPath: string): Promise<void> {
		if (this.isInitialized) {
			return
		}

		const files = await fs.readdir(sectionsDirPath)
		const jsonFiles = files.filter((file) => path.extname(file) === ".json")

		for (const file of jsonFiles) {
			const filePath = path.join(sectionsDirPath, file)
			const content = await fs.readFile(filePath, "utf-8")
			const templateName = path.basename(file, ".json")
			this.cache.set(templateName, JSON.parse(content))
		}

		this.isInitialized = true
	}

	/**
	 * Retrieves a template from the cache.
	 * Throws an error if the loader has not been initialized.
	 * @param templateName The name of the template (without the .json extension).
	 * @returns The parsed JSON object or undefined if not found.
	 */
	public getTemplate<T>(templateName: string): T | undefined {
		if (!this.isInitialized) {
			throw new Error("JsonTemplateLoader has not been initialized. Call initialize() first.")
		}
		return this.cache.get(templateName) as T
	}
}
