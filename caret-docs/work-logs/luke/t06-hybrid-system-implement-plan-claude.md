# t06 하이브리드 시스템 구현 계획 (Claude 검토)

## 📋 전체 프로젝트 개요

### 목표
`cline-latest`의 **구조적 발전**(작업 관리 루프)과 Caret의 **철학적 우위**(CHATBOT/AGENT 모드)를 융합한 **궁극의 하이브리드 프롬프트 시스템** 구축

### 핵심 통합 전략: "구조는 cline-latest, 영혼은 Caret"
- **기반 아키텍처**: `cline-latest`의 `PromptRegistry` + 컴포넌트 시스템 채택
- **핵심 가치**: Caret의 JSON 콘텐츠 관리 + CHATBOT/AGENT 철학 보존
- **연결 방식**: `CaretJsonComponentProvider` 어댑터 패턴 구현

## 🎯 주요 성과 목표

### 1. 기술적 성과
- [ ] **Mission 1B-1 테스트 통과** (현재 `@utils/shell` 경로 별칭 오류 해결)
- [ ] **토큰 효율성 14.1% 유지** (Alpha 검증된 JSON 시스템 우위)
- [ ] **전체 테스트 통과** (`npm run test:all` 성공)
- [ ] **컴파일 안정성** (`npm run compile` 무오류)

### 2. 기능적 성과
- [ ] **cline-latest 신규 3대 컴포넌트 완전 통합**
  - `auto_todo.ts`: 자동 TODO 관리
  - `task_progress.ts`: 실시간 진행상황 추적  
  - `feedback.ts`: 피드백 및 질문 응답 시스템
- [ ] **Caret 철학 완전 보존**
  - CHATBOT/AGENT 모드 시스템
  - JSON 기반 콘텐츠 관리
  - 모드별 도구 제한(`mode_restriction`)

### 3. 사용자 경험 성과
- [ ] **기존 Caret 사용자 경험 100% 유지**
- [ ] **새로운 작업 관리 루프의 사용자 이점 확보**
- [ ] **JSON 콘텐츠 수정 용이성 보존**

## 📊 위험 분석 및 대응 전략

### 🚨 Critical Risk (높음)
- **Mission 1B-1 테스트 블로킹**: 
  - **원인**: Cline 하드코딩 시스템의 경로 별칭 오류
  - **대응**: Phase 1에서 우선적으로 JSON 시스템 이식하여 의존성 제거

### ⚠️ Technical Risk (중간)
- **`PromptRegistry` 학습 곡선**: 
  - **대응**: Phase 0에서 충분한 분석과 프로토타입 개발
- **어댑터 구현 복잡성**: 
  - **대응**: 단계별 구현으로 위험 분산

### 💡 Philosophical Risk (낮음)  
- **용어 혼재 가능성**: 
  - **대응**: 명확한 매핑 테이블과 일관된 용어 사용

## 🗓️ 단계별 구현 계획 (총 5 Phases)

---

## **Phase 0: 기반 분석 및 설계 (완료)**

### ✅ 이미 완료된 작업
- **cline-latest 시스템 분석** (Alpha, Claude)
- **caret-main JSON 시스템 분석** (기존 문서)
- **통합 전략 수립** (하이브리드 시스템 설계)
- **토큰 효율성 검증** (14.1% 우위 확인)

### 📋 Phase 0 산출물
- `t06-phase0-analysis-alpha.md`: cline-latest 구조 분석
- `t06-phase0-analysis-claude.md`: 통합 전략 분석  
- `t06-hybrid-system-design.md`: 어댑터 패턴 설계
- `t06-hybrid-system-implement-plan-claude.md`: 본 구현 계획

---

## **Phase 1: 핵심 인프라 구축 (2-3일)**

### 목표: `cline-latest` 기반 구조 이해 및 어댑터 뼈대 구축

#### 1.1 `cline-latest` 시스템 심층 학습 (0.5일)
**작업 내용**:
```bash
# cline-latest 프롬프트 시스템 분석
- src/core/prompts/system-prompt/index.ts 진입점 분석
- registry/PromptRegistry.ts 등록 메커니즘 이해
- components/index.ts 컴포넌트 로딩 방식 파악
```

**검증 기준**:
- [ ] `PromptRegistry.registerComponent()` 메커니즘 완전 이해
- [ ] 기존 13개 컴포넌트 등록/호출 흐름 파악
- [ ] 신규 3대 컴포넌트(TODO, TASK_PROGRESS, FEEDBACK) 작동 방식 분석

#### 1.2 어댑터 클래스 뼈대 구현 (1일)
**작업 내용**:
```typescript
// caret-src/core/prompts/CaretJsonComponentProvider.ts
class CaretJsonComponentProvider {
    private registry = PromptRegistry.getInstance();
    
    // 1. 기본 JSON 로딩 메커니즘
    private loadJsonSection(sectionName: string): any
    
    // 2. 단일 어댑터 예시 구현 (SYSTEM_INFORMATION)
    private adaptSystemInfo(): ComponentFunction
    
    // 3. 레지스트리 등록 메서드
    public registerCaretComponents(): void
}
```

**검증 기준**:
- [ ] TypeScript 컴파일 오류 없음
- [ ] JSON 파일 로딩 정상 동작
- [ ] 최소 1개 컴포넌트 어댑터 작동 확인

#### 1.3 통합 테스트 환경 구축 (0.5일)
**작업 내용**:
```bash
# TDD 기반 테스트 환경
- caret-src/core/prompts/__tests__/CaretJsonComponentProvider.test.ts
- 통합 테스트: JSON → ComponentFunction 변환 검증
- 단위 테스트: 개별 어댑터 메서드 검증
```

**검증 기준**:
- [ ] `npm run test:backend` 통과 (기존 + 신규 테스트)
- [ ] 어댑터 기본 기능 TDD 검증 완료

#### 1.4 초기 시스템 연동 (1일)
**작업 내용**:
```typescript
// src/core/prompts/system-prompt/build-system-prompt.ts
// CARET MODIFICATION: 하이브리드 시스템 분기 로직 추가

export async function buildSystemPrompt(...args): Promise<string> {
    const modeSystem = HostProvider.caret?.getCurrentMode();
    
    if (modeSystem === "caret") {
        // Caret 하이브리드 시스템 사용
        const provider = new CaretJsonComponentProvider();
        provider.registerCaretComponents();
        return registry.buildPrompt(context);
    }
    
    // 기존 cline-latest 시스템 사용
    return buildOriginalSystemPrompt(...args);
}
```

**검증 기준**:
- [ ] `npm run compile` 오류 없음
- [ ] 모드 분기 로직 정상 동작
- [ ] 기존 cline 기능 보존 확인

**Phase 1 완료 기준**:
- [ ] **어댑터 뼈대 완성** (최소 1개 컴포넌트)
- [ ] **시스템 연동 완료** (분기 로직)
- [ ] **테스트 통과** (기존 + 신규)
- [ ] **컴파일 안정성** 확보

---

## **Phase 2: 핵심 컴포넌트 이식 (3-4일)**

### 목표: Caret의 핵심 JSON 섹션을 cline-latest 컴포넌트로 변환

#### 2.1 우선순위별 컴포넌트 분류 (0.5일)
**High Priority (필수 기능)**:
```
1. CHATBOT_AGENT_MODES.json → act_vs_plan_mode.ts 교체
2. OBJECTIVE.json → agent_role.ts 콘텐츠 주입
3. TOOL_DEFINITIONS.json → tool_use_section.ts 통합
4. SYSTEM_INFORMATION.json → system_info.ts 콘텐츠 교체
```

**Medium Priority (향상된 기능)**:
```
5. CAPABILITIES_SUMMARY.json → capabilities.ts
6. COLLABORATIVE_PRINCIPLES.json → 신규 컴포넌트
7. EDITING_FILES_GUIDE.json → tool_use_section.ts 통합
8. RESPONSES.json → 기존 컴포넌트 향상
```

**Low Priority (부가 기능)**:
```
9-18. 나머지 JSON 섹션들 (MCP 관련, 헤더 등)
```

#### 2.2 High Priority 컴포넌트 구현 (2일)
**작업 방식: TDD 기반 순차 개발**

**Day 1: CHATBOT_AGENT_MODES + OBJECTIVE**
```typescript
// 1. 테스트 작성 (RED)
describe('ChatbotAgentModes Adapter', () => {
    it('should replace act_vs_plan_mode with Caret philosophy', () => {
        // 기대: "AGENT MODE - 협력적 개발 파트너" 포함
    });
});

// 2. 구현 (GREEN)  
adaptChatbotAgentModes(): ComponentFunction {
    return async (variant, context) => {
        const json = this.loadJsonSection('CHATBOT_AGENT_MODES');
        const mode = context.mode; // "chatbot" | "agent"
        return json[mode]?.content || json.default?.content;
    };
}

// 3. 리팩터 (REFACTOR)
- 성능 최적화, 에러 핸들링 추가
```

**Day 2: TOOL_DEFINITIONS + SYSTEM_INFORMATION**
```typescript
// mode_restriction 로직 통합
adaptToolDefinitions(): ComponentFunction {
    return async (variant, context) => {
        const json = this.loadJsonSection('TOOL_DEFINITIONS');
        const currentMode = context.mode;
        
        return json.tools
            .filter(tool => !tool.mode_restriction || 
                          tool.mode_restriction === currentMode)
            .map(tool => `${tool.title}: ${tool.description}`)
            .join('\n');
    };
}
```

**검증 기준**:
- [ ] 각 어댑터별 단위 테스트 통과
- [ ] 통합 테스트에서 올바른 프롬프트 생성 확인
- [ ] Caret 철학(CHATBOT/AGENT) 정확히 반영

#### 2.3 Medium Priority 컴포넌트 구현 (1일)
**작업 내용**:
- 기존 cline-latest 컴포넌트에 JSON 콘텐츠 주입
- 새로운 Caret 전용 컴포넌트 생성 (COLLABORATIVE_PRINCIPLES 등)

#### 2.4 시스템 통합 테스트 (0.5일)
**작업 내용**:
```bash
# 전체 프롬프트 생성 테스트
npm run test:backend -- --grep "system-prompt"

# 토큰 효율성 재검증
node caret-scripts/utils/token-efficiency-analyzer.js
```

**Phase 2 완료 기준**:
- [ ] **High Priority 컴포넌트 100% 이식** (4개)
- [ ] **Caret 철학 완전 반영** (CHATBOT/AGENT 모드)
- [ ] **도구 제한 시스템 정상 동작** (`mode_restriction`)
- [ ] **토큰 효율성 유지** (14.1% 우위)

---

## **Phase 3: 신규 작업 관리 루프 통합 (2-3일)**

### 목표: `cline-latest`의 3대 신규 컴포넌트를 Caret 철학과 융합

#### 3.1 신규 컴포넌트 분석 및 설계 (1일)
**작업 내용**:
```typescript
// cline-latest 신규 컴포넌트 분석
1. auto_todo.ts 분석
   - PLAN → ACT 전환 시 TODO 생성 로직
   - 10번째 API 요청마다 TODO 검토
   
2. task_progress.ts 분석  
   - 모든 도구에 task_progress 파라미터 추가
   - 체크리스트 형태 진행상황 시각화
   
3. feedback.ts 분석
   - 사용자 피드백 대응 가이드라인
```

**Caret 융합 설계**:
```json
// CARET_TODO_MANAGEMENT.json (신규 생성)
{
  "chatbot_mode": {
    "content": "TODO 관리를 통한 체계적 상담 - 분석 결과를 체크리스트로 정리"
  },
  "agent_mode": {
    "content": "TODO 관리를 통한 협력적 개발 - 실행 계획을 체크리스트로 공유"
  }
}
```

#### 3.2 작업 관리 루프 Caret 버전 구현 (1.5일)
**Day 1: TODO 관리 시스템**
```typescript
// CaretTodoManager.ts (신규 생성)
class CaretTodoManager {
    // Caret 모드별 TODO 템플릿 제공
    generateModeSpecificTodo(mode: "chatbot" | "agent", context): string
    
    // JSON 기반 TODO 스타일 적용
    applyCaretTodoStyling(todos: string[]): string
}

// 기존 auto_todo.ts와 연동
adaptAutoTodo(): ComponentFunction {
    return async (variant, context) => {
        const manager = new CaretTodoManager();
        const baseTodo = await getOriginalTodoLogic(variant, context);
        return manager.applyCaretPhilosophy(baseTodo, context.mode);
    };
}
```

**Day 2: 진행상황 추적 + 피드백 시스템**
```typescript
// 진행상황 추적을 Caret 모드별로 차별화
adaptTaskProgress(): ComponentFunction {
    return async (variant, context) => {
        const json = this.loadJsonSection('CARET_PROGRESS_STYLES');
        const style = json[context.mode]; // chatbot vs agent
        return this.formatProgressWithCaretStyle(context, style);
    };
}
```

#### 3.3 통합 테스트 및 사용자 시나리오 검증 (0.5일)
**테스트 시나리오**:
```bash
# Chatbot 모드 시나리오
1. 사용자: "이 코드를 어떻게 개선할 수 있을까요?"
2. AI: TODO 리스트로 분석 항목 정리 → 상담 제공
3. 피드백: "더 구체적인 방법을 알고 싶어요"
4. AI: TODO 리스트 업데이트 → 상세 설명

# Agent 모드 시나리오  
1. 사용자: "이 버그를 고쳐주세요"
2. AI: TODO 리스트로 수정 계획 수립 → 직접 실행
3. 진행상황: 체크리스트로 실시간 업데이트
4. 완료: 최종 체크리스트 확인
```

**Phase 3 완료 기준**:
- [ ] **3대 신규 컴포넌트 완전 통합**
- [ ] **Caret 모드별 차별화 구현** (Chatbot vs Agent)
- [ ] **사용자 시나리오 검증 통과**
- [ ] **기존 cline-latest 기능 보존**

---

## **Phase 4: 시스템 안정화 및 최적화 (2일)**

### 목표: 전체 시스템 안정성 확보 및 성능 최적화

#### 4.1 전체 테스트 통과 (1일)
**우선순위별 테스트 해결**:
```bash
# 1. Critical: Mission 1B-1 테스트 
npm run test:all -- --grep "Mission 1B-1"
# 예상: JSON 시스템 이식으로 @utils/shell 오류 해결

# 2. 백엔드 안정성
npm run test:backend
# 모든 어댑터 및 컴포넌트 테스트

# 3. 프론트엔드 호환성
npm run test:webview  
# UI 변경 없음 확인

# 4. 통합 안정성
npm run compile && npm run test:all
```

**오류 해결 우선순위**:
1. **컴파일 오류**: TypeScript 타입, import 경로
2. **테스트 실패**: 어댑터 로직, JSON 로딩
3. **런타임 오류**: 모드 분기, 컴포넌트 등록

#### 4.2 성능 최적화 (0.5일)
**최적화 대상**:
```typescript
// 1. JSON 로딩 캐싱
class CaretJsonComponentProvider {
    private jsonCache = new Map<string, any>();
    
    private loadJsonSection(name: string): any {
        if (!this.jsonCache.has(name)) {
            this.jsonCache.set(name, this.loadFromFile(name));
        }
        return this.jsonCache.get(name);
    }
}

// 2. 컴포넌트 등록 최적화 (한 번만)
private static isRegistered = false;
public registerCaretComponents(): void {
    if (CaretJsonComponentProvider.isRegistered) return;
    // ... 등록 로직
    CaretJsonComponentProvider.isRegistered = true;
}
```

#### 4.3 토큰 효율성 재검증 (0.5일)
**검증 과정**:
```bash
# 1. 신규 하이브리드 시스템 토큰 측정
node caret-scripts/utils/token-efficiency-analyzer.js \
  --hybrid-system caret-src/core/prompts/

# 2. 기존 cline-latest 대비 효율성 비교
# 목표: 14.1% 효율성 유지 또는 향상

# 3. 신규 3대 컴포넌트 포함한 총 효율성 계산
```

**Phase 4 완료 기준**:
- [ ] **`npm run test:all` 100% 통과**
- [ ] **Mission 1B-1 테스트 해결**  
- [ ] **컴파일 오류 0개**
- [ ] **토큰 효율성 14.1% 이상 유지**
- [ ] **성능 최적화 완료** (캐싱, 등록)

---

## **Phase 5: 문서화 및 검증 (1일)**

### 목표: 구현 완료 문서화 및 최종 검증

#### 5.1 기술 문서 작성 (0.5일)
**문서 목록**:
```
1. t06-hybrid-system-implementation-guide.md
   - 어댑터 패턴 구현 상세 가이드
   - JSON → ComponentFunction 변환 방법
   - 신규 컴포넌트 사용법

2. t06-migration-guide.md  
   - 기존 Caret 사용자를 위한 마이그레이션 가이드
   - 새로운 작업 관리 루프 사용법
   - Chatbot/Agent 모드 활용법

3. t06-performance-report.md
   - 토큰 효율성 측정 결과
   - 성능 최적화 내용
   - 벤치마크 데이터
```

#### 5.2 최종 검증 및 품질 보증 (0.5일)
**검증 체크리스트**:
```bash
# 1. 전체 기능 검증
✅ npm run compile        # 컴파일 성공
✅ npm run test:all       # 모든 테스트 통과  
✅ npm run lint           # 코드 품질 검증
✅ npm run check-types    # 타입 안전성 확인

# 2. 사용자 시나리오 검증
✅ Chatbot 모드 → 상담 기능 정상
✅ Agent 모드 → 실행 기능 정상  
✅ 모드 전환 → UI/백엔드 동기화
✅ 작업 관리 루프 → TODO/진행상황/피드백 순환

# 3. 호환성 검증
✅ 기존 Caret 사용자 경험 보존
✅ cline-latest 새 기능 모두 동작
✅ JSON 콘텐츠 수정 → 즉시 반영
```

**Phase 5 완료 기준**:
- [ ] **기술 문서 완료** (3개)
- [ ] **최종 검증 체크리스트 100% 통과**
- [ ] **품질 보증 완료**

---

## 📈 진척 관리 및 위험 대응

### 일일 진척 체크포인트
**매일 오후 6시 체크**:
1. **완료된 작업**: 구체적인 산출물과 검증 결과
2. **발견된 이슈**: 기술적 문제, 설계 변경 사항  
3. **다음 작업**: 명일 우선순위와 예상 소요 시간
4. **위험 요소**: 블로커, 의존성 문제

### 위험 대응 프로토콜
**🚨 Critical Issue (프로젝트 중단 위험)**:
- **즉시 에스컬레이션**: 다른 AI와 협의
- **대안 전략 수립**: 롤백 플랜, 우회 방법
- **타임라인 재조정**: 우선순위 재설정

**⚠️ Medium Issue (지연 위험)**:
- **당일 해결 시도**: 최대 4시간 투입
- **차선책 적용**: 임시 해결책으로 진행 유지
- **다음 Phase에서 근본 해결**

### 품질 게이트 (Phase별 필수 통과 조건)
```
Phase 1 Gate: 어댑터 뼈대 + 컴파일 성공 + 기본 테스트 통과
Phase 2 Gate: 핵심 컴포넌트 이식 + Caret 철학 반영 + 토큰 효율성 유지  
Phase 3 Gate: 신규 컴포넌트 통합 + 사용자 시나리오 검증
Phase 4 Gate: 전체 테스트 통과 + Mission 1B-1 해결
Phase 5 Gate: 문서화 완료 + 최종 검증 통과
```

## 🎯 최종 성공 기준

### 기술적 성과
- [ ] **Mission 1B-1 테스트 통과** ⭐ (최우선)
- [ ] **전체 테스트 통과** (`npm run test:all`)
- [ ] **컴파일 안정성** (0 에러, 0 경고)
- [ ] **토큰 효율성** (14.1% 이상 유지)

### 기능적 성과  
- [ ] **cline-latest 3대 신규 기능 완전 통합**
- [ ] **Caret CHATBOT/AGENT 철학 완전 보존**
- [ ] **JSON 콘텐츠 관리 시스템 유지**
- [ ] **모드별 도구 제한 정상 동작**

### 사용자 경험 성과
- [ ] **기존 Caret 사용자 경험 100% 보존**
- [ ] **새로운 작업 관리 루프 이점 제공**  
- [ ] **Chatbot vs Agent 모드 차별화 명확**
- [ ] **한국어 i18n 지원 유지**

## ⏰ 예상 일정

| Phase | 소요 시간 | 주요 작업 | 완료 기준 |
|-------|-----------|-----------|-----------|
| **Phase 0** | ✅ 완료 | 분석 및 설계 | 문서 작성 완료 |
| **Phase 1** | 2-3일 | 인프라 구축 | 어댑터 뼈대 + 컴파일 성공 |
| **Phase 2** | 3-4일 | 핵심 컴포넌트 이식 | Caret 철학 반영 + 토큰 효율성 |
| **Phase 3** | 2-3일 | 신규 컴포넌트 통합 | 작업 관리 루프 + 시나리오 검증 |  
| **Phase 4** | 2일 | 안정화 및 최적화 | 전체 테스트 통과 |
| **Phase 5** | 1일 | 문서화 및 검증 | 최종 검증 완료 |
| **총계** | **10-13일** | | **하이브리드 시스템 완성** |

---

## 🤝 협업 및 검토 체계

### 다른 AI와의 협업 포인트
1. **설계 검토**: 본 구현 계획에 대한 다른 AI의 검토 의견 수렴
2. **중간 검토**: Phase 2 완료 후 진척 상황 점검
3. **최종 검토**: Phase 4 완료 후 품질 및 완성도 검증

### 검토 요청 사항
- [ ] **구현 순서의 적절성**: Phase별 의존성 및 위험 분산
- [ ] **기술적 접근법의 타당성**: 어댑터 패턴, 컴포넌트 매핑
- [ ] **누락된 고려사항**: 예상하지 못한 위험 요소나 필수 작업

---

## 📝 결론

본 계획은 **Alpha와 Claude의 Phase 0 분석**을 바탕으로 수립된 **체계적이고 실행 가능한 로드맵**입니다.

**핵심 전략**:
- **구조적 안정성**: `cline-latest`의 검증된 아키텍처 채택
- **철학적 우위**: Caret의 CHATBOT/AGENT 모드 시스템 보존  
- **점진적 통합**: 단계별 구현으로 위험 최소화
- **품질 우선**: 각 Phase별 엄격한 검증 기준

**예상 결과**: 두 시스템의 **장점만을 결합한 궁극의 하이브리드 시스템** 완성으로 **Mission 1B-1 블로킹 해결** 및 **전체적인 시스템 품질 향상** 달성.