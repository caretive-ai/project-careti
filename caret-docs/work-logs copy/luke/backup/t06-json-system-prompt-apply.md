# t06 하이브리드 시스템 구현 작업 기록

> 이 문서는 `t06-hybrid-system-implement-plan-unified.md` 계획에 따라 'JSON 시스템 프롬프트' 구현 작업의 진행 상황을 기록합니다.

## 📋 프로젝트 개요

### 🎯 최종 목표
`cline-latest`의 **진보된 컴포넌트 아키텍처**와 **작업 관리 루프**를 구조적 뼈대로 채택하고, Caret의 **CHATBOT/AGENT 행동 철학**과 **JSON 기반 콘텐츠 관리**의 장점을 완벽하게 통합한 **궁극의 하이브리드 프롬프트 시스템** 구축

### 핵심 전략: "구조는 cline-latest, 영혼은 Caret"
- **기반 아키텍처**: `cline-latest`의 `PromptRegistry` + 컴포넌트 시스템
- **핵심 철학**: Caret의 CHATBOT/AGENT 모드 + JSON 콘텐츠 관리 
- **통합 패턴**: `CaretJsonComponentProvider` 어댑터 + `PromptSystemManager` 전략

## 🎯 핵심 성과 지표

### Critical Success Factors (필수)
- [ ] **Mission 1B-1 테스트 통과** ⭐ (프로젝트 성패 결정)
- [ ] **토큰 효율성 14.1% 이상 유지** (Alpha 검증된 우위)
- [ ] **전체 테스트 통과** (`npm run test:all` 100% 성공)
- [ ] **기존 Caret 사용자 경험 완전 보존**

### Key Performance Indicators
- [ ] **cline-latest 3대 신규 컴포넌트 완전 통합**
  - `auto_todo.ts`: 자동 TODO 관리
  - `task_progress.ts`: 실시간 진행상황 추적  
  - `feedback.ts`: 피드백 및 질문 응답 시스템
- [ ] **프론트엔드 모드 전환 시스템** (Caret ↔ Cline)
- [ ] **JSON 콘텐츠 수정 용이성** 보존

## 📊 위험 분석 및 대응 전략

### 🚨 Critical Risks
| 위험 요소 | 영향도 | 확률 | 대응 전략 |
|----------|--------|------|-----------|
| **Mission 1B-1 테스트 블로킹** | 극높음 | 높음 | Phase 1에서 JSON 시스템 우선 이식으로 경로 의존성 제거 |
| **PromptRegistry 학습 곡선** | 높음 | 중간 | Phase 0 충분한 분석 + 프로토타입 개발 |

### ⚠️ Medium Risks
| 위험 요소 | 영향도 | 확률 | 대응 전략 |
|----------|--------|------|-----------|
| **어댑터 구현 복잡성** | 중간 | 중간 | TDD 기반 단계별 구현으로 복잡도 관리 |
| **프론트엔드 통합 이슈** | 중간 | 낮음 | E2E 테스트 우선 작성으로 요구사항 명확화 |

### 💡 Low Risks
- **용어 혼재**: 명확한 매핑 테이블로 일관성 유지
- **성능 저하**: 캐싱 및 최적화로 사전 대응

## 🗓️ 단계별 구현 계획 (총 5 Phases)

### **Phase 0: 심층 분석 및 설계 ✅ (완료)**
**소요 시간**: 완료  
**주요 산출물**:
- `t06-phase0-analysis-alpha.md`: cline-latest 구조 완전 분석
- `t06-phase0-analysis-claude.md`: 통합 전략 수립
- `t06-hybrid-system-design.md`: 어댑터 패턴 설계
- **토큰 효율성 검증**: Caret 시스템 14.1% 우위 확인

---

### **Phase 1: 핵심 인프라 구축 및 Mission 1B-1 해결 (2-3일)**
**목표**: `cline-latest` 시스템 완전 이해 + 어댑터 뼈대 구축 + 블로킹 테스트 해결

#### **1.1 cline-latest 시스템 심층 학습 (0.5일)**
**TDD 접근법**:
```typescript
// [RED] 테스트 작성
describe('PromptRegistry Integration', () => {
    it('should understand component registration mechanism', () => {
        // 기대: registerComponent() 메커니즘 완전 파악
    });
    
    it('should analyze 3 new components (TODO, TASK_PROGRESS, FEEDBACK)', () => {
        // 기대: 신규 컴포넌트 작동 방식 이해
    });
});
```

**검증 기준**:
- [ ] `PromptRegistry.registerComponent()` 메커니즘 100% 이해
- [ ] 기존 13개 컴포넌트 등록/호출 흐름 완전 파악
- [ ] 신규 3대 컴포넌트 작동 방식 상세 분석

#### **1.2 어댑터 클래스 뼈대 구현 (1일)**
**핵심 아키텍처**: 어댑터 패턴 + 전략 패턴 + TDD

**[선행 작업] 의존성 및 경로 설정**
1.  **`tsconfig.json` 수정**: `cline-latest` 소스 코드를 안전하게 참조하기 위해 `paths`에 `@cline-latest/*` 별칭을 추가합니다.
    ```json
    "paths": {
        // ... existing paths
        "@cline-latest/*": ["cline-latest/src/*"]
    },
    "include": [
        // ... existing includes
        "cline-latest/src/**/*"
    ]
    ```

**[RED] TDD - 실패하는 테스트 작성**
-   `caret-src/core/prompts/`에 `PromptSystemManager.test.ts` 파일을 생성하고, `switchMode`가 'caret' 모드일 때 `CaretJsonComponentProvider`의 `registerCaretComponents` 메소드를 호출하는지 검증하는 실패하는 테스트를 작성합니다.

**[GREEN] TDD - 테스트를 통과하는 최소 코드 구현**
```typescript
// caret-src/core/prompts/CaretJsonComponentProvider.ts
import { PromptRegistry } from "@cline-latest/core/prompts/system-prompt/registry/PromptRegistry";
import { ComponentFunction } from "@cline-latest/core/prompts/system-prompt/types";
import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager";
import * as fs from "fs";
import * as path from "path";

export class CaretJsonComponentProvider {
    // ... (내부 구현)
    // JSON 로딩 시 하드코딩된 경로 대신 안정적인 경로 탐색 로직 추가
}

// caret-src/core/prompts/PromptSystemManager.ts (전략 패턴)
import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager";

export class PromptSystemManager {
    // ... (싱글톤 구현)
    
    public switchMode(mode: 'caret' | 'cline'): void {
        const registry = PromptRegistry.getInstance();
        // registry.clear(); // TODO: clear 로직 확인 필요

        // CaretGlobalManager를 통해 중앙에서 관리되는 모드 사용
        if (CaretGlobalManager.currentMode === 'caret') {
            const provider = new CaretJsonComponentProvider();
            provider.registerCaretComponents();
        } else {
            // cline 원본 컴포넌트 등록
            registerOriginalComponents();
        }
    }
}
```

**검증 기준**:
- [ ] **`tsconfig.json`에 `@cline-latest` 경로 별칭 추가 완료** (계획 수정: `cline-latest`는 참고용이므로 직접 경로를 추가하지 않고, 필요한 로직을 `caret-src`에 재구현하는 방식으로 변경)
- [ ] **TDD 테스트 케이스(실패) 작성 완료**
- [ ] TypeScript 컴파일 오류 0개
- [ ] JSON 파일 로딩 정상 동작 (개선된 경로 로직)
- [ ] 최소 1개 컴포넌트 어댑터 작동 확인
- [ ] **`CaretGlobalManager` 연동 확인**

#### **1.3 Mission 1B-1 테스트 우선 해결 (1일)**
**문제 분석**: `@utils/shell` 경로 별칭 오류로 인한 테스트 블로킹

**해결 전략**:
```typescript
// [RED] Mission 1B-1 테스트를 먼저 통과시키는 최소 구현
describe('Mission 1B-1 Integration', () => {
    it('should resolve @utils/shell path alias error', () => {
        // JSON 시스템으로 하드코딩 의존성 제거
        const prompt = CaretJsonComponentProvider.buildPrompt();
        expect(prompt).not.toThrow(); // 경로 오류 없이 실행
    });
});

// [GREEN] JSON 시스템으로 경로 의존성 우회
adaptToolDefinitions(): ComponentFunction {
    return async (variant, context) => {
        const json = this.loadJsonSection('TOOL_DEFINITIONS');
        // @utils/shell 대신 JSON에서 직접 로드
        return json.tools.map(tool => tool.description).join('\n');
    };
}
```

**검증 기준**:
- [ ] Mission 1B-1 테스트 통과 ⭐
- [ ] 경로 별칭 오류 완전 해결
- [ ] 다른 테스트에 영향 없음 확인

#### **1.4 시스템 연동 및 분기 로직 (0.5일)**
```typescript
// src/core/prompts/system-prompt/build-system-prompt.ts
// CARET MODIFICATION: 하이브리드 시스템 분기 로직

export async function buildSystemPrompt(...args): Promise<string> {
    const modeSystem = HostProvider.caret?.getCurrentMode();
    
    if (modeSystem === "caret") {
        // Caret 하이브리드 시스템
        const manager = PromptSystemManager.getInstance();
        manager.switchMode('caret');
        return registry.buildPrompt(context);
    }
    
    // 기존 cline-latest 시스템
    return buildOriginalSystemPrompt(...args);
}
```

**Phase 1 완료 기준**:
- [ ] **Mission 1B-1 테스트 통과** ⭐ (최우선)
- [ ] **어댑터 뼈대 완성** (최소 1개 컴포넌트)
- [ ] **시스템 분기 로직 정상 동작**
- [ ] **컴파일 안정성** (`npm run compile` 성공)

---

### **Phase 2: 핵심 컴포넌트 이식 및 철학 통합 (3-4일)**
**목표**: Caret 핵심 JSON 섹션을 cline-latest 컴포넌트로 변환 + CHATBOT/AGENT 철학 반영

#### **2.1 우선순위별 컴포넌트 분류 (0.5일)**
**High Priority (필수 기능)**:
1. `CHATBOT_AGENT_MODES.json` → `act_vs_plan_mode.ts` **완전 교체**
2. `OBJECTIVE.json` → `agent_role.ts` 콘텐츠 주입  
3. `TOOL_DEFINITIONS.json` → `tool_use_section.ts` 통합
4. `SYSTEM_INFORMATION.json` → `system_info.ts` 교체

**Medium Priority (향상 기능)**:
5. `CAPABILITIES_SUMMARY.json` → `capabilities.ts`
6. `COLLABORATIVE_PRINCIPLES.json` → 신규 컴포넌트 생성
7. `EDITING_FILES_GUIDE.json` → `tool_use_section.ts` 통합

#### **2.2 CHATBOT/AGENT 철학 핵심 이식 (1.5일)**
**핵심 문제 해결**: cline-latest의 기술적 `Act/Plan` 용어를 Caret의 철학적 `Chatbot/Agent` 용어로 교체

```typescript
// [RED] 테스트: Caret 철학 반영
describe('ChatbotAgentModes Adapter', () => {
    it('should replace Act/Plan with Chatbot/Agent philosophy', () => {
        const context = { mode: 'agent' };
        const result = adaptChatbotAgentModes()(null, context);
        expect(result).toContain('AGENT MODE - 협력적 개발 파트너');
        expect(result).not.toContain('ACT MODE'); // cline 용어 제거
    });
    
    it('should apply mode restrictions correctly', () => {
        const context = { mode: 'chatbot' };
        const result = adaptToolDefinitions()(null, context);
        // chatbot 모드에서는 위험 도구 제한
        expect(result).not.toContain('file editing tools');
    });
});

// [GREEN] 구현
adaptChatbotAgentModes(): ComponentFunction {
    return async (variant, context) => {
        const json = this.loadJsonSection('CHATBOT_AGENT_MODES');
        const mode = context.mode; // "chatbot" | "agent"
        
        if (mode === 'chatbot') {
            return json.chatbot_mode.content;
        } else if (mode === 'agent') {
            return json.agent_mode.content;
        }
        
        return json.default?.content || '';
    };
}

// mode_restriction 로직 구현
adaptToolDefinitions(): ComponentFunction {
    return async (variant, context) => {
        const json = this.loadJsonSection('TOOL_DEFINITIONS');
        const currentMode = context.mode;
        
        return json.tools
            .filter(tool => {
                // mode_restriction이 없거나 현재 모드와 일치하는 경우만 포함
                return !tool.mode_restriction || 
                       tool.mode_restriction === currentMode;
            })
            .map(tool => `**${tool.title}**: ${tool.description}`)
            .join('\n\n');
    };
}
```

#### **2.3 신규 작업 관리 루프 Caret화 (1.5일)**
**목표**: cline-latest의 3대 신규 컴포넌트를 Caret 철학과 융합

```typescript
// 새로운 JSON 파일 생성: CARET_TODO_MANAGEMENT.json
{
  "chatbot_mode": {
    "content": "TODO 관리를 통한 체계적 상담 접근:\n- 분석 결과를 체크리스트로 정리\n- 사용자 질문에 구조적으로 대응\n- 제안사항을 단계별로 제시"
  },
  "agent_mode": {
    "content": "TODO 관리를 통한 협력적 개발 접근:\n- 실행 계획을 체크리스트로 공유\n- 진행상황을 투명하게 보고\n- 사용자와 협력하여 목표 달성"
  }
}

// CaretTodoManager.ts 구현
class CaretTodoManager {
    generateModeSpecificTodo(mode: "chatbot" | "agent", context: any): string {
        const json = this.loadJsonSection('CARET_TODO_MANAGEMENT');
        const modeConfig = json[`${mode}_mode`];
        
        // 기존 cline TODO와 Caret 스타일 융합
        return `${modeConfig.content}\n\n${this.generateBasicTodo(context)}`;
    }
}

// 기존 auto_todo.ts와 연동
adaptAutoTodo(): ComponentFunction {
    return async (variant, context) => {
        const manager = new CaretTodoManager();
        return manager.generateModeSpecificTodo(context.mode, context);
    };
}
```

#### **2.4 통합 테스트 및 검증 (0.5일)**
```bash
# 전체 프롬프트 생성 테스트
npm run test:backend -- --grep "system-prompt"

# 토큰 효율성 재검증
node caret-scripts/utils/token-efficiency-analyzer.js

# Caret 철학 반영 확인
npm run test:backend -- --grep "ChatbotAgent"
```

**Phase 2 완료 기준**:
- [ ] **High Priority 컴포넌트 100% 이식** (4개)
- [ ] **CHATBOT/AGENT 철학 완전 반영**
- [ ] **모드별 도구 제한 정상 동작** (`mode_restriction`)
- [ ] **토큰 효율성 14.1% 이상 유지**
- [ ] **신규 작업 관리 루프 Caret 버전 완성**

---

### **Phase 3: 프론트엔드 통합 및 모드 전환 시스템 (2-3일)**
**목표**: 사용자가 UI에서 Caret/Cline 프롬프트 시스템을 전환할 수 있는 완전한 시스템 구현

#### **3.1 E2E 테스트 우선 설계 (1일)**
**TDD 핵심**: UI 요구사항을 테스트로 먼저 명확화

```typescript
// [RED] E2E 테스트 작성
describe('Prompt System Mode Switching E2E', () => {
    it('should switch from Cline to Caret mode via UI', async () => {
        // 1. 초기 상태: Cline 모드
        const initialPrompt = await buildSystemPrompt();
        expect(initialPrompt).toContain('ACT MODE');
        
        // 2. UI 조작: Caret 모드로 전환
        await webview.selectOption('#prompt-system-selector', 'caret');
        
        // 3. 백엔드 상태 변경 확인
        const savedMode = await workspaceState.get('caret.promptSystem.mode');
        expect(savedMode).toBe('caret');
        
        // 4. 프롬프트 시스템 실제 변경 확인
        const newPrompt = await buildSystemPrompt();
        expect(newPrompt).toContain('AGENT MODE - 협력적 개발 파트너');
        expect(newPrompt).not.toContain('ACT MODE');
    });
    
    it('should preserve mode selection across extension reloads', async () => {
        // 모드 설정 → 확장 재시작 → 모드 유지 확인
    });
});
```

#### **3.2 프론트엔드 UI 구현 (1일)**
**위치**: `webview-ui/src/components/settings/providers/`

```typescript
// [GREEN] UI 컴포넌트 구현
const PromptSystemSelector: React.FC = () => {
    const [currentMode, setCurrentMode] = useState<'caret' | 'cline'>('cline');
    
    const handleModeChange = (newMode: 'caret' | 'cline') => {
        setCurrentMode(newMode);
        
        // 백엔드로 모드 변경 메시지 전송
        vscode.postMessage({
            type: 'promptSystem/setMode',
            payload: newMode
        });
    };
    
    return (
        <div className="prompt-system-selector">
            <label>프롬프트 시스템:</label>
            <select 
                id="prompt-system-selector"
                value={currentMode} 
                onChange={(e) => handleModeChange(e.target.value as 'caret' | 'cline')}
            >
                <option value="cline">Cline 원본</option>
                <option value="caret">Caret 하이브리드</option>
            </select>
            <p className="description">
                {currentMode === 'caret' 
                    ? 'Caret의 CHATBOT/AGENT 모드 + JSON 콘텐츠 관리'
                    : 'Cline 원본 프롬프트 시스템'
                }
            </p>
        </div>
    );
};
```

#### **3.3 백엔드 메시지 핸들링 구현 (0.5일)**
```typescript
// caret-src/controllers/PromptSystemController.ts
class PromptSystemController {
    async handleSetMode(message: { payload: 'caret' | 'cline' }): Promise<void> {
        const newMode = message.payload;
        
        // 1. workspaceState에 모드 저장
        await this.context.workspaceState.update('caret.promptSystem.mode', newMode);
        
        // 2. PromptSystemManager를 통해 실제 모드 전환
        const manager = PromptSystemManager.getInstance();
        manager.switchMode(newMode);
        
        // 3. 프론트엔드에 완료 응답
        this.webviewProvider.postMessage({
            type: 'promptSystem/modeChanged',
            payload: newMode
        });
    }
}

// extension.ts 메시지 라우팅 추가
export function activate(context: vscode.ExtensionContext) {
    const promptController = new PromptSystemController(context);
    
    // 메시지 핸들러 등록
    webviewProvider.onMessage('promptSystem/setMode', 
        (msg) => promptController.handleSetMode(msg));
        
    // 확장 시작 시 저장된 모드로 초기화
    const savedMode = context.workspaceState.get('caret.promptSystem.mode', 'cline');
    PromptSystemManager.getInstance().switchMode(savedMode);
}
```

#### **3.4 통합 테스트 및 사용자 시나리오 검증 (0.5일)**
**테스트 시나리오**:
```bash
# 1. 단위 테스트
npm run test:backend -- --grep "PromptSystemManager"

# 2. 프론트엔드 테스트  
npm run test:webview -- --grep "PromptSystemSelector"

# 3. E2E 통합 테스트
npm run test:all -- --grep "Prompt System Mode Switching"

# 4. 수동 검증 (F5 실행)
- UI에서 모드 전환 → 로그로 프롬프트 변경 확인
- 확장 재시작 → 모드 설정 유지 확인
```

**Phase 3 완료 기준**:
- [ ] **프론트엔드 모드 전환 UI 완성**
- [ ] **백엔드 모드 관리 시스템 완성**
- [ ] **E2E 테스트 100% 통과**
- [ ] **사용자 시나리오 검증 완료**
- [ ] **모드 설정 영속성 보장**

---

### **Phase 4: 시스템 안정화 및 성능 최적화 (2일)**
**목표**: 전체 시스템 안정성 + 성능 최적화 + 품질 보증

#### **4.1 전체 테스트 통과 작업 (1일)**
**우선순위별 해결**:
```bash
# 1. Critical: 컴파일 오류 해결
npm run compile 2>&1 | grep "error"
# 타입 오류, import 경로 오류 우선 해결

# 2. High: Mission 1B-1 재검증
npm run test:all -- --grep "Mission 1B-1"
# Phase 1에서 해결된 내용 재확인

# 3. Medium: 백엔드 테스트
npm run test:backend
# 모든 어댑터 및 컴포넌트 테스트

# 4. Low: 프론트엔드 호환성
npm run test:webview
# UI 변경사항 영향도 확인
```

**오류 해결 체계**:
1. **컴파일 오류** → 즉시 수정 (진행 블로킹)
2. **테스트 실패** → 당일 해결 (기능 품질 보장)  
3. **경고 메시지** → 차순위 해결 (코드 품질)

#### **4.2 성능 최적화 (0.5일)**
```typescript
// JSON 로딩 캐싱 최적화
class CaretJsonComponentProvider {
    private static jsonCache = new Map<string, any>();
    private static isInitialized = false;
    
    private loadJsonSection(name: string): any {
        if (!CaretJsonComponentProvider.jsonCache.has(name)) {
            const content = fs.readFileSync(this.getJsonPath(name), 'utf8');
            CaretJsonComponentProvider.jsonCache.set(name, JSON.parse(content));
        }
        return CaretJsonComponentProvider.jsonCache.get(name);
    }
    
    // 컴포넌트 등록 최적화 (중복 등록 방지)
    public registerCaretComponents(): void {
        if (CaretJsonComponentProvider.isInitialized) return;
        
        // 모든 컴포넌트 일괄 등록
        this.registerAllComponents();
        CaretJsonComponentProvider.isInitialized = true;
    }
}
```

#### **4.3 토큰 효율성 최종 검증 (0.5일)**
```bash
# 최종 하이브리드 시스템 vs cline-latest 비교
node caret-scripts/utils/token-efficiency-analyzer.js \
  --caret-system "caret-src/core/prompts/" \
  --cline-system "src/core/prompts/system-prompt/" \
  --output "t06-final-efficiency-report.json"

# 목표: 14.1% 이상 효율성 유지
# 결과: 상세 보고서 생성
```

**Phase 4 완료 기준**:
- [ ] **`npm run test:all` 100% 통과** ⭐
- [ ] **컴파일 오류 0개**
- [ ] **토큰 효율성 14.1% 이상**
- [ ] **성능 최적화 완료**
- [ ] **코드 품질 검증 통과** (`npm run lint`)

---

### **Phase 5: 문서화 및 최종 검증 (1일)**
**목표**: 프로젝트 완료 문서화 + 품질 보증 + 인수 기준 확인

#### **5.1 기술 문서 작성 (0.5일)**
**필수 문서**:
```
1. t06-implementation-guide.md
   - 어댑터 패턴 구현 가이드
   - JSON → ComponentFunction 변환 방법
   - 프론트엔드 모드 전환 사용법

2. t06-user-migration-guide.md
   - 기존 Caret 사용자 마이그레이션 가이드
   - 새로운 작업 관리 루프 활용법
   - Chatbot/Agent 모드 최적 활용 방법

3. t06-performance-analysis.md
   - 토큰 효율성 측정 결과 (14.1% 우위)
   - 성능 최적화 내용 상세
   - cline-latest 대비 벤치마크 데이터
```

#### **5.2 최종 인수 검증 (0.5일)**
**Complete Acceptance Test**:
```bash
# 1. 시스템 안정성
✅ npm run compile        # 컴파일 성공
✅ npm run test:all       # 전체 테스트 통과
✅ npm run lint           # 코드 품질 기준
✅ npm run check-types    # 타입 안전성

# 2. 핵심 기능 검증
✅ Mission 1B-1 테스트 통과
✅ Chatbot 모드 → 상담/분석 기능 정상
✅ Agent 모드 → 실행/협력 기능 정상  
✅ UI 모드 전환 → 실시간 프롬프트 변경
✅ 작업 관리 루프 → TODO/진행상황/피드백

# 3. 사용자 경험 검증
✅ 기존 Caret 경험 100% 보존
✅ 새로운 cline-latest 기능 활용 
✅ JSON 콘텐츠 수정 → 즉시 반영
✅ 토큰 효율성 우위 유지 (14.1%+)
```

**Phase 5 완료 기준**:
- [ ] **기술 문서 3개 완료**
- [ ] **최종 인수 검증 100% 통과**
- [ ] **프로젝트 완료 보고서 작성**

---

## 📈 프로젝트 관리 체계

### 일일 진척 관리
**매일 진행상황 체크 (오후 6시)**:
```
✅ 오늘 완료된 작업: [구체적 산출물과 검증 결과]
⚠️ 발견된 이슈: [기술적 문제, 설계 변경사항]  
📋 내일 작업: [우선순위와 예상 소요 시간]
🚨 위험 요소: [블로커, 의존성 문제]
```

### 위험 대응 프로토콜
**🚨 Critical (프로젝트 중단 위험)**:
- **즉시 에스컬레이션**: 다른 AI 협의 + 대안 전략
- **롤백 준비**: 이전 Phase로 되돌릴 수 있는 백업
- **타임라인 재조정**: 우선순위 재설정

**⚠️ Medium (지연 위험)**:
- **당일 해결**: 최대 4시간 집중 투입
- **차선책 적용**: 임시 해결로 진행 유지
- **다음 Phase 근본 해결**: 기술 부채 누적 방지

### Quality Gates (Phase별 필수 통과 조건)
```
Gate 1: Mission 1B-1 해결 + 어댑터 뼈대 + 컴파일 성공
Gate 2: Caret 철학 반영 + 핵심 컴포넌트 + 토큰 효율성 유지
Gate 3: 프론트엔드 통합 + 모드 전환 + E2E 테스트 통과
Gate 4: 전체 테스트 통과 + 성능 최적화 완료
Gate 5: 문서화 완료 + 최종 인수 검증 통과
```

## ⏰ 전체 일정 요약

| Phase | 기간 | 핵심 목표 | 완료 조건 |
|-------|------|-----------|-----------|
| **Phase 0** | ✅ 완료 | 분석 및 설계 | 문서 작성 완료 |
| **Phase 1** | 2-3일 | 인프라 + Mission 1B-1 해결 | 블로킹 테스트 통과 + 어댑터 뼈대 |
| **Phase 2** | 3-4일 | 핵심 컴포넌트 + Caret 철학 | CHATBOT/AGENT 반영 + 토큰 효율성 |
| **Phase 3** | 2-3일 | 프론트엔드 통합 + 모드 전환 | UI 모드 전환 + E2E 테스트 |
| **Phase 4** | 2일 | 안정화 + 최적화 | 전체 테스트 통과 + 성능 최적화 |
| **Phase 5** | 1일 | 문서화 + 검증 | 최종 인수 검증 완료 |
| **총 소요** | **10-13일** | **하이브리드 시스템 완성** | **모든 성공 기준 달성** |

---

## 🎯 최종 성공 기준 체크리스트

### Critical Success Factors
- [ ] **Mission 1B-1 테스트 통과** ⭐ (프로젝트 성패)
- [ ] **전체 테스트 통과** (`npm run test:all`)  
- [ ] **토큰 효율성 14.1% 이상**
- [ ] **기존 Caret 사용자 경험 100% 보존**

### Technical Achievements  
- [ ] **cline-latest 3대 신규 기능 완전 통합**
- [ ] **CHATBOT/AGENT 철학 완전 보존**
- [ ] **JSON 콘텐츠 관리 시스템 유지**
- [ ] **프론트엔드 모드 전환 시스템 완성**

### User Experience Goals
- [ ] **새로운 작업 관리 루프 이점 제공**
- [ ] **Chatbot vs Agent 모드 차별화 명확**  
- [ ] **JSON 수정 용이성 보존**
- [ ] **한국어 i18n 지원 유지**

---

## 📝 결론

본 통합 구현 계획은 **Alpha의 구체적 TDD 접근법**과 **Claude의 체계적 위험 관리**를 결합하여 수립된 **실행 가능하고 안전한 로드맵**입니다.

**핵심 개선사항**:
- ✅ **Mission 1B-1 우선 해결**: Phase 1에서 블로킹 테스트 해결을 최우선 과제로 설정
- ✅ **TDD 기반 단계적 구현**: 모든 Phase에서 RED-GREEN-REFACTOR 사이클 적용  
- ✅ **위험 기반 우선순위**: Critical Risk를 Phase 초반에 집중 해결
- ✅ **프론트엔드 통합 강화**: E2E 테스트 우선 설계로 UI 요구사항 명확화
- ✅ **품질 보증 체계**: Phase별 Quality Gate로 품질 저하 방지

**예상 결과**: `cline-latest`의 **구조적 발전**과 Caret의 **철학적 우위**가 완벽하게 융합된 **궁극의 하이브리드 프롬프트 시스템** 완성
