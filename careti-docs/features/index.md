# Careti Features Index

## 캐러티의 추가 기능 목록

Careti은 Cline을 기반으로 한 자율 AI 코딩 어시스턴트로, 다음과 같은 추가 기능들을 제공합니다.

### 패치 및 수정

- **[F00: Cline Bugfix & Patch](./f00-cline-bugfix-patch.md)**
  Cline 원본의 버그 수정 및 Careti 환경 적응을 위한 패치 모음 (Terminal Hang, Branding 등)

### 핵심 기능 (Core)

- **[F01: 공통 유틸리티](./f01-common-util.md)**
  Careti 전용 유틸리티 함수 및 헬퍼 모음

- **[F02: 다국어 지원 (i18n)](./f02-multilingual-i18n.md)**
  한국어, 영어, 일본어, 중국어 4개 언어 지원 시스템

- **[F03: 브랜딩 및 UI 시스템](./f03-branding-ui.md)**
  동적 브랜딩 전환 (Careti ↔ CodeCenter) 및 UI 커스터마이징

- **[F04: Cline 호환성 & CLI 확장](./f04-cline-compatibility-and-cli.md)**
  Cline 모드 100% 호환 및 Careti CLI/추가 기능 제공 원칙 (Dual Mode System)

- **[F05: Careti 계정 시스템](./f05-careti-account.md)**
  Careti 전용 계정 관리 및 인증 시스템 (gRPC 기반)

- **[F06: 에이전트 표준화(AAIF SoT)](./f06-agent-standard-claude-compat.md)**
  `.agents/context` 단일 SoT 및 표준 구조

### AI 시스템 (Intelligence)

- **[F07: Careti 프롬프트 시스템](./f07-careti-prompt-system.md)**
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

### 도구 및 기능 확장 (Tools & Extensions)

- **[F13: 이미지 생성 도구](./f13-image-tool.md)**
  이미지 생성, 저장, 히스토리 표시 기능

- **[F14: 문서 읽기 도구](./f14-document-read-tool.md)**
  LLM이 PDF, DOCX, HWPX, HWP, PPTX 등 문서를 경로만으로 직접 읽기 (Careti 전용)

- **[F15: 스마트 편집 엔진](./f15-smart-edit-engine.md)**
  9단계 Fuzzy Matching으로 AI 편집 성공률 +50% 향상, 토큰 98% 절감

- **[F16: 웹 도구 및 슬래시 명령](./f16-web-tools-and-slash-commands.md)**
  Web Search, Explain Changes, Use Skill 도구 (Cline v3.49.1 포팅)

- **[F17: GFM 테이블 및 마크다운 확장](./f17-gfm-table-markdown-support.md)**
  GitHub Flavored Markdown 테이블, 취소선 등 확장 마크다운 지원 (Cline 미지원 기능)

### CLI 확장 (CLI Extensions)

- **[F18: CLI Agent/Chatbot 모드](./f18-cli-agent-chatbot-mode.md)**
  CLI에서 Agent/Chatbot 모드 지원, Persona 연동, 4가지 모드 색상 테마

- **[F19: 메시지 큐 시스템](./f19-message-queue-system.md)**
  Claude Code 스타일 메시지 큐: 단일 문자열 버퍼, Double-press 인터럽트, 즉시 큐 처리

---

## 기능 맵

```
Careti 기능
├── 패치 (F00)
│   └── Bugfix & Patch
├── 기반 시스템 (F01-F06)
│   ├── 공통 유틸리티
│   ├── i18n 다국어
│   ├── 브랜딩 UI
│   ├── Cline 호환/CLI 확장
│   ├── 계정 시스템
│   └── 에이전트 표준화
├── AI 시스템 (F07-F08)
│   ├── 프롬프트 시스템
│   └── 페르소나 시스템
├── 설정/통합 (F09-F12)
│   ├── Feature Config
│   ├── Provider Setup
│   ├── 입력 히스토리
│   └── 지식 동기화 시스템
├── 도구 확장 (F13-F17)
│   ├── 이미지 생성 도구
│   ├── 문서 읽기 도구 (PDF, HWPX, HWP, PPTX)
│   ├── 스마트 편집 엔진 (9단계 Fuzzy Matching)
│   ├── 웹 도구 및 슬래시 명령 (Web Search, Explain Changes)
│   └── GFM 테이블 및 마크다운 확장 (Cline 미지원)
└── CLI/큐 확장 (F18-F19)
    ├── CLI Agent/Chatbot 모드 (자율실행, 대화모드, Persona)
    └── 메시지 큐 시스템 (Claude Code 스타일)
```

## 개발 가이드

각 기능 문서는 다음 정보를 포함합니다:
- **개요**: 기능 설명 및 목적
- **아키텍처**: 구조 및 설계
- **구현 상세**: 코드 위치 및 핵심 로직
- **머징 가이드**: Cline upstream 머징 시 주의사항
- **테스트**: 테스트 전략 및 체크리스트

## 관련 문서

- **아키텍처**: `careti-docs/development/careti-architecture-and-implementation-guide.md`
- **머징 가이드**: `careti-docs/merging/merge-execution-master-plan.md`
- **워크플로우**: `.agents/context/workflows/` (AI 개발 절차)

---

**최종 업데이트**: 2026-02-05
**문서 버전**: v2.8 (F19 메시지 큐 시스템 추가)
