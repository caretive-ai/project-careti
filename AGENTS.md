# Project Overview
- Caret: Cline 기반 포크이며, 핵심은 유지하고 caret-src/로 확장합니다.
- SoT: `.agents/context/caret-rules.json`을 **세션 시작 시 반드시** 읽고, 필요 시 `.agents/context/workflows/`를 온디맨드로 로드합니다.

# Operations
- Proto 갱신: `npm run protos`, `npm run protos-go` (proto 변경 시 순서대로 실행)
- 컴파일: `npm run compile`
- 패키지: `npm run package`
- 테스트: `npm run test:unit`, `npm run test:integration`, `npm run test:webview`

# Conventions
- **항상 한국어로 응답**합니다.
- **사전지식 의존 금지**: 작업 전 `.agents/context/caret-rules.json` 및 관련 문서를 먼저 읽습니다.
- TDD: Integration 테스트 우선 → 최소 구현 → 리팩터.
- 브랜드/경로/표기 계산은 `caret-src/utils/brand-utils.ts`를 사용합니다.

# Boundaries
- 보호 디렉토리(`src/`, `webview-ui/` 등)에 신규 파일 추가 시 파일 상단에 `// CARET MODIFICATION:` 표기.
- Cline 원본 파일 수정은 최소 침습 원칙(1~3줄)과 `// CARET MODIFICATION:` 주석을 준수.
- `.cline` 백업 파일 생성 규칙은 **deprecated** (새로 만들지 않음).
- `work-logs`는 사용자가 요청하지 않는 한 언급/수정하지 않습니다.

# Skills
- 표준 경로: `.agents/skills/<skill>/SKILL.md`
- 호환 링크: `.github/skills`, `.claude/skills`
- 사용자가 스킬을 지정하거나 요청이 스킬 설명과 일치하면 해당 스킬을 우선 사용합니다.

# MCP
- MCP 설정은 프로젝트의 표준 설정(브랜드 유틸/설정 파일)을 따릅니다.
- 토큰/비밀정보는 로그/문서에 남기지 않습니다.
