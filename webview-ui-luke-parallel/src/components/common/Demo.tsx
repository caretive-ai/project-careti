import {
	VSCodeBadge,
	VSCodeButton,
	VSCodeCheckbox,
	VSCodeDataGrid,
	VSCodeDataGridCell,
	VSCodeDataGridRow,
	VSCodeDivider,
	VSCodeDropdown,
	VSCodeLink,
	VSCodeOption,
	VSCodePanels,
	VSCodePanelTab,
	VSCodePanelView,
	VSCodeProgressRing,
	VSCodeRadio,
	VSCodeRadioGroup,
	VSCodeTag,
	VSCodeTextArea,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"

function Demo() {
	const rowData = [
		{
			cell1: "Cell Data",
			cell2: "Cell Data",
			cell3: "Cell Data",
			cell4: "Cell Data",
		},
		{
			cell1: "Cell Data",
			cell2: "Cell Data",
			cell3: "Cell Data",
			cell4: "Cell Data",
		},
		{
			cell1: "Cell Data",
			cell2: "Cell Data",
			cell3: "Cell Data",
			cell4: "Cell Data",
		},
	]

	return (
		<main>
			<h1>{t("demo.helloWorld", "chat")}</h1>
			<VSCodeButton>{t("demo.howdy", "chat")}</VSCodeButton>

			<div className="grid gap-3 p-2 place-items-start">
				<VSCodeDataGrid>
					<VSCodeDataGridRow row-type="header">
						<VSCodeDataGridCell cell-type="columnheader" grid-column="1">
							{t("demo.customHeaderTitle", "chat")}
						</VSCodeDataGridCell>
						<VSCodeDataGridCell cell-type="columnheader" grid-column="2">
							{t("demo.anotherCustomTitle", "chat")}
						</VSCodeDataGridCell>
						<VSCodeDataGridCell cell-type="columnheader" grid-column="3">
							{t("demo.titleIsCustom", "chat")}
						</VSCodeDataGridCell>
						<VSCodeDataGridCell cell-type="columnheader" grid-column="4">
							{t("demo.customTitle", "chat")}
						</VSCodeDataGridCell>
					</VSCodeDataGridRow>
					{rowData.map((row, index) => (
						<VSCodeDataGridRow key={index}>
							<VSCodeDataGridCell grid-column="1">{row.cell1}</VSCodeDataGridCell>
							<VSCodeDataGridCell grid-column="2">{row.cell2}</VSCodeDataGridCell>
							<VSCodeDataGridCell grid-column="3">{row.cell3}</VSCodeDataGridCell>
							<VSCodeDataGridCell grid-column="4">{row.cell4}</VSCodeDataGridCell>
						</VSCodeDataGridRow>
					))}
				</VSCodeDataGrid>

				<VSCodeTextField>
					<section slot="end" style={{ display: "flex", alignItems: "center" }}>
						<VSCodeButton appearance="icon" aria-label={t("demo.matchCase", "chat")}>
							<span className="codicon codicon-case-sensitive"></span>
						</VSCodeButton>
						<VSCodeButton appearance="icon" aria-label={t("demo.matchWholeWord", "chat")}>
							<span className="codicon codicon-whole-word"></span>
						</VSCodeButton>
						<VSCodeButton appearance="icon" aria-label={t("demo.useRegularExpression", "chat")}>
							<span className="codicon codicon-regex"></span>
						</VSCodeButton>
					</section>
				</VSCodeTextField>
				<span className="codicon codicon-chevron-right" slot="end"></span>

				<span className="flex gap-3">
					<VSCodeProgressRing />
					<VSCodeTextField />
					<VSCodeButton>{t("demo.add", "chat")}</VSCodeButton>
					<VSCodeButton appearance="secondary">{t("demo.remove", "chat")}</VSCodeButton>
				</span>

				<VSCodeBadge>{t("demo.badge", "chat")}</VSCodeBadge>
				<VSCodeCheckbox>{t("demo.checkbox", "chat")}</VSCodeCheckbox>
				<VSCodeDivider />
				<VSCodeDropdown>
					<VSCodeOption>{t("demo.option1", "chat")}</VSCodeOption>
					<VSCodeOption>{t("demo.option2", "chat")}</VSCodeOption>
				</VSCodeDropdown>
				<VSCodeLink href="#">{t("demo.link", "chat")}</VSCodeLink>
				<VSCodePanels>
					<VSCodePanelTab id="tab-1">{t("demo.tab1", "chat")}</VSCodePanelTab>
					<VSCodePanelTab id="tab-2">{t("demo.tab2", "chat")}</VSCodePanelTab>
					<VSCodePanelView id="view-1">{t("demo.panelView1", "chat")}</VSCodePanelView>
					<VSCodePanelView id="view-2">{t("demo.panelView2", "chat")}</VSCodePanelView>
				</VSCodePanels>
				<VSCodeRadioGroup>
					<VSCodeRadio>{t("demo.radio1", "chat")}</VSCodeRadio>
					<VSCodeRadio>{t("demo.radio2", "chat")}</VSCodeRadio>
				</VSCodeRadioGroup>
				<VSCodeTag>{t("demo.tag", "chat")}</VSCodeTag>
				<VSCodeTextArea placeholder={t("demo.textAreaPlaceholder", "chat")} />
			</div>
		</main>
	)
}

export default Demo
