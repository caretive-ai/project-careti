## 2.3. i18n 적용 필요 파일 체크리스트
**총 154개 컴포넌트 중 146개 파일이 i18n 적용 필요**

### **Account 관련 (5개)**
[x] `webview-ui/src/components/account\AccountView.tsx` (하드코딩:26) ✅ 완료
[x] `webview-ui/src/components/account\AccountWelcomeView.tsx` (하드코딩:7) ✅ 완료
[x] `webview-ui/src/components/account\CreditBalance.tsx` (하드코딩:8) ✅ 완료
[x] `webview-ui/src/components/account\CreditsHistoryTable.tsx` (하드코딩:14) ✅ 완료
[x] `webview-ui/src/components/account\StyledCreditDisplay.tsx` (하드코딩:1) ✅ 완료

### **Chat 관련 (33개) - 진행중**
[x] `webview-ui/src/components/chat\Announcement.tsx` (하드코딩:13) ✅ 완료
[x] `webview-ui/src/components/chat\auto-approve-menu\AutoApproveBar.tsx` (하드코딩:8) ✅ 완료
[x] `webview-ui/src/components/chat\auto-approve-menu\AutoApproveMenuItem.tsx` (하드코딩:7) ✅ 완료
[x] `webview-ui/src/components/chat\auto-approve-menu\AutoApproveModal.tsx` (하드코딩:19) ✅ 완료
[x] `webview-ui/src/components/chat\BrowserSessionRow.tsx` (하드코딩:54) ✅ 완료
[x] `webview-ui/src/components/chat\chat-view\components\layout\ActionButtons.tsx` (하드코딩:12) ✅ 완료
[x] `webview-ui/src/components/chat\chat-view\components\layout\ChatLayout.tsx` (하드코딩:2) ✅ 완료
[x] `webview-ui/src/components/chat\chat-view\components\layout\InputSection.tsx` (하드코딩:1) ✅ 완료
[x] `webview-ui/src/components/chat\chat-view\components\layout\MessagesArea.tsx` (하드코딩:2) ✅ 완료
[x] `webview-ui/src/components/chat\chat-view\components\layout\WelcomeSection.tsx` (하드코딩:5) ✅ 완료
[x] `webview-ui/src/components/chat\ChatErrorBoundary.tsx` (하드코딩:9) ✅ 완료
[x] `webview-ui/src/components/chat\ChatRow.tsx` (하드코딩:216) ✅ 완료
[x] `webview-ui/src/components/chat\ChatTextArea.tsx` (하드코딩:131) ✅ 완료
[x] `webview-ui/src/components/chat\ChatView.tsx` (하드코딩:15) ✅ 완료
[x] `webview-ui/src/components/chat\ContextMenu.tsx` (하드코딩:21) ✅ 완료
[x] `webview-ui/src/components/chat\CreditLimitError.tsx` (하드코딩:18) ✅ 완료
[x] `webview-ui/src/components/chat\ErrorBlockTitle.tsx` (하드코딩:13) ✅ 완료
[x] `webview-ui/src/components/chat\ErrorRow.test.tsx` (하드코딩:45) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/chat\ErrorRow.tsx` (하드코딩:14) ✅ 완료
[x] `webview-ui/src/components/chat\OptionsButtons.tsx` (하드코딩:10) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/chat\QuoteButton.tsx` (하드코딩:5) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/chat\QuotedMessagePreview.tsx` (하드코딩:4) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/chat\ReportBugPreview.tsx` (하드코딩:13) ✅ 완료
[x] `webview-ui/src/components/chat\ServersToggleModal.tsx` (하드코딩:12) ✅ 완료
[x] `webview-ui/src/components/chat\SlashCommandMenu.tsx` (하드코딩:10) ✅ 완료
[x] `webview-ui/src/components/chat\task-header\buttons\CopyTaskButton.tsx` (하드코딩:4) ✅ 완료
[x] `webview-ui/src/components/chat\task-header\buttons\DeleteTaskButton.tsx` (하드코딩:1) ✅ 완료
[x] `webview-ui/src/components/chat\task-header\buttons\OpenDiskTaskHistoryButton.tsx` (하드코딩:5) ✅ 완료
[x] `webview-ui/src/components/chat\task-header\TaskHeader.tsx` (하드코딩:77) ✅ 완료
[x] `webview-ui/src/components/chat\task-header\TaskTimeline.tsx` (하드코딩:23) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/chat\task-header\TaskTimelineTooltip.tsx` (하드코딩:52) ✅ 완료
[x] `webview-ui/src/components/chat\TaskFeedbackButtons.tsx` (하드코딩:16) ✅ 완료
[x] `webview-ui/src/components/chat\UserMessage.tsx` (하드코딩:17) ✅ 완료

### **Cline Rules 관련 (4개)**
[x] `webview-ui/src/components/cline-rules\ClineRulesToggleModal.tsx` (하드코딩:37) ✅ 완료
[x] `webview-ui/src/components/cline-rules\NewRuleRow.tsx` (하드코딩:24) ✅ 완료
[x] `webview-ui/src/components/cline-rules\RuleRow.tsx` (하드코딩:23) ✅ 완료
[x] `webview-ui/src/components/cline-rules\RulesToggleList.tsx` (하드코딩:4) ✅ 완료

### **Common 관련 (17개)**
[x] `webview-ui/src/components/common\AlertDialog.tsx` (하드코딩:8) ✅ 완료
[x] `webview-ui/src/components/common\ChecklistRenderer.tsx` (하드코딩:5) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/common\CheckmarkControl.tsx` (하드코딩:17) ✅ 완료
[x] `webview-ui/src/components/common\CheckpointControls.tsx` (하드코딩:8) ✅ 완료
[x] `webview-ui/src/components/common\CodeAccordian.tsx` (하드코딩:17) ✅ 완료
[x] `webview-ui/src/components/common\CodeBlock.tsx` (하드코딩:10) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/common\CopyButton.tsx` (하드코딩:11) ✅ 완료
[x] `webview-ui/src/components/common\DangerButton.tsx` (하드코딩:1) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/common\Demo.tsx` (하드코딩:38) ✅ 완료
[x] `webview-ui/src/components/common\HeroTooltip.tsx` (하드코딩:1) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/common\MarkdownBlock.tsx` (하드코딩:40) ✅ 완료
[x] `webview-ui/src/components/common\MermaidBlock.tsx` (하드코딩:31) ✅ 완료
[x] `webview-ui/src/components/common\SuccessButton.tsx` (하드코딩:1) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/common\Tab.tsx` (하드코딩:4) ✅ 완료 (i18n 적용 불필요)
[x] `webview-ui/src/components/common\TelemetryBanner.tsx` (하드코딩:4) ✅ 완료
[x] `webview-ui/src/components/common\Thumbnails.tsx` (하드코딩:10) ✅ 완료
[x] `webview-ui/src/components/common\Tooltip.tsx` (하드코딩:2) ✅ 완료 (i18n 적용 불필요)

### **History 관련 (2개)**
[x] `webview-ui/src/components/history\HistoryPreview.tsx` (하드코딩:24) ✅ 완료
[x] `webview-ui/src/components/history\HistoryView.tsx` (하드코딩:66) ✅ 완료

### **MCP 관련 (14개)**
[x] `webview-ui/src/components/mcp\chat-display\ImagePreview.tsx` (하드코딩:44) ✅ 완료
[x] `webview-ui/src/components/mcp\chat-display\LinkPreview.tsx` (하드코딩:48) ✅ 완료
[x] `webview-ui/src/components/mcp\chat-display\McpResponseDisplay.tsx` (하드코딩:24) ✅ 완료
[x] `webview-ui/src/components/mcp\configuration\McpConfigurationView.tsx` (하드코딩:16) ✅ 완료
[x] `webview-ui/src/components/mcp\configuration\tabs\add-server\AddLocalServerForm.tsx` (하드코딩:3) ✅ 완료
[x] `webview-ui/src/components/mcp\configuration\tabs\add-server\AddRemoteServerForm.tsx` (하드코딩:20) ✅ 완료
[x] `webview-ui/src/components/mcp\configuration\tabs\installed\InstalledServersView.tsx` (하드코딩:21) ✅ 완료
[x] `webview-ui/src/components/mcp\configuration\tabs\installed\server-row\McpResourceRow.tsx` (하드코딩:7) ✅ 완료
[x] `webview-ui/src/components/mcp\configuration\tabs\installed\server-row\McpToolRow.tsx` (하드코딩:17) ✅ 완료
[x] `webview-ui/src/components/mcp\configuration\tabs\installed\server-row\ServerRow.tsx` (하드코딩:68) ✅ 완료
[ ] `webview-ui/src/components/mcp\configuration\tabs\installed\ServersToggleList.tsx` (하드코딩:1)
[ ] `webview-ui/src/components/mcp\configuration\tabs\marketplace\McpMarketplaceCard.tsx` (하드코딩:33)
[ ] `webview-ui/src/components/mcp\configuration\tabs\marketplace\McpMarketplaceView.tsx` (하드코딩:35)
[ ] `webview-ui/src/components/mcp\configuration\tabs\marketplace\McpSubmitCard.tsx` (하드코딩:9)

### **Settings 관련 (64개)**
[ ] `webview-ui/src/components/settings\ApiOptions.tsx` (하드코딩:133)
[ ] `webview-ui/src/components/settings\BasetenModelPicker.tsx` (하드코딩:15)
[ ] `webview-ui/src/components/settings\ClineAccountInfoCard.tsx` (하드코딩:2)
[ ] `webview-ui/src/components/settings\common\ApiKeyField.tsx` (하드코딩:6)
[ ] `webview-ui/src/components/settings\common\BaseUrlField.tsx` (하드코딩:4)
[ ] `webview-ui/src/components/settings\common\ErrorMessage.tsx` (하드코딩:1)
[ ] `webview-ui/src/components/settings\common\ModelInfoView.tsx` (하드코딩:14)
[ ] `webview-ui/src/components/settings\common\ModelSelector.tsx` (하드코딩:5)
[ ] `webview-ui/src/components/settings\FeaturedModelCard.tsx` (하드코딩:2)
[ ] `webview-ui/src/components/settings\GroqModelPicker.tsx` (하드코딩:14)
[ ] `webview-ui/src/components/settings\HuggingFaceModelPicker.tsx` (하드코딩:10)
[ ] `webview-ui/src/components/settings\ModelDescriptionMarkdown.tsx` (하드코딩:4)
[ ] `webview-ui/src/components/settings\OllamaModelPicker.tsx` (하드코딩:13)
[ ] `webview-ui/src/components/settings\OpenRouterModelPicker.tsx` (하드코딩:51)
[ ] `webview-ui/src/components/settings\PreferredLanguageSetting.tsx` (하드코딩:20)
[ ] `webview-ui/src/components/settings\providers\AnthropicProvider.tsx` (하드코딩:12)
[ ] `webview-ui/src/components/settings\providers\AskSageProvider.tsx` (하드코딩:9)
[ ] `webview-ui/src/components/settings\providers\BasetenProvider.tsx` (하드코딩:2)
[ ] `webview-ui/src/components/settings\providers\BedrockProvider.tsx` (하드코딩:90)
[ ] `webview-ui/src/components/settings\providers\CerebrasProvider.tsx` (하드코딩:5)
[ ] `webview-ui/src/components/settings\providers\ClaudeCodeProvider.tsx` (하드코딩:11)
[ ] `webview-ui/src/components/settings\providers\ClineProvider.tsx` (하드코딩:15)
[ ] `webview-ui/src/components/settings\providers\DeepSeekProvider.tsx` (하드코딩:5)
[ ] `webview-ui/src/components/settings\providers\DifyProvider.tsx` (하드코딩:14)
[ ] `webview-ui/src/components/settings\providers\DoubaoProvider.tsx` (하드코딩:5)
[ ] `webview-ui/src/components/settings\providers\FireworksProvider.tsx` (하드코딩:4)
[x] `webview-ui/src/components/settings\providers\GeminiProvider.tsx` (하드코딩:9) ✅ 완료
[ ] `webview-ui/src/components/settings\providers\GroqProvider.tsx` (하드코딩:2)
[ ] `webview-ui/src/components/settings\providers\HuaweiCloudMaasProvider.tsx` (하드코딩:6)
[ ] `webview-ui/src/components/settings\providers\HuggingFaceProvider.tsx` (하드코딩:6)
[ ] `webview-ui/src/components/settings\providers\LiteLlmProvider.tsx` (하드코딩:47)
[ ] `webview-ui/src/components/settings\providers\LMStudioProvider.tsx` (하드코딩:20)
[ ] `webview-ui/src/components/settings\providers\MistralProvider.tsx` (하드코딩:5)
[ ] `webview-ui/src/components/settings\providers\MoonshotProvider.tsx` (하드코딩:5)
[ ] `webview-ui/src/components/settings\providers\NebiusProvider.tsx` (하드코딩:6)
[ ] `webview-ui/src/components/settings\providers\OllamaProvider.tsx` (하드코딩:28)
[ ] `webview-ui/src/components/settings\providers\OpenAICompatible.tsx` (하드코딩:56)
[ ] `webview-ui/src/components/settings\providers\OpenAINative.tsx` (하드코딩:5)
[ ] `webview-ui/src/components/settings\providers\OpenRouterProvider.tsx` (하드코딩:27)
[ ] `webview-ui/src/components/settings\providers\QwenCodeProvider.tsx` (하드코딩:16)
[ ] `webview-ui/src/components/settings\providers\QwenProvider.tsx` (하드코딩:6)
[ ] `webview-ui/src/components/settings\providers\RequestyProvider.tsx` (하드코딩:7)
[ ] `webview-ui/src/components/settings\providers\SambanovaProvider.tsx` (하드코딩:5)
[ ] `webview-ui/src/components/settings\providers\SapAiCoreProvider.tsx` (하드코딩:44)
[ ] `webview-ui/src/components/settings\providers\TogetherProvider.tsx` (하드코딩:9)
[ ] `webview-ui/src/components/settings\providers\VercelAIGatewayProvider.tsx` (하드코딩:17)
[ ] `webview-ui/src/components/settings\providers\VertexProvider.tsx` (하드코딩:24)
[ ] `webview-ui/src/components/settings\providers\VSCodeLmProvider.tsx` (하드코딩:9)
[ ] `webview-ui/src/components/settings\providers\XaiProvider.tsx` (하드코딩:21)
[ ] `webview-ui/src/components/settings\providers\ZAiProvider.tsx` (하드코딩:4)
[ ] `webview-ui/src/components/settings\RequestyModelPicker.tsx` (하드코딩:26)
[ ] `webview-ui/src/components/settings\SapAiCoreModelPicker.tsx` (하드코딩:6)
[x] `webview-ui/src/components/settings\Section.tsx` (하드코딩:1) ✅ 완료
[x] `webview-ui/src/components/settings\SectionHeader.tsx` (하드코딩:2) ✅ 완료
[x] `webview-ui/src/components/settings\sections\AboutSection.tsx` (하드코딩:3) ✅ 완료
[x] `webview-ui/src/components/settings\sections\ApiConfigurationSection.tsx` (하드코딩:7) ✅ 완료
[x] `webview-ui/src/components/settings\sections\BrowserSettingsSection.tsx` (하드코딩:49) ✅ 완료
[x] `webview-ui/src/components/settings\sections\DebugSection.tsx` (하드코딩:2) ✅ 완료
[x] `webview-ui/src/components/settings\sections\FeatureSettingsSection.tsx` (하드코딩:10) ✅ 완료
[x] `webview-ui/src/components/settings\sections\TerminalSettingsSection.tsx` (하드코딩:22) ✅ 완료
[x] `webview-ui/src/components/settings\SettingsView.tsx` (하드코딩:41) ✅ 완료
[x] `webview-ui/src/components/settings\TerminalOutputLineLimitSlider.tsx` (하드코딩:7) ✅ 완료
[x] `webview-ui/src/components/settings\ThinkingBudgetSlider.tsx` (하드코딩:8) ✅ 완료
[x] `webview-ui/src/components/settings\UseCustomPromptCheckbox.tsx` (하드코딩:3) ✅ 완료

### **Welcome 관련 (4개)**
[ ] `webview-ui/src/components/welcome\HomeHeader.tsx` (하드코딩:10)
[ ] `webview-ui/src/components/welcome\QuickWinCard.tsx` (하드코딩:3)
[ ] `webview-ui/src/components/welcome\SuggestedTasks.tsx` (하드코딩:4)
[ ] `webview-ui/src/components/welcome\WelcomeView.tsx` (하드코딩:11)

### **기타 (2개)**
[ ] `webview-ui/src/components/browser\BrowserSettingsMenu.tsx` (하드코딩:21)
[ ] `webview-ui/src/components/menu\Navbar.tsx` (하드코딩:17)

### **불필요한 파일들 (8개) - i18n 적용 불필요**
- `webview-ui/src/components/chat\chat-view\components\layout\TaskSection.tsx` (순수 로직/스타일링)
- `webview-ui/src/components/chat\chat-view\components\messages\MessageRenderer.tsx` (순수 로직/스타일링)
- `webview-ui/src/components/chat\NewTaskPreview.tsx` (순수 로직/스타일링)
- `webview-ui/src/components/common\SettingsButton.tsx` (순수 로직/스타일링)
- `webview-ui/src/components/common\VSCodeButtonLink.tsx` (순수 로직/스타일링)
- `webview-ui/src/components/mcp\chat-display\McpDisplayModeDropdown.tsx` (순수 로직/스타일링)
- `webview-ui/src/components/settings\common\DebouncedTextField.tsx` (순수 로직/스타일링)
- `webview-ui/src/components/settings\sections\GeneralSettingsSection.tsx` (순수 로직/스타일링)

### **작업 진행 방법**
1. 각 파일을 열어서 하드코딩된 텍스트를 확인
2. `import { t } from "@/caret/utils/i18n"` 추가
3. 하드코딩 텍스트를 `t("key", "namespace")` 형식으로 변환
4. 필요한 JSON 키를 locale 파일에 추가
5. 체크박스를 체크하여 진행상황 추적
