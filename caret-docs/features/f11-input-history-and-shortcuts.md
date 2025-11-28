# F11 - Input History & Shortcuts (입력 히스토리 및 단축키)

**상태**: ✅ Phase 2 완료  
**영향 범위**: Backend (Manager, gRPC), Webview (Hooks, UI)  
**우선순위**: 🟡 Medium

---

## 📋 개요

Caret의 **Input History & Shortcuts** 시스템은 터미널과 유사한 사용자 경험을 제공합니다.  
입력했던 메시지를 `↑` / `↓` 키로 탐색할 수 있으며, 워크스페이스별로 영구 저장됩니다. 또한 자주 쓰는 동작에 대한 단축키를 제공합니다.

---

## 🆚 Cline 대비 개선점 (Improvements)

| 기능 | Cline (Original) | Caret (Enhanced) |
| --- | --- | --- |
| **입력 히스토리** | 없음 (새로고침 시 사라짐) | **Persistent History**. 입력 내용은 백엔드에 즉시 저장되어 VS Code 재시작 후에도 유지됨. |
| **탐색 UX** | 지원 안 함 | **Terminal-like UX**. `ArrowUp` / `ArrowDown` 키로 이전/다음 입력 내용을 빠르게 탐색. |
| **단축키** | 제한적 | **Expanded Shortcuts**. `Esc`(취소), `Ctrl+Shift+R`(작업 재개) 등 생산성 단축키 지원. |
| **데이터 관리** | 관리 안 됨 | **Clean Data**. AI 응답은 제외하고 순수 사용자 입력만 저장하여 탐색 효율성 극대화. |

---

## 🏗 코드 범위 (Code Scope)

### 1. Backend (State Management)
- **`caret-src/managers/CaretGlobalManager.ts`**: 입력 히스토리 캐싱 및 gRPC 저장 리졸버 연동.
- **`src/core/controller/index.ts`**: 웹뷰 초기화 시 저장된 히스토리 로드 (`getStateToPostToWebview`).

### 2. Webview (Hooks & Components)
- **`webview-ui/src/caret/hooks/usePersistentInputHistory.ts`**: 백엔드 상태 구독 및 로컬 캐시 관리 훅.
- **`webview-ui/src/caret/hooks/useInputHistory.ts`**: 키보드 이벤트(`ArrowUp/Down`) 처리 및 입력창 제어 로직.
- **`webview-ui/src/components/chat/ChatTextArea.tsx`**: 키보드 이벤트 핸들러 통합.
- **`webview-ui/src/caret/shortcuts/shortcuts.json`**: 단축키 정의 파일.

---

## 📋 **기능 개요**

### **핵심 개념**
- **터미널 일관성**: bash/zsh와 동일한 위/아래 화살표 키 탐색
- **영구 저장**: VS Code 워크스페이스별 히스토리 영구 보관
- **즉시 저장**: 메시지 전송 시점에 히스토리 추가
- **정확성**: AI 응답 혼입 없이 사용자 입력만 순수 저장
- **단축키 카탈로그**:
  - `ArrowUp/ArrowDown`을 공식 히스토리 단축키로 정의(터미널 UX)
  - 스트리밍 취소: `Esc` (Cancel)
  - 작업 재개: `Ctrl+Shift+R` (Resume/Proceed)
  - 정의는 전역 JSON(`webview-ui/src/caret/shortcuts/shortcuts.json`)에 저장하고 매니저(`ShortcutManager`)를 통해 로드·표시한다.

## 🏗️ **시스템 아키텍처**

### **파일 구조**
```
caret-src/managers/
└── CaretGlobalManager.ts           # 통합 상태 관리 및 gRPC 연동

webview-ui/src/caret/hooks/
├── usePersistentInputHistory.ts    # CaretGlobalManager 연동 로직
└── useInputHistory.ts              # 키보드 탐색 로직

webview-ui/src/components/chat/
├── ChatView.tsx                    # 메시지 핸들러 확장
├── ChatTextArea.tsx                # 키보드 이벤트 처리
└── chat-view/components/layout/
    └── InputSection.tsx            # Props 중계
```

### **데이터 흐름**
```
사용자 입력 → addToHistory() → StateServiceClient → 백엔드 저장 (updateSettings)
                     ↓                                      ↓
               로컬 캐시 업데이트                     getStateToPostToWebview()
                     ↓                                      ↓
키보드 이벤트 ← useInputHistory ← useExtensionState ← ExtensionStateContext
```

## 🔧 **핵심 구현**

### **1. ExtensionState 직접 구독 훅**
```typescript
// usePersistentInputHistory.ts
export function usePersistentInputHistory() {
    const { inputHistory: stateInputHistory } = useExtensionState()
    const [localHistory, setLocalHistory] = useState<string[]>([])

    // 백엔드 상태 직접 구독으로 로딩 문제 해결
    useEffect(() => {
        if (stateInputHistory !== undefined) {
            setLocalHistory(stateInputHistory)
            CaretGlobalManager.setInputHistoryCache(stateInputHistory)
            caretWebviewLogger.info(`[INPUT-HISTORY] Hook loaded ${stateInputHistory.length} items from backend state`)
        }
    }, [stateInputHistory])

    const addToHistory = useCallback(async (text: string) => {
        if (!text.trim()) return

        // 중복 제거
        if (localHistory[localHistory.length - 1] === text.trim()) return

        const newHistory = [...localHistory, text.trim()].slice(-MAX_HISTORY_SIZE)

        // 로컬 상태 즉시 업데이트 (UI 반응성)
        setLocalHistory(newHistory)

        // 백엔드 저장 via gRPC
        try {
            await CaretGlobalManager.setInputHistory(newHistory)
            caretWebviewLogger.info(`[INPUT-HISTORY] Saved history item: "${text.trim().substring(0, 50)}..."`)
        } catch (error) {
            caretWebviewLogger.error("[INPUT-HISTORY] Failed to save input history:", error)
            setLocalHistory(localHistory) // 실패 시 롤백
        }
    }, [localHistory])

    return { inputHistory: localHistory, addToHistory }
}
```

### **2. 키보드 탐색 훅**
```typescript
// useInputHistory.ts
export function useInputHistory({ history, inputValue, setInputValue }: UseInputHistoryParams) {
    const [historyIndex, setHistoryIndex] = useState(-1)
    const [currentInput, setCurrentInput] = useState("")

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (history.length === 0) return false

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            // 커서가 텍스트 시작/끝에 있을 때만 히스토리 탐색
            if (event.currentTarget.selectionStart === 0 ||
                event.currentTarget.selectionStart === inputValue.length) {
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
    }, [history, historyIndex, currentInput, inputValue, setInputValue])

    return { handleKeyDown }
}
```

### **3. CaretGlobalManager 확장**
```typescript
// CaretGlobalManager.ts - 캐시 및 백엔드 저장 담당
export class CaretGlobalManager {
    private _inputHistory: string[] = []
    private _inputHistoryResolver?: (history: string[]) => Promise<void>

    // gRPC 백엔드 저장 리졸버 초기화
    public initializeInputHistoryResolver(resolver: (history: string[]) => Promise<void>): void {
        this._inputHistoryResolver = resolver
    }

    // 캐시된 히스토리 반환 (빠른 접근)
    public async getInputHistory(): Promise<string[]> {
        return this._inputHistory
    }

    // 백엔드 저장 + 캐시 업데이트
    public async setInputHistory(history: string[]): Promise<void> {
        this._inputHistory = history // 로컬 캐시 업데이트

        // 백엔드 저장 via resolver
        if (this._inputHistoryResolver) {
            try {
                await this._inputHistoryResolver(history)
                console.log("[CARET-GLOBAL-MANAGER] ✅ Input history saved to backend")
            } catch (error) {
                console.error("[CARET-GLOBAL-MANAGER] ❌ Failed to save input history:", error)
            }
        }
    }

    // 백엔드에서 로드된 데이터를 캐시에 설정
    public setInputHistoryCache(history: string[]): void {
        this._inputHistory = history
        console.log(`[CARET-GLOBAL-MANAGER] ✅ Input history cache updated with ${history.length} items`)
    }

    // Static accessors
    public static async getInputHistory(): Promise<string[]> {
        return CaretGlobalManager.get().getInputHistory()
    }

    public static async setInputHistory(history: string[]): Promise<void> {
        return CaretGlobalManager.get().setInputHistory(history)
    }

    public static initInputHistoryResolver(resolver: (history: string[]) => Promise<void>): void {
        CaretGlobalManager.get().initializeInputHistoryResolver(resolver)
    }

    public static setInputHistoryCache(history: string[]): void {
        CaretGlobalManager.get().setInputHistoryCache(history)
    }
}
```

### **4. 메시지 핸들러 확장**
```typescript
// ChatView.tsx
export default function ChatView() {
    // CARET MODIFICATION: CaretGlobalManager를 통한 persistent input history
    const { inputHistory, addToHistory } = usePersistentInputHistory()

    // CARET MODIFICATION: Enhanced message handler with async history tracking
    const enhancedMessageHandlers = useMemo(() => ({
        ...messageHandlers,
        handleSendMessage: async (text: string, images: string[], files: string[]) => {
            await addToHistory(text) // CaretGlobalManager를 통한 비동기 저장
            return await messageHandlers.handleSendMessage(text, images, files)
        }
    }), [messageHandlers, addToHistory])

    return (
        <InputSection
            messageHandlers={enhancedMessageHandlers} // 확장된 핸들러 사용
            inputHistory={inputHistory} // 히스토리 전달
        />
    )
}
```

### **5. 키보드 이벤트 통합**
```typescript
// ChatTextArea.tsx
const ChatTextArea = forwardRef<HTMLTextAreaElement, ChatTextAreaProps>(({
    inputHistory = [], // CARET MODIFICATION: Persistent input history functionality
    // ... 기타 props
}, ref) => {
    // CARET MODIFICATION: Persistent input history functionality
    const { handleKeyDown: handleHistoryKeyDown } = useInputHistory({
        history: inputHistory,
        inputValue,
        setInputValue,
    })

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // CARET MODIFICATION: Handle persistent input history before other key events
        if (handleHistoryKeyDown(event)) {
            return
        }

        // 기존 키보드 이벤트 처리...
    }, [handleHistoryKeyDown, /* 기타 의존성 */])
})
```

## 💾 **저장 및 성능**

### **저장 방식**
- **로컬 캐시**: CaretGlobalManager 메모리 (즉시 접근)
- **백엔드 저장**: gRPC StateServiceClient (영구 유지)
- **즉시 저장**: 입력마다 즉시 백엔드 저장 (데이터 안전성)

### **성능 최적화**
```typescript
const MAX_HISTORY_SIZE = 1000  // 최대 1000개 항목

// CaretGlobalManager의 하이브리드 캐싱
public async getInputHistory(): Promise<string[]> {
    if (this._inputHistory.length === 0) {
        // 초기 로드 시에만 백엔드 호출
        const response = await StateServiceClient.getSettings()
        this._inputHistory = response.inputHistory || []
    }
    return this._inputHistory // 이후 빠른 메모리 접근
}
```

### **메모리 사용량**
- **1000개 항목**: 평균 200자 × 1000 = 약 200KB
- **중복 제거**: 연속된 동일 입력 자동 제거
- **자동 정리**: 1000개 초과 시 오래된 항목 삭제
- **gRPC 효율성**: 바이너리 프로토콜로 빠른 전송

## 🎯 **사용자 경험**

### **터미널과 일관된 동작**
1. **위쪽 화살표**: 이전 입력으로 이동
2. **아래쪽 화살표**: 다음 입력으로 이동 (또는 현재 입력으로 복원)
3. **커서 위치 고려**: 텍스트 시작/끝에서만 히스토리 탐색
4. **세션 유지**: VS Code 재시작 후에도 히스토리 보존

### **실제 사용 흐름**
```
1. 사용자: "파일 목록을 보여줘" (Enter)
   → 히스토리에 저장됨

2. 사용자: "README.md 파일을 읽어줘" (Enter)
   → 히스토리에 저장됨

3. 사용자: 입력창에서 ↑ 키 누름
   → "README.md 파일을 읽어줘" 표시

4. 사용자: ↑ 키 한 번 더 누름
   → "파일 목록을 보여줘" 표시

5. 사용자: ↓ 키 누름
   → "README.md 파일을 읽어줘" 표시
```

## 🔄 **최소 침습 원칙**

모든 수정사항은 `// CARET MODIFICATION:` 주석으로 명확히 표시:

```typescript
// CARET MODIFICATION: Persistent input history functionality
const { inputHistory, addToHistory } = usePersistentInputHistory()

// CARET MODIFICATION: Enhanced message handler with history tracking
const enhancedMessageHandlers = useMemo(() => ({
    ...messageHandlers,
    handleSendMessage: async (text: string, images: string[], files: string[]) => {
        addToHistory(text) // 히스토리에 추가
        return await messageHandlers.handleSendMessage(text, images, files)
    }
}), [messageHandlers, addToHistory])

inputHistory?: string[] // CARET MODIFICATION: Persistent input history functionality
```

## 🧪 **테스트 및 검증**

### **기능 테스트**
```bash
# 1. 컴파일 확인
npm run compile

# 2. 개발 환경 실행
npm run watch

# 3. F5로 VS Code 개발 창 실행
# 4. 여러 메시지 입력 후 위/아래 화살표로 탐색 테스트
# 5. VS Code 재시작 후 히스토리 유지 확인
```

### **검증 포인트**
- ✅ 사용자 입력만 저장 (AI 응답 혼입 없음)
- ✅ 위/아래 화살표 키 정상 동작
- ✅ 커서 위치에 따른 조건부 탐색
- ✅ VS Code 재시작 후 히스토리 유지
- ✅ 중복 입력 자동 제거
- ✅ 최대 크기 제한 동작

## 📊 **기술적 장점**

### **vs 기존 필터링 방식**
| 비교 항목 | 기존 방식 (삭제됨) | 현재 방식 (Caret) |
|---|---|---|
| **정확성** | AI 응답 혼입 | 사용자 입력만 |
| **성능** | 매번 필터링 연산 | 즉시 접근 |
| **저장** | 임시 (세션 종료시 삭제) | 영구 저장 |
| **일관성** | - | 터미널과 동일한 UX |

### **구현 복잡도**
- **백엔드 수정 포함**: `getStateToPostToWebview()` 수정으로 전체 플로우 완성
- **기존 아키텍처 활용**: ExtensionState 패턴 재사용
- **최소 침습**: 총 6개 파일에 주석 표시된 수정사항만 추가

## 🔧 **문제 해결 과정**

### **초기 문제: 웹뷰 리로드 시 히스토리 누락**
**증상**: 백엔드 저장 성공하지만 리로드 후 히스토리 복원 안됨

**원인**: `getStateToPostToWebview()`에서 `inputHistory` 전송 누락
```typescript
// 수정 전: inputHistory 조회/전송 없음
// 수정 후: 백엔드 상태 조회 및 전송 추가
const inputHistory = this.stateManager.getGlobalStateKey("inputHistory")
return { ..., inputHistory }
```

**해결**:
1. 백엔드 상태 조회 추가 (`src/core/controller/index.ts`)
2. Hook에서 `useExtensionState()` 직접 구독
3. 로깅 시스템 개선 (Logger.info + caretWebviewLogger)

### **로딩 플로우 완성**
```
웹뷰 초기화 → subscribeToState → getStateToPostToWebview() → inputHistory 포함
     ↓
ExtensionStateContext → useExtensionState() → usePersistentInputHistory
     ↓
setLocalHistory(stateInputHistory) → 히스토리 복원 완료
```

---

**문서 버전**: v2.0 (2025-10-01 완전 구현 완료)
**담당**: Luke Yang + Claude Code
**관련 작업**: [20251001-3-input-history-implementation-guide-v2.md]
**최종 검증**: ✅ 웹뷰 리로드 시 히스토리 복원 확인됨
