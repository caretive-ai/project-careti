
[Read this document in English](./README.md) | [한국어로 읽기](./README.ko.md) | [日本語で読む](./README.ja.md) | [阅读中文版](./README.zh-cn.md)

<div align="center">
  <img src="caret-assets/icons/icon.png" alt="Caret icon" width="128">
  <h1>Caret: Your New AI Companion</h1>
  <p><strong>Adding Cursor's Flexibility to Cline's Transparency</strong></p>
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=caretive.caret">
      <img src="https://img.shields.io/visual-studio-marketplace/v/caretive.caret.svg?color=blue&label=VS%20Code%20Marketplace" alt="VS Code Marketplace">
    </a>
    <a href="https://github.com/aicoding-caret/caret">
      <img src="https://img.shields.io/github/stars/aicoding-caret/caret.svg?style=social&label=Star" alt="GitHub stars">
    </a>
  </p>
</div>

Caret is more than just an AI coding tool; it's a VS Code extension that aims to be an **AI companion growing with developers**. It preserves the proven advantages of the open-source [Cline](https://github.com/cline/cline) while 'overlaying' more powerful and flexible features to maximize the development experience.

## ✨ What Makes Caret Different?

| Feature | Cline | Cursor | **Caret** |
| :--- | :--- | :--- | :--- |
| **AI Behavior** | Plan/Act (somewhat rigid) | Ask/Agent (natural) | **Chatbot/Agent Mode (more intuitive and powerful)** |
| **AI Transparency** | ✅ Open Source (High) | ❌ Black Box (Low) | **✅ Open Source + Improved System Prompt (Very High)** |
| **AI Efficiency** | Basic | Basic | **50% Token Savings through System Prompt Optimization** |
| **Persona Support** | ❌ Not Supported | ❌ Not Supported | **✅ Template & Custom Personas, Profile Image Support** |
| **Multilingual Support** | ❌ Not Supported | ❌ Not Supported | **✅ Full Multilingual Support (i18n Overlay)** |
| **Architecture** | Core Features | Closed | **Overlay Structure (Stability + Extensibility)** |

### 1. More Natural AI Conversation: Chatbot & Agent Mode
Beyond Cline's somewhat rigid Plan/Act mode, Caret offers **Chatbot/Agent Mode**—flexible like Cursor's Ask/Agent, but more intuitive than 'Ask'. We haven't just changed the interaction style; we've **improved the system prompts** to enhance both AI response performance and demeanor. Through [verified experiments](./caret-docs/reports/experiment/json_caret_performance_test_20250713/comprehensive-performance-report-20250717.md), we've achieved **50% token savings** and **20% API cost reduction**, enabling smarter and more cost-predictable AI collaboration.

### 2. Create Your Own AI Companion: Custom Personas
<img src="caret-assets/template_characters/caret_illust.png" alt="Caret Persona Illustration" width="300"/>

Add joy to your coding with Caret's pre-prepared **template personas** like K-POP idols, OS-tans, and more. You can **register your own AI agent name and profile image** to create a visually vibrant development environment.

**Default Personas:**
*   <img src="caret-assets/template_characters/caret.png" width="24" align="center"/> **Caret**: A friendly robot friend who loves coding and helps developers.
*   <img src="caret-assets/template_characters/sarang.png" width="24" align="center"/> **Oh Sarang**: A K-pop idol and a tsundere engineering girl who helps you navigate between logic and emotion.
*   <img src="caret-assets/template_characters/ichika.png" width="24" align="center"/> **Madobe Ichika**: A neat and reliable assistant inspired by Windows 11.
*   <img src="caret-assets/template_characters/cyan.png" width="24" align="center"/> **Cyan Macin**: A concise and efficient helper modeled after macOS.
*   <img src="caret-assets/template_characters/ubuntu.png" width="24" align="center"/> **Tando Ubuntu**: A warm collaborator who solves problems with an open-source spirit.

### 3. Coding Without Language Barriers: Full Multilingual Support
Other AI tools often overlook multilingual support, but Caret solves this. With an **i18n-based overlay architecture**, developers unfamiliar with English can fully utilize all features in their native languages, including **Korean, Japanese, and Chinese**.

### 4. Stability and Extensibility: Overlay Architecture
Caret preserves the core of Cline's proven stability and layers its innovative features on top as an 'overlay'. This allows you to benefit from **Cline's stability and transparency** while experiencing **Caret's powerful extensibility**.

## 🚀 Getting Started

1.  **Installation:** Search for **"Caret"** in the VS Code Marketplace and install it. (Coming Soon)
2.  **Select Persona:** Choose your favorite AI persona from the sidebar or create your own.
3.  **Start Chatting:** Begin coding with your AI companion!

## 🔮 Future Vision & Roadmap

Caret continues to evolve towards becoming the 'ultimate AI companion'.

*   **Self-Login & Credit System:** We are preparing self-login functionality (available within 1 week) and a credit purchase system (available within 2 weeks).
*   **sLLM & Sovereign Model Support:** We will enhance support for local LLMs (sLLM) and specialized sovereign models for security and cost efficiency.
*   **Community-Driven Feature Expansion:** We plan to add features co-created with user feedback and contributions.

## 🤝 Contribute

Caret is an open-source project that grows with your participation. We welcome any form of collaboration, including bug reports, feature suggestions, and code contributions!

### 🌟 Contribution Types

| Contribution Type | Description | Benefits |
|-------------------|-------------|----------|
| **💻 Code Contribution** | Feature development, bug fixes, documentation improvements | Service Credits + GitHub Contributor Listing |
| **🐛 Bug Report** | Issue reporting, providing reproduction steps | Service Credits |
| **💡 Idea Suggestion** | Proposing new features, improvements | Service Credits |
| **💰 Financial Contribution** | Project sponsorship, development support | Service Credits + Special Contributor Listing |
| **📖 Documentation** | Writing guides, translations, tutorials | Service Credits + Documentation Contributor Listing |

### 🎁 Contributor Benefits

- **Service Usage Credits**: Caret service credits provided based on contribution scale
- **GitHub Contributor Listing**: Name listed in project README and release notes
- **Service Page Listing**: Profile listed on the official website's contributor page
- **Priority Support**: Priority access to new features and beta versions

### 🚀 How to Get Started

1. **Check Issues**: Find issues to contribute to on [GitHub Issues](https://github.com/aicoding-caret/caret/issues)
2. **Join Discussion**: Share feature suggestions or questions in Issues or Discussions
3. **Code Contribution**: Contribute code through Fork → Develop → Pull Request process
4. **Documentation Contribution**: Improve or translate documents in the `caret-docs/` folder

For detailed contribution guidelines, please refer to [CONTRIBUTING.md](./CONTRIBUTING.en.md).

---

## 🛠️ Information for Developers

All information necessary for Caret project development is systematically organized here.

### 📚 Core Development Guides

#### 🏗️ Architecture & Design
- **[Developer Guide (DEVELOPER_GUIDE.md)](./DEVELOPER_GUIDE.en.md)** - Basic information on build, test, and packaging
- **[Development Guide Overview (development/)](./caret-docs/development/index.en.mdx)** - Navigation for all development guides
- **[Caret Architecture Guide](./caret-docs/development/caret-architecture-and-implementation-guide.en.mdx)** - Fork structure, extension strategy, design principles
- **[Extension Architecture Diagram](./caret-docs/development/extension-architecture.mmd)** - Overall system structure visualization (Mermaid)
- **[New Developer Guide](./caret-docs/development/new-developer-guide.en.mdx)** - Project onboarding and development environment setup

#### 🧪 Testing & Quality Management
- **[Testing Guide](./caret-docs/development/testing-guide.en.mdx)** - TDD, test writing standards, coverage management
- **[Logging System](./caret-docs/development/logging.en.mdx)** - Integrated logging, debugging, development/production modes

#### 🔄 Frontend-Backend Communication
- **[Interaction Patterns](./caret-docs/development/frontend-backend-interaction-patterns.en.mdx)** - Preventing circular messages, Optimistic Update
- **[Webview Communication](./caret-docs/development/webview-extension-communication.en.mdx)** - Message types, state management, communication structure
- **[UI-Storage Flow](./caret-docs/development/ui-to-storage-flow.en.mdx)** - Data flow and state management patterns

#### 🤖 AI System Implementation
- **[AI Message Flow Guide](./caret-docs/development/ai-message-flow-guide.en.mdx)** - Complete AI message send/receive flow
- **[System Prompt Implementation](./caret-docs/development/system-prompt-implementation.en.mdx)** - System prompt design and implementation
- **[Message Processing Architecture](./caret-docs/development/message-processing-architecture.en.mdx)** - Message processing system design

#### 🎨 UI/UX Development
- **[Component Architecture](./caret-docs/development/component-architecture-principles.en.mdx)** - React component design principles
- **[Frontend i18n System](./caret-docs/development/locale.en.mdx)** - Multilingual support implementation (UI)
- **[Backend i18n System](./caret-docs/development/backend-i18n-system.en.mdx)** - Multilingual support implementation (System Messages)

#### 🔧 Development Tools & Utilities
- **[Utilities Guide](./caret-docs/development/utilities.en.mdx)** - Development utilities usage
- **[File Storage and Image Loading](./caret-docs/development/file-storage-and-image-loading-guide.en.mdx)** - File processing system
- **[Link Management Guide](./caret-docs/development/link-management-guide.en.mdx)** - Link management system
- **[Support Model List](./caret-docs/development/support-model-list.en.mdx)** - AI model support status

#### 📖 Documentation & Conventions
- **[Documentation Guide](./caret-docs/development/documentation-guide.en.mdx)** - Documentation standards and conventions
- **[JSON Comment Conventions](./caret-docs/development/json-comment-conventions.en.mdx)** - JSON file comment writing rules

#### 🤖 AI Work Methodology
- **[AI Work Index Guide](./caret-docs/development/ai-work-index.en.mdx)** - **AI Essential Pre-Reading** 📋
- **[AI Work Guide](./caret-docs/guides/ai-work-method-guide.en.mdx)** - TDD, architecture review, Phase-based work

### 🎯 Quick Start Workflow

1. **Environment Setup**: [Developer Guide](./DEVELOPER_GUIDE.en.md) → [Development Guide Overview](./caret-docs/development/index.en.mdx)
2. **Project Understanding**: [New Developer Guide](./caret-docs/development/new-developer-guide.en.mdx) → [Caret Architecture Guide](./caret-docs/development/caret-architecture-and-implementation-guide.en.mdx)
3. **AI System Understanding**: [AI Message Flow Guide](./caret-docs/development/ai-message-flow-guide.en.mdx) → [System Prompt Implementation](./caret-docs/development/system-prompt-implementation.en.mdx)
4. **Start Development**: [AI Work Guide](./caret-docs/guides/ai-work-method-guide.en.mdx) → [Testing Guide](./caret-docs/development/testing-guide.en.mdx)
5. **Advanced Features**: [Interaction Patterns](./caret-docs/development/frontend-backend-interaction-patterns.en.mdx) → [Component Architecture](./caret-docs/development/component-architecture-principles.en.mdx)

### 📖 Additional Resources

- **[Task Documents](./caret-docs/tasks/)** - Specific implementation task guides
- **[Strategy Documents](./caret-docs/strategy-archive/)** - Project vision and roadmap
- **[User Guide](./caret-docs/user-guide/)** - Usage instructions for end-users

💡 **Mandatory read before starting development**: Please familiarize yourself with the TDD-based development process and architectural principles in the [AI Work Methodology Guide](./caret-docs/guides/ai-work-method-guide.en.mdx).

⚡ **Want to understand AI system?**: Check the [AI Message Flow Guide](./caret-docs/development/ai-message-flow-guide.en.mdx) to see the complete process of how user messages are sent to AI and responses are received!
