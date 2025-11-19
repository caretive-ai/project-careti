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
5. **테스트 환경**: Node 20, Playwright 의존성 설치, `pnpm run compile` + `pnpm run test` + `pnpm run test:e2e` 통과 후에만 완료로 간주.

---

## ✅ 현재 진행 현황 (2025-11-19 18:00)
| 단계 | 설명 | 상태 | 비고 |
| --- | --- | --- | --- |
| 준비-0 | 머징 디렉토리 정리, v3.32.7/v3.35.0 아카이브 분리 | ✅ 완료 | 버전별 폴더 생성
| 준비-1 | Attempt-2 실행 계획 작성 (`attempt-2-plan.md`) | ✅ 완료 | Backend=Cline / Webview=Caret 원칙 명시
| 준비-2 | 상위 표준 문서 업데이트 (`merge-standard-guide.md`) | ✅ 완료 | Attempt-2 참조 문구 추가
| 준비-3 | 작업 마스터 파일 작성 (`attempt-2-master.md`) | 🔄 진행중 | 본 문서 업데이트 중
| Phase A | 파일 매트릭스 & 자동 추출 스크립트 작성 | ⏳ 예정 | classify/extract 스크립트 필요
| Phase B | 카테고리별 점진적 머지 + Scripts/Root/Docs 처리 | ⏳ 예정 | incremental-merge.sh 필요
| Phase C | 통합 테스트 & E2E 복구 | ⏳ 예정 | Node20 환경 준비 필요
| Phase D | 문서·CHANGELOG·announcement 업데이트 | ⏳ 예정 | 릴리스 체크리스트 필요
| Phase E | 누락 방지 자동화 및 체크리스트 업데이터 | ⏳ 예정 | compare-with-cline.mjs, PR 템플릿 반영

> ⚠️ 진행 중/예정 단계는 작업 도중에 반드시 상태 갱신. 새로운 AI 세션이 시작되면 이 표를 먼저 확인하고 업데이트할 것.

---

## 🗂️ 세부 작업 목록

### Phase A: 분석 및 도구 준비
- [ ] `scripts/classify-files.ts`: `git diff --name-only cline/v3.35.0..cline/v3.38.1` vs `cline/v3.35.0..merge/cline-v3.34.0-method3` 결과를 비교해 파일별 전략(`AUTO_ADOPT`, `AUTO_KEEP`, `SIMPLE_MERGE`, `COMPLEX_MERGE`, `PROTO_MERGE`, `UI_MERGE`, `MANUAL_REVIEW`)과 우선순위를 JSON/Markdown으로 출력.
- [ ] `scripts/extract-caret-mods.ts`: CARET 주석, Proto 1072+, `caret-src/**` 등의 커스텀 자산을 자동 수집하고 보고서 생성.
- [ ] `scripts/analyze-dependencies.ts`: Provider/Transform/Controller 간 의존성 그래프 생성(선택) – 충돌 예상 지점 기록.

### Phase B: 점진적 머지
- [ ] `scripts/incremental-merge.sh`: 카테고리별 patch를 적용하고 단계마다 `npm run compile` 확인.
- [ ] Proto(16개) → Controller(20개) → Services/API(15개) → Webview(선택 구간) 순으로 진행. 각 카테고리 완료 시 git 태그/체크포인트 남김.
- [ ] Webview는 Caret 버전을 유지하면서 Cline 변경 구간만 역으로 이식한다는 규칙을 파일별로 문서화.
- [ ] 루트 파일(`package.json`, `pnpm-lock.yaml`, `.vscode/`, `.github/`, `playwright.config.ts`)과 스크립트(`scripts/*.sh`, `caret-scripts/**`)를 별도 분류해 Cline → Caret 오버레이 전략을 문서화한다.
- [ ] `docs/**`, `caret-docs/**`, `.caretrules/**`, `.claude/**` 변경 내역을 attempt-2-master에 기록하고, i18n/정책 누락 여부를 확인한다.

### Phase C: 검증
- [ ] `pnpm run compile`, `pnpm run test`(unit), `pnpm run test:e2e` 실행. Node20 + `npx playwright install-deps` 필수.
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

---

## 🧭 진행 로그
| 시각 | 작성자 | 내용 |
| --- | --- | --- |
| 2025-11-19 17:30 | Codex | v3.32.7/v3.35.0 자료 재배치, Attempt-1 산출물 분리
| 2025-11-19 17:45 | Codex | Attempt-2 계획서 작성 및 리뷰 반영(Backend=Cline, Webview=Caret)
| 2025-11-19 17:55 | Codex | `merge-standard-guide.md`에 Attempt-2 원칙 링크 추가
| 2025-11-19 18:00 | Codex | 작업 마스터 문서 초안 작성 (현재 문서)

> 새 세션이 시작되면 이 로그 제일 아래에 시간/내용을 추가하고, 작업 현황 표와 체크박스를 갱신할 것.

---

## 📌 다음 액션 (우선순위 순)
1. Phase A 스크립트 세트(classify/extract/analyze) 작성 시작 → 완료 시 체크박스 갱신.
2. Node 20 + Playwright 의존성 설치 여부 재확인 (`next-session.md` 메모 참조) – 필요 시 환경 준비.
3. 점진적 머지 스크립트 뼈대 작성 후 Proto 카테고리부터 병합 착수.

---

이 문서 하나만으로도 2차 머지 작업 세션을 재개할 수 있도록 항상 최신 상태를 유지하세요.
