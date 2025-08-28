// CARET MODIFICATION: AlertDialog wrapper with i18n support
// This component wraps the original AlertDialog components and adds internationalization
import React from "react"
import { useCaretI18n } from "../hooks/useCaretI18n"
import { t } from "../utils/i18n"

// Import the original AlertDialog components
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
	UnsavedChangesDialog as OriginalUnsavedChangesDialog,
} from "@/components/common/AlertDialog"

// Export the non-text components as-is
export {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
}

// CARET MODIFICATION: i18n-enabled UnsavedChangesDialog wrapper
interface UnsavedChangesDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
	onCancel: () => void
	onSave?: () => void
	title?: string
	description?: string
	confirmText?: string
	saveText?: string
	showSaveOption?: boolean
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
	open,
	onOpenChange,
	onConfirm,
	onCancel,
	onSave,
	title,
	description,
	confirmText,
	saveText,
	showSaveOption = false,
}) => {
	const { currentLanguage } = useCaretI18n()

	// Use i18n defaults, but allow override via props for flexibility
	const dialogTitle = title ?? t("dialog.unsavedChanges.title", "common")
	const dialogDescription = description ?? t("dialog.unsavedChanges.description", "common")
	const dialogConfirmText = confirmText ?? t("dialog.unsavedChanges.confirmText", "common")
	const dialogSaveText = saveText ?? t("dialog.unsavedChanges.saveText", "common")

	return (
		<OriginalUnsavedChangesDialog
			open={open}
			onOpenChange={onOpenChange}
			onConfirm={onConfirm}
			onCancel={onCancel}
			onSave={onSave}
			title={dialogTitle}
			description={dialogDescription}
			confirmText={dialogConfirmText}
			saveText={dialogSaveText}
			showSaveOption={showSaveOption}
		/>
	)
}
