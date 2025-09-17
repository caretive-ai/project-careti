# t06 - Phase 4: 프론트엔드 통합 및 E2E 검증



-- 아래는 백엔드 로그 --


TaskService","method":"askResponse","message":{"responseType":"messageResponse","text":"지금은 무슨 모드인데 ?","images":[],"files":[]},"request_id":"acc5835d-5dfc-424a-b478-945f25835052","is_streaming":false}}
DEBUG [CaretProviderWrapper] Processing message type: grpc_request
DEBUG [CaretProviderWrapper] Passing message to Cline: grpc_request
DEBUG [CARET] Rules path: C:\Users\Luke(양병석)\Desktop\.caretrules
DEBUG [CARET] Current toggles: {}
DEBUG [CARET] Updated toggles: {}
DEBUG [WINDSURF] Rules path: C:\Users\Luke(양병석)\Desktop\.windsurfrules
DEBUG [WINDSURF] Current toggles: {}
DEBUG [WINDSURF] Updated toggles: {}
DEBUG [CURSOR] Rules path (dir): C:\Users\Luke(양병석)\Desktop\.cursor\rules
DEBUG [CURSOR] Current toggles: {}
DEBUG [CURSOR] Rules path (file): C:\Users\Luke(양병석)\Desktop\.cursorrules
DEBUG [CURSOR] Combined toggles: {}
DEBUG [CARET] FINAL - returning toggles: {}
DEBUG [WINDSURF] FINAL - returning toggles: {}
DEBUG [CURSOR] FINAL - returning toggles: {}
DEBUG [getSystemPrompt] Current mode: caret
DEBUG [getSystemPrompt] Using Caret PromptSystemManager for AGENT MODE
DEBUG [PromptSystemManager] Using adapter: caret
DEBUG [CaretProviderWrapper] Received message: {"type":"grpc_request","grpc_request":{"service":"cline.StateService","method":"togglePlanActModeProto","message":{"mode":1,"chatContent":{"images":[],"files":[]}},"request_id":"a1784915-5835-49f5-8442-cd29c98d969e","is_streaming":false}}
DEBUG [CaretProviderWrapper] Processing message type: grpc_request
DEBUG [CaretProviderWrapper] Passing message to Cline: grpc_request
DEBUG [CARET] Rules path: C:\Users\Luke(양병석)\Desktop\.caretrules
DEBUG [CARET] Current toggles: {}
DEBUG [CARET] Updated toggles: {}
DEBUG [WINDSURF] Rules path: C:\Users\Luke(양병석)\Desktop\.windsurfrules
DEBUG [WINDSURF] Current toggles: {}
DEBUG [WINDSURF] Updated toggles: {}
DEBUG [CURSOR] Rules path (dir): C:\Users\Luke(양병석)\Desktop\.cursor\rules
DEBUG [CURSOR] Current toggles: {}
DEBUG [CURSOR] Rules path (file): C:\Users\Luke(양병석)\Desktop\.cursorrules
DEBUG [CURSOR] Combined toggles: {}
DEBUG [CARET] FINAL - returning toggles: {}
DEBUG [WINDSURF] FINAL - returning toggles: {}
DEBUG [CURSOR] FINAL - returning toggles: {}
DEBUG [getSystemPrompt] Current mode: caret
DEBUG [getSystemPrompt] Using Caret PromptSystemManager for AGENT MODE
DEBUG [PromptSystemManager] Using adapter: caret

## 루크 피드백 (2025-09-08 20:56)
- Caret 모드에서 초기화 실패 오류 노출 (챗봇 모드, 에이전트 모드 동일, 현재 cline의 plan, act모드는 정상 동작 확인하였음)
 * 아래는 챗봇 모드에서 메시지 보냈을때 나온 로그
 
 -- 프론트 로그
 [ChatView] handleSendMessage - Sending message: 무슨 모드야 ?
ExtensionStateContext.tsx:422 [DEBUG] returning new state in ESC
ExtensionStateContext.tsx:431 [DEBUG] ended "got subscribed state"
ExtensionStateContext.tsx:422 [DEBUG] returning new state in ESC
ExtensionStateContext.tsx:431 [DEBUG] ended "got subscribed state"
ExtensionStateContext.tsx:422 [DEBUG] returning new state in ESC
ExtensionStateContext.tsx:431 [DEBUG] ended "got subscribed state"
workbench.desktop.main.js:55   ERR [Extension Host] [ErrorService] Logging Error: JsonTemplateLoader has not been initialized. Call initialize() first.
	at _ClineError.transform (d:\dev\caret-merge\dist\extension.js:437664:18)
	at ErrorService.toClineError (d:\dev\caret-merge\dist\extension.js:437743:40)
	at Task.recursivelyMakeClineRequests (d:\dev\caret-merge\dist\extension.js:886946:47)
	at async Task.initiateTaskLoop (d:\dev\caret-merge\dist\extension.js:886052:30)
	at async Task.resumeTaskFromHistory (d:\dev\caret-merge\dist\extension.js:886046:9)
workbench.desktop.main.js:4784 [Extension Host] [ErrorService] Logging Error: JsonTemplateLoader has not been initialized. Call initialize() first.
	at _ClineError.transform (d:\dev\caret-merge\dist\extension.js:437664:18)
	at ErrorService.toClineError (d:\dev\caret-merge\dist\extension.js:437743:40)
	at Task.recursivelyMakeClineRequests (d:\dev\caret-merge\dist\extension.js:886946:47)
	at async Task.initiateTaskLoop (d:\dev\caret-merge\dist\extension.js:886052:30)
	at async Task.resumeTaskFromHistory (d:\dev\caret-merge\dist\extension.js:886046:9) (at console.<anonymous> (file:///c:/Users/Luke(%EC%96%91%EB%B3%91%EC%84%9D)/AppData/Local/Programs/c…/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:200:31986))
workbench.desktop.main.js:55   ERR [Extension Host] Error setting up file subscription: Error: ENOENT: no such file or directory, watch 'c:\Users\Luke(양병석)\AppData\Roaming\Cursor\User\globalStorage\caretive.caret\tasks\1757332446552\focus_chain_taskid_1757332446552.md'
workbench.desktop.main.js:4784 [Extension Host] Error setting up file subscription: Error: ENOENT: no such file or directory, watch 'c:\Users\Luke(양병석)\AppData\Roaming\Cursor\User\globalStorage\caretive.caret\tasks\1757332446552\focus_chain_taskid_1757332446552.md' (at console.<anonymous> (file:///c:/Users/Luke(%EC%96%91%EB%B3%91%EC%84%9D)/AppData/Local/Programs/c…/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:200:31986))
ExtensionStateContext.tsx:422 [DEBUG] returning new state in ESC
ExtensionStateContext.tsx:431 [DEBUG] ended "got subscribed state"
ExtensionStateContext.tsx:422 [DEBUG] returning new state in ESC
ExtensionStateContext.tsx:431 [DEBUG] ended "got subscribed state"
workbench.desktop.main.js:55  WARN [mainThreadStorage] large extension state detected (extensionId: caretive.caret, global: true): 1332.716796875kb. Consider to use 'storageUri' or 'globalStorageUri' to store this data on disk instead.
ExtensionStateContext.tsx:422 [DEBUG] returning new state in ESC
ExtensionStateContext.tsx:431 [DEBUG] ended "got subscribed state"
﻿
--- 백엔드 로그
DEBUG [CaretProviderWrapper] Received message: {"type":"grpc_request","grpc_request":{"service":"cline.TaskService","method":"askResponse","message":{"responseType":"messageResponse","text":"무슨 모드야 ?","images":[],"files":[]},"request_id":"38684bed-b6f5-4843-9fe9-cf9054d2691a","is_streaming":false}}
DEBUG [CaretProviderWrapper] Processing message type: grpc_request
DEBUG [CaretProviderWrapper] Passing message to Cline: grpc_request
DEBUG [CARET] Rules path: C:\Users\Luke(양병석)\Desktop\.caretrules
DEBUG [CARET] Current toggles: {}
DEBUG [CARET] Updated toggles: {}
DEBUG [WINDSURF] Rules path: C:\Users\Luke(양병석)\Desktop\.windsurfrules
DEBUG [WINDSURF] Current toggles: {}
DEBUG [WINDSURF] Updated toggles: {}
DEBUG [CURSOR] Rules path (dir): C:\Users\Luke(양병석)\Desktop\.cursor\rules
DEBUG [CURSOR] Current toggles: {}
DEBUG [CURSOR] Rules path (file): C:\Users\Luke(양병석)\Desktop\.cursorrules
DEBUG [CURSOR] Combined toggles: {}
DEBUG [CARET] FINAL - returning toggles: {}
DEBUG [WINDSURF] FINAL - returning toggles: {}
DEBUG [CURSOR] FINAL - returning toggles: {}
DEBUG [getSystemPrompt] Current mode: caret
DEBUG [getSystemPrompt] Using Caret PromptSystemManager for AGENT MODE
DEBUG [PromptSystemManager] Using adapter: caret


-- 


## 🚧 추가 작업 필요 (2025-09-08 19:30)

### 1. Plan/Act 버튼 다국어 수정
**문제**: Plan/Act 모드 토글 버튼에서 다국어 네임스페이스와 JSON 키가 틀려서 i18n 키가 그대로 노출됨
- **참고 문서**: `caret-docs/features/f02-multilingual-i18n.mdx`
- **해결 방법**: 올바른 네임스페이스와 JSON 키 매핑 수정 필요

### 2. Caret 모드 시 하단 버튼 변경
**문제**: Caret 토글 활성화 시 하단 Plan/Act 버튼이 Chatbot/Agent 모드 버튼으로 변경되어야 함
- **현재 상태**: cline-merge에 미구현 (caret-main에는 구현됨)
- **구현 필요**: caret-main 참고하여 모드별 하단 버튼 전환 로직 구현

---

## ✅ 앱 기본값 및 UI 동기화 문제 해결 완료 (2025-09-08 19:25)

### 🎯 해결된 문제들
1. **앱 첫 설치 시 기본값 불일치**
   - `extension.ts`: workspaceState 기본값 `'cline'` → `'caret'`
   - `ExtensionStateContext.tsx`: enablePersonaSystem 기본값 `false` → `true`

2. **UI 상태 동기화 실패**
   - `ModeSystemToggle.tsx`: gRPC 응답 후 `setModeSystem()` 호출 추가
   - `ExtensionStateContext.tsx`: 앱 시작 시 백엔드 모드 동기화 useEffect 추가

3. **완전 초기화 기능 구현**
   - `resetWorkspaceState()`: Caret 기본값 복원 로직 추가
   - `resetGlobalState()`: 전역 상태도 Caret 기본값으로 초기화
   - `SettingsView.tsx`: localStorage 초기화 + 페이지 리로드

### 📝 상세 수정 내용
- **백엔드**: `state-helpers.ts`, `resetState.ts` - CaretGlobalManager 재초기화
- **프론트엔드**: 앱 시작 시 `GetPromptSystemMode()` 호출로 상태 동기화
- **설정 디버그**: "완전 초기화" 버튼으로 모든 Caret 설정을 기본값으로 복원

---

## ✅ 네임스페이스 및 gRPC 통신 문제 해결 완료 (2025-09-08 18:50)

### 🔧 해결된 네임스페이스 문제
1. **Proto 생성 스크립트 수정**
   - `caret-scripts/build/generate-protobus-setup.mjs`: `CaretSystemService`도 `caret` 네임스페이스 처리
   - `caret-scripts/build/build-proto.mjs`: webview-ui 파일 후처리 추가

2. **gRPC 클라이언트 수정**
   - `webview-ui/src/services/grpc-client.ts`: `"cline.CaretSystemService"` → `"caret.CaretSystemService"`
   - Request/Response 타입도 모두 `caret.*` 네임스페이스로 정상 생성

3. **에러 해결**
   - `Unknown service: cline.CaretSystemService` → 완전 해결
   - Proto 컴파일 및 TypeScript 컴파일 모두 성공

---

## ✅ gRPC 기반 프롬프트 시스템 구현 완료 (2025-09-08 18:20)

### 🎯 최종 구현 결과
**완전한 gRPC 기반 프롬프트 시스템 전환 기능 구현 완료**

### 📝 구현 요약
**핵심 아키텍처**:
1. **gRPC 서비스 정의** - `proto/caret/system.proto`
   - `CaretSystemService.SetPromptSystemMode` / `GetPromptSystemMode` 서비스
   - Frontend-Backend 통신을 완전히 gRPC로 변경
   - Cline 코드 수정 없이 Level 1 독립 모듈 구현

2. **백엔드 gRPC 핸들러** - `src/core/controller/caretSystem/`
   - `SetPromptSystemMode.ts` - 모드 변경, workspaceState 저장
   - `GetPromptSystemMode.ts` - 현재 모드 조회
   - `CaretGlobalManager` 연동으로 실시간 상태 관리

3. **프롬프트 시스템 분기** - `src/core/prompts/system-prompt/index.ts` (CARET MODIFICATION)
   - `CaretGlobalManager.currentMode` 기반 Option 4 분기 로직
   - `caret` 모드: `PromptSystemManager` + `CaretJsonAdapter` (AGENT MODE)
   - `cline` 모드: 기존 `PromptRegistry` (ACT MODE)

4. **프론트엔드 gRPC 클라이언트** - `ModeSystemToggle.tsx`
   - `vscode.postMessage` 완전 제거
   - `CaretSystemServiceClient.SetPromptSystemMode` gRPC 호출
   - 실시간 UI 업데이트 및 에러 처리

5. **개발 가이드 확립** - `CLAUDE.md`
   - **"Frontend-Backend는 반드시 gRPC 사용"** 원칙 명시
   - Cline 최소 침습 원칙 준수 가이드라인 제공

### ✅ 구현 검증 완료
- [x] **gRPC Proto 컴파일**: snake_case ↔ camelCase 변환 처리 완료
- [x] **TypeScript 컴파일**: `npm run compile` 성공
- [x] **네임스페이스 처리**: `caret.*` 네임스페이스 정상 생성
- [x] **Cline 코드 보존**: Level 1 독립 모듈로 구현하여 Cline 무손상
- [ ] **E2E 테스트**: F5 실행하여 AGENT MODE ↔ ACT MODE 전환 확인 필요

### 🔧 핵심 구현 원칙
- **Level 1 독립성**: 모든 Caret 기능은 `caret-src/`, `proto/caret/` 내 구현
- **gRPC 통신**: Frontend-Backend 통신은 100% gRPC 프로토콜 사용
- **안전한 분기**: try-catch + fallback으로 Cline 기본 동작 보장
- **실시간 동기화**: `CaretGlobalManager` + `workspaceState` 영속성 확보

## 1. 📜 Caret 개발 원칙

이 작업은 다음의 Caret 핵심 개발 원칙을 반드시 준수해야 합니다.

*   **품질 우선**: 속도보다 정확성을 우선하며, 기술 부채를 남기지 않습니다.
*   **TDD 필수**: 모든 기능은 `RED -> GREEN -> REFACTOR` 사이클을 따르며, 통합 테스트를 우선합니다.
*   **검증 필요**: 모든 변경 후에는 `Test -> Compile -> Execute`의 검증 절차를 거칩니다.
*   **L1 독립 모듈 선호**: `caret-src/` 내의 독립적인 모듈 구현을 최우선으로 하여 Cline 원본 코드 수정을 최소화합니다.

---

## 2. 🎯 Phase 목표

사용자가 VSCode 설정 UI를 통해 **'Caret 하이브리드 시스템'**과 **'Cline 순정 시스템'**을 실시간으로 전환할 수 있는 완전한 기능을 구현한다. 이 모든 과정은 E2E(End-to-End) 테스트를 통해 철저히 검증하며, 사용자의 선택이 확장 프로그램을 재시작해도 유지되도록 **설정 영속성**을 확보한다.

---

## 3. ✅ 상세 작업 체크리스트

### 3.1. [RED] E2E 테스트 우선 작성
- [x] **테스트 파일 생성**: `webview-ui/src/caret/components/__tests__/PromptSystemSwitcher.e2e.test.tsx` 파일 생성.
- [x] **E2E 테스트 시나리오 작성:**
    - [x] **(시나리오 1: 모드 전환)**
        - [x] 초기 상태('Cline' 모드)에서 생성된 프롬프트에 "ACT MODE"가 포함되는지 검증 (lines 57-58).
        - [x] UI에서 'Caret' 모드로 변경하는 이벤트를 시뮬레이션 (line 61).
        - [x] `vscode.postMessage`로 `{ type: 'promptSystem/setMode', payload: 'caret' }` 메시지가 전송되는지 검증 (lines 64-69).
        - [x] 백엔드 `workspaceState`가 `'caret'`으로 업데이트되었음을 가정하고, 이후 생성되는 프롬프트에 "AGENT MODE"가 포함되고 "ACT MODE"는 포함되지 않는지 검증 (lines 75-77).
    - [x] **(시나리오 2: 설정 영속성)**
        - [x] 'Caret' 모드로 설정 후, 확장 프로그램 재시작을 시뮬레이션 (lines 82-83, 98-100).
        - [x] 재시작 후에도 별도 조작 없이 생성된 프롬프트에 "AGENT MODE"가 포함되는지 검증 (lines 86-87, 102-103).

### 3.2. [GREEN] 프론트엔드 UI 및 로직 구현
- [x] **UI 컴포넌트 생성**: `webview-ui/src/caret/components/PromptSystemSwitcher.tsx` 파일 생성.
    - [x] `select` 또는 토글 스위치를 사용하여 'Caret'과 'Cline' 모드를 선택할 수 있는 UI 구현.
    - [x] 현재 선택된 모드를 `ExtensionStateContext`로부터 받아와 표시.
    - [x] 모드 변경 시 `vscode.postMessage`를 호출하여 백엔드에 알림.
- [x] **설정 페이지 통합**:
    - [x] **구조**: `SettingsView.tsx` → `GeneralSettingsSection.tsx` → `CaretGeneralSettingsSection.tsx` → `PromptSystemSwitcher` 컴포넌트 렌더링 구조로 통합됨.
    - [x] `webview-ui/src/caret/components/CaretGeneralSettingsSection.tsx` 파일에서 `PromptSystemSwitcher` 컴포넌트가 line 10에서 import되고 lines 32-34에서 렌더링됨.
    - [x] `// CARET MODIFICATION` 주석과 함께 적절한 위치에 통합 완료.

### 3.3. [GREEN] 백엔드 컨트롤러 및 연동 구현
- [ ] **메시지 프로토콜 정의**: 프론트엔드-백엔드 간 통신 인터페이스 명확화
    ```typescript
    // 프론트엔드 → 백엔드
    interface PromptSystemSetModeMessage {
        type: 'promptSystem/setMode'
        payload: 'caret' | 'cline'
    }
    
    // 백엔드 → 프론트엔드  
    interface PromptSystemModeStateMessage {
        type: 'promptSystem/modeState'
        payload: {
            currentMode: 'caret' | 'cline'
            isInitialized: boolean
        }
    }
    ```
- [x] **컨트롤러 생성**: `caret-src/controllers/PromptSystemController.ts` 파일 생성.
    - [x] `handleSetMode(mode: 'caret' | 'cline')` 메서드 구현 (lines 15-36).
    - [x] 이 메서드는 `workspaceState.update('caret.promptSystem.mode', mode)`를 호출하여 설정을 영속적으로 저장 (line 20).
    - [x] 성공 시 `webview.postMessage({ type: 'promptSystem/modeState', payload: { currentMode: mode, isInitialized: true } })`로 UI 업데이트 (lines 22-28).
    - [x] `initialize` 정적 메서드로 초기화 로직 구현 (lines 38-51).
- [x] **`extension.ts` 연동:**
    - [x] `activate` 함수 내에서 `PromptSystemController`를 인스턴스화 (line 63).
    - [x] `webviewProvider.onMessage('promptSystem/setMode', ...)`를 통해 메시지 핸들러 등록 (lines 64-68).
    - [x] 확장 프로그램 시작 시, `PromptSystemController.initialize`를 통해 초기 상태 설정 (lines 70-72).
    - [x] 초기 모드 설정 후 `webview.postMessage`로 프론트엔드에 현재 상태 알림 (`initialize` 메서드 내에서 처리)

### 3.4. [VERIFY] 최종 검증
- [ ] `npm run test:webview`를 실행하여 작성한 E2E 테스트가 모두 통과하는지 확인.
- [ ] F5로 확장 프로그램을 실행하여 다음 시나리오를 수동으로 최종 검증:
    - [ ] 설정 페이지에서 모드 전환이 잘 동작하는가?
    - [ ] 모드 전환 후 새 채팅을 시작하면 해당 모드의 프롬프트(AGENT MODE vs ACT MODE)가 적용되는가?
    - [ ] VSCode 창을 닫았다가 다시 열어도(확장 프로그램 재시작) 이전에 선택한 모드가 유지되는가?

### 3.5. 🚨 필수: 사용자 검증 및 커밋 절차
**⚠️ 구현 완료 후 반드시 다음 순서로 진행:**

1. **사용자/다른 AI에게 검증 요청**:
   ```
   "Phase 4 구현이 완료되었습니다. 다음을 검증해 주세요:
   - 프론트엔드 설정 UI에서 프롬프트 시스템 모드 전환이 올바르게 동작하는지
   - 모드 설정이 workspaceState에 영속적으로 저장되는지
   - 백엔드 연동이 정상적으로 작동하여 실제 프롬프트 시스템이 전환되는지
   - E2E 테스트와 수동 검증이 모두 통과하는지"
   ```

2. **사용자 최종 확인 후 Git 체크포인트**:
   - [ ] Phase 4 완료 시 커밋: `git commit -m "feat: Complete Phase 4 - Frontend integration and user interface"`
   - [ ] 검증 완료 시 태그: `git tag -a "t06-phase-4" -m "Phase 4 verification complete"`
   - [ ] 사용자 확인 요청 후 푸시: `git push origin merge-v326-08292807 --follow-tags`
   - [ ] Phase 5 시작 전 백업 브랜치: `git branch t06-phase-4-backup`

---

## 4. 🏁 완료 기준

- [ ] 프론트엔드 UI를 통한 실시간 프롬프트 시스템 모드 전환 기능이 E2E 테스트와 수동 검증을 모두 100% 통과함.
- [ ] 모드 설정이 `workspaceState`에 영속적으로 저장되어 확장 프로그램을 재시작해도 유지됨.
- [ ] `npm run compile` 및 `npm run test:all` 실행 시 관련된 새로운 오류가 발생하지 않음.
- [ ] Phase 5를 시작하기 위한 모든 프론트엔드-백엔드 통합 작업이 완료됨.
