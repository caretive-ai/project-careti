# B2B Branding Workflow - Caret-B2B Conversion Guide

## Core Principle
The main Caret repository must remain brand-agnostic. All branding-specific logic, assets, and configurations are isolated within the `caret-b2b` submodule.
**Restoration**: The primary method for reverting changes is `git`. The scripted backup is a secondary safety measure, not for scripted restoration.

## 1. Pre-Work Analysis
When keywords like `b2b`, `brand`, `codecenter`, or `conversion` appear, **this document must be read first**.

## 2. Frontend Conversion Process (`convert-frontend.js`)

### Key Insight: How Locale Files are Handled
Locale files (e.g., `announcement.json`) are **NOT** replaced by copying files from the brand's source folder. Instead, the original Caret files located at `webview-ui/src/caret/locale/` are modified in-place based on rules defined in `brand-config-front.json`.

### Step-by-Step Flow:
1.  **Backup**: The original `webview-ui/src/caret/locale` and `assets` directories are backed up to `caret-b2b/brands/{brand-name}/backup/`. The `backup` directory is for **storing original files only**, not for sourcing brand-specific files.
2.  **Asset Replacement**: The entire `/assets` directory is replaced with the contents of `caret-b2b/brands/{brand-name}/assets/`.
3.  **Locale Modification**: The script reads mapping rules from `brand-config-front.json` and applies them to the files inside `webview-ui/src/caret/locale/`. This is an **in-place modification**.

## 3. Backend Conversion Process (`convert-backend.js`)
- Modifies root files like `package.json` based on rules in `brand-config.json`.
- The process is generally simpler and involves text-based replacements.

## 4. Key Files to Check
- **Frontend Logic**: `caret-b2b/tools/convert-frontend.js`
- **Backend Logic**: `caret-b2b/tools/convert-backend.js`
- **Frontend Config**: `caret-b2b/brands/{brand-name}/brand-config-front.json`
- **Backend Config**: `caret-b2b/brands/{brand-name}/brand-config.json`
- **Utilities**: `caret-b2b/tools/converter-utils.js`
