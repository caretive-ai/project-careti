/**
 * Editing Module - Smart file editing with fuzzy matching
 *
 * CARETI MODIFICATION: New module for enhanced edit operations
 */

export {
	SmartEditEngine,
	smartEditEngine,
	trimDiff,
	type Replacer,
	type ReplaceResult,
	// Individual replacers
	SimpleReplacer,
	LineTrimmedReplacer,
	BlockAnchorReplacer,
	WhitespaceNormalizedReplacer,
	IndentationFlexibleReplacer,
	EscapeNormalizedReplacer,
	TrimmedBoundaryReplacer,
	ContextAwareReplacer,
	MultiOccurrenceReplacer,
	REPLACERS,
} from "./SmartEditEngine"

export { withLock, isLocked, getLockedCount } from "./FileLock"

export { levenshtein, similarity } from "./utils/levenshtein"
