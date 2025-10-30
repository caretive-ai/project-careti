# 기능 선택 빌드 옵션 시스템 (Feature Config System)

Caret의 **기능 선택 빌드 옵션 시스템**은 다양한 배포 환경(일반 사용자용, 엔터프라이즈용)에 맞춰 기능을 동적으로 켜고 끌 수 있는 설정 시스템입니다.

## 📋 **기능 개요**

### **핵심 개념**
- **기본 설정**: 모든 기능이 활성화된 완전한 Caret 경험
- **커스텀 설정**: `.caret-feature-config.json` 파일을 통한 특정 기능 오버라이드
- **동적 제어**: 런타임에 기능별 세부 설정 가능

### **제어 가능한 기능들**
| 설정 키 | 기본값 | 동작 방식 | 주요 사용처 |
|---|---|---|---|
| **enableCaretAccountFeatures** | true | 런타임 동적 | `AccountWelcomeView.tsx:13`<br>`AccountView.tsx:74,289,321`<br>`ApiOptions.tsx:153` |
| **showPersonaSettings** | true | 런타임 동적 | `CaretGeneralSettingsSection.tsx:43`<br>`ClineRulesToggleModal.tsx:329`<br>`ChatRow.tsx:1006,1040` |
| **defaultPersonaEnabled** | true | 최초 설정 | `state-helpers.ts:631`<br>`ExtensionStateContext.tsx:277` |
| **redirectAfterApiSetup** | "persona" | 런타임 동적 | `WelcomeView.tsx:64` |
| **defaultModeSystem** | "caret" | **최초 설정 (globalState 우선)** | `StateManager.ts:105` ⚠️ 특수<br>Fallback: `state-helpers.ts:601,626,628`<br>`ExtensionStateContext.tsx:247`<br>`CaretSettings.ts:44` |
| **firstListingProvider** | "litellm" | 런타임 동적 | `ApiOptions.tsx:202` |
| **defaultProvider** | "litellm" | 최초 설정 | `StateManager.ts:94`, `state-helpers.ts:433`, `controller/index.ts:165,466` |
| **showOnlyDefaultProvider** | false | 런타임 동적 | `ApiOptions.tsx:212` |
| **showCostInformation** | false | 런타임 동적 | `ChatRow.tsx:942`, `TaskHeader.tsx:315` |

## 🏗️ **시스템 아키텍처**

### **동작 방식 구분**

#### **1. 런타임 동적 플래그** (ExtensionState를 통한 전달)
백엔드에서 매번 feature-config.json을 읽어 프론트엔드로 전달. 설정 변경 시 즉시 반영.
- `enableCaretAccountFeatures`, `showPersonaSettings`
- `showOnlyDefaultProvider`, `showCostInformation`, `firstListingProvider`

**데이터 흐름**:
```
feature-config.json
  → Controller.postStateToWebview() [line 828-831]
  → ExtensionState.featureConfig [ExtensionMessage.ts:86]
  → useExtensionState().featureConfig
  → 컴포넌트에서 조건부 렌더링
```

#### **2. 최초 설정 플래그** (globalState 저장 후 유지)
앱 초기화 시 한번만 적용되고, 이후 globalState에 저장된 값 사용.
- `defaultModeSystem` - 앱 최초 실행 시 모드 설정 (이후 globalState 우선)
- `defaultProvider` - 신규 사용자의 기본 프로바이더 설정

**데이터 흐름**:
```
feature-config.json
  → StateManager.initialize() [line 103-108]
  → globalState.caretModeSystem 저장
  → 이후 저장된 값 계속 사용 (feature-config 무시)
```

### **파일 구조**
```
# 백엔드
caret-src/shared/
├── FeatureConfig.ts              # 인터페이스 정의
└── feature-config.json           # 설정 값 (정적 import)

src/shared/
└── ExtensionMessage.ts           # ExtensionState에 featureConfig 추가

src/core/
├── controller/index.ts           # featureConfig를 webview로 전달 (line 828)
└── storage/
    ├── StateManager.ts           # defaultModeSystem 초기화 (line 105)
    └── utils/state-helpers.ts    # defaultProvider 초기화 (line 433)

# 프론트엔드
webview-ui/src/
├── context/ExtensionStateContext.tsx  # featureConfig 상태 관리
└── components/
    ├── account/AccountWelcomeView.tsx         # enableCaretAccountFeatures
    ├── settings/
    │   ├── ApiOptions.tsx                     # showOnlyDefaultProvider, firstListingProvider
    │   └── sections/
    │       ├── FeatureSettingsSection.tsx     # enableDictationFeature
    │       └── CaretGeneralSettingsSection.tsx # showPersonaSettings
    └── chat/
        ├── ChatRow.tsx                        # showCostInformation
        └── task-header/TaskHeader.tsx         # showCostInformation
```

### **핵심 인터페이스**
```typescript
export interface FeatureConfig {
    /** Caret 계정 관련 기능 활성화 여부 (로그인/가입 UI 등) */
    enableCaretAccountFeatures: boolean
    /** 페르소나 설정 표시 여부 */
    showPersonaSettings: boolean
    /** 페르소나 시스템 기본 활성화 상태 */
    defaultPersonaEnabled: boolean
    /** API 설정 완료 후 이동할 위치 */
    redirectAfterApiSetup: "persona" | "home"
    /** 기본 모드 시스템 */
    defaultModeSystem: "caret" | "cline"
    /** API 설정 화면에 최상단에 노출할 프로바이더 */
    firstListingProvider: string
    /** 기본 프로바이더 */
    defaultProvider: string
    /** 기본 프로바이더만 표시할지 여부 */
    showOnlyDefaultProvider: boolean
    /** 비용 정보 표시 여부 */
    showCostInformation: boolean
}
```

## 🎛️ **설정 방식**

### **기본 설정 (코드 내장)**
```typescript
const defaultFeatures: FeatureConfig = {
    enableCaretAccountFeatures: true,
    showPersonaSettings: true,
    defaultPersonaEnabled: true,
    redirectAfterApiSetup: "persona",
    defaultModeSystem: "caret",
    firstListingProvider: "litellm",
    defaultProvider: "litellm",
    showOnlyDefaultProvider: false,
    showCostInformation: false,
}
```

### **커스텀 설정 (정적 JSON 파일)**
```json
// caret-src/shared/feature-config.json (엔터프라이즈 환경 예시)
{
    "enableCaretAccountFeatures": false,
    "showPersonaSettings": false,
    "defaultPersonaEnabled": false,
    "redirectAfterApiSetup": "home",
    "defaultModeSystem": "cline",
    "firstListingProvider": "litellm",
    "defaultProvider": "litellm",
    "showOnlyDefaultProvider": true,
    "showCostInformation": false
}
```

## 🔧 **사용법**

### **1. 기본 사용 (코드에서)**
```typescript
import { getCurrentFeatureConfig } from '@shared/FeatureConfig'

// 현재 기능 설정 가져오기
const config = getCurrentFeatureConfig()

// 조건부 렌더링
{config.showPersonaSettings && (
    <PersonaSettingsComponent />
)}

// 기본값 설정
const defaultProvider = config.defaultProvider
```

### **2. 정적 설정 (배포 환경)**
```bash
# 간소화 모드 활성화 (caret-src/shared/feature-config.json 수정)
cat > caret-src/shared/feature-config.json << 'EOF'
{
    "showPersonaSettings": false,
    "defaultPersonaEnabled": false,
    "redirectAfterApiSetup": "home",
    "defaultModeSystem": "cline",
    "firstListingProvider": "litellm",
    "defaultProvider": "litellm",
    "showOnlyDefaultProvider": true,
    "showCostInformation": false
}
EOF

# 일반 모드로 복원 (기본값으로 되돌리기)
cat > caret-src/shared/feature-config.json << 'EOF'
{
    "showPersonaSettings": true,
    "defaultPersonaEnabled": true,
    "redirectAfterApiSetup": "persona",
    "defaultModeSystem": "caret",
    "firstListingProvider": "openrouter",
    "defaultProvider": "openrouter",
    "showOnlyDefaultProvider": false,
    "showCostInformation": true
}
EOF
```

### **3. 백엔드-프론트엔드 연동**
```typescript
// 백엔드: Controller에서 설정 전달
const featureConfig = getCurrentFeatureConfig()
Logger.debug(`[Controller] 📋 Loaded feature config: ${JSON.stringify(featureConfig)}`)

// 프론트엔드: Context에서 설정 사용
const { featureConfig } = useExtensionState()
const showPersona = featureConfig?.showPersonaSettings && modeSystem === "caret"
```

### **4. 브랜드 유틸리티 함수**
```typescript
import { getBrandRulesFileName, getBrandMcpSettingsFileName } from '@caret/utils/brand-utils'

// 동적 파일명 생성 (Caret → .caretrules, CodeCenter → .codecenterrules)
const rulesFileName = getBrandRulesFileName()
console.log(rulesFileName) // ".caretrules" or ".codecenterrules"

// MCP 설정 파일명 생성 (Caret → caret_mcp_settings.json, CodeCenter → codecenter_mcp_settings.json)
const mcpSettingsFileName = getBrandMcpSettingsFileName()
console.log(mcpSettingsFileName) // "caret_mcp_settings.json" or "codecenter_mcp_settings.json"
```

## 🎯 **실제 적용 사례**

### **1. Caret 계정 기능 제어**
```typescript
// AccountWelcomeView.tsx
import { useCaretState } from '@/caret/context/CaretStateContext'

export const AccountWelcomeView = () => {
    const { personaProfile, featureConfig } = useCaretState()

    // Feature flag로 계정 UI 전체 숨기기
    if (!featureConfig?.enableCaretAccountFeatures) {
        return null
    }

    return <div>/* 계정 관련 UI */</div>
}
```

### **2. 음성 입력 기능 제어**
```typescript
// FeatureSettingsSection.tsx
const { featureConfig } = useExtensionState()

<VSCodeCheckbox
    checked={dictationSettings?.dictationEnabled}
    disabled={!featureConfig?.enableDictationFeature}  // Feature flag로 비활성화
    onChange={(e: any) => {
        setDictationSettings((prev) => ({
            ...prev,
            dictationEnabled: e.target.checked,
        }))
    }}
>
    {t('featureSettings.dictation.label', 'settings')}
</VSCodeCheckbox>
```

### **3. API 프로바이더 목록 제어**
```typescript
// ApiOptions.tsx
const { featureConfig } = useExtensionState()

// 프로바이더 목록 필터링
if (featureConfig.showOnlyDefaultProvider) {
    const defaultProvider = featureConfig.defaultProvider
    const defaultProviderOption = processedOptions.find((option) => option.value === defaultProvider)
    return defaultProviderOption ? [defaultProviderOption] : []
}

// 프로바이더 순서 조정
const firstProvider = featureConfig.firstListingProvider
const sortedOptions = [
    ...processedOptions.filter(option => option.value === firstProvider),
    ...processedOptions.filter(option => option.value !== firstProvider)
]
```

### **4. 백엔드 알림 메시지 브랜드 동적 처리**
```typescript
// AskFollowupQuestionToolHandler.ts & NewTaskHandler.ts
import { getCurrentBrandName } from "@caret/utils/brand-utils"

// "Caret has a question..." → "CodeCenter has a question..." 동적 변경
const brandName = getCurrentBrandName()
showSystemNotification({
    subtitle: `${brandName} has a question...`,
    message: question.replace(/\n/g, " "),
})

// "Caret wants to start a new task..." → "CodeCenter wants to start a new task..."
showSystemNotification({
    subtitle: `${brandName} wants to start a new task...`,
    message: `${brandName} is suggesting to start a new task with: ${context}`,
})
```

### **5. 최초 설치 시 기본값 설정**
```typescript
// StateManager.ts
if (!this.globalStateCache.planModeApiProvider && !this.globalStateCache.actModeApiProvider) {
    const featureConfig = getCurrentFeatureConfig()
    this.globalStateCache.planModeApiProvider = featureConfig.defaultProvider as any
    this.globalStateCache.actModeApiProvider = featureConfig.defaultProvider as any
    this.scheduleDebouncedPersistence()
}
```

### **6. 조건부 UI 렌더링**
```typescript
// CaretGeneralSettingsSection.tsx
const config = getCurrentFeatureConfig()

{config.showPersonaSettings === true && modeSystem === "caret" && (
    <PersonaSection>
        <PersonaToggle />
        <PersonaSettings />
    </PersonaSection>
)}
```

### **7. 비용 정보 표시 제어**
```typescript
// TaskHeader.tsx & ChatRow.tsx
const featureConfig = getCurrentFeatureConfig()

// 비용 정보 조건부 표시
{isCostAvailable && featureConfig.showCostInformation && (
    <div>${totalCost?.toFixed(4)}</div>
)}

// VSCodeBadge 투명도 제어
<VSCodeBadge
    style={{
        opacity: cost != null && cost > 0 && featureConfig.showCostInformation ? 1 : 0
    }}
>
    ${cost?.toFixed(4)}
</VSCodeBadge>
```

## 🧪 **테스트 및 검증**

### **TDD 테스트 케이스**
```typescript
describe("FeatureConfig Integration Tests", () => {
    it("should load feature config from static JSON import", () => {
        // Given: 정적 JSON 파일이 import됨
        const config = getCurrentFeatureConfig()

        // When: 설정을 확인
        // Then: JSON 파일의 설정값이 적용됨
        expect(config.enableCaretAccountFeatures).toBe(true)
        expect(config.showPersonaSettings).toBe(true)
        expect(config.defaultPersonaEnabled).toBe(true)
        expect(config.defaultModeSystem).toBe("caret")
        expect(config.firstListingProvider).toBe("litellm")
        expect(config.defaultProvider).toBe("litellm")
        expect(config.showOnlyDefaultProvider).toBe(false)
    })

    it("should hide account features when disabled in config", () => {
        // Given: 계정 기능이 비활성화된 설정
        const config: FeatureConfig = {
            enableCaretAccountFeatures: false,
            showPersonaSettings: false,
            defaultPersonaEnabled: false,
            // ... 기타 설정
        }

        // When: UI에서 계정 기능 표시 여부 확인
        const shouldShowAccount = config.enableCaretAccountFeatures
        const shouldShowPersona = config.showPersonaSettings

        // Then: 계정 관련 UI와 페르소나 UI가 숨겨짐
        expect(shouldShowAccount).toBe(false)
        expect(shouldShowPersona).toBe(false)
    })

    it("should show persona settings when enabled in config", () => {
        // Given: 페르소나 설정이 활성화된 설정
        const config: FeatureConfig = {
            enableCaretAccountFeatures: true,
            showPersonaSettings: true,
            defaultPersonaEnabled: true,
            // ... 기타 설정
        }

        // When: UI에서 페르소나 표시 여부 확인
        const shouldShowPersona = config.showPersonaSettings

        // Then: 페르소나 UI가 표시됨
        expect(shouldShowPersona).toBe(true)
    })
})
```

### **수동 테스트 절차**
1. **기본 모드 확인**:
   ```bash
   npm run watch
   # VS Code F5 → API 설정에서 모든 프로바이더 표시 확인
   ```

2. **간소화 모드 테스트**:
   ```bash
   cat > caret-src/shared/feature-config.json << 'EOF'
{
    "enableCaretAccountFeatures": false,
    "showPersonaSettings": false,
    "defaultPersonaEnabled": false,
    "redirectAfterApiSetup": "home",
    "defaultModeSystem": "cline",
    "firstListingProvider": "litellm",
    "defaultProvider": "litellm",
    "showOnlyDefaultProvider": true,
    "showCostInformation": false
}
EOF
   npm run compile
   npm run watch
   # VS Code F5 → 계정 내부 UI 숨겨짐, Caret provider 제외, LiteLLM만 표시되는지 확인
   ```

## 📊 **빌드 및 배포**

### **컴파일 확인**
```bash
npm run compile     # 전체 빌드 테스트
npm run test:unit   # 기능 설정 테스트 실행
```

### **배포 시나리오**

**일반 사용자 배포**:
```bash
# 설정 파일 없이 배포 (기본 설정 사용)
npm run compile
npm run package
```

**엔터프라이즈 배포 (CodeCenter 예시)**:
```bash
# 1. 커스텀 설정 파일 수정
cat > caret-src/shared/feature-config.json << 'EOF'
{
    "enableCaretAccountFeatures": false,
    "showPersonaSettings": false,
    "defaultPersonaEnabled": false,
    "redirectAfterApiSetup": "home",
    "defaultModeSystem": "cline",
    "firstListingProvider": "litellm",
    "defaultProvider": "litellm",
    "showOnlyDefaultProvider": true,
    "showCostInformation": false
}
EOF

# 2. 빌드 및 패키징 (설정 파일 포함)
npm run compile
npm run package
```

**⚠️ 중요**: `caret-src/shared/feature-config.json` 파일 변경 후 반드시 `npm run compile` 실행 필요 (정적 import 반영)

## ⚙️ **확장 가능성**

### **새 기능 추가**
```typescript
export interface FeatureConfig {
    // 계정 및 인증 관련
    enableCaretAccountFeatures: boolean
    enableDictationFeature: boolean

    // UI 표시 관련
    showPersonaSettings: boolean
    defaultPersonaEnabled: boolean
    showCostInformation: boolean

    // 프로바이더 설정
    firstListingProvider: string
    defaultProvider: string
    showOnlyDefaultProvider: boolean

    // 시스템 동작
    redirectAfterApiSetup: "persona" | "home"
    defaultModeSystem: "caret" | "cline"

    // 새 기능 추가 예시
    showAdvancedSettings: boolean
    enableExperimentalFeatures: boolean
    maxModelCount: number
}
```

### **새 모드 추가**
```typescript
// 전문가 모드 추가
const expertFeatures: FeatureConfig = {
    showPersonaSettings: true,
    showAdvancedSettings: true,
    enableExperimentalFeatures: true,
    // ...
}

export function getCurrentFeatureConfig(): FeatureConfig {
    const FEATURE_VARIANT = "default" // 'default' | 'simplified' | 'expert'

    switch(activeVariant) {
        case "simplified": return simplifiedFeatures
        case "expert": return expertFeatures
        default: return defaultFeatures
    }
}
```

## 🚨 **주의사항**

### **구현 방식 변경 (2025-10-30)**
- **이전**: 컴파일 타임 정적 import (`getCurrentFeatureConfig()` 직접 호출)
- **현재**: 런타임 동적 전달 (백엔드 → ExtensionState → 프론트엔드)

### **플래그별 동작 방식 차이**

#### **런타임 동적 플래그** ✅
브랜드 전환 시 즉시 반영:
- `showCostInformation`, `showOnlyDefaultProvider`, `firstListingProvider`
- `enableCaretAccountFeatures`, `showPersonaSettings`

#### **최초 설정 플래그** ⚠️
앱 초기화 시 한번만 적용 (globalState 우선):
- `defaultModeSystem` - 앱 최초 실행 시 모드 설정
- `defaultProvider` - 신규 사용자의 기본 프로바이더

**중요**: 이미 설정된 값을 변경하려면 globalState 초기화 필요
```bash
# VS Code Command Palette (Cmd/Ctrl + Shift + P)
> Developer: Reload Window

# 또는 globalState 초기화
> Caret: Reset Global State
```

### **showPersonaSettings vs enablePersonaSystem**

이 두 설정은 함께 작동하여 페르소나 기능을 제어합니다:

#### **showPersonaSettings** (브랜드 플래그)
- **위치**: `feature-config.json` (런타임 동적)
- **목적**: 브랜드 레벨에서 페르소나 기능 제공 여부 결정
- **적용 범위**:
  - 설정 화면 페르소나 섹션 표시 (`CaretGeneralSettingsSection.tsx:43`)
  - 규칙 모달 페르소나 관리 UI (`ClineRulesToggleModal.tsx:329`)
  - 채팅 페르소나 아바타 표시 (`ChatRow.tsx:1006,1040`)

#### **enablePersonaSystem** (사용자 설정)
- **위치**: `globalState` (사용자별 토글)
- **목적**: 사용자가 페르소나 기능을 활성화/비활성화
- **조건**: `showPersonaSettings`가 true일 때만 UI에 토글 표시

#### **동작 조합**
```typescript
// showPersonaSettings=false, enablePersonaSystem=any
// → 페르소나 관련 UI 모두 숨김 (브랜드가 기능 제공 안함)

// showPersonaSettings=true, enablePersonaSystem=false
// → 설정 토글만 보이고, 아바타/관리 UI는 숨김 (사용자가 비활성화)

// showPersonaSettings=true, enablePersonaSystem=true
// → 모든 페르소나 UI 표시 (브랜드 제공 + 사용자 활성화)
```

#### **구현 패턴**
```typescript
// 올바른 조건 체크 (두 가지 모두 확인)
{featureConfig?.showPersonaSettings && enablePersonaSystem && (
  <PersonaManagement />
)}

// 잘못된 조건 체크 (브랜드 플래그 누락)
{enablePersonaSystem && (  // ❌ showPersonaSettings 체크 안함
  <PersonaManagement />
)}
```

### **네이밍 규칙**
- **인터페이스**: `FeatureConfig` (이전: `CaretFeatureConfig`)
- **함수**: `getCurrentFeatureConfig()` (백엔드 전용)
- **프론트엔드**: `useExtensionState().featureConfig` 사용
- **로그**: `[FeatureConfig]` (이전: `[CaretBrandConfig]`)

### **사용 패턴**

#### ❌ **잘못된 사용** (정적 import)
```typescript
// 프론트엔드에서 직접 호출 - 브랜드 전환 시 반영 안됨!
import { getCurrentFeatureConfig } from '@caret/shared/FeatureConfig'
const featureConfig = getCurrentFeatureConfig()  // ❌ 번들에 고정됨
```

#### ✅ **올바른 사용** (동적 전달)
```typescript
// 백엔드: Controller에서 전달
const featureConfig = getCurrentFeatureConfig()
return { ...state, featureConfig }  // ExtensionState에 포함

// 프론트엔드: ExtensionState에서 사용
const { featureConfig } = useExtensionState()
if (featureConfig?.showCostInformation) { /* ... */ }
```

## 🔮 **향후 계획**

- [ ] **환경변수 지원**: `CARET_FEATURE_VARIANT=simplified` 환경변수 지원
- [ ] **런타임 변경**: 설정 UI에서 실시간 모드 변경 가능
- [ ] **프로파일 시스템**: 여러 설정 프로파일 저장 및 전환
- [ ] **권한 기반 제어**: 사용자 권한에 따른 기능 접근 제어

## 📝 **화이트라벨링 적용 사례**

### **브랜드별 기능 차별화**
Caret과 CodeCenter를 동일한 코드베이스로 관리하되 feature-config.json 파일만 변경하여 배포:

**Caret (일반 사용자용)**:
- `enableCaretAccountFeatures: true` - 계정 기능 활성화
- `showPersonaSettings: true` - 페르소나 기능 활성화
- `defaultPersonaEnabled: true` - 페르소나 시스템 기본 활성화
- `showOnlyDefaultProvider: false` - 모든 AI 프로바이더 표시
- `showCostInformation: false` - 비용 정보 숨김

**CodeCenter (기업용)**:
- `enableCaretAccountFeatures: false` - 계정 기능 제한
  - Account 페이지 내부에서 이메일, organization dropdown, Dashboard/Logout 버튼 숨김
  - Caret provider를 프로바이더 목록에서 제외
  - Account 메뉴 탭과 프로필 이미지/이름은 유지
- `showPersonaSettings: false` - 페르소나 기능 비활성화
- `defaultPersonaEnabled: false` - 페르소나 시스템 기본 비활성화
- `showOnlyDefaultProvider: true` - LiteLLM만 표시
- `showCostInformation: false` - 비용 정보 숨김

---

**문서 버전**: v3.3 (2025-10-31)
**담당**: Luke Yang + Claude Code
**관련 이슈**:
- [caret-b2b/worklog/20250929-issue1-litellm-default.md]
- [caret-docs/work-logs/alpha/20251030-whitelabeling-correct-implementation.md]
- [caret-docs/work-logs/alpha/20251031-feature-flag-implementation-verification.md]

**v3.3 주요 변경사항** (2025-10-31):
- **`defaultPersonaEnabled` 플래그 추가**: 페르소나 시스템의 초기 활성화 상태 제어
  - `enablePersonaSystem`의 기본값을 브랜드별로 설정 가능
  - Caret: `true` (기본 활성화), CodeCenter: `false` (기본 비활성화)
  - 수정 파일: FeatureConfig.ts, feature-config.json, state-helpers.ts, ExtensionStateContext.tsx, 테스트 파일
- **`showClineVoiceSettings` 플래그 제거**: Cline에서 제거된 음성 기능 관련 플래그 삭제
  - Dictation 기능은 `dictationSettings.featureEnabled`로 제어됨
  - 수정 파일: FeatureConfig.ts, feature-config.json, FeatureSettingsSection.tsx, 테스트 파일, 문서
- **`enableCaretAccountFeatures` 동작 확장**: Account 페이지 내부 UI와 Caret provider 제어
  - `false`일 때: Account 페이지 이메일/dropdown/버튼 숨김, Caret provider 목록에서 제외
  - Account 메뉴 탭과 프로필 아바타는 유지 (완전 숨김 아님)
  - 수정 파일: AccountView.tsx, ApiOptions.tsx

**v3.1 주요 변경사항** (2025-10-31):
- **showPersonaSettings 적용 범위 확대**: ChatRow 페르소나 아바타 표시 조건에 플래그 추가
  - `ChatRow.tsx:1006, 1040` - 페르소나 아바타가 `showPersonaSettings` 플래그도 체크하도록 수정
  - `ClineRulesToggleModal.tsx:329` - ExtensionState에서 featureConfig 읽도록 수정
- **defaultModeSystem 하드코딩 완전 제거**: 모든 fallback이 feature-config를 참조하도록 수정
  - Backend: `state-helpers.ts:601,626,628` - `|| "caret"` → `|| getCurrentFeatureConfig().defaultModeSystem`
  - Frontend: `ExtensionStateContext.tsx:247` - `"caret"` → `getCurrentFeatureConfig().defaultModeSystem`
  - Frontend: `CaretSettings.ts:44` - `"caret"` → `getCurrentFeatureConfig().defaultModeSystem`

**v3.0 주요 변경사항** (2025-10-31):
- 각 플래그의 동작 방식 명시 (Runtime Dynamic vs Initial Setup)
- 소스 파일 위치 매핑 추가 (Backend/Frontend 사용처 상세 명시)
- 구현 상세 아키텍처 섹션 추가 (데이터 플로우 다이어그램 포함)
- 주의사항 섹션 대폭 강화 (Static Import vs ExtensionState Delivery 설명)
- `defaultProvider`, `showCostInformation`, `showOnlyDefaultProvider` 버그 수정 반영

**v2.0 주요 변경사항** (2025-10-30):
- `enableCaretAccountFeatures`, `enableDictationFeature` 필드 추가
- `firstListingProvider`, `defaultProvider` 기본값 변경: openrouter → litellm
- `showCostInformation` 기본값 변경: true → false
- 브랜드 유틸리티 함수 추가: `getBrandRulesFileName()`, `getBrandMcpSettingsFileName()`
- 백엔드 알림 메시지 브랜드 동적 처리 적용