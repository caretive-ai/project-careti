# 개발 환경 설정 (.env)

Careti의 개발 환경 설정은 프로젝트 루트의 `.env` 파일로 관리합니다. 이 파일은 개발 플래그, 텔레메트리 설정 등 **로컬 개발에 필요한 옵션**을 담으며, 보안/개인 설정 보호를 위해 버전 관리에 포함하지 않습니다.

## 초기 설정

```bash
cp .env.example .env
```

그 다음 `.env`를 열어 필요한 값만 채웁니다. 어떤 변수가 필요한지/기본값이 무엇인지에 대한 최신 정보는 `.env.example` 주석을 기준으로 합니다.

## 주요 환경 변수(요약)

### 개발 플래그
- `IS_DEV`: 개발 모드 플래그(보통 VSCode `launch.json`에서 설정)
- `CLINE_ENVIRONMENT`: 실행 환경(개발 시 보통 `local`)

### PostHog 텔레메트리
- `TELEMETRY_SERVICE_API_KEY`: PostHog 텔레메트리 API 키
- `POSTHOG_TELEMETRY_ENABLED`: `true/false`로 텔레메트리 활성/비활성(기본값 `true`)

### OpenTelemetry (선택)
`.env.example`에 있는 `OTEL_*` 변수를 사용해 로컬 콘솔 출력 또는 OTLP 수집기로 로그/메트릭을 보낼 수 있습니다.

## 주의사항
- `.env`는 로컬 전용으로 사용하고, 실수로 커밋하지 않도록 주의합니다.
- 신규 변수/기본값은 반드시 `.env.example`에 먼저 반영한 뒤 문서를 업데이트합니다.

