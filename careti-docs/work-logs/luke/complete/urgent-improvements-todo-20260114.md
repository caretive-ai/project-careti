# 급한 개선 사항 TODO (2025-01-14)

**작업 원칙**: 각 미션에 대해 코드 분석 → 테스트 계획 → 수정 계획 → TDD로 개발
**개발 방법**: Careti TDD 원칙 준수 (Phase 0 RED → Phase 1 GREEN → Phase 2 REFACTOR)

---

## 📋 총괄

| 미션 | 우선순위 | 예상 시간 | 난이도 |
|------|----------|----------|--------|
| **M01**: 주요 모델 반영 | 🔴 HIGH | 2-3일 | 🟡 MEDIUM |
| **M02**: /init 컨텍스트 분리 | 🟡 MEDIUM | 1-2일 | 🟡 MEDIUM |
| **M03**: 이미지 툴 개선 | 🔴 HIGH | 2-3일 | 🚨 HIGH |
| **총 예상** | - | **5-8일** | - |

---

## 🎯 M01: GLM-4.7 모델 반영

### 📊 코드 분석

**관련 Cline 커밋**:
- `0b308d610` - feat(api): add GLM-4.7 model and update ZAi defaults
- `db50a1c67` - feat(cerebras): add zai-glm-4.7
- `1dac507b6` - feat: remove z-ai/glm-4.6 from free models list
- `7470d234e` - feat: add image support for Claude 3.5 Haiku
- `359e088eb` - feat: Gemini thinking + Katcoder support
- `d44184ab0` - feat: add Gemini 3 Flash Preview model support
- `f01428884` - feat: replace diff edit tools with APPLY_PATCH tool for gpt-5+
- `6d1bfc3a1` - feat(prompts): enable parallel tool usage for claude and gemini 3 models

**변경 파일**:
```bash
src/shared/api.ts                  # GLM-4.7, Claude 3.5 Haiku
src/core/api/providers/openai.ts  # null/empty choices 가드
src/core/prompts/system-prompt/components/mcp.ts  # 병렬 툴 사용
src/core/api/transform/openrouter-stream.ts  # Gemini thinking
```

**현재 상황**:
- Careti에는 glm-4.6까지만 반영됨
- ZAi default 모델: glm-4.5 → glm-4.7 변경 필요
- Cerebras에 zai-glm-4.7 추가 필요
- Claude 3.5 Haiku 이미지 지원 추가 필요
- Gemini 3 thinking/Katcoder 지원 추가 필요
- GPT-5 APPLY_PATCH 툴 추가 필요
- Claude/Gemini 3 병렬 툴 사용 추가 필요

**주요 변경사항 상세**:

#### 1. Claude 3.5 Haiku 이미지 지원 (7470d234e)
```diff
-	supportsImages: false,
+	supportsImages: true,
```
- 3개 위치에서 변경: `anthropicModels`, `claudeCodeModels`, `vertexModels`
- 사용자 이미지 처리 기능 확장

#### 2. Gemini thinking + Katcoder (359e088eb)
```typescript
// "gemini" → "gemini-3"으로 범위 좁혀짐
-	model.id.includes("gemini") && geminiThinkingLevel
+	model.id.includes("gemini-3") && geminiThinkingLevel
```
- Katcoder 추가: `kwaipilot/kat-coder-pro:free`
- OpenRouter/Vercel AI Gateway 2개 파일 변경

#### 3. Gemini 3 Flash Preview (d44184ab0)
- OpenRouter 추천 모델에 `gemini-3-flash-preview` 추가
- "What's New" 모달에 알림 추가

#### 4. GPT-5 APPLY_PATCH 툴 (f01428884)
- `FILE_NEW`, `FILE_EDIT` → `APPLY_PATCH`로 대체
- gpt-5+ 네이티브 툴에서만 적용
- `ApplyPatchHandler.ts` 수정, 스냅샷 업데이트

#### 5. Claude/Gemini 3 병렬 툴 사용 (6d1bfc3a1)
- 동시에 여러 독립적 툴 호출 허용
- MCP는 여전히 순차적 사용
- `hasEnabledMcpServers()` 유틸리티 추가

**코드 분석 필요**:
```bash
# 1. 현재 GLM 모델 설정 확인
git show 0b308d610:src/shared/api.ts | grep -A 20 "glm-4.7"

# 2. Cerebras GLM-4.7 추가 확인
git show db50a1c67:src/shared/api.ts | grep -A 10 "zai-glm-4.7"

# 3. Claude 3.5 Haiku 이미지 지원 확인
git show 7470d234e:src/shared/api.ts

# 4. Gemini thinking 지원 확인
git show 359e088eb

# 5. 병렬 툴 사용 확인
git show 6d1bfc3a1

# 6. Careti 계정 시스템 확인
grep -r "glm" careti-src/ --include="*.ts" | grep -i model
```

### 🧪 테스트 계획

**Phase 0: RED (테스트 작성)**

```typescript
// careti-src/__tests__/major-models-integration.test.ts (신규)
describe('Major Models Integration', () => {
  describe('GLM-4.7', () => {
    test('should have glm-4.7 in ZAi models', () => {
      const zAiModels = getZAiModels()
      expect(zAiModels).toContain('glm-4.7')
      expect(zAiModels).toContain('zai-glm-4.7')
    })

    test('should update ZAi default to glm-4.7', () => {
      const defaultModel = getZAiDefaultModel()
      expect(defaultModel).toBe('glm-4.7')
    })

    test('should have zai-glm-4.7 in Cerebras provider', () => {
      const cerebrasModels = getCerebrasModels()
      expect(cerebrasModels).toContain('zai-glm-4.7')
    })

    test('should remove z-ai/glm-4.6 from free models', () => {
      const freeModels = getFreeModels()
      expect(freeModels).not.toContain('z-ai/glm-4.6')
    })

    test('should support GLM-4.7 image analysis', () => {
      const modelInfo = getModelInfo('glm-4.7')
      expect(modelInfo.supportsImages).toBe(true)
    })
  })

  describe('Claude 3.5 Haiku', () => {
    test('should support images for Claude 3.5 Haiku', () => {
      const modelInfo = getModelInfo('claude-3-5-haiku-20241022')
      expect(modelInfo.supportsImages).toBe(true)
    })

    test('should have same config across all providers', () => {
      const anthropic = getModelInfo('claude-3-5-haiku-20241022', 'anthropic')
      const claudeCode = getModelInfo('claude-3-5-haiku-20241022', 'claude-code')
      const vertex = getModelInfo('claude-3-5-haiku@20241022', 'vertex')

      expect(anthropic.supportsImages).toBe(claudeCode.supportsImages)
      expect(claudeCode.supportsImages).toBe(vertex.supportsImages)
    })
  })

  describe('Gemini 3', () => {
    test('should have Gemini 3 Flash Preview in recommended models', () => {
      const recommended = getOpenRouterRecommendedModels()
      expect(recommended).toContain('gemini-3-flash-preview')
    })

    test('should support thinking for Gemini 3 models', () => {
      const modelInfo = getModelInfo('gemini-3-flash-thinking-exp-121')
      expect(modelInfo.thinkingConfig).toBeDefined()
    })

    test('should have Katcoder in free models', () => {
      const freeModels = getOpenRouterFreeModels()
      expect(freeModels).toContain('kwaipilot/kat-coder-pro:free')
    })

    test('should only apply thinking config to gemini-3 models', () => {
      // "gemini" 모델 아님, "gemini-3" 모델에만 적용
      const gemini2 = getModelInfo('gemini-2.0-flash-exp')
      const gemini3 = getModelInfo('gemini-3-flash-thinking-exp')

      expect(gemini2.thinkingConfig).toBeUndefined()
      expect(gemini3.thinkingConfig).toBeDefined()
    })
  })

  describe('GPT-5 APPLY_PATCH', () => {
    test('should have APPLY_PATCH tool for gpt-5+ models', () => {
      const tools = getNativeTools('openai-gpt-5-1')
      expect(tools).toContain('APPLY_PATCH')
      expect(tools).not.toContain('FILE_NEW')
      expect(tools).not.toContain('FILE_EDIT')
    })

    test('should keep FILE_NEW/FILE_EDIT for older models', () => {
      const tools = getNativeTools('gpt-4-turbo')
      expect(tools).toContain('FILE_NEW')
      expect(tools).toContain('FILE_EDIT')
    })
  })

  describe('Claude/Gemini 3 Parallel Tool Usage', () => {
    test('should allow parallel tool usage for Claude 4+', () => {
      const prompt = buildPrompt('claude-3-5-sonnet-20241022')
      expect(prompt).toContain('multiple tools can be used in parallel')
    })

    test('should allow parallel tool usage for Gemini 3', () => {
      const prompt = buildPrompt('gemini-3-flash-preview')
      expect(prompt).toContain('multiple tools can be used in parallel')
    })

    test('should use sequential tool usage for MCP operations', () => {
      const prompt = buildPromptWithMcp('claude-3-5-sonnet-20241022')
      expect(prompt).toContain('use one MCP operation at a time')
    })

    test('should detect enabled MCP servers correctly', () => {
      const context = { mcpHub: { getServers: () => ['server1', 'server2'] } }
      expect(hasEnabledMcpServers(context)).toBe(true)
    })

    test('should not include MCP instructions when no servers enabled', () => {
      const context = { mcpHub: { getServers: () => [] } }
      expect(hasEnabledMcpServers(context)).toBe(false)
    })
  })
})
```

**테스트 실행**:
```bash
npm test -- major-models-integration
```

### 🔧 수정 계획

**Phase 1: GREEN (최소 구현)**

#### 1.1: GLM-4.7 모델 반영
```bash
# 1. Cline GLM-4.7 변경사항 체리픽
git show 0b308d610 -- src/shared/api.ts > /tmp/glm-4.7-changes.patch
git show db50a1c67 -- src/shared/api.ts >> /tmp/glm-4.7-changes.patch

# 2. src/shared/api.ts 수정
# - glm-4.7 모델 정의 추가
# - ZAi default 모델 glm-4.7로 변경
# - Cerebras zai-glm-4.7 추가
```

#### 1.2: Claude 3.5 Haiku 이미지 지원
```bash
# 1. Cline 변경사항 체리픽
git show 7470d234e -- src/shared/api.ts > /tmp/claude-3.5-haiku.patch

# 2. src/shared/api.ts 수정
# - anthropicModels.claude-3-5-haiku-20241022.supportsImages: true
# - claudeCodeModels.claude-3-5-haiku-20241022.supportsImages: true
# - vertexModels.claude-3-5-haiku@20241022.supportsImages: true
```

#### 1.3: Gemini 3 thinking/Katcoder 지원
```bash
# 1. Cline 변경사항 체리픽
git show 359e088eb

# 2. src/core/api/transform/openrouter-stream.ts 수정
# - "gemini" → "gemini-3"으로 범위 좁혀짐

# 3. src/core/api/transform/vercel-ai-gateway-stream.ts 수정
# - 동일한 범위 좁혀짐

# 4. webview-ui/src/components/settings/OpenRouterModelPicker.tsx 수정
# - kwaipilot/kat-coder-pro:free 추가
```

#### 1.4: Gemini 3 Flash Preview
```bash
# 1. Cline 변경사항 체리픽
git show d44184ab0

# 2. webview-ui/src/components/settings/OpenRouterModelPicker.tsx 수정
# - gemini-3-flash-preview 추천 모델에 추가

# 3. webview-ui/src/components/common/WhatsNewModal.tsx 수정
# - 새로운 모델 알림 추가
```

#### 1.5: GPT-5 APPLY_PATCH 툴
```bash
# 1. Cline 변경사항 체리픽
git show f01428884

# 2. src/core/task/tools/handlers/ApplyPatchHandler.ts 수정
# - APPLY_PATCH 핸들러 개선

# 3. src/core/prompts/system-prompt/variants/native-gpt-5-1/config.ts 수정
# - FILE_NEW, FILE_EDIT → APPLY_PATCH로 대체
```

#### 1.6: Claude/Gemini 3 병렬 툴 사용
```bash
# 1. Cline 변경사항 체리픽
git show 6d1bfc3a1

# 2. src/core/prompts/system-prompt/components/mcp.ts 수정
# - hasEnabledMcpServers() 유틸리티 추가

# 3. src/core/prompts/system-prompt/types.ts 수정
# - SystemPromptContext에 MCP 관련 필드 추가

# 4. src/core/task/index.ts 수정
# - 병렬 툴 사용 플래그 전달
```

#### 1.7: null/empty choices 가드
```bash
# 1. Cline 변경사항 체리픽
git show 1bbc90487

# 2. 25개 프로바이더 파일 수정
# - chunk.choices → chunk.choices?.[0]로 옵셔널 체이닝 추가

# 영향 파일:
# src/core/api/providers/aihubmix.ts
# src/core/api/providers/deepseek.ts
# src/core/api/providers/doubao.ts
# src/core/api/providers/fireworks.ts
# src/core/api/providers/groq.ts
# src/core/api/providers/hicap.ts
# src/core/api/providers/huawei-cloud-maas.ts
# src/core/api/providers/huggingface.ts
# src/core/api/providers/litellm.ts
# src/core/api/providers/lmstudio.ts
# src/core/api/providers/moonshot.ts
# src/core/api/providers/nebius.ts
# src/core/api/providers/nousresearch.ts
# src/core/api/providers/oca.ts
# src/core/api/providers/openai-native.ts
# src/core/api/providers/openai.ts
# src/core/api/providers/openrouter.ts
# src/core/api/providers/qwen.ts
# src/core/api/providers/requesty.ts
# src/core/api/providers/sambanova.ts
# src/core/api/providers/together.ts
# src/core/api/providers/vercel-ai-gateway.ts
# src/core/api/providers/xai.ts
# src/core/api/providers/zai.ts
```

**Phase 2: REFACTOR (개선)**

#### 2.1: API 설정 관리 리팩터링 (a9365e30e)
```bash
# 1. Cline 변경사항 체리픽 (대규모: 1,071 라인 추가, 1,857 라인 삭제)
git show a9365e30e

# 2. src/shared/storage/state-keys.ts 수정
# - Secrets 중앙화
# - GlobalStateAndSettingKeys 추출

# 3. src/core/storage/StateManager.ts 수정
# - ApiConfiguration 관리 단순화
# - setApiConfiguration 자동화

# 4. src/core/controller/models/updateApiConfiguration.ts 수정
# - categorizeApiConfigurationKeys 유틸리티 사용

# 5. src/shared/api.ts 수정
# - ApiHandlerOptions와 ApiHandlerSettings 병합
# - Remote config fields 그룹화
```

#### 2.2: 모델 정보 업데이트
- GLM-4.7 상세 정보 추가 (context window, pricing 등)
- Claude 3.5 Haiku 이미지 지원 명시
- Gemini 3 thinking capability 추가
- Katcoder 모델 정보 추가

#### 2.3: Careti 계정 시스템 통합
```typescript
// careti-src/services/account/CaretAccountService.ts
// GLM-4.7, Claude 3.5 Haiku, Gemini 3 Flash Preview, Katcoder 지원
```

#### 2.4: 다국어 지원
- 한국어, 일본어 번역 추가
- 새로운 모델 설명 번역

### 📝 체크리스트

**Phase 0: RED**
- [ ] 테스트 파일 생성: `careti-src/__tests__/major-models-integration.test.ts`
- [ ] 20개 테스트 케이스 작성
- [ ] 테스트 실행 (모두 실패 예상)

**Phase 1: GREEN**
- [ ] GLM-4.7 모델 추가 (glm-4.7, zai-glm-4.7)
- [ ] ZAi default 모델 glm-4.7로 변경
- [ ] Claude 3.5 Haiku 이미지 지원 (supportsImages: true)
- [ ] Gemini 3 thinking 지원 ("gemini" → "gemini-3")
- [ ] Gemini 3 Flash Preview 추가
- [ ] Katcoder 모델 추가 (kwaipilot/kat-coder-pro:free)
- [ ] GPT-5 APPLY_PATCH 툴 추가 (FILE_NEW/EDIT → APPLY_PATCH)
- [ ] Claude/Gemini 3 병렬 툴 사용 허용
- [ ] null/empty choices 가드 (25개 프로바이더)
- [ ] API 설정 관리 리팩터링 (state-keys.ts)
- [ ] Careti 계정 시스템에 모델 추가
- [ ] 테스트 실행 (모두 통과)

**Phase 2: REFACTOR**
- [ ] API 설정 관리 단순화
- [ ] 모델 정보 상세 업데이트
- [ ] 다국어 지원 추가
- [ ] 코드 리팩토링
- [ ] 최종 테스트 통과

---

## 🔧 M02: /init 컨텍스트 분리

### 📊 코드 분석

**문제 상황**:
```typescript
// /init 명령 실행 시 사용자와 듀얼로 컨텍스트를 생성
// 하지만 .agents/context/careti-rules.json이나 yaml 같은 파일을 AI가 읽는 문제 발생
```

**현재 구조**:
```
.agents/
├── context/
│   ├── careti-rules.json        # AI 시스템 규칙 (시스템용)
│   ├── ai-work-index.yaml      # AI 워크플로우 인덱스 (시스템용)
│   └── workflows/             # AI 워크플로우 (시스템용)
```

**목표 구조**:
```
.agents/
├── context/                   # AI 시스템 전용 컨텍스트
│   ├── careti-rules.json
│   ├── ai-work-index.yaml
│   └── workflows/
└── context-for-user/          # 사용자 전용 컨텍스트
    ├── project-context.json   # 프로젝트 컨텍스트
    ├── tech-stack.json        # 기술 스택
    └── development-goals.json # 개발 목표
```

**코드 분석 필요**:
```bash
# 1. init 명령 구현 확인
grep -r "/init\|init.*command" src/ --include="*.ts" | grep -v test

# 2. 컨텍스트 로딩 로직 확인
grep -r "agents.*context" src/ --include="*.ts" | grep -v test

# 3. 현재 careti-rules.json 사용처 확인
grep -r "careti-rules\.json\|careti-rules\.yaml" src/ --include="*.ts"
```

### 🧪 테스트 계획

**Phase 0: RED (테스트 작성)**

```typescript
// careti-src/__tests__/init-context-separation.test.ts (신규)
describe('/init Context Separation', () => {
  test('should load system context from .agents/context/', () => {
    const systemContext = loadSystemContext()
    expect(systemContext).toHaveProperty('project_identity')
    expect(systemContext).toHaveProperty('merge_strategy')
  })

  test('should load user context from .agents/context-for-user/', () => {
    const userContext = loadUserContext()
    expect(userContext).toHaveProperty('project-context')
    expect(userContext).toHaveProperty('tech-stack')
  })

  test('should not include system rules in user context', () => {
    const userContext = loadUserContext()
    expect(userContext).not.toHaveProperty('merge_strategy')
    expect(userContext).not.toHaveProperty('architecture_rules')
  })

  test('should create user context on /init command', async () => {
    await executeInitCommand()

    expect(fs.existsSync('.agents/context-for-user/project-context.json')).toBe(true)
    expect(fs.existsSync('.agents/context-for-user/tech-stack.json')).toBe(true)
  })

  test('should separate system and user context in AI prompt', () => {
    const prompt = buildAIPrompt()
    expect(prompt).toContain('System Context:')
    expect(prompt).toContain('User Context:')
    expect(prompt).not.toMatch(/System Context:.*merge_strategy/)
  })
})
```

### 🔧 수정 계획

**Phase 1: GREEN (최소 구현)**

**Step 1.1**: 컨텍스트 분리 구조 생성
```bash
# 1. .agents/context-for-user/ 디렉토리 생성
mkdir -p .agents/context-for-user

# 2. 사용자 컨텍스트 템플릿 생성
cat > .agents/context-for-user/project-context.json.template << 'EOF'
{
  "project_name": "",
  "description": "",
  "tech_stack": {
    "frontend": [],
    "backend": [],
    "database": [],
    "other": []
  },
  "key_features": [],
  "development_goals": []
}
EOF
```

**Step 1.2**: 컨텍스트 로딩 함수 분리
```typescript
// src/core/context/context-separator.ts (신규)
export class ContextSeparator {
  /**
   * 시스템 컨텍스트 로드 (.agents/context/)
   */
  static loadSystemContext(): SystemContext {
    const rulesPath = '.agents/context/careti-rules.json'
    const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'))
    return rules
  }

  /**
   * 사용자 컨텍스트 로드 (.agents/context-for-user/)
   */
  static loadUserContext(): UserContext {
    const contextPath = '.agents/context-for-user/project-context.json'
    if (!fs.existsSync(contextPath)) {
      return { project_name: '', description: '', tech_stack: {} }
    }
    const context = JSON.parse(fs.readFileSync(contextPath, 'utf-8'))
    return context
  }
}
```

**Step 1.3**: /init 명령 수정
```typescript
// src/core/controller/task/init.ts (수정)
export async function executeInitCommand(task: Task) {
  // 1. 시스템 컨텍스트는 그대로 유지
  const systemContext = ContextSeparator.loadSystemContext()

  // 2. 사용자 컨텍스트 생성
  const userContext = await promptUserForContext()

  // 3. .agents/context-for-user/에 저장
  fs.writeFileSync(
    '.agents/context-for-user/project-context.json',
    JSON.stringify(userContext, null, 2)
  )

  // 4. AI 프롬프트에 별도 섹션으로 추가
  const aiPrompt = buildAIPromptWithSeparatedContexts(
    systemContext,
    userContext
  )
}
```

**Phase 2: REFACTOR (개선)**

**개선 사항**:
- 사용자 컨텍스트 템플릿 다양화
- 컨텍스트 유효성 검증 추가
- 자동 완성 기능 (기술 스택 감지)

### 📝 체크리스트

**Phase 0: RED**
- [ ] 테스트 파일 생성: `careti-src/__tests__/init-context-separation.test.ts`
- [ ] 5개 테스트 케이스 작성
- [ ] 테스트 실행 (모두 실패 예상)

**Phase 1: GREEN**
- [ ] .agents/context-for-user/ 디렉토리 생성
- [ ] 사용자 컨텍스트 템플릿 생성
- [ ] ContextSeparator 클래스 구현
- [ ] /init 명령 수정 (컨텍스트 분리)
- [ ] AI 프롬프트 빌더 수정 (분리된 컨텍스트 사용)
- [ ] 테스트 실행 (모두 통과)

**Phase 2: REFACTOR**
- [ ] 컨텍스트 유효성 검증 추가
- [ ] 템플릿 다양화
- [ ] 자동 완성 기능 구현
- [ ] 코드 리팩토링
- [ ] 최종 테스트 통과

---

## 🖼️ M03: 이미지 툴 개선

### 📊 코드 분석

**현재 구현**:
```typescript
// careti-src/core/task/tools/handlers/GenerateImageToolHandler.ts
// 이미지 생성 및 최적화 기능 구현됨
```

**WebP 변환 로직**:
```bash
# 이미 확인된 WebP 관련 코드
careti-src/utils/image-optimization.ts  # 최적화 유틸리티
src/integrations/misc/process-files.ts    # MIME 타입 처리
```

**문제 상황**:
1. 큰 이미지를 첨부할 때 자동으로 WebP로 변환하는지 불확실
2. "계속 넘치는 것 같음" - 최적화 미동작 가능성
3. AI가 이미지 path를 기반으로 직접 이미지를 읽을 수 있는지 불확실
4. 이미지를 읽을 수 있는 모델의 경우 이미지 내용을 판단할 수 있는지 불확실

**코드 분석 필요**:
```bash
# 1. 이미지 최적화 로직 확인
cat careti-src/utils/image-optimization.ts

# 2. 이미지 파일 직접 읽기 로직 확인
grep -r "readImage\|getImageContent" careti-src/ --include="*.ts"

# 3. 이미지 툴 스펙 확인
cat careti-src/core/prompts/system-prompt/tools/generate_image.ts

# 4. 이미지 처리 프로세스 확인
grep -A 20 "optimizeImageDataUrl" careti-src/utils/image-optimization.ts
```

### 🧪 테스트 계획

**Phase 0: RED (테스트 작성)**

```typescript
// careti-src/__tests__/image-tool-optimization.test.ts (신규)
describe('Image Tool Optimization', () => {
  test('should auto-convert large images to WebP', async () => {
    const largeImage = createLargeImage(4096, 4096) // >10MB
    const optimized = await optimizeImage(largeImage)

    expect(optimized.mimeType).toBe('image/webp')
    expect(optimized.size).toBeLessThan(2 * 1024 * 1024) // <2MB
  })

  test('should read image file directly from path', async () => {
    const imagePath = createTestImageFile('test.png')
    const imageContent = await readImageFromPath(imagePath)

    expect(imageContent).toHaveProperty('data')
    expect(imageContent).toHaveProperty('mimeType')
    expect(imageContent).toHaveProperty('dimensions')
  })

  test('should analyze image content with vision model', async () => {
    const image = createTestImageFile('test.png')
    const analysis = await analyzeImageWithVisionModel(image, 'gpt-4-vision-preview')

    expect(analysis).toHaveProperty('description')
    expect(analysis).toHaveProperty('objects')
    expect(analysis).toHaveProperty('colors')
  })

  test('should not overflow context with large images', async () => {
    const images = Array(10).fill(null).map(() => createLargeImage(2048, 2048))
    const totalTokens = await calculateImageTokens(images)

    expect(totalTokens).toBeLessThan(100000) // 적절한 제한
  })

  test('should apply WebP conversion for vision models', async () => {
    const image = createTestImageFile('test.jpg', 3000, 3000)
    const optimized = await optimizeForVisionModel(image, 'gpt-4-vision-preview')

    expect(optimized.mimeType).toBe('image/webp')
    expect(optimized.dimensions.width).toBeLessThanOrEqual(2048)
  })
})
```

### 🔧 수정 계획

**Phase 1: GREEN (최소 구현)**

**Step 1.1**: 이미지 최적화 로직 확인 및 수정
```typescript
// careti-src/utils/image-optimization.ts (수정)
export const optimizeImageDataUrl = async (
  dataUrl: string,
  options?: {
    maxSize?: number        // 최대 크기 (bytes)
    targetFormat?: 'webp' | 'jpeg' | 'png'
    maxDimension?: number    // 최대 가로/세로 (px)
  }
): Promise<string> => {
  // 1. WebP 변환 확인 및 수정
  // 2. 크기 제한 확인 및 수정
  // 3. 리사이즈 로직 확인 및 수정
}
```

**Step 1.2**: 이미지 파일 직접 읽기 기능 구현
```typescript
// careti-src/core/task/tools/utils/image-reader.ts (신규)
export class ImageReader {
  /**
   * 이미지 파일을 직접 읽고 분석
   */
  static async readAndAnalyze(
    imagePath: string,
    modelSupportsVision: boolean
  ): Promise<ImageAnalysis> {
    // 1. 파일 읽기
    const buffer = await fs.readFile(imagePath)

    // 2. 이미지 파싱 (sharp 또는 canvas)
    const metadata = await getImageMetadata(buffer)

    // 3. WebP 변환 (필요 시)
    const optimized = await optimizeImage(buffer)

    // 4. 비전 모델로 분석 (지원 시)
    if (modelSupportsVision) {
      return await analyzeWithVisionModel(optimized, metadata)
    }

    return metadata
  }
}
```

**Step 1.3**: 이미지 툴 핸들러 수정
```typescript
// careti-src/core/task/tools/handlers/GenerateImageToolHandler.ts (수정)
export class GenerateImageToolHandler {
  async execute(tool: ToolUse, config: TaskConfig): Promise<ToolResponse> {
    // 1. 참조 이미지 파싱
    const referenceImages = this.parseReferenceImages(tool)

    // 2. 각 이미지에 대해:
    for (const image of referenceImages) {
      if (image.type === 'file_path') {
        // 2.1 파일 직접 읽기
        const analyzed = await ImageReader.readAndAnalyze(
          image.path,
          config.modelSupportsVision
        )

        // 2.2 비전 모델 분석 결과 포함
        tool.imageAnalysis = analyzed
      } else if (image.type === 'data_url') {
        // 2.3 데이터 URL 최적화 (WebP 변환)
        const optimized = await optimizeImageDataUrl(image.url)
        image.url = optimized
      }
    }

    // 3. 이미지 생성 API 호출
    return await this.generateImage(tool, config)
  }
}
```

**Phase 2: REFACTOR (개선)**

**개선 사항**:
- 이미지 최적화 품질 조절
- 다양한 포맷 지원 (AVIF 등)
- 캐싱 기능 추가
- 병렬 처리 최적화

### 📝 체크리스트

**Phase 0: RED**
- [ ] 테스트 파일 생성: `careti-src/__tests__/image-tool-optimization.test.ts`
- [ ] 5개 테스트 케이스 작성
- [ ] 테스트 실행 (모두 실패 예상)

**Phase 1: GREEN**
- [ ] 이미지 최적화 로직 검토 및 수정 (WebP 변환)
- [ ] ImageReader 클래스 구현 (파일 직접 읽기)
- [ ] 비전 모델 분석 기능 구현
- [ ] GenerateImageToolHandler 수정
- [ ] 테스트 실행 (모두 통과)

**Phase 2: REFACTOR**
- [ ] 이미지 최적화 품질 조절
- [ ] 다양한 포맷 지원 추가
- [ ] 캐싱 기능 구현
- [ ] 병렬 처리 최적화
- [ ] 코드 리팩토링
- [ ] 최종 테스트 통과

---

## 🔄 전체 실행 순서

### Week 1 (Day 1-2): M01 - GLM-4.7 모델 반영
- Day 1: 코드 분석 + Phase 0 (RED)
- Day 2: Phase 1 (GREEN) + Phase 2 (REFACTOR)

### Week 1 (Day 3-4): M02 - /init 컨텍스트 분리
- Day 3: 코드 분석 + Phase 0 (RED)
- Day 4: Phase 1 (GREEN) + Phase 2 (REFACTOR)

### Week 2 (Day 5-7): M03 - 이미지 툴 개선
- Day 5: 코드 분석 + Phase 0 (RED)
- Day 6: Phase 1 (GREEN)
- Day 7: Phase 2 (REFACTOR)

### Week 2 (Day 8-10): 통합 테스트 및 배포
- Day 8-9: 전체 통합 테스트
- Day 10: 버그 수정 및 배포

---

## ✅ 완료 기준

### 공통 기준
- [ ] 각 미션 TDD 원칙 준수 (RED→GREEN→REFACTOR)
- [ ] 단위 테스트 100% 통과
- [ ] 통합 테스트 통과
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트 완료

### M01 특정 기준
- [ ] GLM-4.7 모델 추가 완료
- [ ] ZAi default 모델 glm-4.7로 변경
- [ ] Cerebras zai-glm-4.7 추가
- [ ] Claude 3.5 Haiku 이미지 지원 완료
- [ ] Gemini 3 thinking/Katcoder 지원 완료
- [ ] Gemini 3 Flash Preview 추가 완료
- [ ] GPT-5 APPLY_PATCH 툴 추가 완료
- [ ] Claude/Gemini 3 병렬 툴 사용 완료
- [ ] null/empty choices 가드 완료
- [ ] API 설정 관리 리팩터링 완료
- [ ] Careti 계정 시스템 반영
- [ ] 다국어 지원 완료

### M02 특정 기준
- [ ] .agents/context-for-user/ 구조 완성
- [ ] 컨텍스트 분리 로직 동작
- [ ] /init 명령 동작
- [ ] AI 프롬프트에 분리된 컨텍스트 반영
- [ ] 유효성 검증 완료

### M03 특정 기준
- [ ] WebP 자동 변환 동작
- [ ] 이미지 파일 직접 읽기 동작
- [ ] 비전 모델 분석 동작
- [ ] 컨텍스트 넘침 방지
- [ ] 성능 최적화 완료

---

## 📚 참고 문서

| 문서 | 경로 |
|------|------|
| **Careti 개발 원칙** | `.agents/context/careti-rules.json` |
| **TDD 가이드** | `careti-docs/merging/tdd-testing-requirements.md` |
| **이미지 플로우** | `careti-docs/features/f14-image_flow.md` |
| **머징 가이드** | `careti-docs/merging/merge-standard-guide.md` |

---

**작성자**: Luke (with Claude Code)
**마지막 업데이트**: 2025-01-14
**문서 유형**: 급한 개선 사항 TODO
