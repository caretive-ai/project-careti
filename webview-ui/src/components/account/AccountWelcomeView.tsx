import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
// CARETI MODIFICATION: Import persona avatar and context for account welcome
import PersonaAvatar from "@/careti/components/PersonaAvatar"
import { useCaretState } from "@/careti/context/CaretStateContext"
import { t } from "@/careti/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { handleLogin } from "../settings/CaretAuthHandler"

export const AccountWelcomeView = () => {
	// CARETI MODIFICATION: Use persona avatar for account welcome
	const { personaProfile } = useCaretState() // Keep for working profile image
	const { featureConfig } = useExtensionState() // Use for correct feature flag

	const showCaretCta = featureConfig?.enableCaretAccountFeatures ?? true
	const showClineCta = false // Cline 로그인은 Provider 영역에서 처리

	return (
		<div className="flex flex-col items-center pr-3">
			{/* CARETI MODIFICATION: Show persona avatar instead of Cline logo */}
			{personaProfile && <PersonaAvatar isThinking={false} personaProfile={personaProfile} size={64} />}
			<div className="mb-4" />

			{showCaretCta && (
				<>
					<p>{t("account.signUpDescription", "common")}</p>
					<VSCodeButton className="w-full mb-2" onClick={() => handleLogin()}>
						{t("account.signUpWithCaret", "common")}
					</VSCodeButton>
					<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
						{t("account.byContining", "common")}{" "}
						<VSCodeLink href={t("account.termsOfServiceUrl", "common")}>
							{t("account.termsOfService", "common")}
						</VSCodeLink>{" "}
						{t("common.and", "common")}{" "}
						<VSCodeLink href={t("account.privacyPolicyUrl", "common")}>
							{t("account.privacyPolicy", "common")}
						</VSCodeLink>
					</p>
				</>
			)}
		</div>
	)
}
