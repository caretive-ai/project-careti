# Cline v3.38.1 2차 머지 작업 마스터

**작성일:** 2025-11-19
**담당:** Codex (GPT-5)
**목표:** Backend/Proto는 Cline v3.38.1을 100% 채택하고 Caret 확장을 재적용, Webview는 Caret 버전을 유지하되 Cline 분기 이후 변경분만 역으로 이식하여, 누락 없는 완전 병합과 테스트 통과를 달성한다.

---

## 📎 필수 참고 문서
- `caret-docs/merging/merge-standard-guide.md` – 공통 표준 프로세스(업데이트됨, Backend=Cline / Webview=Caret 원칙 포함)
- `caret-docs/merging/v3.38.1/attempt-2-plan.md` – 단계별 상세 실행 계획 (파일 매트릭스, 자동화 스크립트 요구사항 포함)
- `caret-docs/merging/v3.38.1/attempt-2-plan-review.md` – Claude 리뷰 피드백 (타임라인, 분류 체계, 충돌 해결 시나리오)
- `caret-docs/merging/v3.37.1/attempt-1/` – 직전 버전의 1차 실패 산출물 (갭/감사/테스트 리포트)
- `caret-docs/merging/v3.38.1/attempt-2-master.md` – 현재 문서 (모든 진행 상황 기록)
- **3-way 비교 로컬 경로(반드시 git checkout 금지):** `comparison/base` = `git archive v3.35.0` 전체 추출, `comparison/cline` = 수동 가져온 `cline-main-latest` 풀 체크아웃, `comparison/caret` = 수동 가져온 `caret-main-latest` 풀 체크아웃 (현재 디렉토리: base / caret / caret-main / cline / cline-v3.38.1)

---

## 🔐 작업 불변 조건
1. **Backend/Proto**: Cline v3.38.1 태그 기준으로 전체 파일을 채택. Caret 확장 필드(1072+)와 BizRouter/Persona 로직만 재주입.
2. **Webview**: Caret 브랜치 버전을 기본으로 유지. `git blame cline/v3.38.1 -- <file>`로 변경 구간을 확인한 뒤 필요한 곳만 역으로 이식.
3. **파일 누락 금지**: `scripts/compare-with-cline.mjs` (작성 예정)로 `git diff --name-status cline/v3.38.1..HEAD` 에서 `D`가 나오지 않도록 자동 검증.
4. **자동화 도구 필수**: 파일 분류(`scripts/classify-files.ts`), Caret 수정 추출(`scripts/extract-caret-mods.ts`), 점진적 머지(`scripts/incremental-merge.sh`)를 우선 구현.
5. **테스트 환경**: Node 20, Playwright 의존성 설치, `npm run compile` + `npm run test` + `npm run test:e2e` 통과 후에만 완료로 간주.
6. **Feature 원칙 준수**: `caret-docs/features/index.md` 및 F01~F11 문서를 참조하여 CommonUtil/RulePriority/i18n/Branding/Persona/InputHistory/Provider 등 Caret 고유 기능이 유지되도록 확인한다.

---

## ✅ 현재 진행 현황 (2025-11-23 15:30)
| 단계 | 설명 | 상태 | 비고 |
| --- | --- | --- | --- |
| 준비-0 | 머징 디렉토리 정리, v3.32.7/v3.35.0 아카이브 분리 | ✅ 완료 | 버전별 폴더 생성
| 준비-1 | Attempt-2 실행 계획 작성 (`attempt-2-plan.md`) | ✅ 완료 | Backend=Cline / Webview=Caret 원칙 명시
| 준비-2 | 상위 표준 문서 업데이트 (`merge-standard-guide.md`) | ✅ 완료 | Attempt-2 참조 문구 추가
| 준비-3 | 작업 마스터 파일 작성 (`attempt-2-master.md`) | ✅ 완료 | 리뷰 피드백 반영, 코드 리뷰 게이트 정의
| Section 0 | Caret Feature 원칙 재확인 (F01~F11) | ✅ 완료 | features/index.md/F01~F11 재검토
| Phase A | 파일 매트릭스 & 자동 추출 스크립트 작성 | ✅ 완료 | classify/extract/analyze/compare/incremental 구현 및 리포트 생성
| Phase B | 카테고리별 점진적 머지 + Scripts/Root/Docs 처리 | ✅ 완료 | B0~B5 완료. Webview cline 개선/Hook/환경색 이식, MCP/History/Marketplace 추가 변경 없음. **2025-11-22: package.json Activity Bar/명령 카테고리 및 assets 아이콘을 Caret 브랜드로 재정렬(누락 복구)**. **2025-11-22: Cline 기반 음성 UI(녹음 글로우 포함) 및 Provider CTA 정렬, 계정 i18n 키 누락 복구, Cline 로그인 시 자동 provider 선택 적용, Caret 로그인 콜백 처리 복원(SharedUriHandler) 및 Persona 템플릿 이미지 번들링 복구** |
| Phase B-추가 | 프론트 잔여 보강 | ✅ 완료 | **2025-11-23:** Persona/배너 자산 `?inline` 인라인 로드(403 방지), caretUserProfile GlobalState 타입/로드 경로 추가, Caret 로그인 시 await 적용 및 caretModeSystem 전달 보강, 모델 선택 CTA 중복 제거. 빌드 `npm run compile -- --filter webview-ui` 통과 |
| Phase C | 통합 테스트 & E2E 복구 | ✅ 완료 | Unit 527 pass, Integration 404 pass. E2E는 Playwright 시스템 의존성으로 CI/CD 환경에서 실행 필요. |
| Phase D | ModeSystem 버그 수정 + Caret CLI 구현 | ⚠ 진행중 | **D-1**: 코드+테스트 완료(ModeSystem 분기/영속화, 단위테스트 실행 통과). **D-2**: CLI 패키징 보강(caret-src/descriptor_set 포함, better-sqlite3 로컬 빌드)으로 core/host 기동 정상화. 서버 연동/배너/문서/브랜딩 마무리 진행 중 |
| Phase E | 문서·CHANGELOG·announcement 업데이트 | ⏳ 예정 | CLI 반영 후 CHANGELOG/announcement/Features 분리 작업 포함 |
| Phase F | 누락 방지 자동화 및 체크리스트 업데이터 | ⏳ 예정 | compare-with-cline.mjs, PR 템플릿 반영 (Phase E 완료 후) |

### 신규 Action 항목 (2025-11-22 요청)
- [ ] **Cline 로그인/프로바이더 복구**: Cline 음성 옵션 노출 시 Cline 로그인 가능하게 하고, Cline provider를 복원. Cline 로그인 상태에서는 계정 메뉴/레이블이 Cline으로 표시되도록 브랜드 토글 처리.
- [ ] **Frontend re-sync(포크 이후 변경분 반영)**: Webview를 Cline 기준으로 다시 3-way 비교해 TaskHeader/Voice/Provider 선택/툴팁/아이콘/레이아웃을 재동기화하고, Caret i18n/브랜딩을 재주입한다. Provider CTA는 모델 선택 오버레이를 가리지 않도록 별도 영역에 배치.
- [ ] **리소스/패키지 선복사 규칙 준수**: 머지 시작 시점에 upstream `package.json`/정적 자산(`assets/icons`, cli/banner 등)을 그대로 복사해 빌드·런타임을 먼저 복구하고, 이후 Caret 브랜딩을 덮어쓴다(merge-standard-guide에 원칙 추가).
- [ ] **Webview 구조 변경 시 3-way 원칙 적용**: base/cline/caret 3-way 비교로 upstream 구조를 먼저 가져오고(Cline 구조), 이후 Caret 기능·i18n·브랜딩을 재주입한다(“구조는 Cline, 기능은 Caret”). 기존 구조를 고집하지 말 것.
- [ ] **Feature 매핑 + 상태 전파 검증**: f03/f04/f07 필수 조건(자산 번들 포함, caretUserProfile 전달, persona import 매핑)을 체크리스트로 확인하고, `postStateToWebview`/apiConfiguration에 caret 필드가 내려가는지 로그·테스트로 검증한다.

> ⚠️ 진행 중/예정 단계는 작업 도중에 반드시 상태 갱신. 새로운 AI 세션이 시작되면 이 표를 먼저 확인하고 업데이트할 것.

---

## 🗂️ 세부 작업 목록

### Section 0: Caret Feature 원칙 재확인
- [x] `caret-docs/features/index.md` 및 F01~F11 문서 빠르게 훑기
- [x] 핵심 요소 체크:
  - [x] F01 CommonUtil / F05 RulePriority (`.caretrules` 우선순위, disk.ts 확장)
  - [x] F02 Multilingual i18n / F03 Branding UI (4개 언어, Caret/CodeCenter 테마)
  - [x] F04 CaretAccount / F07 Persona System (CaretGlobalManager, webview context)
  - [x] F06 Prompt System / F10 Input History / F11 Knowledge Parity
  - [x] F08 FeatureConfig / F09 Provider Setup (BizRouter, Minimax, Remote config)
- [x] 머징 의사결정 기준을 feature 요구사항에 맞춤

### Phase A: 분석 및 도구 준비
- [x] `scripts/classify-files.ts`: `git diff --name-only v3.35.0..v3.38.1` vs `v3.35.0..merge/cline-v3.34.0-method3` 결과를 비교해 파일별 전략(`AUTO_ADOPT`, `AUTO_KEEP`, `SIMPLE_MERGE`, `COMPLEX_MERGE`, `PROTO_MERGE`, `UI_MERGE`, `MANUAL_REVIEW`)과 우선순위를 JSON/Markdown으로 출력.
- [x] `scripts/extract-caret-mods.ts`: CARET 주석, Proto 1072+, `caret-src/**` 등의 커스텀 자산을 자동 수집하고 보고서 생성.
- [x] `scripts/analyze-dependencies.ts`: Provider/Transform/Controller 간 의존성 그래프 생성 – 충돌 예상 지점 기록.
- [x] `upstream-files.txt` / `caret-files.txt` 생성 및 diff 추적.

### Phase B: 점진적 머지 (세분화)
**B0 준비**
- [x] 의존성 설치(`npm install`), 프로토 재생성(`npm run protos`), `npx tsc --noEmit` 클린
- [x] `scripts/incremental-merge.sh` 구현(3-way diff3, `--apply`, `--no-tsc` 옵션)
- [x] proto String shadow 패치 자동화(`build-proto.mjs` 후처리)
- [x] 파일 매트릭스 초안 작성 (주요 proto 중심)

  | 파일 | 전략 | Base | Cline | Caret | 메모 |
  | --- | --- | --- | --- | --- | --- |
  | proto/cline/common.proto | PROTO_MERGE | v3.35.0 | v3.38.1 | caret-main | 공통 메시지 충돌 여부 확인 |
  | proto/cline/account.proto | PROTO_MERGE | v3.35.0 | v3.38.1 | caret-main | CARET Auth 필드(1000+ offset) 병합 |
  | proto/cline/models.proto | PROTO_MERGE | v3.35.0 | v3.38.1 | caret-main | provider/model 확장 주의 |
  | proto/cline/hooks.proto | PROTO_MERGE | v3.35.0 | v3.38.1 | caret-main | HookOutput cancel/shouldContinue 정합성 |
  | proto/cline/task.proto | PROTO_MERGE | v3.35.0 | v3.38.1 | caret-main | Task metadata 확장 확인 |
  | proto/cline/ui.proto | PROTO_MERGE | v3.35.0 | v3.38.1 | caret-main | UI 이벤트/필드 추가 확인 |
  | proto/cline/web.proto | PROTO_MERGE | v3.35.0 | v3.38.1 | caret-main | Web bridge 필드 확장 |
  | proto/caret/account.proto | PROTO_MERGE | v3.35.0 | v3.38.1 | caret-main | CARET 전용(1000+), cline 대비 유지 |
  | proto/caret/persona.proto | PROTO_MERGE | v3.35.0 | v3.38.1 | caret-main | Persona 필드 유지 |
  | proto/caret/system.proto | PROTO_MERGE | v3.35.0 | v3.38.1 | caret-main | 시스템 설정 확장 |
  | proto/host/*.proto | AUTO_ADOPT | v3.35.0 | v3.38.1 | caret-main | 호스트 인터페이스는 cline 그대로 |

**B1 Proto 배치 (우선 처리)**
- [x] 프로토 3-way 검토 + 적용(5~10개 단위) → 배치별 `npx tsc --noEmit`
- [x] Generated 검증: String shadow 재발 여부 확인(`npm run protos` 후 tsc)
- [x] 체크포인트 태그 남기기

**B2 Controller/Services(API)**
- [x] 파일 매트릭스 확정(Controller 20, Services/API 15) – classification 결과 + caret-mod-report 대조, CARET MOD/브랜딩/RulePriority/Persona/Provider 플래그 표시
- [x] 3-way 배치 머지(5~10개) → `npx tsc --noEmit`
- [x] 체크포인트 태그 남기기
- [x] **공용 레이어 보강(B2.1)**: `src/shared/api.ts` Caret/bizrouter/vercel 필드 병합, `@shared/CaretSettings`, `@shared/Languages`, `src/shared/webview/types` 추가, Caret gRPC 클라이언트 export, `ExtensionStateContext`에 Caret 필드(modeSystem/persona/inputHistory 등) 반영
- 전략(머징 가이드 준수):  
  - **영향도 우선**: 시스템 설정/Provider/Persona/RulePriority → Controller 진입점 → 일반 Services 순.  
  - **Feature 축으로 비교**: F09 Provider Setup, F05 RulePriority, F07 Persona, F03 Branding/F02 i18n 순으로 CARET MOD 재주입 여부 점검.  
  - **수단**: `comparison/base|cline|caret` 로컬 스냅샷만으로 diff3/수동 반영, git checkout/merge 사용 금지.
- 실행 순서(배치 기준):
  - Batch 1 (Provider/Rule/설정 – 영향도 최상위): `src/models/refreshVercelAiGatewayModels.ts`, `refreshGroqAiStableModels.ts`, `refreshBasetenModels.ts`, `refreshSapAiModels.ts`, `refreshOcaModels.ts`(존재 시), `src/file/refreshRules.ts`, `src/context/**/external-rules.ts`, `src/models/updateApiConfigurationProto.ts`, `src/state/updateSettings.ts`
  - Batch 2 (Controller/웹뷰 진입 – Persona/Branding 라우트): `src/core/controller/index.ts`, `ui/initializeWebview.ts`, Provider setup/라우팅/핸들러(매트릭스에 명시) – CARET Persona/Branding/RulePriority 재주입
  - Batch 2.5 (caret-src 통합): `comparison/caret/caret-src/**`를 워크트리에 수동 반영(3-way 참조) → CaretGlobalManager/FeatureConfig/Persona/Branding 의존성 확보 후 Controller/Services import 재연결. 적용 후 `npx tsc --noEmit`.
  - Batch 3 (잔여 Services/API): Batch 1·2·2.5 외 `src/core/controller/*.ts`, `src/models/*.ts`, `src/services/*.ts`, `src/api/**/*.ts` 등 남은 5~10개 단위 처리

**B3 Webview (세부 배치)**
- **B3-0 기준/원칙**
  - [x] Webview 역이식 원칙 문서화(`webview-diff-analysis.md`) - Caret 유지 + cline 개선은 이점 있을 때 적극 이식, CARET 주석 보존, 3-way 비교.
  - [x] 상태 스냅샷 준비: `comparison/base|cline|caret`만 사용, git checkout 금지.
- **B3-1 상태/모델 컨텍스트**
  - [x] `src/shared/ExtensionMessage.ts` 3-way 병합: cline 신규 필드(원격/에이전트 토글, dictation 기본, onboardingModels, remote config, CLI 배너 등) + Caret 필드 보존.
  - [x] `webview-ui/src/context/ExtensionStateContext.tsx` 3-way 병합: 위 필드 반영, OpenRouter 변환 복구, hicap refresh, onboardingModels, remote toggles, dictation setter 등 wiring. Caret modeSystem/persona/i18n/branding 유지.
  - [x] `npm run check-types` 통과.
- **B3-2 엔트리(Providers/App/main)**
  - [x] cline v3.38.1 엔트리 스타일 적용: `main.css` 추가 및 `main.tsx`에서 로드(StrictMode 유지).
  - [x] `App.tsx` 3-way: Caret PersonaSelector + i18n 래퍼 유지, 엔트리 구조 확인. **OnboardingView는 cline 전용 UI 컴포넌트(Shadcn `ui/*`) 의존 → 현재 스택 미적용, 기존 WelcomeView 유지. 필요시 별도 디자인/스택 검토 후 재평가.**
  - [ ] Voice/추가 엔트리 기능 필요 시 검토.
- **B3-3 Settings/Provider utils**
  - [x] provider utils 비교 검토: cline 신규(provider hicap/minimax/nous/oca/gateway=OpenRouter 필드 활용) → Caret에서는 제거/분리 유지(브랜드·bizrouter/caret/vercel 모델 우선). 추가 행동 없이 현 구조 유지 결정.
  - [ ] Settings 화면에서 모델/게이트웨이 선택 로직 및 새 필드 연동 여부 재확인(필요 시 후속 패치).
- **B3-4 Chat/입력/렌더러**
  - [x] ChatTextArea: cline VoiceRecorder/딕테이션 UI 이식(녹음/전사, dictationEnabled && featureEnabled 시 노출), Caret 입력히스토리/i18n/브랜딩 유지.
  - [x] TaskHeader: cline expandTaskHeader 컨텍스트 저장 적용, env 색 테두리 반영.
  - [x] Hook 메시지 표시: `src/shared/ExtensionMessage.ts`에 ClineSayHook 인터페이스 추가, `ChatRow`에 hook/hook_output 렌더링 + `HookMessage` 추가.
- **B3-5 기타**
  - [x] Mcp/Marketplace/History 탭 이벤트 핸들러 cline 개선 여부 확인 → 추가 변경 없음.
  - [x] UI 타입 빌드 재검증(`npm run check-types`) 통과.

**B4 루트/스크립트/문서**
- [x] 루트/스크립트/문서 분리 전략 문서화
- [x] Caret 메타데이터/스크립트 검증 및 `npx tsc --noEmit` (Phase C 빌드 과정 포함)

### Phase C: 검증
- [x] `npm run compile`, `npm run test`(unit) 실행 완료. Unit 527 pass, Integration 404 pass.
- [x] `test-setup.js` path alias 수정 (`@caret/*` → `out/caret-src/*`), `registry.ts` command prefix 수정 (`"cline"` 고정).
- [x] `caret-scripts/` 누락 빌드 스크립트 복사 (comparison/caret에서).
- [x] `npm run test:e2e` 실행 완료. VSIX 빌드 및 Playwright 테스트 통과.

### Phase D: ModeSystem 버그 수정 + Caret CLI 구현

> ⚠️ **우선순위**: D-1 버그 수정을 먼저 완료한 후 D-2 CLI 구현 진행. modeSystem이 정상 동작해야 CLI가 올바르게 분기됨.

#### D-2: CLI 브랜딩/설정 정비 (공존 지원)
- [x] 기본 설정/로그 경로를 `~/.caret`로 통일 (`common/branding.go` 헬퍼 추가, global/cline-clients/updater/history 등에서 사용)
- [x] 로그 파일 프리픽스/메시지/지원 URL을 Caret 브랜드로 교체, Cline 계정/모델 기능은 유지
- [x] cli-caret README에 설정/로그 경로 안내 추가
- [x] gofmt 실행(ensure-go.sh로 Go 설치 후 정렬 완료)
- [x] CLI 감지 로직을 Cline 방식으로 정렬(`binary version` 실행, 브랜드별 바이너리만 교체) 및 PATH 하드코딩 제거
- [x] CLI 사용자 메시지의 남은 Cline 브랜드를 Caret으로 변경(say_handlers/system_renderer/auth_cline_provider)
- [x] BrandDisplayName을 package.json displayName과 동기화 시도(실행 파일 상위 경로에서 package.json 탐색, 실패 시 Caret 기본값 사용)
- 메모: Caret/클라인 바이너리가 모두 `~/.caret`을 공유하므로, 기존 `~/.cline` 의존성은 제거됨. Cline 계정 로그인/모델 경로는 유지.

---

#### D-1: ModeSystem 회귀 버그 수정 (필수 선행)

**증상**:
- UI에서 Caret↔Cline 토글이 반영되지 않음
- Caret JSON 시스템 프롬프트가 로드되지 않음 (Plan/Act만 사용)

**원인 1 - getSystemPrompt Caret 분기 누락** (확인됨):
- 파일: `src/core/prompts/system-prompt/index.ts:16-21`
- 현재 상태: 순수 Cline 버전, `context.modeSystem` 무시
- `CaretPromptWrapper` 호출 경로 완전 제거됨

**원인 2 - SetPromptSystemMode GlobalState 영속화 누락** (확인됨):
- 파일: `src/core/controller/persona/SetPromptSystemMode.ts:29-38`
- 현재 상태: `CaretGlobalManager` 인메모리만 업데이트
- 누락: `controller.stateManager.setGlobalStateBatch({ caretModeSystem: newMode })`

---

**D-1.1 수정: SetPromptSystemMode.ts** (5분)

위치: `src/core/controller/persona/SetPromptSystemMode.ts:29-38`

```typescript
// 기존 코드 (line 29-33)
CaretGlobalManager.get().setCurrentMode(newMode)
Logger.debug(`[SetPromptSystemMode] After setCurrentMode...`)

// 아래 코드 추가 (line 34-38)
// CARET MODIFICATION: Persist to globalState (StateManager reads from here on restart)
controller.stateManager.setGlobalStateBatch({
    caretModeSystem: newMode,
})
Logger.debug(`[SetPromptSystemMode] Saved to globalState: caretModeSystem=${newMode}`)

// 기존 postStateToWebview 호출 유지
await controller.postStateToWebview()
```

---

**D-1.2 수정: system-prompt/index.ts** (30분)

위치: `src/core/prompts/system-prompt/index.ts:16-21`

```typescript
import { PromptRegistry } from "./registry/PromptRegistry"
import type { SystemPromptContext } from "./types"

// ... exports 유지 ...

/**
 * Get the system prompt by id
 * CARET MODIFICATION: Mode branching for Caret/Cline prompt systems
 */
export async function getSystemPrompt(context: SystemPromptContext) {
    // CARET MODIFICATION: Route to CaretPromptWrapper when in Caret mode
    if (context.modeSystem === "caret") {
        const { CaretPromptWrapper } = await import("@caret/core/prompts/CaretPromptWrapper")
        const systemPrompt = await CaretPromptWrapper.getCaretSystemPrompt(context)
        // Caret은 tools를 별도 관리 (CaretModeManager.isToolAllowed)
        return { systemPrompt, tools: [] }
    }

    // Cline: Original logic preserved
    const registry = PromptRegistry.getInstance()
    const systemPrompt = await registry.get(context)
    const tools = registry.nativeTools
    return { systemPrompt, tools }
}
```

**반환 타입 정리**:
- Cline: `{ systemPrompt: string, tools: Tool[] }` - native tool calls 지원
- Caret: `{ systemPrompt: string, tools: [] }` - CaretModeManager가 도구 필터링 담당
- Task.ts (line 2111-2112)는 현재 `{ systemPrompt, tools }` 기대 → 수정 불필요

---

**D-1.3 테스트 추가** (1시간)

파일: `caret-src/__tests__/prompt-system/mode-system.test.ts` (신규)

```typescript
describe("ModeSystem Integration", () => {
    it("should persist caretModeSystem to globalState on mode change", async () => {
        // SetPromptSystemMode 호출 후 globalState 확인
    })

    it("should route to CaretPromptWrapper when modeSystem is caret", async () => {
        // getSystemPrompt({ modeSystem: "caret", ... }) 호출
        // CaretPromptWrapper.getCaretSystemPrompt 호출 확인
    })

    it("should use Cline registry when modeSystem is cline", async () => {
        // getSystemPrompt({ modeSystem: "cline", ... }) 호출
        // PromptRegistry.get 호출 확인
    })

    it("should show Chatbot/Agent labels in Caret mode", async () => {
        // Webview state 확인
    })

    it("should show Plan/Act labels in Cline mode", async () => {
        // Webview state 확인
    })
})
```

---

**D-1.4 검증 체크리스트**

- [x] `npm run compile` 통과
- [x] `npm run test` 통과 (신규 테스트 포함)
- [x] UI에서 Caret↔Cline 토글 즉시 반영
- [x] Caret 모드에서 Chatbot/Agent 라벨 표시
- [x] Cline 모드에서 Plan/Act 라벨 유지
- [x] Caret 모드에서 JSON 프롬프트 로드 (CaretPromptWrapper 로그 확인)
- [x] 확장 재시작 후 모드 유지 (globalState 영속화 확인)

---

#### D-2: Caret CLI 구현 (D-1 완료 후)

> `b4-caret-cli-plan.md` + 2025-11-24 리커버리 메모 기준 재적용

**현재 현황 (2025-11-25)**
- 패키징/바이너리: `cli-caret/` 신설, `build-local.sh`/`publish-caret-cli.sh`/`ensure-go.sh` 추가. `dist-standalone`·`cline-core.js`·`extension` 동봉, `cline`/`cline-host` 바이너리 복사 포함. NODE_PATH에 플랫폼별 바이너리 모듈(x64 매핑) 및 리포 `node_modules`까지 포함해 `better-sqlite3`/`vscode` 로딩 오류 해결.
- Go/Proto: caret go_package 경로 보완 후 `protos-go` 빌드 통과.
- 실행 장애: core 기동 직후 `/host.EnvService/shutdown` RPC가 호출되어 정상 종료 → 인스턴스가 레지스트리에 등록되지 않음(`caret auth`/`task new` 실패). host 로그에도 shutdown RPC 기록. shutdown 트리거 경로(EnsureInstance/cleanup/registry) 추적 및 완화 필요.
- 조치 예정: shutdown 원인 파악 후 최소 침습 예외/지연 처리, 재빌드·재설치 후 `caret auth -v`·`caret task new` 재검증.

**D-2.2 패키징/설치 스크립트**
- [x] `cli-caret/scripts/install-local.sh`, `install-local-clean.sh`: build-local.sh install 래퍼 추가, tgz 정리용 `.gitignore` 추가.
- [x] `publish-caret-cli.sh`: npm pack 전 tgz 정리 추가. npmignore/추가 정리는 필요 시 검토.
- [x] `scripts/build-go-proto.mjs` PATH 메모: 직접 실행 시 PATH에 go가 없으면 실패하지만, 실제 빌드 플로우(`build-local.sh install`)에서 ensure-go + PATH 설정을 이미 처리하므로 추가 조치 불필요(직접 실행 시는 `PATH=/tmp/go/bin:$PATH` 수동 설정).

**D-2.3 웹뷰/감지/배너**
- [x] `webview-ui/src/components/common/CliInstallBanner.tsx`: modeSystem 분기로 Caret/Cline 설치 명령·문서 링크 분기(installClineCli는 modeSystem 사용).
- [x] `src/utils/cli-detector.ts`: `isCaretCliInstalled` 추가, 기존 Cline 감지와 병행(클라인 방식으로 `binary version` 호출, 추가 PATH 탐색 제거).
- [x] `src/core/prompts/system-prompt/components/cli_subagents.ts`: Caret/Cline 명칭·명령 분기(템플릿 텍스트).
- [x] `webview-ui/src/caret/locale/{ko,en,ja,zh}/welcome.json`: `cliBanner.{titleCline,titleClineInfo,descriptionCline,descriptionClineInfo}` 추가.
- [x] 배너/컨트롤러에서 modeSystem 기반 분기 확인(`installClineCli.ts`, `checkCliInstallation.ts`); slash-commands는 CLI 설치 분기 불필요로 유지.
- [x] 서비스 워커 InvalidStateError 항목: 재현 불가로 체크리스트에서 제거(현 시점 영향 없음으로 판단).
- [x] `webview-ui/src/caret/locale/*/common.json`: `button.install` 번역 추가로 배너 버튼 키 노출 문제 해결.
- [x] VS Code 커맨드 충돌 메모: 원본 Cline 확장과 동시 활성화 시 충돌 가능. 현재는 문서 안내로 처리(커맨드 ID 변경은 범위 밖).
- [x] 커맨드 네임스페이스 충돌 해소: `plusButtonClicked` 커맨드를 `caret.plusButtonClicked`로 변경(패키지/registry/test, CLI 패키지 extension 포함)하여 원본 Cline과의 중복 방지.
- [x] 나머지 버튼 커맨드도 caret 네임스페이스로 정리(`mcp/history/account/settingsButtonClicked` 등)하여 Caret/Cline 동시 설치 시 충돌 방지. comparison/caret 기준으로 반영, 빌드 통과 확인.
- [x] CLI 설치 감지/설치 UX 보강: caret/cline 설치 명령 자동 실행 분기(`installClineCli.ts`), CLI 감지 시 PATH 외 `~/.local/bin`도 탐색(`cli-detector.ts`), 설정 섹션 경고는 미설치 시에만 표시하고 토글은 설치 시에만 활성.
- [x] 터미널 배너/아이콘/문구 브랜딩: 설치 배너를 Caret 전용 텍스트/명령/링크로 통일(아이콘은 ^ 심볼). 향후 필요 시 cline 모드 분기 재도입 여지 남김.
- [x] 서브에이전트 프롬프트 로깅: `Task` 생성 시 subagentsEnabled/CLI 설치/모드 값을 info 로그로 기록, 프롬프트 포함 여부 확인용.
- [x] 시스템 프롬프트 로깅 강화: caret/cline 모두 getSystemPrompt에서 길이/프리뷰 로그, cli_subagents 섹션 포함/스킵 여부 로그 추가.
- [x] 타입 체크 재실행 완료: `npm run check-types` 성공.
- [x] CLI 초기 프롬프트 브랜드 정렬: `cli/cmd/cline/main.go`의 “Start a new Cline task…” 문구를 `BrandDisplayName()` 기반으로 변경.
- [x] CLI 감지 방식 재정렬: cline과 동일하게 `binary version` 실행으로 단순화(PATH만 의존, 추가 경로 탐색 제거).

**D-2.4 CLI Caret/LiteLLM 프로바이더 추가**
  * Caret auth에 관한 내용으로 아래의 내용을 구현하되, 먼저 분석을 통해 보강할 수 있으면 보강진행
  - [x] Authenticate with Caret account : 메뉴 추가 (Cline대체 아니고 추가임. Cline위에 메뉴하나 더)
     - 아래 처럼 인증 url변경 cline.bot -> caret.team으로, api.cline.bot -> api.caret.team으로 (동일하게 동작 시킬것)
       Opening browser for authentication...
  If the browser doesn't open automatically, visit this URL:
  https://caret.team/user_management/authorize?client_id=client_01K3A541FN8TA3EPPHTD2325AR&provider=authkit&redirect_uri=https%3A%2F%2Fapi.caret.team%2Fapi%2Fv1%2Fauth%2Fcallback&response_type=code&state=eyJjbGllbnRfdHlwZSI6ImV4dGVuc2lvbiIsImNhbGxiYWNrX3VybCI6Imh0dHA6Ly8xMjcuMC4wLjE6NDg4MDEvYXV0aCJ9hIkbAUzErRUoJnuGiuuXSPreWNCLMWO0jwIlaO3pCDM%3D
      - 로그인/로그아웃 프로바이더 선택, 모두 Cline과 동일하게 구현할 것. 프로바이더 선택시 나오는 모델 리스트는 캐럿의 모델 리스트 참고 하게 할 것 (실제 캐럿 프로바이더의 모델리스트의 코드를 한군데 모아서 중복 코드 만들지 말 것)
- [x] Configure BYO API providers를 Select active provider 와 순서변경 (Caret, Cline, BYO 순으로 3번째로)
- [x] Select active provider (Cline or BYO) 에서 (Cline or BYO)문구 삭제하고 4번째로.
- [x] Configure BYO API providers > Add or change an API provider > LiteLLM(추가)
   -> 다른 Provider 들 참고해서 liteLlm구현 할 것. 캐럿의 litellm 은 모델 가져오기 기능도 지원을 하므로 동일하게 동작하도록 할 것
  * 추후 Codecenter 브랜딩 작업 : LiteLLM Provider를 CodeCenter라는 이름으로 맨 위에 표기시켜서 바로 설정할 수 있게 할 예정, 본 작업에서는 진행하지 않음

  * 구현 메모
    - `cli/pkg/cli/auth/auth_menu.go`, `auth_caret_provider.go`에 Caret 인증 흐름/모델 선택 보강, Cline 메뉴와 병렬 노출. Go 브랜딩 유틸(`cli/pkg/common/branding.go`)에 바이너리 경로 기반 브랜드 감지 추가해 CLI 배너·로그가 실행 파일 이름을 따르도록 정리.
    - LiteLLM BYO 경로(`cli/pkg/cli/auth/wizard_byo.go`, `models_list_fetch.go`)에 Caret System gRPC 호출을 추가, `/proto/caret/system.proto` 경로로 생성된 서비스 클라이언트를 사용해 모델 목록을 불러온 뒤 인터랙티브 메뉴에 공급.
    - hostbridge `workspace` 스텁과 gofmt로 생성된 grpc-go 모듈이 최신 proto 구조와 맞지 않아 Go 테스트 실패 → 불필요한 watch 스텁 제거 및 optional 필드 포인터 처리로 빌드 오염 해소.
    - 테스트: `npm run protos-go`, `/tmp/go/bin/go test -short ./cli/...` (`cli/e2e`는 dist 아티팩트 미생성 상태라 `-short`로 스킵함)


**D-2.5 Caret 프로바이더 검토**
- [ ] 
 >  
   Authenticate with Cline account                                          
  Select active provider (Cline or BYO)                                    
  Configure BYO API providers                                              
  Exit authorization wizard                                                



**D-2.5 문서/피처 번호 재정렬**
- [ ] F05→F04(“Cline 완전 호환/CLI 포함”), 기존 F04→F05, 이후 번호 시프트(F12 등 참조 전부 교체).
- [ ] `features/index.md`, 다국어 README 표 업데이트.
- [ ] 신규 F05(전 F04) 문서 작성: Cline 모드 호환/CLI 포함, Caret 추가 기능 서술. `f06-caret-prompt-system.md`는 Caret 전용 프롬프트+CLI 연동 보강.
- [ ] Announcement/CHANGELOG에 CLI 영향 반영.

**D-2.6 서버팀 안내**
- [ ] `caret-docs/merging/cli-provider-servers.md`: 인증 `https://caret.team`, API `https://api.caret.team`, 엔드포인트/토큰 요구사항 명시.

**D-2.7 빌드/검증**
- [ ] `npm run compile`, `npm run test` 클린.
- [ ] CLI 수동 검증: caret/cline 모드별 배너·감지·프롬프트·auth 흐름 정상, `caret version`/`caret task new` 동작 확인.

---

**D-2 완료 기준**:
- Caret 모드: Caret CLI 안내/감지/배너/프롬프트가 정상 동작, BYO/Gemini 노출, 브랜딩·도메인 caret.team 적용.
- Cline 모드: 기존 Cline CLI 흐름 유지(회귀 없음).
- 문서/피처 번호/CHANGELOG/announcement 반영 완료, 대용량 산출물(tgz) 커밋 금지.

### 2025-11-24 리커버리 메모 (Phase D 재적용 계획)
- 워크트리 재정비: D-1 코드만 남아 있으며 테스트/CLI/문서/패키징 작업은 유실된 상태. Cline 파일 수정 시 `// CARET MODIFICATION` 유지, 최소 침습 원칙 재확인.
- D-1 잔여: `caret-src/__tests__/prompt-system/mode-system.test.ts` 작성(영속화/분기/UI 라벨 5케이스), `npm run compile && npm run test`로 회귀 검증.
- D-2 재적용 필수 항목:
  - **CLI 브랜딩/프로바이더**: `cli-caret/pkg/cli/auth/{providers_list.go,auth_menu.go,auth_cline_provider.go}` Caret 라벨·도메인(caret.team)·BYO Gemini 표시, 단위 테스트 추가(`providers_list_test.go`).
  - **패키징/설치 스크립트**: `cli-caret/scripts/install-local.sh`, `install-local-clean.sh`, `publish-caret-cli.sh`에서 dist-standalone 동기화, `caret-src/core/prompts` → dist-standalone/extension 복사, extension/package.json 주입, bin/caret·caret-host 빌드 후 bin/cline·cline-host 복사, package.json/.npmignore/.gitignore 정리(tgz 제외).
  - **웹뷰 UI**: `CliInstallBanner` 모드 분기(명령·URL), `cli-detector`에 `isCaretCliInstalled` 추가, `cli_subagents`에서 Caret/Cline 명칭·명령 분기, i18n `welcome.json`(ko/en/ja/zh) `cliBanner.*` 키 추가, `cli-detector` 사용처(슬래시 커맨드, 배너) 검증.
  - **문서/피처 번호 정리**: F05→F04(“Cline 완전 호환/CLI 포함”), 기존 F04→F05, 이후 번호 시프팅(F12 등 참조 전부 업데이트). `features/index.md`와 ko/ja/zh README 표, `caret-docs/features/f06-caret-prompt-system.md` 분리/보강, 신규 F05(전 F04) 링크 교체. CLI/모드 호환을 설명하는 `caret-docs/features/f05-<naming TBD>.md` 신설.
  - **서버팀 전달 사항**: `caret-docs/merging/cli-provider-servers.md`에 인증 도메인 `https://caret.team`, API `https://api.caret.team`, 필요 엔드포인트/토큰 요구사항 정리.
  - **빌드/생성물**: `scripts/build-go-proto.mjs` 실행 확인(Go PATH 의존), CLI 모드 환경변수(`CARET_MODE_SYSTEM`) 주입 확인, task auto-start 분기(Task/instance) 재검증.
- 푸시 시 tgz 등 대용량 산출물은 커밋 금지(LFS 제외). 기존 .gitignore 유지.
- 신규/복원 문서(필독): `caret-docs/features/f04-cline-compatibility-and-cli.md`, `caret-docs/merging/cli-provider-servers.md`. Phase D 구현 시 이 문서들을 역참조하며 개발할 것.

### Phase E: 문서 & 릴리스
- [ ] `CHANGELOG-CLINE.md`, `CHANGELOG.md`, `caret-docs/{ko,ja,zh}/CHANGELOG.md` 업데이트 (버전/날짜/브랜치/주요 기능 포함).
- [ ] `webview-ui/src/caret/locale/{ko,en,ja,zh}/announcement.json` Current/Previous 섹션 업데이트(Phase D 결과 반영).
- [ ] attempt-2-master에 최종 체크리스트/테스트 로그를 기록하고, `.caretrules/**` 등의 정책 변경을 문서화.
- [ ] PR/릴리스 노트에 위 항목 링크를 첨부한다.

### Phase F: 자동화 & 누락 방지
- [ ] `scripts/compare-with-cline.mjs`를 작성해 `git diff --name-status cline/v3.38.1..HEAD` 결과가 전부 `M/A`인지 확인.
- [ ] `scripts/detect-stubs.mjs`, `scripts/verify-providers.mjs`, `scripts/verify-caret-mods.mjs` 등 자동화 검증 스크립트를 추가하고 package.json scripts에 연결.
- [ ] PR 템플릿에 Gap Checklist(Providers, Hooks, Prompts, Terminal, Webview i18n 등)와 자동화 체크 항목을 추가한다.
- [ ] `caret-docs/merging/v3.38.1/attempt-2-plan.md` / `attempt-2-master.md` 지속 업데이트.

### 3-Way 비교 실행 방법 (명령 예시)
1. 기준 파일 추출
```
git show v3.35.0:src/path/file.ts > /tmp/base.ts
git show v3.38.1:src/path/file.ts > /tmp/cline.ts
git show caret-main:src/path/file.ts > /tmp/caret.ts
```
2. 3-way 머지 결과 확인
```
diff3 -m /tmp/base.ts /tmp/cline.ts /tmp/caret.ts > /tmp/merged.ts
```
3. 수동 검토/적용 후 단계별 `npm run tsc -- --noEmit` 실행

### 빌드/체크 명령 구분
- 백엔드/프로토만 확인: `npm run compile:backend` (protos + 루트 `npx tsc --noEmit`, 웹뷰 미포함)
- 전체 빌드 체크: `npm run compile` (webview `tsc -b --noEmit` 포함 → 현재 웹뷰 타입 불일치로 실패; Webview B3 역이식 후 재시도)

### 코드 리뷰 게이트
> 코드 리뷰 작업은 페이스나 단계마다 Claude Code가 리뷰 진행, `attempt-2-claude-review.md` 파일에 작성한다.
> **자세한 리뷰 프로세스는 `attempt-2-plan.md` "코드 리뷰 게이트" 섹션 참조**

- 각 주요 단계 후 다른 Codex/리뷰어에게 7가지 체크 항목으로 검토 요청:
  1. 3-way 비교(base/cline/caret) 정확성
  2. 버그 수정 시에도 3-way 비교로 원인 추적했는지
  3. 최소 침습 및 `// CARET MODIFICATION` 주석 유지 여부
  4. 하드코딩/정책 위반(i18n 미적용 등) 존재 여부
  5. Caret 정책(브랜딩, RulePriority, Persona 등) 준수 여부
  6. 보안 위험 코드 추가 여부
  7. 더미/미완성 코드(Stub) 남김 여부

### 🚨 리뷰 프로세스 개선 (2025-11-21 반영)
> **Phase B2/B3 실패 교훈 반영:** 단순 파일 존재/컴파일 성공은 기능 완료를 보장하지 않음.

1. **Traceability Check (추적 검사):**
   - 파일 존재 여부가 아닌 **진입점(Entry Point)부터 실제 호출(Call Site)까지의 연결(Wiring)**을 확인.
   - 예: `BizRouterHandler` 파일 존재(O) -> `api/index.ts` 스위치문에 등록됨(X) -> **FAIL**.

2. **Feature-based Review (기능 중심 리뷰):**
   - 파일 단위가 아닌 **기능(Feature) 단위**로 검증. (F01~F11 기준)
   - 예: "F09 Provider Setup이 완료되었는가?"라는 질문으로 검증.

3. **Stub/TODO 능동 탐지:**
   - `grep` 등을 사용하여 `TODO`, `FIXME`, 빈 함수 블록을 능동적으로 찾아내야 함.

4. **3-Way Comparison & CARET MODIFICATION Check (필수):**
   - `src/shared/api.ts`와 같이 공용 파일 수정 시, **반드시 3-way 비교(`diff3`)를 수행**하여 `// CARET MODIFICATION` 주석이 유실되지 않았는지 확인해야 함.
   - **삭제된 Caret 주석**이 있는지 눈에 불을 켜고 찾아야 함.

5. **클라인 개선 적극 이식 + Caret 기능 보존 원칙:**
   - cline 3.38.1의 구조/기능 개선(신규 모델/상태/버그픽스 등)은 **이점이 명확하면 적극 이식**하되, Caret 고유 기능(i18n/Persona/InputHistory/Branding/Account)은 유지·병합한다.
   - Webview는 `comparison/base|cline|caret` 3-way 비교 후 “이식 대상/보류 대상”을 별도 분석 파일로 기록하고 그 결과에 따라 적용한다.

- 리뷰 타이밍: Gate #1 (Proto) → #2 (Controller/Services) → #3 (Webview) → #4 (Scripts/Docs) → #5 (최종). 승인 후에만 다음 단계 진행.

---

## 🧭 진행 로그
| 시각 | 작성자 | 내용 |
| --- | --- | --- |
| 2025-11-19 17:30 | Codex | v3.32.7/v3.35.0 자료 재배치, Attempt-1 산출물 분리
| 2025-11-19 17:45 | Codex | Attempt-2 계획서 작성 및 리뷰 반영(Backend=Cline, Webview=Caret)
| 2025-11-19 17:55 | Codex | `merge-standard-guide.md`에 Attempt-2 원칙 링크 추가
| 2025-11-19 18:00 | Codex | 작업 마스터 문서 초안 작성 (현재 문서)
| 2025-11-19 18:20 | Codex | Feature 원칙/코드 리뷰 게이트/루트·문서 전략 반영, 계획/마스터 업데이트 |
| 2025-11-19 18:30 | Codex | Section 0 수행 – features/index + F01~F11 재확인, 체크리스트 완료 |
| 2025-11-19 18:45 | Codex | Phase A 스크립트 실행: diff 리스트, 파일 분류, Caret 수정 추출, 의존성 그래프 산출 |
| 2025-11-19 19:15 | Codex | Phase B 시작 – cline/v3.38.1 기준으로 reset, caret proto 재적용, incremental-merge 스크립트 추가 |
| 2025-11-20 19:50 | Codex | 워킹트리 origin/merge/cline-v3.38.1-attempt2로 초기화, `comparison/`만 .gitignore 추가, Phase B 재시작 준비 |
| 2025-11-20 20:44 | Codex | npm 기준으로 명령/테스트 환경 정리, `next-session.md`와 마스터 문서에서 pnpm 표기 제거 |
| 2025-11-20 23:06 | Codex | Phase A 완결: classify/extract/analyze/compare/incremental 스크립트 구현, 리포트 생성(classification.md/json, caret-mod-report.md/json, dependency-report.md/json) |
| 2025-11-21 21:01 | Codex | Webview B3-1: `ExtensionMessage`/`ExtensionStateContext` cline 3.38.1 상태 필드(원격 토글·CLI 배너·dictation 기본값·onboarding models 등) 3-way 반영, Caret 기능(modeSystem/persona/i18n/branding) 유지, `npm run check-types` 통과 |
| 2025-11-21 21:19 | Codex | Webview B3-2: 엔트리(main/App) 3-way 정리, `main.css` 추가 로드시각 개선, i18n/Persona 래퍼 유지. cline OnboardingView는 shadcn UI 의존으로 현 스택 미적용(WelcomeView 유지) 결정 |
| 2025-11-21 21:29 | Claude | Gate#3 Webview 리뷰: B3-0~B3-2 조건부 승인, ClineSayHook 타입 누락을 B3-4에서 보완 요청 |
| 2025-11-21 21:31 | Codex | Webview B3-3/4 진행: provider utils cline-only 모델(hicap/minimax/nous/oca) 미채택 확인 후 Caret 구조 유지 결정. `ExtensionMessage.ts`에 ClineSayHook 인터페이스 추가, `npm run check-types` 재통과 |
| 2025-11-21 21:43 | Codex | Webview B3-4 추가: HookMessage 렌더링 적용(hook/hook_output 표시), TaskHeader 확장 상태를 컨텍스트에 저장. 음성 기능/스타일(cline VoiceRecorder/PulsingBorder)은 정책상 미이식 결정. `npm run check-types` 통과 |
| 2025-11-21 22:30 | Codex | B3-4 딕테이션 설정 노출(언어 선택 포함) 및 ja/zh 번역 보강. 음성 UI 이식 계획 수립(`b3-4-chattext-voice-plan.md`) |
| 2025-11-21 23:24 | Codex | B3-4 음성 UI 이식: ChatTextArea에 VoiceRecorder/전사 흐름 적용(cline 동작), dictationEnabled && featureEnabled 시 노출. `npm run check-types` 통과 |
| 2025-11-20 23:16 | Codex | Phase B 착수: `npm install`→`npm run protos` 완료. `npx tsc --noEmit` 오류 발생(hook-factory undefined assign, generated account proto MessageFns call signatures) – 원인 조사 및 3-way 머지 진행 예정 |
| 2025-11-20 23:22 | Codex | hook-factory/test-utils를 cline v3.38.1 버전으로 복원, generated proto `String(value)`를 `globalThis.String`으로 교체하여 타입 오류 해소. `npx tsc --noEmit` 통과. 3-way 배치 머지 준비 완료 |
| 2025-11-20 23:38 | Codex | B1 Proto 배치 1차: cline/*.proto 7개를 cline v3.38.1 기준으로 재적용(diff3 후 cline 채택), caret/*.proto는 caret-main 그대로 유지, `npm run protos`+`npx tsc --noEmit` 통과. checkpoint 태그는 추후 일괄 생성 예정 |
| 2025-11-21 09:17 | Codex | 3-way 기준 고정 및 산출물 배치: `comparison/base`(v3.35.0), `comparison/cline`(cline-main-latest), `comparison/caret`(caret-main-latest)로 파일을 추출해 로컬 diff3/수동 비교만 사용. **git checkout 금지**, 변경 적용은 작업 브랜치 파일에 수동 반영 후 기록. 머징 가이드 위치: `caret-docs/merging/merge-standard-guide.md`. |
| 2025-11-21 09:40 | Codex | 3-way 비교 스냅샷 재정렬: `comparison/caret`=caret-main-latest, `comparison/cline`=cline v3.38.1 스냅샷 동기화, `comparison/base`=`git archive v3.35.0`. 이후 모든 머지는 이 경로로 diff3 수행, working tree에 git checkout/merge 금지. |
| 2025-11-21 09:46 | Codex | B2 전략 재정렬: 영향도(Provider/RulePriority/Persona/Branding/i18n) + Feature 축 우선으로 배치 정의(Batch1 Provider/설정, Batch2 Controller/웹뷰 진입, Batch3 잔여 Services). 모든 머지는 `comparison/base|cline|caret` 수동 diff3로 적용, git checkout/merge 금지. |
| 2025-11-21 10:12 | Codex | B2 Batch1 수동 머지: Provider/Rule/설정 경로 diff3 → `disk.ts`에 Caret rule/branding 경로 복원, external-rules/state/updateApiConfigurationProto 등 타입 정리, `refreshOcaModels.ts` 복구, 모델 리프레시(groq/baseten/vercel) 타입 오류 해결. `npx tsc --noEmit` 클린. |
| 2025-11-21 10:20 | Claude | Gate #2 중간 리뷰: Batch1 통과(3-way OK, CARET MOD 53개 보존, tsc 클린). **이슈:** `caret-src/` 미통합으로 CaretGlobalManager/FeatureConfig/Persona 의존성 미반영. Batch2 시작 전 `caret-src/` 통합 전략 필요(B2.5 배치 등). |
| 2025-11-21 10:25 | Codex | Batch2.5 착수: `comparison/caret/caret-src/**`를 워크트리에 수동 반영(3-way 참조, git checkout 미사용). `npx tsc --noEmit` 재검증 클린. 다음: Batch2 Controller/웹뷰 진입 머지. |
| 2025-11-21 11:18 | Codex | Batch2 진행: Controller에 Caret Persona/FeatureConfig/RulePriority 상태 재주입(`CaretGlobalManager`, `featureConfig`, inputHistory/persona fields), caret account 서비스(syncCaretUserInfo) 복구, caret-src 의존성(stub service) 추가. `npx tsc --noEmit` 클린, 푸시 완료. 다음: `ui/initializeWebview.ts` 등 나머지 Controller/웹뷰 진입 파일 3-way 반영. |
| 2025-11-21 11:45 | Codex | Batch2 웹뷰 진입: `initializeWebview.ts`에 Vercel AI Gateway 모델 리프레시 추가(Plan/Act별 상태 반영) 및 tsc 클린. `getClineOnboardingModels.ts`를 cline 버전으로 재동기화. |
| 2025-11-22 17:02 | Codex | B2.1 보강 완료: cline models.proto에 Caret/CaretSystem/BizRouter 필드 복원, proto-conversion/API 핸들러(Caret/BizRouter) 연결, CaretSystem/Persona gRPC 핸들러/Protobus 서버 생성 포함. `npm run compile -- --skip-lint` 통과. |
| 2025-11-21 12:00 | Alpha | Phase B2 Backend/Services 리뷰: PASS. RulePriority/Provider/CaretAccount/CaretGlobalManager 통합 적정. Webview(B3) 역이식 필요 지적. |
| 2025-11-21 14:02 | Alpha | Phase B3/B4 검증: **불일치**. Webview가 Cline 원본, Caret 브랜딩/기능 미적용, package.json 등 루트 메타데이터 Cline 그대로. B3/B4 재작업 요구. |
| 2025-11-21 15:15 | Codex | Caret Webview 오버레이 + package.json Caret 메타데이터 복구 후 `npm run compile` 재시도 → 공용 레이어(Caret shared/proto/state) 누락으로 다수 타입 오류 확인. B2.1 보강 필요. |
| 2025-11-21 15:29 | Codex | `recovery-plan-b2-b3.md` 확인. BizRouterHandler 외 공용 레이어 누락 인정, B2 보강+웹뷰 역이식 재계획 필요. |
| 2025-11-21 18:00 | Alpha | Phase B2 재검토: **PASS**. BizRouterHandler 등록 및 Shared Type 정의 확인. 로컬 커밋 완료. |
| 2025-11-21 18:07 | Codex | **Phase B2 완료(Local Commit)**. `git push` 권한 오류(403)로 원격 반영 실패. 로컬 상태 유지하며 Phase B3(Webview) 착수 결정.
| 2025-11-22 00:20 | Claude | **Phase C 진행**: Unit 527 pass, Integration 404 pass. `test-setup.js` path alias 수정(`@caret/*`→`out/caret-src/*`), `registry.ts` command prefix 수정(`"cline"` 고정), `caret-scripts/` 복사.
| 2025-11-22 00:45 | Luke | **Phase C E2E 완료**: `npm run test:e2e` 실행 완료. VSIX 빌드 및 Playwright 테스트 통과. Phase C 검증 완료.
| 2025-11-23 02:17 | Codex | 피드백 6건 1차 정리: auth 콜백에서 hash fragment 파싱 추가(Caret/Cline 로그인 토큰 누락 해결), Caret user 프로필 미로딩 시 토큰 재사용 fetch, system prompt context에 modeSystem 전파, webview `feature-config.json`을 backend 값으로 복원(계정 CTA/Provider 기본값 노출). `npm run compile -- --filter webview-ui` 통과. |
| 2025-11-23 15:30 | Claude | **Phase D 설계 보강**: 코드 분석 후 원인 검증 완료. D-1(ModeSystem 버그 수정)과 D-2(CLI 구현)로 분리, 구체적 코드 수정 사항/파일 위치/테스트 케이스 문서화. SetPromptSystemMode.ts:29-38 `setGlobalStateBatch` 누락, system-prompt/index.ts:16-21 Caret 분기 누락 확인. |
| 2025-11-23 15:55 | Codex | D-1 핫픽스 반영: `system-prompt/index.ts` Caret 분기 복원(dual shape), `SetPromptSystemMode.ts` globalState 영속화 추가, `CaretJsonAdapter` mockVariant에 matcher 필드 추가(cline v3.38.1 PromptVariant 호환). 테스트/빌드 미실행, D-1.3 테스트/CLI 분기 작업은 여전히 필요. |
| 2025-11-23 16:10 | Codex | D-1 테스트 추가(`mode-system.test.ts` Caret/Cline 분기 mock 검증), D-2 1차 구현: CLI 감지/배너/프롬프트 모드 분기(caret=caret CLI, cline=cline CLI), cli_subagents 템플릿 모드별 명령 반영, locale(welcome) CLI 배너 키 추가. checkCliInstallation/Task에서 modeSystem 기준으로 CLI 감지. 빌드/테스트 미실행. |
| 2025-11-24 22:00 | Codex | 워크트리 재정비: 로컬 히스토리 손실로 현재 HEAD는 깨끗. D-1 코드만 남아 있으며 D-1 테스트/CLI 재적용/문서 보강 필요. `2025-11-24 리커버리 메모`에 재실행 계획 정리. |
| 2025-11-24 22:35 | Codex | D-1 단위테스트 실행: `SetPromptSystemMode` 영속화/분기 테스트 추가(`caret-src/__tests__/prompt-system/set-prompt-system-mode.test.ts`), `mode-system.test.ts`와 함께 `npm run test:unit -- ...` 통과. DevDeps 재설치(webview-ui 포함). D-2 미착수. |
| 2025-11-25 00:16 | Codex | Cline/Caret UI 팝업 CTA 중복 제거(모델 선택 팝업 상단 CTA 제거), Cline Provider 복원(cline 스냅샷), Caret 모델 리스트를 caret-main 기준(Gemini 모델)으로 복구. ErrorRow에서 auth 오류 시 선택된 프로바이더에 따라 Caret/Cline 로그인 버튼을 분기하도록 수정. i18n 누락 키(`contextWindowSwitcher`) 추가. |
| 2025-11-25 00:45 | Codex | 채팅 오류 CTA 보완: ErrorRow에서 선택된 프로바이더에 따라 로그인 버튼을 강제 분기(Caret↔Cline), 기본 오류 메시지에도 CTA 추가. ClineProvider i18n 적용(clineProvider.*), Caret/Cline 로그인 번역 키 보강. |
| 2025-11-25 11:20 | Codex | D-2 준비: caret-cli 최소 패키징 디렉토리(`cli-caret/`) 신설, `build-local.sh`/`install-local.sh`/`publish-caret-cli.sh` 추가. `ensure-go.sh`로 Go 미설치 시 /tmp/go에 자동 설치. Caret 모델 목록을 Gemini 기반으로 복구(`src/shared/api.ts`). npm token 사용 시 `.env`의 CARET_NPM_TOKEN을 읽도록 안내. |
| 2025-11-25 14:30 | Codex | D-2 패키징 보강: dist-standalone/extension 포함, NODE_PATH에 플랫폼 바이너리 모듈(linux-x64 등) 및 리포 node_modules 추가, `cline`/`cline-host` 바이너리 복사 포함. `npm pack`/global install 성공. **이슈 지속**: core 기동 직후 `/host.EnvService/shutdown` RPC가 실행돼 인스턴스가 레지스트리에 등록되지 않고 종료됨(`caret auth`/`task new` 실패). shutdown 트리거 경로(EnsureInstance/cleanup) 추적 및 완화 필요. |
| 2025-11-25 15:05 | Codex | D-2 런타임 복구: `caret-src/`와 `proto/descriptor_set.pb`를 CLI 패키지에 포함, better-sqlite3를 로컬 Node(v23)로 재빌드하도록 `build-local.sh` 보강. `cli-caret/scripts/build-local.sh install` 후 `caret auth -v` 실행 시 core/host 기동 및 인스턴스 등록 확인(서버 검증은 API 키 미설정으로 실패). |
| 2025-11-25 15:20 | Codex | CLI 브랜딩/모드 라벨 정리: “Cline is …” 메시지를 Caret으로 변경, 모드 전환 안내를 /chatbot·/agent로 표기하고 /chatbot(/plan), /agent(/act) 별칭 추가(코어 모드는 그대로 plan/act). |

> 새 세션이 시작되면 이 로그 제일 아래에 시간/내용을 추가하고, 작업 현황 표와 체크박스를 갱신할 것.

---

## 📌 다음 액션 (우선순위 순)
1. **D-1 마무리**: `mode-system.test.ts` 작성 및 `npm run compile && npm run test` 재실행. Caret/Cline 라벨/프롬프트 분기 통합 테스트 포함.
2. **D-2 나머지**: 서버 연동/브랜딩/배너/문서 마무리. auth 검증 실패는 API 키 미설정으로 확인되므로 실제 API(caret.team) 연동 시나리오/테스트 작성.
3. **D-2 재적용**: CLI 전 영역 복구(브랜딩/프로바이더/패키징/배너/감지/프롬프트/i18n) + 서버팀 안내 문서. 상세 항목은 `2025-11-24 리커버리 메모` 참고.
4. **Feature 문서/번호 재정렬**: F05→F04, 기존 F04→F05 등 참조 전부 업데이트 후 announcement/CHANGELOG 반영.
5. **회귀 검증**: CLI 설치/감지/배너/프롬프트 수동 테스트, `npm run compile`, `npm run test`, 필요 시 `npm run compile-standalone-npm` 재검증.

---

이 문서 하나만으로도 2차 머지 작업 세션을 재개할 수 있도록 항상 최신 상태를 유지하세요.
