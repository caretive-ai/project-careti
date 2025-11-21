# Cline Frontend 변경 파일 유형 분류

**작성일**: 2025-10-12
**목적**: Phase 5 Frontend 머징을 위한 파일 유형 분류 및 처리 전략 수립

---

## 📋 Cline 변경 파일 목록 (11개)

### 원본 10개 (merge-execution-master-plan.md 기준)
1. ChatTextArea.tsx
2. RequestyModelPicker.tsx
3. BrowserSessionRow.tsx
4. AutoApproveModal.tsx
5. TaskTimeline.tsx
6. MarkdownBlock.tsx
7. ServerRow.tsx
8. DifyProvider.tsx
9. index.css
10. context-mentions.ts

### 추가 발견 (11번째)
11. **ClineRulesToggleModal.tsx** ← 유저 피드백으로 발견

---

## 🔍 파일 유형 분류 결과

### ⚠️ 공동 변경 파일 (11개 전체)
모든 파일이 caret-main과 cline-latest에서 **둘 다 수정**됨

| 파일명 | 경로 | Caret 수정 | Cline 수정 |
|--------|------|-----------|-----------|
| ChatTextArea.tsx | components/chat/ | F11 InputHistory | indexOf 최적화 |
| RequestyModelPicker.tsx | components/settings/ | F10 ProviderSetup | JSX Fragment |
| BrowserSessionRow.tsx | components/chat/ | ? | parseInt radix |
| AutoApproveModal.tsx | components/chat/auto-approve-menu/ | ? | parseInt radix |
| TaskTimeline.tsx | components/chat/task-header/ | ? | parseInt radix |
| MarkdownBlock.tsx | components/common/ | ? | 리팩토링 |
| ServerRow.tsx | components/mcp/.../server-row/ | ? | MCP |
| DifyProvider.tsx | components/settings/providers/ | ? | lint |
| index.css | (root) | Caret 브랜딩 | lint |
| context-mentions.ts | utils/ | ? | indexOf |
| **ClineRulesToggleModal.tsx** | components/cline-rules/ | **PersonaManagement** | ? |

---

## 🎯 처리 전략 (Phase 5 원칙)

### 기본 원칙
1. **Cline 최신 코드 기반으로 시작**
2. **Caret 기능 추가** (`// CARET MODIFICATION:` 주석)
3. **3대 원칙 준수**: 최소 침습 + i18n + 로깅

### 파일별 처리 계획

#### 1단계: Cline만 변경 파일 (6개)
Cline 개선사항만 있고 Caret 수정사항 없는 파일

- [ ] **AutoApproveModal.tsx**: Cline parseInt → 그대로 사용
- [ ] **TaskTimeline.tsx**: Cline parseInt → 그대로 사용
- [ ] **MarkdownBlock.tsx**: Cline 리팩토링 → 그대로 사용
- [ ] **ServerRow.tsx**: Cline MCP → 그대로 사용
- [ ] **DifyProvider.tsx**: Cline lint → 그대로 사용
- [ ] **context-mentions.ts**: Cline indexOf → 그대로 사용

**작업**:
- cline-latest에서 복사
- Caret 수정사항 없음 확인
- i18n 필요 시 추가

#### 2단계: 공동 변경 파일 (5개)
Caret 기능 + Cline 개선사항 병합 필요

- [ ] **ChatTextArea.tsx** (F11 InputHistory)
  - Cline: indexOf 최적화
  - Caret: useInputHistory 훅
  - 작업: Cline 기반 + Caret 훅 추가

- [ ] **RequestyModelPicker.tsx** (F10 ProviderSetup)
  - Cline: JSX Fragment 제거
  - Caret: Provider UI
  - 작업: Cline 기반 + Caret UI 추가

- [ ] **BrowserSessionRow.tsx**
  - Cline: parseInt radix
  - Caret: 확인 필요
  - 작업: 비교 후 결정

- [ ] **index.css**
  - Cline: lint 개선
  - Caret: 브랜딩 CSS
  - 작업: Cline 기반 + Caret CSS 추가

- [ ] **ClineRulesToggleModal.tsx**
  - Cline: 확인 필요
  - Caret: PersonaManagement 추가
  - 작업: ✅ 이미 수정 완료 (2025-10-12)

---

## 📝 현재 상태 (2025-10-12)

### 완료
- [x] **ClineRulesToggleModal.tsx**: PersonaManagement 추가 완료

### 누락 확인 필요
나머지 10개 파일의 Caret 수정사항 확인

**방법**:
1. caret-main과 현재 코드 비교
2. CARET MODIFICATION 주석 검색
3. 누락된 Caret 기능 찾기

---

## 🔄 다음 단계

1. **1단계 파일 처리** (6개):
   - cline-latest 복사
   - Caret 수정사항 없음 확인

2. **2단계 파일 병합** (4개 남음):
   - Cline + Caret 수동 병합
   - i18n 적용
   - 최소 침습 유지

3. **검증**:
   - TypeScript 컴파일
   - Extension 실행 테스트
   - 유저 피드백 재확인

---

**작성자 노트**:
Phase 5.0 전략이 "전체 복사"가 아니라 "파일별 병합"이어야 했음을 확인.
각 파일의 Caret 수정사항을 찾아서 Cline 최신 코드에 추가하는 작업 필요.
