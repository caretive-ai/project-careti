import { VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
// CARET MODIFICATION: Use Caret's i18n system instead of react-i18next
import { t } from "@/caret/utils/i18n"
import { useDebouncedInput } from "../utils/useDebouncedInput"

/**
 * Props for the ApiKeyField component
 */
interface ApiKeyFieldProps {
	initialValue: string
	onChange: (value: string) => void
	providerName: string
	signupUrl?: string
	placeholder?: string
	helpText?: string
}

/**
 * A reusable component for API key input fields with standard styling and help text for signing up for key
 */
export const ApiKeyField = ({ initialValue, onChange, providerName, signupUrl, placeholder, helpText }: ApiKeyFieldProps) => {
	// CARET MODIFICATION: Remove react-i18next usage
	const [localValue, setLocalValue] = useDebouncedInput(initialValue, onChange)

	const defaultPlaceholder = t("apiKeyField.placeholder", "settings")
	const getYourKeyText = t("apiKeyField.signupText", "settings", { providerName })

	return (
		<div>
			<VSCodeTextField
				onInput={(e: any) => setLocalValue(e.target.value)}
				placeholder={placeholder ?? defaultPlaceholder}
				required={true}
				style={{ width: "100%" }}
				type="password"
				value={localValue}>
				<span style={{ fontWeight: 500 }}>{`${providerName} API Key`}</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				{helpText || t("apiKeyField.defaultHelpText", "settings")}
				{!localValue && signupUrl && (
					<VSCodeLink
						href={signupUrl}
						style={{
							display: "inline",
							fontSize: "inherit",
						}}>
						{getYourKeyText}
					</VSCodeLink>
				)}
			</p>
		</div>
	)
}
