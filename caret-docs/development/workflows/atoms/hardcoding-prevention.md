# 하드코딩 방지 워크플로우

AI는 하드코딩 방지 패턴을 따라 동적 시스템을 구축하고 있습니다.

## 핵심 원칙
**하드코딩된 값은 설정, 상수, 또는 데이터베이스에서 가져와야 합니다**

## 일반적인 하드코딩 문제

### ❌ 잘못된 접근
```typescript
// 하드코딩된 모델 리스트
const models = ['claude-3-5-sonnet', 'gpt-4', 'gemini-pro']

// 하드코딩된 URL
const apiUrl = 'https://api.example.com/v1'

// 하드코딩된 설정
const maxTokens = 4096
```

### ✅ 올바른 접근
```typescript
// 설정에서 가져오기
const models = await getAvailableModels()

// 환경 변수 또는 설정에서
const apiUrl = config.get('api.baseUrl')

// 사용자 설정 또는 기본값
const maxTokens = settings.maxTokens ?? DEFAULT_MAX_TOKENS
```

## 하드코딩 방지 패턴

### 패턴 1: 설정 기반 시스템
```typescript
// config.ts
export const CONFIG = {
  api: {
    baseUrl: process.env.API_URL || 'https://api.default.com',
    timeout: 30000
  },
  features: {
    enableExperimentalFeatures: false
  }
}

// 사용
import { CONFIG } from './config'
const response = await fetch(CONFIG.api.baseUrl)
```

### 패턴 2: 상수 파일 분리
```typescript
// constants.ts
export const DEFAULT_MODELS = ['claude-3-5-sonnet', 'gpt-4']
export const MAX_RETRIES = 3
export const TIMEOUT_MS = 5000

// 사용
import { DEFAULT_MODELS } from './constants'
const models = userSettings.models || DEFAULT_MODELS
```

### 패턴 3: 동적 데이터 로딩
```typescript
// 하드코딩 대신 API에서 가져오기
async function getAvailableModels() {
  const response = await fetch('/api/models')
  return response.json()
}

// 하드코딩 대신 파일에서 읽기
const modelList = await readJsonFile('models.json')
```

### 패턴 4: Feature Flags
```typescript
// Feature Config 시스템 사용
import { FeatureConfig } from '@/caret/shared/FeatureConfig'

if (FeatureConfig.isEnabled('experimentalAI')) {
  // 실험적 기능 실행
}
```

### 패턴 5: 사용자 설정 우선
```typescript
// 사용자 설정 → 기본값 순서
const theme = userSettings.theme ?? defaultSettings.theme ?? 'dark'
const language = userSettings.language ?? detectSystemLanguage()
```

## Caret 프로젝트 적용 사례

### 모델 리스트 (F10)
```typescript
// ❌ 하드코딩
const models = ['claude-3-5-sonnet', 'gpt-4']

// ✅ 동적 가져오기
const models = await fetchAvailableModels(provider)
```

### 프롬프트 시스템 (F06)
```typescript
// ❌ 하드코딩된 프롬프트
const systemPrompt = "You are a helpful assistant..."

// ✅ JSON에서 로드
const promptConfig = await loadPromptConfig('agent-mode.json')
const systemPrompt = promptConfig.systemPrompt
```

### 브랜딩 (F03)
```typescript
// ❌ 하드코딩된 브랜드명
const appName = "Caret"

// ✅ 설정 기반 브랜딩
const appName = BrandConfig.getCurrentBrand().name
```

### i18n 텍스트 (F02)
```typescript
// ❌ 하드코딩된 텍스트
const message = "저장되었습니다"

// ✅ i18n 시스템
const message = t('common.saved', 'common')
```

## 검증 체크리스트

하드코딩 방지를 위한 코드 리뷰 체크리스트:

- [ ] 문자열 리터럴이 UI 텍스트인가? → i18n 사용
- [ ] 숫자 값이 설정 가능한가? → 상수 또는 설정으로 분리
- [ ] URL이 환경마다 다른가? → 환경 변수 사용
- [ ] 리스트가 변경될 수 있는가? → 동적 로딩 사용
- [ ] 기능이 토글 가능한가? → Feature Flag 사용

## 리팩토링 가이드

### 1단계: 하드코딩 식별
```bash
# 의심되는 패턴 검색
grep -r "const.*=.*\[" src/
grep -r "= ['\"]http" src/
```

### 2단계: 분류
- **설정값**: config 파일로 이동
- **상수**: constants 파일로 이동
- **동적 데이터**: API 또는 파일 로딩
- **UI 텍스트**: i18n 시스템

### 3단계: 마이그레이션
- 하드코딩 값을 적절한 위치로 이동
- 코드 업데이트
- 테스트 작성 및 실행

## 관련 워크플로우
- `/i18n-dynamic-pattern` - i18n 텍스트 처리
- `/feature-config` - Feature Flag 시스템
- `/modification-levels` - 설정 관리 레벨

## 가이드라인
- 하드코딩은 유지보수를 어렵게 하고 확장성을 저해합니다
- 모든 변경 가능한 값은 설정으로 외부화해야 합니다
- 동적 시스템은 재컴파일 없이 동작 변경을 가능하게 합니다
- 하드코딩 방지는 초기에 약간의 추가 작업이 필요하지만, 장기적으로 큰 이익을 제공합니다
