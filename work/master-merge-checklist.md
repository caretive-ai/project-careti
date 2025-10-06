# Master Merge Plan (Revised): Cline Upstream Integration

## 0. 개요 (Overview)

### 0.1. 관련 문서 (Related Documents)
이 문서는 Cline upstream 병합을 위한 최종 실행 계획입니다. 이 작업의 전체적인 배경과 분석 내용은 다음 문서들을 참조하십시오.
- `work/logs/20251006-12-final-merge-strategy.md`: 최종 병합 전략 수립 과정
- `work/logs/20251006-14-상세-영향도-분석-보고서.md`: 주요 파일별 상세 영향도 분석
- `CHANGELOG.md`: 이전 병합 기록 및 버전 정보

### 0.2. 핵심 정보 (Key Information)
- **작업 브랜치**: `feature/cline-merge-20251006`
- **분석 기준 커밋 (Merge Base)**: `c6aa47095ee47036946c6a51339a4fa22aaa073c` (Caret이 마지막으로 동기화한 Cline v3.26.6 시점)
- **병합 대상 브랜치**: `upstream/main`

### 0.3. 핵심 전략 (Core Strategy)
- **프론트엔드 우선 정리**: 대규모 충돌이 예상되는 `webview-ui/`는 Caret의 현재 버전을 기준으로 우선 정리하여 병합 상태를 단순화합니다.
- **백엔드 점진적 병합**: `webview-ui/`를 제외한 백엔드(`src/`, `proto/` 등) 관련 충돌을 순차적으로 해결합니다.
- **프론트엔드 선별적 이식**: 백엔드 병합이 안정화된 후, 분석 기준 커밋 이후 Cline의 프론트엔드 변경 사항을 정밀 분석하여 필요한 부분만 선별적으로 수동 이식합니다.

### 0.4. 충돌 해결 원칙 (Conflict Resolution Principle)
- **'Caret 고유 항목' 식별 원칙**: 어떤 항목(의존성, 스크립트, 코드 등)이 Caret 고유의 것이라고 판단하려면 다음 세 가지 조건을 모두 만족해야 합니다.
    1. 현재 Caret 브랜치(`HEAD`)에 존재한다.
    2. 병합 대상인 Cline 브랜치(`upstream/main`)에 존재하지 않는다.
    3. **과거 공통 조상 커밋(`merge-base`) 시점의 Cline 코드에도 존재하지 않았다.**
- 이 원칙은 Cline이 최근에 삭제한 기능을 Caret 고유의 것으로 착각하여 잘못 유지하는 것을 방지하기 위함입니다. 모든 충돌 해결 시 이 원칙을 최우선으로 적용합니다.

### 0.5. Git 명령어 사용 원칙 (Git Command Principle)
- **비대화형 출력**: `git show`, `git diff` 등 긴 출력이 예상되는 명령어는 터미널에서 직접 확인하지 않고, 파일로 리디렉션(`> work/output.log`)하여 내용을 분석합니다. 이는 AI 에이전트의 작업 효율성과 안정성을 위함입니다.

### 0.6. 작업 기록 및 교차 검증 원칙 (Logging & Cross-Validation Principles)

#### **A. 작업 로그 작성 요령 (For Task-Executing AI)**
- **선행 학습**: 특정 파일의 충돌 해결 작업을 시작하기 전에, 반드시 이 마스터 문서의 `0.4`, `0.5`, `0.6` 원칙들을 숙지해야 합니다.
- **상세 작업 로그 작성**: 각 충돌 해결 단계마다 `work/logs/log-{filename}-merge.md` 형식의 별도 로그 파일을 생성합니다.
- **로그 필수 포함 내용**:
    1.  **분석 대상 명시**: `HEAD`, `UPSTREAM`, `MERGE-BASE` 버전의 파일 경로 또는 커밋 해시를 명확히 기재합니다.
    2.  **원칙 재확인**: "마스터 문서의 0.4 원칙에 따라 3-way 비교를 수행함"을 명시합니다.
    3.  **항목별 상세 분석**: 충돌이 발생한 각 항목(의존성, 스크립트, 함수 등)에 대해, 세 버전(`HEAD`, `UPSTREAM`, `MERGE-BASE`)에서의 상태를 각각 명시합니다.
    4.  **결정 및 근거**: 위 분석에 따라 'Caret 고유 항목' 여부를 판단하고, 최종적으로 어떤 코드를 선택/병합할지 결정한 내용과 그 근거를 구체적으로 서술합니다.
    5.  **최종 결론**: 전체 작업 요약 및 최종적으로 어떤 파일이 생성되었는지 명시합니다.

#### **B. 교차 검증 요령 (For Verifying AI)**
- **검증 목표**: 작업 AI가 생성한 작업 로그(`work/logs/log-*.md`)와 실제 결과물(병합된 파일)이 마스터 문서의 원칙에 부합하는지 검증합니다.
- **검증 절차**:
    1.  작업 로그에 명시된 `MERGE-BASE` 커밋 해시와 `UPSTREAM` 버전을 확인합니다.
    2.  로그의 "항목별 3-Way 비교 분석" 내용이 정확한지, `git show` 등의 명령으로 직접 샘플링하여 확인합니다.
    3.  각 항목에 대한 "결정 및 근거"가 마스터 문서의 "0.4. 'Caret 고유 항목' 식별 원칙"에 부합하는지 논리적으로 검토합니다.
    4.  로그의 "최종 결론"대로 실제 파일이 수정되었는지 확인합니다.
    5.  불일치나 내용 부족이 발견되면 즉시 문제를 제기합니다.

### 0.7. 마스터 지시사항 (Master's Directives)
- **스테이징 분리 원칙**: 병합이 완료된 파일은 즉시 스테이징하지 않습니다. 모든 변경 내용은 작업 로그에 기록하고, 마스터의 검토 및 명시적 지시가 있을 때만 스테이징합니다.
- **버전 관리**: 이번 병합 작업은 Caret `v0.2.4` 릴리스로 기록합니다. `CHANGELOG.md`와 `package.json`에 해당 버전을 반영합니다.

---

## Phase 1: 사전 준비 및 병합 실행 (Preparation & Initial Merge)

- [x] **1-1. 환경 검증**
- [x] **1-2. 실제 병합 실행**

## Phase 2: 프론트엔드 충돌 우선 해결 (Frontend First Resolution)

- [x] **2-1. `webview-ui/` 충돌 해결 (Caret 기준)**

## Phase 3: 백엔드 및 핵심 로직 충돌 해결 (Backend Conflict Resolution)

- [x] **3-1. `package.json` 충돌 해결**
- [x] **3-2. `proto/cline/state.proto` 충돌 해결**
- [x] **3-3. `src/core/controller/index.ts` 충돌 해결**
- [x] **3-4. `src/core/task/index.ts` 충돌 해결**
- [x] **3-5. `.gitignore` 충돌 해결**
- [x] **3-6. `.vscodeignore` 충돌 해결**
- [x] **3-7. `CHANGELOG.md` 충돌 해결 및 버전 업데이트**
- [x] **3-8. `package.json` 버전 업데이트**
- [x] **3-9. 기타 백엔드 충돌 해결**
    - [x] `biome.jsonc`
    - [x] `proto/cline/state.proto`
    - [x] `src/core/storage/disk.ts`
    - [x] `src/core/storage/state-keys.ts`
    - [x] `src/core/storage/state-migrations.ts`
    - [x] `src/core/storage/utils/state-helpers.ts`
    - [x] `.gitignore`
    - [x] `.vscodeignore`
    - [x] `proto/cline/models.proto` ✅ (import 누락 문제 해결)
    - [x] `src/core/controller/index.ts`
    - [x] `src/core/task/index.ts`

*(이후 Phase는 백엔드 충돌 해결 후 진행)*

---

## Phase 3.5: 작업 검증 및 품질 보증 (Quality Assurance & Verification)

### 0.8. 검증 AI 역할 및 지시사항 (Verification AI Role & Instructions)

#### **A. 검증 AI의 역할 정의 (Verification AI Role Definition)**
- **목적**: 작업 AI가 수행한 병합 작업이 마스터 문서의 원칙(0.4 Caret 고유 항목 식별 원칙)에 부합하는지 검증
- **검증 범위**: 작업 로그의 정확성, Caret 고유 기능 보존, 불필요한 삭제 방지, 빌드 무결성
- **검증 방법**: 실제 파일과 작업 로그 교차 확인, Caret 고유 기능 샘플링 테스트

#### **B. 검증 AI 지시사항 (Verification AI Instructions)**

1. **검증 절차 (Verification Procedure)**:
   ```
   1. 작업 로그 읽기 (`work/logs/log-{filename}-merge.md`)
   2. 실제 파일에서 Caret 고유 기능 확인 (grep, 코드 검색)
   3. 검증 보고서 작성 (`work/verification/verify-{filename}.md`)
   4. 문제 발견 시 즉시 보고
   ```

2. **검증 체크리스트 (Verification Checklist)**:
   - [ ] **Caret 고유 기능 보존**: caretModeSystem, enablePersonaSystem, caretApiKey 등
   - [ ] **Caret 고유 스크립트**: package:release, report:*, sync:i18n-keys 등
   - [ ] **Caret 브랜딩**: 이름, 설명, 홈페이지, 다국어 지원 구조
   - [ ] **빌드 무결성**: import 누락, 타입 정의 오류 방지
   - [ ] **작업 로그 정확성**: 로그 내용과 실제 결과 일치 여부

3. **검증 보고서 표준 형식 (Verification Report Format)**:
   ```markdown
   # 검증 보고서: {파일명}

   ## 검증 대상
   - **파일**: `{파일경로}`
   - **작업 로그**: `work/logs/log-{filename}-merge.md`
   - **검증 일시**: {날짜}

   ## 검증 결과: ✅ 통과 / ❌ 실패 / ⚠️ 주의

   ### 1. Caret 고유 기능 보존 상태
   [구체적인 코드 검증 결과]

   ### 2. Cline 신규 기능 통합 상태
   [Cline 기능 통합 확인]

   ### 3. 🚨 문제점 (있는 경우)
   [발견된 문제점과 수정 필요사항]

   ### 4. 종합 평가
   - **Caret 고유 기능 손실**: 없음/있음
   - **불필요한 삭제**: 없음/있음
   - **작업 로그 정확성**: 일치/불일치
   ```

#### **C. 현재 검증 완료 현황 (Current Verification Status)**

- [x] **3-9-1. package.json 검증 완료** ✅
- [x] **3-9-2. controller/index.ts 검증 완료** ✅
- [x] **3-9-3. biome.jsonc 검증 완료** ✅
- [x] **3-9-4. CHANGELOG.md 검증 완료** ✅
- [x] **3-9-5. proto/models.proto 검증 완료** ✅ (import 누락 문제 해결)
- [x] **3-9-6. state-migrations.ts 검증 완료** ✅
- [x] **3-9-7. state-keys.ts 검증 완료** ✅
- [x] **3-9-8. task/index.ts 검증 완료** ✅

**검증 결과 요약**:
- **총 8개 파일 검증 완료**
- **1개 파일에서 빌드 문제 발견**: proto/models.proto (import "cline/state.proto" 누락)
- **Caret 고유 기능 손실**: 0건 (모든 핵심 기능 보존됨)
- **불필요한 삭제**: 0건
- **작업 로그 품질**: 높음 (실제 결과와 일치)

---

## Phase 4: 병합 실패 분석 및 전략 재수립

- [x] **4-1. 병합 후 컴파일 실패 원인 심층 분석**
  - **결과**: `host-provider.ts`의 잘못된 내부 수정이 근본 원인임을 마스터의 크로스체크를 통해 최종 식별함.
- [x] **4-2. 잘못된 분석 계획 폐기 및 정리**
  - **결과**: `plan-merge-reintegration.md`, `plan-cline-api-migration.md` 등 혼란을 야기할 수 있는 폐기된 계획 파일 삭제 완료.
- [x] **4-3. 머징 전략 가이드 업데이트**
  - **결과**: 이번 경험을 바탕으로 '긴급 복구 체크리스트'를 `merging-strategy-guide.md`에 추가하여 조직 지식으로 자산화함.
- [x] **4-4. 분석 및 정리 내용 커밋 완료**
  - **결과**: 오늘의 모든 작업 내용을 `docs(merging): Update strategy guide from failure analysis and clean up obsolete plans` 커밋으로 저장 완료. 내일 작업을 위한 준비 완료.
