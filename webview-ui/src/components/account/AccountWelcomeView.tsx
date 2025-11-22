import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
// CARET MODIFICATION: Import persona avatar and context for account welcome
import PersonaAvatar from "@/caret/components/PersonaAvatar"
import { useCaretState } from "@/caret/context/CaretStateContext"
import { t } from "@/caret/utils/i18n"
import { handleLogin } from "../settings/CaretAuthHandler"

export const AccountWelcomeView = () => {
	// CARET MODIFICATION: Use persona avatar for account welcome
	const { personaProfile, featureConfig } = useCaretState()

	const showCaretCta = featureConfig?.enableCaretAccountFeatures ?? true
	const showClineCta = false // Cline 로그인은 Provider 영역에서 처리

	if (!showCaretCta && !showClineCta) {
		return null
	}

	return (
		<div className="flex flex-col items-center pr-3">
			{/* CARET MODIFICATION: Show persona avatar instead of Cline logo */}
			{personaProfile && <PersonaAvatar isThinking={false} personaProfile={personaProfile} size={64} />}
			<div className="mb-4" />

			<p>{t("account.signUpDescription", "common")}</p>

			{showCaretCta && (
				<VSCodeButton className="w-full mb-2" onClick={() => handleLogin()}>
					{t("account.signUpWithCaret", "common")}
				</VSCodeButton>
			)}

			<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
				{t("account.byContining", "common")}{" "}
				<VSCodeLink href={t("account.termsOfServiceUrl", "common")}>{t("account.termsOfService", "common")}</VSCodeLink>{" "}
				{t("common.common.and", "common")}{" "}
				<VSCodeLink href={t("account.privacyPolicyUrl", "common")}>{t("account.privacyPolicy", "common")}</VSCodeLink>
			</p>
		</div>
	)
}
