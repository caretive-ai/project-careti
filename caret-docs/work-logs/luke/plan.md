# 작업 계획: 채팅 입력 메시지 히스토리 기능 복원

## 1. 목표
롤백되었던 채팅 입력 히스토리 기능을 `input-history-implementation-guide.md` 문서에 따라 프론트엔드에만 재구현합니다.

## 2. 작업 단계

### 1단계: `useInputHistory` 커스텀 훅 생성
- **파일**: `webview-ui/src/caret/hooks/useInputHistory.ts`
- **내용**: 가이드에 명시된 내용으로 신규 파일을 생성합니다.

### 2단계: `ChatView.tsx` 수정
- **파일**: `webview-ui/src/components/chat/ChatView.tsx`
- **내용**: 전체 메시지 목록에서 사용자 메시지만 필터링하여 `userMessageHistory` 배열을 생성하고, 이를 `InputSection` 컴포넌트로 전달합니다.

### 3단계: `InputSection.tsx` 수정
- **파일**: `webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx`
- **내용**: `ChatView`로부터 받은 `userMessageHistory` prop을 `ChatTextArea` 컴포넌트로 전달합니다.

### 4단계: `ChatTextArea.tsx` 수정
- **파일**: `webview-ui/src/components/chat/ChatTextArea.tsx`
- **내용**: `useInputHistory` 훅을 사용하여 키보드 이벤트(위/아래 화살표)를 처리하는 로직을 추가합니다.

## 3. 주의사항
- 백엔드 파일(`src/core/controller/task/askResponse.ts`)은 절대 수정하지 않습니다.
- 오직 프론트엔드 관련 4개 파일만 가이드에 따라 수정/생성합니다.

## 4. 검증 절차
- 모든 파일 수정 후 `npm run compile` 및 `npm run test:webview`를 실행하여 오류가 없는지 확인합니다.
- VS Code 디버그 모드(F5)로 확장을 실행하여 채팅창에서 기능이 정상 동작하는지 테스트합니다.
