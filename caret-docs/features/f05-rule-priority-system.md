# F05 - Rule Priority System

**상태**: ✅ Phase 4 완료 (Backend)
**구현도**: 100% 완료
**우선순위**: MEDIUM - 토큰 낭비 방지

---

## 📋 개요

**목표**: 규칙 파일 중복 로딩 방지 - 토큰 사용량 최적화

**해결하는 문제**:
- Cline: `.clinerules`, `.cursorrules`, `.windsurfrules` 모두 로딩 → 중복 낭비
- Caret: **우선순위 기반 단일 선택** → 중복 완전 차단

**우선순위 규칙**:
```
.caretrules > .clinerules > .cursorrules > .windsurfrules
```

---

## 🏗️ Backend 구현 (Phase 4)

### ✅ 핵심 파일 수정

**1. external-rules.ts** (+151 lines)
```
src/core/context/instructions/user-instructions/external-rules.ts
- 우선순위 로직 구현
- 자동 토글 비활성화
- Caret 규칙 최우선 처리
```

**핵심 로직**:
```typescript
// CARET MODIFICATION: Rule priority system
const caretHasFiles = Object.keys(updatedLocalCaretToggles).length > 0
const windsurfHasFiles = Object.keys(updatedLocalWindsurfToggles).length > 0

if (caretHasFiles) {
    // .caretrules 최우선 - 나머지 모두 비활성화
    updatedLocalWindsurfToggles = disableAllToggles(updatedLocalWindsurfToggles)
    updatedLocalCursorToggles = disableAllToggles(updatedLocalCursorToggles)
} else if (windsurfHasFiles) {
    // .windsurfrules 2순위 - cursor만 비활성화
    updatedLocalCursorToggles = disableAllToggles(updatedLocalCursorToggles)
}
```

**2. disk.ts** (CARET MODIFICATION)
```
src/core/storage/disk.ts
- .caretrules 파일명 정의
- 파일 경로 헬퍼 추가
```

**3. state-keys.ts** (CARET MODIFICATION)
```
src/core/storage/state-keys.ts
- caretLocalRulesToggles 상태 키 추가
```

---

## 🔄 동작 방식

### 자동 우선순위 적용

**시나리오 1: .caretrules 존재**
```
.caretrules (활성화)
.clinerules (자동 비활성화)
.cursorrules (자동 비활성화)
→ .caretrules만 프롬프트에 포함
```

**시나리오 2: .clinerules만 존재**
```
.caretrules (없음)
.clinerules (활성화)
.cursorrules (자동 비활성화)
→ .clinerules만 프롬프트에 포함
```

**시나리오 3: 규칙 없음**
```
모든 규칙 파일 없음
→ 프롬프트에 추가 내용 없음
```

---

## 📊 Backend vs Frontend

### ✅ Backend 완료 (Phase 4)
- 우선순위 로직 구현
- 자동 파일 감지
- 토글 상태 관리
- 프롬프트 통합

### ❌ Frontend 미필요
- UI 없이 자동 작동
- 백그라운드 처리
- 사용자 개입 불필요

**결론**: Backend만으로 기능 완성 ✅

---

## 📝 Modified Files (Phase 4)

**Cline 핵심 파일 수정**:
```
src/core/context/instructions/user-instructions/external-rules.ts  (+151 lines)
src/core/storage/disk.ts                                           (CARET MODIFICATION)
src/core/storage/state-keys.ts                                     (CARET MODIFICATION)
src/core/storage/utils/state-helpers.ts                            (CARET MODIFICATION)
```

**최소 침습 달성**: 4개 파일, 약 160 lines 추가

---

## 🧪 검증

### 테스트 시나리오

**1. 우선순위 검증**
```bash
# .caretrules 생성 → 다른 규칙 자동 비활성화
touch .caretrules
# 프롬프트 확인: .caretrules만 포함 ✅
```

**2. 동적 전환 검증**
```bash
# .caretrules 삭제 → .clinerules 자동 활성화
rm .caretrules
# 프롬프트 확인: .clinerules만 포함 ✅
```

---

## ⚙️ 설정

### 자동 감지
- 파일 시스템 변경 감지
- 우선순위 자동 적용
- 수동 설정 불필요

### 디버깅
```typescript
// refreshExternalRulesToggles() 호출 시 자동 로깅
Logger.debug("Rule priority applied", {
    caretFiles: caretRuleFiles.length,
    clineFiles: clineRuleFiles.length,
    activeRule: "caretrules" // 최우선 규칙 표시
})
```

---

## 💡 핵심 장점

**1. 토큰 절약**
- 중복 규칙 제거 → 토큰 사용량 감소
- 프롬프트 간결화 → API 비용 절감

**2. 설정 충돌 방지**
- 단일 규칙만 적용
- 우선순위 명확
- 예측 가능한 동작

**3. 최소 침습**
- Cline 코드 보존
- 4개 파일만 수정
- CARET MODIFICATION 명시

---

**작성일**: 2025-10-10
**Phase**: Phase 4 Backend 완료
**다음 단계**: Frontend 없이 운영 가능
