# 변경 이력 (Changelog)

## [0.1.2]

- **GPT-5 모델 패밀리 지원**: OpenAI의 최신 GPT-5, GPT-5 Mini, GPT-5 Nano 모델 지원 추가 - 향상된 추론 능력과 성능 개선 포함
- **15개 새 프로바이더 추가, 274개 AI 모델 통합**: Claude Code, Hugging Face, Cerebras, Groq, SAP AI Core, Moonshot, Huawei Cloud MaaS, Baseten을 포함한 새로운 API 프로바이더로 274개 AI 모델 통합

## [0.1.1]

- 페르소나 적용 버그 패치
- 손상된 체크포인트 예외 처리를 통한 프로젝트 열기 실패 수정
- API 프로바이더(Caret 제외)를 Native로 변경하고 캐싱 적용
- 시스템 프롬프트 동적 로딩을 통한 토큰 비용 최적화

## [0.1.0]

- Cline v3.17.13에서 포크된 Caret 저장소 공개 릴리스
- Cline 위에 Caret 개발을 위한 오버레이 아키텍처 설계 적용
- AI 에이전트 기반 개발 워크플로우를 위한 `.caretrules` 도입
- 한국어, 영어, 중국어, 일본어 인터페이스를 위한 i18n 지원 추가
- 6가지 페르소나 템플릿 기본 제공
- Caret 전용 챗봇/에이전트 기능 개발

---

v3.17.13 이전 변경사항은 [CHANGELOG-cline.md](CHANGELOG-cline.md)를 참조하세요.
