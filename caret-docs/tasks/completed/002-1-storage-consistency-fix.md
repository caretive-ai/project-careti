# Task #002-1: 저장소 불일치 해결

**작업 기간**: 1일 (2-4시간)  
**담당자**: luke  
**우선순위**: 🚨 **긴급 (Critical)**  
**예상 시간**: 3시간

## 🎯 작업 개요

### 목표
- chatSettings 저장/로드 시 발생하는 저장소 불일치 문제를 해결하여 설정 저장 기능을 복원한다

### 배경
- Phase 3 완료 후 설정 저장 시스템 장애 발견
- UI 언어 설정 및 기존 선호 언어 설정 모두 저장되지 않는 심각한 문제
- 근본 원인: 저장은 `globalState`에, 로드는 `workspaceState`에서 수행하는 불일치

### 범위
- ✅ **포함**: chatSettings 저장소 불일치 해결, 관련 테스트 작성, 검증 완료
- ❌ **제외**: UI 반응성 개선, 새로운 기능 추가

### 주요 산출물
- 저장소 일관성 확보 (globalState 또는 workspaceState 통일)
- 저장/로드 플로우 검증 테스트
- 설정 저장 기능 복원 확인

## 📚 작업 전 숙지사항 (AI 필수)
- `caret-docs/tasks/002-language-settings-restoration.md`: 마스터 작업 전체 맥락
- `caret-docs/development/caret-architecture-and-implementation-guide.mdx`: Cline 원본 파일 수정 원칙
- `caret-docs/development/testing-guide.mdx`: TDD 방법론 및 통합 테스트 요구사항
- `caret-docs/work-logs/luke/2025-06-22.md`: 근본 원인 분석 결과

## ✅ 실행 체크리스트

### Phase 1: 문제 재현 및 분석
- [ ] **1.1 현재 상태 확인**: Extension Development Host에서 설정 저장 실패 재현
- [ ] **1.2 코드 분석**: Controller.ts, updateSettings.ts, state.ts의 저장소 사용 패턴 확인
- [ ] **1.3 저장소 타입 결정**: globalState vs workspaceState 중 적절한 선택

### Phase 2: TDD 기반 수정
- [ ] **2.1 테스트 작성**: 저장/로드 일관성 검증 테스트 (RED)
- [ ] **2.2 최소 구현**: 저장소 불일치 해결 (GREEN)
- [ ] **2.3 리팩토링**: 코드 품질 개선 (REFACTOR)

### Phase 3: 검증 및 완료
- [ ] **3.1 통합 테스트**: Extension Host 환경에서 실제 저장/로드 검증
- [ ] **3.2 회귀 테스트**: 기존 기능 영향도 확인
- [ ] **3.3 문서 업데이트**: 수정 내용 및 결정 사항 기록

## 🔧 기술적 제약사항
- Cline 원본 파일 수정 시 반드시 백업 생성 (.cline 확장자)
- CARET MODIFICATION 주석 필수 추가
- 최소 수정 원칙 (1-3라인 이내 권장)
- 기존 기능에 영향 없도록 수정

## 📝 진행 노트 (실시간 업데이트)
### 근본 원인 (2025-06-22 분석 완료)
```typescript
// 문제가 되는 코드들:
// Controller.ts (445줄): workspaceState 저장
await updateWorkspaceState(this.context, "chatSettings", chatSettings)

// updateSettings.ts (57줄): globalState 저장  
await controller.context.globalState.update("chatSettings", chatSettings)

// state.ts (360줄): workspaceState에서 로드
getWorkspaceState(context, "chatSettings")
```

### 결정 사항
- [ ] 저장소 타입 통일 방향 결정 (globalState 또는 workspaceState)
- [ ] 수정 대상 파일 및 백업 계획 수립

## ✅ 완료 기준
- [ ] 모든 체크리스트 항목 완료
- [ ] 저장/로드 테스트 통과 (단위 + 통합)
- [ ] Extension Host에서 설정 저장 정상 동작 확인
- [ ] 기존 설정값 손실 없음 확인
- [ ] 백업 파일 생성 및 CARET MODIFICATION 주석 추가 완료 