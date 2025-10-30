# 2025-10-30: 코드센터 화이트 라벨링 올바른 구현 계획

## 목표
1차 화이트 라벨링 피드백을 **올바른 아키텍처 패턴**으로 재구현한다.

## 피드백 항목 재분류

### 그룹 A: Feature Flag 방식 (CodeCenter 전용 기능 제어)
브랜드별로 기능 활성화/비활성화를 제어하는 항목들

- **항목 2**: 계정 관련 기능 제거 (`enableCaretAccountFeatures: false`)
- **항목 6**: 음성 입력 비활성화 (`enableDictationFeature: false`)
- **항목 7**: 페르소나 설정 숨김 (`showPersonaSettings: false`)

**구현 위치**: `caret-src/shared/feature-config.json`

### 그룹 B: 브랜드 유틸리티 방식 (동적 브랜드명 적용)
UI에 표시되는 브랜드명을 동적으로 변경하는 항목들

- **항목 3**: `.caretrules` → `.{brand}rules` (설정 화면)
- **항목 4**: `caret_mcp_settings.json` → `{brand}_mcp_settings.json` (MCP 설정)
- **항목 5**: 백엔드 메시지 "Caret has a question" → "{Brand} has a question"

**구현 위치**: 브랜드 유틸리티 함수 사용 (기존 `brand-utils.ts` 확장)

### 그룹 C: Cline 원본 수정 (Caret/CodeCenter 공통 이슈)
모든 브랜드에 적용되는 "Cline" 문자열 제거

- **항목 6 (공통)**: "Cline tried to use" → 브랜드 중립적 표현
- **항목 8 (공통)**: "Cline may have trouble" → 브랜드 중립적 표현

**구현 위치**: `src/` 디렉토리 (Cline 원본 파일)

---

## 구현 단계

### Phase 1: Feature Flag 구현 (그룹 A)
**대상 파일**:
- `caret-src/shared/FeatureConfig.ts` - 인터페이스 확장
- `caret-src/shared/feature-config.json` - 플래그 정의
- `webview-ui/src/components/account/AccountWelcomeView.tsx` - 계정 UI 제어
- `webview-ui/src/components/settings/sections/FeatureSettingsSection.tsx` - 음성 입력 제어
- `webview-ui/src/caret/components/CaretGeneralSettingsSection.tsx` - 페르소나 제어

**구현 방법**:
```typescript
// feature-config.json (Caret)
{
  "enableCaretAccountFeatures": true,
  "enableDictationFeature": true,
  "showPersonaSettings": true
}

// feature-config.json (CodeCenter)
{
  "enableCaretAccountFeatures": false,
  "enableDictationFeature": false,
  "showPersonaSettings": false
}
```

### Phase 2: 브랜드 유틸리티 구현 (그룹 B)

#### 2-1: 브랜드 파일명 유틸리티 추가
**대상 파일**: `caret-src/shared/brand-utils.ts`

```typescript
// 새로 추가할 함수들
export function getBrandRulesFileName(): string
export function getBrandMcpSettingsFileName(): string
```

#### 2-2: 로케일 시스템에 동적 브랜드명 적용
**대상 파일**:
- `webview-ui/src/caret/locale/*/settings.json` - 동적 키 사용
- `webview-ui/src/caret/locale/*/chat.json` - 동적 키 사용

**구현 방법**: 하드코딩 대신 변수 또는 동적 함수 호출 사용

#### 2-3: 백엔드 메시지에 브랜드 유틸리티 적용
**대상 파일**:
- `src/core/task/tools/handlers/AskFollowupQuestionToolHandler.ts`
- `src/core/task/tools/handlers/NewTaskHandler.ts`

**구현 방법**:
```typescript
// CARET MODIFICATION: Use brand utility for dynamic branding
import { getBrandName } from "@/caret/shared/brand-utils"

subtitle: `${getBrandName()} has a question...`
```

### Phase 3: Cline 원본 수정 (그룹 C)
**대상**: "Cline" 문자열이 포함된 에러 메시지들

**검색 대상**:
- "Cline tried to use"
- "Cline may have trouble"

**구현 방법**: 브랜드 중립적 표현으로 변경
```typescript
// Before: "Cline tried to use X"
// After: "Attempted to use X" or "The assistant tried to use X"
```

---

## 주요 원칙

### ✅ 해야 할 것
1. **Feature Flag**: 브랜드별 기능 차이는 `feature-config.json`으로 제어
2. **브랜드 유틸리티**: UI 브랜드명은 `brand-utils.ts` 함수 사용
3. **CARET MODIFICATION 주석**: Cline 원본 수정 시 반드시 주석 추가
4. **최소 변경**: Cline 원본 파일은 1-3줄 이내로만 수정
5. **Level 1 우선**: 가능하면 `caret-src/`에 독립 모듈로 구현

### ❌ 하지 말아야 할 것
1. **하드코딩 금지**: "CodeCenter", ".codecenterrules" 등 직접 작성 금지
2. **로케일 분기 금지**: 브랜드별로 다른 번역 파일 관리 금지
3. **직접 수정 금지**: CARET MODIFICATION 주석 없이 Cline 원본 수정 금지
4. **대규모 수정 금지**: Cline 원본 파일의 로직 구조 변경 금지

---

## 검증 체크리스트

### 빌드 검증
- [ ] `npm run compile` 성공
- [ ] TypeScript 타입 오류 없음
- [ ] 경고 메시지 없음

### 기능 검증 (Caret 브랜드)
- [ ] 계정 기능 표시됨
- [ ] 음성 입력 활성화됨
- [ ] 페르소나 설정 표시됨
- [ ] `.caretrules` 파일명 표시
- [ ] `caret_mcp_settings.json` 파일명 표시
- [ ] "Caret has a question" 메시지 표시

### 기능 검증 (CodeCenter 브랜드)
- [ ] 계정 기능 숨겨짐
- [ ] 음성 입력 비활성화됨
- [ ] 페르소나 설정 숨겨짐
- [ ] `.codecenterrules` 파일명 표시
- [ ] `codecenter_mcp_settings.json` 파일명 표시
- [ ] "CodeCenter has a question" 메시지 표시

### 공통 검증
- [ ] "Cline" 문자열 제거됨
- [ ] 브랜드 전환 시 동적으로 변경됨
- [ ] Cline 원본 복원 가능

---

## 참고 문서
- `.caretrules/caret-development.md` - Caret 개발 원칙
- `.caretrules/cline-modification.md` - Cline 수정 규칙
- `caret-docs/development/caret-architecture-and-implementation-guide.md` - 아키텍처 가이드
