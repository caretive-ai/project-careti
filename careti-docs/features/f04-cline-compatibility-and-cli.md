# F04 - Cline 호환성 & CLI 확장

**상태**: ✅ Phase D 완료, v0.4.9 서브에이전트 UI 개선
**영향 범위**: Core(Prompt/Mode), Webview(Banner/Settings), CLI(Go/Packaging)
**우선순위**: 🔴 High

---

## 📋 개요

Careti은 Cline의 모든 기능(Plan/Act 모드, MCP, Provider 등)을 100% 호환하면서, **Dual Mode System**을 통해 Careti 고유의 기능(JSON 프롬프트, 전용 인증)을 선택적으로 제공한다.  
사용자는 설정이나 UI 토글을 통해 `Cline Mode`(순정 호환)와 `Careti Mode`(확장 기능)를 자유롭게 오갈 수 있다.  
CLI 세션은 기본적으로 **Cline 프롬프트 시스템**으로 시작해 호환성을 보장한다(`cli/pkg/cli/task/manager.go`).

## ✅ 의의
- **사용자 가치**: Cline 워크플로우를 유지하면서 Careti 고유 프롬프트/기능을 안전하게 확장.
- **머지 안정성**: Cline 코어는 보존하고 모드 분기와 래퍼로만 확장.
- **운영 명확성**: `caretModeSystem`으로 프롬프트 체계를 명시하고 CLI는 호환 모드로 시작.

## ✨ 추가 기능 요약
- 듀얼 프롬프트 시스템(Cline 텍스트 ↔ Careti JSON).
- CLI 기본 `cline` 프롬프트 모드 고정.
- 서브에이전트 UI 노출 + i18n(en/ko/ja/zh).
- 멀티 도메인 인증 분리(`careti.ai` vs `cline.bot`).

---

## 🆚 Cline 대비 개선점 (Improvements)

| 기능 | Cline (Original) | Careti (Enhanced) |
| --- | --- | --- |
| **운영 모드** | Plan/Act 모드만 존재 (단일 시스템) | **Dual Mode System** (Careti ↔ Cline) 지원. 모드별로 프롬프트/도구/UI가 완전히 분리됨. |
| **시스템 프롬프트** | 프롬프트 레지스트리(`src/core/prompts/system-prompt/*`) | **Dynamic JSON Prompt System** (`careti-src/core/prompts/system`)을 `CaretiPromptWrapper`로 분기 |
| **인증/도메인** | `cline.bot` 고정 | **Multi-Domain Support**. `careti.ai` (Careti)과 `cline.bot` (Cline) 인증을 별도로 처리하여 계정 충돌 방지. |
| **서브에이전트** | 실험적 기능 (UI 미노출) | **정식 UI 지원** (v0.4.9+). Settings > Features에 서브에이전트 토글·출력 제한 슬라이더 노출. Careti/Cline 모드 모두에서 UI 표시. CLI 설치 배너 및 버튼 분기, i18n(en/ko/ja/zh) 적용. `skillsEnabled`, `subagentsEnabled` 기본값 `true`. |

---

## 🏗 코드 범위 (Code Scope)

머징 작업 시 아래 파일들을 중점적으로 확인해야 한다.

### 1. Core & Controller (모드 시스템)
- **`src/core/prompts/system-prompt/index.ts`**: `modeSystem === "careti"`일 때 `CaretiPromptWrapper`로 라우팅. (핵심 분기점)
- **`src/core/controller/persona/SetPromptSystemMode.ts`**: 모드 변경 시 `caretModeSystem`을 GlobalState에 영속화.
- **`src/core/task/index.ts`**: Task 시작 시 현재 모드 정보를 메타데이터에 포함.
- **`src/core/controller/state/updateSettings.ts`**: 설정 변경 시 `caretModeSystem` 상태 업데이트 처리.
- **`src/core/controller/state/checkCliInstallation.ts`**: `modeSystem`에 따라 `isCaretCliInstalled()` 또는 `isClineCliInstalled()` 호출 분기.
- **`src/core/controller/state/installClineCli.ts`**: 모드에 따라 `npm install -g @caretive/careti-cli` 또는 `cline` 명령 실행.
- **`cli/pkg/cli/task/manager.go`**: CLI 시작 시 `Caretsystem.SetPromptSystemMode("cline")`로 호환 모드 고정.

### 2. Webview (UI & 감지)
- **`webview-ui/src/components/common/CliInstallBanner.tsx`**: 현재 모드에 따라 Careti CLI 또는 Cline CLI 설치 배너 노출.
- **`src/utils/cli-detector.ts`**: `isCaretCliInstalled` 함수 추가. `binary version` 명령으로 Careti/Cline CLI 설치 여부 각각 확인.
- **`webview-ui/src/components/settings/sections/FeatureSettingsSection.tsx`**: 서브에이전트 설정 UI 복구 및 모드별 CLI 설치 안내.
- **`webview-ui/src/components/settings/SubagentOutputLineLimitSlider.tsx`**: 서브에이전트 출력 라인 제한 슬라이더 (설정 토글 활성 시 노출).
- **`webview-ui/src/careti/locale/{en,ko,ja,zh}/settings.json`**: subagents 번역 키 추가(토글/설치 안내/출력 제한 라벨).

---

## 🛡️ 머징 가이드 (Critical Checkpoints)

1. **최소 침습 원칙 (Minimal Invasion)**
   - Cline 원본 파일(`src/core/prompts/system-prompt/index.ts` 등) 수정 시 반드시 `// CARETI MODIFICATION: ...` 주석을 남긴다.
   - 로직을 직접 수정하기보다, 모드 체크(`if (mode === 'careti')`) 후 별도 모듈(`careti-src/**`)을 호출하는 방식을 선호한다.

2. **3-Way Comparison**
   - `comparison/base` (v3.35.0), `comparison/cline` (v3.38.1), `comparison/careti` (careti-main) 3자 비교를 통해 누락된 로직이 없는지 확인한다.
   - Webview settings 병합 시 서브에이전트 토글/슬라이더(i18n 키 포함)가 모두 유지되는지 확인하고, 기존 키 중복 여부를 점검한다.

3. **리소스 분리**
   - Careti 전용 리소스(이미지, JSON 프롬프트 등)는 `assets/` 또는 `careti-src/` 하위에 배치하여 Cline 원본과 섞이지 않도록 한다.

## 테스트 체크리스트 (TDD)
- `mode-system.test.ts`: 글로벌 스테이트 영속화, careti/cline 분기, UI 라벨(Plan/Act).
- CLI 감지/배너: careti/cline 모드에서 설치 여부에 따라 배너/명령 분기 확인.
- `npm run compile && npm run test` 통과, 수동 `careti version`, `careti task new` 동작 확인.

> **CLI Agent/Chatbot 모드**: 상세 내용은 [f18-cli-agent-chatbot-mode.md](f18-cli-agent-chatbot-mode.md) 참조

## 참고 문서
- `careti-docs/merging/cli-provider-servers.md` (서버팀용 도메인/엔드포인트)
- `careti-docs/merging/v3.38.1/attempt-2-master.md` (Phase D 진행 로그 및 액션)
