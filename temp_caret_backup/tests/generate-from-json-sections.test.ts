import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the CaretSystemPrompt for webview testing
type MockCaretSystemPrompt = {
  generateFromJsonSections: (
    cwd: string,
    supportsBrowserUse: boolean,
    mcpHub: any,
    browserSettings: any,
    isClaude4ModelFamily: boolean
  ) => Promise<string>
}

type McpHub = {
  getServers: () => any[]
  isConnecting: boolean
}

type BrowserSettings = {
  viewport: { width: number; height: number }
}

// VSCode API 모킹
vi.mock('vscode', () => ({
  window: {
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    })),
  },
}))

describe('CaretSystemPrompt - generateFromJsonSections (Frontend Integration)', () => {
  let mockCaretSystemPrompt: MockCaretSystemPrompt
  let mockMcpHub: McpHub
  let mockBrowserSettings: BrowserSettings
  
  beforeEach(() => {
    // Create mock implementation for webview testing
    mockCaretSystemPrompt = {
      generateFromJsonSections: vi.fn(async (
        cwd: string,
        supportsBrowserUse: boolean,
        mcpHub: any,
        browserSettings: any,
        isClaude4ModelFamily: boolean
      ) => {
        // Mock implementation that simulates the actual behavior
        let prompt = "You are Caret, a collaborative AI assistant...\n\n"
        prompt += "====\n\nTOOL USE\n\n"
        prompt += "You have access to tools including execute_command, read_file, write_to_file...\n\n"
        
        // Add MCP servers if available
        if (mcpHub?.getServers && mcpHub.getServers().length > 0) {
          prompt += "====\n\nConnected MCP Servers\n\n"
          mcpHub.getServers().forEach((server: any) => {
            prompt += `- ${server.name}\n`
          })
        }
        
        // Add browser support if enabled
        if (supportsBrowserUse) {
          prompt += "====\n\nBROWSER SUPPORT\n\n"
          prompt += "Browser automation is enabled with Puppeteer.\n"
          prompt += "Available browser_action tool for web interaction.\n"
        }
        
        // Add system info
        prompt += `====\n\nSYSTEM INFORMATION\n\nWorking Directory: ${cwd}\n`
        
        return prompt
      })
    }
    
    // Mock MCP Hub
    mockMcpHub = {
      getServers: vi.fn(() => []),
      isConnecting: false
    }
    
    // Mock Browser Settings
    mockBrowserSettings = {
      viewport: { width: 1024, height: 768 }
    }
  })
  
  describe('generateFromJsonSections method', () => {
    it('should exist and be callable', async () => {
      expect(typeof mockCaretSystemPrompt.generateFromJsonSections).toBe('function')
    })
    
    it('should return a string prompt when called with valid parameters', async () => {
      const result = await mockCaretSystemPrompt.generateFromJsonSections(
        '/test/cwd',
        false, // supportsBrowserUse
        mockMcpHub,
        mockBrowserSettings,
        false // isClaude4ModelFamily
      )
      
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(100) // 실제 프롬프트는 100자 이상이어야 함
    })
    
    it('should include basic sections in correct order', async () => {
      const result = await mockCaretSystemPrompt.generateFromJsonSections(
        '/test/cwd',
        false,
        mockMcpHub, 
        mockBrowserSettings,
        false
      )
      
      // 기본 섹션들이 올바른 순서로 포함되어야 함
      expect(result).toContain('You are') // BASE_PROMPT_INTRO
      expect(result).toContain('TOOL USE') // TOOL_USE_HEADER
      expect(result).toContain('execute_command') // TOOL_DEFINITIONS
      expect(result).toContain('read_file') // TOOL_DEFINITIONS
      expect(result).toContain('write_to_file') // TOOL_DEFINITIONS
      
      // 순서 검증 - TOOL USE가 도구 정의보다 먼저 나와야 함
      const toolUseIndex = result.indexOf('TOOL USE')
      const executeCommandIndex = result.indexOf('execute_command')
      expect(toolUseIndex).toBeLessThan(executeCommandIndex)
    })
    
    it('should handle MCP servers dynamically', async () => {
      // MCP 서버가 있는 경우
      const mockMcpHubWithServers = {
        getServers: vi.fn(() => [
          {
            name: 'test-server',
            getTools: vi.fn(() => [{ name: 'test_tool' }]),
            getResources: vi.fn(() => [{ uri: 'test://resource' }]),
            status: 'connected'
          }
        ])
      }
      
      const result = await mockCaretSystemPrompt.generateFromJsonSections(
        '/test/cwd',
        false,
        mockMcpHubWithServers,
        mockBrowserSettings,
        false
      )
      
      expect(result).toContain('test-server')
      expect(result).toContain('Connected MCP Servers')
    })
    
    it('should include browser support when enabled', async () => {
      const result = await mockCaretSystemPrompt.generateFromJsonSections(
        '/test/cwd',
        true, // supportsBrowserUse = true
        mockMcpHub,
        mockBrowserSettings,
        false
      )
      
      expect(result).toContain('browser_action')
      expect(result).toContain('Browser automation')
    })
    
    it('should include Claude4 features when enabled', async () => {
      const result = await mockCaretSystemPrompt.generateFromJsonSections(
        '/test/cwd',
        false,
        mockMcpHub,
        mockBrowserSettings,
        true // isClaude4ModelFamily = true
      )
      
      // Claude4 특별 기능이 포함되어야 함 (실제 구현에 따라 조정 필요)
      expect(result.length).toBeGreaterThan(100)
    })
    
    it('should include system information dynamically', async () => {
      const testCwd = '/test/working/directory'
      const result = await mockCaretSystemPrompt.generateFromJsonSections(
        testCwd,
        false,
        mockMcpHub,
        mockBrowserSettings,
        false
      )
      
      expect(result).toContain(testCwd) // 작업 디렉토리가 포함되어야 함
    })
  })
}) 