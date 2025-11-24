# F04: Cline 호환성 & CLI 확장

## 개요
- 목표: Cline 모드를 100% 호환 유지하면서 Caret 전용 기능(CLI·브랜딩·프롬프트)을 최소 침습으로 제공.
- 범위: CLI(Caret/Cline 모드 분기), 시스템 프롬프트 모드(caret/cline), 배포/설치/브랜딩 지침.

## 아키텍처 원칙
- **Minimal Invasion**: Cline 코드는 최대한 그대로 유지, 분기는 `modeSystem`과 환경변수(`CARET_MODE_SYSTEM`)로 처리.
- **Dual Mode**: cline 모드=기존 Cline 흐름, caret 모드=JSON 프롬프트·Caret 브랜딩·Caret CLI 사용.
- **Domain Split**: 인증 `https://caret.team`, API `https://api.caret.team` (Cline와 동일 스키마 유지).

## 구현 포인트 (대상 파일)
- **프롬프트 라우팅**: `src/core/prompts/system-prompt/index.ts` → `modeSystem === "caret"` 시 `CaretPromptWrapper`, tools 빈 배열.
- **모드 영속화**: `src/core/controller/persona/SetPromptSystemMode.ts` → `setGlobalStateBatch({ caretModeSystem })` 저장.
- **CLI 분기(웹뷰)**:
  - `webview-ui/src/components/common/CliInstallBanner.tsx`: 모드별 설치 URL/명령 노출(Caret/Cline).
  - `src/utils/cli-detector.ts`: `isCaretCliInstalled` 추가, Cline 감지와 병행.
  - `src/core/prompts/system-prompt/components/cli_subagents.ts`: 텍스트/명령어를 모드별로 분기.
  - 로케일: `welcome.json`(ko/en/ja/zh) `cliBanner.{title,description,button}` 추가.
- **CLI 분기(Go)**:
  - `cli-caret/pkg/cli/auth/{providers_list.go,auth_menu.go,auth_cline_provider.go}`: Caret 라벨·도메인, BYO Gemini 노출, 단위테스트 `providers_list_test.go`.
  - 패키징 스크립트: `cli-caret/scripts/install-local.sh`, `install-local-clean.sh`, `publish-caret-cli.sh`에 dist-standalone 동기화, extension/package.json 주입, bin/caret/caret-host 빌드 후 cline 바이너리 복사.

## 머징 가이드
- 3-way 기준: `comparison/base`(v3.35.0) / `comparison/cline`(v3.38.1) / `comparison/caret`(caret-main).
- Cline 파일 수정 시 `// CARET MODIFICATION: ...` 주석 필수, 변경은 1–3줄 이내 유지.
- tgz 등 대용량 산출물은 커밋 금지(.gitignore 적용).

## 테스트 체크리스트 (TDD)
- `mode-system.test.ts`: 글로벌 스테이트 영속화, caret/cline 분기, UI 라벨(Agent/Chatbot vs Plan/Act).
- CLI 감지/배너: caret/cline 모드에서 설치 여부에 따라 배너/명령 분기 확인.
- `npm run compile && npm run test` 통과, 수동 `caret version`, `caret task new` 동작 확인.

## 참고 문서
- `caret-docs/merging/cli-provider-servers.md` (서버팀용 도메인/엔드포인트)
- `caret-docs/merging/v3.38.1/attempt-2-master.md` (Phase D 진행 로그 및 액션)
