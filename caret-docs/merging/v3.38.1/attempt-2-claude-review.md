# Phase D-1 코드 리뷰: ModeSystem 회귀 버그 수정

**리뷰어**: Claude
**리뷰 일시**: 2025-11-23
**대상**: SetPromptSystemMode.ts, system-prompt/index.ts 수정

---

## 📊 리뷰 요약

| 항목 | 평가 | 비고 |
|------|------|------|
| 3-way 비교 정확성 | ✅ PASS | 설계 명세대로 구현 |
| 최소 침습 원칙 | ✅ PASS | CARET MODIFICATION 주석 포함 |
| 기능 완전성 | ⚠️ PARTIAL | 테스트 미구현 |
| 빌드 검증 | ❌ FAIL | TypeScript 오류 1건 |

**최종 판정**: ⚠️ **조건부 승인** - TypeScript 오류 해결 및 테스트 추가 필요

---

## ✅ 구현 검증

### 1. SetPromptSystemMode.ts

**파일**: `src/core/controller/persona/SetPromptSystemMode.ts:34-35`

**변경 내용** (git diff):
```diff
+		// CARET MODIFICATION: Persist caretModeSystem to globalState for restart consistency
+		controller.stateManager.setGlobalStateBatch({ caretModeSystem: newMode })
```

**검증 결과**:
- [x] `setGlobalStateBatch` 호출 추가됨
- [x] CARET MODIFICATION 주석 포함
- [x] 올바른 위치 (setCurrentMode 후, postStateToWebview 전)
- [x] 설계 명세와 일치

**평가**: ✅ **PASS**

---

### 2. system-prompt/index.ts

**파일**: `src/core/prompts/system-prompt/index.ts:16-21`

**변경 내용** (git diff):
```diff
+	// CARET MODIFICATION: Route Caret mode to CaretPromptWrapper while preserving cline tool shape
+	if (context.modeSystem === "caret") {
+		const { CaretPromptWrapper } = await import("@caret/core/prompts/CaretPromptWrapper")
+		return { systemPrompt: await CaretPromptWrapper.getCaretSystemPrompt(context), tools: [] }
+	}
```

**검증 결과**:
- [x] modeSystem 분기 로직 추가됨
- [x] CaretPromptWrapper 동적 import
- [x] 반환 타입 `{ systemPrompt, tools: [] }` 일치
- [x] Cline 기존 로직 보존
- [x] CARET MODIFICATION 주석 포함
- [x] 설계 명세와 일치

**평가**: ✅ **PASS**

---

## ❌ 미완료 항목

### 1. TypeScript 컴파일 오류

**오류 내용**:
```
caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts(226,60): error TS2345
Argument of type '...' is not assignable to parameter of type 'PromptVariant'.
Property 'matcher' is missing in type '...' but required in type 'PromptVariant'.
```

**원인 분석**:
- `CaretJsonAdapter.ts`에서 사용하는 mock variant에 `matcher` 속성 누락
- Cline v3.38.1에서 `PromptVariant` 타입에 `matcher` 필드가 추가된 것으로 추정
- D-1 구현과 직접 관련은 없지만, CaretPromptWrapper 호출 경로에 영향

**해결 방안**:
```typescript
// caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts:226
// mockVariant에 matcher 속성 추가 필요
const mockVariant = {
    // ... 기존 속성들
    matcher: () => true,  // 또는 적절한 matcher 함수
}
```

---

### 2. 테스트 미구현

**설계에 명시된 테스트**:
- `caret-src/__tests__/prompt-system/mode-system.test.ts` (신규)

**필요한 테스트 케이스**:
1. `should persist caretModeSystem to globalState on mode change`
2. `should route to CaretPromptWrapper when modeSystem is caret`
3. `should use Cline registry when modeSystem is cline`
4. `should show Chatbot/Agent labels in Caret mode`
5. `should show Plan/Act labels in Cline mode`

**현재 상태**: ❌ 테스트 파일 없음

---

## 🔍 7가지 체크 항목 검증

| # | 항목 | 결과 | 비고 |
|---|------|------|------|
| 1 | 3-way 비교 정확성 | ✅ | 설계 명세 기반 구현 |
| 2 | 버그 수정 시 3-way 비교 | ✅ | 원인 분석 후 최소 수정 |
| 3 | 최소 침습 + CARET MODIFICATION 주석 | ✅ | 양쪽 파일 모두 주석 포함 |
| 4 | 하드코딩/정책 위반 | ✅ | 없음 |
| 5 | Caret 정책 준수 | ✅ | modeSystem 분기, 브랜딩 유지 |
| 6 | 보안 위험 코드 | ✅ | 없음 |
| 7 | 더미/미완성 코드 | ⚠️ | TypeScript 오류로 인해 빌드 실패 가능 |

---

## 📋 필수 조치 사항

### 즉시 해결 필요

1. **TypeScript 오류 수정** (우선순위: HIGH)
   - 파일: `caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts:226`
   - 조치: `matcher` 속성 추가

2. **빌드 검증**
   - `npm run compile` 통과 확인
   - `npm run test` 실행

### 권장 사항

3. **테스트 추가** (우선순위: MEDIUM)
   - `mode-system.test.ts` 파일 생성
   - 5개 테스트 케이스 구현

4. **수동 검증**
   - UI에서 Caret↔Cline 토글 테스트
   - 확장 재시작 후 모드 유지 확인
   - Logger 출력 확인

---

## 📝 코드 품질 평가

### 장점
- 설계 명세를 정확히 따름
- 최소 침습 원칙 준수 (각 파일 2-5줄 추가)
- CARET MODIFICATION 주석으로 추적 용이
- 반환 타입 호환성 유지

### 개선 필요
- TypeScript 타입 호환성 검증 부족
- 테스트 코드 미작성
- 로깅 일관성 (SetPromptSystemMode에 `setGlobalStateBatch` 후 로그 누락)

---

## 🔄 후속 작업

1. **D-1 완료 조건 충족**
   - [ ] TypeScript 오류 해결
   - [ ] `npm run compile` 통과
   - [ ] `npm run test` 통과
   - [ ] 수동 UI 테스트

2. **D-2 진행 조건**
   - D-1 완료 후 CLI 구현 시작
   - modeSystem 정상 동작 필수

---

## 결론

Phase D-1의 핵심 로직은 올바르게 구현되었습니다. `SetPromptSystemMode.ts`의 globalState 영속화와 `system-prompt/index.ts`의 Caret 분기가 설계대로 추가되었습니다.

그러나 **TypeScript 컴파일 오류**로 인해 현재 빌드가 실패하며, 이는 `CaretJsonAdapter.ts`의 `PromptVariant` 타입 불일치에서 발생합니다. 이 오류를 해결하고 테스트를 추가해야 D-1이 완료됩니다.

**승인 조건**: TypeScript 오류 해결 후 재검토

---

*Phase D-1 리뷰 완료: 2025-11-23*
