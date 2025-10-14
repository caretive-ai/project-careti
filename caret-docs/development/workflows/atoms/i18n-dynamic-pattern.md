# i18n 동적 번역 패턴 (원자 워크플로우)

> **AI 재사용 가능 코드 패턴 블록**

## 🧩 **패턴 요약**
정적, 모듈 로드 시점 번역을 동적, 반응형 번역으로 변환하는 표준 패턴입니다. 동적 함수 + useMemo를 사용합니다.

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
// 필요한 import
import { useMemo } from "react"
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"
import { getDynamicData } from "./constants"

function Component() {
    // CARET MODIFICATION: i18n 컨텍스트로 언어 변경 감지
    const { language } = useCaretI18nContext()

    // CARET MODIFICATION: 언어 의존성과 함께 동적 함수 사용
    const dynamicData = useMemo(() => getDynamicData(), [language])

    // 기존 STATIC_DATA 대신 dynamicData 사용
    return <div>{dynamicData.map(...)}</div>
}
```

## 🔧 **적용 단계**

### 1. 상수 → 함수 변환
```typescript
// 상수명에 'get' 접두사를 추가하여 함수명 생성
SETTINGS_TABS → getSettingsTabs()
ACTION_METADATA → getActionMetadata()
MENU_ITEMS → getMenuItems()
```

### 2. Import 추가
```typescript
// CARET MODIFICATION: i18n 반응성을 위한 useMemo 추가
import { useMemo } from "react"
// CARET MODIFICATION: 언어 반응성을 위한 i18n 컨텍스트 import
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"
```

### 3. 컴포넌트 내부에 변수 생성
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
- `useMemo`: 성능 최적화 및 언어 의존성 처리용
- `[language]`: 의존성 배열에 반드시 포함

### CARET MODIFICATION 주석
```typescript
// CARET MODIFICATION: i18n 지원을 위해 정적 상수를 동적 함수로 변환
export const getDynamicData = () => [...]

// CARET MODIFICATION: 언어 변경 감지를 위해 i18n 컨텍스트 사용
const { language } = useCaretI18nContext()

// CARET MODIFICATION: 언어 의존성과 함께 동적 함수 사용하여 i18n 업데이트
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
1. 설정에서 언어를 다른 언어로 변경합니다.
2. 컴포넌트에서 번역이 즉시 적용되는지 확인합니다.
3. 다시 다른 언어로 변경하여 재확인합니다.

## 📋 **체크리스트**
- [ ] 정적 상수를 함수로 변환
- [ ] `useCaretI18nContext` 사용
- [ ] `useMemo`로 언어 의존성 처리
- [ ] 모든 참조를 동적 변수로 업데이트
- [ ] `CARET MODIFICATION` 주석 추가
- [ ] 컴파일 및 기능 검증

## 🎯 **이점**
- **즉각 반응**: 언어 변경 시 즉시 UI 업데이트
- **성능**: useMemo로 불필요한 재계산 방지
- **일관성**: 모든 번역이 동일한 패턴 사용
- **유지보수**: 표준 패턴으로 코드 이해 쉬움

## 📚 **Caret 프로젝트 적용 사례**
- AutoApproveBar: 자동 승인 옵션 라벨
- SettingsView: 설정 탭 메뉴
- ModelSelector: 모델 카테고리 라벨

## 🔄 **관련 워크플로우**
- `/hardcoding-prevention` - 하드코딩 방지
- Caret i18n 시스템 (F02)

---
**패턴 버전**: v1.0
**사용 예시**: AutoApproveBar, SettingsView
