# t06 - Phase 2: 어댑터 뼈대 구축 및 핵심 철학 이식

## 1. 📜 Caret 개발 원칙

이 작업은 다음의 Caret 핵심 개발 원칙을 반드시 준수해야 합니다.

*   **품질 우선**: 속도보다 정확성을 우선하며, 기술 부채를 남기지 않습니다.
*   **TDD 필수**: 모든 기능은 `RED -> GREEN -> REFACTOR` 사이클을 따르며, 통합 테스트를 우선합니다.
*   **검증 필요**: 모든 변경 후에는 `Test -> Compile -> Execute`의 검증 절차를 거칩니다.
*   **L1 독립 모듈 선호**: `caret-src/` 내의 독립적인 모듈 구현을 최우선으로 하여 Cline 원본 코드 수정을 최소화합니다.

---

## 2. 🎯 Phase 목표

`CaretJsonComponentProvider` 어댑터와 `PromptSystemManager` 전략 관리자의 핵심 뼈대를 TDD(테스트 주도 개발) 방식으로 구축한다. 특히, `cline-latest`의 기술적 상태 구분(`Act/Plan`)을 Caret의 행동 철학(`CHATBOT/AGENT`)으로 성공적으로 대체하여, 하이브리드 시스템의 기술적 가능성을 완벽하게 검증한다.

---

## 3. ✅ 상세 작업 체크리스트

### 3.1. 핵심 파일 생성
- [ ] `caret-src/core/prompts/` 경로에 `CaretJsonComponentProvider.ts` 파일 생성
- [ ] `caret-src/core/prompts/` 경로에 `PromptSystemManager.ts` 파일 생성
- [ ] `caret-src/core/prompts/__tests__/` 경로에 `CaretJsonComponentProvider.test.ts` 파일 생성

### 3.2. [RED] 실패하는 테스트 작성
- [ ] `CaretJsonComponentProvider.test.ts` 파일에 다음을 검증하는 테스트 케이스 작성:
    - [ ] `adaptChatbotAgentModes()` 메서드가 `CHATBOT_AGENT_MODES.json` 파일 (영어, 토큰 효율적 내용)을 읽어 `ComponentFunction`을 생성하는가?
    - [ ] 생성된 함수에 `context.mode = 'agent'`를 전달했을 때, 반환된 문자열에 "AGENT MODE"가 포함되는가?
    - [ ] 생성된 함수에 `context.mode = 'chatbot'`를 전달했을 때, 반환된 문자열에 "CHATBOT MODE"가 포함되는가?
    - [ ] 반환된 문자열에 기존 `cline-latest`의 용어인 "ACT MODE" 또는 "PLAN MODE"가 포함되지 않는가?

### 3.3. [GREEN] 최소 기능 구현
- [ ] **`CaretJsonComponentProvider.ts` 구현:**
    - [ ] `loadJsonSection(name: string)` 메서드를 구현하여 `caret-src/core/prompts/sections/` 경로에서 JSON 파일을 읽어옴.
    - [ ] `adaptChatbotAgentModes()` 메서드를 **최소한으로 구현**하여 위의 테스트를 통과시킴.
- [ ] **`PromptSystemManager.ts` 구현:**
    - [ ] 싱글톤 패턴으로 `getInstance()` 메서드 구현.
    - [ ] `switchMode(mode: 'caret' | 'cline')` 메서드 구현.
    - [ ] 'caret' 모드일 때, `PromptRegistry.getInstance().registerComponent('act_vs_plan_mode', ...)`를 호출하여, `CaretJsonComponentProvider`가 생성한 어댑터로 기존 컴포넌트를 **대체(override)**하도록 구현.

### 3.4. 시스템 연동
- [ ] `src/core/prompts/system-prompt/types.ts` 파일 수정:
    - [ ] `SystemPromptContext` 인터페이스에 `systemMode?: 'caret' | 'cline'` 필드를 **`// CARET MODIFICATION`** 주석과 함께 추가.
    ```typescript
    export interface SystemPromptContext {
        readonly providerInfo: ApiProviderInfo
        readonly cwd?: string
        readonly supportsBrowserUse?: boolean
        readonly mcpHub?: McpHub
        // ... 기존 필드들
        // CARET MODIFICATION: 하이브리드 프롬프트 시스템 모드 지원
        readonly systemMode?: 'caret' | 'cline'
    }
    ```
- [ ] `src/core/prompts/system-prompt/components/index.ts` 파일 수정:
    - [ ] `getSystemPromptComponents()` 함수 상단에 `PromptSystemManager`를 호출하는 분기 로직을 **`// CARET MODIFICATION`** 주석과 함께 추가.
    ```typescript
    export function getSystemPromptComponents() {
        // CARET MODIFICATION: 하이브리드 시스템 지원
        // systemMode는 호출하는 곳에서 context를 통해 전달됨
        
        return [
            { id: SystemPromptSection.AGENT_ROLE, fn: getAgentRoleSection },
            // ... 나머지 컴포넌트들
        ]
    }
    ```
- [ ] `caret-src/core/prompts/PromptSystemManager.ts`에서 `context.systemMode`를 확인하여 동적으로 컴포넌트를 대체하는 로직 구현:
    ```typescript
    // PromptSystemManager가 PromptRegistry에 동적으로 컴포넌트를 등록
    if (context.systemMode === 'caret') {
        PromptSystemManager.getInstance().switchMode('caret')
    }
    ```

### 3.6. Phase 검증 및 Git 체크포인트
- [ ] **Phase 검증 스크립트 확장**: `caret-scripts/phase-validator.js`에 Phase 2 검증 추가
    ```javascript
    validatePhase2() {
        // SystemPromptContext에 systemMode 필드 추가되었는지 확인
        // CaretJsonComponentProvider.ts, PromptSystemManager.ts 파일 존재 확인
        // TDD 테스트 100% 통과 확인
        // 컴파일 오류 없음 확인
    }
    ```
- [ ] **Git 체크포인트 설정**:
    - [ ] Phase 2 완료 시 커밋: `git commit -m "feat: Complete Phase 2 - Adapter framework with core philosophy integration"`
    - [ ] 검증 완료 시 태그: `git tag -a "t06-phase-2" -m "Phase 2 adapter complete"`
    - [ ] 사용자 확인 요청 후 푸시: `git push origin merge-v326-08292807 --follow-tags`
    - [ ] Phase 3 시작 전 백업 브랜치: `git branch t06-phase-2-backup`

### 3.7. 롤백 전략 (실패 시)
- [ ] **부분 실패 시**: `git reset --hard t06-phase-1` 후 문제 컴포넌트만 다시 구현
- [ ] **완전 실패 시**: `git checkout t06-phase-1-backup` 후 Phase 2 계획 재검토
- [ ] **Degraded Mode**: 하이브리드 시스템 비활성화, 기존 Cline 시스템으로 fallback

---

## 4. 🏁 완료 기준

### 필수 완료 기준
- [ ] `act_vs_plan_mode` 컴포넌트가 `CHATBOT_AGENT_MODES.json`의 내용으로 성공적으로 대체되어 동작함.
- [ ] `SystemPromptContext`에 `systemMode` 필드가 성공적으로 추가되어 아키텍처 문제가 해결됨.
- [ ] `CaretJsonComponentProvider.test.ts`에 작성된 모든 단위 테스트가 100% 통과함.
- [ ] **검증 자동화**: `phase-validator.js`를 통한 Phase 2 자동 검증이 100% 통과함.
- [ ] **Git 체크포인트**: 안전한 롤백이 가능한 커밋 및 태그가 생성되어 사용자 확인 완료됨.
- [ ] `npm run compile` 실행 시 컴파일 오류가 발생하지 않음.
- [ ] Phase 3를 시작하기 위한 모든 기술적 검증이 완료됨.
