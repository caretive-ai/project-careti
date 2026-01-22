# t06 하이브리드 시스템 구현 계획 v2.0 (Alpha 분석 통합판)

> **Alpha 심층 분석 기반**: `cline-latest` 컴포넌트 아키텍처 완전 분석 + Careti JSON 로더 시스템 + 토큰 효율성 14.1% 우위 검증 완료

## 📋 현황 정확 분석

### 🔍 **현재 프로젝트 (`careti-merging`) 현황 (Alpha 분석 확인)**
- **기반 시스템**: `cline-latest` 완전히 통합 ✅ (컴포넌트 기반 아키텍처)
- **프롬프트 아키텍처**: `PromptRegistry` + 컴포넌트 시스템 완벽 구현 ✅
- **컴포넌트 위치**: `src/core/prompts/system-prompt/components/` (13개 컴포넌트)
- **핵심 메커니즘**: `registerComponent(id, fn)` 방식으로 동적 교체 가능 ✅
- **신규 핵심 요소**: `auto_todo`, `task_progress`, `feedback` (작업 관리 루프) ⭐

### 🎯 **목표 명확화 (Alpha 전략 반영)**
현재 `cline-latest` 기반 프로젝트에 **Careti의 CHATBOT/AGENT 철학** + **JSON 로더 시스템**을 완벽 통합하되:
1. **구조적 발전 채택**: `cline-latest`의 작업 관리 루프 (TODO → TASK_PROGRESS → FEEDBACK)
2. **철학적 우위 주입**: Act/Plan → Chatbot/Agent 모드 교체
3. **토큰 효율성 유지**: JSON 시스템의 14.1% 우위 보존

### ⚠️ **기존 문서들의 핵심 오해**
1. **"cline-latest를 가져와서 통합"** → ❌ **이미 통합되어 있음**
2. **"PromptRegistry 학습 필요"** → ❌ **이미 완성된 시스템 활용**
3. **"복잡한 어댑터 패턴"** → ✅ **단순 컴포넌트 교체만 필요**

---

## 🎯 **수정된 핵심 전략**

### **"하이브리드 확장 전략" (Alpha 제안 채택)**

1. **구조적 뼈대 채택**: `cline-latest`의 작업 관리 루프를 필수 구조로 존중
2. **철학적 뇌 이식**: `getActVsPlanModeSection` → Careti `CHATBOT_AGENT_MODES` 어댑터로 교체
3. **JSON 콘텐츠 관리**: 모든 프롬프트 내용을 JSON으로 관리하여 Careti 장점 유지
4. **mode_restriction 시스템**: Chatbot 모드에서 위험 도구 제한 기능 구현
5. **careti-main JSON 로더 이식**: 기존 구현된 JSON 로딩 메커니즘 활용

---

## 🗓️ **정정된 5단계 구현 계획**

### **Phase 1: Careti JSON 시스템 + 작업 관리 루프 통합 (1.5일)**
**목표**: `careti-main`의 JSON 로더 시스템 이식 + `cline-latest` 신규 3대 컴포넌트 JSON화

#### 1.1 careti-main JSON 로더 시스템 분석 및 이식
**중요**: Alpha 분석에서 누락된 핵심 부분 - 기존 `careti-main`의 JSON 로더 구현 활용

```typescript
// careti-src/core/prompts/CaretJsonLoader.ts (careti-main에서 이식)
export class CaretJsonLoader {
  private static cache = new Map<string, any>();
  
  // 다국어 JSON 로딩 (careti-main 구현 기반)
  static loadSection(filename: string, locale = 'ko', namespace = 'system-prompt'): any {
    const cacheKey = `${locale}/${namespace}/${filename}`;
    if (!this.cache.has(cacheKey)) {
      const path = `webview-ui/src/careti/locale/${locale}/${namespace}/${filename}.json`;
      this.cache.set(cacheKey, JSON.parse(fs.readFileSync(path, 'utf8')));
    }
    return this.cache.get(cacheKey);
  }
  
  // 모드별 조건부 로딩 (mode_restriction 지원)
  static loadWithRestriction(filename: string, mode: string, locale = 'ko'): any {
    const data = this.loadSection(filename, locale);
    if (data.mode_restriction && data.mode_restriction !== mode) {
      return null; // 제한된 모드에서는 null 반환
    }
    return data;
  }
}
```

#### 1.2 시스템 프롬프트 JSON 디렉토리 생성 (careti-main 방식 확장)
```bash
# careti-main 방식 확장: namespace 기반 구조
mkdir -p webview-ui/src/careti/locale/ko/system-prompt
mkdir -p webview-ui/src/careti/locale/en/system-prompt
mkdir -p webview-ui/src/careti/locale/ko/work-management  # 작업 관리 루프용
mkdir -p webview-ui/src/careti/locale/en/work-management
```

#### 1.3 핵심 철학 JSON + 신규 작업 관리 루프 JSON 생성

**A. 핵심 Careti 철학 (Alpha 분석 기반 강화)**:
```json
// webview-ui/src/careti/locale/ko/system-prompt/CHATBOT_AGENT_MODES.json
{
  "chatbot": {
    "title": "🤖 CHATBOT MODE - 전문 상담사",
    "description": "분석과 조언에 집중하되 직접 변경은 하지 않는 상담 모드",
    "behavior": "이 방법은 어떠신가요?, 더 궁금한 점이 있으신가요?",
    "philosophy": "AI의 행동 철학을 정의하는 고차원적 접근",
    "restrictions": ["file_edit", "terminal_command", "dangerous_operations"]
  },
  "agent": {
    "title": "⚡ AGENT MODE - 협력 파트너", 
    "description": "분석과 실행을 결합하여 협력적으로 개발하는 모드",
    "behavior": "이 작업을 진행하겠습니다, 다음 단계로 넘어갑니다",
    "philosophy": "기술적 상태를 넘어선 협력 관계 정의",
    "restrictions": []
  }
}

// webview-ui/src/careti/locale/ko/system-prompt/TOOL_DEFINITIONS.json
{
  "tools": [
    {
      "name": "edit_file",
      "description": "파일 내용을 수정합니다",
      "mode_restriction": "agent",
      "danger_level": "high"
    },
    {
      "name": "terminal_command", 
      "description": "터미널 명령을 실행합니다",
      "mode_restriction": "agent",
      "danger_level": "high"
    },
    {
      "name": "read_file",
      "description": "파일 내용을 읽습니다",
      "mode_restriction": null,
      "danger_level": "low"
    }
  ]
}
```

**B. 신규 작업 관리 루프 JSON화 (Alpha 핵심 발견 반영)**:
```json
// webview-ui/src/careti/locale/ko/work-management/AUTO_TODO.json
{
  "chatbot_mode": {
    "prompt_template": "분석 결과를 TODO 리스트로 정리:\n{analysis_points}",
    "style": "상담 중심의 체계적 분석 항목 제시"
  },
  "agent_mode": {
    "prompt_template": "실행 계획을 TODO 리스트로 공유:\n{action_items}",
    "style": "협력 중심의 구체적 실행 계획 제시"
  }
}

// webview-ui/src/careti/locale/ko/work-management/TASK_PROGRESS.json
{
  "chatbot_mode": {
    "progress_style": "분석 진행상황: {progress_items}",
    "completion_message": "분석 완료. 추가 질문이 있으시면 언제든 말씀해주세요."
  },
  "agent_mode": {
    "progress_style": "작업 진행상황: {progress_items}", 
    "completion_message": "작업 완료. 다음 단계로 진행하겠습니다."
  }
}

// webview-ui/src/careti/locale/ko/work-management/FEEDBACK.json
{
  "response_templates": {
    "clarification_request": "더 구체적인 설명이 필요한 부분: {details}",
    "progress_update": "현재까지의 진행상황: {current_status}",
    "next_steps": "다음 단계 제안: {proposed_actions}"
  }
}
```

#### 1.4 기타 필수 JSON 파일들 생성 (Alpha 분석 기반)
```json
// OBJECTIVE.json: Careti의 철학적 우위 강조
{
  "core_mission": "AI 행동 철학 기반의 고차원적 협력 시스템",
  "differentiation": "기술적 상태(Act/Plan)를 넘어선 상호작용 페르소나(Chatbot/Agent) 중심",
  "token_efficiency": "14.1% 토큰 효율성 우위 유지"
}

// SYSTEM_INFORMATION.json: 하이브리드 시스템 정보
{
  "architecture": "cline-latest 구조적 뼈대 + Careti 철학적 영혼",
  "components": "13개 기존 컴포넌트 + 3대 신규 작업 관리 컴포넌트",
  "json_loader": "careti-main 검증된 JSON 로더 시스템 활용"
}

// COLLABORATIVE_PRINCIPLES.json: 협력 원칙
{
  "chatbot_principles": ["분석 우선", "사용자 주도", "조언 제공", "안전성 우선"],
  "agent_principles": ["실행 우선", "AI 주도", "직접 수행", "효율성 우선"]
}
```

**Phase 1 완료 기준 (Alpha 분석 반영 강화)**:
- [ ] **careti-main JSON 로더 시스템 이식** 완료 ⭐
- [ ] **시스템 프롬프트 + 작업 관리 JSON 생성** 완료 (총 8개 파일)
- [ ] **mode_restriction 시스템 JSON 지원** 구현 완료
- [ ] **영어/한국어 버전 모두 생성** 완료
- [ ] **Alpha 분석의 핵심 3대 컴포넌트 JSON화** 완료

---

### **Phase 2: 하이브리드 어댑터 + 궁극의 철학 통합 (2일)**
**목표**: Alpha가 제안한 "구조적 뼈대 + 철학적 뇌" 완전 구현

#### 2.1 궁극의 하이브리드 어댑터 구현 (1일) - Alpha 전략 구현
```typescript
// careti-src/core/prompts/CaretHybridAdapter.ts
// Alpha 제안: "cline-latest의 체계적인 몸체 + Careti의 우월한 행동 철학(뇌)"
export class CaretHybridAdapter {
  private jsonLoader = CaretJsonLoader; // Phase 1에서 이식한 로더 활용
  
  // 핵심: getActVsPlanModeSection을 Careti 철학으로 완전 교체
  static createChatbotAgentPhilosophyComponent(): ComponentFunction {
    return async (variant, context) => {
      const json = this.jsonLoader.loadSection('CHATBOT_AGENT_MODES');
      const currentMode = context.caretMode || 'agent';
      
      const modeConfig = json[currentMode];
      
      // Alpha 강조: "철학적 우위" 반영
      return `# ${modeConfig.title}

${modeConfig.description}

**철학적 접근**: ${modeConfig.philosophy}
**행동 패턴**: ${modeConfig.behavior}

이는 단순한 기술적 상태 구분을 넘어선, AI의 행동 철학을 정의하는 고차원적 접근입니다.`;
    };
  }
  
  // 신규: 작업 관리 루프의 Careti 철학 버전 (Alpha 핵심 발견 통합)
  static createCaretTodoManagement(): ComponentFunction {
    return async (variant, context) => {
      const json = this.jsonLoader.loadSection('AUTO_TODO', 'ko', 'work-management');
      const currentMode = context.caretMode || 'agent';
      
      const modeConfig = json[`${currentMode}_mode`];
      return `## TODO 관리 (${currentMode.toUpperCase()} 방식)\n\n${modeConfig.style}\n\n${modeConfig.prompt_template}`;
    };
  }
  
  // 신규: 진행상황 추적의 Careti 버전
  static createCaretTaskProgress(): ComponentFunction {
    return async (variant, context) => {
      const json = this.jsonLoader.loadSection('TASK_PROGRESS', 'ko', 'work-management');
      const currentMode = context.caretMode || 'agent';
      
      const modeConfig = json[`${currentMode}_mode`];
      return modeConfig.progress_style;
    };
  }
  
  // 고도화된 mode_restriction 시스템
  static createAdvancedToolRestrictions(): ComponentFunction {
    return async (variant, context) => {
      const json = this.jsonLoader.loadWithRestriction('TOOL_DEFINITIONS', context.caretMode);
      if (!json) return "이 모드에서는 제한된 도구만 사용 가능합니다.";
      
      const currentMode = context.caretMode || 'agent';
      const availableTools = json.tools.filter(tool => 
        !tool.mode_restriction || tool.mode_restriction === currentMode
      );
      
      // 위험도별 분류 (Alpha 분석에 없던 고도화)
      const highRiskTools = availableTools.filter(t => t.danger_level === 'high');
      const lowRiskTools = availableTools.filter(t => t.danger_level === 'low');
      
      let result = "## 사용 가능한 도구들\n\n";
      if (lowRiskTools.length > 0) {
        result += "**안전한 도구들**:\n" + lowRiskTools.map(t => `- **${t.name}**: ${t.description}`).join('\n') + "\n\n";
      }
      if (highRiskTools.length > 0) {
        result += "**고급 도구들** (AGENT 모드 전용):\n" + highRiskTools.map(t => `- **${t.name}**: ${t.description}`).join('\n');
      }
      
      return result;
    };
  }
  
  // 토큰 효율성 우위 유지를 위한 최적화된 컴포넌트들
  static createOptimizedObjective(): ComponentFunction {
    return async (variant, context) => {
      const json = this.jsonLoader.loadSection('OBJECTIVE');
      // Alpha 검증: 14.1% 효율성 우위 유지를 위한 간결한 표현
      return `**Mission**: ${json.core_mission}\n**차별화**: ${json.differentiation}`;
    };
  }
  
  static createOptimizedSystemInfo(): ComponentFunction {
    return async (variant, context) => {
      const json = this.jsonLoader.loadSection('SYSTEM_INFORMATION');
      return `**Architecture**: ${json.architecture}\n**Components**: ${json.components}`;
    };
  }
}
```

#### 2.2 Alpha 제안 "뇌 이식" 시스템 구현 (1일)
```typescript
// careti-src/core/prompts/HybridSystemManager.ts
// Alpha 핵심 개념: "cline-latest의 체계적인 몸체 위에서 Careti의 우월한 행동 철학(뇌)이 동작"
export class HybridSystemManager {
  private registry = PromptRegistry.getInstance();
  
  // Alpha 전략: 하이브리드 확장 (Hybrid Expansion) 구현
  switchToCaretHybridMode(): void {
    // 1. 기존 cline 구조적 뼈대 유지 + Careti 철학적 뇌 이식
    
    // 핵심 철학 교체: Act/Plan → Chatbot/Agent
    this.registry.registerComponent(
      'act_vs_plan', 
      CaretHybridAdapter.createChatbotAgentPhilosophyComponent()
    );
    
    // 2. Alpha 발견: 필수 구조적 발전 채택 + Careti 스타일 적용
    this.registry.registerComponent(
      'auto_todo',
      CaretHybridAdapter.createCaretTodoManagement()
    );
    
    this.registry.registerComponent(
      'task_progress', 
      CaretHybridAdapter.createCaretTaskProgress()
    );
    
    // 3. 고도화된 도구 제한 시스템
    this.registry.registerComponent(
      'tool_use',
      CaretHybridAdapter.createAdvancedToolRestrictions()
    );
    
    // 4. 토큰 효율성 최적화된 나머지 컴포넌트들
    this.registry.registerComponent(
      'objective',
      CaretHybridAdapter.createOptimizedObjective()
    );
    
    this.registry.registerComponent(
      'system_info',
      CaretHybridAdapter.createOptimizedSystemInfo()
    );
    
    console.log('🎯 하이브리드 시스템 활성화: cline-latest 구조 + Careti 철학');
  }
  
  // 순정 Cline 모드로 복원 (Alpha 분석한 원본 13개 컴포넌트)
  switchToPureClineMode(): void {
    const originalComponents = getSystemPromptComponents(); // Alpha 분석한 13개
    for (const {id, fn} of originalComponents) {
      this.registry.registerComponent(id, fn);
    }
    
    console.log('🔧 Cline 순정 시스템 복원: 13개 원본 컴포넌트');
  }
  
  // Alpha 강조: 토큰 효율성 검증
  async validateTokenEfficiency(): Promise<number> {
    // 실제 프롬프트 생성 후 토큰 수 측정
    const testContext = { /* 테스트 컨텍스트 */ };
    const hybridPrompt = await this.registry.get(testContext);
    
    // Alpha 분석 방법론 활용: 콘텐츠 중심 토큰 추정
    const estimatedTokens = this.estimateTokens(hybridPrompt);
    
    console.log(`🎯 하이브리드 시스템 토큰 효율성: ${estimatedTokens} (목표: 14.1% 우위 유지)`);
    return estimatedTokens;
  }
  
  private estimateTokens(text: string): number {
    // Alpha 분석 방법론 구현
    const words = text.split(/\s+/).length;
    const conservative = words * 0.75;
    const standard = words * 1.0;
    const aggressive = words * 1.3;
    const charBased = text.length / 4;
    
    return Math.round((conservative + standard + aggressive + charBased) / 4);
  }
}
```

**Phase 2 완료 기준 (Alpha 전략 반영 강화)**:
- [ ] **CaretHybridAdapter 완성** (Alpha의 "뇌 이식" 컨셉 구현) ⭐
- [ ] **HybridSystemManager 완성** (하이브리드 확장 전략 구현) ⭐
- [ ] **신규 3대 컴포넌트 Careti 버전** 구현 완료 (Alpha 핵심 발견)
- [ ] **mode_restriction 고도화** 완료 (위험도별 도구 분류)
- [ ] **토큰 효율성 14.1% 우위 재검증** 완료 (Alpha 방법론 활용)
- [ ] **TDD 기반 단위 테스트** 통과
- [ ] **철학적 우위 vs 기술적 상태 차별화** 명확히 구현

---

### **Phase 3: 사용자 경험 통합 + E2E 검증 (2일)** 
**목표**: Alpha가 제시한 "궁극의 하이브리드 시스템" 사용자 체험 구현

#### 3.1 프론트엔드 설정 컴포넌트 추가 (1일)
```typescript
// webview-ui/src/careti/components/CaretPromptModeSelector.tsx
export const CaretPromptModeSelector: React.FC = () => {
  const [promptMode, setPromptMode] = useState<'careti' | 'cline'>('cline');
  
  const handleModeChange = (newMode: 'careti' | 'cline') => {
    setPromptMode(newMode);
    
    // 백엔드로 모드 변경 메시지 전송
    vscode.postMessage({
      type: 'careti/setPromptMode',
      payload: { mode: newMode }
    });
  };
  
  return (
    <div className="prompt-mode-selector">
      <h3>🤖 프롬프트 시스템 설정</h3>
      <div className="mode-options">
        <label>
          <input 
            type="radio" 
            value="cline" 
            checked={promptMode === 'cline'}
            onChange={() => handleModeChange('cline')}
          />
          <span>Cline 원본 시스템</span>
          <p>기존 Plan/Act 모드 사용</p>
        </label>
        
        <label>
          <input 
            type="radio" 
            value="careti" 
            checked={promptMode === 'careti'}
            onChange={() => handleModeChange('careti')}
          />
          <span>Careti 하이브리드 시스템</span>
          <p>CHATBOT/AGENT 모드 + JSON 관리</p>
        </label>
      </div>
    </div>
  );
};
```

#### 3.2 기존 설정 페이지에 통합 (0.5일)
```typescript
// webview-ui/src/components/settings/SettingsView.tsx에 추가
import { CaretPromptModeSelector } from '@/careti/components/CaretPromptModeSelector'

// 설정 페이지에 새 섹션 추가
<div className="settings-section">
  <CaretPromptModeSelector />
</div>
```

#### 3.3 백엔드 메시지 처리 시스템 (0.5일)
```typescript
// careti-src/controllers/CaretPromptController.ts
export class CaretPromptController {
  constructor(
    private context: vscode.ExtensionContext,
    private promptManager: CaretPromptManager
  ) {}
  
  async handleSetPromptMode(message: { payload: { mode: 'careti' | 'cline' } }): Promise<void> {
    const newMode = message.payload.mode;
    
    // workspaceState에 모드 저장
    await this.context.workspaceState.update('careti.promptMode', newMode);
    
    // 실제 프롬프트 시스템 전환
    if (newMode === 'careti') {
      this.promptManager.switchToCaretMode();
    } else {
      this.promptManager.switchToClineMode();
    }
    
    console.log(`Prompt system switched to: ${newMode}`);
  }
}

// extension.ts에 컨트롤러 등록
const promptController = new CaretPromptController(context, promptManager);
webviewProvider.onMessage('careti/setPromptMode', (msg) => 
  promptController.handleSetPromptMode(msg)
);
```

**Phase 3 완료 기준**:
- [ ] **프론트엔드 모드 선택 UI 완성**
- [ ] **백엔드 메시지 처리 시스템 완성** 
- [ ] **workspaceState 영속성 구현**
- [ ] **실시간 모드 전환 동작** 검증

---

### **Phase 4: 실제 동작 테스트 및 검증 (1일)**
**목표**: E2E 테스트를 통한 전체 시스템 동작 검증

#### 4.1 E2E 테스트 시나리오 작성 및 실행
```typescript
// src/__tests__/e2e/careti-prompt-system.test.ts
describe('Careti Prompt System E2E', () => {
  it('should switch from Cline to Careti mode and show different prompts', async () => {
    // 1. 초기 상태: Cline 모드
    const initialPrompt = await getSystemPrompt(testContext);
    expect(initialPrompt).toContain('plan'); // cline 특징
    
    // 2. UI에서 Careti 모드로 전환
    await simulateUIAction('setPromptMode', 'careti');
    
    // 3. 변경된 프롬프트 확인
    const caretPrompt = await getSystemPrompt(testContext);
    expect(caretPrompt).toContain('CHATBOT MODE'); // Careti 특징
    expect(caretPrompt).toContain('AGENT MODE');
    
    // 4. 모드별 도구 제한 확인 (chatbot 모드일 때)
    const chatbotContext = { ...testContext, caretMode: 'chatbot' };
    const chatbotPrompt = await getSystemPrompt(chatbotContext);
    expect(chatbotPrompt).not.toContain('edit_file'); // 제한된 도구 확인
  });
});
```

#### 4.2 수동 검증 체크리스트
```bash
# F5로 확장 실행 후 수동 검증
1. [ ] 설정 페이지에서 "Careti 하이브리드 시스템" 선택
2. [ ] 새 채팅 시작 시 "CHATBOT MODE" 또는 "AGENT MODE" 표시 확인
3. [ ] CHATBOT 모드에서 파일 편집 도구 제한 확인
4. [ ] AGENT 모드에서 모든 도구 사용 가능 확인  
5. [ ] 확장 재시작 후 설정 유지 확인
```

**Phase 4 완료 기준**:
- [ ] **E2E 테스트 100% 통과**
- [ ] **수동 검증 체크리스트 완료**
- [ ] **모든 기능 정상 동작** 확인

---

### **Phase 5: 문서화 및 정리 (0.5일)**
**목표**: 구현 완료 후 문서화 및 코드 정리

#### 5.1 기술 문서 작성
- `t06-implementation-summary.md`: 실제 구현 내용 요약
- `t06-user-guide.md`: Careti 하이브리드 시스템 사용법

#### 5.2 코드 정리 및 최종 검증
```bash
# 최종 검증 명령어들
npm run compile    # 컴파일 오류 없음
npm run test:all   # 모든 테스트 통과
npm run lint       # 코드 품질 검증
```

**Phase 5 완료 기준**:
- [ ] **기술 문서 작성 완료**
- [ ] **전체 시스템 최종 검증** 완료

---

## 📈 **일정 및 리소스**

| Phase | 소요 시간 | 핵심 작업 | 완료 기준 |
|-------|-----------|-----------|-----------|
| **Phase 1** | 1일 | Careti JSON 시스템 생성 | 5개 JSON 파일 완성 |
| **Phase 2** | 2일 | 어댑터 및 관리자 구현 | 컴포넌트 교체 동작 |
| **Phase 3** | 2일 | 프론트엔드 UI + 백엔드 연동 | 실시간 모드 전환 |
| **Phase 4** | 1일 | E2E 테스트 및 검증 | 전체 기능 검증 |
| **Phase 5** | 0.5일 | 문서화 및 정리 | 프로젝트 완료 |
| **총계** | **6.5일** | **하이브리드 시스템 완성** | **완전한 모드 전환 시스템** |

---

## 🎯 **최종 성공 기준**

### Critical Success Factors
- [ ] **UI에서 Careti/Cline 모드 전환 가능** ⭐
- [ ] **CHATBOT/AGENT 모드별 다른 동작** 구현
- [ ] **모드별 도구 제한** (`mode_restriction`) 동작
- [ ] **설정 영속성** (확장 재시작 후에도 유지)

### Technical Quality 
- [ ] **모든 테스트 통과** (`npm run test:all`)
- [ ] **컴파일 오류 없음** (`npm run compile`)
- [ ] **코드 품질 검증** (`npm run lint`)

### User Experience
- [ ] **기존 Cline 사용자 경험 보존**
- [ ] **새로운 Careti 기능 제공**
- [ ] **직관적인 모드 전환 UI**

---

## 📝 **핵심 개선사항 요약**

### **기존 문서 대비 주요 수정**:
1. ✅ **현실적 분석**: 이미 통합된 `cline-latest` 인프라 활용
2. ✅ **단순화된 접근**: 복잡한 어댑터 대신 컴포넌트 교체
3. ✅ **구체적 실행**: JSON 생성 → 어댑터 → UI → 테스트 순서
4. ✅ **짧은 일정**: 불필요한 학습 곡선 제거로 6.5일로 단축

### **핵심 전략**:
**"완성된 시스템 + Careti 철학 주입"** = **최소 노력으로 최대 효과**

이제 실제 구현 가능한 정확한 계획이 완성되었습니다!