# F12 Claude Code Task Tool - Caret Mode Only Implementation Plan

**Date**: 2025-10-16  
**Author**: Alpha Yang  
**Status**: Planning Phase  
**Related**: f12-claude-code-subagent-support.md

## Executive Summary

F12 기능(Claude Code Task tool 지원)을 **Caret 모드 전용**으로 제한하는 구현 계획입니다. Cline 기본 모드에서는 Task tool을 비활성화하고, Caret 모드에서만 활성화하여 upstream 기여 시 쉽게 분리할 수 있도록 합니다.

## Strategic Context

### Why Caret-Mode-Only?

1. **Upstream Contribution Strategy**
   - Cline이 수용할 준비가 되면 쉽게 기능을 "풀어줄" 수 있음
   - 모드 플래그만 제거하면 전체 활성화 가능
   - 최소 침습 원칙 유지

2. **Feature Gating Benefits**
   - Caret의 차별화 기능으로 포지셔닝
   - 안정성 검증 후 upstream 제안 가능
   - 사용자 피드백 수집 용이

3. **Clean Separation**
   - Caret-specific vs Cline-original 명확한 구분
   - 코드 리뷰 시 변경 범위 명확
   - 롤백 및 디버깅 용이

## Current Implementation Status

### Modified Files (Need Caret-Mode Restriction)

#### 1. `src/integrations/claude-code/run.ts`
**Current State**: Task tool unconditionally enabled
```typescript
const claudeCodeTools = [
  // "Task",  // Caret: Keep Task tool enabled for subagent feature
  "Bash",
  // ...
].join(",")
```

**Required Change**: Conditional enablement based on Caret mode
```typescript
// CARET MODIFICATION: Enable Task tool only in Caret mode for F12 subagent support
const isCaretMode = getCurrentCaretMode() === "caret"
const disabledTools = [
  ...(isCaretMode ? [] : ["Task"]),  // Task tool only in Caret mode
  "Bash",
  "Computer",
  // ...
]
const claudeCodeTools = disabledTools.join(",")
```

#### 2. `src/core/api/providers/claude-code.ts`
**Current State**: Unconditionally yields tool_use blocks
```typescript
case "tool_use":
  // CARET MODIFICATION: Support Task tool for subagent feature (F12)
  yield {
    type: "tool_use",
    id: content.id,
    name: content.name,
    input: content.input,
  }
  break
```

**Analysis**: 
- This code handles tool_use blocks from Claude Code API
- Should work regardless of mode (it's just stream processing)
- **Decision**: Keep as-is, no mode restriction needed

**Rationale**: 
- Stream processing layer should be mode-agnostic
- Mode filtering happens at tool enablement level (run.ts)
- If Task tool is disabled, tool_use blocks won't arrive anyway

#### 3. `src/core/api/transform/stream.ts`
**Current State**: ApiStreamToolUseChunk type added
```typescript
export type ApiStreamChunk =
  | ApiStreamTextChunk
  | ApiStreamReasoningChunk
  | ApiStreamToolUseChunk // CARET MODIFICATION
  // ...

export interface ApiStreamToolUseChunk {
  type: "tool_use"
  id: string
  name: string
  input: any
}
```

**Analysis**:
- Type definition for stream chunk processing
- Infrastructure level, not feature level
- **Decision**: Keep as-is, no mode restriction needed

**Rationale**:
- TypeScript types don't execute code
- Provides type safety for stream processing
- Mode-independent infrastructure

### New Implementation Required

#### 4. `caret-src/core/prompts/CaretPromptWrapper.ts` (NEW)
**Purpose**: Add Task tool description to system prompt in Caret mode

**Implementation**:
```typescript
export class CaretPromptWrapper {
  public static async getCaretSystemPrompt(context: CaretPromptContext): Promise<string> {
    // ... existing Caret prompt logic ...
    
    // CARET MODIFICATION: Add Task tool description for Claude Code provider (F12)
    if (context.apiProvider === "claude-code") {
      const taskToolDescription = this.getTaskToolDescription()
      // Inject into tools section
      systemPrompt = this.injectToolDescription(systemPrompt, taskToolDescription)
    }
    
    return systemPrompt
  }
  
  private static getTaskToolDescription(): string {
    return `
## Task Tool (Claude Code Built-in)

The Task tool allows you to delegate independent subtasks to parallel subagents.
Each subagent runs in isolation with its own context and can execute tools independently.

**When to use:**
- Multiple independent work items that can be parallelized
- Clear, self-contained subtasks with minimal interdependencies
- Situations where parallel execution improves efficiency

**Usage:**
<Task>
<task>Clear description of the subtask</task>
</Task>

**Important:**
- Each Task runs as a separate agent instance
- Tasks don't share context - provide complete information
- Results are returned when all tasks complete
- Use for true parallelization, not sequential dependencies
`
  }
  
  private static injectToolDescription(prompt: string, toolDesc: string): string {
    // Find the tools section and inject before closing
    // Implementation details...
  }
}
```

## Implementation Plan

### Phase 1: Mode Detection Infrastructure ✅ (Already Exists)

**Existing Mechanism**: 
```typescript
// src/core/prompts/system-prompt/index.ts
const currentMode = await CaretGlobalManager.getPromptSystemMode()
if (currentMode === "caret") {
  return await CaretPromptWrapper.getCaretSystemPrompt(context)
}
```

**Status**: Already implemented, no changes needed

### Phase 2: Conditional Tool Enablement (run.ts)

**File**: `src/integrations/claude-code/run.ts`

**Steps**:
1. Import mode detection utility
2. Add mode check before building disallowedTools
3. Conditionally include/exclude "Task" based on mode
4. Add clear CARET MODIFICATION comment

**Implementation**:
```typescript
import { CaretGlobalManager } from "@/caret/managers/CaretGlobalManager"

// ... in claudeCodeCLI function ...

// CARET MODIFICATION: Enable Task tool only in Caret mode for F12 subagent support
const isCaretMode = (await CaretGlobalManager.getPromptSystemMode()) === "caret"

const disabledTools = [
  ...(isCaretMode ? [] : ["Task"]),  // Task tool only available in Caret mode
  "Bash",
  "Computer",
  "TextEditor",
  "HostTerminal",
  "WebSearch",
]

const claudeCodeTools = disabledTools.join(",")
```

**Testing**:
- [ ] Verify Task tool disabled in Cline mode
- [ ] Verify Task tool enabled in Caret mode
- [ ] Verify other tools unaffected
- [ ] Test mode switching behavior

### Phase 3: System Prompt Enhancement (CaretPromptWrapper)

**File**: `caret-src/core/prompts/CaretPromptWrapper.ts`

**Steps**:
1. Add Task tool description method
2. Detect Claude Code provider in getCaretSystemPrompt
3. Inject Task tool description into tools section
4. Ensure proper formatting and positioning

**Implementation Details**:
```typescript
// In getCaretSystemPrompt method
const systemPrompt = await super.getSystemPrompt(context)

// CARET MODIFICATION: Add Task tool description for Claude Code in Caret mode
if (context.apiProvider === "claude-code") {
  const taskToolDesc = this.getTaskToolDescription()
  return this.injectTaskToolDescription(systemPrompt, taskToolDesc)
}

return systemPrompt
```

**Tool Description Content**:
- Clear explanation of Task tool purpose
- When to use vs when not to use
- Example usage syntax
- Important constraints and limitations

**Testing**:
- [ ] Verify Task tool appears in system prompt (Caret + Claude Code)
- [ ] Verify Task tool NOT in prompt (Cline mode)
- [ ] Verify Task tool NOT in prompt (Caret + other providers)
- [ ] Verify prompt structure remains valid
- [ ] Test with actual Claude Code API

### Phase 4: Stream Processing (No Changes Needed)

**Files**: 
- `src/core/api/providers/claude-code.ts` ✅
- `src/core/api/transform/stream.ts` ✅

**Rationale**:
- Stream processing is mode-agnostic infrastructure
- Mode filtering happens at tool enablement level
- Type definitions provide necessary type safety
- No runtime mode checks needed in stream layer

**Verification**:
- [ ] Confirm tool_use blocks processed correctly when Task enabled
- [ ] Confirm no tool_use blocks arrive when Task disabled
- [ ] Verify type safety with TypeScript compilation

## Testing Strategy

### Test Scenario 1: Caret Mode + Claude Code
**Expected**: Task tool available and functional

**Test Steps**:
1. Switch to Caret mode
2. Select Claude Code provider
3. Send prompt: "두 개의 독립적인 작업을 병렬로 처리해줘. 각각 subagent로 처리해줘"
4. Verify model recognizes Task tool
5. Verify Task tool appears in system prompt (debug output)
6. Verify tool_use blocks processed correctly

**Success Criteria**:
- Model responds with Task tool usage
- No "I don't have that tool" errors
- Parallel execution works correctly

### Test Scenario 2: Cline Mode + Claude Code
**Expected**: Task tool disabled, fallback to sequential processing

**Test Steps**:
1. Switch to Cline mode (or default mode)
2. Select Claude Code provider
3. Send same prompt: "두 개의 독립적인 작업을 병렬로 처리해줘"
4. Verify model doesn't attempt Task tool usage
5. Verify Task tool NOT in system prompt
6. Verify model uses alternative approach (sequential execution)

**Success Criteria**:
- Model doesn't mention Task tool
- No tool_use errors
- Task completed sequentially (expected fallback)

### Test Scenario 3: Caret Mode + Other Providers
**Expected**: Task tool NOT available (Claude Code exclusive)

**Test Steps**:
1. Switch to Caret mode
2. Select non-Claude Code provider (e.g., Anthropic, OpenRouter)
3. Send parallel task prompt
4. Verify model doesn't have access to Task tool
5. Verify Task tool NOT in system prompt

**Success Criteria**:
- Model uses standard Caret capabilities
- No Task tool confusion
- Normal operation

### Test Scenario 4: Mode Switching
**Expected**: Dynamic tool availability changes

**Test Steps**:
1. Start in Caret mode, verify Task tool available
2. Switch to Cline mode, start new task
3. Verify Task tool no longer available
4. Switch back to Caret mode, start new task
5. Verify Task tool available again

**Success Criteria**:
- Mode switching updates tool availability
- No stale tool definitions
- No crashes or errors during switching

## Implementation Checklist

### Code Changes
- [ ] Modify `src/integrations/claude-code/run.ts` for conditional enablement
- [ ] Enhance `caret-src/core/prompts/CaretPromptWrapper.ts` with Task tool description
- [ ] Add clear CARET MODIFICATION comments
- [ ] Verify no changes needed in stream processing layer

### Testing
- [ ] Unit test: Mode detection in run.ts
- [ ] Integration test: Task tool enablement in Caret mode
- [ ] Integration test: Task tool disabled in Cline mode
- [ ] Integration test: System prompt includes Task description
- [ ] E2E test: Full subagent workflow in Caret mode
- [ ] E2E test: Fallback behavior in Cline mode

### Documentation
- [ ] Update f12-claude-code-subagent-support.md with mode restriction
- [ ] Document mode-switching behavior
- [ ] Add user-facing documentation (when ready)
- [ ] Update CHANGELOG.md

### Verification
- [ ] `npm run compile` passes
- [ ] `npm run test:backend` passes
- [ ] `npm run test:integration` passes
- [ ] Manual testing in both modes successful

## Risk Assessment

### Low Risk ✅
- Stream processing changes (mode-agnostic infrastructure)
- Type definitions (compile-time only)
- Mode detection (existing mechanism)

### Medium Risk ⚠️
- System prompt injection (needs careful formatting)
- Tool description accuracy (must match Claude Code behavior)

### Mitigation Strategies
1. **Prompt Injection**: Test with multiple prompt variants, verify structure
2. **Tool Description**: Reference official Claude Code documentation
3. **Mode Switching**: Extensive testing of mode transitions
4. **Backward Compatibility**: Ensure Cline mode works exactly as before

## Success Criteria

### Functional Requirements
- ✅ Task tool available in Caret mode with Claude Code
- ✅ Task tool disabled in Cline mode
- ✅ Task tool disabled with non-Claude Code providers
- ✅ Proper system prompt enhancement
- ✅ Smooth mode switching

### Non-Functional Requirements
- ✅ No performance degradation
- ✅ Clean code with clear comments
- ✅ Upstream contribution ready (easy to "unlock")
- ✅ Comprehensive test coverage

### User Experience
- ✅ Clear mode-based feature gating
- ✅ No confusing error messages
- ✅ Graceful fallback in unsupported modes
- ✅ Transparent behavior

## Upstream Contribution Path

When Cline is ready to accept F12 feature:

### Removal of Mode Restrictions (Simple)
```diff
- const isCaretMode = (await CaretGlobalManager.getPromptSystemMode()) === "caret"
- const disabledTools = [
-   ...(isCaretMode ? [] : ["Task"]),
-   "Bash",
- ]
+ const disabledTools = [
+   "Bash",  // Unconditionally enable Task tool
+ ]
```

### System Prompt Integration
- Move Task tool description from CaretPromptWrapper to Cline's PromptBuilder
- Add to standard tools section for Claude Code provider
- Remove Caret-specific gating

### Benefits of This Approach
1. **Minimal diff**: Only a few lines to remove
2. **Clear separation**: Caret changes clearly marked
3. **Easy review**: Upstream reviewers see clean feature addition
4. **Safe rollback**: Can quickly revert if needed

## Timeline Estimate

- **Phase 1**: Already complete ✅
- **Phase 2**: 30 minutes (run.ts modification + basic tests)
- **Phase 3**: 1-2 hours (CaretPromptWrapper enhancement + thorough testing)
- **Phase 4**: Verification only (no changes)
- **Testing & Documentation**: 1-2 hours

**Total Estimated Time**: 3-4 hours

## Next Steps

1. **Master Review**: Get approval on this implementation plan
2. **Implementation**: Execute phases 2-3 with TDD approach
3. **Testing**: Comprehensive testing across all scenarios
4. **Documentation**: Update feature docs and user guides
5. **Release**: Include in next Caret release with feature flag announcement

## Questions for Master

1. ✅ Approve Phase 2 implementation (run.ts modification)?
2. ✅ Approve Phase 3 implementation (CaretPromptWrapper enhancement)?
3. 🤔 Should we add a feature flag in addition to mode detection?
4. 🤔 Should we log when Task tool is enabled/disabled for debugging?
5. 🤔 Any specific test scenarios you want to prioritize?

---

**Ready for Implementation**: Pending Master's approval ✨
