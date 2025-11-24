# Caret CLI / Provider 서버 연동 가이드

## 개요
- 목적: Caret CLI가 Caret 전용 인증/프로바이더 서버를 사용하도록 서버팀에 필요한 정보를 전달.
- 원칙: Cline 기본 흐름을 보존하되 도메인·브랜딩만 Caret으로 전환(최소 침습).

## 엔드포인트 도메인
- 인증(웹/SSO): `https://caret.team`
- API(프로바이더/모델/계정): `https://api.caret.team`

## 요구사항
- OAuth/토큰: Cline과 동일한 스코프 구조를 유지하되 발급/검증 도메인만 Caret 도메인으로 교체.
- 모델/프로바이더 목록: Cline 호환 JSON 스키마 유지. Caret 추가 필드가 있을 경우 1000+ 오프셋 규칙 준수.
- CLI 설치/업데이트 체크: `stateService`에서 사용 가능한 상태 코드 및 버전 문자열은 Cline과 동일 포맷 유지.

## 클라이언트 기대값
- CLI auth 시 브라우저 오픈 URL이 `caret.team` 으로 노출.
- BYO 프로바이더(Gemini 포함) 선택 시 Caret 도메인 기반 API 호출.
- 오류 메시지/배너/브랜딩 문자열은 Caret 문구 사용.

## 테스트 시나리오(서버 협업 체크)
- `caret auth` 실행 → `caret.team` 로그인 창 노출, 토큰 교환 성공.
- `caret task new "hello"` 실행 시 API 호출이 `api.caret.team`으로 향하는지 확인.
- BYO Gemini/Anthropic 설정 저장 후 재시작 시 persisted 설정이 그대로 로드되는지 확인.

## 참고
- CLI 브랜딩/프로바이더 분기 작업은 `cli-caret/pkg/cli/auth/*`에서 수행 예정.
- 모드 분기에 따라 Caret/Cline 도메인 전환이 필요한 경우 `CARET_MODE_SYSTEM` 환경변수를 사용.
