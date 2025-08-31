# TDD 및 테스트 요구사항

Caret의 **Test-Driven Development (TDD)** 원칙과 100% 테스트 커버리지 요구사항을 정의하는 문서입니다.

## 🚨 **올바른 TDD 원칙 (흔한 실수 방지)**

### **❌ 흔한 실수: "거꾸로 TDD"**
```
1. 단위 함수 테스트 작성 → 단위 함수 구현 → 리팩터
2. 나중에 "실제 사용처에 통합"
```

### **✅ 올바른 TDD 접근**
```
1. RED: 실제 사용 시나리오의 통합/E2E 테스트부터 작성
2. GREEN: 통합 테스트가 통과하도록 필요한 모든 코드 구현 (단위 함수들 포함)
3. REFACTOR: 통합 테스트를 유지하며 코드 품질 개선
```

### **🎯 올바른 TDD 시작점**

#### **웹뷰 기능 개발**
- ❌ 잘못: `validateInput()` 단위 함수 테스트부터
- ✅ 올바름: "사용자가 버튼 클릭 → 기대 결과 표시" 컴포넌트 테스트부터

#### **백엔드 기능 개발**  
- ❌ 잘못: `parseConfig()` 단위 함수 테스트부터
- ✅ 올바름: "설정 변경 → 시스템 동작 변화" 통합 테스트부터

#### **API 기능 개발**
- ❌ 잘못: `buildRequest()` 단위 함수 테스트부터
- ✅ 올바름: "API 호출 → 응답 처리 → 상태 업데이트" E2E 테스트부터

### **Caret TDD 정책**
- **통합 테스트 우선**: 실제 사용 시나리오부터 테스트 작성
- **100% 커버리지**: 모든 Caret 소스코드 (`caret-src/`) 100% 테스트 커버리지 필수
- **테스트 우선**: 기능 구현 전 통합 테스트 코드 먼저 작성
- **이식 금지**: 테스트가 없는 기능은 머징 시 이식 금지
- **지속적 검증**: CI/CD 파이프라인에서 자동 테스트 및 커버리지 검증

## 📊 **테스트 커버리지 요구사항**

### **필수 100% 커버리지 범위**
```
caret-src/                          # Caret 전용 소스 (100% 필수)
├── core/                           # 핵심 로직
├── utils/                          # 유틸리티 함수
├── services/                       # 서비스 클래스
└── __tests__/                      # 테스트 파일

webview-ui/src/caret/               # Caret UI 컴포넌트 (90% 이상)
├── components/                     # React 컴포넌트
├── utils/                          # 프론트엔드 유틸리티
├── hooks/                          # 커스텀 훅
└── __tests__/                      # 컴포넌트 테스트
```

### **수정된 Cline 코드 테스트**
```
src/                                # 수정된 Cline 코드 (수정 부분만)
├── *.ts (CARET MODIFICATION 부분)  # 수정 부분 테스트 추가
└── 기존 Cline 테스트 유지         # 기존 테스트는 그대로 보존
```

## 🔧 **테스트 도구 및 환경**

### **백엔드 테스트**
```json
// package.json
{
  "scripts": {
    "test:backend": "vitest run src/ caret-src/",
    "test:backend:watch": "vitest watch src/ caret-src/",
    "test:coverage": "vitest run --coverage src/ caret-src/",
    "test:coverage:report": "vitest run --coverage --reporter=html"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

### **프론트엔드 테스트**
```json
// webview-ui/package.json
{
  "scripts": {
    "test:frontend": "vitest run src/caret/",
    "test:frontend:watch": "vitest watch src/caret/",
    "test:frontend:coverage": "vitest run --coverage src/caret/"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0"
  }
}
```

### **통합 테스트**
```bash
# 전체 테스트 실행
npm run test:all

# 특정 기능 테스트
npm run test:backend -- rule-priority
npm run test:frontend -- persona

# 커버리지 리포트 생성
npm run test:coverage:report
```

## 📋 **기능별 테스트 요구사항**

### **Rule Priority System**
```typescript
// caret-src/__tests__/rule-priority.test.ts
describe('Rule Priority System', () => {
    test('should prioritize .caretrules over .clinerules', () => {
        // 테스트 로직
    })
    
    test('should load fallback rules correctly', () => {
        // 테스트 로직
    })
    
    test('should handle missing rule files gracefully', () => {
        // 테스트 로직
    })
    
    // 총 6개 테스트 케이스 (각 우선순위 조합)
})
```

### **Account & Organization System**
```typescript
// webview-ui/src/caret/components/__tests__/CaretAccountView.test.tsx
describe('Caret Account View', () => {
    test('should render login button when not authenticated', () => {
        // UI 테스트
    })
    
    test('should display user info when authenticated', () => {
        // 인증 상태 테스트
    })
    
    test('should handle login flow correctly', () => {
        // 로그인 플로우 테스트
    })
    
    // 총 10개 테스트 케이스
})
```

### **다국어 i18n System**
```typescript
// webview-ui/src/caret/utils/__tests__/i18n.test.ts
describe('i18n System', () => {
    test('should load language files correctly', () => {
        // 언어 파일 로딩 테스트
    })
    
    test('should fallback to English when translation missing', () => {
        // Fallback 테스트
    })
    
    test('should switch languages dynamically', () => {
        // 동적 언어 전환 테스트
    })
    
    // 총 8개 테스트 케이스
})
```

### **Chatbot/Agent Mode System**
```typescript
// caret-src/__tests__/mode-system-integration.test.ts
describe('Mode System Integration', () => {
    test('should map Caret modes to Cline modes correctly', () => {
        // 모드 매핑 테스트
    })
    
    test('should sync all state when mode changes', () => {
        // 상태 동기화 테스트
    })
    
    test('should select correct system prompt', () => {
        // 프롬프트 선택 테스트
    })
    
    // 아키텍처 정리 후 추가 테스트 케이스
})
```

### **JSON System Prompt**
```typescript
// caret-src/core/prompts/__tests__/prompt-builder.test.ts
describe('Prompt Builder', () => {
    test('should build prompt from JSON correctly', () => {
        // JSON → 텍스트 변환 테스트
    })
    
    test('should apply mode-specific prompts', () => {
        // 모드별 프롬프트 테스트
    })
    
    test('should handle JSON loading errors', () => {
        // 오류 처리 테스트
    })
    
    // 총 5개 테스트 케이스
})
```

### **Persona System**
```typescript
// caret-src/utils/__tests__/persona-initializer.test.ts
describe('Persona Initializer', () => {
    test('should load all personas from JSON', () => {
        // 페르소나 로딩 테스트
    })
    
    test('should generate custom instructions', () => {
        // 커스텀 인스트럭션 테스트
    })
    
    test('should handle missing persona gracefully', () => {
        // 오류 처리 테스트
    })
    
    // 총 7개 테스트 케이스
})
```

### **Logging System**
```typescript
// caret-src/utils/__tests__/caret-logger.test.ts
describe('Caret Logger', () => {
    test('should log with correct format', () => {
        // 로그 포맷 테스트
    })
    
    test('should filter logs by level', () => {
        // 로그 레벨 필터링 테스트
    })
    
    test('should categorize logs correctly', () => {
        // 카테고리 분류 테스트
    })
    
    // 총 5개 테스트 케이스
})
```

### **Branding & UI System**
```typescript
// webview-ui/src/caret/components/__tests__/CaretWelcome.test.tsx
describe('Caret Welcome Page', () => {
    test('should render all branding elements', () => {
        // 브랜딩 요소 렌더링 테스트
    })
    
    test('should support dark/light theme', () => {
        // 테마 전환 테스트
    })
    
    test('should handle responsive layout', () => {
        // 반응형 레이아웃 테스트
    })
    
    // 총 8개 테스트 케이스
})
```

## 🚀 **CI/CD 테스트 자동화**

### **GitHub Actions 워크플로우**
```yaml
# .github/workflows/test.yml
name: Test & Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run backend tests
        run: npm run test:backend
        
      - name: Run frontend tests
        run: npm run test:frontend
        
      - name: Generate coverage report
        run: npm run test:coverage:report
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        
      - name: Fail if coverage below 100%
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 100" | bc -l) )); then
            echo "Coverage $COVERAGE% is below required 100%"
            exit 1
          fi
```

### **커버리지 요구사항 검증**
```bash
#!/bin/bash
# scripts/check-coverage.sh

# Caret 소스 100% 커버리지 검증
echo "Checking Caret source coverage..."
CARET_COVERAGE=$(npm run test:coverage -- caret-src/ --reporter=json | jq '.coverage.total.lines.pct')

if (( $(echo "$CARET_COVERAGE < 100" | bc -l) )); then
    echo "❌ Caret source coverage $CARET_COVERAGE% < 100% (REQUIRED)"
    exit 1
else
    echo "✅ Caret source coverage: $CARET_COVERAGE%"
fi

# UI 컴포넌트 90% 커버리지 검증
echo "Checking UI component coverage..."
UI_COVERAGE=$(npm run test:frontend:coverage -- --reporter=json | jq '.coverage.total.lines.pct')

if (( $(echo "$UI_COVERAGE < 90" | bc -l) )); then
    echo "❌ UI component coverage $UI_COVERAGE% < 90% (REQUIRED)"
    exit 1
else
    echo "✅ UI component coverage: $UI_COVERAGE%"
fi
```

## 📋 **머징 시 테스트 체크리스트**

### **Phase별 테스트 요구사항**

#### **모든 Phase 공통**
- [ ] **기능 테스트**: 해당 기능의 모든 테스트 케이스 100% 통과
- [ ] **통합 테스트**: 기존 기능과의 통합 테스트 통과
- [ ] **회귀 테스트**: 기존 Cline 기능 정상 동작 확인
- [ ] **커버리지**: Caret 소스 100% 커버리지 달성

#### **Phase 1: 환경 구축**
- [ ] 기본 빌드 테스트 통과
- [ ] Extension Host 로딩 테스트
- [ ] 기본 명령어 실행 테스트

#### **Phase 2: 기본 브랜딩**
- [ ] 규칙 우선순위 테스트 (6개 케이스)
- [ ] 앱명 변경 후 정상 동작 테스트
- [ ] 브랜딩 요소 렌더링 테스트

#### **Phase 3: 핵심 기능**
- [ ] 모드 시스템 통합 테스트
- [ ] JSON 프롬프트 빌드 테스트
- [ ] 상태 동기화 테스트

#### **Phase 4-6: 고급 기능**
- [ ] 각 기능별 독립 테스트
- [ ] UI 컴포넌트 테스트
- [ ] 다국어 전환 테스트

#### **Phase 7: 최종 검증**
- [ ] 전체 E2E 테스트
- [ ] 성능 회귀 테스트
- [ ] 사용자 시나리오 테스트

## 🛠️ **테스트 유틸리티 및 모킹**

### **공통 테스트 헬퍼**
```typescript
// caret-src/__tests__/helpers/test-utils.ts
export const createMockExtensionContext = () => ({
    subscriptions: [],
    workspaceState: createMockWorkspaceState(),
    globalState: createMockGlobalState(),
    extensionPath: '/mock/extension/path'
})

export const createMockWorkspaceState = () => ({
    get: jest.fn(),
    update: jest.fn()
})

export const waitForAsync = (ms: number = 0) => 
    new Promise(resolve => setTimeout(resolve, ms))
```

### **API 모킹**
```typescript
// caret-src/__tests__/mocks/caret-api.ts
export const mockCaretAPI = {
    login: jest.fn().mockResolvedValue({ token: 'mock-token' }),
    getUserInfo: jest.fn().mockResolvedValue({ name: 'Test User' }),
    getUsage: jest.fn().mockResolvedValue({ usage: 100, limit: 1000 })
}
```

### **파일 시스템 모킹**
```typescript
// caret-src/__tests__/mocks/fs.ts
import { jest } from '@jest/globals'

export const mockFs = {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    pathExists: jest.fn(),
    ensureDir: jest.fn()
}
```

## 📈 **품질 메트릭 및 모니터링**

### **커버리지 리포트**
```bash
# 커버리지 리포트 생성
npm run test:coverage:report

# HTML 리포트 확인
open coverage/index.html
```

### **테스트 성능 모니터링**
```typescript
// scripts/test-performance.ts
console.time('Backend Tests')
await exec('npm run test:backend')
console.timeEnd('Backend Tests')

console.time('Frontend Tests')
await exec('npm run test:frontend')
console.timeEnd('Frontend Tests')
```

### **테스트 품질 지표**
- **테스트 실행 시간**: 5분 이내
- **플레이키 테스트**: 0% (재실행 시 항상 동일 결과)
- **테스트 커버리지**: Caret 소스 100%, UI 90% 이상
- **코드 품질**: ESLint, Prettier 규칙 100% 준수

---

**작성자**: Alpha (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-08-16  
**마지막 업데이트**: 2025-08-16 18:05 KST  
**문서 유형**: TDD 및 테스트 요구사항  
**적용 범위**: 모든 Caret 기능 개발
