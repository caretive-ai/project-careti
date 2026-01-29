/**
 * Levenshtein Distance Algorithm
 * Sourced from OpenCode implementation
 */

/**
 * Calculate the Levenshtein distance between two strings
 * @param a First string
 * @param b Second string
 * @returns The edit distance between the two strings
 */
export function levenshtein(a: string, b: string): number {
	// Handle empty strings
	if (a === "" || b === "") {
		return Math.max(a.length, b.length)
	}

	const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
		Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
	)

	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1
			matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
		}
	}

	return matrix[a.length][b.length]
}

/**
 * Calculate the similarity ratio between two strings (0.0 to 1.0)
 * @param a First string
 * @param b Second string
 * @returns Similarity ratio where 1.0 means identical
 */
export function similarity(a: string, b: string): number {
	if (a.length === 0 && b.length === 0) {
		return 1.0
	}

	const maxLen = Math.max(a.length, b.length)
	if (maxLen === 0) {
		return 1.0
	}

	const distance = levenshtein(a, b)
	return 1 - distance / maxLen
}
