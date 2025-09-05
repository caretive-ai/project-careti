## i18n 적용 실제 대상 파일 목록 및 검토 결과

이 문서는 `i18n-checklist-report.md`의 146개 파일을 수동으로 검토한 결과를 기록합니다.

### 검토 완료 (작업 불필요)

*   `webview-ui/src/components/account/AccountView.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/account/AccountWelcomeView.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/account/CreditBalance.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/account/CreditsHistoryTable.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/account/StyledCreditDisplay.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/chat/ErrorRow.test.tsx`: 작업 불필요 (테스트 파일)
*   `webview-ui/src/components/chat/auto-approve-menu/AutoApproveBar.tsx`: 작업 불필요 (이미 `t()` 함수 및 i18n 동적 데이터 적용 완료)
*   `webview-ui/src/components/chat/auto-approve-menu/AutoApproveMenuItem.tsx`: 작업 불필요 (이미 `t()` 함수 사용 및 상위 컴포넌트로부터 번역된 props 전달받음)
*   `webview-ui/src/components/chat/auto-approve-menu/AutoApproveModal.tsx`: 작업 불필요 (이미 `t()` 함수 사용 및 상위 컴포넌트로부터 번역된 props 전달받음)
*   `webview-ui/src/components/chat/chat-view/components/layout/ActionButtons.tsx`: 작업 불필요 (이미 `useCaretI18n` 훅과 `getButtonConfig`를 통해 i18n 적용 완료)
*   `webview-ui/src/components/chat/chat-view/components/layout/ChatLayout.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음, 순수 레이아웃 컴포넌트)
*   `webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음, `placeholderText`는 props로 전달받음)
*   `webview-ui/src/components/chat/chat-view/components/layout/MessagesArea.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음, 메시지 렌더링은 외부 함수에서 처리)
*   `webview-ui/src/components/chat/chat-view/components/layout/WelcomeSection.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음, 하위 컴포넌트에서 텍스트 처리)
*   `webview-ui/src/components/chat/ChatErrorBoundary.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/ChatView.tsx`: 작업 불필요 (이미 `t()` 함수를 사용하고 있으며, UI 문자열은 하위 컴포넌트에서 처리됨)
*   `webview-ui/src/components/chat/ContextMenu.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/CreditLimitError.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/ErrorBlockTitle.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/ErrorRow.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/OptionsButtons.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음, `options`는 props로 전달받음)
*   `webview-ui/src/components/chat/ReportBugPreview.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/ServersToggleModal.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/SlashCommandMenu.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/task-header/buttons/CopyTaskButton.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/task-header/buttons/DeleteTaskButton.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/task-header/buttons/OpenDiskTaskHistoryButton.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/task-header/TaskTimeline.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음, 툴팁은 하위 컴포넌트에서 처리)
*   `webview-ui/src/components/chat/TaskFeedbackButtons.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/chat/UserMessage.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/common/ModelInfoView.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/FeaturedModelCard.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음, 모든 문자열은 props로 전달받음)
*   `webview-ui/src/components/settings/GroqModelPicker.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/HuggingFaceModelPicker.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/ModelDescriptionMarkdown.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/OllamaModelPicker.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/PreferredLanguageSetting.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/AnthropicProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/AskSageProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/BasetenProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/BedrockProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/CaretProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/CerebrasProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/ClaudeCodeProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/ClineProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/DeepSeekProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/DoubaoProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/FireworksProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/GeminiProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/GroqProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/HuaweiCloudMaasProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/HuggingFaceProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/LMStudioProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/MistralProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/OpenAICompatible.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/MoonshotProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/NebiusProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/OllamaProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/OpenAINative.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/OpenRouterProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/QwenCodeProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/QwenProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/RequestyProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/SapAiCoreProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/SambanovaProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/VercelAIGatewayProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/TogetherProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/LiteLlmProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/providers/DifyProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)

---

### 작업 대상 목록 (수정 진행중)

*   `webview-ui/src/components/chat/BrowserSessionRow.tsx`
*   `webview-ui/src/components/chat/ChatRow.tsx`
*   `webview-ui/src/components/chat/ChatTextArea.tsx`
*   `webview-ui/src/components/chat/QuoteButton.tsx`
*   `webview-ui/src/components/chat/QuotedMessagePreview.tsx`
*   `webview-ui/src/components/chat/task-header/TaskHeader.tsx`
*   `webview-ui/src/components/chat/task-header/TaskTimelineTooltip.tsx`
*   `webview-ui/src/components/cline-rules/ClineRulesToggleModal.tsx`
*   `webview-ui/src/components/cline-rules/NewRuleRow.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/cline-rules/RuleRow.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/cline-rules/RulesToggleList.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/common/AlertDialog.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/common/ChecklistRenderer.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/common/CheckpointControls.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/common/CodeAccordian.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/common/CheckmarkControl.tsx`
*   `webview-ui/src/components/common/CodeBlock.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/common/CopyButton.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/common/MermaidBlock.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/common/SuccessButton.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/common/Thumbnails.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/common/Tab.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/common/TelemetryBanner.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/common/Tooltip.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/common/DangerButton.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/common/Demo.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/common/HeroTooltip.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/common/MarkdownBlock.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/history/HistoryPreview.tsx`
*   `webview-ui/src/components/history/HistoryView.tsx`
*   `webview-ui/src/components/mcp/chat-display/LinkPreview.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/configuration/McpConfigurationView.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/chat-display/ImagePreview.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/chat-display/McpResponseDisplay.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/configuration/tabs/add-server/AddLocalServerForm.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/configuration/tabs/add-server/AddRemoteServerForm.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/configuration/tabs/installed/InstalledServersView.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/configuration/tabs/installed/server-row/McpToolRow.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/configuration/tabs/marketplace/McpMarketplaceView.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/configuration/tabs/installed/server-row/McpResourceRow.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/configuration/tabs/installed/server-row/ServerRow.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/configuration/tabs/marketplace/McpMarketplaceCard.tsx`
*   `webview-ui/src/components/mcp/configuration/tabs/marketplace/McpSubmitCard.tsx`
*   `webview-ui/src/components/settings/ApiOptions.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/BasetenModelPicker.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/common/ApiKeyField.tsx`
*   `webview-ui/src/components/settings/common/BaseUrlField.tsx`
*   `webview-ui/src/components/settings/common/ErrorMessage.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/settings/ClineAccountInfoCard.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/mcp/configuration/tabs/installed/ServersToggleList.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/common/ModelSelector.tsx`
*   `webview-ui/src/components/settings/OpenRouterModelPicker.tsx`
*   `webview-ui/src/components/settings/providers/VertexProvider.tsx`
*   `webview-ui/src/components/settings/providers/VSCodeLmProvider.tsx`
*   `webview-ui/src/components/settings/providers/XaiProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/RequestyModelPicker.tsx`
*   `webview-ui/src/components/settings/SapAiCoreModelPicker.tsx`
*   `webview-ui/src/components/settings/providers/ZAiProvider.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/TerminalOutputLineLimitSlider.tsx`
*   `webview-ui/src/components/settings/ThinkingBudgetSlider.tsx`
*   `webview-ui/src/components/settings/UseCustomPromptCheckbox.tsx`
*   `webview-ui/src/components/welcome/SuggestedTasks.tsx`
*   `webview-ui/src/components/browser/BrowserSettingsMenu.tsx`
*   `webview-ui/src/components/settings/Section.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/settings/SectionHeader.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/settings/sections/AboutSection.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/sections/ApiConfigurationSection.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/sections/BrowserSettingsSection.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/sections/DebugSection.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/sections/FeatureSettingsSection.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/sections/TerminalSettingsSection.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/settings/SettingsView.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/welcome/HomeHeader.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/welcome/QuickWinCard.tsx`: 작업 불필요 (번역 대상 UI 문자열 없음)
*   `webview-ui/src/components/welcome/WelcomeView.tsx`: 작업 불필요 (이미 `t()` 함수 적용 완료)
*   `webview-ui/src/components/menu/Navbar.tsx`
