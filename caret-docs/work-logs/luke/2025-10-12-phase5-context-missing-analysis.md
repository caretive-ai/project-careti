# Phase 5 Context Provider 누락 원인 분석

**작성일**: 2025-10-12 18:45
**작업자**: Luke (with Claude Code)
**심각도**: 🔴 Critical - 런타임 전체 실패
**영향**: 설정, Persona, i18n 등 모든 Caret 기능 동작 불가

---

## 📊 문제 요약

### 유저 보고 문제들
1. **설정 버튼 클릭 시 에러**: `useCaretI18nContext must be used within a CaretI18nProvider`
2. **Persona 버튼 안 보임**: CaretStateContextProvider 없음
3. **Persona 선택 화면 없음**: showPersonaSelector 로직 누락
4. **i18n 전반 오류**: Provider 래핑 전체 누락

### 근본 원인
**webview-ui/src/App.tsx 파일이 Cline 버전으로 교체되어 Caret Context Provider들이 모두 누락됨**

---

## 🔍 상세 분석

### 1. 누락된 코드 비교

#### ❌ 현재 App.tsx (Cline 버전)
```tsx
// webview-ui/src/App.tsx
const App = () => {
  return (
    <Providers>
      <AppContent />
    </Providers>
  )
}
```

#### ✅ 필요한 App.tsx (caret-main 버전)
```tsx
// caret-main/webview-ui/src/App.tsx
import CaretI18nProvider from "./caret/context/CaretI18nContext"
import { CaretStateContextProvider, useCaretState } from "./caret/context/CaretStateContext"
import PersonaTemplateSelector from "./caret/components/PersonaTemplateSelector"

const AppContent = () => {
  const { showPersonaSelector } = useCaretState()  // 추가 필요

  // ... 기존 코드 ...

  if (showPersonaSelector) {  // 추가 필요
    return <PersonaTemplateSelector onSelectPersona={() => {}} />
  }

  // ... 기존 코드 ...
}

const App = () => {
  return (
    <Providers>
      {/* CARET MODIFICATION: Wrap app with i18n context for multilingual support */}
      <CaretI18nProvider defaultLanguage="en">
        {/* CARET MODIFICATION: Wrap with CaretStateContextProvider for persona system */}
        <CaretStateContextProvider>
          <AppContent />
        </CaretStateContextProvider>
      </CaretI18nProvider>
    </Providers>
  )
}
```

### 2. 누락된 파일 검증

**Context 파일은 존재함**:
```bash
✅ webview-ui/src/caret/context/CaretI18nContext.tsx (존재)
✅ webview-ui/src/caret/context/CaretStateContext.tsx (존재)
❌ App.tsx에서 import 및 사용 누락
```

**Providers.tsx도 잘못됨**:
```bash
❌ 현재: PlatformProvider가 최상위 (Cline 버전)
✅ 필요: ExtensionStateContextProvider가 최상위 (caret-main 버전)
```

---

## 🚨 왜 빠졌는가?

### Phase 2: Hard Reset의 영향

**실행된 명령**:
```bash
# Phase 2에서
git reset --hard upstream/main
```

**결과**:
- 모든 Cline 원본 파일이 upstream 최신 버전으로 교체됨
- `webview-ui/src/App.tsx` → Cline 버전으로 교체
- `webview-ui/src/Providers.tsx` → Cline 버전으로 교체
- Caret 수정사항 **완전 소실**

### Phase 5.0: 복사 프로세스의 맹점

**Phase 5.0 체크리스트 (기존)**:
```markdown
1. **Caret 전용 디렉토리 복사** ✅
   - [x] caret-main/webview-ui/src/caret/ → webview-ui/src/caret/

2. **Cline 개선사항만 있는 파일 복사** (8개) ✅
   - [x] BrowserSessionRow.tsx, AutoApproveModal.tsx, ...

3. **Caret 수정 파일 복사** (F01-F11 관련) ✅
   - [x] F01-F11 문서 참조하여 Modified Files 확인
```

**문제점**:
1. ❌ `App.tsx`가 체크리스트에 없음
2. ❌ `Providers.tsx`가 체크리스트에 없음
3. ❌ Feature 문서(F02 i18n)에 "Phase 5에서 UI 연동"만 명시, 구체적인 파일 명시 없음
4. ❌ 런타임 검증 없이 컴파일만 확인

### Feature 문서의 불완전성

**F02 i18n 문서 현재 상태**:
```markdown
## Modified Files (Phase 4)

**Cline 핵심 파일**:
- src/shared/Languages.ts  (+59 lines)

**Frontend**: Phase 5에서 UI 연동  ← 너무 모호함
```

**누락된 정보**:
- App.tsx 수정 사항 명시 없음
- CaretI18nProvider import 명시 없음
- Context 래핑 구조 설명 없음

---

## 💥 영향 범위

### 1. 직접 영향받은 기능
- ✅ **F02 (i18n)**: 완전 동작 불가 (Provider 없음)
- ✅ **F08 (Persona)**: 완전 동작 불가 (CaretStateContext 없음)
- 부분 **F03 (Branding)**: i18n 의존 기능 동작 불가

### 2. 유저 보고 문제와 매칭
| 유저 문제 | 근본 원인 | 파일 |
|----------|----------|------|
| 설정 버튼 → 에러 | CaretI18nProvider 없음 | App.tsx |
| Persona 버튼 없음 | CaretStateContextProvider 없음 | App.tsx |
| Persona 선택 화면 없음 | showPersonaSelector 로직 없음 | App.tsx |
| i18n 텍스트 안 나옴 | useCaretI18nContext 사용 불가 | 전체 |

### 3. 에러 로그 분석
```
CaretI18nContext.tsx:106 Uncaught Error: useCaretI18nContext must be used within a CaretI18nProvider
    at useCaretI18nContext (CaretI18nContext.tsx:106:9)
    at ApiOptions (ApiOptions.tsx:101:23)
```

**의미**:
- ApiOptions 컴포넌트가 `useCaretI18nContext()` 호출
- CaretI18nProvider가 없어서 Context undefined
- React가 에러 throw → 전체 컴포넌트 언마운트

---

## 🔧 머징 프로세스 개선 방안

### 개선 1: Feature 문서 강화 ⭐ 가장 중요

**F02 i18n 문서 개선 (예시)**:
```markdown
## Modified Files

### Backend (Phase 4)
- src/shared/Languages.ts (+59 lines)

### Frontend (Phase 5)

#### Context Provider (Critical)
- **webview-ui/src/App.tsx**
  - Line 5: import CaretI18nProvider
  - Line 7: import CaretStateContextProvider
  - Line 99-104: Provider 래핑 추가
  - ⚠️ CRITICAL: 이 수정 누락 시 전체 i18n 시스템 동작 불가

#### Context Implementation
- **webview-ui/src/caret/context/CaretI18nContext.tsx** (신규)
- **webview-ui/src/caret/context/CaretStateContext.tsx** (신규)

#### Consumer Components
- webview-ui/src/components/settings/ApiOptions.tsx (useCaretI18nContext 사용)
- ... 기타 30+ 컴포넌트
```

### 개선 2: Phase 5.0 체크리스트 강화

**추가할 항목**:
```markdown
3. **Caret Context Provider 통합** ⚠️ CRITICAL
   - [ ] App.tsx - CaretI18nProvider import 추가
   - [ ] App.tsx - CaretI18nProvider 래핑 추가 (line 99)
   - [ ] App.tsx - CaretStateContextProvider import 추가
   - [ ] App.tsx - CaretStateContextProvider 래핑 추가 (line 101)
   - [ ] App.tsx - showPersonaSelector 로직 추가
   - [ ] AppContent - useCaretState() 사용 추가
   - [ ] Providers.tsx - PlatformProvider 순서 확인

4. **Provider 순서 검증**
   - [ ] PlatformProvider (최상위)
   - [ ] ExtensionStateContextProvider
   - [ ] CustomPostHogProvider
   - [ ] ClineAuthProvider
   - [ ] HeroUIProvider
   - [ ] CaretI18nProvider (Caret)
   - [ ] CaretStateContextProvider (Caret)
```

### 개선 3: 런타임 검증 추가

**기존 (빌드만 체크)**:
```markdown
3. **컴파일 검증**:
   - `npm run compile`
   - `npm run build:webview`
```

**개선 (런타임 추가)**:
```markdown
3. **빌드 검증**:
   - [ ] `npm run compile` - 성공
   - [ ] `npm run build:webview` - 성공

4. **런타임 검증** ⚠️ 필수
   - [ ] Extension 실행 (F5)
   - [ ] 설정 버튼 클릭 → Context 에러 없는지 확인
   - [ ] Console에 "useCaretI18nContext" 에러 없는지 확인
   - [ ] 하단 Rules 버튼 → Persona 버튼 표시 확인
   - [ ] 언어 전환 동작 확인
```

### 개선 4: Critical 파일 체크리스트

**Phase 5.0에 추가**:
```markdown
## Critical Files 체크리스트 (누락 시 런타임 실패)

### Context Integration
- [ ] webview-ui/src/App.tsx (Context Provider 래핑)
- [ ] webview-ui/src/Providers.tsx (Provider 순서)

### Context Implementation
- [ ] webview-ui/src/caret/context/CaretI18nContext.tsx
- [ ] webview-ui/src/caret/context/CaretStateContext.tsx

### Entry Point
- [ ] webview-ui/src/main.tsx

⚠️ 위 파일들은 반드시 caret-main 버전으로 복사/수정 필요
⚠️ Cline 버전 사용 시 Caret 기능 전체 동작 불가
```

---

## 📝 교훈 및 패턴

### 교훈 1: "Feature 문서는 구체적으로"
❌ **나쁜 예**:
```
Frontend: Phase 5에서 UI 연동
```

✅ **좋은 예**:
```
Frontend: Phase 5
- webview-ui/src/App.tsx (Line 99-104: Provider 래핑)
- webview-ui/src/caret/context/CaretI18nContext.tsx (신규)
⚠️ CRITICAL: App.tsx 수정 누락 시 전체 기능 동작 불가
```

### 교훈 2: "컴파일 성공 ≠ 런타임 성공"
- TypeScript 컴파일은 통과
- Context 파일도 모두 존재
- BUT, Provider 래핑이 없어 런타임 실패
- **런타임 검증 필수**

### 교훈 3: "Hard Reset은 위험하다"
- Phase 2 Hard Reset으로 모든 Cline 파일이 교체됨
- Caret 수정사항 완전 소실
- **복사 체크리스트를 매우 구체적으로 작성 필요**

### 교훈 4: "Provider 통합은 Critical Path"
- Context Provider는 전체 앱의 기반
- 누락 시 cascade failure (연쇄 실패)
- **별도 체크리스트 항목으로 분리 필수**

---

## 🎯 다음 단계

1. ✅ **App.tsx 수정** (즉시)
   - CaretI18nProvider 추가
   - CaretStateContextProvider 추가
   - showPersonaSelector 로직 추가

2. ✅ **Providers.tsx 확인** (즉시)
   - PlatformProvider 순서 확인

3. ✅ **런타임 검증** (수정 후)
   - F5로 Extension 실행
   - 설정 버튼 클릭 테스트
   - Persona 버튼 표시 확인

4. ⏸️ **문서 업데이트** (다음 세션)
   - F02 i18n 문서 개선
   - merge-execution-master-plan.md 업데이트
   - 머징 표준 문서 작성 (신규)

---

## 📚 참고 문서

- `caret-docs/merging/merge-execution-master-plan.md` - Phase 5 계획
- `caret-docs/features/f02-multilingual-i18n.md` - F02 Feature 문서
- `caret-docs/work-logs/luke/2025-10-12-merge-feedback.md` - 유저 피드백
- `caret-main/webview-ui/src/App.tsx` - 올바른 구현 참조

---

**작성자**: Luke (with Claude Code)
**검토 필요**: 머징 프로세스 개선 사항
**액션 아이템**: App.tsx 수정 → 런타임 검증 → 문서 업데이트
