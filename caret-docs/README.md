# Caret 문서 허브 📚

안녕하세요! Caret 프로젝트의 공식 문서 허브에 오신 것을 환영합니다.
이곳에서는 Caret의 아키텍처, 개발 가이드, 온보딩 절차 등 모든 핵심 문서를 찾아보실 수 있습니다.

> **문서 표준화 완료** (2025-01-21): 모든 개발 문서가 MDX 형식으로 통합되고, 실제 코드베이스와 100% 일치하도록 업데이트되었습니다.

## 📖 핵심 문서

### 🎯 개발 가이드
- **[개발 가이드 메인](./development/index.md)**: 전체 개발 프로세스 개요
- **[아키텍처 및 구현 가이드](./development/caret-architecture-and-implementation-guide.md)**: Caret-Cline 통합 아키텍처 전체 가이드
- **[테스팅 가이드](./development/testing-guide.md)**: Vitest 기반 TDD 방법론
- **[로깅 가이드](./development/logging.md)**: CaretLogger, CaretWebviewLogger 사용법

### 🛠️ 작업 방법론
- **[AI 업무 방법 가이드](./guides/ai-work-method-guide.md)**: AI 어시스턴트 작업 표준 절차 (강화된 체크포인트)
- **[업스트림 머징 가이드](./guides/upstream-merging.md)**: Cline 원본 변경사항 안전한 병합 방법

## 📂 문서 구조 안내

### 📂 `development/` (핵심 개발 문서)
> **_대상: 새로운 기여자, 시스템 동작 원리를 이해하고 싶은 개발자, AI 어시스턴트_**

- **[컴포넌트 아키텍처 원칙](./development/component-architecture-principles.md)**
- **[Frontend-Backend 상호작용 패턴](./development/frontend-backend-interaction-patterns.md)**
- **[국제화(i18n) 가이드](./development/internationalization.md)**
- **[메시지 처리 아키텍처](./development/message-processing-architecture.md)**

### 📂 `features/` (기능 문서)
> **_대상: 특정 기능의 구현 방법과 아키텍처를 이해하고 싶은 개발자, AI_**

- **[페르소나 시스템](./features/persona-system.md)**: AI 캐릭터 페르소나 시스템 전체 구현 가이드 ✨ **최신 완료**

### 📂 `guides/` (작업별 가이드)
> **_대상: 특정 작업을 수행해야 하는 개발자, AI_**

- **[작업 문서 작성 가이드](./guides/writing-task-documents-guide.md)**

### 📂 `tasks/` (작업 문서)
> **_대상: 특정 기능 개발 작업을 진행하는 개발자, AI_**
> 
> 📋 **현재 진행 중인 작업은 없습니다.** 새 작업은 `tasks/` 폴더에 생성됩니다.
> 
> 🗂️ **완료된 작업**: `tasks/completed/` 폴더에서 과거 작업 기록을 확인할 수 있습니다.

### 📂 `user-guide/` (사용자 가이드)
> **_대상: Caret을 사용하는 최종 사용자_**

- **[Caret이란?](./user-guide/what-is-caret.md)**
- **[Caret 설치하기](./user-guide/installing-caret.md)**
- **[Caret 기능 소개](./user-guide/caret-features.md)**

---

## 🎯 문서 활용 가이드

### **AI 어시스턴트를 위한 문서**
- **핵심 룰**: `development/caret-rules.ko.md` - 프로젝트 전체 원칙과 규칙 (`.agents/context/caret-rules.json` SoT)
- **작업 방법**: `guides/ai-work-method-guide.md` - 강화된 체크포인트 포함
- **아키텍처**: `development/caret-architecture-and-implementation-guide.md` - 하이브리드 패턴 v3.1 포함 ✨
- **패턴**: `development/frontend-backend-interaction-patterns.md`
- **페르소나 구현**: `features/persona-system.md` - 실제 구현 사례와 기술 세부사항

### **개발자를 위한 문서**
- **시작하기**: `development/index.md` → 전체 개발 프로세스 개요
- **아키텍처 이해**: `development/caret-architecture-and-implementation-guide.md`
- **테스트 작성**: `development/testing-guide.md` (Vitest 기반 TDD)
- **업스트림 머징**: `guides/upstream-merging.md`

### **최근 업데이트 (2025-01-21)**
- ✅ **문서 표준화 완료**: 모든 개발 문서 MDX 형식 통일
- ✅ **실제 코드 일치**: 모든 경로/예제가 실제 코드베이스와 100% 일치
- ✅ **테스트 프레임워크**: Jest → Vitest 완전 전환
- ✅ **AI 체크포인트 강화**: 아키텍처 실수 방지 시스템 구축

궁금한 점이 있다면 언제나 AI 어시스턴트(Alpha)에게 질문해주세요! ☕✨ 
