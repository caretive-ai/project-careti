# Caret 문서 연관관계 매트릭스

## 📋 문서 분류 체계

### 🎯 핵심 룰 문서 (Core Rules)
- **`caretrules.ko.md`** - 프로젝트 전체 원칙과 규칙 (마스터 문서)
- **`.caretrules`** - AI용 JSON 룰 (caretrules.ko.md와 동기화)
- **`guides/ai-work-method-guide.mdx`** - AI 작업 방법론 (강화된 체크포인트)

### 🏗️ 아키텍처 문서 (Architecture)
- **`development/caret-architecture-and-implementation-guide.mdx`** - 통합 아키텍처 가이드
- **`development/component-architecture-principles.mdx`** - 컴포넌트 설계 원칙
- **`development/frontend-backend-interaction-patterns.mdx`** - 상호작용 패턴

### 🛠️ 개발 방법론 문서 (Development Methodology)
- **`development/testing-guide.mdx`** - Vitest 기반 TDD
- **`development/logging.mdx`** - 로깅 시스템
- **`development/internationalization.mdx`** - 다국어 지원

## 🔗 문서 간 연관관계

### **caretrules.ko.md** ↔ **ai-work-method-guide.mdx**
**관계**: 상호 보완
- caretrules.ko.md: 프로젝트 전체 원칙 (WHAT)
- ai-work-method-guide.mdx: 구체적 작업 절차 (HOW)
- **일관성 포인트**: Phase 기반 작업, STOP POINT, TDD 원칙

### **caret-architecture-and-implementation-guide.mdx** → **다른 개발 문서들**
**관계**: 마스터 → 세부 가이드
- 통합 아키텍처 가이드가 전체 구조 제시
- 각 세부 문서가 특정 영역 심화 설명
- **참조 체인**: 아키텍처 → 컴포넌트 → 상호작용 → 테스팅

### **frontend-backend-interaction-patterns.mdx** ↔ **component-architecture-principles.mdx**
**관계**: 상호 참조
- 상호작용 패턴: 통신 방법 (gRPC, 메시지 처리)
- 컴포넌트 원칙: UI 구조와 상태 관리
- **공통 영역**: 단일 필드 업데이트, Optimistic Update

### **testing-guide.mdx** → **모든 구현 문서**
**관계**: 품질 보증 기준
- TDD 방법론이 모든 개발 작업에 적용
- RED → GREEN → REFACTOR 패턴 강제
- **적용 대상**: 컴포넌트, 상호작용, 아키텍처 모든 영역

## 📚 작업별 필수 문서 매트릭스

### **Frontend-Backend 상호작용 작업**
**필수**: 
1. `frontend-backend-interaction-patterns.mdx` (주)
2. `caret-architecture-and-implementation-guide.mdx` (섹션 10-11)
3. `message-processing-architecture.mdx`

### **Cline 원본 파일 수정 작업**
**필수**:
1. `caretrules.ko.md` (파일 수정 체크리스트)
2. `ai-work-method-guide.mdx` (STOP POINT 2)
3. 백업 생성 및 CARET MODIFICATION 주석 규칙

### **컴포넌트/UI 개발 작업**
**필수**:
1. `component-architecture-principles.mdx` (주)
2. `internationalization.mdx` (다국어)
3. `testing-guide.mdx` (TDD)

### **테스트 관련 작업**
**필수**:
1. `testing-guide.mdx` (주)
2. `ai-work-method-guide.mdx` (TDD 강제 원칙)
3. 해당 기능별 아키텍처 문서

### **페르소나/AI 캐릭터 개발 작업**
**필수**:
1. `frontend-backend-interaction-patterns.mdx` (setPersona 패턴)
2. `component-architecture-principles.mdx`
3. `caret-assets/template_characters/` 구조 분석

## 🔄 문서 동기화 관계

### **자동 동기화**
- `caretrules.ko.md` → `.caretrules`, `.cursorrules`, `.windsurfrules`
- 스크립트: `caret-scripts/sync-caretrules.js`

### **수동 일관성 유지**
- `ai-work-method-guide.mdx` ↔ `caretrules.ko.md`
- Phase 기반 작업, STOP POINT, AI 실수 방지 원칙

## 📈 문서 진화 관계

### **상위 → 하위 전파**
1. **프로젝트 원칙 변경** (caretrules.ko.md)
   → AI 작업 방법 업데이트 (ai-work-method-guide.mdx)
   → 구체적 가이드 반영 (각 development/*.mdx)

2. **아키텍처 패턴 변경** (caret-architecture-and-implementation-guide.mdx)
   → 세부 구현 가이드 업데이트
   → 작업 문서 템플릿 반영

### **하위 → 상위 피드백**
1. **실제 구현 경험** (작업 문서, 개발 과정)
   → 방법론 개선 (ai-work-method-guide.mdx)
   → 룰 업데이트 (caretrules.ko.md)

## 🎯 문서 우선순위

### **Tier 1: 핵심 필수**
1. `caretrules.ko.md` - 전체 프로젝트 원칙
2. `ai-work-method-guide.mdx` - AI 작업 표준
3. `caret-architecture-and-implementation-guide.mdx` - 통합 아키텍처

### **Tier 2: 개발 필수**
4. `frontend-backend-interaction-patterns.mdx`
5. `component-architecture-principles.mdx`
6. `testing-guide.mdx`

### **Tier 3: 특화 가이드**
7. `logging.mdx`
8. `internationalization.mdx`
9. `upstream-merging.mdx`

## 📝 문서 품질 기준

### **일관성 체크포인트**
- [ ] 용어 통일 (Caret = '^' 기호, NOT 당근 🥕)
- [ ] 경로 정확성 (실제 코드베이스와 100% 일치)
- [ ] 예제 코드 동작성 (모든 예제가 실제 작동)
- [ ] MDX 형식 준수 (모든 기술 문서 .mdx)

### **연관관계 검증**
- [ ] 상호 참조 링크 유효성
- [ ] 중복 내용 최소화
- [ ] 누락된 연결고리 식별
- [ ] 버전 간 일관성 유지

---

**마지막 업데이트**: 2025-06-23  
**다음 검토 예정**: 주요 아키텍처 변경 시 