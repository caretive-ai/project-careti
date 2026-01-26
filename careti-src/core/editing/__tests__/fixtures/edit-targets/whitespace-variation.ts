/**
 * File with whitespace variations for fuzzy matching tests
 */
export function processData(input: string): string {
	const trimmed = input.trim()
	const normalized = trimmed.toLowerCase()
	return normalized
}

export function validateInput(value: string): boolean {
	if (!value) {
		return false
	}
	if (value.length < 3) {
		return false
	}
	return true
}

export function formatOutput(data: string[]): string {
	return data.join(", ")
}
