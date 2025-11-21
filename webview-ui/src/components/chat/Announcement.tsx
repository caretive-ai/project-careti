import { Accordion, AccordionItem } from "@heroui/react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { CSSProperties, memo } from "react"
import { t } from "@/caret/utils/i18n"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"

interface AnnouncementProps {
	version: string // CARET MODIFICATION: Accept version from parent (AboutSection)
	hideAnnouncement: () => void
	showCloseButton?: boolean
}

const containerStyle: CSSProperties = {
	backgroundColor: getAsVar(VSC_INACTIVE_SELECTION_BACKGROUND),
	borderRadius: "3px",
	padding: "12px 16px",
	margin: "5px 15px 5px 15px",
	position: "relative",
	flexShrink: 0,
}
const closeIconStyle: CSSProperties = { position: "absolute", top: "8px", right: "8px" }
const h3TitleStyle: CSSProperties = { margin: "0 0 8px" }
const ulStyle: CSSProperties = { margin: "0 0 8px", paddingLeft: "12px" }
const _accountIconStyle: CSSProperties = { fontSize: 11 }
const hrStyle: CSSProperties = {
	height: "1px",
	background: getAsVar(VSC_DESCRIPTION_FOREGROUND),
	opacity: 0.1,
	margin: "8px 0",
}
const _linkContainerStyle: CSSProperties = { margin: "0" }
const _linkStyle: CSSProperties = { display: "inline" }

/*
Announcements are automatically shown when the major.minor version changes (for ex 3.19.x → 3.20.x or 4.0.x).
The latestAnnouncementId is now automatically generated from the extension's package.json version.
Patch releases (3.19.1 → 3.19.2) will not trigger new announcements.
*/
const Announcement = ({ version, hideAnnouncement, showCloseButton = true }: AnnouncementProps) => {
	// Dynamically get current bullet points
	const getCurrentBullets = () => {
		const bullets = []
		let i = 1
		while (true) {
			const title = t(`bullets.current.${i}`, "announcement", { fallback: "" })
			const desc = t(`bullets.current.${i}-desc`, "announcement", { fallback: "" })

			if (!title || title === `bullets.current.${i}`) {
				break
			}

			bullets.push({ title, desc })
			i++
		}
		return bullets
	}

	const currentBullets = getCurrentBullets()

	return (
		<div style={containerStyle}>
			{showCloseButton && (
				<VSCodeButton appearance="icon" data-testid="close-button" onClick={hideAnnouncement} style={closeIconStyle}>
					<span className="codicon codicon-close"></span>
				</VSCodeButton>
			)}
			<h3 style={h3TitleStyle}>{t("header", "announcement", { version })}</h3>
			<ul style={ulStyle}>
				{currentBullets.map((bullet, index) => (
					<li key={index + 1}>
						<b>{bullet.title}:</b> {bullet.desc}
					</li>
				))}
			</ul>
			<Accordion className="pl-0">
				<AccordionItem
					aria-label={t("previousHeader", "announcement")}
					classNames={{
						trigger: "bg-transparent border-0 pl-0 pb-0 w-fit",
						title: "font-bold text-[var(--vscode-foreground)]",
						indicator:
							"text-[var(--vscode-foreground)] mb-0.5 -rotate-180 data-[open=true]:-rotate-90 rtl:rotate-0 rtl:data-[open=true]:-rotate-90",
					}}
					key="1"
					title={t("previousHeader", "announcement")}>
					<ul style={ulStyle}>
						{(() => {
							const bullets = []
							let i = 1
							while (true) {
								const title = t(`bullets.previous.${i}`, "announcement", { fallback: "" })
								const desc = t(`bullets.previous.${i}-desc`, "announcement", { fallback: "" })

								if (!title || title === `bullets.previous.${i}`) {
									break
								}

								bullets.push(
									<li key={i}>
										<b>{title}:</b> {desc}
									</li>,
								)
								i++
							}
							return bullets
						})()}
					</ul>
				</AccordionItem>
			</Accordion>
			<div style={hrStyle} />
		</div>
	)
}

export default memo(Announcement)
