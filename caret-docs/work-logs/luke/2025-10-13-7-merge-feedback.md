
---

# 7차 작업 진행 현황 (2025-10-14)

## ✅ 완료된 작업 (12/12)

### 1.1-1.2: clientId 시스템 구현 ✅
- **수정 파일**:
  - `src/core/webview/WebviewProvider.ts`: UUID 생성, clientIdMap, HTML injection 추가
  - `src/core/controller/index.ts`: clientId 파라미터 추가
- **결과**: Banner image와 focus input 동작 정상화

### 1.4: featureConfig 백엔드 로드 ✅
- **수정 파일**:
  - `src/core/controller/index.ts`: getCurrentFeatureConfig() 로드 및 ExtensionState에 포함
- **결과**: API provider 설정 정상 표시

### 1.5: 모델 정보 i18n ✅
- **수정 파일** (8개):
  - OpenRouterModelPicker.tsx, GroqModelPicker.tsx, HuggingFaceModelPicker.tsx
  - BasetenModelPicker.tsx, RequestyModelPicker.tsx, SapAiCoreModelPicker.tsx
  - OcaModelPicker.tsx, ThinkingBudgetSlider.tsx
- **변경 내용**: "Model" → `t("modelPicker.label", "settings")`, "Enable thinking" → `t("thinkingBudget.enableLabel", "settings")`

### 2.2: announcement 버전 업데이트 ✅
- **수정 파일** (4개):
  - `webview-ui/src/caret/locale/{ko,en,ja,zh}/announcement.json`
- **변경 내용**: "v3.27.x" → "v3.32.7"

### 2.4: WelcomeView optional chaining ✅
- **수정 파일**:
  - `webview-ui/src/components/welcome/WelcomeView.tsx`
- **변경 내용**:
  - getCurrentFeatureConfig() 제거
  - useExtensionState()에서 featureConfig 가져오기
  - `featureConfig.redirectAfterApiSetup` → `featureConfig?.redirectAfterApiSetup`

### 3.3: focusChain 백엔드 ✅
- **수정 파일**:
  - `src/core/storage/state-keys.ts`: focusChainFeatureFlagEnabled 타입 추가
  - `src/core/storage/utils/state-helpers.ts`: globalState 로드 및 반환 로직 추가
- **결과**: Focus Chain UI 활성화 조건 충족

### 3.6-b: CaretGeneralSettings optional chaining ✅
- **수정 파일**:
  - `webview-ui/src/caret/components/CaretGeneralSettingsSection.tsx`
- **변경 내용**:
  - getCurrentFeatureConfig() import 제거
  - useExtensionState()에서 featureConfig 가져오기
  - `featureConfig.showPersonaSettings` → `featureConfig?.showPersonaSettings`

### 4.1: CaretAccountView import ✅
- **수정 파일**:
  - `webview-ui/src/components/account/AccountView.tsx`
- **변경 내용**:
  - CaretAccountView import 추가
  - CaretUser 타입 import 추가
  - `caretUser?.uid` → `caretUser?.id`로 조건 변경
  - 간단한 텍스트 대신 CaretAccountView 컴포넌트 사용

### 5.1: openClineInNewTab 구현 ✅
- **수정 파일**:
  - `src/extension.ts`: setTimeoutPromise import, openClineInNewTab 전체 구현
  - `src/shared/webview/types.ts`: WebviewProviderType enum 생성
- **변경 내용**:
  - Placeholder 구현 제거
  - WebviewPanel 생성 및 tab 열기 로직 완전 구현
- **⚠️ 주의**: TypeScript 컴파일 에러 발생 (API 변경 가능성)

### 6.1: HistoryView i18n ✅
- **수정 파일**:
  - `webview-ui/src/components/history/HistoryView.tsx`
- **변경 내용**:
  - i18n import 추가: `import { t } from "@/caret/utils/i18n"`
  - 20+ 하드코딩 문자열을 t() 함수로 교체
  - 번역 키: history.title, history.fuzzySearchPlaceholder, history.sortNewest/Oldest/MostExpensive/MostTokens/MostRelevant
  - history.filterWorkspace/Favorites, history.selectAll/None, history.tokensLabel/cacheLabel/apiCostLabel
  - historyView.deleteSelectedWithCount (count, size 파라미터), history.deleteAllHistory (size 파라미터)
  - buttons.done (settings 네임스페이스에서 공유)

### 7.1: MCP i18n ✅
- **수정 파일** (4개):
  - `webview-ui/src/components/mcp/configuration/McpConfigurationView.tsx`
  - `webview-ui/src/components/mcp/configuration/tabs/marketplace/McpMarketplaceView.tsx`
  - `webview-ui/src/components/mcp/configuration/tabs/add-server/AddRemoteServerForm.tsx`
  - `webview-ui/src/components/mcp/configuration/tabs/installed/ConfigureServersView.tsx`
- **변경 내용**:
  - **McpConfigurationView**: 5개 메인 문자열 (MCP Servers, Done, Marketplace, Remote Servers, Installed)
  - **McpMarketplaceView**: 11개 문자열 (검색, 필터, 정렬, 에러 메시지)
  - **AddRemoteServerForm**: 11개 문자열 + getLocalizedUrl 사용 (REMOTE_MCP_SERVER_DOCS)
  - **ConfigureServersView**: 6개 문자열 (MCP 설명, 버튼 라벨)
- **총 33+ t() 변환 완료**

### 7.2: MCP warning 수정 (<a> 중첩) ✅
- **수정 파일**:
  - `webview-ui/src/components/mcp/configuration/tabs/marketplace/McpMarketplaceCard.tsx`
- **변경 내용**:
  - Line 52-62: 외부 `<a>` 태그를 `<div>`로 변경, onClick 핸들러 추가
  - Line 159-160: 내부 `<a>` 태그에 stopPropagation() 추가
  - role="button", tabIndex={0}, onKeyDown 추가 (접근성 개선)
- **결과**: HTML 스펙 위반 해결, React warning 제거

## 7차 중간 피드백 (2025-10-13 14:50) - Merge Compilation Errors 해결

### 문제: Cline upstream merge로 인한 API 시그니처 변경으로 컴파일 에러 발생

**근본 원인**: Cline upstream에서 WebviewProvider 시스템이 대폭 변경됨
- `WebviewProviderType` enum 추가 (sidebar/tab 구분)
- `Controller` constructor에 `clientId` 파라미터 추가
- `getWebviewUri` → `getWebviewUrl` 메서드명 변경
- `WebviewView | WebviewPanel` union type 처리 필요

###  Merge Conflict 해결 (API 시그니처 변경) ✅

**수정 파일 1**: `src/shared/webview/types.ts` (NEW)
```typescript
export enum WebviewProviderType {
  SIDEBAR = "sidebar",
  TAB = "tab",
}
```

**수정 파일 2**: `src/hosts/host-provider.ts`
- Line 1: `WebviewProviderType` import 추가
- Line 14: `WebviewProviderCreator` 타입 시그니처 변경
  ```typescript
  // Before: export type WebviewProviderCreator = () => WebviewProvider
  // After: export type WebviewProviderCreator = (providerType: WebviewProviderType) => WebviewProvider
  ```

**수정 파일 3**: `src/hosts/vscode/VscodeWebviewProvider.ts`
- Line 1: `WebviewProviderType` import 추가
- Line 25: `providerType` 필드 추가
- Line 28-31: Constructor 변경 (providerType 파라미터 추가)
- Line 33-36: `getWebviewUrl` 메서드로 변경 (이전 `getWebviewUri`)
- Line 41-63: `resolveWebviewView` 메서드 - `WebviewView | WebviewPanel` 지원
- Line 70-84: Visibility 이벤트 핸들링 - 두 타입 모두 지원

**수정 파일 4**: `src/extension.ts`
- Line 1: `WebviewProviderType` import 추가
- Line 380-389: `FocusChatInput` 명령 - `.show()` 메서드 타입 처리
  ```typescript
  if ("show" in webviewView) {
    webviewView.show()  // WebviewPanel
  } else {
    await vscode.commands.executeCommand("workbench.view.extension.cline-sidebar")  // WebviewView
  }
  ```
- Line 198: `createWebview` 함수 - `WebviewProviderType.TAB` 파라미터 전달

**수정 파일 5**: `src/common.ts`
- Line 1: `WebviewProviderType` import 추가
- Line 71: `createWebviewProvider(WebviewProviderType.SIDEBAR)` 호출

###  Test 파일 수정 ✅

**수정 파일 1**: `caret-src/__tests__/rule-priority.test.ts`
- Line 85: Controller constructor에 clientId 추가
  ```typescript
  controller = new Controller(context, "test-client-id")
  ```

**수정 파일 2**: `src/test/host-provider-test-utils.ts`
- Line 5-6: `WebviewProvider`, `WebviewProviderType` import 추가
- Line 27: Mock WebviewProviderCreator 시그니처 수정
  ```typescript
  (providerType: WebviewProviderType) => ({}) as WebviewProvider
  ```

### 8.3: 미완성 Caret 기능 비활성화 ✅

**문제**: `caretUserProfile` proto 필드 미구현으로 AccountView 컴파일 에러

**수정 파일**: `webview-ui/src/components/account/AccountView.tsx`
- Line 44: caretUser 기능 비활성화
  ```typescript
  const _caretUser = null // apiConfiguration?.caretUserProfile
  ```
- Line 54-55: 조건문 단순화 (caretUser 체크 제거)

**조치**: 추후 `proto/caret/account.proto`에 CaretUser 타입 정의 및 ModelsApiConfiguration에 필드 추가 필요

### DifyHandler 필드 누락 수정 ✅

**문제**: 이전 세션에서 추가된 DifyHandler 클래스에 필드 선언 누락

**수정 파일**: `src/core/api/providers/dify.ts`
- Line 74: `private options: DifyHandlerOptions` 필드 추가
- Line 78: `private currentTaskId: string | undefined` 필드 추가

###  Proto 재생성 ✅
- `npm run protos` 실행
- 216개 파일 포맷, 12개 파일 namespace 수정

### 빌드 결과 ✅
```
✅ Protos: 성공 (216 files formatted, 12 fixed)
✅ Backend compile: 0 errors (npx tsc --noEmit)
✅ Webview compile: 0 errors
✅ Lint: 0 errors (1129 files checked)
✅ Build: SUCCESS
```

**총 수정 파일**: 10개
- 새 파일 1개: `src/shared/webview/types.ts`
- Backend 6개: host-provider.ts, VscodeWebviewProvider.ts, extension.ts, common.ts, dify.ts, host-provider-test-utils.ts
- Test 1개: rule-priority.test.ts
- Webview 1개: AccountView.tsx

## 다음 단계
1. ✅ ~~Merge compilation errors 해결~~
2. 번역 파일 검증 (ko/en/ja/zh)
3. 런타임 테스트 (VS Code 실행)


--- 7차 피드백 이후 완료 확인 내용 --

  - 1.2. **웹뷰 에러 로그 분석 완료** ✅
     * **localhost:8097 에러**:
       ```
       The FetchEvent for "http://localhost:8097/" resulted in a network error response
       GET http://localhost:8097/ net::ERR_FAILED
       ```
       - **원인**: `WebviewProvider.ts` (line 124)에 `<script src="http://localhost:8097"></script>` 존재
       - Cline 원본 코드에 포함된 디버깅/개발 도구 스크립트로 추정
       - cline-latest에도 동일하게 존재 (line 124)
       - **판단**: 정상적인 동작. 해당 서비스가 실행 중이 아닐 때 발생하는 예상된 에러
       - **조치 불필요**: 기능에 영향 없음, Cline 원본 동작 유지
     * **Client ID not found 에러**:
       ```
       ExtensionStateContext.tsx:691 Client ID not found in window object
       ```
       - **원인**: `window.clineClientId`를 찾을 수 없음 (ExtensionStateContext.tsx line 678-693)
       - **근본 원인**: **1.1과 동일** - clientId 시스템 누락
       - caret-main: WebviewProvider가 clientId 생성 및 HTML에 주입 (line 192-198)
       - 현재 버전: clientId 시스템 완전 누락
       - focusChatInput subscription에 clientId 필요하지만 사용 불가
       - **조치**: 1.1의 clientId 시스템 이식으로 함께 해결됨

  - 1.4. 제공자 설정 클릭해도 다른 제공자가 보이지 않음
   - **5차 조치**: ApiOptions.tsx, ApiConfigurationSection.tsx 모두 caret-main과 동기화 확인
   - **5차 상태**: 프론트엔드 코드는 정상, 런타임 테스트 필요
   - **6차 피드백** : 동일함. 아무 리스트가 안나오는것으로보아서  	"showOnlyDefaultProvider": false 의 features-config.json의 처리가 제대로 안되는것 아닌가 추정
   - **7차 분석** ⚠️:
     * **feature-config.json 확인**:
       - `webview-ui/src/caret/shared/feature-config.json`: `showOnlyDefaultProvider: false` ✅
       - 설정 자체는 올바름
     * **ApiOptions.tsx 로직 확인**:
       - line 151-153: `if (!featureConfig) return []` - featureConfig 없으면 빈 배열 반환
       - line 211-215: `showOnlyDefaultProvider`가 true이면 기본 provider만 표시
       - `false`일 때는 모든 provider 표시해야 함
     * **caret-main과 차이점 발견**:
       - **caret-main** (line 98): `const { apiConfiguration, featureConfig } = useExtensionState()`
       - **현재 버전** (line 100, 103): `const { apiConfiguration } = useExtensionState()` + `const featureConfig = getCurrentFeatureConfig()`
       - caret-main: ExtensionState에서 featureConfig 동적 로딩
       - 현재: getCurrentFeatureConfig()로 정적 JSON import
     * **추정 원인**:
       - getCurrentFeatureConfig()가 undefined 반환 가능성
       - JSON import가 빌드/번들링 과정에서 실패
       - ExtensionState에 featureConfig가 없는 경우 fallback 없음
     * **필요 조치**:
       - ExtensionStateContext에 featureConfig 추가 필요 (caret-main 패턴)
       - 또는 getCurrentFeatureConfig() 정상 동작 확인 및 fallback 추가
       - 런타임 디버깅으로 featureConfig 값 확인 필요

  - **7차 수정** ✅:
    * **근본 원인**: 백엔드에서 featureConfig를 webview로 전달하지 않음
      - ExtensionMessage.ts에 featureConfig 필드는 존재 (line 108)
      - 하지만 Controller에서 featureConfig 로드 및 전달 누락
    * **수정 파일**: `src/core/controller/index.ts`
      - line 5: getCurrentFeatureConfig import 추가
      - line 37: Logger import 추가
      - line 743-744: getStateToPostToWebview()에서 featureConfig 로드 및 로깅
      - line 837: return 객체에 featureConfig 포함
    * **동작 방식**:
      - getCurrentFeatureConfig()로 feature-config.json 로드
      - Logger로 로드된 config 디버그 출력
      - ExtensionState에 featureConfig 포함하여 webview로 전달
      - frontend에서 useExtensionState()로 featureConfig 접근 가능
     - **8차 피드백** : 확인완료

- 2.1. ✅ **5차 수정** 첫 페이지의 로고는 계속 페르소나 이미지 아니고 앱로고 임. 페르소나 이미지여야함
   - **조치**: HomeHeader.tsx에 PersonaAvatar + useCaretState 통합 완료
   - **파일**: webview-ui/src/components/welcome/HomeHeader.tsx
   - **6차 피드백** : 확인 완료, 왜 다시 미확인 영역으로 올라갔지?
  
 - 2.3. ✅ **5차 수정** 하단 버튼 모두 번역 누락 : auto-apporove, enabled, 등
   - **조치**: auto-approve-menu/constants.ts를 caret-main 버전으로 교체 (getActionMetadata, getNotificationsSetting 함수 사용)
   - **조치**: AutoApproveBar.tsx를 caret-main 버전으로 교체 (i18n 및 useMemo 적용)
   - **파일**: webview-ui/src/components/chat/auto-approve-menu/constants.ts
   - **파일**: webview-ui/src/components/chat/auto-approve-menu/AutoApproveBar.tsx
   - **6차 피드백** : 확인 완료

 - 2.5. 하단 모델 버튼 눌러도 아무것도 뜨지 않음
   - **6차 피드백** : 동일함, 모델 설정 메뉴가 뜨지 않음
   - **7차 분석** ⚠️:
     * **ChatTextArea.tsx 확인**:
       - line 289-290: ExtensionState에서 showChatModelSelector 가져옴
       - line 1166: `setShowModelSelector(!showModelSelector)` - 토글 로직 정상
       - line 1774: `{showModelSelector && (` - 조건부 렌더링 정상
     * **caret-main과 차이점**:
       - **caret-main** (line 314): `const [showModelSelector, setShowModelSelector] = useState(false)` - 로컬 state
       - **현재** (line 289-290): ExtensionState에서 가져옴 - 글로벌 state
     * **ExtensionStateContext 확인**:
       - line 179: `const [showChatModelSelector, setShowChatModelSelector] = useState(false)` ✅
       - line 838-839: context에 포함 ✅
     * **추정 원인**:
       - 코드 구조는 정상적으로 보임
       - 실제 동작 실패 원인은 런타임 확인 필요
       - ExtensionState context가 제대로 전달되지 않을 가능성
       - React DevTools로 state 값 확인 필요
     * **필요 조치**:
       - 런타임 디버깅으로 showChatModelSelector 값 확인
       - 또는 caret-main 패턴으로 되돌려서 로컬 state 사용
     **8차 피드백** : 확인완료

### 3. 설정
 #### 탭 순서
 * ✅ **5차 수정** Cline에 맞춰 API설정 > 기능 > 브라우져 > 터미널 > 일반 > (디버그:캐럿은 릴리즈도 노출) > 정보 순으로 바뀌어야함. 동일하게 변경 할 것 (아이콘이 모두 상이함, Cline에 맞출것)
   - **조치**: SettingsView.tsx 탭 순서를 Cline upstream에 맞춤 (API > Features > Browser > Terminal > Debug > General > About)
   - **조치**: 아이콘도 Cline에 맞춤 (API Config: SlidersHorizontal, General: Wrench)
   - **파일**: webview-ui/src/components/settings/SettingsView.tsx
   - **6차 피드백** : 확인 완료

- 3.4. ✅ **5차 수정** enable dictation, enable auto compact, enable yolo mode 누락 모두 포함, 다국어 번역 추가 (캐럿의 f02 다국어 설정 규칙에 따라서 꼭 작성할 것)
   - **조치**: dictation 섹션 추가 (lines 171-222), YOLO 모드 섹션 추가 (lines 243-255)
   - **조치**: 영문/한글 i18n 번역 추가 (enableDictation, dictationLanguage, enableYoloMode)
   - **파일**: webview-ui/src/components/settings/sections/FeatureSettingsSection.tsx
   - **파일**: webview-ui/src/caret/locale/en/settings.json, webview-ui/src/caret/locale/ko/settings.json
   - **8차 피드백** : 7차에서 확인 완료된 사항인데, 해당 내용 삭제되고 다시 올려져 있음 

- 3.7. ✅ **5차 수정** 영문으로 나옴. 공지사항은 4개국어 번역 적용 필요
   - **5차 조치**: 2.2와 동일하게 Announcement i18n 업데이트로 해결
   - **6차 피드백**: 확인 완료



### 5. Open in Editor
 - 5.1. 에디터 오픈 : 동작하지 않음 Opening in new tab is not yet implemented 이라고 메시지 출력
   - **7차 분석 (Root Cause 발견)**:
     - **원인**: openClineInNewTab 함수가 placeholder 구현으로 남아있음
     - **caret-main 구현** (extension.ts:153-183):
       ```typescript
       const openClineInNewTab = async () => {
           Logger.log("Opening Caret in new tab")
           const tabWebview = HostProvider.get().createWebviewProvider(WebviewProviderType.TAB) as VscodeWebviewProvider
           const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0))

           const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0
           if (!hasVisibleEditors) {
               await vscode.commands.executeCommand("workbench.action.newGroupRight")
           }
           const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two

           const panel = vscode.window.createWebviewPanel(VscodeWebviewProvider.TAB_PANEL_ID, "Caret", targetCol, {
               enableScripts: true,
               retainContextWhenHidden: true,
               localResourceRoots: [context.extensionUri],
           })
           panel.iconPath = {
               light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "robot_panel_light.png"),
               dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "robot_panel_dark.png"),
           }
           tabWebview.resolveWebviewView(panel)

           await setTimeoutPromise(100)
           await vscode.commands.executeCommand("workbench.action.lockEditorGroup")
           return tabWebview
       }
       ```
     - **현재 버전 문제** (extension.ts:116-119):
       ```typescript
       const openClineInNewTab = async () => {
           Logger.log("Opening Caret in new tab - feature not yet implemented")
           await vscode.window.showInformationMessage("Opening in new tab is not yet implemented")
       }
       ```
       - 완전한 placeholder 구현
       - WebviewPanel 생성 로직 완전 누락
     - **근본 원인**: Cline upstream 머징 시 openClineInNewTab 구현 코드 손실
     - **필요 조치**:
       1. caret-main extension.ts:153-183 전체 구현 복사
       2. HostProvider, VscodeWebviewProvider, WebviewProviderType import 확인
    - **8차 피드백** : 확인 완료


### 6. 히스토리
 - 6.1. 페이지내의 i18n 번역 누락
   - **7차 분석 (Root Cause 발견)**:
     - **원인**: i18n import 및 t() 함수 호출 완전 제거됨
     - **caret-main 구현** (HistoryView.tsx:7, 326+):
       ```typescript
       import { t } from "@/caret/utils/i18n"
       // ...
       {t("history.title", "history")}
       {t("history.fuzzySearchPlaceholder", "history")}
       {t("history.sortNewest", "history")}
       {t("history.filterWorkspace", "history")}
       {t("history.tokensLabel", "history")}
       // ... 20+ t() 호출
       ```
     - **현재 버전 문제** (HistoryView.tsx:343, 373-378, 383, 389):
       ```typescript
       // i18n import 완전 제거됨 (line 7)
       placeholder="Fuzzy search history..."  // 하드코딩
       <VSCodeRadio value="newest">Newest</VSCodeRadio>  // 하드코딩
       label="Workspace"  // 하드코딩
       label="Favorites"  // 하드코딩
       // ... 모든 문자열 하드코딩
       ```
     - **누락된 번역 키** (caret-main 기준 20+ 항목):
       - history.title, history.fuzzySearchPlaceholder, history.clearSearch
       - history.sortNewest, history.sortOldest, history.sortMostExpensive, history.sortMostTokens, history.sortMostRelevant
       - history.filterWorkspace, history.filterFavorites
       - history.selectAll, history.selectNone
       - history.tokensLabel, history.cacheLabel, history.apiCostLabel
       - history.deleteSelectedWithCount, history.deleteAllHistory
       - buttons.done (settings 네임스페이스)
     - **근본 원인**: Cline upstream 머징 시 i18n import 및 모든 t() 호출 손실
     - **필요 조치**:
       1. import { t } from "@/caret/utils/i18n" 추가
       2. 모든 하드코딩 문자열을 t() 함수로 교체
       3. caret-main HistoryView.tsx:326-721 참고
       4. 번역 파일 작성 (ko/history.json, en/history.json, ja/history.json, zh/history.json) 
     **8차 피드백** : 확인완료

### 7. MCP
 - 7.1. 페이지내의 i18n 번역 누락
   - **7차 분석 (Root Cause 발견)**:
     - **원인**: i18n import 및 t() 함수 호출 제거됨
     - **caret-main 구현** (McpConfigurationView.tsx:9, 79+):
       ```typescript
       import { t } from "@/caret/utils/i18n"
       // ...
       <h3>{t("mcpConfigurationView.mcpServers", "chat")}</h3>
       <VSCodeButton onClick={onDone}>{t("mcpConfigurationView.done", "chat")}</VSCodeButton>
       {t("mcpConfigurationView.marketplace", "chat")}
       {t("mcpConfigurationView.remoteServers", "chat")}
       {t("mcpConfigurationView.installed", "chat")}
       ```
     - **현재 버전 문제** (McpConfigurationView.tsx:78-100):
       ```typescript
       // i18n import 없음
       <h3>MCP Servers</h3>  // 하드코딩
       <VSCodeButton onClick={onDone}>Done</VSCodeButton>  // 하드코딩
       Marketplace  // 하드코딩
       Remote Servers  // 하드코딩
       Configure  // 하드코딩
       ```
     - **누락된 번역 키**:
       - mcpConfigurationView.mcpServers, mcpConfigurationView.done
       - mcpConfigurationView.marketplace, mcpConfigurationView.remoteServers
       - mcpConfigurationView.installed (현재 "Configure"로 변경됨)
       - 기타 MCP 하위 컴포넌트들 (ConfigureServersView, McpMarketplaceView 등) 추가 확인 필요
     - **근본 원인**: Cline upstream 머징 시 i18n import 및 t() 호출 손실 (히스토리와 동일 패턴)
     - **필요 조치**:
       1. import { t } from "@/caret/utils/i18n" 추가
       2. 모든 하드코딩 문자열을 t() 함수로 교체
       3. caret-main McpConfigurationView.tsx 참고
       4. MCP 하위 컴포넌트들도 동일 작업 필요
       5. 번역 파일 작성 (ko/chat.json, en/chat.json 등에 mcp 관련 키 추가)

 - 7.2 아래의 warning이 문제 없는지 확인
   - **7차 분석**:
     - **원인**: McpMarketplaceCard.tsx에서 <a> 태그 중첩
     - **문제 코드** (McpMarketplaceCard.tsx:52, 148):
       ```typescript
       <a className="mcp-card" href={item.githubUrl}>  // 외부 <a>
           {/* ... */}
           <a className="github-link" href={githubAuthorUrl}>  // 내부 <a> - 중첩!
               {/* ... */}
           </a>
       </a>
       ```
     - **영향**: HTML 스펙 위반 (a 태그는 interactive content를 자식으로 가질 수 없음)
     - **해결 방법**:
       1. 외부 <a>를 <div>로 변경하고 onClick으로 navigation 처리
       2. 또는 내부 <a>를 <button>이나 <span>으로 변경
       3. stopPropagation()으로 이벤트 버블링 방지
     - **심각도**: 낮음 (기능적으로는 작동하나 HTML 스펙 위반)

 chunk-RO7O33BN.js?v=60436dcb:521 Warning: validateDOMNesting(...): <a> cannot appear as a descendant of <a>.
    at a
    at div
    at div
    at div
    at a
    at McpMarketplaceCard (http://localhost:25463/src/components/mcp/configuration/tabs/marketplace/McpMarketplaceCard.tsx:27:31)
    at div
    at div
    at McpMarketplaceView (http://localhost:25463/src/components/mcp/configuration/tabs/marketplace/McpMarketplaceView.tsx:31:100)
    at div
    at div
    at div
    at McpConfigurationView (http://localhost:25463/src/components/mcp/configuration/McpConfigurationView.tsx:32:33)
    at div
    at AppContent (http://localhost:25463/src/App.tsx:40:284)
    at CaretStateContextProvider (http://localhost:25463/src/caret/context/CaretStateContext.tsx:29:45)
    at CaretI18nProvider (http://localhost:25463/src/caret/context/CaretI18nContext.tsx:28:37)
    at div
    at $f57aed4a881a3485$var$OverlayContainerDOM (http://localhost:25463/node_modules/.vite/deps/chunk-P3B3QBVA.js?v=60436dcb:10912:32)
    at $f57aed4a881a3485$export$178405afcd8c5eb (http://localhost:25463/node_modules/.vite/deps/chunk-P3B3QBVA.js?v=60436dcb:10881:9)
    at $f57aed4a881a3485$export$bf688221f59024e5
    at MotionConfig (http://localhost:25463/node_modules/.vite/deps/chunk-GKXUNWRT.js?v=60436dcb:4715:25)
    at $18f2051aff69b9bf$var$I18nProviderWithLocale (http://localhost:25463/node_modules/.vite/deps/chunk-P3B3QBVA.js?v=60436dcb:531:9)
    at $18f2051aff69b9bf$export$a54013f0d02a8f82 (http://localhost:25463/node_modules/.vite/deps/chunk-P3B3QBVA.js?v=60436dcb:550:9)
    at HeroUIProvider (http://localhost:25463/node_modules/.vite/deps/chunk-P3B3QBVA.js?v=60436dcb:11401:3)
    at ClineAuthProvider (http://localhost:25463/src/context/ClineAuthContext.tsx:27:37)
    at PostHogProvider (http://localhost:25463/node_modules/.vite/deps/posthog-js_react.js?v=60436dcb:45:21)
    at CustomPostHogProvider (http://localhost:25463/src/CustomPostHogProvider.tsx:27:41)
    at ExtensionStateContextProvider (http://localhost:25463/src/context/ExtensionStateContext.tsx:41:49)
    at Providers (http://localhost:25463/src/Providers.tsx:25:29)
    at App
       **8차 피드백** : 확인완료
f