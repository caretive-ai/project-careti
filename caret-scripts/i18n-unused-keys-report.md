# i18n 미사용 키 분석 보고서

**생성일시**: 2025-09-08 16:05:31
**분석기**: report-i18n-unused-key.js
**프로젝트**: Caret 프론트엔드 i18n 시스템

## 📊 요약 통계

- **총 키 개수**: 1733개
- **사용중인 키**: 777개
- **미사용 키**: 956개
- **스캔한 파일**: 189개
- **사용률**: 44.8%

## 🗑️ 미사용 키 목록 (956개)

locale 파일에 정의되어 있지만 컴포넌트에서 참조되지 않는 키들:

| Key | Namespace | Available Locales | Count |
|-----|-----------|------------------|-------|
| `bullets.current.1` | announcement | ko, en, ja, zh | 4 |
| `bullets.current.2` | announcement | ko, en, ja, zh | 4 |
| `header` | announcement | ko, en, ja, zh | 4 |
| `links.and` | announcement | ko, en, ja, zh | 4 |
| `links.facebook` | announcement | ko, en, ja, zh | 4 |
| `links.github` | announcement | ko, en, ja, zh | 4 |
| `links.intro` | announcement | ko, en, ja, zh | 4 |
| `links.outro` | announcement | ko, en, ja, zh | 4 |
| `previousHeader` | announcement | ko, en, ja, zh | 4 |
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
| `and` | common | ko, en, ja, zh | 4 |
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
| `apiSetup.backButton` | common | ko, en | 2 |
| `apiSetup.description` | common | ko, en | 2 |
| `apiSetup.help.button` | common | ko, en | 2 |
| `apiSetup.help.title` | common | ko, en | 2 |
| `apiSetup.instructions` | common | ko, en | 2 |
| `apiSetup.saveButton` | common | ko, en | 2 |
| `apiSetup.supportLinks.geminiCredit` | common | ko, en | 2 |
| `apiSetup.supportLinks.llmList` | common | ko, en | 2 |
| `apiSetup.title` | common | ko, en | 2 |
| `autoApprove.addQuickAccess` | common | ko, en, ja, zh | 4 |
| `autoApprove.removeQuickAccess` | common | ko, en, ja, zh | 4 |
| `browser.actionClick` | common | ko | 1 |
| `browser.actionClose` | common | ko | 1 |
| `browser.actionLaunch` | common | ko | 1 |
| `browser.actionScrollDown` | common | ko | 1 |
| `browser.actionScrollUp` | common | ko | 1 |
| `browser.actionType` | common | ko | 1 |
| `browser.browseAction` | common | ko | 1 |
| `browser.connectionInfo` | common | ko, en | 2 |
| `browser.consoleLogs` | common | ko | 1 |
| `browser.noNewLogs` | common | ko | 1 |
| `browser.paginationNext` | common | ko | 1 |
| `browser.paginationPrevious` | common | ko | 1 |
| `browser.paginationStep` | common | ko | 1 |
| `browser.popover.connected` | common | ko, en | 2 |
| `browser.popover.disconnected` | common | ko, en | 2 |
| `browser.popover.local` | common | ko, en | 2 |
| `browser.popover.remote` | common | ko, en | 2 |
| `browser.popover.remoteHostLabel` | common | ko, en | 2 |
| `browser.popover.statusLabel` | common | ko, en | 2 |
| `browser.popover.title` | common | ko, en | 2 |
| `browser.popover.typeLabel` | common | ko, en | 2 |
| `browser.screenshotAlt` | common | ko | 1 |
| `browser.sessionStarted` | common | ko | 1 |
| `button.freeStart` | common | ko, en, ja, zh | 4 |
| `button.letsGo` | common | ko, en, ja, zh | 4 |
| `button.notifyCaretAccount` | common | ko, en, ja, zh | 4 |
| `button.resume.Task` | common | ko | 1 |
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
| `chat.addContext` | common | ko | 1 |
| `chat.addFilesImages` | common | ko | 1 |
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
| `chat.commandApprovalRequired` | common | ko, en | 2 |
| `chat.commandOutput` | common | ko, en | 2 |
| `chat.dismissQuote` | common | ko | 1 |
| `chat.errorBlockTitle.apiRequest` | common | ko, en | 2 |
| `chat.errorBlockTitle.apiRequestFailed` | common | ko | 1 |
| `chat.errorLabel` | common | ko, en | 2 |
| `chat.executeCommand` | common | ko, en, ja, zh | 4 |
| `chat.image.dimensionError` | common | ko | 1 |
| `chat.image.unsupportedFileError` | common | ko | 1 |
| `chat.loadingMcpDocumentation` | common | ko, en | 2 |
| `chat.maxRequestsReached` | common | ko, en | 2 |
| `chat.mcpArguments` | common | ko, en | 2 |
| `chat.mcpNotification` | common | ko, en | 2 |
| `chat.mcpResource` | common | ko, en | 2 |
| `chat.mcpTool` | common | ko, en | 2 |
| `chat.mistakeLimitReached` | common | ko, en | 2 |
| `chat.placeholderHint` | common | ko, en, ja, zh | 4 |
| `chat.quoteSelection` | common | ko, en | 2 |
| `chat.quoteSelectionInReply` | common | ko, en | 2 |
| `chat.seeNewChanges` | common | ko, en | 2 |
| `chat.selectModelApiProvider` | common | ko | 1 |
| `chat.shellIntegrationUnavailable` | common | ko, en | 2 |
| `chat.shellIntegrationWarning` | common | ko, en | 2 |
| `chat.stillHavingTrouble` | common | ko, en | 2 |
| `chat.taskCompleted` | common | ko, en | 2 |
| `chat.thinking` | common | ko, en | 2 |
| `chat.tool.createFile` | common | ko, en | 2 |
| `chat.tool.editFile` | common | ko, en | 2 |
| `chat.tool.externalUrl` | common | ko, en | 2 |
| `chat.tool.listedCodeDefinitionNames` | common | ko, en | 2 |
| `chat.tool.listedFilesRecursive` | common | ko, en | 2 |
| `chat.tool.listedFilesTopLevel` | common | ko, en | 2 |
| `chat.tool.outsideWorkspace` | common | ko, en | 2 |
| `chat.tool.readFile` | common | ko, en | 2 |
| `chat.tool.searchFiles` | common | ko, en | 2 |
| `chat.tool.summarizeTask` | common | ko, en | 2 |
| `chat.tool.summary` | common | ko, en | 2 |
| `chat.tool.wantsToListCodeDefinitionNames` | common | ko, en | 2 |
| `chat.tool.wantsToListFilesRecursive` | common | ko, en | 2 |
| `chat.tool.wantsToListFilesTopLevel` | common | ko, en | 2 |
| `chat.tool.wantsToWebFetch` | common | ko, en | 2 |
| `chat.tool.webFetched` | common | ko, en | 2 |
| `chat.typeMessage` | common | ko, en, ja, zh | 4 |
| `chat.typeTaskHere` | common | ko, en, ja, zh | 4 |
| `chat.useMcpServer` | common | ko, en | 2 |
| `chat.wantsToCondense` | common | ko, en | 2 |
| `chat.wantsToCreateGithubIssue` | common | ko, en | 2 |
| `chat.wantsToStartNewTask` | common | ko, en | 2 |
| `checkmarkControl.checkpoint` | common | ko, en | 2 |
| `checkmarkControl.checkpointRestored` | common | ko, en | 2 |
| `checkmarkControl.compare` | common | ko, en | 2 |
| `checkmarkControl.restore` | common | ko, en | 2 |
| `checkmarkControl.restoreFiles` | common | ko, en | 2 |
| `checkmarkControl.restoreFilesAndTask` | common | ko, en | 2 |
| `checkmarkControl.restoreFilesAndTaskDescription` | common | ko, en | 2 |
| `checkmarkControl.restoreFilesDescription` | common | ko, en | 2 |
| `checkmarkControl.restoreTaskOnly` | common | ko, en | 2 |
| `checkmarkControl.restoreTaskOnlyDescription` | common | ko, en | 2 |
| `clineRulesToggleModal.docs` | common | ko | 1 |
| `clineRulesToggleModal.globalRules` | common | ko | 1 |
| `clineRulesToggleModal.globalWorkflows` | common | ko | 1 |
| `clineRulesToggleModal.manageRulesWorkflows` | common | ko | 1 |
| `clineRulesToggleModal.rulesDescription` | common | ko | 1 |
| `clineRulesToggleModal.rulesTab` | common | ko | 1 |
| `clineRulesToggleModal.workflowName` | common | ko | 1 |
| `clineRulesToggleModal.workflowsDescription` | common | ko | 1 |
| `clineRulesToggleModal.workflowsTab` | common | ko | 1 |
| `clineRulesToggleModal.workspaceWorkflows` | common | ko | 1 |
| `defaultValue` | common | ko, en, ja, zh | 4 |
| `error.generic` | common | ko, en, ja, zh | 4 |
| `history.apiCostLabel` | common | ko | 1 |
| `history.cacheLabel` | common | ko | 1 |
| `history.clearSearch` | common | ko | 1 |
| `history.deleteAllHistory` | common | ko, en, ja, zh | 4 |
| `history.deleteSelected` | common | ko | 1 |
| `history.export` | common | ko | 1 |
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
| `history.tokensLabel` | common | ko | 1 |
| `historyPreview.apiCost` | common | ko, en | 2 |
| `historyPreview.cache` | common | ko, en | 2 |
| `historyPreview.favorited` | common | ko, en | 2 |
| `historyPreview.noRecentTasks` | common | ko, en | 2 |
| `historyPreview.recentTasks` | common | ko, en | 2 |
| `historyPreview.tokens` | common | ko, en | 2 |
| `historyPreview.viewAllHistory` | common | ko, en | 2 |
| `link.learnMoreCaretGit` | common | ko, en, ja, zh | 4 |
| `mcp.autoApprove` | common | ko, en, ja, zh | 4 |
| `mcp.autoApproveAllTools` | common | ko, en, ja, zh | 4 |
| `mcp.configureServers` | common | ko, en, ja, zh | 4 |
| `mcp.description` | common | ko, en, ja, zh | 4 |
| `mcp.install` | common | ko | 1 |
| `mcp.installed` | common | ko, en, ja, zh | 4 |
| `mcp.installing` | common | ko | 1 |
| `mcp.logoAlt` | common | ko | 1 |
| `mcp.marketplace` | common | ko, en, ja, zh | 4 |
| `mcp.noMatchingServers` | common | ko, en, ja, zh | 4 |
| `mcp.noServersFound` | common | ko, en, ja, zh | 4 |
| `mcp.noServersInstalled` | common | ko, en, ja, zh | 4 |
| `mcp.remoteServers` | common | ko, en, ja, zh | 4 |
| `mcp.requiresApiKey` | common | ko | 1 |
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
| `modelInfo.tokensSuffix` | common | ko, en | 2 |
| `modelInfoView.tokensSuffix` | common | ko, en | 2 |
| `navbar.account` | common | ko, en | 2 |
| `navbar.accountTooltip` | common | ko, en | 2 |
| `navbar.chat` | common | ko, en | 2 |
| `navbar.history` | common | ko, en | 2 |
| `navbar.historyTooltip` | common | ko, en | 2 |
| `navbar.mcp` | common | ko, en | 2 |
| `navbar.mcpServersTooltip` | common | ko, en | 2 |
| `navbar.newTaskTooltip` | common | ko, en | 2 |
| `navbar.settings` | common | ko, en | 2 |
| `navbar.settingsTooltip` | common | ko, en | 2 |
| `persona.availablePersonas` | common | ko, en, ja, zh | 4 |
| `persona.createNew` | common | ko, en, ja, zh | 4 |
| `persona.creating` | common | ko, en, ja, zh | 4 |
| `persona.default.description` | common | ko, en, ja, zh | 4 |
| `persona.default.name` | common | ko, en, ja, zh | 4 |
| `persona.description` | common | ko, en, ja, zh | 4 |
| `persona.docs` | common | ko, en, ja, zh | 4 |
| `persona.enablePersonaSystem` | common | ko | 1 |
| `persona.management` | common | ko, en, ja, zh | 4 |
| `persona.select` | common | ko, en, ja, zh | 4 |
| `persona.selectDescription` | common | ko, en, ja, zh | 4 |
| `persona.uploadNormal` | common | ko, en, ja, zh | 4 |
| `persona.uploadThinking` | common | ko, en, ja, zh | 4 |
| `providers.baseten.apiKeyHelp` | common | ko, en | 2 |
| `providers.caret.apiKeyConfigured` | common | ko, en | 2 |
| `providers.caret.description` | common | ko, en | 2 |
| `providers.caret.feature1` | common | ko, en | 2 |
| `providers.caret.feature2` | common | ko, en | 2 |
| `providers.caret.feature3` | common | ko, en | 2 |
| `providers.caret.feature4` | common | ko, en | 2 |
| `providers.caret.features` | common | ko, en | 2 |
| `providers.caret.getApiKey` | common | ko, en | 2 |
| `providers.caret.login` | common | ko, en | 2 |
| `providers.caret.name` | common | ko, en | 2 |
| `providers.caret.or` | common | ko, en | 2 |
| `providers.caret.visit` | common | ko, en | 2 |
| `providers.cerebras.contextWindow` | common | ko, en | 2 |
| `providers.cerebras.noSubscription` | common | ko, en | 2 |
| `providers.cerebras.rateLimits` | common | ko, en | 2 |
| `providers.cerebras.sotaDescription` | common | ko, en | 2 |
| `providers.cerebras.upgrade` | common | ko, en | 2 |
| `providers.claudeCode.cliPath` | common | ko, en | 2 |
| `providers.claudeCode.cliPathDescription` | common | ko, en | 2 |
| `providers.dify.workflowDescription` | common | ko, en | 2 |
| `providers.fireworks.kimiK2Description` | common | ko, en | 2 |
| `providers.groq.modelLabel` | common | ko, en | 2 |
| `providers.huggingFace.advancedReasoning` | common | ko, en | 2 |
| `providers.huggingFace.modelLabel` | common | ko, en | 2 |
| `providers.lmStudio.contextWindowLabel` | common | ko, en | 2 |
| `providers.nebius.apiKeyHelpText` | common | ko, en | 2 |
| `providers.openAICompatible.description` | common | ko, en | 2 |
| `providers.qwenCode.description` | common | ko, en | 2 |
| `providers.requesty.claudeDescription` | common | ko, en | 2 |
| `providers.sapAiCore.description` | common | ko, en | 2 |
| `providers.sapAiCore.pricingNote` | common | ko, en | 2 |
| `providers.vercelAiGateway.description` | common | ko, en | 2 |
| `providers.vsCodeLm.description` | common | ko, en | 2 |
| `providers.zAi.glm45Description` | common | ko, en | 2 |
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
| `settings..description` | common | en | 1 |
| `settings..label` | common | en | 1 |
| `settings..options.caret` | common | en | 1 |
| `settings..options.Caret` | common | en | 1 |
| `settings..options.cline` | common | en | 1 |
| `settings.apiKey.getYourKeyA` | common | ko, en | 2 |
| `settings.apiKey.getYourKeyAn` | common | ko, en | 2 |
| `settings.apiKey.label` | common | ko, en | 2 |
| `settings.baseUrl.label` | common | ko, en | 2 |
| `settings.baseUrl.placeholder` | common | ko, en | 2 |
| `settings.byContining` | common | en | 1 |
| `settings.loading` | common | en | 1 |
| `settings.modelIdField.label` | common | ko, en | 2 |
| `settings.modelSelector.label` | common | ko, en | 2 |
| `settings.modelSelector.placeholder` | common | ko, en | 2 |
| `settings.modeSystem.description` | common | ko, ja, zh | 3 |
| `settings.modeSystem.label` | common | ko, ja, zh | 3 |
| `settings.modeSystem.options.caret` | common | ko, ja, zh | 3 |
| `settings.modeSystem.options.Caret` | common | ko, ja, zh | 3 |
| `settings.modeSystem.options.cline` | common | ko, ja, zh | 3 |
| `settings.openAIReasoningEffort.description` | common | ko, en, ja, zh | 4 |
| `settings.openAIReasoningEffort.high` | common | ko, en, ja, zh | 4 |
| `settings.openAIReasoningEffort.label` | common | ko, en, ja, zh | 4 |
| `settings.openRouter.clearSearch` | common | ko, en | 2 |
| `settings.openRouter.featured.claudeSonnet4.description` | common | ko, en | 2 |
| `settings.openRouter.featured.claudeSonnet4.label` | common | ko, en | 2 |
| `settings.openRouter.featured.gpt5.description` | common | ko, en | 2 |
| `settings.openRouter.featured.gpt5.label` | common | ko, en | 2 |
| `settings.openRouter.featured.grok.description` | common | ko, en | 2 |
| `settings.openRouter.featured.grok.label` | common | ko, en | 2 |
| `settings.openRouter.info.fullText` | common | ko, en | 2 |
| `settings.openRouter.modelLabel` | common | ko, en | 2 |
| `settings.openRouter.searchPlaceholder` | common | ko, en | 2 |
| `settings.openRouter.switchTo1M` | common | ko, en | 2 |
| `settings.openRouter.switchTo200K` | common | ko, en | 2 |
| `settings.organization` | common | en | 1 |
| `settings.payAsYouGo` | common | en | 1 |
| `settings.payAsYouGoDescription` | common | en | 1 |
| `settings.preferredLanguage.description` | common | ko, en, ja, zh | 4 |
| `settings.preferredLanguage.label` | common | ko, en, ja, zh | 4 |
| `settings.privacyPolicy` | common | en | 1 |
| `settings.requesty.clearSearch` | common | ko, en | 2 |
| `settings.requesty.info.fullText` | common | ko, en | 2 |
| `settings.requesty.modelLabel` | common | ko, en | 2 |
| `settings.requesty.searchPlaceholder` | common | ko, en | 2 |
| `settings.sapAiCore.clearSearch` | common | ko | 1 |
| `settings.sapAiCore.deployedModels` | common | en | 1 |
| `settings.sapAiCore.info.fullText` | common | ko | 1 |
| `settings.sapAiCore.modelLabel` | common | ko, en | 2 |
| `settings.sapAiCore.notDeployedModels` | common | en | 1 |
| `settings.sapAiCore.placeholder` | common | en | 1 |
| `settings.sapAiCore.searchPlaceholder` | common | ko | 1 |
| `settings.separateModels.description` | common | ko, en, ja, zh | 4 |
| `settings.separateModels.label` | common | ko, en, ja, zh | 4 |
| `settings.signUpDescription` | common | en | 1 |
| `settings.subscription` | common | en | 1 |
| `settings.subscriptionBasic` | common | en | 1 |
| `settings.subscriptionFree` | common | en | 1 |
| `settings.terminalOutputLineLimit.description` | common | ko, en | 2 |
| `settings.terminalOutputLineLimit.label` | common | ko, en | 2 |
| `settings.termsOfService` | common | en | 1 |
| `settings.thinkingBudget.ariaLabel` | common | ko, en | 2 |
| `settings.thinkingBudget.budgetText` | common | ko, en | 2 |
| `settings.thinkingBudget.description` | common | ko, en | 2 |
| `settings.thinkingBudget.enable` | common | ko, en | 2 |
| `settings.title` | common | en | 1 |
| `settings.uiLanguage.description` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.label` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.en` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.ja` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.ko` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.zh` | common | ko, en, ja, zh | 4 |
| `settings.useCustomPrompt.description` | common | ko, en | 2 |
| `settings.useCustomPrompt.label` | common | ko, en | 2 |
| `settings.useCustomPrompt.warning` | common | ko, en | 2 |
| `settings.vertex.projectIdLabel` | common | ko, en | 2 |
| `settings.vertex.projectIdPlaceholder` | common | ko, en | 2 |
| `settings.vertex.regionLabel` | common | ko, en | 2 |
| `settings.vertex.selectRegionPlaceholder` | common | ko, en | 2 |
| `settings.vertex.setupDescription` | common | ko, en | 2 |
| `settings.vertex.setupLink1` | common | ko, en | 2 |
| `settings.vertex.setupLink2` | common | ko, en | 2 |
| `settings.vsCodeLm.experimentalNote` | common | ko, en | 2 |
| `settings.vsCodeLm.getStartedDescription` | common | ko, en | 2 |
| `settings.vsCodeLm.modelLabel` | common | ko, en | 2 |
| `settings.vsCodeLm.selectModelPlaceholder` | common | ko, en | 2 |
| `taskHeader.allStepsCompleted` | common | ko | 1 |
| `taskHeader.cache` | common | ko, en | 2 |
| `taskHeader.closeTask` | common | ko, en | 2 |
| `taskHeader.completionTokens` | common | ko, en | 2 |
| `taskHeader.contextWindowUsage` | common | ko | 1 |
| `taskHeader.currentTokens` | common | ko | 1 |
| `taskHeader.disablingCheckpoints` | common | ko, en | 2 |
| `taskHeader.editFocusChainList` | common | ko | 1 |
| `taskHeader.maxContextWindow` | common | ko | 1 |
| `taskHeader.newStepsGenerated` | common | ko | 1 |
| `taskHeader.promptTokens` | common | ko, en | 2 |
| `taskHeader.seeHereForInstructions` | common | ko, en | 2 |
| `taskHeader.seeLess` | common | ko, en | 2 |
| `taskHeader.seeMore` | common | ko, en | 2 |
| `taskHeader.task` | common | ko, en | 2 |
| `taskHeader.tokens` | common | ko, en | 2 |
| `taskHeader.tokensReadFromCache` | common | ko, en | 2 |
| `taskHeader.tokensWrittenToCache` | common | ko, en | 2 |
| `taskTimelineTooltip.assistantMessage` | common | ko, en | 2 |
| `taskTimelineTooltip.assistantResponse` | common | ko, en | 2 |
| `taskTimelineTooltip.browserAction` | common | ko, en | 2 |
| `taskTimelineTooltip.browserActionApproval` | common | ko, en | 2 |
| `taskTimelineTooltip.browserResult` | common | ko, en | 2 |
| `taskTimelineTooltip.checkpointCreated` | common | ko, en | 2 |
| `taskTimelineTooltip.fileEdit` | common | ko, en | 2 |
| `taskTimelineTooltip.fileEditApproval` | common | ko, en | 2 |
| `taskTimelineTooltip.fileRead` | common | ko, en | 2 |
| `taskTimelineTooltip.fileReadApproval` | common | ko, en | 2 |
| `taskTimelineTooltip.newFile` | common | ko, en | 2 |
| `taskTimelineTooltip.newFileApproval` | common | ko, en | 2 |
| `taskTimelineTooltip.planningResponse` | common | ko, en | 2 |
| `taskTimelineTooltip.taskCompleted` | common | ko, en | 2 |
| `taskTimelineTooltip.taskMessage` | common | ko, en | 2 |
| `taskTimelineTooltip.terminalCommand` | common | ko, en | 2 |
| `taskTimelineTooltip.terminalCommandApproval` | common | ko, en | 2 |
| `taskTimelineTooltip.terminalOutput` | common | ko, en | 2 |
| `taskTimelineTooltip.tool` | common | ko, en | 2 |
| `taskTimelineTooltip.toolApproval` | common | ko, en | 2 |
| `taskTimelineTooltip.toolUse` | common | ko, en | 2 |
| `taskTimelineTooltip.unknown` | common | ko, en | 2 |
| `taskTimelineTooltip.unknownFile` | common | ko, en | 2 |
| `taskTimelineTooltip.unknownMessageType` | common | ko, en | 2 |
| `taskTimelineTooltip.unknownUrl` | common | ko, en | 2 |
| `taskTimelineTooltip.userMessage` | common | ko, en | 2 |
| `taskTimelineTooltip.webFetch` | common | ko, en | 2 |
| `telemetry.and` | common | ko | 1 |
| `telemetry.closeBannerAria` | common | ko, en, ja, zh | 4 |
| `telemetry.description` | common | ko, en, ja, zh | 4 |
| `telemetry.experimentalFeatures` | common | ko, en, ja, zh | 4 |
| `telemetry.forMoreDetails` | common | ko | 1 |
| `telemetry.helpImprove` | common | ko, en, ja, zh | 4 |
| `telemetry.label` | common | ko | 1 |
| `telemetry.privacyPolicy` | common | ko | 1 |
| `telemetry.settingsLink` | common | ko, en, ja, zh | 4 |
| `telemetry.telemetryOverview` | common | ko | 1 |
| `text.finalThoughts` | common | ko, en, ja, zh | 4 |
| `title.apiKeySettings` | common | ko, en, ja, zh | 4 |
| `validation.invalidApiKey` | common | ko, en, ja, zh | 4 |
| `welcome.description` | common | ko, en, ja, zh | 4 |
| `welcome.getStarted` | common | ko, en, ja, zh | 4 |
| `welcome.learnMore` | common | ko, en, ja, zh | 4 |
| `welcome.noRecentTasks` | common | ko, en, ja, zh | 4 |
| `welcome.quickWinsTitle` | common | ko, en | 2 |
| `welcome.recentTasks` | common | ko, en, ja, zh | 4 |
| `welcome.subtitle` | common | ko, en, ja, zh | 4 |
| `welcome.title` | common | ko, en, ja, zh | 4 |
| `welcome.viewAllHistory` | common | ko, en, ja, zh | 4 |
| `gemini.gemini-2-5-flash-preview-05-20.description` | models | ko, en, ja, zh | 4 |
| `gemini.gemini-2-5-flash-preview-05-20.name` | models | ko, en, ja, zh | 4 |
| `gemini.gemini-2-5-pro-preview-06-05.description` | models | ko, en, ja, zh | 4 |
| `gemini.gemini-2-5-pro-preview-06-05.name` | models | ko, en, ja, zh | 4 |
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
| `about.feedbackPrompt` | settings | ko, ja | 2 |
| `about.title` | settings | ko, ja | 2 |
| `api-configuration.title` | settings | ko, en, ja, zh | 4 |
| `apiKeyField.apiKeyLabel` | settings | ko, en, ja, zh | 4 |
| `apiKeyField.signupText` | settings | ko, en, ja, zh | 4 |
| `autoApprove.addToQuickAccess` | settings | ko, en, ja, zh | 4 |
| `autoApprove.label` | settings | ko, en, ja, zh | 4 |
| `autoApprove.removeFromQuickAccess` | settings | ko, en, ja, zh | 4 |
| `autoApprove.tooltip` | settings | ko, en, ja, zh | 4 |
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
| `browser.paginationStep` | settings | ko, en, ja, zh | 4 |
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
| `debug.description` | settings | ko, en, ja, zh | 4 |
| `debug.title` | settings | ko, en, ja, zh | 4 |
| `doubaoProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `features.enableRichMcpDisplay` | settings | ko, en, ja, zh | 4 |
| `features.enableRichMcpDisplayDescription` | settings | ko, en, ja, zh | 4 |
| `fireworksProvider.modelLabel` | settings | ko, en, ja, zh | 4 |
| `fireworksProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `groqModelPicker.description.groqLink` | settings | ko | 1 |
| `groqModelPicker.description.modelLink` | settings | ko | 1 |
| `groqModelPicker.description.part1` | settings | ko | 1 |
| `groqModelPicker.description.part2` | settings | ko | 1 |
| `groqProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `huaweiCloudMaasProvider.modelLabel` | settings | ja | 1 |
| `huaweiCloudMaasProvider.providerName` | settings | ko, en, ja, zh | 4 |
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
| `modelInfoView.cacheReadsPriceLabel` | settings | ko, ja, zh | 3 |
| `modelInfoView.cacheWritesPriceLabel` | settings | ko, ja, zh | 3 |
| `modelInfoView.doesNotSupportBrowserUse` | settings | ko, ja, zh | 3 |
| `modelInfoView.doesNotSupportPromptCaching` | settings | ko, ja, zh | 3 |
| `modelInfoView.inputPriceLabel` | settings | ko, ja, zh | 3 |
| `modelInfoView.outputPriceLabel` | settings | ko, ja, zh | 3 |
| `modelInfoView.outputPriceStandardLabel` | settings | ko, ja, zh | 3 |
| `modelInfoView.outputPriceThinkingBudgetLabel` | settings | ko, ja, zh | 3 |
| `modelInfoView.supportsBrowserUse` | settings | ko, ja, zh | 3 |
| `modelInfoView.supportsPromptCaching` | settings | ko, ja, zh | 3 |
| `modelPicker.extensionFetches` | settings | ko, en, ja, zh | 4 |
| `modelPicker.freeOptions` | settings | ko, en, ja, zh | 4 |
| `modelSelector.selectModelPlaceholder` | settings | ko, en, ja, zh | 4 |
| `modeSystem.description` | settings | ko, en, ja, zh | 4 |
| `modeSystem.label` | settings | ko, en, ja, zh | 4 |
| `modeSystem.options.caret` | settings | ko, en, ja, zh | 4 |
| `modeSystem.options.cline` | settings | ko, en, ja, zh | 4 |
| `nebiusProvider.claudeCode.cliPath` | settings | ko | 1 |
| `nebiusProvider.claudeCode.cliPathDescription` | settings | ko | 1 |
| `nebiusProvider.claudeCode.cliPathPlaceholder` | settings | ko | 1 |
| `nebiusProvider.claudeCode.model` | settings | ko | 1 |
| `nebiusProvider.dify.baseUrlLabel` | settings | ko | 1 |
| `nebiusProvider.dify.baseUrlPlaceholder` | settings | ko | 1 |
| `nebiusProvider.dify.description` | settings | ko | 1 |
| `nebiusProvider.dify.noteLabel` | settings | ko | 1 |
| `nebiusProvider.dify.noteText` | settings | ko | 1 |
| `nebiusProvider.providerName` | settings | ko | 1 |
| `ollamaProvider.descriptionPart1` | settings | ko, en, ja, zh | 4 |
| `ollamaProvider.notePrefix` | settings | ko, en, ja, zh | 4 |
| `ollamaProvider.noteText` | settings | ko, en, ja, zh | 4 |
| `ollamaProvider.quickstartGuideLinkText` | settings | ko, en, ja, zh | 4 |
| `openAiCompatibleProvider.notePrefix` | settings | ko, en, ja, zh | 4 |
| `openAiCompatibleProvider.noteText` | settings | ko, en, ja, zh | 4 |
| `openAiNativeProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.clearSearch` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.featuredModelDescriptionBest` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.featuredModelDescriptionFree` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.featuredModelDescriptionNew` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.featuredModelLabelBest` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.featuredModelLabelFree` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.featuredModelLabelNew` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.fetchModelsDescription` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.modelLabel` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.openRouterLinkText` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.recommendedModel` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.searchFreeOptions` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.searchPlaceholder` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.starIconEmpty` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.starIconFilled` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.switchToOneMContext` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.switchToTwoHundredKContext` | settings | ko, en, ja, zh | 4 |
| `openRouterModelPicker.unsureModelChoice` | settings | ko, en, ja, zh | 4 |
| `persona.description` | settings | ko, en, ja, zh | 4 |
| `persona.enablePersonaSystem` | settings | ko, en, ja, zh | 4 |
| `preferredLanguageSetting.chinese` | settings | ko, en, ja, zh | 4 |
| `preferredLanguageSetting.english` | settings | ko, en, ja, zh | 4 |
| `preferredLanguageSetting.japanese` | settings | ko, en, ja, zh | 4 |
| `preferredLanguageSetting.korean` | settings | ko, en, ja, zh | 4 |
| `providers.anthropic` | settings | ja, zh | 2 |
| `providers.asksage` | settings | ja, zh | 2 |
| `providers.baseten` | settings | ja, zh | 2 |
| `providers.bedrock` | settings | ja, zh | 2 |
| `providers.caret` | settings | ja, zh | 2 |
| `providers.caret.getApiKey` | settings | ko, en, ja, zh | 4 |
| `providers.caret.or` | settings | ko, en, ja, zh | 4 |
| `providers.caret.visit` | settings | ko, en, ja, zh | 4 |
| `providers.cerebras` | settings | ja, zh | 2 |
| `providers.cerebras.description` | settings | ko, en | 2 |
| `providers.claude-code` | settings | ja, zh | 2 |
| `providers.cline` | settings | ja, zh | 2 |
| `providers.cline.description` | settings | ko, en | 2 |
| `providers.deepseek` | settings | ja, zh | 2 |
| `providers.dify` | settings | ja, zh | 2 |
| `providers.doubao` | settings | ja, zh | 2 |
| `providers.fireworks` | settings | ja, zh | 2 |
| `providers.gemini` | settings | ja, zh | 2 |
| `providers.groq` | settings | ja, zh | 2 |
| `providers.huawei-cloud-maas` | settings | ja, zh | 2 |
| `providers.huggingface` | settings | ja, zh | 2 |
| `providers.litellm` | settings | ja, zh | 2 |
| `providers.litellm.description` | settings | ko, en | 2 |
| `providers.lmstudio` | settings | ja, zh | 2 |
| `providers.mistral` | settings | ja, zh | 2 |
| `providers.moonshot` | settings | ja, zh | 2 |
| `providers.nebius` | settings | ja, zh | 2 |
| `providers.ollama` | settings | ja, zh | 2 |
| `providers.openai` | settings | ja, zh | 2 |
| `providers.openai-native` | settings | ja, zh | 2 |
| `providers.openai.description` | settings | ko, en | 2 |
| `providers.openrouter` | settings | ja, zh | 2 |
| `providers.qwen` | settings | ja, zh | 2 |
| `providers.qwen-code` | settings | ja, zh | 2 |
| `providers.qwen-code.description` | settings | ko, en | 2 |
| `providers.requesty` | settings | ja, zh | 2 |
| `providers.sambanova` | settings | ja, zh | 2 |
| `providers.sapaicore` | settings | ja, zh | 2 |
| `providers.sapaicore.description` | settings | ko, en | 2 |
| `providers.together` | settings | ja, zh | 2 |
| `providers.vercel-ai-gateway` | settings | ja, zh | 2 |
| `providers.vercel-ai-gateway.description` | settings | ko, en | 2 |
| `providers.vertex` | settings | ja, zh | 2 |
| `providers.vscode-lm` | settings | ja, zh | 2 |
| `providers.vscode-lm.description` | settings | ko, en | 2 |
| `providers.xai` | settings | ja, zh | 2 |
| `providers.zai` | settings | ja, zh | 2 |
| `qwenProvider.apiLineOptions.china` | settings | ko, en, ja, zh | 4 |
| `qwenProvider.apiLineOptions.international` | settings | ko, en, ja, zh | 4 |
| `qwenProvider.modelLabel` | settings | ja | 1 |
| `qwenProvider.name` | settings | ja | 1 |
| `qwenProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `requestyModelPicker.clearSearch` | settings | ko, en, ja, zh | 4 |
| `requestyModelPicker.descriptionPart1` | settings | ko, en, ja, zh | 4 |
| `requestyModelPicker.descriptionPart2` | settings | ko, en, ja, zh | 4 |
| `requestyModelPicker.recommendedModel` | settings | ko, en, ja, zh | 4 |
| `requestyModelPicker.requestyLinkText` | settings | ko, en, ja, zh | 4 |
| `requestyModelPicker.searchPlaceholder` | settings | ko, en, ja, zh | 4 |
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
| `togetherProvider.name` | settings | ko, en, ja, zh | 4 |
| `togetherProvider.providerName` | settings | ko, en, ja, zh | 4 |
| `tooltips.closeSettings` | settings | ko, en, ja, zh | 4 |
| `tooltips.resetSettings` | settings | ko, en, ja, zh | 4 |
| `tooltips.saveSettings` | settings | ko, en, ja, zh | 4 |
| `tooltips.unsavedChanges` | settings | ko, en, ja, zh | 4 |
| `unifiedLanguage.description` | settings | ko, en, ja, zh | 4 |
| `unifiedLanguage.label` | settings | ko, en, ja, zh | 4 |
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
| `xaiProvider.modifyReasoningEffortLabel` | settings | ja, zh | 2 |
| `xaiProvider.name` | settings | ko, en, ja, zh | 4 |
| `zaiProvider.name` | settings | ko, en, ja, zh | 4 |
| `invalidApiKey` | validate-api-conf | ko | 1 |
| `invalidAuthUrl` | validate-api-conf | ko | 1 |
| `invalidAwsRegion` | validate-api-conf | ko | 1 |
| `invalidBaseUrl` | validate-api-conf | ko | 1 |
| `invalidClientId` | validate-api-conf | ko | 1 |
| `invalidClientSecret` | validate-api-conf | ko | 1 |
| `invalidModelId` | validate-api-conf | ko | 1 |
| `invalidModelSelector` | validate-api-conf | ko | 1 |
| `invalidOpenAiConfig` | validate-api-conf | ko | 1 |
| `invalidVertexConfig` | validate-api-conf | ko | 1 |
| `modelNotAvailable` | validate-api-conf | ko | 1 |
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
| `footer.copyright.version` | welcome | ja, zh | 2 |
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


## 🌍 누락된 번역 (467개)

일부 언어에서 번역이 누락된 키들:

| Key | Namespace | Missing Locales | Used | Available |
|-----|-----------|----------------|------|-----------|
| `seeMore` 🔥 | common | ja, zh | 2 | ko, en |
| `modelInfoView.contextWindowLabel` 🔥 | settings | en | 2 | ko, ja, zh |
| `providers.asksage.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.baseten.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.caret.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.cerebras.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.deepseek.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.dify.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.doubao.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.fireworks.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.gemini.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.groq.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.huawei-cloud-maas.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.mistral.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.moonshot.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.nebius.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.openai-native.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.qwen.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.requesty.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.sambanova.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `providers.together.name` 🔥 | settings | ja, zh | 2 | ko, en |
| `mode.agent.label` 🔥 | chat | ja, zh | 1 | ko, en |
| `mode.chatbot.label` 🔥 | chat | ja, zh | 1 | ko, en |
| `settings.apiKey.helpText` 🔥 | common | ja, zh | 1 | ko, en |
| `settings.apiKey.placeholder` 🔥 | common | ja, zh | 1 | ko, en |
| `about.description` 🔥 | settings | en, zh | 1 | ko, ja |
| `about.version` 🔥 | settings | en, zh | 1 | ko, ja |
| `baseUrlField.placeholderAnthropic` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.description1` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.description2` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.extendedThinkingDescription1` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.extendedThinkingLink` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.quickstartGuideLink` 🔥 | settings | en, ja, zh | 1 | ko |
| `liteLlmProvider.usePromptCachingDescription` 🔥 | settings | en, ja, zh | 1 | ko |
| `modelInfoView.cacheReadsPrice` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.cacheWritesPrice` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.contextWindow` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.doesNotSupportBrowser` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.doesNotSupportCache` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.inputPrice` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.millionTokensLabel` 🔥 | settings | en | 1 | ko, ja, zh |
| `modelInfoView.outputPrice` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.outputPriceStandard` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.outputPriceThinking` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.supportsBrowser` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.supportsCache` 🔥 | settings | ko | 1 | en, ja, zh |
| `modelInfoView.tokensSuffix` 🔥 | settings | en | 1 | ko, ja, zh |
| `providers.anthropic.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.anthropic.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.asksage.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.baseten.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.bedrock.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.bedrock.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.claude-code.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.claude-code.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.cline.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.deepseek.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.dify.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.doubao.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.fireworks.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.gemini.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.groq.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.huawei-cloud-maas.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.huggingface.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.huggingface.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.litellm.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.lmstudio.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.lmstudio.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.mistral.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.moonshot.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.nebius.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.ollama.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.ollama.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.openai-native.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.openai.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.openrouter.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.openrouter.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.qwen-code.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.qwen.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.requesty.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.sambanova.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.sapaicore.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.together.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.vercel-ai-gateway.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.vertex.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.vertex.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.vscode-lm.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.xai.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.xai.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.zai.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.zai.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `apiSetup.backButton` ⚪ | common | ja, zh | 0 | ko, en |
| `apiSetup.description` ⚪ | common | ja, zh | 0 | ko, en |
| `apiSetup.help.button` ⚪ | common | ja, zh | 0 | ko, en |
| `apiSetup.help.title` ⚪ | common | ja, zh | 0 | ko, en |
| `apiSetup.instructions` ⚪ | common | ja, zh | 0 | ko, en |
| `apiSetup.saveButton` ⚪ | common | ja, zh | 0 | ko, en |
| `apiSetup.supportLinks.geminiCredit` ⚪ | common | ja, zh | 0 | ko, en |
| `apiSetup.supportLinks.llmList` ⚪ | common | ja, zh | 0 | ko, en |
| `apiSetup.title` ⚪ | common | ja, zh | 0 | ko, en |
| `browser.actionClick` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.actionClose` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.actionLaunch` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.actionScrollDown` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.actionScrollUp` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.actionType` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.browseAction` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.connectionInfo` ⚪ | common | ja, zh | 0 | ko, en |
| `browser.consoleLogs` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.noNewLogs` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.paginationNext` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.paginationPrevious` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.paginationStep` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.popover.connected` ⚪ | common | ja, zh | 0 | ko, en |
| `browser.popover.disconnected` ⚪ | common | ja, zh | 0 | ko, en |
| `browser.popover.local` ⚪ | common | ja, zh | 0 | ko, en |
| `browser.popover.remote` ⚪ | common | ja, zh | 0 | ko, en |
| `browser.popover.remoteHostLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `browser.popover.statusLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `browser.popover.title` ⚪ | common | ja, zh | 0 | ko, en |
| `browser.popover.typeLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `browser.screenshotAlt` ⚪ | common | en, ja, zh | 0 | ko |
| `browser.sessionStarted` ⚪ | common | en, ja, zh | 0 | ko |
| `button.resume.Task` ⚪ | common | en, ja, zh | 0 | ko |
| `chat.addContext` ⚪ | common | en, ja, zh | 0 | ko |
| `chat.addFilesImages` ⚪ | common | en, ja, zh | 0 | ko |
| `chat.commandApprovalRequired` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.commandOutput` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.dismissQuote` ⚪ | common | en, ja, zh | 0 | ko |
| `chat.errorBlockTitle.apiRequest` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.errorBlockTitle.apiRequestFailed` ⚪ | common | en, ja, zh | 0 | ko |
| `chat.errorLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.image.dimensionError` ⚪ | common | en, ja, zh | 0 | ko |
| `chat.image.unsupportedFileError` ⚪ | common | en, ja, zh | 0 | ko |
| `chat.loadingMcpDocumentation` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.maxRequestsReached` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.mcpArguments` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.mcpNotification` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.mcpResource` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.mcpTool` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.mistakeLimitReached` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.quoteSelection` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.quoteSelectionInReply` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.seeNewChanges` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.selectModelApiProvider` ⚪ | common | en, ja, zh | 0 | ko |
| `chat.shellIntegrationUnavailable` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.shellIntegrationWarning` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.stillHavingTrouble` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.taskCompleted` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.thinking` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.createFile` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.editFile` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.externalUrl` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.listedCodeDefinitionNames` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.listedFilesRecursive` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.listedFilesTopLevel` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.outsideWorkspace` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.readFile` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.searchFiles` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.summarizeTask` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.summary` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.wantsToListCodeDefinitionNames` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.wantsToListFilesRecursive` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.wantsToListFilesTopLevel` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.wantsToWebFetch` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.tool.webFetched` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.useMcpServer` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.wantsToCondense` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.wantsToCreateGithubIssue` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.wantsToStartNewTask` ⚪ | common | ja, zh | 0 | ko, en |
| `checkmarkControl.checkpoint` ⚪ | common | ja, zh | 0 | ko, en |
| `checkmarkControl.checkpointRestored` ⚪ | common | ja, zh | 0 | ko, en |
| `checkmarkControl.compare` ⚪ | common | ja, zh | 0 | ko, en |
| `checkmarkControl.restore` ⚪ | common | ja, zh | 0 | ko, en |
| `checkmarkControl.restoreFiles` ⚪ | common | ja, zh | 0 | ko, en |
| `checkmarkControl.restoreFilesAndTask` ⚪ | common | ja, zh | 0 | ko, en |
| `checkmarkControl.restoreFilesAndTaskDescription` ⚪ | common | ja, zh | 0 | ko, en |
| `checkmarkControl.restoreFilesDescription` ⚪ | common | ja, zh | 0 | ko, en |
| `checkmarkControl.restoreTaskOnly` ⚪ | common | ja, zh | 0 | ko, en |
| `checkmarkControl.restoreTaskOnlyDescription` ⚪ | common | ja, zh | 0 | ko, en |
| `clineRulesToggleModal.docs` ⚪ | common | en, ja, zh | 0 | ko |
| `clineRulesToggleModal.globalRules` ⚪ | common | en, ja, zh | 0 | ko |
| `clineRulesToggleModal.globalWorkflows` ⚪ | common | en, ja, zh | 0 | ko |
| `clineRulesToggleModal.manageRulesWorkflows` ⚪ | common | en, ja, zh | 0 | ko |
| `clineRulesToggleModal.rulesDescription` ⚪ | common | en, ja, zh | 0 | ko |
| `clineRulesToggleModal.rulesTab` ⚪ | common | en, ja, zh | 0 | ko |
| `clineRulesToggleModal.workflowName` ⚪ | common | en, ja, zh | 0 | ko |
| `clineRulesToggleModal.workflowsDescription` ⚪ | common | en, ja, zh | 0 | ko |
| `clineRulesToggleModal.workflowsTab` ⚪ | common | en, ja, zh | 0 | ko |
| `clineRulesToggleModal.workspaceWorkflows` ⚪ | common | en, ja, zh | 0 | ko |
| `history.apiCostLabel` ⚪ | common | en, ja, zh | 0 | ko |
| `history.cacheLabel` ⚪ | common | en, ja, zh | 0 | ko |
| `history.clearSearch` ⚪ | common | en, ja, zh | 0 | ko |
| `history.deleteSelected` ⚪ | common | en, ja, zh | 0 | ko |
| `history.export` ⚪ | common | en, ja, zh | 0 | ko |
| `history.tokensLabel` ⚪ | common | en, ja, zh | 0 | ko |
| `historyPreview.apiCost` ⚪ | common | ja, zh | 0 | ko, en |
| `historyPreview.cache` ⚪ | common | ja, zh | 0 | ko, en |
| `historyPreview.favorited` ⚪ | common | ja, zh | 0 | ko, en |
| `historyPreview.noRecentTasks` ⚪ | common | ja, zh | 0 | ko, en |
| `historyPreview.recentTasks` ⚪ | common | ja, zh | 0 | ko, en |
| `historyPreview.tokens` ⚪ | common | ja, zh | 0 | ko, en |
| `historyPreview.viewAllHistory` ⚪ | common | ja, zh | 0 | ko, en |
| `mcp.install` ⚪ | common | en, ja, zh | 0 | ko |
| `mcp.installing` ⚪ | common | en, ja, zh | 0 | ko |
| `mcp.logoAlt` ⚪ | common | en, ja, zh | 0 | ko |
| `mcp.requiresApiKey` ⚪ | common | en, ja, zh | 0 | ko |
| `modelInfo.tokensSuffix` ⚪ | common | ja, zh | 0 | ko, en |
| `modelInfoView.tokensSuffix` ⚪ | common | ja, zh | 0 | ko, en |
| `navbar.account` ⚪ | common | ja, zh | 0 | ko, en |
| `navbar.accountTooltip` ⚪ | common | ja, zh | 0 | ko, en |
| `navbar.chat` ⚪ | common | ja, zh | 0 | ko, en |
| `navbar.history` ⚪ | common | ja, zh | 0 | ko, en |
| `navbar.historyTooltip` ⚪ | common | ja, zh | 0 | ko, en |
| `navbar.mcp` ⚪ | common | ja, zh | 0 | ko, en |
| `navbar.mcpServersTooltip` ⚪ | common | ja, zh | 0 | ko, en |
| `navbar.newTaskTooltip` ⚪ | common | ja, zh | 0 | ko, en |
| `navbar.settings` ⚪ | common | ja, zh | 0 | ko, en |
| `navbar.settingsTooltip` ⚪ | common | ja, zh | 0 | ko, en |
| `persona.enablePersonaSystem` ⚪ | common | en, ja, zh | 0 | ko |
| `providers.baseten.apiKeyHelp` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.apiKeyConfigured` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.description` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.feature1` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.feature2` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.feature3` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.feature4` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.features` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.getApiKey` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.login` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.name` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.or` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.caret.visit` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.cerebras.contextWindow` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.cerebras.noSubscription` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.cerebras.rateLimits` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.cerebras.sotaDescription` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.cerebras.upgrade` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.claudeCode.cliPath` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.claudeCode.cliPathDescription` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.dify.workflowDescription` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.fireworks.kimiK2Description` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.groq.modelLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.huggingFace.advancedReasoning` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.huggingFace.modelLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.lmStudio.contextWindowLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.nebius.apiKeyHelpText` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.openAICompatible.description` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.qwenCode.description` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.requesty.claudeDescription` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.sapAiCore.description` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.sapAiCore.pricingNote` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.vercelAiGateway.description` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.vsCodeLm.description` ⚪ | common | ja, zh | 0 | ko, en |
| `providers.zAi.glm45Description` ⚪ | common | ja, zh | 0 | ko, en |
| `rulesModal.ariaLabel.CaretRulesButton` ⚪ | common | ko, ja, zh | 0 | en |
| `rulesModal.tooltip.manageRulesWorkflows` ⚪ | common | ko, ja, zh | 0 | en |
| `settings..description` ⚪ | common | ko, ja, zh | 0 | en |
| `settings..label` ⚪ | common | ko, ja, zh | 0 | en |
| `settings..options.caret` ⚪ | common | ko, ja, zh | 0 | en |
| `settings..options.Caret` ⚪ | common | ko, ja, zh | 0 | en |
| `settings..options.cline` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.apiKey.getYourKeyA` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.apiKey.getYourKeyAn` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.apiKey.label` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.baseUrl.label` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.baseUrl.placeholder` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.byContining` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.loading` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.modelIdField.label` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.modelSelector.label` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.modelSelector.placeholder` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.modeSystem.description` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.modeSystem.label` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.modeSystem.options.caret` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.modeSystem.options.Caret` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.modeSystem.options.cline` ⚪ | common | en | 0 | ko, ja, zh |
| `settings.openRouter.clearSearch` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.featured.claudeSonnet4.description` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.featured.claudeSonnet4.label` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.featured.gpt5.description` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.featured.gpt5.label` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.featured.grok.description` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.featured.grok.label` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.info.fullText` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.modelLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.searchPlaceholder` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.switchTo1M` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.openRouter.switchTo200K` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.organization` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.payAsYouGo` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.payAsYouGoDescription` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.privacyPolicy` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.requesty.clearSearch` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.requesty.info.fullText` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.requesty.modelLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.requesty.searchPlaceholder` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.sapAiCore.clearSearch` ⚪ | common | en, ja, zh | 0 | ko |
| `settings.sapAiCore.deployedModels` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.sapAiCore.info.fullText` ⚪ | common | en, ja, zh | 0 | ko |
| `settings.sapAiCore.modelLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.sapAiCore.notDeployedModels` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.sapAiCore.placeholder` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.sapAiCore.searchPlaceholder` ⚪ | common | en, ja, zh | 0 | ko |
| `settings.signUpDescription` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.subscription` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.subscriptionBasic` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.subscriptionFree` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.terminalOutputLineLimit.description` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.terminalOutputLineLimit.label` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.termsOfService` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.thinkingBudget.ariaLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.thinkingBudget.budgetText` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.thinkingBudget.description` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.thinkingBudget.enable` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.title` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.useCustomPrompt.description` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.useCustomPrompt.label` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.useCustomPrompt.warning` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vertex.projectIdLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vertex.projectIdPlaceholder` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vertex.regionLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vertex.selectRegionPlaceholder` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vertex.setupDescription` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vertex.setupLink1` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vertex.setupLink2` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vsCodeLm.experimentalNote` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vsCodeLm.getStartedDescription` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vsCodeLm.modelLabel` ⚪ | common | ja, zh | 0 | ko, en |
| `settings.vsCodeLm.selectModelPlaceholder` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.allStepsCompleted` ⚪ | common | en, ja, zh | 0 | ko |
| `taskHeader.cache` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.closeTask` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.completionTokens` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.contextWindowUsage` ⚪ | common | en, ja, zh | 0 | ko |
| `taskHeader.currentTokens` ⚪ | common | en, ja, zh | 0 | ko |
| `taskHeader.disablingCheckpoints` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.editFocusChainList` ⚪ | common | en, ja, zh | 0 | ko |
| `taskHeader.maxContextWindow` ⚪ | common | en, ja, zh | 0 | ko |
| `taskHeader.newStepsGenerated` ⚪ | common | en, ja, zh | 0 | ko |
| `taskHeader.promptTokens` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.seeHereForInstructions` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.seeLess` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.seeMore` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.task` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.tokens` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.tokensReadFromCache` ⚪ | common | ja, zh | 0 | ko, en |
| `taskHeader.tokensWrittenToCache` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.assistantMessage` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.assistantResponse` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.browserAction` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.browserActionApproval` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.browserResult` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.checkpointCreated` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.fileEdit` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.fileEditApproval` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.fileRead` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.fileReadApproval` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.newFile` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.newFileApproval` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.planningResponse` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.taskCompleted` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.taskMessage` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.terminalCommand` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.terminalCommandApproval` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.terminalOutput` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.tool` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.toolApproval` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.toolUse` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.unknown` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.unknownFile` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.unknownMessageType` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.unknownUrl` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.userMessage` ⚪ | common | ja, zh | 0 | ko, en |
| `taskTimelineTooltip.webFetch` ⚪ | common | ja, zh | 0 | ko, en |
| `telemetry.and` ⚪ | common | en, ja, zh | 0 | ko |
| `telemetry.forMoreDetails` ⚪ | common | en, ja, zh | 0 | ko |
| `telemetry.label` ⚪ | common | en, ja, zh | 0 | ko |
| `telemetry.privacyPolicy` ⚪ | common | en, ja, zh | 0 | ko |
| `telemetry.telemetryOverview` ⚪ | common | en, ja, zh | 0 | ko |
| `welcome.quickWinsTitle` ⚪ | common | ja, zh | 0 | ko, en |
| `about.feedbackPrompt` ⚪ | settings | en, zh | 0 | ko, ja |
| `about.title` ⚪ | settings | en, zh | 0 | ko, ja |
| `groqModelPicker.description.groqLink` ⚪ | settings | en, ja, zh | 0 | ko |
| `groqModelPicker.description.modelLink` ⚪ | settings | en, ja, zh | 0 | ko |
| `groqModelPicker.description.part1` ⚪ | settings | en, ja, zh | 0 | ko |
| `groqModelPicker.description.part2` ⚪ | settings | en, ja, zh | 0 | ko |
| `huaweiCloudMaasProvider.modelLabel` ⚪ | settings | ko, en, zh | 0 | ja |
| `modelInfoView.cacheReadsPriceLabel` ⚪ | settings | en | 0 | ko, ja, zh |
| `modelInfoView.cacheWritesPriceLabel` ⚪ | settings | en | 0 | ko, ja, zh |
| `modelInfoView.doesNotSupportBrowserUse` ⚪ | settings | en | 0 | ko, ja, zh |
| `modelInfoView.doesNotSupportPromptCaching` ⚪ | settings | en | 0 | ko, ja, zh |
| `modelInfoView.inputPriceLabel` ⚪ | settings | en | 0 | ko, ja, zh |
| `modelInfoView.outputPriceLabel` ⚪ | settings | en | 0 | ko, ja, zh |
| `modelInfoView.outputPriceStandardLabel` ⚪ | settings | en | 0 | ko, ja, zh |
| `modelInfoView.outputPriceThinkingBudgetLabel` ⚪ | settings | en | 0 | ko, ja, zh |
| `modelInfoView.supportsBrowserUse` ⚪ | settings | en | 0 | ko, ja, zh |
| `modelInfoView.supportsPromptCaching` ⚪ | settings | en | 0 | ko, ja, zh |
| `nebiusProvider.claudeCode.cliPath` ⚪ | settings | en, ja, zh | 0 | ko |
| `nebiusProvider.claudeCode.cliPathDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `nebiusProvider.claudeCode.cliPathPlaceholder` ⚪ | settings | en, ja, zh | 0 | ko |
| `nebiusProvider.claudeCode.model` ⚪ | settings | en, ja, zh | 0 | ko |
| `nebiusProvider.dify.baseUrlLabel` ⚪ | settings | en, ja, zh | 0 | ko |
| `nebiusProvider.dify.baseUrlPlaceholder` ⚪ | settings | en, ja, zh | 0 | ko |
| `nebiusProvider.dify.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `nebiusProvider.dify.noteLabel` ⚪ | settings | en, ja, zh | 0 | ko |
| `nebiusProvider.dify.noteText` ⚪ | settings | en, ja, zh | 0 | ko |
| `nebiusProvider.providerName` ⚪ | settings | en, ja, zh | 0 | ko |
| `providers.anthropic` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.asksage` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.baseten` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.bedrock` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.caret` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.cerebras` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.cerebras.description` ⚪ | settings | ja, zh | 0 | ko, en |
| `providers.claude-code` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.cline` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.cline.description` ⚪ | settings | ja, zh | 0 | ko, en |
| `providers.deepseek` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.dify` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.doubao` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.fireworks` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.gemini` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.groq` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.huawei-cloud-maas` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.huggingface` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.litellm` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.litellm.description` ⚪ | settings | ja, zh | 0 | ko, en |
| `providers.lmstudio` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.mistral` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.moonshot` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.nebius` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.ollama` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.openai` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.openai-native` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.openai.description` ⚪ | settings | ja, zh | 0 | ko, en |
| `providers.openrouter` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.qwen` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.qwen-code` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.qwen-code.description` ⚪ | settings | ja, zh | 0 | ko, en |
| `providers.requesty` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.sambanova` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.sapaicore` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.sapaicore.description` ⚪ | settings | ja, zh | 0 | ko, en |
| `providers.together` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.vercel-ai-gateway` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.vercel-ai-gateway.description` ⚪ | settings | ja, zh | 0 | ko, en |
| `providers.vertex` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.vscode-lm` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.vscode-lm.description` ⚪ | settings | ja, zh | 0 | ko, en |
| `providers.xai` ⚪ | settings | ko, en | 0 | ja, zh |
| `providers.zai` ⚪ | settings | ko, en | 0 | ja, zh |
| `qwenProvider.modelLabel` ⚪ | settings | ko, en, zh | 0 | ja |
| `qwenProvider.name` ⚪ | settings | ko, en, zh | 0 | ja |
| `xaiProvider.modifyReasoningEffortLabel` ⚪ | settings | ko, en | 0 | ja, zh |
| `invalidApiKey` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `invalidAuthUrl` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `invalidAwsRegion` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `invalidBaseUrl` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `invalidClientId` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `invalidClientSecret` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `invalidModelId` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `invalidModelSelector` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `invalidOpenAiConfig` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `invalidVertexConfig` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `modelNotAvailable` ⚪ | validate-api-conf | en, ja, zh | 0 | ko |
| `footer.copyright.version` ⚪ | welcome | ko, en | 0 | ja, zh |

🔥 = 고우선순위 (키가 사용중)
⚪ = 저우선순위 (키가 현재 미사용)


## ❓ 정의되지 않은 키 (212개)

코드에서 t() 함수로 사용하지만 JSON 파일에 정의되지 않은 키들:

| 키 | 컴포넌트 | 네임스페이스 추정 | 우선순위 |
|-----|-----------|------------------|----------|
| `../../../../src/services/error/ClineError` | ErrorRow.test.tsx |  | ⚪ |
| `../shared/buttonConfig` | chatTypes.ts |  | ⚪ |
| `.quote-button-class` | ChatRow.tsx |  | ⚪ |
| `(No new logs).browser.noNewLogs` | BrowserSessionRow.tsx | (No new logs) | ⚪ |
| `{{name}} logo.mcp.logoAlt` | McpMarketplaceCard.tsx | {{name}} logo | ⚪ |
| `── Deployed Models ──.settings.sapAiCore.deployedModels` | SapAiCoreModelPicker.tsx | ── Deployed Models ── | ⚪ |
| `── Not Deployed Models ──.settings.sapAiCore.notDeployedModels` | SapAiCoreModelPicker.tsx | ── Not Deployed Models ── | ⚪ |
| `account.failedToGetLoginUrl` | AccountOptions.tsx | account | ⚪ |
| `Account.navbar.account` | Navbar.tsx | Account | ⚪ |
| `Account.navbar.accountTooltip` | Navbar.tsx | Account | ⚪ |
| `anthropic--claude-3.5-sonnet` | SapAiCoreModelPicker.spec.tsx | anthropic--claude-3 | ⚪ |
| `autoApprove.addQuickAccess` | AutoApproveMenuItem.tsx | autoApprove | ⚪ |
| `autoApprove.removeQuickAccess` | AutoApproveMenuItem.tsx | autoApprove | ⚪ |
| `Best.settings.openRouter.featured.claudeSonnet4.label` | OpenRouterModelPicker.tsx | Best | ⚪ |
| `Browse Action: .browser.browseAction` | BrowserSessionRow.tsx | Browse Action:  | ⚪ |
| `Browser screenshot.browser.screenshotAlt` | BrowserSessionRow.tsx | Browser screenshot | ⚪ |
| `Browser Session Started.browser.sessionStarted` | BrowserSessionRow.tsx | Browser Session Started | ⚪ |
| `browser.connectionInfo` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.connected` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.disconnected` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.local` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.remote` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.remoteHostLabel` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.statusLabel` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.title` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `browser.popover.typeLabel` | BrowserSettingsMenu.tsx | browser | ⚪ |
| `Cache.taskHeader.cache` | TaskHeader.tsx | Cache | ⚪ |
| `Caret is using the browser:.chat.caretIsUsingBrowser` | BrowserSessionRow.tsx | Caret is using the browser: | ⚪ |
| `Caret wants to use the browser:.chat.caretWantsToUseBrowser` | BrowserSessionRow.tsx | Caret wants to use the browser: | ⚪ |
| `chat. ` | ChatView.tsx | chat | ⚪ |
| `chat.addToInputSubscriptionCompleted` | ChatView.tsx | chat | ⚪ |
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
| `Checkpoint (restored).checkmarkControl.checkpointRestored` | CheckmarkControl.tsx | Checkpoint (restored) | ⚪ |
| `Checkpoint.checkmarkControl.checkpoint` | CheckmarkControl.tsx | Checkpoint | ⚪ |
| `Choose SAP AI Core model...` | SapAiCoreModelPicker.spec.tsx | Choose SAP AI Core model | ⚪ |
| `Clear search.settings.openRouter.clearSearch` | OpenRouterModelPicker.tsx | Clear search | ⚪ |
| `Clear search.settings.requesty.clearSearch` | RequestyModelPicker.tsx | Clear search | ⚪ |
| `Click ({{coordinate}}).browser.actionClick` | BrowserSessionRow.tsx | Click ({{coordinate}}) | ⚪ |
| `Close browser.browser.actionClose` | BrowserSessionRow.tsx | Close browser | ⚪ |
| `Close Task.taskHeader.closeTask` | TaskHeader.tsx | Close Task | ⚪ |
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
| `Completion Tokens.taskHeader.completionTokens` | TaskHeader.tsx | Completion Tokens | ⚪ |
| `Console Logs.browser.consoleLogs` | BrowserSessionRow.tsx | Console Logs | ⚪ |
| `Context window usage.taskHeader.contextWindowUsage` | TaskHeader.tsx | Context window usage | ⚪ |
| `credits.tab` | helpers.ts | credits | ⚪ |
| `Current tokens used in this request.taskHeader.currentTokens` | TaskHeader.tsx | Current tokens used in this request | ⚪ |
| `Default: https://api.example.com.settings.baseUrl.placeholder` | BaseUrlField.tsx | Default: https://api | ⚪ |
| `disabling checkpoints..taskHeader.disablingCheckpoints` | TaskHeader.tsx | disabling checkpoints | ⚪ |
| `Dismiss quote.chat.dismissQuote` | QuotedMessagePreview.tsx | Dismiss quote | ⚪ |
| `Edit focus chain list.taskHeader.editFocusChainList` | TaskHeader.tsx | Edit focus chain list | ⚪ |
| `Free.settings.openRouter.featured.grok.label` | OpenRouterModelPicker.tsx | Free | ⚪ |
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
| `Maximum context window size for this model.taskHeader.maxContextWindow` | TaskHeader.tsx | Maximum context window size for this model | ⚪ |
| `MCP Servers.navbar.mcpServersTooltip` | Navbar.tsx | MCP Servers | ⚪ |
| `MCP.navbar.mcp` | Navbar.tsx | MCP | ⚪ |
| `mcp.submitDescription.part1` | McpSubmitCard.tsx | mcp | ⚪ |
| `mcp.submitMcpServer` | McpSubmitCard.tsx | mcp | ⚪ |
| `Model.settings.modelSelector.label` | ModelSelector.tsx | Model | ⚪ |
| `Model.settings.openRouter.modelLabel` | OpenRouterModelPicker.tsx | Model | ⚪ |
| `Model.settings.requesty.modelLabel` | RequestyModelPicker.tsx | Model | ⚪ |
| `Model.settings.sapAiCore.modelLabel` | SapAiCoreModelPicker.tsx | Model | ⚪ |
| `New Task.navbar.newTaskTooltip` | Navbar.tsx | New Task | ⚪ |
| `New.settings.openRouter.featured.gpt5.label` | OpenRouterModelPicker.tsx | New | ⚪ |
| `Next.browser.paginationNext` | BrowserSessionRow.tsx | Next | ⚪ |
| `Previous.browser.paginationPrevious` | BrowserSessionRow.tsx | Previous | ⚪ |
| `Prompt Tokens.taskHeader.promptTokens` | TaskHeader.tsx | Prompt Tokens | ⚪ |
| `Quote selection in reply.chat.quoteSelectionInReply` | QuoteButton.tsx | Quote selection in reply | ⚪ |
| `Quote selection.chat.quoteSelection` | QuoteButton.tsx | Quote selection | ⚪ |
| `Recommended for agentic coding in Cline.settings.openRouter.featured.claudeSonnet4.description` | OpenRouterModelPicker.tsx | Recommended for agentic coding in Cline | ⚪ |
| `Requires API key.mcp.requiresApiKey` | McpMarketplaceCard.tsx | Requires API key | ⚪ |
| `Scroll down.browser.actionScrollDown` | BrowserSessionRow.tsx | Scroll down | ⚪ |
| `Scroll up.browser.actionScrollUp` | BrowserSessionRow.tsx | Scroll up | ⚪ |
| `Search and select a model....settings.openRouter.searchPlaceholder` | OpenRouterModelPicker.tsx | Search and select a model | ⚪ |
| `Search and select a model....settings.requesty.searchPlaceholder` | RequestyModelPicker.tsx | Search and select a model | ⚪ |
| `See here for instructions..taskHeader.seeHereForInstructions` | TaskHeader.tsx | See here for instructions | ⚪ |
| `See less.common.seeLess` | OpenRouterModelPicker.tsx | See less | ⚪ |
| `See less.taskHeader.seeLess` | TaskHeader.tsx | See less | ⚪ |
| `See more.taskHeader.seeMore` | TaskHeader.tsx | See more | ⚪ |
| `Select a model...` | SapAiCoreModelPicker.spec.tsx | Select a model | ⚪ |
| `Select a model....settings.modelSelector.placeholder` | ModelSelector.tsx | Select a model | ⚪ |
| `Select a model....settings.sapAiCore.placeholder` | SapAiCoreModelPicker.tsx | Select a model | ⚪ |
| `settings.about.link` | AboutSection.tsx | settings | ⚪ |
| `settings.apiKeyField.label` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.autoApprove.description` | AutoApproveModal.tsx | settings | ⚪ |
| `settings.basetenModelPicker.basetenLink` | BasetenModelPicker.tsx | settings | ⚪ |
| `settings.groqModelPicker.fetchModelsError` | GroqModelPicker.tsx | settings | ⚪ |
| `settings.huggingFaceModelPicker.fetchModelsError` | HuggingFaceModelPicker.tsx | settings | ⚪ |
| `settings.modelIdField.label` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.modelInfoView.maxOutputTokensLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.modelInfoView.supportsImagesLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.modelInfoView.temperatureLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `Settings.navbar.settings` | Navbar.tsx | Settings | ⚪ |
| `Settings.navbar.settingsTooltip` | Navbar.tsx | Settings | ⚪ |
| `settings.openRouter.info.fullText.part1` | OpenRouterModelPicker.tsx | settings | ⚪ |
| `settings.openRouter.info.fullText.part2` | OpenRouterModelPicker.tsx | settings | ⚪ |
| `settings.openRouter.info.fullText.part3` | OpenRouterModelPicker.tsx | settings | ⚪ |
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
| `settings.providers.openAICompatible.description` | OpenAICompatible.tsx | settings | ⚪ |
| `settings.providers.qwenCode.description` | QwenCodeProvider.tsx | settings | ⚪ |
| `settings.providers.sapAiCore.description` | SapAiCoreProvider.tsx | settings | ⚪ |
| `settings.providers.vercelAiGateway.description` | VercelAIGatewayProvider.tsx | settings | ⚪ |
| `settings.providers.vsCodeLm.description` | VSCodeLmProvider.tsx | settings | ⚪ |
| `settings.qwenProvider.apiLineOptions.${line}` | QwenProvider.tsx | settings | ⚪ |
| `settings.requesty.info.fullText.part1` | RequestyModelPicker.tsx | settings | ⚪ |
| `settings.requesty.info.fullText.part2` | RequestyModelPicker.tsx | settings | ⚪ |
| `settings.terminalOutputLineLimit.description` | TerminalOutputLineLimitSlider.tsx | settings | ⚪ |
| `settings.terminalOutputLineLimit.label` | TerminalOutputLineLimitSlider.tsx | settings | ⚪ |
| `settings.thinkingBudget.budgetText.part1` | ThinkingBudgetSlider.tsx | settings | ⚪ |
| `settings.thinkingBudget.budgetText.part2` | ThinkingBudgetSlider.tsx | settings | ⚪ |
| `settings.thinkingBudget.description` | ThinkingBudgetSlider.tsx | settings | ⚪ |
| `settings.thinkingBudget.enable` | ThinkingBudgetSlider.tsx | settings | ⚪ |
| `settings.useCustomPrompt.description` | UseCustomPromptCheckbox.tsx | settings | ⚪ |
| `settings.useCustomPrompt.label` | UseCustomPromptCheckbox.tsx | settings | ⚪ |
| `settings.useCustomPrompt.warning` | UseCustomPromptCheckbox.tsx | settings | ⚪ |
| `settings.vertex.projectIdLabel` | VertexProvider.tsx | settings | ⚪ |
| `settings.vertex.projectIdPlaceholder` | VertexProvider.tsx | settings | ⚪ |
| `settings.vertex.regionLabel` | VertexProvider.tsx | settings | ⚪ |
| `settings.vertex.selectRegionPlaceholder` | VertexProvider.tsx | settings | ⚪ |
| `settings.vertex.setupDescription` | VertexProvider.tsx | settings | ⚪ |
| `settings.vertex.setupLink1` | VertexProvider.tsx | settings | ⚪ |
| `settings.vertex.setupLink2` | VertexProvider.tsx | settings | ⚪ |
| `settings.vsCodeLm.experimentalNote` | VSCodeLmProvider.tsx | settings | ⚪ |
| `settings.vsCodeLm.getStartedDescription` | VSCodeLmProvider.tsx | settings | ⚪ |
| `settings.vsCodeLm.modelLabel` | VSCodeLmProvider.tsx | settings | ⚪ |
| `settings.vsCodeLm.selectModelPlaceholder` | VSCodeLmProvider.tsx | settings | ⚪ |
| `Step {{currentPage}} of {{totalPages}}.browser.paginationStep` | BrowserSessionRow.tsx | Step {{currentPage}} of {{totalPages}} | ⚪ |
| `Switch to 1M context window model.settings.openRouter.switchTo1M` | OpenRouterModelPicker.tsx | Switch to 1M context window model | ⚪ |
| `Switch to 200K context window model.settings.openRouter.switchTo200K` | OpenRouterModelPicker.tsx | Switch to 200K context window model | ⚪ |
| `Task.taskHeader.task` | TaskHeader.tsx | Task | ⚪ |
| `Tokens read from cache.taskHeader.tokensReadFromCache` | TaskHeader.tsx | Tokens read from cache | ⚪ |
| `Tokens written to cache.taskHeader.tokensWrittenToCache` | TaskHeader.tsx | Tokens written to cache | ⚪ |
| `Tokens.taskHeader.tokens` | TaskHeader.tsx | Tokens | ⚪ |
| `true.redirect` | helpers.ts | true | ⚪ |
| `Use custom base URL.settings.baseUrl.label` | BaseUrlField.tsx | Use custom base URL | ⚪ |
| `welcome.quickWinsTitle.part1` | SuggestedTasks.tsx | welcome | ⚪ |
| `welcome.quickWinsTitle.part2` | SuggestedTasks.tsx | welcome | ⚪ |
| `welcome.quickWinsTitle.part3` | SuggestedTasks.tsx | welcome | ⚪ |

🔥 = 고우선순위 (여러 컴포넌트에서 사용)
⚪ = 저우선순위 (단일 컴포넌트 사용)


## 📂 컴포넌트 사용 분석

i18n 키를 사용하는 컴포넌트들:

Total components using i18n: **133**

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
| `history\HistoryView.tsx` | 19 | `history.historyView.deleteSelectedWithCount`, `history.deleteAllHistory`, `history.title` (+16 more) |
| `chat\Announcement.tsx` | 18 | `common.announcement.newVersion`, `common.announcement.features.freeStealth.title`, `common.announcement.features.freeStealth.description` (+15 more) |
| `mcp\configuration\tabs\installed\server-row\ServerRow.tsx` | 18 | `chat.serverRow.timeout30Seconds`, `chat.serverRow.timeout1Minute`, `chat.serverRow.timeout5Minutes` (+15 more) |
| `settings\providers\LiteLlmProvider.tsx` | 18 | `settings.liteLlmProvider.baseUrlPlaceholder`, `settings.baseUrlField.label`, `settings.liteLlmProvider.apiKeyPlaceholder` (+15 more) |
| `settings\providers\OpenRouterProvider.tsx` | 18 | `settings.openRouterProvider.balanceDisplay.tooltip`, `settings.openRouterProvider.balanceDisplay.label`, `settings.openRouterProvider.balanceDisplay.loading` (+15 more) |
| `chat\task-header\TaskHeader.tsx` | 16 | `Current tokens used in this request.taskHeader.currentTokens`, `Context window usage.taskHeader.contextWindowUsage`, `Maximum context window size for this model.taskHeader.maxContextWindow` (+13 more) |
| `settings\common\ModelInfoView.tsx` | 16 | `settings.modelInfoView.millionTokensLabel`, `settings.modelInfoView.tokensSuffix`, `settings.modelInfoView.inputPrice` (+13 more) |
| `settings\providers\OllamaProvider.tsx` | 16 | `settings.ollamaProvider.fetchModelsErrorLog`, `settings.providers.ollama.description`, `settings.ollamaProvider.baseUrlLabel` (+13 more) |
| `chat\BrowserSessionRow.tsx` | 15 | `Step {{currentPage}} of {{totalPages}}.browser.paginationStep`, `Launch browser at {{text}}.browser.actionLaunch`, `Click ({{coordinate}}).browser.actionClick` (+12 more) |
| `chat\chat-view\shared\buttonConfig.ts` | 14 | `common.button.retry`, `chat.startNewTask`, `common.button.proceedAnyways` (+11 more) |
| `chat\ChatTextArea.tsx` | 14 | `chat.mode.tooltip.toggle`, `chat.mode.tooltip.description`, `chat.image.dimensionError` (+11 more) |
| `mcp\configuration\tabs\add-server\AddRemoteServerForm.tsx` | 14 | `chat.addRemoteServerForm.serverNameRequired`, `chat.addRemoteServerForm.serverUrlRequired`, `chat.addRemoteServerForm.invalidUrlFormat` (+11 more) |
| `settings\OpenRouterModelPicker.tsx` | 14 | `Recommended for agentic coding in Cline.settings.openRouter.featured.claudeSonnet4.description`, `Best.settings.openRouter.featured.claudeSonnet4.label`, `New.settings.openRouter.featured.gpt5.label` (+11 more) |
| `mcp\configuration\tabs\marketplace\McpMarketplaceView.tsx` | 13 | `chat.mcpMarketplaceView.failedToLoadMarketplaceData`, `chat.mcpMarketplaceView.retry`, `chat.mcpMarketplaceView.searchMcps` (+10 more) |
| `settings\sections\TerminalSettingsSection.tsx` | 13 | `settings.terminal.positiveNumberError`, `settings.terminal.defaultProfile`, `settings.terminal.defaultProfileDescription` (+10 more) |
| `mcp\chat-display\LinkPreview.tsx` | 12 | `chat.linkPreview.loadingPreviewFor`, `chat.linkPreview.waitingForMinutesSeconds`, `chat.linkPreview.waitingForSeconds` (+9 more) |
| `settings\providers\QwenCodeProvider.tsx` | 12 | `settings.providers.qwenCode.description`, `settings.qwenCodeProvider.apiConfigurationTitle`, `settings.qwenCodeProvider.oauthCredentialsPathPlaceholder` (+9 more) |
| `cline-rules\ClineRulesToggleModal.tsx` | 11 | `chat.clineRulesToggleModal.manageRulesWorkflows`, `chat.clineRulesToggleModal.rulesTab`, `chat.clineRulesToggleModal.workflowsTab` (+8 more) |
| `settings\providers\VercelAIGatewayProvider.tsx` | 11 | `settings.vercelAiGatewayProvider.fetchModelsErrorLog`, `settings.providers.vercelAiGateway.description`, `settings.apiKeyField.placeholder` (+8 more) |
| `account\CreditsHistoryTable.tsx` | 10 | `common.account.usageHistory`, `common.account.paymentsHistory`, `common.account.loading` (+7 more) |
| `chat\ErrorRow.tsx` | 10 | `chat.errorRow.requestId`, `chat.errorRow.powershellIssue`, `chat.errorRow.troubleshootingGuide` (+7 more) |
| `common\CheckmarkControl.tsx` | 10 | `Checkpoint (restored).checkmarkControl.checkpointRestored`, `Checkpoint.checkmarkControl.checkpoint`, `chat.checkmarkControl.compare` (+7 more) |
| `mcp\chat-display\ImagePreview.tsx` | 10 | `chat.imagePreview.timeoutLoadingImage`, `chat.imagePreview.failedToLoadImage`, `chat.imagePreview.loadingImageFrom` (+7 more) |
| `menu\Navbar.tsx` | 10 | `Chat.navbar.chat`, `New Task.navbar.newTaskTooltip`, `MCP.navbar.mcp` (+7 more) |
| `settings\providers\CaretProvider.tsx` | 10 | `settings.providers.caret.loginError`, `settings.providers.caret.description`, `settings.providers.caret.login` (+7 more) |
| `settings\providers\XaiProvider.tsx` | 10 | `settings.providers.xai.description`, `settings.xaiProvider.providerName`, `settings.xaiProvider.notePrefix` (+7 more) |
| `account\AccountView.tsx` | 9 | `common.account.title`, `common.button.done`, `common.account.failedToFetchUserCredit` (+6 more) |
| `browser\BrowserSettingsMenu.tsx` | 9 | `browser.connectionInfo`, `browser.popover.title`, `browser.popover.statusLabel` (+6 more) |
| `chat\ContextMenu.tsx` | 9 | `chat.contextMenu.problems`, `chat.contextMenu.terminal`, `chat.contextMenu.pasteUrlToFetchContents` (+6 more) |
| `chat\ErrorBlockTitle.tsx` | 9 | `chat.errorBlockTitle.apiRetryAttempt`, `chat.errorBlockTitle.inSeconds`, `chat.errorBlockTitle.ellipsis` (+6 more) |
| `chat\ReportBugPreview.tsx` | 9 | `chat.bugReport.title`, `chat.bugReport.whatHappened`, `chat.bugReport.stepsToReproduce` (+6 more) |
| `mcp\configuration\McpConfigurationView.tsx` | 9 | `chat.brandMarketplace.preparing`, `chat.brandMarketplace.preparingDescription`, `chat.mcpConfigurationView.mcpServers` (+6 more) |
| `settings\BasetenModelPicker.tsx` | 9 | `settings.basetenModelPicker.modelNotStatic`, `settings.basetenModelPicker.fetchModelsError`, `settings.modelSelector.label` (+6 more) |
| `settings\providers\ClineProvider.tsx` | 9 | `settings.clineProvider.sortUnderlyingProviderRouting`, `settings.clineProvider.defaultOption`, `settings.clineProvider.priceOption` (+6 more) |
| `settings\providers\VertexProvider.tsx` | 9 | `settings.providers.vertex.description`, `settings.vertex.projectIdPlaceholder`, `settings.vertex.projectIdLabel` (+6 more) |
| `account\AccountWelcomeView.tsx` | 8 | `common.account.signUpDescription`, `common.account.signUpWithCaret`, `common.account.byContining` (+5 more) |
| `common\CheckpointControls.tsx` | 8 | `chat.checkpointControls.compare`, `chat.checkpointControls.restore`, `chat.checkpointControls.restoreTaskAndWorkspace` (+5 more) |
| `mcp\configuration\tabs\installed\InstalledServersView.tsx` | 8 | `chat.installedServersView.descriptionPart1`, `chat.installedServersView.modelContextProtocol`, `chat.installedServersView.descriptionPart2` (+5 more) |
| `settings\GroqModelPicker.tsx` | 8 | `settings.groqModelPicker.fetchModelsError`, `settings.groqModelPicker.fetchModelsDescription`, `settings.groqModelPicker.groqLinkText` (+5 more) |
| `settings\providers\LMStudioProvider.tsx` | 8 | `settings.lmStudioProvider.parseModelsError`, `settings.providers.lmstudio.description`, `settings.baseUrlField.label` (+5 more) |
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
| `settings\RequestyModelPicker.tsx` | 6 | `Model.settings.requesty.modelLabel`, `Search and select a model....settings.requesty.searchPlaceholder`, `Clear search.settings.requesty.clearSearch` (+3 more) |
| `common\AlertDialog.tsx` | 5 | `chat.alertDialog.unsavedChangesTitle`, `chat.alertDialog.unsavedChangesDescription`, `chat.alertDialog.discardChanges` (+2 more) |
| `common\MarkdownBlock.tsx` | 5 | `chat.markdownBlock.openFileInEditor`, `chat.markdownBlock.clickToToggleActMode`, `chat.markdownBlock.alreadyInActMode` (+2 more) |
| `mcp\configuration\tabs\add-server\AddLocalServerForm.tsx` | 5 | `chat.addLocalServerForm.addLocalServerDescriptionPart1`, `chat.addLocalServerForm.clineMcpSettingsJson`, `chat.addLocalServerForm.addLocalServerDescriptionPart2` (+2 more) |
| `mcp\configuration\tabs\marketplace\McpMarketplaceCard.tsx` | 5 | `{{name}} logo.mcp.logoAlt`, `Installed.mcp.installed`, `Installing....mcp.installing` (+2 more) |
| `settings\providers\ClaudeCodeProvider.tsx` | 5 | `settings.providers.claude-code.description`, `settings.providers.claudeCode.cliPathPlaceholder`, `settings.providers.claudeCode.cliPath` (+2 more) |
| `settings\providers\GeminiProvider.tsx` | 5 | `settings.providers.gemini.description`, `settings.providers.gemini.name`, `settings.baseUrlField.label` (+2 more) |
| `settings\providers\HuggingFaceProvider.tsx` | 5 | `settings.providers.huggingface.description`, `settings.huggingFaceProvider.apiKeyPlaceholder`, `settings.huggingFaceProvider.apiKeyLabel` (+2 more) |
| `settings\providers\MoonshotProvider.tsx` | 5 | `settings.providers.moonshot.description`, `settings.moonshotProvider.entrypoint`, `settings.apiKeyField.defaultHelpText` (+2 more) |
| `settings\providers\VSCodeLmProvider.tsx` | 5 | `settings.providers.vsCodeLm.description`, `settings.vsCodeLm.modelLabel`, `settings.vsCodeLm.selectModelPlaceholder` (+2 more) |
| `settings\providers\ZAiProvider.tsx` | 5 | `settings.providers.zai.description`, `settings.zaiProvider.entrypointLabel`, `settings.zaiProvider.entrypointDescription` (+2 more) |
| `chat\ChatErrorBoundary.tsx` | 4 | `chat.error.unknown`, `settings.debug.errorInSeconds`, `chat.error.displayContent` (+1 more) |
| `chat\UserMessage.tsx` | 4 | `chat.userMessage.restoreAll`, `chat.userMessage.restoreAllTooltip`, `chat.userMessage.restoreChat` (+1 more) |
| `settings\HuggingFaceModelPicker.tsx` | 4 | `settings.huggingFaceModelPicker.fetchModelsError`, `settings.huggingFaceModelPicker.modelLabel`, `settings.huggingFaceModelPicker.searchPlaceholder` (+1 more) |
| `settings\providers\DifyProvider.tsx` | 4 | `settings.providers.dify.description`, `settings.providers.dify.baseUrlPlaceholder`, `settings.providers.dify.baseUrlLabel` (+1 more) |
| `settings\providers\NebiusProvider.tsx` | 4 | `settings.providers.nebius.description`, `settings.nebiusProvider.apiKeyHelpText`, `settings.providers.nebius.name` (+1 more) |
| `settings\providers\RequestyProvider.tsx` | 4 | `settings.providers.requesty.description`, `settings.providers.requesty.name`, `settings.requestyProvider.useCustomBaseUrlLabel` (+1 more) |
| `settings\SapAiCoreModelPicker.tsx` | 4 | `Select a model....settings.sapAiCore.placeholder`, `── Deployed Models ──.settings.sapAiCore.deployedModels`, `── Not Deployed Models ──.settings.sapAiCore.notDeployedModels` (+1 more) |
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
| `settings\common\ApiKeyField.tsx` | 2 | `common.settings.apiKey.placeholder`, `common.settings.apiKey.helpText` |
| `settings\common\BaseUrlField.tsx` | 2 | `Use custom base URL.settings.baseUrl.label`, `Default: https://api.example.com.settings.baseUrl.placeholder` |
| `settings\common\ModelSelector.tsx` | 2 | `Model.settings.modelSelector.label`, `Select a model....settings.modelSelector.placeholder` |
| `settings\OllamaModelPicker.tsx` | 2 | `settings.ollamaModelPicker.searchPlaceholder`, `settings.ollamaModelPicker.clearSearch` |
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


## 🛠️ 정리 권장사항

### 🗑️ 미사용 키 제거
- **작업**: locale 파일에서 956개의 미사용 키 제거
- **효과**: 번들 크기 감소 및 유지보수 부담 경감
- **우선순위**: 낮음 (향후 기능을 위한 플레이스홀더가 아닌 경우)

### 🌍 누락 번역 완성
- **작업**: 467개의 누락된 번역 추가
- **고우선순위**: 91개 (현재 사용중인 키들)
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
**현재 상태**: 467개 키에서 번역 누락

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
- 미사용 키 956개에 대한 검토
- 향후 사용 예정인지, 레거시 키인지 판단
- 확실한 불필요 키들은 locale 파일에서 제거
- 번들 크기 최적화 및 유지보수성 향상
**현재 상태**: 956개 미사용 키 탐지 (사용률 44.8%)

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
- **컴포넌트 디렉토리**: `D:\dev\caret-merge\webview-ui\src\components`
- **Locale 디렉토리**: `D:\dev\caret-merge\webview-ui\src\caret\locale`

---
*Caret i18n 분석 도구로 생성됨*
