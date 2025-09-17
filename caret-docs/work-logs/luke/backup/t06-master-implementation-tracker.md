# t06 하이브리드 시스템 구현 마스터 트래커 📋

> **최종 업데이트**: 2024년 12월 7일  
> **상태**: 구현 준비 완료  
> **예상 완료**: Phase 0 완료, Phase 1-5 진행 예정 (10-13일)

## 🎯 프로젝트 개요

### 최종 목표
`cline-latest`의 **컴포넌트 기반 아키텍처 + 작업 관리 루프**와 Caret의 **CHATBOT/AGENT 철학 + JSON 콘텐츠 관리**를 완벽 융합한 **궁극의 하이브리드 프롬프트 시스템** 구축

### 핵심 전략: "구조는 cline-latest, 영혼은 Caret"
- **기반**: `cline-latest` PromptRegistry + 컴포넌트 시스템
- **철학**: Caret CHATBOT/AGENT + JSON 관리 + 모드별 도구 제한
- **패턴**: 전략 패턴(`PromptSystemManager`) + 어댑터 패턴(`CaretJsonComponentProvider`)

## 📊 Critical Success Factors (최우선)

| 성과 지표 | 현재 상태 | 목표 | 비고 |
|----------|-----------|------|------|
| **Mission 1B-1 테스트 통과** ⭐ | ❌ 블로킹 | ✅ 통과 | Phase 1 최우선 |
| **전체 테스트 통과** (`npm run test:all`) | ❓ 미확인 | ✅ 100% | Phase 4 목표 |
| **토큰 효율성** | ✅ 14.1% 우위 | ✅ 유지+ | Alpha 검증 완료 |
| **Caret 사용자 경험** | ✅ 보존 | ✅ 100% | 기존 기능 유지 |

---

## 🗓️ Phase별 구현 진척 현황

### **Phase 0: 분석 및 설계 ✅ (완료)**
**기간**: 완료  
**상태**: ✅ 100% 완료

#### 완료된 작업
- [x] **cline-latest 시스템 완전 분석** (`t06-phase0-analysis-alpha.md`)
- [x] **Caret 기존 시스템 분석** (기존 문서)
- [x] **통합 전략 수립** (`t06-hybrid-system-design.md`)
- [x] **토큰 효율성 검증** (14.1% 우위 확인)
- [x] **구현 계획 수립** (3개 버전 완성)

#### 산출물
- `t06-phase0-analysis-alpha.md`: cline-latest 구조 분석
- `t06-phase0-analysis-claude.md`: 통합 전략 분석  
- `t06-hybrid-system-design.md`: 어댑터 패턴 설계
- `t06-hybrid-system-implement-plan-unified.md`: 통합 구현 계획
- `t06-master-implementation-tracker.md`: 본 마스터 트래커 ⭐

---

### **Phase 1: 핵심 인프라 + Mission 1B-1 해결 (2-3일)**
**목표**: 안정적 기준점 마련 + 블로킹 테스트 해결  
**상태**: ⏳ 대기

#### 🔥 Critical Task: Mission 1B-1 해결
**문제**: `@utils/shell` 경로 별칭 의존성으로 인한 테스트 블로킹  
**해결**: JSON 시스템으로 하드코딩 의존성 우회

#### Phase 1 상세 작업 체크리스트

##### 1.1 환경 구축 및 백업 (0.5일)
- [ ] **[백업]** `src/core/prompts` → `src/core/prompts_backup` 복사
- [ ] **[복사]** `cline-latest/src/core/prompts/` → `src/core/prompts/` 덮어쓰기
- [ ] **[검증]** `npm run compile` 성공 확인
- [ ] **[검증]** `npm run test:backend` 기본 동작 확인

##### 1.2 어댑터 뼈대 구현 (1일)
**디렉토리 생성**:
- [ ] `caret-src/core/prompts/` 디렉토리 생성
- [ ] `caret-src/core/prompts/__tests__/` 디렉토리 생성

**핵심 파일 생성**:
```typescript
// 1. PromptSystemManager.ts (전략 관리자)
- [ ] PromptSystemManager 클래스 뼈대
- [ ] switchMode('caret' | 'cline') 메서드
- [ ] workspaceState 연동 로직

// 2. CaretJsonComponentProvider.ts (어댑터)
- [ ] CaretJsonComponentProvider 클래스 뼈대  
- [ ] loadJsonSection(name) 메서드
- [ ] adaptToolDefinitions() 메서드 (Mission 1B-1용)
- [ ] registerCaretComponents() 메서드

// 3. 테스트 파일
- [ ] CaretJsonComponentProvider.test.ts 생성
- [ ] Mission 1B-1 해결 테스트 작성
```

**코드 구현 체크리스트**:
```typescript
// [RED] Mission 1B-1 해결 테스트
describe('Mission 1B-1 Resolution', () => {
    it('should resolve @utils/shell dependency via JSON adapter', () => {
        // 테스트 로직
    });
});

// [GREEN] 최소 어댑터 구현
class CaretJsonComponentProvider {
    private loadJsonSection(name: string): any { /* 구현 */ }
    private adaptToolDefinitions(): ComponentFunction { /* 구현 */ }
    public registerCaretComponents(): void { /* 구현 */ }
}

// [GREEN] 전략 관리자 구현  
class PromptSystemManager {
    switchMode(mode: 'caret' | 'cline'): void { /* 구현 */ }
}
```

##### 1.3 시스템 연동 (0.5일)
- [ ] **[수정]** `src/core/prompts/system-prompt/build-system-prompt.ts` 분기 로직 추가
- [ ] **[검증]** 모드 분기 동작 확인
- [ ] **[검증]** 기존 cline 기능 보존 확인

##### 1.4 Mission 1B-1 최종 검증 (1일)
- [ ] **[CRITICAL]** `Mission 1B-1` 테스트 실행 및 통과 확인 ⭐
- [ ] **[검증]** 다른 테스트에 영향 없음 확인
- [ ] **[문서화]** 해결 방안 기록

#### Phase 1 완료 기준 ✅
- [ ] **Mission 1B-1 테스트 통과** ⭐ (최우선)
- [ ] **어댑터 뼈대 완성** (최소 1개 컴포넌트)
- [ ] **시스템 분기 로직 정상 동작**
- [ ] **컴파일 안정성** (`npm run compile` 성공)

**리스크 체크**:
- [ ] Critical Risk 해결됨 (Mission 1B-1)
- [ ] 기존 기능 회귀 없음
- [ ] 성능 저하 없음

---

### **Phase 2: 핵심 컴포넌트 이식 + Caret 철학 통합 (3-4일)**
**목표**: Caret 핵심 철학 완전 반영 + 신규 작업 관리 루프 융합  
**상태**: ⏳ Phase 1 완료 후

#### Phase 2 상세 작업 체크리스트

##### 2.1 컴포넌트 우선순위 분류 (0.5일)
**High Priority (필수)**:
- [ ] `CHATBOT_AGENT_MODES.json` → `act_vs_plan_mode.ts` 교체
- [ ] `OBJECTIVE.json` → `agent_role.ts` 콘텐츠 주입  
- [ ] `TOOL_DEFINITIONS.json` → `tool_use_section.ts` 통합 + `mode_restriction`
- [ ] `SYSTEM_INFORMATION.json` → `system_info.ts` 교체

**Medium Priority (향상)**:
- [ ] `CAPABILITIES_SUMMARY.json` → `capabilities.ts`
- [ ] `COLLABORATIVE_PRINCIPLES.json` → 신규 컴포넌트
- [ ] `EDITING_FILES_GUIDE.json` → `tool_use_section.ts` 통합

##### 2.2 CHATBOT/AGENT 철학 핵심 이식 (1.5일)
```typescript
// [RED] Caret 철학 반영 테스트
describe('Chatbot/Agent Philosophy', () => {
    it('should show AGENT MODE for agent context', () => {
        // 테스트 로직
    });
    it('should apply mode_restriction for chatbot mode', () => {
        // 도구 제한 테스트
    });
});

// [GREEN] 핵심 어댑터 구현
- [ ] adaptChatbotAgentModes() 구현
- [ ] adaptToolDefinitions() mode_restriction 로직 구현
- [ ] adaptObjective() 구현
- [ ] adaptSystemInfo() 구현
```

**구현 체크리스트**:
- [ ] **AGENT MODE** 문구 정확히 표시
- [ ] **CHATBOT MODE** 문구 정확히 표시
- [ ] **도구 제한** (`mode_restriction`) 정상 동작
- [ ] **기존 cline 용어 완전 제거** (ACT/PLAN → CHATBOT/AGENT)

##### 2.3 신규 작업 관리 루프 Caret화 (1.5일)
**새로운 JSON 파일 생성**:
- [ ] `CARET_TODO_MANAGEMENT.json` 생성
- [ ] `CARET_PROGRESS_STYLES.json` 생성  
- [ ] `CARET_FEEDBACK_SYSTEM.json` 생성

**Caret 전용 관리자 구현**:
```typescript
// CaretTodoManager.ts
- [ ] generateModeSpecificTodo() 메서드
- [ ] applyCaretTodoStyling() 메서드
- [ ] 모드별 차별화 로직

// 어댑터 메서드 구현
- [ ] adaptAutoTodo() - TODO 관리 Caret 스타일
- [ ] adaptTaskProgress() - 진행상황 Caret 스타일  
- [ ] adaptFeedback() - 피드백 Caret 스타일
```

##### 2.4 통합 테스트 및 효율성 검증 (0.5일)
```bash
# 테스트 실행 체크리스트
- [ ] npm run test:backend -- --grep "system-prompt" 통과
- [ ] npm run test:backend -- --grep "ChatbotAgent" 통과
- [ ] node caret-scripts/utils/token-efficiency-analyzer.js 실행
- [ ] 토큰 효율성 14.1% 이상 유지 확인
```

#### Phase 2 완료 기준 ✅
- [ ] **High Priority 컴포넌트 100% 이식** (4개)
- [ ] **CHATBOT/AGENT 철학 완전 반영**
- [ ] **모드별 도구 제한 정상 동작**
- [ ] **신규 작업 관리 루프 Caret 버전 완성**
- [ ] **토큰 효율성 14.1% 이상 유지**

---

### **Phase 3: 프론트엔드 통합 + 모드 전환 시스템 (2-3일)**
**목표**: UI 모드 전환 + E2E 통합  
**상태**: ⏳ Phase 2 완료 후

#### Phase 3 상세 작업 체크리스트

##### 3.1 E2E 테스트 우선 설계 (1일)
```typescript
// [RED] E2E 테스트 파일 생성
// webview-ui/src/components/settings/providers/CaretProvider.test.tsx
describe('Prompt System Mode Switching E2E', () => {
    it('should switch Cline to Caret mode via UI', () => {
        // 1. 초기: Cline 모드, "ACT MODE" 포함
        // 2. UI 조작: Caret 모드로 전환  
        // 3. 백엔드: workspaceState 'caret'으로 변경
        // 4. 결과: "AGENT MODE" 포함, "ACT MODE" 제거
    });
    
    it('should preserve mode across extension reloads', () => {
        // 모드 설정 → 재시작 → 모드 유지
    });
});
```

**E2E 테스트 체크리스트**:
- [ ] 테스트 파일 생성 및 기본 구조 작성
- [ ] 초기 상태 검증 로직
- [ ] UI 조작 시뮬레이션 로직
- [ ] 백엔드 상태 변경 검증 로직
- [ ] 프롬프트 변경 검증 로직

##### 3.2 프론트엔드 UI 구현 (1일)
**UI 컴포넌트 구현**:
```typescript
// webview-ui/src/components/settings/providers/PromptSystemSelector.tsx
const PromptSystemSelector: React.FC = () => {
    // 구현 내용
};
```

**구현 체크리스트**:
- [ ] **컴포넌트 파일 생성** (`PromptSystemSelector.tsx`)
- [ ] **select/toggle UI 구현** (Caret ↔ Cline 선택)
- [ ] **상태 관리** (`useState` 훅 사용)
- [ ] **메시지 전송** (`vscode.postMessage` 호출)
- [ ] **설명 텍스트** (모드별 차이점 표시)

##### 3.3 백엔드 메시지 핸들링 (0.5일)
**컨트롤러 구현**:
```typescript
// caret-src/controllers/PromptSystemController.ts  
class PromptSystemController {
    async handleSetMode(message): Promise<void> {
        // workspaceState 업데이트
        // PromptSystemManager.switchMode() 호출
        // 프론트엔드 응답
    }
}
```

**백엔드 구현 체크리스트**:
- [ ] **컨트롤러 파일 생성** (`PromptSystemController.ts`)
- [ ] **메시지 핸들러** (`handleSetMode` 메서드)
- [ ] **상태 저장** (`workspaceState.update` 호출)
- [ ] **모드 전환** (`PromptSystemManager.switchMode` 호출)
- [ ] **응답 메시지** (프론트엔드로 완료 알림)

##### 3.4 시스템 연동 및 초기화 (0.5일)
```typescript
// extension.ts 수정
export function activate(context: vscode.ExtensionContext) {
    // 컨트롤러 등록
    // 메시지 핸들러 등록  
    // 저장된 모드로 초기화
}
```

**연동 체크리스트**:
- [ ] **확장 진입점 수정** (`extension.ts`)
- [ ] **컨트롤러 인스턴스 생성**
- [ ] **메시지 라우팅 추가**
- [ ] **초기화 로직** (저장된 모드 복원)

##### 3.5 E2E 테스트 및 검증 (0.5일)
```bash
# 테스트 실행 체크리스트
- [ ] npm run test:webview -- --grep "Prompt System" 통과
- [ ] npm run test:backend -- --grep "PromptSystemManager" 통과
- [ ] F5 수동 검증: UI 모드 전환 동작 확인
- [ ] 확장 재시작 후 모드 설정 유지 확인
```

#### Phase 3 완료 기준 ✅
- [ ] **프론트엔드 모드 전환 UI 완성**
- [ ] **백엔드 모드 관리 시스템 완성**
- [ ] **E2E 테스트 100% 통과**
- [ ] **모드 설정 영속성 보장**
- [ ] **사용자 시나리오 검증 완료**

---

### **Phase 4: 시스템 안정화 + 성능 최적화 (2일)**
**목표**: 전체 테스트 통과 + 성능 최적화  
**상태**: ⏳ Phase 3 완료 후

#### Phase 4 상세 작업 체크리스트

##### 4.1 전체 테스트 통과 작업 (1일)
**우선순위별 테스트 해결**:
```bash
# Critical Tests
- [ ] npm run compile (컴파일 오류 0개)
- [ ] Mission 1B-1 재검증 (Phase 1 해결 내용 확인)

# High Priority Tests  
- [ ] npm run test:backend (모든 어댑터/컴포넌트)
- [ ] npm run test:webview (UI 변경사항 영향도)

# Integration Tests
- [ ] npm run test:all (통합 안정성)
```

**오류 해결 우선순위**:
1. **컴파일 오류** → 즉시 수정 (진행 블로킹)
2. **테스트 실패** → 당일 해결 (기능 품질)
3. **경고 메시지** → 차순위 해결 (코드 품질)

##### 4.2 성능 최적화 (0.5일)
**최적화 대상 구현**:
```typescript
// JSON 로딩 캐싱
class CaretJsonComponentProvider {
    private static jsonCache = new Map<string, any>();
    private static isInitialized = false;
    
    // 캐싱 로직 구현
    // 중복 등록 방지 로직 구현
}
```

**최적화 체크리스트**:
- [ ] **JSON 파일 캐싱** 구현 (파일 I/O 최소화)
- [ ] **컴포넌트 등록 최적화** (중복 등록 방지)
- [ ] **메모리 사용량 최적화**
- [ ] **성능 측정 및 비교**

##### 4.3 토큰 효율성 재검증 (0.5일)
```bash
# 최종 효율성 검증
- [ ] node caret-scripts/utils/token-efficiency-analyzer.js 실행
- [ ] caret-system vs 문est 비교
- [ ] 14.1% 이상 효율성 확인
- [ ] 상세 보고서 생성 (t06-final-efficiency-report.json)
```

#### Phase 4 완료 기준 ✅
- [ ] **`npm run test:all` 100% 통과** ⭐
- [ ] **컴파일 오류 0개**
- [ ] **토큰 효율성 14.1% 이상 유지**
- [ ] **성능 최적화 완료**
- [ ] **코드 품질 검증** (`npm run lint` 통과)

---

### **Phase 5: 문서화 + 최종 검증 (1일)**
**목표**: 완료 문서화 + 품질 보증  
**상태**: ⏳ Phase 4 완료 후

#### Phase 5 상세 작업 체크리스트

##### 5.1 기술 문서 작성 (0.5일)
**필수 문서 작성**:
- [ ] `t06-implementation-guide.md`
  - [ ] 어댑터 패턴 구현 가이드
  - [ ] JSON → ComponentFunction 변환 방법
  - [ ] 프론트엔드 모드 전환 사용법
  
- [ ] `t06-user-migration-guide.md`
  - [ ] 기존 Caret 사용자 마이그레이션
  - [ ] 새로운 작업 관리 루프 활용
  - [ ] Chatbot/Agent 모드 최적 사용법

- [ ] `t06-performance-analysis.md`
  - [ ] 토큰 효율성 측정 결과 (14.1% 우위)
  - [ ] 성능 최적화 내용 상세
  - [ ] cline-latest 대비 벤치마크

##### 5.2 최종 인수 검증 (0.5일)
**Complete Acceptance Test**:
```bash
# 1. 시스템 안정성 검증
- [ ] ✅ npm run compile (컴파일 성공)
- [ ] ✅ npm run test:all (전체 테스트 통과)
- [ ] ✅ npm run lint (코드 품질 기준)
- [ ] ✅ npm run check-types (타입 안전성)

# 2. 핵심 기능 검증
- [ ] ✅ Mission 1B-1 테스트 통과
- [ ] ✅ Chatbot 모드 → 상담/분석 기능 정상
- [ ] ✅ Agent 모드 → 실행/협력 기능 정상
- [ ] ✅ UI 모드 전환 → 실시간 프롬프트 변경
- [ ] ✅ 작업 관리 루프 → TODO/진행상황/피드백

# 3. 사용자 경험 검증
- [ ] ✅ 기존 Caret 경험 100% 보존
- [ ] ✅ 새로운 cline-latest 기능 활용
- [ ] ✅ JSON 콘텐츠 수정 → 즉시 반영
- [ ] ✅ 토큰 효율성 우위 유지 (14.1%+)
```

##### 5.3 정리 및 완료 처리 (즉시)
- [ ] **백업 파일 삭제** (`src/core/prompts_backup`)
- [ ] **최종 코드 정리** (불필요한 주석 제거)
- [ ] **프로젝트 완료 보고서** 작성
- [ ] **마스터 트래커 최종 업데이트** ✅

#### Phase 5 완료 기준 ✅
- [ ] **기술 문서 3개 완료**
- [ ] **최종 인수 검증 100% 통과**
- [ ] **프로젝트 정리 완료**

---

## 📈 실시간 진척 관리

### 🔴 현재 블로커
- **Mission 1B-1 테스트 실패** (Phase 1에서 해결 예정)
- 기타: 없음

### ⚡ 오늘 진행 가능한 작업
1. **Phase 1.1 시작**: 환경 구축 및 백업 (0.5일)
2. **Phase 1.2 진행**: 어댑터 뼈대 구현 (1일)

### 📋 다음 주요 마일스톤
- **Phase 1 완료**: Mission 1B-1 해결 (2-3일 후)
- **Phase 2 완료**: Caret 철학 통합 (5-7일 후)
- **전체 완료**: 하이브리드 시스템 완성 (10-13일 후)

### 🎯 주간 목표 설정

#### 이번 주 목표 (Week 1)
- [ ] **Phase 1 완료**: Mission 1B-1 해결 + 어댑터 뼈대
- [ ] **Phase 2 시작**: CHATBOT/AGENT 철학 이식

#### 다음 주 목표 (Week 2)  
- [ ] **Phase 2-3 완료**: 핵심 컴포넌트 + UI 통합
- [ ] **Phase 4-5 진행**: 안정화 + 문서화

---

## ⚠️ 위험 요소 모니터링

### 🚨 Critical Risks
| 위험 | 현재 상태 | 모니터링 지표 | 대응 방안 |
|------|-----------|---------------|-----------|
| Mission 1B-1 블로킹 | ❌ 활성 | 테스트 통과율 | Phase 1에서 JSON 우회 |
| PromptRegistry 학습 | ⚠️ 주의 | 구현 진척도 | 충분한 분석 + TDD |

### ⚠️ Medium Risks
| 위험 | 현재 상태 | 모니터링 지표 | 대응 방안 |
|------|-----------|---------------|-----------|
| 어댑터 복잡성 | ✅ 관리됨 | 컴포넌트 완성도 | 단계별 TDD 구현 |
| 프론트엔드 통합 | ✅ 계획됨 | E2E 테스트 통과 | 테스트 우선 설계 |

---

## 📞 협업 및 검토 포인트

### 다른 AI와의 협업
- **Phase 1 완료 후**: 중간 진척 검토 요청
- **Phase 2 완료 후**: Caret 철학 반영 품질 검토  
- **Phase 4 완료 후**: 최종 품질 및 완성도 검증

### 일일 진척 보고 템플릿
```
📋 [날짜] t06 하이브리드 시스템 진척 보고

✅ 오늘 완료:
- [구체적 작업] (예: Phase 1.2 어댑터 뼈대 완성)

⚠️ 발견 이슈:
- [기술적 문제] (예: TypeScript 타입 오류)

📋 내일 계획:
- [다음 작업] (예: Phase 1.3 시스템 연동)

🚨 위험 요소:
- [블로커/의존성] (예: 없음 또는 특정 이슈)
```

---

## 🎯 최종 성공 기준 총괄

### Critical Success Factors (필수)
- [ ] **Mission 1B-1 테스트 통과** ⭐ (프로젝트 성패 결정)
- [ ] **전체 테스트 통과** (`npm run test:all` 100%)
- [ ] **토큰 효율성 유지** (14.1% 이상)
- [ ] **기존 Caret 사용자 경험 보존** (100%)

### Key Performance Indicators
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

## 📝 프로젝트 현황 요약

**현재 상태**: 구현 준비 완료, Phase 1 시작 대기  
**진척률**: Phase 0 (분석/설계) 100% 완료  
**다음 단계**: Phase 1 (인프라 + Mission 1B-1 해결)  
**예상 완료**: 10-13일 후 하이브리드 시스템 완성

**핵심 전략**: Alpha v2.0의 구체적 실행 단계 + Unified 계획의 체계적 위험 관리를 결합한 **실행 가능하고 안전한 로드맵**

---

> **💡 이 문서는 실시간 업데이트됩니다**  
> 각 Phase 진행 시 해당 체크리스트를 업데이트하여 정확한 진척 현황을 유지하세요.