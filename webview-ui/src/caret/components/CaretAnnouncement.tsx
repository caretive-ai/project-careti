import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CSSProperties, memo } from "react"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"
import { Accordion, AccordionItem } from "@heroui/react"
import { t } from "../utils/i18n"

interface AnnouncementProps {
  version: string
  hideAnnouncement: () => void
}

// Shared styles (reuse original inline styles)
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
const hrStyle: CSSProperties = {
  height: "1px",
  background: getAsVar(VSC_DESCRIPTION_FOREGROUND),
  opacity: 0.1,
  margin: "8px 0",
}
const linkContainerStyle: CSSProperties = { margin: "0" }
const linkStyle: CSSProperties = { display: "inline" }

/*
  CARET MODIFICATION: i18n-enabled announcement component.
  Texts are fetched from locale files under caret/locale/{*}/announcement.json
*/
export const CaretAnnouncement = ({ version, hideAnnouncement }: AnnouncementProps) => {
  // CARET MODIFICATION: Use full version number instead of just major.minor
  const displayVersion = version // e.g. "0.1.1"

  // Build current update bullet list (keys: bullets.current.{index})
  const currentBullets: string[] = []
  for (let i = 1; i <= 10; i++) {
    const txt = t(`bullets.current.${i}`, "announcement", { version: displayVersion })
    // Only add if translation exists and is not the key itself
    if (txt && txt !== `bullets.current.${i}`) {
      currentBullets.push(txt)
    }
  }

  // Build previous update bullet list (keys: bullets.previous.{index})
  const previousBullets: string[] = []
  for (let i = 1; i <= 20; i++) {
    const txt = t(`bullets.previous.${i}`, "announcement")
    // Only add if translation exists and is not the key itself
    if (txt && txt !== `bullets.previous.${i}`) {
      previousBullets.push(txt)
    }
  }

  // Only render if we have any bullets to show
  if (currentBullets.length === 0) {
    return null
  }

  return (
    <div style={containerStyle}>
      <VSCodeButton data-testid="close-button" appearance="icon" onClick={hideAnnouncement} style={closeIconStyle}>
        <span className="codicon codicon-close"></span>
      </VSCodeButton>
      <h3 style={h3TitleStyle}>{t("header", "announcement", { version: displayVersion })}</h3>
      {currentBullets.length > 0 && (
        <ul style={ulStyle}>
          {currentBullets.map((b, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: b }} />
          ))}
        </ul>
      )}
      {previousBullets.length > 0 && (
        <Accordion isCompact className="pl-0">
          <AccordionItem
            key="1"
            aria-label="Previous Updates"
            title={t("previousHeader", "announcement")}
            classNames={{
              trigger: "bg-transparent border-0 pl-0 pb-0 w-fit",
              title: "font-bold text-[var(--vscode-foreground)]",
              indicator:
                "text-[var(--vscode-foreground)] mb-0.5 -rotate-180 data-[open=true]:-rotate-90 rtl:rotate-0 rtl:data-[open=true]:-rotate-90",
            }}>
            <ul style={ulStyle}>
              {previousBullets.map((b, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: b }} />
              ))}
            </ul>
          </AccordionItem>
        </Accordion>
      )}
      <div style={hrStyle} />
      <p style={linkContainerStyle}>
        {t("links.intro", "announcement")} {" "}
        <VSCodeLink style={linkStyle} href="https://www.facebook.com/groups/aicodingcaret">
          {t("links.facebook", "announcement")}
        </VSCodeLink>{" "}
        {t("links.and", "announcement")}{" "}
        <VSCodeLink style={linkStyle} href="https://github.com/aicoding-caret/caret">
          {t("links.github", "announcement")}
        </VSCodeLink>{" "}
        {t("links.outro", "announcement")}
      </p>
    </div>
  )
}

export default memo(CaretAnnouncement) 