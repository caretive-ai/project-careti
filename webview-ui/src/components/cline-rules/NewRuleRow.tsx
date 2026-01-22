// CARETI MODIFICATION: New rule/hook creation row component
// Updated to support hooks from cline-latest with Careti standards
import { CreateHookRequest, RuleFileRequest } from "@shared/proto/index.cline"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useClickAway } from "react-use"
import { t } from "@/careti/utils/i18n"
import { FileServiceClient } from "@/services/grpc-client"

interface NewRuleRowProps {
	isGlobal: boolean
	ruleType?: string
	existingHooks?: string[]
	workspaceName?: string
}

// CARETI MODIFICATION: Hook types for hooks tab
const HOOK_TYPES = [
	{ name: "TaskStart", description: "Executes when a new task begins" },
	{ name: "TaskResume", description: "Executes when a task is resumed" },
	{ name: "TaskCancel", description: "Executes when a task is cancelled" },
	{ name: "TaskComplete", description: "Executes when a task completes" },
	{ name: "PreToolUse", description: "Executes before any tool is used" },
	{ name: "PostToolUse", description: "Executes after any tool is used" },
	{ name: "UserPromptSubmit", description: "Executes when user submits a prompt" },
	{ name: "PreCompact", description: "Executes before conversation compaction" },
]

const NewRuleRow: React.FC<NewRuleRowProps> = ({ isGlobal, ruleType, existingHooks = [], workspaceName }) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const [filename, setFilename] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)
	const [error, setError] = useState<string | null>(null)

	const componentRef = useRef<HTMLDivElement>(null)

	// Calculate available hook types by filtering out existing hooks
	const availableHookTypes = useMemo(() => HOOK_TYPES.filter((type) => !existingHooks.includes(type.name)), [existingHooks])

	// Focus the input when expanded
	useEffect(() => {
		if (isExpanded && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isExpanded])

	useClickAway(componentRef, () => {
		if (isExpanded) {
			setIsExpanded(false)
			setFilename("")
			setError(null)
		}
	})

	const getExtension = (filename: string): string => {
		if (filename.startsWith(".") && !filename.includes(".", 1)) {
			return ""
		}
		const match = filename.match(/\.[^.]+$/)
		return match ? match[0].toLowerCase() : ""
	}

	const isValidExtension = (ext: string): boolean => {
		return ext === "" || ext === ".md" || ext === ".txt"
	}

	// CARETI MODIFICATION: Handler for creating hooks
	const handleCreateHook = async (hookName: string) => {
		if (!hookName) return

		try {
			await FileServiceClient.createHook(
				CreateHookRequest.create({
					hookName,
					isGlobal,
					workspaceName,
				}),
			)
		} catch (err) {
			console.error("Error creating hook:", err)
		}
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (filename.trim()) {
			const trimmedFilename = filename.trim()
			const extension = getExtension(trimmedFilename)

			if (!isValidExtension(extension)) {
				setError(t("newRuleRow.invalidExtensionError", "chat"))
				return
			}

			let finalFilename = trimmedFilename
			if (extension === "") {
				finalFilename = `${trimmedFilename}.md`
			}

			try {
				await FileServiceClient.createRuleFile(
					RuleFileRequest.create({
						isGlobal,
						filename: finalFilename,
						type: ruleType || "cline",
					}),
				)
			} catch (err) {
				console.error("Error creating rule file:", err)
			}

			setFilename("")
			setError(null)
			setIsExpanded(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setIsExpanded(false)
			setFilename("")
		}
	}

	return (
		<div
			className={`mb-2.5 transition-all duration-300 ease-in-out ${isExpanded ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
			onClick={() => !isExpanded && ruleType !== "hook" && setIsExpanded(true)}
			ref={componentRef}>
			<div
				className={`flex items-center p-2 rounded bg-[var(--vscode-input-background)] transition-all duration-300 ease-in-out h-[18px] ${
					isExpanded ? "shadow-sm" : ""
				}`}>
				{/* CARETI MODIFICATION: Hook type dropdown for hooks tab */}
				{ruleType === "hook" ? (
					<>
						<label className="sr-only" htmlFor="hook-type-select">
							Select hook type to create
						</label>
						<span className="sr-only" id="hook-select-description">
							Choose a hook type to create. Hooks execute at specific points in Careti's lifecycle. Available:{" "}
							{availableHookTypes.map((h) => h.name).join(", ")}
						</span>
						<select
							aria-describedby="hook-select-description"
							aria-label="Select hook type to create"
							className="flex-1 bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border-0 outline-0 rounded focus:outline-none focus:ring-0 focus:border-transparent px-2 cursor-pointer"
							disabled={availableHookTypes.length === 0}
							id="hook-type-select"
							onChange={(e) => {
								if (e.target.value) {
									handleCreateHook(e.target.value)
									// Reset selection after creating
									e.target.value = ""
								}
							}}
							style={{
								fontStyle: "italic",
								appearance: "none",
								backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cccccc' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
								backgroundRepeat: "no-repeat",
								backgroundPosition: "right 8px center",
								paddingRight: "24px",
							}}
							value="">
							<option disabled value="">
								{availableHookTypes.length === 0 ? "All hooks created" : "New hook..."}
							</option>
							{availableHookTypes.map((hook) => (
								<option key={hook.name} title={hook.description} value={hook.name}>
									{hook.name}
								</option>
							))}
						</select>
					</>
				) : isExpanded ? (
					<form className="flex flex-1 items-center" onSubmit={handleSubmit}>
						<input
							className="flex-1 bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border-0 outline-0 rounded focus:outline-none focus:ring-0 focus:border-transparent"
							onChange={(e) => setFilename(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={
								ruleType === "workflow"
									? t("newRuleRow.workflowPlaceholder", "chat")
									: t("newRuleRow.rulePlaceholder", "chat")
							}
							ref={inputRef}
							style={{
								outline: "none",
							}}
							type="text"
							value={filename}
						/>

						<div className="flex items-center ml-2 space-x-2">
							<VSCodeButton
								appearance="icon"
								aria-label={t("newRuleRow.createRuleFile", "chat")}
								style={{ padding: "0px" }}
								title={t("newRuleRow.createRuleFile", "chat")}
								type="submit">
								<span className="codicon codicon-add text-[14px]" />
							</VSCodeButton>
						</div>
					</form>
				) : (
					<>
						<span className="flex-1 text-[var(--vscode-descriptionForeground)] bg-[var(--vscode-input-background)] italic text-xs">
							{ruleType === "workflow"
								? t("newRuleRow.newWorkflowFile", "chat")
								: t("newRuleRow.newRuleFile", "chat")}
						</span>
						<div className="flex items-center ml-2 space-x-2">
							<VSCodeButton
								appearance="icon"
								aria-label={ruleType === "workflow" ? "New workflow file..." : "New rule file..."}
								onClick={(e) => {
									e.stopPropagation()
									setIsExpanded(true)
								}}
								style={{ padding: "0px" }}
								title={t("newRuleRow.newRuleFile", "chat")}>
								<span className="codicon codicon-add text-[14px]" />
							</VSCodeButton>
						</div>
					</>
				)}
			</div>
			{isExpanded && error && <div className="text-[var(--vscode-errorForeground)] text-xs mt-1 ml-2">{error}</div>}
		</div>
	)
}

export default NewRuleRow
