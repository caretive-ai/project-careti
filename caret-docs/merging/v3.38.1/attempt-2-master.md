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
| Phase B | 카테고리별 점진적 머지 + Scripts/Root/Docs 처리 | ▶ 진행 중 | `npm install`/`npm run protos` 완료, `npx tsc --noEmit` 클린(Generated String shadow fix, hook-factory를 cline 버전으로 복원). 이제 3-way 소규모 배치 머지 착수.
| Phase C | 통합 테스트 & E2E 복구 | ⏳ 예정 | Node20 환경 준비 필요
| Phase D | 문서·CHANGELOG·announcement 업데이트 | ⏳ 예정 | 릴리스 체크리스트 필요
| Phase E | 누락 방지 자동화 및 체크리스트 업데이터 | ⏳ 예정 | compare-with-cline.mjs, PR 템플릿 반영

> ⚠️ 진행 중/예정 단계는 작업 도중에 반드시 상태 갱신. 새로운 AI 세션이 시작되면 이 표를 먼저 확인하고 업데이트할 것.

---

## 🗂️ 세부 작업 목록

### Section 0: Caret Feature 원칙 재확인
- [ ] `caret-docs/features/index.md` 및 F01~F11 문서 빠르게 훑기
- [ ] 핵심 요소 체크:
  - [ ] F01 CommonUtil / F05 RulePriority (`.caretrules` 우선순위, disk.ts 확장)
  - [ ] F02 Multilingual i18n / F03 Branding UI (4개 언어, Caret/CodeCenter 테마)
  - [ ] F04 CaretAccount / F07 Persona System (CaretGlobalManager, webview context)
  - [ ] F06 Prompt System / F10 Input History / F11 Knowledge Parity
  - [ ] F08 FeatureConfig / F09 Provider Setup (BizRouter, Minimax, Remote config)
- [ ] 머징 의사결정 기준을 feature 요구사항에 맞춤

### Phase A: 분석 및 도구 준비
- [x] `scripts/classify-files.ts`: `git diff --name-only v3.35.0..v3.38.1` vs `v3.35.0..merge/cline-v3.34.0-method3` 결과를 비교해 파일별 전략(`AUTO_ADOPT`, `AUTO_KEEP`, `SIMPLE_MERGE`, `COMPLEX_MERGE`, `PROTO_MERGE`, `UI_MERGE`, `MANUAL_REVIEW`)과 우선순위를 JSON/Markdown으로 출력.
- [x] `scripts/extract-caret-mods.ts`: CARET 주석, Proto 1072+, `caret-src/**` 등의 커스텀 자산을 자동 수집하고 보고서 생성.
- [x] `scripts/analyze-dependencies.ts`: Provider/Transform/Controller 간 의존성 그래프 생성 – 충돌 예상 지점 기록.
- [x] `upstream-files.txt` / `caret-files.txt` 생성 및 diff 추적.

### Phase B: 점진적 머지
- [ ] `scripts/incremental-merge.sh` 구현: 카테고리별 patch 적용 + 단계별 `npm run tsc -- --noEmit` 확인
- [ ] 파일 매트릭스 작성: Proto(16)·Controller(20)·Services/API(15)·Webview(선택) 각 파일명/전략/Base·Cline·Caret/작업 방식 명시
- [ ] 5~10개 파일 소규모 배치로 처리 후 검증, 성공 시 체크포인트 태그 남기기
- [ ] Webview 역이식 규칙 문서화(Caret 유지 + Cline 변경분만 역이식 기준 정의)
- [ ] 루트/스크립트/문서 분리 전략 문서화 및 이력 기록

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

### 코드 리뷰 게이트
> **자세한 리뷰 프로세스는 `attempt-2-plan.md` "코드 리뷰 게이트" 섹션 참조**

- 각 주요 단계 후 다른 Codex/리뷰어에게 7가지 체크 항목으로 검토 요청:
  1. 3-way 비교(base/cline/caret) 정확성
  2. 버그 수정 시에도 3-way 비교로 원인 추적했는지
  3. 최소 침습 및 `// CARET MODIFICATION` 주석 유지 여부
  4. 하드코딩/정책 위반(i18n 미적용 등) 존재 여부
  5. Caret 정책(브랜딩, RulePriority, Persona 등) 준수 여부
  6. 보안 위험 코드 추가 여부
  7. 더미/미완성 코드(Stub) 남김 여부
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

> 새 세션이 시작되면 이 로그 제일 아래에 시간/내용을 추가하고, 작업 현황 표와 체크박스를 갱신할 것.

---

## 📌 다음 액션 (우선순위 순)
1. Phase A 스크립트 세트(classify/extract/analyze) 작성 시작 → 완료 시 체크박스 갱신.
2. Node 20 + Playwright 의존성 설치 여부 재확인 (`next-session.md` 메모 참조) – 필요 시 환경 준비.
3. 점진적 머지 스크립트 뼈대 작성 후 Proto 카테고리부터 병합 착수.

---

이 문서 하나만으로도 2차 머지 작업 세션을 재개할 수 있도록 항상 최신 상태를 유지하세요.
