import * as fs from 'fs/promises';
import * as path from 'path';

export class JsonTemplateLoader {
    private cache: Map<string, any> = new Map();
    private sectionsPath: string;

    constructor() {
        // Note: This path might need adjustment depending on the final build structure.
        // Using a path relative to this file's location.
        this.sectionsPath = path.resolve(__dirname, '../sections');
    }

    /**
     * Loads a JSON section from file or cache.
     * @param fileName The name of the JSON file (e.g., 'BASE_PROMPT_INTRO.json').
     * @returns A promise that resolves to the parsed JSON content.
     */
    public async loadSection(fileName: string): Promise<any> {
        if (this.cache.has(fileName)) {
            return this.cache.get(fileName);
        }

        const filePath = path.join(this.sectionsPath, fileName);
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const jsonContent = JSON.parse(content);
            this.cache.set(fileName, jsonContent);
            return jsonContent;
        } catch (error) {
            console.error(`Error loading JSON section ${fileName}:`, error);
            // Return a default empty structure on error to prevent crashes
            return { add: { sections: [{ content: '' }] }, tools: {} };
        }
    }
}
