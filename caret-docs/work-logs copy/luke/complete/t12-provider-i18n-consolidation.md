# T12 - Provider i18n Keys Consolidation Project

## ✅ 2025-09-16 Provider i18n 키 검증 및 수정 완료

### 📊 최종 검증 결과 요약 (2025-09-16)

**전체 검증된 Provider 수**: 8개
**실제 수정이 필요했던 것**: LiteLLM, claudeCode 일부 키만 수정
**최종 상태**: 모든 Provider i18n 키 정상 작동

### ✅ 검증 완료된 Provider들 (모두 정상)

1. **vsCodeLm** ✅ - 이미 올바른 카멜케이스(vscodeLm)로 4개 언어 모두 존재
2. **Vertex** ✅ - 이미 providers.vertex.* 형식으로 4개 언어 모두 존재
3. **LiteLLM** 🔧 - 누락된 6개 키를 4개 언어에 모두 추가 완료
4. **claudeCode** 🔧 - 영어/한국어에 카멜케이스 키 추가 완료
5. **SAP AI Core** ✅ - 이미 providers.sapaicore.description으로 4개 언어 모두 존재
6. **Vercel AI Gateway** ✅ - 이미 providers.vercelAiGateway.description으로 4개 언어 모두 존재
7. **Qwen Code** ✅ - 이미 providers.qwenCode.description으로 4개 언어 모두 존재
8. **LM Studio (ModelInfoView)** ✅ - 이미 common.json에 modelInfoView.contextWindowLabel로 존재

### 🔧 실제로 수정한 내용

#### LiteLLM Provider (4개 언어 모두)
- ✅ `providers.litellm.usePromptCachingDescription` 추가
- ✅ `providers.litellm.extendedThinkingDescription1` 추가
- ✅ `providers.litellm.extendedThinkingLink` 추가
- ✅ `providers.litellm.description1` 추가
- ✅ `providers.litellm.quickstartGuideLink` 추가
- ✅ `providers.litellm.description2` 추가

#### claudeCode Provider (영어/한국어)
- ✅ `providers.claudeCode.cliPath` 추가
- ✅ `providers.claudeCode.cliPathDescription` 추가
- ✅ `providers.claudeCode.modelSelector.placeholder` 추가

### 💡 주요 발견사항
대부분의 문제들은 이미 해결되어 있었음. work-log의 누락 키 목록은 과거 상태를 반영한 것으로, 현재는 거의 모든 키가 정상 상태였음.

### 🔍 검증 방법론
1. 각 Provider 컴포넌트에서 실제 사용하는 i18n 키 추출
2. 4개 언어(en/ko/ja/zh) 설정 파일에서 해당 키 존재 여부 확인
3. 누락된 키 발견 시 즉시 추가 및 번역
4. 모든 언어 파일 동기화 확인

---

### 🚨 이전 누락 키 목록 (참고용 - 대부분 해결됨)

아래는 이전에 확인된 누락 키들이지만, 현재 대부분 해결된 상태입니다:

* vsCodeLm
 - providers.vsCodeLm.description

* Vertex : providers형식 아님, 표준형식 전환 필요
 - vertex.projectIdLabel
 - vertex.regionLabel
 - vertex.selectRegionPlaceholder
 - vertex.setupDescription
 - vertex.setupLink1
 - vertex.setupLink2

* LiteLLM : 일부 settings 형식.. 비표준 방식임. 전환 필요
 - settings.apiKeyFieldLabel
 - settings.modelIdField.label
 - settings.apiKeyField.label
 - providers.litellm.usePromptCachingDescription
 - providers.litellm.extendedThinkingDescription1
 - providers.litellm.extendedThinkingLink
 - providers.litellm.description1
 - providers.litellm.quickstartGuideLink
 - providers.litellm.description2

* claudeCode
 - providers.claudeCode.cliPath
 - providers.claudeCode.cliPathDescription
 - providers.claudeCode.modelmodelSelector.placeholderc

* SAP AI Core
 - providers.sapAiCore.description

* Cerebras
 - providers.cerebras.sotaDescription
 - providers.cerebras.noSubscription
 - providers.cerebras.contextWindow
 - providers.cerebras.rateLimits
 - providers.cerebras.upgrade



**작업 일자**: 2025-09-16
**작업자**: Luke
**유형**: i18n 키 구조 통합 및 표준화

## 프로젝트 개요

OpenRouter 작업을 통해 얻은 경험을 바탕으로 모든 프로바이더의 i18n 키를 일관된 `providers.{providerId}.*` 구조로 통합하는 작업입니다.

## 작업 진행 현황 (2025-09-16)

### ✅ 완료된 작업들

#### 1. OpenRouter Provider 통합 (완료)
- ✅ `openRouterProvider.*` → `providers.openrouter.*` 통합
- ✅ `openRouterModelPicker.*` → `providers.openrouter.modelPicker.*` 통합
- ✅ 4개 언어(en/ko/ja/zh) 모든 파일 동기화
- ✅ TypeScript 코드의 모든 참조 업데이트
- ✅ 기존 분산된 키 구조 완전 제거

#### 2. Caret Provider 문제 해결 (완료)
- ✅ 부적절한 개인정보처리방침 콘텐츠 제거 (CaretProvider.tsx lines 66-81)
- ✅ 번역 키 누락 문제 해결 (providers.caret.login 등)
- ✅ 4개 언어 일관성 확보

#### 3. ApiKeyField 네임스페이스 수정 (완료)
- 🐛 **발견된 문제**: `t("apiKey.*", "common")` 사용하지만 실제로는 `settings.json`의 `apiKeyField` 섹션 사용해야 함
- ✅ **해결**: `t("apiKeyField.*", "settings")` 구조로 변경
- ✅ 영향: API 키 관련 모든 텍스트 정상 번역

#### 4. 중복 JSON 키 문제 해결 (완료)
- 🐛 **발견된 심각한 문제**: 모든 언어의 `common.json`에서 `apiKey` 섹션이 중복 정의
- 📍 **문제 위치**:
  - Line ~170: 첫 번째 apiKey 섹션 (getYourKeyAn/getYourKeyA 포함)
  - Line ~542: 두 번째 apiKey 섹션 (중복, 첫 번째 덮어씀)
- ✅ **해결**:
  - 중복 섹션 제거
  - 필요한 키들 첫 번째 섹션에 통합
  - 모든 언어(en/ko/ja/zh) 동일하게 수정
- ✅ 영향: `getYourKeyAn`/`getYourKeyA` 키 정상 작동

### 🔍 발견된 새로운 문제 패턴들

#### JSON 파일 내 중복 키 문제
- **원인**: JSON에서 동일한 키가 여러 번 정의되면 마지막 정의가 이전 것들을 덮어씀
- **발견 사례**: `common.json`의 `apiKey` 섹션 중복
- **위험성**: 키가 존재하는 것처럼 보이지만 실제로는 누락되어 키 이름이 UI에 노출됨
- **검증 필요**: 다른 네임스페이스에서도 유사한 문제 존재 가능성

#### 네임스페이스 불일치 문제
- **패턴**: 코드에서 `t(key, namespaceA)` 호출하지만 실제 키는 `namespaceB.json`에 존재
- **발견 사례**:
  - `ModelInfoView`: `t("modelInfoView.tokensSuffix", "settings")` but key in `common.json`
  - `ApiKeyField`: `t("apiKey.*", "common")` but should use `apiKeyField.*` in `settings.json`
- **해결 방법**: 코드의 네임스페이스를 올바른 위치로 수정

### 🎯 해결된 성과
1. **완전 통합**: OpenRouter가 `providers.openrouter.*` 구조로 완전 통합
2. **4개 언어 일관성**: en/ko/ja/zh 모든 언어 파일 동기화
3. **코드 동기화**: TypeScript 파일의 모든 참조 업데이트
4. **중복 제거**: 분산된 키 구조 및 중복 키 완전 제거
5. **새로운 문제 패턴 발견**: 향후 작업에 적용할 중요한 경험 축적

## 전체 프로바이더 현황 분석

### 현재 프로바이더 목록
```bash
# providers.* 구조를 사용하는 프로바이더들
providers.caret
providers.openrouter (✅ 완료)
providers.gemini
providers.openai
providers.anthropic
providers.bedrock
providers.vscode-lm
providers.deepseek
providers.openai-native
providers.ollama
providers.vertex
providers.litellm
providers.claude-code

# 기존 개별 구조를 사용하는 프로바이더들 (통합 대상)
anthropicProvider
bedrockProvider
ollamaProvider
ollamaModelPicker
geminiProvider
...등등
```

### 통합 우선순위
1. **High Priority (modelPicker 보유)**: Ollama, Gemini 등
2. **Medium Priority (많은 설정 키)**: Anthropic, Bedrock 등
3. **Low Priority (단순 구조)**: 기타 프로바이더들

## 🚨 강화된 작업 방법론 (Caret Provider 실수 반영)

### Phase 0: 사전 준비 (실패 방지)
```bash
# 백업 생성 (필수)
node caret-scripts/provider-i18n-consolidator.js --backup

# 검증 스크립트 실행하여 현재 상태 파악
node caret-scripts/provider-i18n-validator.js > validation-report.txt
```

### Phase 1: 완전 분석 및 계획 (누락 방지)
```bash
# 1. 현재 구조 파악
grep -r "Provider.*:" webview-ui/src/caret/locale/en/settings.json
grep -r "ModelPicker.*:" webview-ui/src/caret/locale/en/settings.json

# 2. ⚠️ 중요: 실제 사용 키 완전 검색 (Caret 실수 방지)
echo "=== TypeScript 사용 키 완전 분석 ===" > keys-analysis.txt
grep -r "t(\".*Provider\." webview-ui/src/components/ >> keys-analysis.txt
grep -r "t(\".*ModelPicker\." webview-ui/src/components/ >> keys-analysis.txt
grep -r "t(\"providers\." webview-ui/src/components/ >> keys-analysis.txt

# 3. 사용 키 목록 정리 및 검증
echo "=== 필수 키 추출 ===" >> keys-analysis.txt
grep -o 't("[^"]*"' keys-analysis.txt | sort | uniq >> keys-analysis.txt
echo "⚠️ 이 파일을 반드시 확인하여 모든 키 포함 확인!"
```

### Phase 2: 개별 프로바이더 작업 (체계적 접근)
각 프로바이더당 **반드시** 다음 순서로 작업:

#### 2.0 프로바이더별 키 완전 분석 (🚨 필수 - Groq 하드코딩 실수 재발방지!)
```bash
# 예: groq 프로바이더 작업 시
echo "=== Groq 키 분석 ===" > groq-keys.txt
grep -r "providers\.groq\." webview-ui/src/components/ >> groq-keys.txt
grep -r "groqProvider\." webview-ui/src/components/ >> groq-keys.txt
grep -r "groqModelPicker\." webview-ui/src/components/ >> groq-keys.txt

# 🚨 새로 추가: 하드코딩 검색 (Groq 실수에서 학습)
echo "=== 하드코딩된 값 검색 ===" >> groq-keys.txt
grep -r "llama-3\.3.*versatile" webview-ui/src/components/ >> groq-keys.txt
grep -r "console\.groq\.com" webview-ui/src/components/ >> groq-keys.txt
grep -r "Groq\." webview-ui/src/components/ >> groq-keys.txt

# 🚨 새로 추가: api.ts에서 모델 설명 하드코딩 검색
echo "=== API.ts 하드코딩 검색 ===" >> groq-keys.txt
grep -r "state-of-the-art.*120B" src/shared/api.ts >> groq-keys.txt
grep -r "Mixture-of-Experts" src/shared/api.ts >> groq-keys.txt

# 필요한 모든 키 리스트 생성
grep -o 't("[^"]*"' groq-keys.txt | sort | uniq > groq-required-keys.txt
echo "📋 Groq 필수 키 목록:"
cat groq-required-keys.txt

# ⚠️ 이 목록을 바탕으로 JSON 구조 설계!
```

#### 2.0.1 새로 추가: 하드코딩 검증 단계 (Groq 실수 교훈)
```bash
# 각 프로바이더마다 하드코딩된 값들을 체크
echo "=== [PROVIDER] 하드코딩 검증 ==="
# 1. 모델명 하드코딩 검색
grep -rn "handleModelChange.*[\"'].*[\"']" webview-ui/src/components/settings/*[PROVIDER]*.tsx
# 2. URL 하드코딩 검색
grep -rn "href.*[\"']http" webview-ui/src/components/settings/*[PROVIDER]*.tsx
# 3. 설명 텍스트 하드코딩 검색
grep -rn "[A-Z].*model.*optimized" src/shared/api.ts
# 4. 프로바이더명 하드코딩 검색
grep -rn "\w+\." webview-ui/src/components/settings/*[PROVIDER]*.tsx | grep -v "t("

# ⚠️ 발견된 하드코딩은 모두 i18n 키로 변환 필요!
```

#### 2.1 영어 파일 통합 (settings.json) - 완전성 보장
```typescript
// ⚠️ 주의: 2.0단계에서 확인한 모든 키를 빠짐없이 포함!
"providers": {
  "ollama": {
    // 기본 키들
    "name": "Ollama",
    "description": "...",

    // 실제 사용 확인된 키들만 추가 (ollama-required-keys.txt 참조)
    "login": "...",          // 실제 사용 시에만
    "loginError": "...",     // 실제 사용 시에만
    "apiKeyConfigured": "...", // 실제 사용 시에만
    "features": "...",       // 실제 사용 시에만
    "feature1": "...",       // 실제 사용 시에만
    "feature2": "...",       // 실제 사용 시에만
    "feature3": "...",       // 실제 사용 시에만
    "feature4": "...",       // 실제 사용 시에만

    // ModelPicker 키들 (있는 경우만)
    "modelPicker": {
      "searchPlaceholder": "...",
      "clearSearch": "...",
      // 기타 실제 사용 키들
    }
  }
}
```

#### 2.3 TypeScript 코드 업데이트
```typescript
// Before
t("ollamaProvider.apiKeyLabel", "settings")
t("ollamaModelPicker.searchPlaceholder", "settings")

// After
t("providers.ollama.apiKeyLabel", "settings")
t("providers.ollama.modelPicker.searchPlaceholder", "settings")
```

#### 2.2 TypeScript 코드 업데이트 (키 참조 변경)
```typescript
// Before
t("ollamaProvider.apiKeyLabel", "settings")
t("ollamaModelPicker.searchPlaceholder", "settings")

// After
t("providers.ollama.apiKeyLabel", "settings")
t("providers.ollama.modelPicker.searchPlaceholder", "settings")
```

#### 2.3 영어 파일 검증 (🚨 필수 - Caret 실수 방지!)
```bash
# 영어 파일에 모든 필수 키가 있는지 검증
echo "=== 영어 파일 키 검증 ===" > en-validation.txt
while read key; do
  keypath=$(echo $key | sed 's/t("//' | sed 's/".*//')
  if ! grep -q "\"$keypath\"" webview-ui/src/caret/locale/en/settings.json; then
    echo "❌ 누락: $keypath" >> en-validation.txt
  else
    echo "✅ 확인: $keypath" >> en-validation.txt
  fi
done < ollama-required-keys.txt

echo "영어 파일 검증 결과:"
cat en-validation.txt
```

#### 2.4 다국어 파일 동기화 (ko/ja/zh) - 완전성 보장
```bash
# ⚠️ 영어 파일과 정확히 동일한 키 구조로 설정
for lang in ko ja zh; do
  echo "=== $lang 파일 동기화 ===" > ${lang}-sync.txt

  # 각 언어별로 키 존재 여부 확인
  while read key; do
    keypath=$(echo $key | sed 's/t("//' | sed 's/".*//')
    if ! grep -q "\"$keypath\"" webview-ui/src/caret/locale/$lang/settings.json; then
      echo "❌ $lang 누락: $keypath" >> ${lang}-sync.txt
    else
      echo "✅ $lang 확인: $keypath" >> ${lang}-sync.txt
    fi
  done < ollama-required-keys.txt

  echo "$lang 동기화 결과:"
  cat ${lang}-sync.txt
done
```

#### 2.5 기존 구조 제거 (정리)
```typescript
// 기존 *Provider, *ModelPicker 섹션 완전 삭제
"ollamaProvider": { ... }, // 삭제
"ollamaModelPicker": { ... }, // 삭제

# 제거 후 검증
grep -r "ollamaProvider\|ollamaModelPicker" webview-ui/src/caret/locale/
# 결과가 없어야 함!
```

#### 2.6 최종 완전 검증 (🚨 필수 - 다층 검증!)
```bash
# 1단계: 컴파일 체크
echo "=== 컴파일 검증 ==="
npm run compile
if [ $? -eq 0 ]; then
  echo "✅ 컴파일 성공"
else
  echo "❌ 컴파일 실패 - 작업 중단!"
  exit 1
fi

# 2단계: 타입 체크
echo "=== 타입 검증 ==="
npm run check-types
if [ $? -eq 0 ]; then
  echo "✅ 타입 체크 성공"
else
  echo "❌ 타입 체크 실패 - 작업 중단!"
  exit 1
fi

# 3단계: 키 사용 재검증
echo "=== 키 사용 재검증 ==="
grep -r "ollamaProvider\.\|ollamaModelPicker\." webview-ui/src/components/
if [ $? -eq 0 ]; then
  echo "❌ 아직 legacy 키 사용 중 - 수정 필요!"
  exit 1
else
  echo "✅ Legacy 키 제거 완료"
fi

# 4단계: 새 키 사용 확인
grep -r "providers\.ollama\." webview-ui/src/components/ > new-keys-usage.txt
echo "새 키 사용 현황:"
cat new-keys-usage.txt

echo "✅ 모든 검증 통과!"
```

#### 2.7 UI 실제 테스트 (🚨 필수 - 수동 검증!)
```bash
# 체크리스트 (수동으로 확인)
echo "=== UI 테스트 체크리스트 ==="
echo "[ ] 1. VS Code에서 해당 프로바이더 설정 페이지 열기"
echo "[ ] 2. 모든 텍스트가 정상 표시되는지 확인"
echo "[ ] 3. 언어를 한국어로 변경 - 번역 확인"
echo "[ ] 4. 언어를 일본어로 변경 - 번역 확인"
echo "[ ] 5. 언어를 중국어로 변경 - 번역 확인"
echo "[ ] 6. 영어로 다시 변경 - 정상 표시 확인"
echo "[ ] 7. 콘솔에 missing key 에러가 없는지 확인"
echo ""
echo "⚠️ 위 체크리스트를 모두 통과해야 작업 완료!"
```

### Phase 3: 검증 및 테스트

#### 3.0 임시 파일 정리 (새로 추가)
```bash
# 작업 중 생성된 분석 파일들 삭제
rm -f *-keys.txt
rm -f *-required-keys.txt
rm -f *-analysis.txt
rm -f *-validation.txt
echo "🗑️ 임시 분석 파일들이 정리되었습니다."
```

#### 3.1 자동 검증 스크립트
```bash
# 미사용 키 검출
npm run check-unused-keys

# TypeScript 컴파일 확인
npm run compile

# 타입 체크
npm run check-types
```

#### 3.2 중간 커밋 생성 (새로 추가)
```bash
# 각 프로바이더 완료 후 중간 커밋
git add .
git commit -m "feat: Complete [PROVIDER] i18n consolidation

- Consolidate [provider]Provider.* → providers.[provider].*
- Consolidate [provider]ModelPicker.* → providers.[provider].*
- Update TypeScript references
- Sync 4 languages (en/ko/ja/zh)
- Remove old key structures
- Fix hardcoded values

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "✅ [PROVIDER] 중간 커밋 완료"
```

#### 3.2 수동 검증 체크리스트
- [ ] UI에서 모든 텍스트가 정상 표시되는가?
- [ ] 언어 변경 시 모든 키가 번역되는가?
- [ ] 콘솔에 missing key 에러가 없는가?
- [ ] 프로바이더 설정이 정상 동작하는가?

## 개별 프로바이더 작업 계획

### 🔥 Priority 1: Ollama (modelPicker 보유)
**현재 구조**:
```
ollamaProvider.*
ollamaModelPicker.*
```
**목표 구조**:
```
providers.ollama.*
providers.ollama.modelPicker.*
```

### 🔥 Priority 2: Anthropic (많은 설정)
**현재 구조**:
```
anthropicProvider.*
```
**목표 구조**:
```
providers.anthropic.*
```

### 🔥 Priority 3: Bedrock (복잡한 설정)
**현재 구조**:
```
bedrockProvider.*
```
**목표 구조**:
```
providers.bedrock.*
```

### 📋 나머지 프로바이더들
- Gemini → providers.gemini
- DeepSeek → providers.deepseek
- Vertex → providers.vertex
- LiteLLM → providers.litellm
- 기타 등등...

## 🚨 강화된 작업 체크리스트 (Caret 실수 반영)

각 프로바이더당 **반드시** 다음 체크리스트를 **순서대로** 완료:

### 📋 [Provider Name] 통합 작업 (실패 방지 버전)
- [ ] **0단계: 사전 준비**
  - [ ] 백업 생성 완료
  - [ ] 검증 스크립트 실행하여 현재 상태 확인
- [ ] **1단계: 완전 분석 (🚨 Caret 실수 방지)**
  - [ ] TypeScript에서 실제 사용하는 모든 키 검색 완료
  - [ ] 필수 키 목록 파일 생성 (provider-required-keys.txt)
  - [ ] 누락될 수 있는 키 없는지 3번 재확인
- [ ] **2단계: 영어 파일 통합**
  - [ ] providers.{id}.* 구조로 통합
  - [ ] 필수 키 목록의 **모든** 키 포함 확인
  - [ ] 영어 파일 키 검증 스크립트 통과
- [ ] **3단계: TypeScript 업데이트**
  - [ ] 모든 참조 코드를 새 키 구조로 변경
  - [ ] Legacy 키 사용 완전 제거 확인
- [ ] **4단계: 다국어 동기화 (완전성 보장)**
  - [ ] 한국어: 영어와 동일한 키 구조 + 번역 완료
  - [ ] 일본어: 영어와 동일한 키 구조 + 번역 완료
  - [ ] 중국어: 영어와 동일한 키 구조 + 번역 완료
  - [ ] 각 언어별 키 검증 스크립트 통과
- [ ] **5단계: 정리**
  - [ ] 기존 *Provider/*ModelPicker 섹션 완전 제거
  - [ ] 제거 후 검증 (grep 결과 0개)
- [ ] **6단계: 완전 검증 (다층 검증)**
  - [ ] 컴파일 성공
  - [ ] 타입 체크 성공
  - [ ] Legacy 키 사용 0개 확인
  - [ ] 새 키 사용 정상 확인
- [ ] **7단계: UI 실제 테스트 (수동 검증)**
  - [ ] VS Code에서 해당 프로바이더 설정 페이지 정상 표시
  - [ ] 영어 → 한국어 → 일본어 → 중국어 → 영어 전환 테스트
  - [ ] 모든 텍스트가 missing key 없이 정상 표시
  - [ ] 콘솔 에러 0개
- [ ] **8단계: 문서화**
  - [ ] 변경사항 기록
  - [ ] 다음 작업자를 위한 노트 작성

### ⚠️ 중요 경고사항
1. **절대 단계를 건너뛰지 말 것** - Caret 실수 재발 방지
2. **키 검증을 3번 확인할 것** - 누락이 가장 큰 실수 원인
3. **UI 테스트는 반드시 수동으로 할 것** - 자동화만으로는 부족
4. **문제 발생 시 즉시 백업으로 복구할 것**

## 위험 요소 및 대응

### ⚠️ 주요 위험
1. **키 참조 누락**: TypeScript에서 사용하는 키를 놓칠 가능성
2. **언어별 불일치**: 한 언어만 업데이트하고 나머지 누락
3. **UI 깨짐**: 키 변경으로 인한 텍스트 누락
4. **빌드 실패**: 잘못된 키 참조로 인한 컴파일 오류

### 🛡️ 대응 방안
1. **전체 검색**: 각 키마다 프로젝트 전체 검색으로 모든 사용처 확인
2. **언어별 체크**: 4개 언어 모두 동일한 구조인지 확인
3. **단계별 테스트**: 각 단계마다 UI 확인
4. **컴파일 검증**: 매 변경마다 npm run compile 실행

## 성공 기준

### 🎯 완료 조건
1. **구조 통일**: 모든 프로바이더가 `providers.{id}.*` 구조 사용
2. **언어 일관성**: 4개 언어 모두 동일한 키 구조
3. **코드 동기화**: TypeScript 코드에서 새 키 구조 사용
4. **중복 제거**: 기존 *Provider, *ModelPicker 섹션 완전 삭제
5. **기능 정상**: 모든 프로바이더 설정이 정상 작동
6. **빌드 성공**: 컴파일 에러 및 타입 에러 없음

### 📊 품질 지표
- 컴파일 에러: 0개
- 타입 에러: 0개
- Missing key 경고: 0개
- UI 텍스트 누락: 0개
- 번역 누락: 0개

## 후속 작업

1. **문서 업데이트**: f02-multilingual-i18n.mdx에 새로운 표준 반영
2. **개발 가이드**: 새 프로바이더 추가 시 표준 구조 사용 가이드
3. **자동화**: 키 구조 검증 자동화 스크립트 개발
4. **모니터링**: 주기적 키 구조 일관성 체크

---

**참고**: 이 작업은 OpenRouter에서 얻은 경험을 바탕으로 체계적이고 안전하게 진행합니다. 각 단계마다 충분한 테스트와 검증을 통해 품질을 보장합니다.