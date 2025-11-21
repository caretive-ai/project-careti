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

## ✅ 현재 진행 현황 (2025-11-20 20:22)
| 단계 | 설명 | 상태 | 비고 |
| --- | --- | --- | --- |
| 준비-0 | 머징 디렉토리 정리, v3.32.7/v3.35.0 아카이브 분리 | ✅ 완료 | 버전별 폴더 생성
| 준비-1 | Attempt-2 실행 계획 작성 (`attempt-2-plan.md`) | ✅ 완료 | Backend=Cline / Webview=Caret 원칙 명시
| 준비-2 | 상위 표준 문서 업데이트 (`merge-standard-guide.md`) | ✅ 완료 | Attempt-2 참조 문구 추가
| 준비-3 | 작업 마스터 파일 작성 (`attempt-2-master.md`) | ✅ 완료 | 리뷰 피드백 반영, 코드 리뷰 게이트 정의
| Section 0 | Caret Feature 원칙 재확인 (F01~F11) | ✅ 완료 | features/index.md/F01~F11 재검토
| Phase A | 파일 매트릭스 & 자동 추출 스크립트 작성 | ✅ 완료 | classify/extract/analyze/compare/incremental 구현 및 리포트 생성
| Phase B | 카테고리별 점진적 머지 + Scripts/Root/Docs 처리 | ▶ 진행 중 | **B2(Backend/공용 레이어) 완료(원격 반영)**, B3(Webview) 역이식 진행 중. CARET 주석·3-way 원칙 재확인 필요. |
| Phase C | 통합 테스트 & E2E 복구 | ⏳ 예정 | B3/B4 재작업 완료 후 재착수. 현 시점 unit hooks 테스트 실패.
| Phase D | 문서·CHANGELOG·announcement 업데이트 | ⏳ 예정 | 릴리스 체크리스트 필요
| Phase E | 누락 방지 자동화 및 체크리스트 업데이터 | ⏳ 예정 | compare-with-cline.mjs, PR 템플릿 반영

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

**B3 Webview**
- [ ] Webview 역이식 원칙 문서화(Caret 유지 + Cline 변경분만 역이식)
- [ ] Caret Webview 전면 오버레이 후 Cline v3.38.1 변경분 역이식(UI_MERGE/SIMPLE_MERGE 배치)
- [ ] 체크포인트 태그 남기기

**B4 루트/스크립트/문서**
- [ ] 루트/스크립트/문서 분리 전략 문서화
- [ ] Caret 메타데이터/스크립트 검증 및 `npx tsc --noEmit`

### Phase C: 검증
- [ ] `npm run compile`, `npm run test`(unit), `npm run test:e2e` 실행. Node20 + `npx playwright install-deps` 필수.
- [ ] Attempt-1에서 누락된 시나리오(Providers, Hooks, Settings, Terminal 모드, LiteLLM 로그 등)를 수동/자동 테스트로 검증.

### Phase D: 문서 & 릴리스
- [ ] `CHANGELOG-CLINE.md`, `CHANGELOG.md`, `caret-docs/{ko,ja,zh}/CHANGELOG.md` 업데이트 (버전/날짜/브랜치/주요 기능 포함).
- [ ] `webview-ui/src/caret/locale/{ko,en,ja,zh}/announcement.json` Current/Previous 섹션 업데이트, 내용이 CHANGELOG와 일치하는지 확인.
- [ ] attempt-2-master에 최종 체크리스트/테스트 로그를 기록하고, `.caretrules/**` 등의 정책 변경을 문서화.
- [ ] PR/릴리스 노트에 위 항목 링크를 첨부한다.

### Phase E: 자동화 & 누락 방지
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

> 새 세션이 시작되면 이 로그 제일 아래에 시간/내용을 추가하고, 작업 현황 표와 체크박스를 갱신할 것.

---

## 📌 다음 액션 (우선순위 순)
1. **B2.1 공용 레이어 보강**: `src/shared/api.ts` Caret/bizrouter/vercel 필드 병합, `@shared/CaretSettings`, `@shared/Languages`, `src/shared/webview/types`, Caret gRPC 클라이언트 export, `ExtensionStateContext` Caret 필드(modeSystem/persona/inputHistory 등) 추가 → `npm run compile:backend`.
2. **B3 Webview 재역이식**: Caret Webview 유지 + Cline v3.38.1 변경분 역이식(UI_MERGE 배치) → `npm run compile`.
3. **B4 Root/Docs 재확인**: package.json 등 메타데이터/스크립트 검증 → `npm run compile`.
4. **테스트 재개(Phase C)**: 위 완료 후 `npm run test` → `npm run test:e2e`. Hook 테스트 출력 누락 이슈 재점검.

---

이 문서 하나만으로도 2차 머지 작업 세션을 재개할 수 있도록 항상 최신 상태를 유지하세요.
