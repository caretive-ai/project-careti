# 2025-11-28 LiteLLM 모킹/TDD 준비

## 작업 개요
- LiteLLM/Caret 인증 흐름을 실제 키 없이 재현하기 위한 모킹 경로 검토
- ai-work-protocol, testing-workflow 지침 확인 완료
- Phase 0: git 사용자/날짜 확인 및 작업 로그 생성

## 오늘 남은 계획
- `models_list_fetch.go` 의존성 분리용 인터페이스 설계 검토
- CLI auth/설정 흐름 주입 포인트 조사 후 통합 테스트(RED) 작성
- 필요 시 shutdown RPC 경로 로깅 포인트 식별

## 메모
- 네트워크 없이 서버 호출은 전부 목으로 처리
- CLI 테스트 전 `npm run protos-go` 재실행 여부 확인
