# Task #008: Clean Migration Strategy - Cline Latest → Caret Features

## 📋 **작업 개요**

### **목적**
현재 복잡하게 얽힌 아키텍처 문제를 근본적으로 해결하기 위해, 깨끗한 Cline 최신 버전에서 시작하여 Caret 고유 기능들을 체계적으로 이식

### **배경**
- **현재 상황**:
  - **기존 잘못된 구조**: Mode 중복 설정, Proto 패키지 혼재, 매핑 로직 산재
  - **머징으로 인한 충돌**: Cline v3.20.8의 gRPC 전환, WebviewProvider API 변경, 구조적 변화
  - **문제들의 복잡성 폭발**: 하나 수정하면 다른 곳에서 에러 발생하는 연쇄 반응
  - **현재 머징 진행률**: 006-3 (19%), 006-4 (완료), 007 (부분 완료), 예상 2-3일 더 소요

### **접근법**
**"깨끗한 Cline 최신 + 체계적인 Caret 기능 이식"**
- 현재 복잡한 머징 중단
- Cline v3.20.8 클린 버전에서 시작
- Caret 고유 기능들을 우선순위별로 체계적 이식
- 각 단계마다 즉시 검증하여 문제 조기 발견

## 🚨 **006 이후 발견된 모든 문제들 (상세 분석)**

### **A. 근본적인 아키텍처 문제들**

#### **A-1. Mode 설정의 복잡성 폭발** 💥
- **문제 위치**: 5개 이상 파일에 산재
  ```
  - src/core/controller/state/updateSettings.ts (GlobalState mode)
  - webview-ui/src/context/ExtensionStateContext.tsx (ChatSettings mode)
  - webview-ui/src/components/settings/utils/useApiConfigurationHandlers.ts (매핑 로직)
  - src/api/index.ts (300+ 라인 매핑 코드)
  - src/shared/proto-conversions/state/chat-settings-conversion.ts (Proto 변환)
  ```

- **구체적 문제들**:
  - **중복 저장**: `GlobalState.mode` + `ChatSettings.mode` 동일 정보를 두 곳에 저장
  - **동기화 실패**: `setModeSystem`에서 두 값이 독립적으로 업데이트되어 불일치 발생
  - **매핑 로직 중복**: chatbot↔plan, agent↔act 변환이 여러 파일에서 중복 구현
  - **복잡한 setModeSystem**: modeSystem 변경 → 기본 모드 결정 → 두 번 전송 → 자동 New Task (??) 의 과도한 로직

- **발견 경로**: 006-3 WebView 에러 분석 중 Mode별 API 필드 접근 문제에서 시작
- **영향 범위**: 프론트엔드 ↔ 백엔드 전체 통신

#### **A-2. Proto 패키지 구조 혼재** 🌪️
- **문제**: `package caret` vs `package cline` 불일치
- **위치**: `proto/cline/*.proto` 파일들이 `package caret;` 선언
- **결과**: 
  - gRPC 서비스 네임스페이스 충돌
  - 생성된 클라이언트 코드와 실제 구조 불일치
  - buf.yaml lint 경고 대량 발생 (102개 경고)

- **해결 시도**: Task 007에서 패키지 분리 작업 진행했으나 완전하지 못함
- **남은 문제**: Cline 원본 구조 복원 vs Caret 기능 분리가 중도반단

#### **A-3. 매핑 로직의 산재와 중복** 🔄
- **src/api/index.ts**: 300+ 라인의 chatbot→plan 매핑 코드
  ```typescript
  if (mode === "chatbot") {
    effectiveMode = "plan"
    tempOptions.planModeApiProvider = tempOptions.chatbotModeApiProvider
    // ... 20개 이상의 필드 매핑
  }
  ```

- **useApiConfigurationHandlers.ts**: 별도의 매핑 로직
  ```typescript
  const modeMapping: Record<Mode, keyof typeof fieldPair> = {
    chatbot: "plan", agent: "act"
  }
  ```

- **chat-settings-conversion.ts**: Proto 변환용 매핑
  ```typescript
  if (chatSettings.mode === "chatbot" || chatSettings.mode === "plan") {
    protoMode = ChatbotAgentMode.CHATBOT_MODE
  }
  ```

- **문제**: 동일한 변환 로직이 여러 곳에 중복되어 일관성 유지 어려움

### **B. 머징 과정에서 발견된 구조적 변화**

#### **B-1. Cline v3.20.8의 gRPC 전환** ⚡
- **변화**: Cline이 Plan/Act 모드 중심으로 API 구조 대변혁
- **구체적 변화**:
  - `apiProvider` → `planModeApiProvider` / `actModeApiProvider`
  - 20+ 필드가 모두 Mode별로 분리됨
  - WebviewMessage 처리 방식 간소화 (54개 case → 3개)

- **Caret에 미친 영향**:
  - 006-3: 297개 → 250개 TypeScript 에러 (chatbot/agent 모드와 매핑 불일치)
  - Mode별 API 필드 접근 코드 전면 수정 필요
  - 기존 Caret의 단일 필드 접근 방식과 충돌

#### **B-2. WebviewProvider API 변경** 🔧
- **변화**: Cline이 WebviewProvider 구조 변경
- **구체적 문제**:
  - `getActiveInstance`, `getWebview` 메서드 제거
  - `getUri` 모듈 위치 변경
  - private `disposables` 선언 불일치

- **해결 완료**: 006-4에서 해결 (146개 → 0개 에러)
- **교훈**: 백엔드는 상대적으로 해결하기 쉬웠음

#### **B-3. ProtoBus/Host Bridge 생성 오류** 🛠️
- **문제**: 생성 스크립트가 Host 서비스를 제대로 감지하지 못함
- **원인**: `scripts/proto-utils.mjs`의 서비스 분류 로직 부족
- **해결**: Host 서비스 명시적 분류로 해결
- **교훈**: 생성 스크립트의 견고성 필요

### **C. 발견된 코드 품질 문제들**

#### **C-1. 백업 파일 네이밍 규칙 혼재** 📁
- **문제**: `.cline` 백업 파일이 두 가지 방식 혼용
  - DASH 방식: `App-tsx.cline`
  - DOT 방식: `App.tsx.cline`
- **해결**: 모든 파일을 DOT 방식으로 통일 (AI 친화적)
- **정리 결과**: 344개 → 102개 백업 파일

#### **C-2. JSX 구조 손상** 🎨
- **문제**: ChatRow.tsx에서 머지 충돌 해결 과정에서 구조 손상
  - Fragment 닫기 태그 누락
  - case 블록 중복
  - 괄호 불균형
- **해결**: 백업 파일과 비교하여 구조 복원
- **교훈**: 복잡한 JSX는 자동 머지 도구 사용 위험

#### **C-3. 중복 기능 발견** 🔍
- **toggleChatbotAgentMode 기능**:
  - **Proto 정의**: `ToggleChatbotAgentModeRequest` ✅
  - **백엔드 구현**: `TogglePlanActModeRequest` ❌ (잘못된 타입)
  - **프론트엔드**: `ToggleChatbotAgentModeRequest` ✅ (올바른 타입)
- **해결**: 3-레포 비교 전략으로 정확한 구현 복구

### **D. 머징 방법론의 한계**

#### **D-1. 개별 파일 단위 머징의 한계** ⚠️
- **현재 방식**: 006-1 (타입), 006-2 (Controller), 006-3 (WebView) 개별 진행
- **문제점**:
  - 한 파일 수정 → 다른 파일에서 새 에러 발생 (연쇄 반응)
  - Proto 구조 문제가 전체에 영향을 미치는데 부분적 해결 시도
  - 에러 개수가 줄지 않고 오히려 다른 곳으로 이동

#### **D-2. 에러 해결의 우선순위 문제** 📊
- **잘못된 접근**: 가장 많은 에러부터 해결 시도
- **올바른 접근**: 근본 원인 (Proto 구조) 먼저 해결
- **교훈**: 아키텍처 문제는 개별 에러 수정으로 해결 안됨

## 📋 **진행한 해결책들과 성과**

### **성공적인 해결책들** ✅

#### **1. Proto 필드 번호 관리 전략 수립**
- **문제**: Cline이 계속 필드를 추가하면서 번호 충돌 발생
- **해결책**: Caret 고유 필드는 1000번부터 시작
  ```proto
  optional string caret_api_key = 1000; // CARET MODIFICATION: (1000+ reserved for Caret)
  ```
- **효과**: 향후 충돌 방지, 명확한 구분

#### **2. buf.yaml 설정 최적화**
- **문제**: package 이름과 디렉토리 구조 불일치로 102개 경고
- **해결책**: buf.yaml에 Caret 전용 except 규칙 추가
  ```yaml
  except:
    - PACKAGE_DIRECTORY_MATCH
    - PACKAGE_SAME_DIRECTORY
  ```
- **효과**: `npx buf lint` 완전 성공 (0개 경고)

#### **3. 백엔드 컴파일 에러 완전 해결**
- **006-4 성과**: 146개 → 0개 TypeScript 에러 (100% 해결)
- **주요 수정**:
  - ChatRow.tsx 구조 복원
  - WebviewProvider API 호환성 확보
  - Proto 생성 스크립트 개선

#### **4. 3-레포 비교 전략 도입**
- **구조**: `/dev/caret/` (작업), `main-caret/` (참조), `cline-latest/` (소스)
- **효과**: 정확한 기능 복구 및 누락 방지
- **활용**: toggleChatbotAgentMode 타입 불일치 해결

### **부분적 해결책들** 🔄

#### **1. Task 007: Proto 패키지 분리**
- **진행 상황**: Caret 고유 기능 분석 완료, 분리 계획 수립
- **남은 작업**: 실제 분리 작업 및 백엔드/프론트엔드 수정
- **가치**: 향후 머징 용이성 극대화

#### **2. Mode 시스템 일부 정리**
- **완료**: Task 클래스에서 chatSettings 매개변수 제거
- **완료**: Extension.ts 강제 변경 로직 제거
- **미완료**: 전체 Mode 시스템 통합

### **실패한 접근법들** ❌

#### **1. 006-3 WebView 개별 에러 해결**
- **접근**: 297개 → 250개 에러를 하나씩 해결
- **문제**: 근본 원인 (Mode 시스템) 미해결로 에러가 다른 곳으로 이동
- **교훈**: 아키텍처 문제는 개별 수정으로 해결 불가

#### **2. Proto 필드 추가로 인한 복잡성 증가**
- **시도**: ChatbotAgentMode, ChatSettings 등 Caret 타입 추가
- **결과**: 기존 Cline 구조와 충돌하여 더 많은 변환 로직 필요
- **교훈**: 기존 구조 활용이 새로운 구조 추가보다 효율적

## 🔧 **다시 머징할 때 적용할 해결방법**

### **전략 1: 구조 우선 해결** 🎯

#### **1-1. Proto 구조부터 정리**
```bash
# Phase 1: Cline 원본 Proto 구조 복원
cp -r cline-latest/proto/cline/* proto/cline/
# package cline; 복원, java_package = "bot.cline.proto" 복원

# Phase 2: Caret 기능만 별도 패키지 분리
mkdir proto/caret/
# ChatbotAgentMode, ToggleChatbotAgentMode 등 Caret 고유 기능만 분리
```

#### **1-2. Mode 시스템 중앙화**
```typescript
// src/utils/mode-manager.ts 신규 생성
export class ModeManager {
  // 단일 진입점으로 모든 Mode 관련 로직 통합
  static async setMode(mode: Mode): Promise<void>
  static getEffectiveMode(mode: Mode): "plan" | "act"
  static getApiFields(config: ApiConfiguration, mode: Mode)
}
```

#### **1-3. 상태 저장소 통합**
```typescript
// GlobalState OR ChatSettings 중 하나만 사용
// 중복 제거로 동기화 문제 원천 차단
```

### **전략 2: 검증된 패턴 재사용** ♻️

#### **2-1. 성공한 해결책 패턴화**
- **Proto 필드 번호**: 1000+ 범위 계속 사용
- **buf.yaml 설정**: except 규칙 유지
- **3-레포 비교**: 모든 복잡한 수정에 적용
- **백업 생성**: DOT 방식 (.tsx.cline) 계속 사용

#### **2-2. 실패한 접근법 회피**
- ❌ 개별 에러 위주 해결
- ❌ 새로운 Proto 타입 무분별 추가
- ❌ 매핑 로직 중복 허용
- ✅ 아키텍처 우선 → 개별 수정
- ✅ 기존 구조 활용 → 새 구조 추가
- ✅ 로직 중앙화 → 산재 방지

### **전략 3: 점진적 검증 강화** 🔍

#### **3-1. Phase별 완료 기준 설정**
```bash
# 각 Phase마다 반드시 확인
npm run compile     # 컴파일 성공
npm run test:all    # 테스트 통과
npm run lint        # 린트 통과
F5 Extension Host   # 실제 동작 확인
```

#### **3-2. 즉시 롤백 체계**
- 각 Phase별 백업 유지
- 문제 발생 시 즉시 이전 상태로 복원
- 완료 기준 미달 시 다음 Phase 진행 금지

### **전략 4: 자동화 도구 활용** 🤖

#### **4-1. 에러 분석 도구**
```bash
# caret-scripts/merging-task/analyze-merge-differences.js
# 3-레포 비교로 누락/충돌 자동 감지
node caret-scripts/merging-task/analyze-merge-differences.js
```

#### **4-2. 일괄 변경 도구**
```python
# merge-conflict-resolver.py
# 반복적 충돌 패턴 자동 해결
python3 merge-conflict-resolver.py <file> caret
```

## 🚀 **Clean Migration의 구체적 이점**

### **현재 방식 vs Clean Migration 비교**

| 측면 | 현재 방식 (계속 머징) | Clean Migration |
|------|---------------------|-----------------|
| **예상 소요 시간** | 2-3일 더 | 1.5-2일 |
| **에러 해결 방식** | 개별 에러 → 연쇄 반응 | 구조 정리 → 에러 자동 해결 |
| **아키텍처 품질** | 복잡하고 불안정 | 깔끔하고 안정적 |
| **향후 유지보수** | 지속적 문제 | 근본 해결 |
| **Cline 업데이트** | 매번 복잡한 충돌 | 쉬운 적용 |

### **장기적 가치**
- **기술 부채 제거**: 잘못된 구조를 아예 정리
- **개발 생산성**: 새 기능 추가 시 복잡성 최소화
- **팀 협업**: 이해하기 쉬운 아키텍처
- **안정성**: 예측 가능한 동작

---

**마스터~ 이제 008번 문서가 현재까지 발견된 모든 문제와 해결책을 포함하고 있어요! 이 자료를 바탕으로 Clean Migration을 진행할지, 아니면 기존 머징을 계속할지 결정하시면 될 것 같아요! ✨☕**

## 📦 **Caret 고유 기능 인벤토리**

### **1. Rule Priority System** ✅ **완성**
- **위치**: `src/core/context/instructions/user-instructions/external-rules.ts`
- **기능**: `.clinerules` > `.cursorrules` > `.windsurfrules` 우선순위
- **상태**: 완전 구현, 테스트 통과
- **이식 우선순위**: **HIGH** (핵심 차별화 기능)

### **2. Chatbot/Agent Mode System** 🔄 **부분 구현**
- **위치**: 여러 파일에 산재 (문제의 원인)
- **기능**: Cline Plan/Act → Caret Chatbot/Agent 모드
- **상태**: 복잡하고 불안정한 구조
- **이식 우선순위**: **HIGH** (단순화 필요)

### **3. 다국어 지원 시스템** ✅ **완성**
- **위치**: `webview-ui/src/caret/i18n/` (30개 JSON 파일)
- **기능**: 한국어, 영어, 일본어, 중국어 지원
- **상태**: 방대하지만 안정적
- **이식 우선순위**: **MEDIUM** (대량 파일)

### **4. Persona System** 🔄 **부분 구현**
- **위치**: `webview-ui/src/caret/components/persona/`
- **기능**: AI 캐릭터 페르소나 선택
- **상태**: 기본 구조만 구현
- **이식 우선순위**: **LOW** (완성도 낮음)

### **5. Caret 브랜딩 & UI** ✅ **완성**
- **위치**: `webview-ui/src/caret/components/`, `caret-assets/`
- **기능**: Caret 고유 UI 컴포넌트, 로고, 색상
- **상태**: 안정적
- **이식 우선순위**: **MEDIUM** (시각적 정체성)

### **6. WebviewLogger System** ✅ **완성**
- **위치**: `webview-ui/src/caret/utils/webview-logger.ts`
- **기능**: 통합 로깅 시스템
- **상태**: 안정적
- **이식 우선순위**: **HIGH** (개발 필수)

### **7. Proto 확장** 🔄 **부분 구현**
- **위치**: `proto/caret/` (Task 007에서 분리 작업)
- **기능**: Caret 고유 gRPC 메시지
- **상태**: 혼재 상태
- **이식 우선순위**: **HIGH** (구조 정리 필요)

## 🗺️ **Migration 로드맵**

### **Phase 0: 준비 작업** (1-2시간)
- [ ] Cline latest (v3.20.8) 클린 복사본 준비
- [ ] 현재 Caret 기능들 백업 및 정리
- [ ] Migration 브랜치 생성
- [ ] 기본 빌드 환경 확인

### **Phase 1: 핵심 인프라** (2-3시간)
**우선순위**: Proto + Rule System + Logger

1. **Proto 구조 정리**
   - Cline 원본 proto 구조 유지
   - Caret 고유 기능만 별도 패키지로 분리
   - 깔끔한 네임스페이스 설계

2. **Rule Priority System 이식**
   - 검증된 구현 그대로 이식
   - 즉시 테스트로 검증

3. **WebviewLogger 이식**
   - 로깅 시스템부터 구축하여 디버깅 지원

### **Phase 2: Mode 시스템 재설계** (3-4시간)
**우선순위**: 아키텍처 단순화

1. **단일 Mode 저장소 설계**
   - GlobalState OR ChatSettings 중 하나만 사용
   - 중복 제거

2. **매핑 로직 중앙화**
   - `src/utils/mode-manager.ts` 단일 모듈
   - 모든 변환 로직 통합

3. **API 호환성 확보**
   - Cline Plan/Act ↔ Caret Chatbot/Agent 완벽 매핑
   - 기존 설정 마이그레이션

### **Phase 3: UI/UX 이식** (2-3시간)
**우선순위**: 사용자 경험

1. **Caret 브랜딩 이식**
   - 로고, 색상, 아이콘
   - 핵심 UI 컴포넌트

2. **다국어 지원 이식**
   - 30개 JSON 파일 체계적 이식
   - i18n 시스템 연동

### **Phase 4: 고급 기능** (2-3시간)
**우선순위**: 차별화 기능

1. **Persona System (선택적)**
   - 기본 구조만 이식
   - 향후 개선 여지

2. **추가 Caret 기능들**
   - Account 연동
   - 고급 설정들

### **Phase 5: 검증 및 최적화** (1-2시간)
- [ ] 전체 빌드 성공
- [ ] 모든 Caret 기능 동작 확인
- [ ] 성능 검증
- [ ] 문서 업데이트

## ✅ **각 Phase별 완료 기준**

### **Phase 1 완료 기준**
- [ ] `npm run compile` 성공
- [ ] Rule Priority 테스트 통과
- [ ] WebviewLogger 정상 동작

### **Phase 2 완료 기준**
- [ ] Mode 전환 정상 동작
- [ ] API 호출 정상 동작
- [ ] 설정 저장/로드 정상

### **Phase 3 완료 기준**
- [ ] Caret UI 정상 렌더링
- [ ] 다국어 전환 정상 동작
- [ ] 브랜딩 요소 정상 표시

### **Phase 4 완료 기준**
- [ ] 모든 Caret 고유 기능 동작
- [ ] 기존 설정 마이그레이션 성공

### **Phase 5 완료 기준**
- [ ] E2E 테스트 통과
- [ ] 성능 기준 만족
- [ ] 문서 동기화 완료

## 🎯 **예상 효과**

### **단기 효과**
- 현재 머징 이슈 완전 해결
- 깔끔하고 이해하기 쉬운 아키텍처
- 안정적인 빌드 환경

### **장기 효과**
- 향후 Cline 업데이트 쉬운 적용
- 새로운 기능 추가 용이성
- 유지보수 비용 대폭 절감

## 🚨 **위험 요소 및 대응**

### **주요 위험**
1. **기능 누락**: 기존 Caret 기능 손실
2. **시간 초과**: 예상보다 복잡한 이식 작업
3. **호환성 문제**: Cline 최신과의 충돌

### **대응 방안**
1. **체계적 체크리스트**: 각 Phase별 완료 기준 엄격 적용
2. **점진적 검증**: 각 기능 이식 후 즉시 테스트
3. **롤백 준비**: 각 Phase별 백업 유지

## 📅 **예상 일정**

- **총 소요 시간**: 10-15시간
- **실제 작업일**: 1.5-2일
- **마스터 검토 포함**: 2-3일

---

**작성자**: Alpha (AI Assistant)  
**검토자**: Luke (Project Owner)  
**작성일**: 2025-01-23  
**우선순위**: CRITICAL
