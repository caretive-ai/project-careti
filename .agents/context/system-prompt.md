# System Prompt Implementation Guide

## Context
You are working with Caret's JSON-based modular system prompt architecture, replacing Cline's hardcoded 707-line prompt.

## Core Innovation

**Caret's System Prompt**:
- ❌ Cline: 707 lines of hardcoded string
- ✅ Caret: 15 JSON modules + dynamic loading

**Key Benefits**:
- **Token Efficiency**: 53% savings (Agent mode), 70% savings (Chatbot mode)
- **Modularity**: Each section independently editable
- **Maintainability**: JSON structure vs monolithic string

## Chatbot/Agent Mode System

### Agent Mode (Default) - Cursor Style
```json
{
  "philosophy": "Free collaborative intelligence",
  "tool_access": "All tools freely available",
  "style": "Natural thought + action integration",
  "experience": "Cursor-level efficient collaboration"
}
```

**Characteristics**:
- Use all tools freely
- Natural collaboration flow
- Efficient development partnership

### Chatbot Mode (Safe Mode) - Consultation Only
```json
{
  "philosophy": "Safe expert consultation",
  "safety_first": "No system changes allowed",
  "read_only_tools": ["read_file", "search_files", "list_files"],
  "transition": "Actively guide to Agent mode for implementation"
}
```

**Characteristics**:
- Read-only tools only
- Expert advice and analysis
- Transition guidance to Agent mode for implementation

## File Structure

```
caret-src/core/prompts/
├── sections/ (15 files)              # Modular prompt structure
│   ├── BASE_PROMPT_INTRO.json        # Caret identity + Mode system
│   ├── COLLABORATIVE_PRINCIPLES.json # 5 collaboration principles
│   ├── TOOL_DEFINITIONS.json         # 15 tool definitions
│   ├── TOOL_USE_GUIDELINES.json      # Collaborative tool usage
│   ├── CHATBOT_AGENT_MODES.json      # Mode philosophy
│   ├── TOOLS_HEADER.json             # Tool section header
│   ├── TOOL_USE_FORMAT.json          # XML format specs
│   ├── TOOL_USE_EXAMPLES.json        # Tool usage examples
│   ├── CAPABILITIES_SUMMARY.json     # Capabilities overview
│   ├── EDITING_FILES_GUIDE.json      # File editing guide
│   ├── RULES.json                    # Basic rules
│   ├── SYSTEM_INFO.json              # System information
│   ├── OBJECTIVE.json                # Goals and procedures
│   └── USER_INSTRUCTIONS.json        # User instructions
├── rules/ (3 files)                  # Specific rules
│   ├── common_rules.json             # .agents/context principles
│   ├── file_editing_rules.json       # Quality-first editing
│   └── cost_consideration_rules.json # Token efficiency
├── CaretSystemPrompt.ts              # Main class (Singleton)
├── JsonTemplateLoader.ts             # JSON loading system
└── system.ts                         # Integration point
```

## Collaborative AI Principles (5 Core)

### 1. Quality-First Collaboration
- Accuracy and quality over speed
- Actively ask for help when uncertain
- Pursue perfect results

### 2. Complete Evidence-Based Analysis
- Prevent "Found it!" syndrome
- Verify before concluding
- Systematic problem-solving

### 3. Pattern Recognition and Reuse
- Search existing patterns before creating new
- Batch processing when possible
- Maximize efficiency and consistency

### 4. Natural Development Partnership
- Cursor-style natural collaboration
- "How about we..." style suggestions
- Partnership mindset, not servant

### 5. Self-Monitoring and Learning
- Metacognition and system improvement
- Request rule improvements for repeated mistakes
- Continuous system evolution

## JSON Module Structure

**Each JSON section follows**:
```json
{
  "id": "section_identifier",
  "title": "Section Title",
  "content": [
    "Line 1 of prompt content",
    "Line 2 of prompt content"
  ],
  "metadata": {
    "tokens_estimate": 150,
    "load_priority": "high|medium|low",
    "mode_specific": "agent|chatbot|both"
  }
}
```

## Dynamic Loading System

**JIT (Just-In-Time) Loading**:
```typescript
// High priority: Always loaded
const coreSections = [
  "BASE_PROMPT_INTRO",
  "COLLABORATIVE_PRINCIPLES",
  "TOOL_DEFINITIONS"
]

// Medium priority: Loaded on demand
const contextSections = [
  "TOOL_USE_EXAMPLES",
  "EDITING_FILES_GUIDE"
]

// Low priority: Loaded only when needed
const detailSections = [
  "SYSTEM_INFO",
  "USER_INSTRUCTIONS"
]
```

**Token Optimization Results**:
- Agent Mode: 53.28% token savings
- Chatbot Mode: 69.68% token savings
- JIT Phase 1: Additional 4,500 tokens saved

## Implementation Guidelines

### Modifying System Prompt

**DO's**:
- ✅ Edit individual JSON files in `sections/`
- ✅ Keep `content` array format (one string per line)
- ✅ Update `tokens_estimate` after major changes
- ✅ Test both Agent and Chatbot modes
- ✅ Use `JsonTemplateLoader` for loading

**DON'Ts**:
- ❌ Don't hardcode prompts in TypeScript
- ❌ Don't modify Cline's original system prompt files
- ❌ Don't remove metadata fields
- ❌ Don't create monolithic JSON files

### Adding New Section

```typescript
// 1. Create JSON file
// caret-src/core/prompts/sections/NEW_SECTION.json
{
  "id": "new_section",
  "title": "New Section Title",
  "content": [
    "Section content line 1",
    "Section content line 2"
  ],
  "metadata": {
    "tokens_estimate": 100,
    "load_priority": "medium",
    "mode_specific": "both"
  }
}

// 2. Register in CaretSystemPrompt.ts
private async loadSections() {
  this.sections.push(
    await this.loader.load("NEW_SECTION.json")
  )
}
```

### Mode-Specific Content

```json
{
  "id": "tool_restrictions",
  "title": "Tool Usage Restrictions",
  "content": [
    "{{IF_CHATBOT_MODE}}",
    "In Chatbot mode, only read-only tools are available.",
    "{{END_IF}}",
    "{{IF_AGENT_MODE}}",
    "In Agent mode, all tools are freely available.",
    "{{END_IF}}"
  ]
}
```

## Key File Locations

**Main Implementation**:
- System Prompt Class: `caret-src/core/prompts/CaretSystemPrompt.ts`
- JSON Loader: `caret-src/core/prompts/JsonTemplateLoader.ts`
- Integration: `caret-src/core/prompts/system.ts`

**JSON Modules**:
- Sections: `caret-src/core/prompts/sections/*.json`
- Rules: `caret-src/core/prompts/rules/*.json`

**Cline Original** (DO NOT MODIFY):
- `src/core/prompts/system.ts` (Original Cline prompt)

## Verification

After modifying system prompt:
```bash
# 1. Check JSON syntax
npm run check-types

# 2. Test both modes
# Agent mode (default)
npm run dev

# Chatbot mode (safe mode)
# Switch mode in UI and test read-only tools
```

## Token Optimization Tips

1. **Remove redundancy**: Eliminate duplicate information across sections
2. **Use references**: Link to `.agents/context` instead of repeating
3. **JIT loading**: Load detailed sections only when needed
4. **Compress examples**: Use concise code examples

## Related Documents
- `.agents/context/caret-architecture-guide.md`: Overall architecture
- `.agents/context/prompt-management.md`: Prompt management workflow
- `caret-docs/development/system-prompt-implementation.md`: Complete guide (Korean)
