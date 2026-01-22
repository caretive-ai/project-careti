import type { ApiProviderInfo } from "@core/api"
import {
	formatAgentsInitInstructions,
	formatAgentsInitNotice,
	getAgentsInitWorkflowInstructions,
	initializeAgentsContext,
} from "@core/context/instructions/user-instructions/agents-init"
import { ClineRulesToggles } from "@shared/cline-rules"
import fs from "fs/promises"
import { telemetryService } from "@/services/telemetry"
import { isNativeToolCallingConfig } from "@/utils/model-utils"
import {
	condenseToolResponse,
	deepPlanningToolResponse,
	newRuleToolResponse,
	newTaskToolResponse,
	reportBugToolResponse,
	subagentToolResponse,
} from "../prompts/commands"
import { StateManager } from "../storage/StateManager"

type FileBasedWorkflow = {
	fullPath: string
	fileName: string
	isRemote: false
}

type RemoteWorkflow = {
	fullPath: string
	fileName: string
	isRemote: true
	contents: string
}

type Workflow = FileBasedWorkflow | RemoteWorkflow

/**
 * Processes text for slash commands and transforms them with appropriate instructions
 * This is called after parseMentions() to process any slash commands in the user's message
 */
export async function parseSlashCommands(
	text: string,
	localWorkflowToggles: ClineRulesToggles,
	globalWorkflowToggles: ClineRulesToggles,
	ulid: string,
	focusChainSettings?: { enabled: boolean },
	enableNativeToolCalls?: boolean,
	providerInfo?: ApiProviderInfo,
	cwd?: string,
): Promise<{ processedText: string; needsClinerulesFileCheck: boolean }> {
	const SUPPORTED_DEFAULT_COMMANDS = [
		"init",
		"newtask",
		"smol",
		"compact",
		"newrule",
		"reportbug",
		"deep-planning",
		"subagent",
	]

	// Determine if the current provider/model/setting actually uses native tool calling
	const willUseNativeTools = providerInfo ? isNativeToolCallingConfig(providerInfo, enableNativeToolCalls || false) : false

	// CARETI MODIFICATION: 슬래시 커맨드 매핑은 lazy 평가로 구성(테스트/런타임에서 deep-planning 프롬프트 생성 부작용 방지)
	const commandReplacements: Record<string, () => string> = {
		newtask: () => newTaskToolResponse(willUseNativeTools),
		smol: () => condenseToolResponse(focusChainSettings),
		compact: () => condenseToolResponse(focusChainSettings),
		newrule: () => newRuleToolResponse(),
		reportbug: () => reportBugToolResponse(),
		"deep-planning": () => deepPlanningToolResponse(focusChainSettings, providerInfo),
		subagent: () => subagentToolResponse(),
	}

	// Regex patterns to extract content from different XML tags
	const tagPatterns = [
		{ tag: "task", regex: /<task>([\s\S]*?)<\/task>/i },
		{ tag: "feedback", regex: /<feedback>([\s\S]*?)<\/feedback>/i },
		{ tag: "answer", regex: /<answer>([\s\S]*?)<\/answer>/i },
		{ tag: "user_message", regex: /<user_message>([\s\S]*?)<\/user_message>/i },
	]

	// Regex to find slash commands anywhere in text (not just at the beginning).
	// Must be preceded by whitespace or start-of-string to avoid matching URLs/paths.
	// Only the FIRST slash command per message is processed.
	const slashCommandInTextRegex = /(^|\s)\/([a-zA-Z0-9_.-]+)(?=\s|$)/

	// Helper to remove the matched slash command from the full original text
	const removeSlashCommand = (fullText: string, contentStartIndex: number, slashMatch: RegExpExecArray): string => {
		const slashPositionInContent = slashMatch.index + slashMatch[1].length
		const slashPositionInFullText = contentStartIndex + slashPositionInContent
		const commandText = "/" + slashMatch[2]
		const commandEndPosition = slashPositionInFullText + commandText.length
		return fullText.substring(0, slashPositionInFullText) + fullText.substring(commandEndPosition)
	}

	// if we find a valid match, we will return inside that block
	for (const { regex } of tagPatterns) {
		const regexObj = new RegExp(regex.source, regex.flags)
		const tagMatch = regexObj.exec(text)

		if (tagMatch) {
			const tagContent = tagMatch[1]
			const tagStartIndex = tagMatch.index
			const contentStartIndex = text.indexOf(tagContent, tagStartIndex)

			const slashMatch = slashCommandInTextRegex.exec(tagContent)
			if (!slashMatch) {
				continue
			}

			const commandName = slashMatch[2] // casing matters

			// we give preference to the default commands if the user has a file with the same name
			if (SUPPORTED_DEFAULT_COMMANDS.includes(commandName)) {
				if (commandName === "init") {
					const workspaceRoot = cwd ?? process.cwd()
					const initResult = await initializeAgentsContext(workspaceRoot)
					const initInstructions = await getAgentsInitWorkflowInstructions(workspaceRoot, initResult.templatePath)
					const initBlock = formatAgentsInitInstructions(initInstructions) ?? ""
					const textWithoutSlashCommand = removeSlashCommand(text, contentStartIndex, slashMatch)
					const processedText = `[init] ${formatAgentsInitNotice(initResult)}\n` + initBlock + textWithoutSlashCommand

					telemetryService.captureSlashCommandUsed(ulid, commandName, "builtin")

					return { processedText, needsClinerulesFileCheck: false }
				}

				// remove the slash command and add custom instructions at the top of this message
				const textWithoutSlashCommand = removeSlashCommand(text, contentStartIndex, slashMatch)
				const processedText = commandReplacements[commandName]() + textWithoutSlashCommand

				// Track telemetry for builtin slash command usage
				telemetryService.captureSlashCommandUsed(ulid, commandName, "builtin")

				return { processedText: processedText, needsClinerulesFileCheck: commandName === "newrule" }
			}

			const globalWorkflows: Workflow[] = Object.entries(globalWorkflowToggles)
				.filter(([_, enabled]) => enabled)
				.map(([filePath, _]) => ({
					fullPath: filePath,
					fileName: filePath.replace(/^.*[/\\]/, ""),
					isRemote: false,
				}))

			const localWorkflows: Workflow[] = Object.entries(localWorkflowToggles)
				.filter(([_, enabled]) => enabled)
				.map(([filePath, _]) => ({
					fullPath: filePath,
					fileName: filePath.replace(/^.*[/\\]/, ""),
					isRemote: false,
				}))

			// Get remote workflows from remote config
			const stateManager = StateManager.get()
			const remoteConfigSettings = stateManager.getRemoteConfigSettings()
			const remoteWorkflows = remoteConfigSettings.remoteGlobalWorkflows || []
			const remoteWorkflowToggles = stateManager.getGlobalStateKey("remoteWorkflowToggles") || {}

			const enabledRemoteWorkflows: Workflow[] = remoteWorkflows
				.filter((workflow) => {
					// If alwaysEnabled, always include; otherwise check toggle
					return workflow.alwaysEnabled || remoteWorkflowToggles[workflow.name] !== false
				})
				.map((workflow) => ({
					fullPath: "",
					fileName: workflow.name,
					isRemote: true,
					contents: workflow.contents,
				}))

			// local workflows have precedence over global workflows, which have precedence over remote workflows
			const enabledWorkflows: Workflow[] = [...localWorkflows, ...globalWorkflows, ...enabledRemoteWorkflows]

			// Then check if the command matches any enabled workflow filename
			const matchingWorkflow = enabledWorkflows.find((workflow) => workflow.fileName === commandName)

			if (matchingWorkflow) {
				try {
					// Get workflow content - either from file or from remote config
					let workflowContent: string
					if (matchingWorkflow.isRemote) {
						workflowContent = matchingWorkflow.contents.trim()
					} else {
						workflowContent = (await fs.readFile(matchingWorkflow.fullPath, "utf8")).trim()
					}

					// remove the slash command and add custom instructions at the top of this message
					const textWithoutSlashCommand = removeSlashCommand(text, contentStartIndex, slashMatch)
					const processedText =
						`<explicit_instructions type="${matchingWorkflow.fileName}">\n${workflowContent}\n</explicit_instructions>\n` +
						textWithoutSlashCommand

					// Track telemetry for workflow command usage
					telemetryService.captureSlashCommandUsed(ulid, commandName, "workflow")

					return { processedText, needsClinerulesFileCheck: false }
				} catch (error) {
					console.error(`Error reading workflow file ${matchingWorkflow.fullPath}: ${error}`)
				}
			}
		}
	}

	// if no supported commands are found, return the original text
	return { processedText: text, needsClinerulesFileCheck: false }
}
