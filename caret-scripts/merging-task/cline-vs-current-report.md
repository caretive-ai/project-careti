# Cline 최신 vs 현재 머징 - 상세 분석 리포트

⚠️ **주의**: 이 결과를 맹신하지 마세요! 참고용 가이드입니다.

## 📊 전체 요약

- ❌ **누락된 항목**: 71개
- ✅ **추가된 항목**: 131개
- 📁 **누락된 파일**: 3개
- 📁 **추가된 파일**: 45개

## 📁 누락된 파일들

- `components\chat\__tests__\UserMessage.ime.test.tsx`
- `components\settings\__tests__\APIOptions.spec.tsx`
- `components\settings\__tests__\OllamaModelPicker.spec.tsx`

## 📁 추가된 파일들

- `assets\CaretLogoWhite.tsx`
- `caret\components\CaretAccountInfoCard.tsx`
- `caret\components\CaretAccountView.tsx`
- `caret\components\CaretAnnouncement.tsx`
- `caret\components\CaretApiSetup.tsx`
- `caret\components\CaretFooter.tsx`
- `caret\components\CaretUILanguageSetting.tsx`
- `caret\components\CaretWelcome.tsx`
- `caret\components\CaretWelcomeSection.tsx`
- `caret\components\PersonaAvatar.tsx`
- `caret\components\PersonaManagement.tsx`
- `caret\components\PersonaTemplateSelector.tsx`
- `caret\components\__tests__\CaretAccountInfoCard.test.tsx`
- `caret\components\__tests__\CaretAccountView.test.tsx`
- `caret\components\__tests__\CaretApiSetup.test.tsx`
- `caret\components\__tests__\CaretFooter.test.tsx`
- `caret\components\__tests__\CaretUILanguageSetting.test.tsx`
- `caret\components\__tests__\CaretWelcome.test.tsx`
- `caret\components\__tests__\CaretWelcomeSection.test.tsx`
- `caret\components\__tests__\PersonaAvatar-debug.test.tsx`
- `caret\components\__tests__\PersonaAvatar-integration.test.tsx`
- `caret\components\__tests__\PersonaAvatar-simple.test.tsx`
- `caret\components\__tests__\PersonaAvatar.test.tsx`
- `caret\components\__tests__\WelcomeView-simplified.test.tsx`
- `caret\constants\urls.ts`
- `caret\constants\__tests__\urls.test.ts`
- `caret\hooks\useCurrentLanguage.ts`
- `caret\hooks\__tests__\useCurrentLanguage.test.tsx`
- `caret\tests\generate-from-json-sections.test.ts`
- `caret\utils\i18n.ts`
- `caret\utils\webview-logger.ts`
- `caret\utils\__tests__\i18n.test.ts`
- `caret\utils\__tests__\webview-logger.test.ts`
- `components\settings\BasetenModelPicker.tsx`
- `components\settings\BrowserSettingsSection.tsx`
- `components\settings\FeatureSettingsSection.tsx`
- `components\settings\providers\BasetenProvider.tsx`
- `components\settings\TerminalSettingsSection.tsx`
- `components\welcome\__tests__\WelcomeView-language-improvements.test.tsx`
- `context\FirebaseAuthContext.tsx`
- `services\grpc-client.ts`
- `utils\cn.ts`
- `utils\__tests__\context-mentions.test.ts`
- `__tests__\App.test.tsx`
- `__tests__\components\ChatbotAgentModeSelector.test.tsx`

## 📋 파일별 상세 차이점

### 1. `components\settings\ApiOptions.tsx`

**요약**: ❌ 32개 누락, ✅ 16개 추가

#### ❌ 누락된 Import들
- `@vscode/webview-ui-toolkit/react`
- `@/components/settings/utils/providerUtils`
- `./providers/ClineProvider`
- `./providers/OpenRouterProvider`
- `./providers/MistralProvider`
- `./providers/DeepSeekProvider`
- `./providers/TogetherProvider`
- `./providers/OpenAICompatible`
- `./providers/SambanovaProvider`
- `./providers/AnthropicProvider`
- `./providers/AskSageProvider`
- `./providers/OpenAINative`
- `./providers/GeminiProvider`
- `./providers/DoubaoProvider`
- `./providers/QwenProvider`
- `./providers/VertexProvider`
- `./providers/RequestyProvider`
- `./providers/FireworksProvider`
- `./providers/XaiProvider`
- `./providers/CerebrasProvider`
- `./providers/OllamaProvider`
- `./providers/ClaudeCodeProvider`
- `./providers/SapAiCoreProvider`
- `./providers/BedrockProvider`
- `./providers/MoonshotProvider`
- `./providers/HuggingFaceProvider`
- `./providers/NebiusProvider`
- `./providers/LiteLlmProvider`
- `./providers/VSCodeLmProvider`
- `./providers/LMStudioProvider`
- `./providers/GroqProvider`
- `./providers/HuaweiCloudMaasProvider`

#### ✅ 추가된 Setter 함수들
- `setIsDescriptionExpanded`

#### ✅ 추가된 Import들
- `@/components/common/VSCodeButtonLink`
- `@/utils/vscode`
- `@/utils/vscStyles`
- `@shared/proto/cline/models`
- `@shared/proto-conversions/models/api-configuration-conversion`
- `./utils/providerUtils`
- `vscode`
- `../ui/hooks/useOpenRouterKeyInfo`
- `./ClineAccountInfoCard`
- `@/caret/utils/i18n`
- `./OllamaModelPicker`
- `./RequestyModelPicker`
- `./ThinkingBudgetSlider`
- `./utils/providerUtils`
- `@shared/ExtensionMessage`

---

### 2. `components\chat\ChatView.tsx`

**요약**: ❌ 13개 누락, ✅ 0개 추가

#### ❌ 누락된 Import들
- `@shared/array`
- `@shared/combineApiRequests`
- `@shared/combineCommandSequences`
- `@shared/ExtensionMessage`
- `@shared/getApiMetrics`
- `@shared/proto/cline/common`
- `react`
- `react-use`
- `@/components/settings/utils/providerUtils`
- `@/context/ExtensionStateContext`
- `@/services/grpc-client`
- `../menu/Navbar`
- `./auto-approve-menu/AutoApproveBar`

---

### 3. `components\settings\SettingsView.tsx`

**요약**: ❌ 7개 누락, ✅ 14개 추가

#### ❌ 누락된 Import들
- `./sections/FeatureSettingsSection`
- `./sections/TerminalSettingsSection`
- `./sections/ApiConfigurationSection`
- `./sections/GeneralSettingsSection`
- `./sections/BrowserSettingsSection`
- `./sections/DebugSection`
- `./sections/AboutSection`

#### ✅ 추가된 Import들
- `@shared/proto/cline/common`
- `../mcp/configuration/McpConfigurationView`
- `./ApiOptions`
- `./BrowserSettingsSection`
- `./FeatureSettingsSection`
- `./Section`
- `./TerminalSettingsSection`
- `@shared/proto-conversions/state/settings-conversion`
- `@shared/proto-conversions/state/chat-settings-conversion`
- `@/caret/utils/webview-logger`
- `@/caret/utils/i18n`
- `@/caret/hooks/useCurrentLanguage`
- `styled-components`
- `@/caret/components/CaretFooter`

---

### 4. `components\welcome\WelcomeView.tsx`

**요약**: ❌ 4개 누락, ✅ 12개 추가

#### ❌ 누락된 Import들
- `@/utils/validate`
- `@/components/settings/ApiOptions`
- `@/assets/ClineLogoWhite`
- `@shared/proto/cline/common`

#### ✅ 추가된 Import들
- `@utils/validate`
- `@utils/vscode`
- `@/caret/components/CaretWelcomeSection`
- `@/caret/components/CaretApiSetup`
- `@shared/proto/cline/models`
- `@shared/proto-conversions/models/api-configuration-conversion`
- `@/caret/components/CaretFooter`
- `@/caret/utils/i18n`
- `@/caret/hooks/useCurrentLanguage`
- `@/caret/constants/urls`
- `@/components/settings/PreferredLanguageSetting`
- `@/caret/components/CaretUILanguageSetting`

---

### 5. `components\chat\Announcement.tsx`

**요약**: ❌ 3개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@vscode/webview-ui-toolkit/react`
- `@/utils/vscStyles`
- `@heroui/react`

#### ✅ 추가된 Import들
- `@/caret/components/CaretAnnouncement`

---

### 6. `components\chat\ChatRow.tsx`

**요약**: ❌ 2개 누락, ✅ 3개 추가

#### ❌ 누락된 Import들
- `./ErrorRow`
- `./ErrorBlockTitle`

#### ✅ 추가된 Import들
- `@/components/chat/CreditLimitError`
- `@/components/common/Thumbnails`
- `@/utils/vscode`

---

### 7. `components\settings\OpenRouterModelPicker.tsx`

**요약**: ❌ 2개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `./utils/useApiConfigurationHandlers`
- `@shared/storage/types`

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 8. `components\settings\PreferredLanguageSetting.tsx`

**요약**: ❌ 2개 누락, ✅ 4개 추가

#### ❌ 누락된 Import들
- `@/context/ExtensionStateContext`
- `./utils/settingsHandlers`

#### ✅ 추가된 Setter 함수들
- `setChatSettings`

#### ✅ 추가된 Import들
- `@shared/ChatSettings`
- `@/caret/utils/i18n`
- `@/caret/hooks/useCurrentLanguage`

---

### 9. `components\chat\task-header\TaskTimelineTooltip.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `./util`

#### ✅ 추가된 Import들
- `../../../caret/utils/i18n`

---

### 10. `components\settings\ClineAccountInfoCard.tsx`

**요약**: ❌ 1개 누락, ✅ 2개 추가

#### ❌ 누락된 Import들
- `@shared/proto/cline/common`

#### ✅ 추가된 Import들
- `@shared/proto/common`
- `@/caret/components/CaretAccountInfoCard`

---

### 11. `components\settings\sections\TerminalSettingsSection.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `@shared/proto/index.cline`

#### ✅ 추가된 Import들
- `@shared/proto/cline/index`

---

### 12. `components\settings\TerminalOutputLineLimitSlider.tsx`

**요약**: ❌ 1개 누락, ✅ 1개 추가

#### ❌ 누락된 Import들
- `./utils/settingsHandlers`

#### ✅ 추가된 Import들
- `../../caret/utils/i18n`

---

### 13. `components\welcome\HomeHeader.tsx`

**요약**: ❌ 1개 누락, ✅ 3개 추가

#### ❌ 누락된 Import들
- `@/assets/ClineLogoVariable`

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`
- `react`
- `@/caret/components/PersonaAvatar`

---

### 14. `utils\context-mentions.ts`

**요약**: ❌ 1개 누락, ✅ 0개 추가

#### ❌ 누락된 Import들
- `path`

---

### 15. `App.tsx`

**요약**: ❌ 0개 누락, ✅ 3개 추가

#### ✅ 추가된 Import들
- `@shared/webview/types`
- `./caret/utils/i18n`
- `./caret/constants/urls`

---

### 16. `components\account\AccountView.tsx`

**요약**: ❌ 0개 누락, ✅ 2개 추가

#### ✅ 추가된 Import들
- `@/caret/components/CaretAccountView`
- `@/caret/utils/i18n`

---

### 17. `components\chat\auto-approve-menu\AutoApproveBar.tsx`

**요약**: ❌ 0개 누락, ✅ 2개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`
- `./types`

---

### 18. `components\chat\auto-approve-menu\AutoApproveMenuItem.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 19. `components\chat\BrowserSessionRow.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 20. `components\chat\ChatTextArea.tsx`

**요약**: ❌ 0개 누락, ✅ 5개 추가

#### ✅ 추가된 Import들
- `@shared/ChatSettings`
- `@shared/ExtensionMessage`
- `@/utils/vscode`
- `@/caret/utils/i18n`
- `@/caret/hooks/useCurrentLanguage`

---

### 21. `components\chat\ServersToggleModal.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 22. `components\cline-rules\ClineRulesToggleModal.tsx`

**요약**: ❌ 0개 누락, ✅ 3개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/webview-logger`
- `@/caret/utils/i18n`
- `@/caret/components/PersonaManagement`

---

### 23. `components\common\AlertDialog.tsx`

**요약**: ❌ 0개 누락, ✅ 2개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`
- `@/caret/hooks/useCurrentLanguage`

---

### 24. `components\common\MarkdownBlock.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `remark-math`

---

### 25. `components\common\TelemetryBanner.tsx`

**요약**: ❌ 0개 누락, ✅ 3개 추가

#### ✅ 추가된 Import들
- `@/utils/vscode`
- `@shared/TelemetrySetting`
- `@/caret/utils/i18n`

---

### 26. `components\history\HistoryPreview.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 27. `components\history\HistoryView.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 28. `components\mcp\configuration\McpConfigurationView.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 29. `components\mcp\configuration\tabs\installed\InstalledServersView.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 30. `components\mcp\configuration\tabs\installed\server-row\McpToolRow.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 31. `components\mcp\configuration\tabs\installed\server-row\ServerRow.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 32. `components\mcp\configuration\tabs\installed\ServersToggleList.tsx`

**요약**: ❌ 0개 누락, ✅ 3개 추가

#### ✅ 추가된 Import들
- `react`
- `styled-components`
- `@/caret/utils/i18n`

---

### 33. `components\mcp\configuration\tabs\marketplace\McpMarketplaceView.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 34. `components\settings\RequestyModelPicker.tsx`

**요약**: ❌ 0개 누락, ✅ 1개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`

---

### 35. `context\ExtensionStateContext.tsx`

**요약**: ❌ 0개 누락, ✅ 35개 추가

#### ✅ 추가된 Setter 함수들
- `setPlanActSeparateModelsSetting`
- `setEnableCheckpointsSetting`
- `setMcpMarketplaceEnabled`
- `setMcpRichDisplayEnabled`
- `setMcpResponsesCollapsed`
- `setShellIntegrationTimeout`
- `setTerminalReuseEnabled`
- `setTerminalOutputLineLimit`
- `setDefaultTerminalProfile`
- `setChatSettings`
- `setUILanguage`
- `setModeSystem`
- `setBasetenModels`
- `setLocalCaretRulesToggles`
- `setBasetenModels`
- `setChatSettings`

#### ✅ 추가된 Import들
- `react-use`

#### ✅ 추가된 Properties
- `basetenModels`
- `caretBanner`
- `personaProfile`
- `personaThinking`
- `setPlanActSeparateModelsSetting`
- `setEnableCheckpointsSetting`
- `setMcpMarketplaceEnabled`
- `setMcpRichDisplayEnabled`
- `setMcpResponsesCollapsed`
- `setShellIntegrationTimeout`
- `setTerminalReuseEnabled`
- `setTerminalOutputLineLimit`
- `setDefaultTerminalProfile`
- `setChatSettings`
- `setUILanguage`
- `setModeSystem`
- `setBasetenModels`
- `setLocalCaretRulesToggles`

---

### 36. `utils\validate.ts`

**요약**: ❌ 0개 누락, ✅ 2개 추가

#### ✅ 추가된 Import들
- `@/caret/utils/i18n`
- `@/caret/constants/urls`

---

## 💡 검토 가이드

1. **❌ 누락된 항목들**을 우선순위별로 검토
2. **Caret 고유 기능** (setUILanguage, setModeSystem 등) 최우선 보호
3. **삭제가 의도된 것인지** vs **실수로 누락된 것인지** 판단
4. **필요한 기능은 수동으로 복구**
5. **빌드 테스트**로 검증: `npm run build`

