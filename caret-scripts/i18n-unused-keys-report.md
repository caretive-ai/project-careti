# i18n 미사용 키 분석 보고서

**생성일시**: 2025-09-05 07:39:37
**분석기**: report-i18n-unused-key.js
**프로젝트**: Caret 프론트엔드 i18n 시스템

## 📊 요약 통계

- **총 키 개수**: 633개
- **사용중인 키**: 629개
- **미사용 키**: 4개
- **스캔한 파일**: 189개
- **사용률**: 99.4%

## 🗑️ 미사용 키 목록 (4개)

locale 파일에 정의되어 있지만 컴포넌트에서 참조되지 않는 키들:

| Key | Namespace | Available Locales | Count |
|-----|-----------|------------------|-------|
| `and` | common | ko, en, ja, zh | 4 |
| `button.resume.Task` | common | ko | 1 |
| `rulesModal.ariaLabel.CaretRulesButton` | common | en | 1 |
| `rulesModal.tooltip.manageRulesWorkflows` | common | en | 1 |


## 🌍 누락된 번역 (14개)

일부 언어에서 번역이 누락된 키들:

| Key | Namespace | Missing Locales | Used | Available |
|-----|-----------|----------------|------|-----------|
| `modelInfoView.contextWindowLabel` 🔥 | settings | ko, en | 2 | ja, zh |
| `about.description` 🔥 | settings | en, zh | 1 | ko, ja |
| `baseUrlField.placeholderAnthropic` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.description1` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.description2` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.extendedThinkingDescription1` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.extendedThinkingLink` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.quickstartGuideLink` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.usePromptCachingDescription` 🔥 | settings | en, ja, zh | 1 | ko |
| `modelInfoView.millionTokensLabel` 🔥 | settings | ko, en | 1 | ja, zh |
| `modelInfoView.tokensSuffix` 🔥 | settings | ko, en | 1 | ja, zh |
| `button.resume.Task` ⚪ | common | en, ja, zh | 0 | ko |
| `rulesModal.ariaLabel.CaretRulesButton` ⚪ | common | ko, ja, zh | 0 | en |
| `rulesModal.tooltip.manageRulesWorkflows` ⚪ | common | ko, ja, zh | 0 | en |

🔥 = 고우선순위 (키가 사용중)
⚪ = 저우선순위 (키가 현재 미사용)


## ❓ 정의되지 않은 키 (273개)

코드에서 t() 함수로 사용하지만 JSON 파일에 정의되지 않은 키들:

| 키 | 컴포넌트 | 네임스페이스 추정 | 우선순위 |
|-----|-----------|------------------|----------|
| `../../../../src/services/error/ClineError` | ErrorRow.test.tsx |  | ⚪ |
| `.quote-button-class` | ChatRow.tsx |  | ⚪ |
| `account.failedToGetLoginUrl` | AccountOptions.tsx | account | ⚪ |
| `anthropic--claude-3.5-sonnet` | SapAiCoreModelPicker.spec.tsx | anthropic--claude-3 | ⚪ |
| `autoApprove.addQuickAccess` | AutoApproveMenuItem.tsx | autoApprove | ⚪ |
| `autoApprove.removeQuickAccess` | AutoApproveMenuItem.tsx | autoApprove | ⚪ |
| `chat. ` | ChatView.tsx | chat | ⚪ |
| `chat.addContext` | ChatTextArea.tsx | chat | ⚪ |
| `chat.addFilesImages` | ChatTextArea.tsx | chat | ⚪ |
| `chat.addToInputSubscriptionCompleted` | ChatView.tsx | chat | ⚪ |
| `chat.brandMarketplace.preparing` | McpConfigurationView.tsx | chat | ⚪ |
| `chat.brandMarketplace.preparingDescription` | McpConfigurationView.tsx | chat | ⚪ |
| `chat.bugReport.additionalContext` | ReportBugPreview.tsx | chat | ⚪ |
| `chat.bugReport.clineVersion` | ReportBugPreview.tsx | chat | ⚪ |
| `chat.bugReport.operatingSystem` | ReportBugPreview.tsx | chat | ⚪ |
| `chat.bugReport.providerModel` | ReportBugPreview.tsx | chat | ⚪ |
| `chat.bugReport.relevantApiRequestOutput` | ReportBugPreview.tsx | chat | ⚪ |
| `chat.bugReport.stepsToReproduce` | ReportBugPreview.tsx | chat | ⚪ |
| `chat.bugReport.systemInfo` | ReportBugPreview.tsx | chat | ⚪ |
| `chat.bugReport.title` | ReportBugPreview.tsx | chat | ⚪ |
| `chat.bugReport.whatHappened` | ReportBugPreview.tsx | chat | ⚪ |
| `chat.caretHasQuestion` | ChatRow.tsx | chat | ⚪ |
| `chat.clientIdNotFound` | ChatView.tsx | chat | ⚪ |
| `chat.commandApprovalRequired` | ChatRow.tsx | chat | ⚪ |
| `chat.commandOutput` | ChatRow.tsx | chat | ⚪ |
| `chat.contextMenu.add` | ContextMenu.tsx | chat | ⚪ |
| `chat.contextMenu.file` | ContextMenu.tsx | chat | ⚪ |
| `chat.contextMenu.folder` | ContextMenu.tsx | chat | ⚪ |
| `chat.contextMenu.gitCommits` | ContextMenu.tsx | chat | ⚪ |
| `chat.contextMenu.noResultsFound` | ContextMenu.tsx | chat | ⚪ |
| `chat.contextMenu.pasteUrlToFetchContents` | ContextMenu.tsx | chat | ⚪ |
| `chat.contextMenu.problems` | ContextMenu.tsx | chat | ⚪ |
| `chat.contextMenu.searching` | ContextMenu.tsx | chat | ⚪ |
| `chat.contextMenu.terminal` | ContextMenu.tsx | chat | ⚪ |
| `chat.creditLimitError.buyCredits` | CreditLimitError.tsx | chat | ⚪ |
| `chat.creditLimitError.outOfCredits` | CreditLimitError.tsx | chat | ⚪ |
| `chat.creditLimitError.retryRequest` | CreditLimitError.tsx | chat | ⚪ |
| `chat.error.displayContent` | ChatErrorBoundary.tsx | chat | ⚪ |
| `chat.error.label` | ChatRow.tsx | chat | ⚪ |
| `chat.error.maxRequestsReached` | ChatRow.tsx | chat | ⚪ |
| `chat.error.mistakeLimitReached` | ChatRow.tsx | chat | ⚪ |
| `chat.error.unknown` | ChatErrorBoundary.tsx | chat | ⚪ |
| `chat.error.unknownError` | ChatErrorBoundary.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiRequest` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiRequestCancelled` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiRequestFailed` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiRequestLoading` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiRetryAttempt` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiStreamingFailed` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.creditLimitReached` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.ellipsis` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.inSeconds` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorInAddToInputSubscription` | ChatView.tsx | chat | ⚪ |
| `chat.errorRow.clickRetryBelow` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.clineTriedToAccess` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.diffError` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.file` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.isBlockedBy` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.period` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.powershellIssue` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.requestId` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.signInToCline` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.troubleshootingGuide` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorSelectingFilesImages` | ChatView.tsx | chat | ⚪ |
| `chat.executeCommand` | ChatRow.tsx | chat | ⚪ |
| `chat.historyPreview.apiCost` | HistoryPreview.tsx | chat | ⚪ |
| `chat.historyPreview.cache` | HistoryPreview.tsx | chat | ⚪ |
| `chat.historyPreview.tokens` | HistoryPreview.tsx | chat | ⚪ |
| `chat.image.dimensionError` | ChatTextArea.tsx | chat | ⚪ |
| `chat.image.unsupportedFileError` | ChatTextArea.tsx | chat | ⚪ |
| `chat.imagePreview.failedToLoadImage` | ImagePreview.tsx | chat | ⚪ |
| `chat.imagePreview.imageFrom` | ImagePreview.tsx | chat | ⚪ |
| `chat.imagePreview.loadingImageFrom` | ImagePreview.tsx | chat | ⚪ |
| `chat.imagePreview.svgFrom` | ImagePreview.tsx | chat | ⚪ |
| `chat.imagePreview.timeoutLoadingImage` | ImagePreview.tsx | chat | ⚪ |
| `chat.imagePreview.waitingForMinutesSeconds` | ImagePreview.tsx | chat | ⚪ |
| `chat.imagePreview.waitingForSeconds` | ImagePreview.tsx | chat | ⚪ |
| `chat.linkPreview.loadingPreviewFor` | LinkPreview.tsx | chat | ⚪ |
| `chat.linkPreview.waitingForMinutesSeconds` | LinkPreview.tsx | chat | ⚪ |
| `chat.linkPreview.waitingForSeconds` | LinkPreview.tsx | chat | ⚪ |
| `chat.markdownBlock.openFileInEditor` | MarkdownBlock.tsx | chat | ⚪ |
| `chat.mcp.resource` | ChatRow.tsx | chat | ⚪ |
| `chat.mcp.tool` | ChatRow.tsx | chat | ⚪ |
| `chat.mcp.useServer` | ChatRow.tsx | chat | ⚪ |
| `chat.mode.act.action` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mode.act.label` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mode.plan.action` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mode.plan.label` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mode.tooltip.description` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mode.tooltip.toggle` | ChatTextArea.tsx | chat | ⚪ |
| `chat.placeholderHint` | ChatTextArea.tsx | chat | ⚪ |
| `chat.selectModelApiProvider` | ChatTextArea.tsx | chat | ⚪ |
| `chat.serversToggleModal.manageMcpServers` | ServersToggleModal.tsx | chat | ⚪ |
| `chat.serversToggleModal.mcpServers` | ServersToggleModal.tsx | chat | ⚪ |
| `chat.slashCommandMenu.noMatchingCommandsFound` | SlashCommandMenu.tsx | chat | ⚪ |
| `chat.taskCompleted` | ChatRow.tsx | chat | ⚪ |
| `chat.thumbnails.thumbnailImage` | Thumbnails.tsx | chat | ⚪ |
| `chat.tool.createFile` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.editFile` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.externalUrl` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.listCodeDefinitionNames` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.listFilesRecursive` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.listFilesTopLevel` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.outsideWorkspace` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.readFile` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.searchFiles` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.summarizeTask` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.summary` | ChatRow.tsx | chat | ⚪ |
| `chat.tool.webFetch` | ChatRow.tsx | chat | ⚪ |
| `chat.typeMessage` | ChatView.tsx | chat | ⚪ |
| `Choose SAP AI Core model...` | SapAiCoreModelPicker.spec.tsx | Choose SAP AI Core model | ⚪ |
| `common.account.credits` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.account.creditsUsed` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.account.date` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.account.failedToFetchCreditBalance` | AccountView.tsx | common | ⚪ |
| `common.account.failedToFetchUserCredit` | AccountView.tsx | common | ⚪ |
| `common.account.lastUpdated` | CreditBalance.tsx | common | ⚪ |
| `common.account.model` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.account.noPaymentHistory` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.account.noUsageHistory` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.account.paymentsHistory` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.account.personal` | AccountView.tsx | common | ⚪ |
| `common.account.privacyPolicyUrl` | AccountWelcomeView.tsx | common | ⚪ |
| `common.account.profileAlt` | AccountView.tsx | common | ⚪ |
| `common.account.role` | AccountView.tsx | common | ⚪ |
| `common.account.termsOfServiceUrl` | AccountWelcomeView.tsx | common | ⚪ |
| `common.account.totalCost` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.account.usageHistory` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.announcement.newVersion` | Announcement.tsx | common | ⚪ |
| `common.button.approve` | buttonConfig.ts | common | ⚪ |
| `common.button.condenseConversation` | buttonConfig.ts | common | ⚪ |
| `common.button.proceed` | buttonConfig.ts | common | ⚪ |
| `common.button.proceedAnyways` | buttonConfig.ts | common | ⚪ |
| `common.button.proceedWhileRunning` | buttonConfig.ts | common | ⚪ |
| `common.button.reportGitHubIssue` | buttonConfig.ts | common | ⚪ |
| `common.button.resumeTask` | buttonConfig.ts | common | ⚪ |
| `common.button.retry` | buttonConfig.ts | common | ⚪ |
| `common.button.startNewTaskWithContext` | buttonConfig.ts | common | ⚪ |
| `common.common.and` | AccountWelcomeView.tsx | common | ⚪ |
| `common.scrollToBottom` | ActionButtons.tsx | common | ⚪ |
| `credits.tab` | helpers.ts | credits | ⚪ |
| `gemini-2.5-pro` | SapAiCoreModelPicker.spec.tsx | gemini-2 | ⚪ |
| `history.apiCostLabel` | HistoryView.tsx | history | ⚪ |
| `history.cacheLabel` | HistoryView.tsx | history | ⚪ |
| `history.clearSearch` | HistoryView.tsx | history | ⚪ |
| `history.deleteAllHistory` | HistoryView.tsx | history | ⚪ |
| `history.deleteSelected` | HistoryView.tsx | history | ⚪ |
| `history.export` | HistoryView.tsx | history | ⚪ |
| `history.filterFavorites` | HistoryView.tsx | history | ⚪ |
| `history.filterWorkspace` | HistoryView.tsx | history | ⚪ |
| `history.fuzzySearchPlaceholder` | HistoryView.tsx | history | ⚪ |
| `history.selectAll` | HistoryView.tsx | history | ⚪ |
| `history.selectNone` | HistoryView.tsx | history | ⚪ |
| `history.sortMostExpensive` | HistoryView.tsx | history | ⚪ |
| `history.sortMostRelevant` | HistoryView.tsx | history | ⚪ |
| `history.sortMostTokens` | HistoryView.tsx | history | ⚪ |
| `history.sortNewest` | HistoryView.tsx | history | ⚪ |
| `history.sortOldest` | HistoryView.tsx | history | ⚪ |
| `history.title` | HistoryView.tsx | history | ⚪ |
| `history.tokensLabel` | HistoryView.tsx | history | ⚪ |
| `Select a model...` | SapAiCoreModelPicker.spec.tsx | Select a model | ⚪ |
| `settings.about.link` | AboutSection.tsx | settings | ⚪ |
| `settings.about.version` | AboutSection.tsx | settings | ⚪ |
| `settings.apiKeyField.label` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.autoApprove.description` | AutoApproveModal.tsx | settings | ⚪ |
| `settings.basetenModelPicker.basetenLink` | BasetenModelPicker.tsx | settings | ⚪ |
| `settings.basetenModelPicker.modelNotStatic` | BasetenModelPicker.tsx | settings | ⚪ |
| `settings.debug.errorInSeconds` | ChatErrorBoundary.tsx | settings | ⚪ |
| `settings.groqModelPicker.fetchModelsError` | GroqModelPicker.tsx | settings | ⚪ |
| `settings.huggingFaceModelPicker.fetchModelsError` | HuggingFaceModelPicker.tsx | settings | ⚪ |
| `settings.modelIdField.label` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.modelInfoView.maxOutputTokensLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.modelInfoView.supportsImagesLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.modelInfoView.temperatureLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.openAiCompatibleProvider.azureApiVersionPlaceholder` | OpenAICompatible.tsx | settings | ⚪ |
| `settings.openRouterProvider.balanceDisplay.label` | OpenRouterProvider.tsx | settings | ⚪ |
| `settings.openRouterProvider.balanceDisplay.tooltip` | OpenRouterProvider.tsx | settings | ⚪ |
| `settings.preferredLanguage.changeError` | PreferredLanguageSetting.tsx | settings | ⚪ |
| `settings.providers.anthropic.description` | AnthropicProvider.tsx | settings | ⚪ |
| `settings.providers.anthropic.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.asksage.description` | AskSageProvider.tsx | settings | ⚪ |
| `settings.providers.asksage.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.baseten.description` | BasetenProvider.tsx | settings | ⚪ |
| `settings.providers.baseten.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.bedrock.description` | BedrockProvider.tsx | settings | ⚪ |
| `settings.providers.bedrock.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.caret.loginError` | CaretProvider.tsx | settings | ⚪ |
| `settings.providers.caret.name` | ApiOptions.tsx, CaretProvider.tsx | settings | 🔥 |
| `settings.providers.cerebras.description` | CerebrasProvider.tsx | settings | ⚪ |
| `settings.providers.cerebras.name` | ApiOptions.tsx, CerebrasProvider.tsx | settings | 🔥 |
| `settings.providers.claude-code.description` | ClaudeCodeProvider.tsx | settings | ⚪ |
| `settings.providers.claude-code.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.claudeCode.cliPath` | ClaudeCodeProvider.tsx | settings | ⚪ |
| `settings.providers.claudeCode.cliPathDescription` | ClaudeCodeProvider.tsx | settings | ⚪ |
| `settings.providers.claudeCode.cliPathPlaceholder` | ClaudeCodeProvider.tsx | settings | ⚪ |
| `settings.providers.claudeCode.model` | ClaudeCodeProvider.tsx | settings | ⚪ |
| `settings.providers.cline.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.deepseek.description` | DeepSeekProvider.tsx | settings | ⚪ |
| `settings.providers.deepseek.name` | ApiOptions.tsx, DeepSeekProvider.tsx | settings | 🔥 |
| `settings.providers.dify.baseUrlLabel` | DifyProvider.tsx | settings | ⚪ |
| `settings.providers.dify.baseUrlPlaceholder` | DifyProvider.tsx | settings | ⚪ |
| `settings.providers.dify.description` | DifyProvider.tsx | settings | ⚪ |
| `settings.providers.dify.name` | ApiOptions.tsx, DifyProvider.tsx | settings | 🔥 |
| `settings.providers.doubao.description` | DoubaoProvider.tsx | settings | ⚪ |
| `settings.providers.doubao.name` | ApiOptions.tsx, DoubaoProvider.tsx | settings | 🔥 |
| `settings.providers.fireworks.description` | FireworksProvider.tsx | settings | ⚪ |
| `settings.providers.fireworks.name` | ApiOptions.tsx, FireworksProvider.tsx | settings | 🔥 |
| `settings.providers.gemini.description` | GeminiProvider.tsx | settings | ⚪ |
| `settings.providers.gemini.name` | ApiOptions.tsx, GeminiProvider.tsx | settings | 🔥 |
| `settings.providers.groq.description` | GroqProvider.tsx | settings | ⚪ |
| `settings.providers.groq.name` | ApiOptions.tsx, GroqProvider.tsx | settings | 🔥 |
| `settings.providers.huawei-cloud-maas.description` | HuaweiCloudMaasProvider.tsx | settings | ⚪ |
| `settings.providers.huawei-cloud-maas.name` | ApiOptions.tsx, HuaweiCloudMaasProvider.tsx | settings | 🔥 |
| `settings.providers.huggingface.description` | HuggingFaceProvider.tsx | settings | ⚪ |
| `settings.providers.huggingface.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.litellm.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.lmstudio.description` | LMStudioProvider.tsx | settings | ⚪ |
| `settings.providers.lmstudio.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.mistral.description` | MistralProvider.tsx | settings | ⚪ |
| `settings.providers.mistral.name` | ApiOptions.tsx, MistralProvider.tsx | settings | 🔥 |
| `settings.providers.moonshot.description` | MoonshotProvider.tsx | settings | ⚪ |
| `settings.providers.moonshot.name` | ApiOptions.tsx, MoonshotProvider.tsx | settings | 🔥 |
| `settings.providers.nebius.description` | NebiusProvider.tsx | settings | ⚪ |
| `settings.providers.nebius.name` | ApiOptions.tsx, NebiusProvider.tsx | settings | 🔥 |
| `settings.providers.ollama.description` | OllamaProvider.tsx | settings | ⚪ |
| `settings.providers.ollama.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.openai-native.description` | OpenAINative.tsx | settings | ⚪ |
| `settings.providers.openai-native.name` | ApiOptions.tsx, OpenAINative.tsx | settings | 🔥 |
| `settings.providers.openai.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.openAICompatible.description` | OpenAICompatible.tsx | settings | ⚪ |
| `settings.providers.openrouter.description` | OpenRouterProvider.tsx | settings | ⚪ |
| `settings.providers.openrouter.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.qwen-code.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.qwen.description` | QwenProvider.tsx | settings | ⚪ |
| `settings.providers.qwen.name` | ApiOptions.tsx, QwenProvider.tsx | settings | 🔥 |
| `settings.providers.qwenCode.description` | QwenCodeProvider.tsx | settings | ⚪ |
| `settings.providers.requesty.description` | RequestyProvider.tsx | settings | ⚪ |
| `settings.providers.requesty.name` | ApiOptions.tsx, RequestyProvider.tsx | settings | 🔥 |
| `settings.providers.sambanova.description` | SambanovaProvider.tsx | settings | ⚪ |
| `settings.providers.sambanova.name` | ApiOptions.tsx, SambanovaProvider.tsx | settings | 🔥 |
| `settings.providers.sapAiCore.description` | SapAiCoreProvider.tsx | settings | ⚪ |
| `settings.providers.sapaicore.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.together.description` | TogetherProvider.tsx | settings | ⚪ |
| `settings.providers.together.name` | ApiOptions.tsx, TogetherProvider.tsx | settings | 🔥 |
| `settings.providers.vercel-ai-gateway.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.vercelAiGateway.description` | VercelAIGatewayProvider.tsx | settings | ⚪ |
| `settings.providers.vertex.description` | VertexProvider.tsx | settings | ⚪ |
| `settings.providers.vertex.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.vscode-lm.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.vsCodeLm.description` | VSCodeLmProvider.tsx | settings | ⚪ |
| `settings.providers.xai.description` | XaiProvider.tsx | settings | ⚪ |
| `settings.providers.xai.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.providers.zai.description` | ZAiProvider.tsx | settings | ⚪ |
| `settings.providers.zai.name` | ApiOptions.tsx | settings | ⚪ |
| `settings.qwenProvider.apiLineOptions.${line}` | QwenProvider.tsx | settings | ⚪ |
| `true.redirect` | helpers.ts | true | ⚪ |

🔥 = 고우선순위 (여러 컴포넌트에서 사용)
⚪ = 저우선순위 (단일 컴포넌트 사용)


## 📂 컴포넌트 사용 분석

i18n 키를 사용하는 컴포넌트들:

Total components using i18n: **115**

| Component | Keys Used | Sample Keys |
|-----------|-----------|-------------|
| `settings\ApiOptions.tsx` | 40 | `settings.providers.caret.name`, `settings.providers.openrouter.name`, `settings.providers.gemini.name` (+37 more) |
| `chat\auto-approve-menu\constants.ts` | 33 | `settings.autoApprove.enableAutoApprove.label`, `settings.autoApprove.enableAutoApprove.shortName`, `settings.autoApprove.enableAutoApprove.description` (+30 more) |
| `settings\providers\BedrockProvider.tsx` | 30 | `settings.providers.bedrock.description`, `settings.bedrockProvider.apiKey`, `settings.bedrockProvider.awsProfile` (+27 more) |
| `chat\task-header\TaskTimelineTooltip.tsx` | 27 | `chat.taskTimelineTooltip.fileRead`, `chat.taskTimelineTooltip.fileEdit`, `chat.taskTimelineTooltip.newFile` (+24 more) |
| `settings\providers\SapAiCoreProvider.tsx` | 25 | `settings.sapAiCoreProvider.fetchModelsErrorLog`, `settings.sapAiCoreProvider.modelFetchError`, `settings.providers.sapAiCore.description` (+22 more) |
| `chat\ChatRow.tsx` | 24 | `chat.mcp.useServer`, `chat.error.label`, `chat.error.mistakeLimitReached` (+21 more) |
| `common\Demo.tsx` | 24 | `chat.demo.helloWorld`, `chat.demo.howdy`, `chat.demo.customHeaderTitle` (+21 more) |
| `settings\providers\OpenAICompatible.tsx` | 23 | `settings.openAiCompatibleProvider.azureApiVersionPlaceholder`, `settings.openAiCompatibleProvider.refreshModelsError`, `settings.providers.openAICompatible.description` (+20 more) |
| `settings\SettingsView.tsx` | 23 | `settings.tabs.apiConfiguration.name`, `settings.tabs.apiConfiguration.tooltip`, `settings.tabs.apiConfiguration.header` (+20 more) |
| `settings\sections\FeatureSettingsSection.tsx` | 22 | `settings.features.enableCheckpoints`, `settings.features.enableCheckpointsDescription`, `settings.features.enableMcpMarketplace` (+19 more) |
| `settings\sections\BrowserSettingsSection.tsx` | 20 | `settings.browser.checkingConnection`, `settings.browser.connected`, `settings.browser.notConnected` (+17 more) |
| `history\HistoryView.tsx` | 19 | `history.deleteSelected`, `history.deleteAllHistory`, `history.title` (+16 more) |
| `chat\Announcement.tsx` | 18 | `common.announcement.newVersion`, `common.announcement.features.freeStealth.title`, `common.announcement.features.freeStealth.description` (+15 more) |
| `mcp\configuration\tabs\installed\server-row\ServerRow.tsx` | 18 | `chat.serverRow.timeout30Seconds`, `chat.serverRow.timeout1Minute`, `chat.serverRow.timeout5Minutes` (+15 more) |
| `settings\providers\LiteLlmProvider.tsx` | 18 | `settings.liteLlmProvider.baseUrlPlaceholder`, `settings.baseUrlField.label`, `settings.liteLlmProvider.apiKeyPlaceholder` (+15 more) |
| `settings\providers\OpenRouterProvider.tsx` | 18 | `settings.openRouterProvider.balanceDisplay.tooltip`, `settings.openRouterProvider.balanceDisplay.label`, `settings.openRouterProvider.balanceDisplay.loading` (+15 more) |
| `settings\common\ModelInfoView.tsx` | 16 | `settings.modelInfoView.millionTokensLabel`, `settings.modelInfoView.tokensSuffix`, `settings.modelInfoView.inputPrice` (+13 more) |
| `settings\providers\OllamaProvider.tsx` | 16 | `settings.ollamaProvider.fetchModelsErrorLog`, `settings.providers.ollama.description`, `settings.ollamaProvider.baseUrlLabel` (+13 more) |
| `chat\task-header\TaskHeader.tsx` | 15 | `chat.taskHeader.allStepsCompleted`, `chat.taskHeader.task`, `chat.taskHeader.closeTask` (+12 more) |
| `chat\chat-view\shared\buttonConfig.ts` | 14 | `common.button.retry`, `chat.startNewTask`, `common.button.proceedAnyways` (+11 more) |
| `mcp\configuration\tabs\add-server\AddRemoteServerForm.tsx` | 14 | `chat.addRemoteServerForm.serverNameRequired`, `chat.addRemoteServerForm.serverUrlRequired`, `chat.addRemoteServerForm.invalidUrlFormat` (+11 more) |
| `mcp\configuration\tabs\marketplace\McpMarketplaceView.tsx` | 13 | `chat.mcpMarketplaceView.failedToLoadMarketplaceData`, `chat.mcpMarketplaceView.retry`, `chat.mcpMarketplaceView.searchMcps` (+10 more) |
| `settings\providers\CaretProvider.tsx` | 13 | `settings.providers.caret.loginError`, `settings.providers.caret.description`, `settings.providers.caret.login` (+10 more) |
| `settings\sections\TerminalSettingsSection.tsx` | 13 | `settings.terminal.positiveNumberError`, `settings.terminal.defaultProfile`, `settings.terminal.defaultProfileDescription` (+10 more) |
| `chat\ChatTextArea.tsx` | 12 | `chat.mode.tooltip.toggle`, `chat.mode.tooltip.description`, `chat.image.dimensionError` (+9 more) |
| `mcp\chat-display\LinkPreview.tsx` | 12 | `chat.linkPreview.loadingPreviewFor`, `chat.linkPreview.waitingForMinutesSeconds`, `chat.linkPreview.waitingForSeconds` (+9 more) |
| `settings\providers\QwenCodeProvider.tsx` | 12 | `settings.providers.qwenCode.description`, `settings.qwenCodeProvider.apiConfigurationTitle`, `settings.qwenCodeProvider.oauthCredentialsPathPlaceholder` (+9 more) |
| `cline-rules\ClineRulesToggleModal.tsx` | 11 | `chat.clineRulesToggleModal.manageRulesWorkflows`, `chat.clineRulesToggleModal.rulesTab`, `chat.clineRulesToggleModal.workflowsTab` (+8 more) |
| `settings\providers\VercelAIGatewayProvider.tsx` | 11 | `settings.vercelAiGatewayProvider.fetchModelsErrorLog`, `settings.providers.vercelAiGateway.description`, `settings.apiKeyField.placeholder` (+8 more) |
| `account\CreditsHistoryTable.tsx` | 10 | `common.account.usageHistory`, `common.account.paymentsHistory`, `common.account.loading` (+7 more) |
| `chat\ErrorRow.tsx` | 10 | `chat.errorRow.requestId`, `chat.errorRow.powershellIssue`, `chat.errorRow.troubleshootingGuide` (+7 more) |
| `mcp\chat-display\ImagePreview.tsx` | 10 | `chat.imagePreview.timeoutLoadingImage`, `chat.imagePreview.failedToLoadImage`, `chat.imagePreview.loadingImageFrom` (+7 more) |
| `settings\providers\XaiProvider.tsx` | 10 | `settings.providers.xai.description`, `settings.xaiProvider.providerName`, `settings.xaiProvider.notePrefix` (+7 more) |
| `account\AccountView.tsx` | 9 | `common.account.title`, `common.button.done`, `common.account.failedToFetchUserCredit` (+6 more) |
| `chat\ContextMenu.tsx` | 9 | `chat.contextMenu.problems`, `chat.contextMenu.terminal`, `chat.contextMenu.pasteUrlToFetchContents` (+6 more) |
| `chat\ErrorBlockTitle.tsx` | 9 | `chat.errorBlockTitle.apiRetryAttempt`, `chat.errorBlockTitle.inSeconds`, `chat.errorBlockTitle.ellipsis` (+6 more) |
| `chat\ReportBugPreview.tsx` | 9 | `chat.bugReport.title`, `chat.bugReport.whatHappened`, `chat.bugReport.stepsToReproduce` (+6 more) |
| `mcp\configuration\McpConfigurationView.tsx` | 9 | `chat.brandMarketplace.preparing`, `chat.brandMarketplace.preparingDescription`, `chat.mcpConfigurationView.mcpServers` (+6 more) |
| `settings\BasetenModelPicker.tsx` | 9 | `settings.basetenModelPicker.modelNotStatic`, `settings.basetenModelPicker.fetchModelsError`, `settings.modelSelector.label` (+6 more) |
| `settings\providers\ClineProvider.tsx` | 9 | `settings.clineProvider.sortUnderlyingProviderRouting`, `settings.clineProvider.defaultOption`, `settings.clineProvider.priceOption` (+6 more) |
| `account\AccountWelcomeView.tsx` | 8 | `common.account.signUpDescription`, `common.account.signUpWithCaret`, `common.account.byContining` (+5 more) |
| `common\CheckmarkControl.tsx` | 8 | `chat.checkmarkControl.compare`, `chat.checkmarkControl.restore`, `chat.checkmarkControl.restoreFiles` (+5 more) |
| `common\CheckpointControls.tsx` | 8 | `chat.checkpointControls.compare`, `chat.checkpointControls.restore`, `chat.checkpointControls.restoreTaskAndWorkspace` (+5 more) |
| `mcp\configuration\tabs\installed\InstalledServersView.tsx` | 8 | `chat.installedServersView.descriptionPart1`, `chat.installedServersView.modelContextProtocol`, `chat.installedServersView.descriptionPart2` (+5 more) |
| `settings\GroqModelPicker.tsx` | 8 | `settings.groqModelPicker.fetchModelsError`, `settings.groqModelPicker.fetchModelsDescription`, `settings.groqModelPicker.groqLinkText` (+5 more) |
| `settings\providers\LMStudioProvider.tsx` | 8 | `settings.lmStudioProvider.parseModelsError`, `settings.providers.lmstudio.description`, `settings.baseUrlField.label` (+5 more) |
| `history\HistoryPreview.tsx` | 7 | `chat.historyPreview.tokens`, `chat.historyPreview.cache`, `chat.historyPreview.apiCost` (+4 more) |
| `chat\auto-approve-menu\AutoApproveModal.tsx` | 6 | `settings.autoApprove.description`, `settings.autoApprove.title`, `settings.autoApprove.actionsHeader` (+3 more) |
| `chat\ChatView.tsx` | 6 | `chat.errorSelectingFilesImages`, `chat.clientIdNotFound`, `chat.errorInAddToInputSubscription` (+3 more) |
| `cline-rules\NewRuleRow.tsx` | 6 | `chat.newRuleRow.invalidExtensionError`, `chat.newRuleRow.workflowPlaceholder`, `chat.newRuleRow.rulePlaceholder` (+3 more) |
| `common\TelemetryBanner.tsx` | 6 | `chat.telemetryBanner.closeAndEnable`, `chat.telemetryBanner.helpImproveCline`, `chat.telemetryBanner.accessExperimentalFeatures` (+3 more) |
| `settings\providers\AnthropicProvider.tsx` | 6 | `settings.anthropicProvider.switchTo1MContext`, `settings.anthropicProvider.switchTo200KContext`, `settings.providers.anthropic.description` (+3 more) |
| `settings\providers\QwenProvider.tsx` | 6 | `settings.providers.qwen.description`, `settings.qwenProvider.apiLineLabel`, `settings.qwenProvider.apiLineOptions.${line}` (+3 more) |
| `settings\providers\TogetherProvider.tsx` | 6 | `settings.providers.together.description`, `settings.providers.together.name`, `settings.togetherProvider.modelIdPlaceholder` (+3 more) |
| `common\AlertDialog.tsx` | 5 | `chat.alertDialog.unsavedChangesTitle`, `chat.alertDialog.unsavedChangesDescription`, `chat.alertDialog.discardChanges` (+2 more) |
| `common\MarkdownBlock.tsx` | 5 | `chat.markdownBlock.openFileInEditor`, `chat.markdownBlock.clickToToggleActMode`, `chat.markdownBlock.alreadyInActMode` (+2 more) |
| `mcp\configuration\tabs\add-server\AddLocalServerForm.tsx` | 5 | `chat.addLocalServerForm.addLocalServerDescriptionPart1`, `chat.addLocalServerForm.clineMcpSettingsJson`, `chat.addLocalServerForm.addLocalServerDescriptionPart2` (+2 more) |
| `settings\providers\AskSageProvider.tsx` | 5 | `settings.providers.asksage.description`, `settings.askSageProvider.apiKeyHelpText`, `settings.askSageProvider.apiUrlPlaceholder` (+2 more) |
| `settings\providers\ClaudeCodeProvider.tsx` | 5 | `settings.providers.claude-code.description`, `settings.providers.claudeCode.cliPathPlaceholder`, `settings.providers.claudeCode.cliPath` (+2 more) |
| `settings\providers\GeminiProvider.tsx` | 5 | `settings.providers.gemini.description`, `settings.providers.gemini.name`, `settings.baseUrlField.label` (+2 more) |
| `settings\providers\HuggingFaceProvider.tsx` | 5 | `settings.providers.huggingface.description`, `settings.huggingFaceProvider.apiKeyPlaceholder`, `settings.huggingFaceProvider.apiKeyLabel` (+2 more) |
| `settings\providers\MoonshotProvider.tsx` | 5 | `settings.providers.moonshot.description`, `settings.moonshotProvider.entrypoint`, `settings.apiKeyField.defaultHelpText` (+2 more) |
| `settings\providers\ZAiProvider.tsx` | 5 | `settings.providers.zai.description`, `settings.zaiProvider.entrypointLabel`, `settings.zaiProvider.entrypointDescription` (+2 more) |
| `chat\ChatErrorBoundary.tsx` | 4 | `chat.error.unknown`, `settings.debug.errorInSeconds`, `chat.error.displayContent` (+1 more) |
| `chat\UserMessage.tsx` | 4 | `chat.userMessage.restoreAll`, `chat.userMessage.restoreAllTooltip`, `chat.userMessage.restoreChat` (+1 more) |
| `settings\HuggingFaceModelPicker.tsx` | 4 | `settings.huggingFaceModelPicker.fetchModelsError`, `settings.huggingFaceModelPicker.modelLabel`, `settings.huggingFaceModelPicker.searchPlaceholder` (+1 more) |
| `settings\providers\DifyProvider.tsx` | 4 | `settings.providers.dify.description`, `settings.providers.dify.baseUrlPlaceholder`, `settings.providers.dify.baseUrlLabel` (+1 more) |
| `settings\providers\NebiusProvider.tsx` | 4 | `settings.providers.nebius.description`, `settings.nebiusProvider.apiKeyHelpText`, `settings.providers.nebius.name` (+1 more) |
| `settings\providers\RequestyProvider.tsx` | 4 | `settings.providers.requesty.description`, `settings.providers.requesty.name`, `settings.requestyProvider.useCustomBaseUrlLabel` (+1 more) |
| `settings\sections\ApiConfigurationSection.tsx` | 4 | `settings.planMode`, `settings.actMode`, `settings.useDifferentModels` (+1 more) |
| `settings\__tests__\SapAiCoreModelPicker.spec.tsx` | 4 | `Select a model...`, `Choose SAP AI Core model...`, `anthropic--claude-3.5-sonnet` (+1 more) |
| `account\CreditBalance.tsx` | 3 | `common.account.lastUpdated`, `common.account.currentBalance`, `common.account.addCredits` |
| `chat\CreditLimitError.tsx` | 3 | `chat.creditLimitError.outOfCredits`, `chat.creditLimitError.buyCredits`, `chat.creditLimitError.retryRequest` |
| `mcp\chat-display\McpResponseDisplay.tsx` | 3 | `chat.mcpResponseDisplay.response`, `chat.mcpResponseDisplay.responseError`, `chat.mcpResponseDisplay.errorParsingResponse` |
| `mcp\configuration\tabs\installed\server-row\McpResourceRow.tsx` | 3 | `chat.mcpResourceRow.noDescription`, `chat.mcpResourceRow.returns`, `chat.mcpResourceRow.unknown` |
| `mcp\configuration\tabs\installed\server-row\McpToolRow.tsx` | 3 | `chat.mcpToolRow.autoApprove`, `chat.mcpToolRow.parameters`, `chat.mcpToolRow.noDescription` |
| `settings\ClineAccountInfoCard.tsx` | 3 | `settings.clineAccountInfoCard.loginError`, `settings.clineAccountInfoCard.viewBillingAndUsage`, `settings.clineAccountInfoCard.signUpWithCline` |
| `settings\PreferredLanguageSetting.tsx` | 3 | `settings.preferredLanguage.changeError`, `settings.preferredLanguage.label`, `settings.preferredLanguage.description` |
| `settings\providers\CerebrasProvider.tsx` | 3 | `settings.providers.cerebras.description`, `settings.providers.cerebras.name`, `settings.modelSelector.label` |
| `settings\providers\DeepSeekProvider.tsx` | 3 | `settings.providers.deepseek.description`, `settings.providers.deepseek.name`, `settings.modelSelector.label` |
| `settings\providers\DoubaoProvider.tsx` | 3 | `settings.providers.doubao.description`, `settings.providers.doubao.name`, `settings.doubaoProvider.modelLabel` |
| `settings\providers\FireworksProvider.tsx` | 3 | `settings.providers.fireworks.description`, `settings.providers.fireworks.name`, `settings.modelSelector.label` |
| `settings\providers\HuaweiCloudMaasProvider.tsx` | 3 | `settings.providers.huawei-cloud-maas.description`, `settings.providers.huawei-cloud-maas.name`, `settings.modelSelector.label` |
| `settings\providers\MistralProvider.tsx` | 3 | `settings.providers.mistral.description`, `settings.providers.mistral.name`, `settings.modelSelector.label` |
| `settings\providers\OpenAINative.tsx` | 3 | `settings.providers.openai-native.description`, `settings.providers.openai-native.name`, `settings.modelSelector.label` |
| `settings\providers\SambanovaProvider.tsx` | 3 | `settings.providers.sambanova.description`, `settings.providers.sambanova.name`, `settings.modelSelector.label` |
| `settings\sections\AboutSection.tsx` | 3 | `settings.about.version`, `settings.about.description`, `settings.about.link` |
| `settings\sections\DebugSection.tsx` | 3 | `settings.debug.resetWorkspaceState`, `settings.debug.resetGlobalState`, `settings.debug.resetGlobalStateDescription` |
| `welcome\HomeHeader.tsx` | 3 | `common.welcome.whatCanIDo`, `welcome.tooltipContent`, `welcome.takeATour` |
| `welcome\WelcomeView.tsx` | 3 | `common.imageAlt.caretBanner`, `welcome.coreFeatures.header`, `welcome.getStarted.button` |
| `account\helpers.ts` | 2 | `credits.tab`, `true.redirect` |
| `chat\auto-approve-menu\AutoApproveMenuItem.tsx` | 2 | `autoApprove.removeQuickAccess`, `autoApprove.addQuickAccess` |
| `chat\chat-view\components\layout\ActionButtons.tsx` | 2 | `common.scrollToBottom`, `chat.startNewTask` |
| `chat\ServersToggleModal.tsx` | 2 | `chat.serversToggleModal.manageMcpServers`, `chat.serversToggleModal.mcpServers` |
| `chat\task-header\buttons\DeleteTaskButton.tsx` | 2 | `common.task.deleteTask`, `common.task.deleteTaskAriaLabel` |
| `chat\TaskFeedbackButtons.tsx` | 2 | `chat.taskFeedbackButtons.thisWasHelpful`, `chat.taskFeedbackButtons.thisWasNotHelpful` |
| `cline-rules\RuleRow.tsx` | 2 | `chat.ruleRow.editRuleFile`, `chat.ruleRow.deleteRuleFile` |
| `cline-rules\RulesToggleList.tsx` | 2 | `chat.rulesToggleList.noWorkflowsFound`, `chat.rulesToggleList.noRulesFound` |
| `common\CodeAccordian.tsx` | 2 | `chat.codeAccordian.userEdits`, `chat.codeAccordian.consoleLogs` |
| `common\CopyButton.tsx` | 2 | `chat.copyButton.copied`, `chat.copyButton.copy` |
| `common\MermaidBlock.tsx` | 2 | `chat.mermaidBlock.generatingDiagram`, `chat.mermaidBlock.copyCode` |
| `settings\OllamaModelPicker.tsx` | 2 | `settings.ollamaModelPicker.searchPlaceholder`, `settings.ollamaModelPicker.clearSearch` |
| `settings\providers\GroqProvider.tsx` | 2 | `settings.providers.groq.description`, `settings.providers.groq.name` |
| `account\AccountOptions.tsx` | 1 | `account.failedToGetLoginUrl` |
| `chat\auto-approve-menu\AutoApproveBar.tsx` | 1 | `common.autoApprove.autoApproveLabel` |
| `chat\ErrorRow.test.tsx` | 1 | `../../../../src/services/error/ClineError` |
| `chat\SlashCommandMenu.tsx` | 1 | `chat.slashCommandMenu.noMatchingCommandsFound` |
| `chat\task-header\buttons\CopyTaskButton.tsx` | 1 | `common.task.copyTask` |
| `chat\task-header\buttons\OpenDiskTaskHistoryButton.tsx` | 1 | `chat.openDiskTaskHistoryButton.openDiskTaskHistory` |
| `common\Thumbnails.tsx` | 1 | `chat.thumbnails.thumbnailImage` |
| `mcp\configuration\tabs\installed\ServersToggleList.tsx` | 1 | `chat.serversToggleList.noMcpServersInstalled` |
| `settings\ModelDescriptionMarkdown.tsx` | 1 | `settings.modelPicker.seeMore` |
| `settings\providers\BasetenProvider.tsx` | 1 | `settings.providers.baseten.description` |
| `settings\providers\VertexProvider.tsx` | 1 | `settings.providers.vertex.description` |
| `settings\providers\VSCodeLmProvider.tsx` | 1 | `settings.providers.vsCodeLm.description` |


## 🛠️ 정리 권장사항

### 🗑️ 미사용 키 제거
- **작업**: locale 파일에서 4개의 미사용 키 제거
- **효과**: 번들 크기 감소 및 유지보수 부담 경감
- **우선순위**: 낮음 (향후 기능을 위한 플레이스홀더가 아닌 경우)

### 🌍 누락 번역 완성
- **작업**: 14개의 누락된 번역 추가
- **고우선순위**: 11개 (현재 사용중인 키들)
- **효과**: 비영어권 사용자 경험 향상

### 📋 유지보수 모범 사례
- **정기 정리**: 이 스크립트를 매월 실행하여 미사용 키 식별
- **번역 워크플로우**: 모든 새 키가 전체 언어로 번역되도록 보장
- **코드 리뷰**: 하드코딩된 문자열 대신 i18n 키 사용 확인
- **테스팅**: i18n 통합이 기존 기능을 손상시키지 않는지 검증

## 📋 t03-3 작업 진행 현황

이 보고서는 **머징 작업 후 i18n 시스템 관리**를 위한 3가지 핵심 분석을 제공합니다.

## 📋 i18n 시스템 관리 체크리스트

### 2.1. [ ] 누락 번역 분석 
**목적**: 일부 언어에서만 번역이 누락된 키들을 식별하여 완전한 다국어 지원 보장
**필요 처리**: 
- 고우선순위(🔥 사용중인 키) 번역 우선 추가
- 저우선순위(⚪ 미사용 키) 번역은 2.3 작업 후 결정
- 누락된 locale 파일에 해당 키와 번역 추가
**현재 상태**: 14개 키에서 번역 누락

### 2.2. [ ] 정의되지 않은 키 탐지
**목적**: 코드에서 t() 함수로 사용하지만 JSON 파일에 정의되지 않은 키들을 식별
**필요 처리**: 
- 각 컴포넌트 파일에서 사용하는 t() 키들을 수동 확인
- 해당 키가 locale JSON 파일에 존재하는지 검증
- 누락된 키들을 적절한 namespace JSON 파일에 추가
**현재 상태**: AccountView.tsx 등 "완료"로 표시된 파일에서도 다수 키 누락 확인됨

### 2.3. [ ] 미사용 키 탐지 (정리 작업)
**목적**: JSON 파일에 정의되어 있지만 실제 코드에서 사용되지 않는 키들을 식별하여 정리
**필요 처리**: 
- 미사용 키 4개에 대한 검토
- 향후 사용 예정인지, 레거시 키인지 판단
- 확실한 불필요 키들은 locale 파일에서 제거
- 번들 크기 최적화 및 유지보수성 향상
**현재 상태**: 4개 미사용 키 탐지 (사용률 99.4%)

## 🔄 권장 작업 순서
1. **2.1 → 2.2**: 현재 사용 중인 시스템 완성 (번역 누락 + 키 정의 누락)
2. **2.3**: 시스템 완성 후 불필요한 키 정리
3. **검증**: 전체 시스템 테스트 및 빌드 확인

## 🔧 스크립트 사용법

이 보고서를 다시 생성하려면:
```bash
node caret-scripts/tools/report-i18n-unused-key.js
```

## 📋 설정 정보

- **지원 언어**: ko, en, ja, zh
- **네임스페이스**: announcement, chat, common, models, persona, settings, validate-api-conf, welcome
- **컴포넌트 디렉토리**: `D:\dev\caret-merging\webview-ui\src\components`
- **Locale 디렉토리**: `D:\dev\caret-merging\webview-ui\src\caret\locale`

---
*Caret i18n 분석 도구로 생성됨*
