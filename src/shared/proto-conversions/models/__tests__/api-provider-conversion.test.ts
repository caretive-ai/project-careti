// CARETI MODIFICATION: TDD test for ApiProvider proto conversion roundtrip
import { expect } from "chai"
import { describe, it } from "mocha"
import { ApiProvider } from "@shared/api"
import { ApiProvider as ProtoApiProvider } from "@shared/proto/cline/models"
import { convertApiProviderToProto, convertProtoToApiProvider } from "../api-configuration-conversion"

/**
 * All supported ApiProvider values that must roundtrip correctly
 * through proto serialization/deserialization
 */
const ALL_PROVIDERS: ApiProvider[] = [
	"anthropic",
	"openrouter",
	"bedrock",
	"vertex",
	"openai",
	"ollama",
	"lmstudio",
	"gemini",
	"openai-native",
	"deepseek",
	"qwen",
	"qwen-code",
	"doubao",
	"mistral",
	"vscode-lm",
	"cline",
	"litellm",
	"asksage",
	"xai",
	"sambanova",
	"cerebras",
	"requesty",
	"nebius",
	"moonshot",
	"huggingface",
	"vercel-ai-gateway",
	"groq",
	"baseten",
	"huawei-cloud-maas",
	"sapaicore",
	"fireworks",
	"together",
	"claude-code",
	"upstage",
	"naver-cloud",
	"zai",
	"hicap",
	"dify",
	"oca",
	"aihubmix",
	"minimax",
	"nousResearch",
	// CARETI-specific providers
	"careti",
	"bizrouter",
]

describe("ApiProvider Proto Conversion", () => {
	describe("roundtrip conversion for all providers", () => {
		ALL_PROVIDERS.forEach((provider) => {
			it(`should roundtrip '${provider}' correctly`, () => {
				// App → Proto → App
				const protoValue = convertApiProviderToProto(provider)
				const roundtripped = convertProtoToApiProvider(protoValue)

				expect(roundtripped).to.equal(provider)
			})
		})
	})

	describe("careti provider specifically", () => {
		it("should convert 'careti' to ProtoApiProvider.CARETI", () => {
			const protoValue = convertApiProviderToProto("careti")
			expect(protoValue).to.equal(ProtoApiProvider.CARETI)
		})

		it("should convert ProtoApiProvider.CARETI back to 'careti'", () => {
			const appValue = convertProtoToApiProvider(ProtoApiProvider.CARETI)
			expect(appValue).to.equal("careti")
		})

		it("should have CARETI = 1001 in proto enum", () => {
			expect(ProtoApiProvider.CARETI).to.equal(1001)
		})
	})

	describe("bizrouter provider specifically", () => {
		it("should convert 'bizrouter' to ProtoApiProvider.BIZROUTER", () => {
			const protoValue = convertApiProviderToProto("bizrouter")
			expect(protoValue).to.equal(ProtoApiProvider.BIZROUTER)
		})

		it("should convert ProtoApiProvider.BIZROUTER back to 'bizrouter'", () => {
			const appValue = convertProtoToApiProvider(ProtoApiProvider.BIZROUTER)
			expect(appValue).to.equal("bizrouter")
		})
	})

	describe("default fallback", () => {
		it("should fallback to 'anthropic' for unknown proto values", () => {
			// Using a value that doesn't exist in the enum
			const appValue = convertProtoToApiProvider(99999 as ProtoApiProvider)
			expect(appValue).to.equal("anthropic")
		})
	})
})
