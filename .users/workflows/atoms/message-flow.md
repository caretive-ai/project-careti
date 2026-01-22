# 메시지 플로우 - Frontend ↔ Backend ↔ AI 통신

Frontend ↔ Backend ↔ AI 통신을 위한 메시지 플로우 패턴입니다.

## 핵심 원칙
**관심사의 깔끔한 분리를 유지하면서 순환 메시지 방지**

## 통신 아키텍처

### 주요 플로우:
```
Frontend (React) ↔ Backend (Extension) ↔ AI Services
     ↑                    ↓
WebView Messages    Protocol Buffers/JSON
```

### 핵심 컴포넌트:
- **Frontend**: `webview-ui/src/` React 컴포넌트
- **Backend**: `src/core/` 익스텐션 로직 + `careti-src/` 확장
- **Protocols**: `proto/` 타입 안전 통신 정의

## 메시지 타입 & 패턴

### Frontend → Backend 메시지:
```typescript
// 사용자 상호작용, 설정 변경, 명령
interface FrontendMessage {
  type: 'userInput' | 'settingsUpdate' | 'commandTrigger';
  payload: unknown;
  requestId: string;
}
```

### Backend → Frontend 메시지:
```typescript
// AI 응답, 상태 업데이트, 데이터 변경
interface BackendMessage {
  type: 'aiResponse' | 'statusUpdate' | 'dataChange';
  payload: unknown;
  responseId: string; // 원본 requestId와 연결
}
```

### Backend → AI 메시지:
```typescript
// 시스템 프롬프트, 사용자 쿼리, 컨텍스트
interface AIMessage {
  systemPrompt: string;
  userQuery: string;
  context: ConversationContext;
}
```

## 순환 메시지 방지

### 피해야 할 안티패턴:
```typescript
❌ // 무한 루프 위험
onAIResponse(response => {
  sendToFrontend(response);
  sendToAI(generateFollowup(response)); // 루프 생성!
});

❌ // Frontend가 Backend를 트리거하고 다시 Frontend를 트리거
onUserInput(input => {
  processInput(input);
  updateUI(newState); // 더 많은 사용자 이벤트 트리거!
});
```

### 안전한 패턴:
```typescript
✅ // 명확한 종료가 있는 요청-응답
async handleUserInput(input: UserInput): Promise<void> {
  const aiResponse = await queryAI(input);
  await sendToFrontend({ type: 'aiResponse', payload: aiResponse });
  // 명확한 종료 - 추가 자동 메시지 없음
}

✅ // 가드가 있는 상태 기반 업데이트
updateConversationState(newState: ConversationState): void {
  if (this.currentState.id !== newState.id) { // 중복 방지 가드
    this.currentState = newState;
    this.notifyFrontend(newState);
  }
}
```

## 메시지 처리 파이프라인

### 1. 입력 검증:
```typescript
function validateMessage(msg: unknown): msg is ValidMessage {
  return typeof msg === 'object' && msg !== null && 'type' in msg;
}
```

### 2. 타입 안전 라우팅:
```typescript
function routeMessage(msg: ValidMessage): void {
  switch (msg.type) {
    case 'userInput': return handleUserInput(msg);
    case 'settingsUpdate': return handleSettings(msg);
    default: throw new Error(`Unknown message type: ${msg.type}`);
  }
}
```

### 3. 응답 상관관계:
```typescript
const pendingRequests = new Map<string, PendingRequest>();

function sendRequest(msg: FrontendMessage): void {
  pendingRequests.set(msg.requestId, { timestamp: Date.now(), type: msg.type });
  sendToBackend(msg);
}

function handleResponse(msg: BackendMessage): void {
  const request = pendingRequests.get(msg.responseId);
  if (request) {
    pendingRequests.delete(msg.responseId);
    processResponse(msg, request);
  }
}
```

## 다른 시스템과의 통합

### Storage 패턴과 함께:
- 메시지 상태 → `workspaceState` (대화별)
- 사용자 설정 → `globalState` (프로젝트 간)

### Persona 시스템과 함께:
- AI 메시지에 페르소나 컨텍스트 포함
- 페르소나 설정에 따라 응답 필터링

### Branding 시스템과 함께:
- 발신 메시지에 브랜드 필터 적용
- 통신 전반에 브랜드 일관성 유지

## 관련 워크플로우
- `/modification-levels`로 기능 구현 시 필수
- `/tdd-cycle` 통합 테스트로 메시지 플로우 테스트
- 메시지 지속성에 `/storage-patterns` 적용

## 일반 가이드라인
이 메시지 플로우 아키텍처는 시스템 컴포넌트 간의 예측 가능하고 유지보수 가능한 통신을 보장합니다.

핵심은 반응적인 사용자 상호작용을 유지하면서 순환 의존성을 방지하는 것입니다.

항상 명확한 요청-응답 패턴과 적절한 상태 관리로 설계하세요.

## 미러링 정책
- 이 파일 수정 시 `.agents/workflows/atoms/message-flow.md`도 동일하게 업데이트
