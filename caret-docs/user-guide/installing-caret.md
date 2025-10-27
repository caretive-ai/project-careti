---
title: "Installing Caret"
description: "Step-by-step guide to install and set up Caret in VS Code."
---

# Installing Caret

Getting started with Caret is straightforward. This guide will walk you through the installation process and initial setup.

## Prerequisites

Before installing Caret, ensure you have:

- **VS Code**: Version 1.80.0 or higher
- **Node.js**: Version 18 or higher (for development builds)
- **Git**: For cloning the repository

## Installation Methods

### Method 1: Install from VSIX (Recommended)

1. **Download the latest release**:
    - Visit the [Caret GitHub releases page](https://github.com/aicoding-caret/caret/releases)
    - Download the latest `.vsix` file

2. **Install in VS Code**:

    ```bash
    code --install-extension caret-*.vsix
    ```

    Or through VS Code UI:
    - Open VS Code
    - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
    - Type "Extensions: Install from VSIX"
    - Select the downloaded `.vsix` file

### Method 2: Build from Source

For the latest features or development purposes:

1. **Clone the repository**:

    ```bash
    git clone https://github.com/aicoding-caret/caret.git
    cd caret
    ```

2. **Install dependencies**:

    ```bash
    npm install
    cd webview-ui && npm install && cd ..
    ```

3. **Build the extension**:

    ```bash
    npm run protos
    npm run compile
    ```

4. **Package and install**:
    ```bash
    npm run package
    code --install-extension caret-*.vsix
    ```

## Initial Setup

### 1. Open Caret

After installation, you'll see the Caret icon in the VS Code sidebar. Click it to open the Caret panel.

### 2. Configure Your AI Provider

Caret supports all the same AI providers as Cline:

- **Anthropic (Claude)**
- **OpenAI (GPT-4)**
- **Google (Gemini)**
- **Local models (Ollama, LM Studio)**
- **And many more...**

Click the settings gear icon in the Caret panel to configure your preferred provider.

### 3. Choose Your Persona (Optional)

One of Caret's unique features is the AI persona system:

1. In the Caret panel, look for the persona selector
2. Choose from available personas:
    - **오사랑 (Oh Sarang)** - K-pop idol with emotional intelligence
    - **마도베 이치카 (Madobe Ichika)** - Windows-inspired efficiency
    - **사이안 매킨 (Cyan Mackin)** - macOS-inspired minimalism
    - **탄도 우분투 (Thando Ubuntu)** - Ubuntu-inspired collaboration

### 4. Set Up Rules (Optional)

Caret's smart rule management prevents conflicts:

- Create a `.clinerules` file in your project root for highest priority
- Or use `.cursorrules` or `.windsurfrules` - Caret will automatically choose the right one
- Only one rule file will be active at a time

## Verification

To verify your installation:

1. Open a project in VS Code
2. Click the Caret icon in the sidebar
3. Type a simple message like "Hello Caret!"
4. You should see a response from your chosen AI provider

## Troubleshooting

### Extension Not Appearing

- Restart VS Code
- Check that the extension is enabled in the Extensions panel
- Verify VS Code version compatibility

### Build Issues

If building from source fails:

```bash
# Clean and rebuild
npm run clean
npm install
npm run protos
npm run compile
```

### API Configuration Issues

- Verify your API keys are correctly set
- Check your internet connection
- Ensure your chosen provider's API is accessible

## Next Steps

Now that Caret is installed:

- Read about [Caret's unique features](./caret-features)
- Learn about [rule management](./rule-management)
- Explore [persona customization](./persona-system)
- Check out [task management](./task-management)

## Getting Help

If you encounter issues:

- Check the [FAQ](./faq)
- Visit our [GitHub Issues](https://github.com/aicoding-caret/caret/issues)
- Join our community discussions

Welcome to Caret! Your enhanced AI coding companion is ready to help you build amazing things. ✨
