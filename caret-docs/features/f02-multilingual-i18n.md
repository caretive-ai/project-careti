# 다국어 i18n 시스템 (Multilingual i18n System)

Caret의 **다국어 지원 시스템**은 한국어, 영어, 일본어, 중국어 4개 언어를 중심으로 설계된 포괄적인 국제화(i18n) 시스템입니다.

> **중요**: Caret은 기존의 `react-i18next` 라이브러리를 사용하지 않고, `@/caret/utils/i18n.ts`에 구현된 자체 경량화 시스템을 사용합니다. 이는 성능 최적화와 프로젝트 맞춤 기능(예: 한국어 조사 처리)을 위함입니다.

## 📋 **기능 개요**

### **지원 언어**
- 🇰🇷 **한국어 (ko)**: 완전 번역 및 현지화 (조사 자동 처리 포함)
- 🇺🇸 **영어 (en)**: 기본 언어 및 fallback
- 🇯🇵 **일본어 (ja)**: 번역 지원
- 🇨🇳 **중국어 (zh)**: 번역 지원

### **네임스페이스 구조 원칙**

Caret의 i18n 시스템은 **기능별 네임스페이스**를 기본 원칙으로 합니다. 각 주요 기능(View)은 자신만의 고유한 네임스페이스(JSON 파일)를 가지며, 이를 통해 번역 리소스를 체계적으로 관리하고 유지보수성을 높입니다.

| 네임스페이스 | 용도 | 표준 키 구조 |
|---|---|---|
| **common** | 여러 기능에서 공유되는 공통 UI 요소 | `button.save`, `error.generic` |
| **chat** | 채팅 화면 관련 | `chat.placeholder.default` |
| **welcome** | 환영 페이지 | `welcome.greeting`, `welcome.coreFeatures.header` |
| **settings** | 설정 페이지 | `settings.tabs.api`, `settings.browser.title` |
| **history** | 작업 기록 페이지 | `history.title`, `history.searchPlaceholder` |
| ... | 기타 기능별 네임스페이스 | `{namespace}.{group}.{key}` |

### **⚙️ 공통 컴포넌트 네임스페이스 규칙 (Shared Component Namespace Rule)**

**❗ 중요한 발견**: 설정과 웰컴뷰에서 동시에 사용하는 모델 정보 컴포넌트(`ModelInfoView`)와 같은 공통 컴포넌트는 네임스페이스 위치가 중요합니다.

**⚠️ 해결된 문제 사례**:
- ✅ **ModelInfoView**: `t("modelInfoView.tokensSuffix", "settings")` → `t("modelInfoView.tokensSuffix", "common")`으로 네임스페이스 수정 완료
- ✅ **ApiKeyField**: `t("apiKey.*", "common")` → `t("apiKeyField.*", "settings")`로 올바른 네임스페이스 사용하도록 수정 완료

### **🚨 중복 JSON 키 문제 해결**

**❗ 새로 발견된 문제**: 동일한 JSON 파일 내에서 같은 키가 중복 정의되어 후자가 전자를 덮어쓰는 문제

**해결된 사례**:
- ✅ **common.json의 apiKey 중복**: 모든 언어(en/ko/ja/zh)에서 `apiKey` 섹션이 2번 정의되어 `getYourKeyAn`/`getYourKeyA` 키가 누락되었던 문제 해결
- ✅ **올바른 구조**: 첫 번째 apiKey 섹션에 모든 키 통합, 중복 섹션 제거 완료

### **⚠️ common.json 축소화 필요성**

현재 `common.json` 파일이 과도하게 커지고 있어 다음 문제들이 발생하고 있습니다:
- 파일 크기가 740+ 라인으로 관리가 어려움
- 여러 기능의 번역이 혼재되어 있어 유지보수성 저하
- 네임스페이스 원칙에 위배되는 구조

**권장 해결책**:
1. **기능별 분리**: `apiOptions`, `providers`, `modelInfo` 등을 각각 독립 네임스페이스로 분리
2. **진정한 공통 요소만 유지**: `button`, `error`, `validation` 등 진짜 공통 UI 요소만 `common.json`에 보관
3. **점진적 마이그레이션**: 대규모 리팩토링 대신 새 키는 적절한 네임스페이스에 추가

### **⚙️ Provider 키 통합 규칙 (Provider Key Unification Rule)**

API Provider 설정과 같이 복잡한 UI는 일관된 규칙을 따릅니다. 모든 Provider 관련 번역 키는 `settings` 네임스페이스 내의 `providers` 객체 아래에 각 `providerId`로 그룹화하여 통합합니다.

### **🚨 중요: Provider ID vs JSON 키 명명 규칙 차이점**

**주의사항**: Cline 코드베이스에서 Provider ID와 JSON i18n 키는 서로 다른 케이스 규칙을 사용합니다:

| 항목 | 케이스 | 예시 | 위치 |
|---|---|---|---|
| **Provider ID** (Backend) | 케밥케이스 | `vercel-ai-gateway`, `qwen-code`, `claude-code` | `src/shared/proto-conversions/` |
| **JSON i18n 키** (Frontend) | 카멜케이스 | `vercelAiGateway`, `qwenCode`, `claudeCode` | `webview-ui/src/caret/locale/` |

**❌ 흔한 실수:**
```typescript
// 틀림 - Provider ID를 JSON 키에 그대로 사용
t('providers.vercel-ai-gateway.description', 'settings')
t('providers.qwen-code.description', 'settings')
```

**✅ 올바른 사용:**
```typescript
// 맞음 - JSON 키는 카멜케이스로 변환
t('providers.vercelAiGateway.description', 'settings')
t('providers.qwenCode.description', 'settings')
```

이 차이점은 Cline 원본 코드의 구조적 제약으로 인한 것이므로 주의 깊게 확인해야 합니다.

**❌ AS-IS (혼재된 패턴 - 사용 금지):**
```typescript
// 각기 다른 최상위 키와 중첩 키를 혼용하여 사용
t('providers.openrouter.description', 'settings')
t('openRouterProvider.apiKeyLabel', 'settings')
```

**✅ TO-BE (통합된 표준 패턴):**
모든 키를 `providers.{providerId}.{key}` 형태로 통일합니다.

**JSON 구조 예시 (`settings.json`):**
```json
{
  "providers": {
    "openrouter": {
      "name": "OpenRouter",
      "description": "Access a wide variety of models...",
      "apiKeyLabel": "OpenRouter API Key",
      "balanceDisplay": {
        "loading": "Loading..."
      }
    },
    "caret": {
      "name": "Caret",
      "description": "Caret provides high-quality AI models...",
      "login": "Login to Caret"
    }
  }
}
```

**코드 호출 예시:**
```typescript
t('providers.openrouter.apiKeyLabel', 'settings')
t('providers.caret.login', 'settings')
```

이 규칙을 통해 모든 Provider 관련 번역을 일관되게 관리합니다.

### **⚙️ 모델 Picker 네임스페이스 표준 (Model Picker Namespace Standard)**

각 Provider의 모델 선택기(Model Picker) 관련 번역은 `providers.{providerId}.modelPicker` 하위로 통합하여 관리합니다.

**❌ AS-IS (분산된 패턴 - 사용 금지):**
```typescript
// 각기 다른 최상위 키로 분산
t('openRouterModelPicker.modelLabel', 'settings')
t('ollamaModelPicker.searchPlaceholder', 'settings')
t('geminiModelPicker.clearSearch', 'settings')
```

**✅ TO-BE (통합된 표준 패턴):**
모든 모델 선택기 관련 키를 `providers.{providerId}.modelPicker.{key}` 형태로 통일합니다.

**JSON 구조 예시 (`settings.json`):**
```json
{
  "providers": {
    "openrouter": {
      "name": "OpenRouter",
      "description": "Access a wide variety of models...",
      "modelPicker": {
        "modelLabel": "Model",
        "searchPlaceholder": "Search and select a model...",
        "clearSearch": "Clear search",
        "featuredModelLabelBest": "Best",
        "featuredModelLabelNew": "New",
        "featuredModelLabelFree": "Free"
      }
    },
    "ollama": {
      "name": "Ollama",
      "modelPicker": {
        "searchPlaceholder": "Search and select a model...",
        "clearSearch": "Clear search"
      }
    }
  }
}
```

**코드 호출 예시:**
```typescript
t('providers.openrouter.modelPicker.modelLabel', 'settings')
t('providers.ollama.modelPicker.searchPlaceholder', 'settings')
```

**적용 완료 Provider:**
- ✅ **OpenRouter**: `openRouterModelPicker.*` → `providers.openrouter.modelPicker.*`로 통합 완료

**향후 정리 대상:**
- [ ] **Ollama**: `ollamaModelPicker.*` → `providers.ollama.modelPicker.*`
- [ ] **기타 Provider**: 동일한 패턴으로 통합

이 표준을 통해 모든 Provider의 모델 선택기 UI를 일관되게 관리하고 유지보수성을 향상시킵니다.

## 🏗️ **시스템 아키텍처**

### **파일 구조**
```
webview-ui/src/caret/
├── locale/                        # 다국어 JSON 파일
│   ├── en/ (11개)                 # 영어 (기준 언어)
│   ├── ko/ (11개)                 # 한국어
│   ├── ja/ (11개)                 # 일본어
│   └── zh/ (11개)                 # 중국어
├── utils/
│   └── i18n.ts                    # 메인 i18n 유틸리티
├── hooks/
│   └── useCaretI18n.ts           # React i18n Hook
└── context/
    └── CaretI18nContext.tsx      # i18n Context Provider
```

### **핵심 API 및 사용법**

**1. 번역 함수 `t` - 호출 표준**

```typescript
t(key, namespace, options?)
```

가장 기본적인 번역 함수입니다. 컴포넌트 외부에서도 사용 가능합니다.

**📝 표준 호출 패턴:**
```typescript
import { t } from '@/caret/utils/i18n';

// 기본 사용법 - t(key, namespace)
t('button.save', 'common')                    // -> "저장" 또는 "Save"
t('settings.modeSystem.label', 'settings')    // -> "모드 설정"
t('providers.caret.name', 'settings')         // -> "Caret"

// 변수 삽입 - t(key, namespace, options)
t('message.welcome', 'common', { user: 'Luke' }) // -> "Luke님, 환영합니다."

// 한국어 조사 처리
t('brand.appName|을', 'common', {}, 'ko')      // -> "Caret을" (받침 있음)
```

**⚠️ 잘못된 패턴 (사용 금지):**
```typescript
// ❌ 네임스페이스를 키에 포함시키는 패턴
t('settings.modeSystem.label')     // 틀림
t('common.button.save')            // 틀림

// ✅ 올바른 패턴 - 네임스페이스는 두 번째 매개변수
t('modeSystem.label', 'settings')  // 맞음
t('button.save', 'common')         // 맞음
```

**2. React Hook `useCaretI18n`**
React 컴포넌트 내에서 언어 변경 등의 인터랙티브한 기능을 사용할 때 유용합니다.

```typescript
import { useCaretI18n } from '@/caret/hooks/useCaretI18n';

function MyComponent() {
    const { t, currentLanguage, changeLanguage } = useCaretI18n();

    return (
        <div>
            <h1>{t("welcome.title", "welcome")}</h1>
            <button onClick={() => changeLanguage('ko')}>
                한국어로 변경
            </button>
        </div>
    );
}
```

### **한국어 조사 자동 처리**
Caret의 i18n 시스템은 한국어의 복잡한 조사를 자동으로 처리하여 자연스러운 문장을 생성합니다. (현재는 `ko-postposition` 라이브러리를 통해 구현되어 있지 않지만, 향후 확장될 수 있습니다.)

## 🧪 **테스트 및 검증**

### **수동 검증 절차**
1.  **UI 확인**: `npm run watch` 실행 후 VS Code에서 직접 각 페이지의 번역이 올바르게 표시되는지 확인합니다.
2.  **언어 전환**: 설정 페이지에서 언어를 변경했을 때 UI가 즉시 해당 언어로 변경되는지 확인합니다.

### **자동화 도구**

#### **🔍 검증 스크립트**
-   **네임스페이스 검증**: `npm run report:i18n-namespace`
    `i18n.ts`에 등록 누락된 네임스페이스나, 언어별로 누락된 번역 파일을 검사합니다.
-   **키 누락 검증**: `npm run report:i18n-keys`
    기준 언어(en)에 존재하는 키가 다른 언어 파일에 누락되었는지 확인합니다.
-   **미사용 키 검증**: `node caret-scripts/tools/report-i18n-unused-key.js`
    코드에서 사용되지 않는 번역 키를 찾아냅니다.

#### **🔧 자동화 도구**
-   **키 자동 동기화**: `npm run sync:i18n-keys` 또는 `node caret-scripts/tools/i18n-key-synchronizer.js`
    누락된 키를 자동으로 추가하고 영어(en)를 기본값으로 채웁니다.
-   **완전 동기화 (삭제 포함)**: `node caret-scripts/tools/i18n-key-synchronizer.js --delete-unused`
    누락된 키를 추가하고, 영어에 없는 키를 다른 언어에서 삭제합니다.
-   **미사용 키 자동 삭제**: `node caret-scripts/tools/remove-i18n-unused-keys.js`
    사용되지 않는 번역 키를 모든 언어 파일에서 자동으로 삭제합니다.

**i18n-key-synchronizer.js 사용법:**
```bash
# 기본 모드: 누락된 키만 추가
node caret-scripts/tools/i18n-key-synchronizer.js

# 완전 동기화 모드: 누락된 키 추가 + 영어에 없는 키 삭제
node caret-scripts/tools/i18n-key-synchronizer.js --delete-unused
node caret-scripts/tools/i18n-key-synchronizer.js -d
```

**동작 방식:**
- 영어(en) 파일을 마스터로 사용하여 다른 언어 파일들과 동기화
- 누락된 키는 영어 값을 복사하여 추가 (번역 플레이스홀더)
- `--delete-unused` 옵션: 영어에 없는 키를 다른 언어에서 삭제

#### **📊 분석 도구**
-   **i18n 전체 체크리스트**: `caret-scripts/i18n-checklist-report.md`
    i18n 시스템의 전반적인 상태와 권장사항을 종합 분석합니다.
-   **키 사용 현황 분석**: `node caret-scripts/tools/find-existing-i18n-key.js`
    특정 키의 사용 위치와 패턴을 분석합니다.

## 🔄 **번역 추가 및 관리 프로세스**

1.  **네임스페이스 결정**: 추가할 번역이 기존 네임스페이스에 맞지 않으면 새로운 네임스페이스(`{namespace}.json`)를 생성합니다.
2.  **JSON 파일 수정**: `webview-ui/src/caret/locale/en/` 폴더에 기준이 될 영어 번역을 추가합니다.
3.  **다른 언어 파일 동기화**: `ko`, `ja`, `zh` 폴더의 해당 네임스페이스 파일에도 동일한 키를 추가하고 번역합니다.
4.  **네임스페이스 등록**: 새 네임스페이스를 생성한 경우, `webview-ui/src/caret/utils/i18n.ts` 파일의 `translations` 객체와 `loadLanguagePack` 함수 내 `Promise.all` 배열에 반드시 추가해야 합니다. **⚠️ 이 과정을 누락하는 것이 가장 흔한 실수입니다.**
5.  **코드 적용**: `t('your.key', 'your_namespace')` 형태로 코드에 적용합니다.

## ⚠️ **모듈 로딩 시점의 정적 번역 문제와 해결책**

### **문제 상황**
모듈이 처음 로드되는 시점에 `t()` 함수를 호출하여 번역된 값을 상수에 저장하면, 이후 언어 설정이 변경되어도 번역이 업데이트되지 않는 문제가 발생합니다.

**❌ 문제가 있는 패턴:**
```typescript
// 모듈 로딩 시점에 번역이 고정됨
export const SETTINGS_TABS = [
    {
        id: "general",
        name: t("tabs.general.name", "settings"),  // 영어로 고정
        tooltip: t("tabs.general.tooltip", "settings")  // 영어로 고정
    }
]
```

### **해결책: 동적 함수 + useMemo 패턴**

**✅ 해결된 패턴:**
```typescript
// 1. 정적 상수를 동적 함수로 변경
export const getSettingsTabs = (): SettingsTab[] => [
    {
        id: "general",
        name: t("tabs.general.name", "settings"),  // 호출 시점에 번역
        tooltip: t("tabs.general.tooltip", "settings")
    }
]

// 2. 컴포넌트에서 언어 변경 감지 및 useMemo 사용
function SettingsView() {
    const { language } = useCaretI18nContext()

    // 언어가 변경될 때마다 번역 재실행
    const settingsTabs = useMemo(() => getSettingsTabs(), [language])

    // settingsTabs 사용
}
```

### **적용된 수정사항**
- ✅ **AutoApproveBar**: `ACTION_METADATA`, `NOTIFICATIONS_SETTING` 상수 → `getActionMetadata()`, `getNotificationsSetting()` 함수로 변경
- ✅ **SettingsView**: `SETTINGS_TABS` 상수 → `getSettingsTabs()` 함수로 변경
- ✅ **ApiOptions**: `providerOptions` useMemo 의존성에 `[language]` 추가

### **useMemo 의존성 누락 패턴**
일부 경우는 이미 useMemo를 사용하고 있지만 **언어 의존성이 누락**된 경우입니다:

```typescript
// ❌ 언어 의존성 누락
const providerOptions = useMemo(() => [
    { value: "anthropic", label: t("providers.anthropic", "settings") }
], []) // 빈 의존성 배열

// ✅ 언어 의존성 추가
const providerOptions = useMemo(() => [
    { value: "anthropic", label: t("providers.anthropic", "settings") }
], [language]) // 언어 변경시 재실행
```

이 패턴을 통해 언어 설정 변경 시 UI가 즉시 올바른 번역으로 업데이트됩니다.

## 🔧 **최근 수정 사항 (2025-09-18)**

### **Announcement 컴포넌트 동적화 및 버전 표시 개선**

1. **Announcement.tsx 컴포넌트 개선**
   - ✅ **버전 표시**: `minorVersion` 대신 전체 `version` 사용 (0.2.21 완전 표시)
   - ✅ **동적 공지사항**: 하드코딩된 항목 대신 i18n 파일에서 동적으로 로드
   - ✅ **유연한 구조**: 공지사항 개수에 관계없이 자동으로 처리
   - ✅ **i18n 키 네이밍**: `.desc` → `-desc` 형식으로 수정 (i18n 계층구조 충돌 방지)

2. **4개국어 CHANGELOG.md 통일**
   - ✅ **v0.2.21 항목**: 한국어 버전 기준으로 영어, 일본어, 중국어 버전 모두 통일
   - ✅ **페르소나 시스템 수정**: Bug Fix, Feature Enhancement, UX Improvement 구조로 일관성 확보
   - ✅ **세부 설명**: `asset:/` URI 처리 문제, 초기 설정 플로우 변경, UI 개선 내용 포함

3. **4개국어 announcement.json 구조화**
   - ✅ **구조 통일**: `header`, `previousHeader`, `bullets.current/previous` 구조로 모든 언어 통일
   - ✅ **키 네이밍**: `1-desc`, `2-desc` 형식으로 i18n 계층구조 문제 해결
   - ✅ **내용 동기화**: 한국어 버전 기준으로 자연스러운 번역 제공

### **i18n 키 네이밍 규칙 수정**

**⚠️ 중요한 발견**: i18n 키에서 `.`(점)은 계층구조로 인식되어 문제 발생

**❌ 문제가 있는 패턴:**
```json
{
  "bullets": {
    "current": {
      "1": "제목",
      "1.desc": "설명"  // 이것은 1 객체의 desc 속성으로 인식됨
    }
  }
}
```

**✅ 올바른 패턴:**
```json
{
  "bullets": {
    "current": {
      "1": "제목",
      "1-desc": "설명"  // 별도의 키로 인식됨
    }
  }
}
```

**코드 호출 예시:**
```typescript
// ✅ 올바른 사용
const title = t(`bullets.current.${i}`, "announcement")
const desc = t(`bullets.current.${i}-desc`, "announcement")
```

### **이전 수정 사항 (2025-09-16)**

1. **OpenRouter Provider 통합**
   - ✅ `openRouterProvider.*` → `providers.openrouter.*` 통합 완료
   - ✅ `openRouterModelPicker.*` → `providers.openrouter.modelPicker.*` 통합 완료
   - ✅ 4개 언어(en/ko/ja/zh) 모든 파일 동기화 완료
   - ✅ TypeScript 코드의 모든 참조 업데이트 완료

2. **Caret Provider 정리 및 수정**
   - ✅ 부적절한 개인정보처리방침 콘텐츠 제거
   - ✅ 번역 키 구조 정리 및 누락된 키 복원
   - ✅ 4개 언어 일관성 확보

3. **ApiKeyField 네임스페이스 문제 해결**
   - 문제: `t("apiKey.*", "common")` 사용하지만 실제로는 `settings.json`의 `apiKeyField` 섹션 사용해야 함
   - ✅ 해결: `t("apiKeyField.*", "settings")` 구조로 변경 완료
   - 영향: API 키 관련 모든 텍스트가 정상 번역됨

4. **중복 JSON 키 문제 해결**
   - 발견: 모든 언어의 `common.json`에서 `apiKey` 섹션이 중복 정의되어 일부 키 누락
   - ✅ 해결: 중복 섹션 제거, 필요한 키들 첫 번째 섹션에 통합
   - 영향: `getYourKeyAn`/`getYourKeyA` 키가 정상적으로 작동

### **이전 수정 사항 (2025-09-10)**

1. **welcome.json 영어 하드코딩 수정**
   - 한국어: `apiSetup.description` 영어 → 한국어 번역 완료
   - 일본어: `personaSelector`, `footer.about`, `welcome` 섹션 영어 → 일본어 번역 완료
   - 중국어: `personaSelector`, `footer.about`, `welcome` 섹션 영어 → 중국어 번역 완료

2. **modelInfoView.tokensSuffix 네임스페이스 불일치 해결**
   - 문제: 코드에서 `t("modelInfoView.tokensSuffix", "settings")` 호출하지만 실제로는 `common.json`에만 존재
   - 해결: `ModelInfoView.tsx`에서 네임스페이스를 `"common"`으로 변경
   - 영향: 모든 언어에서 "/백만 토큰", "/million tokens" 등이 정상 표시됨

### **한계 및 미적용 영역**

**백엔드 하드코딩 미번역:**
- `src/shared/api.ts`의 모델 설명(description) 등 백엔드 하드코딩은 번역하지 않음
- 프론트엔드-백엔드 i18n 통합은 아키텍처 변경이 필요하여 현재 범위에서 제외

### **최신 개선 사항 (2025-09-16)**

4. **Provider i18n 키 누락 문제 해결**
   - 검증: Vercel AI Gateway, Qwen Code, LM Studio, Moonshot, Dify Provider의 i18n 키 상태 확인
   - ✅ 해결: Dify Provider의 `baseUrlLabel`, `baseUrlPlaceholder` 키 4개 언어에 추가
   - 영향: 모든 검증된 Provider의 UI 텍스트가 정상적으로 번역됨

5. **비표준 i18n 패턴 수정**
   - 발견: LiteLLM Provider에서 `t("settings.modelInfoView.*", "settings")` 비표준 패턴 사용
   - ✅ 해결: `t("providers.litellm.*", "settings")` 표준 패턴으로 수정
   - 영향: `supportsImagesLabel`, `maxOutputTokensLabel`, `temperatureLabel`, `contextWindowSizeLabel` 정상 번역
   - **교훈**: 네임스페이스는 키 이름에 포함시키지 말고 두 번째 매개변수로 전달해야 함

### **향후 개선 과제**

#### **단기 과제 (현재 진행 중)**
- [ ] **나머지 Provider 통합**: Ollama, Anthropic, Bedrock 등 `providers.{id}.*` 구조로 통합
- [ ] **중복 JSON 키 검증**: 다른 네임스페이스에서도 유사한 중복 키 문제 존재 가능성 검사
- [ ] **기타 Provider i18n 완료**: vsCodeLm, Vertex, LiteLLM, claudeCode, SAP AI Core, Cerebras 등의 누락 키 해결
- [ ] `common.json` 축소화: 740+ 라인 → 진짜 공통 요소만으로 축소
- [ ] `apiOptions`, `providers` 등을 독립 네임스페이스로 분리
- [ ] 전체 다국어 파일 일관성 검증 및 누락 번역 보완

#### **장기 과제 (아키텍처 개선)**
- [ ] **🚨 Provider ID 명명 규칙 통일**: 케밥케이스 vs 카멜케이스 혼재 문제 해결
  - **현재 문제**: Backend(케밥케이스) vs Frontend JSON(카멜케이스) 불일치로 개발자 혼란
  - **목표**: 전체 시스템에서 일관된 명명 규칙 적용
  - **방법**:
    - 옵션 1: Cline 업스트림 따라가기 (케밥케이스 유지)
    - 옵션 2: Frontend JSON을 케밥케이스로 변경 (대대적 수정 필요)
    - 옵션 3: Provider ID 매핑 레이어 구축
  - **우선순위**: 중요도 높음 - AI 개발 및 유지보수 효율성에 직접 영향

### **검증 도구 개선 필요**
- [ ] **중복 키 검출**: JSON 파일 내 동일 키 중복 자동 검출 스크립트
- [ ] **네임스페이스 일치 검증**: 코드의 네임스페이스와 실제 JSON 파일 위치 일치 확인
- [ ] **Provider 구조 검증**: 모든 Provider가 표준 구조를 따르는지 자동 검사

---
**문서 상태**: `2025-09-16` 기준 최신화 완료