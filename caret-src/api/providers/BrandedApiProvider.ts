// CARET MODIFICATION: Branded API Provider for B2B white-label solutions
import { Anthropic } from "@anthropic-ai/sdk"
import { ModelInfo, openRouterDefaultModelId, openRouterDefaultModelInfo } from "@shared/api"
import { shouldSkipReasoningForModel } from "@utils/model-utils"
import axios from "axios"
import OpenAI from "openai"
import { ApiHandler, CommonApiHandlerOptions } from "@core/api"
import { withRetry } from "@core/api/retry"
import { createOpenRouterStream } from "@core/api/transform/openrouter-stream"
import { ApiStream, ApiStreamUsageChunk } from "@core/api/transform/stream"
import { OpenRouterErrorResponse } from "@core/api/providers/types"
import { BrandApiConfig, loadBrandConfig } from "@caret/utils/brand-config-loader"

interface BrandedApiHandlerOptions extends CommonApiHandlerOptions {
  brandName?: string
  openRouterApiKey?: string
  reasoningEffort?: string
  thinkingBudgetTokens?: number
  openRouterProviderSorting?: string
  openRouterModelId?: string
  openRouterModelInfo?: ModelInfo
}

export class BrandedApiProvider implements ApiHandler {
  private brandName: string
  private config: BrandApiConfig
  private options: BrandedApiHandlerOptions
  private client: OpenAI | undefined
  lastGenerationId?: string

  constructor(brandName: string, options: BrandedApiHandlerOptions) {
    this.brandName = brandName
    this.options = options
    this.config = loadBrandConfig(brandName)
    
    // Validate brand configuration
    if (!this.config.api.baseUrl) {
      throw new Error(`Invalid brand configuration for ${brandName}: missing baseUrl`)
    }
  }

  private ensureClient(): OpenAI {
    if (!this.client) {
      const apiKey = this.options.openRouterApiKey
      
      if (!apiKey) {
        throw new Error(`${this.config.ui.providerDisplayName} API key is required`)
      }

      try {
        this.client = new OpenAI({
          baseURL: this.config.api.baseUrl,
          apiKey: apiKey,
          defaultHeaders: {
            ...this.config.api.headers,
            "X-Caret-Brand": this.brandName.toUpperCase()
          },
          timeout: this.config.api.timeout || 30000
        })
      } catch (error: any) {
        throw new Error(`Error creating ${this.config.ui.providerDisplayName} client: ${error.message}`)
      }
    }
    return this.client
  }

  @withRetry()
  async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
    const client = this.ensureClient()
    this.lastGenerationId = undefined
    
    // Handle brand-specific status (preparing, maintenance, etc.)
    if (this.config.api.status === "preparing") {
      const preparingMsg = this.config.i18n?.mcpMarketplace?.preparing || 
        `${this.config.ui.providerDisplayName} 서비스가 준비 중입니다.`
      throw new Error(preparingMsg)
    }

    const stream = await createOpenRouterStream(
      client,
      systemPrompt,
      messages,
      this.getModel(),
      this.options.reasoningEffort,
      this.options.thinkingBudgetTokens,
      this.options.openRouterProviderSorting
    )

    let didOutputUsage: boolean = false

    for await (const chunk of stream) {
      // Brand-specific error handling for OpenRouter errors  
      if ("error" in chunk) {
        const error = chunk.error as any
        throw new Error(`${this.config.ui.providerDisplayName} API Error ${error.code}: ${error.message}`)
      }

      // Check for error in choices[0].finish_reason
      const choice = chunk.choices?.[0]
      if ((choice?.finish_reason as string) === "error") {
        throw new Error(`${this.config.ui.providerDisplayName} Mid-Stream Error`)
      }

      if (!this.lastGenerationId && chunk.id) {
        this.lastGenerationId = chunk.id
      }

      const delta = chunk.choices[0]?.delta
      if (delta?.content) {
        yield {
          type: "text",
          text: delta.content,
        }
      }

      // Reasoning tokens - skip reasoning for Grok 4 models
      if ("reasoning" in delta && delta.reasoning && !shouldSkipReasoningForModel(this.getModel().id)) {
        yield {
          type: "reasoning",
          reasoning: delta.reasoning as string,
        }
      }

      if (!didOutputUsage && chunk.usage) {
        yield {
          type: "usage",
          cacheWriteTokens: 0,
          cacheReadTokens: chunk.usage.prompt_tokens_details?.cached_tokens || 0,
          inputTokens: (chunk.usage.prompt_tokens || 0) - (chunk.usage.prompt_tokens_details?.cached_tokens || 0),
          outputTokens: chunk.usage.completion_tokens || 0,
          totalCost: (chunk.usage as any).cost || 0,
        }
        didOutputUsage = true
      }
    }

    // Fallback to generation endpoint if usage chunk not returned
    if (!didOutputUsage) {
      const apiStreamUsage = await this.getApiStreamUsage()
      if (apiStreamUsage) {
        yield apiStreamUsage
      }
    }
  }

  getModel(): { id: string; info: ModelInfo } {
    return {
      id: this.options.openRouterModelId || openRouterDefaultModelId,
      info: this.options.openRouterModelInfo || openRouterDefaultModelInfo
    }
  }

  async getApiStreamUsage(): Promise<ApiStreamUsageChunk | undefined> {
    if (!this.lastGenerationId) {
      return undefined
    }

    try {
      // Brand-specific usage endpoint (if available)
      const usageUrl = `${this.config.api.baseUrl.replace(/\/api\/v1.*$/, '')}/generation?id=${this.lastGenerationId}`
      
      const response = await axios.get(usageUrl, {
        timeout: 15000,
        headers: this.config.api.headers
      })

      if (response.data) {
        const { native_tokens_cached = 0, native_tokens_prompt = 0, native_tokens_completion = 0, total_cost = 0 } = response.data
        
        return {
          type: "usage" as const,
          inputTokens: native_tokens_prompt,
          outputTokens: native_tokens_completion, 
          cacheReadTokens: native_tokens_cached,
          totalCost: total_cost
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch ${this.brandName} usage for generation ${this.lastGenerationId}:`, error)
    }

    return undefined
  }
}