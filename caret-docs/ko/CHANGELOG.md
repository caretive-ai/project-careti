<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="../../CHANGELOG.md">
          <img src="https://img.shields.io/badge/English-2563eb?style=for-the-badge&labelColor=1e40af" alt="English"/>
        </a>
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/한국어-16a34a?style=for-the-badge&labelColor=15803d" alt="한국어"/>
      </td>
      <td align="center">
        <a href="../ja/CHANGELOG.md">
          <img src="https://img.shields.io/badge/日本語-ea580c?style=for-the-badge&labelColor=c2410c" alt="日本語"/>
        </a>
      </td>
      <td align="center">
        <a href="../zh-cn/CHANGELOG.md">
          <img src="https://img.shields.io/badge/中文-dc2626?style=for-the-badge&labelColor=b91c1c" alt="中文"/>
        </a>
      </td>
    </tr>
  </table>
</div>

# 변경사항

## [0.3.0] - 2025-10-13

### 🎉 Cline v3.32.7 업스트림 머징

- **머지 커밋**: `03177da87` (머지 브랜치: `merge/cline-upstream-20251009`)
- **새로운 모델 지원**:
  - Claude Sonnet 4.5 (200K 및 1M 컨텍스트 윈도우 변형)
  - GPT-5 확장 사고 기능 지원
  - 향상된 모델 정보 및 가격 표시
- **새로운 기능**:
  - `.clineignore` 파일 지원으로 Caret의 파일 접근 제외
  - AWS Bedrock 프로필 (멀티 계정 관리)
  - Requesty, Together, Alibaba Qwen 프로바이더 추가
  - 속도 제한 요청 자동 재시도
  - Focus Chain (작업 관리) - 복잡한 작업을 위한 자동 할 일 목록 생성 및 추적
- **아키텍처 개선**:
  - 완전한 protobuf 기반 타입 시스템 마이그레이션
  - 향상된 MCP (Model Context Protocol) 지원
  - 확장성을 위한 프로바이더 시스템 리팩토링
- **자세한 업스트림 변경사항은 [CHANGELOG-CLINE.md](../../CHANGELOG-CLINE.md) 참조**

### 🚀 AI 프롬프트 시스템 최적화

- **API 요청 30-50% 감소**: 다중 파일 편집 시 단일 API 호출로 여러 SEARCH/REPLACE 블록 처리 (Cline 커밋 `41202df74`)
- **스마트 TODO 관리**: 10번째 요청마다 자동 업데이트, 조용한 추적, Chatbot→Agent 모드 전환 시 자동 생성 (Cline 커밋 `f0cd7fd36`)
- **Claude Sonnet 4.5 최적화**: 최신 모델을 위한 향상된 컨텍스트 효율성 및 워크플로우
- **듀얼 모드 호환**: Agent 모드(실행) 및 Chatbot 모드(제안) 모두 적용

---

## [0.2.3] - 2025-10-01
 - **새로운 기능**: 채팅 입력창에서 화살표 키로 메시지 히스토리를 탐색하는 기능 추가
 - **새로운 기능**: LiteLLM 모델 가져오기 구현 및 CaretBrandConfig를 FeatureConfig로 리팩토링
 - **개선 사항**: 명시적 승인을 위한 에이전트 프로토콜 강화
 - **개선 사항**: 시스템 프롬프트 리팩토링 및 한국어 문서 추가 (특히 COLLABORATIVE_PRINCIPLES)
 - **버그 수정**: 두 개의 버튼이 표시될 때 ActionButtons 레이아웃 오버플로우 수정

## [0.2.22] - 2025-09-21
- **시스템 프롬프트 강화**: Cline 머지 프로세스 중에 누락된 Caret 고유의 협력적 태도와 비용 절감 시스템 프롬프트를 복원 및 보완
- **번역 수정**: 일부 브라우저 관련 번역 누락 문제 수정

## [0.2.21] - 2025-09-18

- **페르소나 시스템 수정 및 개선**:
  - **버그 수정**: 앱 재시작 시 페르소나 이미지가 기본 Caret 아바타로 재설정되는 심각한 버그를 수정했습니다. 이 문제는 백엔드 핸들러가 템플릿 페르소나의 `asset:/` URI를 적절히 처리하지 못해 이미지가 글로벌 스토리지에 저장되지 않은 것이 원인이었습니다.
  - **기능 개선**: 초기 설정 플로우를 변경했습니다. API 키 제출 후, 사용자가 즉시 페르소나를 설정할 수 있도록 페르소나 템플릿 선택기로 직접 안내합니다.
  - **UX 개선**: 페르소나 선택기 안내 텍스트를 명확하게 개선하고 통합했습니다. (한국어/영어)

## [0.2.0] - 2025-09-11

- **Cline v3.26.6 병합**: 최신 Cline upstream (`v3.26.6`, commit `c6aa47095ee47036946c6a51339a4fa22aaa073c`)을 병합 커밋 `f8bd960b4`를 통해 병합했습니다. 자세한 내용은 [CHANGELOG-CLINE.md](../../CHANGELOG-CLINE.md)를 참조하세요.
  - **주요 사용자 기능 업데이트**:
    - **최신 AI 모델 지원**: GPT-5, Claude 4, Grok 등 최신 모델 및 강화된 AI 기능 지원
    - **15개 이상의 새로운 API 프로바이더**: Hugging Face, Groq 등 15개 이상의 새로운 서비스 통합
    - **작업 관리(Focus Chain)**: 복잡한 작업을 위한 자동 할 일 목록 생성 및 추적 기능 추가
    - **편의 기능**: 대화 자동 압축, 개선된 체크포인트, Mermaid 다이어그램 미리보기 등 다수의 기능
  - **주요 개발 구조 변경**:
    - 백엔드 아키텍처 개선 및 강화된 API 프로바이더 시스템
    - 프론트엔드 UI 개선 및 향상된 사용자 경험
    - 강화된 MCP(Model Context Protocol) 지원

## [0.1.3]

- 🎉 **주요 업데이트**: 페르소나 시스템을 포함한 Caret 통합
- feat: 개인화된 AI 페르소나 지원 (Caret, 오사랑, 마도베 이치카, 청마신, 탄도 우분투)
- feat: Cline/Caret 모드 토글 - 언제든지 원래 Cline 스타일로 전환 가능
- feat: 완벽한 4개 언어 지원 (한국어, 영어, 일본어, 중국어)
- feat: 더 효율적인 AI 응답을 위한 향상된 시스템 프롬프트
- feat: 300개 모델을 지원하는 36개 프로바이더
- feat: docs.cline.bot 다국어 문서화 진행 중

### 🎭 Caret 전용 기능
- 자신만의 AI 이름과 아바타 등록
- 템플릿 페르소나 선택 또는 완전한 사용자 정의
- 더 직관적인 대화를 위한 챗봇/에이전트 모드
- 완벽한 Cline 호환성 유지

### 🌍 다국어 지원
- UI, 문서 및 매뉴얼의 완전한 4개 언어 지원
- 각 언어별 전용 문서 사이트
- 실시간 언어 전환 기능

### 🚀 **최신 Cline v3.26.6 아키텍처 완전 호환**
- 모든 Cline 기능이 이전과 동일하게 작동
- Plan/Act 모드 유지
- MCP 지원 유지
- 제로 트러스트 보안 아키텍처
- Claude, Gemini, Kimi 등 자유로운 모델 전환

## [0.1.2] - 2025-08-13

- fix: 차세대 모델 패밀리를 위한 browser_action 도구 로딩 문제 해결
- feat: DeepSeek V3 및 최신 추론 모델에 대한 향상된 지원
- fix: 개선된 토큰 사용량 최적화 및 API 비용 관리
- docs: 아키텍처 문서 및 구현 가이드 업데이트

## [0.1.1] - 2025-07-18

- feat: 초기 Caret 브랜딩 시스템 구현
- feat: 향상된 다국어 i18n 지원 기반
- fix: VS Code API 충돌 해결
- docs: 포괄적인 개발 문서 추가
- test: TDD 기반 테스팅 프레임워크 구축

## [0.1.0] - 2025-07-06

- 🎉 **초기 Caret 릴리스**: 최소 수정 전략으로 Cline에서 포크
- feat: `caret-src/` 디렉토리에 Caret 전용 확장 아키텍처
- feat: 듀얼 모드 시스템(Caret 모드/Cline 모드) 기반
- feat: JSON 기반 템플릿을 사용한 향상된 시스템 프롬프트 아키텍처
- feat: `caret-docs/`의 포괄적인 문서 시스템
- feat: 다국어 지원 인프라
- feat: TDD 기반 개발 방법론 구현

### 🏗️ 아키텍처 기반
- Cline 호환성을 위한 최소 수정 접근
- Level 1-3 수정 프레임워크
- gRPC 기반 프론트엔드-백엔드 통신
- 안전한 Cline 파일 수정을 위한 백업 시스템

### 🧪 개발 인프라
- Vitest 테스팅 프레임워크 설정
- 포괄적인 CI/CD 파이프라인
- 문서 주도 개발 접근 방식
- 커뮤니티 기여 가이드라인

---

**참고**: Caret은 강력한 확장 기능을 추가하면서도 Cline과 100% 호환성을 유지합니다. 사용자는 Caret과 Cline 모드 사이를 원활하게 전환할 수 있습니다.

