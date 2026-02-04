# F19: 메시지 큐 시스템 (Claude Code 스타일)

## 개요

Claude Code 스타일의 메시지 큐 시스템을 구현하여, AI 스트리밍 중에도 사용자가 다음 지시를 입력하고 취소 시 즉시 처리할 수 있는 UX를 제공합니다.

### 핵심 특징

- **단일 문자열 버퍼**: 여러 입력이 `\n`으로 합쳐짐 (AsyncQueue 대신)
- **Double-press 인터럽트**: 첫 번째 클릭은 경고, 두 번째 클릭이 실제 취소
- **즉시 큐 처리**: 취소 시 대기 중인 입력을 즉시 처리
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
| `hasPendingInput(sessionId)` | 대기 중인 입력 존재 여부 확인 |
| `tryInterrupt(sessionId)` | Double-press 인터럽트 시도 |
| `forceInterrupt(sessionId)` | 강제 인터럽트 (즉시 실행) |

### 이벤트 흐름

```
사용자 입력 (스트리밍 중)
    ↓
askResponse.ts: appendInput()
    ↓
SessionManager: pendingInput에 추가
    ↓
WebView: 대기 중인 입력 표시
    ↓
[취소 또는 스트리밍 완료]
    ↓
Task.ask(): consumePendingInput()
    ↓
자동으로 다음 요청 처리
```

## 구현 상세

### Backend 파일

| 파일 | 역할 |
|------|------|
| `careti-src/utils/session-manager.ts` | 세션 상태 및 큐 관리 |
| `src/core/controller/task/askResponse.ts` | 스트리밍 중 입력 큐잉 |
| `src/core/controller/task/tryInterruptTask.ts` | Double-press 인터럽트 처리 |
| `src/core/task/index.ts` | ask() 시 pending input 확인 |
| `src/core/controller/index.ts` | 상태 WebView 전송 |

### Frontend 파일

| 파일 | 역할 |
|------|------|
| `webview-ui/src/careti/hooks/useSessionState.ts` | 세션 상태 훅 |
| `webview-ui/src/components/chat/ChatTextArea.tsx` | Pending input 미리보기 UI |
| `webview-ui/src/context/ExtensionStateContext.tsx` | pendingInput 상태 관리 |

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

**common.json - `button.pressAgainToCancel`:**
- EN: "Press again to cancel"
- KO: "다시 눌러 취소"
- JA: "もう一度押してキャンセル"
- ZH: "再按一次取消"
- DE: "Erneut drücken zum Abbrechen"
- FR: "Appuyez à nouveau pour annuler"
- RU: "Нажмите ещё раз для отмены"

## 테스트

### 유닛 테스트

```
careti-src/__tests__/utils/session-manager.test.ts
```

- 35개 테스트 케이스
- appendInput, consumePendingInput, tryInterrupt 등 커버

### E2E 테스트

```
src/test/e2e/cancel.test.ts
```

- Cancel 버튼 표시 테스트
- Escape 키 취소 테스트
- Double-press 패턴 테스트

## 머징 가이드

### Cline Upstream 머징 시 주의사항

1. **SessionManager**: `careti-src/`에 있어 충돌 없음
2. **askResponse.ts**: `// CARETI MODIFICATION:` 주석으로 수정 부분 표시
3. **Task.ask()**: pending input 체크 로직 추가됨
4. **ExtensionMessage.ts**: `pendingInput` 필드 추가됨

### 충돌 가능성

- `src/core/task/index.ts` - ask() 메서드 내부 수정
- `src/core/controller/index.ts` - postStateToWebview() 수정

## 향후 개선사항

1. **큐 편집 기능**: 대기 중인 입력 수정/삭제 UI
2. **큐 순서 변경**: 여러 입력 시 순서 조정
3. **큐 지속성**: 세션 재시작 시 큐 복원

---

**최종 업데이트**: 2026-02-05
**문서 버전**: v1.0
