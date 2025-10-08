import { DifyConfig } from "../../../../shared/proto/gen/provider_config"
import { OPENAI_CHAT_COMPLETION_OBJECT, streamOpenAiChatCompletions } from "../transform/openai-format"
import { BaseApi } from "./base"

export class DifyApi extends BaseApi<DifyConfig> {
	async *streamChat(prompt: string) {
		const config = await this.getConfig()
		const url = new URL(config.apiUrl)
		const headers = this.buildHeaders()

		const body = {
			...OPENAI_CHAT_COMPLETION_OBJECT,
			model: config.model,
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			stream: true,
			user: "cline",
		}

		const res = await this.fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		})

		yield* streamOpenAiChatCompletions(res)
	}

	private buildHeaders() {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		}
		const apiKey = this.getApiKey()
		if (apiKey) {
			headers.Authorization = `Bearer ${apiKey}`
		}
		return headers
	}

	private getApiKey() {
		return this.config?.apiKey
	}
}
