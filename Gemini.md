# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

## 🤖 Agent Configuration
```json
{
    "auto_read_paths": [
        ".agents/context/caret-rules.json"
    ],
    "instruction": "Read .agents/context/caret-rules.json first. It contains the project rules and an index of workflows. Read specific workflow files ON DEMAND as needed. ALWAYS communicate with the user in Korean (한글)."
}
```

## ⚠️ Critical Instruction
**DO NOT rely on pre-trained knowledge or assumptions.**
**ALWAYS** read `.agents/context/caret-rules.json` at the start of the session. It is the **SINGLE SOURCE OF TRUTH** for:
- Project Identity & Philosophy
- Merge Strategy (Phase 0, Hybrid Pattern)
- Architecture Rules (L1-L3 Levels)
- Development Framework (Tech Stack, TDD)
- AI Workflow & Forbidden Actions
