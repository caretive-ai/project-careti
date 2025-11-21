# 최종 작업 계획: AI-개발자 지식 동기화 시스템 문서화 (v3)

## 1. 목표
`f05` 문서의 표준 구조를 완벽하게 준수하여, AI와 개발자 모두에게 실질적으로 유용한 "AI-개발자 지식 동기화 시스템" 기능 문서를 작성하고 `README.md`에 반영한다.

## 2. 세부 계획

### 단계 1: 상세 설명 문서 생성 (`f11`)
- **파일명**: `caret-docs/features/f11-ai-developer-knowledge-parity.md`
- **내용 (f05 구조 준수)**:
  ```markdown
  # F11: AI-개발자 지식 동기화 시스템

  **상태**: ✅ 설계 완료 및 문서화 진행중 (2025-10-15)
  **구현도**: 100% (문서 시스템)
  **우선순위**: HIGH - 프로젝트의 핵심 정체성

  ---

  ## 📋 개요

  **목표**: AI와 개발자가 항상 동일한 지식을 공유하여, 진정한 'AI 코딩 파트너' 경험을 제공한다.

  **해결하는 문제**:
  - **정보 불균형**: AI와 개발자가 서로 다른 정보를 보게 되어 발생하는 오해와 비효율을 제거합니다.
  - **신뢰 부족**: 개발자가 AI의 작업 방식을 이해하고 신뢰할 수 있도록 투명성을 제공합니다.
  - **컨텍스트 비효율**: AI가 작업에 불필요한 정보까지 모두 학습하는 비효율을 "지식 원자화"로 해결합니다.

  ---

  ## 🏗️ 시스템 구조

  이 시스템은 물리적인 코드 변경보다는, **문서의 조직적인 구성과 AI의 해석 방식**에 대한 약속으로 구현됩니다.

  ### 1. 핵심 파일: `caret-rules.md`
  - **위치**: `.caretrules/caret-rules.md`
  - **역할**: AI에게 문서 시스템의 전체 구조와 파일 탐색 경로를 알려주는 최상위 규칙 파일입니다.
  - **핵심 로직**:
    ```markdown
    ### Document Access Pattern
    - **AI reads**: `.caretrules/caret-rules.json`
    - **AI workflows**: `.caretrules/workflows/*.md`
    ```
    이 규칙을 통해 AI는 상세 작업 절차가 필요할 때 `.caretrules/workflows/` 디렉토리를 참조해야 함을 인지합니다.

  ### 2. 지식의 원천: `workflows/` 와 `atoms/`
  - **위치**: `.caretrules/workflows/`
  - **역할**: 실제 작업 절차를 담고 있는 "지식 원자(Atomic Workflow)"들의 집합입니다.
  - **구조**:
    - `workflows/`: 특정 작업을 위한 복합 워크플로우 (예: `new-component.md`)
    - `workflows/atoms/`: 여러 워크플로우에서 재사용되는 가장 작은 단위의 지식 (예: `tdd-cycle.yaml`)

  ### 3. 개발자용 미러: `caret-docs/`
  - **위치**: `caret-docs/development/` 등
  - **역할**: `.caretrules`에 있는 AI용 규칙에 1:1로 대응하는, 사람이 읽기 쉬운 한국어/영어 문서입니다. (예: `caret-rules.ko.md`)

  ---

  ## 🔄 동작 방식

  **시나리오: AI가 "새로운 컴포넌트"를 만드는 작업을 수행할 때**

  1. **작업 분석**: AI는 `ai-work-index.yaml`을 읽고, "new-component" 작업임을 인지합니다.
  2. **워크플로우 로드**: `caret-rules.md`의 정의에 따라 `.caretrules/workflows/new-component.md` 워크플로우를 읽습니다.
  3. **지식 원자 조합**: `new-component.md`는 내부에 필요한 지식 원자들(`tdd-cycle`, `naming-conventions` 등)을 참조하라고 명시하고 있습니다. AI는 이 원자들을 `workflows/atoms/` 디렉토리에서 찾아 조합하여 전체 작업 절차를 구성합니다.
  4. **작업 수행**: 조합된 지식을 바탕으로 TDD 사이클에 맞춰 테스트 코드 작성, 컴포넌트 구현 등의 작업을 수행합니다.

  ---

  ## 💡 핵심 장점

  1. **진정한 파트너십**: AI와 개발자가 동일한 문서를 기반으로 소통하여 오해의 소지를 없앱니다.
  2. **토큰 효율성**: AI가 거대한 단일 문서를 모두 읽는 대신, 작업에 필요한 최소한의 "지식 원자"만 조합하여 사용하므로 API 비용을 절감합니다.
  3. **유지보수성**: 규칙 변경 시, 관련된 작은 "원자" 파일만 수정하면 되므로 유지보수가 용이합니다.
  4. **투명성**: 개발자는 `caret-docs`를 통해 AI가 어떤 절차로 작업하는지 명확히 알 수 있습니다.
  ```

### 단계 2 & 3: README.md 및 인덱스 업데이트
- 이전 계획(v2)과 동일하게 `README.md`의 기능 테이블과 `caret-docs/features/index.md` 파일에 F11 항목을 추가합니다.

## 3. 실행 순서
1. 이 최종 계획에 대해 마스터의 승인을 받습니다.
2. `write_to_file`로 `caret-docs/features/f11-ai-developer-knowledge-parity.md` 파일을 생성합니다.
3. `replace_in_file`로 `README.md`와 `caret-docs/features/index.md`를 업데이트합니다.
4. 모든 작업 완료 후 최종 보고합니다.
