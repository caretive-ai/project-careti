import { StringRequest } from "@shared/proto/cline/common"
import { UpdateTerminalConnectionTimeoutResponse } from "@shared/proto/index.cline"
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import React, { useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "../../../services/grpc-client"
import Section from "../Section"
import TerminalOutputLineLimitSlider from "../TerminalOutputLineLimitSlider"
import { updateSetting } from "../utils/settingsHandlers"

interface TerminalSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

export const TerminalSettingsSection: React.FC<TerminalSettingsSectionProps> = ({ renderSectionHeader }) => {
	const { shellIntegrationTimeout, terminalReuseEnabled, defaultTerminalProfile, availableTerminalProfiles } =
		useExtensionState()

	const [inputValue, setInputValue] = useState((shellIntegrationTimeout / 1000).toString())
	const [inputError, setInputError] = useState<string | null>(null)

	const handleTimeoutChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		const value = target.value

		setInputValue(value)

		const seconds = parseFloat(value)
		if (Number.isNaN(seconds) || seconds <= 0) {
			setInputError(t("terminal.positiveNumberError", "settings"))
			return
		}

		setInputError(null)
		const timeoutMs = Math.round(seconds * 1000)

		StateServiceClient.updateTerminalConnectionTimeout({ timeoutMs })
			.then((response: UpdateTerminalConnectionTimeoutResponse) => {
				const timeoutMs = response.timeoutMs
				// Backend calls postStateToWebview(), so state will update via subscription
				// Just sync the input value with the confirmed backend value
				if (timeoutMs !== undefined) {
					setInputValue((timeoutMs / 1000).toString())
				}
			})
			.catch((error) => {
				console.error("Failed to update terminal connection timeout:", error)
			})
	}

	const handleInputBlur = () => {
		if (inputError) {
			setInputValue((shellIntegrationTimeout / 1000).toString())
			setInputError(null)
		}
	}

	const handleTerminalReuseChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		const checked = target.checked
		updateSetting("terminalReuseEnabled", checked)
	}

	// Use any to avoid type conflicts between Event and FormEvent
	const handleDefaultTerminalProfileChange = (event: any) => {
		const target = event.target as HTMLSelectElement
		const profileId = target.value

		// Save immediately - the backend will call postStateToWebview() to update our state
		StateServiceClient.updateDefaultTerminalProfile({
			value: profileId || "default",
		} as StringRequest).catch((error) => {
			console.error("Failed to update default terminal profile:", error)
		})
	}

	const profilesToShow = availableTerminalProfiles

	return (
		<div>
			{renderSectionHeader("terminal")}
			<Section>
				<div className="mb-5" id="terminal-settings-section">
					<div className="mb-4">
						<label className="font-medium block mb-1" htmlFor="default-terminal-profile">
							{t("terminal.defaultProfile", "settings")}
						</label>
						<VSCodeDropdown
							className="w-full"
							id="default-terminal-profile"
							onChange={handleDefaultTerminalProfileChange}
							value={defaultTerminalProfile || "default"}>
							{profilesToShow.map((profile) => (
								<VSCodeOption key={profile.id} title={profile.description} value={profile.id}>
									{profile.name}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
						<p className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
							{t("terminal.defaultProfileDescription", "settings")}
						</p>
					</div>

					<div className="mb-4">
						<div className="mb-2">
							<label className="font-medium block mb-1">{t("terminal.shellTimeout", "settings")}</label>
							<div className="flex items-center">
								<VSCodeTextField
									className="w-full"
									onBlur={handleInputBlur}
									onChange={(event) => handleTimeoutChange(event as Event)}
									placeholder={t("terminal.timeoutPlaceholder", "settings")}
									value={inputValue}
								/>
							</div>
							{inputError && <div className="text-[var(--vscode-errorForeground)] text-xs mt-1">{inputError}</div>}
						</div>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							{t("terminal.shellTimeoutDescription", "settings")}
						</p>
					</div>

					<div className="mb-4">
						<div className="flex items-center mb-2">
							<VSCodeCheckbox
								checked={terminalReuseEnabled ?? true}
								onChange={(event) => handleTerminalReuseChange(event as Event)}>
								{t("terminal.aggressiveReuse", "settings")}
							</VSCodeCheckbox>
						</div>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							{t("terminal.aggressiveReuseDescription", "settings")}
						</p>
					</div>
					<TerminalOutputLineLimitSlider />
					<div className="mt-5 p-3 bg-[var(--vscode-textBlockQuote-background)] rounded border border-[var(--vscode-textBlockQuote-border)]">
						<p className="text-[13px] m-0">
							<strong>{t("terminal.issuesTitle", "settings")}</strong> {t("terminal.checkOur", "settings")}{" "}
							<a
								className="text-[var(--vscode-textLink-foreground)] underline hover:no-underline"
								href="https://docs.cline.bot/troubleshooting/terminal-quick-fixes"
								rel="noopener noreferrer"
								target="_blank">
								{t("terminal.quickFixesLink", "settings")}
							</a>{" "}
							{t("terminal.orThe", "settings")}{" "}
							<a
								className="text-[var(--vscode-textLink-foreground)] underline hover:no-underline"
								href="https://docs.cline.bot/troubleshooting/terminal-integration-guide"
								rel="noopener noreferrer"
								target="_blank">
								{t("terminal.troubleshootingGuideLink", "settings")}
							</a>
							.
						</p>
					</div>
				</div>
			</Section>
		</div>
	)
}

export default TerminalSettingsSection
