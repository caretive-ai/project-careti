import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import { handleSignIn } from "@/context/ClineAuthContext"
import ClineLogoWhite from "../../assets/ClineLogoWhite"

export const AccountWelcomeView = () => (
	<div className="flex flex-col items-center pr-3">
		<ClineLogoWhite className="size-16 mb-4" />

		<p>{t("account.signUpDescription", "common")}</p>

		<VSCodeButton className="w-full mb-4" onClick={() => handleSignIn()}>
			{t("account.signUpWithCaret", "common")}
		</VSCodeButton>

		<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
			{t("account.byContining", "common")}{" "}
			<VSCodeLink href={t("account.termsOfServiceUrl", "common")}>{t("account.termsOfService", "common")}</VSCodeLink>{" "}
			{t("common.common.and", "common")}{" "}
			<VSCodeLink href={t("account.privacyPolicyUrl", "common")}>{t("account.privacyPolicy", "common")}</VSCodeLink>
		</p>
	</div>
)
