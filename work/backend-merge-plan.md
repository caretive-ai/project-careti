# 백엔드 머징 재개 및 완료 계획

## 1. 목표

`upstream/main` 브랜치의 최신 변경 사항을 현재 브랜치에 성공적으로 병합하여, 모든 백엔드 기능이 정상적으로 빌드되고 테스트를 통과하는 상태를 만드는 것을 목표로 한다.

## 2. 핵심 원칙

- **최소 침습 원칙**: `analysis-of-102-modifications.md` 문서에 따라, Caret의 핵심 기능과 직접 관련 없는 수정(예: 린터 자동 수정, 단순 주석 변경)은 Cline 원본으로 복원하여 불필요한 diff를 최소화한다.
- **Caret 고유 항목 식별 원칙**: `master-merge-plan.md`에 명시된 대로, `HEAD`(Caret), `upstream/main`(Cline), `merge-base`(공통 조상)의 3-way 비교를 통해 변경 사항을 분석하고, Caret 고유의 기능만 신중하게 유지 및 통합한다.
- **점진적 안정화**: 가장 시급한 빌드 오류부터 해결하고, 점차적으로 충돌 위험이 높은 파일들을 해결하며, 각 단계마다 컴파일을 통해 안정성을 확인한다.

## 3. 실행 계획

### Phase 1: 빌드 안정화 - Protocol Buffers 문제 해결 (가장 시급)

현재 `npm run compile` 실패의 직접적인 원인인 `proto` 파일 문제를 최우선으로 해결한다.

- **1-1. Proto 파일 수동 병합**:
    - **대상 파일**: `proto/cline/state.proto`, `proto/cline/models.proto`, `proto/cline/common.proto` 등 오류의 원인이 된 파일들.
    - **방법**: 3-way 비교 원칙에 따라 Caret의 추가 타입과 Cline의 최신 타입을 모두 포함하도록 수동으로 병합한다. `state.proto`에서 찾지 못하는 타입 정의는 대부분 `models.proto`나 `common.proto`에 있으므로, 이 파일들의 의존 관계를 주의 깊게 해결한다.
- **1-2. 검증**:
    - `npm run protos` 명령을 실행하여 proto 파일들이 오류 없이 TypeScript로 변환되는지 확인한다.
    - `npm run compile`을 다시 실행하여 최소한 proto 관련 오류가 해결되었는지 검증한다.

### Phase 2: 고위험 파일 충돌 해결

빌드의 다음 단계로 넘어가면, 분석 문서에서 "위험도 높음/매우 높음"으로 식별된 파일들을 순차적으로 해결한다.

- **2-1. 파일 손상 복구**:
    - **대상 파일**: `src/services/uri/SharedUriHandler.ts`, `src/services/test/TestServer.ts`, `src/test/e2e/auth.test.ts` 등 병합 충돌 마커(`<<<<<<<`, `=======`, `>>>>>>>`)가 남아있는 파일들.
    - **방법**: 충돌 마커를 제거하고, 3-way 비교를 통해 양쪽의 변경 사항을 논리적으로 조합하여 파일을 복구한다.
- **2-2. 핵심 로직 수동 병합**:
    - **대상 파일**: `src/core/storage/utils/state-helpers.ts` (가장 중요), `src/core/task/tools/handlers/WriteToFileToolHandler.ts`, `src/core/task/tools/handlers/ExecuteCommandToolHandler.ts` 등.
    - **방법**: Caret의 핵심 기능(페르소나, 계정, 입력 기록 등)과 관련된 로직을 유지하면서 Cline의 최신 변경 사항을 신중하게 통합한다. 각 파일 수정 시 `work/log-<filename>-merge.md` 형식의 작업 로그를 작성하여 결정 근거를 남긴다.
- **2-3. 검증**:
    - 각 주요 파일을 해결할 때마다 `npm run compile`을 실행하여 새로운 오류가 발생하는지 즉시 확인한다.

### Phase 3: '최소 침습 원칙' 적용 - 비필수 변경 사항 복원

분석 문서에서 "원본 복원 권장"으로 분류된 파일들을 Cline의 원본 상태로 되돌린다.

- **3-1. 대상 파일 식별**:
    - `analysis-of-102-modifications.md` 문서에서 "원본 복원 권장"으로 표시된 모든 파일 목록을 만든다. (예: `src/core/api/providers/cline.ts`, `src/core/prompts/commands.ts` 등)
- **3-2. 원본 복원 실행**:
    - `git checkout upstream/main -- <file_path>` 명령을 사용하여 해당 파일들을 하나씩 또는 그룹으로 묶어 원본으로 복원한다.
- **3-3. 검증**:
    - 복원 작업 후 `npm run compile`을 실행하여 기능에 영향을 주지 않았는지 확인한다.

### Phase 4: 전체 시스템 검증 및 마무리

모든 충돌이 해결되고 백엔드가 성공적으로 컴파일되면, 전체 시스템의 안정성을 검증한다.

- **4-1. 전체 테스트 실행**:
    - `npm run test` (또는 `test:unit`, `test:integration`)를 실행하여 모든 유닛/통합 테스트가 통과하는지 확인한다.
    - 실패하는 테스트는 수정한다. 특히 브랜딩 변경으로 인해 실패할 것으로 예상되는 e2e 테스트(`src/test/e2e/`)들을 집중적으로 수정한다.
- **4-2. 최종 검토**:
    - `git status`와 `git diff`를 통해 변경된 모든 파일을 최종 검토하고, 병합 커밋을 준비한다.

이 계획에 따라 작업을 진행하면, 체계적으로 백엔드 머징을 완료할 수 있을 것입니다.
