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
  brandApiKey?: string
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
      const apiKey = this.options.brandApiKey || this.options.openRouterApiKey
      
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
    try {
      const client = this.ensureClient()
      
      // Handle brand-specific status (preparing, maintenance, etc.)
      if (this.config.api.status === "preparing") {
        const preparingMsg = this.config.i18n?.mcpMarketplace?.preparing || 
          `${this.config.ui.providerDisplayName} 서비스가 준비 중입니다.`
        throw new Error(preparingMsg)
      }

      const modelId = this.options.openRouterModelId || openRouterDefaultModelId
      const modelInfo = this.options.openRouterModelInfo || openRouterDefaultModelInfo

      // Check if reasoning should be skipped for this model
      const skipReasoning = shouldSkipReasoningForModel(modelId)
      const reasoningEffort = skipReasoning ? undefined : this.options.reasoningEffort

      // Prepare OpenRouter-compatible request
      const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: Array.isArray(msg.content) 
            ? msg.content.map((block) => {
                if (block.type === "text") {
                  return { type: "text" as const, text: block.text }
                } else if (block.type === "image") {
                  return {
                    type: "image_url" as const,
                    image_url: { url: block.source.data }
                  }
                }
                return block
              })
            : msg.content
        }))
      ]

      const stream = client.chat.completions.create({
        model: modelId,
        messages: openaiMessages,
        stream: true,
        max_tokens: modelInfo.maxTokens ? Math.min(8192, modelInfo.maxTokens) : 8192,
        temperature: 0,
        ...(reasoningEffort && {
          reasoning_effort: reasoningEffort
        }),
        ...(this.options.thinkingBudgetTokens && {
          max_completion_tokens: this.options.thinkingBudgetTokens
        })
      })

      yield* createOpenRouterStream(
        stream,
        this.getModel(),
        (genId) => { this.lastGenerationId = genId }
      )

    } catch (error) {
      // Brand-specific error handling
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as OpenRouterErrorResponse | undefined
        if (data?.error) {
          throw new Error(`${this.config.ui.providerDisplayName} API Error ${data.error.code}: ${data.error.message}`)
        }
      }
      
      // Network or connection errors - show preparing message
      if (error.message.includes('ECONNREFUSED') || error.message.includes('timeout')) {
        const preparingMsg = this.config.i18n?.mcpMarketplace?.preparing || 
          `${this.config.ui.providerDisplayName} 서비스가 준비 중입니다.`
        throw new Error(preparingMsg)
      }
      
      throw error
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
          inputTokens: native_tokens_prompt,
          outputTokens: native_tokens_completion, 
          inputCachedTokens: native_tokens_cached,
          totalCost: total_cost
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch ${this.brandName} usage for generation ${this.lastGenerationId}:`, error)
    }

    return undefined
  }
}