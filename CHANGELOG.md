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
  </table>ㅍ
</div>

# Changelog

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