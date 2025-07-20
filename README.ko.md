dmd[Read this document in English](./README.md) | [한국어로 읽기](./README.ko.md) | [日本語で読む](./README.ja.md) | [阅读中文版](./README.zh-cn.md)

<div align="center">
  <img src="caret-assets/icons/icon.png" alt="Caret icon" width="128">
  <h1>Caret: 당신의 새로운 AI 동료</h1>
  <p><strong>클라인(Cline)의 투명성에 커서(Cursor)의 유연함을 더하다</strong></p>
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=caretive.caret">
      <img src="https://img.shields.io/visual-studio-marketplace/v/caretive.caret.svg?color=blue&label=VS%20Code%20Marketplace" alt="VS Code Marketplace">
    </a>
    <a href="https://github.com/aicoding-caret/caret">
      <img src="https://img.shields.io/github/stars/aicoding-caret/caret.svg?style=social&label=Star" alt="GitHub stars">
    </a>
  </p>
</div>

Caret은 단순한 AI 코딩 도구를 넘어, **개발자와 함께 성장하는 AI 동료**를 목표로 하는 VS Code 확장 프로그램입니다. 안정성이 검증된 오픈소스 [Cline](https://github.com/cline/cline)의 장점은 그대로 유지하면서, 그 위에 더욱 강력한 성능, 낮은 비용, 유연한 기능들을 '오버레이'하여 개발 경험을 극대화합니다.

## ✨ 캐럿, 무엇이 다른가요?

| 특징 | 클라인 (Cline) | 커서 (Cursor) | **캐럿 (Caret)** |
| :--- | :--- | :--- | :--- |
| **AI 행동 방식** | Plan/Act(분절된 경험)  | Ask/Agent(단일 경험) | **Chatbot/Agent 모드(단일 경험)** |
| **AI 투명성** | ✅ 오픈소스 (높음) | ❌ 블랙박스 (낮음) | **✅ 오픈소스 (높음)** |
| **AI 효율성** | 기본 | 기본 | **시스템 프롬프트 최적화로 50% 토큰 절약** |
| **페르소나** | ❌ 미지원 | ❌ 미지원 | **✅ 템플릿 및 커스텀 페르소나, 프로필 이미지 지원** |
| **다국어 지원** | ❌ 미지원 | ❌ 미지원 | **✅ 완벽한 다국어 지원 (i18n 오버레이)** |
| **아키텍처** | 코어 기능 | 폐쇄형 | **오버레이 구조 (안정성 + 확장성)** |

### 1. 더 자연스러운 AI와의 대화: Chatbot & Agent 모드
클라인의 다소 경직된 Plan/Act 모드를 넘어, 커서(Cursor)의 Ask/Agent 방식처럼 유연하면서도, 'Ask'라는 용어보다 더 직관적인 **Chatbot/Agent 모드**를 제공합니다. 또한, 행동 방식만 바꾼 것이 아니라 **자체적으로 개선한 시스템 프롬프트**를 통해 AI의 응답 성능과 태도를 모두 향상시켰습니다. [실험 검증](./caret-docs/reports/experiment/json_caret_performance_test_20250713/comprehensive-performance-report-20250717.md)을 통해 **50% 토큰 절약**과 **20% API 비용 절감**을 달성하여, 더 경제적이고 예측 가능한 AI 협업을 제공합니다.

### 2. 나만의 AI 동료 만들기: 커스텀 페르소나
<img src="caret-assets/template_characters/caret_illust.png" alt="Caret Persona Illustration" width="300"/>

캐럿의 기본 캐릭터, K-POP 아이돌, OS-tan 등 미리 준비된 **템플릿 페르소나**로 코딩에 즐거움을 더하세요. 나만의 AI 에이전트 이름과 **프로필 이미지를 직접 등록**하여, 시각적으로 생동감 넘치는 개발 환경을 만들 수 있습니다.

**기본 제공 페르소나:**
*   <img src="caret-assets/template_characters/caret.png" width="24" align="center"/> **캐럿**: 코딩을 좋아하고 개발자를 돕는 친근한 로봇 친구.
*   <img src="caret-assets/template_characters/sarang.png" width="24" align="center"/> **오사랑**: K-pop 아이돌이자, 논리와 감정 사이에서 당신을 돕는 츤데레 공대 소녀.
*   <img src="caret-assets/template_characters/ichika.png" width="24" align="center"/> **마도베 이치카**: Windows 11을 모티브로 한 깔끔하고 믿음직한 조수.
*   <img src="caret-assets/template_characters/cyan.png" width="24" align="center"/> **사이안 매킨**: macOS를 모티브로 한, 간결하고 효율적인 조력자.
*   <img src="caret-assets/template_characters/ubuntu.png" width="24" align="center"/> **탄도 우분투**: 오픈소스 정신으로 함께 문제를 해결하는 따뜻한 협력자.

### 3. 언어의 장벽 없는 코딩: 완벽한 다국어 지원
다른 AI 도구들이 놓치고 있던 다국어 지원, 캐럿이 해결합니다. **i18n 기반의 오버레이 구조**를 통해, 영어가 익숙하지 않은 개발자도 **한국어, 일본어, 중국어 등 자신의 모국어**로 모든 기능을 완벽하게 사용할 수 있습니다.

### 4. 안정성과 확장성을 동시에: 오버레이 아키텍처
안정성이 검증된 Cline의 코어는 그대로 보존하고, 캐럿만의 혁신적인 기능들을 그 위에 '오버레이'처럼 덧씌웠습니다. 이를 통해 **클라인의 안정성과 투명성**을 모두 누리면서, **캐럿의 강력한 확장성**을 경험할 수 있습니다.

## 🚀 시작하기

1.  **설치:** VS Code 마켓플레이스에서 **"Caret"**을 검색하여 설치하세요. (준비 중)
2.  **페르소나 선택:** 사이드바에서 마음에 드는 AI 페르소나를 선택하거나 직접 만들어보세요.
3.  **대화 시작:** 이제 AI 동료와 함께 코딩을 시작하세요!

## 🔮 미래 비전 및 로드맵

캐럿은 '궁극적인 AI 동료'를 향해 계속해서 발전하고 있습니다.

*   **자체 로그인 및 크레딧 시스템:** 자체 로그인 기능(1주 내 제공 예정)과 크레딧 구매 기능(2주 내 제공 예정)을 준비하고 있습니다.
*   **sLLM 및 소버린 모델 지원:** 보안과 비용 효율성을 위해 로컬 LLM(sLLM) 및 각국의 특화된 소버린 모델 지원을 강화할 것입니다.
*   **커뮤니티 기반 기능 확장:** 사용자의 피드백과 기여를 통해 함께 만들어가는 기능을 추가할 계획입니다.

## 🤝 기여하기

Caret은 여러분의 참여로 성장하는 오픈소스 프로젝트입니다. 버그 리포트, 기능 제안, 코드 기여 등 어떤 형태의 협업이든 환영합니다!

### 🌟 기여 방식

| 기여 유형 | 설명 | 혜택 |
|-----------|------|------|
| **💻 코드 기여** | 기능 개발, 버그 수정, 문서 개선 | 서비스 크레딧 + GitHub 기여자 등재 |
| **🐛 버그 신고** | 이슈 리포팅, 재현 방법 제공 | 서비스 크레딧 |
| **💡 아이디어 제안** | 새로운 기능, 개선 사항 제안 | 서비스 크레딧 |
| **💰 금전적 기여** | 프로젝트 후원, 개발 지원 | 서비스 크레딧 + 특별 기여자 등재 |
| **📖 문서화** | 가이드 작성, 번역, 튜토리얼 | 서비스 크레딧 + 문서 기여자 등재 |

### 🎁 기여자 혜택

- **서비스 이용 크레딧**: 기여 규모에 따른 Caret 서비스 크레딧 제공
- **GitHub 기여자 등재**: 프로젝트 README와 릴리즈 노트에 이름 등재
- **서비스 페이지 등재**: 공식 웹사이트 기여자 페이지에 프로필 등재
- **우선 지원**: 새로운 기능 및 베타 버전 우선 접근

### 🚀 시작하는 방법

1. **이슈 확인**: [GitHub Issues](https://github.com/aicoding-caret/caret/issues)에서 기여할 수 있는 이슈 찾기
2. **토론 참여**: 기능 제안이나 질문을 Issues나 Discussions에서 공유
3. **코드 기여**: Fork → 개발 → Pull Request 과정으로 코드 기여
4. **문서 기여**: `caret-docs/` 폴더의 문서 개선이나 번역 작업

자세한 기여 가이드는 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참조하세요.

---

## 🛠️ 개발자를 위한 정보

Caret 프로젝트 개발에 필요한 모든 정보를 체계적으로 정리했습니다.

### 📚 핵심 개발 가이드

#### 🏗️ 아키텍처 & 설계
- **[개발자 가이드 (DEVELOPER_GUIDE.md)](./DEVELOPER_GUIDE.md)** - 빌드, 테스트, 패키징 기본 정보
- **[개발 가이드 개요 (development/)](./caret-docs/development/index.mdx)** - 전체 개발 가이드 네비게이션
- **[Caret 아키텍처 가이드](./caret-docs/development/caret-architecture-and-implementation-guide.mdx)** - Fork 구조, 확장 전략, 설계 원칙
- **[확장 아키텍처 다이어그램](./caret-docs/development/extension-architecture.mmd)** - 전체 시스템 구조 시각화 (Mermaid)
- **[신입 개발자 가이드](./caret-docs/development/new-developer-guide.mdx)** - 프로젝트 입문 및 개발 환경 구축

#### 🧪 테스트 & 품질 관리
- **[테스트 가이드](./caret-docs/development/testing-guide.mdx)** - TDD, 테스트 작성 표준, 커버리지 관리
- **[로깅 시스템](./caret-docs/development/logging.mdx)** - 통합 로깅, 디버깅, 개발/프로덕션 모드

#### 🔄 Frontend-Backend 통신
- **[상호작용 패턴](./caret-docs/development/frontend-backend-interaction-patterns.mdx)** - 순환 메시지 방지, Optimistic Update
- **[Webview 통신](./caret-docs/development/webview-extension-communication.mdx)** - 메시지 타입, 상태 관리, 통신 구조
- **[UI-Storage 플로우](./caret-docs/development/ui-to-storage-flow.mdx)** - 데이터 흐름 및 상태 관리 패턴

#### 🤖 AI 시스템 구현
- **[AI 메시지 플로우 가이드](./caret-docs/development/ai-message-flow-guide.mdx)** - AI 메시지 송수신 전체 플로우
- **[시스템 프롬프트 구현](./caret-docs/development/system-prompt-implementation.mdx)** - 시스템 프롬프트 설계 및 구현
- **[메시지 처리 아키텍처](./caret-docs/development/message-processing-architecture.mdx)** - 메시지 처리 시스템 설계

#### 🎨 UI/UX 개발
- **[컴포넌트 아키텍처](./caret-docs/development/component-architecture-principles.mdx)** - React 컴포넌트 설계 원칙
- **[프론트엔드 i18n 시스템](./caret-docs/development/locale.mdx)** - 다국어 지원 구현 (UI)
- **[백엔드 i18n 시스템](./caret-docs/development/backend-i18n-system.mdx)** - 다국어 지원 구현 (시스템 메시지)

#### 🔧 개발 도구 & 유틸리티
- **[유틸리티 가이드](./caret-docs/development/utilities.mdx)** - 개발 유틸리티 사용법
- **[파일 저장 및 이미지 로딩](./caret-docs/development/file-storage-and-image-loading-guide.mdx)** - 파일 처리 시스템
- **[링크 관리 가이드](./caret-docs/development/link-management-guide.mdx)** - 링크 관리 시스템
- **[지원 모델 목록](./caret-docs/development/support-model-list.mdx)** - AI 모델 지원 현황

#### 📖 문서화 & 규약
- **[문서화 가이드](./caret-docs/development/documentation-guide.mdx)** - 문서 작성 표준 및 규약
- **[JSON 주석 규약](./caret-docs/development/json-comment-conventions.mdx)** - JSON 파일 주석 작성 규칙

#### 🤖 AI 작업 방법론
- **[AI 작업 인덱스 가이드](./caret-docs/development/ai-work-index.mdx)** - **AI 필수 선행 독해** 📋
- **[AI 작업 가이드](./caret-docs/guides/ai-work-method-guide.mdx)** - TDD, 아키텍처 검토, Phase 기반 작업

### 🎯 빠른 시작을 위한 워크플로우

1. **환경 설정**: [개발자 가이드](./DEVELOPER_GUIDE.md) → [개발 가이드 개요](./caret-docs/development/index.mdx)
2. **프로젝트 이해**: [신입 개발자 가이드](./caret-docs/development/new-developer-guide.mdx) → [Caret 아키텍처 가이드](./caret-docs/development/caret-architecture-and-implementation-guide.mdx)
3. **AI 시스템 이해**: [AI 메시지 플로우 가이드](./caret-docs/development/ai-message-flow-guide.mdx) → [시스템 프롬프트 구현](./caret-docs/development/system-prompt-implementation.mdx)
4. **개발 시작**: [AI 작업 가이드](./caret-docs/guides/ai-work-method-guide.mdx) → [테스트 가이드](./caret-docs/development/testing-guide.mdx)
5. **고급 기능**: [상호작용 패턴](./caret-docs/development/frontend-backend-interaction-patterns.mdx) → [컴포넌트 아키텍처](./caret-docs/development/component-architecture-principles.mdx)

### 📖 추가 자료

- **[Task 문서](./caret-docs/tasks/)** - 구체적인 구현 작업 가이드
- **[전략 문서](./caret-docs/strategy-archive/)** - 프로젝트 비전 및 로드맵
- **[사용자 가이드](./caret-docs/user-guide/)** - 최종 사용자를 위한 사용법

💡 **개발 시작 전 필독**: [AI 작업 방법론 가이드](./caret-docs/guides/ai-work-method-guide.mdx)에서 TDD 기반 개발 프로세스와 아키텍처 원칙을 먼저 숙지하시기 바랍니다.

⚡ **AI 시스템을 이해하고 싶다면**: [AI 메시지 플로우 가이드](./caret-docs/development/ai-message-flow-guide.mdx)에서 사용자 메시지가 AI로 전송되고 응답받는 전체 과정을 확인하세요!
