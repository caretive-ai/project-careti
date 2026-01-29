/**
 * SmartEditEngine - 9-Stage Fuzzy Matching for File Editing
 *
 * Sourced from OpenCode implementation with adaptations for Careti
 * https://github.com/opencode-ai/opencode
 *
 * CARETI MODIFICATION: New file for enhanced edit matching
 */

import { levenshtein } from "./utils/levenshtein"

// Similarity thresholds for block anchor fallback matching
const SINGLE_CANDIDATE_SIMILARITY_THRESHOLD = 0.0
const MULTIPLE_CANDIDATES_SIMILARITY_THRESHOLD = 0.3

export type Replacer = (content: string, find: string) => Generator<string, void, unknown>

export interface ReplaceResult {
	success: boolean
	content: string
	matchedWith?: string // Which replacer succeeded
	error?: string
}

/**
 * Stage 1: Simple exact match replacer
 */
export const SimpleReplacer: Replacer = function* (_content, find) {
	yield find
}

/**
 * Stage 2: Line-trimmed replacer - ignores leading/trailing whitespace per line
 */
export const LineTrimmedReplacer: Replacer = function* (content, find) {
	const originalLines = content.split("\n")
	const searchLines = find.split("\n")

	if (searchLines[searchLines.length - 1] === "") {
		searchLines.pop()
	}

	for (let i = 0; i <= originalLines.length - searchLines.length; i++) {
		let matches = true

		for (let j = 0; j < searchLines.length; j++) {
			const originalTrimmed = originalLines[i + j].trim()
			const searchTrimmed = searchLines[j].trim()

			if (originalTrimmed !== searchTrimmed) {
				matches = false
				break
			}
		}

		if (matches) {
			let matchStartIndex = 0
			for (let k = 0; k < i; k++) {
				matchStartIndex += originalLines[k].length + 1
			}

			let matchEndIndex = matchStartIndex
			for (let k = 0; k < searchLines.length; k++) {
				matchEndIndex += originalLines[i + k].length
				if (k < searchLines.length - 1) {
					matchEndIndex += 1
				}
			}

			yield content.substring(matchStartIndex, matchEndIndex)
		}
	}
}

/**
 * Stage 3: Block anchor replacer - uses first/last lines as anchors with Levenshtein similarity
 */
export const BlockAnchorReplacer: Replacer = function* (content, find) {
	const originalLines = content.split("\n")
	const searchLines = find.split("\n")

	if (searchLines.length < 3) {
		return
	}

	if (searchLines[searchLines.length - 1] === "") {
		searchLines.pop()
	}

	const firstLineSearch = searchLines[0].trim()
	const lastLineSearch = searchLines[searchLines.length - 1].trim()
	const searchBlockSize = searchLines.length

	// Collect all candidate positions where both anchors match
	const candidates: Array<{ startLine: number; endLine: number }> = []
	for (let i = 0; i < originalLines.length; i++) {
		if (originalLines[i].trim() !== firstLineSearch) {
			continue
		}

		// Look for the matching last line after this first line
		for (let j = i + 2; j < originalLines.length; j++) {
			if (originalLines[j].trim() === lastLineSearch) {
				candidates.push({ startLine: i, endLine: j })
				break
			}
		}
	}

	if (candidates.length === 0) {
		return
	}

	// Handle single candidate scenario (using relaxed threshold)
	if (candidates.length === 1) {
		const { startLine, endLine } = candidates[0]
		const actualBlockSize = endLine - startLine + 1

		let similarity = 0
		const linesToCheck = Math.min(searchBlockSize - 2, actualBlockSize - 2)

		if (linesToCheck > 0) {
			for (let j = 1; j < searchBlockSize - 1 && j < actualBlockSize - 1; j++) {
				const originalLine = originalLines[startLine + j].trim()
				const searchLine = searchLines[j].trim()
				const maxLen = Math.max(originalLine.length, searchLine.length)
				if (maxLen === 0) {
					continue
				}
				const distance = levenshtein(originalLine, searchLine)
				similarity += (1 - distance / maxLen) / linesToCheck

				if (similarity >= SINGLE_CANDIDATE_SIMILARITY_THRESHOLD) {
					break
				}
			}
		} else {
			similarity = 1.0
		}

		if (similarity >= SINGLE_CANDIDATE_SIMILARITY_THRESHOLD) {
			let matchStartIndex = 0
			for (let k = 0; k < startLine; k++) {
				matchStartIndex += originalLines[k].length + 1
			}
			let matchEndIndex = matchStartIndex
			for (let k = startLine; k <= endLine; k++) {
				matchEndIndex += originalLines[k].length
				if (k < endLine) {
					matchEndIndex += 1
				}
			}
			yield content.substring(matchStartIndex, matchEndIndex)
		}
		return
	}

	// Calculate similarity for multiple candidates
	let bestMatch: { startLine: number; endLine: number } | null = null
	let maxSimilarity = -1

	for (const candidate of candidates) {
		const { startLine, endLine } = candidate
		const actualBlockSize = endLine - startLine + 1

		let similarity = 0
		const linesToCheck = Math.min(searchBlockSize - 2, actualBlockSize - 2)

		if (linesToCheck > 0) {
			for (let j = 1; j < searchBlockSize - 1 && j < actualBlockSize - 1; j++) {
				const originalLine = originalLines[startLine + j].trim()
				const searchLine = searchLines[j].trim()
				const maxLen = Math.max(originalLine.length, searchLine.length)
				if (maxLen === 0) {
					continue
				}
				const distance = levenshtein(originalLine, searchLine)
				similarity += 1 - distance / maxLen
			}
			similarity /= linesToCheck
		} else {
			similarity = 1.0
		}

		if (similarity > maxSimilarity) {
			maxSimilarity = similarity
			bestMatch = candidate
		}
	}

	if (maxSimilarity >= MULTIPLE_CANDIDATES_SIMILARITY_THRESHOLD && bestMatch) {
		const { startLine, endLine } = bestMatch
		let matchStartIndex = 0
		for (let k = 0; k < startLine; k++) {
			matchStartIndex += originalLines[k].length + 1
		}
		let matchEndIndex = matchStartIndex
		for (let k = startLine; k <= endLine; k++) {
			matchEndIndex += originalLines[k].length
			if (k < endLine) {
				matchEndIndex += 1
			}
		}
		yield content.substring(matchStartIndex, matchEndIndex)
	}
}

/**
 * Stage 4: Whitespace normalized replacer - collapses multiple spaces
 */
export const WhitespaceNormalizedReplacer: Replacer = function* (content, find) {
	const normalizeWhitespace = (text: string) => text.replace(/\s+/g, " ").trim()
	const normalizedFind = normalizeWhitespace(find)

	const lines = content.split("\n")
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		if (normalizeWhitespace(line) === normalizedFind) {
			yield line
		} else {
			const normalizedLine = normalizeWhitespace(line)
			if (normalizedLine.includes(normalizedFind)) {
				const words = find.trim().split(/\s+/)
				if (words.length > 0) {
					const pattern = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+")
					try {
						const regex = new RegExp(pattern)
						const match = line.match(regex)
						if (match) {
							yield match[0]
						}
					} catch {
						// Invalid regex pattern, skip
					}
				}
			}
		}
	}

	// Handle multi-line matches
	const findLines = find.split("\n")
	if (findLines.length > 1) {
		for (let i = 0; i <= lines.length - findLines.length; i++) {
			const block = lines.slice(i, i + findLines.length)
			if (normalizeWhitespace(block.join("\n")) === normalizedFind) {
				yield block.join("\n")
			}
		}
	}
}

/**
 * Stage 5: Indentation flexible replacer - removes common indentation
 */
export const IndentationFlexibleReplacer: Replacer = function* (content, find) {
	const removeIndentation = (text: string) => {
		const lines = text.split("\n")
		const nonEmptyLines = lines.filter((line) => line.trim().length > 0)
		if (nonEmptyLines.length === 0) return text

		const minIndent = Math.min(
			...nonEmptyLines.map((line) => {
				const match = line.match(/^(\s*)/)
				return match ? match[1].length : 0
			}),
		)

		return lines.map((line) => (line.trim().length === 0 ? line : line.slice(minIndent))).join("\n")
	}

	const normalizedFind = removeIndentation(find)
	const contentLines = content.split("\n")
	const findLines = find.split("\n")

	for (let i = 0; i <= contentLines.length - findLines.length; i++) {
		const block = contentLines.slice(i, i + findLines.length).join("\n")
		if (removeIndentation(block) === normalizedFind) {
			yield block
		}
	}
}

/**
 * Stage 6: Escape normalized replacer - handles escape sequences
 */
export const EscapeNormalizedReplacer: Replacer = function* (content, find) {
	const unescapeString = (str: string): string => {
		return str.replace(/\\(n|t|r|'|"|`|\\|\n|\$)/g, (match, capturedChar) => {
			switch (capturedChar) {
				case "n":
					return "\n"
				case "t":
					return "\t"
				case "r":
					return "\r"
				case "'":
					return "'"
				case '"':
					return '"'
				case "`":
					return "`"
				case "\\":
					return "\\"
				case "\n":
					return "\n"
				case "$":
					return "$"
				default:
					return match
			}
		})
	}

	const unescapedFind = unescapeString(find)

	if (content.includes(unescapedFind)) {
		yield unescapedFind
	}

	const lines = content.split("\n")
	const findLines = unescapedFind.split("\n")

	for (let i = 0; i <= lines.length - findLines.length; i++) {
		const block = lines.slice(i, i + findLines.length).join("\n")
		const unescapedBlock = unescapeString(block)

		if (unescapedBlock === unescapedFind) {
			yield block
		}
	}
}

/**
 * Stage 7: Trimmed boundary replacer - trims entire search string
 */
export const TrimmedBoundaryReplacer: Replacer = function* (content, find) {
	const trimmedFind = find.trim()

	if (trimmedFind === find) {
		return
	}

	if (content.includes(trimmedFind)) {
		yield trimmedFind
	}

	const lines = content.split("\n")
	const findLines = find.split("\n")

	for (let i = 0; i <= lines.length - findLines.length; i++) {
		const block = lines.slice(i, i + findLines.length).join("\n")

		if (block.trim() === trimmedFind) {
			yield block
		}
	}
}

/**
 * Stage 8: Context aware replacer - uses first/last lines as context anchors
 */
export const ContextAwareReplacer: Replacer = function* (content, find) {
	const findLines = find.split("\n")
	if (findLines.length < 3) {
		return
	}

	if (findLines[findLines.length - 1] === "") {
		findLines.pop()
	}

	const contentLines = content.split("\n")

	const firstLine = findLines[0].trim()
	const lastLine = findLines[findLines.length - 1].trim()

	for (let i = 0; i < contentLines.length; i++) {
		if (contentLines[i].trim() !== firstLine) continue

		for (let j = i + 2; j < contentLines.length; j++) {
			if (contentLines[j].trim() === lastLine) {
				const blockLines = contentLines.slice(i, j + 1)
				const block = blockLines.join("\n")

				if (blockLines.length === findLines.length) {
					let matchingLines = 0
					let totalNonEmptyLines = 0

					for (let k = 1; k < blockLines.length - 1; k++) {
						const blockLine = blockLines[k].trim()
						const findLine = findLines[k].trim()

						if (blockLine.length > 0 || findLine.length > 0) {
							totalNonEmptyLines++
							if (blockLine === findLine) {
								matchingLines++
							}
						}
					}

					if (totalNonEmptyLines === 0 || matchingLines / totalNonEmptyLines >= 0.5) {
						yield block
						break
					}
				}
				break
			}
		}
	}
}

/**
 * Stage 9: Multi-occurrence replacer - yields all exact matches
 */
export const MultiOccurrenceReplacer: Replacer = function* (content, find) {
	let startIndex = 0

	while (true) {
		const index = content.indexOf(find, startIndex)
		if (index === -1) break

		yield find
		startIndex = index + find.length
	}
}

/**
 * All replacers in order of priority
 */
export const REPLACERS: { name: string; replacer: Replacer }[] = [
	{ name: "SimpleReplacer", replacer: SimpleReplacer },
	{ name: "LineTrimmedReplacer", replacer: LineTrimmedReplacer },
	{ name: "BlockAnchorReplacer", replacer: BlockAnchorReplacer },
	{ name: "WhitespaceNormalizedReplacer", replacer: WhitespaceNormalizedReplacer },
	{ name: "IndentationFlexibleReplacer", replacer: IndentationFlexibleReplacer },
	{ name: "EscapeNormalizedReplacer", replacer: EscapeNormalizedReplacer },
	{ name: "TrimmedBoundaryReplacer", replacer: TrimmedBoundaryReplacer },
	{ name: "ContextAwareReplacer", replacer: ContextAwareReplacer },
	{ name: "MultiOccurrenceReplacer", replacer: MultiOccurrenceReplacer },
]

/**
 * SmartEditEngine - Main class for fuzzy file editing
 */
export class SmartEditEngine {
	/**
	 * Perform a smart replacement with 9-stage fuzzy matching
	 */
	smartReplace(content: string, oldString: string, newString: string, replaceAll = false): ReplaceResult {
		if (oldString === newString) {
			return {
				success: false,
				content,
				error: "oldString and newString must be different",
			}
		}

		let notFound = true

		for (const { name, replacer } of REPLACERS) {
			for (const search of replacer(content, oldString)) {
				const index = content.indexOf(search)
				if (index === -1) continue

				notFound = false

				if (replaceAll) {
					return {
						success: true,
						content: content.replaceAll(search, newString),
						matchedWith: name,
					}
				}

				const lastIndex = content.lastIndexOf(search)
				if (index !== lastIndex) continue

				return {
					success: true,
					content: content.substring(0, index) + newString + content.substring(index + search.length),
					matchedWith: name,
				}
			}
		}

		if (notFound) {
			return {
				success: false,
				content,
				error: "oldString not found in content",
			}
		}

		return {
			success: false,
			content,
			error: "Found multiple matches for oldString. Provide more surrounding lines in oldString to identify the correct match.",
		}
	}

	/**
	 * Get context around an error location (for token-efficient error responses)
	 */
	getContextAroundError(content: string, searchString: string, contextLines = 5): string {
		const lines = content.split("\n")
		const searchLines = searchString.split("\n")
		const firstSearchLine = searchLines[0].trim()

		// Find potential match locations
		const potentialMatches: number[] = []
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].trim().includes(firstSearchLine.substring(0, 20))) {
				potentialMatches.push(i)
			}
		}

		if (potentialMatches.length === 0) {
			// No close matches found, return first few lines
			return lines.slice(0, contextLines * 2).join("\n")
		}

		// Return context around the first potential match
		const matchLine = potentialMatches[0]
		const startLine = Math.max(0, matchLine - contextLines)
		const endLine = Math.min(lines.length, matchLine + contextLines + 1)

		return lines
			.slice(startLine, endLine)
			.map((line, idx) => `${startLine + idx + 1}: ${line}`)
			.join("\n")
	}
}

/**
 * Trim diff indentation for token efficiency
 */
export function trimDiff(diff: string): string {
	const lines = diff.split("\n")
	const contentLines = lines.filter(
		(line) =>
			(line.startsWith("+") || line.startsWith("-") || line.startsWith(" ")) &&
			!line.startsWith("---") &&
			!line.startsWith("+++"),
	)

	if (contentLines.length === 0) return diff

	let min = Infinity
	for (const line of contentLines) {
		const content = line.slice(1)
		if (content.trim().length > 0) {
			const match = content.match(/^(\s*)/)
			if (match) min = Math.min(min, match[1].length)
		}
	}

	if (min === Infinity || min === 0) return diff

	const trimmedLines = lines.map((line) => {
		if (
			(line.startsWith("+") || line.startsWith("-") || line.startsWith(" ")) &&
			!line.startsWith("---") &&
			!line.startsWith("+++")
		) {
			const prefix = line[0]
			const content = line.slice(1)
			return prefix + content.slice(min)
		}
		return line
	})

	return trimmedLines.join("\n")
}

// Export singleton instance for convenience
export const smartEditEngine = new SmartEditEngine()
