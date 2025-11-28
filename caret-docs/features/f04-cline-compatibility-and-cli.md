# F04 - Cline 호환성 & CLI 확장

**상태**: ✅ Phase D 완료  
**영향 범위**: Core(Prompt/Mode), Webview(Banner/Settings), CLI(Go/Packaging)  
**우선순위**: 🔴 High

---

## 📋 개요

Caret은 Cline의 모든 기능(Plan/Act 모드, MCP, Provider 등)을 100% 호환하면서, **Dual Mode System**을 통해 Caret 고유의 기능(JSON 프롬프트, 확장 CLI, 전용 인증)을 선택적으로 제공한다.  
사용자는 설정이나 UI 토글을 통해 `Cline Mode`(순정 호환)와 `Caret Mode`(확장 기능)를 자유롭게 오갈 수 있다.

---

## 🆚 Cline 대비 개선점 (Improvements)

| 기능 | Cline (Original) | Caret (Enhanced) |
| --- | --- | --- |
| **운영 모드** | Plan/Act 모드만 존재 (단일 시스템) | **Dual Mode System** (Caret ↔ Cline) 지원. 모드별로 프롬프트/도구/UI가 완전히 분리됨. |
| **시스템 프롬프트** | 하드코딩된 텍스트 프롬프트 (`src/core/prompts/system.ts`) | **Dynamic JSON Prompt System** (`caret-src/core/prompts`). 구조화된 JSON으로 유연한 프롬프트 제어 가능. |
| **CLI 도구** | `cline` CLI만 지원 | **Unified CLI Wrapper**. `caret` 명령 하나로 Caret/Cline 환경을 모두 제어하며, 모드에 따라 적절한 백엔드에 연결. |
| **인증/도메인** | `cline.bot` 고정 | **Multi-Domain Support**. `caret.team` (Caret)과 `cline.bot` (Cline) 인증을 별도로 처리하여 계정 충돌 방지. |
| **서브에이전트** | 실험적 기능 (UI 미노출) | **정식 UI 지원**. Settings > Features에 서브에이전트 토글·출력 제한 슬라이더 노출, Caret/Cline 모드별 CLI 설치 안내/버튼 분기, i18n(en/ko/ja/zh) 적용. |

---

## 🏗 코드 범위 (Code Scope)

머징 작업 시 아래 파일들을 중점적으로 확인해야 한다.

### 1. Core & Controller (모드 시스템)
- **`src/core/prompts/system-prompt/index.ts`**: `modeSystem === "caret"`일 때 `CaretPromptWrapper`로 라우팅. (핵심 분기점)
- **`src/core/controller/persona/SetPromptSystemMode.ts`**: 모드 변경 시 `caretModeSystem`을 GlobalState에 영속화.
- **`src/core/task/index.ts`**: Task 시작 시 현재 모드 정보를 메타데이터에 포함.
- **`src/core/controller/state/updateSettings.ts`**: 설정 변경 시 `caretModeSystem` 상태 업데이트 처리.
- **`src/core/controller/state/checkCliInstallation.ts`**: `modeSystem`에 따라 `isCaretCliInstalled()` 또는 `isClineCliInstalled()` 호출 분기.
- **`src/core/controller/state/installClineCli.ts`**: 모드에 따라 `npm install -g @caretive/caret-cli` 또는 `cline` 명령 실행.

### 2. Webview (UI & 감지)
- **`webview-ui/src/components/common/CliInstallBanner.tsx`**: 현재 모드에 따라 Caret CLI 또는 Cline CLI 설치 배너 노출.
- **`src/utils/cli-detector.ts`**: `isCaretCliInstalled` 함수 추가. `binary version` 명령으로 Caret/Cline CLI 설치 여부 각각 확인.
- **`webview-ui/src/components/settings/sections/FeatureSettingsSection.tsx`**: 서브에이전트 설정 UI 복구 및 모드별 CLI 설치 안내.
- **`webview-ui/src/components/settings/SubagentOutputLineLimitSlider.tsx`**: 서브에이전트 출력 라인 제한 슬라이더 (설정 토글 활성 시 노출).
- **`webview-ui/src/caret/locale/{en,ko,ja,zh}/settings.json`**: subagents 번역 키 추가(토글/설치 안내/출력 제한 라벨).

### 3. CLI (Go & Packaging)
- **`cli-caret/pkg/cli/auth/`**: `auth_menu.go`, `providers_list.go` 등에서 Caret/Cline/BYO 메뉴 분기 및 `caret.team` 도메인 적용.
- **`cli-caret/scripts/`**: `build-local.sh`, `publish-caret-cli.sh` 등 패키징 스크립트. `cline` 바이너리를 포함하여 단일 패키지로 배포.

---

## 🛡️ 머징 가이드 (Critical Checkpoints)

1. **최소 침습 원칙 (Minimal Invasion)**
   - Cline 원본 파일(`src/core/prompts/system-prompt/index.ts` 등) 수정 시 반드시 `// CARET MODIFICATION: ...` 주석을 남긴다.
   - 로직을 직접 수정하기보다, 모드 체크(`if (mode === 'caret')`) 후 별도 모듈(`caret-src/**`)을 호출하는 방식을 선호한다.

2. **3-Way Comparison**
   - `comparison/base` (v3.35.0), `comparison/cline` (v3.38.1), `comparison/caret` (caret-main) 3자 비교를 통해 누락된 로직이 없는지 확인한다.
   - Webview settings 병합 시 서브에이전트 토글/슬라이더(i18n 키 포함)가 모두 유지되는지 확인하고, 기존 키 중복 여부를 점검한다.

3. **리소스 분리**
   - Caret 전용 리소스(이미지, JSON 프롬프트 등)는 `assets/` 또는 `caret-src/` 하위에 배치하여 Cline 원본과 섞이지 않도록 한다.

## 테스트 체크리스트 (TDD)
- `mode-system.test.ts`: 글로벌 스테이트 영속화, caret/cline 분기, UI 라벨(Agent/Chatbot vs Plan/Act).
- CLI 감지/배너: caret/cline 모드에서 설치 여부에 따라 배너/명령 분기 확인.
- `npm run compile && npm run test` 통과, 수동 `caret version`, `caret task new` 동작 확인.

## 참고 문서
- `caret-docs/merging/cli-provider-servers.md` (서버팀용 도메인/엔드포인트)
- `caret-docs/merging/v3.38.1/attempt-2-master.md` (Phase D 진행 로그 및 액션)
