# 🤖 AI 작업 인덱스 가이드

**목적**: AI가 작업의 성격을 파악하고 필요한 문서만 선택적으로 읽어 컨텍스트 효율성을 극대화합니다.

## 📋 **단계별 작업 프로세스**

### Phase 0: 필수 선행 읽기 (항상 읽기)

AI는 모든 작업 시작 전 **반드시** 다음 문서를 읽어야 합니다:

1. **`.caretrules`** - 절대적인 프로젝트 규칙
2. **`caret-docs/development/index.md`** - 개발 가이드 개요 (빠른 스캔)
3. **본 파일 (`ai-work-index.md`)** - 작업 인덱스 가이드

### Phase 1: 작업 성격 판단 (키워드 기반)

사용자 요청에서 키워드를 추출하여 작업 성격을 분류합니다:

## 🎯 **작업 성격별 필수 문서 매핑**

### 🏗️ **아키텍처 & 설계**

**키워드**: architecture, design, structure, system, scaling, fork, Cline modification
**필수 문서**:

- `caret-architecture-and-implementation-guide.md` (전체 아키텍처)
- `extension-architecture.mmd` (시각적 구조 다이어그램)
- `new-developer-guide.md` (신규 개발자용)

### 🤖 **AI 시스템 개발**

**키워드**: AI, message, system prompt, chatbot, agent, conversation
**필수 문서**:

- `ai-message-flow-guide.md` (메시지 흐름)
- `system-prompt-implementation.md` (시스템 프롬프트)
- `message-processing-architecture.md` (메시지 처리)

### 🔄 **프론트엔드-백엔드 통신**

**키워드**: webview, communication, state management, message passing, UI integration
**필수 문서**:

- `frontend-backend-interaction-patterns.md` (상호작용 패턴)
- `webview-extension-communication.md` (통신 구조)
- `ui-to-storage-flow.md` (데이터 흐름)

### 🎨 **UI/UX 개발**

**키워드**: Component, React, UI, UX, Persona, Multilingual, i18n
**필수 문서**:

- `component-architecture-principles.md` (컴포넌트 원칙)
- `../../features/f02-multilingual-i18n.md` (프론트엔드 i18n - **Source of Truth**)
- `backend-i18n-system.md` (백엔드 i18n)

### 🧪 **테스팅 & 품질 보증**

**키워드**: test, TDD, quality, coverage, verification, bug
**필수 문서**:

- `testing-guide.md` (테스팅 가이드)
- `logging.md` (로깅 시스템)

### 🔧 **개발 도구 & 유틸리티**

**키워드**: utility, tool, file handling, image, link, build
**필수 문서**:

- `utilities.md` (유틸리티)
- `file-storage-and-image-loading-guide.md` (파일 처리)
- `link-management-guide.md` (링크 관리)

### 📖 **문서화 & 규약**

**키워드**: documentation, convention, writing, standard, guide, comment
**필수 문서**:

- `documentation-guide.md` (문서화 가이드)
- `json-comment-conventions.md` (JSON 주석 규약)

### 🚨 **Cline 소스 수정**

**키워드**: Cline modification, source change, src/ directory, backup
**필수 문서**:

- `caret-architecture-and-implementation-guide.md` (수정 원칙)
- **+** `.caretrules`의 파일 수정 체크리스트 재확인

## ⚡ **효율적 읽기 전략**

### 🎯 **단계별 접근법**

1. **작업 성격 파악** (30초): 키워드 추출 → 카테고리 분류
2. **필수 문서 선택** (1분): 매핑 테이블 기반 문서 선택
3. **선택적 읽기** (5-10분): 필요한 섹션만 집중
4. **실행 전 체크** (1분): `.caretrules` 체크리스트 재확인

### 📚 **읽기 우선순위**

1. **High Priority**: 직접 관련된 핵심 문서 (최대 1-2개)
2. **Medium Priority**: 간접 관련 문서 (필요시에만)
3. **Low Priority**: 참조 문서 (링크만 확인)

### 🔍 **스마트 읽기 방법**

- **목차 먼저 스캔**: 관련 섹션 파악
- **키워드 검색**: 특정 내용 빠르게 찾기
- **코드 예제 우선**: 실제 구현 패턴 확인
- **체크리스트 활용**: 놓치기 쉬운 필수 사항 점검

## 🚨 **절대 확인 사항**

### 모든 작업 공통

- [ ] `.caretrules` 파일 수정 체크리스트 확인
- [ ] TDD 원칙 (Red → Green → Refactor)
- [ ] 백업 생성 (Cline 소스 수정 시)
- [ ] CARET MODIFICATION 주석 추가 (Cline 소스 수정 시)

### 작업별 확인 사항

- [ ] **AI 시스템**: 시스템 프롬프트 구조 이해
- [ ] **프론트엔드-백엔드**: 순환 메시지 방지 패턴
- [ ] **UI 개발**: 컴포넌트 설계 원칙
- [ ] **테스팅**: 100% 테스트 커버리지 목표

## 🎁 **AI 작업 효율화 팁**

### 🔄 **반복 작업 최적화**

- 자주 사용하는 문서 조합 암기
- 작업 패턴별 템플릿 활용
- 체크리스트 자동화

### 🎯 **컨텍스트 관리**

- 필수 정보만 메모리에 유지
- 불필요한 세부사항 폐기
- 핵심 패턴과 원칙 우선

### 📈 **학습 곡선 최적화**

- 처음 몇 작업은 더 많은 문서 참조
- 경험이 쌓이면 선택적 읽기
- 실수 패턴 기록 및 개선

---

**💡 AI를 위한 작업 전 체크리스트:**

- [ ] 작업 성격 파악 완료
- [ ] 필수 문서 선택 완료
- [ ] 선택적 읽기 완료
- [ ] `.caretrules` 체크리스트 확인 완료
- [ ] 실행 계획 수립 완료

**🎯 목표**: 최소 컨텍스트로 최대 효율 달성!
