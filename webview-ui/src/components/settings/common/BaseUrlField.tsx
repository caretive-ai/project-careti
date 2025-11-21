import { VSCodeCheckbox, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useDebouncedInput } from "../utils/useDebouncedInput"

/**
 * Props for the BaseUrlField component
 */
interface BaseUrlFieldProps {
	initialValue: string | undefined
	onChange: (value: string) => void
	defaultValue?: string
	label?: string
	placeholder?: string
}

/**
 * A reusable component for toggling and entering custom base URLs
 */
export const BaseUrlField = ({ initialValue, onChange, label, placeholder }: BaseUrlFieldProps) => {
	const [isEnabled, setIsEnabled] = useState(!!initialValue)
	const [localValue, setLocalValue] = useDebouncedInput(initialValue || "", onChange)

	const handleToggle = (e: any) => {
		const checked = e.target.checked === true
		setIsEnabled(checked)
		if (!checked) {
			setLocalValue("")
		}
	}

	const finalLabel = label ?? t("settings.baseUrl.label", "Use custom base URL")
	const finalPlaceholder = placeholder ?? t("settings.baseUrl.placeholder", "Default: https://api.example.com")

	return (
		<div>
			<VSCodeCheckbox checked={isEnabled} onChange={handleToggle}>
				{finalLabel}
			</VSCodeCheckbox>

			{isEnabled && (
				<VSCodeTextField
					onInput={(e: any) => setLocalValue(e.target.value.trim())}
					placeholder={finalPlaceholder}
					style={{ width: "100%", marginTop: 3 }}
					type="url"
					value={localValue}
				/>
			)}
		</div>
	)
}
