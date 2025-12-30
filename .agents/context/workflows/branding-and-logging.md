You are documenting the current state of Caret's branding and logging systems.

<detailed_sequence_of_steps>
# Branding and Logging Systems - Current Implementation Status

## Branding Principles (Implemented)

### User-Facing Elements → "Caret"
- **UI Text**: All visible text displays "Caret" instead of "Cline"
- **File Names**: Extension files use Caret naming
- **User Interface**: Settings, menus, and dialogs show Caret branding
- **Extension Display Name**: VSCode marketplace shows "Caret"

### Internal Implementation → Keep "cline" 
- **Command IDs**: VSCode command identifiers remain as `cline.*`
- **Context Variables**: Internal VSCode context variables use `cline`  
- **Function Names**: Core function names maintain Cline compatibility
- **API Endpoints**: Internal API calls preserve Cline structure

### Implementation Pattern
```typescript
// ✅ Correct: User-facing display
displayName: "Caret Assistant"
title: "Caret - AI Coding Assistant"

// ✅ Correct: Internal implementation  
commandId: "cline.openChat"
contextKey: "cline.isActive"
functionName: "clineProvider.handleMessage"
```

## Branding Utilities (MUST USE)

> **중요**: 브랜드명을 계산하거나 노출할 때는 반드시 공용 유틸을 호출하세요. 직접 문자열을 하드코딩하거나 별도 헬퍼를 만들면 B2B 브랜드(Rename Run)에서 누락이 발생합니다.

- **TypeScript / VS Code Extension**: `caret-src/utils/brand-utils.ts`
  - `getCurrentBrandName`, `getBrandDisplayName`, `getBrandRulesFileName` 등을 통해 UI/알림/파일명을 결정합니다.
  - 예시
    ```ts
    import { getCurrentBrandName } from "@caret/utils/brand-utils"

    banner.title = `${getCurrentBrandName()} CLI 설치 안내`
    ```
- **Go / CLI 레이어**: `cli/pkg/common/branding.go`
  - `common.BrandDisplayName()`를 통해 바이너리 이름이 `caret`, `cline`, B2B 스핀오프일 때 모두 일관된 문구를 제공합니다.
  - 예시
    ```go
    import "github.com/cline/cli/pkg/common"

    fmt.Printf("Welcome to %s CLI\\n", common.BrandDisplayName())
    ```

이 두 파일 외에 브랜드명을 계산하는 메서드가 등장하면 안 됩니다. 새 기능을 작성할 때는 관련 문서(본 워크플로와 caret-docs/features/f03-branding-ui.md)를 다시 확인하고, 리뷰 시에도 브랜드 util 사용 여부를 반드시 체크하세요.

## Logging System Architecture (Current State)

### Backend Logging → Unified Cline System
- **Status**: ✅ **Integrated with Cline Logger**
- **Implementation**: All backend logging uses existing Cline logging infrastructure
- **Location**: Uses Cline's `Logger` class from `@/services/logging/Logger`
- **Pattern**: 
  ```typescript
  import { Logger } from "@/services/logging/Logger"
  Logger.debug("Caret functionality message")
  Logger.info("Backend operation completed")
  ```

### Frontend Logging → CaretWebviewLogger  
- **Status**: ✅ **Separate CaretWebviewLogger implemented**
- **Purpose**: Frontend-specific logging for webview components
- **Development Mode**: Console logging enabled in development builds
- **Production Mode**: Minimal logging to avoid console pollution

```typescript
// Frontend logging pattern
if (process.env.NODE_ENV === "development") {
  console.log(`[CARET UI] Component rendered: ${componentName}`)
}

// Using CaretWebviewLogger
import { CaretWebviewLogger } from "@/caret/utils/CaretWebviewLogger"
CaretWebviewLogger.debug("User interaction", { action: "click", component: "persona-selector" })
```

## File Structure

### Backend Integration
```
src/services/logging/
├── Logger.ts                    # Cline's main logger (used by Caret backend)
└── (Caret uses existing infrastructure)

caret-src/
├── utils/                       # Caret-specific utilities
└── (extends Cline functionality)
```

### Frontend Separation  
```
webview-ui/src/caret/
├── utils/
│   └── CaretWebviewLogger.ts    # Caret-specific frontend logging
├── components/                   # Caret UI components with logging
└── hooks/                       # Caret-specific React hooks
```

## Logging Guidelines

### Backend (Use Cline Logger)
```typescript
// ✅ Correct: Unified backend logging
import { Logger } from "@/services/logging/Logger"

Logger.debug("Caret feature initialized")
Logger.info("User selected persona: creative")
Logger.error("Caret API call failed", { error: errorDetails })
```

### Frontend (Use CaretWebviewLogger)
```typescript
// ✅ Correct: Caret-specific frontend logging  
import { CaretWebviewLogger } from "@/caret/utils/CaretWebviewLogger"

// Development only
if (process.env.NODE_ENV === "development") {
  CaretWebviewLogger.debug("Component state updated", { newState })
}

// Production-safe logging
CaretWebviewLogger.info("User action completed", { action: "persona-change" })
```

## Forbidden Practices

### ❌ Don't Do This:
```typescript
// ❌ Don't create separate backend logger
import { CaretLogger } from "@/services/logging/CaretLogger" // Doesn't exist

// ❌ Don't use Cline Logger in frontend
import { Logger } from "@/services/logging/Logger" // Wrong context

// ❌ Don't leave console.log in production frontend
console.log("Debug info") // Will appear in user's DevTools
```

## Integration Benefits

### Unified Backend Logging
- **Consistency**: All logs follow Cline's established patterns
- **Maintenance**: Single logging system to maintain and configure  
- **Compatibility**: No conflicts between Cline and Caret logging
- **Performance**: Leverages existing optimized logging infrastructure

### Separated Frontend Logging
- **Development**: Rich debugging information during development
- **Production**: Clean, minimal logging that doesn't overwhelm users
- **Isolation**: Frontend issues don't interfere with backend logging
- **Flexibility**: Can be easily adjusted for Caret-specific needs

## Current Status Summary
- ✅ **Backend**: Successfully integrated with Cline Logger
- ✅ **Frontend**: CaretWebviewLogger implemented and working
- ✅ **Branding**: User-facing elements use Caret, internals use cline
- ✅ **No Conflicts**: Systems operate independently and harmoniously

## Related Workflows
- Apply `/cline-modification` when touching existing Cline logging code
- Use `/new-component` when adding components that need logging
- Consider `/critical-verification` when logging changes affect error handling
- When executing a B2B branding run, capture notes in `caret-docs/work-logs/` and mirror any rule-handling updates here and in `AGENTS.md`.
</detailed_sequence_of_steps>

<general_guidelines>
This workflow documents the current implemented state of branding and logging systems.

The integration approach ensures compatibility while maintaining clear separation of concerns.

Both systems are production-ready and follow established patterns.
</general_guidelines>
