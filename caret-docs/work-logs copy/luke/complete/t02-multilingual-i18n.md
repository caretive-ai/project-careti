# T02-1: 다국어(i18n) 모델 피커 리소스 통합

## 1. 작업 개요

본 작업의 목표는 `f02-multilingual-i18n.mdx` 문서에 정의된 **Provider 키 통합 규칙**에 따라, 프로젝트 내 모든 모델 피커(Model Picker) 컴포넌트에서 사용되는 다국어(i18n) 리소스를 체계적으로 통합하고 정리하는 것입니다.

현재 `common.json`, `settings.json`, `models.json` 등 여러 파일에 분산된 번역 키들을 `settings.json` 파일 하나로 통합하여 일관성을 확보하고 유지보수성을 향상시킵니다.

### 관련 규칙 (`f02-multilingual-i18n.mdx` 발췌)

> **Provider 키 통합 규칙 (Provider Key Unification Rule)**
>
> API Provider 설정과 같이 복잡한 UI는 일관된 규칙을 따릅니다. 모든 Provider 관련 번역 키는 `settings` 네임스페이스 내의 `providers` 객체 아래에 각 `providerId`로 그룹화하여 통합합니다.
ㅛ
> **✅ TO-BE (통합된 표준 패턴):**
> 모든 키를 `providers.{providerId}.{key}` 형태로 통일합니다.

## 2. 문제점

- 모델 피커 관련 번역 키가 `common.json`, `settings.json`, `models.json`에 분산되어 있습니다.
- `t()` 함수 호출 시 네임스페이스와 키 구조가 일관되지 않습니다.
- `models.json` 파일이 거의 사용되지 않음에도 불구하고 일부 키가 남아있어 혼란을 야기합니다.
- 유지보수가 어렵고 새로운 Provider 추가 시 일관된 패턴을 적용하기 힘듭니다.

## 3. 해결 방안

1.  **`settings.json`으로 키 통합**: 모든 모델 피커 및 Provider 관련 UI 문자열을 `settings.json`의 `providers.{providerId}` 객체 하위로 통합합니다.
2.  **컴포넌트 코드 수정**: 각 모델 피커 컴포넌트에서 `t()` 함수 호출을 `t('providers.{providerId}.{key}', 'settings')` 형태로 표준화합니다.
3.  **기존 리소스 정리**: `common.json`과 `models.json`에서 이동된 키들을 삭제하여 중복을 제거합니다.
4.  **다국어 파일 동기화**: `en/settings.json`을 기준으로 `ko`, `ja`, `zh` 언어 파일에 변경사항을 동기화합니다.

## 4. 작업 체크리스트

### 단계 1: `OpenRouterModelPicker` 리팩토링

-   [ ] **`webview-ui/src/caret/locale/en/settings.json`**: `providers.openrouter` 객체를 생성하고 `OpenRouterModelPicker.tsx`에서 사용되는 모든 키를 통합.
-   [ ] **`webview-ui/src/components/settings/OpenRouterModelPicker.tsx`**: 모든 `t()` 호출을 `t('providers.openrouter.{key}', 'settings')` 형태로 수정.
-   [ ] **`webview-ui/src/caret/locale/en/common.json`**: `OpenRouter` 관련 키가 있다면 `settings.json`으로 이동 후 삭제.
-   [ ] **`webview-ui/src/caret/locale/en/models.json`**: `OpenRouter` 관련 키가 있다면 `settings.json`으로 이동 후 삭제.

### 단계 2: 다른 모델 피커 및 Provider 관련 컴포넌트 식별 및 리팩토링

-   [ ] **파일 탐색**: `webview-ui/src/components/settings/` 디렉토리에서 다른 모델 피커 컴포넌트(예: `AnthropicModelPicker`, `GoogleModelPicker` 등)를 식별.
-   [ ] **(반복 작업)** 식별된 각 모델 피커에 대해 단계 1과 동일한 리팩토링 절차 적용.
    -   [ ] `...ModelPicker.tsx`
    -   [ ] `settings.json`
    -   [ ] `common.json`
    -   [ ] `models.json`

### 단계 3: 다국어 동기화 및 최종 검증

-   [ ] **`en/settings.json` 기준 동기화**: `npm run sync:i18n-keys` 스크립트를 실행하여 `ko`, `ja`, `zh` 언어의 `settings.json` 파일에 누락된 키 추가.
-   [ ] **번역 검토 (필요 시)**: 추가된 키에 대해 각 언어별로 번역이 필요한지 확인. (기존 값을 옮기는 것이므로 대부분 번역은 유지됨)
-   [ ] **미사용 키 제거**: `npm run report:i18n-unused-key` 및 관련 스크립트를 실행하여 정리 과정에서 발생한 미사용 키가 있는지 확인하고 제거.
-   [ ] **UI 검증**: `npm run watch` 실행 후 VS Code 설정 화면에서 모든 모델 피커가 정상적으로 표시되고 번역이 올바르게 나오는지 확인.
