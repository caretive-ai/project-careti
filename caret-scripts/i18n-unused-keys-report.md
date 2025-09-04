# i18n 미사용 키 분석 보고서

**생성일시**: 2025-09-03 23:21:30
**분석기**: report-i18n-unused-key.js
**프로젝트**: Caret 프론트엔드 i18n 시스템

## 📊 요약 통계

- **총 키 개수**: 669개
- **사용중인 키**: 40개
- **미사용 키**: 629개
- **스캔한 파일**: 188개
- **사용률**: 6.0%

## 🗑️ 미사용 키 목록 (629개)

locale 파일에 정의되어 있지만 컴포넌트에서 참조되지 않는 키들:

| Key | Namespace | Available Locales | Count |
|-----|-----------|------------------|-------|
| `bullets.current.1` | announcement | ko | 1 |
| `bullets.current.2` | announcement | ko | 1 |
| `header` | announcement | ko | 1 |
| `links.and` | announcement | ko | 1 |
| `links.facebook` | announcement | ko | 1 |
| `links.github` | announcement | ko | 1 |
| `links.intro` | announcement | ko | 1 |
| `links.outro` | announcement | ko | 1 |
| `previousHeader` | announcement | ko | 1 |
| `chat.addContext` | chat | ko, en | 2 |
| `chat.addFilesImages` | chat | ko, en | 2 |
| `chat.bugReport.additionalContext` | chat | ko, en | 2 |
| `chat.bugReport.clineVersion` | chat | ko, en | 2 |
| `chat.bugReport.operatingSystem` | chat | ko, en | 2 |
| `chat.bugReport.providerModel` | chat | ko, en | 2 |
| `chat.bugReport.relevantApiRequestOutput` | chat | ko, en | 2 |
| `chat.bugReport.stepsToReproduce` | chat | ko, en | 2 |
| `chat.bugReport.systemInfo` | chat | ko, en | 2 |
| `chat.bugReport.title` | chat | ko, en | 2 |
| `chat.bugReport.whatHappened` | chat | ko, en | 2 |
| `chat.contextMenu.add` | chat | ko, en | 2 |
| `chat.contextMenu.file` | chat | ko, en | 2 |
| `chat.contextMenu.folder` | chat | ko, en | 2 |
| `chat.contextMenu.gitCommits` | chat | ko, en | 2 |
| `chat.contextMenu.noResultsFound` | chat | ko, en | 2 |
| `chat.contextMenu.pasteUrlToFetchContents` | chat | ko, en | 2 |
| `chat.contextMenu.problems` | chat | ko, en | 2 |
| `chat.contextMenu.searching` | chat | ko, en | 2 |
| `chat.contextMenu.terminal` | chat | ko, en | 2 |
| `chat.creditLimitError.buyCredits` | chat | ko, en | 2 |
| `chat.creditLimitError.outOfCredits` | chat | ko, en | 2 |
| `chat.creditLimitError.retryRequest` | chat | ko, en | 2 |
| `chat.error.displayContent` | chat | ko, en | 2 |
| `chat.error.label` | chat | ko, en | 2 |
| `chat.error.maxRequestsReached` | chat | ko, en | 2 |
| `chat.error.mistakeLimitReached` | chat | ko, en | 2 |
| `chat.error.unknown` | chat | ko, en | 2 |
| `chat.error.unknownError` | chat | ko, en | 2 |
| `chat.errorBlockTitle.apiRequest` | chat | ko, en | 2 |
| `chat.errorBlockTitle.apiRequestCancelled` | chat | ko, en | 2 |
| `chat.errorBlockTitle.apiRequestFailed` | chat | ko, en | 2 |
| `chat.errorBlockTitle.apiRequestLoading` | chat | ko, en | 2 |
| `chat.errorBlockTitle.apiRetryAttempt` | chat | ko, en | 2 |
| `chat.errorBlockTitle.apiStreamingFailed` | chat | ko, en | 2 |
| `chat.errorBlockTitle.creditLimitReached` | chat | ko, en | 2 |
| `chat.errorBlockTitle.ellipsis` | chat | ko, en | 2 |
| `chat.errorBlockTitle.inSeconds` | chat | ko, en | 2 |
| `chat.errorRow.clickRetryBelow` | chat | ko, en | 2 |
| `chat.errorRow.clineTriedToAccess` | chat | ko, en | 2 |
| `chat.errorRow.diffError` | chat | ko, en | 2 |
| `chat.errorRow.file` | chat | ko, en | 2 |
| `chat.errorRow.isBlockedBy` | chat | ko, en | 2 |
| `chat.errorRow.period` | chat | ko, en | 2 |
| `chat.errorRow.powershellIssue` | chat | ko, en | 2 |
| `chat.errorRow.requestId` | chat | ko, en | 2 |
| `chat.errorRow.signInToCline` | chat | ko, en | 2 |
| `chat.errorRow.troubleshootingGuide` | chat | ko, en | 2 |
| `chat.image.dimensionError` | chat | ko, en | 2 |
| `chat.image.unsupportedFileError` | chat | ko, en | 2 |
| `chat.mcp.resource` | chat | ko, en | 2 |
| `chat.mcp.tool` | chat | ko, en | 2 |
| `chat.mcp.useServer` | chat | ko, en | 2 |
| `chat.mode.act.label` | chat | ko, en | 2 |
| `chat.mode.plan.label` | chat | ko, en | 2 |
| `chat.mode.tooltip.act.action` | chat | ko, en | 2 |
| `chat.mode.tooltip.description` | chat | ko, en | 2 |
| `chat.mode.tooltip.plan.action` | chat | ko, en | 2 |
| `chat.openDiskTaskHistoryButton.openDiskTaskHistory` | chat | ko, en | 2 |
| `chat.selectModelApiProvider` | chat | ko, en | 2 |
| `chat.serversToggleModal.manageMcpServers` | chat | ko, en | 2 |
| `chat.serversToggleModal.mcpServers` | chat | ko, en | 2 |
| `chat.slashCommandMenu.defaultCommands` | chat | ko, en | 2 |
| `chat.slashCommandMenu.noMatchingCommandsFound` | chat | ko, en | 2 |
| `chat.slashCommandMenu.workflowCommands` | chat | ko, en | 2 |
| `chat.taskCompleted` | chat | ko, en | 2 |
| `chat.taskFeedbackButtons.thisWasHelpful` | chat | ko, en | 2 |
| `chat.taskFeedbackButtons.thisWasNotHelpful` | chat | ko, en | 2 |
| `chat.taskHeader.allStepsCompleted` | chat | ko, en | 2 |
| `chat.taskHeader.cache` | chat | ko, en | 2 |
| `chat.taskHeader.closeTask` | chat | ko, en | 2 |
| `chat.taskHeader.completionTokens` | chat | ko, en | 2 |
| `chat.taskHeader.disablingCheckpoints` | chat | ko, en | 2 |
| `chat.taskHeader.editFocusChainList` | chat | ko, en | 2 |
| `chat.taskHeader.newStepsGenerated` | chat | ko, en | 2 |
| `chat.taskHeader.promptTokens` | chat | ko, en | 2 |
| `chat.taskHeader.seeHereForInstructions` | chat | ko, en | 2 |
| `chat.taskHeader.seeLess` | chat | ko, en | 2 |
| `chat.taskHeader.seeMore` | chat | ko, en | 2 |
| `chat.taskHeader.task` | chat | ko, en | 2 |
| `chat.taskHeader.tokens` | chat | ko, en | 2 |
| `chat.taskHeader.tokensReadFromCache` | chat | ko, en | 2 |
| `chat.taskHeader.tokensWrittenToCache` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.assistantMessage` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.assistantResponse` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.browserAction` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.browserActionApproval` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.browserResult` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.checkpointCreated` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.fileEdit` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.fileEditApproval` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.fileRead` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.fileReadApproval` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.newFile` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.newFileApproval` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.planningResponse` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.taskCompleted` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.taskMessage` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.terminalCommand` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.terminalCommandApproval` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.terminalOutput` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.tool` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.toolApproval` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.toolUse` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.unknown` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.unknownFile` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.unknownMessageType` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.unknownUrl` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.userMessage` | chat | ko, en | 2 |
| `chat.taskTimelineTooltip.webFetch` | chat | ko, en | 2 |
| `chat.tool.commandApprovalRequired` | chat | ko, en | 2 |
| `chat.tool.commandOutput` | chat | ko, en | 2 |
| `chat.tool.condenseConversation` | chat | ko, en | 2 |
| `chat.tool.createFile` | chat | ko, en | 2 |
| `chat.tool.createGithubIssue` | chat | ko, en | 2 |
| `chat.tool.editFile` | chat | ko, en | 2 |
| `chat.tool.externalUrl` | chat | ko, en | 2 |
| `chat.tool.listCodeDefinitionNames` | chat | ko, en | 2 |
| `chat.tool.listFilesRecursive` | chat | ko, en | 2 |
| `chat.tool.listFilesTopLevel` | chat | ko, en | 2 |
| `chat.tool.mcpLoadingDocumentation` | chat | ko, en | 2 |
| `chat.tool.mcpNotification` | chat | ko, en | 2 |
| `chat.tool.outsideWorkspace` | chat | ko, en | 2 |
| `chat.tool.readFile` | chat | ko, en | 2 |
| `chat.tool.searchFiles` | chat | ko, en | 2 |
| `chat.tool.seeNewChanges` | chat | ko, en | 2 |
| `chat.tool.shellIntegration.description` | chat | ko, en | 2 |
| `chat.tool.shellIntegration.troubleshooting` | chat | ko, en | 2 |
| `chat.tool.shellIntegration.unavailable` | chat | ko, en | 2 |
| `chat.tool.summarizeTask` | chat | ko, en | 2 |
| `chat.tool.summary` | chat | ko, en | 2 |
| `chat.tool.thinking.label` | chat | ko, en | 2 |
| `chat.tool.webFetch` | chat | ko, en | 2 |
| `chat.userMessage.restoreAll` | chat | ko | 1 |
| `chat.userMessage.restoreAllTooltip` | chat | ko | 1 |
| `chat.userMessage.restoreChat` | chat | ko | 1 |
| `chat.userMessage.restoreChatTooltip` | chat | ko | 1 |
| `account.organization` | common | ko, en | 2 |
| `account.payAsYouGo` | common | ko, en, ja, zh | 4 |
| `account.payAsYouGoDescription` | common | ko, en, ja, zh | 4 |
| `account.subscription` | common | ko, en, ja, zh | 4 |
| `account.subscriptionBasic` | common | ko, en, ja, zh | 4 |
| `account.subscriptionFree` | common | ko, en, ja, zh | 4 |
| `account.viewBillingUsage` | common | ko, en, ja, zh | 4 |
| `announcement.newVersion` | common | ko, en, ja, zh | 4 |
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
| `apiOptions.loading` | common | en, ja, zh | 3 |
| `apiOptions.maxCompletionTokens` | common | ko, en, ja, zh | 4 |
| `apiOptions.maxContextTokens` | common | ko, en, ja, zh | 4 |
| `apiOptions.millionTokens` | common | ko, en | 2 |
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
| `apiOptions.systemMessages.fetchedContentFromUrl` | common | ko, en | 2 |
| `apiOptions.systemMessages.taskCompleted` | common | ko, en | 2 |
| `apiOptions.systemMessages.viewedCodeDefinitions` | common | ko, en | 2 |
| `apiOptions.systemMessages.viewedFilesRecursively` | common | ko, en | 2 |
| `apiOptions.systemMessages.viewedTopLevelFiles` | common | ko, en | 2 |
| `apiOptions.systemMessages.wantsToFetchContentFromUrl` | common | ko, en | 2 |
| `apiOptions.systemMessages.wantsToSearchDirectory` | common | ko, en | 2 |
| `apiOptions.systemMessages.wantsToViewCodeDefinitions` | common | ko, en | 2 |
| `apiOptions.systemMessages.wantsToViewFilesRecursively` | common | ko, en | 2 |
| `apiOptions.systemMessages.wantsToViewTopLevelFiles` | common | ko, en | 2 |
| `apiOptions.thisKeyStoredLocally` | common | ko, en, ja, zh | 4 |
| `apiOptions.tokens` | common | ko, en | 2 |
| `apiOptions.useCustomBaseUrl` | common | ko, en, ja, zh | 4 |
| `autoApprove.addQuickAccess` | common | ko, en, ja, zh | 4 |
| `autoApprove.removeQuickAccess` | common | ko, en, ja, zh | 4 |
| `button.cancel` | common | ko, en, ja, zh | 4 |
| `button.freeStart` | common | ko, en, ja, zh | 4 |
| `button.letsGo` | common | ko, en, ja, zh | 4 |
| `button.notifyCaretAccount` | common | ko, en, ja, zh | 4 |
| `button.save` | common | ko, en, ja, zh | 4 |
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
| `chat.apiRequest` | common | ko, en, ja, zh | 4 |
| `chat.apiRequestCancelled` | common | ko, en, ja, zh | 4 |
| `chat.apiRequestFailed` | common | ko, en, ja, zh | 4 |
| `chat.apiRequestPending` | common | ko, en, ja, zh | 4 |
| `chat.apiStreamingFailed` | common | ko, en, ja, zh | 4 |
| `chat.cancel` | common | en, ja, zh | 3 |
| `chat.caretHasQuestion` | common | ko, en, ja, zh | 4 |
| `chat.caretIsUsingBrowser` | common | ko, en, ja, zh | 4 |
| `chat.caretWantsToCreateNewFile` | common | ko, en, ja, zh | 4 |
| `chat.caretWantsToUseBrowser` | common | ko, en, ja, zh | 4 |
| `chat.executeCommand` | common | ko, en, ja | 3 |
| `chat.placeholderHint` | common | ko, en, ja, zh | 4 |
| `chat.typeMessage` | common | ko, en, ja, zh | 4 |
| `chat.typeTaskHere` | common | ko, en, ja, zh | 4 |
| `common.scrollToBottom` | common | ko | 1 |
| `error.generic` | common | ko, en, ja, zh | 4 |
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
| `history.title` | common | en, ja, zh | 3 |
| `imageAlt.caretBanner` | common | ko, en, ja, zh | 4 |
| `link.learnMoreCaretGit` | common | ko, en, ja, zh | 4 |
| `mcp.autoApprove` | common | ko, en, ja, zh | 4 |
| `mcp.autoApproveAllTools` | common | ko, en, ja, zh | 4 |
| `mcp.configureServers` | common | ko, en, ja, zh | 4 |
| `mcp.description` | common | en, ja, zh | 3 |
| `mcp.installed` | common | ko, en, ja, zh | 4 |
| `mcp.marketplace` | common | ko, en, ja, zh | 4 |
| `mcp.noMatchingServers` | common | ko, en, ja, zh | 4 |
| `mcp.noServersFound` | common | ko, en, ja, zh | 4 |
| `mcp.noServersInstalled` | common | ko, en, ja, zh | 4 |
| `mcp.remoteServers` | common | ko, en, ja, zh | 4 |
| `mcp.title` | common | en, ja, zh | 3 |
| `mode.act.description` | common | en, ja, zh | 3 |
| `mode.act.label` | common | en, ja, zh | 3 |
| `mode.act.title` | common | en, ja, zh | 3 |
| `mode.agent.description` | common | en, ja, zh | 3 |
| `mode.agent.label` | common | en, ja, zh | 3 |
| `mode.agent.title` | common | en, ja, zh | 3 |
| `mode.chatbot.description` | common | ko, en, ja, zh | 4 |
| `mode.chatbot.label` | common | ko, en, ja, zh | 4 |
| `mode.chatbot.title` | common | ko, en, ja, zh | 4 |
| `mode.plan.description` | common | en, ja, zh | 3 |
| `mode.plan.label` | common | en, ja, zh | 3 |
| `mode.plan.title` | common | en, ja, zh | 3 |
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
| `rules.action.newRuleFile` | common | ko, en, ja, zh | 4 |
| `rules.button.changePersonaTemplate` | common | ko, en, ja, zh | 4 |
| `rules.button.selectPersonaTemplate` | common | ko, en, ja, zh | 4 |
| `rules.description.personaManagement` | common | en, ja, zh | 3 |
| `rules.description.rulesDescription` | common | ko, en, ja, zh | 4 |
| `rules.description.workflowsDescription` | common | ko, en, ja, zh | 4 |
| `rules.docsLink` | common | en | 1 |
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
| `settings.modeSystem.description` | common | en, ja, zh | 3 |
| `settings.modeSystem.label` | common | en, ja, zh | 3 |
| `settings.modeSystem.options.caret` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.options.Caret` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.options.cline` | common | ko, en, ja, zh | 4 |
| `settings.openAIReasoningEffort.description` | common | en | 1 |
| `settings.openAIReasoningEffort.high` | common | en | 1 |
| `settings.openAIReasoningEffort.label` | common | en | 1 |
| `settings.preferredLanguage.description` | common | en, ja, zh | 3 |
| `settings.preferredLanguage.label` | common | en, ja, zh | 3 |
| `settings.separateModels.description` | common | en, ja, zh | 3 |
| `settings.separateModels.label` | common | en, ja, zh | 3 |
| `settings.uiLanguage.description` | common | en, ja, zh | 3 |
| `settings.uiLanguage.label` | common | en, ja, zh | 3 |
| `settings.uiLanguage.option.en` | common | en | 1 |
| `settings.uiLanguage.option.ja` | common | en | 1 |
| `settings.uiLanguage.option.ko` | common | en | 1 |
| `settings.uiLanguage.option.zh` | common | en | 1 |
| `telemetry.closeBannerAria` | common | ko, en, ja, zh | 4 |
| `telemetry.description` | common | en, ja, zh | 3 |
| `telemetry.experimentalFeatures` | common | ko, en, ja, zh | 4 |
| `telemetry.helpImprove` | common | ko, en, ja, zh | 4 |
| `telemetry.settingsLink` | common | ko, en, ja, zh | 4 |
| `text.finalThoughts` | common | ko, en, ja, zh | 4 |
| `title.apiKeySettings` | common | ko, en, ja, zh | 4 |
| `validation.invalidApiKey` | common | ko, en, ja | 3 |
| `welcome.description` | common | en | 1 |
| `welcome.getStarted` | common | en | 1 |
| `welcome.learnMore` | common | en | 1 |
| `welcome.noRecentTasks` | common | ko, en, ja, zh | 4 |
| `welcome.recentTasks` | common | ko, en, ja, zh | 4 |
| `welcome.subtitle` | common | en | 1 |
| `welcome.title` | common | en | 1 |
| `welcome.viewAllHistory` | common | ko, en, ja, zh | 4 |
| `welcome.whatCanIDo` | common | ko, en, ja, zh | 4 |
| `gemini.gemini-2-5-flash-preview-05-20.description` | models | ko | 1 |
| `gemini.gemini-2-5-flash-preview-05-20.name` | models | ko | 1 |
| `gemini.gemini-2-5-pro-preview-06-05.description` | models | ko | 1 |
| `gemini.gemini-2-5-pro-preview-06-05.name` | models | ko | 1 |
| `infoTextCustomInstructions` | persona | ko | 1 |
| `normalState` | persona | ko | 1 |
| `selector.description` | persona | ko | 1 |
| `selector.infoTextCustomInstructions` | persona | ko | 1 |
| `selector.selectButtonText` | persona | ko | 1 |
| `selector.selectedButtonText` | persona | ko | 1 |
| `selector.title` | persona | ko | 1 |
| `selectorDescription` | persona | ko | 1 |
| `selectorTitle` | persona | ko | 1 |
| `thinkingState` | persona | ko | 1 |
| `upload.error` | persona | ko | 1 |
| `upload.normal` | persona | ko | 1 |
| `upload.success` | persona | ko | 1 |
| `upload.thinking` | persona | ko | 1 |
| `about.description` | settings | ko | 1 |
| `about.feedbackPrompt` | settings | ko | 1 |
| `about.title` | settings | ko | 1 |
| `about.version` | settings | ko | 1 |
| `autoApprove.addToQuickAccess` | settings | ko | 1 |
| `autoApprove.editFiles.description` | settings | ko | 1 |
| `autoApprove.editFiles.label` | settings | ko | 1 |
| `autoApprove.editFiles.shortName` | settings | ko | 1 |
| `autoApprove.editFilesExternally.description` | settings | ko | 1 |
| `autoApprove.editFilesExternally.label` | settings | ko | 1 |
| `autoApprove.editFilesExternally.shortName` | settings | ko | 1 |
| `autoApprove.enableAll.description` | settings | ko | 1 |
| `autoApprove.enableAll.label` | settings | ko | 1 |
| `autoApprove.enableAll.shortName` | settings | ko | 1 |
| `autoApprove.enableAutoApprove.description` | settings | ko | 1 |
| `autoApprove.enableAutoApprove.label` | settings | ko | 1 |
| `autoApprove.enableAutoApprove.shortName` | settings | ko | 1 |
| `autoApprove.enableNotifications.description` | settings | ko | 1 |
| `autoApprove.enableNotifications.label` | settings | ko | 1 |
| `autoApprove.enableNotifications.shortName` | settings | ko | 1 |
| `autoApprove.executeAllCommands.description` | settings | ko | 1 |
| `autoApprove.executeAllCommands.label` | settings | ko | 1 |
| `autoApprove.executeAllCommands.shortName` | settings | ko | 1 |
| `autoApprove.executeSafeCommands.description` | settings | ko | 1 |
| `autoApprove.executeSafeCommands.label` | settings | ko | 1 |
| `autoApprove.executeSafeCommands.shortName` | settings | ko | 1 |
| `autoApprove.label` | settings | ko | 1 |
| `autoApprove.readFiles.description` | settings | ko | 1 |
| `autoApprove.readFiles.label` | settings | ko | 1 |
| `autoApprove.readFiles.shortName` | settings | ko | 1 |
| `autoApprove.readFilesExternally.description` | settings | ko | 1 |
| `autoApprove.readFilesExternally.label` | settings | ko | 1 |
| `autoApprove.readFilesExternally.shortName` | settings | ko | 1 |
| `autoApprove.removeFromQuickAccess` | settings | ko | 1 |
| `autoApprove.tooltip` | settings | ko | 1 |
| `autoApprove.useBrowser.description` | settings | ko | 1 |
| `autoApprove.useBrowser.label` | settings | ko | 1 |
| `autoApprove.useBrowser.shortName` | settings | ko | 1 |
| `autoApprove.useMcp.description` | settings | ko | 1 |
| `autoApprove.useMcp.label` | settings | ko | 1 |
| `autoApprove.useMcp.shortName` | settings | ko | 1 |
| `browser.action.click` | settings | ko, en | 2 |
| `browser.action.close` | settings | ko, en | 2 |
| `browser.action.launch` | settings | ko, en | 2 |
| `browser.action.scrollDown` | settings | ko, en | 2 |
| `browser.action.scrollUp` | settings | ko, en | 2 |
| `browser.action.type` | settings | ko, en | 2 |
| `browser.browseActionLabel` | settings | ko, en | 2 |
| `browser.checkingConnection` | settings | ko | 1 |
| `browser.chromeExecutablePath` | settings | ko | 1 |
| `browser.connected` | settings | ko | 1 |
| `browser.consoleLogs` | settings | ko, en | 2 |
| `browser.customChromePath` | settings | ko | 1 |
| `browser.debugModeDescription` | settings | ko | 1 |
| `browser.defaultUrlPlaceholder` | settings | ko, en | 2 |
| `browser.detectedChromePath` | settings | ko | 1 |
| `browser.disableToolUse` | settings | ko | 1 |
| `browser.nextButton` | settings | ko, en | 2 |
| `browser.noNewLogs` | settings | ko, en | 2 |
| `browser.notConnected` | settings | ko | 1 |
| `browser.paginationStep` | settings | ko, en | 2 |
| `browser.previousButton` | settings | ko, en | 2 |
| `browser.remoteBrowserDescription` | settings | ko | 1 |
| `browser.remoteBrowserEnabled` | settings | ko | 1 |
| `browser.remoteBrowserHost` | settings | ko | 1 |
| `browser.screenshotAlt` | settings | ko, en | 2 |
| `browser.sessionStarted` | settings | ko, en | 2 |
| `browser.viewportHeight` | settings | ko | 1 |
| `browser.viewportWidth` | settings | ko | 1 |
| `buttons.apply` | settings | ko | 1 |
| `buttons.cancel` | settings | ko | 1 |
| `buttons.close` | settings | ko | 1 |
| `buttons.discardChanges` | settings | ko | 1 |
| `buttons.done` | settings | ko | 1 |
| `buttons.launchBrowser` | settings | ko | 1 |
| `buttons.launchingBrowser` | settings | ko | 1 |
| `buttons.refresh` | settings | ko | 1 |
| `buttons.reset` | settings | ko | 1 |
| `buttons.save` | settings | ko | 1 |
| `buttons.test` | settings | ko | 1 |
| `debug.description` | settings | ko | 1 |
| `debug.errorInSeconds` | settings | ko, en | 2 |
| `debug.resetGlobalState` | settings | ko | 1 |
| `debug.resetGlobalStateDescription` | settings | ko | 1 |
| `debug.resetWorkspaceState` | settings | ko | 1 |
| `debug.title` | settings | ko | 1 |
| `features.collapseMcpResponses` | settings | ko | 1 |
| `features.collapseMcpResponsesDescription` | settings | ko | 1 |
| `features.enableCheckpoints` | settings | ko | 1 |
| `features.enableCheckpointsDescription` | settings | ko | 1 |
| `features.enableMcpMarketplace` | settings | ko | 1 |
| `features.enableMcpMarketplaceDescription` | settings | ko | 1 |
| `features.enableRichMcpDisplay` | settings | ko | 1 |
| `features.enableRichMcpDisplayDescription` | settings | ko | 1 |
| `features.openaiReasoningEffort` | settings | ko | 1 |
| `features.openaiReasoningEffortDescription` | settings | ko | 1 |
| `features.reasoningEffort.high` | settings | ko | 1 |
| `features.reasoningEffort.low` | settings | ko | 1 |
| `features.reasoningEffort.medium` | settings | ko | 1 |
| `labels.automatic` | settings | ko | 1 |
| `labels.custom` | settings | ko | 1 |
| `labels.default` | settings | ko | 1 |
| `labels.disabled` | settings | ko | 1 |
| `labels.documentation` | settings | ko | 1 |
| `labels.enabled` | settings | ko | 1 |
| `labels.feedback` | settings | ko | 1 |
| `labels.license` | settings | ko | 1 |
| `labels.manual` | settings | ko | 1 |
| `labels.repository` | settings | ko | 1 |
| `labels.support` | settings | ko | 1 |
| `labels.version` | settings | ko | 1 |
| `messages.confirmReset` | settings | ko | 1 |
| `messages.confirmResetGlobal` | settings | ko | 1 |
| `messages.errorLoading` | settings | ko | 1 |
| `messages.errorSaving` | settings | ko | 1 |
| `messages.loading` | settings | ko | 1 |
| `messages.noChanges` | settings | ko | 1 |
| `messages.settingsReset` | settings | ko | 1 |
| `messages.settingsSaved` | settings | ko | 1 |
| `messages.unsavedChanges` | settings | ko | 1 |
| `messages.unsavedChangesTitle` | settings | ko | 1 |
| `modelPicker.extensionFetches` | settings | ko | 1 |
| `modelPicker.freeOptions` | settings | ko | 1 |
| `modelPicker.seeMore` | settings | ko | 1 |
| `modelPicker.unsureWhichModel` | settings | ko | 1 |
| `sections.about.description` | settings | ko | 1 |
| `sections.about.title` | settings | ko | 1 |
| `sections.apiConfiguration.description` | settings | ko | 1 |
| `sections.apiConfiguration.title` | settings | ko | 1 |
| `sections.browser.description` | settings | ko | 1 |
| `sections.browser.title` | settings | ko | 1 |
| `sections.debug.description` | settings | ko | 1 |
| `sections.debug.title` | settings | ko | 1 |
| `sections.discardChanges` | settings | ko | 1 |
| `sections.features.description` | settings | ko | 1 |
| `sections.features.title` | settings | ko | 1 |
| `sections.general.description` | settings | ko | 1 |
| `sections.general.title` | settings | ko | 1 |
| `sections.launchingBrowser` | settings | ko | 1 |
| `sections.terminal.description` | settings | ko | 1 |
| `sections.terminal.title` | settings | ko | 1 |
| `settings.modeSystem.description` | settings | ko | 1 |
| `settings.modeSystem.label` | settings | ko | 1 |
| `settings.modeSystem.options.caret` | settings | ko | 1 |
| `settings.modeSystem.options.cline` | settings | ko | 1 |
| `settingsView.title` | settings | ko | 1 |
| `tabs.about.header` | settings | ko | 1 |
| `tabs.about.name` | settings | ko | 1 |
| `tabs.about.tooltip` | settings | ko | 1 |
| `tabs.apiConfiguration.header` | settings | ko | 1 |
| `tabs.apiConfiguration.name` | settings | ko | 1 |
| `tabs.apiConfiguration.tooltip` | settings | ko | 1 |
| `tabs.browser.header` | settings | ko | 1 |
| `tabs.browser.name` | settings | ko | 1 |
| `tabs.browser.tooltip` | settings | ko | 1 |
| `tabs.debug.header` | settings | ko | 1 |
| `tabs.debug.name` | settings | ko | 1 |
| `tabs.debug.tooltip` | settings | ko | 1 |
| `tabs.features.header` | settings | ko | 1 |
| `tabs.features.name` | settings | ko | 1 |
| `tabs.features.tooltip` | settings | ko | 1 |
| `tabs.general.header` | settings | ko | 1 |
| `tabs.general.name` | settings | ko | 1 |
| `tabs.general.tooltip` | settings | ko | 1 |
| `tabs.terminal.header` | settings | ko | 1 |
| `tabs.terminal.name` | settings | ko | 1 |
| `tabs.terminal.tooltip` | settings | ko | 1 |
| `tabs.title` | settings | ko | 1 |
| `telemetry.and` | settings | ko | 1 |
| `telemetry.description` | settings | ko | 1 |
| `telemetry.forMoreDetails` | settings | ko | 1 |
| `telemetry.label` | settings | ko | 1 |
| `telemetry.privacyPolicy` | settings | ko | 1 |
| `telemetry.telemetryOverview` | settings | ko | 1 |
| `telemetry.title` | settings | ko | 1 |
| `terminal.aggressiveReuse` | settings | ko | 1 |
| `terminal.aggressiveReuseDescription` | settings | ko | 1 |
| `terminal.defaultProfile` | settings | ko | 1 |
| `terminal.defaultProfileDescription` | settings | ko | 1 |
| `terminal.outputLimit` | settings | ko | 1 |
| `terminal.outputLimitDescription` | settings | ko | 1 |
| `terminal.positiveNumberError` | settings | ko | 1 |
| `terminal.shellTimeout` | settings | ko | 1 |
| `terminal.shellTimeoutDescription` | settings | ko | 1 |
| `terminal.timeoutPlaceholder` | settings | ko | 1 |
| `tooltips.closeSettings` | settings | ko | 1 |
| `tooltips.resetSettings` | settings | ko | 1 |
| `tooltips.saveSettings` | settings | ko | 1 |
| `tooltips.unsavedChanges` | settings | ko | 1 |
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
| `apiSetup.backButton` | welcome | ko | 1 |
| `apiSetup.help.button` | welcome | ko | 1 |
| `apiSetup.help.title` | welcome | ko | 1 |
| `apiSetup.instructions` | welcome | ko | 1 |
| `apiSetup.saveButton` | welcome | ko | 1 |
| `apiSetup.supportLinks.geminiCredit` | welcome | ko | 1 |
| `apiSetup.supportLinks.llmList` | welcome | ko | 1 |
| `apiSetup.title` | welcome | ko | 1 |
| `bannerAlt` | welcome | ko | 1 |
| `catchPhrase` | welcome | ko | 1 |
| `community.githubLink` | welcome | ko | 1 |
| `coreFeatures.description` | welcome | ko | 1 |
| `coreFeatures.header` | welcome | ko | 1 |
| `footer.company.address` | welcome | ko | 1 |
| `footer.company.businessNumber` | welcome | ko | 1 |
| `footer.company.name` | welcome | ko | 1 |
| `footer.copyright.builtWith` | welcome | ko | 1 |
| `footer.copyright.version` | welcome | ko | 1 |
| `footer.links.caretiveCompany` | welcome | ko | 1 |
| `footer.links.caretService` | welcome | ko | 1 |
| `footer.links.github` | welcome | ko | 1 |
| `footer.links.privacy` | welcome | ko | 1 |
| `footer.links.support` | welcome | ko | 1 |
| `footer.links.terms` | welcome | ko | 1 |
| `footer.links.youthProtection` | welcome | ko | 1 |
| `getStarted.body` | welcome | ko | 1 |
| `getStarted.button` | welcome | ko | 1 |
| `getStarted.preferredLanguage` | welcome | ko | 1 |
| `getStarted.uiLanguage` | welcome | ko | 1 |
| `greeting` | welcome | ko | 1 |
| `personaSelector.selectButton` | welcome | ko | 1 |


## 🌍 누락된 번역 (458개)

일부 언어에서 번역이 누락된 키들:

| Key | Namespace | Missing Locales | Used | Available |
|-----|-----------|----------------|------|-----------|
| `chat.startNewTask` 🔥 | chat | ja, zh | 1 | ko, en |
| `autoApprove.actionsHeader` 🔥 | settings | en, ja, zh | 1 | ko |
| `autoApprove.maxRequestsLabel` 🔥 | settings | en, ja, zh | 1 | ko |
| `autoApprove.maxRequestsTooltip` 🔥 | settings | en, ja, zh | 1 | ko |
| `autoApprove.quickSettingsHeader` 🔥 | settings | en, ja, zh | 1 | ko |
| `autoApprove.title` 🔥 | settings | en, ja, zh | 1 | ko |
| `settings.preferredLanguage.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `settings.preferredLanguage.label` 🔥 | settings | ja, zh | 1 | ko, en |
| `bullets.current.1` ⚪ | announcement | en, ja, zh | 0 | ko |
| `bullets.current.2` ⚪ | announcement | en, ja, zh | 0 | ko |
| `header` ⚪ | announcement | en, ja, zh | 0 | ko |
| `links.and` ⚪ | announcement | en, ja, zh | 0 | ko |
| `links.facebook` ⚪ | announcement | en, ja, zh | 0 | ko |
| `links.github` ⚪ | announcement | en, ja, zh | 0 | ko |
| `links.intro` ⚪ | announcement | en, ja, zh | 0 | ko |
| `links.outro` ⚪ | announcement | en, ja, zh | 0 | ko |
| `previousHeader` ⚪ | announcement | en, ja, zh | 0 | ko |
| `chat.addContext` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.addFilesImages` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.bugReport.additionalContext` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.bugReport.clineVersion` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.bugReport.operatingSystem` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.bugReport.providerModel` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.bugReport.relevantApiRequestOutput` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.bugReport.stepsToReproduce` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.bugReport.systemInfo` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.bugReport.title` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.bugReport.whatHappened` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.contextMenu.add` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.contextMenu.file` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.contextMenu.folder` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.contextMenu.gitCommits` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.contextMenu.noResultsFound` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.contextMenu.pasteUrlToFetchContents` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.contextMenu.problems` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.contextMenu.searching` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.contextMenu.terminal` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.creditLimitError.buyCredits` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.creditLimitError.outOfCredits` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.creditLimitError.retryRequest` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.error.displayContent` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.error.label` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.error.maxRequestsReached` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.error.mistakeLimitReached` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.error.unknown` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.error.unknownError` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorBlockTitle.apiRequest` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorBlockTitle.apiRequestCancelled` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorBlockTitle.apiRequestFailed` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorBlockTitle.apiRequestLoading` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorBlockTitle.apiRetryAttempt` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorBlockTitle.apiStreamingFailed` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorBlockTitle.creditLimitReached` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorBlockTitle.ellipsis` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorBlockTitle.inSeconds` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorRow.clickRetryBelow` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorRow.clineTriedToAccess` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorRow.diffError` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorRow.file` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorRow.isBlockedBy` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorRow.period` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorRow.powershellIssue` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorRow.requestId` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorRow.signInToCline` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.errorRow.troubleshootingGuide` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.image.dimensionError` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.image.unsupportedFileError` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.mcp.resource` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.mcp.tool` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.mcp.useServer` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.mode.act.label` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.mode.plan.label` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.mode.tooltip.act.action` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.mode.tooltip.description` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.mode.tooltip.plan.action` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.openDiskTaskHistoryButton.openDiskTaskHistory` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.selectModelApiProvider` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.serversToggleModal.manageMcpServers` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.serversToggleModal.mcpServers` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.slashCommandMenu.defaultCommands` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.slashCommandMenu.noMatchingCommandsFound` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.slashCommandMenu.workflowCommands` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskCompleted` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskFeedbackButtons.thisWasHelpful` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskFeedbackButtons.thisWasNotHelpful` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.allStepsCompleted` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.cache` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.closeTask` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.completionTokens` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.disablingCheckpoints` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.editFocusChainList` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.newStepsGenerated` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.promptTokens` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.seeHereForInstructions` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.seeLess` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.seeMore` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.task` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.tokens` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.tokensReadFromCache` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskHeader.tokensWrittenToCache` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.assistantMessage` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.assistantResponse` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.browserAction` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.browserActionApproval` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.browserResult` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.checkpointCreated` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.fileEdit` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.fileEditApproval` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.fileRead` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.fileReadApproval` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.newFile` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.newFileApproval` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.planningResponse` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.taskCompleted` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.taskMessage` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.terminalCommand` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.terminalCommandApproval` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.terminalOutput` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.tool` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.toolApproval` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.toolUse` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.unknown` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.unknownFile` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.unknownMessageType` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.unknownUrl` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.userMessage` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.taskTimelineTooltip.webFetch` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.commandApprovalRequired` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.commandOutput` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.condenseConversation` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.createFile` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.createGithubIssue` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.editFile` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.externalUrl` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.listCodeDefinitionNames` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.listFilesRecursive` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.listFilesTopLevel` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.mcpLoadingDocumentation` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.mcpNotification` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.outsideWorkspace` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.readFile` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.searchFiles` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.seeNewChanges` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.shellIntegration.description` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.shellIntegration.troubleshooting` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.shellIntegration.unavailable` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.summarizeTask` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.summary` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.thinking.label` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.tool.webFetch` ⚪ | chat | ja, zh | 0 | ko, en |
| `chat.userMessage.restoreAll` ⚪ | chat | en, ja, zh | 0 | ko |
| `chat.userMessage.restoreAllTooltip` ⚪ | chat | en, ja, zh | 0 | ko |
| `chat.userMessage.restoreChat` ⚪ | chat | en, ja, zh | 0 | ko |
| `chat.userMessage.restoreChatTooltip` ⚪ | chat | en, ja, zh | 0 | ko |
| `account.organization` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.loading` ⚪ | common | ko | 0 | en, ja, zh |
| `apiOptions.millionTokens` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.systemMessages.fetchedContentFromUrl` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.systemMessages.taskCompleted` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.systemMessages.viewedCodeDefinitions` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.systemMessages.viewedFilesRecursively` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.systemMessages.viewedTopLevelFiles` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.systemMessages.wantsToFetchContentFromUrl` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.systemMessages.wantsToSearchDirectory` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.systemMessages.wantsToViewCodeDefinitions` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.systemMessages.wantsToViewFilesRecursively` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.systemMessages.wantsToViewTopLevelFiles` ⚪ | common | ja, zh | 0 | ko, en |
| `apiOptions.tokens` ⚪ | common | ja, zh | 0 | ko, en |
| `chat.cancel` ⚪ | common | ko | 0 | en, ja, zh |
| `chat.executeCommand` ⚪ | common | zh | 0 | ko, en, ja |
| `common.scrollToBottom` ⚪ | common | en, ja, zh | 0 | ko |
| `history.title` ⚪ | common | ko | 0 | en, ja, zh |
| `mcp.description` ⚪ | common | ko | 0 | en, ja, zh |
| `mcp.title` ⚪ | common | ko | 0 | en, ja, zh |
| `mode.act.description` ⚪ | common | ko | 0 | en, ja, zh |
| `mode.act.label` ⚪ | common | ko | 0 | en, ja, zh |
| `mode.act.title` ⚪ | common | ko | 0 | en, ja, zh |
| `mode.agent.description` ⚪ | common | ko | 0 | en, ja, zh |
| `mode.agent.label` ⚪ | common | ko | 0 | en, ja, zh |
| `mode.agent.title` ⚪ | common | ko | 0 | en, ja, zh |
| `mode.plan.description` ⚪ | common | ko | 0 | en, ja, zh |
| `mode.plan.label` ⚪ | common | ko | 0 | en, ja, zh |
| `mode.plan.title` ⚪ | common | ko | 0 | en, ja, zh |
| `rules.description.personaManagement` ⚪ | common | ko | 0 | en, ja, zh |
| `rules.docsLink` ⚪ | common | ko, ja, zh | 0 | en |
| `rulesModal.ariaLabel.CaretRulesButton` ⚪ | common | ko, ja, zh | 0 | en |
| `rulesModal.tooltip.manageRulesWorkflows` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.modeSystem.description` ⚪ | common | ko | 0 | en, ja, zh |
| `settings.modeSystem.label` ⚪ | common | ko | 0 | en, ja, zh |
| `settings.openAIReasoningEffort.description` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.openAIReasoningEffort.high` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.openAIReasoningEffort.label` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.preferredLanguage.description` ⚪ | common | ko | 0 | en, ja, zh |
| `settings.preferredLanguage.label` ⚪ | common | ko | 0 | en, ja, zh |
| `settings.separateModels.description` ⚪ | common | ko | 0 | en, ja, zh |
| `settings.separateModels.label` ⚪ | common | ko | 0 | en, ja, zh |
| `settings.uiLanguage.description` ⚪ | common | ko | 0 | en, ja, zh |
| `settings.uiLanguage.label` ⚪ | common | ko | 0 | en, ja, zh |
| `settings.uiLanguage.option.en` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.uiLanguage.option.ja` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.uiLanguage.option.ko` ⚪ | common | ko, ja, zh | 0 | en |
| `settings.uiLanguage.option.zh` ⚪ | common | ko, ja, zh | 0 | en |
| `telemetry.description` ⚪ | common | ko | 0 | en, ja, zh |
| `validation.invalidApiKey` ⚪ | common | zh | 0 | ko, en, ja |
| `welcome.description` ⚪ | common | ko, ja, zh | 0 | en |
| `welcome.getStarted` ⚪ | common | ko, ja, zh | 0 | en |
| `welcome.learnMore` ⚪ | common | ko, ja, zh | 0 | en |
| `welcome.subtitle` ⚪ | common | ko, ja, zh | 0 | en |
| `welcome.title` ⚪ | common | ko, ja, zh | 0 | en |
| `gemini.gemini-2-5-flash-preview-05-20.description` ⚪ | models | en, ja, zh | 0 | ko |
| `gemini.gemini-2-5-flash-preview-05-20.name` ⚪ | models | en, ja, zh | 0 | ko |
| `gemini.gemini-2-5-pro-preview-06-05.description` ⚪ | models | en, ja, zh | 0 | ko |
| `gemini.gemini-2-5-pro-preview-06-05.name` ⚪ | models | en, ja, zh | 0 | ko |
| `infoTextCustomInstructions` ⚪ | persona | en, ja, zh | 0 | ko |
| `normalState` ⚪ | persona | en, ja, zh | 0 | ko |
| `selector.description` ⚪ | persona | en, ja, zh | 0 | ko |
| `selector.infoTextCustomInstructions` ⚪ | persona | en, ja, zh | 0 | ko |
| `selector.selectButtonText` ⚪ | persona | en, ja, zh | 0 | ko |
| `selector.selectedButtonText` ⚪ | persona | en, ja, zh | 0 | ko |
| `selector.title` ⚪ | persona | en, ja, zh | 0 | ko |
| `selectorDescription` ⚪ | persona | en, ja, zh | 0 | ko |
| `selectorTitle` ⚪ | persona | en, ja, zh | 0 | ko |
| `thinkingState` ⚪ | persona | en, ja, zh | 0 | ko |
| `upload.error` ⚪ | persona | en, ja, zh | 0 | ko |
| `upload.normal` ⚪ | persona | en, ja, zh | 0 | ko |
| `upload.success` ⚪ | persona | en, ja, zh | 0 | ko |
| `upload.thinking` ⚪ | persona | en, ja, zh | 0 | ko |
| `about.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `about.feedbackPrompt` ⚪ | settings | en, ja, zh | 0 | ko |
| `about.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `about.version` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.addToQuickAccess` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.editFiles.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.editFiles.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.editFiles.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.editFilesExternally.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.editFilesExternally.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.editFilesExternally.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.enableAll.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.enableAll.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.enableAll.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.enableAutoApprove.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.enableAutoApprove.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.enableAutoApprove.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.enableNotifications.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.enableNotifications.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.enableNotifications.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.executeAllCommands.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.executeAllCommands.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.executeAllCommands.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.executeSafeCommands.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.executeSafeCommands.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.executeSafeCommands.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.readFiles.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.readFiles.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.readFiles.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.readFilesExternally.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.readFilesExternally.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.readFilesExternally.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.removeFromQuickAccess` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.tooltip` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.useBrowser.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.useBrowser.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.useBrowser.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.useMcp.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.useMcp.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `autoApprove.useMcp.shortName` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.action.click` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.action.close` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.action.launch` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.action.scrollDown` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.action.scrollUp` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.action.type` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.browseActionLabel` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.checkingConnection` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.chromeExecutablePath` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.connected` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.consoleLogs` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.customChromePath` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.debugModeDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.defaultUrlPlaceholder` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.detectedChromePath` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.disableToolUse` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.nextButton` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.noNewLogs` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.notConnected` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.paginationStep` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.previousButton` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.remoteBrowserDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.remoteBrowserEnabled` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.remoteBrowserHost` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.screenshotAlt` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.sessionStarted` ⚪ | settings | ja, zh | 0 | ko, en |
| `browser.viewportHeight` ⚪ | settings | en, ja, zh | 0 | ko |
| `browser.viewportWidth` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.apply` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.cancel` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.close` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.discardChanges` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.done` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.launchBrowser` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.launchingBrowser` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.refresh` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.reset` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.save` ⚪ | settings | en, ja, zh | 0 | ko |
| `buttons.test` ⚪ | settings | en, ja, zh | 0 | ko |
| `debug.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `debug.errorInSeconds` ⚪ | settings | ja, zh | 0 | ko, en |
| `debug.resetGlobalState` ⚪ | settings | en, ja, zh | 0 | ko |
| `debug.resetGlobalStateDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `debug.resetWorkspaceState` ⚪ | settings | en, ja, zh | 0 | ko |
| `debug.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.collapseMcpResponses` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.collapseMcpResponsesDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.enableCheckpoints` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.enableCheckpointsDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.enableMcpMarketplace` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.enableMcpMarketplaceDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.enableRichMcpDisplay` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.enableRichMcpDisplayDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.openaiReasoningEffort` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.openaiReasoningEffortDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.reasoningEffort.high` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.reasoningEffort.low` ⚪ | settings | en, ja, zh | 0 | ko |
| `features.reasoningEffort.medium` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.automatic` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.custom` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.default` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.disabled` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.documentation` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.enabled` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.feedback` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.license` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.manual` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.repository` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.support` ⚪ | settings | en, ja, zh | 0 | ko |
| `labels.version` ⚪ | settings | en, ja, zh | 0 | ko |
| `messages.confirmReset` ⚪ | settings | en, ja, zh | 0 | ko |
| `messages.confirmResetGlobal` ⚪ | settings | en, ja, zh | 0 | ko |
| `messages.errorLoading` ⚪ | settings | en, ja, zh | 0 | ko |
| `messages.errorSaving` ⚪ | settings | en, ja, zh | 0 | ko |
| `messages.loading` ⚪ | settings | en, ja, zh | 0 | ko |
| `messages.noChanges` ⚪ | settings | en, ja, zh | 0 | ko |
| `messages.settingsReset` ⚪ | settings | en, ja, zh | 0 | ko |
| `messages.settingsSaved` ⚪ | settings | en, ja, zh | 0 | ko |
| `messages.unsavedChanges` ⚪ | settings | en, ja, zh | 0 | ko |
| `messages.unsavedChangesTitle` ⚪ | settings | en, ja, zh | 0 | ko |
| `modelPicker.extensionFetches` ⚪ | settings | en, ja, zh | 0 | ko |
| `modelPicker.freeOptions` ⚪ | settings | en, ja, zh | 0 | ko |
| `modelPicker.seeMore` ⚪ | settings | en, ja, zh | 0 | ko |
| `modelPicker.unsureWhichModel` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.about.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.about.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.apiConfiguration.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.apiConfiguration.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.browser.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.browser.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.debug.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.debug.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.discardChanges` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.features.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.features.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.general.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.general.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.launchingBrowser` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.terminal.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `sections.terminal.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `settings.modeSystem.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `settings.modeSystem.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `settings.modeSystem.options.caret` ⚪ | settings | en, ja, zh | 0 | ko |
| `settings.modeSystem.options.cline` ⚪ | settings | en, ja, zh | 0 | ko |
| `settingsView.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.about.header` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.about.name` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.about.tooltip` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.apiConfiguration.header` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.apiConfiguration.name` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.apiConfiguration.tooltip` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.browser.header` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.browser.name` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.browser.tooltip` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.debug.header` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.debug.name` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.debug.tooltip` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.features.header` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.features.name` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.features.tooltip` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.general.header` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.general.name` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.general.tooltip` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.terminal.header` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.terminal.name` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.terminal.tooltip` ⚪ | settings | en, ja, zh | 0 | ko |
| `tabs.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `telemetry.and` ⚪ | settings | en, ja, zh | 0 | ko |
| `telemetry.description` ⚪ | settings | en, ja, zh | 0 | ko |
| `telemetry.forMoreDetails` ⚪ | settings | en, ja, zh | 0 | ko |
| `telemetry.label` ⚪ | settings | en, ja, zh | 0 | ko |
| `telemetry.privacyPolicy` ⚪ | settings | en, ja, zh | 0 | ko |
| `telemetry.telemetryOverview` ⚪ | settings | en, ja, zh | 0 | ko |
| `telemetry.title` ⚪ | settings | en, ja, zh | 0 | ko |
| `terminal.aggressiveReuse` ⚪ | settings | en, ja, zh | 0 | ko |
| `terminal.aggressiveReuseDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `terminal.defaultProfile` ⚪ | settings | en, ja, zh | 0 | ko |
| `terminal.defaultProfileDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `terminal.outputLimit` ⚪ | settings | en, ja, zh | 0 | ko |
| `terminal.outputLimitDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `terminal.positiveNumberError` ⚪ | settings | en, ja, zh | 0 | ko |
| `terminal.shellTimeout` ⚪ | settings | en, ja, zh | 0 | ko |
| `terminal.shellTimeoutDescription` ⚪ | settings | en, ja, zh | 0 | ko |
| `terminal.timeoutPlaceholder` ⚪ | settings | en, ja, zh | 0 | ko |
| `tooltips.closeSettings` ⚪ | settings | en, ja, zh | 0 | ko |
| `tooltips.resetSettings` ⚪ | settings | en, ja, zh | 0 | ko |
| `tooltips.saveSettings` ⚪ | settings | en, ja, zh | 0 | ko |
| `tooltips.unsavedChanges` ⚪ | settings | en, ja, zh | 0 | ko |
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
| `apiSetup.backButton` ⚪ | welcome | en, ja, zh | 0 | ko |
| `apiSetup.help.button` ⚪ | welcome | en, ja, zh | 0 | ko |
| `apiSetup.help.title` ⚪ | welcome | en, ja, zh | 0 | ko |
| `apiSetup.instructions` ⚪ | welcome | en, ja, zh | 0 | ko |
| `apiSetup.saveButton` ⚪ | welcome | en, ja, zh | 0 | ko |
| `apiSetup.supportLinks.geminiCredit` ⚪ | welcome | en, ja, zh | 0 | ko |
| `apiSetup.supportLinks.llmList` ⚪ | welcome | en, ja, zh | 0 | ko |
| `apiSetup.title` ⚪ | welcome | en, ja, zh | 0 | ko |
| `bannerAlt` ⚪ | welcome | en, ja, zh | 0 | ko |
| `catchPhrase` ⚪ | welcome | en, ja, zh | 0 | ko |
| `community.githubLink` ⚪ | welcome | en, ja, zh | 0 | ko |
| `coreFeatures.description` ⚪ | welcome | en, ja, zh | 0 | ko |
| `coreFeatures.header` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.company.address` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.company.businessNumber` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.company.name` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.copyright.builtWith` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.copyright.version` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.links.caretiveCompany` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.links.caretService` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.links.github` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.links.privacy` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.links.support` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.links.terms` ⚪ | welcome | en, ja, zh | 0 | ko |
| `footer.links.youthProtection` ⚪ | welcome | en, ja, zh | 0 | ko |
| `getStarted.body` ⚪ | welcome | en, ja, zh | 0 | ko |
| `getStarted.button` ⚪ | welcome | en, ja, zh | 0 | ko |
| `getStarted.preferredLanguage` ⚪ | welcome | en, ja, zh | 0 | ko |
| `getStarted.uiLanguage` ⚪ | welcome | en, ja, zh | 0 | ko |
| `greeting` ⚪ | welcome | en, ja, zh | 0 | ko |
| `personaSelector.selectButton` ⚪ | welcome | en, ja, zh | 0 | ko |

🔥 = 고우선순위 (키가 사용중)
⚪ = 저우선순위 (키가 현재 미사용)


## ❓ 정의되지 않은 키 (381개)

코드에서 t() 함수로 사용하지만 JSON 파일에 정의되지 않은 키들:

| 키 | 컴포넌트 | 네임스페이스 추정 | 우선순위 |
|-----|-----------|------------------|----------|
| ` ` | MermaidBlock.tsx | common | ⚪ |
| `,` | BrowserSessionRow.tsx, ChatTextArea.tsx | common | 🔥 |
| `.` | StyledCreditDisplay.tsx, Announcement.tsx, ChatRow.tsx, CodeBlock.tsx, MarkdownBlock.tsx, HistoryView.tsx |  | 🔥 |
| `../../../../src/services/error/ClineError` | ErrorRow.test.tsx |  | ⚪ |
| `.quote-button-class` | ChatRow.tsx |  | ⚪ |
| `/` | ChatTextArea.tsx, McpMarketplaceCard.tsx, VSCodeLmProvider.tsx | common | 🔥 |
| `/path/to/file.txt` | ErrorRow.test.tsx | /path/to/file | ⚪ |
| `\n` | ChatTextArea.tsx, TaskHeader.tsx, ChecklistRenderer.tsx | common | 🔥 |
| `── Deployed Models ──` | SapAiCoreModelPicker.spec.tsx | common | ⚪ |
| `── Not Deployed Models ──` | SapAiCoreModelPicker.spec.tsx | common | ⚪ |
| `2d` | MermaidBlock.tsx | common | ⚪ |
| `変換テスト` | UserMessage.ime.test.tsx | common | ⚪ |
| `account.addCredits` | CreditBalance.tsx | account | ⚪ |
| `account.byContining` | AccountWelcomeView.tsx | account | ⚪ |
| `account.credits` | CreditsHistoryTable.tsx | account | ⚪ |
| `account.creditsUsed` | CreditsHistoryTable.tsx | account | ⚪ |
| `account.currentBalance` | CreditBalance.tsx | account | ⚪ |
| `account.dashboard` | AccountView.tsx | account | ⚪ |
| `account.date` | CreditsHistoryTable.tsx | account | ⚪ |
| `account.failedToFetchCreditBalance` | AccountView.tsx | account | ⚪ |
| `account.failedToFetchUserCredit` | AccountView.tsx | account | ⚪ |
| `account.failedToGetLoginUrl` | AccountOptions.tsx | account | ⚪ |
| `account.lastUpdated` | CreditBalance.tsx | account | ⚪ |
| `account.loading` | CreditsHistoryTable.tsx | account | ⚪ |
| `account.logOut` | AccountView.tsx | account | ⚪ |
| `account.model` | CreditsHistoryTable.tsx | account | ⚪ |
| `account.noPaymentHistory` | CreditsHistoryTable.tsx | account | ⚪ |
| `account.noUsageHistory` | CreditsHistoryTable.tsx | account | ⚪ |
| `account.paymentsHistory` | CreditsHistoryTable.tsx | account | ⚪ |
| `account.personal` | AccountView.tsx | account | ⚪ |
| `account.privacyPolicy` | AccountWelcomeView.tsx | account | ⚪ |
| `account.privacyPolicyUrl` | AccountWelcomeView.tsx | account | ⚪ |
| `account.profileAlt` | AccountView.tsx | account | ⚪ |
| `account.role` | AccountView.tsx | account | ⚪ |
| `account.signUpDescription` | AccountWelcomeView.tsx | account | ⚪ |
| `account.signUpWithCaret` | AccountWelcomeView.tsx | account | ⚪ |
| `account.termsOfService` | AccountWelcomeView.tsx | account | ⚪ |
| `account.termsOfServiceUrl` | AccountWelcomeView.tsx | account | ⚪ |
| `account.title` | AccountView.tsx | account | ⚪ |
| `account.totalCost` | CreditsHistoryTable.tsx | account | ⚪ |
| `account.usageHistory` | CreditsHistoryTable.tsx | account | ⚪ |
| `addContext` | ChatTextArea.tsx | common | ⚪ |
| `addFilesImages` | ChatTextArea.tsx | common | ⚪ |
| `addToInputSubscriptionCompleted` | ChatView.tsx | common | ⚪ |
| `announcement.features.autoCompact.description` | Announcement.tsx | announcement | ⚪ |
| `announcement.features.autoCompact.title` | Announcement.tsx | announcement | ⚪ |
| `announcement.features.deepPlanning.description` | Announcement.tsx | announcement | ⚪ |
| `announcement.features.deepPlanning.title` | Announcement.tsx | announcement | ⚪ |
| `announcement.features.focusChain.description` | Announcement.tsx | announcement | ⚪ |
| `announcement.features.focusChain.title` | Announcement.tsx | announcement | ⚪ |
| `announcement.features.freeStealth.description` | Announcement.tsx | announcement | ⚪ |
| `announcement.features.freeStealth.title` | Announcement.tsx | announcement | ⚪ |
| `announcement.forMoreUpdates` | Announcement.tsx | announcement | ⚪ |
| `announcement.joinUs` | Announcement.tsx | announcement | ⚪ |
| `announcement.previousFeatures.claude1M.description` | Announcement.tsx | announcement | ⚪ |
| `announcement.previousFeatures.claude1M.title` | Announcement.tsx | announcement | ⚪ |
| `announcement.previousFeatures.optimizedClaude4.description` | Announcement.tsx | announcement | ⚪ |
| `announcement.previousFeatures.optimizedClaude4.title` | Announcement.tsx | announcement | ⚪ |
| `announcement.previousFeatures.workflows.description` | Announcement.tsx | announcement | ⚪ |
| `announcement.previousFeatures.workflows.title` | Announcement.tsx | announcement | ⚪ |
| `announcement.previousUpdates` | Announcement.tsx | announcement | ⚪ |
| `anthropic--claude-3-haiku` | SapAiCoreModelPicker.spec.tsx | common | ⚪ |
| `anthropic--claude-3.5-sonnet` | SapAiCoreModelPicker.spec.tsx | anthropic--claude-3 | ⚪ |
| `Authentication failed` | ErrorRow.test.tsx | common | ⚪ |
| `autoApprove.actionsHeader` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.addQuickAccess` | AutoApproveMenuItem.tsx | autoApprove | ⚪ |
| `autoApprove.autoApproveLabel` | AutoApproveBar.tsx | autoApprove | ⚪ |
| `autoApprove.description` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.maxRequestsLabel` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.maxRequestsTooltip` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.quickSettingsHeader` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.removeQuickAccess` | AutoApproveMenuItem.tsx | autoApprove | ⚪ |
| `autoApprove.title` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `bugReport.additionalContext` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.clineVersion` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.operatingSystem` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.providerModel` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.relevantApiRequestOutput` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.stepsToReproduce` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.systemInfo` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.title` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.whatHappened` | ReportBugPreview.tsx | bugReport | ⚪ |
| `button.done` | AccountView.tsx | button | ⚪ |
| `canvas` | MermaidBlock.tsx | common | ⚪ |
| `Canvas context not available` | MermaidBlock.tsx | common | ⚪ |
| `caretHasQuestion` | ChatRow.tsx | common | ⚪ |
| `chat.addContext` | ChatTextArea.tsx | chat | ⚪ |
| `chat.addFilesImages` | ChatTextArea.tsx | chat | ⚪ |
| `chat.addToInputSubscriptionCompleted` | ChatView.tsx | chat | ⚪ |
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
| `chat.error.unknownError` | ChatErrorBoundary.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiRequest` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiRequestCancelled` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiRequestFailed` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiRequestLoading` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.apiStreamingFailed` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.creditLimitReached` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorBlockTitle.ellipsis` | ErrorBlockTitle.tsx | chat | ⚪ |
| `chat.errorInAddToInputSubscription` | ChatView.tsx | chat | ⚪ |
| `chat.errorRow.clickRetryBelow` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.clineTriedToAccess` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.diffError` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.file` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.isBlockedBy` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.period` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.powershellIssue` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.signInToCline` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorRow.troubleshootingGuide` | ErrorRow.tsx | chat | ⚪ |
| `chat.errorSelectingFilesImages` | ChatView.tsx | chat | ⚪ |
| `chat.executeCommand` | ChatRow.tsx | chat | ⚪ |
| `chat.image.dimensionError` | ChatTextArea.tsx | chat | ⚪ |
| `chat.image.unsupportedFileError` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mcp.resource` | ChatRow.tsx | chat | ⚪ |
| `chat.mcp.tool` | ChatRow.tsx | chat | ⚪ |
| `chat.mode.act.action` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mode.act.label` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mode.plan.action` | ChatTextArea.tsx | chat | ⚪ |
| `chat.mode.plan.label` | ChatTextArea.tsx | chat | ⚪ |
| `chat.openDiskTaskHistoryButton.openDiskTaskHistory` | OpenDiskTaskHistoryButton.tsx | chat | ⚪ |
| `chat.placeholderHint` | ChatTextArea.tsx | chat | ⚪ |
| `chat.selectModelApiProvider` | ChatTextArea.tsx | chat | ⚪ |
| `chat.serversToggleModal.manageMcpServers` | ServersToggleModal.tsx | chat | ⚪ |
| `chat.serversToggleModal.mcpServers` | ServersToggleModal.tsx | chat | ⚪ |
| `chat.slashCommandMenu.noMatchingCommandsFound` | SlashCommandMenu.tsx | chat | ⚪ |
| `chat.startNewTask` | ActionButtons.tsx | chat | ⚪ |
| `chat.taskCompleted` | ChatRow.tsx | chat | ⚪ |
| `chat.taskFeedbackButtons.thisWasHelpful` | TaskFeedbackButtons.tsx | chat | ⚪ |
| `chat.taskFeedbackButtons.thisWasNotHelpful` | TaskFeedbackButtons.tsx | chat | ⚪ |
| `chat.taskHeader.cache` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.closeTask` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.completionTokens` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.disablingCheckpoints` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.editFocusChainList` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.newStepsGenerated` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.promptTokens` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.seeHereForInstructions` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.seeLess` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.seeMore` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.task` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.tokens` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.tokensReadFromCache` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskHeader.tokensWrittenToCache` | TaskHeader.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.assistantMessage` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.assistantResponse` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.browserAction` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.browserActionApproval` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.browserResult` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.checkpointCreated` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.planningResponse` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.taskCompleted` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.taskMessage` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.terminalCommand` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.terminalCommandApproval` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.terminalOutput` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.toolUse` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.unknown` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.unknownFile` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.unknownMessageType` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.unknownUrl` | TaskTimelineTooltip.tsx | chat | ⚪ |
| `chat.taskTimelineTooltip.userMessage` | TaskTimelineTooltip.tsx | chat | ⚪ |
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
| `chat.typeTaskHere` | ChatView.tsx | chat | ⚪ |
| `chat.userMessage.restoreAll` | UserMessage.tsx | chat | ⚪ |
| `chat.userMessage.restoreAllTooltip` | UserMessage.tsx | chat | ⚪ |
| `chat.userMessage.restoreChat` | UserMessage.tsx | chat | ⚪ |
| `chat.userMessage.restoreChatTooltip` | UserMessage.tsx | chat | ⚪ |
| `Choose SAP AI Core model...` | SapAiCoreModelPicker.spec.tsx | Choose SAP AI Core model | ⚪ |
| `Clear search` | OllamaModelPicker.spec.tsx | common | ⚪ |
| `clientIdNotFound` | ChatView.tsx | common | ⚪ |
| `commandApprovalRequired` | ChatRow.tsx | common | ⚪ |
| `commandOutput` | ChatRow.tsx | common | ⚪ |
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
| `common.account.title` | AccountView.tsx | common | ⚪ |
| `common.account.totalCost` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.account.usageHistory` | CreditsHistoryTable.tsx | common | ⚪ |
| `common.button.done` | AccountView.tsx | common | ⚪ |
| `common.common.common.and` | AccountWelcomeView.tsx | common | ⚪ |
| `common.scrollToBottom` | ActionButtons.tsx | common | ⚪ |
| `Context Window Size` | APIOptions.spec.tsx | common | ⚪ |
| `contextMenu.add` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.file` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.folder` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.gitCommits` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.noResultsFound` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.pasteUrlToFetchContents` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.problems` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.searching` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.terminal` | ContextMenu.tsx | contextMenu | ⚪ |
| `creditLimitError.buyCredits` | CreditLimitError.tsx | creditLimitError | ⚪ |
| `creditLimitError.outOfCredits` | CreditLimitError.tsx | creditLimitError | ⚪ |
| `creditLimitError.retryRequest` | CreditLimitError.tsx | creditLimitError | ⚪ |
| `credits.tab` | helpers.ts | credits | ⚪ |
| `div` | ChatView.tsx | common | ⚪ |
| `Enter API Key...` | APIOptions.spec.tsx | Enter API Key | ⚪ |
| `Enter Model ID...` | APIOptions.spec.tsx | Enter Model ID | ⚪ |
| `error.displayContent` | ChatErrorBoundary.tsx | error | ⚪ |
| `error.label` | ChatRow.tsx | error | ⚪ |
| `error.maxRequestsReached` | ChatRow.tsx | error | ⚪ |
| `error.mistakeLimitReached` | ChatRow.tsx | error | ⚪ |
| `error.unknownError` | ChatErrorBoundary.tsx | error | ⚪ |
| `errorBlockTitle.apiRequest` | ErrorBlockTitle.tsx | errorBlockTitle | ⚪ |
| `errorBlockTitle.apiRequestCancelled` | ErrorBlockTitle.tsx | errorBlockTitle | ⚪ |
| `errorBlockTitle.apiRequestFailed` | ErrorBlockTitle.tsx | errorBlockTitle | ⚪ |
| `errorBlockTitle.apiRequestLoading` | ErrorBlockTitle.tsx | errorBlockTitle | ⚪ |
| `errorBlockTitle.apiStreamingFailed` | ErrorBlockTitle.tsx | errorBlockTitle | ⚪ |
| `errorBlockTitle.creditLimitReached` | ErrorBlockTitle.tsx | errorBlockTitle | ⚪ |
| `errorBlockTitle.ellipsis` | ErrorBlockTitle.tsx | errorBlockTitle | ⚪ |
| `errorInAddToInputSubscription` | ChatView.tsx | common | ⚪ |
| `errorRow.clickRetryBelow` | ErrorRow.tsx | errorRow | ⚪ |
| `errorRow.clineTriedToAccess` | ErrorRow.tsx | errorRow | ⚪ |
| `errorRow.diffError` | ErrorRow.tsx | errorRow | ⚪ |
| `errorRow.file` | ErrorRow.tsx | errorRow | ⚪ |
| `errorRow.isBlockedBy` | ErrorRow.tsx | errorRow | ⚪ |
| `errorRow.period` | ErrorRow.tsx | errorRow | ⚪ |
| `errorRow.powershellIssue` | ErrorRow.tsx | errorRow | ⚪ |
| `errorRow.signInToCline` | ErrorRow.tsx | errorRow | ⚪ |
| `errorRow.troubleshootingGuide` | ErrorRow.tsx | errorRow | ⚪ |
| `errorSelectingFilesImages` | ChatView.tsx | common | ⚪ |
| `executeCommand` | ChatRow.tsx | common | ⚪ |
| `gemini-2.5-pro` | SapAiCoreModelPicker.spec.tsx | gemini-2 | ⚪ |
| `gpt-4o` | SapAiCoreModelPicker.spec.tsx | common | ⚪ |
| `image.dimensionError` | ChatTextArea.tsx | image | ⚪ |
| `image.unsupportedFileError` | ChatTextArea.tsx | image | ⚪ |
| `Max Output Tokens` | APIOptions.spec.tsx | common | ⚪ |
| `Max requests reached` | ErrorRow.test.tsx | common | ⚪ |
| `mcp.resource` | ChatRow.tsx | mcp | ⚪ |
| `mcp.tool` | ChatRow.tsx | mcp | ⚪ |
| `Mistake limit reached` | ErrorRow.test.tsx | common | ⚪ |
| `mode.act.action` | ChatTextArea.tsx | mode | ⚪ |
| `mode.act.label` | ChatTextArea.tsx | mode | ⚪ |
| `mode.plan.action` | ChatTextArea.tsx | mode | ⚪ |
| `mode.plan.label` | ChatTextArea.tsx | mode | ⚪ |
| `Model` | APIOptions.spec.tsx, SapAiCoreModelPicker.spec.tsx | common | 🔥 |
| `Model Configuration` | APIOptions.spec.tsx | common | ⚪ |
| `openDiskTaskHistoryButton.openDiskTaskHistory` | OpenDiskTaskHistoryButton.tsx | openDiskTaskHistoryButton | ⚪ |
| `placeholderHint` | ChatTextArea.tsx | common | ⚪ |
| `Rate limit exceeded` | ErrorRow.test.tsx | common | ⚪ |
| `redirect` | helpers.ts | common | ⚪ |
| `Request ID: req_123456` | ErrorRow.test.tsx | common | ⚪ |
| `scrollToBottom` | ActionButtons.tsx | common | ⚪ |
| `Search and select a model...` | APIOptions.spec.tsx, OllamaModelPicker.spec.tsx | Search and select a model | 🔥 |
| `Select a model...` | SapAiCoreModelPicker.spec.tsx | Select a model | ⚪ |
| `Select an Ollama model...` | OllamaModelPicker.spec.tsx | Select an Ollama model | ⚪ |
| `selectModelApiProvider` | ChatTextArea.tsx | common | ⚪ |
| `serversToggleModal.manageMcpServers` | ServersToggleModal.tsx | serversToggleModal | ⚪ |
| `serversToggleModal.mcpServers` | ServersToggleModal.tsx | serversToggleModal | ⚪ |
| `settings.autoApprove.description` | AutoApproveModal.tsx | settings | ⚪ |
| `settings.preferredLanguage.description` | PreferredLanguageSetting.tsx | settings | ⚪ |
| `settings.preferredLanguage.label` | PreferredLanguageSetting.tsx | settings | ⚪ |
| `Sign in to Cline` | ErrorRow.test.tsx | common | ⚪ |
| `slashCommandMenu.noMatchingCommandsFound` | SlashCommandMenu.tsx | slashCommandMenu | ⚪ |
| `Streaming failed` | ErrorRow.test.tsx | common | ⚪ |
| `Supports Images` | APIOptions.spec.tsx | common | ⚪ |
| `tab` | helpers.ts | common | ⚪ |
| `task.copyTask` | CopyTaskButton.tsx | task | ⚪ |
| `task.deleteTask` | DeleteTaskButton.tsx | task | ⚪ |
| `task.deleteTaskAriaLabel` | DeleteTaskButton.tsx | task | ⚪ |
| `taskCompleted` | ChatRow.tsx | common | ⚪ |
| `taskFeedbackButtons.thisWasHelpful` | TaskFeedbackButtons.tsx | taskFeedbackButtons | ⚪ |
| `taskFeedbackButtons.thisWasNotHelpful` | TaskFeedbackButtons.tsx | taskFeedbackButtons | ⚪ |
| `taskHeader.cache` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.closeTask` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.completionTokens` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.disablingCheckpoints` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.editFocusChainList` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.newStepsGenerated` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.promptTokens` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.seeHereForInstructions` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.seeLess` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.seeMore` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.task` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.tokens` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.tokensReadFromCache` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskHeader.tokensWrittenToCache` | TaskHeader.tsx | taskHeader | ⚪ |
| `taskTimelineTooltip.assistantMessage` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.assistantResponse` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.browserAction` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.browserActionApproval` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.browserResult` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.checkpointCreated` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.planningResponse` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.taskCompleted` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.taskMessage` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.terminalCommand` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.terminalCommandApproval` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.terminalOutput` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.toolUse` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.unknown` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.unknownFile` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.unknownMessageType` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.unknownUrl` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `taskTimelineTooltip.userMessage` | TaskTimelineTooltip.tsx | taskTimelineTooltip | ⚪ |
| `Test error message` | ErrorRow.test.tsx | common | ⚪ |
| `tool.createFile` | ChatRow.tsx | tool | ⚪ |
| `tool.editFile` | ChatRow.tsx | tool | ⚪ |
| `tool.externalUrl` | ChatRow.tsx | tool | ⚪ |
| `tool.listCodeDefinitionNames` | ChatRow.tsx | tool | ⚪ |
| `tool.listFilesRecursive` | ChatRow.tsx | tool | ⚪ |
| `tool.listFilesTopLevel` | ChatRow.tsx | tool | ⚪ |
| `tool.outsideWorkspace` | ChatRow.tsx | tool | ⚪ |
| `tool.readFile` | ChatRow.tsx | tool | ⚪ |
| `tool.searchFiles` | ChatRow.tsx | tool | ⚪ |
| `tool.summarizeTask` | ChatRow.tsx | tool | ⚪ |
| `tool.summary` | ChatRow.tsx | tool | ⚪ |
| `tool.webFetch` | ChatRow.tsx | tool | ⚪ |
| `troubleshooting guide` | ErrorRow.test.tsx | common | ⚪ |
| `true.redirect` | helpers.ts | true | ⚪ |
| `typeMessage` | ChatView.tsx | common | ⚪ |
| `typeTaskHere` | ChatView.tsx | common | ⚪ |
| `unsupported-model` | SapAiCoreModelPicker.spec.tsx | common | ⚪ |
| `userMessage.restoreAll` | UserMessage.tsx | userMessage | ⚪ |
| `userMessage.restoreAllTooltip` | UserMessage.tsx | userMessage | ⚪ |
| `userMessage.restoreChat` | UserMessage.tsx | userMessage | ⚪ |
| `userMessage.restoreChatTooltip` | UserMessage.tsx | userMessage | ⚪ |
| `You have run out of credits.` | ErrorRow.test.tsx | You have run out of credits | ⚪ |

🔥 = 고우선순위 (여러 컴포넌트에서 사용)
⚪ = 저우선순위 (단일 컴포넌트 사용)


## 📂 컴포넌트 사용 분석

i18n 키를 사용하는 컴포넌트들:

Total components using i18n: **44**

| Component | Keys Used | Sample Keys |
|-----------|-----------|-------------|
| `chat\ChatRow.tsx` | 46 | `.quote-button-class`, `error.label`, `error.mistakeLimitReached` (+43 more) |
| `chat\task-header\TaskTimelineTooltip.tsx` | 36 | `taskTimelineTooltip.taskMessage`, `taskTimelineTooltip.userMessage`, `taskTimelineTooltip.assistantResponse` (+33 more) |
| `chat\Announcement.tsx` | 35 | `.`, `announcement.features.freeStealth.title`, `announcement.features.freeStealth.description` (+32 more) |
| `chat\task-header\TaskHeader.tsx` | 29 | `\n`, `taskHeader.task`, `taskHeader.closeTask` (+26 more) |
| `chat\ChatTextArea.tsx` | 23 | `/`, `,`, `\n` (+20 more) |
| `account\CreditsHistoryTable.tsx` | 20 | `account.usageHistory`, `account.paymentsHistory`, `account.loading` (+17 more) |
| `account\AccountView.tsx` | 18 | `account.title`, `button.done`, `account.failedToFetchUserCredit` (+15 more) |
| `chat\ContextMenu.tsx` | 18 | `contextMenu.problems`, `contextMenu.terminal`, `contextMenu.pasteUrlToFetchContents` (+15 more) |
| `chat\ErrorRow.tsx` | 18 | `errorRow.powershellIssue`, `errorRow.troubleshootingGuide`, `errorRow.period` (+15 more) |
| `chat\ReportBugPreview.tsx` | 18 | `bugReport.title`, `bugReport.whatHappened`, `bugReport.stepsToReproduce` (+15 more) |
| `account\AccountWelcomeView.tsx` | 16 | `account.signUpDescription`, `account.signUpWithCaret`, `account.byContining` (+13 more) |
| `chat\ErrorBlockTitle.tsx` | 14 | `errorBlockTitle.ellipsis`, `errorBlockTitle.apiRequestLoading`, `errorBlockTitle.apiRequestCancelled` (+11 more) |
| `chat\ChatView.tsx` | 13 | `div`, `errorSelectingFilesImages`, `clientIdNotFound` (+10 more) |
| `chat\auto-approve-menu\AutoApproveModal.tsx` | 12 | `autoApprove.description`, `autoApprove.title`, `autoApprove.actionsHeader` (+9 more) |
| `chat\ErrorRow.test.tsx` | 12 | `Test error message`, `Mistake limit reached`, `Max requests reached` (+9 more) |
| `settings\__tests__\SapAiCoreModelPicker.spec.tsx` | 10 | `Model`, `Select a model...`, `Choose SAP AI Core model...` (+7 more) |
| `chat\UserMessage.tsx` | 8 | `userMessage.restoreAll`, `userMessage.restoreAllTooltip`, `userMessage.restoreChat` (+5 more) |
| `settings\__tests__\APIOptions.spec.tsx` | 8 | `Enter API Key...`, `Search and select a model...`, `Enter Model ID...` (+5 more) |
| `account\CreditBalance.tsx` | 6 | `account.lastUpdated`, `account.currentBalance`, `account.addCredits` (+3 more) |
| `chat\CreditLimitError.tsx` | 6 | `creditLimitError.outOfCredits`, `creditLimitError.buyCredits`, `creditLimitError.retryRequest` (+3 more) |
| `account\helpers.ts` | 4 | `tab`, `redirect`, `credits.tab` (+1 more) |
| `chat\chat-view\components\layout\ActionButtons.tsx` | 4 | `scrollToBottom`, `chat.startNewTask`, `common.scrollToBottom` (+1 more) |
| `chat\ChatErrorBoundary.tsx` | 4 | `error.displayContent`, `error.unknownError`, `chat.error.displayContent` (+1 more) |
| `chat\ServersToggleModal.tsx` | 4 | `serversToggleModal.manageMcpServers`, `serversToggleModal.mcpServers`, `chat.serversToggleModal.manageMcpServers` (+1 more) |
| `chat\task-header\buttons\DeleteTaskButton.tsx` | 4 | `task.deleteTask`, `task.deleteTaskAriaLabel`, `common.task.deleteTask` (+1 more) |
| `chat\TaskFeedbackButtons.tsx` | 4 | `taskFeedbackButtons.thisWasHelpful`, `taskFeedbackButtons.thisWasNotHelpful`, `chat.taskFeedbackButtons.thisWasHelpful` (+1 more) |
| `common\MermaidBlock.tsx` | 4 | ` `, `canvas`, `2d` (+1 more) |
| `settings\PreferredLanguageSetting.tsx` | 4 | `settings.preferredLanguage.label`, `settings.preferredLanguage.description`, `settings.settings.preferredLanguage.label` (+1 more) |
| `settings\__tests__\OllamaModelPicker.spec.tsx` | 3 | `Search and select a model...`, `Select an Ollama model...`, `Clear search` |
| `chat\auto-approve-menu\AutoApproveBar.tsx` | 2 | `autoApprove.autoApproveLabel`, `common.autoApprove.autoApproveLabel` |
| `chat\auto-approve-menu\AutoApproveMenuItem.tsx` | 2 | `autoApprove.removeQuickAccess`, `autoApprove.addQuickAccess` |
| `chat\SlashCommandMenu.tsx` | 2 | `slashCommandMenu.noMatchingCommandsFound`, `chat.slashCommandMenu.noMatchingCommandsFound` |
| `chat\task-header\buttons\CopyTaskButton.tsx` | 2 | `task.copyTask`, `common.task.copyTask` |
| `chat\task-header\buttons\OpenDiskTaskHistoryButton.tsx` | 2 | `openDiskTaskHistoryButton.openDiskTaskHistory`, `chat.openDiskTaskHistoryButton.openDiskTaskHistory` |
| `account\AccountOptions.tsx` | 1 | `account.failedToGetLoginUrl` |
| `account\StyledCreditDisplay.tsx` | 1 | `.` |
| `chat\BrowserSessionRow.tsx` | 1 | `,` |
| `chat\__tests__\UserMessage.ime.test.tsx` | 1 | `変換テスト` |
| `common\ChecklistRenderer.tsx` | 1 | `\n` |
| `common\CodeBlock.tsx` | 1 | `.` |
| `common\MarkdownBlock.tsx` | 1 | `.` |
| `history\HistoryView.tsx` | 1 | `.` |
| `mcp\configuration\tabs\marketplace\McpMarketplaceCard.tsx` | 1 | `/` |
| `settings\providers\VSCodeLmProvider.tsx` | 1 | `/` |


## 🛠️ 정리 권장사항

### 🗑️ 미사용 키 제거
- **작업**: locale 파일에서 629개의 미사용 키 제거
- **효과**: 번들 크기 감소 및 유지보수 부담 경감
- **우선순위**: 낮음 (향후 기능을 위한 플레이스홀더가 아닌 경우)

### 🌍 누락 번역 완성
- **작업**: 458개의 누락된 번역 추가
- **고우선순위**: 8개 (현재 사용중인 키들)
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
**현재 상태**: 458개 키에서 번역 누락

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
- 미사용 키 629개에 대한 검토
- 향후 사용 예정인지, 레거시 키인지 판단
- 확실한 불필요 키들은 locale 파일에서 제거
- 번들 크기 최적화 및 유지보수성 향상
**현재 상태**: 629개 미사용 키 탐지 (사용률 6.0%)

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
