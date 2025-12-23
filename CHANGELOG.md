# Changelog

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/English-2563eb?style=for-the-badge&labelColor=1e40af" alt="English"/>
      </td>
      <td align="center">
        <a href="caret-docs/ko/CHANGELOG.md">
          <img src="https://img.shields.io/badge/한국어-16a34a?style=for-the-badge&labelColor=15803d" alt="한국어"/>
        </a>
      </td>
      <td align="center">
        <a href="caret-docs/ja/CHANGELOG.md">
          <img src="https://img.shields.io/badge/日本語-ea580c?style=for-the-badge&labelColor=c2410c" alt="日本語"/>
        </a>
      </td>
      <td align="center">
        <a href="caret-docs/zh-cn/CHANGELOG.md">
          <img src="https://img.shields.io/badge/中文-dc2626?style=for-the-badge&labelColor=b91c1c" alt="中文"/>
        </a>
      </td>
    </tr>
  </table>
</div>

## [0.4.2] 2025-12-23

### ✨ Improved
- **Image generation experience**: Added loading/thinking messages, open generated images in editor tabs, and improved cost/token display in the header.
- **Caret account view**: Added a Caret-specific account screen and refined credit/usage/payment history fetch flow (removed redundant calls, adjusted refresh interval).
- **CLI**: Improved Caret CLI auth/subscription and LiteLLM BYO setup/model list fetching; officially released Caret CLI with BYO LiteLLM and Caret provider.
- **Upstream/stability**: Resolved ask request race conditions and cherry-picked Cline v3.45.0 bug fixes.
- **Command prefix**: Switched `cline` → `caretive.caret` to reduce conflicts when both are installed.
- **Model metadata**: Gemini 3 Pro Image Preview now supports images with pricing and thinking configuration.

### Added
- **Image generation model**: Added Gemini 3 Flash Preview.
- **Caret account model**: Added gemini-3-pro-image-preview (Nanobanana Pro).

### Fixed
- **Login profile photo**: Fixed missing profile photo after login.
- **Default provider**: Adjusted default provider to Cline.

## [0.4.1] 2025-12-10

### ✨ Improved
- **Caret Provider**: Stabilized the `anyLLM`-based Caret Provider for the official launch of the `caret.team` service. This includes API enhancements and improved reliability.

### Fixed
- **Persona System**: Enhanced persona initialization logic to ensure default avatars are seeded correctly. Improved exception handling for persona image loading.
- **Branding**: Corrected branding for `.clineignore` functionality to align with `.caretignore`.
- **Build**: Resolved various build and resource location issues.
- **Authentication**: Minor fixes and checks for the authentication process.

## [0.4.0] 2025-11-28

> **Note**: Caret v0.4.0 is based on Cline v3.38.2. Upstream release notes live in `CHANGELOG-CLINE.md`.

### 🎉 Cline v3.38.2 upstream merge
- Merge commit: `8723b386f` (branch: `main_backup_20251128202033`).

### Added
- **Cline v3.38.2 integration**: All upstream features including the latest model support (Claude Opus 4.5).
- **Dual Account System**: Switch between Caret Mode (extended) and Cline Mode (stock).
- **Caret CLI (beta)**: Unified `caret` CLI with enhanced auth and LiteLLM support.
- **Provider setup**: Auto-fetch models for LiteLLM/BizRouter with real-time health checks.
- **JSON prompt system**: Dynamic system prompt configuration via JSON.
- **Input history**: Terminal-like history navigation with persistence.
- **Shortcuts**: Cancel (Esc) and resume (Ctrl+Shift+R) tasks.

### Fixed
- **Terminal hang** on Linux with shell integration.
- **Branding** restored across UI and CLI.

## [0.3.1] 2025-10-20

### New
- **Caret provider**: Official Caret AI provider integration.
  - Promo: $10 free credits during the campaign period; paid credits coming soon.

### Fixed
- **Terminal branding** reverted to Caret after upstream merge.
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
- Restored Caret collaborative/system prompt tone after merge gaps.
- Fixed missing browser translations.

## [0.2.21] 2025-09-18
- Persona system fixes (asset URI handling) and setup flow improvements.
- Persona selector copy updates (ko/en).

## [0.2.0] 2025-09-11
- **Cline v3.26.6 merge** via `f8bd960b4` (`c6aa47095ee47036946c6a51339a4fa22aaa073c` upstream). See `CHANGELOG-CLINE.md`.
- Key features: latest model support (GPT-5, Claude 4, Grok), 15+ new providers, Focus Chain, context compression, checkpoints, Mermaid preview.
- Architecture: backend improvements, UI polish, stronger MCP support.

## [0.1.3]
- Persona system integration (Caret, Osarang, Madobe Ichika, Cheong Ma-shin, Tanto Ubuntu).
- Cline/Caret mode toggle, 4-language support, system prompt improvements, 36 providers/300 models.
- Docs sites in progress.

## [0.1.2] 2025-08-13
- Fix browser_action tool loading for next-gen models.
- DeepSeek V3 support, token optimization, API cost controls.
- Architecture docs and guides update.

## [0.1.1] 2025-07-18
- Initial Caret branding system, enhanced i18n base, VS Code API conflict fixes.
- TDD/Testing framework foundation.

## [0.1.0] 2025-07-06
- Initial Caret release (minimal-change fork of Cline).
- Caret-specific extension architecture in `caret-src/`.
- Dual-mode system, JSON-based prompt templates, comprehensive docs, multi-language support, TDD pipeline.
