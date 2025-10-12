# F08 - Persona System

**상태**: ✅ Phase 4 완료 (Backend)
**구현도**: Backend 100%, Frontend Phase 5
**우선순위**: MEDIUM - 개인화

---

## 📋 개요

**목표**: AI 캐릭터 페르소나 선택 - 개인화된 AI 경험

**핵심 기능**:
- 사전 정의 페르소나 (11개)
- 커스텀 이미지 업로드
- 브랜드별 경로 분리

---

## 🏗️ Backend 구현 (Phase 4)

### ✅ 핵심 파일 수정

**1. disk.ts (브랜드 통합)**
```
src/core/storage/disk.ts
- getPersonaPath(brand): 브랜드별 경로
- persona.json 저장 위치 자동 결정
```

**브랜드별 경로**:
```typescript
// CARET MODIFICATION: Brand-aware persona path
Caret: `.caret/persona.json`
CodeCenter: `.codecenter/persona.json`
```

**2. gRPC 서비스**
```
proto/caret/persona.proto
- PersonaService (5개 RPC)
- GetPersona, SetPersona, ListPersonas
- UploadCustomImage, DeleteCustomImage
```

---

## 🎭 사전 정의 페르소나

### 11개 페르소나

```
1. Default (기본)
2. Professional (전문가)
3. Friendly (친근한)
4. Academic (학술적)
5. Creative (창의적)
6. Concise (간결한)
7. Detailed (상세한)
8. Beginner-Friendly (초보자 친화)
9. Expert (전문가용)
10. Fun (재미있는)
11. Custom (커스텀)
```

### 페르소나 구조

```json
{
  "id": "professional",
  "name": "Professional AI",
  "description": "Formal and precise responses",
  "imageUrl": "/assets/personas/professional.png",
  "systemPrompt": "You are a professional AI assistant..."
}
```

---

## 💾 저장 방식

### 파일 경로

```bash
# Caret 브랜드
.caret/persona.json
.caret/custom-images/user-avatar.png

# CodeCenter 브랜드
.codecenter/persona.json
.codecenter/custom-images/user-avatar.png
```

### 커스텀 이미지

```typescript
// 업로드
await PersonaServiceClient.uploadCustomImage({
    imageData: base64String
})

// 삭제
await PersonaServiceClient.deleteCustomImage({
    personaId: "custom"
})
```

---

## 📝 Modified Files (Phase 4)

**Backend만 수정**:
```
src/core/storage/disk.ts (브랜드 경로 추가)
proto/caret/persona.proto (gRPC 정의)
src/core/controller/persona/*.ts (5개 핸들러)
```

**Phase 5 예정** (Frontend):
```
webview-ui/src/components/persona/PersonaSelector.tsx
webview-ui/src/components/persona/CustomImageUploader.tsx
```

---

## 💡 핵심 장점

**1. 개인화**
- 다양한 AI 성격 선택
- 커스텀 이미지 지원

**2. 브랜드 분리**
- Caret/CodeCenter 독립 설정
- 충돌 방지

**3. 확장성**
- 새 페르소나 추가 용이
- gRPC 기반 타입 안전성

---

**작성일**: 2025-10-10
**Phase**: Phase 4 Backend 완료
**다음 단계**: Phase 5 UI 구현
