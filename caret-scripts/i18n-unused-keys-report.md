# i18n 미사용 키 분석 보고서

**생성일시**: 2025-09-13 07:53:48
**분석기**: report-i18n-unused-key.js
**프로젝트**: Caret 프론트엔드 i18n 시스템

## 📊 요약 통계

- **총 키 개수**: 1736개
- **사용중인 키**: 835개
- **미사용 키**: 901개
- **스캔한 파일**: 189개
- **사용률**: 48.1%

## 🗑️ 미사용 키 목록 (901개)

locale 파일에 정의되어 있지만 컴포넌트에서 참조되지 않는 키들:

| Key | Namespace | Available Locales | Count |
|-----|-----------|------------------|-------|
| `bullets.current.1-desc` | announcement | en, ja, zh | 3 |
| `bullets.current.2-desc` | announcement | en, ja, zh | 3 |
| `bullets.current.3-desc` | announcement | en, ja, zh | 3 |
| `bullets.current.4-desc` | announcement | ko | 1 |
| `bullets.current.4-desc` | announcement | en, ja, zh | 3 |
| `bullets.current.5-desc` | announcement | en, ja, zh | 3 |
| `bullets.previous.1-desc` | announcement | en, ja, zh | 3 |
| `bullets.previous.2-desc` | announcement | en, ja, zh | 3 |
| `bullets.previous.3-desc` | announcement | en, ja, zh | 3 |
| `bullets.previous.4-desc` | announcement | en, ja, zh | 3 |
| `header` | announcement | ko, en, ja, zh | 4 |
| `previousHeader` | announcement | ko, en, ja, zh | 4 |
| `brandMarketplace.caretPreparing` | chat | ko, en, ja, zh | 4 |
| `brandMarketplace.caretPreparingDescription` | chat | ko, en, ja, zh | 4 |
| `clineRulesToggleModal.workspaceRules` | chat | ko, en, ja, zh | 4 |
| `historyView.clearSearch` | chat | ko, en, ja, zh | 4 |
| `historyView.deleteAllHistory` | chat | ko, en, ja, zh | 4 |
| `historyView.deleteAllHistoryWithSize` | chat | ko, en, ja, zh | 4 |
| `historyView.deleteSelected` | chat | ko, en, ja, zh | 4 |
| `historyView.deleteSelectedWithCount` | chat | ko, en, ja, zh | 4 |
| `historyView.done` | chat | ko, en, ja, zh | 4 |
| `historyView.export` | chat | ko, en, ja, zh | 4 |
| `historyView.favorites` | chat | ko, en, ja, zh | 4 |
| `historyView.fuzzySearchPlaceholder` | chat | ko, en, ja, zh | 4 |
| `historyView.history` | chat | ko, en, ja, zh | 4 |
| `historyView.mostExpensive` | chat | ko, en, ja, zh | 4 |
| `historyView.mostRelevant` | chat | ko, en, ja, zh | 4 |
| `historyView.mostTokens` | chat | ko, en, ja, zh | 4 |
| `historyView.newest` | chat | ko, en, ja, zh | 4 |
| `historyView.oldest` | chat | ko, en, ja, zh | 4 |
| `historyView.selectAll` | chat | ko, en, ja, zh | 4 |
| `historyView.selectedWithSize` | chat | ko, en, ja, zh | 4 |
| `historyView.selectNone` | chat | ko, en, ja, zh | 4 |
| `historyView.workspace` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.communityMadeWarning` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.install` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.installed` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.installing` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.logoAlt` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.requiresApiKey` | chat | ko, en, ja, zh | 4 |
| `mcpResponseDisplay.loadingRichContent` | chat | ko, en, ja, zh | 4 |
| `mcpSubmitCard.helpOthersDiscover` | chat | ko, en, ja, zh | 4 |
| `mcpSubmitCard.submitMcpServer` | chat | ko, en, ja, zh | 4 |
| `mode.tooltip.act.action` | chat | ko, en, ja, zh | 4 |
| `mode.tooltip.plan.action` | chat | ko, en, ja, zh | 4 |
| `slashCommandMenu.defaultCommands` | chat | ko, en, ja, zh | 4 |
| `slashCommandMenu.workflowCommands` | chat | ko, en, ja, zh | 4 |
| `taskHeader.allStepsCompleted` | chat | ko, en, ja, zh | 4 |
| `taskHeader.cache` | chat | ko, en, ja, zh | 4 |
| `taskHeader.closeTask` | chat | ko, en, ja, zh | 4 |
| `taskHeader.completionTokens` | chat | ko, en, ja, zh | 4 |
| `taskHeader.disablingCheckpoints` | chat | ko, en, ja, zh | 4 |
| `taskHeader.editFocusChainList` | chat | ko, en, ja, zh | 4 |
| `taskHeader.newStepsGenerated` | chat | ko, en, ja, zh | 4 |
| `taskHeader.promptTokens` | chat | ko, en, ja, zh | 4 |
| `taskHeader.seeHereForInstructions` | chat | ko, en, ja, zh | 4 |
| `taskHeader.seeLess` | chat | ko, en, ja, zh | 4 |
| `taskHeader.seeMore` | chat | ko, en, ja, zh | 4 |
| `taskHeader.task` | chat | ko, en, ja, zh | 4 |
| `taskHeader.tokens` | chat | ko, en, ja, zh | 4 |
| `taskHeader.tokensReadFromCache` | chat | ko, en, ja, zh | 4 |
| `taskHeader.tokensWrittenToCache` | chat | ko, en, ja, zh | 4 |
| `tool.commandApprovalRequired` | chat | ko, en, ja, zh | 4 |
| `tool.commandOutput` | chat | ko, en, ja, zh | 4 |
| `tool.condenseConversation` | chat | ko, en, ja, zh | 4 |
| `tool.createGithubIssue` | chat | ko, en, ja, zh | 4 |
| `tool.mcpLoadingDocumentation` | chat | ko, en, ja, zh | 4 |
| `tool.mcpNotification` | chat | ko, en, ja, zh | 4 |
| `tool.seeNewChanges` | chat | ko, en, ja, zh | 4 |
| `tool.shellIntegration.description` | chat | ko, en, ja, zh | 4 |
| `tool.shellIntegration.troubleshooting` | chat | ko, en, ja, zh | 4 |
| `tool.shellIntegration.unavailable` | chat | ko, en, ja, zh | 4 |
| `tool.thinking.label` | chat | ko, en, ja, zh | 4 |
| `account.organization` | common | ko, en, ja, zh | 4 |
| `account.payAsYouGo` | common | ko, en, ja, zh | 4 |
| `account.payAsYouGoDescription` | common | ko, en, ja, zh | 4 |
| `account.subscription` | common | ko, en, ja, zh | 4 |
| `account.subscriptionBasic` | common | ko, en, ja, zh | 4 |
| `account.subscriptionFree` | common | ko, en, ja, zh | 4 |
| `account.viewBillingUsage` | common | ko, en, ja, zh | 4 |
| `announcement.features.autoCompact.description` | common | ko, en, ja, zh | 4 |
| `announcement.features.autoCompact.title` | common | ko, en, ja, zh | 4 |
| `announcement.features.deepPlanning.description` | common | ko, en, ja, zh | 4 |
| `announcement.features.deepPlanning.title` | common | ko, en, ja, zh | 4 |
| `announcement.features.focusChain.description` | common | ko, en, ja, zh | 4 |
| `announcement.features.focusChain.title` | common | ko, en, ja, zh | 4 |
| `announcement.features.freeStealth.description` | common | ko, en, ja, zh | 4 |
| `announcement.features.freeStealth.title` | common | ko, en, ja, zh | 4 |
| `announcement.forMoreUpdates` | common | ko, en, ja, zh | 4 |
| `announcement.joinUs` | common | ko, en, ja, zh | 4 |
| `announcement.previousFeatures.claude1M.description` | common | ko, en, ja, zh | 4 |
| `announcement.previousFeatures.claude1M.title` | common | ko, en, ja, zh | 4 |
| `announcement.previousFeatures.optimizedClaude4-description` | common | ko, en, ja, zh | 4 |
| `announcement.previousFeatures.optimizedClaude4.title` | common | ko, en, ja, zh | 4 |
| `announcement.previousFeatures.workflows.description` | common | ko, en, ja, zh | 4 |
| `announcement.previousFeatures.workflows.title` | common | ko, en, ja, zh | 4 |
| `apiOptions.alibabaApiLine` | common | ko, en, ja, zh | 4 |
| `apiOptions.anthropicApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.anthropicBaseUrl` | common | ko, en, ja, zh | 4 |
| `apiOptions.anthropicBaseUrlPlaceholder` | common | ko, en, ja, zh | 4 |
| `apiOptions.apiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.apiProvider` | common | ko, en, ja, zh | 4 |
| `apiOptions.askSageApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.askSageApiUrl` | common | ko, en, ja, zh | 4 |
| `apiOptions.awsAccessKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.awsCredentials` | common | ko, en, ja, zh | 4 |
| `apiOptions.awsProfile` | common | ko, en, ja, zh | 4 |
| `apiOptions.awsProfileName` | common | ko, en, ja, zh | 4 |
| `apiOptions.awsProfilePlaceholder` | common | ko, en, ja, zh | 4 |
| `apiOptions.awsRegion` | common | ko, en, ja, zh | 4 |
| `apiOptions.awsSecretKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.awsSessionToken` | common | ko, en, ja, zh | 4 |
| `apiOptions.baseInferenceModel` | common | ko, en, ja, zh | 4 |
| `apiOptions.caretComplexPrompts` | common | ko, en, ja, zh | 4 |
| `apiOptions.chinaApi` | common | ko, en, ja, zh | 4 |
| `apiOptions.comingSoon` | common | ko, en, ja, zh | 4 |
| `apiOptions.custom` | common | ko, en, ja, zh | 4 |
| `apiOptions.deepSeekApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.defaultAnthropicUrl` | common | ko, en, ja, zh | 4 |
| `apiOptions.doubaoApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.enterAccessKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.enterApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.enterAskSageUrl` | common | ko, en, ja, zh | 4 |
| `apiOptions.enterCustomModelId` | common | ko, en, ja, zh | 4 |
| `apiOptions.enterModelId` | common | ko, en, ja, zh | 4 |
| `apiOptions.enterProjectId` | common | ko, en, ja, zh | 4 |
| `apiOptions.enterSecretKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.enterSessionToken` | common | ko, en, ja, zh | 4 |
| `apiOptions.enterVpcEndpoint` | common | ko, en, ja, zh | 4 |
| `apiOptions.fireworksApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.gcpProjectId` | common | ko, en, ja, zh | 4 |
| `apiOptions.gcpRegion` | common | ko, en, ja, zh | 4 |
| `apiOptions.geminiApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.geminiModelCostEffective` | common | ko, en, ja, zh | 4 |
| `apiOptions.geminiModelStrong` | common | ko, en, ja, zh | 4 |
| `apiOptions.getAnthropicApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.getApiKeySignUp` | common | ko, en, ja, zh | 4 |
| `apiOptions.getGeminiApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.getOpenAiApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.internationalApi` | common | ko, en, ja, zh | 4 |
| `apiOptions.languageModel` | common | ko, en, ja, zh | 4 |
| `apiOptions.loading` | common | ko, en, ja, zh | 4 |
| `apiOptions.maxCompletionTokens` | common | ko, en, ja, zh | 4 |
| `apiOptions.maxContextTokens` | common | ko, en, ja, zh | 4 |
| `apiOptions.millionTokens` | common | ko, en, ja, zh | 4 |
| `apiOptions.mistralApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.model` | common | ko, en, ja, zh | 4 |
| `apiOptions.modelId` | common | ko, en, ja, zh | 4 |
| `apiOptions.note` | common | ko, en, ja, zh | 4 |
| `apiOptions.openAiApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.openRouterApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.openRouterRecommended` | common | ko, en, ja, zh | 4 |
| `apiOptions.providerComingSoon` | common | ko, en, ja, zh | 4 |
| `apiOptions.qwenApiKey` | common | ko, en, ja, zh | 4 |
| `apiOptions.reasoningEnabled` | common | ko, en, ja, zh | 4 |
| `apiOptions.selectModel` | common | ko, en, ja, zh | 4 |
| `apiOptions.selectRegion` | common | ko, en, ja, zh | 4 |
| `apiOptions.systemMessages.fetchedContentFromUrl` | common | ko, en, ja, zh | 4 |
| `apiOptions.systemMessages.taskCompleted` | common | ko, en, ja, zh | 4 |
| `apiOptions.systemMessages.viewedCodeDefinitions` | common | ko, en, ja, zh | 4 |
| `apiOptions.systemMessages.viewedFilesRecursively` | common | ko, en, ja, zh | 4 |
| `apiOptions.systemMessages.viewedTopLevelFiles` | common | ko, en, ja, zh | 4 |
| `apiOptions.systemMessages.wantsToFetchContentFromUrl` | common | ko, en, ja, zh | 4 |
| `apiOptions.systemMessages.wantsToSearchDirectory` | common | ko, en, ja, zh | 4 |
| `apiOptions.systemMessages.wantsToViewCodeDefinitions` | common | ko, en, ja, zh | 4 |
| `apiOptions.systemMessages.wantsToViewFilesRecursively` | common | ko, en, ja, zh | 4 |
| `apiOptions.systemMessages.wantsToViewTopLevelFiles` | common | ko, en, ja, zh | 4 |
| `apiOptions.thisKeyStoredLocally` | common | ko, en, ja, zh | 4 |
| `apiOptions.tokens` | common | ko, en, ja, zh | 4 |
| `apiOptions.useCustomBaseUrl` | common | ko, en, ja, zh | 4 |
| `apiSetup.backButton` | common | ko, en, ja, zh | 4 |
| `apiSetup.description` | common | ko, en, ja, zh | 4 |
| `apiSetup.help.button` | common | ko, en, ja, zh | 4 |
| `apiSetup.help.title` | common | ko, en, ja, zh | 4 |
| `apiSetup.instructions` | common | ko, en, ja, zh | 4 |
| `apiSetup.saveButton` | common | ko, en, ja, zh | 4 |
| `apiSetup.supportLinks.geminiCredit` | common | ko, en, ja, zh | 4 |
| `apiSetup.supportLinks.llmList` | common | ko, en, ja, zh | 4 |
| `apiSetup.title` | common | ko, en, ja, zh | 4 |
| `autoApprove.addQuickAccess` | common | ko, en, ja, zh | 4 |
| `autoApprove.removeQuickAccess` | common | ko, en, ja, zh | 4 |
| `browser.connectionInfo` | common | ko, en, ja, zh | 4 |
| `browser.popover.connected` | common | ko, en, ja, zh | 4 |
| `browser.popover.disconnected` | common | ko, en, ja, zh | 4 |
| `browser.popover.local` | common | ko, en, ja, zh | 4 |
| `browser.popover.remote` | common | ko, en, ja, zh | 4 |
| `browser.popover.remoteHostLabel` | common | ko, en, ja, zh | 4 |
| `browser.popover.statusLabel` | common | ko, en, ja, zh | 4 |
| `browser.popover.title` | common | ko, en, ja, zh | 4 |
| `browser.popover.typeLabel` | common | ko, en, ja, zh | 4 |
| `browserTool.description` | common | ko, en, ja, zh | 4 |
| `browserTool.launchButton` | common | ko, en, ja, zh | 4 |
| `browserTool.placeholder` | common | ko, en, ja, zh | 4 |
| `browserTool.title` | common | ko, en, ja, zh | 4 |
| `button.freeStart` | common | ko, en, ja, zh | 4 |
| `button.letsGo` | common | ko, en, ja, zh | 4 |
| `button.notifyCaretAccount` | common | ko, en, ja, zh | 4 |
| `button.saveAndStart` | common | ko, en, ja, zh | 4 |
| `button.setupApiOrLocal` | common | ko, en, ja, zh | 4 |
| `button.useOwnKey` | common | ko, en, ja, zh | 4 |
| `caretProvider.bestLabel` | common | ko, en, ja, zh | 4 |
| `caretProvider.futureProviders` | common | ko, en, ja, zh | 4 |
| `caretProvider.futureSupport` | common | ko, en, ja, zh | 4 |
| `caretProvider.geminiFlashDescription` | common | ko, en, ja, zh | 4 |
| `caretProvider.geminiFlashModel` | common | ko, en, ja, zh | 4 |
| `caretProvider.geminiProDescription` | common | ko, en, ja, zh | 4 |
| `caretProvider.geminiProModel` | common | ko, en, ja, zh | 4 |
| `caretProvider.modelLabel` | common | ko, en, ja, zh | 4 |
| `caretProvider.tagBest` | common | ko, en, ja, zh | 4 |
| `caretProvider.tagCostEffective` | common | ko, en, ja, zh | 4 |
| `caretProvider.valueLabel` | common | ko, en, ja, zh | 4 |
| `chat.addContext` | common | ko, en, ja, zh | 4 |
| `chat.addFilesImages` | common | ko, en, ja, zh | 4 |
| `chat.apiRequest` | common | ko, en, ja, zh | 4 |
| `chat.apiRequestCancelled` | common | ko, en, ja, zh | 4 |
| `chat.apiRequestFailed` | common | ko, en, ja, zh | 4 |
| `chat.apiRequestPending` | common | ko, en, ja, zh | 4 |
| `chat.apiStreamingFailed` | common | ko, en, ja, zh | 4 |
| `chat.cancel` | common | ko, en, ja, zh | 4 |
| `chat.caretHasQuestion` | common | ko, en, ja, zh | 4 |
| `chat.caretIsUsingBrowser` | common | ko, en, ja, zh | 4 |
| `chat.caretWantsToCreateNewFile` | common | ko, en, ja, zh | 4 |
| `chat.caretWantsToUseBrowser` | common | ko, en, ja, zh | 4 |
| `chat.commandApprovalRequired` | common | ko, en, ja, zh | 4 |
| `chat.commandOutput` | common | ko, en, ja, zh | 4 |
| `chat.dismissQuote` | common | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.apiRequest` | common | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.apiRequestFailed` | common | ko, en, ja, zh | 4 |
| `chat.errorLabel` | common | ko, en, ja, zh | 4 |
| `chat.executeCommand` | common | ko, en, ja, zh | 4 |
| `chat.image.dimensionError` | common | ko, en, ja, zh | 4 |
| `chat.image.unsupportedFileError` | common | ko, en, ja, zh | 4 |
| `chat.loadingMcpDocumentation` | common | ko, en, ja, zh | 4 |
| `chat.maxRequestsReached` | common | ko, en, ja, zh | 4 |
| `chat.mcpArguments` | common | ko, en, ja, zh | 4 |
| `chat.mcpNotification` | common | ko, en, ja, zh | 4 |
| `chat.mcpResource` | common | ko, en, ja, zh | 4 |
| `chat.mcpTool` | common | ko, en, ja, zh | 4 |
| `chat.mistakeLimitReached` | common | ko, en, ja, zh | 4 |
| `chat.placeholderHint` | common | ko, en, ja, zh | 4 |
| `chat.quoteSelection` | common | ko, en, ja, zh | 4 |
| `chat.quoteSelectionInReply` | common | ko, en, ja, zh | 4 |
| `chat.seeNewChanges` | common | ko, en, ja, zh | 4 |
| `chat.selectModelApiProvider` | common | ko, en, ja, zh | 4 |
| `chat.shellIntegrationUnavailable` | common | ko, en, ja, zh | 4 |
| `chat.shellIntegrationWarning` | common | ko, en, ja, zh | 4 |
| `chat.stillHavingTrouble` | common | ko, en, ja, zh | 4 |
| `chat.taskCompleted` | common | ko, en, ja, zh | 4 |
| `chat.thinking` | common | ko, en, ja, zh | 4 |
| `chat.tool.createFile` | common | ko, en, ja, zh | 4 |
| `chat.tool.editFile` | common | ko, en, ja, zh | 4 |
| `chat.tool.externalUrl` | common | ko, en, ja, zh | 4 |
| `chat.tool.listedCodeDefinitionNames` | common | ko, en, ja, zh | 4 |
| `chat.tool.listedFilesRecursive` | common | ko, en, ja, zh | 4 |
| `chat.tool.listedFilesTopLevel` | common | ko, en, ja, zh | 4 |
| `chat.tool.outsideWorkspace` | common | ko, en, ja, zh | 4 |
| `chat.tool.readFile` | common | ko, en, ja, zh | 4 |
| `chat.tool.searchFiles` | common | ko, en, ja, zh | 4 |
| `chat.tool.summarizeTask` | common | ko, en, ja, zh | 4 |
| `chat.tool.summary` | common | ko, en, ja, zh | 4 |
| `chat.tool.wantsToListCodeDefinitionNames` | common | ko, en, ja, zh | 4 |
| `chat.tool.wantsToListFilesRecursive` | common | ko, en, ja, zh | 4 |
| `chat.tool.wantsToListFilesTopLevel` | common | ko, en, ja, zh | 4 |
| `chat.tool.wantsToWebFetch` | common | ko, en, ja, zh | 4 |
| `chat.tool.webFetched` | common | ko, en, ja, zh | 4 |
| `chat.typeMessage` | common | ko, en, ja, zh | 4 |
| `chat.typeTaskHere` | common | ko, en, ja, zh | 4 |
| `chat.useMcpServer` | common | ko, en, ja, zh | 4 |
| `chat.wantsToCondense` | common | ko, en, ja, zh | 4 |
| `chat.wantsToCreateGithubIssue` | common | ko, en, ja, zh | 4 |
| `chat.wantsToStartNewTask` | common | ko, en, ja, zh | 4 |
| `checkmarkControl.checkpoint` | common | ko, en, ja, zh | 4 |
| `checkmarkControl.checkpointRestored` | common | ko, en, ja, zh | 4 |
| `checkmarkControl.compare` | common | ko, en, ja, zh | 4 |
| `checkmarkControl.restore` | common | ko, en, ja, zh | 4 |
| `checkmarkControl.restoreFiles` | common | ko, en, ja, zh | 4 |
| `checkmarkControl.restoreFilesAndTask` | common | ko, en, ja, zh | 4 |
| `checkmarkControl.restoreFilesAndTaskDescription` | common | ko, en, ja, zh | 4 |
| `checkmarkControl.restoreFilesDescription` | common | ko, en, ja, zh | 4 |
| `checkmarkControl.restoreTaskOnly` | common | ko, en, ja, zh | 4 |
| `checkmarkControl.restoreTaskOnlyDescription` | common | ko, en, ja, zh | 4 |
| `defaultValue` | common | ko, en, ja, zh | 4 |
| `error.anthropicApiKeyRequired` | common | ko, en, ja, zh | 4 |
| `error.apiKeyRequired` | common | ko, en, ja, zh | 4 |
| `error.geminiApiKeyRequired` | common | ko, en, ja, zh | 4 |
| `error.generic` | common | ko, en, ja, zh | 4 |
| `error.openaiApiKeyRequired` | common | ko, en, ja, zh | 4 |
| `history.deleteAllHistory` | common | ko, en, ja, zh | 4 |
| `history.filterFavorites` | common | ko, en, ja, zh | 4 |
| `history.filterWorkspace` | common | ko, en, ja, zh | 4 |
| `history.fuzzySearchPlaceholder` | common | ko, en, ja, zh | 4 |
| `history.selectAll` | common | ko, en, ja, zh | 4 |
| `history.selectNone` | common | ko, en, ja, zh | 4 |
| `history.sortMostExpensive` | common | ko, en, ja, zh | 4 |
| `history.sortMostRelevant` | common | ko, en, ja, zh | 4 |
| `history.sortMostTokens` | common | ko, en, ja, zh | 4 |
| `history.sortNewest` | common | ko, en, ja, zh | 4 |
| `history.sortOldest` | common | ko, en, ja, zh | 4 |
| `history.title` | common | ko, en, ja, zh | 4 |
| `historyPreview.apiCost` | common | ko, en, ja, zh | 4 |
| `historyPreview.cache` | common | ko, en, ja, zh | 4 |
| `historyPreview.favorited` | common | ko, en, ja, zh | 4 |
| `historyPreview.noRecentTasks` | common | ko, en, ja, zh | 4 |
| `historyPreview.recentTasks` | common | ko, en, ja, zh | 4 |
| `historyPreview.tokens` | common | ko, en, ja, zh | 4 |
| `historyPreview.viewAllHistory` | common | ko, en, ja, zh | 4 |
| `link.learnMoreCaretGit` | common | ko, en, ja, zh | 4 |
| `mcp.autoApprove` | common | ko, en, ja, zh | 4 |
| `mcp.autoApproveAllTools` | common | ko, en, ja, zh | 4 |
| `mcp.configureServers` | common | ko, en, ja, zh | 4 |
| `mcp.description` | common | ko, en, ja, zh | 4 |
| `mcp.installed` | common | ko, en, ja, zh | 4 |
| `mcp.marketplace` | common | ko, en, ja, zh | 4 |
| `mcp.noMatchingServers` | common | ko, en, ja, zh | 4 |
| `mcp.noServersFound` | common | ko, en, ja, zh | 4 |
| `mcp.noServersInstalled` | common | ko, en, ja, zh | 4 |
| `mcp.remoteServers` | common | ko, en, ja, zh | 4 |
| `mcp.title` | common | ko, en, ja, zh | 4 |
| `mode.act.description` | common | ko, en, ja, zh | 4 |
| `mode.act.label` | common | ko, en, ja, zh | 4 |
| `mode.act.title` | common | ko, en, ja, zh | 4 |
| `mode.agent.description` | common | ko, en, ja, zh | 4 |
| `mode.agent.label` | common | ko, en, ja, zh | 4 |
| `mode.agent.title` | common | ko, en, ja, zh | 4 |
| `mode.chatbot.description` | common | ko, en, ja, zh | 4 |
| `mode.chatbot.label` | common | ko, en, ja, zh | 4 |
| `mode.chatbot.title` | common | ko, en, ja, zh | 4 |
| `mode.plan.description` | common | ko, en, ja, zh | 4 |
| `mode.plan.label` | common | ko, en, ja, zh | 4 |
| `mode.plan.title` | common | ko, en, ja, zh | 4 |
| `mode.tooltip.act` | common | ko, en, ja, zh | 4 |
| `mode.tooltip.agent` | common | ko, en, ja, zh | 4 |
| `mode.tooltip.chatbot` | common | ko, en, ja, zh | 4 |
| `mode.tooltip.plan` | common | ko, en, ja, zh | 4 |
| `mode.tooltip.toggle` | common | ko, en, ja, zh | 4 |
| `modelInfo.basedOnInputTokens` | common | ko, en, ja, zh | 4 |
| `modelInfo.cacheReadsPrice` | common | ko, en, ja, zh | 4 |
| `modelInfo.cacheWritesPrice` | common | ko, en, ja, zh | 4 |
| `modelInfo.doesNotSupportBrowserUse` | common | ko, en, ja, zh | 4 |
| `modelInfo.doesNotSupportImages` | common | ko, en, ja, zh | 4 |
| `modelInfo.doesNotSupportPromptCaching` | common | ko, en, ja, zh | 4 |
| `modelInfo.forMoreInfo` | common | ko, en, ja, zh | 4 |
| `modelInfo.freeRequestsPerMinute` | common | ko, en, ja, zh | 4 |
| `modelInfo.inputPrice` | common | ko, en, ja, zh | 4 |
| `modelInfo.maxOutput` | common | ko, en, ja, zh | 4 |
| `modelInfo.outputPrice` | common | ko, en, ja, zh | 4 |
| `modelInfo.outputPriceStandard` | common | ko, en, ja, zh | 4 |
| `modelInfo.outputPriceThinkingBudget` | common | ko, en, ja, zh | 4 |
| `modelInfo.supportsBrowserUse` | common | ko, en, ja, zh | 4 |
| `modelInfo.supportsImages` | common | ko, en, ja, zh | 4 |
| `modelInfo.supportsPromptCaching` | common | ko, en, ja, zh | 4 |
| `modelInfo.tokensSuffix` | common | ko, en, ja, zh | 4 |
| `navbar.account` | common | ko, en, ja, zh | 4 |
| `navbar.accountTooltip` | common | ko, en, ja, zh | 4 |
| `navbar.chat` | common | ko, en, ja, zh | 4 |
| `navbar.history` | common | ko, en, ja, zh | 4 |
| `navbar.historyTooltip` | common | ko, en, ja, zh | 4 |
| `navbar.mcp` | common | ko, en, ja, zh | 4 |
| `navbar.mcpServersTooltip` | common | ko, en, ja, zh | 4 |
| `navbar.newTaskTooltip` | common | ko, en, ja, zh | 4 |
| `navbar.settings` | common | ko, en, ja, zh | 4 |
| `navbar.settingsTooltip` | common | ko, en, ja, zh | 4 |
| `persona.availablePersonas` | common | ko, en, ja, zh | 4 |
| `persona.createNew` | common | ko, en, ja, zh | 4 |
| `persona.creating` | common | ko, en, ja, zh | 4 |
| `persona.default.description` | common | ko, en, ja, zh | 4 |
| `persona.default.name` | common | ko, en, ja, zh | 4 |
| `persona.description` | common | ko, en, ja, zh | 4 |
| `persona.docs` | common | ko, en, ja, zh | 4 |
| `persona.enablePersonaSystem` | common | ko, ja, zh | 3 |
| `persona.management` | common | ko, en, ja, zh | 4 |
| `persona.select` | common | ko, en, ja, zh | 4 |
| `persona.selectDescription` | common | ko, en, ja, zh | 4 |
| `persona.uploadNormal` | common | ko, en, ja, zh | 4 |
| `persona.uploadThinking` | common | ko, en, ja, zh | 4 |
| `providers.baseten.apiKeyHelp` | common | ko, en, ja, zh | 4 |
| `providers.caret.apiKeyConfigured` | common | ko, en, ja, zh | 4 |
| `providers.caret.description` | common | ko, en, ja, zh | 4 |
| `providers.caret.feature1` | common | ko, en, ja, zh | 4 |
| `providers.caret.feature2` | common | ko, en, ja, zh | 4 |
| `providers.caret.feature3` | common | ko, en, ja, zh | 4 |
| `providers.caret.feature4` | common | ko, en, ja, zh | 4 |
| `providers.caret.features` | common | ko, en, ja, zh | 4 |
| `providers.caret.getApiKey` | common | ko, en, ja, zh | 4 |
| `providers.caret.login` | common | ko, en, ja, zh | 4 |
| `providers.caret.name` | common | ko, en, ja, zh | 4 |
| `providers.caret.or` | common | ko, en, ja, zh | 4 |
| `providers.caret.visit` | common | ko, en, ja, zh | 4 |
| `providers.cerebras.contextWindow` | common | ko, en, ja, zh | 4 |
| `providers.cerebras.noSubscription` | common | ko, en, ja, zh | 4 |
| `providers.cerebras.rateLimits` | common | ko, en, ja, zh | 4 |
| `providers.cerebras.sotaDescription` | common | ko, en, ja, zh | 4 |
| `providers.cerebras.upgrade` | common | ko, en, ja, zh | 4 |
| `providers.claudeCode.cliPath` | common | ko, en, ja, zh | 4 |
| `providers.claudeCode.cliPathDescription` | common | ko, en, ja, zh | 4 |
| `providers.dify.workflowDescription` | common | ko, en, ja, zh | 4 |
| `providers.fireworks.kimiK2Description` | common | ko, en, ja, zh | 4 |
| `providers.groq.modelLabel` | common | ko, en, ja, zh | 4 |
| `providers.huggingFace.advancedReasoning` | common | ko, en, ja, zh | 4 |
| `providers.huggingFace.modelLabel` | common | ko, en, ja, zh | 4 |
| `providers.lmStudio.contextWindowLabel` | common | ko, en, ja, zh | 4 |
| `providers.nebius.apiKeyHelpText` | common | ko, en, ja, zh | 4 |
| `providers.openai.description` | common | ko, en, ja, zh | 4 |
| `providers.qwenCode.description` | common | ko, en, ja, zh | 4 |
| `providers.requesty.claudeDescription` | common | ko, en, ja, zh | 4 |
| `providers.sapAiCore.description` | common | ko, en, ja, zh | 4 |
| `providers.sapAiCore.pricingNote` | common | ko, en, ja, zh | 4 |
| `providers.vercelAiGateway.description` | common | ko, en, ja, zh | 4 |
| `providers.vscode-lm.description` | common | ko, en, ja, zh | 4 |
| `providers.zAi.glm45Description` | common | ko, en, ja, zh | 4 |
| `rules.action.newRuleFile` | common | ko, en, ja, zh | 4 |
| `rules.button.changePersonaTemplate` | common | ko, en, ja, zh | 4 |
| `rules.button.selectPersonaTemplate` | common | ko, en, ja, zh | 4 |
| `rules.description.personaManagement` | common | ko, en, ja, zh | 4 |
| `rules.description.rulesDescription` | common | ko, en, ja, zh | 4 |
| `rules.description.workflowsDescription` | common | ko, en, ja, zh | 4 |
| `rules.docsLink` | common | ko, en, ja, zh | 4 |
| `rules.section.globalRules` | common | ko, en, ja, zh | 4 |
| `rules.section.globalWorkflows` | common | ko, en, ja, zh | 4 |
| `rules.section.localWorkflows` | common | ko, en, ja, zh | 4 |
| `rules.section.personaManagement` | common | ko, en, ja, zh | 4 |
| `rules.section.workspaceRules` | common | ko, en, ja, zh | 4 |
| `rules.subTitle.caretRules` | common | ko, en, ja, zh | 4 |
| `rules.subTitle.CaretRules` | common | ko, en, ja, zh | 4 |
| `rules.subTitle.cursorRules` | common | ko, en, ja, zh | 4 |
| `rules.subTitle.windsurfRules` | common | ko, en, ja, zh | 4 |
| `rules.tab.rules` | common | ko, en, ja, zh | 4 |
| `rules.tab.workflows` | common | ko, en, ja, zh | 4 |
| `rules.title` | common | ko, en, ja, zh | 4 |
| `rules.toggleError` | common | ko, en, ja, zh | 4 |
| `rulesModal.ariaLabel.CaretRulesButton` | common | en | 1 |
| `rulesModal.tooltip.manageRulesWorkflows` | common | en | 1 |
| `settings.apiKey.getYourKeyA` | common | ko, en, ja, zh | 4 |
| `settings.apiKey.getYourKeyAn` | common | ko, en, ja, zh | 4 |
| `settings.apiKey.helpText` | common | ko, en, ja, zh | 4 |
| `settings.apiKey.label` | common | ko, en, ja, zh | 4 |
| `settings.apiKey.placeholder` | common | ko, en, ja, zh | 4 |
| `settings.baseUrl.label` | common | ko, en, ja, zh | 4 |
| `settings.baseUrl.placeholder` | common | ko, en, ja, zh | 4 |
| `settings.byContining` | common | ko, en, ja, zh | 4 |
| `settings.loading` | common | ko, en, ja, zh | 4 |
| `settings.modelIdField.label` | common | ko, en, ja, zh | 4 |
| `settings.modelSelector.label` | common | ko, en, ja, zh | 4 |
| `settings.modelSelector.placeholder` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.description` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.label` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.options.caret` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.options.Caret` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.options.cline` | common | ko, en, ja, zh | 4 |
| `settings.openAIReasoningEffort.description` | common | ko, en, ja, zh | 4 |
| `settings.openAIReasoningEffort.high` | common | ko, en, ja, zh | 4 |
| `settings.openAIReasoningEffort.label` | common | ko, en, ja, zh | 4 |
| `settings.openRouter.clearSearch` | common | ko, ja, zh | 3 |
| `settings.openRouter.featured.claudeSonnet4-description` | common | ko, ja, zh | 3 |
| `settings.openRouter.featured.claudeSonnet4.label` | common | ko, ja, zh | 3 |
| `settings.openRouter.featured.gpt5-description` | common | ko, ja, zh | 3 |
| `settings.openRouter.featured.gpt5.label` | common | ko, ja, zh | 3 |
| `settings.openRouter.featured.grok.description` | common | ko, ja, zh | 3 |
| `settings.openRouter.featured.grok.label` | common | ko, ja, zh | 3 |
| `settings.openRouter.info.fullText` | common | ko, ja, zh | 3 |
| `settings.openRouter.modelLabel` | common | ko, ja, zh | 3 |
| `settings.openRouter.searchPlaceholder` | common | ko, ja, zh | 3 |
| `settings.openRouter.switchTo1M` | common | ko, ja, zh | 3 |
| `settings.openRouter.switchTo200K` | common | ko, ja, zh | 3 |
| `settings.organization` | common | ko, en, ja, zh | 4 |
| `settings.payAsYouGo` | common | ko, en, ja, zh | 4 |
| `settings.payAsYouGoDescription` | common | ko, en, ja, zh | 4 |
| `settings.preferredLanguage.description` | common | ko, en, ja, zh | 4 |
| `settings.preferredLanguage.label` | common | ko, en, ja, zh | 4 |
| `settings.privacyPolicy` | common | ko, en, ja, zh | 4 |
| `settings.requesty.clearSearch` | common | ko, en, ja, zh | 4 |
| `settings.requesty.info.fullText` | common | ko, en, ja, zh | 4 |
| `settings.requesty.modelLabel` | common | ko, en, ja, zh | 4 |
| `settings.requesty.searchPlaceholder` | common | ko, en, ja, zh | 4 |
| `settings.sapAiCore.deployedModels` | common | ko, ja, zh | 3 |
| `settings.sapAiCore.modelLabel` | common | ko, ja, zh | 3 |
| `settings.sapAiCore.notDeployedModels` | common | ko, ja, zh | 3 |
| `settings.sapAiCore.placeholder` | common | ko, ja, zh | 3 |
| `settings.separateModels.description` | common | ko, en, ja, zh | 4 |
| `settings.separateModels.label` | common | ko, en, ja, zh | 4 |
| `settings.signUpDescription` | common | ko, en, ja, zh | 4 |
| `settings.subscription` | common | ko, en, ja, zh | 4 |
| `settings.subscriptionBasic` | common | ko, en, ja, zh | 4 |
| `settings.subscriptionFree` | common | ko, en, ja, zh | 4 |
| `settings.terminalOutputLineLimit.description` | common | ko, en, ja, zh | 4 |
| `settings.terminalOutputLineLimit.label` | common | ko, en, ja, zh | 4 |
| `settings.termsOfService` | common | ko, en, ja, zh | 4 |
| `settings.thinkingBudget.ariaLabel` | common | ko, en, ja, zh | 4 |
| `settings.thinkingBudget.budgetText` | common | ko, en, ja, zh | 4 |
| `settings.thinkingBudget.description` | common | ko, en, ja, zh | 4 |
| `settings.thinkingBudget.enable` | common | ko, en, ja, zh | 4 |
| `settings.title` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.description` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.label` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.en` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.ja` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.ko` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.zh` | common | ko, en, ja, zh | 4 |
| `settings.useCustomPrompt.description` | common | ko, en, ja, zh | 4 |
| `settings.useCustomPrompt.label` | common | ko, en, ja, zh | 4 |
| `settings.useCustomPrompt.warning` | common | ko, en, ja, zh | 4 |
| `settings.vertex.projectIdLabel` | common | ko, en, ja, zh | 4 |
| `settings.vertex.projectIdPlaceholder` | common | ko, en, ja, zh | 4 |
| `settings.vertex.regionLabel` | common | ko, en, ja, zh | 4 |
| `settings.vertex.selectRegionPlaceholder` | common | ko, en, ja, zh | 4 |
| `settings.vertex.setupDescription` | common | ko, en, ja, zh | 4 |
| `settings.vertex.setupLink1` | common | ko, en, ja, zh | 4 |
| `settings.vertex.setupLink2` | common | ko, en, ja, zh | 4 |
| `settings.vsCodeLm.experimentalNote` | common | ko, en, ja, zh | 4 |
| `settings.vsCodeLm.getStartedDescription` | common | ko, en, ja, zh | 4 |
| `settings.vsCodeLm.modelLabel` | common | ko, en, ja, zh | 4 |
| `settings.vsCodeLm.selectModelPlaceholder` | common | ko, en, ja, zh | 4 |
| `taskHeader.allStepsCompleted` | common | ko, en, ja, zh | 4 |
| `taskHeader.newStepsGenerated` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.assistantMessage` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.assistantResponse` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.browserAction` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.browserActionApproval` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.browserResult` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.checkpointCreated` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.fileEdit` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.fileEditApproval` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.fileRead` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.fileReadApproval` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.newFile` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.newFileApproval` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.planningResponse` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.taskCompleted` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.taskMessage` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.terminalCommand` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.terminalCommandApproval` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.terminalOutput` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.tool` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.toolApproval` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.toolUse` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.unknown` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.unknownFile` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.unknownMessageType` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.unknownUrl` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.userMessage` | common | ko, en, ja, zh | 4 |
| `taskTimelineTooltip.webFetch` | common | ko, en, ja, zh | 4 |
| `telemetry.closeBannerAria` | common | ko, en, ja, zh | 4 |
| `telemetry.description` | common | ko, en, ja, zh | 4 |
| `telemetry.experimentalFeatures` | common | ko, en, ja, zh | 4 |
| `telemetry.helpImprove` | common | ko, en, ja, zh | 4 |
| `telemetry.settingsLink` | common | ko, en, ja, zh | 4 |
| `text.finalThoughts` | common | ko, en, ja, zh | 4 |
| `title.apiKeySettings` | common | ko, en, ja, zh | 4 |
| `validation.invalidApiKey` | common | ko, en, ja, zh | 4 |
| `welcome.description` | common | ko, en, ja, zh | 4 |
| `welcome.getStarted` | common | ko, en, ja, zh | 4 |
| `welcome.learnMore` | common | ko, en, ja, zh | 4 |
| `welcome.noRecentTasks` | common | ko, en, ja, zh | 4 |
| `welcome.quickWinsTitle` | common | ko, en, ja, zh | 4 |
| `welcome.recentTasks` | common | ko, en, ja, zh | 4 |
| `welcome.subtitle` | common | ko, en, ja, zh | 4 |
| `welcome.title` | common | ko, en, ja, zh | 4 |
| `welcome.viewAllHistory` | common | ko, en, ja, zh | 4 |
| `gemini.gemini-2-5-flash-preview-05-20.description` | models | ko, ja, zh | 3 |
| `gemini.gemini-2-5-flash-preview-05-20.name` | models | ko, ja, zh | 3 |
| `gemini.gemini-2-5-pro-preview-06-05-description` | models | ko, ja, zh | 3 |
| `gemini.gemini-2-5-pro-preview-06-05.name` | models | ko, ja, zh | 3 |
| `infoTextCustomInstructions` | persona | ko, en, ja, zh | 4 |
| `normalState` | persona | ko, en, ja, zh | 4 |
| `selector.description` | persona | ko, en, ja, zh | 4 |
| `selector.infoTextCustomInstructions` | persona | ko, en, ja, zh | 4 |
| `selector.selectButtonText` | persona | ko, en, ja, zh | 4 |
| `selector.selectedButtonText` | persona | ko, en, ja, zh | 4 |
| `selector.title` | persona | ko, en, ja, zh | 4 |
| `selectorDescription` | persona | ko, en, ja, zh | 4 |
| `selectorTitle` | persona | ko, en, ja, zh | 4 |
| `thinkingState` | persona | ko, en, ja, zh | 4 |
| `upload.error` | persona | ko, en, ja, zh | 4 |
| `upload.normal` | persona | ko, en, ja, zh | 4 |
| `upload.success` | persona | ko, en, ja, zh | 4 |
| `upload.thinking` | persona | ko, en, ja, zh | 4 |
| `about.feedbackPrompt` | settings | ko, en, ja, zh | 4 |
| `about.title` | settings | ko, en, ja, zh | 4 |
| `api-configuration.title` | settings | ko, en, ja, zh | 4 |
| `apiKeyField.apiKeyLabel` | settings | ko, en, ja, zh | 4 |
| `apiKeyField.signupText` | settings | ko, en, ja, zh | 4 |
| `appearance.fontFamily` | settings | ko, en, ja, zh | 4 |
| `appearance.fontSize` | settings | ko, en, ja, zh | 4 |
| `appearance.lineHeight` | settings | ko, en, ja, zh | 4 |
| `autoApprove.addToQuickAccess` | settings | ko, en, ja, zh | 4 |
| `autoApprove.label` | settings | ko, en, ja, zh | 4 |
| `autoApprove.removeFromQuickAccess` | settings | ko, en, ja, zh | 4 |
| `autoApprove.tooltip` | settings | ko, en, ja, zh | 4 |
| `basetenModelPicker.clearSearch` | settings | ko, ja, zh | 3 |
| `basetenModelPicker.description` | settings | ko, ja, zh | 3 |
| `basetenModelPicker.fetchModelsError` | settings | ko, ja, zh | 3 |
| `basetenModelPicker.modelNotStatic` | settings | ko, ja, zh | 3 |
| `basetenModelPicker.recommendedModel` | settings | ko, ja, zh | 3 |
| `basetenModelPicker.searchPlaceholder` | settings | ko, ja, zh | 3 |
| `baseUrlField.placeholder` | settings | ko, en, ja, zh | 4 |
| `browser.action.click` | settings | ko, en, ja, zh | 4 |
| `browser.action.close` | settings | ko, en, ja, zh | 4 |
| `browser.action.launch` | settings | ko, en, ja, zh | 4 |
| `browser.action.scrollDown` | settings | ko, en, ja, zh | 4 |
| `browser.action.scrollUp` | settings | ko, en, ja, zh | 4 |
| `browser.action.type` | settings | ko, en, ja, zh | 4 |
| `browser.browseActionLabel` | settings | ko, en, ja, zh | 4 |
| `browser.chromeExecutablePath` | settings | ko, en, ja, zh | 4 |
| `browser.consoleLogs` | settings | ko, en, ja, zh | 4 |
| `browser.customChromePath` | settings | ko, en, ja, zh | 4 |
| `browser.debugModeDescription` | settings | ko, en, ja, zh | 4 |
| `browser.defaultUrlPlaceholder` | settings | ko, en, ja, zh | 4 |
| `browser.detectedChromePath` | settings | ko, en, ja, zh | 4 |
| `browser.nextButton` | settings | ko, en, ja, zh | 4 |
| `browser.noNewLogs` | settings | ko, en, ja, zh | 4 |
| `browser.previousButton` | settings | ko, en, ja, zh | 4 |
| `browser.remoteBrowserDescription` | settings | ko, en, ja, zh | 4 |
| `browser.remoteBrowserEnabled` | settings | ko, en, ja, zh | 4 |
| `browser.remoteBrowserHost` | settings | ko, en, ja, zh | 4 |
| `browser.screenshotAlt` | settings | ko, en, ja, zh | 4 |
| `browser.sessionStarted` | settings | ko, en, ja, zh | 4 |
| `browser.viewportHeight` | settings | ko, en, ja, zh | 4 |
| `browser.viewportWidth` | settings | ko, en, ja, zh | 4 |
| `buttons.apply` | settings | ko, en, ja, zh | 4 |
| `buttons.cancel` | settings | ko, en, ja, zh | 4 |
| `buttons.close` | settings | ko, en, ja, zh | 4 |
| `buttons.discardChanges` | settings | ko, en, ja, zh | 4 |
| `buttons.launchBrowser` | settings | ko, en, ja, zh | 4 |
| `buttons.launchingBrowser` | settings | ko, en, ja, zh | 4 |
| `buttons.refresh` | settings | ko, en, ja, zh | 4 |
| `buttons.reset` | settings | ko, en, ja, zh | 4 |
| `buttons.save` | settings | ko, en, ja, zh | 4 |
| `buttons.test` | settings | ko, en, ja, zh | 4 |
| `claude.apiVersion` | settings | ko, en, ja, zh | 4 |
| `claude.maxTokens` | settings | ko, en, ja, zh | 4 |
| `claude.systemPrompt` | settings | ko, en, ja, zh | 4 |
| `debug.description` | settings | ko, en, ja, zh | 4 |
| `debug.title` | settings | ko, en, ja, zh | 4 |
| `doubaoProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `features.enableRichMcpDisplay` | settings | ko, en, ja, zh | 4 |
| `features.enableRichMcpDisplayDescription` | settings | ko, en, ja, zh | 4 |
| `fireworksProvider.modelLabel` | settings | ko, en, ja, zh | 4 |
| `fireworksProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `groqModelPicker.clearSearch` | settings | ko, ja, zh | 3 |
| `groqModelPicker.fetchModelsDescription` | settings | ko, ja, zh | 3 |
| `groqModelPicker.groqLinkText` | settings | ko, ja, zh | 3 |
| `groqModelPicker.modelLabel` | settings | ko, ja, zh | 3 |
| `groqModelPicker.recommendedModel` | settings | ko, ja, zh | 3 |
| `groqModelPicker.searchPlaceholder` | settings | ko, ja, zh | 3 |
| `groqModelPicker.unsureModelChoice` | settings | ko, ja, zh | 3 |
| `groqProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `huaweiCloudMaasProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `huggingFaceModelPicker.clearSearch` | settings | ko, ja, zh | 3 |
| `huggingFaceModelPicker.modelLabel` | settings | ko, ja, zh | 3 |
| `huggingFaceModelPicker.searchPlaceholder` | settings | ko, ja, zh | 3 |
| `labels.automatic` | settings | ko, en, ja, zh | 4 |
| `labels.custom` | settings | ko, en, ja, zh | 4 |
| `labels.default` | settings | ko, en, ja, zh | 4 |
| `labels.disabled` | settings | ko, en, ja, zh | 4 |
| `labels.documentation` | settings | ko, en, ja, zh | 4 |
| `labels.enabled` | settings | ko, en, ja, zh | 4 |
| `labels.feedback` | settings | ko, en, ja, zh | 4 |
| `labels.license` | settings | ko, en, ja, zh | 4 |
| `labels.manual` | settings | ko, en, ja, zh | 4 |
| `labels.repository` | settings | ko, en, ja, zh | 4 |
| `labels.support` | settings | ko, en, ja, zh | 4 |
| `labels.version` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.apiKeyLabel` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.baseUrlLabel` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.contextWindowSizeLabel` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.extendedThinkingHelpText` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.forMoreInformationText` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.maxOutputTokensLabel` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.modelIdLabel` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.promptCachingHelpText` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.quickstartGuideLinkText` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.supportsImagesLabel` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.temperatureLabel` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.thinkingModeConfigurationLinkText` | settings | ko, en, ja, zh | 4 |
| `liteLlmProvider.unifiedInterfaceHelpText` | settings | ko, en, ja, zh | 4 |
| `lmStudioProvider.description1` | settings | ko, en, ja, zh | 4 |
| `lmStudioProvider.description2` | settings | ko, en, ja, zh | 4 |
| `lmStudioProvider.description3` | settings | ko, en, ja, zh | 4 |
| `lmStudioProvider.localServerLink` | settings | ko, en, ja, zh | 4 |
| `lmStudioProvider.noteBody` | settings | ko, en, ja, zh | 4 |
| `lmStudioProvider.quickstartGuideLink` | settings | ko, en, ja, zh | 4 |
| `messages.confirmReset` | settings | ko, en, ja, zh | 4 |
| `messages.confirmResetGlobal` | settings | ko, en, ja, zh | 4 |
| `messages.errorLoading` | settings | ko, en, ja, zh | 4 |
| `messages.errorSaving` | settings | ko, en, ja, zh | 4 |
| `messages.loading` | settings | ko, en, ja, zh | 4 |
| `messages.noChanges` | settings | ko, en, ja, zh | 4 |
| `messages.settingsReset` | settings | ko, en, ja, zh | 4 |
| `messages.settingsSaved` | settings | ko, en, ja, zh | 4 |
| `messages.unsavedChanges` | settings | ko, en, ja, zh | 4 |
| `messages.unsavedChangesTitle` | settings | ko, en, ja, zh | 4 |
| `mistralProvider.name` | settings | ko, en, ja, zh | 4 |
| `mistralProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `modelInfo.contextWindow` | settings | ko, en, ja, zh | 4 |
| `modelInfo.supportsBrowserUse` | settings | ko, en, ja, zh | 4 |
| `modelInfo.supportsImages` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.cacheReadsPriceLabel` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.cacheWritesPriceLabel` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.doesNotSupportCacheLabel` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.doesNotSupportComputerUseLabel` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.doesNotSupportImagesLabel` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.inputPriceLabel` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.outputPriceLabel` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.outputPriceStandardLabel` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.outputPriceThinkingBudgetLabel` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.supportsCacheLabel` | settings | ko, en, ja, zh | 4 |
| `modelInfoView.supportsComputerUseLabel` | settings | ko, en, ja, zh | 4 |
| `modelPicker.extensionFetches` | settings | ko, en, ja, zh | 4 |
| `modelPicker.freeOptions` | settings | ko, en, ja, zh | 4 |
| `modelPicker.unsureWhichModel` | settings | ko, en, ja, zh | 4 |
| `modelSelector.selectModelPlaceholder` | settings | ko, en, ja, zh | 4 |
| `modeSystem.description` | settings | ko, en, ja, zh | 4 |
| `modeSystem.label` | settings | ko, en, ja, zh | 4 |
| `modeSystem.options.caret` | settings | ko, en, ja, zh | 4 |
| `modeSystem.options.cline` | settings | ko, en, ja, zh | 4 |
| `ollamaModelPicker.clearSearch` | settings | ko, ja, zh | 3 |
| `ollamaModelPicker.searchPlaceholder` | settings | ko, ja, zh | 3 |
| `ollamaProvider.descriptionPart1` | settings | ko, en, ja, zh | 4 |
| `ollamaProvider.notePrefix` | settings | ko, en, ja, zh | 4 |
| `ollamaProvider.noteText` | settings | ko, en, ja, zh | 4 |
| `ollamaProvider.quickstartGuideLinkText` | settings | ko, en, ja, zh | 4 |
| `openAiCompatibleProvider.notePrefix` | settings | ko, en, ja, zh | 4 |
| `openAiCompatibleProvider.noteText` | settings | ko, en, ja, zh | 4 |
| `openAiNativeProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.clearSearch` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.featuredModelDescriptionBest` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.featuredModelDescriptionFree` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.featuredModelDescriptionNew` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.featuredModelLabelBest` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.featuredModelLabelFree` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.featuredModelLabelNew` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.fetchModelsDescription` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.modelLabel` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.openRouterLinkText` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.recommendedModel` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.searchFreeOptions` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.searchPlaceholder` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.starIconEmpty` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.starIconFilled` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.switchToOneMContext` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.switchToTwoHundredKContext` | settings | ko, ja, zh | 3 |
| `openRouterModelPicker.unsureModelChoice` | settings | ko, ja, zh | 3 |
| `persona.description` | settings | ko, en, ja, zh | 4 |
| `persona.enablePersonaSystem` | settings | ko, en, ja, zh | 4 |
| `preferredLanguageSetting.chinese` | settings | ko, en, ja, zh | 4 |
| `preferredLanguageSetting.english` | settings | ko, en, ja, zh | 4 |
| `preferredLanguageSetting.japanese` | settings | ko, en, ja, zh | 4 |
| `preferredLanguageSetting.korean` | settings | ko, en, ja, zh | 4 |
| `pricing.cacheReadPrice` | settings | ko, en, ja, zh | 4 |
| `pricing.contextWindow` | settings | ko, en, ja, zh | 4 |
| `pricing.inputPrice` | settings | ko, en, ja, zh | 4 |
| `pricing.outputPriceReasoning` | settings | ko, en, ja, zh | 4 |
| `pricing.outputPriceStandard` | settings | ko, en, ja, zh | 4 |
| `providers.caret.getApiKey` | settings | ko, en, ja, zh | 4 |
| `providers.caret.or` | settings | ko, en, ja, zh | 4 |
| `providers.caret.visit` | settings | ko, en, ja, zh | 4 |
| `providers.cerebras.description` | settings | ko, en, ja, zh | 4 |
| `providers.cline.description` | settings | ko, en, ja, zh | 4 |
| `providers.gemini.models.gemini-2-5-flash-preview-05-20.description` | settings | ko, en, ja, zh | 4 |
| `providers.gemini.models.gemini-2-5-flash-preview-05-20.name` | settings | ko, en, ja, zh | 4 |
| `providers.gemini.models.gemini-2-5-pro-preview-06-05-description` | settings | ko, en, ja, zh | 4 |
| `providers.gemini.models.gemini-2-5-pro-preview-06-05.name` | settings | ko, en, ja, zh | 4 |
| `providers.litellm.description` | settings | ko, en, ja, zh | 4 |
| `providers.openai.description` | settings | ko, en, ja, zh | 4 |
| `providers.qwen-code.description` | settings | ko, en, ja, zh | 4 |
| `providers.sapaicore.description` | settings | ko, en, ja, zh | 4 |
| `providers.vercel-ai-gateway.description` | settings | ko, en, ja, zh | 4 |
| `providers.vscode-lm.description` | settings | ko, en, ja, zh | 4 |
| `qwenProvider.apiLineOptions.china` | settings | ko, en, ja, zh | 4 |
| `qwenProvider.apiLineOptions.international` | settings | ko, en, ja, zh | 4 |
| `qwenProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `requestyModelPicker.clearSearch` | settings | ko, ja, zh | 3 |
| `requestyModelPicker.descriptionPart1` | settings | ko, ja, zh | 3 |
| `requestyModelPicker.descriptionPart2` | settings | ko, ja, zh | 3 |
| `requestyModelPicker.recommendedModel` | settings | ko, ja, zh | 3 |
| `requestyModelPicker.requestyLinkText` | settings | ko, ja, zh | 3 |
| `requestyModelPicker.searchPlaceholder` | settings | ko, ja, zh | 3 |
| `requestyProvider.name` | settings | ko, en, ja, zh | 4 |
| `requestyProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `rules.buttons.disable` | settings | ko, en, ja, zh | 4 |
| `rules.buttons.enable` | settings | ko, en, ja, zh | 4 |
| `rules.buttons.refresh` | settings | ko, en, ja, zh | 4 |
| `rules.buttons.toggle` | settings | ko, en, ja, zh | 4 |
| `rules.priority.description` | settings | ko, en, ja, zh | 4 |
| `rules.priority.info` | settings | ko, en, ja, zh | 4 |
| `rules.priority.title` | settings | ko, en, ja, zh | 4 |
| `rules.section.caretRules` | settings | ko, en, ja, zh | 4 |
| `rules.section.clineRules` | settings | ko, en, ja, zh | 4 |
| `rules.section.cursorRules` | settings | ko, en, ja, zh | 4 |
| `rules.section.description` | settings | ko, en, ja, zh | 4 |
| `rules.section.globalRules` | settings | ko, en, ja, zh | 4 |
| `rules.section.title` | settings | ko, en, ja, zh | 4 |
| `rules.section.windsurfRules` | settings | ko, en, ja, zh | 4 |
| `rules.status.disabled` | settings | ko, en, ja, zh | 4 |
| `rules.status.enabled` | settings | ko, en, ja, zh | 4 |
| `rules.status.loading` | settings | ko, en, ja, zh | 4 |
| `rules.status.notFound` | settings | ko, en, ja, zh | 4 |
| `sambanovaProvider.name` | settings | ko, en, ja, zh | 4 |
| `sambanovaProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `sapAiCoreModelPicker.deployedModelsHeader` | settings | ko, en, ja, zh | 4 |
| `sapAiCoreModelPicker.notDeployedModelsHeader` | settings | ko, en, ja, zh | 4 |
| `sections.about.description` | settings | ko, en, ja, zh | 4 |
| `sections.about.link` | settings | ko, en, ja, zh | 4 |
| `sections.about.title` | settings | ko, en, ja, zh | 4 |
| `sections.apiConfiguration.description` | settings | ko, en, ja, zh | 4 |
| `sections.apiConfiguration.title` | settings | ko, en, ja, zh | 4 |
| `sections.browser.description` | settings | ko, en, ja, zh | 4 |
| `sections.browser.title` | settings | ko, en, ja, zh | 4 |
| `sections.debug.description` | settings | ko, en, ja, zh | 4 |
| `sections.debug.title` | settings | ko, en, ja, zh | 4 |
| `sections.discardChanges` | settings | ko, en, ja, zh | 4 |
| `sections.features.description` | settings | ko, en, ja, zh | 4 |
| `sections.features.title` | settings | ko, en, ja, zh | 4 |
| `sections.general.description` | settings | ko, en, ja, zh | 4 |
| `sections.general.title` | settings | ko, en, ja, zh | 4 |
| `sections.launchingBrowser` | settings | ko, en, ja, zh | 4 |
| `sections.terminal.description` | settings | ko, en, ja, zh | 4 |
| `sections.terminal.title` | settings | ko, en, ja, zh | 4 |
| `tabs.title` | settings | ko, en, ja, zh | 4 |
| `telemetry.and` | settings | ko, en, ja, zh | 4 |
| `telemetry.description` | settings | ko, en, ja, zh | 4 |
| `telemetry.forMoreDetails` | settings | ko, en, ja, zh | 4 |
| `telemetry.label` | settings | ko, en, ja, zh | 4 |
| `telemetry.privacyPolicy` | settings | ko, en, ja, zh | 4 |
| `telemetry.telemetryOverview` | settings | ko, en, ja, zh | 4 |
| `telemetry.title` | settings | ko, en, ja, zh | 4 |
| `terminal.outputLimit` | settings | ko, en, ja, zh | 4 |
| `terminal.outputLimitDescription` | settings | ko, en, ja, zh | 4 |
| `theme.auto` | settings | ko, en, ja, zh | 4 |
| `theme.dark` | settings | ko, en, ja, zh | 4 |
| `theme.light` | settings | ko, en, ja, zh | 4 |
| `togetherProvider.name` | settings | ko, en, ja, zh | 4 |
| `togetherProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `tooltips.closeSettings` | settings | ko, en, ja, zh | 4 |
| `tooltips.resetSettings` | settings | ko, en, ja, zh | 4 |
| `tooltips.saveSettings` | settings | ko, en, ja, zh | 4 |
| `tooltips.unsavedChanges` | settings | ko, en, ja, zh | 4 |
| `unifiedLanguage.description` | settings | ko, en, ja, zh | 4 |
| `unifiedLanguage.label` | settings | ko, en, ja, zh | 4 |
| `vertex.contextWindow` | settings | ko, en, ja, zh | 4 |
| `vertex.instructions` | settings | ko, en, ja, zh | 4 |
| `vertex.maxTokens` | settings | ko, en, ja, zh | 4 |
| `vertex.modelName` | settings | ko, en, ja, zh | 4 |
| `vertex.safetySettings` | settings | ko, en, ja, zh | 4 |
| `vertex.temperature` | settings | ko, en, ja, zh | 4 |
| `vertexProvider.descriptionPart1` | settings | ko, en, ja, zh | 4 |
| `vertexProvider.linkText1` | settings | ko, en, ja, zh | 4 |
| `vertexProvider.linkText2` | settings | ko, en, ja, zh | 4 |
| `vertexProvider.projectIdLabel` | settings | ko, en, ja, zh | 4 |
| `vertexProvider.projectIdPlaceholder` | settings | ko, en, ja, zh | 4 |
| `vertexProvider.regionLabel` | settings | ko, en, ja, zh | 4 |
| `vertexProvider.selectRegionPlaceholder` | settings | ko, en, ja, zh | 4 |
| `vsCodeLmProvider.copilotExtensionLinkText` | settings | ko, en, ja, zh | 4 |
| `vsCodeLmProvider.descriptionPart1` | settings | ko, en, ja, zh | 4 |
| `vsCodeLmProvider.descriptionPart2` | settings | ko, en, ja, zh | 4 |
| `vsCodeLmProvider.languageModelLabel` | settings | ko, en, ja, zh | 4 |
| `vsCodeLmProvider.noteText` | settings | ko, en, ja, zh | 4 |
| `vsCodeLmProvider.selectModelPlaceholder` | settings | ko, en, ja, zh | 4 |
| `xaiProvider.name` | settings | ko, en, ja, zh | 4 |
| `zaiProvider.name` | settings | ko, en, ja, zh | 4 |
| `apiSetup.backButton` | welcome | ko, en, ja, zh | 4 |
| `apiSetup.description` | welcome | ko, en, ja, zh | 4 |
| `apiSetup.help.button` | welcome | ko, en, ja, zh | 4 |
| `apiSetup.help.title` | welcome | ko, en, ja, zh | 4 |
| `apiSetup.instructions` | welcome | ko, en, ja, zh | 4 |
| `apiSetup.saveButton` | welcome | ko, en, ja, zh | 4 |
| `apiSetup.supportLinks.geminiCredit` | welcome | ko, en, ja, zh | 4 |
| `apiSetup.supportLinks.llmList` | welcome | ko, en, ja, zh | 4 |
| `apiSetup.title` | welcome | ko, en, ja, zh | 4 |
| `bannerAlt` | welcome | ko, en, ja, zh | 4 |
| `catchPhrase` | welcome | ko, en, ja, zh | 4 |
| `community.body` | welcome | ko, en, ja, zh | 4 |
| `community.githubLink` | welcome | ko, en, ja, zh | 4 |
| `community.header` | welcome | ko, en, ja, zh | 4 |
| `coreFeatures.description` | welcome | ko, en, ja, zh | 4 |
| `educationOffer.body` | welcome | ko, en, ja, zh | 4 |
| `educationOffer.header` | welcome | ko, en, ja, zh | 4 |
| `footer.about.description` | welcome | ko, en, ja, zh | 4 |
| `footer.about.link` | welcome | ko, en, ja, zh | 4 |
| `footer.company.address` | welcome | ko, en, ja, zh | 4 |
| `footer.company.businessNumber` | welcome | ko, en, ja, zh | 4 |
| `footer.company.name` | welcome | ko, en, ja, zh | 4 |
| `footer.copyright.builtWith` | welcome | ko, en, ja, zh | 4 |
| `footer.copyright.text` | welcome | ko, en, ja, zh | 4 |
| `footer.links.about` | welcome | ko, en, ja, zh | 4 |
| `footer.links.basedOnCline` | welcome | ko, en, ja, zh | 4 |
| `footer.links.caretGithub` | welcome | ko, en, ja, zh | 4 |
| `footer.links.caretiveInc` | welcome | ko, en, ja, zh | 4 |
| `footer.links.caretService` | welcome | ko, en, ja, zh | 4 |
| `footer.links.privacy` | welcome | ko, en, ja, zh | 4 |
| `footer.links.support` | welcome | ko, en, ja, zh | 4 |
| `footer.links.terms` | welcome | ko, en, ja, zh | 4 |
| `footer.links.youthProtection` | welcome | ko, en, ja, zh | 4 |
| `getStarted.body` | welcome | ko, en, ja, zh | 4 |
| `getStarted.header` | welcome | ko, en, ja, zh | 4 |
| `getStarted.preferredLanguage` | welcome | ko, en, ja, zh | 4 |
| `getStarted.uiLanguage` | welcome | ko, en, ja, zh | 4 |
| `greeting` | welcome | ko, en, ja, zh | 4 |
| `personaSelector.description` | welcome | ko, en, ja, zh | 4 |
| `personaSelector.header` | welcome | ko, en, ja, zh | 4 |
| `personaSelector.selectButton` | welcome | ko, en, ja, zh | 4 |


## 🌍 누락된 번역 (84개)

일부 언어에서 번역이 누락된 키들:

| Key | Namespace | Missing Locales | Used | Available |
|-----|-----------|----------------|------|-----------|
| `bullets.current.1-desc` 🔥 | announcement | en, ja, zh | 1 | ko |
| `bullets.current.2-desc` 🔥 | announcement | en, ja, zh | 1 | ko |
| `bullets.current.3-desc` 🔥 | announcement | en, ja, zh | 1 | ko |
| `bullets.current.5-desc` 🔥 | announcement | en, ja, zh | 1 | ko |
| `bullets.previous.1-desc` 🔥 | announcement | en, ja, zh | 1 | ko |
| `bullets.previous.2-desc` 🔥 | announcement | en, ja, zh | 1 | ko |
| `bullets.previous.3-desc` 🔥 | announcement | en, ja, zh | 1 | ko |
| `bullets.previous.4-desc` 🔥 | announcement | en, ja, zh | 1 | ko |
| `account.youthProtection` 🔥 | common | en, ja, zh | 1 | ko |
| `bullets.current.1-desc` ⚪ | announcement | ko | 0 | en, ja, zh |
| `bullets.current.2-desc` ⚪ | announcement | ko | 0 | en, ja, zh |
| `bullets.current.3-desc` ⚪ | announcement | ko | 0 | en, ja, zh |
| `bullets.current.4-desc` ⚪ | announcement | en, ja, zh | 0 | ko |
| `bullets.current.4-desc` ⚪ | announcement | ko | 0 | en, ja, zh |
| `bullets.current.5-desc` ⚪ | announcement | ko | 0 | en, ja, zh |
| `bullets.previous.1-desc` ⚪ | announcement | ko | 0 | en, ja, zh |
| `bullets.previous.2-desc` ⚪ | announcement | ko | 0 | en, ja, zh |
| `bullets.previous.3-desc` ⚪ | announcement | ko | 0 | en, ja, zh |
| `bullets.previous.4-desc` ⚪ | announcement | ko | 0 | en, ja, zh |
| `persona.enablePersonaSystem` ⚪ | common | en | 0 | ko, ja, zh |
| `rulesModal.ariaLabel.CaretRulesButton` ⚪ | common | ko, ja, zh | 0 | en |
| `rulesModal.tooltip.manageRulesWorkflows` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.openRouter.clearSearch` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.featured.claudeSonnet4-description` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.featured.claudeSonnet4.label` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.featured.gpt5-description` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.featured.gpt5.label` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.featured.grok.description` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.featured.grok.label` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.info.fullText` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.modelLabel` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.searchPlaceholder` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.switchTo1M` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.switchTo200K` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.sapAiCore.deployedModels` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.sapAiCore.modelLabel` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.sapAiCore.notDeployedModels` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.sapAiCore.placeholder` ⚪ | common | en | 0 | ko, ja, zh |
| `gemini.gemini-2-5-flash-preview-05-20.description` ⚪ | models | en | 0 | ko, ja, zh |
| `gemini.gemini-2-5-flash-preview-05-20.name` ⚪ | models | en | 0 | ko, ja, zh |
| `gemini.gemini-2-5-pro-preview-06-05-description` ⚪ | models | en | 0 | ko, ja, zh |
| `gemini.gemini-2-5-pro-preview-06-05.name` ⚪ | models | en | 0 | ko, ja, zh |
| `basetenModelPicker.clearSearch` ⚪ | settings | en | 0 | ko, ja, zh |
| `basetenModelPicker.description` ⚪ | settings | en | 0 | ko, ja, zh |
| `basetenModelPicker.fetchModelsError` ⚪ | settings | en | 0 | ko, ja, zh |
| `basetenModelPicker.modelNotStatic` ⚪ | settings | en | 0 | ko, ja, zh |
| `basetenModelPicker.recommendedModel` ⚪ | settings | en | 0 | ko, ja, zh |
| `basetenModelPicker.searchPlaceholder` ⚪ | settings | en | 0 | ko, ja, zh |
| `groqModelPicker.clearSearch` ⚪ | settings | en | 0 | ko, ja, zh |
| `groqModelPicker.fetchModelsDescription` ⚪ | settings | en | 0 | ko, ja, zh |
| `groqModelPicker.groqLinkText` ⚪ | settings | en | 0 | ko, ja, zh |
| `groqModelPicker.modelLabel` ⚪ | settings | en | 0 | ko, ja, zh |
| `groqModelPicker.recommendedModel` ⚪ | settings | en | 0 | ko, ja, zh |
| `groqModelPicker.searchPlaceholder` ⚪ | settings | en | 0 | ko, ja, zh |
| `groqModelPicker.unsureModelChoice` ⚪ | settings | en | 0 | ko, ja, zh |
| `huggingFaceModelPicker.clearSearch` ⚪ | settings | en | 0 | ko, ja, zh |
| `huggingFaceModelPicker.modelLabel` ⚪ | settings | en | 0 | ko, ja, zh |
| `huggingFaceModelPicker.searchPlaceholder` ⚪ | settings | en | 0 | ko, ja, zh |
| `ollamaModelPicker.clearSearch` ⚪ | settings | en | 0 | ko, ja, zh |
| `ollamaModelPicker.searchPlaceholder` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.clearSearch` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.featuredModelDescriptionBest` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.featuredModelDescriptionFree` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.featuredModelDescriptionNew` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.featuredModelLabelBest` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.featuredModelLabelFree` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.featuredModelLabelNew` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.fetchModelsDescription` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.modelLabel` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.openRouterLinkText` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.recommendedModel` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.searchFreeOptions` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.searchPlaceholder` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.starIconEmpty` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.starIconFilled` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.switchToOneMContext` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.switchToTwoHundredKContext` ⚪ | settings | en | 0 | ko, ja, zh |
| `openRouterModelPicker.unsureModelChoice` ⚪ | settings | en | 0 | ko, ja, zh |
| `requestyModelPicker.clearSearch` ⚪ | settings | en | 0 | ko, ja, zh |
| `requestyModelPicker.descriptionPart1` ⚪ | settings | en | 0 | ko, ja, zh |
| `requestyModelPicker.descriptionPart2` ⚪ | settings | en | 0 | ko, ja, zh |
| `requestyModelPicker.recommendedModel` ⚪ | settings | en | 0 | ko, ja, zh |
| `requestyModelPicker.requestyLinkText` ⚪ | settings | en | 0 | ko, ja, zh |
| `requestyModelPicker.searchPlaceholder` ⚪ | settings | en | 0 | ko, ja, zh |

🔥 = 고우선순위 (키가 사용중)
⚪ = 저우선순위 (키가 현재 미사용)


## ❓ 정의되지 않은 키 (169개)

코드에서 t() 함수로 사용하지만 JSON 파일에 정의되지 않은 키들:

| 키 | 컴포넌트 | 네임스페이스 추정 | 우선순위 |
|-----|-----------|------------------|----------|
| `../../../../src/services/error/ClineError` | ErrorRow.test.tsx |  | ⚪ |
| `../shared/buttonConfig` | chatTypes.ts |  | ⚪ |
| `.quote-button-class` | ChatRow.tsx |  | ⚪ |
| `(No new logs).browser.noNewLogs` | BrowserSessionRow.tsx | (No new logs) | ⚪ |
| `{{name}} logo.mcp.logoAlt` | McpMarketplaceCard.tsx | {{name}} logo | ⚪ |
| `account.failedToGetLoginUrl` | AccountOptions.tsx | account | ⚪ |
| `Account.navbar.account` | Navbar.tsx | Account | ⚪ |
| `Account.navbar.accountTooltip` | Navbar.tsx | Account | ⚪ |
| `anthropic--claude-3.5-sonnet` | SapAiCoreModelPicker.spec.tsx | anthropic--claude-3 | ⚪ |
| `autoApprove.addQuickAccess` | AutoApproveMenuItem.tsx | autoApprove | ⚪ |
| `autoApprove.removeQuickAccess` | AutoApproveMenuItem.tsx | autoApprove | ⚪ |
| `Browse Action: .browser.browseAction` | BrowserSessionRow.tsx | Browse Action:  | ⚪ |
| `Browser screenshot.browser.screenshotAlt` | BrowserSessionRow.tsx | Browser screenshot | ⚪ |
| `Browser Session Started.browser.sessionStarted` | BrowserSessionRow.tsx | Browser Session Started | ⚪ |
| `browser.caretWantsToUseBrowser` | BrowserSessionRow.tsx | browser | ⚪ |
| `browser.connectionInfo` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.paginationPrevious` | BrowserSessionRow.tsx | browser | ⚪ |
| `browser.paginationStep` | BrowserSessionRow.tsx | browser | ⚪ |
| `browser.popover.connected` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.disconnected` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.local` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.remote` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.remoteHostLabel` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.statusLabel` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.title` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.typeLabel` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `Caret is using the browser:.chat.caretIsUsingBrowser` | BrowserSessionRow.tsx | Caret is using the browser: | ⚪ |
| `chat. ` | ChatView.tsx | chat | ⚪ |
| `chat.addToInputSubscriptionCompleted` | ChatView.tsx | chat | ⚪ |
| `chat.brandMarketplace.codecenterPreparing` | McpConfigurationView.tsx | chat | ⚪ |
| `chat.brandMarketplace.codecenterPreparingDescription` | McpConfigurationView.tsx | chat | ⚪ |
| `chat.caretHasQuestion` | ChatRow.tsx | chat | ⚪ |
| `chat.clientIdNotFound` | ChatView.tsx | chat | ⚪ |
| `chat.commandApprovalRequired` | ChatRow.tsx | chat | ⚪ |
| `chat.commandOutput` | ChatRow.tsx | chat | ⚪ |
| `chat.errorInAddToInputSubscription` | ChatView.tsx | chat | ⚪ |
| `chat.errorSelectingFilesImages` | ChatView.tsx | chat | ⚪ |
| `chat.executeCommand` | ChatRow.tsx | chat | ⚪ |
| `chat.mode.act.action` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mode.plan.action` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mode.tooltip.toggle` | ChatTextArea.tsx | chat | ⚪ |
| `Chat.navbar.chat` | Navbar.tsx | Chat | ⚪ |
| `chat.placeholderHint` | ChatTextArea.tsx | chat | ⚪ |
| `chat.typeMessage` | ChatView.tsx | chat | ⚪ |
| `Choose SAP AI Core model...` | SapAiCoreModelPicker.spec.tsx | Choose SAP AI Core model | ⚪ |
| `Click ({{coordinate}}).browser.actionClick` | BrowserSessionRow.tsx | Click ({{coordinate}}) | ⚪ |
| `Close browser.browser.actionClose` | BrowserSessionRow.tsx | Close browser | ⚪ |
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
| `common.common.and` | AccountWelcomeView.tsx | common | ⚪ |
| `common.vertex.projectIdLabel` | VertexProvider.tsx | common | ⚪ |
| `common.vertex.projectIdPlaceholder` | VertexProvider.tsx | common | ⚪ |
| `common.vertex.regionLabel` | VertexProvider.tsx | common | ⚪ |
| `common.vertex.selectRegionPlaceholder` | VertexProvider.tsx | common | ⚪ |
| `common.vertex.setupDescription` | VertexProvider.tsx | common | ⚪ |
| `common.vertex.setupLink1` | VertexProvider.tsx | common | ⚪ |
| `common.vertex.setupLink2` | VertexProvider.tsx | common | ⚪ |
| `Console Logs.browser.consoleLogs` | BrowserSessionRow.tsx | Console Logs | ⚪ |
| `credits.tab` | helpers.ts | credits | ⚪ |
| `Default: https://api.example.com.settings.baseUrl.placeholder` | BaseUrlField.tsx | Default: https://api | ⚪ |
| `Dismiss quote.chat.dismissQuote` | QuotedMessagePreview.tsx | Dismiss quote | ⚪ |
| `gemini-2.5-pro` | SapAiCoreModelPicker.spec.tsx | gemini-2 | ⚪ |
| `history.apiCostLabel` | HistoryView.tsx | history | ⚪ |
| `history.cacheLabel` | HistoryView.tsx | history | ⚪ |
| `history.clearSearch` | HistoryView.tsx | history | ⚪ |
| `history.deleteAllHistory` | HistoryView.tsx | history | ⚪ |
| `history.export` | HistoryView.tsx | history | ⚪ |
| `history.filterFavorites` | HistoryView.tsx | history | ⚪ |
| `history.filterWorkspace` | HistoryView.tsx | history | ⚪ |
| `history.fuzzySearchPlaceholder` | HistoryView.tsx | history | ⚪ |
| `history.historyView.deleteSelectedWithCount` | HistoryView.tsx | history | ⚪ |
| `History.navbar.history` | Navbar.tsx | History | ⚪ |
| `History.navbar.historyTooltip` | Navbar.tsx | History | ⚪ |
| `history.selectAll` | HistoryView.tsx | history | ⚪ |
| `history.selectNone` | HistoryView.tsx | history | ⚪ |
| `history.sortMostExpensive` | HistoryView.tsx | history | ⚪ |
| `history.sortMostRelevant` | HistoryView.tsx | history | ⚪ |
| `history.sortMostTokens` | HistoryView.tsx | history | ⚪ |
| `history.sortNewest` | HistoryView.tsx | history | ⚪ |
| `history.sortOldest` | HistoryView.tsx | history | ⚪ |
| `history.title` | HistoryView.tsx | history | ⚪ |
| `history.tokensLabel` | HistoryView.tsx | history | ⚪ |
| `Install.mcp.install` | McpMarketplaceCard.tsx | Install | ⚪ |
| `Installed.mcp.installed` | McpMarketplaceCard.tsx | Installed | ⚪ |
| `Installing....mcp.installing` | McpMarketplaceCard.tsx | Installing | ⚪ |
| `Launch browser at {{text}}.browser.actionLaunch` | BrowserSessionRow.tsx | Launch browser at {{text}} | ⚪ |
| `MCP Servers.navbar.mcpServersTooltip` | Navbar.tsx | MCP Servers | ⚪ |
| `MCP.navbar.mcp` | Navbar.tsx | MCP | ⚪ |
| `mcp.submitDescription.part1` | McpSubmitCard.tsx | mcp | ⚪ |
| `mcp.submitMcpServer` | McpSubmitCard.tsx | mcp | ⚪ |
| `New Task.navbar.newTaskTooltip` | Navbar.tsx | New Task | ⚪ |
| `Next.browser.paginationNext` | BrowserSessionRow.tsx | Next | ⚪ |
| `Quote selection in reply.chat.quoteSelectionInReply` | QuoteButton.tsx | Quote selection in reply | ⚪ |
| `Quote selection.chat.quoteSelection` | QuoteButton.tsx | Quote selection | ⚪ |
| `Requires API key.mcp.requiresApiKey` | McpMarketplaceCard.tsx | Requires API key | ⚪ |
| `Scroll down.browser.actionScrollDown` | BrowserSessionRow.tsx | Scroll down | ⚪ |
| `Scroll up.browser.actionScrollUp` | BrowserSessionRow.tsx | Scroll up | ⚪ |
| `See less.common.seeLess` | OpenRouterModelPicker.tsx | See less | ⚪ |
| `Select a model...` | SapAiCoreModelPicker.spec.tsx | Select a model | ⚪ |
| `settings.about.link` | AboutSection.tsx | settings | ⚪ |
| `settings.apiKeyField.label` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.autoApprove.description` | AutoApproveModal.tsx | settings | ⚪ |
| `settings.baseUrlField.placeholderAnthropic` | AnthropicProvider.tsx | settings | ⚪ |
| `settings.liteLlmProvider.description1` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.liteLlmProvider.description2` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.liteLlmProvider.extendedThinkingDescription1` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.liteLlmProvider.extendedThinkingLink` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.liteLlmProvider.quickstartGuideLink` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.liteLlmProvider.usePromptCachingDescription` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.modelIdField.label` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.modelInfoView.maxOutputTokensLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.modelInfoView.millionTokensLabel` | ModelInfoView.tsx | settings | ⚪ |
| `settings.modelInfoView.temperatureLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.modelSelector.placeholder` | ModelSelector.tsx | settings | ⚪ |
| `Settings.navbar.settings` | Navbar.tsx | Settings | ⚪ |
| `Settings.navbar.settingsTooltip` | Navbar.tsx | Settings | ⚪ |
| `settings.preferredLanguage.changeError` | PreferredLanguageSetting.tsx | settings | ⚪ |
| `settings.providers.baseten.apiKeyHelp` | BasetenProvider.tsx | settings | ⚪ |
| `settings.providers.caret.loginError` | CaretProvider.tsx | settings | ⚪ |
| `settings.providers.cerebras.contextWindow` | CerebrasProvider.tsx | settings | ⚪ |
| `settings.providers.cerebras.noSubscription` | CerebrasProvider.tsx | settings | ⚪ |
| `settings.providers.cerebras.rateLimits` | CerebrasProvider.tsx | settings | ⚪ |
| `settings.providers.cerebras.sotaDescription` | CerebrasProvider.tsx | settings | ⚪ |
| `settings.providers.cerebras.upgrade` | CerebrasProvider.tsx | settings | ⚪ |
| `settings.providers.claudeCode.cliPath` | ClaudeCodeProvider.tsx | settings | ⚪ |
| `settings.providers.claudeCode.cliPathDescription` | ClaudeCodeProvider.tsx | settings | ⚪ |
| `settings.providers.claudeCode.cliPathPlaceholder` | ClaudeCodeProvider.tsx | settings | ⚪ |
| `settings.providers.claudeCode.model` | ClaudeCodeProvider.tsx | settings | ⚪ |
| `settings.providers.dify.baseUrlLabel` | DifyProvider.tsx | settings | ⚪ |
| `settings.providers.dify.baseUrlPlaceholder` | DifyProvider.tsx | settings | ⚪ |
| `settings.providers.openai.description` | OpenAICompatible.tsx | settings | ⚪ |
| `settings.providers.qwenCode.description` | QwenCodeProvider.tsx | settings | ⚪ |
| `settings.providers.sapAiCore.description` | SapAiCoreProvider.tsx | settings | ⚪ |
| `settings.providers.vercelAiGateway.description` | VercelAIGatewayProvider.tsx | settings | ⚪ |
| `settings.providers.vscode-lm.description` | VSCodeLmProvider.tsx | settings | ⚪ |
| `settings.qwenProvider.apiLineOptions.${line}` | QwenProvider.tsx | settings | ⚪ |
| `settings.terminalOutputLineLimit.description` | TerminalOutputLineLimitSlider.tsx | settings | ⚪ |
| `settings.terminalOutputLineLimit.label` | TerminalOutputLineLimitSlider.tsx | settings | ⚪ |
| `settings.thinkingBudget.budgetText.part1` | ThinkingBudgetSlider.tsx | settings | ⚪ |
| `settings.thinkingBudget.budgetText.part2` | ThinkingBudgetSlider.tsx | settings | ⚪ |
| `settings.thinkingBudget.description` | ThinkingBudgetSlider.tsx | settings | ⚪ |
| `settings.thinkingBudget.enable` | ThinkingBudgetSlider.tsx | settings | ⚪ |
| `settings.useCustomPrompt.description` | UseCustomPromptCheckbox.tsx | settings | ⚪ |
| `settings.useCustomPrompt.label` | UseCustomPromptCheckbox.tsx | settings | ⚪ |
| `settings.useCustomPrompt.warning` | UseCustomPromptCheckbox.tsx | settings | ⚪ |
| `settings.vsCodeLm.experimentalNote` | VSCodeLmProvider.tsx | settings | ⚪ |
| `settings.vsCodeLm.getStartedDescription` | VSCodeLmProvider.tsx | settings | ⚪ |
| `settings.vsCodeLm.modelLabel` | VSCodeLmProvider.tsx | settings | ⚪ |
| `settings.vsCodeLm.selectModelPlaceholder` | VSCodeLmProvider.tsx | settings | ⚪ |
| `true.redirect` | helpers.ts | true | ⚪ |
| `Use custom base URL.settings.baseUrl.label` | BaseUrlField.tsx | Use custom base URL | ⚪ |
| `welcome.quickWinsTitle.part1` | SuggestedTasks.tsx | welcome | ⚪ |
| `welcome.quickWinsTitle.part2` | SuggestedTasks.tsx | welcome | ⚪ |
| `welcome.quickWinsTitle.part3` | SuggestedTasks.tsx | welcome | ⚪ |

🔥 = 고우선순위 (여러 컴포넌트에서 사용)
⚪ = 저우선순위 (단일 컴포넌트 사용)


## 📂 컴포넌트 사용 분석

i18n 키를 사용하는 컴포넌트들:

Total components using i18n: **134**

| Component | Keys Used | Sample Keys |
|-----------|-----------|-------------|
| `settings\ApiOptions.tsx` | 40 | `settings.providers.caret.name`, `settings.providers.openrouter.name`, `settings.providers.gemini.name` (+37 more) |
| `chat\auto-approve-menu\constants.ts` | 33 | `settings.autoApprove.enableAutoApprove.label`, `settings.autoApprove.enableAutoApprove.shortName`, `settings.autoApprove.enableAutoApprove.description` (+30 more) |
| `settings\providers\BedrockProvider.tsx` | 30 | `settings.providers.bedrock.description`, `settings.bedrockProvider.apiKey`, `settings.bedrockProvider.awsProfile` (+27 more) |
| `chat\task-header\TaskTimelineTooltip.tsx` | 27 | `chat.taskTimelineTooltip.fileRead`, `chat.taskTimelineTooltip.fileEdit`, `chat.taskTimelineTooltip.newFile` (+24 more) |
| `chat\ChatRow.tsx` | 25 | `chat.mcp.useServer`, `chat.error.label`, `chat.error.mistakeLimitReached` (+22 more) |
| `settings\providers\SapAiCoreProvider.tsx` | 25 | `settings.sapAiCoreProvider.fetchModelsErrorLog`, `settings.sapAiCoreProvider.modelFetchError`, `settings.providers.sapAiCore.description` (+22 more) |
| `common\Demo.tsx` | 24 | `chat.demo.helloWorld`, `chat.demo.howdy`, `chat.demo.customHeaderTitle` (+21 more) |
| `chat\Announcement.tsx` | 23 | `common.announcement.newVersion`, `announcement.bullets.current.1`, `announcement.bullets.current.1-desc` (+20 more) |
| `settings\providers\OpenAICompatible.tsx` | 23 | `settings.openAiCompatibleProvider.azureApiVersionPlaceholder`, `settings.openAiCompatibleProvider.refreshModelsError`, `settings.providers.openai.description` (+20 more) |
| `settings\SettingsView.tsx` | 23 | `settings.tabs.apiConfiguration.name`, `settings.tabs.apiConfiguration.tooltip`, `settings.tabs.apiConfiguration.header` (+20 more) |
| `settings\sections\FeatureSettingsSection.tsx` | 22 | `settings.features.enableCheckpoints`, `settings.features.enableCheckpointsDescription`, `settings.features.enableMcpMarketplace` (+19 more) |
| `settings\sections\BrowserSettingsSection.tsx` | 20 | `settings.browser.checkingConnection`, `settings.browser.connected`, `settings.browser.notConnected` (+17 more) |
| `history\HistoryView.tsx` | 19 | `history.historyView.deleteSelectedWithCount`, `history.deleteAllHistory`, `history.title` (+16 more) |
| `mcp\configuration\tabs\installed\server-row\ServerRow.tsx` | 18 | `chat.serverRow.timeout30Seconds`, `chat.serverRow.timeout1Minute`, `chat.serverRow.timeout5Minutes` (+15 more) |
| `settings\OpenRouterModelPicker.tsx` | 18 | `settings.providers.openrouter.featured.claudeSonnet4-description`, `settings.providers.openrouter.featured.claudeSonnet4.label`, `settings.providers.openrouter.featured.gpt5-description` (+15 more) |
| `settings\providers\LiteLlmProvider.tsx` | 18 | `settings.liteLlmProvider.baseUrlPlaceholder`, `settings.baseUrlField.label`, `settings.liteLlmProvider.apiKeyPlaceholder` (+15 more) |
| `settings\providers\OpenRouterProvider.tsx` | 18 | `settings.openRouterProvider.balanceDisplay.tooltip`, `settings.openRouterProvider.balanceDisplay.label`, `settings.openRouterProvider.balanceDisplay.loading` (+15 more) |
| `chat\task-header\TaskHeader.tsx` | 16 | `common.taskHeader.currentTokens`, `common.taskHeader.contextWindowUsage`, `common.taskHeader.maxContextWindow` (+13 more) |
| `settings\common\ModelInfoView.tsx` | 16 | `settings.modelInfoView.millionTokensLabel`, `common.modelInfoView.tokensSuffix`, `settings.modelInfoView.inputPrice` (+13 more) |
| `settings\providers\OllamaProvider.tsx` | 16 | `settings.ollamaProvider.fetchModelsErrorLog`, `settings.providers.ollama.description`, `settings.ollamaProvider.baseUrlLabel` (+13 more) |
| `chat\BrowserSessionRow.tsx` | 15 | `browser.paginationStep`, `Launch browser at {{text}}.browser.actionLaunch`, `Click ({{coordinate}}).browser.actionClick` (+12 more) |
| `chat\chat-view\shared\buttonConfig.ts` | 14 | `common.button.retry`, `chat.startNewTask`, `common.button.proceedAnyways` (+11 more) |
| `chat\ChatTextArea.tsx` | 14 | `chat.mode.tooltip.toggle`, `chat.mode.tooltip.description`, `chat.image.dimensionError` (+11 more) |
| `mcp\configuration\tabs\add-server\AddRemoteServerForm.tsx` | 14 | `chat.addRemoteServerForm.serverNameRequired`, `chat.addRemoteServerForm.serverUrlRequired`, `chat.addRemoteServerForm.invalidUrlFormat` (+11 more) |
| `settings\providers\CaretProvider.tsx` | 14 | `settings.providers.caret.loginError`, `settings.providers.caret.description`, `settings.providers.caret.login` (+11 more) |
| `mcp\configuration\tabs\marketplace\McpMarketplaceView.tsx` | 13 | `chat.mcpMarketplaceView.failedToLoadMarketplaceData`, `chat.mcpMarketplaceView.retry`, `chat.mcpMarketplaceView.searchMcps` (+10 more) |
| `settings\sections\TerminalSettingsSection.tsx` | 13 | `settings.terminal.positiveNumberError`, `settings.terminal.defaultProfile`, `settings.terminal.defaultProfileDescription` (+10 more) |
| `mcp\chat-display\LinkPreview.tsx` | 12 | `chat.linkPreview.loadingPreviewFor`, `chat.linkPreview.waitingForMinutesSeconds`, `chat.linkPreview.waitingForSeconds` (+9 more) |
| `settings\providers\QwenCodeProvider.tsx` | 12 | `settings.providers.qwenCode.description`, `settings.qwenCodeProvider.apiConfigurationTitle`, `settings.qwenCodeProvider.oauthCredentialsPathPlaceholder` (+9 more) |
| `cline-rules\ClineRulesToggleModal.tsx` | 11 | `chat.clineRulesToggleModal.manageRulesWorkflows`, `chat.clineRulesToggleModal.rulesTab`, `chat.clineRulesToggleModal.workflowsTab` (+8 more) |
| `settings\providers\VercelAIGatewayProvider.tsx` | 11 | `settings.vercelAiGatewayProvider.fetchModelsErrorLog`, `settings.providers.vercelAiGateway.description`, `settings.apiKeyField.placeholder` (+8 more) |
| `account\CreditsHistoryTable.tsx` | 10 | `common.account.usageHistory`, `common.account.paymentsHistory`, `common.account.loading` (+7 more) |
| `chat\ErrorRow.tsx` | 10 | `chat.errorRow.requestId`, `chat.errorRow.powershellIssue`, `chat.errorRow.troubleshootingGuide` (+7 more) |
| `common\CheckmarkControl.tsx` | 10 | `chat.checkmarkControl.checkpointRestored`, `chat.checkmarkControl.checkpoint`, `chat.checkmarkControl.compare` (+7 more) |
| `mcp\chat-display\ImagePreview.tsx` | 10 | `chat.imagePreview.timeoutLoadingImage`, `chat.imagePreview.failedToLoadImage`, `chat.imagePreview.loadingImageFrom` (+7 more) |
| `menu\Navbar.tsx` | 10 | `Chat.navbar.chat`, `New Task.navbar.newTaskTooltip`, `MCP.navbar.mcp` (+7 more) |
| `settings\providers\XaiProvider.tsx` | 10 | `settings.providers.xai.description`, `settings.xaiProvider.providerName`, `settings.xaiProvider.notePrefix` (+7 more) |
| `account\AccountView.tsx` | 9 | `common.account.title`, `common.button.done`, `common.account.failedToFetchUserCredit` (+6 more) |
| `browser\BrowserSettingsMenu.tsx` | 9 | `browser.connectionInfo`, `browser.popover.title`, `browser.popover.statusLabel` (+6 more) |
| `chat\ContextMenu.tsx` | 9 | `chat.contextMenu.problems`, `chat.contextMenu.terminal`, `chat.contextMenu.pasteUrlToFetchContents` (+6 more) |
| `chat\ErrorBlockTitle.tsx` | 9 | `chat.errorBlockTitle.apiRetryAttempt`, `chat.errorBlockTitle.inSeconds`, `chat.errorBlockTitle.ellipsis` (+6 more) |
| `chat\ReportBugPreview.tsx` | 9 | `chat.bugReport.title`, `chat.bugReport.whatHappened`, `chat.bugReport.stepsToReproduce` (+6 more) |
| `mcp\configuration\McpConfigurationView.tsx` | 9 | `chat.brandMarketplace.preparing`, `chat.brandMarketplace.preparingDescription`, `chat.mcpConfigurationView.mcpServers` (+6 more) |
| `settings\BasetenModelPicker.tsx` | 9 | `settings.providers.baseten.modelNotStatic`, `settings.providers.baseten.fetchModelsError`, `settings.providers.baseten.modelLabel` (+6 more) |
| `settings\providers\ClineProvider.tsx` | 9 | `settings.clineProvider.sortUnderlyingProviderRouting`, `settings.clineProvider.defaultOption`, `settings.clineProvider.priceOption` (+6 more) |
| `settings\providers\VertexProvider.tsx` | 9 | `settings.providers.vertex.description`, `common.vertex.projectIdPlaceholder`, `common.vertex.projectIdLabel` (+6 more) |
| `account\AccountWelcomeView.tsx` | 8 | `common.account.signUpDescription`, `common.account.signUpWithCaret`, `common.account.byContining` (+5 more) |
| `common\CheckpointControls.tsx` | 8 | `chat.checkpointControls.compare`, `chat.checkpointControls.restore`, `chat.checkpointControls.restoreTaskAndWorkspace` (+5 more) |
| `mcp\configuration\tabs\installed\InstalledServersView.tsx` | 8 | `chat.installedServersView.descriptionPart1`, `chat.installedServersView.modelContextProtocol`, `chat.installedServersView.descriptionPart2` (+5 more) |
| `settings\GroqModelPicker.tsx` | 8 | `settings.providers.groq.fetchModelsError`, `settings.providers.groq.modelLabel`, `settings.providers.groq.searchPlaceholder` (+5 more) |
| `settings\providers\LMStudioProvider.tsx` | 8 | `settings.lmStudioProvider.parseModelsError`, `settings.providers.lmstudio.description`, `settings.baseUrlField.label` (+5 more) |
| `settings\RequestyModelPicker.tsx` | 8 | `settings.providers.requesty.modelLabel`, `settings.providers.requesty.searchPlaceholder`, `settings.providers.requesty.clearSearch` (+5 more) |
| `history\HistoryPreview.tsx` | 7 | `chat.historyPreview.tokens`, `chat.historyPreview.cache`, `chat.historyPreview.apiCost` (+4 more) |
| `settings\providers\CerebrasProvider.tsx` | 7 | `settings.providers.cerebras.sotaDescription`, `settings.providers.cerebras.noSubscription`, `settings.providers.cerebras.contextWindow` (+4 more) |
| `chat\auto-approve-menu\AutoApproveModal.tsx` | 6 | `settings.autoApprove.description`, `settings.autoApprove.title`, `settings.autoApprove.actionsHeader` (+3 more) |
| `chat\ChatView.tsx` | 6 | `chat.errorSelectingFilesImages`, `chat.clientIdNotFound`, `chat.errorInAddToInputSubscription` (+3 more) |
| `cline-rules\NewRuleRow.tsx` | 6 | `chat.newRuleRow.invalidExtensionError`, `chat.newRuleRow.workflowPlaceholder`, `chat.newRuleRow.rulePlaceholder` (+3 more) |
| `common\TelemetryBanner.tsx` | 6 | `chat.telemetryBanner.closeAndEnable`, `chat.telemetryBanner.helpImproveCline`, `chat.telemetryBanner.accessExperimentalFeatures` (+3 more) |
| `settings\providers\AnthropicProvider.tsx` | 6 | `settings.anthropicProvider.switchTo1MContext`, `settings.anthropicProvider.switchTo200KContext`, `settings.providers.anthropic.description` (+3 more) |
| `settings\providers\AskSageProvider.tsx` | 6 | `settings.providers.asksage.description`, `settings.askSageProvider.apiKeyHelpText`, `settings.providers.asksage.name` (+3 more) |
| `settings\providers\QwenProvider.tsx` | 6 | `settings.providers.qwen.description`, `settings.qwenProvider.apiLineLabel`, `settings.qwenProvider.apiLineOptions.${line}` (+3 more) |
| `settings\providers\TogetherProvider.tsx` | 6 | `settings.providers.together.description`, `settings.providers.together.name`, `settings.togetherProvider.modelIdPlaceholder` (+3 more) |
| `common\AlertDialog.tsx` | 5 | `chat.alertDialog.unsavedChangesTitle`, `chat.alertDialog.unsavedChangesDescription`, `chat.alertDialog.discardChanges` (+2 more) |
| `common\MarkdownBlock.tsx` | 5 | `chat.markdownBlock.openFileInEditor`, `chat.markdownBlock.clickToToggleActMode`, `chat.markdownBlock.alreadyInActMode` (+2 more) |
| `mcp\configuration\tabs\add-server\AddLocalServerForm.tsx` | 5 | `chat.addLocalServerForm.addLocalServerDescriptionPart1`, `chat.addLocalServerForm.clineMcpSettingsJson`, `chat.addLocalServerForm.addLocalServerDescriptionPart2` (+2 more) |
| `mcp\configuration\tabs\marketplace\McpMarketplaceCard.tsx` | 5 | `{{name}} logo.mcp.logoAlt`, `Installed.mcp.installed`, `Installing....mcp.installing` (+2 more) |
| `settings\providers\ClaudeCodeProvider.tsx` | 5 | `settings.providers.claude-code.description`, `settings.providers.claudeCode.cliPathPlaceholder`, `settings.providers.claudeCode.cliPath` (+2 more) |
| `settings\providers\GeminiProvider.tsx` | 5 | `settings.providers.gemini.description`, `settings.providers.gemini.name`, `settings.baseUrlField.label` (+2 more) |
| `settings\providers\HuggingFaceProvider.tsx` | 5 | `settings.providers.huggingface.description`, `settings.huggingFaceProvider.apiKeyPlaceholder`, `settings.huggingFaceProvider.apiKeyLabel` (+2 more) |
| `settings\providers\MoonshotProvider.tsx` | 5 | `settings.providers.moonshot.description`, `settings.moonshotProvider.entrypoint`, `settings.apiKeyField.defaultHelpText` (+2 more) |
| `settings\providers\VSCodeLmProvider.tsx` | 5 | `settings.providers.vscode-lm.description`, `settings.vsCodeLm.modelLabel`, `settings.vsCodeLm.selectModelPlaceholder` (+2 more) |
| `settings\providers\ZAiProvider.tsx` | 5 | `settings.providers.zai.description`, `settings.zaiProvider.entrypointLabel`, `settings.zaiProvider.entrypointDescription` (+2 more) |
| `chat\ChatErrorBoundary.tsx` | 4 | `chat.error.unknown`, `settings.debug.errorInSeconds`, `chat.error.displayContent` (+1 more) |
| `chat\UserMessage.tsx` | 4 | `chat.userMessage.restoreAll`, `chat.userMessage.restoreAllTooltip`, `chat.userMessage.restoreChat` (+1 more) |
| `settings\HuggingFaceModelPicker.tsx` | 4 | `settings.providers.huggingface.fetchModelsError`, `settings.providers.huggingface.modelLabel`, `settings.providers.huggingface.searchPlaceholder` (+1 more) |
| `settings\providers\DifyProvider.tsx` | 4 | `settings.providers.dify.description`, `settings.providers.dify.baseUrlPlaceholder`, `settings.providers.dify.baseUrlLabel` (+1 more) |
| `settings\providers\NebiusProvider.tsx` | 4 | `settings.providers.nebius.description`, `settings.nebiusProvider.apiKeyHelpText`, `settings.providers.nebius.name` (+1 more) |
| `settings\providers\RequestyProvider.tsx` | 4 | `settings.providers.requesty.description`, `settings.providers.requesty.name`, `settings.requestyProvider.useCustomBaseUrlLabel` (+1 more) |
| `settings\SapAiCoreModelPicker.tsx` | 4 | `settings.providers.sapaicore.placeholder`, `settings.providers.sapaicore.deployedModels`, `settings.providers.sapaicore.notDeployedModels` (+1 more) |
| `settings\sections\ApiConfigurationSection.tsx` | 4 | `settings.planMode`, `settings.actMode`, `settings.useDifferentModels` (+1 more) |
| `settings\ThinkingBudgetSlider.tsx` | 4 | `settings.thinkingBudget.budgetText.part2`, `settings.thinkingBudget.budgetText.part1`, `settings.thinkingBudget.enable` (+1 more) |
| `settings\__tests__\SapAiCoreModelPicker.spec.tsx` | 4 | `Select a model...`, `Choose SAP AI Core model...`, `anthropic--claude-3.5-sonnet` (+1 more) |
| `account\CreditBalance.tsx` | 3 | `common.account.lastUpdated`, `common.account.currentBalance`, `common.account.addCredits` |
| `chat\CreditLimitError.tsx` | 3 | `chat.creditLimitError.outOfCredits`, `chat.creditLimitError.buyCredits`, `chat.creditLimitError.retryRequest` |
| `mcp\chat-display\McpResponseDisplay.tsx` | 3 | `chat.mcpResponseDisplay.response`, `chat.mcpResponseDisplay.responseError`, `chat.mcpResponseDisplay.errorParsingResponse` |
| `mcp\configuration\tabs\installed\server-row\McpResourceRow.tsx` | 3 | `chat.mcpResourceRow.noDescription`, `chat.mcpResourceRow.returns`, `chat.mcpResourceRow.unknown` |
| `mcp\configuration\tabs\installed\server-row\McpToolRow.tsx` | 3 | `chat.mcpToolRow.autoApprove`, `chat.mcpToolRow.parameters`, `chat.mcpToolRow.noDescription` |
| `settings\ClineAccountInfoCard.tsx` | 3 | `settings.clineAccountInfoCard.loginError`, `settings.clineAccountInfoCard.viewBillingAndUsage`, `settings.clineAccountInfoCard.signUpWithCline` |
| `settings\PreferredLanguageSetting.tsx` | 3 | `settings.preferredLanguage.changeError`, `settings.preferredLanguage.label`, `settings.preferredLanguage.description` |
| `settings\providers\BasetenProvider.tsx` | 3 | `settings.providers.baseten.apiKeyHelp`, `settings.providers.baseten.description`, `settings.providers.baseten.name` |
| `settings\providers\DeepSeekProvider.tsx` | 3 | `settings.providers.deepseek.description`, `settings.providers.deepseek.name`, `settings.modelSelector.label` |
| `settings\providers\DoubaoProvider.tsx` | 3 | `settings.providers.doubao.description`, `settings.providers.doubao.name`, `settings.doubaoProvider.modelLabel` |
| `settings\providers\FireworksProvider.tsx` | 3 | `settings.providers.fireworks.description`, `settings.providers.fireworks.name`, `settings.modelSelector.label` |
| `settings\providers\HuaweiCloudMaasProvider.tsx` | 3 | `settings.providers.huawei-cloud-maas.description`, `settings.providers.huawei-cloud-maas.name`, `settings.modelSelector.label` |
| `settings\providers\MistralProvider.tsx` | 3 | `settings.providers.mistral.description`, `settings.providers.mistral.name`, `settings.modelSelector.label` |
| `settings\providers\OpenAINative.tsx` | 3 | `settings.providers.openai-native.description`, `settings.providers.openai-native.name`, `settings.modelSelector.label` |
| `settings\providers\SambanovaProvider.tsx` | 3 | `settings.providers.sambanova.description`, `settings.providers.sambanova.name`, `settings.modelSelector.label` |
| `settings\sections\AboutSection.tsx` | 3 | `settings.about.version`, `settings.about.description`, `settings.about.link` |
| `settings\sections\DebugSection.tsx` | 3 | `settings.debug.resetWorkspaceState`, `settings.debug.resetGlobalState`, `settings.debug.resetGlobalStateDescription` |
| `settings\UseCustomPromptCheckbox.tsx` | 3 | `settings.useCustomPrompt.label`, `settings.useCustomPrompt.description`, `settings.useCustomPrompt.warning` |
| `welcome\HomeHeader.tsx` | 3 | `common.welcome.whatCanIDo`, `welcome.tooltipContent`, `welcome.takeATour` |
| `welcome\SuggestedTasks.tsx` | 3 | `welcome.quickWinsTitle.part1`, `welcome.quickWinsTitle.part2`, `welcome.quickWinsTitle.part3` |
| `welcome\WelcomeView.tsx` | 3 | `common.imageAlt.caretBanner`, `welcome.coreFeatures.header`, `welcome.getStarted.button` |
| `account\helpers.ts` | 2 | `credits.tab`, `true.redirect` |
| `chat\auto-approve-menu\AutoApproveMenuItem.tsx` | 2 | `autoApprove.removeQuickAccess`, `autoApprove.addQuickAccess` |
| `chat\QuoteButton.tsx` | 2 | `Quote selection.chat.quoteSelection`, `Quote selection in reply.chat.quoteSelectionInReply` |
| `chat\ServersToggleModal.tsx` | 2 | `chat.serversToggleModal.manageMcpServers`, `chat.serversToggleModal.mcpServers` |
| `chat\task-header\buttons\DeleteTaskButton.tsx` | 2 | `common.task.deleteTask`, `common.task.deleteTaskAriaLabel` |
| `chat\TaskFeedbackButtons.tsx` | 2 | `chat.taskFeedbackButtons.thisWasHelpful`, `chat.taskFeedbackButtons.thisWasNotHelpful` |
| `cline-rules\RuleRow.tsx` | 2 | `chat.ruleRow.editRuleFile`, `chat.ruleRow.deleteRuleFile` |
| `cline-rules\RulesToggleList.tsx` | 2 | `chat.rulesToggleList.noWorkflowsFound`, `chat.rulesToggleList.noRulesFound` |
| `common\CodeAccordian.tsx` | 2 | `chat.codeAccordian.userEdits`, `chat.codeAccordian.consoleLogs` |
| `common\CopyButton.tsx` | 2 | `chat.copyButton.copied`, `chat.copyButton.copy` |
| `common\MermaidBlock.tsx` | 2 | `chat.mermaidBlock.generatingDiagram`, `chat.mermaidBlock.copyCode` |
| `mcp\configuration\tabs\marketplace\McpSubmitCard.tsx` | 2 | `mcp.submitMcpServer`, `mcp.submitDescription.part1` |
| `settings\common\ApiKeyField.tsx` | 2 | `common.apiKey.placeholder`, `common.apiKey.helpText` |
| `settings\common\BaseUrlField.tsx` | 2 | `Use custom base URL.settings.baseUrl.label`, `Default: https://api.example.com.settings.baseUrl.placeholder` |
| `settings\common\ModelSelector.tsx` | 2 | `settings.modelSelector.label`, `settings.modelSelector.placeholder` |
| `settings\OllamaModelPicker.tsx` | 2 | `settings.providers.ollama.searchPlaceholder`, `settings.providers.ollama.clearSearch` |
| `settings\providers\GroqProvider.tsx` | 2 | `settings.providers.groq.description`, `settings.providers.groq.name` |
| `settings\TerminalOutputLineLimitSlider.tsx` | 2 | `settings.terminalOutputLineLimit.label`, `settings.terminalOutputLineLimit.description` |
| `account\AccountOptions.tsx` | 1 | `account.failedToGetLoginUrl` |
| `chat\auto-approve-menu\AutoApproveBar.tsx` | 1 | `common.autoApprove.autoApproveLabel` |
| `chat\chat-view\components\layout\ActionButtons.tsx` | 1 | `common.scrollToBottom` |
| `chat\chat-view\types\chatTypes.ts` | 1 | `../shared/buttonConfig` |
| `chat\ErrorRow.test.tsx` | 1 | `../../../../src/services/error/ClineError` |
| `chat\QuotedMessagePreview.tsx` | 1 | `Dismiss quote.chat.dismissQuote` |
| `chat\SlashCommandMenu.tsx` | 1 | `chat.slashCommandMenu.noMatchingCommandsFound` |
| `chat\task-header\buttons\CopyTaskButton.tsx` | 1 | `common.task.copyTask` |
| `chat\task-header\buttons\OpenDiskTaskHistoryButton.tsx` | 1 | `chat.openDiskTaskHistoryButton.openDiskTaskHistory` |
| `common\Thumbnails.tsx` | 1 | `chat.thumbnails.thumbnailImage` |
| `mcp\configuration\tabs\installed\ServersToggleList.tsx` | 1 | `chat.serversToggleList.noMcpServersInstalled` |
| `settings\ModelDescriptionMarkdown.tsx` | 1 | `settings.modelPicker.seeMore` |
| `settings\utils\pricingUtils.ts` | 1 | `settings.pricing.perMillionTokens` |


## 🛠️ 정리 권장사항

### 🗑️ 미사용 키 제거
- **작업**: locale 파일에서 901개의 미사용 키 제거
- **효과**: 번들 크기 감소 및 유지보수 부담 경감
- **우선순위**: 낮음 (향후 기능을 위한 플레이스홀더가 아닌 경우)

### 🌍 누락 번역 완성
- **작업**: 84개의 누락된 번역 추가
- **고우선순위**: 9개 (현재 사용중인 키들)
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
**현재 상태**: 84개 키에서 번역 누락

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
- 미사용 키 901개에 대한 검토
- 향후 사용 예정인지, 레거시 키인지 판단
- 확실한 불필요 키들은 locale 파일에서 제거
- 번들 크기 최적화 및 유지보수성 향상
**현재 상태**: 901개 미사용 키 탐지 (사용률 48.1%)

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
