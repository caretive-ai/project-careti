# Cline v3.35.0 Merge Verification Guide

**목적**: Cline v3.35.0의 신규 기능들이 Caret에 제대로 머징되었는지 검증하기 위한 테스트 가이드

**작성일**: 2025-11-16
**브랜치**: `merge/cline-v3.34.0-method3`
**기준**: Cline v3.35.0 릴리즈 노트 및 3-way 머지 결과

---

## 📋 목차

1. [머징 상태 요약](#머징-상태-요약)
2. [기능별 테스트 방법](#기능별-테스트-방법)
3. [자동화된 검증 체크리스트](#자동화된-검증-체크리스트)
4. [수동 검증 시나리오](#수동-검증-시나리오)

---

## 머징 상태 요약

### ✅ 완전히 머징된 기능 (10개)

| # | 기능 | 상태 | 검증 방법 |
|---|------|------|-----------|
| 1 | **Minimax Provider** | ✅ 완료 | Provider 선택 가능 여부 |
| 2 | **GPT-5 Family 프롬프트** | ✅ 완료 | GPT-5 모델 사용 시 프롬프트 확인 |
| 3 | **Thinking Budget Slider** | ✅ 완료 | Settings에서 슬라이더 확인 |
| 4 | **Hooks 시스템** | ✅ 완료 | .clinerules/hooks/ 디렉토리 확인 |
| 5 | **ExtensionState 필드** | ✅ 완료 | 컴파일 에러 없음 |
| 6 | **Terminal API 타입** | ✅ 완료 | TerminalManager.ts 컴파일 |
| 7 | **Language Model API** | ✅ 완료 | vscode.lm 타입 정의 확인 |
| 8 | **Tool Calls Chunk** | ✅ 완료 | ApiStreamToolCallsChunk 타입 |
| 9 | **BizRouter Provider** | ✅ 복원 | Caret 기능 복원됨 |
| 10 | **<think> 태그 지원** | ✅ 완료 | 코드 내 think 태그 처리 확인 |

### ⏸️ 의도적으로 연기된 기능 (2개)

| # | 기능 | 상태 | 이유 | 향후 계획 |
|---|------|------|------|----------|
| 1 | **Native Tool Calling** | ⏸️ 부분 | ClineToolSet 전체 통합 필요 | 별도 작업 |
| 2 | **Remote Config** | ⏸️ 연기 | Cline 클라우드 인증 필요 (18+ 에러) | 별도 작업 |

### ❌ 확인 필요 기능 (3개)

| # | 기능 | 상태 | 확인 방법 |
|---|------|------|----------|
| 1 | **Auto-approve 개선** | ❓ | UI 확인 필요 |
| 2 | **Auth Tokens 삭제** | ❓ | 로그아웃 동작 확인 |
| 3 | **Requesty 수정** | ❓ | Requesty provider 테스트 |

---

## 기능별 테스트 방법

### 1. ✅ Minimax Provider

**파일 위치**:
- `src/core/api/providers/minimax.ts`
- `src/shared/api.ts` (minimaxModels 정의)

**테스트 방법**:
```bash
# 1. 코드 확인
grep -n "minimax" src/shared/api.ts
grep -n "case \"minimax\":" src/core/api/index.ts

# 2. 타입 체크
npm run check-types | grep -i minimax

# 3. 런타임 확인
# Settings > API Provider > "Minimax" 선택 가능 여부 확인
# Model: "MiniMax-M2" 선택 가능 여부
```

**예상 결과**:
- ✅ Provider 목록에 "Minimax" 표시
- ✅ Model "MiniMax-M2" 선택 가능
- ✅ API Key 입력 필드 존재
- ✅ API Line 설정 가능

**검증 스크립트**:
```bash
# Provider가 등록되어 있는지 확인
grep '"minimax"' src/shared/api.ts && echo "✅ Minimax type defined" || echo "❌ Missing"
grep 'case "minimax":' src/core/api/index.ts && echo "✅ Minimax handler registered" || echo "❌ Missing"
```

---

### 2. ✅ GPT-5 Family 시스템 프롬프트

**파일 위치**:
- `src/core/prompts/system-prompt/variants/gpt-5/`
- `src/core/prompts/system-prompt/variants/native-gpt-5/`
- `src/shared/prompts.ts` (ModelFamily 정의)

**테스트 방법**:
```bash
# 1. Variant 확인
ls -la src/core/prompts/system-prompt/variants/gpt-5/
ls -la src/core/prompts/system-prompt/variants/native-gpt-5/

# 2. ModelFamily 확인
grep "GPT_5\|NATIVE_GPT_5" src/shared/prompts.ts

# 3. Matcher 확인
grep -A10 "isGPT5ModelFamily" src/core/prompts/system-prompt/variants/native-gpt-5/config.ts
```

**예상 결과**:
- ✅ ModelFamily.GPT_5 정의됨
- ✅ ModelFamily.NATIVE_GPT_5 정의됨
- ✅ GPT-5 모델 사용 시 전용 프롬프트 적용

**검증 스크립트**:
```bash
# GPT-5 variants 존재 확인
[ -d "src/core/prompts/system-prompt/variants/gpt-5" ] && echo "✅ GPT-5 variant exists" || echo "❌ Missing"
[ -d "src/core/prompts/system-prompt/variants/native-gpt-5" ] && echo "✅ Native GPT-5 variant exists" || echo "❌ Missing"
```

---

### 3. ✅ Thinking Budget Slider

**파일 위치**:
- `webview-ui/src/components/settings/ThinkingBudgetSlider.tsx`
- `src/shared/ExtensionMessage.ts` (planModeThinkingBudgetTokens, actModeThinkingBudgetTokens)

**테스트 방법**:
```bash
# 1. 컴포넌트 확인
ls -la webview-ui/src/components/settings/ThinkingBudgetSlider.tsx

# 2. State 필드 확인
grep "thinkingBudgetTokens" src/shared/ExtensionMessage.ts

# 3. UI 확인 (런타임)
# Settings > Model Settings > Thinking Budget 슬라이더 확인
```

**예상 결과**:
- ✅ Settings에 Thinking Budget 슬라이더 표시
- ✅ Plan Mode / Act Mode 각각 설정 가능
- ✅ 값 범위: 0 ~ max tokens
- ✅ Claude Sonnet 등 thinking 지원 모델에서만 활성화

**수동 테스트**:
1. VS Code에서 Caret 실행
2. Settings 열기
3. API Configuration > Model Settings
4. Thinking Budget 슬라이더 찾기
5. 값 변경 후 저장 확인

---

### 4. ✅ Hooks 시스템

**파일 위치**:
- `.clinerules/hooks/README.md`
- `.clinerules/hooks/PreToolUse.example`
- `.clinerules/hooks/PostToolUse.example`
- `src/shared/ExtensionMessage.ts` (hooksEnabled)

**테스트 방법**:
```bash
# 1. Hooks 디렉토리 확인
ls -la .clinerules/hooks/

# 2. README 확인
cat .clinerules/hooks/README.md | head -50

# 3. State 필드 확인
grep "hooksEnabled" src/shared/ExtensionMessage.ts

# 4. Example hooks 확인
ls -la .clinerules/hooks/*.example
```

**예상 결과**:
- ✅ `.clinerules/hooks/` 디렉토리 존재
- ✅ `README.md`, `PreToolUse.example`, `PostToolUse.example` 파일 존재
- ✅ `hooksEnabled` state 필드 정의됨
- ✅ Settings에서 Hooks 활성화/비활성화 가능

**검증 스크립트**:
```bash
# Hooks 파일 존재 확인
[ -f ".clinerules/hooks/README.md" ] && echo "✅ Hooks README exists" || echo "❌ Missing"
[ -f ".clinerules/hooks/PreToolUse.example" ] && echo "✅ PreToolUse example exists" || echo "❌ Missing"
[ -f ".clinerules/hooks/PostToolUse.example" ] && echo "✅ PostToolUse example exists" || echo "❌ Missing"
```

**실제 사용 테스트**:
1. `.clinerules/hooks/PreToolUse` 파일 생성
2. 예제 스크립트 복사
3. 실행 권한 부여: `chmod +x .clinerules/hooks/PreToolUse`
4. Caret에서 tool 사용 시 hook 실행 확인

---

### 5. ✅ ExtensionState 필드 (Cline v3.35.0)

**파일 위치**:
- `src/shared/ExtensionMessage.ts`
- `src/core/controller/index.ts` (postStateToWebview)
- `webview-ui/src/context/ExtensionStateContext.tsx`

**테스트 방법**:
```bash
# 1. 필드 정의 확인
grep -n "maxConsecutiveMistakes\|subagentTerminalOutputLineLimit\|vscodeTerminalExecutionMode\|backgroundCommand\|hooksEnabled\|nativeToolCallSetting" src/shared/ExtensionMessage.ts

# 2. State 로딩 확인
grep -A5 "maxConsecutiveMistakes\|hooksEnabled" src/core/controller/index.ts

# 3. Frontend 기본값 확인
grep -A5 "maxConsecutiveMistakes\|hooksEnabled" webview-ui/src/context/ExtensionStateContext.tsx

# 4. 타입 체크
npm run check-types
```

**예상 결과**:
- ✅ ExtensionState 인터페이스에 모든 필드 정의됨
- ✅ controller에서 state 로딩 코드 존재
- ✅ frontend에서 기본값 설정됨
- ✅ 타입 에러 없음

**검증 스크립트**:
```bash
# ExtensionState 필드 확인
echo "Checking ExtensionState fields..."
fields=("maxConsecutiveMistakes" "subagentTerminalOutputLineLimit" "vscodeTerminalExecutionMode" "hooksEnabled" "nativeToolCallSetting")
for field in "${fields[@]}"; do
  grep -q "$field" src/shared/ExtensionMessage.ts && echo "✅ $field defined" || echo "❌ $field missing"
done
```

---

### 6. ✅ Terminal API 타입 정의

**파일 위치**:
- `src/integrations/terminal/TerminalManager.ts`
- `src/types/vscode-extensions.d.ts`

**테스트 방법**:
```bash
# 1. Terminal API 타입 확인
grep -A20 "declare module \"vscode\"" src/integrations/terminal/TerminalManager.ts

# 2. 컴파일 확인
npm run check-types | grep -i terminal

# 3. shellIntegration 확인
grep "shellIntegration" src/integrations/terminal/TerminalManager.ts
```

**예상 결과**:
- ✅ `Terminal` 인터페이스에 `shellIntegration` 정의
- ✅ `window.onDidStartTerminalShellExecution` 타입 정의
- ✅ TerminalManager.ts 컴파일 성공

**검증 스크립트**:
```bash
# Terminal types 확인
grep -q "shellIntegration" src/integrations/terminal/TerminalManager.ts && echo "✅ Terminal shellIntegration defined" || echo "❌ Missing"
grep -q "onDidStartTerminalShellExecution" src/integrations/terminal/TerminalManager.ts && echo "✅ Terminal event defined" || echo "❌ Missing"
```

---

### 7. ✅ Language Model API (vscode.lm)

**파일 위치**:
- `src/types/vscode-extensions.d.ts`
- `src/core/api/providers/vscode-lm.ts`

**테스트 방법**:
```bash
# 1. 타입 정의 확인
grep -A20 "interface LanguageModelChat" src/types/vscode-extensions.d.ts

# 2. lm namespace 확인
grep -A10 "namespace lm" src/types/vscode-extensions.d.ts

# 3. Provider 확인
ls -la src/core/api/providers/vscode-lm.ts

# 4. 컴파일 확인
npm run check-types | grep -i "languagemodel\|vscode.*lm"
```

**예상 결과**:
- ✅ `LanguageModelChat` 인터페이스 정의
- ✅ `lm.selectChatModels()` 타입 정의
- ✅ vscode-lm provider 존재
- ✅ 컴파일 에러 없음

**검증 스크립트**:
```bash
# Language Model API 확인
grep -q "interface LanguageModelChat" src/types/vscode-extensions.d.ts && echo "✅ LanguageModelChat defined" || echo "❌ Missing"
grep -q "namespace lm" src/types/vscode-extensions.d.ts && echo "✅ lm namespace defined" || echo "❌ Missing"
```

---

### 8. ✅ Tool Calls Chunk (OpenAI 호환)

**파일 위치**:
- `src/core/api/transform/stream.ts`
- `src/core/api/transform/tool-call-processor.ts`

**테스트 방법**:
```bash
# 1. ApiStreamToolCallsChunk 타입 확인
grep -A10 "ApiStreamToolCallsChunk" src/core/api/transform/stream.ts

# 2. tool-call-processor 확인
ls -la src/core/api/transform/tool-call-processor.ts

# 3. ApiStreamChunk union 확인
grep -A20 "export type ApiStreamChunk" src/core/api/transform/stream.ts

# 4. 컴파일 확인
npm run check-types | grep -i "toolcall\|tool_call"
```

**예상 결과**:
- ✅ `ApiStreamToolCallsChunk` 인터페이스 정의
- ✅ `ApiStreamToolCall` 인터페이스 정의
- ✅ `ApiStreamChunk` union에 포함됨
- ✅ tool-call-processor.ts 존재

**검증 스크립트**:
```bash
# Tool calls types 확인
grep -q "ApiStreamToolCallsChunk" src/core/api/transform/stream.ts && echo "✅ ApiStreamToolCallsChunk defined" || echo "❌ Missing"
[ -f "src/core/api/transform/tool-call-processor.ts" ] && echo "✅ tool-call-processor exists" || echo "❌ Missing"
```

---

### 9. ✅ BizRouter Provider (Caret 복원)

**파일 위치**:
- `caret-src/core/api/providers/BizRouterApiProvider.ts`
- `src/shared/api.ts` (bizRouterModels)

**테스트 방법**:
```bash
# 1. Provider 파일 확인
ls -la caret-src/core/api/providers/BizRouterApiProvider.ts

# 2. API 설정 확인
grep -n "bizRouter" src/shared/api.ts | head -10

# 3. Handler 등록 확인
grep -n 'case "bizrouter":' src/core/api/index.ts

# 4. 컴파일 확인
npm run check-types | grep -i bizrouter
```

**예상 결과**:
- ✅ BizRouterApiProvider.ts 존재
- ✅ bizRouterApiKey, bizRouterUsePromptCache 정의
- ✅ BizRouterModelInfo 타입 정의
- ✅ api/index.ts에 case statement 등록

**검증 스크립트**:
```bash
# BizRouter 확인
[ -f "caret-src/core/api/providers/BizRouterApiProvider.ts" ] && echo "✅ BizRouter provider exists" || echo "❌ Missing"
grep -q '"bizrouter"' src/shared/api.ts && echo "✅ BizRouter type defined" || echo "❌ Missing"
grep -q 'case "bizrouter":' src/core/api/index.ts && echo "✅ BizRouter handler registered" || echo "❌ Missing"
```

---

### 10. ⏸️ Native Tool Calling (부분 머징)

**현재 상태**:
- ✅ ExtensionMessage.ts: `nativeToolCallSetting` 필드 추가됨
- ✅ PromptRegistry.ts: `nativeTools` 프로퍼티 정의됨
- ❌ ClineToolSet 통합: TODO 주석으로 연기

**파일 위치**:
- `src/shared/ExtensionMessage.ts`
- `src/core/prompts/system-prompt/registry/PromptRegistry.ts`

**확인 방법**:
```bash
# 1. State 필드 확인
grep "nativeToolCallSetting" src/shared/ExtensionMessage.ts

# 2. PromptRegistry 확인
grep -A5 "nativeTools\|TODO.*native" src/core/prompts/system-prompt/registry/PromptRegistry.ts

# 3. ClineToolSet 확인 (없을 것)
grep -r "ClineToolSet.getNativeTools" src/core/prompts/system-prompt/registry/PromptRegistry.ts
```

**예상 결과**:
- ✅ `nativeToolCallSetting` 필드 존재
- ✅ `nativeTools: any[]` 프로퍼티 존재
- ❌ TODO 주석: "Implement native tool calling support"
- ⏸️ 실제 ClineToolSet 통합은 연기됨

**향후 작업**:
```typescript
// TODO: Implement native tool calling support (Cline v3.35.0 feature)
// this.nativeTools = ClineToolSet.getNativeTools(variant, context)
this.nativeTools = undefined
```

---

### 11. ⏸️ Remote Config (연기)

**현재 상태**:
- ❌ fetchRemoteConfig 함수: 없음
- ❌ checkCliInstallation: 없음
- ❌ remoteConfigSettings: ExtensionMessage에 정의 안됨

**확인 방법**:
```bash
# 1. Remote config 파일 확인
ls -la src/core/storage/remote-config/ 2>/dev/null || echo "❌ Remote config not found"

# 2. Controller 확인
grep "fetchRemoteConfig\|remoteConfig" src/core/controller/index.ts

# 3. State 확인
grep "remoteConfigSettings" src/shared/ExtensionMessage.ts
```

**예상 결과**:
- ❌ remote-config 디렉토리 없음
- ❌ fetchRemoteConfig 호출 없음
- ❌ remoteConfigSettings 필드 없음

**연기 이유**:
- Cline 클라우드 인증 인프라 필요
- ClineEnv, AUTH endpoints 없음
- 18+ 타입 에러 발생
- Caret 독립 동작에 영향 없음

---

## 자동화된 검증 체크리스트

전체 검증을 한 번에 실행할 수 있는 스크립트:

```bash
#!/bin/bash
# Cline v3.35.0 Merge Verification Script

echo "=== Cline v3.35.0 Merge Verification ==="
echo ""

# 1. Compilation Check
echo "1️⃣ Checking compilation..."
npm run check-types > /dev/null 2>&1 && echo "✅ Compilation successful" || echo "❌ Compilation failed"
echo ""

# 2. Minimax Provider
echo "2️⃣ Checking Minimax provider..."
grep -q '"minimax"' src/shared/api.ts && echo "✅ Minimax type defined" || echo "❌ Missing"
grep -q 'case "minimax":' src/core/api/index.ts && echo "✅ Minimax handler registered" || echo "❌ Missing"
[ -f "src/core/api/providers/minimax.ts" ] && echo "✅ Minimax provider file exists" || echo "❌ Missing"
echo ""

# 3. GPT-5 Support
echo "3️⃣ Checking GPT-5 support..."
[ -d "src/core/prompts/system-prompt/variants/gpt-5" ] && echo "✅ GPT-5 variant exists" || echo "❌ Missing"
[ -d "src/core/prompts/system-prompt/variants/native-gpt-5" ] && echo "✅ Native GPT-5 variant exists" || echo "❌ Missing"
echo ""

# 4. Hooks System
echo "4️⃣ Checking Hooks system..."
[ -f ".clinerules/hooks/README.md" ] && echo "✅ Hooks README exists" || echo "❌ Missing"
[ -f ".clinerules/hooks/PreToolUse.example" ] && echo "✅ PreToolUse example exists" || echo "❌ Missing"
[ -f ".clinerules/hooks/PostToolUse.example" ] && echo "✅ PostToolUse example exists" || echo "❌ Missing"
echo ""

# 5. ExtensionState Fields
echo "5️⃣ Checking ExtensionState fields..."
fields=("maxConsecutiveMistakes" "subagentTerminalOutputLineLimit" "vscodeTerminalExecutionMode" "hooksEnabled" "nativeToolCallSetting")
for field in "${fields[@]}"; do
  grep -q "$field" src/shared/ExtensionMessage.ts && echo "✅ $field defined" || echo "❌ $field missing"
done
echo ""

# 6. Terminal API
echo "6️⃣ Checking Terminal API..."
grep -q "shellIntegration" src/integrations/terminal/TerminalManager.ts && echo "✅ Terminal shellIntegration defined" || echo "❌ Missing"
grep -q "onDidStartTerminalShellExecution" src/integrations/terminal/TerminalManager.ts && echo "✅ Terminal event defined" || echo "❌ Missing"
echo ""

# 7. Language Model API
echo "7️⃣ Checking Language Model API..."
grep -q "interface LanguageModelChat" src/types/vscode-extensions.d.ts && echo "✅ LanguageModelChat defined" || echo "❌ Missing"
grep -q "namespace lm" src/types/vscode-extensions.d.ts && echo "✅ lm namespace defined" || echo "❌ Missing"
echo ""

# 8. Tool Calls
echo "8️⃣ Checking Tool Calls support..."
grep -q "ApiStreamToolCallsChunk" src/core/api/transform/stream.ts && echo "✅ ApiStreamToolCallsChunk defined" || echo "❌ Missing"
[ -f "src/core/api/transform/tool-call-processor.ts" ] && echo "✅ tool-call-processor exists" || echo "❌ Missing"
echo ""

# 9. BizRouter Provider
echo "9️⃣ Checking BizRouter provider..."
[ -f "caret-src/core/api/providers/BizRouterApiProvider.ts" ] && echo "✅ BizRouter provider exists" || echo "❌ Missing"
grep -q '"bizrouter"' src/shared/api.ts && echo "✅ BizRouter type defined" || echo "❌ Missing"
grep -q 'case "bizrouter":' src/core/api/index.ts && echo "✅ BizRouter handler registered" || echo "❌ Missing"
echo ""

# 10. Thinking Budget Slider
echo "🔟 Checking Thinking Budget Slider..."
[ -f "webview-ui/src/components/settings/ThinkingBudgetSlider.tsx" ] && echo "✅ ThinkingBudgetSlider component exists" || echo "❌ Missing"
grep -q "thinkingBudgetTokens" src/shared/ExtensionMessage.ts && echo "✅ thinkingBudgetTokens field defined" || echo "❌ Missing"
echo ""

# Summary
echo "=== Summary ==="
echo "✅ = Fully integrated"
echo "⏸️ = Intentionally deferred"
echo "❌ = Missing or not integrated"
echo ""
echo "For detailed verification, see: caret-docs/merging/cline-v3.35.0-merge-verification-guide.md"
```

**스크립트 저장 및 실행**:
```bash
# 스크립트 저장
cat > verify-merge.sh << 'EOF'
[위 스크립트 내용]
EOF

# 실행 권한 부여
chmod +x verify-merge.sh

# 실행
./verify-merge.sh
```

---

## 수동 검증 시나리오

자동화된 스크립트로 확인할 수 없는 기능들을 수동으로 테스트하는 방법:

### 시나리오 1: Minimax Provider 테스트

**목표**: Minimax provider가 정상 작동하는지 확인

**단계**:
1. VS Code에서 Caret 실행 (F5 또는 Extension Host)
2. Caret 사이드바 열기
3. Settings (⚙️) 클릭
4. API Configuration 섹션
5. API Provider 드롭다운에서 "Minimax" 선택
6. API Key 입력 필드 확인
7. API Line 설정 확인 (선택사항)
8. Model 드롭다운에서 "MiniMax-M2" 선택
9. Save 클릭
10. Chat에서 간단한 질문 (API key 있으면 응답 확인)

**예상 결과**:
- ✅ "Minimax" provider 선택 가능
- ✅ API Key, API Line 필드 표시
- ✅ "MiniMax-M2" 모델 선택 가능
- ✅ 설정 저장 성공

---

### 시나리오 2: GPT-5 프롬프트 테스트

**목표**: GPT-5 모델 사용 시 전용 프롬프트가 적용되는지 확인

**단계**:
1. VS Code에서 Caret 실행
2. Settings에서 OpenAI provider 선택
3. Model을 GPT-5 계열로 선택 (예: gpt-5-preview)
4. Chat 시작
5. Developer Console 열기 (Cmd+Shift+I / Ctrl+Shift+I)
6. 프롬프트 로그 확인

**예상 결과**:
- ✅ GPT-5 모델 선택 가능
- ✅ 프롬프트에 GPT-5 전용 템플릿 적용
- ✅ Console에 "GPT_5" 또는 "NATIVE_GPT_5" variant 로그

**확인 방법**:
```javascript
// Developer Console에서 실행
// PromptRegistry가 올바른 variant를 선택했는지 확인
```

---

### 시나리오 3: Thinking Budget Slider 테스트

**목표**: Thinking Budget 설정이 정상 작동하는지 확인

**단계**:
1. VS Code에서 Caret 실행
2. Settings 열기
3. API Configuration > Model Settings
4. Thinking Budget 슬라이더 찾기
5. Plan Mode 슬라이더 조정 (예: 5000 tokens)
6. Act Mode 슬라이더 조정 (예: 3000 tokens)
7. Save 클릭
8. Settings 다시 열어서 값 유지 확인

**예상 결과**:
- ✅ Thinking Budget 슬라이더 표시
- ✅ Plan/Act Mode 각각 설정 가능
- ✅ 값 범위: 0 ~ 최대 토큰
- ✅ 저장 후 값 유지
- ✅ Claude Sonnet 등 thinking 지원 모델에서만 활성화

**주의사항**:
- Thinking을 지원하지 않는 모델에서는 슬라이더가 비활성화될 수 있음

---

### 시나리오 4: Hooks 시스템 테스트

**목표**: Pre/Post Tool Use Hooks가 정상 작동하는지 확인

**단계**:

**4-1. PreToolUse Hook 테스트**:
1. `.clinerules/hooks/PreToolUse` 파일 생성:
```bash
#!/bin/bash
# PreToolUse hook example

TOOL_NAME="$1"
TOOL_INPUT="$2"

echo "[PreToolUse] Tool: $TOOL_NAME"
echo "[PreToolUse] Input: $TOOL_INPUT"

# Block certain tools (optional)
if [ "$TOOL_NAME" = "execute_command" ]; then
  echo "BLOCK: Dangerous command execution"
  exit 1
fi

exit 0
```

2. 실행 권한 부여:
```bash
chmod +x .clinerules/hooks/PreToolUse
```

3. Settings에서 Hooks 활성화
4. Chat에서 파일 읽기 요청
5. Developer Console에서 hook 로그 확인

**4-2. PostToolUse Hook 테스트**:
1. `.clinerules/hooks/PostToolUse` 파일 생성:
```bash
#!/bin/bash
# PostToolUse hook example

TOOL_NAME="$1"
TOOL_INPUT="$2"
TOOL_OUTPUT="$3"

echo "[PostToolUse] Tool: $TOOL_NAME"
echo "[PostToolUse] Output length: ${#TOOL_OUTPUT}"

# Log to file
echo "$(date): $TOOL_NAME executed" >> /tmp/caret-tool-log.txt

exit 0
```

2. 실행 권한 부여
3. Chat에서 tool 사용
4. `/tmp/caret-tool-log.txt` 확인

**예상 결과**:
- ✅ Hook 스크립트 실행됨
- ✅ Console에 hook 로그 출력
- ✅ PreToolUse에서 exit 1 시 tool 실행 차단
- ✅ PostToolUse에서 결과 로깅

---

### 시나리오 5: BizRouter Provider 테스트 (Caret 전용)

**목표**: BizRouter provider가 복원되어 정상 작동하는지 확인

**단계**:
1. VS Code에서 Caret 실행
2. Settings에서 API Provider를 "BizRouter"로 선택
3. API Key 입력
4. Model 선택 (기본: openai/gpt-4o)
5. Prompt Cache 설정 확인
6. Save 후 Chat 테스트

**예상 결과**:
- ✅ "BizRouter" provider 선택 가능
- ✅ API Key 입력 필드 표시
- ✅ Use Prompt Cache 옵션 표시
- ✅ Model 선택 가능
- ✅ API 호출 성공 (API key 유효한 경우)

**참고**:
- BizRouter는 Caret 전용 기능으로, 하드코딩된 URL 사용: `https://bizrouter.ai/api/v1`

---

## 확인 필요 기능 (추가 검증)

다음 기능들은 자동/수동 테스트로 완전히 확인되지 않았으므로 추가 검증이 필요합니다:

### ❓ 1. Auto-approve 개선

**예상 변경사항**:
- Always-on with expanding menu
- Settings 간소화
- Notifications moved to General Settings

**확인 방법**:
1. Settings > Auto Approval 섹션 확인
2. UI가 expanding menu 형태인지 확인
3. General Settings에 notifications 설정 있는지 확인

**검증 필요**:
```bash
# Auto-approve UI 컴포넌트 확인
find webview-ui/src -name "*AutoApprove*" -o -name "*auto-approve*"
grep -r "expanding.*menu\|always.*on" webview-ui/src/components/settings/
```

---

### ❓ 2. Auth Tokens 삭제 (로그아웃 시)

**예상 동작**:
- 로그아웃 시 모든 Auth Tokens 삭제

**확인 방법**:
1. Caret에 로그인
2. 로그아웃 실행
3. Token storage 확인

**검증 필요**:
```bash
# Logout 핸들러 확인
grep -r "handleSignOut\|handleLogout" src/core/controller/
grep -A10 "clearAuth\|deleteToken" src/services/auth/
```

---

### ❓ 3. Requesty Base URL, API Key 수정

**예상 변경사항**:
- Requesty provider의 base URL, API key 처리 개선

**확인 방법**:
1. Settings에서 Requesty provider 선택
2. Base URL, API Key 필드 확인
3. 저장 후 값 유지 확인

**검증 필요**:
```bash
# Requesty provider 코드 확인
grep -A20 "RequestyHandler" src/core/api/providers/requesty.ts
grep "requestyBaseUrl\|requestyApiKey" src/shared/api.ts
```

---

## 최종 체크리스트

전체 검증 완료 후 확인할 사항:

### 코드 레벨 검증

- [ ] `npm run check-types` 성공 (0 errors)
- [ ] `npm run compile` 성공
- [ ] `npm run test:backend` 통과
- [ ] `npm run test:webview` 통과

### 기능 레벨 검증

- [ ] Minimax provider 작동 (API key 있으면 응답 확인)
- [ ] GPT-5 모델 선택 가능
- [ ] Thinking Budget 슬라이더 표시 및 작동
- [ ] Hooks 시스템 작동 (Pre/Post Tool Use)
- [ ] BizRouter provider 작동 (Caret 전용)
- [ ] Terminal API 타입 에러 없음
- [ ] Language Model API 사용 가능 (vscode.lm)
- [ ] Tool calls 처리 정상

### 문서 확인

- [ ] `.3way-merge-results.md` 업데이트됨
- [ ] 이 검증 가이드 작성됨
- [ ] 커밋 메시지에 모든 변경사항 기록됨

---

## 알려진 제한사항

### Native Tool Calling
- **상태**: 부분 머징
- **제한**: ClineToolSet 통합 안됨
- **영향**: Native tool calling 기능 미작동
- **해결**: 별도 작업 필요

### Remote Config
- **상태**: 연기됨
- **제한**: Cline 클라우드 인증 필요
- **영향**: Remote config 기능 미작동
- **해결**: Caret 독립 동작에 영향 없음, 필요시 별도 구현

---

## 문제 발생 시

### 컴파일 에러

```bash
# 1. 클린 빌드
npm run clean
npm install

# 2. Proto 재생성
npm run protos

# 3. 타입 체크
npm run check-types

# 4. 전체 빌드
npm run compile
```

### 런타임 에러

1. Developer Console 확인 (Cmd+Shift+I / Ctrl+Shift+I)
2. Extension Host 재시작
3. VS Code 재시작
4. Extension 재설치

### Provider 작동 안함

1. API Key 확인
2. Base URL 확인 (Requesty 등)
3. Network 확인
4. Developer Console에서 API 요청/응답 로그 확인

---

## 추가 리소스

- **3-way Merge 결과**: `.3way-merge-results.md`
- **Cline v3.35.0 릴리즈 노트**: `git show 3698d235`
- **커밋 이력**: `git log --oneline -10`
- **Hooks README**: `.clinerules/hooks/README.md`

---

**마지막 업데이트**: 2025-11-16
**작성자**: Claude Code
**브랜치**: merge/cline-v3.34.0-method3
