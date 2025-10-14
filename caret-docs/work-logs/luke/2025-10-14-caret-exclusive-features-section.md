# Caret 독점 기능 섹션 설계

**작성일**: 2025-10-14
**목적**: docs.caret.team에 Caret만의 차별화된 기능을 강조하는 독립 섹션 추가

## 1. 현재 문제점

### Caret의 정체성 부족
- 현재 docs.caret.team은 Cline 문서의 브랜딩 변환에 불과
- Caret만의 독자적인 가치 제안이 명확하지 않음
- 사용자가 "왜 Cline이 아닌 Caret을 써야 하는가?"에 대한 답이 부족

### 숨겨진 강력한 기능들
Caret은 실제로 많은 독자적 기능을 보유하고 있지만 문서화되지 않음:
- ✅ 페르소나 시스템 (AI 성격 커스터마이징)
- ✅ 듀얼 프롬프트 시스템 (Caret AGENT vs Cline ACT)
- ✅ 브랜드 전환 시스템 (Caret ↔ CodeCenter)
- ✅ Caret 제공자 (Gemini 무료 크레딧)
- ✅ 완전한 다국어 지원 (ko, en, ja, zh)
- ✅ 규칙 시스템 통합 (.caretrules + .clinerules)

## 2. 제안: "Caret Exclusive Features" 섹션

### 2.1 위치 및 구조

```
docs.caret.team/
├── docs-en/
│   ├── getting-started/
│   ├── features/              # 기존 Cline 공통 기능
│   ├── caret-exclusive/       # 🆕 NEW SECTION
│   │   ├── overview.mdx       # Caret이 특별한 이유
│   │   ├── persona-system.mdx # AI 페르소나 커스터마이징
│   │   ├── dual-prompt-modes.mdx # Agent vs Act 모드
│   │   ├── brand-switching.mdx   # 브랜드 전환 시스템
│   │   ├── caret-provider.mdx    # 무료 Gemini 크레딧
│   │   ├── multilingual-ui.mdx   # 4개 언어 완전 지원
│   │   └── advanced-rules.mdx    # 통합 규칙 시스템
│   ├── provider-config/
│   └── ...
├── docs-ko/ (동일 구조)
├── docs-ja/ (동일 구조)
└── docs-zh/ (동일 구조)
```

### 2.2 네비게이션 구조

**사이드바 (sidebars-{lang}.ts)**:
```typescript
{
  type: 'category',
  label: '🌟 Caret Exclusive Features',
  collapsed: false,
  items: [
    'caret-exclusive/overview',
    'caret-exclusive/persona-system',
    'caret-exclusive/dual-prompt-modes',
    'caret-exclusive/brand-switching',
    'caret-exclusive/caret-provider',
    'caret-exclusive/multilingual-ui',
    'caret-exclusive/advanced-rules',
  ]
}
```

**메인 페이지 Featured Box**:
```markdown
## 🌟 Why Choose Caret?

Caret isn't just a rebrand of Cline - it's an enhanced experience with exclusive features:

- 🎭 **Persona System**: Customize AI personality and behavior
- 🔄 **Dual Prompt Modes**: Switch between Agent and Act modes
- 🎨 **Brand Switching**: Seamlessly toggle Caret ↔ CodeCenter
- 💎 **Caret Provider**: Free Gemini 2.5 credits included
- 🌍 **True Multilingual**: Full UI translation in 4 languages
```

## 3. 각 문서 세부 설계

### 3.1 Overview (caret-exclusive/overview.mdx)

**제목**: What Makes Caret Different?

**내용 구조**:
```markdown
# What Makes Caret Different?

Caret is built on Cline's solid foundation, but adds powerful exclusive features that enhance your coding experience.

## At a Glance

| Feature | Cline | Caret |
|---------|-------|-------|
| AI Persona Customization | ❌ | ✅ |
| Dual Prompt Systems | ❌ | ✅ |
| Brand Switching | ❌ | ✅ |
| Free Gemini Credits | ❌ | ✅ |
| Full Multilingual UI | ❌ | ✅ (4 langs) |
| Integrated Rule Systems | Partial | ✅ Complete |

## Explore Caret's Exclusive Features

[Cards with links to each feature page]
```

**번역 키**:
- `caretExclusive.overview.title`
- `caretExclusive.overview.subtitle`
- `caretExclusive.overview.comparison.header`

### 3.2 Persona System (persona-system.mdx)

**제목**: AI Persona Customization

**내용 구조**:
```markdown
# AI Persona Customization

Personalize how Caret interacts with you. Choose from preset personas or create your own custom AI personality.

## What is a Persona?

A persona defines:
- **Tone of voice**: Formal, casual, friendly, professional
- **Response style**: Concise, detailed, explanatory
- **Behavior patterns**: Proactive suggestions, conservative changes
- **Visual identity**: Custom avatar and branding

## Using Preset Personas

Caret comes with 5 built-in personas:

### 1. 🧑‍💼 Professional Assistant
- Formal tone
- Detailed explanations
- Conservative code changes
- Best for: Enterprise projects

### 2. 🚀 Speed Demon
- Concise responses
- Fast iteration
- Bold changes
- Best for: Rapid prototyping

[등등...]

## Creating Custom Personas

### Step 1: Open Persona Settings
[Screenshot]

### Step 2: Define Personality Traits
[Code example]

### Step 3: Upload Custom Avatar
[Tutorial]

## Persona Management

### Switching Personas
- Quick switch from chat header
- Keyboard shortcut: `Cmd+Shift+P`

### Sharing Personas
- Export persona JSON
- Import from community

## Use Cases

**Scenario 1: Teaching Mode**
> When learning a new framework, use the "Patient Teacher" persona for detailed explanations.

**Scenario 2: Production Hotfix**
> Switch to "Emergency Responder" for quick, focused fixes.

## Technical Details

Personas are stored in:
```json
{
  "id": "custom-persona-1",
  "name": "My Custom Persona",
  "tone": "friendly",
  "verbosity": "medium",
  "avatar": "base64...",
  "systemPromptAdditions": "..."
}
```

[Continue with API reference, advanced customization...]
```

### 3.3 Dual Prompt Modes (dual-prompt-modes.mdx)

**제목**: Agent Mode vs Act Mode

**내용 구조**:
```markdown
# Dual Prompt Systems: Agent vs Act

Caret offers two distinct prompting strategies optimized for different workflows.

## Quick Comparison

| Aspect | Caret AGENT MODE | Cline ACT MODE |
|--------|------------------|----------------|
| Focus | Autonomous planning | Direct execution |
| Verbosity | Detailed reasoning | Concise actions |
| Best for | Complex tasks | Quick fixes |
| Planning depth | Multi-step plans | Immediate action |

## Caret AGENT MODE 🤖

### What It Does
AGENT MODE emphasizes:
- **Planning before execution**: Breaks down complex tasks
- **Transparent reasoning**: Shows thought process
- **Autonomous decision-making**: Handles edge cases proactively

### When to Use
✅ Large refactoring projects
✅ Architectural changes
✅ Learning new codebases
✅ Complex bug investigations

### Example Workflow
```
User: "Refactor the authentication system to use JWT"

[AGENT MODE Response]
🎯 Task Analysis:
1. Current state: Session-based auth
2. Required changes:
   - Remove session middleware
   - Add JWT library
   - Update login/logout endpoints
   - Modify auth guards
3. Estimated files: 8

📋 Execution Plan:
Step 1: Install jsonwebtoken...
Step 2: Create JWT utility...
[...]

Proceeding with Step 1...
```

## Cline ACT MODE ⚡

### What It Does
ACT MODE focuses on:
- **Immediate action**: Less planning, more doing
- **Concise communication**: Minimal explanation
- **Fast iteration**: Quick feedback loops

### When to Use
✅ Simple bug fixes
✅ Adding small features
✅ Code formatting
✅ Quick experiments

### Example Workflow
```
User: "Fix the login button alignment"

[ACT MODE Response]
Updated src/components/LoginButton.css
- Changed margin-top: 10px → 5px
Done.
```

## Switching Between Modes

### From Settings
1. Open Caret Settings
2. General → Mode System
3. Select "Caret" or "Cline"

### Dynamic Switching (Coming Soon)
Use slash commands to switch mid-conversation:
```
/agent - Switch to AGENT MODE
/act - Switch to ACT MODE
```

## Which Mode Should You Use?

**Use AGENT MODE when:**
- Task complexity is high
- You need to understand the reasoning
- Multiple files will be affected
- You're learning

**Use ACT MODE when:**
- Task is straightforward
- Speed is priority
- Single file changes
- You know exactly what you want

## Technical Implementation

The mode system modifies the system prompt:

**AGENT MODE Additions:**
- Enhanced planning tools
- Verbose reasoning blocks
- Multi-step task breakdown

**ACT MODE Optimizations:**
- Streamlined tool descriptions
- Concise response format
- Direct action prompts

[Continue with advanced configuration...]
```

### 3.4 Brand Switching (brand-switching.mdx)

**제목**: Seamless Brand Switching

**내용 구조**:
```markdown
# Brand Switching: Caret ↔ CodeCenter

Switch between Caret and CodeCenter branding without reinstalling. Perfect for different clients or work contexts.

## What Gets Changed?

When you switch brands, Caret updates:

| Element | Caret | CodeCenter |
|---------|-------|------------|
| Name | Caret | CodeCenter |
| Logo | 🐰 Caret Icon | 🏢 CC Icon |
| Color Theme | Purple | Blue |
| Welcome Message | "Hi, I'm Caret" | "CodeCenter Ready" |

## How to Switch

### Via Settings UI
1. Open Caret Settings
2. Navigate to "About" tab
3. Click "Switch Brand"
4. Select target brand
5. Reload VS Code

### Via Command Palette
```
Cmd+Shift+P → "Caret: Switch to CodeCenter"
```

### Programmatically (Coming Soon)
```typescript
import { switchBrand } from 'caret-sdk'

await switchBrand('codecenter')
```

## Use Cases

### Agency Work
> Switch to CodeCenter when working on client projects, Caret for personal work.

### Education
> Teachers can use Caret branding for students, CodeCenter for institutional reports.

### Multi-Brand Teams
> Different departments prefer different branding - accommodate everyone.

## Technical Details

Brand configuration stored in:
```json
{
  "currentBrand": "caret",
  "brands": {
    "caret": {
      "displayName": "Caret",
      "theme": "purple",
      "assets": {...}
    },
    "codecenter": {
      "displayName": "CodeCenter",
      "theme": "blue",
      "assets": {...}
    }
  }
}
```

[Continue with custom brand creation...]
```

### 3.5 Caret Provider (caret-provider.mdx)

**제목**: Free Gemini Credits with Caret Provider

**내용 구조**:
```markdown
# Caret Provider: Free Gemini 2.5 Access

Get started with AI coding instantly - no credit card required.

## What's Included?

With a free Caret account:
- ✅ **Gemini 2.5 Pro**: Powerful reasoning for complex tasks
- ✅ **Gemini 2.5 Flash**: Fast responses for quick edits
- ✅ **Monthly Credits**: Renewed automatically
- ✅ **No Payment Info**: Start coding immediately

## How It Works

### Step 1: Sign Up for Caret Account
[Screenshot of signup flow]

### Step 2: Select Caret Provider
Settings → API Configuration → Caret

### Step 3: Start Coding
No API key needed - just start chatting!

## Credit System

### Free Tier
- **Monthly Allocation**: $10 worth of Gemini credits
- **Rollover**: Unused credits expire monthly
- **Usage Tracking**: Monitor in dashboard

### Cost Per Request
| Model | Input (1M tokens) | Output (1M tokens) |
|-------|-------------------|-------------------|
| Gemini 2.5 Pro | $0.35 | $1.40 |
| Gemini 2.5 Flash | $0.075 | $0.30 |

### Estimating Usage
**Typical conversation** (50 messages):
- Small project: ~$0.50
- Medium project: ~$2.00
- Large refactor: ~$5.00

**Your $10/month covers:**
- ~20 small projects OR
- ~5 medium projects OR
- ~2 large refactors

## Upgrading

Need more credits? Options:
1. **Paid Caret Plan**: $20/month for unlimited*
2. **BYOK**: Use your own API keys
3. **Team Plan**: Shared credits for organizations

## Comparison with Other Providers

| Provider | Free Tier | Setup Difficulty |
|----------|-----------|------------------|
| **Caret** | ✅ $10/month | ⭐ One-click |
| Anthropic | ❌ No free tier | ⭐⭐ Need API key |
| OpenAI | ❌ No free tier | ⭐⭐ Credit card required |
| OpenRouter | ⚠️ Limited trial | ⭐⭐ Registration needed |

## Best Practices

### Maximize Your Credits
- Use Flash for simple edits
- Use Pro for architecture decisions
- Enable auto-compact to reduce context size

### Monitor Usage
Check dashboard regularly:
```
Settings → Caret Account → Usage Stats
```

[Continue with troubleshooting, FAQs...]
```

### 3.6 Multilingual UI (multilingual-ui.mdx)

**내용 요약**:
- 4개 언어 완전 지원 (ko, en, ja, zh)
- UI, 메시지, 설정 모두 번역
- 언어별 문서 사이트 연동
- 다국어 팀 협업 가이드

### 3.7 Advanced Rules (advanced-rules.mdx)

**내용 요약**:
- .caretrules + .clinerules + .cursorrules 통합
- 규칙 우선순위 시스템
- Persona와 규칙 조합
- 워크플로우 자동화

## 4. 마케팅 메시지

### 홈페이지 Hero Section
```markdown
# Caret: Cline, Supercharged

Everything you love about Cline, plus:

🎭 **Persona System** - Customize AI personality
🔄 **Dual Modes** - Agent planning + Act execution
💎 **Free Credits** - Start coding with Gemini 2.5
🌍 **Multilingual** - Full support for 4 languages

[Get Started Free] [See What's New]
```

### 차별화 포인트 (Elevator Pitch)
> "Caret은 Cline의 모든 기능에 AI 페르소나 커스터마이징, 듀얼 프롬프트 모드, 무료 Gemini 크레딧을 더했습니다. 브랜딩만 바꾼 것이 아니라, 실제로 더 나은 코딩 경험을 제공합니다."

## 5. 구현 계획

### Phase 1: 문서 작성 (우선순위)
- [x] overview.mdx (개요)
- [ ] persona-system.mdx (페르소나)
- [ ] dual-prompt-modes.mdx (듀얼 모드)
- [ ] caret-provider.mdx (제공자)

### Phase 2: 번역
- [ ] 한국어 (ko)
- [ ] 일본어 (ja)
- [ ] 중국어 (zh)

### Phase 3: 네비게이션 통합
- [ ] sidebars-{lang}.ts 업데이트
- [ ] 홈페이지 featured box 추가
- [ ] 검색 인덱스 업데이트

### Phase 4: 스크린샷 및 미디어
- [ ] Persona 설정 UI 캡처
- [ ] Mode 전환 데모 GIF
- [ ] 브랜드 스위칭 비디오

## 6. 예상 작업 시간

| 작업 | 시간 | 비고 |
|------|------|------|
| Overview 작성 (en) | 1h | 개요 및 비교 테이블 |
| Persona System (en) | 3h | 가장 복잡한 기능 |
| Dual Prompt Modes (en) | 2h | 기술적 설명 필요 |
| Brand Switching (en) | 1.5h | 상대적으로 간단 |
| Caret Provider (en) | 2h | 가격, 사용량 설명 |
| Multilingual UI (en) | 1h | 간단한 기능 설명 |
| Advanced Rules (en) | 1.5h | 통합 개념 설명 |
| **영문 총계** | **12h** | |
| 번역 (ko, ja, zh) | 9h | 각 언어 3h |
| 스크린샷/미디어 | 4h | 캡처 및 편집 |
| **전체 총계** | **25h** | 약 3-4일 작업 |

## 7. 성공 지표

### 문서 품질
- [ ] 모든 기능이 명확하게 설명됨
- [ ] 실제 사용 예시 포함
- [ ] 스크린샷/코드 예제 완비
- [ ] 4개 언어 번역 완료

### 사용자 경험
- [ ] 신규 사용자가 Caret의 차별점을 즉시 이해
- [ ] 각 기능의 가치 제안이 명확
- [ ] 실제 활용 시나리오 제시

### 마케팅 효과
- [ ] "Why Caret?" 질문에 대한 명확한 답변
- [ ] Cline 대비 경쟁 우위 문서화
- [ ] 커뮤니티 공유 가능한 컨텐츠

## 8. 다음 액션

**즉시 시작**:
1. overview.mdx 초안 작성 (영문)
2. Persona System 문서 작성
3. 기존 Cline 문서와 병행 작업

**사용자 승인 후**:
- 전체 Exclusive Features 섹션 완성
- docs.caret.team에 통합
- 메인 페이지 개편

---

**상태**: 설계 완료, 실행 대기
**목표**: Caret의 독자성 확립 및 브랜드 가치 제고
