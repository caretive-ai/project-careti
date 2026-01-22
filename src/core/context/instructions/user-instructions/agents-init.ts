// CARETI MODIFICATION: /init 명령어 처리 - 이중 디렉토리 아키텍처 지원
// 새 경로: .agents/workflows/, .users/context/
// 레거시 경로: .agents/context/workflows/, .agents/context-for-user/
import { ContextSeparator } from "@core/context/context-separator"
import { GlobalFileNames } from "@core/storage/disk"
import { fileExistsAtPath, isDirectory } from "@utils/fs"
import fs from "fs/promises"
import path from "path"
import { HostProvider } from "@/hosts/host-provider"
import { Logger } from "@/services/logging/Logger"

const AGENTS_RULES_JSON = "agents-rules.json"
const AGENTS_TEMPLATE_DIR = path.join("assets", "agents_template")
// CARETI MODIFICATION: 새 워크플로우 경로 (레거시: .agents/context/workflows/)
const AGENTS_INIT_WORKFLOW_RELATIVE_PATH = path.join(".agents", "workflows", "agents-init.md")
const AGENTS_INIT_WORKFLOW_LEGACY_PATH = path.join(".agents", "context", "workflows", "agents-init.md")

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

	// AGENTS.md 확인
	const agentsFilePath = path.resolve(cwd, GlobalFileNames.agentsRulesFile)
	const agentsExists = await fileExistsAtPath(agentsFilePath)
	if (!agentsExists) {
		missing.push(GlobalFileNames.agentsRulesFile)
	}

	// .agents/context/ 확인
	const caretRulesDir = path.resolve(cwd, GlobalFileNames.caretRules)
	const caretRulesDirExists = await fileExistsAtPath(caretRulesDir)
	const caretRulesDirOk = caretRulesDirExists && (await isDirectory(caretRulesDir))
	if (!caretRulesDirOk) {
		missing.push(GlobalFileNames.caretRules)
	}

	// .agents/context/agents-rules.json 확인
	const caretRulesJsonPath = path.join(caretRulesDir, AGENTS_RULES_JSON)
	const caretRulesJsonExists = await fileExistsAtPath(caretRulesJsonPath)
	if (!caretRulesJsonExists) {
		missing.push(path.join(GlobalFileNames.caretRules, AGENTS_RULES_JSON))
	}

	// CARETI MODIFICATION: .users/context/ 확인 (새 경로 또는 레거시 폴백)
	const usersContextDir = path.resolve(cwd, GlobalFileNames.usersContextDir)
	const usersContextLegacyDir = path.resolve(cwd, GlobalFileNames.usersContextLegacyDir)
	const usersContextExists =
		((await fileExistsAtPath(usersContextDir)) && (await isDirectory(usersContextDir))) ||
		((await fileExistsAtPath(usersContextLegacyDir)) && (await isDirectory(usersContextLegacyDir)))
	if (!usersContextExists) {
		missing.push(GlobalFileNames.usersContextDir)
	}

	// CARETI MODIFICATION: .agents/workflows/ 확인 (새 경로 또는 레거시 폴백)
	const workflowsDir = path.resolve(cwd, GlobalFileNames.workflows)
	const workflowsLegacyDir = path.resolve(cwd, GlobalFileNames.workflowsLegacy)
	const workflowsExists =
		((await fileExistsAtPath(workflowsDir)) && (await isDirectory(workflowsDir))) ||
		((await fileExistsAtPath(workflowsLegacyDir)) && (await isDirectory(workflowsLegacyDir)))
	if (!workflowsExists) {
		missing.push(GlobalFileNames.workflows)
	}

	return {
		isStandard: missing.length === 0,
		missing,
	}
}

async function copyTemplateDirectory(sourceDir: string, destDir: string, result: AgentsInitResult): Promise<void> {
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
		// CARETI MODIFICATION: context-for-user 디렉토리 생성 (M02)
		await ContextSeparator.createUserContextDirectory(cwd)

		// 기존 템플릿 복사
		await copyTemplateDirectory(templateRoot, cwd, result)
	} catch (error) {
		result.error = `Failed to scaffold agents context: ${error instanceof Error ? error.message : String(error)}`
		Logger.error(`[AgentsInit] ${result.error}`)
	}

	result.created = result.created.map((filePath) => path.relative(cwd, filePath))
	result.skipped = result.skipped.map((filePath) => path.relative(cwd, filePath))

	return result
}

export async function getAgentsInitWorkflowInstructions(cwd: string, templateRoot?: string): Promise<string | undefined> {
	let baseInstructions: string | undefined

	// 새 경로 확인
	const workspacePath = path.join(cwd, AGENTS_INIT_WORKFLOW_RELATIVE_PATH)
	if (await fileExistsAtPath(workspacePath)) {
		baseInstructions = (await fs.readFile(workspacePath, "utf8")).trim()
	}

	// 레거시 경로 폴백
	if (!baseInstructions) {
		const legacyWorkspacePath = path.join(cwd, AGENTS_INIT_WORKFLOW_LEGACY_PATH)
		if (await fileExistsAtPath(legacyWorkspacePath)) {
			Logger.debug(`[AgentsInit] Using legacy workflow path: ${legacyWorkspacePath}`)
			baseInstructions = (await fs.readFile(legacyWorkspacePath, "utf8")).trim()
		}
	}

	// 템플릿에서 로드
	if (!baseInstructions && templateRoot) {
		// 템플릿 새 경로 확인
		const templatePath = path.join(templateRoot, AGENTS_INIT_WORKFLOW_RELATIVE_PATH)
		if (await fileExistsAtPath(templatePath)) {
			baseInstructions = (await fs.readFile(templatePath, "utf8")).trim()
		}

		// 템플릿 레거시 경로 폴백
		if (!baseInstructions) {
			const legacyTemplatePath = path.join(templateRoot, AGENTS_INIT_WORKFLOW_LEGACY_PATH)
			if (await fileExistsAtPath(legacyTemplatePath)) {
				baseInstructions = (await fs.readFile(legacyTemplatePath, "utf8")).trim()
			}
		}
	}

	if (!baseInstructions) {
		return undefined
	}

	// CARETI MODIFICATION: 기존 규칙 파일 및 레거시 구조 감지하여 마이그레이션 안내 추가
	const additionalInstructions: string[] = []

	// 기존 AGENTS.md/CLAUDE.md 감지
	const existingRules = await detectExistingRulesFiles(cwd)
	const existingRulesGuide = formatExistingRulesMigrationGuide(existingRules)
	if (existingRulesGuide) {
		additionalInstructions.push(existingRulesGuide)
	}

	// 레거시 디렉토리 구조 감지
	const legacyStructure = await detectLegacyStructure(cwd)
	const legacyNotice = formatLegacyMigrationNotice(legacyStructure)
	if (legacyNotice) {
		additionalInstructions.push(`## 레거시 디렉토리 구조 발견\n\n${legacyNotice}`)
	}

	// 추가 지시사항이 있으면 base에 병합
	if (additionalInstructions.length > 0) {
		return `${baseInstructions}\n\n---\n\n# 마이그레이션 안내 (자동 감지)\n\n${additionalInstructions.join("\n\n---\n\n")}`
	}

	return baseInstructions
}

export function formatAgentsInitInstructions(instructions?: string): string | undefined {
	if (!instructions) {
		return undefined
	}
	return `<explicit_instructions type="agents_init">
IMPORTANT: You must execute the following initialization workflow NOW. Do not wait for user confirmation.
The template files have been created. Your job is to fill them with actual project data by reading the project files and understanding the codebase.

${instructions}

BEGIN EXECUTION IMMEDIATELY - Start by reading the project files (README.md, package.json, etc.)
</explicit_instructions>
`
}

export function formatAgentsInitNotice(result: AgentsInitResult): string {
	if (result.error) {
		return `AGENTS standard init failed: ${result.error}`
	}
	const created = result.created.length > 0 ? result.created.join(", ") : "(none)"
	const skipped = result.skipped.length > 0 ? result.skipped.join(", ") : "(none)"
	return `AGENTS standard init complete\nCreated: ${created}\nSkipped: ${skipped}`
}

// CARETI MODIFICATION: 기존 AGENTS.md/CLAUDE.md 감지 및 내용 읽기
export type ExistingRulesInfo = {
	hasExisting: boolean
	agentsMdContent?: string
	claudeMdContent?: string
	agentsMdPath?: string
	claudeMdPath?: string
}

/**
 * 기존 AGENTS.md/CLAUDE.md 파일 감지 및 내용 읽기
 */
export async function detectExistingRulesFiles(cwd: string): Promise<ExistingRulesInfo> {
	const result: ExistingRulesInfo = { hasExisting: false }

	// AGENTS.md 확인
	const agentsMdPath = path.resolve(cwd, "AGENTS.md")
	if (await fileExistsAtPath(agentsMdPath)) {
		try {
			const content = await fs.readFile(agentsMdPath, "utf8")
			if (content.trim()) {
				result.agentsMdContent = content.trim()
				result.agentsMdPath = "AGENTS.md"
				result.hasExisting = true
			}
		} catch (error) {
			Logger.warn(`[AgentsInit] Failed to read existing AGENTS.md: ${error}`)
		}
	}

	// CLAUDE.md 확인
	const claudeMdPath = path.resolve(cwd, "CLAUDE.md")
	if (await fileExistsAtPath(claudeMdPath)) {
		try {
			const content = await fs.readFile(claudeMdPath, "utf8")
			if (content.trim()) {
				result.claudeMdContent = content.trim()
				result.claudeMdPath = "CLAUDE.md"
				result.hasExisting = true
			}
		} catch (error) {
			Logger.warn(`[AgentsInit] Failed to read existing CLAUDE.md: ${error}`)
		}
	}

	return result
}

/**
 * 기존 규칙 파일 마이그레이션 안내 포맷
 */
export function formatExistingRulesMigrationGuide(info: ExistingRulesInfo): string | undefined {
	if (!info.hasExisting) {
		return undefined
	}

	let guide = `## 기존 규칙 파일 발견 - 마이그레이션 필요

다음 기존 규칙 파일이 발견되었습니다. 새 이중 디렉토리 구조로 병합해주세요.

### 마이그레이션 작업
1. 기존 규칙을 \`.agents/context/agents-rules.json\`으로 이전 (JSON 형식)
2. 상세 설명은 \`.users/context/agents-rules.md\`로 이전 (Markdown 형식)
3. AGENTS.md/CLAUDE.md는 새 구조를 안내하는 진입점으로 업데이트
4. 중복 내용 제거 및 SoT(agents-rules.json) 통합

`

	if (info.agentsMdContent) {
		guide += `### 기존 AGENTS.md 내용

\`\`\`markdown
${info.agentsMdContent}
\`\`\`

`
	}

	if (info.claudeMdContent && info.claudeMdContent !== info.agentsMdContent) {
		guide += `### 기존 CLAUDE.md 내용

\`\`\`markdown
${info.claudeMdContent}
\`\`\`

`
	}

	guide += `### 권장 새 구조
- \`AGENTS.md\` / \`CLAUDE.md\`: 진입점 (필수 파일 읽기 지시)
- \`.agents/context/agents-rules.json\`: 핵심 규칙 SoT
- \`.users/context/agents-rules.md\`: 사람용 상세 설명
- \`.agents/workflows/\`: 작업별 워크플로우
`

	return guide
}

// CARETI MODIFICATION: 레거시 구조 감지 및 마이그레이션 가이드
export type LegacyStructureInfo = {
	hasLegacy: boolean
	legacyPaths: string[]
	migrationSuggestions: string[]
}

/**
 * 레거시 컨텍스트 구조 감지
 * .caretrules/, .clinerules/, .claude/, .agents/context-for-user/ 등 감지
 */
export async function detectLegacyStructure(cwd: string): Promise<LegacyStructureInfo> {
	const legacyPaths: string[] = []
	const migrationSuggestions: string[] = []

	// 레거시 룰 디렉토리 확인
	// Note: .claude/ is Claude Code standard directory, not legacy
	const legacyRuleDirs = [".caretrules", ".clinerules"]
	for (const dir of legacyRuleDirs) {
		const dirPath = path.resolve(cwd, dir)
		if ((await fileExistsAtPath(dirPath)) && (await isDirectory(dirPath))) {
			legacyPaths.push(dir)
			migrationSuggestions.push(`Migrate ${dir}/ contents to .agents/context/`)
		}
	}

	// 레거시 context-for-user 확인
	const legacyUserContextPath = path.resolve(cwd, ".agents/context-for-user")
	if ((await fileExistsAtPath(legacyUserContextPath)) && (await isDirectory(legacyUserContextPath))) {
		legacyPaths.push(".agents/context-for-user")
		migrationSuggestions.push("Migrate .agents/context-for-user/ to .users/context/")
	}

	// 레거시 workflows 경로 확인
	const legacyWorkflowsPath = path.resolve(cwd, ".agents/context/workflows")
	if ((await fileExistsAtPath(legacyWorkflowsPath)) && (await isDirectory(legacyWorkflowsPath))) {
		legacyPaths.push(".agents/context/workflows")
		migrationSuggestions.push("Migrate .agents/context/workflows/ to .agents/workflows/")
	}

	return {
		hasLegacy: legacyPaths.length > 0,
		legacyPaths,
		migrationSuggestions,
	}
}

/**
 * 레거시 마이그레이션 안내 메시지 포맷
 */
export function formatLegacyMigrationNotice(info: LegacyStructureInfo): string | undefined {
	if (!info.hasLegacy) {
		return undefined
	}

	return `Legacy structure detected:
- Found: ${info.legacyPaths.join(", ")}

Migration suggestions:
${info.migrationSuggestions.map((s) => `  • ${s}`).join("\n")}

Note: Legacy paths are still supported but new paths are recommended.`
}
