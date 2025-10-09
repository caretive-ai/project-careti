# Caret Features 문서 보강 마스터 플랜

**작성일**: 2025-10-09
**목적**: Squash Merge 전략을 위한 Feature 문서 완성도 검증 및 보강
**배경**: cline-latest 재삽입 방식(v0.2.0 패턴)을 위해 features 코드 범위가 정확해야 함

---

## 📋 작업 원칙

### 1️⃣ 분석 문서 검증 원칙
- ⚠️ **`work/analysis-of-102-modifications-back.md`는 100% 신뢰하지 않음**
- 모든 파일은 실제 diff로 검증 후 문서화
- 최소 침습 원칙 재확인 (lint/format 변경은 제외)

### 2️⃣ 파일 검증 3단계 프로세스
```bash
# Step 1: 실제 변경사항 확인
diff cline-latest/<file_path> <file_path>

# Step 2: CARET MODIFICATION 주석 확인
grep -n "CARET MODIFICATION" <file_path>

# Step 3: 기능 연관성 판단
# - 어느 feature에 속하는가?
# - Level 1 (caret-src) vs Level 2 (src 수정) 구분
# - 충돌 위험도 평가 (높음/중간/낮음)
```

### 3️⃣ 문서 보강 4가지 필수 섹션
각 feature 문서에 다음 섹션 추가:

#### 📦 **수정 파일 전체 목록**
- **Caret 독립 코드** (`caret-src/`, `caret-docs/`)
- **Backend 수정** (`src/` - Level 2)
- **Frontend 수정** (`webview-ui/src/` - Level 2)
- **Proto 정의** (`proto/`)
- **Scripts 수정** (`scripts/`)
- **검증 필요** (분석 문서에 있으나 확인 안된 파일)

#### ⚠️ **충돌 위험도 분석**
- **높음**: 핵심 함수 재작성, Cline도 자주 수정하는 부분
- **중간**: 함수 일부 수정, 주석 있음
- **낮음**: 단순 추가, 브랜딩 문자열 변경

#### 🔄 **Squash Merge 전략**
- **caret-src 분리 가능 여부**
- **Level 2 수정 최소화 방안**
- **업스트림 충돌 시 대응 시나리오**

#### 🧪 **검증 체크리스트**
- [ ] 모든 수정 파일 실제 diff 확인
- [ ] CARET MODIFICATION 주석 존재 확인
- [ ] 기능 동작 테스트 (TDD 기반)
- [ ] 컴파일 성공 확인 (`npm run compile`)

---

## 🎯 Feature별 작업 계획

### 🔴 **최우선 (신규 작성 필요)**

#### **F06: JSON System Prompt**
**상태**: ❌ 문서 없음, 충돌 위험 매우 높음

**1단계: 파일 검증**
```bash
# 분석 문서에서 언급된 파일들 실제 확인
diff cline-latest/src/core/prompts/system-prompt/index.ts src/core/prompts/system-prompt/index.ts
diff cline-latest/src/core/prompts/system-prompt/registry/PromptRegistry.ts src/core/prompts/system-prompt/registry/PromptRegistry.ts
diff cline-latest/src/core/prompts/system-prompt/variants/next-gen/template.ts src/core/prompts/system-prompt/variants/next-gen/template.ts
diff cline-latest/src/core/prompts/system-prompt/variants/gpt-5/template.ts src/core/prompts/system-prompt/variants/gpt-5/template.ts
diff cline-latest/src/core/prompts/system-prompt/tools/attempt_completion.ts src/core/prompts/system-prompt/tools/attempt_completion.ts

# 실험적 파일 확인 (caret-src로 이동 가능성)
ls -la src/core/prompts/system-prompt-legacy/families/next-gen-models/gpt-5.ts
```

**2단계: 기능 분석**
- [ ] Caret JSON 프롬프트 vs Cline 레거시 프롬프트 차이점 명확화
- [ ] 듀얼 모드 전환 메커니즘 (`CaretGlobalManager`, `PromptSystemManager`)
- [ ] `yoloMode` 동적 규칙 시스템
- [ ] caret-src 분리 가능 여부 판단

**3단계: 문서 작성**
- 위치: `caret-docs/features/f06-json-system-prompt.mdx`
- 템플릿: f04/f05/f08 참고
- 필수 포함: 충돌 위험도 높은 파일 리스트, caret-src 마이그레이션 계획

**예상 작업 시간**: 4-6시간 (검증 + 분석 + 문서화)

---

#### **F07: Chatbot Agent Mode**
**상태**: ❌ 문서 없음, f06과 밀접한 관계

**1단계: f06과의 관계 명확화**
```bash
# f06과 동일한 파일을 수정하는지 확인
# Agent MODE vs ACT MODE 전환 로직 위치 파악
grep -r "yoloMode\|agentMode\|actMode" src/core/prompts/
```

**2단계: 독립 기능 분석**
- [ ] f06과 독립적인 파일이 있는가?
- [ ] 별도 proto 정의가 있는가? (`proto/caret/system.proto` 확인)
- [ ] Agent 모드만의 고유 동작 방식

**3단계: 문서 작성**
- f06과의 차이점 명확히 기술
- 필요시 f06과 통합 문서 고려

**예상 작업 시간**: 3-4시간

---

#### **F03: Branding UI System**
**상태**: ⚠️ 문서 매우 부실, 횡단 관심사

**1단계: 브랜딩 관련 파일 전수 조사**
```bash
# 모든 "Cline" → "Caret" 변경 파일 검색
grep -r "CARET MODIFICATION.*brand" src/ webview-ui/src/
grep -r '"Caret"' src/ | grep -v node_modules | wc -l
grep -r "BrandedApiProvider\|brand-utils" src/
```

**2단계: 동적 브랜딩 시스템 분석**
- [ ] B2B 브랜딩 (Caret ↔ CodeCenter 전환)
- [ ] `src/core/api/index.ts` - BrandedApiProvider 전환 로직
- [ ] `src/shared/ExtensionMessage.ts` - ExtensionState 확장
- [ ] 환경 변수 기반 브랜드 설정

**3단계: 충돌 위험 파일 분류**
```bash
# 분석 문서에서 언급된 고위험 파일 검증
diff cline-latest/src/core/api/providers/vercel-ai-gateway.ts src/core/api/providers/vercel-ai-gateway.ts
diff cline-latest/src/core/api/providers/vscode-lm.ts src/core/api/providers/vscode-lm.ts
diff cline-latest/src/integrations/editor/detect-omission.ts src/integrations/editor/detect-omission.ts
```

**4단계: 문서 대폭 보강**
- 현재 문서에 파일 목록 추가
- 브랜딩 아키텍처 다이어그램
- caret-src 분리 전략 (브랜딩 유틸리티 모듈화)

**예상 작업 시간**: 5-7시간

---

#### **F10: Enhanced Provider Setup**
**상태**: ❌ 문서 없음, 프로바이더별 최적화

**1단계: 프로바이더 파일 검증**
```bash
# 추가 분석 필요 파일 (49개) 중 프로바이더 관련 확인
for file in src/core/api/providers/{cline,doubao,fireworks,litellm,lmstudio,openai,openrouter,qwen,requesty,xai}.ts; do
  echo "=== $file ==="
  diff cline-latest/$file $file | head -20
done

# Transform 로직 확인
diff cline-latest/src/core/api/transform/openrouter-stream.ts src/core/api/transform/openrouter-stream.ts
diff cline-latest/src/core/api/transform/vercel-ai-gateway-stream.ts src/core/api/transform/vercel-ai-gateway-stream.ts
```

**2단계: 최적화 로직 분석**
- [ ] 모델별 파라미터 (`cache_control`, `reasoning`)
- [ ] LiteLLM 통합 범위
- [ ] SAP AI Core 통합
- [ ] `getSapAiCoreModels.ts`, `refreshOpenRouterModels.ts` 역할

**3단계: 문서 작성**
- 프로바이더별 최적화 매트릭스 테이블
- 충돌 위험도 높은 이유 (Cline도 빠르게 모델 지원 추가)
- caret-src 분리 가능성 (설정 외부화)

**예상 작업 시간**: 4-5시간

---

### 🟠 **2순위 (중요도 높음)**

#### **F09: Feature Config System**
**상태**: ❌ 문서 없음, StateManager 통합

**1단계: StateManager 수정 범위 확인**
```bash
diff cline-latest/src/core/storage/StateManager.ts src/core/storage/StateManager.ts
diff cline-latest/src/core/storage/state-migrations.ts src/core/storage/state-migrations.ts
diff cline-latest/src/core/storage/state-keys.ts src/core/storage/state-keys.ts
```

**2단계: 기능 구성 시스템 역할 분석**
- [ ] 어떤 "기능 구성"인가? (페르소나? 프롬프트 모드?)
- [ ] StateManager 통합 방식
- [ ] 마이그레이션 전략 (기존 설정 → 새 설정)

**3단계: 문서 작성**
- StateManager 아키텍처 변경사항
- 충돌 위험도 분석 (Cline의 OCA 기능과 충돌)

**예상 작업 시간**: 3-4시간

---

#### **F02: Multilingual i18n**
**상태**: ⚠️ 기본 정보만 있음

**1단계: i18n 시스템 전체 검증**
```bash
# locales 폴더 구조 확인
tree locales/ -L 2

# 네임스페이스별 파일 확인
ls -la locales/*/common.json locales/*/settings.json locales/*/chat.json

# 동적 번역 패턴 검색
grep -r "getMenuItems\|useMemo.*language" webview-ui/src/
```

**2단계: 문서 보강**
- [ ] 4개 언어 지원 아키텍처
- [ ] 네임스페이스 규칙 상세 설명
- [ ] 동적 번역 패턴 (`getMenuItems()` 패턴)
- [ ] 번역 파일 관리 가이드
- [ ] 프론트엔드 파일 목록 추가

**예상 작업 시간**: 2-3시간

---

#### **F01: Common Utilities**
**상태**: ⚠️ 개념적 정의만 있음

**1단계: 유틸리티 파일 전수 조사**
```bash
# 추가 분석 필요 파일 중 유틸리티 확인
diff cline-latest/src/common.ts src/common.ts
diff cline-latest/src/integrations/misc/extract-text.ts src/integrations/misc/extract-text.ts
diff cline-latest/src/integrations/editor/detect-omission.ts src/integrations/editor/detect-omission.ts

# Caret 유틸리티
ls -la webview-ui/src/caret/utils/
```

**2단계: f01 기준 명확화**
- [ ] 어떤 유틸리티가 f01에 속하는가?
- [ ] 브랜딩 관련 유틸리티는 f03인가 f01인가?
- [ ] `.xlsx` 지원은 독립 기능인가 유틸리티인가?

**3단계: 문서 정리**
- 유틸리티 분류 체계
- 각 유틸리티의 역할과 사용처

**예상 작업 시간**: 2-3시간

---

### 🟡 **3순위 (상대적으로 간단)**

#### **F11: Input History System**
**상태**: ❌ 문서 없음, 비교적 간단

**1단계: 입력 기록 시스템 검증**
```bash
# Backend
diff cline-latest/src/core/storage/state-keys.ts src/core/storage/state-keys.ts | grep -A5 -B5 "inputHistory\|InputHistory"
grep -r "inputHistory" src/shared/ExtensionMessage.ts proto/cline/state.proto

# Frontend
cat webview-ui/src/caret/hooks/usePersistentInputHistory.ts | head -50
```

**2단계: 문서 작성**
- 입력 기록 저장/불러오기 메커니즘
- 화살표 키 탐색 기능
- globalState vs workspaceState 선택 이유

**예상 작업 시간**: 2시간

---

### 🟢 **4순위 (이미 완성, 검증만 필요)**

#### **F04: Caret Account** ✅
**검증 작업**:
- [ ] 문서에 언급된 8개 gRPC 핸들러 실제 존재 확인
- [ ] `src/core/api/providers/caret.ts` 추가 (분석 문서 언급)
- [ ] 충돌 위험 파일 (`api-configuration-conversion.ts`) 재확인

#### **F05: Rule Priority System** ✅
**검증 작업**:
- [ ] 통합 테스트 실제 존재 및 통과 확인
- [ ] 충돌 위험 파일 (`external-rules.ts`, `prompts/system-prompt/types.ts`) 재확인

#### **F08: Persona System** ✅
**검증 작업**:
- [ ] 하이브리드 패턴 실제 구현 확인
- [ ] proto 빌드 스크립트 충돌 위험 재평가

---

## 📊 작업 진행 트래킹

### Phase 1: 검증 및 파일 매핑 (예상 2-3일)
- [ ] **F06**: 파일 검증 → 기능 분석 → 문서 작성
- [ ] **F07**: f06과의 관계 분석 → 문서 작성
- [ ] **F03**: 브랜딩 파일 전수 조사 → 문서 보강

### Phase 2: 중요 기능 문서화 (예상 2일)
- [ ] **F10**: 프로바이더 검증 → 문서 작성
- [ ] **F09**: StateManager 분석 → 문서 작성
- [ ] **F02**: i18n 시스템 보강

### Phase 3: 나머지 문서 완성 (예상 1일)
- [ ] **F01**: 유틸리티 정리
- [ ] **F11**: 입력 기록 문서 작성

### Phase 4: 완성 문서 검증 (예상 1일)
- [ ] **F04, F05, F08**: 기존 문서 검증 및 보완

**총 예상 기간**: 6-7일 (집중 작업 시)

---

## 🚨 주의사항

### 1. 분석 문서 검증 필수
```bash
# 모든 파일은 실제 diff로 재확인
# "분석 문서에 있다"고 100% 신뢰하지 말 것
diff cline-latest/<file> <file>
```

### 2. 최소 침습 원칙 재적용
- lint/format 변경만 있는 파일 → 수정 목록에서 제외
- 기능에 영향 없는 로그 추가 → 제외 여부 판단

### 3. CARET MODIFICATION 주석 필수
```typescript
// ❌ 주석 없이 수정 → 즉시 주석 추가 또는 원본 복원 고려
// ✅ CARET MODIFICATION: 명확한 이유 기술
```

### 4. caret-src 분리 가능성 항상 고려
- Level 2 수정을 Level 1로 전환할 방법 찾기
- Squash Merge 시 충돌 최소화

---

## 📝 문서 템플릿

각 feature 문서는 다음 구조를 따름:

```markdown
# F0X - Feature Name

## 📋 기능 개요
(간단한 설명)

## 🏗️ 구현 아키텍처
(핵심 로직 설명)

## 📦 수정 파일 전체 목록

### Caret 독립 코드 (Level 1)
- `caret-src/...`
- `caret-docs/...`

### Backend 수정 (Level 2)
- `src/...` (CARET MODIFICATION 있음)

### Frontend 수정 (Level 2)
- `webview-ui/src/...`

### Proto 정의
- `proto/caret/...`
- `proto/cline/...` (필드 추가)

### Scripts 수정
- `scripts/...`

### 검증 필요 파일
- `src/...` (분석 문서에만 있고 실제 확인 안됨)

## ⚠️ 충돌 위험도 분석

### 높음 (High)
- **파일명**: `src/core/.../xxx.ts`
  - **이유**: 핵심 함수 완전 대체, Cline도 자주 수정
  - **대응**: caret-src 분리 검토

### 중간 (Medium)
- ...

### 낮음 (Low)
- ...

## 🔄 Squash Merge 전략

### caret-src 분리 가능 항목
- ...

### Level 2 수정 필수 항목
- ...

### 업스트림 충돌 시 대응 시나리오
1. ...
2. ...

## 🧪 검증 체크리스트
- [ ] 모든 수정 파일 실제 diff 확인
- [ ] CARET MODIFICATION 주석 존재
- [ ] 기능 동작 테스트 통과
- [ ] `npm run compile` 성공
- [ ] `npm run test:backend` 성공

## 🔮 향후 개선 계획
(있다면)

---
**작성일**: YYYY-MM-DD
**검증일**: YYYY-MM-DD
**상태**: ✅ 완료 / 🟡 진행중 / ❌ 미작성
```

---

## 🎯 최종 목표

**"Squash Merge 시 cline-latest에 재삽입할 수 있는 완벽한 features 코드 범위 문서화"**

- 각 feature의 모든 수정 파일 100% 검증
- 충돌 위험도 평가 완료
- caret-src 분리 전략 수립
- 업스트림 병합 시나리오 준비

**이 계획서를 기준으로 하나씩 작업하며, 완료 시 체크리스트 업데이트**
