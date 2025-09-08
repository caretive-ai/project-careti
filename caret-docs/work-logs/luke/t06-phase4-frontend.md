# t06 - Phase 4: 프론트엔드 통합 및 E2E 검증

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
- [ ] **테스트 파일 생성**: `webview-ui/src/caret/components/__tests__/PromptSystemSwitcher.e2e.test.tsx` 파일 생성.
- [ ] **E2E 테스트 시나리오 작성:**
    - [ ] **(시나리오 1: 모드 전환)**
        - [ ] 초기 상태('Cline' 모드)에서 생성된 프롬프트에 "ACT MODE"가 포함되는지 검증.
        - [ ] UI에서 'Caret' 모드로 변경하는 이벤트를 시뮬레이션.
        - [ ] `vscode.postMessage`로 `{ type: 'promptSystem/setMode', payload: 'caret' }` 메시지가 전송되는지 검증.
        - [ ] 백엔드 `workspaceState`가 `'caret'`으로 업데이트되었음을 가정하고, 이후 생성되는 프롬프트에 "AGENT MODE"가 포함되고 "ACT MODE"는 포함되지 않는지 검증.
    - [ ] **(시나리오 2: 설정 영속성)**
        - [ ] 'Caret' 모드로 설정 후, 확장 프로그램 재시작을 시뮬레이션.
        - [ ] 재시작 후에도 별도 조작 없이 생성된 프롬프트에 "AGENT MODE"가 포함되는지 검증.

### 3.2. [GREEN] 프론트엔드 UI 및 로직 구현
- [ ] **UI 컴포넌트 생성**: `webview-ui/src/caret/components/PromptSystemSwitcher.tsx` 파일 생성.
    - [ ] `select` 또는 토글 스위치를 사용하여 'Caret'과 'Cline' 모드를 선택할 수 있는 UI 구현.
    - [ ] 현재 선택된 모드를 `ExtensionStateContext`로부터 받아와 표시.
    - [ ] 모드 변경 시 `vscode.postMessage`를 호출하여 백엔드에 알림.
- [ ] **설정 페이지 통합**:
    - [ ] `webview-ui/src/components/settings/SettingsView.tsx` 파일 수정.
    - [ ] `// CARET MODIFICATION` 주석과 함께 `PromptSystemSwitcher` 컴포넌트를 적절한 위치에 추가.

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
- [ ] **컨트롤러 생성**: `caret-src/controllers/PromptSystemController.ts` 파일 생성.
    - [ ] `handleSetMode(mode: 'caret' | 'cline')` 메서드 구현.
    - [ ] 이 메서드는 `workspaceState.update('caret.promptSystem.mode', mode)`를 호출하여 설정을 영속적으로 저장.
    - [ ] `PromptSystemManager.getInstance().switchMode(mode)`를 호출하여 실제 프롬프트 시스템을 전환.
    - [ ] 성공 시 `webview.postMessage({ type: 'promptSystem/modeState', payload: { currentMode: mode, isInitialized: true } })`로 UI 업데이트
- [ ] **`extension.ts` 연동:**
    - [ ] `activate` 함수 내에서 `PromptSystemController`를 인스턴스화.
    - [ ] `webviewProvider.onMessage('promptSystem/setMode', ...)`를 통해 메시지 핸들러 등록.
    - [ ] 확장 프로그램 시작 시, `workspaceState.get('caret.promptSystem.mode', 'cline')`을 읽어와 `PromptSystemManager`의 초기 모드를 설정하는 로직 추가.
    - [ ] 초기 모드 설정 후 `webview.postMessage`로 프론트엔드에 현재 상태 알림

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
