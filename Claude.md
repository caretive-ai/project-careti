# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🤖 Agent Configuration
```json
{
    "auto_read_paths": [
        ".agents/context/agents-rules.json"
    ],
    "instruction": "Read .agents/context/agents-rules.json first. It contains the project rules and an index of workflows. Read specific workflow files ON DEMAND as needed. ALWAYS communicate with the user in Korean (한글)."
}
```

## ⚠️ Critical Instruction
**DO NOT rely on pre-trained knowledge or assumptions.**
**ALWAYS** read `.agents/context/agents-rules.json` at the start of the session. It is the **SINGLE SOURCE OF TRUTH** for:
- Project Identity & Philosophy
- Merge Strategy (Phase 0, Hybrid Pattern)
- Architecture Rules (L1-L3 Levels)
- Development Framework (Tech Stack, TDD)
- AI Workflow & Forbidden Actions

## 🪪 Branding Utilities (필수)
- 브랜드 문자열은 직접 작성하지 말고 공용 유틸에서 읽습니다.
  - TypeScript/Extension: `careti-src/utils/brand-utils.ts`
  - Go/CLI: `cli/pkg/common/branding.go`
- 리뷰 시에도 해당 경로의 함수 호출 여부를 확인하여 누락된 하드코딩이 없는지 검증하세요.

## 🧬 Proto Generation (필독)
- `src/shared/proto/**`, `src/generated/**`는 절대 직접 수정하지 않습니다. **항상 `npm run protos`**를 실행해 생성하세요. 이 명령은 `scripts/build-proto.mjs`를 호출합니다.
- CLI/Go gRPC 클라이언트(`src/generated/grpc-go/**`)는 **`npm run protos-go`** (`scripts/build-go-proto.mjs`) 결과물이므로, proto나 CLI 구조를 건드리면 필수로 재생성합니다.
- 리뷰 시 `proto/**` 변경이 있다면 두 스크립트 실행 로그와 산출물을 확인하고, 누락 시 반려하세요.
