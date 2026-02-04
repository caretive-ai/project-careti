# CLI Headless/Yolo 모드 개선

## 날짜
- 시작: 2026-02-05
- 상태: doing

## 목적
- CLI headless 모드를 Cline의 서브에이전트로 활용
- 프롬프트 성능 측정을 위한 벤치마크 환경 구축
- Cline vs Careti 프롬프트 비교 가능하게

## 작업 내용

### 1. CLI Headless 모드 수정
- EOF 발생 시 스트림 재연결 (interactive 모드에서 종료되지 않도록)
- Yolo 모드를 agent/chatbot 모드와 독립적으로 분리
- `[act mode]` 대신 `[agent mode]` 표시

### 2. Yolo/Headless 모드에서 Persona 제외
- `persona.md` 파일을 글로벌 rules에서 제외 (`excludePersona` 옵션)
- `COLLABORATIVE_PRINCIPLES` 섹션 스킵 (문서화/승인 요구사항)
- `yoloModeToggled` 컨텍스트 전달

### 3. Careti 서브에이전트 지원
- `CARETI_COMMAND_PATTERN` 추가 (`careti "prompt"` 구문)
- careti 명령도 cline과 동일한 yolo 설정 주입

### 4. 기본 설정 개선
- `skillsEnabled`, `subagentsEnabled` 기본값 `true`로 변경
- Careti 모드에서 CLI 설치 배너 표시
- Careti 모드에서 서브에이전트 설정 UI 표시

## 변경 파일

### TypeScript
- `src/core/context/instructions/user-instructions/cline-rules.ts` - excludePersona 옵션
- `src/core/storage/utils/state-helpers.ts` - 기본값 변경
- `src/core/task/index.ts` - yolo 모드 persona 제외
- `src/integrations/cli-subagents/subagent_command.ts` - careti 패턴 추가
- `careti-src/core/prompts/system/adapters/CaretiJsonAdapter.ts` - COLLABORATIVE_PRINCIPLES 스킵
- `careti-src/core/prompts/system/types.ts` - yoloModeToggled 타입
- `careti-src/core/prompts/CaretiPromptWrapper.ts` - yoloModeToggled 전달
- `webview-ui/src/components/settings/sections/FeatureSettingsSection.tsx` - UI 표시
- `webview-ui/src/components/welcome/CliInstallBanner.tsx` - 배너 표시

### Go (CLI)
- `cli/pkg/cli/task.go` - yolo 모드 분리
- `cli/pkg/cli/task/manager.go` - EOF 재연결, SetCaretMode
- `cli/pkg/cli/task/input_handler.go` - 입력 처리

### 테스트
- `src/integrations/cli-subagents/subagent_command.test.ts` - careti/cline 변환 테스트
- `careti-src/__tests__/tdd/T06PromptSystemIntegration.test.ts` - yolo 모드 테스트

## 사용법

```bash
# Cline headless 모드
cline "테스트 프롬프트" --yolo

# Careti headless 모드
careti "테스트 프롬프트" --yolo
```

## 벤치마크 비교 포인트
- 프롬프트 시스템 차이 (careti vs cline modeSystem)
- Careti: persona.md 제외, COLLABORATIVE_PRINCIPLES 제외
- Cline: 원본 프롬프트 그대로
- 토큰 사용량, 응답 품질, 작업 완료 시간

## TODO (미래 작업)
- [ ] 서브에이전트 프로바이더 연동
  - anthropic → Claude Code CLI
  - openai → Codex CLI
  - 기타 → careti/cline CLI
- [ ] 벤치마크 자동화 스크립트

## 커밋
- `9800bcf6f` - feat(cli): headless/yolo mode improvements for benchmark testing
