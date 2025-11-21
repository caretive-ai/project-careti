# System Prompt Architecture Analysis - Provider-Specific Handling

## 질문
"클라인의 구조상 특정 프로바이더 특화로 시스템 프롬프트를 내보내지 않아?"

## 분석 결과

### ❌ 프로바이더별 특화 없음!

Cline의 시스템 프롬프트 시스템은 **프로바이더별 특화가 없어요**. 대신 **모델 패밀리별 variant**를 사용합니다.

---

## 시스템 프롬프트 생성 Flow

### 1. Entry Point: `getSystemPrompt()`
**File**: `src/core/prompts/system-prompt/index.ts`

```typescript
export async function getSystemPrompt(context: SystemPromptContext): Promise<string> {
  // CARET MODIFICATION: Check if Caret mode
  if (currentMode === "caret") {
    return await CaretPromptWrapper.getCaretSystemPrompt(context)
  }
  
  // Default: Use Cline's PromptRegistry
  const registry = PromptRegistry.getInstance()
  return await registry.get(context)
}
```

**Key Points**:
- Caret 모드면 → CaretPromptWrapper
- 아니면 → Cline PromptRegistry
- **프로바이더 정보는 context에만 포함**

---

### 2. Model Family Detection
**File**: `src/core/prompts/system-prompt/index.ts`

```typescript
export function getModelFamily(providerInfo: ApiProviderInfo): ModelFamily {
  if (isGPT5ModelFamily(providerInfo.model.id)) return ModelFamily.GPT_5
  if (isNextGenModelFamily(providerInfo.model.id)) return ModelFamily.NEXT_GEN
  if (providerInfo.customPrompt === "compact" && isLocalModel(providerInfo)) return ModelFamily.XS
  return ModelFamily.GENERIC  // 대부분 여기로
}
```

**Key Points**:
- **모델 ID로 패밀리 결정** (예: "claude-4" → GENERIC)
- **프로바이더는 보지 않음!**
- Claude Code, Anthropic, OpenRouter 모두 GENERIC

---

### 3. PromptRegistry: Variant 선택
**File**: `src/core/prompts/system-prompt/registry/PromptRegistry.ts`

```typescript
async get(context: SystemPromptContext): Promise<string> {
  await this.load()
  
  // Get model family
  const modelFamily = getModelFamily(context.providerInfo)
  
  // Get variant for that family
  let variant = this.variants.get(modelFamily ?? ModelFamily.GENERIC)
  
  // Fallback to GENERIC if not found
  if (!variant && modelFamily !== ModelFamily.GENERIC) {
    variant = this.variants.get(ModelFamily.GENERIC)
  }
  
  // Build prompt with PromptBuilder
  const builder = new PromptBuilder(variant, context, this.components)
  return await builder.build()
}
```

**Key Points**:
- Variant는 **모델 패밀리별**로 로드됨
- **프로바이더별 variant 없음**
- 대부분 GENERIC variant 사용

---

### 4. PromptBuilder: 프롬프트 조립
**File**: `src/core/prompts/system-prompt/registry/PromptBuilder.ts`

```typescript
async build(): Promise<string> {
  // 1. Build components (componentOrder에 따라)
  const componentSections = await this.buildComponents()
  
  // 2. Prepare placeholders
  const placeholderValues = this.preparePlaceholders(componentSections)
  
  // 3. Resolve template
  const prompt = this.templateEngine.resolve(
    this.variant.baseTemplate, 
    this.context, 
    placeholderValues
  )
  
  // 4. Post-process
  return this.postProcess(prompt)
}
```

**Key Points**:
- Variant의 componentOrder대로 섹션 조립
- Template engine으로 placeholder 치환
- **프로바이더별 로직 없음**

---

### 5. Tool List Generation
**File**: `src/core/prompts/system-prompt/registry/PromptBuilder.ts`

```typescript
public static async getToolsPrompts(variant: PromptVariant, context: SystemPromptContext) {
  // 1. Get tools for variant family
  let resolvedTools = ClineToolSet.getTools(variant.family)
  
  // 2. Filter by context requirements
  const enabledTools = resolvedTools.filter(
    (tool) => !tool.config.contextRequirements || tool.config.contextRequirements(context)
  )
  
  // 3. Generate tool prompts
  return Promise.all(enabledTools.map((tool) => 
    PromptBuilder.tool(tool.config, ids, context)
  ))
}
```

**Key Points**:
- 도구는 **variant.family**별로 로드
- contextRequirements로 필터링 (예: browser 지원 여부)
- **프로바이더별 도구 필터링 없음**

---

## Claude Code는 어떻게 다른가?

### Claude Code의 특별한 점

**File**: `src/integrations/claude-code/run.ts`

```typescript
export function runClaudeCode(options: {
  systemPrompt: string    // ← Cline이 생성한 시스템 프롬프트
  messages: Anthropic.Messages.MessageParam[]
  path?: string
  modelId: string
  thinkingBudgetTokens?: number
}) {
  const args = [
    "agent",
    `--disallowedTools=${disallowedTools}`,  // ← CLI에 직접 전달!
    // ...
  ]
  
  // Spawn Claude Code CLI
  const process = spawn(claudeCodePath, args, { ... })
}
```

**Key Differences**:
1. **Cline 시스템 프롬프트를 그대로 사용**
2. **도구는 CLI 인자로 제어** (`--disallowedTools`)
3. **CLI가 Anthropic API에 직접 요청**
4. **Task 도구는 CLI 내장** (시스템 프롬프트와 무관)

---

## 결론

### 1. 프로바이더별 특화 없음 ❌

Cline은 **프로바이더별 시스템 프롬프트 특화를 하지 않아요**:
- ✅ 모델 패밀리별 variant 있음 (GPT_5, NEXT_GEN, XS, GENERIC)
- ❌ 프로바이더별 variant 없음 (Anthropic, OpenRouter, Claude Code 구분 안함)
- ❌ 프로바이더별 도구 필터링 없음

### 2. 모든 프로바이더가 같은 프롬프트 사용 ✅

- **Anthropic**: GENERIC variant → 15개 Cline 도구
- **Claude Code**: GENERIC variant → 15개 Cline 도구 (동일!)
- **OpenRouter**: GENERIC variant → 15개 Cline 도구 (동일!)

### 3. Claude Code의 Task 도구는 별개 시스템 🔑

**Cline 도구 (시스템 프롬프트)**:
```
System Prompt에 설명 포함
→ 모델이 XML로 호출
→ Cline이 파싱 후 실행
```

**Claude Code 도구 (CLI 내장)**:
```
CLI가 --disallowedTools 인자로 제어
→ Anthropic API가 도구 목록 제공
→ 모델이 tool_use 블록으로 호출
→ CLI가 파싱 후 실행
```

**완전히 별개의 채널!**

---

## F12 구현 관련 시사점

### 왜 Task 도구가 시스템 프롬프트에 없는가?

**정답**: Claude Code의 Task 도구는 **CLI 내장 도구**이므로 Cline 시스템 프롬프트와 무관해요.

### 우리가 한 일

1. ✅ `run.ts`에서 Task 도구 활성화 (`--disallowedTools`에서 제거)
2. ✅ `claude-code.ts`에서 tool_use 블록 처리 구현
3. ✅ `stream.ts`에 ApiStreamToolUseChunk 타입 추가

**시스템 프롬프트 수정 불필요!** ✅

### 테스트 실패 원인 재분석

**가설 1**: 프롬프트가 모호함 (가장 가능성 높음)
- "subagent로 처리해줘"는 너무 추상적
- 모델이 Task 도구 사용 시점을 판단 못함

**가설 2**: CLI 인자 전달 문제
- `--disallowedTools`에 Task가 여전히 포함되어 있을 수도
- 디버깅 필요

**가설 3**: 모델 자체 판단
- 모델이 해당 작업에 Task 도구가 불필요하다고 판단
- 더 명확한 병렬 작업 시나리오 필요

---

## 프로바이더별 특화가 필요하다면?

### Option 1: Variant에 Provider 정보 추가

```typescript
// 새 variant 만들기
export const claudeCodeConfig: Omit<PromptVariant, "id"> = {
  family: ModelFamily.CLAUDE_CODE,  // 새 패밀리
  // ... 
}
```

**단점**: Cline upstream 수정 필요

### Option 2: Caret의 CaretPromptWrapper 활용 ✅

**현재 구조**:
```typescript
if (currentMode === "caret") {
  // Caret's custom prompt system
  return await CaretPromptWrapper.getCaretSystemPrompt(context)
}
```

**장점**: 
- Cline 코드 수정 없음
- Caret 모드에서 완전 제어 가능
- 프로바이더별 특화 구현 가능

---

**작성일**: 2025-10-16  
**작성자**: Alpha  
**관련 이슈**: F12 Claude Code Subagent Support
