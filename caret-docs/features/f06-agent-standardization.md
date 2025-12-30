# F06 - 에이전트 표준화(AAIF SoT)

**Status**: ✅ v0.4.4 업데이트 | **Scope**: Backend(인스트럭션/스토리지), Webview(설정), CLI | **Priority**: 🟡 Medium

## 📋 개요
Caret은 AAIF 표준에 맞춰 규칙 로딩을 표준화하고 `.agents/context`를 단일 SoT로 고정합니다.
`AGENTS.md`는 계층적으로 적용되며, 워크플로우는 온디맨드로 로드됩니다. 표준 구조가 없으면 `/init`이 스캐폴드를 생성합니다.
레거시 규칙 경로는 완전 폐기되어 읽지 않습니다.

## ✅ 왜 중요한가
- **결정적 동작**: 단일 SoT와 인덱스로 규칙 충돌을 차단합니다.
- **머지 안정성**: 레거시 규칙 경로를 완전 제거해 업스트림 충돌을 줄입니다.
- **온보딩 속도**: `/init`이 안전한 기본 구조를 제공합니다.

## ✨ 추가된 기능 요약
- `.agents/context/caret-rules.json` SoT + 온디맨드 워크플로우.
- `AGENTS.md` 계층 탐색(루트 필수, 이후 재귀 로드).
- 표준 `.agents/skills/` + `.agents/hooks/` 구조(AAIF 정합).
- `/init` 스캐폴드(`assets/agents_template`) 적용, 기존 파일 덮어쓰기 없음.
- Caret 모드에서 표준 누락 시 시스템 프롬프트 안내.

## 🆚 Cline 대비 개선점
| 항목 | Cline | Caret |
| --- | --- | --- |
| 규칙 진입점 | 다중 포맷 | 단일 SoT: `.agents/context` |
| 범위 제어 | 우선순위 혼재 | `AGENTS.md` 계층 + SoT |
| 확장성 | 임시 파일 | 표준 `.agents/skills` + `.agents/hooks` |
| 부트스트랩 | 수동 설정 | `/init` 스캐폴드 + 안내 |
| 레거시 규칙 | 포맷 혼용 | 완전 폐기 |

## 🏗 적용 범위
- **규칙 탐색**: `src/core/context/instructions/user-instructions/external-rules.ts`
- **규칙 헬퍼**: `src/core/context/instructions/user-instructions/rule-helpers.ts`
- **전역 규칙**: `src/core/context/instructions/user-instructions/cline-rules.ts`
- **프롬프트 조립**: `src/core/prompts/system-prompt/components/user_instructions.ts`
- **표준 경로**: `src/core/storage/disk.ts`, `caret-src/utils/brand-utils.ts`
- **스캐폴드 초기화**: `src/core/context/instructions/user-instructions/agents-init.ts`
- **슬래시 커맨드**: `src/core/slash-commands/index.ts` (`/init`)
- **템플릿**: `assets/agents_template/**` (AGENTS.md + .agents context)
- **테스트**: `src/core/slash-commands/__tests__/index.test.ts`, `src/core/storage/__tests__/disk.test.ts`

## 🎯 목표
- 워크스페이스 규칙의 단일 SoT를 `.agents/context`로 유지합니다.
- `AGENTS.md` 계층 규칙을 SoT 위에 안전하게 적용합니다.
- 신규 워크스페이스에 표준 스캐폴드와 컨텍스트 채움 가이드를 제공합니다.

## 🔧 아키텍처 & 동작
- **세션 시작**: `.agents/context/caret-rules.json`을 읽고 워크플로우를 온디맨드로 로드합니다.
- **AGENTS 계층**: 루트 `AGENTS.md`가 있으면 재귀적으로 합산합니다.
- **프롬프트 조립 순서**: 선호 언어 → 전역 규칙(Documents/<Brand>/Rules) → 워크스페이스 `.agents/context` → `AGENTS.md` → ignore 규칙.
- **초기화 안내**: Caret 모드에서 표준 누락 시 시스템 프롬프트로 `/init` 안내를 삽입합니다.
- **/init**: `assets/agents_template`를 복사하고 `agents-init.md` 지침을 주입합니다. 기존 파일은 덮어쓰지 않습니다.

## 🧪 테스트 체크리스트
1) `.agents/context`와 `AGENTS.md` 제거 후, 시스템 프롬프트에 init 안내가 노출되는지 확인.
2) `/init` 실행 후 스캐폴드가 생성되고 기존 파일은 유지되는지 확인.
3) `.agents/context`와 `AGENTS.md`가 모두 프롬프트에 포함되는지 확인.
4) 워크플로우가 필요할 때만 로드되는지 확인.

## 🧭 유지보수 메모
- `caret-rules.json`과 `caret-rules.md`의 의미를 일치 유지합니다.
- 워크플로우 추가 시 `.agents/context/ai-work-index.yaml`을 갱신합니다.
- 레거시 규칙 경로를 재도입하지 않습니다.

## 🔗 관련 문서
- **F12 - AI-개발자 지식 동기화 시스템**: 문서 ↔ SoT 정합.
- **Rules Reference**: `caret-docs/rules-reference/caretrules-file-guide.md`
