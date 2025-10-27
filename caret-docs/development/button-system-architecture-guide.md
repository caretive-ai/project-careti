# Caret 버튼 시스템 아키텍처 가이드

Caret의 완전한 버튼 시스템 구조와 용어 정리 문서입니다. PRD 자동생성 등 새로운 기능 개발 시 UI 상호작용을 이해하는 데 필수적입니다.

## 🎯 **전체 버튼 시스템 구조**

Caret의 버튼 시스템은 두 가지 주요 영역으로 구분됩니다:

1. **ActionButtons** - 화면 하단의 전역 액션 버튼들
2. **ChatRow 버튼들** - 각 메시지 내부의 인터랙션 버튼들

---

## 📋 **ActionButtons (전역 액션 버튼 시스템)**

### **핵심 용어**

- **ButtonConfig** - 버튼 상태와 동작을 정의하는 설정 객체
- **ButtonActionType** - 버튼 클릭 시 실행할 액션 타입
- **BUTTON_CONFIGS** - 상황별 버튼 설정의 중앙 저장소
- **getButtonConfig()** - 메시지 상태에 따라 적절한 버튼 설정 반환

### **ButtonConfig 속성**

```typescript
interface ButtonConfig {
    sendingDisabled: boolean    // 메시지 전송 비활성화 여부
    enableButtons: boolean      // 버튼 활성화/비활성화 여부
    primaryText?: string        // 주 버튼 텍스트
    secondaryText?: string      // 보조 버튼 텍스트
    primaryAction?: ButtonActionType    // 주 버튼 액션
    secondaryAction?: ButtonActionType  // 보조 버튼 액션
}
```

### **주요 ButtonActionType**

1. **approve** - `yesButtonClicked` 전송
2. **reject** - `noButtonClicked` 전송  
3. **proceed** - `messageResponse` 또는 승인 진행
4. **new_task** - 새 작업 시작
5. **cancel** - 스트리밍 취소
6. **utility** - 유틸리티 함수 실행

### **핵심 버튼 케이스**

#### **1. 도구 승인 케이스 (Tool Approval)**
```typescript
tool_approve: {
    sendingDisabled: false,
    enableButtons: true,
    primaryText: "Approve",
    secondaryText: "Reject",
    primaryAction: "approve",
    secondaryAction: "reject",
}
```

#### **2. 에이전트 모드 대화 (Agent Conversation)**
```typescript
agent_conversation: {
    sendingDisabled: false,
    enableButtons: true, 
    primaryText: undefined,
    secondaryText: "New Task",
    primaryAction: undefined,
    secondaryAction: "new_task",
}
```

#### **3. 챗봇 모드 응답 (Chatbot Mode Response)**
```typescript
chatbot_mode_respond: {
    sendingDisabled: false,
    enableButtons: true,
    primaryText: "Proceed",
    secondaryText: "Start New Task", 
    primaryAction: "proceed",
    secondaryAction: "new_task",
}
```

### **소스 파일**

- **설정 중앙 관리**: `webview-ui/src/components/chat/chat-view/shared/buttonConfig.ts`
- **버튼 렌더링**: `webview-ui/src/components/chat/chat-view/components/layout/ActionButtons.tsx`
- **상태 타입**: `webview-ui/src/components/chat/chat-view/types/chatTypes.ts`

---

## 🎨 **ChatRow 버튼 시스템**

ChatRow 내부에 표시되는 각종 인터랙션 버튼들입니다.

### **1. 텍스트 선택 관련 버튼**

#### **QuoteButton (인용 버튼)**
- **용도**: 텍스트 선택 시 표시되어 선택된 텍스트를 인용
- **소스**: `webview-ui/src/components/chat/QuoteButton.tsx`
- **트리거**: 사용자가 ChatRow 내에서 텍스트를 선택할 때
- **위치**: 선택된 텍스트 위쪽에 플로팅 형태

```typescript
interface QuoteButtonState {
    visible: boolean
    top: number
    left: number
    selectedText: string
}
```

### **2. 작업 피드백 버튼**

#### **TaskFeedbackButtons (작업 피드백 버튼)**
- **용도**: AI 작업 완료 후 사용자 피드백 수집
- **소스**: `webview-ui/src/components/chat/TaskFeedbackButtons.tsx`
- **표시 위치**: `completion_result` 메시지 헤더 우측

**구성**:
- **Thumbs Up**: `codicon-thumbsup` / `codicon-thumbsup-filled`
- **Thumbs Down**: `codicon-thumbsdown` / `codicon-thumbsdown-filled`
- localStorage 기반 중복 피드백 방지

### **3. 옵션 선택 버튼**

#### **OptionsButtons (옵션 선택 버튼)**
- **용도**: AI가 제시한 선택지 중 하나를 선택
- **소스**: `webview-ui/src/components/chat/OptionsButtons.tsx`
- **표시 케이스**: 
  - `followup` 메시지
  - `plan_mode_respond` 메시지

**특징**:
- 세로 배열된 버튼 목록
- 선택 후 다른 옵션 비활성화
- 클릭 시 `TaskServiceClient.askResponse` 호출

### **4. 파일/경로 관련 버튼**

#### **파일 열기 버튼** 
- **위치**: 도구 메시지(`tool`) 내 파일 경로 영역
- **아이콘**: `codicon-link-external`
- **액션**: `FileServiceClient.openFile` 호출

#### **URL 열기 버튼**
- **위치**: `webFetch` 도구 메시지 내
- **액션**: `UiServiceClient.openUrl` 호출

### **5. 확장/축소 버튼**

#### **아코디언 토글 버튼**
- **용도**: 긴 콘텐츠의 확장/축소 제어
- **아이콘**: 
  - `codicon-chevron-up` (확장됨)
  - `codicon-chevron-down` (축소됨)
  - `codicon-chevron-right` (축소됨, 일부 케이스)

**적용 위치**:
- API 요청 상세
- 명령어 출력
- 코드 아코디언
- Thinking 섹션

### **6. 액션 버튼**

#### **"See new changes" 버튼**
- **용도**: 작업 완료 후 변경사항 확인
- **아이콘**: `codicon-new-file`
- **액션**: `TaskServiceClient.taskCompletionViewChanges` 호출

---

## 🔄 **버튼 상호작용 플로우**

### **1. 텍스트 선택 → 인용**
```
사용자 텍스트 드래그 → handleMouseUp → QuoteButton 표시 → 클릭 → onSetQuote → 입력창에 인용 추가
```

### **2. 옵션 선택**
```
AI 옵션 제시 → OptionsButtons 표시 → 사용자 선택 → TaskServiceClient.askResponse → 선택지 전송
```

### **3. 피드백 제공**
```
작업 완료 → TaskFeedbackButtons 표시 → thumbs up/down → TaskServiceClient.taskFeedback → localStorage 저장
```

### **4. 파일 관련 액션**
```
파일/URL 클릭 → FileServiceClient.openFile 또는 UiServiceClient.openUrl → 외부 애플리케이션에서 열림
```

---

## 🏗️ **시스템별 분기 로직**

### **Caret 시스템 (Agent/Chatbot 모드)**
- **Agent 모드**: 자유로운 대화 후 기본 상태 (`BUTTON_CONFIGS.default`)
- **Chatbot 모드**: 구조화된 승인 워크플로우 (`BUTTON_CONFIGS.agent_conversation`)

### **Cline 시스템 (Plan/Act 모드)** 
- **기존 Plan/Act 모드 로직 완전 보존**
- **스트리밍 상태 처리**: `BUTTON_CONFIGS.partial` (AI 응답 중 Cancel 버튼)

---

## 🛠️ **새 기능 개발 시 고려사항**

### **PRD 자동생성 기능에 적용 가능한 패턴**

1. **질문-응답 시퀀스**: `OptionsButtons` 패턴 활용
2. **단계별 진행**: `ButtonConfig`의 `primaryText`/`secondaryText` 동적 변경
3. **상태 관리**: `chatbot_mode_respond` 케이스 참조
4. **피드백 수집**: `TaskFeedbackButtons` 패턴 응용

### **새 버튼 추가 방법**

1. **BUTTON_CONFIGS**에 새 케이스 추가
2. **getButtonConfig()** 함수에 분기 로직 추가
3. 필요시 **ChatRow**에 새 버튼 컴포넌트 추가
4. **ActionType** 확장 및 핸들러 구현

### **테스트 파일 위치**
- `webview-ui/src/components/chat/chat-view/shared/__tests__/`
- `caret-src/core/messaging/__tests__/`

---

## 📍 **핵심 파일 위치 요약**

### **ActionButtons 시스템**
```
webview-ui/src/components/chat/chat-view/
├── shared/buttonConfig.ts              # 버튼 설정 중앙 관리
├── components/layout/ActionButtons.tsx # 버튼 렌더링
├── types/chatTypes.ts                  # 상태 타입 정의
└── hooks/useMessageHandlers.ts         # 버튼 액션 처리
```

### **ChatRow 버튼들**
```
webview-ui/src/components/chat/
├── ChatRow.tsx                 # 메인 ChatRow 컴포넌트
├── QuoteButton.tsx            # 인용 버튼
├── TaskFeedbackButtons.tsx    # 피드백 버튼
└── OptionsButtons.tsx         # 옵션 선택 버튼
```

---

**이 문서는 Caret의 완전한 버튼 시스템을 설명합니다. PRD 자동생성 기능 개발 시 이 패턴들을 참조하여 일관된 사용자 경험을 구현할 수 있습니다.**
