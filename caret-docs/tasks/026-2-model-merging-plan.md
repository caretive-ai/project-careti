# Task 026-2: Model System 최소 업그레이드 계획 ✨

> **Target**: Cline v3.23.0 → Caret v0.1.1  
> **Focus**: Model **정의** 및 **웹뷰 UI** 선택적 업그레이드  
> **Deadline**: 026번 메인 작업의 최종 단계  

## 📝 **진행 상황 요약 (2025-08-12)**

-   **[완료]** **백엔드 모델 정의 동기화**: `src/shared/api.ts` 파일에 `cline-latest`의 신규 Provider 타입과 Model 정의를 성공적으로 병합했습니다.
-   **[완료]** **검증 스크립트 수정 및 실행**: `caret-scripts/verify-model-definitions.js` 스크립트를 수정하여 백엔드 모델 정의가 완벽하게 동기화되었음을 확인했습니다.
-   **[완료]** **웹뷰 UI 동기화**: `cline-latest`에서 변경된 웹뷰 컴포넌트 구조(Provider 모듈화)를 Caret에 성공적으로 반영하고, 모든 테스트를 통과했습니다.

---

## 🚨 **중요: 범위 제한**

### **❌ 포함되지 않는 작업 (027번으로 이관)**
- **API Provider 구조 대규모 변경** (handler 재구성, interface 변경)  
- **전체 API 시스템 재설계**  

### **✅ 026-2번에서만 수행할 작업**
- **[완료]** 새 API Provider 타입 추가 (claude-code, moonshot, groq, huggingface, baseten 등)  
- **[완료]** 새 Model 정의 추가 (Claude-3.5-Sonnet 최신, GPT-4o 업데이트 등)  
- **[완료]** **웹뷰 UI 리팩토링**: `cline-latest`의 컴포넌트 기반 구조를 Caret에 적용하고, 기존 커스텀 기능을 재통합했습니다.

## 📋 **Cline v3.23.0 웹뷰 구조 변경 분석**

-   **기존 (Caret)**: `ApiOptions.tsx` 단일 파일에 대부분의 UI 로직이 집중되어 있습니다.
-   **변경 (cline-latest)**: 각 Provider별 UI 로직이 `webview-ui/src/components/settings/providers/` 하위 디렉터리의 개별 파일로 분리되었습니다. 또한, 공통 로직은 `utils/` 디렉터리로 분리되어 구조가 명확해졌습니다.
-   **결론**: 단순 코드 병합이 불가능하며, Caret의 웹뷰 구조를 `cline-latest`의 신규 구조에 맞춰 리팩토링해야 합니다.

## 🔧 **웹뷰 빌드 에러 해결 과정 (2025-01-12)**

### **발생한 문제들:**
1. **Proto import 경로 에러**: `@shared/proto/cline/common` → `@shared/proto/common`로 수정 필요
2. **Component import 경로 에러**: `../ApiKeyField` → `../common/ApiKeyField`로 수정 필요  
3. **Missing export 에러**: `QwenApiRegions` enum이 `api.ts`에 누락되어 추가 필요
4. **Function import 에러**: `normalizeApiConfiguration`이 `ApiOptions.tsx`에서 `utils/providerUtils.ts`로 이동

### **해결된 파일들:**
- `OpenRouterModelPicker.tsx`, `TogetherProvider.tsx`, `CerebrasProvider.tsx`, `BasetenProvider.tsx`, `XaiProvider.tsx`: proto import 경로 수정
- `VSCodeLmProvider.tsx`, `LMStudioProvider.tsx`, `OllamaProvider.tsx`: proto import 경로 수정  
- `GroqModelPicker.tsx`, `HuggingFaceModelPicker.tsx`, `BasetenModelPicker.tsx`: proto import 경로 수정
- `useApiConfigurationHandlers.ts`, `OpenAICompatible.tsx`: proto import 경로 수정
- `CaretProvider.tsx`: ModelSelector import 경로 수정
- `src/shared/api.ts`: `QwenApiRegions` enum 추가
- `RequestyModelPicker.tsx`, `TaskHeader.tsx`, `ChatView.tsx`, `ChatTextArea.tsx`: normalizeApiConfiguration import 경로 수정

### **최종 결과:**
✅ **웹뷰 빌드 성공** - 모든 import 경로 문제 해결 완료

## 🔧 **Caret 고유 기능 복원 (2025-01-12)**

### **발견된 추가 문제들:**
1. **Provider 선택 버그**: 어떤 provider를 선택해도 Anthropic으로 변경되는 문제
2. **Caret provider 로직 누락**: `normalizeApiConfiguration`에서 `"caret"` case가 없음
3. **기본값 문제**: 기본 provider가 `anthropic`으로 설정되어 있음

### **해결한 내용:**
1. **`providerUtils.ts` 수정**:
   - `normalizeApiConfiguration`에 `case "caret"` 추가
   - Caret provider는 Gemini 모델을 기본으로 사용하도록 설정
   - 기본 provider를 `"anthropic"`에서 `"caret"`으로 변경
   - `syncModeConfigurations`에 caret case 추가

2. **Caret 고유 기능 확인**:
   - ✅ **i18n 지원**: `CaretProvider`에서 `useTranslation` 정상 사용
   - ✅ **반응형 디자인**: `useResponsive` 정상 사용  
   - ✅ **로거 기능**: `webview-logger` 빌드에서 정상 작동
   - ✅ **Provider 순서**: 드롭다운에서 Caret > Gemini > OpenAI > Anthropic 순서 유지

### **결과:**
✅ **Provider 선택 버그 해결** - 이제 선택한 provider가 올바르게 유지됨  
✅ **Caret 기본값 복원** - 새로운 사용자는 Caret provider가 기본으로 선택됨  
✅ **모든 고유 기능 보존** - i18n, 로거, 반응형 디자인 모두 정상 작동

## 🔧 **런타임 에러 수정 (2025-01-12)**

### **발견된 추가 문제:**
- **ModelSelector 에러**: `Object.keys()`에 undefined/null이 전달되어 `TypeError` 발생
- **CaretProvider**: `ModelSelector`에 `models` prop을 전달하지 않음

### **해결한 내용:**
1. **`CaretProvider.tsx` 수정**:
   - `geminiModels` import 추가
   - `ModelSelector`에 올바른 props 전달 (`models`, `onChange`)
   - Caret provider가 Gemini 모델을 사용하도록 설정

2. **`ModelSelector.tsx` 수정**:
   - 방어 코드 추가: `const safeModels = models || {}`
   - undefined/null models에 대한 안전한 처리

### **결과:**
✅ **런타임 에러 해결** - `Object.keys()` 에러 완전 해결  
✅ **Caret 모델 선택** - Gemini 모델들이 드롭다운에 정상 표시  
✅ **안정성 향상** - 방어 코드로 예외 상황 처리

## 🔧 **추가 UI/UX 개선 (2025-01-12)**

### **사용자 피드백 대응:**
1. **모델 가격 정보 i18n 미적용**: `ModelInfoView` 컴포넌트에서 영어 텍스트가 그대로 표시
2. **Provider 드롭다운 라벨 혼란**: "Caret"이 "Google Gemini"로 표시되어 사용자 혼란
3. **Provider 변경 및 모델 리스트 동기화**: Provider 변경 시 모델 선택 동작 관련 문의

### **해결한 내용:**
1. **`ModelInfoView.tsx` i18n 완전 적용**:
   - 모든 가격 정보 라벨에 `t()` 함수 적용
   - "입력 가격", "출력 가격", "최대 출력", "이미지 지원" 등 완전 한국어화
   - 기존 `ko/common.json`의 `modelInfo` 섹션 번역 키 활용

2. **Provider 드롭다운 라벨 수정**:
   - "Caret" → "Caret" (첫 번째 옵션으로 유지)
   - "Google Gemini (Direct)" → "Google Gemini"
   - 사용자가 직관적으로 이해할 수 있는 라벨로 변경

3. **Provider/Model 동기화 구조 분석**:
   - 각 Provider별 전용 컴포넌트에서 모델 관리 (예: `CaretProvider`, `GeminiProvider`)
   - `handleModeFieldChange`를 통한 정상적인 Provider 변경 로직 확인
   - `normalizeApiConfiguration`의 기본값 동작 분석 완료

### **최종 결과:**
✅ **완전한 i18n 지원** - 모든 모델 정보가 선택된 언어로 표시  
✅ **직관적인 UI 라벨** - Provider 이름이 명확하게 표시  
✅ **안정적인 Provider 변경** - 선택한 provider가 올바르게 유지됨

## 🚀 **단계별 머징 계획**

### **Phase 1 & 2: API 및 Model 정의 확장 (완료)** ✅

-   **1-1. ApiProvider 타입 추가**: 완료
-   **1-2. ApiHandlerOptions 설정 추가**: 완료
-   **2-1. 신규 Model 정의 추가**: 완료
-   **2-2. 기존 Model 정의 업데이트**: 완료

### **Phase 3: 기본값 및 타입 업데이트 (완료)** ✅

-   **3-1. 기본 Model ID 업데이트**: 완료
-   **3-2. 신규 타입 정의 추가**: 완료

### **Phase 4: 웹뷰 UI 리팩토링 및 동기화 (완료)** ✅

#### **4-1. `cline-latest`의 신규 파일 구조 반영**
-   **작업**: Caret 프로젝트에 `webview-ui/src/components/settings/providers/` 및 `utils/` 디렉터리를 생성했습니다.
-   **복사**: `cline-latest`의 해당 디렉터리에 있는 모든 파일(총 36개)을 Caret으로 복사했습니다.
    -   `providers/`: 31개 파일
    -   `utils/`: 5개 파일

#### **4-2. `ApiOptions.tsx` 리팩토링 및 Caret 커스텀 코드 재적용**
1.  **백업**: 기존 `webview-ui/src/components/settings/ApiOptions.tsx` 파일을 `ApiOptions.tsx.caret-backup`으로 백업했습니다.
2.  **덮어쓰기**: `cline-latest`의 `ApiOptions.tsx` 파일 내용으로 Caret의 `ApiOptions.tsx`를 완전히 대체하여 새로운 구조를 적용했습니다.
3.  **커스텀 코드 병합**: `ApiOptions.tsx.caret-backup` 파일을 참고하여, 아래의 Caret 전용 커스텀 기능들을 새로운 구조의 `ApiOptions.tsx`에 신중하게 재적용했습니다.
    -   Provider 드롭다운 메뉴 순서 (`Caret` > `Gemini` > `OpenAI` 순)
    -   `Cline` 명칭을 `Caret`으로 변경한 부분
    -   `CaretProvider` 관련 로직 (기존 `ClineProvider` 대신 사용)
    -   다국어 지원(`t()` 함수) 및 반응형 레이아웃(`useWindowSize`) 관련 코드

## ✅ **완료 기준**

### **필수 조건**
-   **[완료]** 백엔드 모델 정의 동기화 (`api.ts`)
-   **[완료]** **웹뷰 파일 구조 동기화**: `providers/` 및 `utils/` 디렉터리 및 파일 복사
-   **[완료]** **`ApiOptions.tsx` 리팩토링**: 신규 구조 적용 및 Caret 커스텀 기능 재통합
-   **[완료]** **빌드 성공**: `npm run compile` 통과
-   **[완료]** **웹뷰 테스트 성공**: `npm run test:webview` 통과

## 🚨 **주의사항**

-   **CaretProvider 유지**: `ClineProvider.tsx`를 복사하되, `ApiOptions.tsx`에서는 Caret의 커스텀 로직을 유지해야 합니다. 백업 파일을 반드시 참고하여 작업합니다.
-   **점진적 확인**: 파일 수정 후에는 즉시 `npm run compile`을 실행하여 중간 결과를 확인합니다.

---

## 🚨 **심각한 문제 발생 (2025-01-12 오후)**

**상태**: ❌ **진행 중단**  
**문제**: Provider 변경 시 원래 값으로 되돌아가는 현상 지속

### **문제 발생 경과:**

#### **1단계: 구조 변경 이전**
- ✅ Provider 변경 정상 작동
- 새로운 모델 지원을 위해 cline-latest 구조로 변경 결정

#### **2단계: 구조 변경 후**
- ✅ 웹뷰 빌드 에러 해결
- ✅ 레이아웃 및 i18n 문제 해결  
- ❌ **Provider 변경 시 원래 값으로 되돌아가는 현상 발생**

#### **3단계: 잘못된 진단 #1**
- 🔍 "기본값 문제"로 잘못 판단
- 🔧 `normalizeApiConfiguration` 기본값 수정 시도
- ❌ 문제 지속

#### **4단계: 잘못된 진단 #2**  
- 🔍 "실시간 업데이트 덮어쓰기 문제"로 판단
- 🔧 복잡한 보호 플래그 메커니즘 구현 (useRef, 시간 기반 보호 등)
- ❌ 전혀 작동하지 않음 (시간만 낭비)

#### **5단계: 잘못된 진단 #3**
- 🔍 "저장이 안 되는 문제"로 판단  
- 🔧 ApiConfiguration 타입에 planModeApiProvider/actModeApiProvider 추가
- 🔧 백엔드 저장/로딩 로직 수정
- ❌ **문제 여전히 지속**

#### **6단계: 최신 진단 (2025-01-12 저녁)**
- 🔍 `currentMode` prop이 `undefined`로 전달되는 문제 발견
- 🔧 `SettingsView.tsx`, `WelcomeView.tsx`에 `currentMode` prop 추가 시도
- 🔧 `ApiOptions.tsx`에 임시 fallback 코드 추가 
- ❌ **여전히 `currentMode: undefined` 지속**

### **현재 상황 (2025-01-12 저녁):**
- **로그 분석 결과**: `currentMode`가 여전히 `undefined`로 전달됨
- **임시 fallback**: `effectiveCurrentMode: 'agent'`는 작동하지만 근본 해결 안 됨
- **Provider 변경**: Google에서 Anthropic으로 바꿔도 다시 Google로 되돌아감
- **저장 로직**: Backend 저장은 정상 작동하는 것으로 보임

### **최신 로그 분석 (2025-01-12 저녁):**
```javascript
// Frontend Logs
[DEBUG] 🎯 Provider dropdown onChange triggered: {oldProvider: 'gemini', newProvider: 'anthropic', currentMode: undefined}
[DEBUG] 🔧 handleModeFieldChange called: {fieldPair: {…}, value: 'anthropic', currentMode: 'agent', planActSeparateModelsSetting: true, currentApiConfig: {…}}
[DEBUG] 🔧 Separate models mode - updating field: undefined to: anthropic
[DEBUG] 🔧 ApiOptions currentMode: {received: undefined, effective: 'agent'}

// Backend Logs  
[CARET-INFO] [STATE] 💾 [BACKEND-SAVE] updateApiConfiguration called
[CARET-INFO] [STATE] 📡 [WEBVIEW-SEND] Sending state to webview - chatSettings.mode=agent
```

### **확인된 문제:**
1. **`currentMode` prop 전달 문제**: `ApiOptions`에 `undefined`로 계속 전달됨
2. **Field 업데이트 실패**: `updating field: undefined to: anthropic` → 올바른 필드명을 찾지 못함
3. **UI/Backend 불일치**: Frontend에서 변경 시도하지만 Backend 상태와 동기화 안 됨

### **현재 상태:**
**상태**: ❌ **작업 중단 (심각한 문제)**  
**일시**: 2025-01-12 저녁  

**핵심 문제:**
- ❌ `currentMode` prop이 컴포넌트 계층에서 올바르게 전달되지 않음
- ❌ Provider 변경 시 즉시 원래 값으로 되돌아감
- ❌ 6차례의 서로 다른 진단과 수정 시도 모두 실패

**다음 단계 (필수):**
1. 🔍 **근본 원인 재발견**: `currentMode` prop 전달 체인 완전 분석
2. 🧹 **불필요한 수정사항 대대적 정리**: 지금까지의 임시방편 코드 모두 제거
3. 📊 **컴포넌트 구조 검증**: Parent → Child prop 전달 경로 완전 추적
4. 🎯 **최소 침습 수정**: 핵심 문제만 해결하고 나머지 복잡성 제거

**결론**: 현재 상태에서는 더 이상의 임의 수정은 절대 금지. 체계적인 근본 원인 분석 후 단일 핵심 문제만 해결해야 함.

---

**우선순위**: HIGH → **CRITICAL**  
**예상 소요시간**: 1.5시간 → **미정 (문제 해결 방법 불명)**  
**의존성**: 026-1 Account 완료  
**후속 작업**: 026번 통합 테스트 → **보류**
