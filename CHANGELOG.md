# Changelog

<div align="center">
  <!-- Sovereign Cloud Languages: Provider Country = UI Language Support -->
  <table>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/🇺🇸_English-2563eb?style=for-the-badge&labelColor=1e40af" alt="English"/>
      </td>
      <td align="center">
        <a href="careti-docs/changelog-i18n/CHANGELOG.ko.md">
          <img src="https://img.shields.io/badge/🇰🇷_한국어-16a34a?style=for-the-badge&labelColor=15803d" alt="한국어"/>
        </a>
      </td>
      <td align="center">
        <a href="careti-docs/changelog-i18n/CHANGELOG.ja.md">
          <img src="https://img.shields.io/badge/🇯🇵_日本語-ea580c?style=for-the-badge&labelColor=c2410c" alt="日本語"/>
        </a>
      </td>
      <td align="center">
        <a href="careti-docs/changelog-i18n/CHANGELOG.zh-cn.md">
          <img src="https://img.shields.io/badge/🇨🇳_中文-eab308?style=for-the-badge&labelColor=ca8a04" alt="中文"/>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center" colspan="4">
        <a href="careti-docs/changelog-i18n/CHANGELOG.fr.md">
          <img src="https://img.shields.io/badge/🇫🇷_Français-0055a4?style=for-the-badge&labelColor=003f7f" alt="Français"/>
        </a>
        &nbsp;&nbsp;
        <a href="careti-docs/changelog-i18n/CHANGELOG.de.md">
          <img src="https://img.shields.io/badge/🇩🇪_Deutsch-ffcc00?style=for-the-badge&labelColor=dd0000" alt="Deutsch"/>
        </a>
        &nbsp;&nbsp;
        <a href="careti-docs/changelog-i18n/CHANGELOG.ru.md">
          <img src="https://img.shields.io/badge/🇷🇺_Русский-0039a6?style=for-the-badge&labelColor=d52b1e" alt="Русский"/>
        </a>
      </td>
    </tr>
  </table>
</div>

## [0.4.8] 2026-02-13

> **Note**: Careti v0.4.8 introduces the Claude Code-style message queue system and fixes the v0.4.7 infinite loading issue.

### ✨ New Features
- **F19 Message Queue System**: Type next instructions while AI is streaming. Queued input displayed as inline preview above the input field.
- **ESC Instant Cancel**: Single ESC press immediately stops streaming and restores queued input to the editor for editing before re-sending.
- **Inline Queue Edit/Delete**: Edit (restore to input) and delete (discard) buttons on the pending input preview.
- **CLI Agent/Chatbot Mode**: Independent agent and chatbot modes for CLI with headless/yolo support, EOF reconnect, and improved input handling.
- **CLI Telemetry**: PostHog-based event tracking for CLI usage analytics.
- **CLI E2E Tests**: Agent mode, CLI behavior, output, and interactive mode E2E tests.
- **clearPendingInput RPC**: New gRPC endpoint for clearing queued input from edit/delete buttons.

### ✨ Improved
- **Feature flags parallel polling**: Changed sequential flag fetching (14 requests) to parallel with 5-second overall timeout.
- **Non-blocking initialization**: `featureFlagsService.poll()` changed to fire-and-forget to prevent blocking extension activation.
- **Subagent command pattern**: Added CARETI_COMMAND_PATTERN for careti/cline CLI subagent support.

### Fixed
- **v0.4.7 Infinite Loading**: `featureFlagsService.poll()` blocked extension initialization when `data.cline.bot` was unreachable. Changed to non-blocking with timeout.
- **ApiProvider migration**: Added `"caret"` → `"careti"` migration for users upgrading from v0.4.6 whose saved settings still had the old provider name.
- **API handler fallback**: Added `case "caret":` fallback in API provider switch to handle unmigrated provider values gracefully.
- **Legacy migration call**: `migrateLegacyApiConfigurationToModeSpecific()` was defined but never called in initialization. Now properly invoked.
- **pendingInput race condition**: Fixed `consumePendingInput` being called after `cancelTask()` which already destroyed the session via `sessionManager.delete()`.
- **Debug log cleanup**: Removed `[CORE-DEBUG]`, `[CLI-DEBUG]`, `[GLM4.7-DEBUG]` console logs.

---

## [0.4.7] 2026-01-30

> **Note**: Careti v0.4.7 integrates Cline v3.49.1 features and introduces SmartEditEngine for improved code editing.

### ✨ New Features
- **ZAI GLM-4.7 in Careti provider**: Added Zhipu AI's GLM-4.7 as a new backend option alongside Gemini and Claude Code in the Careti provider.
- **Web Search (SerpAPI)**: Integrated SerpAPI-powered web search with configurable API key in settings.
- **Commands system**: Implemented Claude Code/OpenCode style commands in `.agents/commands/` directory.
- **SmartEditEngine**: New 9-stage fuzzy matching engine with 6-stage fallback for improved code editing reliability.
- **Background Edits** (Cline v3.49.1): Support for background file editing operations.
- **Explain Changes** (Cline v3.49.1): New generate_explanation tool for code change explanations.
- **GFM Markdown support**: Added GitHub Flavored Markdown tables and strikethrough rendering.
- **TypewriterText component**: Added shimmer animation for streaming text display.
- **ThinkingRow component**: New UI for reasoning/thinking mode display.
- **ToolGroupRenderer**: Grouped display for low-stakes tool operations.

### ✨ Improved
- **Claude Code interop**: AGENTS.md ↔ CLAUDE.md sync hook for seamless Caret + Claude Code workflow.
- **Caret → Careti rebrand**: Complete brand migration across codebase and all locale files.
- **Retry logic**: Enhanced API retry logic with improved backoff handling.
- **Upstage provider**: Improved Upstage provider configuration.
- **Token-efficient errors**: Optimized error context in WriteToFileToolHandler.
- **hwpjs dependencies**: Moved platform-specific packages to optionalDependencies.
- **Ollama thinking**: Fixed thinking mode display for Ollama provider.

### Fixed
- **Plan/Act mode for Careti**: Hidden Plan/Act mode checkbox for Careti provider (single model mode only).
- **preserveFocus option**: Fixed file opening to respect preserveFocus setting.
- **Import paths**: Completed Caret → Careti import path migration.
- **Web search config**: Fixed SerpAPI key handling in configuration cache.
- **Build errors**: Resolved Cline v3.49.1 feature integration build issues.
- **Skills translation**: Fixed t() function call and added skillLoaded translation.

---

## [0.4.6] 2026-01-19

### ✨ Improved
- **Dynamic branding**: Replaced hardcoded "Cline" references with dynamic brand name (`getCurrentBrandName()`) across task handlers.
- **Free credits promo**: Added sign-up free credits promotion message on login required UI (7 languages supported).
- **README docs links**: Added docs links to multilingual README language badges for easier navigation.

---

## [0.4.5] 2026-01-18

> **Note**: Careti v0.4.5 cherry-picks Skills system, Hooks i18n and other features from Cline v3.49.0+.

### ✨ New Features
- **Z.AI GLM-4.7 full support**: Supports Thinking Mode and natural conversation style.
- **[Upstage](https://upstage.ai/) provider**: Added new provider supporting Upstage Solar models.
- **Text model image tools**: Text-only models can now use Careti account tools for image generation and analysis.
- **Skills system** (Cline v3.49.0+ cherry-pick): Define project-specific skills that AI can utilize. Manage skills in `.agents/skills/` or `.users/skills/` directories.
- **Hooks system** (Cline v3.49.0+ cherry-pick): Execute custom scripts before/after tool execution. Manage hooks in `.agents/hooks/` or `.users/hooks/` directories.
- **Dual directory architecture & /init**: Token-optimized AI context (`.agents/`) and human-readable docs (`.users/`) with 1:1 mirroring policy. Use `/init` command to auto-analyze project and generate context files. AGENTS.md and CLAUDE.md serve as standard entry points.
- **HWP document support**: Cross-platform HWP parsing support for Windows, macOS, and Linux.
- **read_document tool**: Unified document reading tool supporting HWP, PDF, DOCX, PPTX and more. Includes legacy PPT format detection.
- **analyze_image tool**: New image analysis tool integrated with Careti account's Gemini. 7500px max pixel limit, includes analysis result reporting guidelines.
- **generate_image tool improvements**: XML `<image>` tag parsing support, file path (relative/absolute) support, aspect_ratio/image_size omission guidelines.
- **Image send toggle**: Toggle feature for @mention image file sending.

### ✨ Improved
- **Language expansion**: Added French, German, and Russian translations. Prioritizing countries with their own AI models (Mistral, Aleph Alpha, Yandex, etc.).
- **Provider country flags**: Display country flags for providers (Sovereign Cloud perspective).
- **Global context path change**: Global agent settings path changed to `~/Documents/.agents/`.
- **i18n support**: Added Korean, Japanese, and Chinese translations for Hooks and Skills features.
- **YAML frontmatter parsing**: Added shared YAML parsing utility for Skills/Hooks.
- **Default provider**: New users now default to Careti provider.
- **Feature Config UI gating**: Control account/mode/dictation UI via feature config.
- **VSIX size optimization**: Reduced extension size by excluding iOS/Android binaries.
- **Image settings UI**: Image ratio/resolution settings UI now visible for all providers.

### Fixed
- **sharp activation failure**: Fixed image processing library activation failure.
- **Image reference handling**: Fixed image reference handling and optimization issues.
- **Duplicate message display**: Fixed "Requesting Careti image generation" message appearing twice.

## [0.4.4] 2025-12-30

### ✨ Improved
- **Careti account Nano Banana integration**: Added Gemini 3 Flash preview to Careti accounts and integrated Nano Banana image generation so outputs can be used as project assets.
- **[Naver Cloud](https://clova.ai/) (Hyper Clova X)**: Added the Naver Cloud provider and HCX-007/HCX-005/HCX-DASH-002 models.
- **AAIF international-standard Agents.md + project initialization**: Migrated legacy Careti/Cline rules to the AAIF standard and added project initialization support.
- **Build/Release**: Stabilized build scripts and fixed asset sync order to improve build reliability.
- **Rate-limit retries**: Implemented 5/10/20/40/60s backoff with user-visible countdowns.
- **Docs/Model list**: Updated provider setup docs and the support-model list.
- **Upstream**: Cherry-picked Cline v3.45.0 bugfixes.
- **Cline v3.45.0 bug fixes**: Integrated the bugfix code that landed in Cline v3.45.0.
- **Telemetry**: Added telemetry for error/quality tracking.

### Fixed
- **History images**: Fixed absolute-path images not rendering in history.
- **Input drop**: Mitigated prompts being dropped after a response.
- **Careti Provider**: Fixed Gemini3 behavior issues.
- **Profile images**: Fixed missing images after login.
- **Ask race**: Resolved ask race conditions.
- **[Naver Cloud](https://clova.ai/) response handling**: Detects `status.code` and empty responses, with 429 mapping.
- **Streaming stability**: Guarded empty stream chunks and improved streaming failure logging.

## [0.4.1] 2025-12-10

### ✨ Improved
- **Careti Provider**: Stabilized the `anyLLM`-based Careti Provider for the official launch of the `careti.ai` service. This includes API enhancements and improved reliability.

### Fixed
- **Persona System**: Enhanced persona initialization logic to ensure default avatars are seeded correctly. Improved exception handling for persona image loading.
- **Branding**: Corrected branding for `.clineignore` functionality to align with `.caretignore`.
- **Build**: Resolved various build and resource location issues.
- **Authentication**: Minor fixes and checks for the authentication process.

## [0.4.0] 2025-11-28

> **Note**: Careti v0.4.0 is based on Cline v3.38.2. Upstream release notes live in `CHANGELOG-CLINE.md`.

### 🎉 Cline v3.38.2 upstream merge
- Merge commit: `8723b386f` (branch: `main_backup_20251128202033`).

### Added
- **Cline v3.38.2 integration**: All upstream features including the latest model support (Claude Opus 4.5).
- **Dual Account System**: Switch between Careti Mode (extended) and Cline Mode (stock).
- **Provider setup**: Auto-fetch models for LiteLLM/BizRouter with real-time health checks.
- **JSON prompt system**: Dynamic system prompt configuration via JSON.
- **Input history**: Terminal-like history navigation with persistence.
- **Shortcuts**: Cancel (Esc) and resume (Ctrl+Shift+R) tasks.

### Fixed
- **Terminal hang** on Linux with shell integration.
- **Branding** restored across UI and CLI.

## [0.3.1] 2025-10-20

### New
- **Careti provider**: Official Careti AI provider integration.
  - Promo: $10 free credits during the campaign period; paid credits coming soon.

### Fixed
- **Terminal branding** reverted to Careti after upstream merge.
- **System prompt input** handling bugs.
- **LiteLLM model list** fetch with health filtering.

### Updated
- **Cline v3.32.7 merge**: See `CHANGELOG-CLINE.md` for upstream details.

## [0.3.0] 2025-10-13

### 🎉 Cline v3.32.7 upstream merge
- Merge commit: `03177da87` (branch: `merge/cline-upstream-20251009`).
- New models: Claude Sonnet 4.5 (200K/1M), GPT-5 updates, improved model info/pricing.
- New features: `.caretignore` support (with `.clineignore` compatibility), AWS Bedrock profiles, Requesty/Together/Alibaba Qwen providers, rate-limit retries, Focus Chain.
- Architecture: full protobuf type system migration, enhanced MCP support, provider refactor.
- More details: see `CHANGELOG-CLINE.md`.

### 🚀 Prompt system optimizations
- API request count reduced by 30-50% for multi-file edits.
- Smart TODO management with automatic updates and quiet tracking.
- Claude Sonnet 4.5 context optimizations; dual mode compatibility.

## [0.2.3] 2025-10-01
- Chat input history navigation.
- LiteLLM model fetch + CaretBrandConfig refactor to FeatureConfig.
- Agent protocol hardening; system prompt refactor and Korean docs.
- ActionButtons overflow fix when two buttons render.

## [0.2.22] 2025-09-21
- Restored Careti collaborative/system prompt tone after merge gaps.
- Fixed missing browser translations.

## [0.2.21] 2025-09-18
- Persona system fixes (asset URI handling) and setup flow improvements.
- Persona selector copy updates (ko/en).

## [0.2.0] 2025-09-11
- **Cline v3.26.6 merge** via `f8bd960b4` (`c6aa47095ee47036946c6a51339a4fa22aaa073c` upstream). See `CHANGELOG-CLINE.md`.
- Key features: latest model support (GPT-5, Claude 4, Grok), 15+ new providers, Focus Chain, context compression, checkpoints, Mermaid preview.
- Architecture: backend improvements, UI polish, stronger MCP support.

## [0.1.3]
- Persona system integration (Careti, Osarang, Madobe Ichika, Cheong Ma-shin, Tanto Ubuntu).
- Cline/Careti mode toggle, 4-language support, system prompt improvements, 36 providers/300 models.
- Docs sites in progress.

## [0.1.2] 2025-08-13
- Fix browser_action tool loading for next-gen models.
- DeepSeek V3 support, token optimization, API cost controls.
- Architecture docs and guides update.

## [0.1.1] 2025-07-18
- Initial Careti branding system, enhanced i18n base, VS Code API conflict fixes.
- TDD/Testing framework foundation.

## [0.1.0] 2025-07-06
- Initial Careti release (minimal-change fork of Cline).
- Careti-specific extension architecture in `careti-src/`.
- Dual-mode system, JSON-based prompt templates, comprehensive docs, multi-language support, TDD pipeline.
