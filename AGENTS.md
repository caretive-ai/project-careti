# Project Overview
- Careti: Cline 기반 포크이며, 핵심은 유지하고 careti-src/로 확장합니다.
- 이중 디렉토리: `.agents/` (AI용, 토큰 최적화), `.users/` (사람용, 상세 설명)

# IMPORTANT: 세션 시작 시 필수 작업
**아래 파일들을 반드시 먼저 읽어주세요:**
1. `.agents/context/agents-rules.json` - 프로젝트 핵심 규칙 (SoT)
2. `.agents/context/ai-work-index.yaml` - 작업 유형별 워크플로우 인덱스

필요 시 `.agents/workflows/`에서 관련 워크플로우를 온디맨드로 로드합니다.

# Operations
- Proto 갱신: `npm run protos`, `npm run protos-go` (proto 변경 시 순서대로 실행)
- 컴파일: `npm run compile`
- CLI 컴파일: `npm run compile-cli` (Go 바이너리 빌드)
- 패키지: `npm run package`
- 테스트: `npm run test:unit`, `npm run test:integration`, `npm run test:webview`

# CLI Testing

## 테스트 실행
```bash
cd cli && go test ./e2e/... -v           # 모든 E2E 테스트
cd cli && go test ./e2e/... -v -short    # 빠른 테스트만 (통합 테스트 스킵)
cd cli && go test ./e2e/... -v -run TestInteractive  # 특정 테스트만
```

## 테스트 구조 (cli/e2e/)
| 파일 | 설명 |
|-----|------|
| `helpers_test.go` | 테스트 유틸리티 (바이너리 경로, gRPC 헬퍼 등) |
| `cli_behavior_test.go` | CLI 동작 검증 (플래그, 명령어 구조) |
| `cli_output_test.go` | 출력 형식 검증 |
| `interactive_mode_test.go` | Interactive/Yolo 모드 동작 |
| `start_list_test.go` | 인스턴스 시작/목록 테스트 |

## 주요 테스트 시나리오
- **Interactive 모드**: 스트림 EOF 시 재연결, 프로세스 계속 실행
- **Yolo/Headless 모드**: 완료 후 종료, followup ask를 완료로 처리
- **스트림 재연결**: `handleStateStream`, `handlePartialMessageStream`의 EOF 처리

## 테스트 전제조건
- `npm run compile-cli` 실행 필요
- 통합 테스트는 실행 중인 cline-core 인스턴스 필요 (없으면 skip)

# Conventions
- **항상 한국어로 응답**합니다.
- **사전지식 의존 금지**: 작업 전 위의 필수 파일들을 먼저 읽습니다.
- TDD: Integration 테스트 우선 → 최소 구현 → 리팩터.
- 브랜드/경로/표기 계산은 `careti-src/utils/brand-utils.ts`를 사용합니다.

# Work Logs (작업 로그)

작업 로그는 parent의 `docs-work-logs/luke/project-careti/` 폴더에 기록합니다.

## 규칙
- **파일명 형식**: `YYYYMMDD-{번호}-{주제}.md` (예: `20260124-20-opencode-tool-complete-port.md`)
- **폴더 구조**: `todo/`, `doing/`, `done/`
- **날짜 기록**: 각 작업 단계마다 날짜 기록 (일간/주간/월간 요약용)
- **언어**: 한국어 선호

## 참조
- `docs-work-logs/AGENTS.md` - 작업 로그 저장소 가이드
- `docs-work-logs/.agents/context/agents-rules.json` - 상세 규칙

# Boundaries
- 보호 디렉토리(`src/`, `webview-ui/` 등)에 신규 파일 추가 시 파일 상단에 `// CARETI MODIFICATION:` 표기.
- Cline 원본 파일 수정은 최소 침습 원칙(1~3줄)과 `// CARETI MODIFICATION:` 주석을 준수.
- `.cline` 백업 파일 생성 규칙은 **deprecated** (새로 만들지 않음).
- `work-logs`는 사용자가 요청하지 않는 한 언급/수정하지 않습니다.

# Directory Structure (Dual-directory Architecture)
```
.agents/                    # AI용 (영어, 토큰 최적화)
├── context/               # 시스템 규칙 (JSON/YAML)
│   ├── agents-rules.json   # 메인 규칙 파일 (SoT) ← 필수 읽기
│   └── ai-work-index.yaml  # 작업 인덱스 ← 필수 읽기
├── workflows/             # 작업 워크플로우 (온디맨드)
│   └── atoms/             # 재사용 가능한 빌딩 블록
├── skills/
└── hooks/

.users/                     # 사람용 (한국어, 상세)
├── context/               # 프로젝트 컨텍스트 (Markdown)
├── workflows/
├── skills/
└── hooks/
```

# Skills
- 표준 경로: `.agents/skills/<skill>/SKILL.md`
- 호환 링크: `.github/skills`, `.claude/skills`
- 사용자가 스킬을 지정하거나 요청이 스킬 설명과 일치하면 해당 스킬을 우선 사용합니다.

# MCP
- MCP 설정은 프로젝트의 표준 설정(브랜드 유틸/설정 파일)을 따릅니다.
- 토큰/비밀정보는 로그/문서에 남기지 않습니다.

# Model List Documentation
- **자동 업데이트**: `npm run models:generate` 실행
- **스크립트**: `careti-scripts/build/generate-support-model-list.js`
