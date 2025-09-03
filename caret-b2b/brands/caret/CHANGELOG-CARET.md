# Caret 변경 기록

## [0.1.3]

- **Cline v3.26.6 병합**: 최신 Cline 업스트림(`v3.26.6`, 커밋 `c6aa47095ee47036946c6a51339a4fa22aaa073c`)을 병합했습니다 (병합 커밋 `f8bd960b4`). 자세한 내용은 [CHANGELOG.md](CHANGELOG.md)를 참조하세요.
  - **주요 사용자 기능 업데이트**:
    - **최신 AI 모델 지원**: GPT-5, Claude 4, Grok 등 최신 모델과 향상된 AI 기능을 지원합니다.
    - **다양한 API Provider 추가**: Hugging Face, Groq 등 15개 이상의 새로운 서비스를 연동할 수 있습니다.
    - **작업 관리 기능 (Focus Chain)**: 복잡한 작업을 위한 자동 할 일 목록 생성 및 추적 기능이 추가되었습니다.
    - **편의 기능**: 대화 자동 요약(Auto Compact), 개선된 체크포인트, Mermaid 다이어그램 미리보기 등 다양한 기능이 추가되었습니다.
  - **주요 개발 구조 변경**:
    - **Plan/Act 모드 도입**: AI가 계획을 먼저 제시하고 사용자가 승인하면 작업을 수행하는 방식으로 변경되어 안정성이 향상되었습니다.
    - **차등 편집(Diff Edit) 방식 개선**: 대용량 파일 수정 시 발생할 수 있는 오류를 줄이고 안정성을 높였습니다.

## [0.1.2]

- **GPT-5 모델군 지원**: OpenAI의 최신 GPT-5, GPT-5 Mini, GPT-5 Nano 모델을 지원합니다. 향상된 추론 능력과 성능을 제공합니다.
- **확장된 Provider 지원**: Claude Code, Hugging Face, Cerebras, Groq, SAP AI Core, Moonshot, Huawei Cloud MaaS, Baseten 등 15개의 새로운 API Provider를 추가하여 총 274개의 AI 모델을 통합했습니다.

## [0.1.1]

- 페르소나 적용 버그 수정
- 손상된 체크포인트 예외를 처리하여 프로젝트 열기 실패 문제 해결
- Caret을 제외한 API Provider를 Native로 변경하고 캐싱 적용
- 시스템 프롬프트 동적 로딩으로 토큰 비용 최적화

## [0.1.0]

- Cline v3.17.13에서 분기된 Caret 저장소 공개 출시
- Cline 위에 Caret 개발을 위한 오버레이 아키텍처 설계 적용
- AI 에이전트 기반 개발 워크플로우를 위한 `.caretrules` 도입
- 한국어, 영어, 중국어, 일본어 인터페이스에 대한 i18n 지원 추가
- 6개의 페르소나 템플릿 기본 제공
- Caret 전용 챗봇/에이전트 기능 개발

---

v3.17.13 이전 변경 사항은 Cline 원본 [CHANGELOG.md](../../CHANGELOG.md)를 참조하세요.