# B2B Branding Workflow - External Assets Guide

## Core Principle
The main Caret repository must remain brand-agnostic. All B2B branding-specific logic, assets, and configurations are managed in a **separate, private repository** (e.g., `careti-b2b-assets`). These assets must NOT be committed to the main public repository.

## 1. Pre-Work: Asset Acquisition
Before starting any branding work, ensure the private B2B assets repository is available locally.

- **Step 1**: Verify if the assets directory (e.g., `slexn-codecenter`) exists in the current workspace. This directory should be listed in `.gitignore`.
- **Step 2**: If the directory does not exist, ask the user to clone the private B2B assets repository into the current workspace. The AI agent does not have credentials to access private repositories.

**Example Verification**:
```bash
# Check if the asset directory exists
ls slexn-codecenter
```

## 2. Brand Conversion System

### Execution Method
**Direct Node.js execution** from the project root, targeting the script within the local B2B assets directory:
```bash
# Full conversion
node slexn-codecenter/tools/brand-converter.js codecenter --all

# Dry-run (simulation)
node slexn-codecenter/tools/brand-converter.js codecenter --all --dry-run
```

### Conversion Process Overview
The conversion script (`brand-converter.js`) handles all necessary changes, including:
- Metadata replacement (`package.json`, etc.)
- i18n locale file updates
- Asset and icon replacement
- Configuration adjustments

Refer to the documentation within the private B2B assets repository for details on the script's functionality.

## 3. Post-Work: Cleanup (Recommended)
For security, it is recommended to remove the local B2B assets directory after the branding task is complete.

## 4. Key File Locations (within B2B Assets Directory)

- **Main Engine**: `slexn-codecenter/tools/brand-converter.js`
- **Configuration**: `slexn-codecenter/brands/brand-config.json`
- **Assets**: `slexn-codecenter/brands/assets/`
