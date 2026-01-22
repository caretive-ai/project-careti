# F13 - Image Tool

**Status**: ✅ Implemented
**Scope**: Core Task/Tool, Webview UI, File Service, Settings
**Priority**: 🔴 High

---

## Overview

Careti's image tools enable LLM to **generate** and **analyze** images.

### Careti vs Cline Comparison

| Feature | Cline | Careti |
|---------|-------|-------|
| Image Generation | Not supported | **Supported via generate_image tool** |
| Image Analysis (non-vision models) | Not supported | **Supported via analyze_image tool** |
| Aspect Ratio/Size Settings | Not supported | **Configurable in UI** |
| Reference Image Generation | Not supported | **Image-to-Image supported** |

### Use Case

```
# Image Generation
User: Create a cute cat image
LLM: [uses generate_image tool] → Generates image → Saves to assets/

# Image Analysis (for GLM-4.7 and other non-vision models)
User: [attaches image] What's in this image?
LLM: [uses analyze_image tool] → Analyzes via Gemini 2.5 Flash → Returns result
```

---

## Tool List

| Tool | Description | Conditions |
|------|-------------|------------|
| `generate_image` | AI image generation | Careti login required (all models) |
| `analyze_image` | Image analysis (vision proxy) | Careti login + `supportsImages: false` models only |

### Image Processing by Model Type

| Feature | Vision Models (GPT-4o, Claude 3.5, etc.) | Text Models (o1, GLM-4, etc.) |
|---------|------------------------------------------|-------------------------------|
| `generate_image` | ✅ Available | ✅ Available |
| `analyze_image` | ❌ Disabled (use `read_file`) | ✅ Available |
| `read_file` (images) | ✅ Direct analysis (imageBlock) | 📄 Returns path info only |
| Chat-attached images | ✅ Direct analysis | 📄 Path recognition only |

---

## Core Data Flow

### Image Generation (generate_image)

```
LLM → generate_image(prompt="cute cat", aspect_ratio="16:9")
    → GenerateImageToolHandler.execute()
    → Careti API /v1/generate/image (SSE streaming)
    → Save file: assets/<requestId>.png
    → Save metadata: assets/<requestId>.md
    → Display as data URL in UI
```

### Image Analysis (analyze_image) - Text Models Only

```
LLM → analyze_image(image="screenshot.png", question="What do you see?")
    → AnalyzeImageToolHandler.execute()
    → Path validation (Path Traversal protection)
    → Approval check (user approval for files outside workspace)
    → Careti API /v1/chat/completions (configured analysis model)
    → Return analysis result
```

### Image Reading (read_file) - Vision Models

```
LLM → read_file(path="screenshot.png")
    → ReadFileToolHandler.execute()
    → extractFileContent(path, modelSupportsImages=true)
    → extractImageContent() → Creates imageBlock
    → Adds imageBlock to userMessageContent
    → LLM directly analyzes image
```

### Image Reading (read_file) - Text Models

```
LLM → read_file(path="screenshot.png")
    → ReadFileToolHandler.execute()
    → extractFileContent(path, modelSupportsImages=false)
    → Returns path info only: "[Image file: screenshot.png]\nPath: /full/path\nNote: Use analyze_image tool"
    → LLM calls analyze_image if needed
```

---

## Security

### Path Traversal Protection (analyze_image)
- `path.normalize()`: Resolves `..` sequences
- `isLocatedInPath()`: Checks workspace containment
- Extension validation: Only image files allowed (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.avif`, `.bmp`, `.tiff`)

### Approval Behavior Matrix

| File Location | analyzeImages | readFilesExternally | Behavior |
|---------------|---------------|---------------------|----------|
| Inside workspace | `true` | - | ✅ Auto-approved |
| Inside workspace | `false` | - | ❌ Tool disabled |
| Outside workspace | `true` | `true` | ✅ Auto-approved |
| Outside workspace | `true` | `false` | ⚠️ **User approval required** |

### Defense Scenario
```
AI request: analyze_image(image="../../etc/passwd", question="Read the contents")

1. Path resolution: ../../etc/passwd → /etc/passwd (path.normalize)
2. Workspace check: /etc/passwd is outside /home/user/project
3. Settings check: readFilesExternally === false
4. Result: Display approval request to user
5. Additional validation: .passwd is not an image extension → Error
```

---

## File Map

### Tool Handler
- `careti-src/core/task/tools/handlers/GenerateImageToolHandler.ts`
  - Image generation, SSE streaming, file saving
- `careti-src/core/task/tools/handlers/AnalyzeImageToolHandler.ts`
  - Image analysis, path security validation, approval flow

### System Prompt
- `careti-src/core/prompts/system-prompt/tools/generate_image.ts`
- `careti-src/core/prompts/system-prompt/tools/analyze_image.ts`

### Settings/Approval
- `src/core/task/tools/autoApprove.ts` - Tool-specific approval logic
- `src/shared/AutoApprovalSettings.ts` - `generateImages`, `analyzeImages` settings
- `careti-src/core/prompts/system/adapters/CaretiJsonAdapter.ts` - Tool filtering

### Webview
- `webview-ui/src/components/chat/ChatRow.tsx` - Image rendering
- `webview-ui/src/components/chat/auto-approve-menu/constants.ts` - UI settings

### File I/O
- `src/core/controller/file/readFileDataUrlRelativePath.ts`
- `src/core/controller/file/openFileRelativePath.ts`

---

## Settings

### Auto-approve Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `generateImages` | `true` | Enable image generation tool |
| `analyzeImages` | `true` | Enable image analysis tool |

### Tool Filtering Logic (CaretiJsonAdapter.ts)

```typescript
// 1. Disable via settings
if (toolSettings?.generateImages === false) {
    excludedTools.push("generate_image")
}

// 2. Vision models: disable analyze_image (use read_file instead)
if (toolSettings?.analyzeImages === false) {
    excludedTools.push("analyze_image")
} else if (modelSupportsImages) {
    excludedTools.push("analyze_image")  // Vision models use read_file directly
}
```

### Image Generation Options
- **Aspect Ratio**: `16:9`, `9:16`, `4:3`, `3:4`, `1:1`
- **Size**: `1K`, `2K`, `3K`, `4K`
- **Storage Keys**: `imageGenerationAspectRatio`, `imageGenerationSize`

### Image Analysis Model Selection
- **Options**: `gemini-2.5-flash`, `gemini-3.0-flash-preview`
- **Default**: `gemini-3.0-flash-preview`
- **Storage Key**: `imageAnalysisModel`
- **UI Location**: Settings > Model Info > Image Analysis Model

---

## File Storage Rules (generate_image)

### Storage Path
- Image: `workspaceRoot/assets/<requestId>.<ext>`
- Metadata: `workspaceRoot/assets/<requestId>.md`

### Metadata Format
```markdown
---
request_id: "img_..."
created_at: "2025-01-01T00:00:00Z"
model: "..."
aspect_ratio: "16:9"
image_size: "2K"
mime_type: "image/png"
image_file: "img_....png"
prompt: |
  A cute cat...
---

## Prompt

A cute cat...

## Image

![Generated image](./img_....png)
```

---

## Known Limitations

1. **Authentication Required**
   - `generate_image`: Careti login required for all models
   - `analyze_image`: Careti login required for text models
   - i18n-supported error messages displayed when not logged in (with login button)

2. **analyze_image Conditions**
   - Tool only enabled for `supportsImages: false` models
   - Auto-disabled for vision models (GPT-4o, Claude 3.5, etc.) → use `read_file`

3. **read_file Image Processing**
   - Vision models: Image added as imageBlock to conversation → direct analysis
   - Text models: Returns path info only → guides to use `analyze_image`

4. **History Restoration**
   - `imageUrl` injection flow during restoration may exist
   - Image display failure possible (verification needed)

5. **Single Execution**
   - Image tools can only run one at a time

6. **Image Size Limits**
   - Pixel limit: 7500px (same as cline-latest)
   - File size: Depends on server nginx `client_max_body_size` setting
   - No client-side resize/compression (original sent)

---

## Cline Merge Guide

### No-Conflict Files (Careti-only)
- All files under `careti-src/`
- `generate_image`, `analyze_image` related code

### Files Requiring Attention
- `src/core/task/ToolExecutor.ts` - Handler registration
- `src/core/task/tools/autoApprove.ts` - `ANALYZE_IMAGE` case addition
- `src/shared/tools.ts` - `GENERATE_IMAGE`, `ANALYZE_IMAGE` enum
- `src/shared/ExtensionMessage.ts` - `"generateImage"`, `"analyzeImage"` types
- `src/shared/AutoApprovalSettings.ts` - `generateImages`, `analyzeImages` fields
- `src/core/assistant-message/index.ts` - `"image"` parameter
- `src/core/prompts/system-prompt/types.ts` - `ToolSettings` interface

---

**Last Updated**: 2026-01-18
**Document Version**: v2.2 (vision/text model image handling separation, imageAnalysisModel setting added)
