# Careti 문서 연관관계 매트릭스

## 📋 문서 분류 체계

### 🎯 핵심 룰 문서 (Core Rules)
- **`development/careti-rules.ko.md`** - 프로젝트 전체 원칙과 규칙 (마스터 문서)
- **`.agents/context/careti-rules.json`** - AI용 JSON SoT (development/careti-rules.ko.md와 의미 동기화)
- **`guides/ai-work-method-guide.md`** - AI 작업 방법론 (강화된 체크포인트)

### 🏗️ 아키텍처 문서 (Architecture)
- **`development/careti-architecture-and-implementation-guide.md`** - 통합 아키텍처 가이드
- **`development/component-architecture-principles.md`** - 컴포넌트 설계 원칙
- **`development/frontend-backend-interaction-patterns.md`** - 상호작용 패턴

### 🛠️ 개발 방법론 문서 (Development Methodology)
- **`development/testing-guide.md`** - Vitest 기반 TDD
- **`development/logging.md`** - 로깅 시스템
- **`development/internationalization.md`** - 다국어 지원

## 🔗 문서 간 연관관계

### **development/careti-rules.ko.md** ↔ **ai-work-method-guide.md**
**관계**: 상호 보완
- development/careti-rules.ko.md: 프로젝트 전체 원칙 (WHAT)
- ai-work-method-guide.md: 구체적 작업 절차 (HOW)
- **일관성 포인트**: Phase 기반 작업, STOP POINT, TDD 원칙

### **careti-architecture-and-implementation-guide.md** → **다른 개발 문서들**
**관계**: 마스터 → 세부 가이드
- 통합 아키텍처 가이드가 전체 구조 제시
- 각 세부 문서가 특정 영역 심화 설명
- **참조 체인**: 아키텍처 → 컴포넌트 → 상호작용 → 테스팅

### **frontend-backend-interaction-patterns.md** ↔ **component-architecture-principles.md**
**관계**: 상호 참조
- 상호작용 패턴: 통신 방법 (gRPC, 메시지 처리)
- 컴포넌트 원칙: UI 구조와 상태 관리
- **공통 영역**: 단일 필드 업데이트, Optimistic Update

### **testing-guide.md** → **모든 구현 문서**
**관계**: 품질 보증 기준
- TDD 방법론이 모든 개발 작업에 적용
- RED → GREEN → REFACTOR 패턴 강제
- **적용 대상**: 컴포넌트, 상호작용, 아키텍처 모든 영역

## 📚 작업별 필수 문서 매트릭스

### **Frontend-Backend 상호작용 작업**
**필수**: 
1. `frontend-backend-interaction-patterns.md` (주)
2. `careti-architecture-and-implementation-guide.md` (섹션 10-11)
3. `message-processing-architecture.md`

### **Cline 원본 파일 수정 작업**
**필수**:
1. `development/careti-rules.ko.md` (파일 수정 체크리스트)
2. `ai-work-method-guide.md` (STOP POINT 2)
3. 백업 생성 및 CARETI MODIFICATION 주석 규칙

### **컴포넌트/UI 개발 작업**
**필수**:
1. `component-architecture-principles.md` (주)
2. `internationalization.md` (다국어)
3. `testing-guide.md` (TDD)

### **테스트 관련 작업**
**필수**:
1. `testing-guide.md` (주)
2. `ai-work-method-guide.md` (TDD 강제 원칙)
3. 해당 기능별 아키텍처 문서

### **페르소나/AI 캐릭터 개발 작업**
**필수**:
1. `frontend-backend-interaction-patterns.md` (setPersona 패턴)
2. `component-architecture-principles.md`
3. `assets/template_characters/` 구조 분석

## 🔄 문서 동기화 관계

### **동기화 원칙**
- `development/careti-rules.ko.md` ↔ `.agents/context/careti-rules.json` 의미 일치 유지
- 워크플로 문서는 `.agents/context/workflows/`와 대응 문서 간 수동 정합성 유지

### **수동 일관성 유지**
- `ai-work-method-guide.md` ↔ `development/careti-rules.ko.md`
- Phase 기반 작업, STOP POINT, AI 실수 방지 원칙

## 📈 문서 진화 관계

### **상위 → 하위 전파**
1. **프로젝트 원칙 변경** (development/careti-rules.ko.md)
   → AI 작업 방법 업데이트 (ai-work-method-guide.md)
   → 구체적 가이드 반영 (각 development/*.md)

2. **아키텍처 패턴 변경** (careti-architecture-and-implementation-guide.md)
   → 세부 구현 가이드 업데이트
   → 작업 문서 템플릿 반영

### **하위 → 상위 피드백**
1. **실제 구현 경험** (작업 문서, 개발 과정)
   → 방법론 개선 (ai-work-method-guide.md)
   → 룰 업데이트 (development/careti-rules.ko.md)

## 🎯 문서 우선순위

### **Tier 1: 핵심 필수**
1. `development/careti-rules.ko.md` - 전체 프로젝트 원칙
2. `ai-work-method-guide.md` - AI 작업 표준
3. `careti-architecture-and-implementation-guide.md` - 통합 아키텍처

### **Tier 2: 개발 필수**
4. `frontend-backend-interaction-patterns.md`
5. `component-architecture-principles.md`
6. `testing-guide.md`

### **Tier 3: 특화 가이드**
7. `logging.md`
8. `internationalization.md`
9. `upstream-merging.md`

## 📝 문서 품질 기준

### **일관성 체크포인트**
- [ ] 용어 통일 (Careti = '^' 기호, NOT 당근 🥕)
- [ ] 경로 정확성 (실제 코드베이스와 100% 일치)
- [ ] 예제 코드 동작성 (모든 예제가 실제 작동)
- [ ] MDX 형식 준수 (모든 기술 문서 .md)

### **연관관계 검증**
- [ ] 상호 참조 링크 유효성
- [ ] 중복 내용 최소화
- [ ] 누락된 연결고리 식별
- [ ] 버전 간 일관성 유지

---

**마지막 업데이트**: 2025-06-23  
**다음 검토 예정**: 주요 아키텍처 변경 시 
