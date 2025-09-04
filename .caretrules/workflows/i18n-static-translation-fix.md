# i18n 정적 번역 문제 해결 워크플로우

> **AI 작업자를 위한 자동화된 다국어 정적 번역 문제 해결 가이드**

## 🎯 **작업 목표**
모듈 로딩 시점에 번역이 고정되어 언어 변경시 UI가 업데이트되지 않는 문제를 체계적으로 해결합니다.

## 🔍 **Step 1: 문제 감지**

### 자동 검색 명령어
```bash
# 1. 정적 상수에서 t() 함수 사용 검색
grep -r "export const.*=" webview-ui/src/ | grep "t("

# 2. 모듈 최상위 번역 함수 호출 검색
grep -r "^[[:space:]]*export const.*t(" webview-ui/src/ --include="*.ts" --include="*.tsx"

# 3. 배열/객체 내부 번역 검색
grep -r -A5 -B5 "t(['\"].*['\"].*['\"].*['\"])" webview-ui/src/ --include="*.ts" --include="*.tsx"
```

### 문제 패턴 식별
- ✅ `export const ITEMS = [{ name: t("key", "ns") }]` ← **문제**
- ✅ `const data = { title: t("title", "common") }` ← **문제**  
- ❌ `<div>{t("key", "ns")}</div>` ← 정상 (렌더링 시점)

## 🔧 **Step 2: 해결 패턴 적용**

### A. 동적 함수로 변경
```typescript
// Before (문제)
export const SETTINGS_TABS = [
    {
        id: "general",
        name: t("tabs.general.name", "settings"),  // 영어로 고정
        tooltip: t("tabs.general.tooltip", "settings")
    }
]

// After (해결)
export const getSettingsTabs = () => [
    {
        id: "general", 
        name: t("tabs.general.name", "settings"),  // 호출 시점에 번역
        tooltip: t("tabs.general.tooltip", "settings")
    }
]
```

### B. 컴포넌트에서 언어 반응형 처리
```typescript
// CARET MODIFICATION 패턴 적용
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"

function Component() {
    // CARET MODIFICATION: Use i18n context to detect language changes
    const { language } = useCaretI18nContext()
    
    // CARET MODIFICATION: Use dynamic function with language dependency for i18n updates
    const settingsTabs = useMemo(() => getSettingsTabs(), [language])
    
    // 기존 SETTINGS_TABS 대신 settingsTabs 사용
}
```

### C. 모든 참조 업데이트
```typescript
// 컴포넌트 내부의 모든 SETTINGS_TABS 참조를 settingsTabs로 변경
// 예: SETTINGS_TABS.map() → settingsTabs.map()
// 예: SETTINGS_TABS.find() → settingsTabs.find()
```

## ⚡ **Step 3: 자동화된 검증**

### 타입 체크
```bash
npm run check-types
```

### 빌드 테스트
```bash
npm run build:webview
```

### 수동 검증
1. VS Code 확장 실행 (`npm run watch`)
2. 설정에서 언어를 한국어로 변경
3. 해당 컴포넌트에서 번역이 즉시 적용되는지 확인

## 📋 **체크리스트**

### 필수 수정 항목
- [ ] 정적 상수를 동적 함수로 변경
- [ ] `useCaretI18nContext` import 추가
- [ ] `useMemo`로 언어 의존성 처리
- [ ] 모든 참조를 동적 변수로 변경
- [ ] `CARET MODIFICATION` 주석 추가

### 테스트 항목
- [ ] TypeScript 컴파일 성공
- [ ] 웹뷰 빌드 성공
- [ ] 언어 변경시 즉시 번역 업데이트 확인

## 🎯 **알려진 문제 패턴**

### 1. AutoApproveBar 패턴
**파일**: `webview-ui/src/components/chat/auto-approve-menu/constants.ts`
**문제**: `ACTION_METADATA`, `NOTIFICATIONS_SETTING` 상수
**해결**: `getActionMetadata()`, `getNotificationsSetting()` 함수로 변경

### 2. SettingsView 패턴  
**파일**: `webview-ui/src/components/settings/SettingsView.tsx`
**문제**: `SETTINGS_TABS` 상수
**해결**: `getSettingsTabs()` 함수로 변경

### 3. ChatTextArea 패턴 (향후)
**파일**: `webview-ui/src/components/chat/ChatTextArea.tsx`
**문제**: Plan/Act 모드 라벨, placeholder 텍스트
**해결**: 동일한 패턴 적용 필요

## 🚀 **작업 완료 기준**
1. ✅ 정적 번역 문제 완전 해결
2. ✅ 언어 변경시 즉시 UI 업데이트  
3. ✅ TypeScript 컴파일 오류 없음
4. ✅ 기존 기능 완전 보존
5. ✅ CARET MODIFICATION 주석 완비

---
**워크플로우 버전**: v1.0 (2025-09-04)
**연관 문서**: f02-multilingual-i18n.mdx, merging-strategy-guide.md