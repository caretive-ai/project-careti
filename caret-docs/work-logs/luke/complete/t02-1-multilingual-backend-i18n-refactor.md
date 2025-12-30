# T02-1: 백엔드 API 다국어 처리 리팩토링 계획 (최종)

- **작성자**: luke
- **날짜**: 2025-09-13
- **상태**: 계획 확정

## 1. 목표

백엔드(`src/shared/api.ts`)에 하드코딩된 UI 문자열(모델 설명)을 프론트엔드의 다국어(i18n) 시스템으로 통합하여, 유지보수성을 개선하고 다국어 지원을 활성화하는 것을 목표로 합니다.

## 2. 문제 분석

현재 모델 설명은 `src/shared/api.ts` 파일 내의 모델 정보 객체에 `description` 필드로 하드코딩되어 있습니다. 이 방식은 번역을 불가능하게 만들며, 백엔드 로직과 프론트엔드 표시 텍스트가 혼합되어 관심사 분리 원칙을 위반합니다.

## 3. 제안 해결책 (최종)

**핵심 원칙**: Cline 원본 소스 코드(`src/shared/api.ts`)의 수정을 피하고, 프론트엔드 영역에서 데이터를 **상속 및 확장(Inheritance & Extension)**하여 사용하는 **'최소 침습(Minimal Invasion)'** 전략을 채택합니다. 이 방식은 코드 중복을 방지하고 원본 데이터의 변경사항(가령, 가격 정보 업데이트)을 자동으로 상속받는 장점이 있습니다.

리팩토링은 프론트엔드 모델 정보 처리, i18n 통합, UI 컴포넌트 수정의 세 단계로 진행됩니다.

---

### 단계 1: 프론트엔드 모델 정보 처리 (상속 및 확장)

**목표**: `src/shared/api.ts`의 원본 데이터를 직접 수정하지 않고, 프론트엔드에서 이를 `import`하여 `description` 필드만 동적으로 제거하는 '확장' 방식을 사용합니다.

1.  **파일 생성**: `webview-ui/src/caret/services/CaretModelInfo.ts` 파일을 생성합니다.
2. 
    -   `src/shared/api.ts`에서 원본 모델 객체들(`bedrockModels` 등)을 `import` 합니다.
    -   `import`한 객체를 순회하며 각 모델 정보에서 `description` 속성만 제거한 새로운 객체를 생성합니다.
    -   이 처리된 객체를 `export`하여 UI 컴포넌트에서 사용하도록 합니다.
3.  **주석 추가**: 파일 상단에 이 파일이 Caret의 확장 로직임을 명시하는 주석을 추가합니다.
    ```typescript
    // CARET MODIFICATION: This module imports original model definitions from 'src/shared/api.ts'
    // and programmatically removes the 'description' field. This approach avoids code duplication
    // and direct modification of Cline's source code, ensuring future updates are inherited automatically.
    ```

---

### 단계 2: 프론트엔드 i18n 통합

**목표**: 모델 설명을 다국어 로케일 파일로 이전하고, UI가 번역된 텍스트를 동적으로 표시하도록 준비합니다.

#### 2.1 단계: 설명 문자열을 `en/settings.json`으로 이전

원본 `src/shared/api.ts`에 있던 모든 `description` 문자열을 `webview-ui/src/caret/locale/en/settings.json`에 추가합니다.

- **키 구조**: `providers.{providerId}.models.{modelId}.description`

#### 2.2 단계: 번역 추가

`en/settings.json`에 새로 추가된 키들을 다른 언어(`ko`, `ja`, `zh`)에 맞게 번역하여 해당 파일에 추가합니다.

---

### 단계 3: UI 컴포넌트 수정

**목표**: UI 컴포넌트가 처리된 모델 정보 파일을 사용하고, 번역된 설명을 표시하도록 수정합니다.

1.  **`import` 경로 변경**: 모델 정보를 사용하던 모든 UI 컴포넌트에서 `import` 경로를 `src/shared/api` 대신 새로운 `webview-ui/src/caret/services/CaretModelInfo`로 변경합니다.
2.  **번역 함수 적용**: `description`을 표시하던 로직을 동적 i18n 키를 생성하고 `t()` 번역 함수를 사용하도록 수정합니다.

**예시 (변경 후):**
```tsx
// ModelInfoView.tsx와 같은 컴포넌트 내부
import { useTranslation } from 'react-i18next';
// import { bedrockModels } from '../../../../src/shared/api'; // <- 기존 경로
import { bedrockModels } from '../services/CaretModelInfo'; // <- 새로운 경로

// ...
const { t } = useTranslation('settings');
const i18nKey = `providers.${providerId}.models.${model.id}.description`;
// ...

// <p>{model.description}</p> // <- 기존 로직
<p>{t(i18nKey)}</p> // <- 새로운 로직
```

## 4. 검증

구현 후 다음 사항을 검증합니다:
1.  **`src/shared/api.ts` 파일이 전혀 수정되지 않았는지 확인합니다.**
2.  애플리케이션이 오류 없이 컴파일되고 실행됩니다.
3.  모든 지원 언어에 대해 모델 설명이 UI에 올바르게 표시됩니다.

## 5. 다음 단계

이 최종 계획에 따라 작업을 진행합니다.
