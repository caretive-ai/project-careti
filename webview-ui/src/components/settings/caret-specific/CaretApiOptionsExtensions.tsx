// CARET MODIFICATION: Caret 고유 API 옵션 확장 기능들
// 목적: Cline ApiOptions.tsx와 분리하여 Caret 고유 기능들을 모듈화

import React from "react"
import { VSCodeOption, VSCodeTextField, VSCodeCheckbox, VSCodeLink, VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import { ClineAccountInfoCard } from "../ClineAccountInfoCard"
import FeaturedModelCard from "../FeaturedModelCard"

// Caret Provider 전용 컴포넌트
export const CaretProviderSection = () => (
	<div>
		{/* CARET MODIFICATION: Caret 프로바이더 개선 - 향후 지원예정 메시지 및 모델 선택 */}
		<div style={{ marginBottom: 14, marginTop: 4 }}>
			<ClineAccountInfoCard />
		</div>

		{/* CARET MODIFICATION: Testing edit_file functionality with a comment */}
		{/* 향후 지원예정 메시지 */}
		<div
			style={{
				padding: "10px",
				// CARET MODIFICATION: Removed background color for less emphasis
				// backgroundColor: "var(--vscode-textCodeBlock-background)",
				borderRadius: "4px",
				marginBottom: "10px",
				// CARET MODIFICATION: Removed border for less emphasis
				// border: "1px solid var(--vscode-textBlockQuote-border)"
			}}>
			<p
				style={{
					margin: 0,
					fontSize: "13px",
					// CARET MODIFICATION: Changed color and font-weight for less emphasis
					color: "var(--vscode-descriptionForeground)",
					fontWeight: "normal", // Changed from 500 to normal
				}}>
				{/* CARET MODIFICATION: Removed icon for less emphasis */}
				{t("caretProvider.futureSupport", "common")}
			</p>
			<p
				style={{
					margin: "5px 0 0 0",
					fontSize: "12px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				{t("caretProvider.futureProviders", "common")}
			</p>
		</div>

		{/* Featured Model Cards for Caret */}
		<div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "15px" }}>
			<FeaturedModelCard
				title={t("featuredModels.geminiPro.title", "common")}
				description={t("featuredModels.geminiPro.description", "common")}
				modelId="gemini-2.5-pro-preview-06-05"
				provider="caret"
				isPopular={true}
			/>
			<FeaturedModelCard
				title={t("featuredModels.geminiFlash.title", "common")}
				description={t("featuredModels.geminiFlash.description", "common")}
				modelId="gemini-2.5-flash-preview-05-20"
				provider="caret"
				isPopular={false}
			/>
		</div>
	</div>
)

// Caret의 Provider 옵션들
export const getCaretProviderOptions = () => (
	<>
		<VSCodeOption value="caret">Caret</VSCodeOption>
		<VSCodeOption value="gemini">Google Gemini</VSCodeOption>
		<VSCodeOption value="openai-native">OpenAI</VSCodeOption>
		<VSCodeOption value="anthropic">Anthropic</VSCodeOption>
		<VSCodeOption value="deepseek">DeepSeek</VSCodeOption>
		<VSCodeOption value="qwen">Qwen</VSCodeOption>
		<VSCodeOption value="doubao">Doubao</VSCodeOption>
		<VSCodeOption value="mistral">Mistral</VSCodeOption>
		<VSCodeOption value="openrouter">OpenRouter</VSCodeOption>
		<VSCodeOption value="bedrock">AWS Bedrock</VSCodeOption>
		<VSCodeOption value="vertex">Google Cloud Vertex AI</VSCodeOption>
		<VSCodeOption value="openai-compatible">OpenAI-compatible</VSCodeOption>
		<VSCodeOption value="ollama">Ollama</VSCodeOption>
		<VSCodeOption value="lmstudio">LM Studio</VSCodeOption>
		<VSCodeOption value="vscode-lm">VSCode Language Models</VSCodeOption>
		<VSCodeOption value="together">Together AI</VSCodeOption>
		<VSCodeOption value="fireworks">Fireworks AI</VSCodeOption>
		<VSCodeOption value="groq">Groq</VSCodeOption>
		<VSCodeOption value="cerebras">Cerebras</VSCodeOption>
		<VSCodeOption value="xai">xAI</VSCodeOption>
		<VSCodeOption value="sap-ai-core">SAP AI Core</VSCodeOption>
		<VSCodeOption value="sambanova">SambaNova</VSCodeOption>
		<VSCodeOption value="requesty">Requesty</VSCodeOption>
		<VSCodeOption value="huggingface">Hugging Face</VSCodeOption>
		<VSCodeOption value="nebius">Nebius</VSCodeOption>
		<VSCodeOption value="lite-llm">LiteLLM</VSCodeOption>
		<VSCodeOption value="baseten">Baseten</VSCodeOption>
	</>
)

// Caret의 다국어 지원 텍스트 헬퍼들
export const getCaretApiTexts = () => ({
	apiProvider: t("apiOptions.apiProvider", "common"),
	enterApiKey: t("apiOptions.enterApiKey", "common"),
	loading: t("apiOptions.loading", "common"),
	selectModel: t("apiOptions.selectModel", "common"),
	thisKeyStoredLocally: t("apiOptions.thisKeyStoredLocally", "common"),
	useCustomBaseUrl: t("apiOptions.useCustomBaseUrl", "common"),
	awsCredentials: t("apiOptions.awsCredentials", "common"),
	awsProfile: t("apiOptions.awsProfile", "common"),
	awsProfilePlaceholder: t("apiOptions.awsProfilePlaceholder", "common"),
	awsProfileName: t("apiOptions.awsProfileName", "common"),
	enterAccessKey: t("apiOptions.enterAccessKey", "common"),
	enterSecretKey: t("apiOptions.enterSecretKey", "common"),
	awsAccessKey: t("apiOptions.awsAccessKey", "common"),
	awsSecretKey: t("apiOptions.awsSecretKey", "common"),
})

// Caret의 ThinkingBudgetSlider 확장
export const CaretThinkingBudgetWrapper = ({ children }: { children: React.ReactNode }) => (
	<div style={{ marginBottom: "15px" }}>
		{children}
	</div>
)
