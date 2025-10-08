<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/English-2563eb?style=for-the-badge&labelColor=1e40af" alt="English"/>
      </td>
      <td align="center">
        <a href="./caret-docs/ko/CHANGELOG.md">
          <img src="https://img.shields.io/badge/한국어-16a34a?style=for-the-badge&labelColor=15803d" alt="한국어"/>
        </a>
      </td>
      <td align="center">
        <a href="./caret-docs/ja/CHANGELOG.md">
          <img src="https://img.shields.io/badge/日本語-ea580c?style=for-the-badge&labelColor=c2410c" alt="日本語"/>
        </a>
      </td>
      <td align="center">
        <a href="./caret-docs/zh-cn/CHANGELOG.md">
          <img src="https://img.shields.io/badge/中文-dc2626?style=for-the-badge&labelColor=b91c1c" alt="中文"/>
        </a>
      </td>
    </tr>
  </table>
</div>

# Changelog

## [0.2.4] - 2025-10-08
 - **Major Update**: Merged Cline `upstream/main` (up to `v3.32.6`) and adapted to significant architectural changes. This resolves a large number of compile errors caused by the upstream refactoring.

## [0.2.3] - 2025-10-01
 - **New Feature**: Implement input history with arrow keys in the chat input box.
 - **New Feature**: Implement LiteLLM model fetching and refactor CaretBrandConfig to FeatureConfig
 - **Enhancement**: Strengthen agent protocol for explicit approval, adding conversational flexibility
 - **Enhancement**: Refactor system prompt and add Korean docs (especially for COLLABORATIVE_PRINCIPLES)
 - **Bug Fix**: Fix ActionButtons layout overflow when two buttons are displayed

## [0.2.22]
 - **System Prompt Enhancements**: Restored and supplemented Caret's unique collaborative attitude and cost-saving system prompts that were missing during Cline merging process
 - **Translation Fix**: Fixed missing browser-related translations

## [0.2.21]

- **Persona System Fixes & Improvements**:
  - **Bug Fix**: Fixed a critical bug where persona images would reset to the default Caret avatar on app restart. This issue occurred because the backend handler was not properly processing `asset:/` URIs from template personas, preventing images from being saved to global storage.
  - **Feature Enhancement**: Changed the initial setup flow. After API key submission, users are now guided directly to the persona template selector to set up their persona immediately.
  - **UX Improvement**: Improved and consolidated the instructional text for the persona selector for better clarity. (Korean/English)

## [0.2.0]

- **Cline v3.26.6 Merge**: Merged the latest Cline upstream (`v3.26.6`, commit `c6aa47095ee47036946c6a51339a4fa22aaa073c`) via merge commit `f8bd960b4`. See [CHANGELOG-CLINE.md](CHANGELOG-CLINE.md) for details.
  - **Major User Feature Updates**:
    - **Latest AI Model Support**: Support for the latest models like GPT-5, Claude 4, Grok, and enhanced AI capabilities.
    - **15+ New API Providers**: Integration with Hugging Face, Groq, and 15+ other new services.
    - **Task Management (Focus Chain)**: Added automatic to-do list generation and tracking for complex tasks.
    - **Convenience Features**: Auto Compact conversations, improved checkpoints, Mermaid diagram preview, and many more features.
  - **Major Development Structure Changes**:
    - Backend architecture improvements and enhanced API provider system
    - Frontend UI enhancements and better user experience
    - Enhanced MCP (Model Context Protocol) support

## [0.1.3] - 2025-01-11

- 🎉 **Major Update**: Caret Integration with Persona System
- feat: Personalized AI persona support (Caret, Oh Sarang, Madobe Ichika, Cyan Macin, Tando Ubuntu)
- feat: Cline/Caret mode toggle - Switch to original Cline method anytime
- feat: Perfect 4-language support (Korean, English, Japanese, Chinese)
- feat: Enhanced system prompts for more efficient AI responses
- feat: 36 providers supporting 300 models
- feat: docs.cline.bot multilingual documentation in progress

### 🎭 Caret-Exclusive Features
- Register your own AI name and profile image
- Choose from template personas or fully customize
- Chatbot/Agent mode for more intuitive conversations
- Maintain perfect Cline compatibility

### 🌍 Multilingual Support
- Complete 4-language support for UI, documentation, and manuals
- Dedicated documentation site for each language
- Real-time language switching capabilities

### 🚀 **Latest Cline v3.26.6 Architecture Fully Compatible**
- All Cline features work exactly as before
- Plan/Act mode preservation
- MCP support maintained
- Zero Trust security architecture
- Free model switching between Claude, Gemini, Kimi, etc.

## [0.1.2] - 2025-01-05

- fix: Resolved browser_action tool loading issue for next-generation model families
- feat: Enhanced support for DeepSeek V3 and latest reasoning models
- fix: Improved token usage optimization and API cost management
- docs: Updated architecture documentation and implementation guides

## [0.1.1] - 2024-12-28

- feat: Initial Caret branding system implementation
- feat: Enhanced multilingual i18n support foundation
- fix: VS Code API conflict resolution
- docs: Added comprehensive development documentation
- test: Established TDD-based testing framework

## [0.1.0] - 2024-12-20

- 🎉 **Initial Caret Release**: Fork from Cline with minimal modification strategy
- feat: Caret-specific extension architecture in `caret-src/` directory
- feat: Dual-mode system (Caret Mode / Cline Mode) foundation
- feat: Enhanced system prompt architecture with JSON-based templates
- feat: Comprehensive documentation system in `caret-docs/`
- feat: Multi-language support infrastructure
- feat: TDD-based development methodology implementation

### 🏗️ Architecture Foundation
- Minimal modification approach for Cline compatibility
- Level 1-3 modification framework
- gRPC-based frontend-backend communication
- Backup system for safe Cline file modifications

### 🧪 Development Infrastructure  
- Vitest testing framework setup
- Comprehensive CI/CD pipeline
- Documentation-driven development approach
- Community contribution guidelines

---

**Note**: Caret maintains 100% compatibility with Cline while adding powerful extensions. Users can switch between Caret and Cline modes seamlessly.

---

# Upstream Cline Changelog

## [3.32.6]

- Add experimental support for VSCode multi root workspaces
- Add Claude Sonnet 4.5 to Claude Code provider
- Add Glm 4.6 to Z AI provider 

## [3.32.5]

- Improve thinking budget slider UI to take up less space
- Fix Vercel provider cost note and sign-up url
- Fix repeated API error 400 in SAP AI Core provider
- Add us-west-1 to Amazon Bedrock regions
- Fix OCA provider refresh logic

## [3.32.4]

- Add 1m context window support to Claude Sonnet 4.5
- Add Claude Sonnet 4.5 to GCP Vertex
- Add prompt caching support for OpenRouter accidental `anthropic/claude-4.5-sonnet` model ID

## [3.32.3]

- Add Claude Sonnet 4.5 to Bedrock provider
- Add Alert banner for new Claude Sonnet 4.5 model

## [3.32.2]

- Add Claude Sonnet 4.5 to Cline/OpenRouter/Anthropic providers
- Add /task deep link handler

## [3.32.1]

- Preserve reasoning traces for Cline/OpenRouter/Anthropic providers to maintain conversation integrity
- Add automatically retry on rate limit errors with SAP AI Core provider
- Fix Cline accounts using stale id token at refresh response
- Minor UI improvements to Settings and Task Header

## [3.32.0]

- Added the new code-supernova-1-million stealth model, available for free and delivering a 1 million token context window
- Changes to inform Cline about commands that are available on your system

## [3.31.1]

- Version bump

## [3.31.0]

- UI Improvements: New task header and focus chain design to take up less space for a cleaner experience
- Voice Mode: Experimental feature that must be enabled in settings for hands-free coding
- YOLO Mode: Enable in settings to let Cline approve all actions and automatically switch between plan/act mode
- Fix Oracle Code Assist provider issues

## [3.30.3]

- Add Oracle Code Assist provider

## [3.30.2]

- Fix UI tests

## [3.30.1]

- Fix model list not being updated in time for user to use shortcut button to update model to stealth model
- Fix flicker issue when switching modes
- Fix Sticky header in settings view overlaping with content on scroll
- Add experimental yolo mode feature that disables all user approvals and automatically executes a task and navigates through plan to act mode until the task is complete

## [3.30.0]

- Add code-supernova stealth model

## [3.29.2]

- Fix: Reverted change that caused formatting issues
- Fix: Moonshot - Pass max_tokens value to provider

## [3.29.1]

- Changeset bump + Announcement banner update

## [3.29.0]

- Updated Baseten provider to fetch models from server
- Fix: Updated insufficient balance URL for easy Cline balance top-ups
- Accessibility: Improvements to screen readers in MCP, Cline Rules, workflows, and history views.

## [3.28.4]

- Fix bug where some Windows machines had API request hanging
- Fix bug where 'Proceed while running' action button would be disabled after running an interactive command
- Fix prompt cache info not being displayed in History

## [3.28.3]

- Fixed issue with start new task button
- Feature to generate commit message for staged changes, with unstaged as fallback

## [3.28.2]

- Fix for focus chain settings

## [3.28.1]

- Requesty: use base URL to get models and API keys
- Removed focus chain feature flag

## [3.28.0]

- Synchronized Task History: Real-time task history synchronization across all Cline instances
- Optimized GPT-5 Integration: Fine-tuned system prompts for improved performance with GPT-5 model family
- Deep Planning Improvements: Optimized prompts for Windows/PowerShell environments and dependency exclusion
- Streamlined UI Experience: ESC key navigation, cleaner approve/reject buttons, and improved editor panel focus
- Smart Provider Search: Improved search functionality in API provider dropdown for faster model selection
- Added per-provider thinking tokens configurability
- Added Ollama custom prompt options
- Enhanced SAP AI Core Provider: Orchestration mode support and improved model visibility
- Added Dify.ai API Integration
- SambaNova Updates: Added DeepSeek-V3.1 model
- Better Gemini rate limit handling
- OpenAI Reasoning Effort: Minimal reasoning effort configuration for OpenAI models
- Fixed LiteLLM Caching: Anthropic caching compatibility when using LiteLLM
- Fixed Ollama default endpoint connections
- Fixed AutoApprove menu overflow
- Fixed extended thinking token issue with Anthropic models
- Fixed issue with slash commands removing text from prompt

## [3.27.2]

- Remove `grok-code-fast-1` promotion deadline

## [3.27.1]

- Add new Kimi K2 model to groq and moonshot providers

## [3.27.0]

- Fix `grok-code-fast-1` model information
- Add call to action for trying free `grok-code-fast-1` in Announcement banner

## [3.26.7]

- Add 200k context window variant for Claude Sonnet 4 to OpenRouter and Cline providers
