# 구현 가이드: 채팅 입력 메시지 히스토리 기능 (v4 - 완전 구현 완료)

## 1. 작업 목표 (✅ 2025-10-01 완료)
- 사용자가 채팅 입력창에서 위쪽/아래쪽 화살표 키를 눌렀을 때, 이전에 입력했던 메시지들을 탐색할 수 있는 기능을 구현합니다.
- **터미널과 일관된 경험**: 세션 종료 후에도 히스토리 유지, 워크스페이스별 저장 ✅
- **정확성**: AI 응답 섞임 없이 사용자 입력만 정확히 저장 ✅
- **웹뷰 리로드 시 히스토리 복원**: 초기 로딩 문제 해결 ✅

## 2. 아키텍처 (v2 - CaretGlobalManager 패턴)
- **최소 침습 원칙**: Cline 원본 코드의 수정을 최소화합니다.
- **CaretGlobalManager 활용**: Caret 전용 통합 상태 관리 패턴 사용
- **gRPC 백엔드 연동**: StateServiceClient를 통한 영구 저장
- **하이브리드 저장**: 로컬 캐시(빠른 접근) + 백엔드 저장(영구 유지)
- **입력 즉시 저장**: 메시지 전송 시점에 히스토리에 추가 (기존 필터링 방식 삭제)

## 3. 기존 방식 대비 변경점

### 기존 방식 (이미 삭제됨)
```typescript
// ChatView.tsx - 삭제된 코드 (필터링 방식)
const userMessageHistory = useMemo(() => {
    return messages
        .filter((msg) => msg.type === "say" && msg.say === "user_feedback")
        .map((msg) => msg.text)
        .filter((text) => !!text)
}, [messages])
```

### 새로운 방식 (구현 완료)
```typescript
// ChatView.tsx - CaretGlobalManager 패턴으로 구현됨
const { inputHistory, addToHistory } = usePersistentInputHistory()

// 메시지 전송 시 히스토리에 추가 (enhancedMessageHandlers 내부에서 처리)
const enhancedMessageHandlers = useMemo(() => ({
    ...messageHandlers,
    handleSendMessage: async (text: string, images: string[], files: string[]) => {
        addToHistory(text) // CaretGlobalManager를 통한 즉시 저장
        return await messageHandlers.handleSendMessage(text, images, files)
    }
}), [messageHandlers, addToHistory])
```

## 4. 구현된 파일 및 내용

### 파일 1: `webview-ui/src/caret/hooks/usePersistentInputHistory.ts` (구현 완료)
```typescript
// CARET MODIFICATION: Persistent input history hook using CaretGlobalManager pattern
import { useState, useCallback, useEffect } from "react"
import { CaretGlobalManager } from "../../../../caret-src/managers/CaretGlobalManager"
import { StateServiceClient } from "@/services/grpc-client"

const MAX_HISTORY_SIZE = 1000

export function usePersistentInputHistory() {
    const [localHistory, setLocalHistory] = useState<string[]>([])

    // Initialize CaretGlobalManager resolver and load history
    useEffect(() => {
        // Set up resolver for backend communication
        const saveToBackend = async (history: string[]) => {
            await StateServiceClient.updateSettings({
                inputHistory: history
            })
        }
        CaretGlobalManager.initInputHistoryResolver(saveToBackend)

        // Load existing history
        const loadHistory = async () => {
            try {
                const history = await CaretGlobalManager.getInputHistory()
                setLocalHistory(history)
                console.log(`[INPUT-HISTORY] Loaded ${history.length} items from CaretGlobalManager`)
            } catch (error) {
                console.warn("[INPUT-HISTORY] Failed to load input history:", error)
            }
        }
        loadHistory()
    }, [])

    // Add new item to history
    const addToHistory = useCallback(async (text: string) => {
        if (!text.trim()) return

        // Remove duplicates (don't add if same as last item)
        if (localHistory[localHistory.length - 1] === text.trim()) return

        const newHistory = [...localHistory, text.trim()].slice(-MAX_HISTORY_SIZE)

        // Update local state immediately for UI responsiveness
        setLocalHistory(newHistory)

        // Save to backend via CaretGlobalManager
        try {
            await CaretGlobalManager.setInputHistory(newHistory)
            console.log(`[INPUT-HISTORY] Saved history item: "${text.trim().substring(0, 50)}..."`)
        } catch (error) {
            console.error("[INPUT-HISTORY] Failed to save input history:", error)
            // Rollback local state on failure
            setLocalHistory(localHistory)
        }
    }, [localHistory])

    return {
        inputHistory: localHistory,
        addToHistory
    }
}
```

### 파일 2: `webview-ui/src/caret/hooks/useInputHistory.ts` (기존 유지)
```typescript
// 기존 코드 유지하되 history 매개변수만 사용
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
                // 커서가 텍스트 시작/끝에 있을 때만 히스토리 탐색
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

### 파일 3: `webview-ui/src/components/chat/ChatView.tsx` (구현 완료)
```diff
--- a/webview-ui/src/components/chat/ChatView.tsx
+++ b/webview-ui/src/components/chat/ChatView.tsx
@@ -4,6 +4,7 @@
 import { useCaretI18n } from "@/caret/hooks/useCaretI18n"
+import { usePersistentInputHistory } from "@/caret/hooks/usePersistentInputHistory"

-	// CARET MODIFICATION: Filter user messages for input history functionality
-	const userMessageHistory = useMemo(() => {
-		return messages
-			.filter((msg): msg is ClineMessage & { say: "user_feedback" } => {
-				return msg.type === "say" && msg.say === "user_feedback"
-			})
-			.map((msg) => msg.text)
-			.filter((text): text is string => !!text)
-	}, [messages])

+	// CARET MODIFICATION: Persistent input history functionality
+	const { inputHistory, addToHistory } = usePersistentInputHistory()

+	// CARET MODIFICATION: Enhanced message handler with history tracking
+	const enhancedMessageHandlers = useMemo(() => ({
+		...messageHandlers,
+		handleSendMessage: async (text: string, images: string[], files: string[]) => {
+			addToHistory(text) // 히스토리에 추가
+			return await messageHandlers.handleSendMessage(text, images, files)
+		}
+	}), [messageHandlers, addToHistory])

 				<InputSection
 					chatState={chatState}
-					messageHandlers={messageHandlers}
+					messageHandlers={enhancedMessageHandlers}
 					placeholderText={placeholderText}
 					scrollBehavior={scrollBehavior}
 					selectFilesAndImages={selectFilesAndImages}
 					shouldDisableFilesAndImages={shouldDisableFilesAndImages}
-					userMessageHistory={userMessageHistory} // CARET MODIFICATION: Pass user message history for input history
+					inputHistory={inputHistory} // CARET MODIFICATION: Pass persistent input history
 				/>
```

### 파일 4: `webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx` (구현 완료)
```diff
--- a/webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx
+++ b/webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx
 interface InputSectionProps {
 	chatState: ChatState
 	messageHandlers: MessageHandlers
 	scrollBehavior: ScrollBehavior
 	placeholderText: string
 	shouldDisableFilesAndImages: boolean
 	selectFilesAndImages: () => Promise<void>
-	userMessageHistory?: string[] // CARET MODIFICATION: Input history functionality
+	inputHistory?: string[] // CARET MODIFICATION: Persistent input history functionality
 }

 export const InputSection: React.FC<InputSectionProps> = ({
 	chatState,
 	messageHandlers,
 	scrollBehavior,
 	placeholderText,
 	shouldDisableFilesAndImages,
 	selectFilesAndImages,
-	userMessageHistory,
+	inputHistory,
 }) => {

 				shouldDisableFilesAndImages={shouldDisableFilesAndImages}
-				userMessageHistory={userMessageHistory} // CARET MODIFICATION: Pass user message history for input history
+				inputHistory={inputHistory} // CARET MODIFICATION: Pass persistent input history
 			/>
```

### 파일 5: `webview-ui/src/components/chat/ChatTextArea.tsx` (구현 완료)
```diff
--- a/webview-ui/src/components/chat/ChatTextArea.tsx
+++ b/webview-ui/src/components/chat/ChatTextArea.tsx
 interface ChatTextAreaProps {
 	// ... 기존 props
-	userMessageHistory?: string[] // CARET MODIFICATION: Input history functionality
+	inputHistory?: string[] // CARET MODIFICATION: Persistent input history functionality
 }

 		shouldDisableFilesAndImages,
 		onHeightChange,
 		onFocusChange,
-		userMessageHistory = [], // CARET MODIFICATION: Input history functionality
+		inputHistory = [], // CARET MODIFICATION: Persistent input history functionality
 	},
 	ref,
 ) => {

-		// CARET MODIFICATION: Input history functionality - hook for handling arrow key navigation through message history
+		// CARET MODIFICATION: Persistent input history functionality - hook for handling arrow key navigation
 		const { handleKeyDown: handleHistoryKeyDown } = useInputHistory({
-			history: userMessageHistory,
+			history: inputHistory,
 			inputValue,
 			setInputValue,
 		})
```

## 5. 백엔드 프로토콜 확장 (구현 완료)

### proto/cline/state.proto
```protobuf
message UpdateSettingsRequest {
  // ... 기존 필드들
  // CARET MODIFICATION: Input history for chat persistence (904 + 100 = 1004 to avoid conflicts)
  repeated string input_history = 1004;
}
```

### CaretGlobalManager 확장 (구현 완료)
```typescript
// caret-src/managers/CaretGlobalManager.ts
export class CaretGlobalManager {
  private _inputHistory: string[] = []
  private _inputHistoryResolver?: (history: string[]) => Promise<void>

  // Input history management methods
  public async getInputHistory(): Promise<string[]> { ... }
  public async setInputHistory(history: string[]): Promise<void> { ... }
  public initializeInputHistoryResolver(resolver: (history: string[]) => Promise<void>): void { ... }

  // Static accessors
  public static async getInputHistory(): Promise<string[]> { ... }
  public static async setInputHistory(history: string[]): Promise<void> { ... }
}
```

## 6. 테스트 시나리오
1. 채팅창에 여러 메시지를 입력하고 전송합니다.
2. 위쪽 화살표 키를 누르면 가장 최근에 입력한 메시지가 나타나는지 확인합니다.
3. VS Code 재시작 후에도 히스토리가 유지되는지 확인합니다.
4. 다른 워크스페이스에서는 다른 히스토리가 나타나는지 확인합니다.
5. 중복 메시지가 연속으로 저장되지 않는지 확인합니다.

## 7. 장점
- ✅ **정확성**: AI 응답 섞임 없음
- ✅ **즉시성**: 입력 즉시 히스토리에 추가
- ✅ **영구성**: 세션 종료 후에도 유지
- ✅ **효율성**: 필터링 연산 불필요
- ✅ **일관성**: 터미널과 같은 UX

## 8. 문제 해결 과정 (2025-10-01 추가)

### 8.1 초기 문제: 웹뷰 리로드 시 히스토리 누락
**증상**: 웹뷰 리로드 후 이전 입력 히스토리가 표시되지 않음
```
저장 로그: "INFO [INPUT-HISTORY] Backend updated with 2 items" ✅
로딩 로그: 없음 ❌
```

**원인 분석**:
- 백엔드에서 저장은 정상 동작
- `getStateToPostToWebview()`에서 `inputHistory`를 웹뷰로 전송하지 않음

**해결 방법**:
1. **백엔드 상태 조회 추가** (`src/core/controller/index.ts`):
```typescript
// CARET MODIFICATION: Add input history
const inputHistory = this.stateManager.getGlobalStateKey("inputHistory")
```

2. **백엔드 상태 전송 추가**:
```typescript
return {
    // ... 기존 필드들
    // CARET MODIFICATION: Include input history
    inputHistory,
}
```

### 8.2 로깅 시스템 개선
**문제**: 백엔드 로그가 `console.log`로 되어 있어 확인이 어려움

**해결**: Cline 공통 로깅 시스템 사용
```typescript
// Before: console.log(`[BACKEND] inputHistory updated...`)
// After:  Logger.info(`[INPUT-HISTORY] Backend updated with ${request.inputHistory.length} items`)
```

### 8.3 타이밍 이슈 해결
**문제**: Hook 초기화 시 백엔드 상태가 아직 로드되지 않음

**해결**: `useExtensionState()` 직접 구독 방식으로 변경
```typescript
// Before: 폴링으로 CaretGlobalManager 체크
// After:  useExtensionState()의 inputHistory 직접 구독
const { inputHistory: stateInputHistory } = useExtensionState()
useEffect(() => {
    if (stateInputHistory !== undefined) {
        setLocalHistory(stateInputHistory)
        CaretGlobalManager.setInputHistoryCache(stateInputHistory)
    }
}, [stateInputHistory])
```

### 8.4 완료된 플로우
1. **저장**: 사용자 입력 → `addToHistory()` → `StateServiceClient.updateSettings()` → 백엔드 저장
2. **로딩**: 웹뷰 초기화 → `getStateToPostToWebview()` → `inputHistory` 포함 → 프론트엔드 수신 → hook 업데이트
3. **로그**: 백엔드 `Logger.info()` + 프론트엔드 `caretWebviewLogger` 완비

## 9. 최종 검증 (✅ 완료)
- ✅ 메시지 입력 후 저장 로그 확인
- ✅ 웹뷰 리로드 후 히스토리 복원 확인
- ✅ 위/아래 화살표 키 탐색 동작 확인
- ✅ VS Code 재시작 후 영구 저장 확인
- ✅ 컴파일 오류 없음 확인