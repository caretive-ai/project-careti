# i18n 동적 번역 패턴 (Atom)

> **AI 재사용 코드 패턴 블록**

## 🧩 **패턴 요약**
정적, 모듈 로드 타임 번역을 동적 함수 + useMemo를 사용한 반응형 번역으로 변환하는 표준 패턴입니다.

## 📝 **코드 템플릿**

### A. 동적 함수 변환
```typescript
// Before: 정적 상수 (문제)
export const STATIC_DATA = [
    { name: t("key1", "namespace") },
    { name: t("key2", "namespace") }
]

// After: 동적 함수 (해결)
export const getDynamicData = () => [
    { name: t("key1", "namespace") },
    { name: t("key2", "namespace") }
]
```

### B. 컴포넌트 내 사용 패턴
```typescript
// 필요 임포트
import { useMemo } from "react"
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"
import { getDynamicData } from "./constants"

function Component() {
    // CARETI MODIFICATION: i18n 컨텍스트를 사용하여 언어 변경 감지
    const { language } = useCaretI18nContext()

    // CARETI MODIFICATION: 동적 함수를 언어 의존성과 함께 사용하여 i18n 업데이트
    const dynamicData = useMemo(() => getDynamicData(), [language])

    // 기존 STATIC_DATA 대신 dynamicData 사용
    return <div>{dynamicData.map(...)}</div>
}
```

## 🔧 **적용 단계**

### 1. 상수 → 함수 변환
```typescript
// 상수명에 'get' 접두사를 붙여 함수명 생성
SETTINGS_TABS → getSettingsTabs()
ACTION_METADATA → getActionMetadata()
MENU_ITEMS → getMenuItems()
```

### 2. 임포트 추가
```typescript
// CARETI MODIFICATION: i18n 반응성을 위해 useMemo 추가
import { useMemo } from "react"
// CARETI MODIFICATION: 언어 반응성을 위해 i18n 컨텍스트 임포트
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"
```

### 3. 컴포넌트 내 변수 생성
```typescript
const { language } = useCaretI18nContext()
const dynamicData = useMemo(() => getDynamicData(), [language])
```

### 4. 모든 참조 변경
```typescript
// Before: STATIC_DATA.map(...)
// After: dynamicData.map(...)
```

## ⚠️ **중요 사항**

### 필수 의존성
- `useCaretI18nContext`: 언어 변경 감지용
- `useMemo`: 성능 최적화 및 언어 의존성 처리
- `[language]`: 의존성 배열에 반드시 포함

### CARETI MODIFICATION 주석
```typescript
// CARETI MODIFICATION: i18n 지원을 위해 정적 상수를 동적 함수로 변환
export const getDynamicData = () => [...]

// CARETI MODIFICATION: i18n 컨텍스트를 사용하여 언어 변경 감지
const { language } = useCaretI18nContext()

// CARETI MODIFICATION: 동적 함수를 언어 의존성과 함께 사용하여 i18n 업데이트
const dynamicData = useMemo(() => getDynamicData(), [language])
```

## 🎯 **검증 방법**

### 자동 검증
```bash
# 타입 체크
npm run check-types

# 빌드 테스트
npm run build:webview
```

### 수동 검증
1. 설정에서 언어를 다른 언어로 변경
2. 컴포넌트에서 번역이 즉시 적용되는지 확인
3. 다른 언어로 다시 변경하여 재확인

## 📋 **체크리스트**
- [ ] 정적 상수를 함수로 변환
- [ ] `useCaretI18nContext` 사용
- [ ] `useMemo`로 언어 의존성 처리
- [ ] 모든 참조를 동적 변수로 업데이트
- [ ] `CARETI MODIFICATION` 주석 추가
- [ ] 컴파일 및 기능 검증

---
**패턴 버전**: v1.0
**사용 예**: AutoApproveBar, SettingsView

## 미러링 정책
- 이 파일 수정 시 `.agents/workflows/atoms/i18n-dynamic-pattern.md`도 동일하게 업데이트
