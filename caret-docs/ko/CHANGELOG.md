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

## [0.2.0]

- **Cline v3.26.6 병합**: 최신 Cline 업스트림(`v3.26.6`, 커밋 `c6aa47095ee47036946c6a51339a4fa22aaa073c`)을 병합 커밋 `f8bd960b4`를 통해 병합했습니다. 자세한 내용은 [CHANGELOG-CLINE.md](../../CHANGELOG-CLINE.md)를 참고하세요.
  - **주요 사용자 기능 업데이트**:
    - **최신 AI 모델 지원**: GPT-5, Claude 4, Grok 등 최신 모델과 향상된 AI 기능 지원
    - **15개 이상 새로운 API 제공자**: Hugging Face, Groq 등 15개 이상의 새로운 서비스 통합
    - **작업 관리(Focus Chain)**: 복잡한 작업을 위한 자동 할 일 목록 생성 및 추적 기능 추가
    - **편의 기능**: 대화 자동 압축, 개선된 체크포인트, Mermaid 다이어그램 미리보기 등 다양한 기능
  - **주요 개발 구조 변경**:
    - 백엔드 아키텍처 개선 및 향상된 API 제공자 시스템
    - 프론트엔드 UI 개선 및 더 나은 사용자 경험
    - 향상된 MCP(Model Context Protocol) 지원

## [0.1.3] - 2025-01-11

- 🎉 **주요 업데이트**: 페르소나 시스템이 포함된 Caret 통합
- feat: 개인화된 AI 페르소나 지원 (Caret, 오사랑, 마도베 이치카, 시안 맥인, 탄도 우분투)
- feat: Cline/Caret 모드 토글 - 언제든지 원래 Cline 방식으로 전환 가능
- feat: 완벽한 4개국어 지원 (한국어, 영어, 일본어, 중국어)
- feat: 더 효율적인 AI 응답을 위한 향상된 시스템 프롬프트
- feat: 300개 모델을 지원하는 36개 제공자
- feat: docs.cline.bot 다국어 문서화 진행 중

### 🎭 Caret 전용 기능
- 나만의 AI 이름과 프로필 이미지 등록
- 템플릿 페르소나 선택 또는 완전 커스터마이징
- 더 직관적인 대화를 위한 챗봇/에이전트 모드
- 완벽한 Cline 호환성 유지

### 🌍 다국어 지원
- UI, 문서, 매뉴얼의 완전한 4개국어 지원
- 각 언어별 전용 문서 사이트
- 실시간 언어 전환 기능

### 🚀 **최신 Cline v3.26.6 아키텍처 완전 호환**
- 모든 Cline 기능이 이전과 똑같이 작동
- Plan/Act 모드 보존
- MCP 지원 유지
- 제로 트러스트 보안 아키텍처
- Claude, Gemini, Kimi 등 자유로운 모델 전환

## [0.1.2] - 2025-01-05

- fix: 차세대 모델 패밀리용 browser_action 도구 로딩 문제 해결
- feat: DeepSeek V3 및 최신 추론 모델에 대한 향상된 지원
- fix: 향상된 토큰 사용량 최적화 및 API 비용 관리
- docs: 아키텍처 문서 및 구현 가이드 업데이트

## [0.1.1] - 2024-12-28

- feat: 초기 Caret 브랜딩 시스템 구현
- feat: 향상된 다국어 i18n 지원 기반
- fix: VS Code API 충돌 해결
- docs: 종합적인 개발 문서 추가
- test: TDD 기반 테스팅 프레임워크 구축

## [0.1.0] - 2024-12-20

- 🎉 **초기 Caret 릴리스**: 최소 수정 전략으로 Cline에서 포크
- feat: `caret-src/` 디렉토리의 Caret 전용 확장 아키텍처
- feat: 듀얼 모드 시스템 (Caret 모드 / Cline 모드) 기초
- feat: JSON 기반 템플릿을 사용한 향상된 시스템 프롬프트 아키텍처
- feat: `caret-docs/`의 종합적인 문서 시스템
- feat: 다국어 지원 인프라
- feat: TDD 기반 개발 방법론 구현

### 🏗️ 아키텍처 기초
- Cline 호환성을 위한 최소 수정 접근법
- Level 1-3 수정 프레임워크
- gRPC 기반 프론트엔드-백엔드 통신
- 안전한 Cline 파일 수정을 위한 백업 시스템

### 🧪 개발 인프라
- Vitest 테스팅 프레임워크 설정
- 종합적인 CI/CD 파이프라인
- 문서 기반 개발 접근법
- 커뮤니티 기여 가이드라인

---

**참고**: Caret은 강력한 확장을 추가하면서 Cline과 100% 호환성을 유지합니다. 사용자는 Caret과 Cline 모드를 원활하게 전환할 수 있습니다.