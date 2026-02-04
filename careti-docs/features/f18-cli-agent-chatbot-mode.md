# F18 - CLI Agent/Chatbot 모드

**Status**: ✅ v0.4.8 구현 완료, v0.4.9 Headless 개선 | **Scope**: CLI(Go), Backend(gRPC) | **Priority**: 🟡 Medium

## 📋 개요

CLI에서 Careti 전용 모드(Agent, Chatbot)를 지원하여 VS Code 확장과 동일한 모드 시스템을 터미널에서 사용할 수 있습니다.

**4가지 모드 지원**:
- `plan` (기본값): 분석/계획 모드 - Cline 호환
- `act`: 실행 모드 - Cline 호환
- `agent`: 자율 실행 모드 - Careti 전용 (Interactive)
- `chatbot`: 대화 모드 - Careti 전용, 비자율

**Headless/Yolo 모드** (v0.4.9+):
- `--yolo` 플래그로 서브에이전트/벤치마크용 헤드리스 실행
- Persona 제외, COLLABORATIVE_PRINCIPLES 스킵
- Cline vs Careti 프롬프트 성능 비교 가능

## ✅ 왜 중요한가

- **모드 일관성**: VS Code 확장과 CLI가 동일한 모드 시스템 사용
- **자율 실행**: Agent 모드로 승인 없이 자동 작업 수행
- **대화 중심**: Chatbot 모드로 코드 실행 없이 분석/질문 가능
- **Persona 연동**: Agent 모드에서 Persona 지정으로 맞춤형 응답
- **벤치마크**: Headless 모드로 Cline vs Careti 프롬프트 성능 비교

## ✨ 추가된 기능 요약

- `--mode agent`: Careti Agent 모드 (자율 실행, Yolo 자동)
- `--mode chatbot`: Careti Chatbot 모드 (대화 중심, 비자율)
- `--persona <name>`: Agent/Chatbot 모드에서 Persona 지정
- CLI 배너 색상: plan(노랑), act(파랑), agent(초록), chatbot(마젠타)
- gRPC 연동: SetCaretAgentMode, SetCaretChatbotMode, SetPersona

## 📦 설치

### npm으로 설치 (권장)
```bash
npm install -g @caretive/careti-cli
careti version
```

### 로컬 빌드 및 Standalone 실행
```bash
# 1. 빌드 (프로젝트 루트에서)
npm run protos-go           # gRPC 코드 생성
npm run compile-standalone  # cline-core 번들
npm run compile-cli         # CLI 바이너리

# 2. Standalone 서버 시작 (별도 터미널)
node dist-standalone/cline-core.js

# 3. CLI 실행
./cli/bin/caret --mode agent "작업 내용"
```

## 🚀 실행 방식

### VS Code 확장 연동
VS Code에서 Careti 확장 실행 중이면 CLI만 사용:
```bash
careti "작업 내용"              # 기본 (localhost:50052)
careti --address localhost:50053 "작업"  # 다른 인스턴스
```

### Standalone 모드 (VS Code 없이)
```bash
# 터미널 1: 서버
node dist-standalone/cline-core.js

# 터미널 2: CLI
./cli/bin/caret --mode agent "작업 내용"
```

## 🔧 사용법

```bash
# Agent 모드 - 자율 실행 (Yolo 자동)
careti --mode agent "프로젝트 구조 분석하고 README 작성해줘"
careti -m agent "테스트 코드 작성해줘"

# Agent 모드 + Persona
careti --mode agent --persona careti "리팩토링해줘"
careti -m agent -p senior-dev "코드 리뷰해줘"

# Chatbot 모드 - 대화 중심 (실행 없음)
careti --mode chatbot "이 코드가 뭐하는 건지 설명해줘"
careti -m chatbot "아키텍처 제안해줘"

# 기존 Cline 호환 모드
careti --mode plan "분석해줘"
careti --mode act --yolo "바로 실행해줘"
```

## 🚀 Headless/Yolo 모드 (v0.4.9+)

서브에이전트 또는 벤치마크 테스트용 헤드리스 실행 모드입니다.

### 사용법

```bash
# Careti headless 모드
careti "테스트 프롬프트" --yolo
careti "테스트 프롬프트" -y

# Cline headless 모드 (비교용)
cline "테스트 프롬프트" --yolo
```

### Yolo 모드 특징

| 항목 | Interactive 모드 | Yolo/Headless 모드 |
|------|-----------------|-------------------|
| 승인 요청 | 필요 | 자동 승인 |
| Persona | 적용 (`persona.md`) | 제외 |
| COLLABORATIVE_PRINCIPLES | 포함 | 스킵 |
| 스트림 종료 | 재연결 | 완료 후 종료 |
| 용도 | 대화형 작업 | 서브에이전트, 벤치마크 |

### 서브에이전트 자동 변환

메인 에이전트가 `careti "prompt"` 명령 실행 시 자동으로 yolo 설정 주입:

```bash
# 입력
careti "분석해줘"

# 자동 변환 (서브에이전트로 실행 시)
careti "분석해줘" -s yolo_mode_toggled=true -s max_consecutive_mistakes=6 -F plain -y --oneshot
```

### 벤치마크 비교

Cline vs Careti 프롬프트 성능 측정:

```bash
# Careti 프롬프트 (persona 제외, COLLABORATIVE_PRINCIPLES 스킵)
careti "작업 내용" --yolo

# Cline 프롬프트 (원본 그대로)
cline "작업 내용" --yolo
```

**측정 항목**:
- 토큰 사용량 (프롬프트 크기 차이)
- 응답 품질/정확도
- 작업 완료 시간
- 도구 사용 패턴

## 🏗 아키텍처

### 모드 계층 구조
```
┌─────────────────────────────────────────┐
│          Careti Mode (상위)              │
│   chatbot ←→ agent                      │
└────────────────┬────────────────────────┘
                 │ 내부 매핑
┌────────────────▼────────────────────────┐
│         Cline Mode (하위)                │
│   plan ←→ act                           │
└─────────────────────────────────────────┘
```

### gRPC API 호출 흐름

| CLI 모드 | gRPC 호출 순서 |
|----------|---------------|
| `agent` | 1. SetPromptSystemMode("careti")<br>2. SetCaretMode("agent")<br>3. SetMode("act") |
| `chatbot` | 1. SetPromptSystemMode("careti")<br>2. SetCaretMode("chatbot")<br>3. SetMode("plan") |
| `act` | SetMode("act") |
| `plan` | SetMode("plan") |

### CLI UI 색상 테마

| 모드 | 색상 코드 | 의미 |
|------|----------|------|
| plan | Yellow (3) | 분석/계획 |
| act | Blue (39) | 실행 |
| agent | Green (2) | 자율 실행 |
| chatbot | Magenta (5) | 대화 |

## 🗂 코드 범위

### CLI (Go)
- `cli/cmd/cline/main.go`: 플래그 정의 (`--mode`, `--persona`, `--yolo`), UI 색상
- `cli/pkg/cli/task.go`: 모드별 핸들링 로직, API 호출 분기, Yolo 모드 처리
- `cli/pkg/cli/task/manager.go`: SetCaretAgentMode, SetCaretChatbotMode, SetPersona, EOF 재연결
- `cli/pkg/cli/task/input_handler.go`: 입력 처리, Interactive/Yolo 분기
- `cli/pkg/cli/display/banner.go`: 배너 색상 렌더링

### TypeScript (Extension)
- `src/integrations/cli-subagents/subagent_command.ts`: careti/cline 서브에이전트 명령 변환
- `src/core/context/instructions/user-instructions/cline-rules.ts`: Yolo 모드 persona 제외
- `careti-src/core/prompts/system/adapters/CaretiJsonAdapter.ts`: COLLABORATIVE_PRINCIPLES 스킵
- `careti-src/core/prompts/system/types.ts`: yoloModeToggled 타입 정의

### Proto
- `proto/careti/system.proto`: SetCaretMode, SetPromptSystemMode RPC
- `proto/careti/persona.proto`: UpdatePersona RPC

## 🧪 테스트

### Unit 테스트 (Go)
```bash
go test ./cli/pkg/cli/task/... -v -run "Agent|Chatbot|Persona|Mode"
```

- `TestSetCaretAgentModeNilClient`: 클라이언트 nil 에러 처리
- `TestSetCaretChatbotModeNilClient`: 클라이언트 nil 에러 처리
- `TestSetPersonaNilClient`: Persona 클라이언트 nil 에러 처리
- `TestSetModeInvalidMode`: 잘못된 모드 값 검증

### Unit 테스트 (TypeScript)
```bash
npx vitest run src/integrations/cli-subagents/subagent_command.test.ts
```

- `isSubagentCommand`: careti/cline 명령어 감지
- `transformClineCommand`: yolo 설정 주입 변환

### E2E 테스트
```bash
go test ./cli/e2e/... -v -run "Agent|Mode|Persona|Interactive|Yolo"
```

- `TestAgentModeHelp`: --help에 agent/chatbot 모드 표시 확인
- `TestModeAndPersonaFlagsInHelp`: 플래그 설명 확인
- `TestModeDefaultValue`: 기본값 plan 확인
- `TestInteractiveMode`: Interactive 모드 EOF 재연결
- `TestYoloMode`: Yolo 모드 완료 후 종료

### 프롬프트 테스트
```bash
npm run test:unit -- T06PromptSystemIntegration
```

- `should include COLLABORATIVE_PRINCIPLES when yoloModeToggled is false`
- `should SKIP COLLABORATIVE_PRINCIPLES when yoloModeToggled is true`

## 📋 CLI 명령어 요약

```bash
# 기본 사용
careti "프롬프트"                    # 대화형 작업 시작
careti --mode agent "프롬프트"       # Agent 모드
careti --mode chatbot "프롬프트"     # Chatbot 모드

# 옵션
careti -m agent -p careti "프롬프트" # Persona 지정
careti --yolo "프롬프트"             # 승인 없이 실행
careti --verbose "프롬프트"          # 디버그 출력

# 유틸리티
careti version                       # 버전 확인
careti auth                          # 인증 설정
careti instance list                 # 실행 중인 인스턴스
careti task list                     # 작업 목록
```

## 🚢 배포

### 플랫폼별 바이너리 빌드
```bash
npm run compile-cli-all-platforms
# 결과물: cli/bin/caret-{platform}-{arch}
```

### npm 배포 절차
```bash
# 1. 버전 업데이트 (둘 다 동일하게)
# - cli/package.json
# - cli-careti/package.json

# 2. standalone 번들 생성
npm run compile-standalone-npm

# 3. npm 배포
bash cli-careti/scripts/publish-careti-cli.sh

# 4. 확인
npm view @caretive/careti-cli version
```

### 배포 후 확인
```bash
npm i -g @caretive/careti-cli@latest
careti version
careti --help
```

## 📚 참고 문서

- `careti-docs/development/cli-development.md`: CLI 개발 가이드 (상세)
- `f04-cline-compatibility-and-cli.md`: Cline 호환성 및 CLI 기본
- `f07-caret-prompt-system.md`: Careti 프롬프트 시스템
- `f08-persona-system.md`: Persona 시스템
