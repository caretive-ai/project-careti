# F19: 메시지 큐 시스템 (Claude Code 스타일)

## 개요

Claude Code 스타일의 메시지 큐 시스템을 구현하여, AI 스트리밍 중에도 사용자가 다음 지시를 입력하고 취소 시 입력창에 복원할 수 있는 UX를 제공합니다.

### 핵심 특징

- **단일 문자열 버퍼**: 여러 입력이 `\n`으로 합쳐짐 (AsyncQueue 대신)
- **ESC 1회 즉시 중지**: 스트리밍 즉시 취소 + 큐 내용을 입력창에 복원
- **입력 복원 패턴**: 취소 시 대기 입력을 자동 실행하지 않고 입력창에 복원 (유저가 편집 후 직접 전송)
- **인라인 편집/삭제**: PendingInput 미리보기에 편집/삭제 버튼 제공
- **UI 피드백**: 대기 중인 입력을 입력창 위에 표시

## 아키텍처

### SessionManager

```
careti-src/utils/session-manager.ts
```

```typescript
interface SessionState {
  abort: AbortController
  pendingInput: string  // 단일 문자열 버퍼
  status: SessionStatus // "idle" | "busy" | "interrupting"
  interruptCount: number
  interruptTimer?: ReturnType<typeof setTimeout>
}
```

**주요 메서드:**

| 메서드 | 설명 |
|--------|------|
| `appendInput(sessionId, text)` | 입력을 버퍼에 추가 (기존 입력과 `\n`으로 합침) |
| `consumePendingInput(sessionId)` | 대기 중인 입력 가져오고 버퍼 비우기 |
| `clearPendingInput(sessionId)` | 대기 중인 입력 삭제 (반환하지 않음) |
| `hasPendingInput(sessionId)` | 대기 중인 입력 존재 여부 확인 |
| `forceInterrupt(sessionId)` | 강제 인터럽트 (즉시 실행) |

### 이벤트 흐름

#### 스트리밍 중 입력 → 큐잉
```
사용자 입력 (스트리밍 중)
    ↓
askResponse.ts: appendInput()
    ↓
SessionManager: pendingInput에 추가
    ↓
WebView: "Queued" 미리보기 표시 [편집] [✕]
```

#### ESC → 즉시 중지 + 입력창 복원
```
ESC 키 (1회)
    ↓
useMessageHandlers.ts: TaskServiceClient.tryInterruptTask()
    ↓
tryInterruptTask.ts:
  1. consumePendingInput() ← cancelTask() 전에 호출 (중요!)
  2. forceInterrupt()
  3. cancelTask()
  4. pendingInput 문자열을 응답으로 반환
    ↓
WebView: setInputValue(result.value) → 입력창에 복원
    ↓
유저가 편집 후 직접 Enter로 전송
```

#### 편집 버튼 클릭
```
[편집] 버튼 클릭
    ↓
ChatTextArea: setInputValue(pendingInput)
    ↓
TaskServiceClient.clearPendingInput() → SessionManager.clearPendingInput()
    ↓
입력창에 큐 내용 복원, 미리보기 사라짐
```

#### 삭제 버튼 클릭
```
[✕] 버튼 클릭
    ↓
TaskServiceClient.clearPendingInput() → SessionManager.clearPendingInput()
    ↓
큐 비움, 미리보기 사라짐
```

## 구현 상세

### Backend 파일

| 파일 | 역할 |
|------|------|
| `careti-src/utils/session-manager.ts` | 세션 상태 및 큐 관리 |
| `src/core/controller/task/askResponse.ts` | 스트리밍 중 입력 큐잉 |
| `src/core/controller/task/tryInterruptTask.ts` | ESC 1회 즉시 중지 + pendingInput 반환 |
| `src/core/controller/task/clearPendingInput.ts` | 편집/삭제 버튼용 RPC 핸들러 |
| `src/core/task/index.ts` | ask() 시 pending input 확인 |
| `src/core/controller/index.ts` | 상태 WebView 전송, interruptWarning 비활성화 |

### Proto 정의

```protobuf
// proto/cline/task.proto
rpc tryInterruptTask(EmptyRequest) returns (String);   // pendingInput 반환
rpc clearPendingInput(EmptyRequest) returns (Empty);    // 큐 비우기
```

### Frontend 파일

| 파일 | 역할 |
|------|------|
| `webview-ui/src/careti/hooks/useSessionState.ts` | 세션 상태 훅 |
| `webview-ui/src/careti/hooks/useInterruptHandler.ts` | 인터럽트 threshold=1 (single-press) |
| `webview-ui/src/components/chat/ChatTextArea.tsx` | PendingInput 미리보기 + 편집/삭제 버튼 |
| `webview-ui/src/components/chat/chat-view/components/layout/ActionButtons.tsx` | ESC 버튼 (경고 UI 제거) |
| `webview-ui/src/components/chat/chat-view/hooks/useMessageHandlers.ts` | cancel 시 pendingInput 입력창 복원 |
| `webview-ui/src/context/ExtensionStateContext.tsx` | pendingInput 상태 관리 |

### 핵심 주의사항

**`consumePendingInput`은 반드시 `cancelTask()` 전에 호출해야 합니다.**

`cancelTask()` → `abortTask()` → `sessionManager.delete(taskId)` 순서로 세션이 파괴되므로,
`cancelTask()` 이후에 `consumePendingInput`을 호출하면 이미 삭제된 세션에서 빈 값을 반환합니다.

```typescript
// tryInterruptTask.ts - 올바른 순서
const pendingInput = sessionManager.consumePendingInput(task.taskId)  // 먼저!
sessionManager.forceInterrupt(task.taskId)
await controller.cancelTask()  // 여기서 session 삭제됨
return StringProto.create({ value: pendingInput })
```

### 다국어 지원

7개 언어에 번역 추가:

**chat.json - `pendingInput.label`:**
- EN: "Queued"
- KO: "대기 중"
- JA: "待機中"
- ZH: "排队中"
- DE: "Warteschlange"
- FR: "En file"
- RU: "В очереди"

**chat.json - `pendingInput.edit`:**
- EN: "Edit"
- KO: "편집"
- JA: "編集"
- ZH: "编辑"
- DE: "Bearbeiten"
- FR: "Modifier"
- RU: "Редактировать"

**chat.json - `pendingInput.clear`:**
- EN: "Clear"
- KO: "삭제"
- JA: "削除"
- ZH: "清除"
- DE: "Löschen"
- FR: "Supprimer"
- RU: "Удалить"

## 테스트

### 유닛 테스트

```
careti-src/__tests__/utils/session-manager.test.ts  (35개 테스트)
careti-src/__tests__/utils/async-queue.test.ts
```

- appendInput, consumePendingInput, clearPendingInput, forceInterrupt 등 커버

### E2E 테스트

```
src/test/e2e/cancel.test.ts
```

- Cancel 버튼 표시 테스트
- Escape 키 취소 테스트
- ESC 1회 즉시 중지 테스트

### 수동 테스트 체크리스트

1. 스트리밍 중 메시지 입력 → "Queued" 미리보기 확인
2. **ESC 1회** → 스트리밍 즉시 중지 + 입력창에 큐 내용 복원
3. 복원된 텍스트 수정 후 Enter → 정상 전송
4. 미리보기 편집 버튼 → 입력창 복원
5. 미리보기 ✕ 버튼 → 큐 삭제

## 머징 가이드

### Cline Upstream 머징 시 주의사항

1. **SessionManager**: `careti-src/`에 있어 충돌 없음
2. **askResponse.ts**: `// CARETI MODIFICATION:` 주석으로 수정 부분 표시
3. **tryInterruptTask.ts**: 신규 파일, `// CARETI MODIFICATION:` 표기
4. **clearPendingInput.ts**: 신규 파일, `// CARETI MODIFICATION:` 표기
5. **Task.ask()**: pending input 체크 로직 추가됨
6. **proto/cline/task.proto**: `tryInterruptTask` 응답 타입 변경 (Boolean → String), `clearPendingInput` RPC 추가

### 충돌 가능성

- `src/core/task/index.ts` - ask() 메서드 내부 수정
- `src/core/controller/index.ts` - postStateToWebview() 수정, interruptWarning 비활성화
- `webview-ui/src/components/chat/ChatTextArea.tsx` - PendingInputPreview 수정
- `webview-ui/src/components/chat/chat-view/hooks/useMessageHandlers.ts` - cancel 핸들러 수정

## 향후 개선사항

1. **큐 순서 변경**: 여러 입력 시 순서 조정
2. **큐 지속성**: 세션 재시작 시 큐 복원
3. **Careti 전용 PostHog 호스트**: `data.cline.bot` → 자체 도메인으로 변경

---

**최종 업데이트**: 2026-02-13
**문서 버전**: v2.0
