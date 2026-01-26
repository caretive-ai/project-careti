# Cline 침습 현황 마스터 문서 (Invasion Status Master)

**작성일**: 2025-10-09
**작업자**: Claude (AI Assistant) + Luke (Project Owner)
**목적**: Cline upstream 머징 시 참고할 정확하고 상세한 침습 현황 통합 문서
**기준**: main 브랜치 v0.2.4 (커밋: 9b1094e7c)

---

## 🎯 문서 목적

### ❓ 왜 이 문서가 필요한가?

**기존 `analysis-of-102-modifications.md`의 한계**:
- ✅ **장점**: 102개 수정 파일의 전체 목록 제공
- ❌ **문제**:
  - Feature 분류 오류 다수 (F01 사례: 대부분 파일이 잘못 분류됨)
  - 실제 변경 내용 검증 부족
  - 충돌 위험도 분석 불충분
  - 다중 Feature 수정 파일 식별 안됨

**이 문서의 목표**:
1. **정확성**: F01-F11 Feature 문서에서 실제 소스 검증된 정보만 사용
2. **완전성**: 모든 침습 파일의 Feature 매핑 + 충돌 위험도 제공
3. **실용성**: 머징 시 즉시 활용 가능한 전략 및 체크리스트 제공

---

## 📊 침습 현황 요약 (Executive Summary)

### 전체 통계

| 항목 | 수량 | 비고 |
|---|---|---|
| **전체 수정 파일** | ~102개 | analysis-of-102 기준 |
| **Careti 전용 파일** | ~70개 | `careti-src/`, `careti-docs/`, `assets/` 등 - 충돌 없음 |
| **Cline 침습 파일** | ~32개 | 실제 Cline 원본 수정 파일 - 주의 필요 |
| **고위험 파일** | 8-10개 | 다중 Feature 수정 또는 핵심 파일 |

### Feature별 침습 레벨

| Feature | 침습 레벨 | Cline 수정 파일 수 | 충돌 위험 |
|---|---|---|---|
| **F01 - Common Util** | Level 1 | 3개 | 🟢 Very Low |
| **F02 - i18n** | Level 2 | 5-7개 | 🟡 Medium |
| **F03 - Branding** | Level 3 | 15-20개 | 🔴 High |
| **F04 - Account** | Level 1 | 1개 | 🟢 Very Low |
| **F06 - Agent Standardization** | Level 3 | 10-12개 | 🔴 High |
| **F06 - JSON Prompt** | Level 2 | 3-5개 | 🟡 Medium |
| **F07 - Chatbot/Agent** | Level 2 | (F06 공유) | 🟡 Medium |
| **F08 - Persona** | Level 2 | 3개 | 🟡 Medium |
| **F09 - Feature Config** | Level 1 | 4-5개 | 🟢 Very Low |
| **F10 - Provider Setup** | Level 2 | 8-10개 | 🟡 Medium |
| **F11 - Input History** | Level 2 | 4개 | 🟡 Medium |

---

## 📁 Feature별 침습 파일 목록

### F01 - Common Util (🟢 Very Low Risk)

#### Cline 수정 파일 (3개)

| 파일 경로 | 변경 내용 | 충돌 위험 | 머지 전략 |
|---|---|---|---|
| `src/integrations/misc/extract-text.ts` | lint 자동 수정만 (`@ts-ignore` → `@ts-expect-error`) | 낮음 | **원본 복원** - 최소 침습 원칙 |
| `src/integrations/editor/detect-omission.ts` | GitHub URL 변경 | 낮음 | **F03 Branding 포함** |
| `webview-ui/src/context/ExtensionStateContext.tsx` | CaretiGlobalManager 통합 | 중간 | CARETI MODIFICATION 주석 유지 |

#### Careti 전용 파일 (충돌 없음)
- `careti-src/managers/CaretiGlobalManager.ts`
- `careti-src/utils/brand-utils.ts`
- `webview-ui/src/careti/utils/*.ts` (3개)

---

### F02 - Multilingual i18n (🟡 Medium Risk)

#### Cline 수정 파일 (5-7개 추정)

**⚠️ 검증 필요**: F02 문서에서 정확한 침습 파일 목록 재확인 필요

주요 수정 파일 (예상):
- `webview-ui/src/components/**/*.tsx` - 다수의 UI 컴포넌트 i18n 적용
- 동적 번역 함수 패턴 적용 (정적 상수 → 동적 함수 + useMemo)

#### Careti 전용 파일
- `webview-ui/src/careti/utils/i18n.ts` - i18n 시스템
- `webview-ui/src/careti/locale/**/*.json` - 번역 파일 (4개 언어 × N개 네임스페이스)
- `careti-scripts/tools/i18n-*.js` - i18n 도구들

---

### F03 - Branding UI (🔴 High Risk)

#### Cline 수정 파일 (15-20개 추정)

**⚠️ 매우 광범위한 수정** - 브랜딩 관련 파일 다수 수정

주요 수정 영역:
1. **VS Code Extension 메타데이터**
   - `package.json` (42개+ 필드 수정)

2. **UI 컴포넌트** (다수)
   - 웰컴 페이지, 공지사항, 설정, 헤더 등

3. **스토리지 및 상태**
   - `src/core/storage/disk.ts` ⚠️ **고위험** - F03 + F08 공유

4. **터미널 브랜딩**
   - TerminalRegistry.ts 등

5. **자동화 스크립트**
   - `careti-scripts/brand-*.sh`

#### Careti 전용 파일
- `careti-src/shared/brand-utils.ts`
- `webview-ui/src/careti/components/Careti*.tsx` (다수)
- `assets/` - 브랜드 이미지 및 아이콘

---

### F04 - Careti Account (🟢 Very Low Risk)

#### Cline 수정 파일 (1개만!)

| 파일 경로 | 변경 내용 | 충돌 위험 | 머지 전략 |
|---|---|---|---|
| `webview-ui/src/components/account/AccountView.tsx` | 진입점 분기 (caretUser → CaretAccountView) | 낮음 | CARETI MODIFICATION 주석 유지 |

#### Careti 전용 파일 (완전 독립)
- `src/core/controller/caretAccount/*.ts` (9개 gRPC 핸들러)
- `proto/careti/account.proto`
- `src/services/account/CaretAccountService.ts`
- `webview-ui/src/careti/components/account/**/*.tsx`

**🎯 모범 사례**: 99% 독립 구현, 최소 침습 원칙 완벽 준수

---

### F06 - Agent Standardization (AAIF SoT) (🔴 High Risk)

#### Cline 수정 파일 (10-12개 추정)

**⚠️ 검증 필요**: F05 문서에서 정확한 침습 파일 목록 재확인 필요

예상 수정 파일:
- Rule 파일 시스템 관련 다수 파일 수정
- `.agents/context/` 디렉토리 처리 로직 추가

---

### F06 - JSON System Prompt (🟡 Medium Risk)

#### Cline 수정 파일 (3-5개)

| 파일 경로 | 변경 내용 | 충돌 위험 | 머지 전략 |
|---|---|---|---|
| `src/core/prompts/system-prompt/index.ts` | 모드 분기 진입점 (41 lines) | **높음** ⚠️ | CARETI MODIFICATION 주석 유지, 최소 분기만 |
| 기타 프롬프트 관련 파일 | (F06 문서 재확인 필요) | 중간 | 개별 검증 |

#### Careti 전용 파일
- `careti-src/core/prompts/CaretiPromptWrapper.ts`
- `careti-src/services/prompt/CaretModeManager.ts`

**🔗 F07과 하이브리드**: F07(Chatbot/Agent)은 동일 구현 공유, UX 레이어만 추가

---

### F07 - Chatbot Agent Mode (🟡 Medium Risk)

**F06과 구현 공유** - 별도 침습 파일 없음

- **기술 인프라**: F06 (CaretiPromptWrapper, CaretModeManager)
- **UX 레이어**: Chatbot/Agent 명칭 및 토글 UI

---

### F08 - Persona System (🟡 Medium Risk)

#### Cline 수정 파일 (3개)

| 파일 경로 | 변경 내용 | 충돌 위험 | 머지 전략 |
|---|---|---|---|
| `src/extension.ts` | CaretProviderWrapper 초기화 | 중간 | CARETI MODIFICATION 주석 유지 |
| `src/core/storage/disk.ts` | 페르소나 파일 경로 지원 | **높음** ⚠️ | **F03과 공유** - 주의 |
| `webview-ui/src/components/chat/ChatRow.tsx` | 페르소나 UI 통합 | 낮음 | CARETI MODIFICATION 주석 유지 |

#### Careti 전용 파일
- `careti-src/core/webview/CaretProviderWrapper.ts` (하이브리드 패턴)
- `careti-src/services/persona/*.ts`

**⚠️ disk.ts 공유 주의**: F03 + F08 동시 수정 (303 lines)

---

### F09 - Feature Config System (🟢 Very Low Risk)

#### Cline 수정 파일 (4-5개)

| 파일 경로 | 변경 내용 | 충돌 위험 | 머지 전략 |
|---|---|---|---|
| `src/core/storage/StateManager.ts` | 기본 provider 설정 시 FeatureConfig 사용 | 높음 ⚠️ | CARETI MODIFICATION 주석 유지 |
| `webview-ui/src/components/settings/ApiOptions.tsx` | 프로바이더 목록 필터링 | 중간 | CARETI MODIFICATION 주석 유지 |
| `webview-ui/src/components/chat/task-header/TaskHeader.tsx` | 비용 정보 표시 제어 | 낮음 | CARETI MODIFICATION 주석 유지 |
| `webview-ui/src/components/chat/ChatRow.tsx` | 비용 정보 표시 제어 | 낮음 | CARETI MODIFICATION 주석 유지 |

#### Careti 전용 파일
- `careti-src/shared/FeatureConfig.ts` (정적 import 시스템)
- `careti-src/shared/feature-config.json`

**🎯 모범 사례**: 거의 완전 독립, 최소 UI 통합만

---

### F10 - Enhanced Provider Setup (🟡 Medium Risk)

#### Cline 수정 파일 (8-10개)

**⚠️ API Transform 파일 고위험**

| 파일 경로 | 변경 내용 | 충돌 위험 | 머지 전략 |
|---|---|---|---|
| `src/core/api/transform/openrouter-stream.ts` | cache_control, reasoning 파라미터 동적 추가 | **높음** ⚠️ | 모델별 설정 외부화 권장 |
| `src/core/api/transform/vercel-ai-gateway-stream.ts` | Anthropic 캐싱 최적화 | **높음** ⚠️ | Cline 최신 로직 우선, 재평가 |
| gRPC 관련 파일 (다수) | 프로바이더 설정 UI 개선 | 낮음-중간 | CARETI MODIFICATION 주석 유지 |

#### Careti 전용 파일
- `proto/careti/models.proto` (프로바이더 설정)
- 프로바이더별 UI 컴포넌트 (일부 careti-src)

**🚨 주의**: API transform 파일들은 모델별 최적화로 Cline 변경사항 많을 가능성

---

### F11 - Input History System (🟡 Medium Risk)

#### Cline 수정 파일 (4개)

| 파일 경로 | 변경 내용 | 충돌 위험 | 머지 전략 |
|---|---|---|---|
| `src/core/controller/index.ts` | getStateToPostToWebview에 inputHistory 추가 | **높음** ⚠️ | CARETI MODIFICATION 주석 유지 (핵심) |
| `webview-ui/src/components/chat/ChatTextArea.tsx` | 히스토리 훅 통합 | 중간 | CARETI MODIFICATION 주석 유지 |
| 기타 (2개) | (F11 문서 재확인 필요) | 낮음-중간 | 개별 검증 |

#### Careti 전용 파일
- `careti-src/managers/CaretiGlobalManager.ts` (입력 히스토리 관리 추가)
- `webview-ui/src/careti/hooks/usePersistentInputHistory.ts`
- `webview-ui/src/careti/hooks/useInputHistory.ts`

**🎯 하이브리드 패턴 우수 사례**: CaretiGlobalManager 캐싱 + gRPC 저장

---

## 🔥 고위험 파일 분석 (High-Risk Files)

### 다중 Feature 수정 파일 (Conflict Hotspots)

| 파일 경로 | 수정 Features | 총 변경 라인 | 충돌 위험 | 머지 전략 |
|---|---|---|---|---|
| **`src/core/storage/disk.ts`** | F03 (Branding) + F08 (Persona) | 303 lines | 🔴 **매우 높음** | 순차 머지: F03 → F08, 통합 테스트 필수 |
| **`src/core/prompts/system-prompt/index.ts`** | F06 (JSON Prompt) | 41 lines | 🔴 **높음** | 최소 분기만, 진입점 로직 보존 |
| **`src/core/storage/StateManager.ts`** | F09 (FeatureConfig) + 기타? | ? | 🔴 **높음** | 기본값 설정 로직만, 핵심 로직 미수정 |
| **`src/core/controller/index.ts`** | F11 (InputHistory) + 기타? | ? | 🔴 **높음** | getStateToPostToWebview 수정만 |
| **`src/core/api/transform/*.ts`** | F10 (ProviderSetup) | ? | 🟡 **중간-높음** | Cline 최신 우선, 모델별 설정 재평가 |
| **`webview-ui/src/components/chat/ChatRow.tsx`** | F08, F09 | ? | 🟡 **중간** | 여러 CARETI MODIFICATION 주석 유지 |
| **`package.json`** | F03 (Branding) | 42개+ 필드 | 🔴 **높음** | 브랜딩 스크립트로 자동화 |

### 단일 Feature 고위험 파일

| 파일 경로 | Feature | 변경 규모 | 위험 이유 |
|---|---|---|---|
| `src/extension.ts` | F08 | 중간 | 확장 진입점 - 초기화 순서 중요 |
| `webview-ui/src/context/ExtensionStateContext.tsx` | F01 | 작음 | 전역 상태 관리 - 많은 컴포넌트 의존 |

---

## 🔀 파일별 역 매핑 (File → Features)

### Backend Core Files

```
src/extension.ts
  └─ F08 (Persona) - CaretProviderWrapper 초기화

src/core/storage/disk.ts
  ├─ F03 (Branding) - 브랜딩 파일 경로
  └─ F08 (Persona) - 페르소나 파일 경로

src/core/storage/StateManager.ts
  └─ F09 (FeatureConfig) - 기본 provider 설정

src/core/controller/index.ts
  └─ F11 (InputHistory) - getStateToPostToWebview 수정

src/core/prompts/system-prompt/index.ts
  └─ F06 (JSON Prompt) - 모드 분기 진입점

src/core/api/transform/openrouter-stream.ts
  └─ F10 (ProviderSetup) - cache_control, reasoning

src/core/api/transform/vercel-ai-gateway-stream.ts
  └─ F10 (ProviderSetup) - Anthropic 캐싱

src/integrations/misc/extract-text.ts
  └─ F01 (CommonUtil) - lint만 (원본 복원 권장)

src/integrations/editor/detect-omission.ts
  └─ F01 (CommonUtil) - URL 변경 (F03 포함)
```

### Frontend Core Files

```
webview-ui/src/context/ExtensionStateContext.tsx
  └─ F01 (CommonUtil) - CaretiGlobalManager 통합

webview-ui/src/components/account/AccountView.tsx
  └─ F04 (CaretAccount) - 진입점 분기

webview-ui/src/components/settings/ApiOptions.tsx
  └─ F09 (FeatureConfig) - 프로바이더 필터링

webview-ui/src/components/chat/ChatRow.tsx
  ├─ F08 (Persona) - 페르소나 UI
  └─ F09 (FeatureConfig) - 비용 정보 제어

webview-ui/src/components/chat/task-header/TaskHeader.tsx
  └─ F09 (FeatureConfig) - 비용 정보 제어

webview-ui/src/components/chat/ChatTextArea.tsx
  └─ F11 (InputHistory) - 히스토리 훅
```

### Package & Config Files

```
package.json
  └─ F03 (Branding) - 42개+ 필드 (메타데이터, 명령어, walkthrough 등)
```

---

## 🎯 머지 순서 및 전략 (Merge Strategy)

### Phase 1: Proto & Backend Core (순서 중요)

**순서**: Proto → Storage → Controller → API

1. **Proto Files** (충돌 없음)
   ```bash
   # Careti proto 파일들은 proto/careti/에 독립
   git checkout HEAD -- proto/careti/
   ```

2. **F09 - FeatureConfig** 먼저 (다른 Feature 의존)
   - `careti-src/shared/FeatureConfig.ts` (독립)
   - `src/core/storage/StateManager.ts` (최소 침습)

3. **F03 - Branding** (disk.ts 포함)
   - `src/core/storage/disk.ts` 수정
   - `package.json` 브랜딩 (스크립트 자동화)

4. **F08 - Persona** (disk.ts 공유)
   - `src/extension.ts` (CaretProviderWrapper)
   - `disk.ts`는 F03 이후 추가 수정

5. **F06 - JSON Prompt**
   - `src/core/prompts/system-prompt/index.ts` (최소 분기)

6. **F11 - Input History**
   - `src/core/controller/index.ts` (getStateToPostToWebview)

7. **F10 - Provider Setup** (마지막)
   - API transform 파일들 (Cline 최신 우선 검토)

### Phase 2: Frontend Components

**순서**: Context → Components → UI

1. **F01 - Common Util**
   - `ExtensionStateContext.tsx` (CaretiGlobalManager)

2. **F04 - Careti Account**
   - `AccountView.tsx` (진입점 분기)

3. **F09 - FeatureConfig UI**
   - `ApiOptions.tsx`, `TaskHeader.tsx`, `ChatRow.tsx`

4. **F08, F11 Frontend**
   - ChatRow, ChatTextArea 등

5. **F02 - i18n** (전반적)
   - 다수 UI 컴포넌트 i18n 적용

### Phase 3: Assets & Docs (충돌 없음)

```bash
# Careti 전용 디렉토리들
git checkout HEAD -- careti-src/
git checkout HEAD -- careti-docs/
git checkout HEAD -- assets/
git checkout HEAD -- careti-scripts/
```

---

## ✅ 머징 체크리스트 (Merge Checklist)

### 🔍 Pre-Merge 검증

- [ ] F01-F11 Feature 문서 모두 재확인 완료
- [ ] 고위험 파일 (disk.ts, system-prompt/index.ts 등) 백업
- [ ] 현재 main 브랜치 백업 완료 (`backup/main-v0.2.4-20251009`)
- [ ] upstream/main 최신 상태 확인
- [ ] 컴파일 테스트 환경 준비

### 📦 Merge 순서별 체크

#### Phase 1: Proto & Backend

- [ ] Proto 파일 충돌 확인 (proto/careti/ 독립)
- [ ] F09 StateManager 수정 (FeatureConfig 통합)
- [ ] F03 disk.ts 수정 (브랜딩 경로)
- [ ] F08 disk.ts 추가 수정 (페르소나 경로)
- [ ] F03 package.json 브랜딩 (스크립트 실행)
- [ ] F06 system-prompt/index.ts 수정 (최소 분기)
- [ ] F11 controller/index.ts 수정 (inputHistory)
- [ ] F10 API transform 파일 검토

#### Phase 2: Frontend

- [ ] F01 ExtensionStateContext.tsx (CaretiGlobalManager)
- [ ] F04 AccountView.tsx (진입점)
- [ ] F09 UI 컴포넌트들 (ApiOptions, TaskHeader, ChatRow)
- [ ] F08, F11 UI 통합
- [ ] F02 i18n 적용 (다수 컴포넌트)

#### Phase 3: Assets & Docs

- [ ] careti-src/ 디렉토리 보존
- [ ] careti-docs/ 디렉토리 보존
- [ ] assets/ 디렉토리 보존
- [ ] careti-scripts/ 디렉토리 보존

### 🧪 Post-Merge 검증

- [ ] 컴파일 성공 (`npm run compile`)
- [ ] 타입 체크 통과 (`npm run check-types`)
- [ ] Backend 테스트 통과 (`npm run test:backend`)
- [ ] Frontend 테스트 통과 (`npm run test:webview`)
- [ ] E2E 테스트 통과 (`npm run test:e2e`)
- [ ] 브랜딩 정상 동작 (Careti 로고, 색상 등)
- [ ] 각 Feature 기능 수동 테스트

### 📝 문서화

- [ ] 머지 과정 로그 작성
- [ ] 충돌 해결 내역 기록
- [ ] Feature별 재구현 체크리스트 업데이트
- [ ] 최종 커밋 메시지 작성

---

## 🚨 주의사항 (Critical Warnings)

### ⚠️ 절대 하지 말아야 할 것 (DON'Ts)

1. **CARETI MODIFICATION 주석 삭제하지 말 것**
   - 모든 Cline 파일 수정에는 주석 필수
   - 추후 업스트림 머징 시 식별 핵심

2. **고위험 파일 동시 머지하지 말 것**
   - disk.ts: F03 → F08 순서 엄수
   - 각 단계마다 컴파일 테스트 필수

3. **Cline 원본 로직 변경하지 말 것**
   - 최소 침습 원칙: 진입점 분기만
   - Careti 로직은 careti-src/에서 독립 구현

4. **테스트 없이 다음 단계 진행하지 말 것**
   - 각 Feature 머지 후 컴파일 + 테스트
   - 누적 오류 방지

### ✅ 반드시 해야 할 것 (DOs)

1. **백업 먼저**
   - 매 단계마다 Git 브랜치 백업
   - 롤백 가능성 항상 열어두기

2. **단계별 검증**
   - Feature별 독립 머지 + 테스트
   - 통합 테스트는 Phase 완료 후

3. **문서화 철저히**
   - 머지 과정 로그 실시간 작성
   - 충돌 해결 방법 기록 (다음 업스트림 머지 참고)

4. **Adapter Pattern 유지**
   - Cline 완전 채택 + Careti 독립 구현
   - 래퍼/분기 패턴 일관성 유지

---

## 📚 참고 문서 (References)

### Feature 문서
- [F01 - Common Util](../features/f01-common-util.md)
- [F02 - Multilingual i18n](../features/f02-multilingual-i18n.md)
- [F03 - Branding UI](../features/f03-branding-ui.md)
- [F04 - Careti Account](../features/f04-careti-account.md)
- [F06 - Agent Standardization (AAIF SoT)](../features/f06-agent-standard-claude-compat.md)
- [F06 - JSON System Prompt](../features/f06-json-system-prompt.md)
- [F07 - Chatbot Agent Mode](../features/f07-chatbot-agent.md)
- [F08 - Persona System](../features/f08-persona-system.md)
- [F09 - Feature Config System](../features/f09-feature-config-system.md)
- [F10 - Enhanced Provider Setup](../features/f10-enhanced-provider-setup.md)
- [F11 - Input History System](../features/f11-input-history-system.md)

### 분석 문서
- [analysis-of-102-modifications.md](../../보고서(reports)/프로젝트 개선/Cline머징 전략/analysis-of-102-modifications.md) (⚠️ 오류 있음)
- [2025-10-09-merge-strategy-analysis.md](../../보고서(reports)/프로젝트 개선/Cline머징 전략/2025-10-09-merge-strategy-analysis.md)

### 작업 로그
- [2025-10-09-features-enhancement-master.md](../work-logs/luke/2025-10-09-features-enhancement-master.md)

---

## 🔄 문서 업데이트 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|---|---|---|---|
| 2025-10-09 | v1.0 | 초안 작성 - Feature별 침습 현황 통합 | Claude + Luke |

---

## 🎓 교훈 및 인사이트 (Lessons Learned)

### Phase 3 실패로부터의 교훈

1. **정확한 침습 현황 파악 필수**
   - Feature 문서 + 실제 소스 검증 병행
   - analysis-of-102만 믿지 말 것

2. **최소 침습 원칙 엄수**
   - 진입점 분기 / 래퍼 패턴 / 독립 모듈
   - Cline 원본 로직 미수정

3. **단계별 검증 및 롤백 준비**
   - Feature별 독립 머지 + 테스트
   - 백업 브랜치 항상 유지

4. **다중 Feature 수정 파일 주의**
   - disk.ts (F03 + F08)
   - 순서 중요, 통합 테스트 필수

### 성공 패턴

1. **F04 (Careti Account)** - 99% 독립 구현
   - 1개 파일만 수정 (진입점 분기)
   - gRPC 완전 활용

2. **F09 (Feature Config)** - 정적 설정 시스템
   - JSON import로 컴파일 타임 결정
   - UI 통합만 최소 침습

3. **F08 (Persona)** - 하이브리드 패턴
   - CaretProviderWrapper로 Cline 래핑
   - 독립 서비스로 페르소나 관리

---

**다음 단계**: main v0.2.4 백업 → 새 머징 브랜치 생성 → Features 순차 재구현

**🚀 Ready for Merge!**
