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
- 패키지: `npm run package`

## Desktop (Tauri)

**주의**: 루트에서 `npm run dev:webview` 실행 중이면 포트 충돌!

```bash
# 기존 vite 종료 (필수)
pkill -f "npm run dev:webview"

# 실행
cd desktop
npm run tauri dev      # 개발 모드
npm run tauri build    # 프로덕션 빌드
```

상세 문서: `desktop/AGENTS.md`, `desktop/.agents/context/`

# Testing (자동 테스트)

## 테스트 명령어
| 명령어 | 설명 |
|--------|------|
| `npm run test:unit` | 백엔드 유닛 테스트 (mocha) |
| `npm run test:webview` | 웹뷰 테스트 (vitest) |
| `npm run test:report` | 전체 테스트 실행 및 요약 보고서 |
| `npm run test:report:json` | JSON 형식 테스트 결과 (AI 파싱용) |

## AI 테스트 실행 가이드
1. 코드 변경 후 `npm run test:report:json` 실행
2. JSON 출력에서 `status` 필드 확인 (`pass` 또는 `fail`)
3. 실패 시 `resultsDir` 경로에서 상세 로그 확인

## 주요 테스트 파일 위치
- Proto 변환 테스트: `src/shared/proto-conversions/models/__tests__/`
- API Configuration 테스트: `src/shared/proto-conversions/models/__tests__/api-*.test.ts`
- StateManager 테스트: `src/shared/proto-conversions/models/__tests__/state-manager-api-config.test.ts`
- 웹뷰 테스트: `webview-ui/src/**/__tests__/`

## 현재 테스트 상태 (2026-01-29)
- Unit: 769+ passing, 7 failing (VRM/Vision 관련)
- Webview: 140+ passing, 7 failing (i18n 조사 처리)

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

# Source Code Structure
src/                        # Cline 원본 소스 (보호)
careti-src/                 # Careti 전용 확장 소스
cli/                        # Go 기반 CLI (Cline 원본)
cli-careti/                 # Careti CLI (Node.js)
standalone/                 # CLI용 VS Code 스텁 런타임
desktop/                    # Tauri 데스크톱 앱 (독립)
├── src/                   # 프론트엔드 (아바타 UI 등)
├── src-tauri/             # Rust 백엔드
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/main.rs
├── package.json
└── vite.config.js
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
