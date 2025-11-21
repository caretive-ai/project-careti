# Claude Code SDK vs CLI 설명

작성일: 2025-10-16
작성자: Alpha Yang

## 개요

Claude Code 통합 작업 중 SDK와 CLI 문서를 구분하는 과정에서 작성한 설명 문서입니다.

## 1. CLI Reference vs TypeScript SDK

### 1.1 CLI Reference (`claude-code-cli-sdk.md`)

**실체**: CLI 명령어 참조 문서

**내용**:
- `cline-core agent` 명령어 실행 시 사용하는 플래그들
- `--disallowedTools`: 비활성화할 툴 목록 (쉼표로 구분)
- `--files`: 초기 파일 목록
- 기타 CLI 옵션들

**용도**: Claude Code CLI를 subprocess로 실행할 때 명령줄 인자 구성

**예시**:
```bash
cline-core agent \
  --disallowedTools="Bash,Glob,Computer" \
  --files="file1.ts,file2.ts"
```

### 1.2 TypeScript SDK (`claude-code-typescript-sdk.md`)

**실체**: 실제 SDK 문서

**내용**: 
- Claude Code의 TypeScript API 인터페이스 정의
- Task 툴의 `AgentInput` 인터페이스 스펙
- 다른 툴들의 인터페이스 정의

**용도**: Claude Code의 내부 동작 방식과 데이터 구조 이해

**핵심 인터페이스**:
```typescript
interface AgentInput {
  description: string;  // 3-5단어 짧은 설명 (예: "analyze database schema")
  prompt: string;       // 서브에이전트가 실행할 작업 (예: "Review the database schema...")
  subagent_type: string; // 전문 에이전트 유형 (예: "general", "code_review")
}
```

## 2. Caret 구현에서의 활용

### 2.1 CLI Reference 활용

**파일**: `src/integrations/claude-code/run.ts`

**용도**: `--disallowedTools` 플래그를 동적으로 생성
```typescript
async function getClaudeCodeDisallowedTools(): Promise<string> {
  const isCaretMode = CaretGlobalManager.currentMode === "caret"
  
  const disallowedTools = [
    // Task tool only available in Caret mode (F12)
    ...(isCaretMode ? [] : ["Task"]),
    "Bash", "Glob", "Computer", // ...
  ]
  
  return disallowedTools.join(",")
}
```

### 2.2 TypeScript SDK 활용

**파일**: `caret-src/core/prompts/sections/CLAUDE_CODE_TASK_TOOL.json`

**용도**: 시스템 프롬프트에 주입할 Task 툴 설명 생성

**현재 문제**: JSON 파일이 SDK 스펙과 불일치
- ❌ 현재: `task` 파라미터만 사용
- ✅ 올바름: `description`, `prompt`, `subagent_type` 파라미터 사용

## 3. 다음 작업

### 3.1 JSON 파일 수정

`CLAUDE_CODE_TASK_TOOL.json`을 SDK 스펙에 맞게 수정:

```json
{
  "tool_name": "Task",
  "description": "Request to delegate a well-defined, isolated subtask to a specialized AI subagent...",
  "parameters": {
    "description": {
      "type": "string",
      "description": "A short 3-5 word description of what this task is (e.g., 'analyze database schema', 'refactor authentication')",
      "required": true
    },
    "prompt": {
      "type": "string", 
      "description": "The detailed task for the subagent to execute. This should be a clear, well-scoped task...",
      "required": true
    },
    "subagent_type": {
      "type": "string",
      "description": "The type of specialized agent to use (e.g., 'general', 'code_review', 'documentation')",
      "required": true
    }
  },
  "usage_example": "..."
}
```

### 3.2 JsonTemplateLoader 통합

`CaretPromptWrapper.ts`에서:
1. `JsonTemplateLoader.load("CLAUDE_CODE_TASK_TOOL")` 사용
2. 하드코딩된 `getTaskToolDescription()` 메서드 제거
3. JSON 섹션을 프롬프트에 주입

### 3.3 검증

1. 컴파일 성공 확인
2. F5로 테스트 (디버그 로그 확인)
3. Task 툴 사용 시 올바른 파라미터로 호출되는지 검증

## 4. 핵심 포인트

1. **CLI Reference**: 명령줄 실행 시 사용하는 플래그 문서
2. **TypeScript SDK**: 내부 데이터 구조와 인터페이스 문서
3. **Task 툴**: Claude Code CLI의 내장 툴 (Caret이 직접 구현하지 않음, subprocess로 실행)
4. **Two-layer gating**: 
   - CLI 레벨: `--disallowedTools` (Task 제외 여부)
   - 시스템 프롬프트 레벨: Task 툴 설명 주입 여부

## 5. 참고 문서

- `caret-docs/work-logs/luke/references/claude-code-cli-sdk.md` - CLI 명령어 참조
- `caret-docs/work-logs/luke/references/claude-code-typescript-sdk.md` - 실제 SDK 문서
- `caret-docs/features/f12-claude-code-subagent-support.md` - F12 기능 스펙
