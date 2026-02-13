# Careti 특징 개요

Careti은 Cline을 기반으로 한 VSCode AI 코딩 어시스턴트 확장 프로그램입니다. Cline의 모든 기능을 포함하면서, 사용자 경험과 개발 효율성을 대폭 향상시킨 차별화 기능들을 제공합니다.

> **Careti** 이름의 유래: 프로그래밍에서 위치와 방향을 나타내는 '^' (careti) 기호에서 따온 이름입니다.

## 🎯 **Careti와 Cline 핵심 차이점**

### **✅ 완전 구현된 차별화 기능들**

| 특징                                | 설명                    | 사용자 이점                      | 상세 문서                                         |
| ----------------------------------- | ----------------------- | -------------------------------- | ------------------------------------------------- |
| **🔧 에이전트 표준화(AAIF SoT)**          | `.agents/context` SoT + AGENTS 계층 + `/init` 스캐폴드 | 규칙 충돌 제거, 온보딩 가속 | [→ 상세보기](./features/f06-agent-standard-claude-compat.md) |
| **👤 계정 및 조직 관리**             | Auth0 기반 계정 시스템  | 팀 관리, 사용량 모니터링, 요금제 | [→ 상세보기](./features/account-organization.md) |
| **🌍 다국어 i18n**                   | 4개국 완전 다국어 지원  | 한국어/영어/일본어/중국어 UI     | [→ 상세보기](./features/multilingual-i18n.md)    |
| **📋 로깅 시스템**                   | 통합 로깅 아키텍처      | 개발 디버깅, 오류 추적 강화      | [→ 상세보기](./features/logging-system.md)       |
| **🎨 브랜딩 및 UI**                  | Careti 고유 브랜딩       | 시각적 정체성, 전용 페이지들     | [→ 상세보기](./features/branding-ui.md)          |
| **📨 메시지 큐 시스템**              | Claude Code 스타일 큐    | 스트리밍 중 입력, 즉시 취소 처리 | [→ 상세보기](./features/f19-message-queue-system.md) |

### **🔄 개발 중 / 고도화 기능들**

| 특징                      | 설명                          | 개발 상태               | 상세 문서                                       |
| ------------------------- | ----------------------------- | ----------------------- | ----------------------------------------------- |
| **🤖 챗봇/에이전트 모드**  | Plan/Act → Chatbot/Agent 매핑 | 복잡한 구조 정리 필요   | [→ 상세보기](./features/chatbot-agent-mode.md) |
| **📄 JSON 시스템 프롬프트** | 구조화된 프롬프트 시스템      | 부분 구현, 확장 예정    | [→ 상세보기](./features/json-system-prompt.md) |
| **👥 페르소나 시스템**     | AI 캐릭터 페르소나 선택       | 기본 구조 완성, 보완 중 | [→ 상세보기](./features/persona-system.md)     |

### **💻 CLI Standalone**

| 특징                   | 설명                           | 비고                  |
| ---------------------- | ------------------------------ | --------------------- |
| **독립 실행**          | VS Code 없이 터미널에서 실행   | `./caret`             |
| **다중 모드**          | plan/act/agent/chatbot 지원    | 색상별 구분           |
| **옵션 선택**          | 숫자 키(1-9)로 옵션 선택       | followup 질문 대응    |
| **Headless 모드**      | `-y`, `-o` 플래그로 비대화형   | CI/CD 통합 가능       |
| **AGENTS 초기화 스킵** | CLI 모드에서 자동 초기화 비활성 | `isCliSubagent` 플래그 |

## 🎭 **주요 특징 살펴보기**

### **🔧 에이전트 표준화**

- **문제**: 레거시 규칙 경로 혼재로 컨텍스트 충돌
- **해결**: `.agents/context` SoT + `AGENTS.md` 계층 + `/init` 스캐폴드
- **결과**: 결정적 규칙 로딩, 온보딩 비용 감소

### **🌍 글로벌 서비스**

- **30개 언어 파일**로 4개국 완전 지원
- **네임스페이스별 분류**: common, welcome, persona, settings, announcement 등
- **실시간 언어 전환** 및 설정 저장

### **👤 전문적인 팀 관리**

- **Auth0 기반 보안 로그인**
- **Organization 단위 계정 관리**
- **실시간 사용량 대시보드**
- **요금제별 API 제한 관리**

### **🤖 직관적인 모드 시스템**

- **챗봇 모드**: 대화 중심, 빠른 응답
- **에이전트 모드**: 작업 중심, 정확한 실행
- **호환성**: Cline Plan/Act 모드와 자동 매핑

## 🏗️ **아키텍처 철학**

### **🎯 Careti의 개발 원칙**

1. **Cline 코드 보존**: 원본 최소 수정으로 호환성 유지
2. **독립적 확장**: `careti-src/` 디렉토리에서 자유로운 개발
3. **TDD 원칙**: 모든 Careti 기능 100% 테스트 커버리지
4. **다국어 우선**: 모든 UI 요소 국제화 지원

### **📁 디렉토리 구조**

```
careti/
├── careti-src/          # Careti 전용 기능 (TDD 100%)
├── assets/       # 브랜딩 리소스
├── webview-ui/src/careti/ # 프론트엔드 UI
└── src/               # Cline 원본 (최소 수정)
```

## 🚀 **시작하기**

### **VSCode 확장 설치**

1. VSCode에서 Careti 확장 설치
2. 계정 생성 또는 로그인
3. 언어 설정 선택
4. API 키 설정
5. 페르소나 선택 (선택사항)

### **CLI Standalone 사용**

```bash
# 빌드
npm run compile && npm run compile-cli

# 실행
./caret                          # 대화형 모드
./caret "your prompt"            # 직접 프롬프트
./caret --mode agent             # 에이전트 모드
./caret -y                       # Yolo 모드 (비대화형)
./caret -o                       # Oneshot 모드 (완전 자율)
```

### **주요 기능 활용**

- **규칙 파일**: `.agents/context` 파일로 프로젝트별 설정
- **모드 전환**: `Cmd/Ctrl+Shift+A`로 Chatbot/Agent 모드 토글
- **언어 변경**: 설정에서 UI 언어 선택
- **계정 관리**: 사용량 모니터링 및 팀 설정

## 📚 **상세 문서**

각 특징별 구현 세부사항과 개발 가이드는 다음 문서들을 참조하세요:

### **🔍 특징별 상세 문서**

- [에이전트 표준화(AAIF SoT)](./features/f06-agent-standard-claude-compat.md) - `.agents/context` SoT + AGENTS 계층 + `/init`
- [계정 및 조직 관리](./features/account-organization.md) - 계정 및 조직 관리
- [다국어 i18n](./features/multilingual-i18n.md) - 다국어 지원 시스템
- [챗봇/에이전트 모드](./features/chatbot-agent-mode.md) - 모드 시스템
- [JSON 시스템 프롬프트](./features/json-system-prompt.md) - JSON 프롬프트
- [페르소나 시스템](./features/persona-system.md) - 페르소나 시스템
- [로깅 시스템](./features/logging-system.md) - 로깅 시스템
- [브랜딩 및 UI](./features/branding-ui.md) - 브랜딩 및 UI

### **🔧 개발 및 머징 문서**

- [머징 전략 가이드](./merging/merging-strategy-guide.md) - 전체 머징 전략
- [단계별 구현 가이드](./merging/phase-implementation-guide.md) - Phase별 구현 가이드
- [TDD 테스트 요구사항](./merging/tdd-testing-requirements.md) - TDD 및 테스트 요구사항

### **🎯 전략 및 로드맵**

- [Careti 개발 로드맵](./careti-development-roadmap.md) - 기능별 향후 개발 계획

---

**작성자**: Alpha (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-08-16  
**최종 업데이트**: 2025-08-16 17:10 KST

---

_Caret은 개발자의 생산성을 높이고 AI와의 협업을 더욱 자연스럽게 만드는 것을 목표로 지속적으로 발전하고 있습니다._
