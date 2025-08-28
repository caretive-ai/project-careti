# Task #003-02: Cline 원본 래퍼 구현

**프로젝트**: Caret  
**담당자**: luke  
**우선순위**: 🚨 **Critical - 안전한 기반 구축**  
**예상 시간**: 2-3시간  
**상태**: 📋 **준비 완료** - 003-01 완료 후 진행  
**의존성**: 003-01 (검증 시스템) 완료 필수

## 🎯 **목표**

**핵심 목적**: Cline의 SYSTEM_PROMPT를 그대로 호출하는 단순한 래퍼를 구현하여, 기능 변경 없이 Caret 시스템으로 통합하는 첫 번째 안전한 단계 완료

### **세부 목표**
1. **완전한 기능 보존**: Cline 원본과 100% 동일한 동작 보장
2. **래퍼 시스템 구축**: 향후 JSON 오버레이 적용을 위한 기반 마련
3. **검증 시스템 적용**: 003-01에서 구축한 검증 시스템으로 안전성 확인
4. **성능 영향 최소**: 래퍼 오버헤드 5% 이하 유지

## 🎨 **설계 철학**

### **단순함이 최고 (KISS 원칙)**
```typescript
// ✅ 올바른 래퍼 접근 방식
class CaretSystemPrompt {
  async generatePrompt(context: PromptContext): Promise<string> {
    // 1단계: 단순히 Cline 원본 호출
    return await SYSTEM_PROMPT(
      context.cwd,
      context.supportsBrowserUse,
      context.mcpHub,
      context.browserSettings,
      context.isClaude4ModelFamily
    )
  }
}

// ❌ 피해야 할 복잡한 접근
// - 프롬프트 파싱/재구성
// - 복잡한 변환 로직
// - 기능 추가/제거
```

**🎯 이 단계의 목적**:
- **신뢰 구축**: Caret 시스템이 Cline과 동일하게 작동함을 증명
- **기반 마련**: JSON 오버레이를 위한 안전한 플랫폼 제공
- **검증 확인**: 검증 시스템이 정상 작동함을 실증

## 📋 **구현 계획**

### **Phase 0: 설계 및 검증 (30분)**
1. **래퍼 인터페이스 설계**: 기존 SYSTEM_PROMPT와 호환되는 인터페이스
2. **검증 계획 수립**: 003-01 검증 시스템 활용 방법
3. **성능 측정 기준**: 래퍼 오버헤드 측정 방법

### **Phase 1: 기본 래퍼 구현 (1시간)**
1. **CaretSystemPrompt 클래스**:
   ```typescript
   // caret-src/core/prompts/CaretSystemPrompt.ts
   export class CaretSystemPrompt {
     async generateSystemPrompt(context: SystemPromptContext): Promise<string>
     private async callOriginalSystemPrompt(context: SystemPromptContext): Promise<string>
     private async logPromptGeneration(context: SystemPromptContext, result: string): Promise<void>
   }
   ```

2. **컨텍스트 타입 정의**:
   - 기존 SYSTEM_PROMPT 파라미터 래핑
   - 향후 확장 가능한 구조 준비

### **Phase 2: 통합 및 검증 (1시간)**
1. **기존 시스템 통합**:
   - caret-src/extension.ts에서 CaretSystemPrompt 사용
   - 기존 호출 지점들 단계적 교체

2. **검증 시스템 적용**:
   - 003-01의 ClineFeatureValidator로 검증
   - 원본 vs 래퍼 결과 비교 테스트

### **Phase 3: 최적화 및 모니터링 (30분)**
1. **성능 최적화**:
   - 불필요한 오버헤드 제거
   - 캐싱 전략 (필요시)

2. **로깅 및 모니터링**:
   - CaretLogger를 통한 상세 로깅
   - 성능 메트릭 수집

## 🔧 **기술적 구현 상세**

### **핵심 클래스 설계**
```typescript
// caret-src/core/prompts/CaretSystemPrompt.ts
import { SYSTEM_PROMPT } from "../../../src/core/prompts/system"
import { McpHub } from "../../../src/services/mcp/McpHub"
import { BrowserSettings } from "../../../src/shared/BrowserSettings"
import { CaretLogger } from "../../utils/caret-logger"

export interface SystemPromptContext {
  cwd: string
  supportsBrowserUse: boolean
  mcpHub: McpHub
  browserSettings: BrowserSettings
  isClaude4ModelFamily?: boolean
}

export interface SystemPromptMetrics {
  generationTime: number
  promptLength: number
  toolCount: number
  mcpServerCount: number
}

export class CaretSystemPrompt {
  private caretLogger: CaretLogger
  private metrics: SystemPromptMetrics[]

  constructor() {
    this.caretLogger = CaretLogger.getInstance()
    this.metrics = []
  }

  async generateSystemPrompt(context: SystemPromptContext): Promise<string> {
    const startTime = Date.now()
    
    try {
      this.caretLogger.info('[CaretSystemPrompt] Generating system prompt', {
        cwd: context.cwd,
        supportsBrowserUse: context.supportsBrowserUse,
        isClaude4ModelFamily: context.isClaude4ModelFamily,
        mcpServerCount: context.mcpHub.getServers().length
      })

      // Cline 원본 호출 (완전히 동일한 파라미터)
      const systemPrompt = await this.callOriginalSystemPrompt(context)
      
      // 메트릭 수집
      const metrics: SystemPromptMetrics = {
        generationTime: Date.now() - startTime,
        promptLength: systemPrompt.length,
        toolCount: this.extractToolCount(systemPrompt),
        mcpServerCount: context.mcpHub.getServers().length
      }
      
      this.metrics.push(metrics)
      await this.logPromptGeneration(context, systemPrompt, metrics)

      return systemPrompt
      
    } catch (error) {
      this.caretLogger.error('[CaretSystemPrompt] Failed to generate system prompt', error)
      throw error
    }
  }

  private async callOriginalSystemPrompt(context: SystemPromptContext): Promise<string> {
    // Cline 원본 SYSTEM_PROMPT를 그대로 호출
    return await SYSTEM_PROMPT(
      context.cwd,
      context.supportsBrowserUse,
      context.mcpHub,
      context.browserSettings,
      context.isClaude4ModelFamily ?? false
    )
  }

  private extractToolCount(prompt: string): number {
    // 간단한 도구 개수 추출 (정확한 파싱은 ClineFeatureValidator에서)
    const toolMatches = prompt.match(/^## \w+$/gm)
    return toolMatches ? toolMatches.length : 0
  }

  private async logPromptGeneration(
    context: SystemPromptContext, 
    result: string, 
    metrics: SystemPromptMetrics
  ): Promise<void> {
    this.caretLogger.info('[CaretSystemPrompt] System prompt generated successfully', {
      promptLength: result.length,
      generationTime: metrics.generationTime,
      toolCount: metrics.toolCount,
      mcpServerCount: metrics.mcpServerCount,
      firstLine: result.split('\n')[0],
      endsWithObjective: result.includes('OBJECTIVE')
    })

    // 성능 경고 (5ms 이상 소요 시)
    if (metrics.generationTime > 5) {
      this.caretLogger.warn('[CaretSystemPrompt] Slow prompt generation detected', {
        generationTime: metrics.generationTime,
        threshold: 5
      })
    }
  }

  // 성능 메트릭 접근
  getMetrics(): SystemPromptMetrics[] {
    return [...this.metrics]
  }

  getAverageGenerationTime(): number {
    if (this.metrics.length === 0) return 0
    const total = this.metrics.reduce((sum, m) => sum + m.generationTime, 0)
    return total / this.metrics.length
  }
}
```

### **기존 시스템 통합**
```typescript
// caret-src/extension.ts (수정)
import { CaretSystemPrompt } from "./core/prompts/CaretSystemPrompt"

export class CaretExtension {
  private caretSystemPrompt: CaretSystemPrompt

  constructor() {
    this.testHelper = new CaretSystemPromptTestHelper("/test/extension/path")
  }

  async getSystemPrompt(context: SystemPromptContext): Promise<string> {
    // 기존 SYSTEM_PROMPT 대신 CaretSystemPrompt 사용
    return await this.testHelper.generateSystemPrompt(context)
  }
}
```

### **검증 테스트 구현**
```typescript
// caret-src/__tests__/caret-system-prompt.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { CaretSystemPrompt } from '../core/prompts/CarretSystemPrompt'
import { ClineFeatureValidator } from '../core/verification/ClineFeatureValidator'
import { SYSTEM_PROMPT } from '../../src/core/prompts/system'

describe('CaretSystemPrompt - Wrapper Implementation', () => {
  let testHelper: CaretSystemPromptTestHelper
  let validator: ClineFeatureValidator
  let mockContext: SystemPromptContext

  beforeEach(() => {
    testHelper = new CaretSystemPromptTestHelper("/test/extension/path")
    validator = new ClineFeatureValidator()
    mockContext = {
      cwd: '/test/project',
      supportsBrowserUse: true,
      mcpHub: createMockMcpHub(),
      browserSettings: createMockBrowserSettings(),
      isClaude4ModelFamily: false
    }
  })

  it('should generate identical prompt to original Cline', async () => {
    // 원본 Cline 프롬프트 생성
    const originalPrompt = await SYSTEM_PROMPT(
      mockContext.cwd,
      mockContext.supportsBrowserUse,
      mockContext.mcpHub,
      mockContext.browserSettings,
      mockContext.isClaude4ModelFamily
    )

    // Caret 래퍼 프롬프트 생성
    const caretPrompt = await testHelper.generateSystemPrompt(mockContext)

    // 완전히 동일해야 함
    expect(caretPrompt).toBe(originalPrompt)
  })

  it('should preserve all Cline features', async () => {
    const originalPrompt = await SYSTEM_PROMPT(/* ... */)
    const caretPrompt = await testHelper.generateSystemPrompt(mockContext)

    // 003-01의 검증 시스템 사용
    const validationResult = await validator.validateAllFeatures(originalPrompt, caretPrompt)

    expect(validationResult.allToolsPreserved).toBe(true)
    expect(validationResult.missingTools).toEqual([])
    expect(validationResult.modifiedTools).toEqual([])
    expect(validationResult.mcpIntegrationIntact).toBe(true)
  })

  it('should have minimal performance overhead', async () => {
    const iterations = 10
    const originalTimes: number[] = []
    const caretTimes: number[] = []

    // 원본 성능 측정
    for (let i = 0; i < iterations; i++) {
      const start = Date.now()
      await SYSTEM_PROMPT(/* ... */)
      originalTimes.push(Date.now() - start)
    }

    // 래퍼 성능 측정
    for (let i = 0; i < iterations; i++) {
      const start = Date.now()
      await testHelper.generateSystemPrompt(mockContext)
      caretTimes.push(Date.now() - start)
    }

    const originalAvg = originalTimes.reduce((a, b) => a + b) / iterations
    const caretAvg = caretTimes.reduce((a, b) => a + b) / iterations
    const overhead = (caretAvg - originalAvg) / originalAvg

    // 5% 이하 오버헤드 허용
    expect(overhead).toBeLessThan(0.05)
  })

  it('should handle Claude4 model family correctly', async () => {
    const claude4Context = { ...mockContext, isClaude4ModelFamily: true }
    
    const originalPrompt = await SYSTEM_PROMPT(
      claude4Context.cwd,
      claude4Context.supportsBrowserUse,
      claude4Context.mcpHub,
      claude4Context.browserSettings,
      true
    )

    const caretPrompt = await testHelper.generateSystemPrompt(claude4Context)

    expect(caretPrompt).toBe(originalPrompt)
    // Claude4 전용 기능이 포함되어야 함
    expect(caretPrompt).not.toContain('You are Cline, a highly skilled software engineer')
  })
})
```

## ✅ **검증 기준**

### **기능 보존 검증**
- [ ] **100% 동일한 출력**: 원본 SYSTEM_PROMPT와 바이트 단위로 동일
- [ ] **모든 도구 보존**: ClineFeatureValidator로 확인
- [ ] **MCP 통합 보존**: 동적 도구 및 리소스 접근 확인
- [ ] **모델별 분기 보존**: Claude4 표준/실험 분기 정확히 동작

### **성능 요구사항**
- [ ] **래퍼 오버헤드 5% 이하**: 성능 저하 최소화
- [ ] **메모리 사용량 동일**: 추가 메모리 사용 없음
- [ ] **응답 시간 동일**: 지연 시간 증가 없음

### **품질 요구사항**
- [ ] **상세 로깅**: 모든 호출과 메트릭 기록
- [ ] **에러 핸들링**: 원본과 동일한 에러 처리
- [ ] **테스트 커버리지 100%**: 모든 코드 경로 테스트

## 🚨 **위험 요소 및 대응**

### **주요 위험 요소**
1. **파라미터 불일치**: 래퍼에서 원본 호출 시 파라미터 누락/변경
2. **비동기 처리 문제**: async/await 체인에서 오류 발생 가능
3. **메모리 누수**: 메트릭 수집 과정에서 메모리 축적

### **대응 방안**
1. **TypeScript 타입 엄격 적용**: 컴파일 타임 검증
2. **철저한 테스트**: 다양한 시나리오 테스트
3. **메트릭 제한**: 최대 보관 개수 제한 및 자동 정리

## 📝 **Output 파일**

### **구현할 파일들**
1. **`caret-src/core/prompts/CaretSystemPrompt.ts`**
   - 메인 래퍼 클래스 구현

2. **`caret-src/core/prompts/types.ts`**
   - SystemPromptContext, SystemPromptMetrics 타입 정의

3. **`caret-src/__tests__/caret-system-prompt.test.ts`**
   - 래퍼 기능 검증 테스트

4. **`caret-src/extension.ts`** (수정)
   - CaretSystemPrompt 통합

## 🔄 **Next Steps for 003-03**

003-02 완료 후 다음 단계인 003-03에서는:
- **JSON 오버레이 시스템 구현** - 안전한 래퍼 위에 JSON 템플릿 로딩 추가
- **기본 JSON 템플릿 준비**

---

**🎯 목표**: 완벽하게 안전한 첫 번째 단계! 래퍼가 원본과 100% 동일하게 작동!

**💪 원칙**: 단순함이 최고! 복잡하게 만들지 말고 단순히 래핑만! 