# 2025-10-01: 채팅 입력 메시지 히스토리 기능 개발

## 1. 기능 목표
- 사용자가 채팅 입력창에서 위쪽/아래쪽 화살표 키를 눌렀을 때, 현재 대화 스레드(Task) 내에서 이전에 직접 입력했던 메시지들을 탐색할 수 있는 기능을 구현한다.

## 2. 요구사항
- **트리거**: `ChatTextArea` 컴포넌트에서 `ArrowUp`, `ArrowDown` 키 입력.
- **동작**:
    - `ArrowUp`: 현재 입력창의 내용 또는 이전 히스토리보다 더 오래된 사용자 메시지를 불러온다.
    - `ArrowDown`: 더 최신 히스토리 방향으로 탐색한다.
- **범위**: 현재 진행 중인 Task 내의 사용자 메시지로 한정한다.
- **아키텍처**: 최소 침습 원칙에 따라, 핵심 로직은 Caret 전용 커스텀 훅(`useInputHistory`)으로 분리한다.

## 3. 작업 계획 (수정)
- [x] **데이터 소스 확인**: `ChatView.tsx`에서 사용자 메시지 목록을 필터링하여 prop으로 전달하는 구조를 구현.
- [ ] **커스텀 훅 생성**: `webview-ui/src/caret/hooks/useInputHistory.ts` 파일을 생성하고, 히스토리 탐색 상태와 로직을 모두 구현한다.
- [ ] **`ChatTextArea.tsx` 최소 수정**: 생성한 `useInputHistory` 훅을 호출하고, `handleKeyDown` 이벤트 핸들러에 연결하는 최소한의 코드를 추가한다.
- [ ] **구현 및 테스트**: 기능을 구현하고 테스트한다.

## 4. 세부 진행 상황
- `ChatView.tsx`와 `InputSection.tsx`에 `userMessageHistory` prop을 전달하는 로직은 이미 추가됨.
- 이제 핵심 로직을 담을 `useInputHistory.ts` 파일을 생성할 차례.
