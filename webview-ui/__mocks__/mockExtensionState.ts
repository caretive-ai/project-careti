import { CaretExtensionState } from '../src/contexts/ExtensionStateContext';
import { McpDisplayMode, DEFAULT_MCP_DISPLAY_MODE } from '../../src/shared/McpDisplayMode';
import { Mode } from '../../src/shared/storage/types';
import { DEFAULT_AUTO_APPROVAL_SETTINGS } from '../../src/shared/AutoApprovalSettings';
import { DEFAULT_BROWSER_SETTINGS } from '../../src/shared/BrowserSettings';
import { DEFAULT_FOCUS_CHAIN_SETTINGS } from '../../src/shared/FocusChainSettings';

export const mockExtensionState: CaretExtensionState = {
  isNewUser: false,
  welcomeViewCompleted: true,
  autoApprovalSettings: DEFAULT_AUTO_APPROVAL_SETTINGS,
  browserSettings: DEFAULT_BROWSER_SETTINGS,
  mode: "act",
  mcpDisplayMode: DEFAULT_MCP_DISPLAY_MODE,
  planActSeparateModelsSetting: false,
  platform: 'win32',
  shouldShowAnnouncement: false,
  taskHistory: [],
  telemetrySetting: "disabled",
  shellIntegrationTimeout: 5000,
  terminalOutputLineLimit: 2000,
  version: 'test-version',
  distinctId: 'test-distinct-id',
  globalClineRulesToggles: {},
  localClineRulesToggles: {},
  localCaretRulesToggles: {},
  localWorkflowToggles: {},
  globalWorkflowToggles: {},
  localCursorRulesToggles: {},
  localWindsurfRulesToggles: {},
  focusChainSettings: DEFAULT_FOCUS_CHAIN_SETTINGS,
  promptSystemMode: 'cline', // Default value for testing
  clineMessages: [],
};
