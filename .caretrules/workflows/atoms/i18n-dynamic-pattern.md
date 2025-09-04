# i18n 동적 번역 패턴 (Atom)

> **AI 재사용 가능한 코드 패턴 블록**

## 🧩 **패턴 요약**
모듈 로딩 시점의 정적 번역을 동적 함수 + useMemo로 변경하는 표준 패턴

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
// 필수 import
import { useMemo } from "react"
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"
import { getDynamicData } from "./constants"

function Component() {
    // CARET MODIFICATION: Use i18n context to detect language changes
    const { language } = useCaretI18nContext()
    
    // CARET MODIFICATION: Use dynamic function with language dependency for i18n updates
    const dynamicData = useMemo(() => getDynamicData(), [language])
    
    // 기존 STATIC_DATA 대신 dynamicData 사용
    return <div>{dynamicData.map(...)}</div>
}
```

## 🔧 **적용 단계**

### 1. 상수 → 함수 변환
```typescript
// 상수명에서 get 접두사 추가하여 함수명 생성
SETTINGS_TABS → getSettingsTabs()
ACTION_METADATA → getActionMetadata()
MENU_ITEMS → getMenuItems()
```

### 2. Import 추가
```typescript
// CARET MODIFICATION: Added useMemo for i18n reactivity
import { useMemo } from "react"
// CARET MODIFICATION: Import i18n context for language reactivity  
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"
```

### 3. 컴포넌트 내 변수 생성
```typescript
const { language } = useCaretI18nContext()
const dynamicData = useMemo(() => getDynamicData(), [language])
```

### 4. 모든 참조 변경
```typescript
// 기존: STATIC_DATA.map(...)
// 변경: dynamicData.map(...)
```

## ⚠️ **주의사항**

### 필수 의존성
- `useCaretI18nContext`: 언어 변경 감지
- `useMemo`: 성능 최적화 및 언어 의존성 처리
- `[language]`: 의존성 배열에 반드시 포함

### CARET MODIFICATION 주석
```typescript
// CARET MODIFICATION: Convert static constant to dynamic function for i18n support
export const getDynamicData = () => [...]

// CARET MODIFICATION: Use i18n context to detect language changes  
const { language } = useCaretI18nContext()

// CARET MODIFICATION: Use dynamic function with language dependency for i18n updates
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
1. 언어를 한국어로 변경
2. 해당 컴포넌트에서 번역 즉시 적용 확인
3. 다른 언어로 변경하여 재확인

## 📋 **체크리스트**
- [ ] 정적 상수를 함수로 변경
- [ ] useCaretI18nContext 사용
- [ ] useMemo로 언어 의존성 처리  
- [ ] 모든 참조를 동적 변수로 변경
- [ ] CARET MODIFICATION 주석 추가
- [ ] 컴파일 및 동작 검증

---
**패턴 버전**: v1.0
**사용 예**: AutoApproveBar, SettingsView