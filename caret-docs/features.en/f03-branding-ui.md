# Branding & UI System

Caret’s branding/UI layer is a standalone design system that gives Caret a distinct visual identity while remaining switchable with Cline when needed.

## 📋 Highlights
- **Assets**: caret logo (`^` symbol), dedicated palette, welcome/about/announcement pages, persona illustrations.
- **Separation**: Independent from Cline; can toggle branding per user setting.
- **Consistency**: Shortcut catalog in `webview-ui/src/caret/shortcuts/shortcuts.json` with labels such as “Cancel (Esc)” driven by brand utils + i18n.

## 🏗️ Architecture

### Asset Layout
```
assets/
├── icons/                # app & terminal icons
├── caret-main-banner.webp
├── agent_profile.png
└── template_characters/  # persona images

webview-ui/src/assets/
└── caret-logo.png, CaretLogoWhite.tsx
```

### Component Layout
```
webview-ui/src/caret/components/
├── CaretWelcome.tsx
├── CaretWelcomeSection.tsx
├── CaretAnnouncement.tsx
├── CaretFooter.tsx
├── CaretApiSetup.tsx
└── __tests__/ (UI tests for the above)

webview-ui/src/caret/styles/
└── CaretWelcome.css
```

## 📐 Brand-Name Usage Guidelines

Branding depends on the target audience:

| Message | Audience | Rule | Example |
| --- | --- | --- | --- |
| OS notification | User | `getCurrentBrandName()` | “Caret wants to…” |
| Chat UI (normal) | User | `getCurrentBrandName()` | “Caret has completed…” |
| Chat UI (error) | User | Brand-neutral | “Missing required parameter…” |
| Tool response | AI model | Brand-neutral | “Tool execution failed…” |
| Logger | Developer | Brand-neutral | “[Task] Error executing…” |

**Backend/CLI**: Use `common.BrandDisplayName()` from `cli/pkg/common/branding.go` for any user-facing CLI labels; do not hardcode brand strings.

**Do/Don’t examples**
```typescript
// ✅ User notification
showSystemNotification({
  subtitle: `${getCurrentBrandName()} wants to execute command`,
  message: `${getCurrentBrandName()} is requesting approval`,
})

// ✅ Brand-neutral errors/tool responses
await this.say("error", `Missing required parameter '${paramName}'. Retrying...`)
return formatResponse.toolError(`Invalid parameter: ${paramName}`)

// ❌ Hardcoded brands or missing subject
await this.say("error", `Caret attempted to use ${toolName}...`)
await this.say("error", `Attempted to use ${toolName}...`)
```

**`getCurrentBrandName()`** (in `caret-src/utils/brand-utils.ts`) reads `package.json` `displayName`, caches it, and falls back to `"Cline"` on error.

## 🎨 Design System

### Color Palette (excerpt)
```css
:root {
  --caret-primary: #6366f1;
  --caret-secondary: #8b5cf6;
  --caret-accent: #10b981;
  --caret-bg-primary: #f8fafc;
  --caret-text-primary: #1e293b;
}
[data-theme="dark"] {
  --caret-primary: #818cf8;
  --caret-secondary: #a78bfa;
  --caret-bg-primary: #0f172a;
  --caret-text-primary: #f1f5f9;
}
```

### Typography & Components
- Inter-based title/subtitle/body styles defined in `CaretWelcome.css`.
- Welcome cards, CTAs, and banners use gradients, shadowed logos, and responsive layouts.

## 🏠 Key Pages/Components
- **CaretWelcome.tsx**: Branded hero, feature cards (persona, i18n, rules), CTA.
- **CaretAnnouncement.tsx**: Announcement list with counters.
- **CaretFooter.tsx**: Footer links (About/Docs/Support) and version badge.
- **CaretApiSetup.tsx**: API setup UI with Caret branding.

## 🧪 Tests
- Coverage target: ✅ 100% for core branding components.
- Files: `webview-ui/src/caret/components/__tests__/CaretWelcome.test.tsx`, `CaretWelcomeSection.test.tsx`, `CaretAnnouncement.test.tsx`, `CaretFooter.test.tsx`.
- Cases: render checks, i18n updates, image load, interactions, responsive layout, dark mode, accessibility, performance.
- Run: `npm run test:frontend -- branding`.

## 🔧 Merge & Porting Guide
- **Priority**: 🟡 Medium (visual identity), **Risk**: 🟢 Low (isolated assets/components).
- **Phases (summary)**
  1) Bring over UI tests and confirm they pass.
  2) Copy assets (`assets/`, `webview-ui/src/assets/`) and Caret styles.
  3) Copy components (`CaretWelcome.tsx`, `CaretAnnouncement.tsx`, `CaretFooter.tsx`, `CaretLogoWhite.tsx`).
  4) Wire routing/nav links and ensure branding toggles work.
  5) Verify alt text, dark/light themes, responsive layout; run UI/a11y/visual checks.
- **Completion**: All branding components render; Caret colors/logos visible; multilingual text shows; dark/light supported; tests at 100%.

## 🔄 Branding Switch System
- Supports **Cline ↔ Caret** and **Caret ↔ CodeCenter**, with headroom for more brands.
- Automates:
  - VS Code extension metadata (42+ fields in `package.json`)
  - Icon/banner swaps and terminal branding (name, extension ID)
  - Rule file paths (`.clinerules` ↔ `.caretrules`) and version mapping
- **VS Code command namespace fix**: converted `cline.*` → `caret.*` to avoid conflicts when both extensions are installed; command titles use `getCurrentBrandDisplayName()`.
- **Add-to chat pipeline**: webview always subscribes to `subscribeToAddToInput` with `EmptyRequest` so “Add to Caret” context flows even after brand switches, while streams stay Caret-only (no Cline cross-talk when both extensions are present).

## 🏢 B2B & Consumer Branding
- B2B: CodeCenter/private branding via the automated switcher.
- Consumer: Quick Caret ↔ Cline toggles without UI conflicts.

## 📊 Impact & Roadmap
- **Current**: Distinct brand recognition, consistent UX across light/dark, persona-aware visuals, aligned terminal/command branding.
- **Next**:
  - Add checks so notifications/UI strings always use brand utils.
  - Expand visual regression coverage and asset optimization.
  - Keep errors/tool responses brand-neutral while user-facing messages stay branded.
