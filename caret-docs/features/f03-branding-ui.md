# F03 - Branding UI

**상태**: ✅ Phase 4 완료 (Backend)
**구현도**: 100% 완료
**우선순위**: MEDIUM - 브랜드 정체성

---

## 📋 개요

**목표**: Caret ↔ CodeCenter 동적 브랜드 전환 시스템

**핵심 기능**:
- 브랜드 자동 감지
- 로고/아이콘 동적 변경
- 브랜드별 설정 분리

---

## 🏗️ Backend 구현 (Phase 4)

### ✅ 핵심 파일 수정

**1. disk.ts** (+41 lines)
```
src/core/storage/disk.ts
- getBrand() 함수
- 브랜드별 파일 경로 헬퍼
- .caret/.codecenter 디렉토리 감지
```

**핵심 로직**:
```typescript
// CARET MODIFICATION: Brand detection
export function getBrand(cwd: string): "caret" | "codecenter" {
    const caretDir = path.join(cwd, ".caret")
    const codecenterDir = path.join(cwd, ".codecenter")

    if (fs.existsSync(caretDir)) return "caret"
    if (fs.existsSync(codecenterDir)) return "codecenter"
    return "caret" // 기본값
}
```

---

## 🎨 브랜드 전환

### 자동 감지

```
프로젝트 루트에 .caret 디렉토리 → Caret 브랜드
프로젝트 루트에 .codecenter 디렉토리 → CodeCenter 브랜드
둘 다 없음 → Caret 브랜드 (기본값)
```

### 브랜드별 설정

**Caret**:
- 로고: caret-logo.svg
- 설정 경로: `.caret/persona.json`
- 테마: Caret 색상

**CodeCenter**:
- 로고: codecenter-logo.svg
- 설정 경로: `.codecenter/persona.json`
- 테마: CodeCenter 색상

---

## 📝 Modified Files (Phase 4)

**Cline 핵심 파일**:
```
src/core/storage/disk.ts  (+41 lines)
```

**최소 침습**: 1개 파일, 41 lines 추가

---

## 💡 핵심 장점

**1. 자동 전환**
- 디렉토리 기반 감지
- 수동 설정 불필요

**2. 독립 운영**
- 브랜드별 설정 분리
- 충돌 방지

**3. 확장성**
- 새 브랜드 추가 용이
- 중앙 집중식 관리

---

**작성일**: 2025-10-10
**Phase**: Phase 4 완료
**Frontend**: Phase 5에서 UI 연동
