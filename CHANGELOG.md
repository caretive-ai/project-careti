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

## [0.3.0] - 2025-10-13

### 🎉 Cline v3.32.7 Upstream Merge

- **Merge Commit**: `03177da87` (Merge Branch: `merge/cline-upstream-20251009`)
- **New Model Support**:
  - Claude Sonnet 4.5 with 200K and 1M context window variants
  - GPT-5 support with extended thinking capabilities
  - Enhanced model information and pricing display
- **New Features**:
  - `.clineignore` file support to exclude files from Caret's access
  - AWS Bedrock profiles for multi-account management
  - Requesty, Together, Alibaba Qwen provider additions
  - Automatic retry on rate-limited requests
  - Focus Chain (Task Management) - automatic to-do list generation and tracking for complex tasks
- **Architecture Improvements**:
  - Complete protobuf-based type system migration
  - Enhanced MCP (Model Context Protocol) support
  - Provider system refactoring for better extensibility
- **See [CHANGELOG-CLINE.md](CHANGELOG-CLINE.md) for detailed upstream changes**

### 🚀 AI Prompt System Optimization

- **30-50% API Request Reduction**: Optimized multi-file editing workflow to use single API calls with multiple SEARCH/REPLACE blocks (Cline commit `41202df74`)
- **Smart TODO Management**: Automatic updates every 10th request, silent tracking, auto-creation on Chatbot→Agent mode switch (Cline commit `f0cd7fd36`)
- **Claude Sonnet 4.5 Optimized**: Enhanced context efficiency and workflow for latest model
- **Dual-Mode Compatible**: Applied to both Agent mode (execution) and Chatbot mode (suggestions)

---

## [0.2.3] - 2025-10-01
 - **New Feature**: Implemented message history navigation with arrow keys in chat input box
 - **New Feature**: Implemented LiteLLM model fetching and refactored CaretBrandConfig to FeatureConfig
 - **Enhancement**: Enhanced agent protocol for explicit approval
 - **Enhancement**: Refactored system prompts and added Korean documentation (especially COLLABORATIVE_PRINCIPLES)
 - **Bug Fix**: Fixed ActionButtons layout overflow when two buttons are displayed

## [0.2.22] - 2025-09-21
 - **System Prompt Enhancement**: Restored and supplemented Caret's unique collaborative attitude and cost-saving system prompts that were missing during the Cline merge process
 - **Translation Fix**: Fixed missing browser-related translations

## [0.2.21] - 2025-09-18

- **Persona System Fixes and Improvements**:
  - **Bug Fix**: Fixed critical bug where persona images would reset to default Caret avatar on app restart. This issue was caused by backend handlers not properly handling template persona `asset:/` URIs, preventing images from being saved to global storage.
  - **Feature Improvement**: Changed initial setup flow. After API key submission, users are now directly guided to the persona template selector to set up their persona immediately.
  - **UX Improvement**: Improved and consolidated persona selector instruction text for better clarity. (Chinese/English)

## [0.2.0] - 2025-09-11

- **Cline v3.26.6 Merge**: Merged the latest Cline upstream (`v3.26.6`, commit `c6aa47095ee47036946c6a51339a4fa22aaa073c`) through merge commit `f8bd960b4`. See [CHANGELOG-CLINE.md](CHANGELOG-CLINE.md) for details.
  - **Major User Feature Updates**:
    - **Latest AI Model Support**: Support for latest models like GPT-5, Claude 4, Grok, and enhanced AI capabilities
    - **15+ New API Providers**: Integration of 15+ new services including Hugging Face, Groq, and more
    - **Task Management (Focus Chain)**: Added automatic to-do list generation and tracking for complex tasks
    - **Convenience Features**: Conversation auto-compression, improved checkpoints, Mermaid diagram preview, and many more
  - **Major Development Structure Changes**:
    - Backend architecture improvements and enhanced API provider system
    - Frontend UI improvements and better user experience
    - Enhanced MCP (Model Context Protocol) support

## [0.1.3]

- 🎉 **Major Update**: Caret integration with persona system
- feat: Personalized AI persona support (Caret, Oh Sarang, Madobe Ichika, Cyan Macin, Tando Ubuntu)
- feat: Cline/Caret mode toggle - switch back to original Cline style anytime
- feat: Perfect 4-language support (Korean, English, Japanese, Chinese)
- feat: Enhanced system prompts for more efficient AI responses
- feat: 36 providers supporting 300 models
- feat: docs.cline.bot multilingual documentation in progress

### 🎭 Caret-Exclusive Features
- Register your own AI name and avatar
- Choose template personas or fully customize
- Chatbot/Agent mode for more intuitive conversations
- Maintains perfect Cline compatibility

### 🌍 Multilingual Support
- Complete 4-language support for UI, docs, and manuals
- Dedicated documentation sites for each language
- Real-time language switching capability

### 🚀 **Full Compatibility with Latest Cline v3.26.6 Architecture**
- All Cline features work exactly as before
- Maintains Plan/Act mode
- Maintains MCP support
- Zero-trust security architecture
- Free model switching between Claude, Gemini, Kimi, etc.

## [0.1.2] - 2025-08-13

- fix: Resolved browser_action tool loading issues for next-gen model families
- feat: Enhanced support for DeepSeek V3 and latest reasoning models
- fix: Improved token usage optimization and API cost management
- docs: Updated architecture documentation and implementation guides

## [0.1.1] - 2025-07-18

- feat: Initial Caret branding system implementation
- feat: Enhanced multilingual i18n support foundation
- fix: VS Code API conflict resolution
- docs: Added comprehensive development documentation
- test: Established TDD-based testing framework

## [0.1.0] - 2025-07-06

- 🎉 **Initial Caret Release**: Forked from Cline with minimal modification strategy
- feat: Caret-specific extension architecture in `caret-src/` directory
- feat: Dual-mode system (Caret Mode/Cline Mode) foundation
- feat: Enhanced system prompt architecture using JSON-based templates
- feat: Comprehensive documentation system in `caret-docs/`
- feat: Multilingual support infrastructure
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

**Note**: Caret maintains 100% compatibility with Cline while adding powerful extensions. Users can seamlessly switch between Caret and Cline modes.
