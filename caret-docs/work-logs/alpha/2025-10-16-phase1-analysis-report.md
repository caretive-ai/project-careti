# Phase 1 분석 완료 리포트: Claude Code Tool Use 지원

## 분석 일시
2025-10-16

## 분석 대상 파일
1. `src/integrations/claude-code/run.ts` ✅
2. `src/integrations/claude-code/types.ts` ✅
3. `src/core/api/providers/anthropic.ts` ✅

---

## 🚨 핵심 발견: 서브에이전트 기능이 의도적으로 비활성화됨

### 발견 1: Task 도구가 disallowedTools에 포함
**위치**: `src/integrations/claude-code/run.ts:137-152`

```typescript
const claudeCodeTools = [
  "Task",  // ⚠️ 서브에이전트 도구가 비활성화됨!
  "Bash",
  "Glob",
  // ... 기타 도구들
].join(",")

// 함수 내에서 사용:
"--disallowedTools",
claudeCodeTools,
```

**주석 설명**:
```typescript
// We want the model to use our custom tool format instead of built-in tools.
// Disabling built-in tools prevents tool-only responses and ensures text output.
```

**의미**: 
- Caret은 Claude Code의 기본 제공 도구를 의도적으로 비활성화
- Caret의 자체 도구 시스템을 사용하기 위함
- **서브에이전트(Task 도구) 기능이 현재 차단되어 있음**

---

## 분석 결과 요약

### 1. Claude Code CLI 통합 (run.ts)
**현재 동작**:
- CLI를 `--output-format stream-json` 모드로 실행
- `--disallowedTools`로 모든 기본 도구 비활성화
- `--max-turns 1`로 단일 턴만 허용
- stdin으로 메시지 전달, stdout에서 JSON 스트림 수신

**출력 형식**:
```typescript
type ClaudeCodeMessage = 
  | InitMessage      // 초기화 정보
  | AssistantMessage // AI 응답 (Anthropic.Messages.Message 포함)
  | ErrorMessage     // 에러
  | ResultMessage    // 최종 결과
```

**스트리밍 방식**:
- 라인 단위로 JSON 파싱
- 부분 데이터는 다음 라인과 합쳐서 재시도

### 2. 메시지 타입 (types.ts)
**AssistantMessage 구조**:
```typescript
type AssistantMessage = {
  type: "assistant"
  message: Anthropic.Messages.Message  // ⭐ Anthropic SDK 타입
  session_id: string
}
```

**중요**: 
- `message` 필드가 표준 Anthropic Message 타입
- `content` 배열에 `tool_use` 타입이 포함될 수 있음
- **하지만 현재 disallowedTools로 인해 tool_use가 발생하지 않음**

### 3. Anthropic 프로바이더 참조 (anthropic.ts)
**스트리밍 처리 패턴**:
```typescript
for await (const chunk of stream) {
  switch (chunk?.type) {
    case "content_block_start":
      switch (chunk.content_block.type) {
        case "thinking": // ✅ 구현됨
        case "redacted_thinking": // ✅ 구현됨
        case "text": // ✅ 구현됨
        // case "tool_use": // ❌ 없음
      }
    case "content_block_delta":
      switch (chunk.delta.type) {
        case "thinking_delta": // ✅ 구현됨
        case "text_delta": // ✅ 구현됨
        // case "tool_use_delta": // ❌ 없음
      }
  }
}
```

**발견**:
- Anthropic 프로바이더도 tool_use 처리 코드가 없음
- `tools` 파라미터가 주석 처리되어 있음
- **Caret은 자체 도구 시스템을 사용**

---

## 구현 방향 수정

### 기존 계획 (❌ 실현 불가능)
- Claude Code CLI가 tool_use를 반환하도록 기대
- claude-code.ts에서 tool_use 케이스만 추가

### 수정된 계획 (✅ 실현 가능)

#### 방법 1: disallowedTools에서 Task 제거 (권장)
**장점**:
- 가장 간단한 수정
- Claude Code CLI가 Task 도구를 자동 처리
- 서브에이전트 결과를 자연스럽게 받을 수 있음

**단점**:
- Caret의 "자체 도구 시스템 사용" 철학과 충돌 가능
- 다른 도구들과 일관성 문제

**구현 단계**:
1. `run.ts`의 `claudeCodeTools` 배열에서 `"Task"` 제거
2. `claude-code.ts`에서 `tool_use` 케이스 처리 추가
3. Task 도구의 input/output 타입 정의
4. 테스트 및 검증

#### 방법 2: 자체 도구로 서브에이전트 구현 (복잡)
**개념**:
- Caret의 자체 도구 시스템에 서브에이전트 도구 추가
- Claude Code CLI를 완전히 우회

**단점**:
- 매우 복잡한 구현 필요
- Claude Code의 기능 복제 필요
- 유지보수 부담 큼

---

## 권장 사항

### ✅ 방법 1 채택 권장
**이유**:
1. **최소 변경**: 1-2개 파일만 수정
2. **공식 기능 활용**: Claude Code의 검증된 서브에이전트 기능 사용
3. **유지보수 용이**: Claude Code 업데이트 자동 반영
4. **일관성**: 다른 built-in 도구들도 점진적으로 활성화 가능

### 다음 단계 (Phase 2)
1. **변경 1**: `src/integrations/claude-code/run.ts`
   - `claudeCodeTools` 배열에서 `"Task"` 제거
   
2. **변경 2**: `src/core/api/providers/claude-code.ts`
   - `tool_use` 케이스 추가:
     ```typescript
     case "tool_use":
       yield {
         type: "tool_use",
         id: content.id,
         name: content.name,
         input: content.input
       }
       break
     ```

3. **테스트**: 서브에이전트 호출 시나리오 검증

### 예상 소요 시간
- **Phase 2 (구현)**: 30분 (예상보다 단순함)
- **Phase 3 (테스트)**: 30분
- **총 예상**: 1시간

---

## 결론

**Phase 1 분석 결과**: 
- 서브에이전트 기능이 **의도적으로 비활성화**되어 있음
- 해결책은 **예상보다 간단함** (disallowedTools에서 Task 제거)
- Anthropic 프로바이더 참조는 필요하지 않음 (tool_use 처리 없음)

**다음 작업**: 마스터 승인 후 Phase 2 진행
