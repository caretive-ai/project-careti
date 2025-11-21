# 구현 가이드: 채팅 입력 메시지 히스토리 기능

## 1. 작업 목표
- 사용자가 채팅 입력창에서 위쪽/아래쪽 화살표 키를 눌렀을 때, 현재 대화 스레드 내에서 이전에 입력했던 메시지들을 탐색할 수 있는 기능을 구현합니다.

## 2. 아키텍처
- **최소 침습 원칙**: Cline 원본 코드의 수정을 최소화합니다.
- **기능 분리**: 핵심 로직은 Caret 전용 커스텀 훅(`useInputHistory.ts`)으로 분리하여 `webview-ui/src/caret/hooks/` 디렉토리에 위치시킵니다.

## 3. 수정 대상 파일 및 내용

### 파일 1: `webview-ui/src/components/chat/ChatView.tsx`
- **목표**: 전체 메시지 목록에서 사용자 메시지만 필터링하여 `InputSection` 컴포넌트로 전달합니다.
- **수정 내용**:
  ```diff
  --- a/webview-ui/src/components/chat/ChatView.tsx
  +++ b/webview-ui/src/components/chat/ChatView.tsx
  @@ -321,6 +321,15 @@
   		return groupMessages(visibleMessages)
   	}, [visibleMessages])
  
+ 	const userMessageHistory = useMemo(() => {
+ 		return messages
+ 			.filter((msg): msg is ClineMessage & { say: "text" | "user_feedback" } => {
+ 				return msg.type === "say" && (msg.say === "text" || msg.say === "user_feedback")
+ 			})
+ 			.map((msg) => msg.text)
+ 			.filter((text): text is string => !!text)
+ 	}, [messages])
+ 
   	// Use scroll behavior hook
   	const scrollBehavior = useScrollBehavior(messages, visibleMessages, groupedMessages, expandedRows, setExpandedRows)
  
  @@ -403,6 +412,7 @@
   					scrollBehavior={scrollBehavior}
   					selectFilesAndImages={selectFilesAndImages}
   					shouldDisableFilesAndImages={shouldDisableFilesAndImages}
+ 					userMessageHistory={userMessageHistory}
   				/>
   			</footer>
   		</ChatLayout>
  ```

### 파일 2: `webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx`
- **목표**: `ChatView`로부터 받은 `userMessageHistory` prop을 `ChatTextArea`로 전달합니다.
- **수정 내용**:
  ```diff
  --- a/webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx
  +++ b/webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx
  @@ -8,6 +8,7 @@
   	placeholderText: string
   	shouldDisableFilesAndImages: boolean
   	selectFilesAndImages: () => Promise<void>
+ 	userMessageHistory?: string[]
   }
   
   /**
  @@ -19,6 +20,7 @@
   	placeholderText,
   	shouldDisableFilesAndImages,
   	selectFilesAndImages,
+ 	userMessageHistory,
   }) => {
   	const {
   		activeQuote,
  @@ -67,6 +69,7 @@
   				setSelectedFiles={setSelectedFiles}
   				setSelectedImages={setSelectedImages}
   				shouldDisableFilesAndImages={shouldDisableFilesAndImages}
+ 				userMessageHistory={userMessageHistory}
   			/>
   		</>
   	)
  ```

### 파일 3: `webview-ui/src/caret/hooks/useInputHistory.ts` (신규 생성)
- **목표**: 히스토리 탐색 로직을 관리하는 커스텀 훅을 생성합니다.
- **파일 내용**:
  ```typescript
  import { useState, useCallback, useEffect } from "react"

  interface UseInputHistoryParams {
  	history: string[]
  	inputValue: string
  	setInputValue: (value: string) => void
  }

  export function useInputHistory({ history, inputValue, setInputValue }: UseInputHistoryParams) {
  	const [historyIndex, setHistoryIndex] = useState(-1)
  	const [currentInput, setCurrentInput] = useState("")

  	useEffect(() => {
  		if (historyIndex !== -1 && inputValue !== history[historyIndex]) {
  			setHistoryIndex(-1)
  		}
  		setCurrentInput(inputValue)
  	}, [inputValue, history, historyIndex])

  	const handleKeyDown = useCallback(
  		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
  			if (history.length === 0) {
  				return false
  			}

  			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
  				if (event.currentTarget.selectionStart === 0 || event.currentTarget.selectionStart === inputValue.length) {
  					event.preventDefault()
  				} else {
  					return false
  				}

  				let newIndex: number
  				if (event.key === "ArrowUp") {
  					newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
  				} else {
  					newIndex = historyIndex === -1 ? -1 : Math.min(history.length, historyIndex + 1)
  				}

  				setHistoryIndex(newIndex)

  				if (newIndex >= 0 && newIndex < history.length) {
  					setInputValue(history[newIndex])
  				} else {
  					setInputValue(currentInput)
  					setHistoryIndex(-1)
  				}
  				return true
  			}

  			return false
  		},
  		[history, historyIndex, currentInput, inputValue, setInputValue],
  	)

  	return { handleKeyDown }
  }
  ```

### 파일 4: `webview-ui/src/components/chat/ChatTextArea.tsx`
- **목표**: `useInputHistory` 훅을 사용하여 키보드 이벤트를 처리합니다.
- **수정 내용**:
  ```diff
  --- a/webview-ui/src/components/chat/ChatTextArea.tsx
  +++ b/webview-ui/src/components/chat/ChatTextArea.tsx
  @@ -8,6 +8,7 @@
   import { useClickAway, useWindowSize } from "react-use"
   import styled from "styled-components"
   import { useCaretI18n } from "@/caret/hooks/useCaretI18n"
+  import { useInputHistory } from "@/caret/hooks/useInputHistory"
   import ContextMenu from "@/components/chat/ContextMenu"
   import { CHAT_CONSTANTS } from "@/components/chat/chat-view/constants"
   import SlashCommandMenu from "@/components/chat/SlashCommandMenu"
  @@ -59,6 +60,7 @@
   	shouldDisableFilesAndImages: boolean
   	onHeightChange?: (height: number) => void
   	onFocusChange?: (isFocused: boolean) => void
+ 	userMessageHistory?: string[]
   }
   
   interface GitCommit {
  @@ -222,6 +224,7 @@
   			shouldDisableFilesAndImages,
   			onHeightChange,
   			onFocusChange,
+ 			userMessageHistory = [],
   		},
   		ref,
   	) => {
  @@ -263,6 +266,12 @@
   		// Add a ref to track previous menu state
   		const prevShowModelSelector = useRef(showModelSelector)
  
+ 		const { handleKeyDown: handleHistoryKeyDown } = useInputHistory({
+ 			history: userMessageHistory,
+ 			inputValue,
+ 			setInputValue,
+ 		})
+ 
   		// Fetch git commits when Git is selected or when typing a hash
   		useEffect(() => {
   			if (selectedType === ContextMenuOptionType.Git || /^[a-f0-9]+$/i.test(searchQuery)) {
  @@ -415,6 +424,10 @@
   
   		const handleKeyDown = useCallback(
   			(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
+ 				if (handleHistoryKeyDown(event)) {
+ 					return
+ 				}
+ 
   				if (showSlashCommandsMenu) {
   					if (event.key === "Escape") {
   						setShowSlashCommandsMenu(false)
  @@ -612,6 +625,7 @@
   				const newValue = e.target.value
   				const newCursorPosition = e.target.selectionStart
   				setInputValue(newValue)
+ 				// History index is reset within the useInputHistory hook's useEffect
   				setCursorPosition(newCursorPosition)
   				let showMenu = shouldShowContextMenu(newValue, newCursorPosition)
   				const showSlashCommandsMenu = shouldShowSlashCommandsMenu(newValue, newCursorPosition)
  ```

## 4. 테스트 시나리오
1. 채팅창에 여러 메시지를 입력합니다.
2. 위쪽 화살표 키를 누르면 가장 최근에 입력한 메시지가 나타나는지 확인합니다.
3. 위쪽 화살표 키를 계속 누르면 이전 메시지들이 순서대로 나타나는지 확인합니다.
4. 아래쪽 화살표 키를 누르면 다시 최신 메시지 방향으로 탐색되는지 확인합니다.
5. 히스토리 탐색 중 메시지를 수정하고 전송하면 정상적으로 전송되는지 확인합니다.
6. 히스토리 탐색 후 다시 위쪽 화살표 키를 누르면 가장 최근 메시지부터 다시 탐색을 시작하는지 확인합니다.

## 5. 구현 결과 (2025-10-01)

- **구현 완료**: 모든 파일이 구현 가이드대로 작성됨
- **기능 동작**: Input History 기능은 정상적으로 작동함 (위/아래 화살표 키로 이전 메시지 탐색)
- **메시지 처리 문제**: 구현과는 별개로 두 번째 메시지부터 백엔드 응답이 중단되는 문제 발견
- **롤백 결정**: 메시지 처리 문제가 복잡하여 Input History 기능 포함하여 모든 수정사항 롤백함

## 6. 향후 재구현 시 참고사항

- Input History 기능 자체는 완전히 작동함
- 메시지 처리 문제가 먼저 해결된 후 재적용 가능
- 구현 가이드는 그대로 유효함

## 7. VS Code AI를 통한 복원 작업 지시사항 (2025-10-01)

**상황**: Input History 기능이 이전에 완전히 구현되어 작동했으나, 메시지 처리 문제로 인해 모든 코드가 롤백됨. 이제 VS Code Timeline/Local History에서 이전 구현을 찾아 Input History 기능만 복원 필요.

**VS Code AI에게 전달할 작업 내용**:

### 1단계: 로컬 히스토리에서 구현 찾기
- VS Code Timeline 패널에서 다음 파일들의 히스토리 확인:
  - `webview-ui/src/components/chat/ChatView.tsx`
  - `webview-ui/src/components/chat/ChatTextArea.tsx`
  - `webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx`
  - `webview-ui/src/caret/hooks/useInputHistory.ts` (새로 생성되었던 파일)

### 2단계: 복원할 코드 내용
- **ChatView.tsx**: `userMessageHistory` 배열 생성 및 InputSection으로 전달
- **InputSection.tsx**: `userMessageHistory` prop 추가 및 ChatTextArea로 전달
- **ChatTextArea.tsx**: `useInputHistory` 훅 import 및 사용, handleKeyDown에서 history 처리
- **useInputHistory.ts**: 커스텀 훅 파일 전체 복원

### 3단계: 적용 순서
1. `useInputHistory.ts` 파일 먼저 생성
2. `ChatView.tsx`에서 userMessageHistory 배열 생성
3. `InputSection.tsx`에서 prop 전달
4. `ChatTextArea.tsx`에서 훅 사용 및 키보드 이벤트 처리

### 4단계: 테스트
- `npm run compile`로 컴파일 확인
- F5로 개발 환경 실행
- 채팅창에서 위/아래 화살표 키로 이전 메시지 탐색 테스트

**주의사항**:
- 메시지 처리 관련 백엔드 수정(`askResponse.ts`)은 복원하지 말 것
- 순수 프론트엔드 Input History 기능만 복원
- 기존 구현 가이드(위 섹션들) 참고하여 정확한 코드 구조 확인

**참고**: 위 구현 가이드의 diff 내용이 정확한 구현 내용이므로 그대로 적용하면 됨
