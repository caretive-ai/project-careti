# Caret Features Index

## 캐럿의 추가 기능 목록

Caret은 Cline을 기반으로 한 자율 AI 코딩 어시스턴트로, 다음과 같은 추가 기능들을 제공합니다.

### 핵심 기능

- **[F01: 공통 유틸리티](./f01-common-util.md)**
  Caret 전용 유틸리티 함수 및 헬퍼 모음

- **[F02: 다국어 지원 (i18n)](./f02-multilingual-i18n.md)**
  한국어, 영어, 일본어, 중국어 4개 언어 지원 시스템

- **[F03: 브랜딩 및 UI 시스템](./f03-branding-ui.md)**
  동적 브랜딩 전환 (Caret ↔ CodeCenter) 및 UI 커스터마이징

- **[F04: Caret 계정 시스템](./f04-caret-account.md)**
  Caret 전용 계정 관리 및 인증 시스템

- **[F05: 다중 룰 우선순위 설정](./f05-rule-priority-system.md)**
  JSON 기반 룰 시스템 및 우선순위 관리

### AI 시스템

- **[F06: Caret 프롬프트 시스템](./f06-caret-prompt-system.md)**
  JSON 동적 시스템 프롬프트 및 모드 전환 (AGENT ↔ ACT)

- **[F07: 페르소나 시스템](./f07-persona-system.md)**
  AI 페르소나 선택 및 관리 시스템

### 설정 및 통합

- **[F08: Feature Config 시스템](./f08-feature-config-system.md)**
  기능 활성화/비활성화 관리 시스템

- **[F09: Enhanced Provider Setup](./f09-enhanced-provider-setup.md)**
  향상된 AI 프로바이더 설정 및 관리

- **[F10: 입력 히스토리 시스템](./f10-input-history-system.md)**
  채팅 입력 자동 완성 및 히스토리 관리

---

## 기능 맵

```
Caret 기능
├── 기반 시스템 (F01-F05)
│   ├── 공통 유틸리티
│   ├── i18n 다국어
│   ├── 브랜딩 UI
│   ├── 계정 시스템
│   └── 룰 우선순위
├── AI 시스템 (F06-F07)
│   ├── 프롬프트 시스템
│   └── 페르소나 시스템
└── 설정/통합 (F08-F11)
    ├── Feature Config
    ├── Provider Setup
    ├── LiteLLM 모델 가져오기
    └── 입력 히스토리
```

## 개발 가이드

각 기능 문서는 다음 정보를 포함합니다:
- **개요**: 기능 설명 및 목적
- **아키텍처**: 구조 및 설계
- **구현 상세**: 코드 위치 및 핵심 로직
- **머징 가이드**: Cline upstream 머징 시 주의사항
- **테스트**: 테스트 전략 및 체크리스트

## 관련 문서

- **아키텍처**: `caret-docs/development/caret-architecture-and-implementation-guide.mdx`
- **머징 가이드**: `caret-docs/merging/merge-execution-master-plan.md`
- **워크플로우**: `.caretrules/workflows/` (AI 개발 절차)

---

**최종 업데이트**: 2025-10-14
**문서 버전**: v2.0 (Cline v3.32.7 머징 반영)
