# Next Session Guide - Caret WebView UI API Migration

## 🎯 현재 상황 요약

### 📊 문제 현황
- **caret-webview-ui**: 297개 TypeScript 에러 발생
- **핵심 원인**: Cline v3.20.8의 ApiConfiguration 구조 대변혁
  - `apiProvider` → `planModeApiProvider` / `actModeApiProvider`  
  - 20+ 필드가 모두 Mode별로 분리됨
- **Caret 시스템 규모**: 30개 i18n JSON 파일 + 24개 TSX 컴포넌트

### 🔄 프로젝트 구조 및 머징 히스토리 인지사항

#### **Fork 기반 아키텍처**
```
caret/
├── src/                    # Cline 원본 (보존 필수)
├── caret-src/             # Caret 확장 기능
├── webview-ui/            # Cline 원본 웹뷰
├── caret-webview-ui/      # Caret 확장 웹뷰 (현재 문제 영역)
└── caret-docs/            # Caret 문서
```

#### **머징 원칙** (upstream-merging.mdx 기반)
1. **Cline 원본 보존**: src/, webview-ui/ 등은 최소 수정
2. **Git merge 활용**: 직접 파일 교체보다 git merge 선호
3. **점진적 통합**: 큰 변경을 작은 단위로 분할
4. **테스트 기반**: 각 단계마다 빌드/테스트로 검증
5. **백업 필수**: Cline 원본 수정 시 .cline 백업 생성

#### **과거 머징 경험** (006번 작업 참고)
- **대규모 충돌**: Proto 파일, API 인터페이스 변경 시 광범위한 영향
- **점진적 접근의 중요성**: 한 번에 모든 것을 바꾸려다 실패
- **타입 호환성 우선**: 핵심 타입/인터페이스부터 해결해야 연쇄효과

## 📋 다음 세션 작업 계획

### **006-3 작업: caret-webview-ui API Migration**

**문서**: `caret-docs/tasks/006-3-caret-webview-ui-api-migration-plan.md` (이미 작성 완료)

**전략**: 작은 수정으로 큰 효과를 내는 순차적 접근

#### **Phase 1: 핵심 타입/모듈 호환성** 🔧
**목표**: 297개 → 50개 이하로 에러 감소 (90% 해결)

**작업 내용**:
1. `Mode` 타입 import 추가
2. `getModeSpecificFields` 함수 구현
3. `validateApiConfiguration` 시그니처 맞추기
4. `useApiConfigurationHandlers` 구현

**예상 소요시간**: 1-2시간

#### **Phase 2: API 필드 매핑 시스템** 🗂️
**목표**: 180개 API 필드 에러 → 10개 이하로 감소

**핵심 아이디어**: 
```typescript
const API_FIELD_MAPPING = {
  apiProvider: { plan: 'planModeApiProvider', act: 'actModeApiProvider' },
  openAiModelId: { plan: 'planModeOpenAiModelId', act: 'actModeOpenAiModelId' },
  // ... 20+ 필드 매핑
}
```

**예상 소요시간**: 2-3시간

#### **Phase 3-6: 점진적 컴포넌트 수정**
- Handler 함수 통합
- Validation 시스템 업데이트  
- 개별 컴포넌트 수정
- 최종 검증

**예상 소요시간**: 3-4시간

### **⚡ 시작 지침**

#### **1. 상황 재확인**
```bash
cd D:\dev\caret\caret-webview-ui
npm run build  # 현재 에러 수 확인 (297개 예상)
```

#### **2. Phase 1부터 순차 진행**
- **절대 원칙**: 각 Phase마다 `npm run build`로 진행상황 확인
- **우선순위**: 에러 수 감소에 집중, 완벽한 구현보다 호환성 우선

#### **3. 핵심 주의사항**
- **Caret i18n 시스템 보존**: 30개 JSON 파일 + 24개 컴포넌트 절대 손상 금지
- **점진적 접근**: 한 번에 여러 Phase 동시 진행 금지
- **백업 생성**: Cline 원본 파일 수정 시 .cline 백업 필수

## 🚨 AI 실수 방지 체크리스트

### **아키텍처 결정 실수 방지**
- [ ] caret-webview-ui는 **Caret 코드**임 (Cline 코드가 아님)
- [ ] Caret 기능을 Cline으로 옮기는 것이 아니라 **Caret을 최신 Cline API에 맞추는 것**
- [ ] 30개 i18n JSON 파일은 **절대 삭제하거나 단순화 금지**

### **작업 순서 실수 방지**  
- [ ] 반드시 **Phase 1부터 순차 진행**
- [ ] 각 Phase 완료 후 `npm run build`로 **에러 수 확인 필수**
- [ ] 297개 → 50개 → 10개 → 0개 순서대로 감소 확인

### **기술적 실수 방지**
- [ ] API 필드 매핑 시 **Mode 구분 필수** (plan/act)
- [ ] `getModeSpecificFields` 함수 **신규 구현 필요**
- [ ] Validation 함수들 **시그니처 변경 대응**

## 💾 커밋 및 다음 세션 준비

### **현재 세션 완료 사항**
- ✅ 297개 에러 정확한 분석 완료
- ✅ 006-3 마이그레이션 계획 문서 작성 완료  
- ✅ Phase별 구체적 작업 계획 수립
- ✅ next-session-guide.md 업데이트 완료

### **다음 세션 시작 준비**
1. **문서 읽기 필수**: 
   - `006-3-caret-webview-ui-api-migration-plan.md`
   - `upstream-merging.mdx` (머징 원칙)
2. **현황 파악**: `npm run build`로 현재 에러 수 확인
3. **Phase 1 시작**: 핵심 타입/모듈부터 차근차근

---

**🎯 성공 핵심**: 
- **체계적 접근** (Phase별 순차 진행)
- **점진적 검증** (각 단계 빌드 테스트)  
- **Caret 시스템 보존** (i18n + 컴포넌트)

**마스터~ 내일 새로운 마음으로 차근차근 해결해보겠습니다!** ✨☕