# 최소 침습 머지 전략 계획서

**작성일**: 2025-10-06
**목표**: Cline 구조 변경 최대한 수용 + Caret 고유성 최소 침습 보존
**원칙**: "Cline이 제공하는 길을 따라가되, Caret의 정체성은 지킨다"

## 📊 Cline 아키텍처 변화 분석

### 주요 구조적 변화 (3.26.6 → 3.32.6)

#### 1. **확장프로그램 진입점 (`extension.ts`)**
```typescript
// Cline 3.32.6 새로운 구조
- workspaceResolver 도입 (멀티워크스페이스 지원)
- ExtensionRegistryInfo 중앙화
- commit-message-generator 구조 변경
- 새로운 imports: telemetryService, AuthService 구조 변경
```

#### 2. **WebviewProvider 구조 변화**
```typescript
// Cline 변경사항
- VscodeWebviewProvider: ExtensionRegistryInfo 기반 동적 ID
- WebviewProvider: 싱글톤 패턴 강화
- 통신 프로토콜: proto 기반 강화
```

#### 3. **Controller & StateManager**
```typescript
// 이미 성공적으로 통합된 부분
✅ StateManager: 싱글톤 패턴 채택 완료
✅ Controller: static create() 패턴 채택 완료
✅ Task: 아키텍처 업그레이드 + Persona 통합 완료
```

#### 4. **새로운 서비스들**
```typescript
- AuthService: OCA 통합 + 기존 인증 확장
- TelemetryService: PostHog → 새로운 구조
- WorkspaceResolver: 멀티워크스페이스 지원
- ExtensionRegistryInfo: 중앙화된 설정 관리
```

## 🎯 최소 침습 원칙 정의

### **Core Principle: "Follow Cline's Path"**
```
1. Cline의 아키텍처 변경 = 무조건 수용
2. Caret 고유 기능 = 최소 변경으로 재통합
3. 충돌 해결 = Cline 우선, Caret 적응
4. 새로운 기능 = Cline 기준 + Caret 확장
```

### **Caret 보존 우선순위**
```
Priority 1 (Must Keep):
- 브랜딩: "caret.*" 명명, 메타데이터
- Persona System: 완전한 사용자 경험
- i18n: 4개 언어 지원 시스템

Priority 2 (Adapt if Necessary):
- 프롬프트 시스템: Cline 구조에 맞춰 재설계
- 인증: Cline AuthService 기반 확장
- 설정: ExtensionRegistryInfo 기반 재구성

Priority 3 (Can Sacrifice):
- 구현 세부사항: Cline 방식 완전 채택
- 내부 구조: 아키텍처 일관성 우선
- 기술적 선택: Cline의 결정 따름
```

## 🛠 단계별 실행 계획

### **Phase 1: Foundation Reconstruction**
> 목표: Cline 기반 구조로 완전 재구축

#### **Step 1.1: extension.ts 재구축**
```
방식: Cline upstream 버전 채택 + Caret 기능 최소 통합
우선순위:
1. Cline 구조 100% 채택
2. Caret imports만 최소한 추가
3. 기능 통합은 후순위

예상 작업:
- git show upstream:src/extension.ts > new_extension.ts
- Caret 고유 imports 식별 및 최소 추가
- 브랜딩 관련 설정만 보존
```

#### **Step 1.2: shared/api.ts 재구축**
```
방식: Cline 타입 시스템 채택 + Caret 타입 확장
충돌 해결:
1. Cline의 새로운 타입 모두 수용
2. Caret 고유 타입은 extension으로 정의
3. 호환성 wrapper 제공
```

#### **Step 1.3: ExtensionMessage.ts 재구축**
```
방식: Cline proto 기반 통신 채택 + Caret 메시지 확장
전략:
1. Cline의 proto 기반 메시지 시스템 채택
2. Caret 고유 메시지는 proto 확장으로 정의
3. 기존 Caret 통신 로직은 adapter 패턴으로 감싸기
```

#### **Step 1.4: 컴파일 검증**
```
목표: npm run compile 성공
기준:
- TypeScript 오류 0개
- 기본 확장프로그램 로딩 성공
- VS Code에서 활성화 확인
```

### **Phase 2: Core Integration**
> 목표: Caret 핵심 기능의 최소 침습 재통합

#### **Step 2.1: Prompt System 재설계**
```
현재 문제:
- Caret PromptSystemManager vs Cline system-prompt 충돌
- 듀얼 모드 시스템 vs 단일 프롬프트 시스템

해결 방식:
1. Cline의 system-prompt 구조 완전 채택
2. Caret 모드는 prompt variant로 구현
3. PromptSystemManager → system-prompt adapter 패턴
```

#### **Step 2.2: Persona System 적응**
```
방식: Cline 구조에 맞춰 Persona 재설계
전략:
1. Persona 데이터: workspaceState 유지
2. Persona 로직: Controller/StateManager 통합
3. UI 통신: proto 메시지로 변환
```

#### **Step 2.3: Authentication 통합**
```
방식: Cline AuthService 확장
전략:
1. Cline AuthService 기반 클래스 유지
2. Caret 인증은 추가 provider로 구현
3. 기존 Caret 인증 로직은 호환성 레이어
```

### **Phase 3: Service Layer Alignment**
> 목표: 서비스 계층의 Cline 구조 정렬

#### **Step 3.1: Tool Handlers 일괄 정렬**
```
방식: 자동화된 패턴 적용
1. Cline upstream tool handler 구조 분석
2. 공통 패턴 추출
3. 스크립트로 일괄 적용
4. Caret 고유 tool 기능만 수동 추가
```

#### **Step 3.2: Service 통합**
```
우선순위:
1. TelemetryService: Cline 구조 채택
2. BrowserService: 기존 Caret 기능 유지하되 인터페이스 통합
3. FileService: Cline 방식 완전 채택
```

## 🔧 기술적 전략

### **1. 충돌 해결 자동화**
```bash
# 자동화 스크립트 개발
scripts/auto-merge-tool-handlers.sh
scripts/align-imports.sh
scripts/validate-compilation.sh
```

### **2. 호환성 레이어 설계**
```typescript
// 예시: Caret 기존 기능의 Cline 호환 wrapper
class CaretLegacyAdapter {
  static adaptPromptSystem(caretPrompt: CaretPrompt): ClinePrompt
  static adaptPersonaData(persona: Persona): ClineUserData
  static adaptAuthFlow(caretAuth: CaretAuth): ClineAuth
}
```

### **3. 점진적 검증 체계**
```
Level 1: npm run compile 성공
Level 2: Extension 로딩 성공
Level 3: 기본 채팅 기능 동작
Level 4: Caret 고유 기능 동작
Level 5: E2E 테스트 통과
```

## 📋 실행 체크리스트

### **Phase 1 체크리스트**
```
□ Cline upstream extension.ts 구조 분석 완료
□ Caret 필수 imports 목록 작성
□ extension.ts 재구축 및 컴파일 확인
□ shared/api.ts Cline 구조 채택
□ ExtensionMessage.ts proto 기반 재설계
□ Foundation level 컴파일 성공
```

### **Phase 2 체크리스트**
```
□ system-prompt Cline 구조 이해
□ Persona System Cline 통합 방식 설계
□ AuthService 확장 방식 설계
□ Core level 기능 테스트 통과
```

### **Phase 3 체크리스트**
```
□ Tool Handlers 자동화 스크립트 개발
□ Service Layer 통합 완료
□ E2E 테스트 통과
□ 성능 검증 완료
```

## 🎯 성공 기준

### **기술적 성공 지표**
```
1. npm run compile: 0 errors
2. npm run test:all: 100% pass
3. Extension loading: < 3초
4. 메모리 사용량: 기존 대비 +10% 이내
5. Caret 고유 기능: 100% 동작
```

### **사용자 경험 성공 지표**
```
1. 브랜딩: Caret 정체성 100% 유지
2. Persona: 기존 사용자 설정 100% 호환
3. i18n: 4개 언어 100% 지원
4. 모드 전환: Caret ↔ Cline 모드 완전 동작
5. 성능: 기존 대비 동등 이상
```

## 💡 Risk Mitigation

### **주요 리스크와 대응**
```
Risk 1: Cline 구조 변경이 Caret 핵심 기능과 양립 불가
→ 대응: 호환성 레이어 + adapter 패턴

Risk 2: 성능 저하
→ 대응: 점진적 최적화 + 성능 모니터링

Risk 3: 기존 사용자 데이터 호환성 문제
→ 대응: 마이그레이션 스크립트 + 점진적 업그레이드

Risk 4: 개발 복잡도 증가
→ 대응: 자동화 도구 + 명확한 가이드라인
```

---

## 🚀 Next Actions

**즉시 시작할 작업:**
1. Cline upstream extension.ts 상세 분석
2. Caret 필수 보존 요소 리스트 완성
3. Phase 1.1 실행: extension.ts 재구축

**이 계획의 철학:**
> "Cline의 길을 걷되, Caret의 영혼을 잃지 않는다"
>
> 기술적 우수성(Cline)과 제품 정체성(Caret)의 조화를 추구하며,
> 변화를 받아들이되 핵심 가치는 보존하는 지혜로운 통합을 지향한다.