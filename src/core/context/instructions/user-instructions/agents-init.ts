import { GlobalFileNames } from "@core/storage/disk"
import { fileExistsAtPath, isDirectory } from "@utils/fs"
import fs from "fs/promises"
import path from "path"
import { HostProvider } from "@/hosts/host-provider"
import { Logger } from "@/services/logging/Logger"

const CARET_RULES_JSON = "caret-rules.json"
const AGENTS_TEMPLATE_DIR = path.join("assets", "agents_template")
const AGENTS_INIT_WORKFLOW_RELATIVE_PATH = path.join(".agents", "context", "workflows", "agents-init.md")

export type AgentsStandardStatus = {
	isStandard: boolean
	missing: string[]
}

export type AgentsInitResult = {
	created: string[]
	skipped: string[]
	templatePath?: string
	error?: string
}

const getTemplateRoot = (): string => {
	if (HostProvider.isInitialized()) {
		return path.join(HostProvider.get().extensionFsPath, AGENTS_TEMPLATE_DIR)
	}
	return path.resolve(process.cwd(), AGENTS_TEMPLATE_DIR)
}

export async function getAgentsStandardStatus(cwd: string): Promise<AgentsStandardStatus> {
	const missing: string[] = []
	const agentsFilePath = path.resolve(cwd, GlobalFileNames.agentsRulesFile)
	const caretRulesDir = path.resolve(cwd, GlobalFileNames.caretRules)
	const caretRulesJsonPath = path.join(caretRulesDir, CARET_RULES_JSON)

	const agentsExists = await fileExistsAtPath(agentsFilePath)
	if (!agentsExists) {
		missing.push(GlobalFileNames.agentsRulesFile)
	}

	const caretRulesDirExists = await fileExistsAtPath(caretRulesDir)
	const caretRulesDirOk = caretRulesDirExists && (await isDirectory(caretRulesDir))
	if (!caretRulesDirOk) {
		missing.push(GlobalFileNames.caretRules)
	}

	const caretRulesJsonExists = await fileExistsAtPath(caretRulesJsonPath)
	if (!caretRulesJsonExists) {
		missing.push(path.join(GlobalFileNames.caretRules, CARET_RULES_JSON))
	}

	return {
		isStandard: missing.length === 0,
		missing,
	}
}

async function copyTemplateDirectory(
	sourceDir: string,
	destDir: string,
	result: AgentsInitResult,
): Promise<void> {
	const entries = await fs.readdir(sourceDir, { withFileTypes: true })

	for (const entry of entries) {
		const sourcePath = path.join(sourceDir, entry.name)
		const destPath = path.join(destDir, entry.name)

		if (entry.isDirectory()) {
			await fs.mkdir(destPath, { recursive: true })
			await copyTemplateDirectory(sourcePath, destPath, result)
			continue
		}

		if (!entry.isFile()) {
			continue
		}

		if (await fileExistsAtPath(destPath)) {
			result.skipped.push(destPath)
			continue
		}

		await fs.mkdir(path.dirname(destPath), { recursive: true })
		await fs.copyFile(sourcePath, destPath)
		result.created.push(destPath)
	}
}

export async function initializeAgentsContext(cwd: string): Promise<AgentsInitResult> {
	const result: AgentsInitResult = {
		created: [],
		skipped: [],
		templatePath: undefined,
		error: undefined,
	}

	const templateRoot = getTemplateRoot()
	result.templatePath = templateRoot

	if (!(await fileExistsAtPath(templateRoot)) || !(await isDirectory(templateRoot))) {
		result.error = `Missing template directory: ${templateRoot}`
		Logger.error(`[AgentsInit] ${result.error}`)
		return result
	}

	try {
		await copyTemplateDirectory(templateRoot, cwd, result)
	} catch (error) {
		result.error = `Failed to scaffold agents context: ${error instanceof Error ? error.message : String(error)}`
		Logger.error(`[AgentsInit] ${result.error}`)
	}

	result.created = result.created.map((filePath) => path.relative(cwd, filePath))
	result.skipped = result.skipped.map((filePath) => path.relative(cwd, filePath))

	return result
}

export async function getAgentsInitWorkflowInstructions(
	cwd: string,
	templateRoot?: string,
): Promise<string | undefined> {
	const workspacePath = path.join(cwd, AGENTS_INIT_WORKFLOW_RELATIVE_PATH)
	if (await fileExistsAtPath(workspacePath)) {
		return (await fs.readFile(workspacePath, "utf8")).trim()
	}

	if (templateRoot) {
		const templatePath = path.join(templateRoot, AGENTS_INIT_WORKFLOW_RELATIVE_PATH)
		if (await fileExistsAtPath(templatePath)) {
			return (await fs.readFile(templatePath, "utf8")).trim()
		}
	}

	return undefined
}

export function formatAgentsInitInstructions(instructions?: string): string | undefined {
	if (!instructions) {
		return undefined
	}
	return `<explicit_instructions type="agents_init">\n${instructions}\n</explicit_instructions>\n`
}

export function formatAgentsInitNotice(result: AgentsInitResult): string {
	if (result.error) {
		return `AGENTS standard init failed: ${result.error}`
	}
	const created = result.created.length > 0 ? result.created.join(", ") : "(none)"
	const skipped = result.skipped.length > 0 ? result.skipped.join(", ") : "(none)"
	return `AGENTS standard init complete\nCreated: ${created}\nSkipped: ${skipped}`
}
