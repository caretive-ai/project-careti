# Master Merge Plan (Revised): Cline Upstream Integration

## 0. 개요 (Overview)

### 0.1. 관련 문서 (Related Documents)
이 문서는 Cline upstream 병합을 위한 최종 실행 계획입니다. 이 작업의 전체적인 배경과 분석 내용은 다음 문서들을 참조하십시오.
- `work/20251006-12-final-merge-strategy.md`: 최종 병합 전략 수립 과정
- `work/20251006-14-상세-영향도-분석-보고서.md`: 주요 파일별 상세 영향도 분석
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
- **상세 작업 로그 작성**: 각 충돌 해결 단계마다 `work/log-{filename}-merge.md` 형식의 별도 로그 파일을 생성합니다.
- **로그 필수 포함 내용**:
    1.  **분석 대상 명시**: `HEAD`, `UPSTREAM`, `MERGE-BASE` 버전의 파일 경로 또는 커밋 해시를 명확히 기재합니다.
    2.  **원칙 재확인**: "마스터 문서의 0.4 원칙에 따라 3-way 비교를 수행함"을 명시합니다.
    3.  **항목별 상세 분석**: 충돌이 발생한 각 항목(의존성, 스크립트, 함수 등)에 대해, 세 버전(`HEAD`, `UPSTREAM`, `MERGE-BASE`)에서의 상태를 각각 명시합니다.
    4.  **결정 및 근거**: 위 분석에 따라 'Caret 고유 항목' 여부를 판단하고, 최종적으로 어떤 코드를 선택/병합할지 결정한 내용과 그 근거를 구체적으로 서술합니다.
    5.  **최종 결론**: 전체 작업 요약 및 최종적으로 어떤 파일이 생성되었는지 명시합니다.

#### **B. 교차 검증 요령 (For Verifying AI)**
- **검증 목표**: 작업 AI가 생성한 작업 로그(`work/log-*.md`)와 실제 결과물(병합된 파일)이 마스터 문서의 원칙에 부합하는지 검증합니다.
- **검증 절차**:
    1.  작업 로그에 명시된 `MERGE-BASE` 커밋 해시와 `UPSTREAM` 버전을 확인합니다.
    2.  로그의 "항목별 3-Way 비교 분석" 내용이 정확한지, `git show` 등의 명령으로 직접 샘플링하여 확인합니다.
    3.  각 항목에 대한 "결정 및 근거"가 마스터 문서의 "0.4. 'Caret 고유 항목' 식별 원칙"에 부합하는지 논리적으로 검토합니다.
    4.  로그의 "최종 결론"대로 실제 파일이 수정되었는지 확인합니다.
    5.  불일치나 내용 부족이 발견되면 즉시 문제를 제기합니다.

### 0.4. 충돌 해결 원칙 (Conflict Resolution Principle)
- **'Caret 고유 항목' 식별 원칙**: 어떤 항목(의존성, 스크립트, 코드 등)이 Caret 고유의 것이라고 판단하려면 다음 세 가지 조건을 모두 만족해야 합니다.
    1. 현재 Caret 브랜치(`HEAD`)에 존재한다.
    2. 병합 대상인 Cline 브랜치(`upstream/main`)에 존재하지 않는다.
    3. **과거 공통 조상 커밋(`merge-base`) 시점의 Cline 코드에도 존재하지 않았다.**
- 이 원칙은 Cline이 최근에 삭제한 기능을 Caret 고유의 것으로 착각하여 잘못 유지하는 것을 방지하기 위함입니다. 모든 충돌 해결 시 이 원칙을 최우선으로 적용합니다.

### 0.5. Git 명령어 사용 원칙 (Git Command Principle)
- **비대화형 출력**: `git show`, `git diff` 등 긴 출력이 예상되는 명령어는 터미널에서 직접 확인하지 않고, 파일로 리디렉션(`> work/output.log`)하여 내용을 분석합니다. 이는 AI 에이전트의 작업 효율성과 안정성을 위함입니다.

---

## Phase 1: 사전 준비 및 병합 실행 (Preparation & Initial Merge)

- [ ] **1-1. 환경 검증**
    - [x] 작업 브랜치(`feature/cline-merge-20251006`) 확인 및 작업 트리 정리 완료
    - [x] Upstream 원격 저장소 최신화 완료
    - [x] 참조용 디렉토리(`cline-latest`, `caret-main`) 상태 확인 완료
    - [x] **알파 확인**: 환경 검증 완료
    - [x] **마스터 승인**:

- [ ] **1-2. 실제 병합 실행**
    - [x] `git merge upstream/main --no-commit --no-ff` 실행 완료
    - [x] 병합 충돌 발생 확인
    - [x] **알파 확인**: 병합 시도 및 충돌 상태 진입 완료
    - [x] **마스터 승인**:

## Phase 2: 프론트엔드 충돌 우선 해결 (Frontend First Resolution)

- [ ] **2-1. `webview-ui/` 충돌 해결 (Caret 기준)**
    - [x] `git rm`으로 해결 불가 파일 삭제
    - [x] `git checkout --ours webview-ui/` 명령으로 `webview-ui/` 디렉토리의 모든 충돌을 Caret의 현재 코드로 덮어쓰기 완료
    - [x] **알파 확인**: Caret 기준 코드로 복원 완료
    - [x] **마스터 승인**:

## Phase 3: 백엔드 및 핵심 로직 충돌 해결 (Backend Conflict Resolution)

- [x] **3-1. `package.json` 충돌 해결**
    - [x] `caret-main`과 `cline-latest`의 `package.json` 비교 분석
    - [x] Caret 고유 의존성 및 스크립트를 재적용하여 병합
    - [x] **알파 확인**: `package.json` 병합 완료
    - [x] **마스터 승인**:

- [ ] **3-2. 기타 백엔드 충돌 해결**
    - [ ] `proto/`, `src/` 등 나머지 모든 백엔드 충돌을 해결합니다.
    - [ ] 각 파일은 '최소 침습 재적용' 원칙에 따라 수정합니다.
    - [ ] 해결된 백엔드 파일들을 `git add`로 스테이징합니다.
    - [ ] **알파 확인**: 모든 백엔드 충돌 해결 및 스테이징 완료
    - [ ] **마스터 승인**:

## Phase 4: 프론트엔드 변경분 정밀 분석 (Precise Frontend Change Analysis)

- [ ] **4-1. `webview-ui/` 변경 내역 추출**
    - [ ] `git diff c6aa47095ee47036946c6a51339a4fa22aaa073c..upstream/main -- webview-ui/ > work/cline-webview-changes.diff` 명령으로 `webview-ui/`의 전체 변경 내역을 파일로 저장합니다.
    - [ ] `git diff --name-status c6aa47095ee47036946c6a51339a4fa22aaa073c..upstream/main -- webview-ui/` 로 변경된 파일 목록을 확인합니다.
    - [ ] **알파 확인**: `webview-ui/` 변경 내역 분석 완료
    - [ ] **마스터 승인**:

- [ ] **4-2. 통합 대상 기능 식별**
    - [ ] `work/cline-webview-changes.diff` 파일을 분석하여 Caret에 통합이 필요한 신규 기능, 버그 수정, 주요 리팩토링 목록을 작성합니다.
    - [ ] **알파 확인**: 통합 필요 목록 작성 완료
    - [ ] **마스터 승인**:

## Phase 5: 프론트엔드 선별적 수동 통합 (Selective Manual Frontend Integration)

- [ ] **5-1. Cline 변경사항 수동 적용**
    - [ ] 4-2에서 식별된 목록을 바탕으로, `cline-latest` 디렉토리와 `work/cline-webview-changes.diff`를 참조하여 Caret 코드에 수동으로 적용합니다.
    - [ ] Caret의 컴포넌트 구조와 상태 관리(i18n, 페르소나 등)를 해치지 않는 선에서 신중하게 통합합니다.
    - [ ] **알파 확인**: 필요한 Cline 기능의 수동 적용 완료
    - [ ] **마스터 승인**:

## Phase 6: 의존성 및 빌드 시스템 안정화 (Stabilization)

- [ ] **6-1. 의존성 재설치 및 빌드**
    - [ ] `rm -rf node_modules && npm install` 실행
    - [ ] `npm run protos` 및 `npm run compile` 실행
    - [ ] **알파 확인**: 의존성 설치 및 전체 컴파일 완료
    - [ ] **마스터 승인**:

## Phase 7: 전체 시스템 검증 (Full System Verification)

- [ ] **7-1. 테스트 스위트 실행**
    - [ ] `npm run test:webview`, `npm run test:unit`, `npm run test:integration` 실행 및 모든 테스트 통과 확인
    - [ ] **알파 확인**: 모든 자동 테스트 통과
    - [ ] **마스터 승인**:

- [ ] **7-2. E2E 수동 검증**
    - [ ] `npm run watch` 실행 후 F5로 확장 프로그램 실행
    - [ ] Caret 및 Cline 핵심 기능 검증
    - [ ] **알파 확인**: E2E 검증 시나리오 기반 테스트 완료
    - [ ] **마스터 승인**:

## Phase 8: 병합 완료 및 정리 (Finalization)

- [ ] **8-1. 병합 커밋 생성**
    - [ ] 모든 변경사항을 스테이징하고 `git commit` 실행
    - [ ] **알파 확인**: 병합 커밋 준비 완료
    - [ ] **마스터 승인**:

- [ ] **8-2. 최종 정리**
    - [ ] 작업 브랜치를 `main` 또는 `develop` 브랜치에 푸시/PR 준비
    - [ ] **알파 확인**: 후속 작업 준비 완료
    - [ ] **마스터 승인**:
