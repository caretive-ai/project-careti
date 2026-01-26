// CARETI MODIFICATION: Import SmartEditEngine for enhanced fallback matching
import {
	WhitespaceNormalizedReplacer,
	IndentationFlexibleReplacer,
	EscapeNormalizedReplacer,
	TrimmedBoundaryReplacer,
	ContextAwareReplacer,
	levenshtein,
} from "@careti/core/editing"

// Similarity thresholds for block anchor fallback matching
const SINGLE_CANDIDATE_SIMILARITY_THRESHOLD = 0.0
const MULTIPLE_CANDIDATES_SIMILARITY_THRESHOLD = 0.3

const SEARCH_BLOCK_START = "------- SEARCH"
const SEARCH_BLOCK_END = "======="
const REPLACE_BLOCK_END = "+++++++ REPLACE"

const SEARCH_BLOCK_CHAR = "-"
const REPLACE_BLOCK_CHAR = "+"
const LEGACY_SEARCH_BLOCK_CHAR = "<"
const LEGACY_REPLACE_BLOCK_CHAR = ">"

// Replace the exact string constants with flexible regex patterns
const SEARCH_BLOCK_START_REGEX = /^[-]{3,} SEARCH>?$/
const LEGACY_SEARCH_BLOCK_START_REGEX = /^[<]{3,} SEARCH>?$/

const SEARCH_BLOCK_END_REGEX = /^[=]{3,}$/

const REPLACE_BLOCK_END_REGEX = /^[+]{3,} REPLACE>?$/
const LEGACY_REPLACE_BLOCK_END_REGEX = /^[>]{3,} REPLACE>?$/

// Helper functions to check if a line matches the flexible patterns
function isSearchBlockStart(line: string): boolean {
	return SEARCH_BLOCK_START_REGEX.test(line) || LEGACY_SEARCH_BLOCK_START_REGEX.test(line)
}

function isSearchBlockEnd(line: string): boolean {
	return SEARCH_BLOCK_END_REGEX.test(line)
}

function isReplaceBlockEnd(line: string): boolean {
	return REPLACE_BLOCK_END_REGEX.test(line) || LEGACY_REPLACE_BLOCK_END_REGEX.test(line)
}

/**
 * Attempts a line-trimmed fallback match for the given search content in the original content.
 * It tries to match `searchContent` lines against a block of lines in `originalContent` starting
 * from `lastProcessedIndex`. Lines are matched by trimming leading/trailing whitespace and ensuring
 * they are identical afterwards.
 *
 * Returns [matchIndexStart, matchIndexEnd] if found, or false if not found.
 */
function lineTrimmedFallbackMatch(originalContent: string, searchContent: string, startIndex: number): [number, number] | false {
	// Split both contents into lines
	const originalLines = originalContent.split("\n")
	const searchLines = searchContent.split("\n")

	// Trim trailing empty line if exists (from the trailing \n in searchContent)
	if (searchLines[searchLines.length - 1] === "") {
		searchLines.pop()
	}

	// Find the line number where startIndex falls
	let startLineNum = 0
	let currentIndex = 0
	while (currentIndex < startIndex && startLineNum < originalLines.length) {
		currentIndex += originalLines[startLineNum].length + 1 // +1 for \n
		startLineNum++
	}

	// For each possible starting position in original content
	for (let i = startLineNum; i <= originalLines.length - searchLines.length; i++) {
		let matches = true

		// Try to match all search lines from this position
		for (let j = 0; j < searchLines.length; j++) {
			const originalTrimmed = originalLines[i + j].trim()
			const searchTrimmed = searchLines[j].trim()

			if (originalTrimmed !== searchTrimmed) {
				matches = false
				break
			}
		}

		// If we found a match, calculate the exact character positions
		if (matches) {
			// Find start character index
			let matchStartIndex = 0
			for (let k = 0; k < i; k++) {
				matchStartIndex += originalLines[k].length + 1 // +1 for \n
			}

			// Find end character index
			let matchEndIndex = matchStartIndex
			for (let k = 0; k < searchLines.length; k++) {
				matchEndIndex += originalLines[i + k].length + 1 // +1 for \n
			}

			return [matchStartIndex, matchEndIndex]
		}
	}

	return false
}

/**
 * Attempts to match blocks of code by using the first and last lines as anchors.
 * This is a third-tier fallback strategy that helps match blocks where we can identify
 * the correct location by matching the beginning and end, even if the exact content
 * differs slightly.
 *
 * CARETI MODIFICATION: Enhanced with Levenshtein similarity scoring for multiple candidates.
 * - Single candidate: accepts with 0% threshold (relaxed)
 * - Multiple candidates: selects best match with 30% threshold
 *
 * @param originalContent - The full content of the original file
 * @param searchContent - The content we're trying to find in the original file
 * @param startIndex - The character index in originalContent where to start searching
 * @returns A tuple of [startIndex, endIndex] if a match is found, false otherwise
 */
function blockAnchorFallbackMatch(originalContent: string, searchContent: string, startIndex: number): [number, number] | false {
	const originalLines = originalContent.split("\n")
	const searchLines = searchContent.split("\n")

	// Only use this approach for blocks of 3+ lines
	if (searchLines.length < 3) {
		return false
	}

	// Trim trailing empty line if exists
	if (searchLines[searchLines.length - 1] === "") {
		searchLines.pop()
	}

	const firstLineSearch = searchLines[0].trim()
	const lastLineSearch = searchLines[searchLines.length - 1].trim()
	const searchBlockSize = searchLines.length

	// Find the line number where startIndex falls
	let startLineNum = 0
	let currentIndex = 0
	while (currentIndex < startIndex && startLineNum < originalLines.length) {
		currentIndex += originalLines[startLineNum].length + 1
		startLineNum++
	}

	// Collect all candidate positions where both anchors match
	const candidates: Array<{ startLine: number; endLine: number }> = []
	for (let i = startLineNum; i <= originalLines.length - searchBlockSize; i++) {
		if (originalLines[i].trim() !== firstLineSearch) {
			continue
		}
		if (originalLines[i + searchBlockSize - 1].trim() !== lastLineSearch) {
			continue
		}
		candidates.push({ startLine: i, endLine: i + searchBlockSize - 1 })
	}

	if (candidates.length === 0) {
		return false
	}

	// Helper function to calculate character positions
	const getCharPositions = (startLine: number, endLine: number): [number, number] => {
		let matchStartIndex = 0
		for (let k = 0; k < startLine; k++) {
			matchStartIndex += originalLines[k].length + 1
		}
		let matchEndIndex = matchStartIndex
		for (let k = startLine; k <= endLine; k++) {
			matchEndIndex += originalLines[k].length + 1
		}
		return [matchStartIndex, matchEndIndex]
	}

	// Calculate similarity for a candidate using Levenshtein distance
	const calculateSimilarity = (startLine: number): number => {
		const actualBlockSize = searchBlockSize
		const linesToCheck = Math.min(searchBlockSize - 2, actualBlockSize - 2)

		if (linesToCheck <= 0) {
			return 1.0 // No middle lines to compare, accept based on anchors
		}

		let similarity = 0
		for (let j = 1; j < searchBlockSize - 1; j++) {
			const originalLine = originalLines[startLine + j].trim()
			const searchLine = searchLines[j].trim()
			const maxLen = Math.max(originalLine.length, searchLine.length)
			if (maxLen === 0) {
				continue
			}
			const distance = levenshtein(originalLine, searchLine)
			similarity += 1 - distance / maxLen
		}
		return similarity / linesToCheck
	}

	// Handle single candidate scenario (relaxed threshold)
	if (candidates.length === 1) {
		const { startLine, endLine } = candidates[0]
		const similarity = calculateSimilarity(startLine)
		if (similarity >= SINGLE_CANDIDATE_SIMILARITY_THRESHOLD) {
			return getCharPositions(startLine, endLine)
		}
		return false
	}

	// Multiple candidates: select best match based on similarity
	let bestMatch: { startLine: number; endLine: number } | null = null
	let maxSimilarity = -1

	for (const candidate of candidates) {
		const similarity = calculateSimilarity(candidate.startLine)
		if (similarity > maxSimilarity) {
			maxSimilarity = similarity
			bestMatch = candidate
		}
	}

	if (maxSimilarity >= MULTIPLE_CANDIDATES_SIMILARITY_THRESHOLD && bestMatch) {
		return getCharPositions(bestMatch.startLine, bestMatch.endLine)
	}

	return false
}

// CARETI MODIFICATION: Enhanced fallback matching using SmartEditEngine replacers

/**
 * Attempts whitespace-normalized matching using SmartEditEngine's WhitespaceNormalizedReplacer.
 * Collapses multiple whitespaces and compares normalized content.
 */
function whitespaceNormalizedFallbackMatch(
	originalContent: string,
	searchContent: string,
	startIndex: number,
): [number, number] | false {
	for (const match of WhitespaceNormalizedReplacer(originalContent, searchContent)) {
		const index = originalContent.indexOf(match, startIndex)
		if (index !== -1) {
			return [index, index + match.length]
		}
	}
	return false
}

/**
 * Attempts indentation-flexible matching using SmartEditEngine's IndentationFlexibleReplacer.
 * Matches content regardless of base indentation level.
 */
function indentationFlexibleFallbackMatch(
	originalContent: string,
	searchContent: string,
	startIndex: number,
): [number, number] | false {
	for (const match of IndentationFlexibleReplacer(originalContent, searchContent)) {
		const index = originalContent.indexOf(match, startIndex)
		if (index !== -1) {
			return [index, index + match.length]
		}
	}
	return false
}

/**
 * Attempts escape-normalized matching using SmartEditEngine's EscapeNormalizedReplacer.
 * Handles escape sequences like \n, \t, etc.
 */
function escapeNormalizedFallbackMatch(
	originalContent: string,
	searchContent: string,
	startIndex: number,
): [number, number] | false {
	for (const match of EscapeNormalizedReplacer(originalContent, searchContent)) {
		const index = originalContent.indexOf(match, startIndex)
		if (index !== -1) {
			return [index, index + match.length]
		}
	}
	return false
}

/**
 * Attempts trimmed-boundary matching using SmartEditEngine's TrimmedBoundaryReplacer.
 * Trims the entire search string and matches trimmed blocks.
 */
function trimmedBoundaryFallbackMatch(
	originalContent: string,
	searchContent: string,
	startIndex: number,
): [number, number] | false {
	for (const match of TrimmedBoundaryReplacer(originalContent, searchContent)) {
		const index = originalContent.indexOf(match, startIndex)
		if (index !== -1) {
			return [index, index + match.length]
		}
	}
	return false
}

/**
 * Attempts context-aware matching using SmartEditEngine's ContextAwareReplacer.
 * Uses first/last lines as context anchors with 50% middle line matching threshold.
 */
function contextAwareFallbackMatch(
	originalContent: string,
	searchContent: string,
	startIndex: number,
): [number, number] | false {
	for (const match of ContextAwareReplacer(originalContent, searchContent)) {
		const index = originalContent.indexOf(match, startIndex)
		if (index !== -1) {
			return [index, index + match.length]
		}
	}
	return false
}

/**
 * This function reconstructs the file content by applying a streamed diff (in a
 * specialized SEARCH/REPLACE block format) to the original file content. It is designed
 * to handle both incremental updates and the final resulting file after all chunks have
 * been processed.
 *
 * The diff format is a custom structure that uses three markers to define changes:
 *
 *   ------- SEARCH
 *   [Exact content to find in the original file]
 *   =======
 *   [Content to replace with]
 *   +++++++ REPLACE
 *
 * Behavior and Assumptions:
 * 1. The file is processed chunk-by-chunk. Each chunk of `diffContent` may contain
 *    partial or complete SEARCH/REPLACE blocks. By calling this function with each
 *    incremental chunk (with `isFinal` indicating the last chunk), the final reconstructed
 *    file content is produced.
 *
 * 2. Matching Strategy (in order of attempt):
 *    a. Exact Match: First attempts to find the exact SEARCH block text in the original file
 *    b. Line-Trimmed Match: Falls back to line-by-line comparison ignoring leading/trailing whitespace
 *    c. Block Anchor Match: For blocks of 3+ lines, tries to match using first/last lines as anchors
 *    If all matching strategies fail, an error is thrown.
 *
 * 3. Empty SEARCH Section:
 *    - If SEARCH is empty and the original file is empty, this indicates creating a new file
 *      (pure insertion).
 *    - If SEARCH is empty and the original file is not empty, this indicates a complete
 *      file replacement (the entire original content is considered matched and replaced).
 *
 * 4. Applying Changes:
 *    - Before encountering the "=======" marker, lines are accumulated as search content.
 *    - After "=======" and before ">>>>>>> REPLACE", lines are accumulated as replacement content.
 *    - Once the block is complete (">>>>>>> REPLACE"), the matched section in the original
 *      file is replaced with the accumulated replacement lines, and the position in the original
 *      file is advanced.
 *
 * 5. Incremental Output:
 *    - As soon as the match location is found and we are in the REPLACE section, each new
 *      replacement line is appended to the result so that partial updates can be viewed
 *      incrementally.
 *
 * 6. Partial Markers:
 *    - If the final line of the chunk looks like it might be part of a marker but is not one
 *      of the known markers, it is removed. This prevents incomplete or partial markers
 *      from corrupting the output.
 *
 * 7. Finalization:
 *    - Once all chunks have been processed (when `isFinal` is true), any remaining original
 *      content after the last replaced section is appended to the result.
 *    - Trailing newlines are not forcibly added. The code tries to output exactly what is specified.
 *
 * Errors:
 * - If the search block cannot be matched using any of the available matching strategies,
 *   an error is thrown.
 */
export async function constructNewFileContent(
	diffContent: string,
	originalContent: string,
	isFinal: boolean,
	version: "v1" | "v2" = "v1",
): Promise<string> {
	const constructor = constructNewFileContentVersionMapping[version]
	if (!constructor) {
		throw new Error(`Invalid version '${version}' for file content constructor`)
	}
	return constructor(diffContent, originalContent, isFinal)
}

const constructNewFileContentVersionMapping: Record<
	string,
	(diffContent: string, originalContent: string, isFinal: boolean) => Promise<string>
> = {
	v1: constructNewFileContentV1,
	v2: constructNewFileContentV2,
} as const

async function constructNewFileContentV1(diffContent: string, originalContent: string, isFinal: boolean): Promise<string> {
	let result = ""
	let lastProcessedIndex = 0

	let currentSearchContent = ""
	let currentReplaceContent = ""
	let inSearch = false
	let inReplace = false

	let searchMatchIndex = -1
	let searchEndIndex = -1

	// Track all replacements to handle out-of-order edits
	const replacements: Array<{ start: number; end: number; content: string }> = []
	let pendingOutOfOrderReplacement = false

	const lines = diffContent.split("\n")

	// If the last line looks like a partial marker but isn't recognized,
	// remove it because it might be incomplete.
	const lastLine = lines[lines.length - 1]
	if (
		lines.length > 0 &&
		(lastLine.startsWith(SEARCH_BLOCK_CHAR) ||
			lastLine.startsWith(LEGACY_SEARCH_BLOCK_CHAR) ||
			lastLine.startsWith("=") ||
			lastLine.startsWith(REPLACE_BLOCK_CHAR) ||
			lastLine.startsWith(LEGACY_REPLACE_BLOCK_CHAR)) &&
		!isSearchBlockStart(lastLine) &&
		!isSearchBlockEnd(lastLine) &&
		!isReplaceBlockEnd(lastLine)
	) {
		lines.pop()
	}

	for (const line of lines) {
		if (isSearchBlockStart(line)) {
			inSearch = true
			currentSearchContent = ""
			currentReplaceContent = ""
			continue
		}

		if (isSearchBlockEnd(line)) {
			inSearch = false
			inReplace = true

			// Remove trailing linebreak for adding the === marker
			// if (currentSearchContent.endsWith("\r\n")) {
			// 	currentSearchContent = currentSearchContent.slice(0, -2)
			// } else if (currentSearchContent.endsWith("\n")) {
			// 	currentSearchContent = currentSearchContent.slice(0, -1)
			// }

			if (!currentSearchContent) {
				// Empty search block
				if (originalContent.length === 0) {
					// New file scenario: nothing to match, just start inserting
					searchMatchIndex = 0
					searchEndIndex = 0
				} else {
					// ERROR: Empty search block with non-empty file indicates malformed SEARCH marker
					throw new Error(
						"Empty SEARCH block detected with non-empty file. This usually indicates a malformed SEARCH marker.\n" +
							"Please ensure your SEARCH marker follows the correct format:\n" +
							"- Use '------- SEARCH' (7+ dashes + space + SEARCH)\n",
					)
				}
			} else {
				// Add check for inefficient full-file search
				// if (currentSearchContent.trim() === originalContent.trim()) {
				// 	throw new Error(
				// 		"The SEARCH block contains the entire file content. Please either:\n" +
				// 			"1. Use an empty SEARCH block to replace the entire file, or\n" +
				// 			"2. Make focused changes to specific parts of the file that need modification.",
				// 	)
				// }

				// Exact search match scenario
				const exactIndex = originalContent.indexOf(currentSearchContent, lastProcessedIndex)
				if (exactIndex !== -1) {
					searchMatchIndex = exactIndex
					searchEndIndex = exactIndex + currentSearchContent.length
				} else {
					// CARETI MODIFICATION: Enhanced 8-stage fallback matching
					// Stage 1: Line-trimmed matching
					const lineMatch = lineTrimmedFallbackMatch(originalContent, currentSearchContent, lastProcessedIndex)
					if (lineMatch) {
						;[searchMatchIndex, searchEndIndex] = lineMatch
					} else {
						// Stage 2: Whitespace-normalized matching
						const wsMatch = whitespaceNormalizedFallbackMatch(originalContent, currentSearchContent, lastProcessedIndex)
						if (wsMatch) {
							;[searchMatchIndex, searchEndIndex] = wsMatch
						} else {
							// Stage 3: Indentation-flexible matching
							const indentMatch = indentationFlexibleFallbackMatch(
								originalContent,
								currentSearchContent,
								lastProcessedIndex,
							)
							if (indentMatch) {
								;[searchMatchIndex, searchEndIndex] = indentMatch
							} else {
								// Stage 4: Escape-normalized matching
								const escapeMatch = escapeNormalizedFallbackMatch(
									originalContent,
									currentSearchContent,
									lastProcessedIndex,
								)
								if (escapeMatch) {
									;[searchMatchIndex, searchEndIndex] = escapeMatch
								} else {
									// Stage 5: Block anchor fallback for larger blocks
									const blockMatch = blockAnchorFallbackMatch(
										originalContent,
										currentSearchContent,
										lastProcessedIndex,
									)
									if (blockMatch) {
										;[searchMatchIndex, searchEndIndex] = blockMatch
									} else {
										// Stage 6: Trimmed boundary matching
										const trimmedMatch = trimmedBoundaryFallbackMatch(
											originalContent,
											currentSearchContent,
											lastProcessedIndex,
										)
										if (trimmedMatch) {
											;[searchMatchIndex, searchEndIndex] = trimmedMatch
										} else {
											// Stage 7: Context-aware matching
											const contextMatch = contextAwareFallbackMatch(
												originalContent,
												currentSearchContent,
												lastProcessedIndex,
											)
											if (contextMatch) {
												;[searchMatchIndex, searchEndIndex] = contextMatch
											} else {
												// Stage 8: Last resort - search entire file from beginning
												const fullFileIndex = originalContent.indexOf(currentSearchContent, 0)
												if (fullFileIndex !== -1) {
													searchMatchIndex = fullFileIndex
													searchEndIndex = fullFileIndex + currentSearchContent.length
													if (searchMatchIndex < lastProcessedIndex) {
														pendingOutOfOrderReplacement = true
													}
												} else {
													throw new Error(
														`The SEARCH block:\n${currentSearchContent.trimEnd()}\n...does not match anything in the file.`,
													)
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}

			// Check if this is an out-of-order replacement
			if (searchMatchIndex < lastProcessedIndex) {
				pendingOutOfOrderReplacement = true
			}

			// For in-order replacements, output everything up to the match location
			if (!pendingOutOfOrderReplacement) {
				result += originalContent.slice(lastProcessedIndex, searchMatchIndex)
			}
			continue
		}

		if (isReplaceBlockEnd(line)) {
			// Finished one replace block

			if (searchMatchIndex === -1) {
				throw new Error(`The SEARCH block:\n${currentSearchContent.trimEnd()}\n...is malformatted.`)
			}

			// Store this replacement
			replacements.push({
				start: searchMatchIndex,
				end: searchEndIndex,
				content: currentReplaceContent,
			})

			// If this was an in-order replacement, advance lastProcessedIndex
			if (!pendingOutOfOrderReplacement) {
				lastProcessedIndex = searchEndIndex
			}

			// Reset for next block
			inSearch = false
			inReplace = false
			currentSearchContent = ""
			currentReplaceContent = ""
			searchMatchIndex = -1
			searchEndIndex = -1
			pendingOutOfOrderReplacement = false
			continue
		}

		// Accumulate content for search or replace
		// (currentReplaceContent is not being used for anything right now since we directly append to result.)
		// (We artificially add a linebreak since we split on \n at the beginning. In order to not include a trailing linebreak in the final search/result blocks we need to remove it before using them. This allows for partial line matches to be correctly identified.)
		// NOTE: search/replace blocks must be arranged in the order they appear in the file due to how we build the content using lastProcessedIndex. We also cannot strip the trailing newline since for non-partial lines it would remove the linebreak from the original content. (If we remove end linebreak from search, then we'd also have to remove it from replace but we can't know if it's a partial line or not since the model may be using the line break to indicate the end of the block rather than as part of the search content.) We require the model to output full lines in order for our fallbacks to work as well.
		if (inSearch) {
			currentSearchContent += line + "\n"
		} else if (inReplace) {
			currentReplaceContent += line + "\n"
			// Only output replacement lines immediately for in-order replacements
			if (searchMatchIndex !== -1 && !pendingOutOfOrderReplacement) {
				result += line + "\n"
			}
		}
	}

	// If this is the final chunk, we need to apply all replacements and build the final result
	if (isFinal) {
		// Handle the case where we're still in replace mode when processing ends
		// and this is the final chunk - treat it as if we encountered the REPLACE marker
		if (inReplace && searchMatchIndex !== -1) {
			// Store this replacement
			replacements.push({
				start: searchMatchIndex,
				end: searchEndIndex,
				content: currentReplaceContent,
			})

			// If this was an in-order replacement, advance lastProcessedIndex
			if (!pendingOutOfOrderReplacement) {
				lastProcessedIndex = searchEndIndex
			}

			// Reset state
			inSearch = false
			inReplace = false
			currentSearchContent = ""
			currentReplaceContent = ""
			searchMatchIndex = -1
			searchEndIndex = -1
			pendingOutOfOrderReplacement = false
		}
		// end of handling missing replace marker

		// Sort replacements by start position
		replacements.sort((a, b) => a.start - b.start)

		// Rebuild the entire result by applying all replacements
		result = ""
		let currentPos = 0

		for (const replacement of replacements) {
			// Add original content up to this replacement
			result += originalContent.slice(currentPos, replacement.start)
			// Add the replacement content
			result += replacement.content
			// Move position to after the replaced section
			currentPos = replacement.end
		}

		// Add any remaining original content
		result += originalContent.slice(currentPos)
	}

	return result
}

enum ProcessingState {
	Idle = 0,
	StateSearch = 1 << 0,
	StateReplace = 1 << 1,
}

class NewFileContentConstructor {
	private originalContent: string
	private isFinal: boolean
	private state: number
	private pendingNonStandardLines: string[]
	private result: string
	private lastProcessedIndex: number
	private currentSearchContent: string
	private searchMatchIndex: number
	private searchEndIndex: number

	constructor(originalContent: string, isFinal: boolean) {
		this.originalContent = originalContent
		this.isFinal = isFinal
		this.pendingNonStandardLines = []
		this.result = ""
		this.lastProcessedIndex = 0
		this.state = ProcessingState.Idle
		this.currentSearchContent = ""
		this.searchMatchIndex = -1
		this.searchEndIndex = -1
	}

	private resetForNextBlock() {
		// Reset for next block
		this.state = ProcessingState.Idle
		this.currentSearchContent = ""
		this.searchMatchIndex = -1
		this.searchEndIndex = -1
	}

	private findLastMatchingLineIndex(regx: RegExp, lineLimit: number) {
		for (let i = lineLimit; i > 0; ) {
			i--
			if (this.pendingNonStandardLines[i].match(regx)) {
				return i
			}
		}
		return -1
	}

	private updateProcessingState(newState: ProcessingState) {
		const isValidTransition =
			(this.state === ProcessingState.Idle && newState === ProcessingState.StateSearch) ||
			(this.state === ProcessingState.StateSearch && newState === ProcessingState.StateReplace)

		if (!isValidTransition) {
			throw new Error(
				`Invalid state transition.\n` +
					"Valid transitions are:\n" +
					"- Idle → StateSearch\n" +
					"- StateSearch → StateReplace",
			)
		}

		this.state |= newState
	}

	private isStateActive(state: ProcessingState): boolean {
		return (this.state & state) === state
	}

	private activateReplaceState() {
		this.updateProcessingState(ProcessingState.StateReplace)
	}

	private activateSearchState() {
		this.updateProcessingState(ProcessingState.StateSearch)
		this.currentSearchContent = ""
	}

	private isSearchingActive(): boolean {
		return this.isStateActive(ProcessingState.StateSearch)
	}

	private isReplacingActive(): boolean {
		return this.isStateActive(ProcessingState.StateReplace)
	}

	private hasPendingNonStandardLines(pendingNonStandardLineLimit: number): boolean {
		return this.pendingNonStandardLines.length - pendingNonStandardLineLimit < this.pendingNonStandardLines.length
	}

	public processLine(line: string) {
		this.internalProcessLine(line, true, this.pendingNonStandardLines.length)
	}

	public getResult() {
		// If this is the final chunk, append any remaining original content
		if (this.isFinal && this.lastProcessedIndex < this.originalContent.length) {
			this.result += this.originalContent.slice(this.lastProcessedIndex)
		}
		if (this.isFinal && this.state !== ProcessingState.Idle) {
			throw new Error("File processing incomplete - SEARCH/REPLACE operations still active during finalization")
		}
		return this.result
	}

	private internalProcessLine(
		line: string,
		canWritependingNonStandardLines: boolean,
		pendingNonStandardLineLimit: number,
	): number {
		let removeLineCount = 0
		if (isSearchBlockStart(line)) {
			removeLineCount = this.trimPendingNonStandardTrailingEmptyLines(pendingNonStandardLineLimit)
			if (removeLineCount > 0) {
				pendingNonStandardLineLimit = pendingNonStandardLineLimit - removeLineCount
			}
			if (this.hasPendingNonStandardLines(pendingNonStandardLineLimit)) {
				this.tryFixSearchReplaceBlock(pendingNonStandardLineLimit)
				canWritependingNonStandardLines && (this.pendingNonStandardLines.length = 0)
			}
			this.activateSearchState()
		} else if (isSearchBlockEnd(line)) {
			// 校验非标内容
			if (!this.isSearchingActive()) {
				this.tryFixSearchBlock(pendingNonStandardLineLimit)
				canWritependingNonStandardLines && (this.pendingNonStandardLines.length = 0)
			}
			this.activateReplaceState()
			this.beforeReplace()
		} else if (isReplaceBlockEnd(line)) {
			if (!this.isReplacingActive()) {
				this.tryFixReplaceBlock(pendingNonStandardLineLimit)
				canWritependingNonStandardLines && (this.pendingNonStandardLines.length = 0)
			}
			this.lastProcessedIndex = this.searchEndIndex
			this.resetForNextBlock()
		} else {
			// Accumulate content for search or replace
			// (currentReplaceContent is not being used for anything right now since we directly append to result.)
			// (We artificially add a linebreak since we split on \n at the beginning. In order to not include a trailing linebreak in the final search/result blocks we need to remove it before using them. This allows for partial line matches to be correctly identified.)
			// NOTE: search/replace blocks must be arranged in the order they appear in the file due to how we build the content using lastProcessedIndex. We also cannot strip the trailing newline since for non-partial lines it would remove the linebreak from the original content. (If we remove end linebreak from search, then we'd also have to remove it from replace but we can't know if it's a partial line or not since the model may be using the line break to indicate the end of the block rather than as part of the search content.) We require the model to output full lines in order for our fallbacks to work as well.
			if (this.isReplacingActive()) {
				// Output replacement lines immediately if we know the insertion point
				if (this.searchMatchIndex !== -1) {
					this.result += line + "\n"
				}
			} else if (this.isSearchingActive()) {
				this.currentSearchContent += line + "\n"
			} else {
				const appendToPendingNonStandardLines = canWritependingNonStandardLines
				if (appendToPendingNonStandardLines) {
					// 处理非标内容
					this.pendingNonStandardLines.push(line)
				}
			}
		}
		return removeLineCount
	}

	private beforeReplace() {
		// Remove trailing linebreak for adding the === marker
		// if (currentSearchContent.endsWith("\r\n")) {
		// 	currentSearchContent = currentSearchContent.slice(0, -2)
		// } else if (currentSearchContent.endsWith("\n")) {
		// 	currentSearchContent = currentSearchContent.slice(0, -1)
		// }

		if (!this.currentSearchContent) {
			// Empty search block
			if (this.originalContent.length === 0) {
				// New file scenario: nothing to match, just start inserting
				this.searchMatchIndex = 0
				this.searchEndIndex = 0
			} else {
				// Complete file replacement scenario: treat the entire file as matched
				this.searchMatchIndex = 0
				this.searchEndIndex = this.originalContent.length
			}
		} else {
			// Add check for inefficient full-file search
			// if (currentSearchContent.trim() === originalContent.trim()) {
			// 	throw new Error(
			// 		"The SEARCH block contains the entire file content. Please either:\n" +
			// 			"1. Use an empty SEARCH block to replace the entire file, or\n" +
			// 			"2. Make focused changes to specific parts of the file that need modification.",
			// 	)
			// }
			// Exact search match scenario
			const exactIndex = this.originalContent.indexOf(this.currentSearchContent, this.lastProcessedIndex)
			if (exactIndex !== -1) {
				this.searchMatchIndex = exactIndex
				this.searchEndIndex = exactIndex + this.currentSearchContent.length
			} else {
				// CARETI MODIFICATION: Enhanced 8-stage fallback matching (V2)
				// Stage 1: Line-trimmed matching
				const lineMatch = lineTrimmedFallbackMatch(
					this.originalContent,
					this.currentSearchContent,
					this.lastProcessedIndex,
				)
				if (lineMatch) {
					;[this.searchMatchIndex, this.searchEndIndex] = lineMatch
				} else {
					// Stage 2: Whitespace-normalized matching
					const wsMatch = whitespaceNormalizedFallbackMatch(
						this.originalContent,
						this.currentSearchContent,
						this.lastProcessedIndex,
					)
					if (wsMatch) {
						;[this.searchMatchIndex, this.searchEndIndex] = wsMatch
					} else {
						// Stage 3: Indentation-flexible matching
						const indentMatch = indentationFlexibleFallbackMatch(
							this.originalContent,
							this.currentSearchContent,
							this.lastProcessedIndex,
						)
						if (indentMatch) {
							;[this.searchMatchIndex, this.searchEndIndex] = indentMatch
						} else {
							// Stage 4: Escape-normalized matching
							const escapeMatch = escapeNormalizedFallbackMatch(
								this.originalContent,
								this.currentSearchContent,
								this.lastProcessedIndex,
							)
							if (escapeMatch) {
								;[this.searchMatchIndex, this.searchEndIndex] = escapeMatch
							} else {
								// Stage 5: Block anchor fallback for larger blocks
								const blockMatch = blockAnchorFallbackMatch(
									this.originalContent,
									this.currentSearchContent,
									this.lastProcessedIndex,
								)
								if (blockMatch) {
									;[this.searchMatchIndex, this.searchEndIndex] = blockMatch
								} else {
									// Stage 6: Trimmed boundary matching
									const trimmedMatch = trimmedBoundaryFallbackMatch(
										this.originalContent,
										this.currentSearchContent,
										this.lastProcessedIndex,
									)
									if (trimmedMatch) {
										;[this.searchMatchIndex, this.searchEndIndex] = trimmedMatch
									} else {
										// Stage 7: Context-aware matching
										const contextMatch = contextAwareFallbackMatch(
											this.originalContent,
											this.currentSearchContent,
											this.lastProcessedIndex,
										)
										if (contextMatch) {
											;[this.searchMatchIndex, this.searchEndIndex] = contextMatch
										} else {
											throw new Error(
												`The SEARCH block:\n${this.currentSearchContent.trimEnd()}\n...does not match anything in the file.`,
											)
										}
									}
								}
							}
						}
					}
				}
			}
		}
		if (this.searchMatchIndex < this.lastProcessedIndex) {
			throw new Error(
				`The SEARCH block:\n${this.currentSearchContent.trimEnd()}\n...matched an incorrect content in the file.`,
			)
		}
		// Output everything up to the match location
		this.result += this.originalContent.slice(this.lastProcessedIndex, this.searchMatchIndex)
	}

	private tryFixSearchBlock(lineLimit: number): number {
		let removeLineCount = 0
		if (lineLimit < 0) {
			lineLimit = this.pendingNonStandardLines.length
		}
		if (!lineLimit) {
			throw new Error("Invalid SEARCH/REPLACE block structure - no lines available to process")
		}
		const searchTagRegexp = /^([-]{3,}|[<]{3,}) SEARCH$/
		const searchTagIndex = this.findLastMatchingLineIndex(searchTagRegexp, lineLimit)
		if (searchTagIndex !== -1) {
			const fixLines = this.pendingNonStandardLines.slice(searchTagIndex, lineLimit)
			fixLines[0] = SEARCH_BLOCK_START
			for (const line of fixLines) {
				removeLineCount += this.internalProcessLine(line, false, searchTagIndex)
			}
		} else {
			throw new Error(
				`Invalid REPLACE marker detected - could not find matching SEARCH block starting from line ${searchTagIndex + 1}`,
			)
		}
		return removeLineCount
	}

	private tryFixReplaceBlock(lineLimit: number): number {
		let removeLineCount = 0
		if (lineLimit < 0) {
			lineLimit = this.pendingNonStandardLines.length
		}
		if (!lineLimit) {
			throw new Error()
		}
		const replaceBeginTagRegexp = /^[=]{3,}$/
		const replaceBeginTagIndex = this.findLastMatchingLineIndex(replaceBeginTagRegexp, lineLimit)
		if (replaceBeginTagIndex !== -1) {
			// // 校验非标内容
			// if (!this.isSearchingActive()) {
			// 	removeLineCount += this.tryFixSearchBlock(replaceBeginTagIndex)
			// }
			const fixLines = this.pendingNonStandardLines.slice(
				replaceBeginTagIndex - removeLineCount,
				lineLimit - removeLineCount,
			)
			fixLines[0] = SEARCH_BLOCK_END
			for (const line of fixLines) {
				removeLineCount += this.internalProcessLine(line, false, replaceBeginTagIndex - removeLineCount)
			}
		} else {
			throw new Error(`Malformed REPLACE block - missing valid separator after line ${replaceBeginTagIndex + 1}`)
		}
		return removeLineCount
	}

	private tryFixSearchReplaceBlock(lineLimit: number): number {
		let removeLineCount = 0
		if (lineLimit < 0) {
			lineLimit = this.pendingNonStandardLines.length
		}
		if (!lineLimit) {
			throw new Error()
		}

		const replaceEndTagRegexp = /^([+]{3,}|[>]{3,}) REPLACE$/
		const replaceEndTagIndex = this.findLastMatchingLineIndex(replaceEndTagRegexp, lineLimit)
		const likeReplaceEndTag = replaceEndTagIndex === lineLimit - 1
		if (likeReplaceEndTag) {
			// // 校验非标内容
			// if (!this.isReplacingActive()) {
			// 	removeLineCount += this.tryFixReplaceBlock(replaceEndTagIndex)
			// }
			const fixLines = this.pendingNonStandardLines.slice(replaceEndTagIndex - removeLineCount, lineLimit - removeLineCount)
			fixLines[fixLines.length - 1] = REPLACE_BLOCK_END
			for (const line of fixLines) {
				removeLineCount += this.internalProcessLine(line, false, replaceEndTagIndex - removeLineCount)
			}
		} else {
			throw new Error("Malformed SEARCH/REPLACE block structure: Missing valid closing REPLACE marker")
		}
		return removeLineCount
	}

	/**
	 * Removes trailing empty lines from the pendingNonStandardLines array
	 * @param lineLimit - The index to start checking from (exclusive).
	 *                    Removes empty lines from lineLimit-1 backwards.
	 * @returns The number of empty lines removed
	 */
	private trimPendingNonStandardTrailingEmptyLines(lineLimit: number): number {
		let removedCount = 0
		let i = Math.min(lineLimit, this.pendingNonStandardLines.length) - 1

		while (i >= 0 && this.pendingNonStandardLines[i].trim() === "") {
			this.pendingNonStandardLines.pop()
			removedCount++
			i--
		}

		return removedCount
	}
}

export async function constructNewFileContentV2(diffContent: string, originalContent: string, isFinal: boolean): Promise<string> {
	const newFileContentConstructor = new NewFileContentConstructor(originalContent, isFinal)

	const lines = diffContent.split("\n")

	// If the last line looks like a partial marker but isn't recognized,
	// remove it because it might be incomplete.
	const lastLine = lines[lines.length - 1]
	if (
		lines.length > 0 &&
		(lastLine.startsWith(SEARCH_BLOCK_CHAR) ||
			lastLine.startsWith(LEGACY_SEARCH_BLOCK_CHAR) ||
			lastLine.startsWith("=") ||
			lastLine.startsWith(REPLACE_BLOCK_CHAR) ||
			lastLine.startsWith(LEGACY_REPLACE_BLOCK_CHAR)) &&
		lastLine !== SEARCH_BLOCK_START &&
		lastLine !== SEARCH_BLOCK_END &&
		lastLine !== REPLACE_BLOCK_END
	) {
		lines.pop()
	}

	for (const line of lines) {
		newFileContentConstructor.processLine(line)
	}

	const result = newFileContentConstructor.getResult()
	return result
}
