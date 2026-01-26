# F06 - 에이전트 표준화 & Claude Code 호환

**Status**: ✅ v0.4.8 업데이트 (Claude Code 완전 호환) | **Scope**: Backend(인스트럭션/스토리지), Webview(설정), CLI | **Priority**: 🟡 Medium

> **Claude Code 사용자를 위한 안내**: Careti는 Claude Code의 Skills, Commands, Hooks 시스템과 **완전 호환**됩니다. 추가로 Workflows 시스템을 통해 복잡한 다단계 작업을 명시적으로 정의할 수 있습니다.

## 📋 개요
Careti은 AAIF 표준에 맞춰 규칙 로딩을 표준화하고 **이중 디렉토리 아키텍처**를 채택합니다:
- `.agents/` - AI용 (시스템 컨텍스트, 영어, 토큰 최적화)
- `.users/` - 사람용 (사용자 컨텍스트, 네이티브 언어, 상세 설명)

표준 구조가 없으면 `/init`이 스캐폴드를 생성합니다.
레거시 규칙 경로는 폴백으로 지원하되, 새 경로 사용을 권장합니다.

**v0.4.8 - Claude Code 완전 호환 (2026-01-26)**:
- **Skill 시스템**: Claude Code 동일 frontmatter 필드 지원
  - `disable-model-invocation`: AI 자동 호출 비활성화
  - `user-invocable`: 슬래시 메뉴 표시 여부
  - `allowed-tools`: 허용 도구 목록 제한
  - `context: fork`: 격리된 서브에이전트 실행
  - `!`command`` 전처리 구문 (동적 컨텍스트 주입)
- **Hooks 시스템**: Claude Code 동일 이벤트 지원
  - `SessionStart`, `SessionEnd`, `Stop` 훅 추가
  - Matcher 패턴 지원 (`PreToolUse.Edit_Write`)
  - 우선순위: Personal > Project (Claude Code 동일)
- **상호 호환성**: Claude Code `.claude/` 구조와 Careti `.agents/` 구조 상호 호환

**v0.4.7 - Commands 시스템 (2026-01-26)**:
- `.agents/skills/` → `.agents/commands/` 변경 (Claude Code/OpenCode 표준화)
- YAML frontmatter 기반 명령 파일 지원
- 레거시 skills 경로 자동 폴백 지원
- 슬래시 명령 (`/commit`, `/review` 등) 표준화

**M02 Phase 2 - 이중 디렉토리 아키텍처 (2025-01-15 완료)**:
- `.agents/` (AI용)과 `.users/` (사람용) 완전 분리
- `.users/context/`는 `.agents/context/`를 미러링 (1:1 대응)
- `.agents/workflows/`와 `.agents/workflows/atoms/` 구조 도입
- 레거시 경로 폴백 지원 (`.agents/context-for-user/`, `.agents/context/workflows/`)
- 시스템 프롬프트에 이중 디렉토리 아키텍처 사상 주입

## ✅ 왜 중요한가
- **결정적 동작**: 단일 SoT와 인덱스로 규칙 충돌을 차단합니다.
- **명확한 역할 분리**: AI와 사람이 읽는 문서의 목적이 다름을 인정합니다.
- **토큰 최적화**: `.agents/`는 영어로 작성하여 토큰 효율을 높입니다.
- **온보딩 속도**: `/init`이 안전한 기본 구조를 제공합니다.
- **표준 호환**: Claude Code, OpenCode와 동일한 명령 구조 사용

## ✨ 추가된 기능 요약
- `.agents/context/agents-rules.json` SoT + 온디맨드 워크플로우.
- `AGENTS.md` 계층 탐색(루트 필수, 이후 재귀 로드).
- 표준 `.agents/commands/` + `.agents/hooks/` 구조(Claude Code/OpenCode 호환).
- `/init` 스캐폴드(`assets/agents_template`) 적용, 기존 파일 덮어쓰기 없음.
- Careti 모드에서 표준 누락 시 시스템 프롬프트 안내.
- **v0.4.7**: `.agents/commands/` 명령 시스템 (레거시: `.agents/skills/`)
- **v0.4.7**: YAML frontmatter 기반 명령 파일 (`description`, `argument-hint`, `model`, `subtask`)
- **M02 Phase 2**: `.users/context/` 사용자 컨텍스트 디렉토리 (레거시: `.agents/context-for-user/`)
- **M02 Phase 2**: `.agents/workflows/` 워크플로우 디렉토리 (레거시: `.agents/context/workflows/`)
- **M02 Phase 2**: `workflows/atoms/` 재사용 가능한 소형 프로토콜
- **M02 Phase 2**: 시스템 프롬프트에 이중 디렉토리 아키텍처 사상 주입
- **M02 Phase 2**: 레거시 경로 자동 감지 및 마이그레이션 안내

## 🗂 디렉토리 구조

```
project/
├── .agents/                    # AI-최적화 (영어, 토큰 효율)
│   ├── context/               # 시스템 규칙 (JSON/YAML)
│   │   ├── agents-rules.json   # 메인 규칙 파일 (SoT)
│   │   ├── agents-rules.md     # 규칙 설명 (Markdown)
│   │   └── ai-work-index.yaml # 작업 인덱스
│   ├── workflows/             # 작업 워크플로우
│   │   ├── atoms/             # 재사용 가능한 소형 프로토콜
│   │   └── *.md               # 워크플로우 파일
│   ├── commands/              # 슬래시 명령 (Claude Code/OpenCode 스타일)
│   │   └── *.md               # 명령 파일 (YAML frontmatter)
│   └── hooks/                 # 이벤트 훅
│
├── .users/                     # 사람용 (네이티브 언어, 상세)
│   ├── context/               # 프로젝트 컨텍스트 (Markdown)
│   ├── workflows/             # 워크플로우 가이드
│   │   └── atoms/             # atom 설명
│   ├── commands/              # 명령 가이드
│   └── hooks/                 # 훅 문서
│
└── AGENTS.md                   # AI 진입점
```

## 🔧 Commands 시스템 (v0.4.7)

Claude Code와 OpenCode의 명령 시스템을 통합하여 `.agents/commands/` 구조를 지원합니다.

### 명령 파일 형식 (YAML Frontmatter)

```markdown
---
description: 명령에 대한 간단한 설명
argument-hint: "[선택적 인자 힌트]"
model: "optional/model-id"
subtask: true
---

# 명령 지시사항

AI가 이 명령을 실행할 때 따라야 할 상세 지시...
```

### 지원 필드
| 필드 | 필수 | 출처 | 설명 |
|------|------|------|------|
| `description` | ✅ | 공통 | 명령 설명 |
| `argument-hint` | ❌ | Claude Code | 인자 힌트 표시 |
| `model` | ❌ | OpenCode | 선호 모델 지정 |
| `subtask` | ❌ | OpenCode | 서브태스크 여부 |
| `disable-model-invocation` | ❌ | Claude Code | AI 자동 호출 비활성화 |
| `user-invocable` | ❌ | Claude Code | 슬래시 메뉴 표시 (기본값: true) |
| `allowed-tools` | ❌ | Claude Code | 허용 도구 목록 (쉼표 구분) |
| `context` | ❌ | Claude Code | 실행 컨텍스트 (`fork` \| `inline`) |
| `agent` | ❌ | Claude Code | fork 시 에이전트 타입 |

### USE_SKILL 도구 (하위 호환)
- **도구 정의**: `src/shared/tools.ts` (`ClineDefaultTool.USE_SKILL`)
- **UI 렌더링**: `webview-ui/src/components/chat/ChatRow.tsx` (`useSkill` case)
- **타입 정의**: `src/shared/ExtensionMessage.ts` (`ClineSayTool.tool: "useSkill"`)

### 동작
1. 사용자가 `/commit` 같은 슬래시 명령 입력 또는 명령 설명과 일치하는 요청
2. `use_skill` 도구로 `.agents/commands/commit.md` 로드
3. 명령의 지시사항에 따라 작업 수행
4. ChatRow에서 "Cline loaded the skill: ..." 메시지 표시

### 관련 문서
- **F16**: 웹 도구 및 슬래시 명령 - USE_SKILL 도구 상세

## 🔄 Claude Code 완전 호환 (v0.4.8)

Careti는 Claude Code의 Skill, Command, Hooks 시스템과 완전히 호환됩니다.

### Skill 시스템 호환

```markdown
---
description: 코드 리뷰 스킬
disable-model-invocation: true  # AI 자동 호출 비활성화
user-invocable: true            # 슬래시 메뉴 표시
allowed-tools: Read, Grep, Glob # 허용 도구 제한
context: fork                   # 격리 실행
agent: reviewer                 # 에이전트 타입
---

현재 브랜치: !`git branch --show-current`

# 코드 리뷰 지시사항
변경된 파일을 검토하고 피드백을 제공하세요.
```

**전처리 구문** (`!`command``):
- 스킬 로드 시 쉘 명령 실행 후 결과로 치환
- 동적 컨텍스트 주입에 유용 (현재 브랜치, 날짜 등)

### Hooks 시스템 호환

| Hook 이벤트 | Careti | Claude Code | 설명 |
|-------------|--------|-------------|------|
| PreToolUse | ✅ | ✅ | 도구 실행 전 |
| PostToolUse | ✅ | ✅ | 도구 실행 후 |
| UserPromptSubmit | ✅ | ✅ | 사용자 입력 시 |
| PreCompact | ✅ | ✅ | 컴팩트 전 |
| SessionStart | ✅ | ✅ | 세션 시작 |
| SessionEnd | ✅ | ✅ | 세션 종료 |
| Stop | ✅ | ✅ | 중단 시 |
| TaskStart | ✅ | - | Careti 고유 |
| TaskResume | ✅ | - | Careti 고유 |
| TaskCancel | ✅ | - | Careti 고유 |

**Matcher 패턴**:
- `PreToolUse.Edit_Write` - Edit 또는 Write 도구에만 적용
- `PostToolUse.Bash` - Bash 도구에만 적용
- `PreToolUse` (matcher 없음) - 모든 도구에 적용

**Hook 파일 위치**:
```
.agents/hooks/
├── PreToolUse           # 모든 도구
├── PreToolUse.Edit_Write # Edit, Write만
├── PostToolUse.Bash     # Bash만
├── SessionStart         # 세션 시작
└── SessionEnd           # 세션 종료
```

### 우선순위

Claude Code와 동일한 우선순위 시스템:
1. **Personal** (`~/Documents/.agents/`) - 사용자 개인 설정
2. **Project** (`.agents/`) - 프로젝트 설정
3. **Enterprise** (향후 지원) - 조직 설정

## 🧠 설계 철학: Claude Code vs Careti

### Claude Code가 Workflows를 갖지 않는 이유

Claude Code는 **모델의 추론 능력에 대한 강한 신뢰**를 기반으로 설계되었습니다:

```
Claude Code 접근법:
사용자 요청 → AI가 알아서 분해 → Skills 조합 → 완료
```

- Claude 모델이 복잡한 작업을 **스스로 분해**
- Skills는 **도구 모음**, 조합은 **AI가 즉석에서** 결정
- 명시적 워크플로우 정의 없이 유연하게 대응

### Careti가 Workflows를 유지하는 이유

Careti는 **다양한 사용 환경과 모델**을 지원해야 합니다:

```
Careti 접근법:
사용자 요청 → Workflow 참조 → 단계별 진행 → Skills/Commands 호출 → 완료
```

| 관점 | Claude Code | Careti |
|------|-------------|--------|
| **대상 모델** | Claude만 (최고 성능) | 다양한 모델 지원 (266개+) |
| **사용 환경** | 개인 개발자 중심 | 팀/기업 환경 |
| **프로세스** | 유연성 우선 | 일관성 우선 |
| **모델 신뢰** | 100% 신뢰 | 가이드라인 제공 |

### 계층 구조

```
Workflows (최상위) - 복잡한 다단계 절차
  └── Commands/Skills (중간) - 슬래시로 호출하는 단일 작업
       └── Tools (최하위) - Read, Write, Bash 등 기본 도구
```

### 실제 차이 예시: "새 기능 개발해줘"

**Claude Code** (암묵적 워크플로우):
```
AI가 알아서:
1. 요구사항 분석
2. 테스트 먼저 작성
3. 구현
4. 리팩토링
(매번 순서가 다를 수 있음)
```

**Careti** (명시적 워크플로우):
```
.agents/workflows/feature-development.md 참조:
1. 분석 단계 (체크리스트 A)
2. 설계 단계 (체크리스트 B)
3. 구현 단계 (TDD 필수)
4. 검증 단계 (테스트 커버리지 80%+)
(항상 동일한 절차 보장)
```

### 언제 Workflows가 필요한가?

| 시나리오 | Claude Code | Careti |
|----------|-------------|--------|
| 개인 개발자가 혼자 작업 | ✅ 충분 | ✅ 충분 |
| 팀에서 일관된 프로세스 필요 | 🟡 모델 의존 | ✅ Workflows |
| 감사 추적 / 컴플라이언스 | 🟡 모델 의존 | ✅ Workflows |
| 성능이 낮은 모델 사용 | ❌ 불안정 | ✅ Workflows 가이드 |
| 신입 온보딩 | 🟡 개인차 | ✅ Workflows 표준화 |

### 호환성 요약

- **Claude Code → Careti**: Skills, Commands, Hooks 100% 호환
- **Careti 추가 기능**: Workflows, Atoms, Task Hooks
- **마이그레이션 비용**: 없음 (`.claude/` → `.agents/` 경로만 다름)

## 🆚 다른 도구 대비 비교

| 항목 | Claude Code | OpenCode | Careti |
| --- | --- | --- | --- |
| 명령 경로 | `.claude/commands/` | `.opencode/command/` | `.agents/commands/` |
| 파일 형식 | `*.md` | `*.md` | `*.md` |
| Frontmatter | `description`, `argument-hint` | `description`, `model`, `subtask` | **모두 지원** |
| Claude Code 필드 | ✅ | - | ✅ **완전 호환** |
| 레거시 지원 | - | - | `.agents/skills/` 폴백 |
| 전처리 구문 | `!`command`` | - | ✅ **완전 호환** |
| Hooks 이벤트 | 10개 | - | ✅ **완전 호환** + Careti 고유 |
| Matcher 패턴 | ✅ | - | ✅ **완전 호환** |
| 우선순위 | Personal > Project | - | ✅ **완전 호환** |
| context: fork | ✅ | - | ✅ **완전 호환** |
| allowed-tools | ✅ | - | ✅ **완전 호환** |

## 🆚 Cline 대비 개선점
| 항목 | Cline | Careti |
| --- | --- | --- |
| 규칙 진입점 | 다중 포맷 | 단일 SoT: `.agents/context` |
| 범위 제어 | 우선순위 혼재 | `AGENTS.md` 계층 + SoT |
| 확장성 | 임시 파일 | 표준 `.agents/` + `.users/` |
| 부트스트랩 | 수동 설정 | `/init` 스캐폴드 + 안내 |
| 레거시 규칙 | 포맷 혼용 | 폴백 지원 + 마이그레이션 안내 |
| 역할 분리 | 없음 | AI용/사람용 분리 |
| 명령 시스템 | skills 폴더 | commands 폴더 (Claude Code/OpenCode 호환) |

## 🏗 적용 범위
- **규칙 탐색**: `src/core/context/instructions/user-instructions/external-rules.ts`
- **규칙 헬퍼**: `src/core/context/instructions/user-instructions/rule-helpers.ts`
- **워크플로우**: `src/core/context/instructions/user-instructions/workflows.ts`
- **명령 시스템**: `src/core/context/instructions/user-instructions/commands.ts`
- **전역 규칙**: `src/core/context/instructions/user-instructions/cline-rules.ts`
- **프롬프트 조립**: `src/core/prompts/system-prompt/components/user_instructions.ts`
- **명령 컴포넌트**: `src/core/prompts/system-prompt/components/commands.ts`
- **표준 경로**: `src/core/storage/disk.ts`, `careti-src/utils/brand-utils.ts`
- **스캐폴드 초기화**: `src/core/context/instructions/user-instructions/agents-init.ts`
- **슬래시 커맨드**: `src/core/slash-commands/index.ts` (`/init`)
- **템플릿**: `assets/agents_template/**` (AGENTS.md + .agents + .users)
- **컨텍스트 분리**: `src/core/context/context-separator/index.ts` (ContextSeparator 클래스)

## 🎯 목표
- 워크스페이스 규칙의 단일 SoT를 `.agents/context`로 유지합니다.
- `AGENTS.md` 계층 규칙을 SoT 위에 안전하게 적용합니다.
- 신규 워크스페이스에 표준 스캐폴드와 컨텍스트 채움 가이드를 제공합니다.
- AI와 사람이 읽는 문서를 명확히 분리합니다.
- Claude Code, OpenCode와 호환되는 명령 시스템을 제공합니다.

## 🔧 아키텍처 & 동작
- **세션 시작**: `.agents/context/agents-rules.json`을 읽고 워크플로우를 온디맨드로 로드합니다.
- **AGENTS 계층**: 루트 `AGENTS.md`가 있으면 재귀적으로 합산합니다.
- **프롬프트 조립 순서**: 선호 언어 → 아키텍처 사상 → 전역 규칙 → `.agents/context` → `.users/context` → `AGENTS.md` → ignore 규칙.
- **초기화 안내**: Careti 모드에서 표준 누락 시 시스템 프롬프트로 `/init` 안내를 삽입합니다.
- **/init**: `assets/agents_template`를 복사하고 `agents-init.md` 지침을 주입합니다. 기존 파일은 덮어쓰지 않습니다.
- **컨텍스트 분리**: `ContextSeparator`로 시스템 컨텍스트(JSON)와 사용자 컨텍스트(Markdown)를 분리 로드
- **레거시 폴백**: 새 경로가 없으면 레거시 경로를 자동으로 탐색하고 마이그레이션 안내
- **사상 주입**: 시스템 프롬프트에 이중 디렉토리 아키텍처 철학을 자동 주입
- **명령 탐색**: `.agents/commands/` (신규) → `.agents/skills/` (레거시) 순서로 탐색

## 📍 경로 매핑

### 버전별 경로 변경 이력

| 버전 | 브랜드 | 프로젝트 경로 | 글로벌 경로 |
|------|--------|--------------|-------------|
| v0.4.4 이하 | Caret | `.caretrules/` | `~/Documents/Caret/` |
| v0.4.5 | Caret | `.agents/` | `~/Documents/.agents/` |
| v0.4.6+ | **Careti** | `.agents/` | `~/Documents/.agents/` |

### 프로젝트 레벨 경로 (v0.4.5+)
| 구분 | 새 경로 | v0.4.5 초기 레거시 | v0.4.4 이하 레거시 |
| --- | --- | --- | --- |
| 규칙/컨텍스트 | `.agents/context/` | - | `.caretrules/` |
| 사용자 컨텍스트 | `.users/context/` | `.agents/context-for-user/` | (없음) |
| 워크플로우 | `.agents/workflows/` | `.agents/context/workflows/` | `.caretrules/workflows/` |
| 명령 | `.agents/commands/` | `.agents/skills/` | (없음) |
| 훅 | `.agents/hooks/` | - | (없음) |
| Atoms | `.agents/workflows/atoms/` | (신규) | - |

### 글로벌 경로 (사용자 홈)
글로벌 에이전트 설정은 프로젝트 구조와 일관성을 유지하기 위해 `~/Documents/.agents/`에 저장됩니다.

```
~/Documents/.agents/
├── context/           # 글로벌 규칙 (*.md 파일)
├── workflows/         # 글로벌 워크플로우
├── commands/          # 글로벌 명령
├── hooks/             # 글로벌 훅
└── mcp/               # MCP 서버 설정
```

| 구분 | 새 경로 (v0.4.5+) | v0.4.4 이하 레거시 |
| --- | --- | --- |
| 글로벌 규칙 | `~/Documents/.agents/context/` | `~/Documents/Caret/Rules/` |
| 글로벌 워크플로우 | `~/Documents/.agents/workflows/` | `~/Documents/Caret/Workflows/` |
| 글로벌 명령 | `~/Documents/.agents/commands/` | (없음) |
| 글로벌 훅 | `~/Documents/.agents/hooks/` | (없음) |
| 글로벌 MCP | `~/Documents/.agents/mcp/` | `~/Documents/Caret/MCP/` |

**참고**: v0.4.5부터 숨김 폴더(`.agents`)를 사용하여 Documents 폴더를 깔끔하게 유지하면서 프로젝트 구조와 일관성을 유지합니다.

## 🧪 테스트 체크리스트
1) `.agents/context`와 `AGENTS.md` 제거 후, 시스템 프롬프트에 init 안내가 노출되는지 확인.
2) `/init` 실행 후 스캐폴드가 생성되고 기존 파일은 유지되는지 확인.
3) `.agents/context`와 `AGENTS.md`가 모두 프롬프트에 포함되는지 확인.
4) 워크플로우가 필요할 때만 로드되는지 확인.
5) `.users/context/` 사용자 컨텍스트가 Markdown 형식으로 로드되는지 확인.
6) 레거시 경로(`.agents/context-for-user/`)에서 폴백이 동작하는지 확인.
7) 시스템 프롬프트에 이중 디렉토리 아키텍처 사상이 포함되는지 확인.
8) 레거시 구조 감지 및 마이그레이션 안내가 동작하는지 확인.
9) `.agents/commands/` 명령 파일이 정상 로드되는지 확인.
10) `.agents/skills/` 레거시 폴백이 동작하는지 확인.

## 🧭 유지보수 메모
- `agents-rules.json`과 `agents-rules.md`의 의미를 일치 유지합니다.
- 워크플로우 추가 시 `.agents/context/ai-work-index.yaml`을 갱신합니다.
- **새 경로 우선**: 새 경로 사용을 권장하고, 레거시 경로는 마이그레이션 안내와 함께 지원합니다.
- `.users/` 구조는 `.agents/` 구조를 1:1 미러링해야 합니다.
- Workflows vs Atoms: 워크플로우는 완전한 작업 흐름, atoms는 재사용 가능한 빌딩 블록입니다.
- Commands vs Workflows: 명령은 슬래시로 호출하는 짧은 작업, 워크플로우는 복잡한 다단계 절차입니다.

## 🔗 관련 문서
- **F12 - AI-개발자 지식 동기화 시스템**: 문서 ↔ SoT 정합.
- **F16 - 웹 도구 및 슬래시 명령**: USE_SKILL 도구 상세
- **Rules Reference**: `careti-docs/rules-reference/caretrules-file-guide.md`
- **Master Plan**: `work-logs/luke/careti/todo/todo/context-improvement/master-implementation-plan.md`
