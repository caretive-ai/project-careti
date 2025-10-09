# Step 2 작업 로그: StateManager 마이그레이션
**시작일**: 2025-10-09
**예상 시간**: 8-12시간
**예상 해결**: ~300개 에러

---

## 📌 작업 목적

Cline upstream의 새로운 StateManager API로 마이그레이션하여 컴파일 에러 해결

### 핵심 변경 사항
- **Old API**: `getGlobalStateKey()`, `setGlobalState()`, `getWorkspaceStateKey()`, `setWorkspaceState()` (삭제됨)
- **New API**: `getGlobalSettings()`, `setGlobalSettings()`, `getChatSettings()` + hostProvider 직접 접근

---

## 🗺️ Step 2.1: State Key 매핑 문서

### StateManager 구조 이해

#### 1. GlobalState (전역 UI 상태)
**위치**: `state-keys.ts` → `GlobalState` interface
**접근**: `await stateManager.getGlobalSettings()` → `GlobalState` 타입
**저장**: `await stateManager.setGlobalSettings({ key: value })`

**주요 키**:
- `lastShownAnnouncementId`: string | undefined
- `taskHistory`: HistoryItem[]
- `userInfo`: UserInfo | undefined
- `mcpMarketplaceCatalog`: McpMarketplaceCatalog | undefined
- `favoritedModelIds`: string[]
- `mcpMarketplaceEnabled`: boolean
- `mcpResponsesCollapsed`: boolean
- `terminalReuseEnabled`: boolean
- `isNewUser`: boolean
- `welcomeViewCompleted`: boolean | undefined
- `mcpDisplayMode`: McpDisplayMode
- `workspaceRoots`: WorkspaceRoot[] | undefined
- `primaryRootIndex`: number
- `multiRootEnabled`: boolean
- `lastDismissedInfoBannerVersion`: number
- `lastDismissedModelBannerVersion`: number
- `caretModeSystem`: "caret" | "cline" | undefined (CARET)
- `enablePersonaSystem`: boolean | undefined (CARET)
- `currentPersona`: string | undefined (CARET)
- `personaProfile`: object | undefined (CARET)
- `caretUserProfile`: CaretUser | undefined (CARET)
- `inputHistory`: HistoryItem[] | undefined (CARET)

#### 2. Settings (API 설정 및 환경)
**위치**: `state-keys.ts` → `Settings` interface
**접근**: `await stateManager.getGlobalSettings()` → `Settings` 타입 (GlobalState와 병합됨)
**저장**: `await stateManager.setGlobalSettings({ key: value })`

**주요 키**:
- `awsRegion`, `awsUseCrossRegionInference`, `awsBedrockUsePromptCache` 등
- `autoApprovalSettings`: AutoApprovalSettings
- `globalClineRulesToggles`: ClineRulesToggles
- `globalWorkflowToggles`: ClineRulesToggles
- `browserSettings`: BrowserSettings
- `caretBaseUrl`, `caretUsePromptCache` (CARET)
- `telemetrySetting`: TelemetrySetting
- `planActSeparateModelsSetting`: boolean
- `enableCheckpointsSetting`: boolean
- `shellIntegrationTimeout`: number
- `defaultTerminalProfile`: string
- `terminalOutputLineLimit`: number
- `strictPlanModeEnabled`: boolean
- `yoloModeToggled`: boolean
- `useAutoCondense`: boolean
- `preferredLanguage`: string
- `openaiReasoningEffort`: OpenaiReasoningEffort
- `mode`: Mode
- `dictationSettings`: DictationSettings
- `focusChainSettings`: FocusChainSettings
- `customPrompt`: "compact" | undefined
- `autoCondenseThreshold`: number | undefined
- `planModeApiProvider`, `planModeApiModelId`, `planModeCaretModelId` (CARET) 등
- `actModeApiProvider`, `actModeApiModelId`, `actModeCaretModelId` (CARET) 등

#### 3. Secrets (API 키)
**위치**: `state-keys.ts` → `Secrets` interface
**접근**: `await hostProvider.getSecret(key)`
**저장**: `await hostProvider.setSecret(key, value)`

**주요 키**:
- `apiKey`, `clineAccountId`
- `openRouterApiKey`, `awsAccessKey`, `awsSecretKey`
- `caretAuthToken`, `caretApiKey` (CARET)
- 기타 provider API keys

#### 4. LocalState (워크스페이스별 상태)
**위치**: `state-keys.ts` → `LocalState` interface
**접근**: `await hostProvider.getWorkspaceState(LOCAL_STATE_KEY)` 또는 `await stateManager.getChatSettings()`
**저장**: `await hostProvider.setWorkspaceState(LOCAL_STATE_KEY, value)`

**주요 키**:
- `localClineRulesToggles`: ClineRulesToggles
- `localCaretRulesToggles`: ClineRulesToggles (CARET)
- `localCursorRulesToggles`: ClineRulesToggles
- `localWindsurfRulesToggles`: ClineRulesToggles
- `workflowToggles`: ClineRulesToggles

---

### 마이그레이션 패턴 정리

#### 패턴 A: GlobalState/Settings 읽기/쓰기
```typescript
// ❌ Old (삭제됨)
const value = controller.stateManager.getGlobalStateKey("caretModeSystem")
controller.stateManager.setGlobalState("caretModeSystem", "caret")

// ✅ New
const settings = await controller.stateManager.getGlobalSettings()
const value = settings.caretModeSystem
await controller.stateManager.setGlobalSettings({ caretModeSystem: "caret" })
```

#### 패턴 B: GlobalSettings 여러 개 동시 업데이트
```typescript
// ❌ Old
controller.stateManager.setGlobalState("key1", value1)
controller.stateManager.setGlobalState("key2", value2)

// ✅ New (한 번에 업데이트)
await controller.stateManager.setGlobalSettings({
  key1: value1,
  key2: value2
})
```

#### 패턴 C: LocalState (Workspace) 읽기/쓰기
```typescript
// ❌ Old (삭제됨)
const toggles = controller.stateManager.getWorkspaceStateKey("localClineRulesToggles")
controller.stateManager.setWorkspaceState("localClineRulesToggles", toggles)

// ✅ New (hostProvider 직접 접근)
const localState = await controller.hostProvider.getWorkspaceState(LOCAL_STATE_KEY) ?? {}
const toggles = localState.localClineRulesToggles ?? {}
localState.localClineRulesToggles = { ...toggles, [rulePath]: enabled }
await controller.hostProvider.setWorkspaceState(LOCAL_STATE_KEY, localState)
```

#### 패턴 D: Secrets 접근
```typescript
// ❌ Old
const apiKey = controller.stateManager.getSecretKey("caretApiKey")

// ✅ New
const apiKey = await controller.hostProvider.getSecret("caretApiKey")
```

---

## 🔧 Step 2.2: Controller State 파일 마이그레이션

### 대상 파일 (7개)
1. ✅ `src/core/controller/state/resetState.ts` (Lines 107, 109) - 완료
2. ✅ `src/core/controller/state/updateSettings.ts` (24개 호출) - 완료
3. ⏸️ `src/core/controller/state/updateAutoApprovalSettings.ts`
4. ⏸️ `src/core/controller/state/toggleFavoriteModel.ts`
5. ⏸️ `src/core/controller/state/updateTerminalReuseEnabled.ts`
6. ⏸️ `src/core/controller/state/updateTerminalConnectionTimeout.ts`
7. ⏸️ `src/core/controller/state/updateInfoBannerVersion.ts`

### 진행 상황
- **시작 시각**: 2025-10-09
- **현재 파일**: toggleClineRule.ts
- **진행률**: 2/7 (29%)

### 완료된 작업
- ✅ resetState.ts: getGlobalStateKey → getGlobalSettings, setGlobalState → setGlobalSettings
- ✅ updateSettings.ts: 24개 setGlobalState 호출을 globalSettingsUpdates 객체로 수집하여 일괄 업데이트

---

---

## 🔧 Step 2.3: File/Rule Management 파일 마이그레이션

### 대상 파일 (5개)
1. ✅ `src/core/controller/file/toggleClineRule.ts` (Lines 27, 29, 31, 33, 44, 45) - 완료
2. ⏸️ `src/core/controller/file/toggleWorkflow.ts`
3. ⏸️ `src/core/controller/file/toggleWindsurfRule.ts`
4. ⏸️ `src/core/controller/file/toggleCaretRule.ts`
5. ⏸️ `src/core/controller/file/toggleCursorRule.ts`

### 진행 상황
- **진행률**: 1/5 (20%)

### 완료된 작업
- ✅ toggleClineRule.ts: GlobalState + LocalState (chatSettings) 패턴 적용

---

## 📊 진행 기록

### 2025-10-09 - Phase 1 완료 (커밋: 39f8c435d)
- ✅ Step 2.1: State Key 매핑 문서 작성
- ✅ Step 2.2: Controller State 2/7 파일 완료
  - resetState.ts
  - updateSettings.ts (24개 호출 일괄 변환)
- ✅ Step 2.3: File/Rule Management 1/5 파일 완료
  - toggleClineRule.ts
- ⏭️ 다음: 나머지 파일 마이그레이션 계속

---

**Step 2 진행 중** 🔄 (3/22 files completed, 14%)
