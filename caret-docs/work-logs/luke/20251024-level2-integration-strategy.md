# Level 2 Integration Strategy - ClaudeCodeSDKHandler

**Date**: 2025-01-24  
**Author**: Luke  
**Related Files**: 
- `caret-src/core/api/providers/claude-code-sdk.ts` (Level 1 - Complete)
- `src/core/api/providers/claude-code.ts` (Cline original)
- `src/core/api/index.ts` (Target for minimal modification)

---

## Objective

Integrate the new ClaudeCodeSDKHandler into Caret's API provider system with **minimal changes** to Cline original files, following Level 2 conditional integration approach.

## Current State

### ✅ Level 1 Complete
- **Location**: `caret-src/core/api/providers/claude-code-sdk.ts`
- **Status**: Fully implemented, type-safe, compiled successfully
- **Independence**: 100% independent from Cline source
- **SDK Version**: @anthropic-ai/claude-agent-sdk v0.1.25

### Benefits Over CLI
1. **No 10-minute timeout limit** - configurable via AbortController
2. **No 20MB buffer limit** - native streaming
3. **No 32000 output token limit** - SDK handles pagination
4. **Built-in hook system** - PreToolUse, PostToolUse, SessionStart, SessionEnd
5. **Native subagent support** - AgentDefinition with description/prompt/tools
6. **Better performance** - direct TypeScript API, no subprocess overhead

## Level 2 Integration Approach

### Modification Scope: MINIMAL
- **Target files**: 1-2 files max in `src/`
- **Lines changed**: < 10 lines total
- **Backup required**: YES
- **CARET MODIFICATION comment**: YES
- **Approach**: Conditional selection, not replacement

### Integration Points

#### Option A: Provider Factory Pattern (Recommended)
**File**: `src/core/api/index.ts`  
**Modification**: 1-3 lines

```typescript
// CARET MODIFICATION: Add SDK option for claude-code provider
import { ClaudeCodeSDKHandler } from "../../../caret-src/core/api/providers/claude-code-sdk"

async function buildApiHandler(provider: string, options: any): Promise<ApiHandler> {
  switch (provider) {
    case "claude-code":
      // CARET MODIFICATION: Choose SDK or CLI based on user setting
      const useSDK = options.anthropicUseSdk ?? false
      return useSDK 
        ? new ClaudeCodeSDKHandler(options)
        : new ClaudeCodeHandler(options) // Original CLI
    // ... other providers
  }
}
```

**Pros**:
- Single point of integration
- User-controlled via settings
- Easy rollback (just toggle setting)
- Minimal code changes

**Cons**:
- Requires import from caret-src/ in src/

#### Option B: Separate Provider Entry (Ultra-Safe)
**File**: `src/core/api/index.ts`  
**Modification**: Add new case

```typescript
async function buildApiHandler(provider: string, options: any): Promise<ApiHandler> {
  switch (provider) {
    case "claude-code":
      return new ClaudeCodeHandler(options) // Original CLI (unchanged)
    
    // CARET MODIFICATION: New SDK-based provider
    case "claude-code-sdk":
      const { ClaudeCodeSDKHandler } = await import("../../../caret-src/core/api/providers/claude-code-sdk")
      return new ClaudeCodeSDKHandler(options)
    
    // ... other providers
  }
}
```

**Pros**:
- Zero changes to existing claude-code behavior
- Both options available simultaneously
- Dynamic import (bundle size optimization)
- Perfect for A/B testing

**Cons**:
- Users need to explicitly select "claude-code-sdk" provider

### Settings Integration

Add to provider configuration schema:

```json
{
  "anthropic": {
    "apiKey": "...",
    "useSdk": false  // CARET MODIFICATION: Enable SDK-based provider
  }
}
```

Or for Option B:

```json
{
  "provider": "claude-code-sdk"  // Instead of "claude-code"
}
```

## Verification Plan

### Phase 1: Integration Testing
1. **Unit tests**: ClaudeCodeSDKHandler test suite
2. **Integration test**: Provider factory selection logic
3. **E2E test**: Full task execution with SDK provider

### Phase 2: Performance Comparison
Compare CLI vs SDK for:
- **Timeout handling**: Long-running tasks (>10 minutes)
- **Large outputs**: Tasks with >20MB output
- **Token efficiency**: Tasks with >32K output tokens
- **Streaming latency**: Real-time response speed
- **Memory usage**: Resource consumption comparison

### Phase 3: Feature Validation
- **Subagent support**: Multi-agent workflow testing
- **Hook system**: Tool monitoring verification
- **Error handling**: Timeout, abort, failure scenarios
- **Context management**: Large conversation handling

## Implementation Steps

### Step 1: Choose Integration Option
**Decision**: Option B (Separate Provider Entry)
**Reason**: Ultra-safe, zero impact on existing behavior, perfect for gradual rollout

### Step 2: Minimal src/ Modification
```bash
# Backup
cp src/core/api/index.ts src/core/api/index.ts.cline

# Edit (1-3 line addition)
# Add case "claude-code-sdk" with dynamic import

# Verify
npm run compile
```

### Step 3: User Documentation
Create guide:
- How to enable SDK provider
- Benefits comparison table
- Migration checklist
- Rollback procedure

### Step 4: Testing Matrix
| Test Case | CLI | SDK | Expected |
|-----------|-----|-----|----------|
| Standard task (<5 min) | ✅ | ✅ | Equal |
| Long task (>10 min) | ❌ Timeout | ✅ Success | SDK wins |
| Large output (>20MB) | ❌ Truncated | ✅ Complete | SDK wins |
| Subagent workflow | ❌ N/A | ✅ Works | SDK only |
| Hook monitoring | ❌ N/A | ✅ Works | SDK only |

## Risk Assessment

### Low Risk
- ✅ Level 1 complete (caret-src/) - fully independent
- ✅ Compilation verified
- ✅ Type-safe implementation
- ✅ Minimal src/ changes (Option B)

### Mitigation Strategies
1. **Rollback**: Keep CLI as default, SDK as opt-in
2. **Testing**: Comprehensive test suite before enabling
3. **Monitoring**: Hook system provides visibility
4. **Documentation**: Clear migration path

## Next Steps

1. ✅ **Complete**: ClaudeCodeSDKHandler implementation
2. ✅ **Complete**: TypeScript compilation verification
3. ✅ **Complete**: Git commit and push
4. 🔄 **Current**: Level 2 integration strategy documentation
5. ⏭️ **Next**: Implement Option B integration
6. ⏭️ **Next**: Write comprehensive test suite
7. ⏭️ **Next**: Performance benchmark
8. ⏭️ **Next**: User documentation

## Conclusion

The Level 2 integration follows Caret's **최소 침습** (minimum invasiveness) principle perfectly:
- **1 file modified** in src/
- **3 lines added** (dynamic import case)
- **Zero impact** on existing claude-code CLI behavior
- **Full reversibility** (just remove the case)
- **User-controlled** rollout via provider selection

This approach enables safe, gradual adoption of SDK benefits while maintaining complete backward compatibility.
