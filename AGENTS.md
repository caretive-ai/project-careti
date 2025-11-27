# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🤖 Agent Configuration
```json
{
    "auto_read_paths": [
        ".caretrules/caret-rules.json"
    ],
    "instruction": "Read .caretrules/caret-rules.json first. It contains the project rules and an index of workflows. Read specific workflow files ON DEMAND as needed. ALWAYS communicate with the user in Korean (한글)."
}
```

## ⚠️ Critical Instruction
**DO NOT rely on pre-trained knowledge or assumptions.**
**ALWAYS** read `.caretrules/caret-rules.json` at the start of the session. It is the **SINGLE SOURCE OF TRUTH** for:
- Project Identity & Philosophy
- Merge Strategy (Phase 0, Hybrid Pattern)
- Architecture Rules (L1-L3 Levels)
- Development Framework (Tech Stack, TDD)
- AI Workflow & Forbidden Actions

## 🪪 Branding Utilities (필수)
- 브랜드명/표기/규칙을 사용할 때는 반드시 **공용 유틸**을 호출합니다.
  - TypeScript/Extension: `caret-src/utils/brand-utils.ts`
  - Go/CLI: `cli/pkg/common/branding.go`
- 문자열로 `Caret`, `Cline` 등을 직접 적지 말고 해당 헬퍼를 통해 계산하세요. B2B 브랜드 분기(BR rename)가 있을 때 여기만 수정하면 되도록 유지해야 합니다.
