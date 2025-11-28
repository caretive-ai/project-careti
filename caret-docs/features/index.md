# Caret Features Index

## 캐럿의 추가 기능 목록

Caret은 Cline을 기반으로 한 자율 AI 코딩 어시스턴트로, 다음과 같은 추가 기능들을 제공합니다.

### 패치 및 수정

- **[F00: Cline Bugfix & Patch](./f00-cline-bugfix-patch.md)**
  Cline 원본의 버그 수정 및 Caret 환경 적응을 위한 패치 모음 (Terminal Hang, Branding 등)

### 핵심 기능 (Core)

- **[F01: 공통 유틸리티](./f01-common-util.md)**
  Caret 전용 유틸리티 함수 및 헬퍼 모음

- **[F02: 다국어 지원 (i18n)](./f02-multilingual-i18n.md)**
  한국어, 영어, 일본어, 중국어 4개 언어 지원 시스템

- **[F03: 브랜딩 및 UI 시스템](./f03-branding-ui.md)**
  동적 브랜딩 전환 (Caret ↔ CodeCenter) 및 UI 커스터마이징

- **[F04: Cline 호환성 & CLI 확장](./f04-cline-compatibility-and-cli.md)**
  Cline 모드 100% 호환 및 Caret CLI/추가 기능 제공 원칙 (Dual Mode System)

- **[F05: Caret 계정 시스템](./f05-caret-account.md)**
  Caret 전용 계정 관리 및 인증 시스템 (gRPC 기반)

- **[F06: Rule Priority System](./f06-rule-priority-system.md)**
  `.caretrules` 우선순위 관리 및 규칙 충돌 해결

### AI 시스템 (Intelligence)

- **[F07: Caret 프롬프트 시스템](./f07-caret-prompt-system.md)**
  JSON 동적 시스템 프롬프트 및 Chatbot/Agent 모드 전환

- **[F08: 페르소나 시스템](./f08-persona-system.md)**
  AI 페르소나 선택/관리 및 채팅 아바타 시스템

### 설정 및 통합 (Configuration & Integration)

- **[F09: Feature Config 시스템](./f09-feature-config-system.md)**
  배포 환경별 기능 활성화/비활성화 관리 시스템 (White-labeling)

- **[F10: Enhanced Provider Setup](./f10-enhanced-provider-setup.md)**
  LiteLLM, BizRouter 등 향상된 AI 프로바이더 설정 및 자동화

- **[F11: 입력 히스토리·단축키 시스템](./f11-input-history-and-shortcuts.md)**
  터미널 스타일의 입력 히스토리 탐색 및 생산성 단축키

- **[F12: AI-개발자 지식 동기화 시스템](./f12-ai-developer-knowledge-parity.md)**
  AI와 개발자 간의 1:1 지식 동기화를 통해 진정한 AI 파트너십을 구현하는 핵심 시스템

---

## 기능 맵

```
Caret 기능
├── 패치 (F00)
│   └── Bugfix & Patch
├── 기반 시스템 (F01-F06)
│   ├── 공통 유틸리티
│   ├── i18n 다국어
│   ├── 브랜딩 UI
│   ├── Cline 호환/CLI 확장
│   ├── 계정 시스템
│   └── 룰 우선순위
├── AI 시스템 (F07-F08)
│   ├── 프롬프트 시스템
│   └── 페르소나 시스템
└── 설정/통합 (F09-F12)
    ├── Feature Config
    ├── Provider Setup
    ├── 입력 히스토리
    └── 지식 동기화 시스템
```

## 개발 가이드

각 기능 문서는 다음 정보를 포함합니다:
- **개요**: 기능 설명 및 목적
- **아키텍처**: 구조 및 설계
- **구현 상세**: 코드 위치 및 핵심 로직
- **머징 가이드**: Cline upstream 머징 시 주의사항
- **테스트**: 테스트 전략 및 체크리스트

## 관련 문서

- **아키텍처**: `caret-docs/development/caret-architecture-and-implementation-guide.md`
- **머징 가이드**: `caret-docs/merging/merge-execution-master-plan.md`
- **워크플로우**: `.caretrules/workflows/` (AI 개발 절차)

---

**최종 업데이트**: 2025-11-24
**문서 버전**: v2.2 (Cline 호환/CLI 항목 추가, 번호 재정렬 준비)
