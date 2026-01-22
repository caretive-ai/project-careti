# 🌐 Careti i18n 시스템 마이그레이션 가이드

**작성일**: 2025-01-24  
**대상 개발자**: Careti 컴포넌트 개발자  
**난이도**: INTERMEDIATE  

## 📋 개요

이 가이드는 기존 Cline 컴포넌트를 Careti i18n 시스템으로 마이그레이션하는 방법을 제공합니다. **하이브리드 래핑 전략**을 사용하여 원본 코드 변경을 최소화하면서 완전한 다국어 지원을 구현합니다.

---

## 🎯 마이그레이션 원칙

### **1. 최소 침습 (Minimal Invasion)**
- ✅ 원본 Cline 컴포넌트는 **절대 수정하지 않음**
- ✅ Wrapper 컴포넌트로 i18n 기능 추가
- ✅ 기존 props와 이벤트 처리 100% 호환성 보장

### **2. Copy-and-Modify 패턴**
- ✅ `careti-main` 검증된 코드를 복사 후 적용
- ✅ 모든 수정사항에 **CARETI MODIFICATION** 주석 표기
- ✅ TypeScript strict 모드 100% 준수

### **3. 성능 우선**
- ✅ Lazy loading으로 초기 로딩 최적화
- ✅ 메모이제이션을 통한 번역 캐싱
- ✅ 한글 조사 처리 최적화

---

## 🏗️ 마이그레이션 단계

### **Step 1: 컴포넌트 분석**

기존 컴포넌트에서 하드코딩된 텍스트를 식별합니다.

```typescript
// ❌ 마이그레이션 전 - 하드코딩된 텍스트
const OriginalComponent = () => {
  return (
    <div>
      <h1>Settings</h1>
      <button>Save Changes</button>
      <p>Click here to continue</p>
    </div>
  )
}
```

**식별 포인트:**
- UI 텍스트 (제목, 라벨, 버튼)
- 에러 메시지 및 상태 텍스트
- placeholder 및 tooltip 텍스트

### **Step 2: 번역 키 정의**

`src/careti/locale/en/common.json`에 번역 키를 추가합니다.

```json
{
  "settings": {
    "title": "Settings",
    "saveChanges": "Save Changes", 
    "clickToContinue": "Click here to continue"
  }
}
```

**키 명명 규칙:**
- 네임스페이스.섹션.키 구조 사용
- camelCase 방식 적용
- 의미가 명확한 키명 사용

### **Step 3: 한국어 번역 추가**

`src/careti/locale/ko/common.json`에 한국어 번역을 추가합니다.

```json
{
  "settings": {
    "title": "설정",
    "saveChanges": "변경사항 저장",
    "clickToContinue": "계속하려면 클릭하세요"
  }
}
```

**브랜드 템플릿 사용 시:**
```json
{
  "welcome": {
    "greeting": "{{brand.appName|을}} 사용해보세요!",
    "description": "{{brand.appName|은}} AI 코딩 어시스턴트입니다."
  }
}
```

### **Step 4: 래퍼 컴포넌트 생성**

표준 래퍼 패턴을 따라 컴포넌트를 생성합니다.

```typescript
// src/careti/components/SettingsWrapper.tsx
// CARETI MODIFICATION: Settings wrapper with i18n support
import React from 'react'
import { useCaretI18n } from '../hooks/useCaretI18n'
import { t } from '../utils/i18n'

// Import the original component
import OriginalSettings from '@/components/settings/Settings'

interface SettingsWrapperProps {
  onSave?: () => void
  // ... other original props
}

const SettingsWrapper: React.FC<SettingsWrapperProps> = (props) => {
  const { currentLanguage } = useCaretI18n()

  // Generate i18n props
  const i18nProps = {
    ...props,
    title: t('settings.title', 'common'),
    saveButtonText: t('settings.saveChanges', 'common'),
    continueText: t('settings.clickToContinue', 'common')
  }

  return <OriginalSettings {...i18nProps} />
}

export default SettingsWrapper
```

### **Step 5: forwardRef 패턴 (필요시)**

ref를 전달해야 하는 컴포넌트의 경우:

```typescript
const SettingsWrapper = forwardRef<HTMLDivElement, SettingsWrapperProps>(
  (props, ref) => {
    // i18n logic here
    
    return <OriginalSettings {...i18nProps} ref={ref} />
  }
)

SettingsWrapper.displayName = 'SettingsWrapper'
```

---

## 🎨 고급 패턴

### **동적 텍스트 처리**

props를 통해 전달되는 동적 텍스트 처리:

```typescript
const DialogWrapper: React.FC<DialogWrapperProps> = ({
  title,
  message,
  ...props
}) => {
  // Use i18n defaults, but allow override via props
  const dialogTitle = title ?? t('dialog.defaultTitle', 'common')
  const dialogMessage = message ?? t('dialog.defaultMessage', 'common')

  return (
    <OriginalDialog
      {...props}
      title={dialogTitle}
      message={dialogMessage}
    />
  )
}
```

### **조건부 렌더링 처리**

언어별로 다른 렌더링이 필요한 경우:

```typescript
const ComplexWrapper: React.FC<ComplexWrapperProps> = (props) => {
  const { currentLanguage } = useCaretI18n()

  // Language-specific logic
  const showExtraInfo = currentLanguage === 'ko'
  const layoutDirection = currentLanguage === 'ar' ? 'rtl' : 'ltr'

  return (
    <div dir={layoutDirection}>
      <OriginalComponent {...props} />
      {showExtraInfo && (
        <div>{t('component.extraInfo', 'common')}</div>
      )}
    </div>
  )
}
```

---

## ⚡ 성능 최적화

### **번역 결과 메모이제이션**

```typescript
import { useMemo } from 'react'

const OptimizedWrapper: React.FC<Props> = (props) => {
  const { currentLanguage } = useCaretI18n()

  // Memoize expensive translations
  const translatedProps = useMemo(() => ({
    ...props,
    title: t('component.title', 'common'),
    description: t('component.description', 'common')
  }), [currentLanguage, props])

  return <OriginalComponent {...translatedProps} />
}
```

### **조건부 i18n 훅 사용**

```typescript
const ConditionalWrapper: React.FC<Props> = (props) => {
  // Only use i18n when needed
  const needsI18n = props.enableI18n !== false
  const { currentLanguage } = needsI18n ? useCaretI18n() : { currentLanguage: 'en' }

  return <OriginalComponent {...props} />
}
```

---

## 🧪 테스팅 가이드

### **단위 테스트 작성**

```typescript
// ComponentWrapper.test.tsx
import { render } from '@testing-library/react'
import { CaretiI18nProvider } from '../context/CaretI18nContext'
import ComponentWrapper from './ComponentWrapper'

describe('ComponentWrapper', () => {
  const renderWithI18n = (props: any, language = 'en') => {
    return render(
      <CaretiI18nProvider initialLanguage={language}>
        <ComponentWrapper {...props} />
      </CaretiI18nProvider>
    )
  }

  it('should render with English translations', () => {
    const { getByText } = renderWithI18n({})
    expect(getByText('Settings')).toBeInTheDocument()
  })

  it('should render with Korean translations', () => {
    const { getByText } = renderWithI18n({}, 'ko')
    expect(getByText('설정')).toBeInTheDocument()
  })
})
```

### **브랜드 템플릿 테스트**

```typescript
it('should handle brand template variables', () => {
  const { getByText } = renderWithI18n({}, 'ko')
  // "캐러티을 사용해보세요" should be rendered with Korean particle
  expect(getByText(/캐러티을/)).toBeInTheDocument()
})
```

---

## 🚨 주의사항 및 베스트 프랙티스

### **DO's ✅**

1. **항상 CARETI MODIFICATION 주석 추가**
   ```typescript
   // CARETI MODIFICATION: Component wrapper with i18n support
   ```

2. **원본 컴포넌트 import 경로 유지**
   ```typescript
   import OriginalComponent from '@/components/original/Component'
   ```

3. **TypeScript 타입 완전성 보장**
   ```typescript
   interface WrapperProps extends OriginalComponentProps {
     // Additional i18n specific props if needed
   }
   ```

4. **성능 최적화 적용**
   ```typescript
   export default React.memo(ComponentWrapper)
   ```

### **DON'Ts ❌**

1. **원본 Cline 컴포넌트 직접 수정 금지**
2. **하드코딩된 번역 텍스트 사용 금지**
3. **fallback 없는 번역 키 사용 금지**
4. **메모리 누수 발생 가능한 코드 작성 금지**

### **에러 처리**

```typescript
const SafeWrapper: React.FC<Props> = (props) => {
  try {
    const translatedText = t('component.text', 'common')
    return <OriginalComponent text={translatedText} {...props} />
  } catch (error) {
    console.warn('i18n translation failed:', error)
    // Fallback to original behavior
    return <OriginalComponent {...props} />
  }
}
```

---

## 📚 참고 자료

- [Careti i18n 시스템 아키텍처](./careti-architecture-and-implementation-guide.md)
- [027-7: 최종 다국어 통합 작업](../tasks/027-7-final-i18n-integration.md)
- [React 국제화 베스트 프랙티스](https://react.i18next.com/)

---

## 🤝 기여 가이드라인

1. **새 래퍼 컴포넌트 생성 시**:
   - 이 가이드의 표준 패턴 준수
   - 테스트 케이스 함께 작성
   - 번역 키 완전성 확인

2. **번역 추가 시**:
   - 4개 언어 모두 번역 제공
   - 브랜드 템플릿 변수 활용
   - 한글 조사 처리 정확성 확인

3. **성능 최적화**:
   - 불필요한 re-render 방지
   - 메모이제이션 적절히 활용
   - Lazy loading 고려

---

**작성자**: Alpha (AI Assistant)  
**최종 업데이트**: 2025-01-24  
**다음 업데이트 예정**: Phase 4 완료 후