# CODEX.md

This file provides guidance to Codex (OpenAI) when working with code in this repository.

## 🤖 Agent Configuration
```json
{
    "auto_read_paths": [
        ".agents/context/careti-rules.json"
    ],
    "instruction": "Read .agents/context/careti-rules.json first. It contains the project rules and an index of workflows. Read specific workflow files ON DEMAND as needed. ALWAYS communicate with the user in Korean (한글)."
}
```

## ⚠️ Critical Instruction
**DO NOT rely on pre-trained knowledge or assumptions.**
**ALWAYS** read `.agents/context/careti-rules.json` at the start of the session. It is the **SINGLE SOURCE OF TRUTH** for:
- Project Identity & Philosophy
- Merge Strategy (Phase 0, Hybrid Pattern)
- Architecture Rules (L1-L3 Levels)
- Development Framework (Tech Stack, TDD)
- AI Workflow & Forbidden Actions

## 🧬 Proto Generation Guidelines
- TypeScript/Node generated 코드는 **`npm run protos`** (실제 스크립트: `careti-scripts/build/build-proto.mjs`)로만 갱신합니다. `src/shared/proto/**`, `src/generated/**`는 직접 수정하지 마세요.
- Go/CLI gRPC 스텁은 **`npm run protos-go`** (`scripts/build-go-proto.mjs`)가 관리합니다. CLI 테스트 전에 항상 최신 상태로 재생성합니다.
- proto 정의를 수정하거나 generated 코드가 누락된 상태라면 두 명령의 실행 로그를 남기고, `attempt-2-master`/관련 문서에 재생성 사실을 기록해야 합니다.
