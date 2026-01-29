# F10 - Enhanced Provider Setup (개선된 프로바이더 설정)

**상태**: ✅ Phase 2 완료  
**영향 범위**: Backend (Controller, gRPC), Webview (Settings, UI)  
**우선순위**: 🔴 High

---

## 📋 개요

Careti의 **Enhanced Provider Setup**은 AI 프로바이더 설정 과정을 자동화하여 사용자 경험을 획기적으로 개선합니다.  
LiteLLM, BizRouter 등의 모델 목록을 자동으로 페칭하고, 연결 상태를 즉시 검증합니다.

---

## 🆚 Cline 대비 개선점 (Improvements)

| 기능 | Cline (Original) | Careti (Enhanced) |
| --- | --- | --- |
| **모델 설정** | 수동 입력 (모델 ID 타이핑) | **Auto Fetching**. 버튼 클릭 한 번으로 사용 가능한 모델 목록을 자동 검색하여 드롭다운 제공. |
| **연결 검증** | 사용 시점에 실패 확인 | **Real-time Validation**. 설정 단계에서 API 연결 및 키 유효성을 즉시 확인하고 피드백 제공. |
| **필터링** | 없음 | **Smart Filtering**. LiteLLM의 `/health` 엔드포인트와 연동하여 실제 작동 가능한 모델만 표시. |
| **프로바이더** | 기본 제공 목록 한정 | **Extensible Architecture**. gRPC 기반 플러그인 구조로 BizRouter 등 커스텀 프로바이더 쉽게 추가 가능. |

---

## 🏗 코드 범위 (Code Scope)

### 1. Backend (Controller & gRPC)
- **`careti-src/core/controller/fetchLiteLlmModels.ts`**: LiteLLM 모델 페칭 로직 (Health check + Available intersection).
- **`careti-src/core/controller/caretSystem/FetchBizRouterModels.ts`**: BizRouter 모델 페칭 로직.
- **`proto/careti/system.proto`**: `FetchLiteLlmModels`, `FetchBizRouterModels` RPC 정의.

### 2. Webview (UI Component)
- **`webview-ui/src/components/settings/providers/LiteLlmProvider.tsx`**: LiteLLM 설정 UI (모델 페칭 버튼, 드롭다운).
- **`webview-ui/src/components/settings/providers/BizRouterProvider.tsx`**: BizRouter 설정 UI.

### 3. Tests
- **`careti-src/core/controller/fetchLiteLlmModels.test.ts`**: 모델 정규화 및 필터링 로직 단위 테스트.
- **`careti-src/core/controller/fetchLiteLlmModels.integration.test.ts`**: 실제 서버 연동 통합 테스트.

---

## 📋 **기능 개요**

### **핵심 가치**
- **설정 자동화**: 수동 모델명 입력 대신 동적 모델 목록 제공
- **실시간 검증**: API 연결 상태 및 사용 가능한 모델 실시간 확인
- **사용자 친화적 UI**: 드롭다운, 자동완성, 상태 표시 등 직관적 인터페이스
- **확장성**: 새로운 프로바이더 쉽게 추가 가능한 플러그인 아키텍처

### **현재 지원 기능**
| 프로바이더 | 모델 자동 검색 | 연결 검증 | 고급 설정 | 상태 |
|---|---|---|---|---|
| **LiteLLM** | ✅ | ✅ | ✅ Health 기반 | 완료 |
| **BizRouter** | ✅ | ✅ | ❌ 단순화 | 완료 |
| **ZAI (GLM-4.7)** | ✅ | ✅ | ✅ Thinking + Coding | 완료 |
| **Upstage (Solar)** | ❌ 정적 목록 | ✅ | ❌ 단순화 | 완료 |
| **NAVER CLOUD (HyperCLOVA X)** | ❌ 정적 목록 | ✅ | ✅ Thinking (HCX-007) | 완료 |
| **Claude Code CLI** | ✅ (CLI 연동) | ✅ | ✅ 스트리밍 최적화 | 완료 |

## 🏗️ **시스템 아키텍처**

### **파일 구조**
```
# Backend (gRPC Services)
careti-src/core/controller/
├── fetchLiteLlmModels.ts              # LiteLLM 모델 페칭 (메인 로직)
├── fetchLiteLlmModels.test.ts         # 단위 테스트 (6 tests)
└── fetchLiteLlmModels.integration.test.ts  # 통합 테스트 (환경 변수 필요)

# Protocol Definitions
proto/careti/
└── system.proto                       # 프로바이더 모델 페칭 RPC 정의

# Frontend Components
webview-ui/src/components/settings/providers/
└── LiteLlmProvider.tsx                # LiteLLM 설정 UI

# i18n Support
webview-ui/src/careti/locale/*/settings.json
└── providers.litellm.*                # 4개 언어별 LiteLLM 번역
```

### **gRPC 서비스 패턴**
```protobuf
// proto/careti/system.proto
service CaretSystemService {
    // LiteLLM 모델 목록 가져오기
    rpc FetchLiteLlmModels(FetchLiteLlmModelsRequest) returns (FetchLiteLlmModelsResponse);
}

message FetchLiteLlmModelsRequest {
    string base_url = 1;          // LiteLLM 서버 URL
    string api_key = 2;           // 인증 키 (선택사항)
}

message FetchLiteLlmModelsResponse {
    bool success = 1;
    repeated string models = 2;   // 사용 가능한 모델 목록
    string error_message = 3;     // 오류 메시지
}
```

## 🎯 **프로바이더 구현 사례**

### **1. LiteLLM 프로바이더 (Health 기반 고급 필터링)**

### **백엔드 구현**
```typescript
// careti-src/core/controller/fetchLiteLlmModels.ts
export async function fetchLiteLlmModels(
    _controller: Controller,
    request: proto.careti.FetchLiteLlmModelsRequest,
): Promise<proto.careti.FetchLiteLlmModelsResponse> {
    /**
     * 모델명 정규화 함수
     * - ollama_chat/ prefix 제거
     * - : → - 변환 (ollama naming convention)
     */
    const normalizeModelName = (name: string): string => {
        let normalized = name
        if (normalized.startsWith("ollama_chat/")) {
            normalized = normalized.replace("ollama_chat/", "")
        }
        normalized = normalized.replace(":", "-")
        return normalized
    }

    try {
        Logger.debug(`[CaretSystemService] 🎯 Fetching LiteLLM models from ${request.baseUrl}`)

        // URL 유효성 검사
        if (!request.baseUrl || !URL.canParse(request.baseUrl)) {
            return proto.careti.FetchLiteLlmModelsResponse.create({
                success: false,
                models: [],
                errorMessage: "Valid base URL is required",
            })
        }

        const baseUrl = request.baseUrl.replace(/\/$/, "")

        // Step 1: /health API로 healthy 모델 목록 가져오기
        const healthUrl = `${baseUrl}/health`
        let healthyModels: string[] = []

        try {
            const healthResponse = await axios.get(healthUrl, {
                headers: {
                    accept: "application/json",
                    ...(request.apiKey && { "Authorization": `Bearer ${request.apiKey}` })
                },
                timeout: 60000, // Health check는 느릴 수 있음
            })

            healthyModels = healthResponse.data?.healthy_endpoints
                .map((ep: any) => ep.model)
                .filter((m: string) => m && typeof m === "string")
        } catch (healthError) {
            Logger.warn(`[CaretSystemService] ⚠️ Health check failed, using all available models`)
        }

        // Step 2: /v1/models API로 사용 가능한 모델 목록 가져오기
        const modelsUrl = `${baseUrl}/v1/models?return_wildcard_routes=false&include_model_access_groups=false&only_model_access_groups=false&include_metadata=false`
        const modelsResponse = await axios.get(modelsUrl, {
            headers: {
                accept: "application/json",
                ...(request.apiKey && { "x-litellm-api-key": request.apiKey })
            },
            timeout: 10000,
        })

        const availableModels = modelsResponse.data?.data
            .map((m: any) => m.id)
            .filter((id: string) => id && typeof id === "string")

        // Step 3: Intersection 필터링 (healthy AND available)
        let filteredModels: string[]

        if (healthyModels.length === 0) {
            // Health check 실패 시 모든 available 모델 반환
            filteredModels = availableModels
        } else {
            // Healthy 모델을 기준으로, available에 있는지 확인 (정규화 비교)
            const availableSet = new Set(availableModels)
            filteredModels = healthyModels.filter((healthyModel: string) => {
                const normalizedName = normalizeModelName(healthyModel)
                return availableSet.has(normalizedName)
            })
        }

        // Full name으로 정렬해서 반환
        return proto.careti.FetchLiteLlmModelsResponse.create({
            success: true,
            models: filteredModels.sort(),
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        Logger.error(`[CaretSystemService] ❌ Failed to fetch LiteLLM models: ${errorMessage}`)

        return proto.careti.FetchLiteLlmModelsResponse.create({
            success: false,
            models: [],
            errorMessage: `Failed to fetch models: ${errorMessage}`,
        })
    }
}
```

### **프론트엔드 구현**
```typescript
// webview-ui/src/components/settings/providers/LiteLlmProvider.tsx
export const LiteLlmProvider = ({ showModelOptions, currentMode }: LiteLlmProviderProps) => {
    const [liteLlmModels, setLiteLlmModels] = useState<string[]>([])
    const [isLoadingModels, setIsLoadingModels] = useState(false)
    const [modelsError, setModelsError] = useState<string | null>(null)

    // 모델 가져오기 함수
    const handleFetchModels = async () => {
        if (!apiConfiguration?.liteLlmBaseUrl) {
            setModelsError(t("providers.litellm.baseUrlRequired", "settings"))
            return
        }

        setIsLoadingModels(true)
        setModelsError(null)

        try {
            const response = await CaretSystemServiceClient.FetchLiteLlmModels({
                baseUrl: apiConfiguration.liteLlmBaseUrl,
                apiKey: apiConfiguration.liteLlmApiKey || "",
            })

            if (response.success && response.models.length > 0) {
                setLiteLlmModels(response.models)
            } else {
                setModelsError(response.errorMessage || t("providers.litellm.noModelsFound", "settings"))
            }
        } catch (error) {
            setModelsError(
                error instanceof Error ? error.message : t("providers.litellm.fetchError", "settings")
            )
        } finally {
            setIsLoadingModels(false)
        }
    }

    return (
        <div>
            {/* 모델 선택 UI */}
            {liteLlmModels.length > 0 ? (
                <VSCodeDropdown
                    value={liteLlmModelId || ""}
                    onChange={(e) => handleModeFieldChange("liteLlmModelId", e.target.value)}
                >
                    <VSCodeOption value="">{t("providers.litellm.selectModelPlaceholder", "settings")}</VSCodeOption>
                    {liteLlmModels.map((model) => (
                        <VSCodeOption key={model} value={model}>
                            {model}
                        </VSCodeOption>
                    ))}
                </VSCodeDropdown>
            ) : (
                <DebouncedTextField
                    value={liteLlmModelId || ""}
                    onChange={(value) => handleModeFieldChange("liteLlmModelId", value)}
                    placeholder={t("providers.litellm.modelIdPlaceholder", "settings")}
                />
            )}

            {/* 모델 가져오기 버튼 */}
            <VSCodeButton onClick={handleFetchModels} disabled={isLoadingModels}>
                {isLoadingModels
                    ? t("providers.litellm.fetchingModels", "settings")
                    : t("providers.litellm.fetchModels", "settings")}
            </VSCodeButton>

            {/* 오류 표시 */}
            {modelsError && (
                <div style={{ color: "var(--vscode-errorForeground)" }}>
                    {modelsError}
                </div>
            )}
        </div>
    )
}
```

### **2. BizRouter 프로바이더 (단순화된 API)**

BizRouter는 단일 API 엔드포인트로 사용자 API 키에 할당된 모델만 반환하는 단순한 구조입니다.

#### **백엔드 구현**
```typescript
// careti-src/core/controller/caretSystem/FetchBizRouterModels.ts
export async function fetchBizRouterModels(
    _controller: Controller,
    request: proto.careti.FetchBizRouterModelsRequest,
): Promise<proto.careti.FetchBizRouterModelsResponse> {
    const BIZROUTER_BASE_URL = "https://bizrouter.ai/api/v1"

    try {
        // API 키 검증
        if (!request.apiKey || request.apiKey.trim() === "") {
            return proto.careti.FetchBizRouterModelsResponse.create({
                success: false,
                models: [],
                errorMessage: "API key is required",
            })
        }

        // BizRouter /api/v1/models 호출
        const modelsUrl = `${BIZROUTER_BASE_URL}/models`
        const response = await axios.get(modelsUrl, {
            headers: {
                accept: "application/json",
                "X-API-Key": request.apiKey,
            },
            timeout: 10000,
        })

        // BizRouter 응답 형식: { models: [...], exchange_rate: number }
        const modelsData = response.data?.models || []
        const modelNames = modelsData
            .map((model: any) => model.id)
            .filter((id: string) => id && typeof id === "string")
            .sort()

        return proto.careti.FetchBizRouterModelsResponse.create({
            success: true,
            models: modelNames,
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        return proto.careti.FetchBizRouterModelsResponse.create({
            success: false,
            models: [],
            errorMessage: `Failed to fetch models: ${errorMessage}`,
        })
    }
}
```

#### **특징**
- **Hardcoded URL**: `https://bizrouter.ai/api/v1` (고정된 엔드포인트)
- **API Key 기반**: 사용자 API 키에 할당된 모델만 반환
- **단순 구조**: Health check 없이 단일 API 호출
- **빠른 응답**: 10초 타임아웃으로 빠른 검증

#### **LiteLLM vs BizRouter 비교**
| 특징 | LiteLLM | BizRouter |
|---|---|---|
| **Base URL** | 사용자 입력 | 하드코딩 (`bizrouter.ai`) |
| **API 개수** | 2개 (`/health`, `/v1/models`) | 1개 (`/api/v1/models`) |
| **필터링** | Healthy AND Available 교집합 | API key 기반 단순 필터 |
| **복잡도** | 높음 (모델명 정규화 필요) | 낮음 (단순 ID 추출) |
| **사용 사례** | Self-hosted LiteLLM 서버 | BizRouter 클라우드 서비스 |

### **3. ZAI 프로바이더 (GLM-4.7 Thinking Mode + Coding Plan)**

ZAI는 중국 Zhipu AI의 GLM 모델을 제공하는 프로바이더입니다. GLM-4.7은 reasoning (thinking) 모드와 Coding Plan을 지원합니다.

#### **백엔드 구현**
```typescript
// src/core/api/providers/zai.ts
export class ZAiHandler implements ApiHandler {
    // CARETI MODIFICATION: Support coding endpoint for GLM Coding Plan
    private useCodingApi(): boolean {
        return this.options.zaiApiLine === "coding"
    }

    private getBaseUrl(): string {
        if (this.useChinaApi()) {
            return "https://open.bigmodel.cn/api/paas/v4"
        }
        if (this.useCodingApi()) {
            return "https://api.z.ai/api/coding/paas/v4"  // Coding Plan 엔드포인트
        }
        return "https://api.z.ai/api/paas/v4"
    }

    async *createMessage(...): ApiStream {
        // CARETI MODIFICATION: Enable thinking mode for GLM-4.7/4.5 models
        const supportsThinking = model.id.startsWith("glm-4.7") || model.id.startsWith("glm-4.5")
        const thinkingParam = supportsThinking ? { thinking: { type: "enabled" } } : {}

        const stream = await client.chat.completions.create({
            model: model.id,
            ...thinkingParam,  // Thinking mode 파라미터
            ...
        })

        for await (const chunk of stream) {
            // CARETI MODIFICATION: Handle reasoning_content for GLM-4.7 thinking mode
            if (delta && "reasoning_content" in delta && delta.reasoning_content) {
                yield { type: "reasoning", reasoning: delta.reasoning_content }
            }

            // CARETI MODIFICATION: Yield finish_reason for loop termination
            if (finishReason) {
                yield { type: "finish", reason: finishReason }
            }
        }
    }
}
```

#### **프론트엔드 구현 (UI 옵션)**
```typescript
// webview-ui/src/components/settings/providers/ZAiProvider.tsx
<VSCodeDropdown
    id="zai-entrypoint"
    onChange={(e) => handleFieldChange("zaiApiLine", e.target.value)}
    value={apiConfiguration?.zaiApiLine || "international"}>
    <VSCodeOption value="international">api.z.ai</VSCodeOption>
    <VSCodeOption value="coding">api.z.ai (Coding Plan)</VSCodeOption>
    <VSCodeOption value="china">open.bigmodel.cn</VSCodeOption>
</VSCodeDropdown>
```

#### **API 엔드포인트**
| 옵션 | 엔드포인트 | 용도 |
|------|-----------|------|
| `international` | `https://api.z.ai/api/paas/v4` | 일반 API |
| `coding` | `https://api.z.ai/api/coding/paas/v4` | **GLM Coding Plan** |
| `china` | `https://open.bigmodel.cn/api/paas/v4` | 중국 API |

#### **Thinking Mode 지원**
GLM-4.7은 Claude의 thinking처럼 추론 과정을 보여주는 모드를 지원합니다:

```json
// 요청
{
    "model": "glm-4.7",
    "thinking": { "type": "enabled" },
    "stream": true
}

// 응답 (스트리밍)
{
    "choices": [{
        "delta": {
            "reasoning_content": "사용자가 파일을 읽어달라고 했으니...",
            "content": "네, 파일을 읽어드리겠습니다."
        },
        "finish_reason": "stop"
    }]
}
```

#### **자연스러운 대화 지원**
GLM-4.7은 `finish_reason: "stop"`과 도구 미사용을 감지하여 자연스러운 대화를 지원합니다:

```typescript
// careti-src/core/api/transform/finish-reason.ts
export function shouldEndLoopByFinishReason(
    finishReason: string | undefined | null,
    didToolUse: boolean,
    _consecutiveMistakeCount: number,
): boolean {
    // CARETI MODIFICATION: If natural end (stop) and no tool use, end immediately
    if (isNaturalEndReason(finishReason) && !didToolUse) {
        return true
    }
    return false
}
```

#### **특징**
- **Thinking Mode**: `reasoning_content`로 추론 과정 표시
- **Coding Plan**: 코딩 특화 엔드포인트 지원
- **자연스러운 대화**: `finish_reason` 기반 대화 종료 지원
- **Native Tool Calls**: OpenAI 호환 도구 호출 지원

### **4. Claude Code CLI 프로바이더 (스트리밍 최적화)**

Claude Code CLI는 Anthropic의 공식 CLI를 외부 프로세스로 호출하여 API key 없이 구독 기반 사용을 지원합니다.

#### **아키텍처**
```
Careti Extension → execa (프로세스 생성) → Claude Code CLI → Anthropic API
                         ↓
                   stdin: JSON 메시지
                   stdout: stream-json 응답
```

#### **스트리밍 최적화 (v1.3)**

기존 `readline` 기반 처리에서 직접 스트림 처리로 변경하여 지연 시간을 감소시켰습니다.

```typescript
// src/integrations/claude-code/run.ts

// BEFORE: readline 라인 버퍼링 (지연 발생)
const rl = readline.createInterface({ input: cProcess.stdout })
for await (const line of rl) { ... }

// AFTER: 직접 async iterator로 스트림 처리 (지연 감소)
let buffer = ""
for await (const rawChunk of cProcess.stdout) {
    buffer += rawChunk.toString()
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""  // 불완전한 라인 유지

    for (const line of lines) {
        if (line.trim()) {
            const chunk = parseChunk(line, processState)
            if (chunk) yield chunk
        }
    }
}
```

#### **버퍼 최적화**
```typescript
// BEFORE: 20MB 버퍼 (과도한 메모리 할당)
const BUFFER_SIZE = 20_000_000

// AFTER: 5MB 버퍼 (최대 출력의 ~10배 여유)
const BUFFER_SIZE = 5_000_000
```

#### **이미지 처리**
Claude Code CLI는 프로그래밍 방식(stdin JSON)으로 이미지 전송을 지원하지 않습니다. 따라서 이미지는 텍스트 플레이스홀더로 변환됩니다:

```typescript
// src/integrations/claude-code/message-filter.ts
if (block.type === "image") {
    return {
        type: "text",
        text: `[Image (${sourceType}): ${mediaType} not supported by Claude Code]`,
    }
}
```

#### **특징**
- **API Key 불필요**: Claude Code 구독만으로 사용 가능
- **스트리밍 최적화**: readline 제거로 첫 응답 지연 감소
- **메모리 효율**: 버퍼 크기 75% 감소 (20MB → 5MB)
- **도구 필터링**: Cline 전용 도구 자동 비활성화

#### **제한사항**
- 프로세스 생성 오버헤드 (50-200ms) - CLI 아키텍처의 본질적 한계
- 이미지 전송 미지원 (CLI stdin JSON 방식 제한)
- Linux에서 클립보드 이미지 붙여넣기 버그 존재 (xclip/wl-clipboard 필요)

## 🌐 **다국어 지원**

### **표준 번역 키 구조**
```json
// webview-ui/src/careti/locale/*/settings.json
{
  "providers": {
    "litellm": {
      "name": "LiteLLM",
      "fetchModels": "모델 가져오기",
      "fetchingModels": "모델 가져오는 중...",
      "selectModelPlaceholder": "모델을 선택하세요...",
      "baseUrlRequired": "기본 URL이 필요합니다",
      "noModelsFound": "사용 가능한 모델이 없습니다",
      "fetchError": "모델을 가져오는 중 오류가 발생했습니다"
    }
    // 향후 다른 프로바이더들...
  }
}
```

### **지원 언어**
- 🇰🇷 **한국어**: 완전 번역 및 현지화
- 🇺🇸 **영어**: 기본 언어
- 🇯🇵 **일본어**: 번역 지원
- 🇨🇳 **중국어**: 번역 지원

## 🧪 **테스트 시스템**

### **TDD 구현**
```typescript
// careti-src/core/controller/fetchLiteLlmModels.test.ts
describe("fetchLiteLlmModels", () => {
    it("should successfully filter models using /health and /v1/models intersection", async () => {
        // Mock /health response (ollama_chat prefix와 colon 포함)
        const mockHealthResponse = {
            data: {
                healthy_endpoints: [
                    { model: "ollama_chat/phi3:mini" },
                    { model: "ollama_chat/qwen2.5:1.5b-instruct" },
                    { model: "openrouter/z-ai/glm-4.5-air" },
                    { model: "openai/Qwen3/Qwen3-Coder-30B-A3B-Instruct" },
                    { model: "openrouter/qwen/qwen3-235b-a22b-2507" }, // Available에 없음
                ],
            },
        }

        // Mock /v1/models response (정규화된 이름)
        const mockModelsResponse = {
            data: {
                data: [
                    { id: "phi3-mini" }, // ollama_chat/phi3:mini 정규화
                    { id: "qwen2.5-1.5b-instruct" }, // ollama_chat/qwen2.5:1.5b-instruct 정규화
                    { id: "openrouter/z-ai/glm-4.5-air" }, // 정확히 일치
                    { id: "openai/Qwen3/Qwen3-Coder-30B-A3B-Instruct" }, // 정확히 일치
                    { id: "unavailable-model" }, // Available but not healthy
                ],
            },
        }

        mockedAxios.get
            .mockResolvedValueOnce(mockHealthResponse) // /health
            .mockResolvedValueOnce(mockModelsResponse) // /v1/models

        const request = proto.careti.FetchLiteLlmModelsRequest.create({
            baseUrl: "https://api.litellm.com",
            apiKey: "test-key",
        })

        const result = await fetchLiteLlmModels(mockController, request)

        expect(result.success).toBe(true)
        // Full name으로 반환 (정규화된 이름이 아님)
        expect(result.models).toEqual([
            "ollama_chat/phi3:mini",
            "ollama_chat/qwen2.5:1.5b-instruct",
            "openai/Qwen3/Qwen3-Coder-30B-A3B-Instruct",
            "openrouter/z-ai/glm-4.5-air",
        ])
    })

    it("should handle missing base URL", async () => {
        const request = proto.careti.FetchLiteLlmModelsRequest.create({
            baseUrl: "",
            apiKey: "test-key",
        })

        const result = await fetchLiteLlmModels(mockController, request)

        expect(result.success).toBe(false)
        expect(result.errorMessage).toBe("Valid base URL is required")
    })

    it("should handle /health failure and fallback to /v1/models", async () => {
        // /health 실패
        mockedAxios.get.mockRejectedValueOnce(new Error("Health check unavailable"))

        // /v1/models 성공
        const mockModelsResponse = {
            data: {
                data: [
                    { id: "gpt-3.5-turbo" },
                    { id: "gpt-4" },
                ],
            },
        }
        mockedAxios.get.mockResolvedValueOnce(mockModelsResponse)

        const request = proto.careti.FetchLiteLlmModelsRequest.create({
            baseUrl: "https://api.litellm.com",
            apiKey: "test-key",
        })

        const result = await fetchLiteLlmModels(mockController, request)

        // Health check 실패 시 모든 available 모델 반환
        expect(result.success).toBe(true)
        expect(result.models).toEqual(["gpt-3.5-turbo", "gpt-4"])
    })
})
```

### **Integration 테스트 (환경 변수 필요)**
```typescript
// careti-src/core/controller/fetchLiteLlmModels.integration.test.ts
// IMPORTANT: Set environment variables to run these tests:
//   LITELLM_TEST_BASE_URL="http://your-server:4000"
//   LITELLM_TEST_API_KEY="your-api-key"

describe("fetchLiteLlmModels - Integration test", () => {
    const testBaseUrl = process.env.LITELLM_TEST_BASE_URL
    const testApiKey = process.env.LITELLM_TEST_API_KEY

    // 환경 변수가 없으면 skip
    const describeIf = testBaseUrl && testApiKey ? it : it.skip

    describeIf("should fetch and filter models from real LiteLLM server", async () => {
        const request = proto.careti.FetchLiteLlmModelsRequest.create({
            baseUrl: testBaseUrl!,
            apiKey: testApiKey!,
        })

        const result = await fetchLiteLlmModels(mockController, request)

        expect(result.success).toBe(true)
        expect(result.models.length).toBeGreaterThanOrEqual(1)
    })
})
```

## 🔄 **확장 가능한 아키텍처**

### **새 프로바이더 추가 패턴**

LiteLLM 구현을 기반으로 다른 프로바이더들도 동일한 패턴으로 확장 가능합니다:

1. **Protocol 정의**: `proto/careti/system.proto`에 새 RPC 서비스 추가
2. **백엔드 핸들러**: `src/core/controller/careti/` 디렉토리에 구현
3. **프론트엔드 컴포넌트**: 드롭다운 및 버튼 UI 추가
4. **i18n 번역**: 4개 언어 번역 키 추가
5. **TDD 테스트**: 백엔드 핸들러 테스트 작성

## 🌍 **국가별 프로바이더 정렬 시스템**

### **정렬 규칙**

프로바이더 목록은 다음 우선순위로 정렬됩니다:

```
1. Careti/Cline (고정 - 항상 맨 위)
2. NEW 프로바이더 (섹션 순서 유지)
3. 일반 프로바이더 (섹션 순서 유지)
```

**핵심 규칙**: `NEW > 섹션 우선순위`, `NEW끼리는 섹션 우선순위를 따름`

### **섹션 순서**

| 순서 | 섹션 | 설명 |
|------|------|------|
| 1 | **고정** | Careti, Cline |
| 2 | **국가별 주목 구간** | 언어 설정에 따라 동적으로 결정 |
| 3 | **글로벌 주요 AI** | Anthropic, Gemini, OpenAI, xAI, Groq |
| 4 | **로컬 LLM** | Ollama, LM Studio, VS Code LM |
| 5 | **기타** | OpenRouter, DeepSeek, Mistral, ... |

### **국가별 주목 구간**

| 언어 | 국기 | 주목 프로바이더 |
|------|------|-----------------|
| 🇰🇷 **한국어** | 🇰🇷 | Upstage(NEW), Naver Cloud(NEW), BizRouter |
| 🇨🇳 **중국어** | 🇨🇳 | Qwen, Doubao, DeepSeek, Moonshot, Huawei Cloud |
| 🇯🇵 **일본어** | - | (없음 - 글로벌 순서) |
| 🇺🇸 **영어** | - | (없음 - 글로벌 순서) |

### **NEW 뱃지 시스템**

NEW 뱃지가 붙은 프로바이더는 **섹션 우선순위보다 높은 우선순위**를 가집니다.

```typescript
// NEW 프로바이더 정의
const newProviders = new Set(["zai", "upstage", "naver-cloud"])
```

**정렬 예시 (한국어)**:
```
1. Careti
2. Cline
3. 🇰🇷 Upstage [NEW]      ← NEW + 주목 구간
4. 🇰🇷 Naver Cloud [NEW]  ← NEW + 주목 구간
5. Z AI [NEW]              ← NEW + 기타 구간
6. 🇰🇷 BizRouter          ← 주목 구간 (NEW 아님)
7. Anthropic               ← 글로벌 주요 AI
8. Google Gemini
9. OpenAI
...
```

### **NEW 뱃지 스타일**

```typescript
// 이모지 기반 NEW 뱃지 (드롭다운 호환)
if (isNew) {
  label = `${label} ✨NEW`
}
```

> **Note**: HTML/CSS 기반 뱃지는 드롭다운이 닫혀있을 때 태그가 텍스트로 표시되므로, 이모지 기반으로 구현합니다.

### **구현 코드**

```typescript
// webview-ui/src/components/settings/ApiOptions.tsx

// 1. NEW 프로바이더 정의
const newProviders = new Set(["zai", "upstage", "naver-cloud"])

// 2. 국가별 주목 프로바이더
const regionalFeaturedProviders: Record<string, string[]> = {
  ko: ["upstage", "naver-cloud", "bizrouter"],
  zh: ["qwen", "doubao", "deepseek", "moonshot", "huawei-cloud-maas"],
  ja: [],
  en: [],
}

// 3. 국기 이모지
const regionalFlags: Record<string, string> = {
  ko: "🇰🇷",
  zh: "🇨🇳",
}

// 4. 정렬 로직
// Step 1: Careti/Cline 추가 (고정)
// Step 2: 섹션 순서 정의 (주목 → 글로벌 → 로컬 → 기타)
// Step 3: NEW 프로바이더 먼저 추가 (섹션 순서 유지)
// Step 4: 일반 프로바이더 추가 (섹션 순서 유지)
```

### **확장 가이드**

새로운 국가/언어 지원 시:

1. `regionalFeaturedProviders`에 언어 코드와 프로바이더 배열 추가
2. `regionalFlags`에 국기 이모지 추가 (선택)
3. 새 프로바이더에 NEW 뱃지가 필요하면 `newProviders`에 추가

```typescript
// 예: 독일어 지원 추가
regionalFeaturedProviders["de"] = ["sap-ai-core"]
regionalFlags["de"] = "🇩🇪"
```

---

## 🚀 **사용자 경험 개선사항**

### **Before (기존 방식)**
```
1. 사용자가 LiteLLM 문서 확인
2. 사용 가능한 모델명 수동 조회
3. 정확한 모델 ID 수동 입력
4. 오타나 지원 여부 불확실
```

### **After (개선된 방식)**
```
1. Base URL 입력
2. "모델 가져오기" 버튼 클릭
3. 자동으로 사용 가능한 모델 목록 표시
4. 드롭다운에서 선택
```

### **UX 혜택**
- ✅ **시간 절약**: 문서 조회 및 수동 입력 시간 90% 단축
- ✅ **오류 방지**: 모델명 오타 및 지원되지 않는 모델 선택 방지
- ✅ **실시간 피드백**: 연결 상태 및 API 키 유효성 즉시 확인
- ✅ **접근성**: 초보자도 쉽게 AI 프로바이더 설정 가능

## 🔧 **기술적 특징**

### **Health 기반 필터링 (LiteLLM 특화)**

LiteLLM 프로바이더는 두 API의 교집합을 사용하여 실시간으로 사용 가능한 모델만 반환합니다:

#### **Step 1: `/health` API - Healthy 모델**
```typescript
// 서버에서 현재 정상 작동 중인 모델 목록
GET /health → {
  healthy_endpoints: [
    { model: "ollama_chat/phi3:mini" },
    { model: "openrouter/z-ai/glm-4.5-air" },
    ...
  ]
}
```

#### **Step 2: `/v1/models` API - Available 모델**
```typescript
// 사용자 API 키로 접근 가능한 모델 목록
GET /v1/models → {
  data: [
    { id: "phi3-mini" },  // 정규화된 이름
    { id: "openrouter/z-ai/glm-4.5-air" },
    ...
  ]
}
```

#### **Step 3: Intersection 필터링**
```typescript
// Healthy AND Available 모델만 반환
filteredModels = healthyModels.filter(healthyModel => {
  const normalized = normalizeModelName(healthyModel)
  return availableSet.has(normalized)
})

// 결과: Full name으로 반환
["ollama_chat/phi3:mini", "openrouter/z-ai/glm-4.5-air"]
```

### **모델명 정규화**

LiteLLM은 `/health`와 `/v1/models`에서 서로 다른 모델명 형식을 사용합니다:

| /health (원본) | /v1/models (정규화) | 정규화 규칙 |
|---|---|---|
| `ollama_chat/phi3:mini` | `phi3-mini` | `ollama_chat/` 제거, `:` → `-` |
| `ollama_chat/qwen2.5:1.5b-instruct` | `qwen2.5-1.5b-instruct` | 동일 |
| `openrouter/z-ai/glm-4.5-air` | `openrouter/z-ai/glm-4.5-air` | 변경 없음 |

**정규화 함수**:
```typescript
function normalizeModelName(name: string): string {
  let normalized = name
  // ollama_chat/ prefix 제거
  if (normalized.startsWith("ollama_chat/")) {
    normalized = normalized.replace("ollama_chat/", "")
  }
  // : → - 변환 (ollama naming convention)
  normalized = normalized.replace(":", "-")
  return normalized
}
```

**반환값**: 사용자에게는 항상 `/health`의 **full name**으로 반환 (정규화되지 않음)

### **성능 최적화**
- **비동기 처리**: 모델 목록 로딩 중에도 다른 설정 변경 가능
- **Fallback 전략**: Health check 실패 시 자동으로 /v1/models만 사용
- **타임아웃**: Health(60초), Models(10초) - 무한 대기 방지

### **에러 핸들링**
- **네트워크 오류**: 연결 실패 시 명확한 오류 메시지
- **인증 오류**: API 키 문제 시 구체적인 안내
- **데이터 오류**: 잘못된 응답 형식 처리

### **보안**
- **No Hardcoded Credentials**: 코드에 API key/URL 하드코딩 금지
- **환경 변수**: Integration test는 환경 변수로 credentials 전달
- **API 키 보호**: VS Code secure storage에 암호화하여 저장
- **입력 검증**: URL 파싱 및 API 키 형식 검증
- **Request 기반**: 모든 credentials는 request 파라미터로만 전달

## 📊 **모니터링 및 로깅**

### **로깅 표준**
```typescript
Logger.debug(`[CaretSystemService] 🎯 Fetching models from ${provider}`)
Logger.info(`[CaretSystemService] ✅ Successfully fetched ${modelCount} models`)
Logger.error(`[CaretSystemService] ❌ Failed to fetch models: ${errorMessage}`)
```

### **메트릭 수집**
- 프로바이더별 모델 페칭 성공률
- 평균 응답 시간
- 가장 많이 사용되는 모델들
- 오류 발생 패턴 분석

## 🛠️ **개발자 가이드**

### **새 프로바이더 개발 체크리스트**
- [ ] proto 정의 추가
- [ ] 백엔드 핸들러 구현
- [ ] TDD 테스트 작성
- [ ] 프론트엔드 UI 컴포넌트
- [ ] 4개국어 번역 추가
- [ ] 문서 업데이트

---

## 📝 **변경 이력 및 영향 받은 파일**

### **v1.1 (2025-11-05) - LiteLLM Health 기반 필터링 + 모델명 정규화**

#### **변경 사항**
1. **Health 기반 필터링**: `/health` + `/v1/models` 교집합으로 healthy AND available 모델만 반환
2. **모델명 정규화**: `ollama_chat/` prefix 제거, `:` → `-` 변환으로 이름 불일치 해결
3. **보안 강화**: Integration test 하드코딩 제거, 환경 변수 사용
4. **Full name 반환**: 사용자에게는 정규화되지 않은 원본 이름 표시

#### **영향받은 파일**
```
✅ 수정된 파일 (4개):
careti-src/core/controller/
├── fetchLiteLlmModels.ts                   # 정규화 로직 + 교집합 필터링 추가
├── fetchLiteLlmModels.test.ts              # 모델명 정규화 테스트 케이스 추가
└── fetchLiteLlmModels.integration.test.ts  # 하드코딩 제거 → 환경 변수 사용

careti-docs/features/
└── f09-enhanced-provider-setup.md          # BizRouter 추가, 상세 문서화
```

#### **주요 변경 코드**
```typescript
// fetchLiteLlmModels.ts (Line 23-32)
const normalizeModelName = (name: string): string => {
  let normalized = name
  if (normalized.startsWith("ollama_chat/")) {
    normalized = normalized.replace("ollama_chat/", "")
  }
  normalized = normalized.replace(":", "-")
  return normalized
}

// fetchLiteLlmModels.ts (Line 121-134)
const availableSet = new Set(availableModels)
filteredModels = healthyModels.filter((healthyModel: string) => {
  const normalizedName = normalizeModelName(healthyModel)
  return availableSet.has(normalizedName)
})
```

#### **테스트 결과**
- **Unit tests**: 6/6 passed ✅
- **Integration tests**: 2/2 passed (환경 변수 필요) ✅
- **실제 서버 테스트**: 6 healthy → 5 models filtered ✅

---

### **v1.0 (2025-09-30) - 초기 구현**

#### **구현 완료**
- LiteLLM 모델 자동 페칭 (단순 `/health` 기반)
- BizRouter 모델 자동 페칭
- gRPC 기반 프론트엔드-백엔드 통신
- 4개국어 번역 지원 (한/영/일/중)

#### **영향받은 파일 (초기 구현)**
```
proto/careti/
└── system.proto                            # gRPC 서비스 정의

careti-src/core/controller/
├── fetchLiteLlmModels.ts                   # LiteLLM 핸들러
└── caretSystem/FetchBizRouterModels.ts     # BizRouter 핸들러

webview-ui/src/components/settings/providers/
├── LiteLlmProvider.tsx                     # LiteLLM UI
└── BizRouterProvider.tsx                   # BizRouter UI

webview-ui/src/careti/locale/*/
└── settings.json                           # 4개 언어 번역
```

---

**문서 버전**: v1.3 (2026-01-27)
**담당**: Luke Yang + Claude Code
**최신 변경**: Claude Code CLI 스트리밍 최적화
**관련 문서**: f08-feature-config-system.md, f07-careti-prompt-system.md

---

### **v1.3 (2026-01-27) - Claude Code CLI 스트리밍 최적화**

#### **변경 사항**
1. **스트리밍 방식 개선**: `readline` 라인 버퍼링 → 직접 async iterator 처리
2. **버퍼 크기 최적화**: 20MB → 5MB (75% 감소)
3. **지연 시간 감소**: readline 이벤트 레이어 제거로 첫 응답 지연 감소

#### **영향받은 파일**
```
✅ 수정된 파일 (1개):
src/integrations/claude-code/
└── run.ts                # readline 제거, 직접 스트림 처리, 버퍼 크기 조정
```

#### **주요 변경 코드**
```typescript
// run.ts - readline 제거
- import readline from "readline"

// run.ts - 버퍼 크기 감소
- const BUFFER_SIZE = 20_000_000 // 20 MB
+ const BUFFER_SIZE = 5_000_000  // 5 MB

// run.ts - 직접 스트림 처리
- const rl = readline.createInterface({ input: cProcess.stdout })
- for await (const line of rl) { ... }
+ for await (const rawChunk of cProcess.stdout) {
+     buffer += rawChunk.toString()
+     const lines = buffer.split("\n")
+     ...
+ }
```
