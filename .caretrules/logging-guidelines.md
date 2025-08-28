# Caret Logging Guidelines

## Backend Logging

### Standard Cline Logger Only
- ✅ **DO**: Use standard Cline Logger for all backend logging
- ❌ **DON'T**: Use CaretLogger (removed) or caret-logger imports

```typescript
// Correct: Standard Cline Logger
import { Logger } from "@services/logging/Logger"

Logger.info("Task completed successfully")
Logger.error("Failed to process request", error)
Logger.debug("Debug information")
Logger.warn("Warning message")
```

### Why Standard Logger?
- Updated Cline Logger provides improved functionality
- Uses HostProvider for reliable VSCode output channel
- Integrates with errorService for remote error reporting
- Maintains consistency with Cline codebase

## Webview Logging

For webview components only, use CaretWebviewLogger:

```typescript
// Webview only
import { CaretWebviewLogger } from "@utils/CaretWebviewLogger"
```

## Migration Notes

- All backend CaretLogger usage has been replaced with standard Logger
- caret-logger.ts file has been removed
- Development documentation updated to reflect standard Logger usage