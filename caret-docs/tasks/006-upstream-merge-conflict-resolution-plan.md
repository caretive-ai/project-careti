# Task #006: 업스트림 병합 충돌 해결 계획

- **작성일:** 2025-08-05
- **목표:** `upstream/main` 브랜치를 병합하는 과정에서 발생한 충돌을 체계적이고 검증 가능한 절차에 따라 해결합니다.

---

## 1. 충돌 개요

- **요약:** `upstream/main` 병합 중 100개 이상의 파일에서 충돌이 발생했으며, 프로젝트의 핵심 영역 전반에 걸쳐 영향을 미치고 있습니다.
- **주요 충돌 영역:**
  - 루트 설정 파일 (`package.json`, `.gitignore`, `tsconfig.json` 등)
  - Protobuf 정의 (`proto/`)
  - 핵심 로직 (`src/` 및 `webview-ui/`)
  - 문서 및 규칙 파일 (`docs/`, `.clinerules.cline/`)

---

## 2. 충돌 유형별 해결 전략

### 유형 1: 내용 충돌 (Content Conflict)

- **대상 파일:** 다수의 `.ts`, `.tsx` 및 설정 파일.
- **해결 전략:**
  - **Cline 원본 파일 (`src/`, `webview-ui/`):**
    - **기본 원칙:** `git checkout --theirs <파일>`을 사용하여 Cline의 변경사항을 수용합니다.
    - **예외:** `// CARET MODIFICATION` 주석이 있거나, Caret 고유 기능(예: `CaretProvider`, `CaretLogger`)과 관련된 파일은 수동으로 병합하여 Caret의 기능을 보존하면서 Cline의 업데이트를 통합합니다.
  - **설정 파일 (`package.json` 등) 및 문서 파일 (`CHANGELOG.md` 등):**
    - **조치:** 수동 병합 전, 해당 파일의 원본이 `-cline.md` 또는 `.cline` 접미사로 백업되어 있는지 **반드시 먼저 확인**합니다.
    - **백업 파일이 있는 경우:** 해당 파일은 Caret이 완전히 소유한 파일이므로, 고민 없이 우리 버전(Caret)을 선택합니다 (`git checkout --ours <파일>`).
    - **백업 파일이 없는 경우:** 의존성, 스크립트 등 변경 사항을 신중하게 검토하여 Caret 고유 설정은 유지하면서 Cline의 유용한 업데이트를 채택합니다.

### 유형 2: 삭제/수정 충돌 (Deletion/Modification Conflict)

- **설명:** Caret에서 수정한 파일이 `upstream/main`에서 삭제되었거나, 그 반대의 경우입니다.
- **해결 전략:**
  - **유지할 파일 (Upstream에서 삭제됨):** Caret에 필수적인 파일(예: `caret-src/`로 이동된 파일, 커스텀 컴포넌트)의 경우, `git add <파일>`을 사용하여 Caret 버전을 유지합니다.
  - **삭제할 파일 (Caret에서 삭제됨):** Caret에서 더 이상 사용하지 않는 파일의 경우, `upstream/main`에서 수정되었더라도 `git rm <파일>`을 사용하여 삭제 상태를 확정합니다.

### 유형 3: 파일 위치 충돌 (File Location Conflict)

- **설명:** `upstream/main`이 추가한 새 파일의 상위 디렉토리가 Caret에서 이름이 변경된 경우입니다.
- **해결 전략:**
  - **조치:** 새 파일을 이전 위치에서 Caret의 변경된 새 디렉토리 구조로 수동으로 이동합니다. 예를 들어, `.clinerules/`에 제안된 파일을 올바른 `.clinerules.cline/` 디렉토리로 이동합니다.

---

## 3. 단계별 해결 체크리스트

이 체크리스트는 순차적으로 진행되며, 각 단계를 실행하기 전 마스터의 명시적인 승인이 필요합니다.

### 1단계: 병합 상태 안정화 및 문서화
- [X] **1-1. `upstream-merging.mdx` 가이드 업데이트:** 충돌 해결 시 계획 수립 단계를 의무화했습니다. *(완료)*
- [ ] **1-2. 본 계획 문서 작성:** 이 해결 계획을 초안으로 작성하고 저장합니다. *(진행 중)*

### 2단계: 구조적 충돌 해결
- [ ] **2-1. 삭제/수정 충돌 해결:**
  - `[ ]` Upstream에서 삭제된 Caret 전용 파일 유지 (`git add ...`).
  - `[ ]` Caret에서 삭제한 파일 제거 (`git rm ...`).
- [ ] **2-2. 파일 위치 충돌 해결:**
  - `[ ]` `.clinerules/`의 새 파일을 `.clinerules.cline/`로 이동.
  - `[ ]` `docs/`의 새 파일을 `docs/zh/` 구조의 올바른 위치로 이동.

### 3단계: 설정 파일 병합
- [X] **3-1. `.gitignore` 병합:** 양쪽 브랜치의 규칙을 모두 포함하도록 수동 병합 완료. (2025-08-05)
- [X] **3-2. `.vscodeignore` 병합:** 양쪽 브랜치의 규칙을 모두 포함하도록 수동 병합 완료. (2025-08-05)
- [X] **3-3. `package.json` 병합:** Caret 브랜딩 유지, Cline 스크립트 개선사항 및 최신 의존성 반영하여 수동 병합 완료. (2025-08-05)
- [X] **3-4. `package-lock.json` 병합:** 임시로 Caret 버전(`--ours`)을 선택하여 해결. 최종 검증 단계에서 `npm install`을 통해 재생성 예정. (2025-08-05)
- [X] **3-5. `tsconfig.json`, `esbuild.mjs` 등 병합:** `tsconfig.json`은 충돌 없음 확인, `esbuild.mjs`는 Caret 설정을 유지하며 ESM 방식으로 병합 완료. (2025-08-05)

### 4단계: 소스 코드 병합 (Proto 중심의 수직적 병합 전략)

**핵심 전략:** Protobuf(`proto`) 파일을 기능의 중심축으로 삼아, 각 `proto` 파일과 직접적으로 관련된 백엔드(`src/`) 및 프론트엔드(`webview-ui/`) 파일을 하나의 기능 단위로 묶어 병합합니다. 이를 통해 단편적인 수정이 아닌, 기능적으로 완전한 단위로 병합을 진행하여 안정성을 확보합니다.

**추가 원칙: 보존과 통합:** `caret-architecture-and-implementation-guide.mdx`에 새로 추가된 "충돌 해결 전략: 보존과 통합" 원칙을 적극적으로 따릅니다. 특히 `src/shared/api.ts`와 같이 두 브랜치의 목적이 명확히 다른 설정 파일의 경우, 한쪽을 선택하는 대신 두 브랜치의 코드를 모두 포함하여 병합합니다. 이를 통해 향후 `upstream`의 변경 사항을 추적하고 점진적으로 기능을 통합할 수 있는 기반을 마련합니다.

**작업 절차 (각 Proto 파일에 대해 반복):**

1.  **대상 선정:** 병합할 `proto` 파일을 하나 선정합니다.
2.  **비교 분석:** 해당 `proto` 파일의 Caret 버전(`.cline` 백업)과 Cline 최신 버전을 비교하여 변경 사항(Caret 고유 기능, Cline 구조 개선)을 상세히 분석합니다.
3.  **Proto 병합:** 분석 결과를 바탕으로, Caret의 고유 기능은 보존하고 Cline의 구조 개선은 수용하는 방향으로 `proto` 파일을 수정하고, Caret 컨벤션(`package caret;`)을 적용합니다.
4.  **파생 영향도 병합:**
    -   **백엔드:** 수정된 `proto`와 관련된 `src/core/controller`, `src/core/webview` 등의 충돌 파일을 병합합니다.
    -   **프론트엔드:** 관련된 `webview-ui/src/` 내의 컴포넌트, 컨텍스트, 훅 등의 충돌 파일을 병합합니다.
5.  **단위 검증:** 관련된 파일들의 병합이 완료되면, `npm run compile`을 실행하여 최소한의 기술적 컴파일 오류가 없는지 확인합니다.
6.  **기록:** 아래 체크리스트에 완료된 단위를 표시하여 진행 상황을 명확히 추적합니다.

---

#### **수직적 병합 작업 체크리스트**

-   [ ] **`proto` 파일 전처리: 백업 최신화 및 구조 정리 (중요: 기존 병합 작업 보존)**
    -   **배경:** 초기 `proto` 병합 과정에서, `proto` 파일의 내용을 먼저 수정한 후 백업을 최신화하는 절차적 실수가 있었습니다. 올바른 절차는 **"최신 Cline 원본으로 백업 → Caret 기능 병합"** 입니다. 따라서, 이미 일부 내용이 병합된 현재 상태를 유지하면서, 누락되었던 백업 최신화 작업을 먼저 수행하여 절차를 바로잡습니다. 이 과정은 `upstream-merging.mdx` 가이드에 명시된 원칙을 따릅니다.
    -   [ ] **1단계: 최신 원본 백업 생성:** `git show MERGE_HEAD:proto/cline/...` 명령을 사용하여 모든 `proto` 파일의 순수한 Cline 원본을 새로운 경로(예: `proto/cline/account.proto.cline`)에 `.cline` 백업으로 생성합니다. **이 작업은 현재 머징된 작업 내용을 덮어쓰지 않습니다.**
    -   [ ] **2단계: 구버전 백업 삭제:** `proto/` 루트에 남아있는 오래된 `.cline` 백업 파일들을 모두 삭제합니다.
    -   [ ] **3단계: 병합 내용 재검토:** 전처리가 완료되면, 생성된 최신 백업과 현재 작업 디렉토리의 `.proto` 파일을 비교하여, Caret 기능 이식 및 컨벤션 수정이 올바르게 적용되었는지 최종 검토하며 수직적 병합을 진행합니다.

-   [ ] **`account.proto` 중심 병합**
    -   [ ] `proto/cline/account.proto` 병합 완료 (Caret 컨벤션 적용)
    -   [ ] 관련 백엔드 파일 병합 (`src/core/controller/account/`, `src/services/account/`)
    -   [ ] 관련 프론트엔드 파일 병합 (`webview-ui/src/components/account/`, `webview-ui/src/context/ClineAuthContext.tsx`)
    -   [ ] 단위 컴파일 검증
-   [ ] **`browser.proto` 중심 병합**
    -   [ ] `proto/cline/browser.proto` 병합 완료
    -   [ ] 관련 백엔드 파일 병합 (`src/core/controller/browser/`)
    -   [ ] 관련 프론트엔드 파일 병합 (`webview-ui/src/components/browser/`)
    -   [ ] 단위 컴파일 검증
-   [ ] **`checkpoints.proto` 중심 병합**
    -   [ ] `proto/cline/checkpoints.proto` 병합 완료
    -   [ ] 관련 백엔드 파일 병합 (`src/core/controller/checkpoints/`, `src/integrations/checkpoints/`)
    -   [ ] 관련 프론트엔드 파일 병합 (`webview-ui/src/components/common/CheckpointControls.tsx`)
    -   [ ] 단위 컴파일 검증
-   [ ] **`common.proto` 중심 병합**
    -   [ ] `proto/cline/common.proto` 병합 완료 (관련된 직접적인 로직 파일 없음)
-   [ ] **`file.proto` 중심 병합**
    -   [ ] `proto/cline/file.proto` 병합 완료
    -   [ ] 관련 백엔드 파일 병합 (`src/core/controller/file/`)
    -   [ ] 관련 프론트엔드 파일 병합 (`webview-ui/src/components/cline-rules/`)
    -   [ ] 단위 컴파일 검증
-   [ ] **`mcp.proto` 중심 병합**
    -   [ ] `proto/cline/mcp.proto` 병합 완료
    -   [ ] 관련 백엔드 파일 병합 (`src/core/controller/mcp/`, `src/services/mcp/`)
    -   [ ] 관련 프론트엔드 파일 병합 (`webview-ui/src/components/mcp/`)
    -   [ ] 단위 컴파일 검증
-   [X] **`models.proto` 중심 병합**
    -   [X] `proto/cline/models.proto` 병합 완료 (Caret provider 및 API key 추가)
    -   [ ] 관련 백엔드 파일 병합 (`src/core/controller/models/`, `src/api/providers/`)
    -   [ ] 관련 프론트엔드 파일 병합 (`webview-ui/src/components/settings/`)
    -   [ ] 단위 컴파일 검증
-   [ ] **`slash.proto` 중심 병합**
    -   [ ] `proto/cline/slash.proto` 병합 완료
    -   [ ] 관련 백엔드 파일 병합 (`src/core/controller/slash/`)
    -   [ ] 단위 컴파일 검증
-   [ ] **`state.proto` 중심 병합**
    -   [ ] `proto/cline/state.proto` 병합 완료
    -   [ ] 관련 백엔드 파일 병합 (`src/core/controller/state/`, `src/core/storage/`)
    -   [ ] 관련 프론트엔드 파일 병합 (`webview-ui/src/context/ExtensionStateContext.tsx`)
    -   [ ] 단위 컴파일 검증
-   [ ] **`task.proto` 중심 병합**
    -   [ ] `proto/cline/task.proto` 병합 완료
    -   [ ] 관련 백엔드 파일 병합 (`src/core/controller/task/`, `src/core/task/`)
    -   [ ] 관련 프론트엔드 파일 병합 (`webview-ui/src/components/chat/`, `webview-ui/src/components/history/`)
    -   [ ] 단위 컴파일 검증
-   [ ] **`ui.proto` 중심 병합**
    -   [ ] `proto/cline/ui.proto` 병합 완료
    -   [ ] 관련 백엔드 파일 병합 (`src/core/webview/`, `src/core/controller/index.ts`)
    -   [ ] 관련 프론트엔드 파일 병합 (`webview-ui/src/App.tsx`, `webview-ui/src/Providers.tsx`)
    -   [ ] 단위 컴파일 검증
-   [ ] **`web.proto` 중심 병합**
    -   [ ] `proto/cline/web.proto` 병합 완료
    -   [ ] 관련 백엔드 파일 병합 (`src/core/controller/web/`)
    -   [ ] 단위 컴파일 검증
-   [ ] **`host/*.proto` 중심 병합**
    -   [ ] `proto/host/` 내 모든 proto 파일 병합 완료
    -   [ ] 관련 백엔드 파일 병합 (`src/hosts/`)
    -   [ ] 단위 컴파일 검증
-   [X] **기타 핵심 파일 병합**
    -   [ ] `src/extension.ts`
    -   [ ] `src/core/prompts/responses.ts`
    -   [X] `src/core/prompts/system.ts` (완료)
    -   [X] `src/shared/` 디렉토리 내 기타 파일 (api.ts, storage/types.ts, services/config/posthog-config.ts, proto-conversions/models/api-configuration-conversion.ts 완료)
    -   [X] `src/api/index.ts` (완료)
    -   [X] `src/api/providers/openrouter.ts` (완료)
    -   [X] `src/core/storage/disk.ts` (완료)
    -   [X] `src/core/storage/state-keys.ts` (완료)
    -   [X] `src/core/storage/state.ts` (완료)
    -   [X] `src/dev/commands/tasks.ts` (완료)
    -   [X] `src/services/mcp/McpHub.ts` (완료)
    -   [X] `src/services/posthog/PostHogClientProvider.ts` (완료)
    -   [X] **전체 `proto` import 경로 수정:** `upstream`의 `proto` 디렉토리 구조 변경(`cline/`, `host/` 하위 디렉토리 추가)에 따라, 프로젝트 전반의 200개 이상 파일에서 잘못된 import 경로를 수정 완료.

### 5단계: 최종 검증 및 커밋
- [ ] **5-1. 의존성 재설치:** `npm install` 및 `cd webview-ui && npm install && cd ..` 실행.
- [ ] **5-2. 전체 빌드:** `npm run compile` 및 `npm run build:webview` 실행.
- [ ] **5-3. 전체 테스트 실행:** `npm run test:all` 및 `ClineFeatureValidator` 테스트 실행.
- [ ] **5-4. 모든 변경사항 스테이징:** `git add .`를 실행하여 해결된 모든 파일과 이 계획 문서를 스테이징.
- [ ] **5-5. 병합 커밋 생성:** 포괄적인 커밋 메시지와 함께 병합을 최종 완료.
