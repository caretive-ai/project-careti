# F06 - 에이전트 표준화(AAIF SoT)

**Status**: ✅ v0.4.6 업데이트 (USE_SKILL 도구 통합) | **Scope**: Backend(인스트럭션/스토리지), Webview(설정), CLI | **Priority**: 🟡 Medium

## 📋 개요
Careti은 AAIF 표준에 맞춰 규칙 로딩을 표준화하고 **이중 디렉토리 아키텍처**를 채택합니다:
- `.agents/` - AI용 (시스템 컨텍스트, 영어, 토큰 최적화)
- `.users/` - 사람용 (사용자 컨텍스트, 네이티브 언어, 상세 설명)

표준 구조가 없으면 `/init`이 스캐폴드를 생성합니다.
레거시 규칙 경로는 폴백으로 지원하되, 새 경로 사용을 권장합니다.

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

## ✨ 추가된 기능 요약
- `.agents/context/agents-rules.json` SoT + 온디맨드 워크플로우.
- `AGENTS.md` 계층 탐색(루트 필수, 이후 재귀 로드).
- 표준 `.agents/skills/` + `.agents/hooks/` 구조(AAIF 정합).
- `/init` 스캐폴드(`assets/agents_template`) 적용, 기존 파일 덮어쓰기 없음.
- Careti 모드에서 표준 누락 시 시스템 프롬프트 안내.
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
│   ├── skills/                # AI 스킬
│   └── hooks/                 # 이벤트 훅
│
├── .users/                     # 사람용 (네이티브 언어, 상세)
│   ├── context/               # 프로젝트 컨텍스트 (Markdown)
│   ├── workflows/             # 워크플로우 가이드
│   │   └── atoms/             # atom 설명
│   ├── skills/                # 스킬 가이드
│   └── hooks/                 # 훅 문서
│
└── AGENTS.md                   # AI 진입점
```

## 🔧 스킬 시스템 통합 (v0.4.6)

Cline v3.49.1에서 포팅된 `use_skill` 도구가 `.agents/skills/` 구조와 통합되었습니다.

### USE_SKILL 도구
- **도구 정의**: `src/shared/tools.ts` (`ClineDefaultTool.USE_SKILL`)
- **UI 렌더링**: `webview-ui/src/components/chat/ChatRow.tsx` (`useSkill` case)
- **타입 정의**: `src/shared/ExtensionMessage.ts` (`ClineSayTool.tool: "useSkill"`)

### 동작
1. AI가 스킬이 필요한 작업을 감지
2. `use_skill` 도구로 `.agents/skills/<skill>/SKILL.md` 로드
3. 스킬의 지시사항에 따라 작업 수행
4. ChatRow에서 "Cline loaded the skill: ..." 메시지 표시

### 관련 문서
- **F16**: 웹 도구 및 슬래시 명령 - USE_SKILL 도구 상세

## 🆚 Cline 대비 개선점
| 항목 | Cline | Careti |
| --- | --- | --- |
| 규칙 진입점 | 다중 포맷 | 단일 SoT: `.agents/context` |
| 범위 제어 | 우선순위 혼재 | `AGENTS.md` 계층 + SoT |
| 확장성 | 임시 파일 | 표준 `.agents/` + `.users/` |
| 부트스트랩 | 수동 설정 | `/init` 스캐폴드 + 안내 |
| 레거시 규칙 | 포맷 혼용 | 폴백 지원 + 마이그레이션 안내 |
| 역할 분리 | 없음 | AI용/사람용 분리 |

## 🏗 적용 범위
- **규칙 탐색**: `src/core/context/instructions/user-instructions/external-rules.ts`
- **규칙 헬퍼**: `src/core/context/instructions/user-instructions/rule-helpers.ts`
- **워크플로우**: `src/core/context/instructions/user-instructions/workflows.ts`
- **전역 규칙**: `src/core/context/instructions/user-instructions/cline-rules.ts`
- **프롬프트 조립**: `src/core/prompts/system-prompt/components/user_instructions.ts`
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

## 🔧 아키텍처 & 동작
- **세션 시작**: `.agents/context/agents-rules.json`을 읽고 워크플로우를 온디맨드로 로드합니다.
- **AGENTS 계층**: 루트 `AGENTS.md`가 있으면 재귀적으로 합산합니다.
- **프롬프트 조립 순서**: 선호 언어 → 아키텍처 사상 → 전역 규칙 → `.agents/context` → `.users/context` → `AGENTS.md` → ignore 규칙.
- **초기화 안내**: Careti 모드에서 표준 누락 시 시스템 프롬프트로 `/init` 안내를 삽입합니다.
- **/init**: `assets/agents_template`를 복사하고 `agents-init.md` 지침을 주입합니다. 기존 파일은 덮어쓰지 않습니다.
- **컨텍스트 분리**: `ContextSeparator`로 시스템 컨텍스트(JSON)와 사용자 컨텍스트(Markdown)를 분리 로드
- **레거시 폴백**: 새 경로가 없으면 레거시 경로를 자동으로 탐색하고 마이그레이션 안내
- **사상 주입**: 시스템 프롬프트에 이중 디렉토리 아키텍처 철학을 자동 주입

## 📍 경로 매핑

### 프로젝트 레벨 경로
| 구분 | 새 경로 | 레거시 경로 (폴백) |
| --- | --- | --- |
| 사용자 컨텍스트 | `.users/context/` | `.agents/context-for-user/` |
| 워크플로우 | `.agents/workflows/` | `.agents/context/workflows/` |
| Atoms | `.agents/workflows/atoms/` | (신규) |

### 글로벌 경로 (사용자 홈)
글로벌 에이전트 설정은 프로젝트 구조와 일관성을 유지하기 위해 `~/Documents/.agents/`에 저장됩니다.

```
~/Documents/.agents/
├── context/           # 글로벌 규칙 (*.md 파일)
├── workflows/         # 글로벌 워크플로우
├── skills/            # 글로벌 스킬
├── hooks/             # 글로벌 훅
└── mcp/               # MCP 서버 설정
```

| 구분 | 새 경로 | 레거시 경로 (마이그레이션) |
| --- | --- | --- |
| 글로벌 규칙 | `~/Documents/.agents/context/` | `~/Documents/Careti/Rules/` |
| 글로벌 워크플로우 | `~/Documents/.agents/workflows/` | `~/Documents/Careti/Workflows/` |
| 글로벌 스킬 | `~/Documents/.agents/skills/` | `~/Documents/Careti/Skills/` |
| 글로벌 훅 | `~/Documents/.agents/hooks/` | `~/Documents/Careti/Hooks/` |
| 글로벌 MCP | `~/Documents/.agents/mcp/` | `~/Documents/Careti/MCP/` |

**참고**: 숨김 폴더(`.agents`)를 사용하여 Documents 폴더를 깔끔하게 유지하면서 프로젝트 구조와 일관성을 유지합니다.

## 🧪 테스트 체크리스트
1) `.agents/context`와 `AGENTS.md` 제거 후, 시스템 프롬프트에 init 안내가 노출되는지 확인.
2) `/init` 실행 후 스캐폴드가 생성되고 기존 파일은 유지되는지 확인.
3) `.agents/context`와 `AGENTS.md`가 모두 프롬프트에 포함되는지 확인.
4) 워크플로우가 필요할 때만 로드되는지 확인.
5) `.users/context/` 사용자 컨텍스트가 Markdown 형식으로 로드되는지 확인.
6) 레거시 경로(`.agents/context-for-user/`)에서 폴백이 동작하는지 확인.
7) 시스템 프롬프트에 이중 디렉토리 아키텍처 사상이 포함되는지 확인.
8) 레거시 구조 감지 및 마이그레이션 안내가 동작하는지 확인.

## 🧭 유지보수 메모
- `agents-rules.json`과 `agents-rules.md`의 의미를 일치 유지합니다.
- 워크플로우 추가 시 `.agents/context/ai-work-index.yaml`을 갱신합니다.
- **새 경로 우선**: 새 경로 사용을 권장하고, 레거시 경로는 마이그레이션 안내와 함께 지원합니다.
- `.users/` 구조는 `.agents/` 구조를 1:1 미러링해야 합니다.
- Workflows vs Atoms: 워크플로우는 완전한 작업 흐름, atoms는 재사용 가능한 빌딩 블록입니다.

## 🔗 관련 문서
- **F12 - AI-개발자 지식 동기화 시스템**: 문서 ↔ SoT 정합.
- **Rules Reference**: `careti-docs/rules-reference/caretrules-file-guide.md`
- **Master Plan**: `work-logs/luke/careti/todo/todo/context-improvement/master-implementation-plan.md`
