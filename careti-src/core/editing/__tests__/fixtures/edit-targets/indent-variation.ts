/**
 * File with indentation variations for testing
 */
export class DataProcessor {
	private data: string[] = []

	constructor(initialData?: string[]) {
		if (initialData) {
			this.data = initialData
		}
	}

	add(item: string): void {
		this.data.push(item)
	}

	remove(item: string): boolean {
		const index = this.data.indexOf(item)
		if (index > -1) {
			this.data.splice(index, 1)
			return true
		}
		return false
	}

	getAll(): string[] {
		return [...this.data]
	}

	clear(): void {
		this.data = []
	}
}
