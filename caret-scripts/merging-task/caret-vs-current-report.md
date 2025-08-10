# Caret 원본 vs 현재 머징 - 상세 분석 리포트

⚠️ **주의**: 이 결과를 맹신하지 마세요! 참고용 가이드입니다.

## 📊 전체 요약

- ❌ **누락된 항목**: 130개
- ✅ **추가된 항목**: 129개
- 📁 **누락된 파일**: 0개
- 📁 **추가된 파일**: 87개

## 📁 추가된 파일들

- `components\account\AccountWelcomeView.tsx`
- `components\account\CreditBalance.tsx`
- `components\account\helpers.ts`
- `components\account\StyledCreditDisplay.tsx`
- `components\chat\chat-view\components\layout\ActionButtons.tsx`
- `components\chat\chat-view\components\layout\ChatLayout.tsx`
- `components\chat\chat-view\components\layout\index.ts`
- `components\chat\chat-view\components\layout\InputSection.tsx`
- `components\chat\chat-view\components\layout\MessagesArea.tsx`
- `components\chat\chat-view\components\layout\TaskSection.tsx`
- `components\chat\chat-view\components\layout\WelcomeSection.tsx`
- `components\chat\chat-view\components\messages\index.ts`
- `components\chat\chat-view\components\messages\MessageRenderer.tsx`
- `components\chat\chat-view\components\messages\StreamingIndicator.tsx`
- `components\chat\chat-view\constants.ts`
- `components\chat\chat-view\hooks\index.ts`
- `components\chat\chat-view\hooks\useButtonState.ts`
- `components\chat\chat-view\hooks\useChatState.ts`
- `components\chat\chat-view\hooks\useMessageHandlers.ts`
- `components\chat\chat-view\hooks\useScrollBehavior.ts`
- `components\chat\chat-view\index.ts`
- `components\chat\chat-view\types\chatTypes.ts`
- `components\chat\chat-view\utils\markdownUtils.ts`
- `components\chat\chat-view\utils\messageUtils.ts`
- `components\chat\chat-view\utils\scrollUtils.ts`
- `components\chat\ErrorBlockTitle.tsx`
- `components\chat\ErrorRow.test.tsx`
- `components\chat\ErrorRow.tsx`
- `components\chat\task-header\util.ts`
- `components\chat\__tests__\ErrorBlockTitle.spec.tsx`
- `components\mcp\chat-display\McpDisplayModeDropdown.tsx`
- `components\menu\Navbar.tsx`
- `components\settings\BasetenModelPicker.tsx`
- `components\settings\common\ApiKeyField.tsx`
- `components\settings\common\BaseUrlField.tsx`
- `components\settings\common\DebouncedTextField.tsx`
- `components\settings\common\ErrorMessage.tsx`
- `components\settings\common\ModelInfoView.tsx`
- `components\settings\common\ModelSelector.tsx`
- `components\settings\GroqModelPicker.tsx`
- `components\settings\HuggingFaceModelPicker.tsx`
- `components\settings\providers\AnthropicProvider.tsx`
- `components\settings\providers\AskSageProvider.tsx`
- `components\settings\providers\BasetenProvider.tsx`
- `components\settings\providers\BedrockProvider.tsx`
- `components\settings\providers\CerebrasProvider.tsx`
- `components\settings\providers\ClaudeCodeProvider.tsx`
- `components\settings\providers\ClineProvider.tsx`
- `components\settings\providers\DeepSeekProvider.tsx`
- `components\settings\providers\DoubaoProvider.tsx`
- `components\settings\providers\FireworksProvider.tsx`
- `components\settings\providers\GeminiProvider.tsx`
- `components\settings\providers\GroqProvider.tsx`
- `components\settings\providers\HuaweiCloudMaasProvider.tsx`
- `components\settings\providers\HuggingFaceProvider.tsx`
- `components\settings\providers\LiteLlmProvider.tsx`
- `components\settings\providers\LMStudioProvider.tsx`
- `components\settings\providers\MistralProvider.tsx`
- `components\settings\providers\MoonshotProvider.tsx`
- `components\settings\providers\NebiusProvider.tsx`
- `components\settings\providers\OllamaProvider.tsx`
- `components\settings\providers\OpenAICompatible.tsx`
- `components\settings\providers\OpenAINative.tsx`
- `components\settings\providers\OpenRouterProvider.tsx`
- `components\settings\providers\QwenProvider.tsx`
- `components\settings\providers\RequestyProvider.tsx`
- `components\settings\providers\SambanovaProvider.tsx`
- `components\settings\providers\SapAiCoreProvider.tsx`
- `components\settings\providers\TogetherProvider.tsx`
- `components\settings\providers\VertexProvider.tsx`
- `components\settings\providers\VSCodeLmProvider.tsx`
- `components\settings\providers\XaiProvider.tsx`
- `components\settings\sections\AboutSection.tsx`
- `components\settings\sections\ApiConfigurationSection.tsx`
- `components\settings\sections\BrowserSettingsSection.tsx`
- `components\settings\sections\DebugSection.tsx`
- `components\settings\sections\FeatureSettingsSection.tsx`
- `components\settings\sections\GeneralSettingsSection.tsx`
- `components\settings\sections\TerminalSettingsSection.tsx`
- `components\settings\utils\pricingUtils.ts`
- `components\settings\utils\providerUtils.ts`
- `components\settings\utils\settingsHandlers.ts`
- `components\settings\utils\useApiConfigurationHandlers.ts`
- `components\settings\utils\useDebouncedInput.ts`
- `context\ClineAuthContext.tsx`
- `services\grpc-client.ts`
- `utils\__tests__\context-mentions.test.ts`

## 📋 파일별 상세 차이점

### 1. `components\chat\ChatView.tsx`

**요약**: ❌ 32개 누락, ✅ 0개 추가

#### ❌ 누락된 Import들
- `@vscode/webview-ui-toolkit/react`
- `debounce`
- `react`
- `react-use`
- `react-virtuoso`
- `styled-components`
- `@shared/array`
- `@shared/combineApiRequests`
- `@shared/combineCommandSequences`
- `@shared/getApiMetrics`
- `@/context/ExtensionStateContext`
- `@/utils/vscode`
- `@/services/grpc-client`
- `@/components/history/HistoryPreview`
- `@/components/settings/ApiOptions`
- `@/components/chat/Announcement`
- `@/components/chat/BrowserSessionRow`
- `@/components/chat/ChatRow`
- `@/components/chat/ChatTextArea`
- `@/components/chat/QuotedMessagePreview`
- `@/components/chat/task-header/TaskHeader`
- `@/components/common/TelemetryBanner`
- `unified`
- `remark-stringify`
- `rehype-remark`
- `rehype-parse`
- `../welcome/HomeHeader`
- `./auto-approve-menu/AutoApproveBar`
- `../welcome/SuggestedTasks`
- `@shared/proto/common`
- `@shared/proto/task`
- `@/caret/utils/i18n`

---

### 2. `context\ExtensionStateContext.tsx`

**요약**: ❌ 15개 누락, ✅ 23개 추가

#### ❌ 누락된 Setter 함수들
- `setApiConfiguration`
- `setTelemetrySetting`
- `setAvailableTerminalProfiles`
- `setApiConfiguration`
- `setTelemetrySetting`

#### ❌ 누락된 Import들
- `@shared/proto/common`
- `@shared/proto/state`
- `@shared/proto/ui`
- `@shared/proto/state`
- `@shared/ChatSettings`
- `@shared/TelemetrySetting`
- `@shared/proto/models`

#### ❌ 누락된 Properties
- `setApiConfiguration`
- `setTelemetrySetting`
- `setAvailableTerminalProfiles`

#### ✅ 추가된 Setter 함수들
- `setRequestyModels`
- `setGroqModels`
- `setBasetenModels`
- `setHuggingFaceModels`
- `setUserInfo`
- `setRequestyModels`
- `setGroqModels`
- `setBasetenModels`
- `setHuggingFaceModels`

#### ✅ 추가된 Import들
- `@shared/McpDisplayMode`
- `@shared/proto/cline/account`
- `@shared/proto/cline/common`
- `@shared/proto/cline/models`
- `@shared/proto/cline/state`
- `@shared/proto/cline/ui`

#### ✅ 추가된 Properties
- `groqModels`
- `basetenModels`
- `huggingFaceModels`
- `setRequestyModels`
- `setGroqModels`
- `setBasetenModels`
- `setHuggingFaceModels`
- `setUserInfo`

---

### 3. `components\account\AccountView.tsx`

**요약**: ❌ 6개 누락, ✅ 9개 추가

#### ❌ 누락된 Import들
- `@/context/FirebaseAuthContext`
- `@/utils/vscode`
- `../../assets/ClineLogoWhite`
- `react-countup`
- `@/context/ExtensionStateContext`
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/account`
- `@shared/proto/cline/common`
- `fast-deep-equal`
- `react-use`
- `@/context/ClineAuthContext`
- `@/caret/utils/i18n`
- `./AccountWelcomeView`
- `./CreditBalance`
- `./helpers`

---

### 4. `components\settings\SettingsView.tsx`

**요약**: ❌ 6개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@/components/common/AlertDialog`
- `@/utils/cn`
- `@/utils/validate`
- `@/utils/vscode`
- `@shared/proto/common`
- `@shared/proto/state`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`
- `@shared/proto/cline/state`

---

### 5. `components\chat\ChatTextArea.tsx`

**요약**: ❌ 5개 누락, ✅ 8개 추가

#### ❌ 누락된 Import들
- `@/components/chat/ChatView`
- `@shared/proto/common`
- `@shared/proto/file`
- `@shared/proto/models`
- `@shared/proto/state`

#### ✅ 추가된 Import들
- `@shared/storage/types`
- `@shared/proto/cline/common`
- `@shared/proto/cline/file`
- `@shared/proto/cline/models`
- `@shared/proto/cline/state`
- `@/components/chat/chat-view/constants`
- `@/components/settings/utils/providerUtils`
- `@shared/proto/cline/state`

---

### 6. `components\mcp\configuration\McpConfigurationView.tsx`

**요약**: ❌ 3개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@/utils/vscode`
- `@shared/proto/common`
- `@shared/proto/mcp`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`
- `@shared/proto/cline/mcp`

---

### 7. `components\settings\RequestyModelPicker.tsx`

**요약**: ❌ 3개 누락, ✅ 6개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`
- `../../../../src/shared/api`
- `./ApiOptions`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`
- `@shared/api`
- `@shared/storage/types`
- `./common/ModelInfoView`
- `./utils/providerUtils`
- `./utils/useApiConfigurationHandlers`

---

### 8. `components\chat\ChatRow.tsx`

**요약**: ❌ 2개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`
- `../../caret/components/PersonaAvatar`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 9. `components\chat\ServersToggleModal.tsx`

**요약**: ❌ 2개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@shared/proto/mcp`
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/mcp`
- `@shared/proto/cline/common`

---

### 10. `components\chat\task-header\TaskHeader.tsx`

**요약**: ❌ 2개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@/components/settings/ApiOptions`
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@/components/settings/utils/providerUtils`
- `@shared/proto/cline/common`

---

### 11. `components\common\CheckmarkControl.tsx`

**요약**: ❌ 2개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@shared/proto/checkpoints`
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/checkpoints`
- `@shared/proto/cline/common`

---

### 12. `components\common\CheckpointControls.tsx`

**요약**: ❌ 2개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@shared/proto/checkpoints`
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/checkpoints`
- `@shared/proto/cline/common`

---

### 13. `components\common\MarkdownBlock.tsx`

**요약**: ❌ 2개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `rehype-katex`
- `@shared/proto/state`

#### ✅ 추가된 Import들
- `@shared/proto/cline/state`

---

### 14. `components\history\HistoryView.tsx`

**요약**: ❌ 2개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`
- `@shared/proto/task`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`
- `@shared/proto/cline/task`

---

### 15. `components\mcp\configuration\tabs\add-server\AddRemoteServerForm.tsx`

**요약**: ❌ 2개 누락, ✅ 3개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`
- `@shared/proto/mcp`

#### ✅ 추가된 Import들
- `@shared/proto/cline/mcp`
- `@shared/proto/cline/common`
- `@shared/proto/cline/mcp`

---

### 16. `components\mcp\configuration\tabs\installed\server-row\ServerRow.tsx`

**요약**: ❌ 2개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`
- `@shared/proto/mcp`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 17. `components\mcp\configuration\tabs\marketplace\McpMarketplaceCard.tsx`

**요약**: ❌ 2개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`
- `react-use`

#### ✅ 추가된 Setter 함수들
- `setError`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 18. `components\settings\ApiOptions.tsx`

**요약**: ❌ 2개 누락, ✅ 6개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`
- `@shared/proto/models`

#### ✅ 추가된 Import들
- `@shared/storage/types`
- `@shared/proto/cline/common`
- `@shared/proto/cline/models`
- `./utils/providerUtils`
- `./utils/useApiConfigurationHandlers`
- `./utils/providerUtils`

---

### 19. `components\settings\BrowserSettingsSection.tsx`

**요약**: ❌ 2개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@shared/proto/browser`
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/browser`
- `@shared/proto/cline/common`

---

### 20. `components\settings\OpenRouterModelPicker.tsx`

**요약**: ❌ 2개 누락, ✅ 3개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`
- `./ApiOptions`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`
- `./common/ModelInfoView`
- `./utils/providerUtils`

---

### 21. `context\FirebaseAuthContext.tsx`

**요약**: ❌ 2개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@/services/grpc-client`
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `../services/grpc-client`
- `@shared/proto/cline/common`

---

### 22. `App.tsx`

**요약**: ❌ 1개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`
- `./context/ClineAuthContext`

---

### 23. `caret\components\CaretAccountInfoCard.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 24. `caret\components\CaretAccountView.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 25. `components\account\AccountOptions.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 26. `components\browser\BrowserSettingsMenu.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 27. `components\chat\BrowserSessionRow.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 28. `components\chat\CreditLimitError.tsx`

**요약**: ❌ 1개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@shared/proto/task`

#### ✅ 추가된 Import들
- `@shared/proto/cline/task`
- `@/context/ExtensionStateContext`

---

### 29. `components\chat\OptionsButtons.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/task`

#### ✅ 추가된 Import들
- `@shared/proto/cline/task`

---

### 30. `components\chat\task-header\buttons\DeleteTaskButton.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 31. `components\chat\task-header\buttons\OpenDiskTaskHistoryButton.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 32. `components\chat\TaskFeedbackButtons.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 33. `components\chat\UserMessage.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/checkpoints`

#### ✅ 추가된 Import들
- `@shared/proto/cline/checkpoints`

---

### 34. `components\cline-rules\ClineRulesToggleModal.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 35. `components\cline-rules\RuleRow.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 36. `components\common\AlertDialog.tsx`

**요약**: ❌ 1개 누락, ✅ 0개 추가

#### ❌ 누락된 Import들
- `@/utils/cn`

---

### 37. `components\common\MermaidBlock.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 38. `components\common\Tab.tsx`

**요약**: ❌ 1개 누락, ✅ 0개 추가

#### ❌ 누락된 Import들
- `@/utils/cn`

---

### 39. `components\common\Thumbnails.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 40. `components\history\HistoryPreview.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 41. `components\mcp\chat-display\ImagePreview.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 42. `components\mcp\chat-display\LinkPreview.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 43. `components\mcp\chat-display\utils\mcpRichUtil.ts`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 44. `components\mcp\configuration\tabs\add-server\AddLocalServerForm.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 45. `components\mcp\configuration\tabs\installed\InstalledServersView.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 46. `components\mcp\configuration\tabs\installed\server-row\McpToolRow.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/mcp`

#### ✅ 추가된 Import들
- `@shared/proto/cline/mcp`

---

### 47. `components\settings\ClineAccountInfoCard.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@/context/FirebaseAuthContext`

#### ✅ 추가된 Import들
- `@/context/ClineAuthContext`

---

### 48. `components\settings\Section.tsx`

**요약**: ❌ 1개 누락, ✅ 0개 추가

#### ❌ 누락된 Import들
- `@/utils/cn`

---

### 49. `components\settings\SectionHeader.tsx`

**요약**: ❌ 1개 누락, ✅ 0개 추가

#### ❌ 누락된 Import들
- `@/utils/cn`

---

### 50. `components\settings\TerminalSettingsSection.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/common`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`

---

### 51. `components\settings\ThinkingBudgetSlider.tsx`

**요약**: ❌ 1개 누락, ✅ 4개 추가

#### ❌ 누락된 Setter 함수들
- `setApiConfiguration`

#### ✅ 추가된 Import들
- `@/context/ExtensionStateContext`
- `./utils/useApiConfigurationHandlers`
- `./utils/providerUtils`
- `@shared/storage/types`

---

### 52. `components\welcome\SuggestedTasks.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/task`

#### ✅ 추가된 Import들
- `@shared/proto/cline/task`

---

### 53. `components\welcome\WelcomeView.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/models`

#### ✅ 추가된 Import들
- `@shared/proto/cline/models`

---

### 54. `caret\components\CaretApiSetup.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/components/settings/utils/providerUtils`

---

### 55. `components\chat\task-header\TaskTimeline.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `./util`

---

### 56. `components\common\TelemetryBanner.tsx`

**요약**: ❌ 0개 누락, ✅ 2개 추가

#### ✅ 추가된 Import들
- `@/services/grpc-client`
- `@shared/proto/cline/state`

---

### 57. `components\mcp\chat-display\McpResponseDisplay.tsx`

**요약**: ❌ 0개 누락, ✅ 6개 추가

#### ✅ 추가된 Import들
- `@vscode/webview-ui-toolkit/react`
- `@/components/common/MarkdownBlock`
- `./McpDisplayModeDropdown`
- `@/components/settings/ApiOptions`
- `@/components/settings/utils/settingsHandlers`
- `@shared/McpDisplayMode`

---

### 58. `components\mcp\configuration\tabs\marketplace\McpMarketplaceView.tsx`

**요약**: ❌ 0개 누락, ✅ 2개 추가

#### ✅ 추가된 Import들
- `@/services/grpc-client`
- `@shared/proto/cline/common`

---

### 59. `Providers.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `./context/ClineAuthContext`

---

### 60. `utils\validate.ts`

**요약**: ❌ 0개 누락, ✅ 2개 추가

#### ✅ 추가된 Import들
- `@shared/storage/types`
- `@/components/settings/utils/providerUtils`

---

## 💡 검토 가이드

1. **❌ 누락된 항목들**을 우선순위별로 검토
2. **Caret 고유 기능** (setUILanguage, setModeSystem 등) 최우선 보호
3. **삭제가 의도된 것인지** vs **실수로 누락된 것인지** 판단
4. **필요한 기능은 수동으로 복구**
5. **빌드 테스트**로 검증: `npm run build`

