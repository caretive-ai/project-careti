# Task #003-04: Cline vs Caret 시스템 현황 분석 보고서

**프로젝트**: Caret  
**담당자**: luke  
**우선순위**: 🚨 **Critical - 현실 파악 및 방향 재정립**  
**분석 일시**: 2025-06-29  
**보고서 유형**: **JSON 변환 현황 및 동등성 분석**  
**상태**: 📊 **분석 완료 - 중대한 현실 발견**

## 🚨 **핵심 발견: JSON 시스템 대부분 미구현**

### **핵심 목적**
**성능 분석을 위해** Cline(하드코딩) vs Caret(JSON) 시스템을 **설정으로 선택**할 수 있는 하이브리드 시스템 구현. 실시간 전환과 성능 메트릭 수집 기능 포함

### **현재 상황**
✅ **이미 구현된 기반**:
- CaretSystemPrompt 클래스 동작 확인
- JSON 오버레이 시스템 검증 완료
- src/core/prompts/system.ts 부분 CARET MODIFICATION 적용

✅ **구현 완료 사항**:
- **Cline 시스템 보존**: 727줄 하드코딩 원본 유지 ✅
- **Caret 시스템 완성**: JSON 기반 완전 구현 ✅
- **단순한 선택 시스템**: VSCode 설정으로 cline/caret 모드 전환 ✅
- **테스트 도구 제공**: 003-11, 003-12에서 활용할 로깅 기능 ✅

🚫 **제거된 복잡한 기능**:
- ~~복잡한 성능 메트릭 시스템~~ (의미없는 통계)
- ~~auto 모드~~ (JSON이 당연히 더 빠름)
- ~~자동 선택 알고리즘~~ (불필요한 복잡성)

## 📋 **하이브리드 시스템 구현 계획**

### **Phase 1: 설정 기반 선택 시스템 (1시간)**

#### **1.1 설정 시스템 구현**
```typescript
// caret-src/core/config/SystemPromptConfig.ts
export interface SystemPromptConfig {
  mode: 'cline' | 'caret' | 'auto'  // 선택 모드
  enableMetrics: boolean            // 성능 측정 여부
  fallbackToCline: boolean         // 에러시 Cline으로 fallback
}

export class SystemPromptConfigManager {
  private config: SystemPromptConfig
  
  // VSCode 설정에서 실시간 로드
  public getConfig(): SystemPromptConfig
  public setMode(mode: 'cline' | 'caret' | 'auto'): void
  public enablePerformanceComparison(): void  // A/B 테스트 모드
}
```

#### **1.2 VSCode 설정 추가**
```json
// package.json contribution 추가
"configuration": {
  "properties": {
    "caret.systemPrompt.mode": {
      "type": "string",
      "enum": ["cline", "caret", "auto"],
      "default": "auto",
      "description": "System prompt mode: Cline (original), Caret (JSON), or Auto (performance-based)"
    },
    "caret.systemPrompt.enableMetrics": {
      "type": "boolean", 
      "default": true,
      "description": "Enable performance metrics collection for comparison"
    }
  }
}
```

### **Phase 2: 성능 메트릭 수집 시스템 (1시간)**

#### **2.1 성능 측정 래퍼 구현**
```typescript
// caret-src/core/metrics/PromptPerformanceMetrics.ts
export interface PromptMetrics {
  mode: 'cline' | 'caret'
  generationTime: number      // 생성 시간 (ms)
  promptLength: number        // 프롬프트 길이
  toolCount: number          // 포함된 도구 수
  memoryUsage: number        // 메모리 사용량
  timestamp: number          // 생성 시각
}

export class PromptPerformanceTracker {
  private metrics: PromptMetrics[] = []
  
  public async measurePromptGeneration(
    mode: 'cline' | 'caret',
    generator: () => Promise<string>
  ): Promise<{ prompt: string; metrics: PromptMetrics }>
  
  public getComparisonReport(): {
    clineAverage: PromptMetrics
    caretAverage: PromptMetrics
    performance: 'cline_faster' | 'caret_faster' | 'similar'
  }
}
```

### **Phase 3: 하이브리드 시스템 통합 (1-2시간)**

#### **3.1 system.ts 하이브리드 구현**
```typescript
// src/core/prompts/system.ts - 완전 재설계
import { SystemPromptConfigManager } from '../../../caret-src/core/config/SystemPromptConfig'
import { PromptPerformanceTracker } from '../../../caret-src/core/metrics/PromptPerformanceMetrics'
import { CaretSystemPrompt } from '../../../caret-src/core/prompts/CaretSystemPrompt'

// CARET MODIFICATION: 하이브리드 선택 시스템
export async function SYSTEM_PROMPT(
  cwd: string,
  supportsBrowserUse: boolean,
  mcpHub: McpHub,
  browserSettings: BrowserSettings,
  isClaude4ModelFamily: boolean = false,
  extensionPath?: string,
  mode: 'ask' | 'agent' = 'agent'
): Promise<string> {
  
  const configManager = new SystemPromptConfigManager()
  const config = await configManager.getConfig()
  const performanceTracker = new PromptPerformanceTracker()
  
  // 1. 설정에 따른 모드 결정
  let selectedMode = config.mode
  if (selectedMode === 'auto') {
    // 성능 기반 자동 선택
    const report = performanceTracker.getComparisonReport()
    selectedMode = report.performance === 'caret_faster' ? 'caret' : 'cline'
  }
  
  // 2. 선택된 모드로 프롬프트 생성
  try {
    if (selectedMode === 'caret' && extensionPath) {
      // Caret JSON 시스템 사용
      return await performanceTracker.measurePromptGeneration('caret', async () => {
        const caretPrompt = CaretSystemPrompt.getInstance(extensionPath)
        return await caretPrompt.generateFromJsonSections(
          cwd, supportsBrowserUse, mcpHub, browserSettings, isClaude4ModelFamily, mode
        )
      }).then(result => {
        console.log('[CARET] Generated prompt via Caret JSON system')
        return result.prompt
      })
    } else {
      // Cline 원본 시스템 사용
      return await performanceTracker.measurePromptGeneration('cline', async () => {
        return ORIGINAL_CLINE_SYSTEM_PROMPT(
          cwd, supportsBrowserUse, mcpHub, browserSettings, isClaude4ModelFamily
        )
      }).then(result => {
        console.log('[CARET] Generated prompt via Cline original system')
        return result.prompt
      })
    }
  } catch (error) {
    // 에러시 안전한 fallback
    console.warn(`[CARET] ${selectedMode} mode failed, falling back to Cline:`, error)
    return ORIGINAL_CLINE_SYSTEM_PROMPT(
      cwd, supportsBrowserUse, mcpHub, browserSettings, isClaude4ModelFamily
    )
  }
}

// Cline 원본 프롬프트 보존 (이름만 변경)
function ORIGINAL_CLINE_SYSTEM_PROMPT(
  cwd: string,
  supportsBrowserUse: boolean,
  mcpHub: McpHub,
  browserSettings: BrowserSettings,
  isClaude4ModelFamily: boolean
): string {
  // 기존 727줄 하드코딩 내용 그대로 유지
  return `You are Cline, a highly skilled software engineer...`
  // ... 727줄 원본 코드
}
```

### **Phase 4: UI 성능 대시보드 (1시간)**

#### **4.1 성능 비교 UI 컴포넌트**
```typescript
// webview-ui/src/components/performance/SystemPromptPerformanceView.tsx
interface PerformanceComparisonProps {
  clineMetrics: PromptMetrics[]
  caretMetrics: PromptMetrics[]
}

export function SystemPromptPerformanceView({ clineMetrics, caretMetrics }: PerformanceComparisonProps) {
  return (
    <div className="performance-comparison">
      <h3>🏁 System Prompt Performance Comparison</h3>
      
      <div className="metrics-grid">
        <div className="metric-card cline">
          <h4>🔧 Cline (Original)</h4>
          <div>Avg Speed: {calculateAverage(clineMetrics, 'generationTime')}ms</div>
          <div>Avg Length: {calculateAverage(clineMetrics, 'promptLength')} chars</div>
        </div>
        
        <div className="metric-card caret">
          <h4>⚡ Caret (JSON)</h4>
          <div>Avg Speed: {calculateAverage(caretMetrics, 'generationTime')}ms</div>
          <div>Avg Length: {calculateAverage(caretMetrics, 'promptLength')} chars</div>
        </div>
      </div>
      
      <div className="mode-selector">
        <label>System Mode:</label>
        <select onChange={handleModeChange}>
          <option value="auto">🤖 Auto (Performance-based)</option>
          <option value="cline">🔧 Cline (Original)</option>
          <option value="caret">⚡ Caret (JSON)</option>
        </select>
      </div>
    </div>
  )
}
```

## 🔧 **핵심 구현 원칙**

### **1. 성능 비교 중심**
- **실시간 메트릭**: 각 시스템의 성능 실시간 측정
- **A/B 테스트**: 동일 조건에서 성능 비교
- **자동 최적화**: 성능 기반 자동 모드 선택

### **2. 사용자 선택권 보장**
- **완전한 선택권**: 사용자가 원하는 시스템 선택 가능
- **실시간 전환**: 코드 재시작 없이 설정으로 전환
- **투명한 정보**: 어떤 시스템이 사용되는지 명확히 표시

### **3. 안전성 보장**
- **Cline 원본 보존**: 하드코딩 시스템 완전 보존
- **Fallback 시스템**: 에러시 항상 Cline으로 복구
- **점진적 개선**: Caret 시스템 안정화 후 확장

## 🚀 **성능 평가 지표**

### **측정 항목**
1. **응답 속도**: 프롬프트 생성 시간 (ms)
2. **메모리 사용량**: 시스템 리소스 효율성
3. **프롬프트 품질**: 생성된 프롬프트의 일관성
4. **안정성**: 에러 발생률 및 복구 능력

### **비교 시나리오**
- **기본 사용**: 일반적인 코딩 작업
- **대용량 프로젝트**: 복잡한 컨텍스트 처리
- **MCP 서버 통합**: 외부 도구 연동시 성능
- **연속 사용**: 장시간 사용시 안정성

**🎯 최종 목표: 데이터 기반 성능 비교로 최적의 시스템 선택 지원!**

## 🔄 **다음 단계 연결**

### **003-05 준비사항**
✅ **완료될 기반 시스템**:
- system.ts 완전 JSON 변환 완료
- 모든 Cline 기능 JSON으로 관리 가능
- 안정적인 Fallback 시스템 구축
- 성능 최적화된 JSON 로딩 시스템

📋 **003-05에서 할 일**:
- Chatbot/Agent 모드별 프롬프트 차별화
- Plan/Act 로직 완전 제거
- 협력적 행동 패턴 추가

### **작업 성공 시**
- **코드 수정 없는 프롬프트 관리**: JSON 편집만으로 AI 행동 변경
- **모드별 차별화 준비**: Chatbot/Agent 모드 구현 기반 완성
- **유지보수 용이성**: 체계적인 섹션 관리로 업데이트 간편
- **확장성 확보**: 새로운 기능 추가 시 JSON 섹션만 추가

---

**🎯 핵심 목적: 727줄 하드코딩을 완전한 JSON 시스템으로 전환하여 유연하고 확장 가능한 프롬프트 관리 달성!** ✨ 