# F10 - Input History System

**상태**: ✅ Phase 4 완료 (Backend)
**구현도**: Backend 100%, Frontend Phase 5
**우선순위**: LOW - 사용성 개선

---

## 📋 개요

**목표**: 터미널과 일관된 채팅 입력 히스토리 - 영구 저장 기반

**핵심 개념**:
- **터미널 일관성**: bash/zsh와 동일한 위/아래 화살표 탐색
- **영구 저장**: VS Code 워크스페이스별 영구 보관
- **즉시 저장**: 메시지 전송 시점에 자동 저장

### Cline vs Caret

| 구분 | Cline | Caret |
|------|-------|-------|
| **히스토리** | ❌ 없음 | ✅ 완전 구현 |
| **저장** | - | ✅ 영구 저장 |
| **UX** | - | ✅ 터미널 일관성 |

---

## 🏗️ Backend 구현 (Phase 4)

### ✅ 핵심 파일 수정

**1. controller/index.ts** (+8 lines)
```typescript
// CARET MODIFICATION: Input history state propagation
const inputHistory = this.stateManager.getGlobalStateKey("inputHistory") || []

return {
    // ... 기존 상태
    inputHistory,  // 웹뷰로 전달
}
```

**2. StateManager (기존 활용)**
```
src/core/storage/StateManager.ts
- inputHistory 상태 키 활용
- globalState 저장 (영구 유지)
```

**3. CaretGlobalManager (Caret 전용)**
```
caret-src/managers/CaretGlobalManager.ts
- 입력 히스토리 캐싱
- gRPC 백엔드 저장 로직
```

---

## 🔄 동작 방식

### Backend 흐름

```
1. 사용자 입력 → addToHistory()
2. CaretGlobalManager.setInputHistory(newHistory)
3. StateServiceClient.updateSettings({ inputHistory })
4. StateManager.setGlobalStateKey("inputHistory")
5. getStateToPostToWebview() → inputHistory 포함
6. ExtensionStateContext → useExtensionState()
```

### 저장 방식

**로컬 캐시** (즉시 접근):
```typescript
// CaretGlobalManager.ts
private _inputHistory: string[] = []

public async getInputHistory(): Promise<string[]> {
    return this._inputHistory
}
```

**백엔드 저장** (영구 유지):
```typescript
public async setInputHistory(history: string[]): Promise<void> {
    this._inputHistory = history // 캐시 업데이트
    await StateServiceClient.updateSettings({ inputHistory: history })
}
```

---

## 💾 저장 및 성능

### 저장 전략

**하이브리드 캐싱**:
- 메모리 캐시: CaretGlobalManager (빠른 접근)
- 영구 저장: globalState (세션 간 유지)
- 즉시 저장: 입력마다 백엔드 저장

### 성능 최적화

```typescript
const MAX_HISTORY_SIZE = 1000  // 최대 1000개

// 자동 정리
const newHistory = [...localHistory, text.trim()]
    .slice(-MAX_HISTORY_SIZE)  // 오래된 항목 제거

// 중복 제거
if (localHistory[localHistory.length - 1] === text.trim()) return
```

**메모리 사용량**:
- 1000개 × 평균 200자 = 약 200KB
- gRPC 바이너리 프로토콜로 효율적 전송

---

## 🎯 사용자 경험

### 터미널과 일관된 동작

**1. 위쪽 화살표** (↑): 이전 입력
**2. 아래쪽 화살표** (↓): 다음 입력
**3. 커서 위치 고려**: 시작/끝에서만 탐색
**4. 세션 유지**: VS Code 재시작 후 복원

### 사용 예시

```
1. "파일 목록 보여줘" (Enter) → 저장
2. "README.md 읽어줘" (Enter) → 저장
3. ↑ → "README.md 읽어줘" 표시
4. ↑ → "파일 목록 보여줘" 표시
5. ↓ → "README.md 읽어줘" 표시
```

---

## 📝 Modified Files (Phase 4)

**Backend만 수정**:
```
src/core/controller/index.ts                 (+8 lines)
caret-src/managers/CaretGlobalManager.ts     (입력 히스토리 로직 추가)
```

**Phase 5 수정 예정** (Frontend):
```
webview-ui/src/caret/hooks/usePersistentInputHistory.ts
webview-ui/src/caret/hooks/useInputHistory.ts
webview-ui/src/components/chat/ChatView.tsx
webview-ui/src/components/chat/ChatTextArea.tsx
```

---

## 🔧 문제 해결

### 웹뷰 리로드 시 히스토리 복원

**문제**: 리로드 후 히스토리 누락
**원인**: `getStateToPostToWebview()`에서 inputHistory 누락
**해결**: controller/index.ts에 inputHistory 상태 추가 (+8 lines)

```typescript
// 수정 전
return { /* inputHistory 없음 */ }

// 수정 후 (CARET MODIFICATION)
const inputHistory = this.stateManager.getGlobalStateKey("inputHistory") || []
return { ..., inputHistory }
```

---

## 💡 핵심 장점

**1. 사용성**
- 터미널과 동일한 UX
- 빠른 입력 재사용
- 세션 간 유지

**2. 정확성**
- 사용자 입력만 저장
- AI 응답 혼입 없음
- 중복 자동 제거

**3. 최소 침습**
- Backend 1개 파일만 수정 (+8 lines)
- 기존 StateManager 재사용
- CARET MODIFICATION 명시

---

## 🧪 검증

### 테스트 시나리오

```bash
# 1. 히스토리 저장 확인
echo "테스트 메시지 1" → Enter
echo "테스트 메시지 2" → Enter

# 2. 화살표 탐색
↑ → "테스트 메시지 2" 표시 ✅
↑ → "테스트 메시지 1" 표시 ✅

# 3. VS Code 재시작 후
# 히스토리 복원 확인 ✅
```

### 검증 포인트

- ✅ 사용자 입력만 저장
- ✅ globalState 영구 유지
- ✅ 중복 제거 동작
- ✅ 최대 크기 제한 (1000개)
- ✅ 웹뷰 리로드 시 복원

---

**작성일**: 2025-10-10
**Phase**: Phase 4 Backend 완료
**다음 단계**: Phase 5 Frontend UI 구현
