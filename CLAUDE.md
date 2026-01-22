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
- 테스트: `npm run test:unit`, `npm run test:integration`, `npm run test:webview`

# Conventions
- **항상 한국어로 응답**합니다.
- **사전지식 의존 금지**: 작업 전 위의 필수 파일들을 먼저 읽습니다.
- TDD: Integration 테스트 우선 → 최소 구현 → 리팩터.
- 브랜드/경로/표기 계산은 `careti-src/utils/brand-utils.ts`를 사용합니다.

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
