import { JsonTemplateLoader } from "./JsonTemplateLoader"
import { LOCK_TEXT_SYMBOL } from "../../../src/core/ignore/ClineIgnoreController" // LOCK_TEXT_SYMBOL 임포트

export class CaretResponses {
    private static loader: JsonTemplateLoader | null = null
    private static responses: Record<string, string> = {}

    /**
     * Initialize the responses loader
     */
    static async initialize(extensionPath: string): Promise<void> {
        if (!this.loader) {
            this.loader = new JsonTemplateLoader(extensionPath)
            await this.loadResponses()
        }
    }

    /**
     * Load responses from RESPONSES.json
     */
    private static async loadResponses(): Promise<void> {
        if (!this.loader) {
            throw new Error("CaretResponses not initialized")
        }

        try {
            // Load RESPONSES.json directly
            const fs = require('fs').promises
            const path = require('path')
            const responsesPath = path.join(this.loader.getTemplateDirectory(), "RESPONSES.json")
            const content = await fs.readFile(responsesPath, 'utf-8')
            this.responses = JSON.parse(content)
        } catch (error) {
            console.error("Failed to load responses:", error)
            // Fallback to empty responses
            this.responses = {}
        }
    }

    /**
     * Get response with parameter substitution
     */
    private static getResponse(key: string, params: Record<string, string> = {}): string {
        let response = this.responses[key] || `[Missing response: ${key}]`
        
        // Simple parameter substitution
        for (const [paramKey, paramValue] of Object.entries(params)) {
            response = response.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), paramValue)
        }
        
        return response
    }

    static duplicateFileReadNotice(): string {
        return this.getResponse("duplicateFileReadNotice")
    }

    static contextTruncationNotice(): string {
        return this.getResponse("contextTruncationNotice")
    }

    static condense(): string {
        return this.getResponse("condense")
    }

    static toolDenied(): string {
        return this.getResponse("toolDenied")
    }

    static toolError(error?: string): string {
        return this.getResponse("toolError", { error: error || "" })
    }

    static clineIgnoreError(path: string): string {
        return this.getResponse("clineIgnoreError", { path })
    }

    static noToolsUsed(): string {
        return this.getResponse("noToolsUsed", { 
            toolUseInstructionsReminder: CaretResponses.toolUseInstructionsReminder() 
        })
    }

    static tooManyMistakes(feedback?: string): string {
        return this.getResponse("tooManyMistakes", { feedback: feedback || "" })
    }

    static autoApprovalMaxReached(feedback?: string): string {
        return this.getResponse("autoApprovalMaxReached", { feedback: feedback || "" })
    }

    static missingToolParameterError(paramName: string): string {
        return this.getResponse("missingToolParameterError", { paramName })
    }

    static invalidMcpToolArgumentError(serverName: string, toolName: string): string {
        return this.getResponse("invalidMcpToolArgumentError", { serverName, toolName })
    }

    // formatFilesList 관련 문자열
    static formatFilesListTruncated(): string {
        return this.getResponse("formatFilesList_truncated")
    }

    static formatFilesListNoFiles(): string {
        return this.getResponse("formatFilesList_noFiles")
    }

    // taskResumption 관련 문자열
    static taskResumptionPlanMode(agoText: string, cwd: string): string {
        return this.getResponse("taskResumption_planMode", { agoText, cwd })
    }

    static taskResumptionActMode(agoText: string, cwd: string): string {
        return this.getResponse("taskResumption_actMode", { agoText, cwd })
    }

    static taskResumptionImportantNote(): string {
        return this.getResponse("taskResumption_importantNote")
    }

    static taskResumptionNewMessagePlanMode(): string {
        return this.getResponse("taskResumption_newMessagePlanMode")
    }

    static taskResumptionNewMessageActMode(): string {
        return this.getResponse("taskResumption_newMessageActMode")
    }

    static taskResumptionNoNewMessagePlanMode(): string {
        return this.getResponse("taskResumption_noNewMessagePlanMode")
    }

    static planModeInstructions(): string {
        return this.getResponse("planModeInstructions")
    }

    // fileEditWithUserChanges 관련 문자열
    static fileEditWithUserChangesUserUpdates(userEdits: string): string {
        return this.getResponse("fileEditWithUserChanges_userUpdates", { userEdits })
    }

    static fileEditWithUserChangesAutoFormatting(autoFormattingEdits: string): string {
        return this.getResponse("fileEditWithUserChanges_autoFormatting", { autoFormattingEdits })
    }

    static fileEditWithUserChangesSavedContent(relPath: string): string {
        return this.getResponse("fileEditWithUserChanges_savedContent", { relPath })
    }

    static fileEditWithUserChangesNote1(): string {
        return this.getResponse("fileEditWithUserChanges_note1")
    }
    static fileEditWithUserChangesNote2(): string {
        return this.getResponse("fileEditWithUserChanges_note2")
    }
    static fileEditWithUserChangesNote3(): string {
        return this.getResponse("fileEditWithUserChanges_note3")
    }
    static fileEditWithUserChangesNote4(): string {
        return this.getResponse("fileEditWithUserChanges_note4")
    }

    // fileEditWithoutUserChanges 관련 문자열
    static fileEditWithoutUserChangesSavedContent(relPath: string): string {
        return this.getResponse("fileEditWithoutUserChanges_savedContent", { relPath })
    }

    static fileEditWithoutUserChangesAutoFormatting(autoFormattingEdits: string): string {
        return this.getResponse("fileEditWithoutUserChanges_autoFormatting", { autoFormattingEdits })
    }

    static fileEditWithoutUserChangesImportantNote(): string {
        return this.getResponse("fileEditWithoutUserChanges_importantNote")
    }

    // diffError 관련 문자열
    static diffErrorMessage1(): string {
        return this.getResponse("diffError_message1")
    }

    static diffErrorReverted(): string {
        return this.getResponse("diffError_reverted")
    }

    static diffErrorRetryInstructions(): string {
        return this.getResponse("diffError_retryInstructions")
    }

    static toolAlreadyUsed(toolName: string): string {
        return this.getResponse("toolAlreadyUsed", { toolName })
    }

    // Instructions 관련 문자열 (동적 콘텐츠 포함)
    static clineIgnoreInstructions(content: string): string {
        return this.getResponse("clineIgnoreInstructions", { content, LOCK_TEXT_SYMBOL })
    }

    static clineRulesGlobalDirectoryInstructions(globalClineRulesFilePath: string, content: string): string {
        return this.getResponse("clineRulesGlobalDirectoryInstructions", { globalClineRulesFilePath, content })
    }

    static clineRulesLocalDirectoryInstructions(cwd: string, content: string): string {
        return this.getResponse("clineRulesLocalDirectoryInstructions", { cwd, content })
    }

    static clineRulesLocalFileInstructions(cwd: string, content: string): string {
        return this.getResponse("clineRulesLocalFileInstructions", { cwd, content })
    }

    static caretRulesLocalFileInstructions(cwd: string, content: string): string {
        return this.getResponse("caretRulesLocalFileInstructions", { cwd, content })
    }

    static windsurfRulesLocalFileInstructions(cwd: string, content: string): string {
        return this.getResponse("windsurfRulesLocalFileInstructions", { cwd, content })
    }

    static cursorRulesLocalFileInstructions(cwd: string, content: string): string {
        return this.getResponse("cursorRulesLocalFileInstructions", { cwd, content })
    }

    static cursorRulesLocalDirectoryInstructions(cwd: string, content: string): string {
        return this.getResponse("cursorRulesLocalDirectoryInstructions", { cwd, content })
    }

    // fileContextWarning 관련 문자열
    static fileContextWarningAlert(fileCount: number, fileVerb: string, fileDemonstrativePronoun: string, filePersonalPronoun: string): string {
        return this.getResponse("fileContextWarning_alert", { 
            fileCount: fileCount.toString(), 
            fileVerb, 
            fileDemonstrativePronoun, 
            filePersonalPronoun 
        })
    }

    static fileContextWarningInstructions(): string {
        return this.getResponse("fileContextWarning_instructions")
    }

    static toolUseInstructionsReminder(): string {
        return this.getResponse("toolUseInstructionsReminder")
    }
}
