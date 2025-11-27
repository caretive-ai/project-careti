# CLAUDE.md

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
- 브랜드 문자열은 직접 작성하지 말고 공용 유틸에서 읽습니다.
  - TypeScript/Extension: `caret-src/utils/brand-utils.ts`
  - Go/CLI: `cli/pkg/common/branding.go`
- 리뷰 시에도 해당 경로의 함수 호출 여부를 확인하여 누락된 하드코딩이 없는지 검증하세요.
