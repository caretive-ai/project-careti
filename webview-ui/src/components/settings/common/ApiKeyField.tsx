import { VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useTranslation } from "react-i18next"
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
	const { t } = useTranslation()
	const [localValue, setLocalValue] = useDebouncedInput(initialValue, onChange)

	const defaultPlaceholder = t("settings.apiKey.placeholder", "Enter API Key...")
	const an = /^[aeiou]/i.test(providerName)
	const getYourKeyText = an
		? t("settings.apiKey.getYourKeyAn", "You can get an {{providerName}} API key by signing up here.", {
				providerName,
			})
		: t("settings.apiKey.getYourKeyA", "You can get a {{providerName}} API key by signing up here.", {
				providerName,
			})

	return (
		<div>
			<VSCodeTextField
				onInput={(e: any) => setLocalValue(e.target.value)}
				placeholder={placeholder ?? defaultPlaceholder}
				required={true}
				style={{ width: "100%" }}
				type="password"
				value={localValue}>
				<span style={{ fontWeight: 500 }}>
					{t("settings.apiKey.label", "{{providerName}} API Key", { providerName })}
				</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				{helpText ||
					t(
						"settings.apiKey.helpText",
						"This key is stored locally and only used to make API requests from this extension.",
					)}
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
