import { Anthropic } from "@anthropic-ai/sdk"
import * as diff from "diff"
import * as path from "path"
import { ClineIgnoreController, LOCK_TEXT_SYMBOL } from "../ignore/ClineIgnoreController"
import { CaretResponses } from "../../../caret-src/core/prompts/CaretResponses"
import { Mode } from "@shared/storage/types"

export const formatResponse = {
	duplicateFileReadNotice: () => CaretResponses.duplicateFileReadNotice(),

	contextTruncationNotice: () => CaretResponses.contextTruncationNotice(),

	condense: () => CaretResponses.condense(),

	toolDenied: () => CaretResponses.toolDenied(),

	toolError: (error?: string) => CaretResponses.toolError(error),

	clineIgnoreError: (path: string) => CaretResponses.clineIgnoreError(path),

	noToolsUsed: () => CaretResponses.noToolsUsed(),

	tooManyMistakes: (feedback?: string) => CaretResponses.tooManyMistakes(feedback),

	autoApprovalMaxReached: (feedback?: string) => CaretResponses.autoApprovalMaxReached(feedback),

	missingToolParameterError: (paramName: string) => CaretResponses.missingToolParameterError(paramName),

	invalidMcpToolArgumentError: (serverName: string, toolName: string) =>
		CaretResponses.invalidMcpToolArgumentError(serverName, toolName),

	toolResult: (
		text: string,
		images?: string[],
		fileString?: string,
	): string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> => {
		let toolResultOutput = []

		if (!(images && images.length > 0) && !fileString) {
			return text
		}

		const textBlock: Anthropic.TextBlockParam = { type: "text", text }
		toolResultOutput.push(textBlock)

		if (images && images.length > 0) {
			const imageBlocks: Anthropic.ImageBlockParam[] = formatImagesIntoBlocks(images)
			toolResultOutput.push(...imageBlocks)
		}

		if (fileString) {
			const fileBlock: Anthropic.TextBlockParam = { type: "text", text: fileString }
			toolResultOutput.push(fileBlock)
		}

		return toolResultOutput
	},

	imageBlocks: (images?: string[]): Anthropic.ImageBlockParam[] => {
		return formatImagesIntoBlocks(images)
	},

	formatFilesList: (
		absolutePath: string,
		files: string[],
		didHitLimit: boolean,
		clineIgnoreController?: ClineIgnoreController,
	): string => {
		const sorted = files
			.map((file) => {
				// convert absolute path to relative path
				const relativePath = path.relative(absolutePath, file).toPosix()
				return file.endsWith("/") ? relativePath + "/" : relativePath
			})
			// Sort so files are listed under their respective directories to make it clear what files are children of what directories. Since we build file list top down, even if file list is truncated it will show directories that cline can then explore further.
			.sort((a, b) => {
				const aParts = a.split("/") // only works if we use toPosix first
				const bParts = b.split("/")
				for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
					if (aParts[i] !== bParts[i]) {
						// If one is a directory and the other isn't at this level, sort the directory first
						if (i + 1 === aParts.length && i + 1 < bParts.length) {
							return -1
						}
						if (i + 1 === bParts.length && i + 1 < aParts.length) {
							return 1
						}
						// Otherwise, sort alphabetically
						return aParts[i].localeCompare(bParts[i], undefined, {
							numeric: true,
							sensitivity: "base",
						})
					}
				}
				// If all parts are the same up to the length of the shorter path,
				// the shorter one comes first
				return aParts.length - bParts.length
			})

		const clineIgnoreParsed = clineIgnoreController
			? sorted.map((filePath) => {
					// path is relative to absolute path, not cwd
					// validateAccess expects either path relative to cwd or absolute path
					// otherwise, for validating against ignore patterns like "assets/icons", we would end up with just "icons", which would result in the path not being ignored.
					const absoluteFilePath = path.resolve(absolutePath, filePath)
					const isIgnored = !clineIgnoreController.validateAccess(absoluteFilePath)
					if (isIgnored) {
						return LOCK_TEXT_SYMBOL + " " + filePath
					}

					return filePath
				})
			: sorted

		if (didHitLimit) {
			return `${clineIgnoreParsed.join("\n")}\n\n${CaretResponses.formatFilesListTruncated()}`
		} else if (clineIgnoreParsed.length === 0 || (clineIgnoreParsed.length === 1 && clineIgnoreParsed[0] === "")) {
			return CaretResponses.formatFilesListNoFiles()
		} else {
			return clineIgnoreParsed.join("\n")
		}
	},

	createPrettyPatch: (filename = "file", oldStr?: string, newStr?: string) => {
		// strings cannot be undefined or diff throws exception
		const patch = diff.createPatch(filename.toPosix(), oldStr || "", newStr || "")
		const lines = patch.split("\n")
		const prettyPatchLines = lines.slice(4)
		return prettyPatchLines.join("\n")
	},

	taskResumption: (
		mode: Mode,
		agoText: string,
		cwd: string,
		wasRecent: boolean | 0 | undefined,
		responseText?: string,
		hasPendingFileContextWarnings?: boolean,
	): [string, string] => {
		const taskResumptionMessage = `${
			mode === "plan"
				? CaretResponses.taskResumptionPlanMode(agoText, cwd.toPosix())
				: CaretResponses.taskResumptionActMode(agoText, cwd.toPosix())
		}${wasRecent && !hasPendingFileContextWarnings ? `\n\n${CaretResponses.taskResumptionImportantNote()}` : ""}`

		const userResponseMessage = `${
			responseText
				? `${mode === "plan" ? CaretResponses.taskResumptionNewMessagePlanMode() : CaretResponses.taskResumptionNewMessageActMode()}:\n<user_message>\n${responseText}\n</user_message>`
				: mode === "plan"
					? CaretResponses.taskResumptionNoNewMessagePlanMode()
					: ""
		}`

		return [taskResumptionMessage, userResponseMessage]
	},

	planModeInstructions: () => {
		return CaretResponses.planModeInstructions()
	},

	fileEditWithUserChanges: (
		relPath: string,
		userEdits: string,
		autoFormattingEdits: string | undefined,
		finalContent: string | undefined,
		newProblemsMessage: string | undefined,
	) =>
		CaretResponses.fileEditWithUserChangesUserUpdates(userEdits) +
		(autoFormattingEdits ? CaretResponses.fileEditWithUserChangesAutoFormatting(autoFormattingEdits) : "") +
		CaretResponses.fileEditWithUserChangesSavedContent(relPath.toPosix()) +
		`<final_file_content path="${relPath.toPosix()}">\n${finalContent}\n</final_file_content>\n\n` +
		`Please note:\n` +
		CaretResponses.fileEditWithUserChangesNote1() +
		`\n` +
		CaretResponses.fileEditWithUserChangesNote2() +
		`\n` +
		CaretResponses.fileEditWithUserChangesNote3() +
		`\n` +
		CaretResponses.fileEditWithUserChangesNote4() +
		`${newProblemsMessage}`,

	fileEditWithoutUserChanges: (
		relPath: string,
		autoFormattingEdits: string | undefined,
		finalContent: string | undefined,
		newProblemsMessage: string | undefined,
	) =>
		CaretResponses.fileEditWithoutUserChangesSavedContent(relPath.toPosix()) +
		(autoFormattingEdits ? CaretResponses.fileEditWithoutUserChangesAutoFormatting(autoFormattingEdits) : "") +
		`Here is the full, updated content of the file that was saved:\n\n` +
		`<final_file_content path="${relPath.toPosix()}">\n${finalContent}\n</final_file_content>\n\n` +
		CaretResponses.fileEditWithoutUserChangesImportantNote() +
		`${newProblemsMessage}`,

	diffError: (relPath: string, originalContent: string | undefined) =>
		CaretResponses.diffErrorMessage1() +
		CaretResponses.diffErrorReverted() +
		`<file_content path="${relPath.toPosix()}">\n${originalContent}\n</file_content>\n\n` +
		CaretResponses.diffErrorRetryInstructions(),

	toolAlreadyUsed: (toolName: string) => CaretResponses.toolAlreadyUsed(toolName),

	clineIgnoreInstructions: (content: string) => CaretResponses.clineIgnoreInstructions(content),

	clineRulesGlobalDirectoryInstructions: (globalClineRulesFilePath: string, content: string) =>
		CaretResponses.clineRulesGlobalDirectoryInstructions(globalClineRulesFilePath.toPosix(), content),

	clineRulesLocalDirectoryInstructions: (cwd: string, content: string) =>
		CaretResponses.clineRulesLocalDirectoryInstructions(cwd.toPosix(), content),

	clineRulesLocalFileInstructions: (cwd: string, content: string) =>
		CaretResponses.clineRulesLocalFileInstructions(cwd.toPosix(), content),

	// CARET MODIFICATION: Added caretrules formatter support. Original backed up as responses-ts.cline
	caretRulesLocalFileInstructions: (cwd: string, content: string) =>
		CaretResponses.caretRulesLocalFileInstructions(cwd.toPosix(), content),

	windsurfRulesLocalFileInstructions: (cwd: string, content: string) =>
		CaretResponses.windsurfRulesLocalFileInstructions(cwd.toPosix(), content),

	cursorRulesLocalFileInstructions: (cwd: string, content: string) =>
		CaretResponses.cursorRulesLocalFileInstructions(cwd.toPosix(), content),

	cursorRulesLocalDirectoryInstructions: (cwd: string, content: string) =>
		CaretResponses.cursorRulesLocalDirectoryInstructions(cwd.toPosix(), content),

	fileContextWarning: (editedFiles: string[]): string => {
		const fileCount = editedFiles.length
		const fileVerb = fileCount === 1 ? "file has" : "files have"
		const fileDemonstrativePronoun = fileCount === 1 ? "this file" : "these files"
		const filePersonalPronoun = fileCount === 1 ? "it" : "they"

		return (
			CaretResponses.fileContextWarningAlert(fileCount, fileVerb, fileDemonstrativePronoun, filePersonalPronoun) +
			`${editedFiles.map((file) => ` ${path.resolve(file).toPosix()}`).join("\n")}\n` +
			CaretResponses.fileContextWarningInstructions()
		)
	},
}

// to avoid circular dependency
const formatImagesIntoBlocks = (images?: string[]): Anthropic.ImageBlockParam[] => {
	return images
		? images.map((dataUrl) => {
				// data:image/png;base64,base64string
				const [rest, base64] = dataUrl.split(",")
				const mimeType = rest.split(":")[1].split(";")[0]
				return {
					type: "image",
					source: {
						type: "base64",
						media_type: mimeType,
						data: base64,
					},
				} as Anthropic.ImageBlockParam
			})
		: []
}
