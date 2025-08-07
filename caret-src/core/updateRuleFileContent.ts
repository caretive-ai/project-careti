// CARET MODIFICATION: Handles updating rule file contents, specifically for persona custom instructions.
import * as fs from "fs"
import * as path from "path"
import { ensureRulesDirectoryExists } from "../../src/core/storage/disk"

export interface UpdateRuleFileContentParams {
	rulePath: string
	content?: string
	isGlobal: boolean
	deleteFile?: boolean
	enabled?: boolean
	cwd: string
}

export async function updateRuleFileContent(
	request: UpdateRuleFileContentParams,
): Promise<{ success: boolean; filePath: string; content?: string }> {
	console.log("[FileService] Received UpdateRuleFileContent request for:", request.rulePath)

	if (
		!request.rulePath ||
		(typeof request.content !== "string" && !request.deleteFile && typeof request.enabled !== "boolean")
	) {
		console.error("[FileService] Invalid request: rulePath and content/deleteFile/enabled are required.")
		throw new Error("Rule path and content/deleteFile/enabled are required.")
	}

	let targetDir: string
	try {
		if (request.isGlobal) {
			targetDir = await ensureRulesDirectoryExists()
		} else {
			// For workspace rules, use the current working directory
			targetDir = path.join(request.cwd, ".clinerules")
			// Ensure the workspace rules directory exists
			if (!fs.existsSync(targetDir)) {
				fs.mkdirSync(targetDir, { recursive: true })
			}
		}
	} catch (error: any) {
		console.error("[FileService] Error determining rules directory:", error)
		throw new Error(`Failed to determine rules directory: ${error.message}`)
	}

	if (!targetDir) {
		console.error("[FileService] Could not determine target directory for rule file.")
		throw new Error("Could not determine target directory.")
	}

	const filePath = path.join(targetDir, request.rulePath)
	console.log(`[FileService] Attempting to update file at: ${filePath}`)

	try {
		if (request.deleteFile) {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath)
				console.log(`[FileService] Successfully deleted file: ${filePath}`)
			} else {
				console.log(`[FileService] File to delete does not exist, skipping: ${filePath}`)
			}
		} else if (typeof request.content === "string") {
			fs.writeFileSync(filePath, request.content, "utf8")
			console.log(`[FileService] Successfully wrote to file: ${filePath}`)
		}

		return {
			filePath: filePath,
			content: request.content,
			success: true,
		}
	} catch (error: any) {
		console.error(`[FileService] Error writing/deleting file ${filePath}: `, error)
		throw new Error(`Failed to write/delete file: ${error.message}`)
	}
}
