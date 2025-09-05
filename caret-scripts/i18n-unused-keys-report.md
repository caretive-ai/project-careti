# i18n 미사용 키 분석 보고서

**생성일시**: 2025-09-05 06:44:25
**분석기**: report-i18n-unused-key.js
**프로젝트**: Caret 프론트엔드 i18n 시스템

## 📊 요약 통계

- **총 키 개수**: 1446개
- **사용중인 키**: 645개
- **미사용 키**: 801개
- **스캔한 파일**: 189개
- **사용률**: 44.6%

## 🗑️ 미사용 키 목록 (801개)

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
| `brandMarketplace.preparing` | chat | ko, en, ja, zh | 4 |
| `brandMarketplace.preparingDescription` | chat | ko, en, ja, zh | 4 |
| `chat.addContext` | chat | ko, en, ja, zh | 4 |
| `chat.addFilesImages` | chat | ko, en, ja, zh | 4 |
| `chat.bugReport.additionalContext` | chat | ko, en, ja, zh | 4 |
| `chat.bugReport.clineVersion` | chat | ko, en, ja, zh | 4 |
| `chat.bugReport.operatingSystem` | chat | ko, en, ja, zh | 4 |
| `chat.bugReport.providerModel` | chat | ko, en, ja, zh | 4 |
| `chat.bugReport.relevantApiRequestOutput` | chat | ko, en, ja, zh | 4 |
| `chat.bugReport.stepsToReproduce` | chat | ko, en, ja, zh | 4 |
| `chat.bugReport.systemInfo` | chat | ko, en, ja, zh | 4 |
| `chat.bugReport.title` | chat | ko, en, ja, zh | 4 |
| `chat.bugReport.whatHappened` | chat | ko, en, ja, zh | 4 |
| `chat.contextMenu.add` | chat | ko, en, ja, zh | 4 |
| `chat.contextMenu.file` | chat | ko, en, ja, zh | 4 |
| `chat.contextMenu.folder` | chat | ko, en, ja, zh | 4 |
| `chat.contextMenu.gitCommits` | chat | ko, en, ja, zh | 4 |
| `chat.contextMenu.noResultsFound` | chat | ko, en, ja, zh | 4 |
| `chat.contextMenu.pasteUrlToFetchContents` | chat | ko, en, ja, zh | 4 |
| `chat.contextMenu.problems` | chat | ko, en, ja, zh | 4 |
| `chat.contextMenu.searching` | chat | ko, en, ja, zh | 4 |
| `chat.contextMenu.terminal` | chat | ko, en, ja, zh | 4 |
| `chat.creditLimitError.buyCredits` | chat | ko, en, ja, zh | 4 |
| `chat.creditLimitError.outOfCredits` | chat | ko, en, ja, zh | 4 |
| `chat.creditLimitError.retryRequest` | chat | ko, en, ja, zh | 4 |
| `chat.error.displayContent` | chat | ko, en, ja, zh | 4 |
| `chat.error.label` | chat | ko, en, ja, zh | 4 |
| `chat.error.maxRequestsReached` | chat | ko, en, ja, zh | 4 |
| `chat.error.mistakeLimitReached` | chat | ko, en, ja, zh | 4 |
| `chat.error.unknown` | chat | ko, en, ja, zh | 4 |
| `chat.error.unknownError` | chat | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.apiRequest` | chat | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.apiRequestCancelled` | chat | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.apiRequestFailed` | chat | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.apiRequestLoading` | chat | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.apiRetryAttempt` | chat | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.apiStreamingFailed` | chat | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.creditLimitReached` | chat | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.ellipsis` | chat | ko, en, ja, zh | 4 |
| `chat.errorBlockTitle.inSeconds` | chat | ko, en, ja, zh | 4 |
| `chat.errorRow.clickRetryBelow` | chat | ko, en, ja, zh | 4 |
| `chat.errorRow.clineTriedToAccess` | chat | ko, en, ja, zh | 4 |
| `chat.errorRow.diffError` | chat | ko, en, ja, zh | 4 |
| `chat.errorRow.file` | chat | ko, en, ja, zh | 4 |
| `chat.errorRow.isBlockedBy` | chat | ko, en, ja, zh | 4 |
| `chat.errorRow.period` | chat | ko, en, ja, zh | 4 |
| `chat.errorRow.powershellIssue` | chat | ko, en, ja, zh | 4 |
| `chat.errorRow.requestId` | chat | ko, en, ja, zh | 4 |
| `chat.errorRow.signInToCline` | chat | ko, en, ja, zh | 4 |
| `chat.errorRow.troubleshootingGuide` | chat | ko, en, ja, zh | 4 |
| `chat.image.dimensionError` | chat | ko, en, ja, zh | 4 |
| `chat.image.unsupportedFileError` | chat | ko, en, ja, zh | 4 |
| `chat.mcp.resource` | chat | ko, en, ja, zh | 4 |
| `chat.mcp.tool` | chat | ko, en, ja, zh | 4 |
| `chat.mcp.useServer` | chat | ko, en, ja, zh | 4 |
| `chat.mode.act.label` | chat | ko, en, ja, zh | 4 |
| `chat.mode.plan.label` | chat | ko, en, ja, zh | 4 |
| `chat.mode.tooltip.act.action` | chat | ko, en, ja, zh | 4 |
| `chat.mode.tooltip.description` | chat | ko, en, ja, zh | 4 |
| `chat.mode.tooltip.plan.action` | chat | ko, en, ja, zh | 4 |
| `chat.openDiskTaskHistoryButton.openDiskTaskHistory` | chat | ko, en, ja, zh | 4 |
| `chat.selectModelApiProvider` | chat | ko, en, ja, zh | 4 |
| `chat.serversToggleModal.manageMcpServers` | chat | ko, en, ja, zh | 4 |
| `chat.serversToggleModal.mcpServers` | chat | ko, en, ja, zh | 4 |
| `chat.slashCommandMenu.defaultCommands` | chat | ko, en, ja, zh | 4 |
| `chat.slashCommandMenu.noMatchingCommandsFound` | chat | ko, en, ja, zh | 4 |
| `chat.slashCommandMenu.workflowCommands` | chat | ko, en, ja, zh | 4 |
| `chat.taskCompleted` | chat | ko, en, ja, zh | 4 |
| `chat.taskFeedbackButtons.thisWasHelpful` | chat | ko, en, ja, zh | 4 |
| `chat.taskFeedbackButtons.thisWasNotHelpful` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.allStepsCompleted` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.cache` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.closeTask` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.completionTokens` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.disablingCheckpoints` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.editFocusChainList` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.newStepsGenerated` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.promptTokens` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.seeHereForInstructions` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.seeLess` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.seeMore` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.task` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.tokens` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.tokensReadFromCache` | chat | ko, en, ja, zh | 4 |
| `chat.taskHeader.tokensWrittenToCache` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.assistantMessage` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.assistantResponse` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.browserAction` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.browserActionApproval` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.browserResult` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.checkpointCreated` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.fileEdit` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.fileEditApproval` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.fileRead` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.fileReadApproval` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.newFile` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.newFileApproval` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.planningResponse` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.taskCompleted` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.taskMessage` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.terminalCommand` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.terminalCommandApproval` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.terminalOutput` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.tool` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.toolApproval` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.toolUse` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.unknown` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.unknownFile` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.unknownMessageType` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.unknownUrl` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.userMessage` | chat | ko, en, ja, zh | 4 |
| `chat.taskTimelineTooltip.webFetch` | chat | ko, en, ja, zh | 4 |
| `chat.tool.commandApprovalRequired` | chat | ko, en, ja, zh | 4 |
| `chat.tool.commandOutput` | chat | ko, en, ja, zh | 4 |
| `chat.tool.condenseConversation` | chat | ko, en, ja, zh | 4 |
| `chat.tool.createFile` | chat | ko, en, ja, zh | 4 |
| `chat.tool.createGithubIssue` | chat | ko, en, ja, zh | 4 |
| `chat.tool.editFile` | chat | ko, en, ja, zh | 4 |
| `chat.tool.externalUrl` | chat | ko, en, ja, zh | 4 |
| `chat.tool.listCodeDefinitionNames` | chat | ko, en, ja, zh | 4 |
| `chat.tool.listFilesRecursive` | chat | ko, en, ja, zh | 4 |
| `chat.tool.listFilesTopLevel` | chat | ko, en, ja, zh | 4 |
| `chat.tool.mcpLoadingDocumentation` | chat | ko, en, ja, zh | 4 |
| `chat.tool.mcpNotification` | chat | ko, en, ja, zh | 4 |
| `chat.tool.outsideWorkspace` | chat | ko, en, ja, zh | 4 |
| `chat.tool.readFile` | chat | ko, en, ja, zh | 4 |
| `chat.tool.searchFiles` | chat | ko, en, ja, zh | 4 |
| `chat.tool.seeNewChanges` | chat | ko, en, ja, zh | 4 |
| `chat.tool.shellIntegration.description` | chat | ko, en, ja, zh | 4 |
| `chat.tool.shellIntegration.troubleshooting` | chat | ko, en, ja, zh | 4 |
| `chat.tool.shellIntegration.unavailable` | chat | ko, en, ja, zh | 4 |
| `chat.tool.summarizeTask` | chat | ko, en, ja, zh | 4 |
| `chat.tool.summary` | chat | ko, en, ja, zh | 4 |
| `chat.tool.thinking.label` | chat | ko, en, ja, zh | 4 |
| `chat.tool.webFetch` | chat | ko, en, ja, zh | 4 |
| `chat.userMessage.restoreAll` | chat | ko, en, ja, zh | 4 |
| `chat.userMessage.restoreAllTooltip` | chat | ko, en, ja, zh | 4 |
| `chat.userMessage.restoreChat` | chat | ko, en, ja, zh | 4 |
| `chat.userMessage.restoreChatTooltip` | chat | ko, en, ja, zh | 4 |
| `clineRulesToggleModal.workspaceRules` | chat | ko, en, ja, zh | 4 |
| `historyPreview.apiCost` | chat | ko, en, ja, zh | 4 |
| `historyPreview.cache` | chat | ko, en, ja, zh | 4 |
| `historyPreview.tokens` | chat | ko, en, ja, zh | 4 |
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
| `imagePreview.failedToLoadImage` | chat | ko, en, ja, zh | 4 |
| `imagePreview.imageFrom` | chat | ko, en, ja, zh | 4 |
| `imagePreview.loadingImageFrom` | chat | ko, en, ja, zh | 4 |
| `imagePreview.svgFrom` | chat | ko, en, ja, zh | 4 |
| `imagePreview.timeoutLoadingImage` | chat | ko, en, ja, zh | 4 |
| `imagePreview.waitingForMinutesSeconds` | chat | ko, en, ja, zh | 4 |
| `imagePreview.waitingForSeconds` | chat | ko, en, ja, zh | 4 |
| `linkPreview.loadingPreviewFor` | chat | ko, en, ja, zh | 4 |
| `linkPreview.waitingForMinutesSeconds` | chat | ko, en, ja, zh | 4 |
| `linkPreview.waitingForSeconds` | chat | ko, en, ja, zh | 4 |
| `markdownBlock.openFileInEditor` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.communityMadeWarning` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.install` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.installed` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.installing` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.logoAlt` | chat | ko, en, ja, zh | 4 |
| `mcpMarketplaceCard.requiresApiKey` | chat | ko, en, ja, zh | 4 |
| `mcpResponseDisplay.loadingRichContent` | chat | ko, en, ja, zh | 4 |
| `mcpSubmitCard.helpOthersDiscover` | chat | ko, en, ja, zh | 4 |
| `mcpSubmitCard.submitMcpServer` | chat | ko, en, ja, zh | 4 |
| `thumbnails.thumbnailImage` | chat | ko, en, ja, zh | 4 |
| `account.organization` | common | ko, en, ja, zh | 4 |
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
| `autoApprove.addQuickAccess` | common | ko, en, ja, zh | 4 |
| `autoApprove.removeQuickAccess` | common | ko, en, ja, zh | 4 |
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
| `chat.executeCommand` | common | ko, en, ja, zh | 4 |
| `chat.placeholderHint` | common | ko, en, ja, zh | 4 |
| `chat.typeMessage` | common | ko, en, ja, zh | 4 |
| `chat.typeTaskHere` | common | ko, en, ja, zh | 4 |
| `common.defaultValue` | common | ko, en, ja, zh | 4 |
| `common.scrollToBottom` | common | ko, en, ja, zh | 4 |
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
| `history.title` | common | ko, en, ja, zh | 4 |
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
| `persona.availablePersonas` | common | ko, en, ja, zh | 4 |
| `persona.createNew` | common | ko, en, ja, zh | 4 |
| `persona.creating` | common | ko, en, ja, zh | 4 |
| `persona.default.description` | common | ko, en, ja, zh | 4 |
| `persona.default.name` | common | ko, en, ja, zh | 4 |
| `persona.description` | common | ko, en, ja, zh | 4 |
| `persona.docs` | common | ko, en, ja, zh | 4 |
| `persona.management` | common | ko, en, ja, zh | 4 |
| `persona.select` | common | ko, en, ja, zh | 4 |
| `persona.selectDescription` | common | ko, en, ja, zh | 4 |
| `persona.uploadNormal` | common | ko, en, ja, zh | 4 |
| `persona.uploadThinking` | common | ko, en, ja, zh | 4 |
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
| `settings.modeSystem.description` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.label` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.options.caret` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.options.Caret` | common | ko, en, ja, zh | 4 |
| `settings.modeSystem.options.cline` | common | ko, en, ja, zh | 4 |
| `settings.openAIReasoningEffort.description` | common | ko, en, ja, zh | 4 |
| `settings.openAIReasoningEffort.high` | common | ko, en, ja, zh | 4 |
| `settings.openAIReasoningEffort.label` | common | ko, en, ja, zh | 4 |
| `settings.preferredLanguage.description` | common | ko, en, ja, zh | 4 |
| `settings.preferredLanguage.label` | common | ko, en, ja, zh | 4 |
| `settings.separateModels.description` | common | ko, en, ja, zh | 4 |
| `settings.separateModels.label` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.description` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.label` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.en` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.ja` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.ko` | common | ko, en, ja, zh | 4 |
| `settings.uiLanguage.option.zh` | common | ko, en, ja, zh | 4 |
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
| `about.version` | settings | ko, ja | 2 |
| `api-configuration.title` | settings | ko, en, ja, zh | 4 |
| `apiKeyField.apiKeyLabel` | settings | ko, en, ja, zh | 4 |
| `apiKeyField.signupText` | settings | ko, en, ja, zh | 4 |
| `autoApprove.addToQuickAccess` | settings | ko, en, ja, zh | 4 |
| `autoApprove.label` | settings | ko, en, ja, zh | 4 |
| `autoApprove.removeFromQuickAccess` | settings | ko, en, ja, zh | 4 |
| `autoApprove.tooltip` | settings | ko, en, ja, zh | 4 |
| `basetenModelPicker.modelNotStatic` | settings | ko, en, ja, zh | 4 |
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
| `debug.errorInSeconds` | settings | ko, en, ja, zh | 4 |
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
| `modelInfoView.cacheReadsPriceLabel` | settings | ja, zh | 2 |
| `modelInfoView.cacheWritesPriceLabel` | settings | ja, zh | 2 |
| `modelInfoView.doesNotSupportBrowserUse` | settings | ja, zh | 2 |
| `modelInfoView.doesNotSupportPromptCaching` | settings | ja, zh | 2 |
| `modelInfoView.inputPriceLabel` | settings | ja, zh | 2 |
| `modelInfoView.outputPriceLabel` | settings | ja, zh | 2 |
| `modelInfoView.outputPriceStandardLabel` | settings | ja, zh | 2 |
| `modelInfoView.outputPriceThinkingBudgetLabel` | settings | ja, zh | 2 |
| `modelInfoView.supportsBrowserUse` | settings | ja, zh | 2 |
| `modelInfoView.supportsPromptCaching` | settings | ja, zh | 2 |
| `modelPicker.extensionFetches` | settings | ko, en, ja, zh | 4 |
| `modelPicker.freeOptions` | settings | ko, en, ja, zh | 4 |
| `modelSelector.selectModelPlaceholder` | settings | ko, en, ja, zh | 4 |
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
| `openAiCompatibleProvider.azureApiVersionPlaceholder` | settings | ko, en, ja, zh | 4 |
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
| `openRouterProvider.balanceDisplay.label` | settings | ko, en, ja, zh | 4 |
| `openRouterProvider.balanceDisplay.tooltip` | settings | ko, en, ja, zh | 4 |
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
| `providers.cerebras` | settings | ja, zh | 2 |
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
| `settings.modeSystem.description` | settings | ko, en, ja, zh | 4 |
| `settings.modeSystem.label` | settings | ko, en, ja, zh | 4 |
| `settings.modeSystem.options.caret` | settings | ko, en, ja, zh | 4 |
| `settings.modeSystem.options.cline` | settings | ko, en, ja, zh | 4 |
| `settings.unifiedLanguage.description` | settings | ko, en, ja, zh | 4 |
| `settings.unifiedLanguage.label` | settings | ko, en, ja, zh | 4 |
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


## 🌍 누락된 번역 (164개)

일부 언어에서 번역이 누락된 키들:

| Key | Namespace | Missing Locales | Used | Available |
|-----|-----------|----------------|------|-----------|
| `modelInfoView.contextWindowLabel` 🔥 | settings | ko, en | 2 | ja, zh |
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
| `providers.anthropic.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.anthropic.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.asksage.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.asksage.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.baseten.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.baseten.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.bedrock.description` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.bedrock.name` 🔥 | settings | ja, zh | 1 | ko, en |
| `providers.cerebras.description` 🔥 | settings | ja, zh | 1 | ko, en |
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
| `button.resume.Task` ⚪ | common | en, ja, zh | 0 | ko |
| `rulesModal.ariaLabel.CaretRulesButton` ⚪ | common | ko, ja, zh | 0 | en |
| `rulesModal.tooltip.manageRulesWorkflows` ⚪ | common | ko, ja, zh | 0 | en |
| `about.feedbackPrompt` ⚪ | settings | en, zh | 0 | ko, ja |
| `about.title` ⚪ | settings | en, zh | 0 | ko, ja |
| `about.version` ⚪ | settings | en, zh | 0 | ko, ja |
| `groqModelPicker.description.groqLink` ⚪ | settings | en, ja, zh | 0 | ko |
| `groqModelPicker.description.modelLink` ⚪ | settings | en, ja, zh | 0 | ko |
| `groqModelPicker.description.part1` ⚪ | settings | en, ja, zh | 0 | ko |
| `groqModelPicker.description.part2` ⚪ | settings | en, ja, zh | 0 | ko |
| `huaweiCloudMaasProvider.modelLabel` ⚪ | settings | ko, en, zh | 0 | ja |
| `modelInfoView.cacheReadsPriceLabel` ⚪ | settings | ko, en | 0 | ja, zh |
| `modelInfoView.cacheWritesPriceLabel` ⚪ | settings | ko, en | 0 | ja, zh |
| `modelInfoView.doesNotSupportBrowserUse` ⚪ | settings | ko, en | 0 | ja, zh |
| `modelInfoView.doesNotSupportPromptCaching` ⚪ | settings | ko, en | 0 | ja, zh |
| `modelInfoView.inputPriceLabel` ⚪ | settings | ko, en | 0 | ja, zh |
| `modelInfoView.outputPriceLabel` ⚪ | settings | ko, en | 0 | ja, zh |
| `modelInfoView.outputPriceStandardLabel` ⚪ | settings | ko, en | 0 | ja, zh |
| `modelInfoView.outputPriceThinkingBudgetLabel` ⚪ | settings | ko, en | 0 | ja, zh |
| `modelInfoView.supportsBrowserUse` ⚪ | settings | ko, en | 0 | ja, zh |
| `modelInfoView.supportsPromptCaching` ⚪ | settings | ko, en | 0 | ja, zh |
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


## ❓ 정의되지 않은 키 (1093개)

코드에서 t() 함수로 사용하지만 JSON 파일에 정의되지 않은 키들:

| 키 | 컴포넌트 | 네임스페이스 추정 | 우선순위 |
|-----|-----------|------------------|----------|
| ` ` | ChatView.tsx, MermaidBlock.tsx | common | 🔥 |
| `,` | BrowserSessionRow.tsx, ChatTextArea.tsx | common | 🔥 |
| `.` | StyledCreditDisplay.tsx, Announcement.tsx, ChatRow.tsx, CodeBlock.tsx, MarkdownBlock.tsx, HistoryView.tsx |  | 🔥 |
| `../../../../src/services/error/ClineError` | ErrorRow.test.tsx |  | ⚪ |
| `.quote-button-class` | ChatRow.tsx |  | ⚪ |
| `/` | ChatTextArea.tsx, McpMarketplaceCard.tsx, VSCodeLmProvider.tsx | common | 🔥 |
| `\n` | ChatTextArea.tsx, TaskHeader.tsx, ChecklistRenderer.tsx | common | 🔥 |
| `── Deployed Models ──` | SapAiCoreModelPicker.spec.tsx | common | ⚪ |
| `── Not Deployed Models ──` | SapAiCoreModelPicker.spec.tsx | common | ⚪ |
| `2d` | MermaidBlock.tsx | common | ⚪ |
| `変換テスト` | UserMessage.ime.test.tsx | common | ⚪ |
| `about.description` | AboutSection.tsx | about | ⚪ |
| `about.link` | AboutSection.tsx | about | ⚪ |
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
| `actMode` | ApiConfigurationSection.tsx | common | ⚪ |
| `addContext` | ChatTextArea.tsx | common | ⚪ |
| `addFilesImages` | ChatTextArea.tsx | common | ⚪ |
| `addLocalServerForm.addLocalServerDescriptionPart1` | AddLocalServerForm.tsx | addLocalServerForm | ⚪ |
| `addLocalServerForm.addLocalServerDescriptionPart2` | AddLocalServerForm.tsx | addLocalServerForm | ⚪ |
| `addLocalServerForm.clineMcpSettingsJson` | AddLocalServerForm.tsx | addLocalServerForm | ⚪ |
| `addLocalServerForm.here` | AddLocalServerForm.tsx | addLocalServerForm | ⚪ |
| `addLocalServerForm.openClineMcpSettingsJson` | AddLocalServerForm.tsx | addLocalServerForm | ⚪ |
| `addRemoteServerForm.adding` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.addRemoteServerDescription` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.addServer` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.connectingToServer` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.editConfiguration` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.failedToAddServer` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.here` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.invalidUrlFormat` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.serverNameLabel` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.serverNamePlaceholder` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.serverNameRequired` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.serverUrlLabel` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.serverUrlPlaceholder` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addRemoteServerForm.serverUrlRequired` | AddRemoteServerForm.tsx | addRemoteServerForm | ⚪ |
| `addToInputSubscriptionCompleted` | ChatView.tsx | common | ⚪ |
| `alertDialog.cancel` | AlertDialog.tsx | alertDialog | ⚪ |
| `alertDialog.discardChanges` | AlertDialog.tsx | alertDialog | ⚪ |
| `alertDialog.saveAndContinue` | AlertDialog.tsx | alertDialog | ⚪ |
| `alertDialog.unsavedChangesDescription` | AlertDialog.tsx | alertDialog | ⚪ |
| `alertDialog.unsavedChangesTitle` | AlertDialog.tsx | alertDialog | ⚪ |
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
| `anthropicProvider.switchTo1MContext` | AnthropicProvider.tsx | anthropicProvider | ⚪ |
| `anthropicProvider.switchTo200KContext` | AnthropicProvider.tsx | anthropicProvider | ⚪ |
| `apiKeyField.defaultHelpText` | MoonshotProvider.tsx, VercelAIGatewayProvider.tsx | apiKeyField | 🔥 |
| `apiKeyField.placeholder` | VercelAIGatewayProvider.tsx | apiKeyField | ⚪ |
| `apiOptions.apiProvider` | ApiOptions.tsx | apiOptions | ⚪ |
| `apiOptions.clearSearch` | ApiOptions.tsx | apiOptions | ⚪ |
| `apiOptions.clineProviderHidden` | ApiOptions.tsx | apiOptions | ⚪ |
| `apiOptions.searchAndSelectProvider` | ApiOptions.tsx | apiOptions | ⚪ |
| `askSageProvider.apiKeyHelpText` | AskSageProvider.tsx | askSageProvider | ⚪ |
| `askSageProvider.apiUrlLabel` | AskSageProvider.tsx | askSageProvider | ⚪ |
| `askSageProvider.apiUrlPlaceholder` | AskSageProvider.tsx | askSageProvider | ⚪ |
| `askSageProvider.modelLabel` | AskSageProvider.tsx | askSageProvider | ⚪ |
| `autoApprove.actionsHeader` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.addQuickAccess` | AutoApproveMenuItem.tsx | autoApprove | ⚪ |
| `autoApprove.autoApproveLabel` | AutoApproveBar.tsx | autoApprove | ⚪ |
| `autoApprove.description` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.editFiles.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.editFiles.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.editFiles.shortName` | constants.ts | autoApprove | ⚪ |
| `autoApprove.editFilesExternally.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.editFilesExternally.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.editFilesExternally.shortName` | constants.ts | autoApprove | ⚪ |
| `autoApprove.enableAll.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.enableAll.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.enableAll.shortName` | constants.ts | autoApprove | ⚪ |
| `autoApprove.enableAutoApprove.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.enableAutoApprove.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.enableAutoApprove.shortName` | constants.ts | autoApprove | ⚪ |
| `autoApprove.enableNotifications.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.enableNotifications.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.enableNotifications.shortName` | constants.ts | autoApprove | ⚪ |
| `autoApprove.executeAllCommands.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.executeAllCommands.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.executeAllCommands.shortName` | constants.ts | autoApprove | ⚪ |
| `autoApprove.executeSafeCommands.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.executeSafeCommands.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.executeSafeCommands.shortName` | constants.ts | autoApprove | ⚪ |
| `autoApprove.maxRequestsLabel` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.maxRequestsTooltip` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.quickSettingsHeader` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.readFiles.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.readFiles.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.readFiles.shortName` | constants.ts | autoApprove | ⚪ |
| `autoApprove.readFilesExternally.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.readFilesExternally.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.readFilesExternally.shortName` | constants.ts | autoApprove | ⚪ |
| `autoApprove.removeQuickAccess` | AutoApproveMenuItem.tsx | autoApprove | ⚪ |
| `autoApprove.title` | AutoApproveModal.tsx | autoApprove | ⚪ |
| `autoApprove.useBrowser.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.useBrowser.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.useBrowser.shortName` | constants.ts | autoApprove | ⚪ |
| `autoApprove.useMcp.description` | constants.ts | autoApprove | ⚪ |
| `autoApprove.useMcp.label` | constants.ts | autoApprove | ⚪ |
| `autoApprove.useMcp.shortName` | constants.ts | autoApprove | ⚪ |
| `baseUrlField.label` | AnthropicProvider.tsx | baseUrlField | ⚪ |
| `baseUrlField.placeholderAnthropic` | AnthropicProvider.tsx | baseUrlField | ⚪ |
| `bedrockProvider.accessKeyLabel` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.accessKeyPlaceholder` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.apiKey` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.awsCredentials` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.awsProfile` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.awsRegionLabel` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.baseInferenceModelLabel` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.bedrockApiKeyLabel` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.bedrockApiKeyPlaceholder` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.customModelDescription` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.customModelIdPlaceholder` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.customModelOption` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.defaultCredentialsHelpText` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.modelIdLabel` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.modelLabel` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.profileCredentialsHelpText` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.profileNameLabel` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.profileNamePlaceholder` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.secretKeyLabel` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.secretKeyPlaceholder` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.selectBaseModelPlaceholder` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.selectModelPlaceholder` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.selectRegionPlaceholder` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.sessionTokenLabel` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.sessionTokenPlaceholder` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.useCrossRegionInference` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.useCustomVpcEndpoint` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.usePromptCaching` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `bedrockProvider.vpcEndpointPlaceholder` | BedrockProvider.tsx | bedrockProvider | ⚪ |
| `brandMarketplace.codecenterPreparing` | McpConfigurationView.tsx | brandMarketplace | ⚪ |
| `brandMarketplace.codecenterPreparingDescription` | McpConfigurationView.tsx | brandMarketplace | ⚪ |
| `browser.checkingConnection` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.chromeNotDetected` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.chromePathDescription` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.chromePathOptional` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.chromePathPlaceholder` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.connected` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.customArgsDescription` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.customArgsOptional` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.customArgsPlaceholder` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.disableToolUse` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.disableToolUseDescription` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.launchBrowserDebug` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.launchingBrowser` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.notConnected` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.remoteConnectionDescription1` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.remoteConnectionDescription2` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.remoteConnectionDescription3` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.useRemoteConnection` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.viewportSize` | BrowserSettingsSection.tsx | browser | ⚪ |
| `browser.viewportSizeDescription` | BrowserSettingsSection.tsx | browser | ⚪ |
| `bugReport.additionalContext` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.clineVersion` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.operatingSystem` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.providerModel` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.relevantApiRequestOutput` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.stepsToReproduce` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.systemInfo` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.title` | ReportBugPreview.tsx | bugReport | ⚪ |
| `bugReport.whatHappened` | ReportBugPreview.tsx | bugReport | ⚪ |
| `button.approve` | buttonConfig.ts | button | ⚪ |
| `button.cancel` | buttonConfig.ts | button | ⚪ |
| `button.condenseConversation` | buttonConfig.ts | button | ⚪ |
| `button.done` | AccountView.tsx | button | ⚪ |
| `button.proceed` | buttonConfig.ts | button | ⚪ |
| `button.proceedAnyways` | buttonConfig.ts | button | ⚪ |
| `button.proceedWhileRunning` | buttonConfig.ts | button | ⚪ |
| `button.reject` | buttonConfig.ts | button | ⚪ |
| `button.reportGitHubIssue` | buttonConfig.ts | button | ⚪ |
| `button.resumeTask` | buttonConfig.ts | button | ⚪ |
| `button.retry` | buttonConfig.ts | button | ⚪ |
| `button.runCommand` | buttonConfig.ts | button | ⚪ |
| `button.save` | buttonConfig.ts | button | ⚪ |
| `button.startNewTaskWithContext` | buttonConfig.ts | button | ⚪ |
| `buttons.done` | HistoryView.tsx, SettingsView.tsx | buttons | 🔥 |
| `canvas` | MermaidBlock.tsx | common | ⚪ |
| `Canvas context not available` | MermaidBlock.tsx | common | ⚪ |
| `caretHasQuestion` | ChatRow.tsx | common | ⚪ |
| `chat. ` | ChatView.tsx | chat | ⚪ |
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
| `chat.startNewTask` | ActionButtons.tsx, buttonConfig.ts | chat | 🔥 |
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
| `chat.userMessage.restoreAll` | UserMessage.tsx | chat | ⚪ |
| `chat.userMessage.restoreAllTooltip` | UserMessage.tsx | chat | ⚪ |
| `chat.userMessage.restoreChat` | UserMessage.tsx | chat | ⚪ |
| `chat.userMessage.restoreChatTooltip` | UserMessage.tsx | chat | ⚪ |
| `checkmarkControl.compare` | CheckmarkControl.tsx | checkmarkControl | ⚪ |
| `checkmarkControl.restore` | CheckmarkControl.tsx | checkmarkControl | ⚪ |
| `checkmarkControl.restoreFiles` | CheckmarkControl.tsx | checkmarkControl | ⚪ |
| `checkmarkControl.restoreFilesAndTask` | CheckmarkControl.tsx | checkmarkControl | ⚪ |
| `checkmarkControl.restoreFilesAndTaskDescription` | CheckmarkControl.tsx | checkmarkControl | ⚪ |
| `checkmarkControl.restoreFilesDescription` | CheckmarkControl.tsx | checkmarkControl | ⚪ |
| `checkmarkControl.restoreTaskOnly` | CheckmarkControl.tsx | checkmarkControl | ⚪ |
| `checkmarkControl.restoreTaskOnlyDescription` | CheckmarkControl.tsx | checkmarkControl | ⚪ |
| `checkpointControls.compare` | CheckpointControls.tsx | checkpointControls | ⚪ |
| `checkpointControls.restore` | CheckpointControls.tsx | checkpointControls | ⚪ |
| `checkpointControls.restoreTaskAndWorkspace` | CheckpointControls.tsx | checkpointControls | ⚪ |
| `checkpointControls.restoreTaskAndWorkspaceDescription` | CheckpointControls.tsx | checkpointControls | ⚪ |
| `checkpointControls.restoreTaskOnly` | CheckpointControls.tsx | checkpointControls | ⚪ |
| `checkpointControls.restoreTaskOnlyDescription` | CheckpointControls.tsx | checkpointControls | ⚪ |
| `checkpointControls.restoreWorkspaceOnly` | CheckpointControls.tsx | checkpointControls | ⚪ |
| `checkpointControls.restoreWorkspaceOnlyDescription` | CheckpointControls.tsx | checkpointControls | ⚪ |
| `Choose SAP AI Core model...` | SapAiCoreModelPicker.spec.tsx | Choose SAP AI Core model | ⚪ |
| `clientIdNotFound` | ChatView.tsx | common | ⚪ |
| `clineAccountInfoCard.loginError` | ClineAccountInfoCard.tsx | clineAccountInfoCard | ⚪ |
| `clineAccountInfoCard.signUpWithCline` | ClineAccountInfoCard.tsx | clineAccountInfoCard | ⚪ |
| `clineAccountInfoCard.viewBillingAndUsage` | ClineAccountInfoCard.tsx | clineAccountInfoCard | ⚪ |
| `clineProvider.defaultOption` | ClineProvider.tsx | clineProvider | ⚪ |
| `clineProvider.defaultSortingDescription` | ClineProvider.tsx | clineProvider | ⚪ |
| `clineProvider.latencyOption` | ClineProvider.tsx | clineProvider | ⚪ |
| `clineProvider.latencySortingDescription` | ClineProvider.tsx | clineProvider | ⚪ |
| `clineProvider.priceOption` | ClineProvider.tsx | clineProvider | ⚪ |
| `clineProvider.priceSortingDescription` | ClineProvider.tsx | clineProvider | ⚪ |
| `clineProvider.sortUnderlyingProviderRouting` | ClineProvider.tsx | clineProvider | ⚪ |
| `clineProvider.throughputOption` | ClineProvider.tsx | clineProvider | ⚪ |
| `clineProvider.throughputSortingDescription` | ClineProvider.tsx | clineProvider | ⚪ |
| `clineRulesToggleModal.docs` | ClineRulesToggleModal.tsx | clineRulesToggleModal | ⚪ |
| `clineRulesToggleModal.globalRules` | ClineRulesToggleModal.tsx | clineRulesToggleModal | ⚪ |
| `clineRulesToggleModal.globalWorkflows` | ClineRulesToggleModal.tsx | clineRulesToggleModal | ⚪ |
| `clineRulesToggleModal.manageRulesWorkflows` | ClineRulesToggleModal.tsx | clineRulesToggleModal | ⚪ |
| `clineRulesToggleModal.rulesDescription` | ClineRulesToggleModal.tsx | clineRulesToggleModal | ⚪ |
| `clineRulesToggleModal.rulesTab` | ClineRulesToggleModal.tsx | clineRulesToggleModal | ⚪ |
| `clineRulesToggleModal.workflowName` | ClineRulesToggleModal.tsx | clineRulesToggleModal | ⚪ |
| `clineRulesToggleModal.workflowsDescription` | ClineRulesToggleModal.tsx | clineRulesToggleModal | ⚪ |
| `clineRulesToggleModal.workflowsTab` | ClineRulesToggleModal.tsx | clineRulesToggleModal | ⚪ |
| `clineRulesToggleModal.workspaceWorkflows` | ClineRulesToggleModal.tsx | clineRulesToggleModal | ⚪ |
| `codeAccordian.consoleLogs` | CodeAccordian.tsx | codeAccordian | ⚪ |
| `codeAccordian.userEdits` | CodeAccordian.tsx | codeAccordian | ⚪ |
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
| `common.common.common.and` | AccountWelcomeView.tsx | common | ⚪ |
| `common.scrollToBottom` | ActionButtons.tsx | common | ⚪ |
| `contextMenu.add` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.file` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.folder` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.gitCommits` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.noResultsFound` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.pasteUrlToFetchContents` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.problems` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.searching` | ContextMenu.tsx | contextMenu | ⚪ |
| `contextMenu.terminal` | ContextMenu.tsx | contextMenu | ⚪ |
| `copyButton.copied` | CopyButton.tsx | copyButton | ⚪ |
| `copyButton.copy` | CopyButton.tsx | copyButton | ⚪ |
| `coreFeatures.header` | WelcomeView.tsx | coreFeatures | ⚪ |
| `creditLimitError.buyCredits` | CreditLimitError.tsx | creditLimitError | ⚪ |
| `creditLimitError.outOfCredits` | CreditLimitError.tsx | creditLimitError | ⚪ |
| `creditLimitError.retryRequest` | CreditLimitError.tsx | creditLimitError | ⚪ |
| `credits.tab` | helpers.ts | credits | ⚪ |
| `debug.resetGlobalState` | DebugSection.tsx | debug | ⚪ |
| `debug.resetGlobalStateDescription` | DebugSection.tsx | debug | ⚪ |
| `debug.resetWorkspaceState` | DebugSection.tsx | debug | ⚪ |
| `demo.add` | Demo.tsx | demo | ⚪ |
| `demo.anotherCustomTitle` | Demo.tsx | demo | ⚪ |
| `demo.badge` | Demo.tsx | demo | ⚪ |
| `demo.checkbox` | Demo.tsx | demo | ⚪ |
| `demo.customHeaderTitle` | Demo.tsx | demo | ⚪ |
| `demo.customTitle` | Demo.tsx | demo | ⚪ |
| `demo.helloWorld` | Demo.tsx | demo | ⚪ |
| `demo.howdy` | Demo.tsx | demo | ⚪ |
| `demo.link` | Demo.tsx | demo | ⚪ |
| `demo.matchCase` | Demo.tsx | demo | ⚪ |
| `demo.matchWholeWord` | Demo.tsx | demo | ⚪ |
| `demo.option1` | Demo.tsx | demo | ⚪ |
| `demo.option2` | Demo.tsx | demo | ⚪ |
| `demo.panelView1` | Demo.tsx | demo | ⚪ |
| `demo.panelView2` | Demo.tsx | demo | ⚪ |
| `demo.radio1` | Demo.tsx | demo | ⚪ |
| `demo.radio2` | Demo.tsx | demo | ⚪ |
| `demo.remove` | Demo.tsx | demo | ⚪ |
| `demo.tab1` | Demo.tsx | demo | ⚪ |
| `demo.tab2` | Demo.tsx | demo | ⚪ |
| `demo.tag` | Demo.tsx | demo | ⚪ |
| `demo.textAreaPlaceholder` | Demo.tsx | demo | ⚪ |
| `demo.titleIsCustom` | Demo.tsx | demo | ⚪ |
| `demo.useRegularExpression` | Demo.tsx | demo | ⚪ |
| `div` | ChatView.tsx | common | ⚪ |
| `doubaoProvider.modelLabel` | DoubaoProvider.tsx | doubaoProvider | ⚪ |
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
| `features.autoCompact` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.autoCompactDescription` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.collapseMcpResponses` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.collapseMcpResponsesDescription` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.enableCheckpoints` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.enableCheckpointsDescription` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.enableMcpMarketplace` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.enableMcpMarketplaceDescription` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.focusChain` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.focusChainDescription` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.focusChainReminderInterval` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.focusChainReminderIntervalDescription` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.learnMore` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.mcpDisplayMode` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.mcpDisplayModeDescription` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.openaiReasoningEffort` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.openaiReasoningEffortDescription` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.reasoningEffort.high` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.reasoningEffort.low` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.reasoningEffort.medium` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.strictPlanMode` | FeatureSettingsSection.tsx | features | ⚪ |
| `features.strictPlanModeDescription` | FeatureSettingsSection.tsx | features | ⚪ |
| `gemini-2.5-pro` | SapAiCoreModelPicker.spec.tsx | gemini-2 | ⚪ |
| `geminiProvider.baseUrlPlaceholder` | GeminiProvider.tsx | geminiProvider | ⚪ |
| `getStarted.button` | WelcomeView.tsx | getStarted | ⚪ |
| `gpt-4o` | SapAiCoreModelPicker.spec.tsx | common | ⚪ |
| `history.apiCostLabel` | HistoryView.tsx | history | ⚪ |
| `history.cacheLabel` | HistoryView.tsx | history | ⚪ |
| `history.clearSearch` | HistoryView.tsx | history | ⚪ |
| `history.export` | HistoryView.tsx | history | ⚪ |
| `history.filterFavorites` | HistoryView.tsx | history | ⚪ |
| `history.filterWorkspace` | HistoryView.tsx | history | ⚪ |
| `history.fuzzySearchPlaceholder` | HistoryView.tsx | history | ⚪ |
| `history.history.apiCostLabel` | HistoryView.tsx | history | ⚪ |
| `history.history.cacheLabel` | HistoryView.tsx | history | ⚪ |
| `history.history.clearSearch` | HistoryView.tsx | history | ⚪ |
| `history.history.export` | HistoryView.tsx | history | ⚪ |
| `history.history.filterFavorites` | HistoryView.tsx | history | ⚪ |
| `history.history.filterWorkspace` | HistoryView.tsx | history | ⚪ |
| `history.history.fuzzySearchPlaceholder` | HistoryView.tsx | history | ⚪ |
| `history.history.selectAll` | HistoryView.tsx | history | ⚪ |
| `history.history.selectNone` | HistoryView.tsx | history | ⚪ |
| `history.history.sortMostExpensive` | HistoryView.tsx | history | ⚪ |
| `history.history.sortMostRelevant` | HistoryView.tsx | history | ⚪ |
| `history.history.sortMostTokens` | HistoryView.tsx | history | ⚪ |
| `history.history.sortNewest` | HistoryView.tsx | history | ⚪ |
| `history.history.sortOldest` | HistoryView.tsx | history | ⚪ |
| `history.history.title` | HistoryView.tsx | history | ⚪ |
| `history.history.tokensLabel` | HistoryView.tsx | history | ⚪ |
| `history.selectAll` | HistoryView.tsx | history | ⚪ |
| `history.selectNone` | HistoryView.tsx | history | ⚪ |
| `history.sortMostExpensive` | HistoryView.tsx | history | ⚪ |
| `history.sortMostRelevant` | HistoryView.tsx | history | ⚪ |
| `history.sortMostTokens` | HistoryView.tsx | history | ⚪ |
| `history.sortNewest` | HistoryView.tsx | history | ⚪ |
| `history.sortOldest` | HistoryView.tsx | history | ⚪ |
| `history.title` | HistoryView.tsx | history | ⚪ |
| `history.tokensLabel` | HistoryView.tsx | history | ⚪ |
| `historyPreview.favorited` | HistoryPreview.tsx | historyPreview | ⚪ |
| `historyPreview.noRecentTasks` | HistoryPreview.tsx | historyPreview | ⚪ |
| `historyPreview.recentTasks` | HistoryPreview.tsx | historyPreview | ⚪ |
| `historyPreview.viewAllHistory` | HistoryPreview.tsx | historyPreview | ⚪ |
| `huggingFaceProvider.apiKeyHelpText` | HuggingFaceProvider.tsx | huggingFaceProvider | ⚪ |
| `huggingFaceProvider.apiKeyLabel` | HuggingFaceProvider.tsx | huggingFaceProvider | ⚪ |
| `huggingFaceProvider.apiKeyPlaceholder` | HuggingFaceProvider.tsx | huggingFaceProvider | ⚪ |
| `huggingFaceProvider.getApiKeyLinkText` | HuggingFaceProvider.tsx | huggingFaceProvider | ⚪ |
| `image.dimensionError` | ChatTextArea.tsx | image | ⚪ |
| `image.unsupportedFileError` | ChatTextArea.tsx | image | ⚪ |
| `imageAlt.caretBanner` | WelcomeView.tsx | imageAlt | ⚪ |
| `imagePreview.clickToOpenInBrowser` | ImagePreview.tsx | imagePreview | ⚪ |
| `imagePreview.errorDisplayingImage` | ImagePreview.tsx | imagePreview | ⚪ |
| `imagePreview.failedToLoadImageTitle` | ImagePreview.tsx | imagePreview | ⚪ |
| `installedServersView.advancedMcpSettings` | InstalledServersView.tsx | installedServersView | ⚪ |
| `installedServersView.communityMadeServers` | InstalledServersView.tsx | installedServersView | ⚪ |
| `installedServersView.configureMcpServers` | InstalledServersView.tsx | installedServersView | ⚪ |
| `installedServersView.descriptionPart1` | InstalledServersView.tsx | installedServersView | ⚪ |
| `installedServersView.descriptionPart2` | InstalledServersView.tsx | installedServersView | ⚪ |
| `installedServersView.descriptionPart3` | InstalledServersView.tsx | installedServersView | ⚪ |
| `installedServersView.modelContextProtocol` | InstalledServersView.tsx | installedServersView | ⚪ |
| `installedServersView.seeDemoHere` | InstalledServersView.tsx | installedServersView | ⚪ |
| `linkPreview.clickToOpenInBrowser` | LinkPreview.tsx | linkPreview | ⚪ |
| `linkPreview.errorDisplayingLinkPreview` | LinkPreview.tsx | linkPreview | ⚪ |
| `linkPreview.failedToFetchOpenGraphData` | LinkPreview.tsx | linkPreview | ⚪ |
| `linkPreview.networkErrorLoadingPreview` | LinkPreview.tsx | linkPreview | ⚪ |
| `linkPreview.noDescriptionAvailable` | LinkPreview.tsx | linkPreview | ⚪ |
| `linkPreview.noTitle` | LinkPreview.tsx | linkPreview | ⚪ |
| `linkPreview.previewRequestTimedOut` | LinkPreview.tsx | linkPreview | ⚪ |
| `linkPreview.unableToLoadPreview` | LinkPreview.tsx | linkPreview | ⚪ |
| `linkPreview.unknownErrorOccurred` | LinkPreview.tsx | linkPreview | ⚪ |
| `liteLlmProvider.apiKeyPlaceholder` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `liteLlmProvider.baseUrlPlaceholder` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `liteLlmProvider.description1` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `liteLlmProvider.description2` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `liteLlmProvider.extendedThinkingDescription1` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `liteLlmProvider.extendedThinkingLink` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `liteLlmProvider.modelConfigurationLabel` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `liteLlmProvider.modelIdPlaceholder` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `liteLlmProvider.quickstartGuideLink` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `liteLlmProvider.usePromptCachingDescription` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `liteLlmProvider.usePromptCachingLabel` | LiteLlmProvider.tsx | liteLlmProvider | ⚪ |
| `lmStudioProvider.baseUrlPlaceholder` | LMStudioProvider.tsx | lmStudioProvider | ⚪ |
| `lmStudioProvider.contextWindowTooltip` | LMStudioProvider.tsx | lmStudioProvider | ⚪ |
| `lmStudioProvider.modelPlaceholder` | LMStudioProvider.tsx | lmStudioProvider | ⚪ |
| `lmStudioProvider.parseModelsError` | LMStudioProvider.tsx | lmStudioProvider | ⚪ |
| `markdownBlock.actModeShortcut` | MarkdownBlock.tsx | markdownBlock | ⚪ |
| `markdownBlock.alreadyInActMode` | MarkdownBlock.tsx | markdownBlock | ⚪ |
| `markdownBlock.clickToToggleActMode` | MarkdownBlock.tsx | markdownBlock | ⚪ |
| `markdownBlock.copyCode` | MarkdownBlock.tsx | markdownBlock | ⚪ |
| `Max requests reached` | ErrorRow.test.tsx | common | ⚪ |
| `mcp.resource` | ChatRow.tsx | mcp | ⚪ |
| `mcp.tool` | ChatRow.tsx | mcp | ⚪ |
| `mcpConfigurationView.done` | McpConfigurationView.tsx | mcpConfigurationView | ⚪ |
| `mcpConfigurationView.installed` | McpConfigurationView.tsx | mcpConfigurationView | ⚪ |
| `mcpConfigurationView.marketplace` | McpConfigurationView.tsx | mcpConfigurationView | ⚪ |
| `mcpConfigurationView.mcpServers` | McpConfigurationView.tsx | mcpConfigurationView | ⚪ |
| `mcpConfigurationView.remoteServers` | McpConfigurationView.tsx | mcpConfigurationView | ⚪ |
| `mcpMarketplaceView.allCategories` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.clearSearch` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.failedToLoadMarketplaceData` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.filter` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.githubStars` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.mostInstalls` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.name` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.newest` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.noMatchingMcpServersFound` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.noMcpServersFoundInMarketplace` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.retry` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.searchMcps` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpMarketplaceView.sort` | McpMarketplaceView.tsx | mcpMarketplaceView | ⚪ |
| `mcpResourceRow.noDescription` | McpResourceRow.tsx | mcpResourceRow | ⚪ |
| `mcpResourceRow.returns` | McpResourceRow.tsx | mcpResourceRow | ⚪ |
| `mcpResourceRow.unknown` | McpResourceRow.tsx | mcpResourceRow | ⚪ |
| `mcpResponseDisplay.errorParsingResponse` | McpResponseDisplay.tsx | mcpResponseDisplay | ⚪ |
| `mcpResponseDisplay.response` | McpResponseDisplay.tsx | mcpResponseDisplay | ⚪ |
| `mcpResponseDisplay.responseError` | McpResponseDisplay.tsx | mcpResponseDisplay | ⚪ |
| `mcpToolRow.autoApprove` | McpToolRow.tsx | mcpToolRow | ⚪ |
| `mcpToolRow.noDescription` | McpToolRow.tsx | mcpToolRow | ⚪ |
| `mcpToolRow.parameters` | McpToolRow.tsx | mcpToolRow | ⚪ |
| `mermaidBlock.copyCode` | MermaidBlock.tsx | mermaidBlock | ⚪ |
| `mermaidBlock.generatingDiagram` | MermaidBlock.tsx | mermaidBlock | ⚪ |
| `Mistake limit reached` | ErrorRow.test.tsx | common | ⚪ |
| `mode.act.action` | ChatTextArea.tsx | mode | ⚪ |
| `mode.act.label` | ChatTextArea.tsx | mode | ⚪ |
| `mode.plan.action` | ChatTextArea.tsx | mode | ⚪ |
| `mode.plan.label` | ChatTextArea.tsx | mode | ⚪ |
| `Model` | SapAiCoreModelPicker.spec.tsx | common | ⚪ |
| `modelInfoView.basedOnInputTokens` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.cacheReadsPrice` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.cacheWritesPrice` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.contextWindow` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.doesNotSupportBrowser` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.doesNotSupportCache` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.doesNotSupportImages` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.inputPrice` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.millionTokensLabel` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.outputPrice` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.outputPriceStandard` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.outputPriceThinking` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.supportsBrowser` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.supportsCache` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.supportsImages` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelInfoView.tokensSuffix` | ModelInfoView.tsx | modelInfoView | ⚪ |
| `modelSelector.label` | AnthropicProvider.tsx, CerebrasProvider.tsx, DeepSeekProvider.tsx | modelSelector | 🔥 |
| `moonshotProvider.entrypoint` | MoonshotProvider.tsx | moonshotProvider | ⚪ |
| `nebiusProvider.apiKeyHelpText` | NebiusProvider.tsx | nebiusProvider | ⚪ |
| `newRuleRow.createRuleFile` | NewRuleRow.tsx | newRuleRow | ⚪ |
| `newRuleRow.invalidExtensionError` | NewRuleRow.tsx | newRuleRow | ⚪ |
| `newRuleRow.newRuleFile` | NewRuleRow.tsx | newRuleRow | ⚪ |
| `newRuleRow.newWorkflowFile` | NewRuleRow.tsx | newRuleRow | ⚪ |
| `newRuleRow.rulePlaceholder` | NewRuleRow.tsx | newRuleRow | ⚪ |
| `newRuleRow.workflowPlaceholder` | NewRuleRow.tsx | newRuleRow | ⚪ |
| `ollamaProvider.apiKeyHelpText` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.apiKeyPlaceholder` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.baseUrlLabel` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.baseUrlPlaceholder` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.contextWindowPlaceholder` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.fetchModelsError` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.fetchModelsErrorLog` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.modelContextWindowLabel` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.modelLabel` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.modelPickerPlaceholder.example` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.modelPickerPlaceholder.search` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.providerName` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.requestTimeoutDescription` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.requestTimeoutLabel` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `ollamaProvider.requestTimeoutPlaceholder` | OllamaProvider.tsx | ollamaProvider | ⚪ |
| `openAiCompatibleProvider.addHeaderButton` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.azureApiVersionLabel` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.baseUrlLabel` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.baseUrlPlaceholder` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.contextWindowSizeLabel` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.customHeadersLabel` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.enableR1FormatCheckbox` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.headerNamePlaceholder` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.headerValuePlaceholder` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.inputPriceLabel` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.maxOutputTokensLabel` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.modelConfigurationLabel` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.modelIdLabel` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.modelIdPlaceholder` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.outputPriceLabel` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.providerName` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.refreshModelsError` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.removeHeaderButton` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.supportsBrowserUseCheckbox` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.supportsImagesCheckbox` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openAiCompatibleProvider.temperatureLabel` | OpenAICompatible.tsx | openAiCompatibleProvider | ⚪ |
| `openDiskTaskHistoryButton.openDiskTaskHistory` | OpenDiskTaskHistoryButton.tsx | openDiskTaskHistoryButton | ⚪ |
| `openRouterProvider.apiKeyHelpText` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.apiKeyLabel` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.apiKeyPlaceholder` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.authError` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.balanceDisplay.loading` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.defaultOption` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.defaultSortingDescription` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.getApiKeyButton` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.latencyOption` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.latencySortingDescription` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.priceOption` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.priceSortingDescription` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.sortUnderlyingProviderRoutingCheckbox` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.throughputOption` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `openRouterProvider.throughputSortingDescription` | OpenRouterProvider.tsx | openRouterProvider | ⚪ |
| `placeholderHint` | ChatTextArea.tsx | common | ⚪ |
| `planMode` | ApiConfigurationSection.tsx | common | ⚪ |
| `providers.anthropic.description` | AnthropicProvider.tsx | providers | ⚪ |
| `providers.anthropic.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.asksage.description` | AskSageProvider.tsx | providers | ⚪ |
| `providers.asksage.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.baseten.description` | BasetenProvider.tsx | providers | ⚪ |
| `providers.baseten.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.bedrock.description` | BedrockProvider.tsx | providers | ⚪ |
| `providers.bedrock.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.caret.apiKeyConfigured` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.description` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.feature1` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.feature2` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.feature3` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.feature4` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.features` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.getApiKey` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.login` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.loginError` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.name` | ApiOptions.tsx, CaretProvider.tsx | providers | 🔥 |
| `providers.caret.or` | CaretProvider.tsx | providers | ⚪ |
| `providers.caret.visit` | CaretProvider.tsx | providers | ⚪ |
| `providers.cerebras.description` | CerebrasProvider.tsx | providers | ⚪ |
| `providers.cerebras.name` | ApiOptions.tsx, CerebrasProvider.tsx | providers | 🔥 |
| `providers.claude-code.description` | ClaudeCodeProvider.tsx | providers | ⚪ |
| `providers.claude-code.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.claudeCode.cliPath` | ClaudeCodeProvider.tsx | providers | ⚪ |
| `providers.claudeCode.cliPathDescription` | ClaudeCodeProvider.tsx | providers | ⚪ |
| `providers.claudeCode.cliPathPlaceholder` | ClaudeCodeProvider.tsx | providers | ⚪ |
| `providers.claudeCode.model` | ClaudeCodeProvider.tsx | providers | ⚪ |
| `providers.cline.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.deepseek.description` | DeepSeekProvider.tsx | providers | ⚪ |
| `providers.deepseek.name` | ApiOptions.tsx, DeepSeekProvider.tsx | providers | 🔥 |
| `providers.dify.baseUrlLabel` | DifyProvider.tsx | providers | ⚪ |
| `providers.dify.baseUrlPlaceholder` | DifyProvider.tsx | providers | ⚪ |
| `providers.dify.description` | DifyProvider.tsx | providers | ⚪ |
| `providers.dify.name` | ApiOptions.tsx, DifyProvider.tsx | providers | 🔥 |
| `providers.doubao.description` | DoubaoProvider.tsx | providers | ⚪ |
| `providers.doubao.name` | ApiOptions.tsx, DoubaoProvider.tsx | providers | 🔥 |
| `providers.fireworks.description` | FireworksProvider.tsx | providers | ⚪ |
| `providers.fireworks.name` | ApiOptions.tsx, FireworksProvider.tsx | providers | 🔥 |
| `providers.gemini.description` | GeminiProvider.tsx | providers | ⚪ |
| `providers.gemini.name` | ApiOptions.tsx, GeminiProvider.tsx | providers | 🔥 |
| `providers.groq.description` | GroqProvider.tsx | providers | ⚪ |
| `providers.groq.name` | ApiOptions.tsx, GroqProvider.tsx | providers | 🔥 |
| `providers.huawei-cloud-maas.description` | HuaweiCloudMaasProvider.tsx | providers | ⚪ |
| `providers.huawei-cloud-maas.name` | ApiOptions.tsx, HuaweiCloudMaasProvider.tsx | providers | 🔥 |
| `providers.huggingface.description` | HuggingFaceProvider.tsx | providers | ⚪ |
| `providers.huggingface.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.litellm.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.lmstudio.description` | LMStudioProvider.tsx | providers | ⚪ |
| `providers.lmstudio.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.mistral.description` | MistralProvider.tsx | providers | ⚪ |
| `providers.mistral.name` | ApiOptions.tsx, MistralProvider.tsx | providers | 🔥 |
| `providers.moonshot.description` | MoonshotProvider.tsx | providers | ⚪ |
| `providers.moonshot.name` | ApiOptions.tsx, MoonshotProvider.tsx | providers | 🔥 |
| `providers.nebius.description` | NebiusProvider.tsx | providers | ⚪ |
| `providers.nebius.name` | ApiOptions.tsx, NebiusProvider.tsx | providers | 🔥 |
| `providers.ollama.description` | OllamaProvider.tsx | providers | ⚪ |
| `providers.ollama.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.openai-native.description` | OpenAINative.tsx | providers | ⚪ |
| `providers.openai-native.name` | ApiOptions.tsx, OpenAINative.tsx | providers | 🔥 |
| `providers.openai.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.openAICompatible.description` | OpenAICompatible.tsx | providers | ⚪ |
| `providers.openrouter.description` | OpenRouterProvider.tsx | providers | ⚪ |
| `providers.openrouter.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.qwen-code.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.qwen.description` | QwenProvider.tsx | providers | ⚪ |
| `providers.qwen.name` | ApiOptions.tsx, QwenProvider.tsx | providers | 🔥 |
| `providers.qwenCode.description` | QwenCodeProvider.tsx | providers | ⚪ |
| `providers.requesty.description` | RequestyProvider.tsx | providers | ⚪ |
| `providers.requesty.name` | ApiOptions.tsx, RequestyProvider.tsx | providers | 🔥 |
| `providers.sambanova.description` | SambanovaProvider.tsx | providers | ⚪ |
| `providers.sambanova.name` | ApiOptions.tsx, SambanovaProvider.tsx | providers | 🔥 |
| `providers.sapAiCore.description` | SapAiCoreProvider.tsx | providers | ⚪ |
| `providers.sapaicore.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.together.description` | TogetherProvider.tsx | providers | ⚪ |
| `providers.together.name` | ApiOptions.tsx, TogetherProvider.tsx | providers | 🔥 |
| `providers.vercel-ai-gateway.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.vercelAiGateway.description` | VercelAIGatewayProvider.tsx | providers | ⚪ |
| `providers.vertex.description` | VertexProvider.tsx | providers | ⚪ |
| `providers.vertex.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.vscode-lm.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.vsCodeLm.description` | VSCodeLmProvider.tsx | providers | ⚪ |
| `providers.xai.description` | XaiProvider.tsx | providers | ⚪ |
| `providers.xai.name` | ApiOptions.tsx | providers | ⚪ |
| `providers.zai.description` | ZAiProvider.tsx | providers | ⚪ |
| `providers.zai.name` | ApiOptions.tsx | providers | ⚪ |
| `qwenCodeProvider.apiConfigurationTitle` | QwenCodeProvider.tsx | qwenCodeProvider | ⚪ |
| `qwenCodeProvider.authenticateStep` | QwenCodeProvider.tsx | qwenCodeProvider | ⚪ |
| `qwenCodeProvider.credentialsStoredStep` | QwenCodeProvider.tsx | qwenCodeProvider | ⚪ |
| `qwenCodeProvider.getStartedTitle` | QwenCodeProvider.tsx | qwenCodeProvider | ⚪ |
| `qwenCodeProvider.installClientStep` | QwenCodeProvider.tsx | qwenCodeProvider | ⚪ |
| `qwenCodeProvider.oauthAuthenticationDescription` | QwenCodeProvider.tsx | qwenCodeProvider | ⚪ |
| `qwenCodeProvider.oauthCredentialsPathDescription` | QwenCodeProvider.tsx | qwenCodeProvider | ⚪ |
| `qwenCodeProvider.oauthCredentialsPathLabel` | QwenCodeProvider.tsx | qwenCodeProvider | ⚪ |
| `qwenCodeProvider.oauthCredentialsPathPlaceholder` | QwenCodeProvider.tsx | qwenCodeProvider | ⚪ |
| `qwenCodeProvider.setupInstructionsLinkText` | QwenCodeProvider.tsx | qwenCodeProvider | ⚪ |
| `qwenProvider.apiLineDescription` | QwenProvider.tsx | qwenProvider | ⚪ |
| `qwenProvider.apiLineLabel` | QwenProvider.tsx | qwenProvider | ⚪ |
| `qwenProvider.apiLineOptions.${line}` | QwenProvider.tsx | qwenProvider | ⚪ |
| `redirect` | helpers.ts | common | ⚪ |
| `requestyProvider.customBaseUrlPlaceholder` | RequestyProvider.tsx | requestyProvider | ⚪ |
| `requestyProvider.useCustomBaseUrlLabel` | RequestyProvider.tsx | requestyProvider | ⚪ |
| `ruleRow.deleteRuleFile` | RuleRow.tsx | ruleRow | ⚪ |
| `ruleRow.editRuleFile` | RuleRow.tsx | ruleRow | ⚪ |
| `rules.section.workspaceRules` | ClineRulesToggleModal.tsx | rules | ⚪ |
| `rulesToggleList.noRulesFound` | RulesToggleList.tsx | rulesToggleList | ⚪ |
| `rulesToggleList.noWorkflowsFound` | RulesToggleList.tsx | rulesToggleList | ⚪ |
| `sapAiCoreProvider.apiAccessInfoLinkText` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.baseUrlLabel` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.baseUrlPlaceholder` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.clientIdLabel` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.clientIdPlaceholder` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.clientIdSetMessage` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.clientSecretLabel` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.clientSecretPlaceholder` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.clientSecretSetMessage` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.configureCredentialsPrompt` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.credentialsHelpText` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.fetchModelsErrorLog` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.loadingModels` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.modelFetchError` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.noModelsFound` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.orchestrationModeDescriptionDisabled` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.orchestrationModeDescriptionEnabled` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.orchestrationModeLabel` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.resourceGroupLabel` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.resourceGroupPlaceholder` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.retryButton` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.selectModelPlaceholder` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.tokenUrlLabel` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `sapAiCoreProvider.tokenUrlPlaceholder` | SapAiCoreProvider.tsx | sapAiCoreProvider | ⚪ |
| `scrollToBottom` | ActionButtons.tsx | common | ⚪ |
| `Select a model...` | SapAiCoreModelPicker.spec.tsx | Select a model | ⚪ |
| `selectModelApiProvider` | ChatTextArea.tsx | common | ⚪ |
| `serverRow.autoApproveAllTools` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.deleteServer` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.deleting` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.noResourcesFound` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.noToolsFound` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.requestTimeout` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.resources` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.restarting` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.restartServer` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.retryConnection` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.retrying` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.timeout10Minutes` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.timeout1Hour` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.timeout1Minute` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.timeout30Minutes` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.timeout30Seconds` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.timeout5Minutes` | ServerRow.tsx | serverRow | ⚪ |
| `serverRow.tools` | ServerRow.tsx | serverRow | ⚪ |
| `serversToggleList.noMcpServersInstalled` | ServersToggleList.tsx | serversToggleList | ⚪ |
| `serversToggleModal.manageMcpServers` | ServersToggleModal.tsx | serversToggleModal | ⚪ |
| `serversToggleModal.mcpServers` | ServersToggleModal.tsx | serversToggleModal | ⚪ |
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
| `settings.preferredLanguage.changeError` | PreferredLanguageSetting.tsx | settings | ⚪ |
| `settings.preferredLanguage.description` | PreferredLanguageSetting.tsx | settings | ⚪ |
| `settings.preferredLanguage.label` | PreferredLanguageSetting.tsx | settings | ⚪ |
| `settings.providers.caret.loginError` | CaretProvider.tsx | settings | ⚪ |
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
| `settings.settings.apiKeyField.label` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.settings.basetenModelPicker.basetenLink` | BasetenModelPicker.tsx | settings | ⚪ |
| `settings.settings.basetenModelPicker.clearSearch` | BasetenModelPicker.tsx | settings | ⚪ |
| `settings.settings.basetenModelPicker.description` | BasetenModelPicker.tsx | settings | ⚪ |
| `settings.settings.basetenModelPicker.fetchModelsError` | BasetenModelPicker.tsx | settings | ⚪ |
| `settings.settings.basetenModelPicker.recommendedModel` | BasetenModelPicker.tsx | settings | ⚪ |
| `settings.settings.basetenModelPicker.searchPlaceholder` | BasetenModelPicker.tsx | settings | ⚪ |
| `settings.settings.baseUrlField.label` | GeminiProvider.tsx, LiteLlmProvider.tsx, LMStudioProvider.tsx | settings | 🔥 |
| `settings.settings.groqModelPicker.fetchModelsDescription` | GroqModelPicker.tsx | settings | ⚪ |
| `settings.settings.groqModelPicker.fetchModelsError` | GroqModelPicker.tsx | settings | ⚪ |
| `settings.settings.groqModelPicker.groqLinkText` | GroqModelPicker.tsx | settings | ⚪ |
| `settings.settings.groqModelPicker.recommendedModel` | GroqModelPicker.tsx | settings | ⚪ |
| `settings.settings.groqModelPicker.unsureModelChoice` | GroqModelPicker.tsx | settings | ⚪ |
| `settings.settings.huggingFaceModelPicker.fetchModelsError` | HuggingFaceModelPicker.tsx | settings | ⚪ |
| `settings.settings.modelIdField.label` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.settings.modelInfoView.contextWindowLabel` | LiteLlmProvider.tsx, LMStudioProvider.tsx | settings | 🔥 |
| `settings.settings.modelInfoView.maxOutputTokensLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.settings.modelInfoView.supportsImagesLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.settings.modelInfoView.temperatureLabel` | LiteLlmProvider.tsx | settings | ⚪ |
| `settings.settings.modelPicker.unsureWhichModel` | BasetenModelPicker.tsx | settings | ⚪ |
| `settings.settings.modelSelector.label` | BasetenModelPicker.tsx, FireworksProvider.tsx, GeminiProvider.tsx, HuaweiCloudMaasProvider.tsx, LMStudioProvider.tsx, MistralProvider.tsx, MoonshotProvider.tsx, NebiusProvider.tsx, OpenAINative.tsx, QwenCodeProvider.tsx, QwenProvider.tsx, SambanovaProvider.tsx, VercelAIGatewayProvider.tsx, XaiProvider.tsx, ZAiProvider.tsx | settings | 🔥 |
| `settings.settings.preferredLanguage.changeError` | PreferredLanguageSetting.tsx | settings | ⚪ |
| `settingsView.title` | SettingsView.tsx | settingsView | ⚪ |
| `slashCommandMenu.noMatchingCommandsFound` | SlashCommandMenu.tsx | slashCommandMenu | ⚪ |
| `Streaming failed` | ErrorRow.test.tsx | common | ⚪ |
| `tab` | helpers.ts | common | ⚪ |
| `tabs.about.header` | SettingsView.tsx | tabs | ⚪ |
| `tabs.about.name` | SettingsView.tsx | tabs | ⚪ |
| `tabs.about.tooltip` | SettingsView.tsx | tabs | ⚪ |
| `tabs.apiConfiguration.header` | SettingsView.tsx | tabs | ⚪ |
| `tabs.apiConfiguration.name` | SettingsView.tsx | tabs | ⚪ |
| `tabs.apiConfiguration.tooltip` | SettingsView.tsx | tabs | ⚪ |
| `tabs.browser.header` | SettingsView.tsx | tabs | ⚪ |
| `tabs.browser.name` | SettingsView.tsx | tabs | ⚪ |
| `tabs.browser.tooltip` | SettingsView.tsx | tabs | ⚪ |
| `tabs.debug.header` | SettingsView.tsx | tabs | ⚪ |
| `tabs.debug.name` | SettingsView.tsx | tabs | ⚪ |
| `tabs.debug.tooltip` | SettingsView.tsx | tabs | ⚪ |
| `tabs.features.header` | SettingsView.tsx | tabs | ⚪ |
| `tabs.features.name` | SettingsView.tsx | tabs | ⚪ |
| `tabs.features.tooltip` | SettingsView.tsx | tabs | ⚪ |
| `tabs.general.header` | SettingsView.tsx | tabs | ⚪ |
| `tabs.general.name` | SettingsView.tsx | tabs | ⚪ |
| `tabs.general.tooltip` | SettingsView.tsx | tabs | ⚪ |
| `tabs.terminal.header` | SettingsView.tsx | tabs | ⚪ |
| `tabs.terminal.name` | SettingsView.tsx | tabs | ⚪ |
| `tabs.terminal.tooltip` | SettingsView.tsx | tabs | ⚪ |
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
| `telemetryBanner.accessExperimentalFeatures` | TelemetryBanner.tsx | telemetryBanner | ⚪ |
| `telemetryBanner.closeAndEnable` | TelemetryBanner.tsx | telemetryBanner | ⚪ |
| `telemetryBanner.dataCollectionInfo` | TelemetryBanner.tsx | telemetryBanner | ⚪ |
| `telemetryBanner.helpImproveCline` | TelemetryBanner.tsx | telemetryBanner | ⚪ |
| `telemetryBanner.settings` | TelemetryBanner.tsx | telemetryBanner | ⚪ |
| `telemetryBanner.turnOffSetting` | TelemetryBanner.tsx | telemetryBanner | ⚪ |
| `terminal.aggressiveReuse` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.aggressiveReuseDescription` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.checkOur` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.defaultProfile` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.defaultProfileDescription` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.issuesTitle` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.orThe` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.positiveNumberError` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.quickFixesLink` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.shellTimeout` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.shellTimeoutDescription` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.timeoutPlaceholder` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `terminal.troubleshootingGuideLink` | TerminalSettingsSection.tsx | terminal | ⚪ |
| `Test error message` | ErrorRow.test.tsx | common | ⚪ |
| `togetherProvider.modelIdLabel` | TogetherProvider.tsx | togetherProvider | ⚪ |
| `togetherProvider.modelIdPlaceholder` | TogetherProvider.tsx | togetherProvider | ⚪ |
| `togetherProvider.notePrefix` | TogetherProvider.tsx | togetherProvider | ⚪ |
| `togetherProvider.noteText` | TogetherProvider.tsx | togetherProvider | ⚪ |
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
| `true.redirect` | helpers.ts | true | ⚪ |
| `typeMessage` | ChatView.tsx | common | ⚪ |
| `unsupported-model` | SapAiCoreModelPicker.spec.tsx | common | ⚪ |
| `useDifferentModels` | ApiConfigurationSection.tsx | common | ⚪ |
| `useDifferentModelsDescription` | ApiConfigurationSection.tsx | common | ⚪ |
| `userMessage.restoreAll` | UserMessage.tsx | userMessage | ⚪ |
| `userMessage.restoreAllTooltip` | UserMessage.tsx | userMessage | ⚪ |
| `userMessage.restoreChat` | UserMessage.tsx | userMessage | ⚪ |
| `userMessage.restoreChatTooltip` | UserMessage.tsx | userMessage | ⚪ |
| `vercelAiGatewayProvider.apiKeyLabel` | VercelAIGatewayProvider.tsx | vercelAiGatewayProvider | ⚪ |
| `vercelAiGatewayProvider.fetchModelsError` | VercelAIGatewayProvider.tsx | vercelAiGatewayProvider | ⚪ |
| `vercelAiGatewayProvider.fetchModelsErrorLog` | VercelAIGatewayProvider.tsx | vercelAiGatewayProvider | ⚪ |
| `vercelAiGatewayProvider.getApiKeyLinkText` | VercelAIGatewayProvider.tsx | vercelAiGatewayProvider | ⚪ |
| `vercelAiGatewayProvider.modelIdLabel` | VercelAIGatewayProvider.tsx | vercelAiGatewayProvider | ⚪ |
| `vercelAiGatewayProvider.modelIdPlaceholder` | VercelAIGatewayProvider.tsx | vercelAiGatewayProvider | ⚪ |
| `vercelAiGatewayProvider.noteText` | VercelAIGatewayProvider.tsx | vercelAiGatewayProvider | ⚪ |
| `welcome.takeATour` | HomeHeader.tsx | welcome | ⚪ |
| `welcome.tooltipContent` | HomeHeader.tsx | welcome | ⚪ |
| `welcome.whatCanIDo` | HomeHeader.tsx | welcome | ⚪ |
| `xaiProvider.modifyReasoningEffort` | XaiProvider.tsx | xaiProvider | ⚪ |
| `xaiProvider.notePrefix` | XaiProvider.tsx | xaiProvider | ⚪ |
| `xaiProvider.noteText` | XaiProvider.tsx | xaiProvider | ⚪ |
| `xaiProvider.providerName` | XaiProvider.tsx | xaiProvider | ⚪ |
| `xaiProvider.reasoningEffortDescription` | XaiProvider.tsx | xaiProvider | ⚪ |
| `xaiProvider.reasoningEffortLabel` | XaiProvider.tsx | xaiProvider | ⚪ |
| `xaiProvider.reasoningEffortOptions.high` | XaiProvider.tsx | xaiProvider | ⚪ |
| `xaiProvider.reasoningEffortOptions.low` | XaiProvider.tsx | xaiProvider | ⚪ |
| `You have run out of credits.` | ErrorRow.test.tsx | You have run out of credits | ⚪ |
| `zaiProvider.entrypointDescription` | ZAiProvider.tsx | zaiProvider | ⚪ |
| `zaiProvider.entrypointLabel` | ZAiProvider.tsx | zaiProvider | ⚪ |
| `zaiProvider.providerName` | ZAiProvider.tsx | zaiProvider | ⚪ |

🔥 = 고우선순위 (여러 컴포넌트에서 사용)
⚪ = 저우선순위 (단일 컴포넌트 사용)


## 📂 컴포넌트 사용 분석

i18n 키를 사용하는 컴포넌트들:

Total components using i18n: **120**

| Component | Keys Used | Sample Keys |
|-----------|-----------|-------------|
| `settings\ApiOptions.tsx` | 80 | `providers.caret.name`, `providers.openrouter.name`, `providers.gemini.name` (+77 more) |
| `chat\auto-approve-menu\constants.ts` | 66 | `autoApprove.enableAutoApprove.label`, `autoApprove.enableAutoApprove.shortName`, `autoApprove.enableAutoApprove.description` (+63 more) |
| `settings\providers\BedrockProvider.tsx` | 60 | `providers.bedrock.description`, `bedrockProvider.apiKey`, `bedrockProvider.awsProfile` (+57 more) |
| `settings\providers\SapAiCoreProvider.tsx` | 50 | `sapAiCoreProvider.fetchModelsErrorLog`, `sapAiCoreProvider.modelFetchError`, `providers.sapAiCore.description` (+47 more) |
| `common\Demo.tsx` | 48 | `demo.helloWorld`, `demo.howdy`, `demo.customHeaderTitle` (+45 more) |
| `chat\ChatRow.tsx` | 46 | `.quote-button-class`, `error.label`, `error.mistakeLimitReached` (+43 more) |
| `settings\SettingsView.tsx` | 46 | `tabs.apiConfiguration.name`, `tabs.apiConfiguration.tooltip`, `tabs.apiConfiguration.header` (+43 more) |
| `settings\providers\OpenAICompatible.tsx` | 44 | `openAiCompatibleProvider.refreshModelsError`, `providers.openAICompatible.description`, `openAiCompatibleProvider.baseUrlPlaceholder` (+41 more) |
| `settings\sections\FeatureSettingsSection.tsx` | 44 | `features.enableCheckpoints`, `features.enableCheckpointsDescription`, `features.enableMcpMarketplace` (+41 more) |
| `settings\sections\BrowserSettingsSection.tsx` | 40 | `browser.checkingConnection`, `browser.connected`, `browser.notConnected` (+37 more) |
| `chat\task-header\TaskTimelineTooltip.tsx` | 36 | `taskTimelineTooltip.taskMessage`, `taskTimelineTooltip.userMessage`, `taskTimelineTooltip.assistantResponse` (+33 more) |
| `mcp\configuration\tabs\installed\server-row\ServerRow.tsx` | 36 | `serverRow.timeout30Seconds`, `serverRow.timeout1Minute`, `serverRow.timeout5Minutes` (+33 more) |
| `settings\providers\LiteLlmProvider.tsx` | 36 | `liteLlmProvider.baseUrlPlaceholder`, `settings.baseUrlField.label`, `liteLlmProvider.apiKeyPlaceholder` (+33 more) |
| `chat\Announcement.tsx` | 35 | `.`, `announcement.features.freeStealth.title`, `announcement.features.freeStealth.description` (+32 more) |
| `history\HistoryView.tsx` | 35 | `history.title`, `buttons.done`, `history.fuzzySearchPlaceholder` (+32 more) |
| `settings\common\ModelInfoView.tsx` | 32 | `modelInfoView.millionTokensLabel`, `modelInfoView.tokensSuffix`, `modelInfoView.inputPrice` (+29 more) |
| `settings\providers\OllamaProvider.tsx` | 32 | `ollamaProvider.fetchModelsErrorLog`, `providers.ollama.description`, `ollamaProvider.baseUrlLabel` (+29 more) |
| `settings\providers\OpenRouterProvider.tsx` | 32 | `openRouterProvider.balanceDisplay.loading`, `providers.openrouter.description`, `openRouterProvider.apiKeyPlaceholder` (+29 more) |
| `chat\task-header\TaskHeader.tsx` | 29 | `\n`, `taskHeader.task`, `taskHeader.closeTask` (+26 more) |
| `chat\chat-view\shared\buttonConfig.ts` | 28 | `button.retry`, `chat.startNewTask`, `button.proceedAnyways` (+25 more) |
| `mcp\configuration\tabs\add-server\AddRemoteServerForm.tsx` | 28 | `addRemoteServerForm.serverNameRequired`, `addRemoteServerForm.serverUrlRequired`, `addRemoteServerForm.invalidUrlFormat` (+25 more) |
| `mcp\configuration\tabs\marketplace\McpMarketplaceView.tsx` | 26 | `mcpMarketplaceView.failedToLoadMarketplaceData`, `mcpMarketplaceView.retry`, `mcpMarketplaceView.searchMcps` (+23 more) |
| `settings\providers\CaretProvider.tsx` | 26 | `providers.caret.loginError`, `providers.caret.description`, `providers.caret.login` (+23 more) |
| `settings\sections\TerminalSettingsSection.tsx` | 26 | `terminal.positiveNumberError`, `terminal.defaultProfile`, `terminal.defaultProfileDescription` (+23 more) |
| `settings\providers\QwenCodeProvider.tsx` | 24 | `providers.qwenCode.description`, `qwenCodeProvider.apiConfigurationTitle`, `qwenCodeProvider.oauthCredentialsPathPlaceholder` (+21 more) |
| `chat\ChatTextArea.tsx` | 23 | `/`, `,`, `\n` (+20 more) |
| `cline-rules\ClineRulesToggleModal.tsx` | 22 | `clineRulesToggleModal.manageRulesWorkflows`, `clineRulesToggleModal.rulesTab`, `clineRulesToggleModal.workflowsTab` (+19 more) |
| `settings\providers\VercelAIGatewayProvider.tsx` | 22 | `vercelAiGatewayProvider.fetchModelsErrorLog`, `providers.vercelAiGateway.description`, `apiKeyField.placeholder` (+19 more) |
| `account\CreditsHistoryTable.tsx` | 20 | `account.usageHistory`, `account.paymentsHistory`, `account.loading` (+17 more) |
| `settings\providers\XaiProvider.tsx` | 20 | `providers.xai.description`, `xaiProvider.providerName`, `xaiProvider.notePrefix` (+17 more) |
| `account\AccountView.tsx` | 18 | `account.title`, `button.done`, `account.failedToFetchUserCredit` (+15 more) |
| `chat\ContextMenu.tsx` | 18 | `contextMenu.problems`, `contextMenu.terminal`, `contextMenu.pasteUrlToFetchContents` (+15 more) |
| `chat\ErrorRow.tsx` | 18 | `errorRow.powershellIssue`, `errorRow.troubleshootingGuide`, `errorRow.period` (+15 more) |
| `chat\ReportBugPreview.tsx` | 18 | `bugReport.title`, `bugReport.whatHappened`, `bugReport.stepsToReproduce` (+15 more) |
| `mcp\chat-display\LinkPreview.tsx` | 18 | `linkPreview.failedToFetchOpenGraphData`, `linkPreview.unknownErrorOccurred`, `linkPreview.unableToLoadPreview` (+15 more) |
| `settings\providers\ClineProvider.tsx` | 18 | `clineProvider.sortUnderlyingProviderRouting`, `clineProvider.defaultOption`, `clineProvider.priceOption` (+15 more) |
| `account\AccountWelcomeView.tsx` | 16 | `account.signUpDescription`, `account.signUpWithCaret`, `account.byContining` (+13 more) |
| `common\CheckmarkControl.tsx` | 16 | `checkmarkControl.compare`, `checkmarkControl.restore`, `checkmarkControl.restoreFiles` (+13 more) |
| `common\CheckpointControls.tsx` | 16 | `checkpointControls.compare`, `checkpointControls.restore`, `checkpointControls.restoreTaskAndWorkspace` (+13 more) |
| `mcp\configuration\tabs\installed\InstalledServersView.tsx` | 16 | `installedServersView.descriptionPart1`, `installedServersView.modelContextProtocol`, `installedServersView.descriptionPart2` (+13 more) |
| `settings\BasetenModelPicker.tsx` | 16 | `settings.basetenModelPicker.fetchModelsError`, `settings.modelSelector.label`, `settings.basetenModelPicker.searchPlaceholder` (+13 more) |
| `settings\providers\LMStudioProvider.tsx` | 16 | `lmStudioProvider.parseModelsError`, `providers.lmstudio.description`, `settings.baseUrlField.label` (+13 more) |
| `chat\ErrorBlockTitle.tsx` | 14 | `errorBlockTitle.ellipsis`, `errorBlockTitle.apiRequestLoading`, `errorBlockTitle.apiRequestCancelled` (+11 more) |
| `mcp\configuration\McpConfigurationView.tsx` | 14 | `mcpConfigurationView.mcpServers`, `mcpConfigurationView.done`, `mcpConfigurationView.marketplace` (+11 more) |
| `chat\ChatView.tsx` | 13 | `div`, `errorSelectingFilesImages`, `clientIdNotFound` (+10 more) |
| `settings\GroqModelPicker.tsx` | 13 | `settings.groqModelPicker.fetchModelsError`, `settings.groqModelPicker.modelLabel`, `settings.groqModelPicker.searchPlaceholder` (+10 more) |
| `chat\auto-approve-menu\AutoApproveModal.tsx` | 12 | `autoApprove.description`, `autoApprove.title`, `autoApprove.actionsHeader` (+9 more) |
| `cline-rules\NewRuleRow.tsx` | 12 | `newRuleRow.invalidExtensionError`, `newRuleRow.workflowPlaceholder`, `newRuleRow.rulePlaceholder` (+9 more) |
| `common\TelemetryBanner.tsx` | 12 | `telemetryBanner.closeAndEnable`, `telemetryBanner.helpImproveCline`, `telemetryBanner.accessExperimentalFeatures` (+9 more) |
| `settings\providers\AnthropicProvider.tsx` | 12 | `anthropicProvider.switchTo1MContext`, `anthropicProvider.switchTo200KContext`, `providers.anthropic.description` (+9 more) |
| `settings\providers\QwenProvider.tsx` | 12 | `providers.qwen.description`, `qwenProvider.apiLineLabel`, `qwenProvider.apiLineOptions.${line}` (+9 more) |
| `settings\providers\TogetherProvider.tsx` | 12 | `providers.together.description`, `providers.together.name`, `togetherProvider.modelIdPlaceholder` (+9 more) |
| `common\AlertDialog.tsx` | 10 | `alertDialog.unsavedChangesTitle`, `alertDialog.unsavedChangesDescription`, `alertDialog.discardChanges` (+7 more) |
| `mcp\configuration\tabs\add-server\AddLocalServerForm.tsx` | 10 | `addLocalServerForm.addLocalServerDescriptionPart1`, `addLocalServerForm.clineMcpSettingsJson`, `addLocalServerForm.addLocalServerDescriptionPart2` (+7 more) |
| `settings\providers\AskSageProvider.tsx` | 10 | `providers.asksage.description`, `askSageProvider.apiKeyHelpText`, `askSageProvider.apiUrlPlaceholder` (+7 more) |
| `settings\providers\ClaudeCodeProvider.tsx` | 10 | `providers.claude-code.description`, `providers.claudeCode.cliPathPlaceholder`, `providers.claudeCode.cliPath` (+7 more) |
| `settings\providers\GeminiProvider.tsx` | 10 | `providers.gemini.description`, `providers.gemini.name`, `settings.baseUrlField.label` (+7 more) |
| `settings\providers\HuggingFaceProvider.tsx` | 10 | `providers.huggingface.description`, `huggingFaceProvider.apiKeyPlaceholder`, `huggingFaceProvider.apiKeyLabel` (+7 more) |
| `settings\providers\MoonshotProvider.tsx` | 10 | `providers.moonshot.description`, `moonshotProvider.entrypoint`, `apiKeyField.defaultHelpText` (+7 more) |
| `settings\providers\ZAiProvider.tsx` | 10 | `providers.zai.description`, `zaiProvider.entrypointLabel`, `zaiProvider.entrypointDescription` (+7 more) |
| `settings\__tests__\SapAiCoreModelPicker.spec.tsx` | 10 | `Model`, `Select a model...`, `Choose SAP AI Core model...` (+7 more) |
| `common\MarkdownBlock.tsx` | 9 | `markdownBlock.clickToToggleActMode`, `markdownBlock.alreadyInActMode`, `markdownBlock.actModeShortcut` (+6 more) |
| `chat\UserMessage.tsx` | 8 | `userMessage.restoreAll`, `userMessage.restoreAllTooltip`, `userMessage.restoreChat` (+5 more) |
| `common\MermaidBlock.tsx` | 8 | `mermaidBlock.generatingDiagram`, `mermaidBlock.copyCode`, ` ` (+5 more) |
| `history\HistoryPreview.tsx` | 8 | `historyPreview.recentTasks`, `historyPreview.favorited`, `historyPreview.viewAllHistory` (+5 more) |
| `settings\providers\DifyProvider.tsx` | 8 | `providers.dify.description`, `providers.dify.baseUrlPlaceholder`, `providers.dify.baseUrlLabel` (+5 more) |
| `settings\providers\NebiusProvider.tsx` | 8 | `providers.nebius.description`, `nebiusProvider.apiKeyHelpText`, `providers.nebius.name` (+5 more) |
| `settings\providers\RequestyProvider.tsx` | 8 | `providers.requesty.description`, `providers.requesty.name`, `requestyProvider.useCustomBaseUrlLabel` (+5 more) |
| `settings\sections\ApiConfigurationSection.tsx` | 8 | `planMode`, `actMode`, `useDifferentModels` (+5 more) |
| `account\CreditBalance.tsx` | 6 | `account.lastUpdated`, `account.currentBalance`, `account.addCredits` (+3 more) |
| `chat\CreditLimitError.tsx` | 6 | `creditLimitError.outOfCredits`, `creditLimitError.buyCredits`, `creditLimitError.retryRequest` (+3 more) |
| `chat\ErrorRow.test.tsx` | 6 | `Test error message`, `Mistake limit reached`, `Max requests reached` (+3 more) |
| `mcp\chat-display\ImagePreview.tsx` | 6 | `imagePreview.failedToLoadImageTitle`, `imagePreview.clickToOpenInBrowser`, `imagePreview.errorDisplayingImage` (+3 more) |
| `mcp\chat-display\McpResponseDisplay.tsx` | 6 | `mcpResponseDisplay.response`, `mcpResponseDisplay.responseError`, `mcpResponseDisplay.errorParsingResponse` (+3 more) |
| `mcp\configuration\tabs\installed\server-row\McpResourceRow.tsx` | 6 | `mcpResourceRow.noDescription`, `mcpResourceRow.returns`, `mcpResourceRow.unknown` (+3 more) |
| `mcp\configuration\tabs\installed\server-row\McpToolRow.tsx` | 6 | `mcpToolRow.autoApprove`, `mcpToolRow.parameters`, `mcpToolRow.noDescription` (+3 more) |
| `settings\ClineAccountInfoCard.tsx` | 6 | `clineAccountInfoCard.loginError`, `clineAccountInfoCard.viewBillingAndUsage`, `clineAccountInfoCard.signUpWithCline` (+3 more) |
| `settings\PreferredLanguageSetting.tsx` | 6 | `settings.preferredLanguage.changeError`, `settings.preferredLanguage.label`, `settings.preferredLanguage.description` (+3 more) |
| `settings\providers\CerebrasProvider.tsx` | 6 | `providers.cerebras.description`, `providers.cerebras.name`, `modelSelector.label` (+3 more) |
| `settings\providers\DeepSeekProvider.tsx` | 6 | `providers.deepseek.description`, `providers.deepseek.name`, `modelSelector.label` (+3 more) |
| `settings\providers\DoubaoProvider.tsx` | 6 | `providers.doubao.description`, `providers.doubao.name`, `doubaoProvider.modelLabel` (+3 more) |
| `settings\providers\FireworksProvider.tsx` | 6 | `providers.fireworks.description`, `providers.fireworks.name`, `settings.modelSelector.label` (+3 more) |
| `settings\providers\HuaweiCloudMaasProvider.tsx` | 6 | `providers.huawei-cloud-maas.description`, `providers.huawei-cloud-maas.name`, `settings.modelSelector.label` (+3 more) |
| `settings\providers\MistralProvider.tsx` | 6 | `providers.mistral.description`, `providers.mistral.name`, `settings.modelSelector.label` (+3 more) |
| `settings\providers\OpenAINative.tsx` | 6 | `providers.openai-native.description`, `providers.openai-native.name`, `settings.modelSelector.label` (+3 more) |
| `settings\providers\SambanovaProvider.tsx` | 6 | `providers.sambanova.description`, `providers.sambanova.name`, `settings.modelSelector.label` (+3 more) |
| `settings\sections\DebugSection.tsx` | 6 | `debug.resetWorkspaceState`, `debug.resetGlobalState`, `debug.resetGlobalStateDescription` (+3 more) |
| `welcome\HomeHeader.tsx` | 6 | `welcome.whatCanIDo`, `welcome.tooltipContent`, `welcome.takeATour` (+3 more) |
| `welcome\WelcomeView.tsx` | 6 | `imageAlt.caretBanner`, `coreFeatures.header`, `getStarted.button` (+3 more) |
| `settings\HuggingFaceModelPicker.tsx` | 5 | `settings.huggingFaceModelPicker.fetchModelsError`, `settings.huggingFaceModelPicker.modelLabel`, `settings.huggingFaceModelPicker.searchPlaceholder` (+2 more) |
| `account\helpers.ts` | 4 | `tab`, `redirect`, `credits.tab` (+1 more) |
| `chat\chat-view\components\layout\ActionButtons.tsx` | 4 | `scrollToBottom`, `chat.startNewTask`, `common.scrollToBottom` (+1 more) |
| `chat\ChatErrorBoundary.tsx` | 4 | `error.displayContent`, `error.unknownError`, `chat.error.displayContent` (+1 more) |
| `chat\ServersToggleModal.tsx` | 4 | `serversToggleModal.manageMcpServers`, `serversToggleModal.mcpServers`, `chat.serversToggleModal.manageMcpServers` (+1 more) |
| `chat\task-header\buttons\DeleteTaskButton.tsx` | 4 | `task.deleteTask`, `task.deleteTaskAriaLabel`, `common.task.deleteTask` (+1 more) |
| `chat\TaskFeedbackButtons.tsx` | 4 | `taskFeedbackButtons.thisWasHelpful`, `taskFeedbackButtons.thisWasNotHelpful`, `chat.taskFeedbackButtons.thisWasHelpful` (+1 more) |
| `cline-rules\RuleRow.tsx` | 4 | `ruleRow.editRuleFile`, `ruleRow.deleteRuleFile`, `chat.ruleRow.editRuleFile` (+1 more) |
| `cline-rules\RulesToggleList.tsx` | 4 | `rulesToggleList.noWorkflowsFound`, `rulesToggleList.noRulesFound`, `chat.rulesToggleList.noWorkflowsFound` (+1 more) |
| `common\CodeAccordian.tsx` | 4 | `codeAccordian.userEdits`, `codeAccordian.consoleLogs`, `chat.codeAccordian.userEdits` (+1 more) |
| `common\CopyButton.tsx` | 4 | `copyButton.copied`, `copyButton.copy`, `chat.copyButton.copied` (+1 more) |
| `settings\providers\GroqProvider.tsx` | 4 | `providers.groq.description`, `providers.groq.name`, `settings.providers.groq.description` (+1 more) |
| `settings\sections\AboutSection.tsx` | 4 | `about.description`, `about.link`, `settings.about.description` (+1 more) |
| `settings\providers\VSCodeLmProvider.tsx` | 3 | `providers.vsCodeLm.description`, `/`, `settings.providers.vsCodeLm.description` |
| `chat\auto-approve-menu\AutoApproveBar.tsx` | 2 | `autoApprove.autoApproveLabel`, `common.autoApprove.autoApproveLabel` |
| `chat\auto-approve-menu\AutoApproveMenuItem.tsx` | 2 | `autoApprove.removeQuickAccess`, `autoApprove.addQuickAccess` |
| `chat\SlashCommandMenu.tsx` | 2 | `slashCommandMenu.noMatchingCommandsFound`, `chat.slashCommandMenu.noMatchingCommandsFound` |
| `chat\task-header\buttons\CopyTaskButton.tsx` | 2 | `task.copyTask`, `common.task.copyTask` |
| `chat\task-header\buttons\OpenDiskTaskHistoryButton.tsx` | 2 | `openDiskTaskHistoryButton.openDiskTaskHistory`, `chat.openDiskTaskHistoryButton.openDiskTaskHistory` |
| `mcp\configuration\tabs\installed\ServersToggleList.tsx` | 2 | `serversToggleList.noMcpServersInstalled`, `chat.serversToggleList.noMcpServersInstalled` |
| `settings\OllamaModelPicker.tsx` | 2 | `settings.ollamaModelPicker.searchPlaceholder`, `settings.ollamaModelPicker.clearSearch` |
| `settings\providers\BasetenProvider.tsx` | 2 | `providers.baseten.description`, `settings.providers.baseten.description` |
| `settings\providers\VertexProvider.tsx` | 2 | `providers.vertex.description`, `settings.providers.vertex.description` |
| `account\AccountOptions.tsx` | 1 | `account.failedToGetLoginUrl` |
| `account\StyledCreditDisplay.tsx` | 1 | `.` |
| `chat\BrowserSessionRow.tsx` | 1 | `,` |
| `chat\__tests__\UserMessage.ime.test.tsx` | 1 | `変換テスト` |
| `common\ChecklistRenderer.tsx` | 1 | `\n` |
| `common\CodeBlock.tsx` | 1 | `.` |
| `mcp\configuration\tabs\marketplace\McpMarketplaceCard.tsx` | 1 | `/` |
| `settings\ModelDescriptionMarkdown.tsx` | 1 | `settings.modelPicker.seeMore` |


## 🛠️ 정리 권장사항

### 🗑️ 미사용 키 제거
- **작업**: locale 파일에서 801개의 미사용 키 제거
- **효과**: 번들 크기 감소 및 유지보수 부담 경감
- **우선순위**: 낮음 (향후 기능을 위한 플레이스홀더가 아닌 경우)

### 🌍 누락 번역 완성
- **작업**: 164개의 누락된 번역 추가
- **고우선순위**: 75개 (현재 사용중인 키들)
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
**현재 상태**: 164개 키에서 번역 누락

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
- 미사용 키 801개에 대한 검토
- 향후 사용 예정인지, 레거시 키인지 판단
- 확실한 불필요 키들은 locale 파일에서 제거
- 번들 크기 최적화 및 유지보수성 향상
**현재 상태**: 801개 미사용 키 탐지 (사용률 44.6%)

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
