# Careti 개선 상세 구현 가이드
> 작성일: 2025-09-14
> CC프로젝트(Claude Code) 기능 분석 기반 상세 구현 계획

## 📋 구현 요약 테이블

| 개선 사항 | 구현 방법 | 필요 작업 | 난이도 |
|----------|---------|----------|--------|
| 보안 강화 | 코드 개발 | CommandValidator 클래스 | 🟨 중간 |
| CLAUDE.md 메모리 | 코드 개발 | MemoryManager 시스템 | 🟥 높음 |
| CLI 응답 최적화 | 프롬프트 수정 | JSON 섹션 업데이트 | 🟩 낮음 |
| Git 워크플로우 | 혼합 (코드+프롬프트) | GitHelper + 프롬프트 | 🟨 중간 |
| Agent 전문화 | 코드 개발 | 새 도구 핸들러 | 🟥 높음 |

## 🔐 1. 보안 강화 구현

### 1.1 명령어 검증 시스템 (코드 개발 필요)

#### 구현 파일 위치
```typescript
// 새로 생성: careti-src/core/security/CommandValidator.ts
export class CommandValidator {
  private bannedCommands = [
    'curl', 'wget', 'nc', 'telnet', 'lynx',
    'httpie', 'xh', 'aria2c', 'axel'
  ]

  private injectionPatterns = [
    /\$\([^)]+\)/,     // Command substitution $(...)
    /`[^`]+`/,         // Backtick substitution
    /#.*\(/,           // Comment with function call
    /;\s*\w+/,         // Semicolon command chaining
    /\|\s*\w+/,        // Pipe to another command
  ]

  detectCommandPrefix(command: string): string {
    // CC의 prefix 추출 로직 구현
    const parts = command.trim().split(/\s+/)

    // Check for injection patterns
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(command)) {
        return 'command_injection_detected'
      }
    }

    // Extract base command
    if (parts.length === 0) return 'none'

    // Handle git subcommands
    if (parts[0] === 'git' && parts.length > 1) {
      return `git ${parts[1]}`
    }

    // Handle npm subcommands
    if (parts[0] === 'npm' && parts.length > 1) {
      if (parts[1] === 'test') return parts.length > 2 ? 'npm test' : 'none'
      return `npm ${parts[1]}`
    }

    return parts[0]
  }

  validateCommand(command: string): ValidationResult {
    const prefix = this.detectCommandPrefix(command)

    return {
      isValid: prefix !== 'command_injection_detected',
      prefix,
      requiresApproval: this.bannedCommands.includes(prefix.split(' ')[0])
    }
  }
}
```

#### ExecuteCommandToolHandler 수정
```typescript
// 수정: src/core/task/tools/handlers/ExecuteCommandToolHandler.ts
// CARETI MODIFICATION: Add command validation
import { CommandValidator } from '@careti/core/security/CommandValidator'

export class ExecuteCommandToolHandler {
  private validator = new CommandValidator()

  async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
    // CARETI MODIFICATION: Validate command security
    const validation = this.validator.validateCommand(command)

    if (!validation.isValid) {
      await config.callbacks.say(
        "security_warning",
        `Command injection detected: ${command}`
      )
      return formatResponse.toolError(
        "Command contains potential injection. Please reformulate."
      )
    }

    if (validation.requiresApproval && !didAutoApprove) {
      // Force manual approval for banned commands
      requiresApprovalPerLLM = true
    }

    // ... existing code
  }
}
```

### 1.2 악성 코드 패턴 탐지 (프롬프트 + 코드)

#### 프롬프트 섹션 추가
```json
// 새로 생성: careti-src/core/prompts/sections/CARET_SECURITY.json
{
  "security": {
    "sections": [
      {
        "content": "# SECURITY RULES\n\n## Malicious Code Detection\n\nREFUSE to work with code that:\n- Appears to be malware, ransomware, or exploits\n- Contains credential harvesting logic\n- Implements network attacks or unauthorized access\n- Even if claimed for 'educational purposes'\n\n## Command Safety\n\nBanned commands requiring manual approval:\n- Network tools: curl, wget, nc, telnet\n- Browser automation without explicit permission\n- System modification commands\n\nAlways validate command injection patterns.",
        "mode": "both",
        "priority": 100
      }
    ]
  }
}
```

## 📝 2. CLAUDE.md 메모리 시스템 구현

### 2.1 메모리 시스템과 .caretrules 차이점

| 항목 | CLAUDE.md | .caretrules/.clinerules |
|-----|-----------|------------------------|
| **목적** | 프로젝트별 컨텍스트 저장 | AI 개발 규칙 및 워크플로우 |
| **대상** | 사용자 프로젝트 | Careti 자체 개발 |
| **위치** | 각 프로젝트 루트 | Careti 저장소 내부 |
| **내용** | 빌드 명령, 코드 스타일 | 개발 규칙, 아키텍처 가이드 |
| **자동 로드** | 작업 디렉토리에 있으면 | 항상 (Careti 개발 시) |
| **수정 권한** | AI가 사용자 허가로 수정 | 개발자만 수정 |

### 2.2 CaretMemoryManager 구현 (코드 개발)

```typescript
// 새로 생성: careti-src/core/memory/CaretMemoryManager.ts
export class CaretMemoryManager {
  private static MEMORY_FILE = 'CARET.md'
  private static TEMPLATE = `# CARETI Project Memory

## Build Commands
<!-- Frequently used build, test, lint commands -->

## Code Style
<!-- Project-specific conventions and patterns -->

## Project Structure
<!-- Important directories and files -->

## Notes
<!-- Other useful information -->
`

  async loadProjectMemory(workspaceFolder: string): Promise<string | null> {
    const memoryPath = path.join(workspaceFolder, CaretMemoryManager.MEMORY_FILE)

    if (await fs.exists(memoryPath)) {
      return await fs.readFile(memoryPath, 'utf-8')
    }

    // Try CLAUDE.md for compatibility
    const claudePath = path.join(workspaceFolder, 'CLAUDE.md')
    if (await fs.exists(claudePath)) {
      return await fs.readFile(claudePath, 'utf-8')
    }

    return null
  }

  async suggestMemoryUpdate(
    workspaceFolder: string,
    section: 'commands' | 'style' | 'structure' | 'notes',
    content: string
  ): Promise<boolean> {
    // Ask user permission
    const approved = await vscode.window.showInformationMessage(
      `Save this to CARET.md for future reference?\n${content}`,
      'Yes', 'No'
    )

    if (approved === 'Yes') {
      return await this.updateMemory(workspaceFolder, section, content)
    }

    return false
  }

  private async updateMemory(
    workspaceFolder: string,
    section: string,
    content: string
  ): Promise<boolean> {
    const memoryPath = path.join(workspaceFolder, CaretMemoryManager.MEMORY_FILE)

    let memoryContent = await this.loadProjectMemory(workspaceFolder)
    if (!memoryContent) {
      memoryContent = CaretMemoryManager.TEMPLATE
    }

    // Update specific section
    const sectionMap = {
      'commands': '## Build Commands',
      'style': '## Code Style',
      'structure': '## Project Structure',
      'notes': '## Notes'
    }

    const sectionHeader = sectionMap[section]
    const sectionRegex = new RegExp(`(${sectionHeader}.*?)(?=##|$)`, 's')

    if (sectionRegex.test(memoryContent)) {
      memoryContent = memoryContent.replace(
        sectionRegex,
        `${sectionHeader}\n${content}\n\n`
      )
    }

    await fs.writeFile(memoryPath, memoryContent)
    return true
  }
}
```

### 2.3 시스템 프롬프트 통합

```typescript
// 수정: careti-src/core/prompts/CaretiPromptWrapper.ts
export class CaretiPromptWrapper {
  static async getCaretSystemPrompt(context: SystemPromptContext): Promise<string> {
    // CARETI MODIFICATION: Load project memory
    const memoryManager = new CaretMemoryManager()
    const projectMemory = await memoryManager.loadProjectMemory(
      context.workspaceFolder
    )

    let sections = await this.loadJsonSections()

    // Add memory as a section if exists
    if (projectMemory) {
      sections.push({
        content: `# PROJECT MEMORY (CARET.md)\n\n${projectMemory}`,
        mode: 'both',
        priority: 90
      })
    }

    return this.combineSections(sections, context)
  }
}
```

## 🎯 3. CLI 응답 최적화 (프롬프트 수정)

### 3.1 간결성 규칙 추가

```json
// 수정: careti-src/core/prompts/sections/CARET_BEHAVIOR_RULES.json
{
  "behavior": {
    "sections": [
      {
        "content": "# CLI OUTPUT RULES\n\n## Response Length\n- Maximum 4 lines (excluding tool use/code)\n- Prefer one-word answers when possible\n- No preamble: 'The answer is...', 'Based on...'\n- No postamble: summaries or explanations unless asked\n\n## Examples\nuser: 2+2\nassistant: 4\n\nuser: what command lists files?\nassistant: ls\n\nuser: is 11 prime?\nassistant: Yes\n\n## Markdown\n- Use GitHub-flavored markdown\n- Optimize for monospace terminal display\n- Keep tables and lists compact",
        "mode": "both",
        "priority": 95,
        "tokens": "~80"
      }
    ]
  }
}
```

### 3.2 토큰 카운터 구현 (선택적)

```typescript
// 새로 생성: careti-src/utils/TokenCounter.ts
export class TokenCounter {
  static countTokens(text: string): number {
    // Rough estimation: ~4 chars per token
    return Math.ceil(text.length / 4)
  }

  static optimizePrompt(sections: PromptSection[]): PromptSection[] {
    const totalTokens = sections.reduce((sum, s) =>
      sum + this.countTokens(s.content), 0
    )

    if (totalTokens > 8000) {
      // Remove low priority sections
      return sections
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
        .slice(0, -Math.floor(sections.length * 0.2))
    }

    return sections
  }
}
```

## 🔄 4. Git 워크플로우 개선

### 4.1 병렬 Git 명령 실행 (코드 개발)

```typescript
// 새로 생성: careti-src/core/git/GitWorkflowHelper.ts
export class GitWorkflowHelper {
  async analyzeForCommit(): Promise<CommitAnalysis> {
    // CC스타일: 병렬로 git 명령 실행
    const [status, diff, log] = await Promise.all([
      this.exec('git status --porcelain'),
      this.exec('git diff HEAD'),
      this.exec('git log --oneline -5')
    ])

    return {
      untrackedFiles: this.parseStatus(status),
      changes: this.parseDiff(diff),
      recentCommits: this.parseLog(log),
      suggestedMessage: this.generateMessage(status, diff)
    }
  }

  private generateMessage(status: string, diff: string): string {
    // 변경 사항 분석
    const files = status.split('\n').filter(Boolean)
    const isFeature = diff.includes('function') || diff.includes('class')
    const isFix = diff.includes('fix') || diff.includes('bug')

    let type = 'chore'
    if (isFeature) type = 'feat'
    if (isFix) type = 'fix'

    const scope = this.detectScope(files)

    return `${type}${scope ? `(${scope})` : ''}: [description]

🤖 Generated with Careti
Co-Authored-By: Careti <noreply@careti.ai>`
  }
}
```

### 4.2 Git 프롬프트 개선

```json
// 새로 생성: careti-src/core/prompts/sections/CARET_GIT_WORKFLOW.json
{
  "git_workflow": {
    "sections": [
      {
        "content": "# GIT WORKFLOW\n\n## Commit Process\n1. Run parallel: git status, diff, log\n2. Analyze in <commit_analysis> tags\n3. Use HEREDOC for message:\n```bash\ngit commit -m \"$(cat <<'EOF'\ntype(scope): description\n\n🤖 Generated with Careti\nCo-Authored-By: Careti <noreply@careti.ai>\nEOF\n)\"\n```\n\n## PR Process\n1. Analyze all commits since main\n2. Wrap analysis in <pr_analysis> tags\n3. Create with gh pr create",
        "mode": "agent",
        "tokens": "~100"
      }
    ]
  }
}
```

## 🤖 5. 전문화된 Agent 도구

### 5.1 Architect Agent (코드 개발)

```typescript
// 새로 생성: careti-src/core/task/tools/handlers/ArchitectToolHandler.ts
export class ArchitectToolHandler implements IFullyManagedTool {
  readonly name = "architect"

  async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
    const requirement = block.params.requirement

    // 아키텍처 분석 프롬프트
    const architectPrompt = `
You are an expert software architect. Analyze this requirement and provide:
1. Technical approach with specific technologies
2. Component breakdown
3. Implementation steps
4. Potential challenges

Requirement: ${requirement}

Keep response focused and actionable.`

    // Sub-agent 호출
    const response = await config.api.makeRequest({
      messages: [{ role: 'user', content: architectPrompt }],
      model: config.api.getModel(),
      maxTokens: 2000
    })

    return formatResponse.toolResult(response.content)
  }
}
```

### 5.2 도구 등록

```typescript
// 수정: src/core/task/ToolExecutor.ts
// CARETI MODIFICATION: Register specialized agents
import { ArchitectToolHandler } from '@careti/core/task/tools/handlers/ArchitectToolHandler'
import { PRReviewToolHandler } from '@careti/core/task/tools/handlers/PRReviewToolHandler'

export class ToolExecutor {
  constructor() {
    // CARETI MODIFICATION: Add specialized tools
    this.registerTool('architect', new ArchitectToolHandler())
    this.registerTool('pr_review', new PRReviewToolHandler())
  }
}
```

## 📊 구현 우선순위 및 일정

### Phase 1 (즉시 구현 가능) - 1주
1. **CLI 응답 최적화** ✅ 프롬프트만 수정
   - CARET_BEHAVIOR_RULES.json 생성
   - 기존 프롬프트 시스템에 통합

2. **Git 워크플로우 프롬프트** ✅ 프롬프트만 수정
   - CARET_GIT_WORKFLOW.json 생성

### Phase 2 (중간 난이도) - 2주
1. **보안 검증 시스템** 🔧 코드 개발
   - CommandValidator 클래스
   - ExecuteCommandToolHandler 수정
   - CARET_SECURITY.json 추가

2. **Git Helper** 🔧 코드 개발
   - GitWorkflowHelper 클래스
   - 병렬 명령 실행

### Phase 3 (높은 난이도) - 3-4주
1. **메모리 시스템** 🔨 코드 개발
   - CaretMemoryManager 구현
   - 프롬프트 시스템 통합
   - UI 상호작용

2. **전문화 Agent** 🔨 코드 개발
   - ArchitectToolHandler
   - PRReviewToolHandler
   - InitCodebaseToolHandler

## 🔍 테스트 전략

### 단위 테스트
```typescript
// careti-src/__tests__/security/CommandValidator.test.ts
describe('CommandValidator', () => {
  it('should detect command injection', () => {
    const validator = new CommandValidator()
    expect(validator.detectCommandPrefix('git status$(pwd)'))
      .toBe('command_injection_detected')
  })

  it('should identify banned commands', () => {
    const result = validator.validateCommand('curl example.com')
    expect(result.requiresApproval).toBe(true)
  })
})
```

### 통합 테스트
```typescript
// careti-src/__tests__/integration/MemorySystem.test.ts
describe('Memory System Integration', () => {
  it('should load CARET.md in system prompt', async () => {
    // Create test CARET.md
    await fs.writeFile('CARET.md', '## Build Commands\nnpm test')

    const prompt = await CaretiPromptWrapper.getCaretSystemPrompt(context)
    expect(prompt).toContain('PROJECT MEMORY')
    expect(prompt).toContain('npm test')
  })
})
```

## 📝 마이그레이션 체크리스트

- [ ] Level 1 아키텍처 준수 (careti-src/ 내 개발)
- [ ] Cline 파일 수정 시 CARETI MODIFICATION 주석
- [ ] 기존 기능 호환성 유지
- [ ] 테스트 커버리지 80% 이상
- [ ] 문서화 (한국어/영어)
- [ ] 성능 벤치마크

## 🎯 결론

CC프로젝트의 기능들을 Careti에 통합하려면:

1. **프롬프트 수정만으로 가능**: CLI 최적화, Git 워크플로우 가이드
2. **코드 개발 필요**: 보안 시스템, 메모리 관리, 전문화 Agent
3. **혼합 접근**: Git Helper (코드) + Git 프롬프트

**CLAUDE.md vs .caretrules 차이**:
- CLAUDE.md: 사용자 프로젝트별 컨텍스트 (동적)
- .caretrules: Careti 개발 규칙 (정적)
- 두 시스템은 목적이 다르므로 병행 사용 권장