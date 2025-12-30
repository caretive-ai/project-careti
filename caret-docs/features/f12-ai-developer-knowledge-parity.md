# F12 - AI-Developer Knowledge Parity (지식 동기화 시스템)

**상태**: ✅ Phase 0 완료  
**영향 범위**: Documentation (.agents/context, AGENTS.md), Process  
**우선순위**: 🔴 High

---

## 📋 개요

Caret의 **AI-Developer Knowledge Parity**는 AI와 개발자가 동일한 지식(규칙, 컨벤션, 아키텍처)을 공유하도록 보장하는 문서화 시스템입니다.  
"지식 원자화(Atomic Knowledge)"와 "온디맨드 로딩(On-Demand Loading)"을 통해 토큰 효율성을 극대화하고 정보 불균형을 해소합니다.

---

## 🆚 Cline 대비 개선점 (Improvements)

| 기능 | Cline (Original) | Caret (Enhanced) |
| --- | --- | --- |
| **지식 공유** | `.agents/context` 단일 파일 (단순 텍스트) | **Atomic Knowledge System**. 지식을 최소 단위(Atom)로 쪼개고, 필요할 때 조합하여 사용하는 구조화된 시스템. |
| **효율성** | 모든 규칙을 항상 로드 (토큰 낭비) | **On-Demand Loading**. JSON 인덱스를 통해 현재 작업에 필요한 규칙만 선별적으로 로드하여 컨텍스트 절약. |
| **동기화** | AI용 규칙과 사람용 문서가 별개 | **Single Source of Truth**. 개발자가 보는 문서(`caret-docs`)와 AI가 보는 규칙(`.agents/context`)이 1:1로 대응됨. |

---

## 🏗 코드 범위 (Code Scope)

이 기능은 소스 코드보다는 **프로젝트 구조와 문서 시스템**으로 구현됩니다.

### 1. Root Configuration
- **`.agents/context/caret-rules.json`**: 전체 규칙 시스템의 인덱스 파일. (AI 진입점)
- **`AGENTS.md`**: AI 에이전트에게 `.agents/context`를 먼저 읽도록 지시하는 설정 파일.

### 2. Knowledge Base
- **`.agents/context/workflows/`**: 작업별 절차 정의 (AI용).
- **`.agents/context/workflows/atoms/`**: 재사용 가능한 최소 단위 지식 (TDD 사이클, 네이밍 규칙 등).

### 3. Developer Docs
- **`caret-docs/`**: 개발자가 읽는 문서 (AI 규칙의 Human-readable 버전).

---

## 🏗️ 시스템 구조

이 시스템은 물리적인 코드 변경보다는, **문서의 조직적인 구성과 AI의 해석 방식**에 대한 약속으로 구현됩니다.

### 1. 핵심 파일: `caret-rules.md`
- **위치**: `.agents/context/caret-rules.md`
- **역할**: AI에게 문서 시스템의 전체 구조와 파일 탐색 경로를 알려주는 최상위 규칙 파일입니다.
- **핵심 로직**:
  ```markdown
  ### Document Access Pattern (On-Demand System)
  - **1. Initialize**: AI reads `.agents/context/caret-rules.json` (JSON Index)
  - **2. Analyze**: AI identifies required workflow from `workflows.index`
  - **3. Load**: AI reads specific workflow file (e.g., `.agents/context/workflows/ai-feature.md`) ONLY when needed
  ```

---

## 🔄 동작 방식

**시나리오: AI가 "새로운 컴포넌트"를 만드는 작업을 수행할 때**

1. **작업 분석**: AI는 `ai-work-index.yaml`을 읽고, "new-component" 작업임을 인지합니다.
2. **워크플로우 로드**: `caret-rules.md`의 정의에 따라 `.agents/context/workflows/new-component.md` 워크플로우를 읽습니다.
3. **지식 원자 조합**: `new-component.md`는 내부에 필요한 지식 원자들(`tdd-cycle`, `naming-conventions` 등)을 참조하라고 명시하고 있습니다. AI는 이 원자들을 `workflows/atoms/` 디렉토리에서 찾아 조합하여 전체 작업 절차를 구성합니다.
4. **작업 수행**: 조합된 지식을 바탕으로 TDD 사이클에 맞춰 테스트 코드 작성, 컴포넌트 구현 등의 작업을 수행합니다.

---

## 💡 핵심 장점

1. **진정한 파트너십**: AI와 개발자가 동일한 문서를 기반으로 소통하여 오해의 소지를 없앱니다.
2. **토큰 효율성**: AI가 거대한 단일 문서를 모두 읽는 대신, 작업에 필요한 최소한의 "지식 원자"만 조합하여 사용하므로 API 비용을 절감합니다.
3. **유지보수성**: 규칙 변경 시, 관련된 작은 "원자" 파일만 수정하면 되므로 유지보수가 용이합니다.
4. **투명성**: 개발자는 `caret-docs`를 통해 AI가 어떤 절차로 작업하는지 명확히 알 수 있습니다.
