# F11: AI-개발자 지식 동기화 시스템

**상태**: ✅ 구현 완료 및 배포 (2025-11-23)
**구현도**: 100% (JSON 인덱스 + 온디맨드 로딩 시스템)
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
  ### Document Access Pattern (On-Demand System)
  - **1. Initialize**: AI reads `.caretrules/caret-rules.json` (JSON Index)
  - **2. Analyze**: AI identifies required workflow from `workflows.index`
  - **3. Load**: AI reads specific workflow file (e.g., `.caretrules/workflows/ai-feature.md`) ONLY when needed
  ```
  이 규칙을 통해 AI는 모든 규칙을 한 번에 읽지 않고, JSON 인덱스를 통해 필요한 지식만 "온디맨드"로 로드하여 토큰 효율성을 극대화합니다.

### 2. 지식의 원천: `workflows/` 와 `atoms/`
- **위치**: `.caretrules/workflows/`
- **역할**: 실제 작업 절차를 담고 있는 "지식 원자(Atomic Workflow)"들의 집합입니다.
- **구조 및 형식 원칙**:
  - **AI 우선 형식**: 구조화된 데이터(예: `ai-work-index.yaml`)는 **YAML** 또는 **JSON** 형식을 사용합니다. 이는 AI의 토큰 효율성을 극대화하고 해석의 명확성을 보장하기 위함입니다.
  - **사람 우선 형식**: 복합적인 절차나 가이드(예: `new-component.md`)는 **Markdown** 형식을 사용합니다.
  - **중복 금지**: 동일한 내용이 `.md`와 `.yaml`로 중복 존재하는 것을 금지하며, 구조화된 데이터는 항상 `.yaml` 또는 `.json`을 단일 정보 소스로 사용합니다.
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
