# Project Overview
- [Project Name]: Brief description of the project
- 이중 디렉토리: `.agents/` (AI용, 토큰 최적화), `.users/` (사람용, 상세 설명)

# IMPORTANT: 세션 시작 시 필수 작업
**아래 파일들을 반드시 먼저 읽어주세요:**
1. `.agents/context/agents-rules.json` - 프로젝트 핵심 규칙 (SoT)
2. `.agents/context/ai-work-index.yaml` - 작업 유형별 워크플로우 인덱스

필요 시 `.agents/workflows/`에서 관련 워크플로우를 온디맨드로 로드합니다.

# Directory Structure (Dual-directory Architecture)
```
.agents/                    # AI용 (영어, 토큰 최적화)
├── context/               # 시스템 규칙 (JSON/YAML)
│   ├── agents-rules.json   # 메인 규칙 파일 (SoT) ← 필수 읽기
│   └── ai-work-index.yaml  # 작업 인덱스 ← 필수 읽기
├── workflows/             # 작업 워크플로우 (온디맨드)
│   └── atoms/             # 재사용 가능한 빌딩 블록
├── commands/              # 슬래시 명령 (Claude Code/OpenCode 스타일)
└── hooks/

.users/                     # 사람용 (네이티브 언어, 상세)
├── context/               # 프로젝트 컨텍스트 (Markdown)
├── workflows/
├── commands/
└── hooks/
```

# Key Principles
1. **1:1 Mirroring**: `.users/` 구조는 `.agents/`를 정확히 미러링
2. **Language Optimization**: `.agents/`는 영어 (토큰 효율), `.users/`는 사용자/팀 언어
3. **SoT**: `.agents/context/agents-rules.json`이 유일한 규칙 소스

# Mirroring Rules
`.agents/` 또는 `.users/` 파일 수정 시 반드시 양쪽을 동기화:
- `context/` - 프로젝트 컨텍스트/규칙
- `workflows/` - 작업 워크플로우
- `commands/` - 슬래시 명령 정의 (Claude Code/OpenCode 스타일)
- `hooks/` - 훅 정의

명령 생성 시: `.agents/commands/[name].md`와 `.users/commands/[name].md` 모두 생성
템플릿: `COMMAND_TEMPLATE.md` 참조

# Commands (슬래시 명령)
사용자가 `/commit`처럼 슬래시 명령을 입력하면 해당 명령의 지시를 따릅니다.
명령 파일은 YAML frontmatter를 사용합니다:

```markdown
---
description: 명령 설명
argument-hint: "[인자 힌트]"
---
명령 지시사항...
```
