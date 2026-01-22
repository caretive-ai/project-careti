# Cline v3.38.1 2차 머지 실행 계획

**작성일:** 2025-11-19
**작성자:** Codex (GPT-5)
**목표:** Cline v3.38.1 전체 코드를 베이스로 다시 도입하고, Careti 고유 기능을 최소 침습으로 재적용해 완전한 병합을 달성한다.

---

## 1. 전략 요약
- **접근법:** `Cline-Base + Careti-Overlay` (Full upstream checkout 후 Careti 변경 재적용)
- **브랜치:** `merge/cline-v3.38.1-attempt2`
- **핵심 원칙:**
  - Upstream 태그(`cline/v3.38.1`)를 그대로 가져와 파일 누락을 허용하지 않는다.
  - **Backend/Proto는 Cline을 기준으로 삼고**, Careti 고유 로직만 재주입해 최소 침습으로 정리한다.
  - **Webview는 Careti 버전을 기준으로 유지**하되, Cline이 분기 이후 업데이트한 구간만 역으로 이식한다(이전 작업과 동일한 방식).
  - Careti 변경은 `CARETI MODIFICATION`/`careti-*` 디렉터리 기준으로 추출해 재적용한다.
  - 자동화 점검(`git status`, `rg --files`)으로 upstream 대비 삭제된 파일이 없는지 수시 확인한다.

---

## 0. Careti Feature 원칙 재확인
- 작업 시작 전에 `careti-docs/features/index.md`와 F01~F11 문서를 빠르게 훑어 Careti 고유 기능과 개발 원칙을 상기한다.
- 핵심 지켜야 할 요소:
  1. **F01 CommonUtil / F05 RulePriority**: `.agents/context` 우선순위, disk.ts 확장 로직.
  2. **F02 Multilingual i18n / F03 Branding UI**: 모든 UI 문자열은 `t("key","namespace")` 사용, 4개 언어 locale 동기화, Careti/CodeCenter 테마 스위치 유지.
  3. **F04 CaretAccount / F07 Persona System**: Account/Persona 상태를 `CaretiGlobalManager`와 webview context로 일관되게 전달.
  4. **F06 Prompt System / F10 Input History / F11 Knowledge Parity**: Prompt variants, input history persistence, AI developer knowledge 설정 유지.
  5. **F08 FeatureConfig / F09 Provider Setup**: BizRouter/Minimax 등 사용자 정의 프로바이더 설정, Remote config 플로우 보존.
- 머징 중 의사결정(코드 선택, 삭제 등)은 위 feature 요구사항을 기준으로 판단하고, 논리가 모호하면 해당 feature 문서에 근거를 남긴다.

---

## 2. 단계별 실행

### Phase A. 사전 준비 + 차이 분석
1. `git fetch --all`로 upstream(origin/cline) 최신 상태 동기화.
2. `git checkout -b merge/cline-v3.38.1-attempt2 cline/v3.38.1`로 깨끗한 베이스 생성.
3. **변경 파일 매트릭스 작성 (자동화)**:
   - `git diff --name-only cline/v3.35.0..cline/v3.38.1 > careti-docs/merging/v3.38.1/upstream-files.txt`
   - `git diff --name-only cline/v3.35.0..merge/cline-v3.34.0-method3 > careti-docs/merging/v3.38.1/careti-files.txt`
   - **🚨 개선: `scripts/classify-files.ts` 작성**
     - 7가지 머지 전략 자동 분류:
       - `AUTO_ADOPT` (Upstream-only)
       - `AUTO_KEEP` (Careti-only)
       - `SIMPLE_MERGE` (CARETI MODIFICATION만)
       - `COMPLEX_MERGE` (구조 변경)
       - `PROTO_MERGE` (필드 충돌)
       - `UI_MERGE` (컴포넌트 충돌)
       - `MANUAL_REVIEW` (불확실)
     - 우선순위 지정 (high/medium/low)
     - 예상 소요 시간 계산
     - 의존성 그래프 생성
4. **Careti 전용 자산 자동 추출**:
   - **🚨 개선: `scripts/extract-careti-mods.ts` 작성**
     - `CARETI MODIFICATION` 주석 자동 탐지
     - Proto 1072+ 필드 자동 추출
     - `careti-src/**`, `webview-ui/src/careti/**` 등 브랜딩 자산 목록화
     - 카테고리별 패치 생성
     - 상세 리포트 자동 생성 (careti-mods-report.md)
5. **의존성 분석 (숨은 위험 탐지)**:
   - **🚨 신규: `scripts/analyze-dependencies.ts` 작성**
     - Import 체인 분석 (Provider → Transform → Utils)
     - 순환 참조 탐지
     - Breaking changes 예측
     - 영향 받는 파일 목록 생성
6. **루트/스크립트/문서 영향 범위 파악**:
   - `git diff --name-only cline/v3.35.0..cline/v3.38.1 -- package.json pnpm-lock.yaml playwright.config.ts scripts docs careti-docs .agents/context` 등을 별도로 추출하여 카테고리(루트 설정/스크립트/문서)로 태깅한다.
   - `merge-execution-master-plan.md` 8차 피드백의 CHANGELOG/announcement 규칙을 재확인하고, 어떤 파일을 어떤 순서로 업데이트할지 초안(Release Checklist)을 만든다.
   - 결과는 `careti-docs/merging/v3.38.1/attempt-2-master.md`에 표로 정리해 이후 단계에서 바로 소비한다.

### Phase B. Careti Overlay 재적용
**🚨 개선: 대규모 patch 대신 카테고리별 점진적 머지**

1. **점진적 머지 준비**:
   - **🚨 신규: `scripts/incremental-merge.sh` 작성**
     - 카테고리별 순차 머지 (proto → controller → services → webview)
     - 각 카테고리마다 자동/수동 판단
     - 3-way diff 자동 생성
     - 각 단계마다 컴파일 검증
     - 진행 상황 추적 (1/50, 2/50...)

2. **카테고리별 머지 순서 (의존성 순)**:
   ```
   1. Proto 파일 (16개, 우선순위 최고)
      - models.proto (CARETI 필드 1072+ 유지)
      - state.proto (페르소나/모드 시스템)
      - 기타 proto 파일
      → 검증: npm run protos, tsc --noEmit

   2. Controller (20개)
      - RPC 핸들러 머지
      - Careti 로직 재적용 (CARETI MODIFICATION)
      - BizRouter, Persona 컨트롤러
      → 검증: npm run compile

   3. Services & API (15개)
      - Provider 업데이트 (anthropic, openai 등)
      - BizRouter provider (Careti 전용)
      - Transform 로직
      → 검증: npm run test:backend

   4. Webview (10개)
      - UI 컴포넌트 머지
      - Careti 테마, 페르소나 UI
      - 브랜딩 로직
      → 검증: npm run build:webview

   5. Careti 전용 파일 (자동 복사)
      - careti-src/** (전체 복사)
      - .agents/context/** (전체 복사)
      - .claude/** (전체 복사)
      → 검증: npm run compile

   6. Scripts / Root / Docs
      - `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `.vscode/`, `.github/`, `playwright.config.ts` 등 루트 파일은 Cline v3.38.1 버전을 채택한 뒤 Careti 브랜드/스크립트/아이콘 설정을 다시 적용한다.
      - `scripts/*.sh`, `careti-scripts/**`, `slexn-codecenter/**`는 Cline 변경분을 반영하되 Careti 자동화(브랜드 변환, 릴리스 패키징 등)가 모두 유지되는지 확인한다.
      - `docs/**`, `careti-docs/**`, `.agents/context/**`, `.claude/**`는 버전별 폴더에 재배치하고, 변경 내역을 attempt-2-master에 남긴다.
      - 변경 후 `npm run compile`, `npm run test`, `pnpm run test:e2e`로 전체 루트/스크립트 영향도를 검증한다.

   7. 최종 통합 검증
      - 모든 컴파일 통과
      - 기본 기능 수동 테스트
   ```

3. **충돌 해결 전략 (시나리오별)**:
   - **Proto 필드 충돌**: Cline 필드 채택 + Careti 1072+ 유지
   - **Controller 시그니처 변경**: Cline 변경 수용 + Careti 로직 재삽입
   - **UI 컴포넌트 리팩토링**: Cline 구조 채택 + Careti 컴포넌트 추가
   - **서비스 로직 변경**: 3-way merge → 수동 리뷰

4. **각 단계마다 체크포인트 생성**:
   ```bash
   git tag checkpoint-proto-complete
   git tag checkpoint-controller-complete
   git tag checkpoint-services-complete
   git tag checkpoint-webview-complete
   ```

5. **롤백 전략 준비**:
   - 각 체크포인트마다 백업 브랜치
   - `scripts/rollback-to-checkpoint.sh` 작성
   - 충돌 해결 실패 시 이전 단계로 복귀

### Phase C. 통합 및 검증 (7단계 검증으로 확대)
**🚨 개선: 컴파일만으로는 불충분 → 다층 검증 필수**

1. **Layer 1: 컴파일 검증**
   - [ ] `npm run protos` (성공)
   - [ ] `npx tsc --noEmit` (0 errors)
   - [ ] `npm run lint` (0 errors)
   - [ ] `npm run compile` (성공)
   - [ ] `npm run build:webview` (성공)

2. **Layer 2: Unit 테스트**
   - [ ] `npm run test:unit` (전체 통과)
   - [ ] 커버리지 70% 이상
   - [ ] Careti 전용 테스트 통과

3. **Layer 3: Integration 테스트**
   - [ ] **Provider별 API 호출 테스트**
     - [ ] Anthropic (Claude Sonnet 4.5 1M)
     - [ ] OpenAI (GPT-5.1)
     - [ ] Minimax (M2 무료 모델)
     - [ ] Nous Research (신규)
     - [ ] BizRouter (Careti 전용)
   - [ ] **Hook 시스템 테스트**
     - [ ] PreToolUse
     - [ ] PostToolUse
     - [ ] TaskStart/Resume/Cancel
   - [ ] **Storage 테스트**
     - [ ] Remote config
     - [ ] State persistence

4. **Layer 4: E2E 테스트 (Cline 기본)**
   - [ ] **환경 설정**
     - [ ] Node 20 설치 (`nvm use 20`)
     - [ ] 필수 라이브러리: `npx playwright install-deps`
     - [ ] libicu*, libjpeg, libwebp, libffi
   - [ ] auth.test.ts (온보딩)
   - [ ] chat.test.ts (대화)
   - [ ] diff.test.ts (파일 비교)
   - [ ] editor.test.ts (편집)

5. **Layer 5: E2E 테스트 (Careti 전용)**
   - [ ] careti-welcome
   - [ ] careti-onboarding
   - [ ] careti-api-setup
   - [ ] careti-announcement
   - [ ] careti-settings
   - [ ] careti-chat (Act/Plan 모드 전환)

6. **Layer 6: 수동 스모크 테스트**
   - [ ] **프로바이더/모델**
     - [ ] BizRouter 프로바이더 목록에 표시
     - [ ] Minimax M2 모델 피커에 표시
     - [ ] GPT-5.1 모델 선택 가능
     - [ ] Nous Research Hermes 4 작동
   - [ ] **Careti 전용 기능**
     - [ ] 페르소나 시스템 동작
     - [ ] 모드 전환 (AGENT ↔ ACT)
     - [ ] 입력 히스토리 저장/복원
     - [ ] 브랜딩 전환 (Careti ↔ CodeCenter)
   - [ ] **핵심 플로우**
     - [ ] 온보딩 → API 키 → 모델 선택 → 채팅
     - [ ] 파일 생성/편집 → Diff → 커밋
     - [ ] 터미널 실행 (Background/Foreground)
     - [ ] MCP 서버 연결 (OAuth 포함)
   - [ ] **리그레션 확인**
     - [ ] LiteLLM 재시도 로그 깔끔히 표시
     - [ ] 터미널 출력 제한 (1000줄) 동작
     - [ ] executeCommand 타임아웃 동작

7. **Layer 7: 자동화 검증 스크립트**
   ```bash
   # 파일 누락 검사
   npm run verify:no-deletions
   # → 0 deleted files

   # Stub 함수 검사
   npm run verify:no-stubs
   # → 0 critical stubs

   # Provider 존재 확인
   npm run verify:providers
   # → All providers present (including BizRouter)

   # Careti 수정사항 유지 확인
   npm run verify:careti-mods
   # → All CARETI MODIFICATION preserved
   ```

### Phase D. 문서 & 릴리스 커뮤니케이션
1. **CHANGELOG 시나리오**
   - `CHANGELOG-CLINE.md`에 upstream v3.38.1 기능을 기록하고, `CHANGELOG.md` 및 `careti-docs/{ko,ja,zh}/CHANGELOG.md`에는 Careti 릴리스 내역(버전, 날짜, 머지 브랜치, 주요 기능)을 작성한다.
   - 버전 규칙: Major=Cline 대규모 흡수, Minor=Careti 기능 추가/소규모 머지, Patch=버그 수정. Marketplace 실제 배포 날짜만 기록한다.
2. **announcement.json 업데이트**
   - `webview-ui/src/careti/locale/{ko,en,ja,zh}/announcement.json`의 `current`와 `previous`를 업데이트해 Current에는 이번 Cline 머지 기능, Previous에는 직전 Careti 기능을 넣는다.
   - 언어 4종을 동시에 갱신하고, 각 항목이 CHANGELOG 내용과 일치하는지 확인한다.
3. **문서 & 정책**
   - `careti-docs/merging/v3.38.1/attempt-2-master.md`에 최종 결과(테스트 로그, 자동화 통과 여부, 남은 TODO)를 기록한다.
   - `.agents/context/**`, `.claude/**`, `careti-docs/**` 변경분은 이유와 영향 범위를 문서화해 추후 세션이 참고할 수 있게 한다.
4. **PR/릴리스 노트**
   - PR 템플릿에 CHANGELOG/announcement 링크, 검증 로그를 첨부하고, 릴리스 노트 초안을 동시에 작성한다.

### Phase E. 누락 방지 자동화 (Phase A-C와 병행)
**🚨 개선: 수동 확인 → 자동화 스크립트로 전환**

1. **scripts/compare-with-cline.mjs (파일 누락 검증)**
   ```javascript
   // Git diff 파싱
   const diff = execSync('git diff --name-status cline/v3.38.1..HEAD')
   const files = parseDiff(diff)

   // D(삭제) 파일 검증
   const deleted = files.filter(f => f.status === 'D')
   const unintentional = deleted.filter(f => !isIntentionallyExcluded(f))

   if (unintentional.length > 0) {
     console.error(`❌ ${unintentional.length} files deleted!`)
     process.exit(1)
   }

   // 의도적 제외 (CLI, docs 등)
   function isIntentionallyExcluded(file) {
     return /^(cli|docs|\.agents/context|evals)\//.test(file)
   }
   ```

2. **scripts/detect-stubs.mjs (스텁 함수 검증)**
   ```javascript
   // TODO 주석 탐지
   const todos = await grep('// TODO:', 'src')

   // 빈 함수 탐지
   const emptyFunctions = await detectEmptyFunctions('src')

   // Placeholder 반환 탐지
   const placeholders = await grep('return {}|return \\[\\]', 'src')

   // Critical stub 검증
   const criticalStubs = [...todos, ...emptyFunctions, ...placeholders]
     .filter(s => s.file.includes('controller') || s.file.includes('provider'))

   if (criticalStubs.length > 0) {
     console.error(`❌ ${criticalStubs.length} critical stubs found!`)
     process.exit(1)
   }
   ```

3. **scripts/verify-providers.mjs (Provider 존재 검증)**
   ```javascript
   // 필수 Provider 목록
   const requiredProviders = [
     'anthropic', 'openai', 'litellm', 'minimax', 'nousresearch',
     'bizrouter', // Careti 전용
     // ... 전체 38개
   ]

   // 각 Provider 파일 존재 확인
   for (const provider of requiredProviders) {
     const file = `src/core/api/providers/${provider}.ts`
     if (!fs.existsSync(file)) {
       console.error(`❌ Missing provider: ${provider}`)
       process.exit(1)
     }

     // Stub 여부 확인
     const content = fs.readFileSync(file, 'utf-8')
     if (content.includes('// TODO') || content.length < 100) {
       console.error(`❌ Provider is stub: ${provider}`)
       process.exit(1)
     }
   }
   ```

4. **scripts/verify-careti-mods.mjs (Careti 수정사항 검증)**
   ```javascript
   // Phase A에서 추출한 Careti 수정사항 로드
   const caretMods = JSON.parse(
     fs.readFileSync('careti-docs/merging/v3.38.1/careti-mods.json')
   )

   // 각 수정사항이 현재 코드에 존재하는지 확인
   for (const mod of caretMods) {
     const file = mod.file
     const content = fs.readFileSync(file, 'utf-8')

     if (mod.type === 'comment') {
       // CARETI MODIFICATION 주석 존재 확인
       if (!content.includes(mod.content)) {
         console.error(`❌ Missing CARETI MODIFICATION: ${file}:${mod.lineNumber}`)
         process.exit(1)
       }
     } else if (mod.type === 'field') {
       // Proto 필드 존재 확인
       if (!content.includes(mod.fieldName)) {
         console.error(`❌ Missing Careti field: ${mod.fieldName} in ${file}`)
         process.exit(1)
       }
     }
   }
   ```

5. **package.json 스크립트 추가**
   ```json
   {
     "scripts": {
       "verify:no-deletions": "node scripts/compare-with-cline.mjs",
       "verify:no-stubs": "node scripts/detect-stubs.mjs",
       "verify:providers": "node scripts/verify-providers.mjs",
       "verify:careti-mods": "node scripts/verify-careti-mods.mjs",
       "verify:all": "npm run verify:no-deletions && npm run verify:no-stubs && npm run verify:providers && npm run verify:careti-mods"
     }
   }
   ```

6. **CI/CD 통합**
   ```yaml
   # .github/workflows/merge-validation.yml
   name: Merge Validation
   on: [push, pull_request]
   jobs:
     validate:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - run: npm install
         - run: npm run verify:all
   ```

7. **PR 체크리스트 템플릿**
   ```markdown
   ## v3.38.1 Merge Checklist

   ### 자동 검증 (필수)
   - [ ] `npm run verify:no-deletions` 통과
   - [ ] `npm run verify:no-stubs` 통과
   - [ ] `npm run verify:providers` 통과
   - [ ] `npm run verify:careti-mods` 통과

   ### 빌드
   - [ ] `npm run compile` 성공
   - [ ] `npm run test:unit` 통과
   - [ ] `npm run test:e2e` 통과

   ### 기능 검증 (1차 시도 갭 해소)
   - [ ] Minimax M2 모델 작동
   - [ ] BizRouter 프로바이더 작동
   - [ ] 페르소나 시스템 작동
   - [ ] Remote Rules 충돌 없음
```

---

## 코드 리뷰 게이트 (Cross-Agent Review)
- 각 주요 Phase 완료 시 다른 Codex/코드 리뷰어에게 아래 7가지 관점으로 리뷰를 요청한다.
- 리뷰어에게 전달할 체크 항목:
  1. **3-way 비교 정확성** – base / cline / careti 소스를 혼동하지 않았는지, merge commit이 세 버전을 모두 반영하는지.
  2. **문제 해결 과정** – 머지 후 버그 픽스 시에도 항상 3-way 비교로 원인을 찾았는지, 임시 해킹으로 덮지 않았는지.
  3. **최소 침습 & CARETI 주석** – Cline 코드 수정이 최소화되었고 `// CARETI MODIFICATION` 주석을 유지/추가했는지.
  4. **하드코딩 금지** – 문제 해결 과정에서 i18n 무시, 상수 하드코딩 등 Careti 정책을 위반하지 않았는지.
  5. **Careti 정책 준수** – 특히 Webview i18n/브랜딩/RulePriority 등 feature 문서에 정의된 규칙을 지켰는지.
  6. **보안 검토** – Credentials/토큰/파일 경로 등 보안 위험이 되는 변경이 없는지.
  7. **더미/미완성 코드** – “추후 구현” 주석이나 빈 함수(Stub)를 남기지 않았는지.

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

- 리뷰 타이밍:
  - **Gate #1 (Proto 완료 후)**: Proto + Controller merge 전, 스크립트 또는 diff 링크 공유.
  - **Gate #2 (Controller/Services 완료 후)**: API/Services/Transform 적용 이후.
  - **Gate #3 (Webview 완료 후)**: Webview + i18n/브랜딩 재적용 후.
  - **Gate #4 (Scripts/Root/Docs 완료 후)**: 루트 설정/스크립트/문서/CHANGELOG 갱신 후.
  - **Gate #5 (최종 검증 후)**: Phase C/E 종료 후 전체 diff 리뷰.

Gate 통과 후에만 다음 Phase로 이동하며, 피드백/이슈는 `attempt-2-master.md` 로그에 기록한다.

---

## 3. 산출물 체크리스트
- [ ] `merge/cline-v3.38.1-attempt2` branch push
- [ ] `careti-docs/merging/v3.38.1/attempt-2-plan.md` (본 문서) + 실행 로그 추가 예정
- [ ] `v3.38.1` 통합 회고/테스트 리포트 업데이트
- [ ] Gap report 폐쇄(프로바이더/Settings/Hook/E2E)

---

## 4. 리스크 & 완화 (95%+ 성공률을 위한 추가 대책)

### 주요 리스크 (85% 기본 + 10% 추가 대책 = 95%+)

| 리스크 | 확률 | 영향 | 대응 (기존) | 🚨 추가 대책 |
| --- | --- | --- | --- | --- |
| **대규모 충돌** | 20% | High | `git rerere`, Phase별 커밋 | → 점진적 머지 (`incremental-merge.sh`)<br>→ 카테고리별 체크포인트<br>→ 충돌 해결 시나리오 가이드 |
| **Careti 자산 유실** | 15% | Critical | `CARETI MODIFICATION` 탐색 | → 자동 추출 (`extract-careti-mods.ts`)<br>→ 자동 검증 (`verify:careti-mods`)<br>→ Phase A에서 리포트 생성 |
| **테스트 실패** | 10% | Medium | Node 20, 라이브러리 설치 | → 7단계 검증 (Phase C)<br>→ Layer 1-7 체계적 검증<br>→ 각 Layer 실패 시 즉시 중단 |
| **파일 누락 재발** | 10% | Critical | `compare-with-cline` 스크립트 | → 4개 검증 스크립트 (`verify:*`)<br>→ CI/CD 통합<br>→ PR 체크리스트 자동화 |
| **🆕 예상치 못한 의존성** | 5% | High | (없음) | → 의존성 분석 (`analyze-dependencies.ts`)<br>→ Import 체인 추적<br>→ Breaking changes 예측 |
| **🆕 테스트 환경 문제** | 3% | Medium | (없음) | → Node 20 고정 + 라이브러리 명세<br>→ Playwright 안정화 설정<br>→ E2E flaky 테스트 재시도 |
| **🆕 시간 압박 품질 저하** | 3% | Medium | (없음) | → AI 자동화 (빠른 작업)<br>→ 각 Phase마다 검증 강제<br>→ "나중에" 금지 정책 |
| **🆕 암묵적 Careti 변경 유실** | 2% | Medium | (없음) | → Git blame 분석<br>→ Diff 전수 검사<br>→ 브랜딩/페르소나 체크리스트 |
| **🆕 아키텍처 충돌** | 2% | High | (없음) | → Remote Rules vs Careti Rules 분리<br>→ 네임스페이스 충돌 방지<br>→ 수동 아키텍처 리뷰 |

### 위험 완화 성공 확률
```
기본 대책만: 60% (1차 시도 실패)
기존 대책: 85% (Cline-Base 전략)
추가 대책: 95%+ (자동화 + 다층 검증)
```

### 잔여 5% 위험 (통제 불가)
- **Cline 미공개 변경**: 문서화되지 않은 내부 변경 (1%)
- **환경 특이성**: 특정 OS/Node 조합 버그 (1%)
- **외부 의존성**: npm 패키지 버전 충돌 (1%)
- **인적 오류**: 검증 단계 생략, 실수 (1%)
- **예측 불가능**: 블랙스완 이벤트 (1%)

---

## 5. 다음 단계
1. 위 계획에 따라 브랜치 생성 및 작업 시작.
2. Day 1 종료 시점에 Phase A 체크리스트 공유.
3. Attempt-1 자료(`v3.38.1/attempt-1/`)는 참고만 하고, 모든 신규 산출물은 `v3.38.1/attempt-2/` 이하에 기록.
