# F09 - Enhanced Provider Setup

**상태**: ✅ Phase 4 완료 (Backend)
**구현도**: Backend 100%, Frontend Phase 5
**우선순위**: MEDIUM - 사용성 개선

---

## 📋 개요

**목표**: LiteLLM 모델 자동 조회 - 프로바이더 설정 단순화

**핵심 기능**:
- LiteLLM API 연동
- 모델 목록 자동 조회
- 지원 모델 필터링

---

## 🏗️ Backend 구현 (Phase 4)

### ✅ 핵심 파일 구현

**1. gRPC 서비스**
```
proto/caret/system.proto
- FetchLiteLlmModels RPC
- LiteLLM API 호출 정의
```

**2. Backend 핸들러**
```
src/core/controller/system/FetchLiteLlmModels.ts
- LiteLLM API 호출
- 모델 데이터 파싱
- 에러 처리
```

**핵심 로직**:
```typescript
export async function FetchLiteLlmModels(
    controller: Controller,
    request: proto.caret.FetchLiteLlmModelsRequest
): Promise<proto.caret.FetchLiteLlmModelsResponse> {
    const apiUrl = "https://api.litellm.ai/v1/models"

    const response = await fetch(apiUrl)
    const data = await response.json()

    return {
        models: data.models.map(m => ({
            id: m.id,
            provider: m.provider,
            displayName: m.display_name
        }))
    }
}
```

---

## 🔧 LiteLLM 통합

### API 엔드포인트

```
GET https://api.litellm.ai/v1/models
→ 지원되는 모든 AI 모델 목록
```

### 응답 형식

```json
{
  "models": [
    {
      "id": "gpt-4",
      "provider": "openai",
      "display_name": "GPT-4"
    },
    {
      "id": "claude-3-opus",
      "provider": "anthropic",
      "display_name": "Claude 3 Opus"
    }
  ]
}
```

---

## 📊 지원 프로바이더

### 자동 조회 가능

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Cohere
- AI21 Labs
- Hugging Face
- + 100개 이상

---

## 📝 Modified Files (Phase 4)

**Backend 구현**:
```
proto/caret/system.proto (gRPC 정의)
src/core/controller/system/FetchLiteLlmModels.ts (핸들러)
```

**Phase 5 예정** (Frontend):
```
webview-ui/src/components/provider/ModelSelector.tsx
webview-ui/src/components/provider/ProviderWizard.tsx
```

---

## 💡 핵심 장점

**1. 사용성**
- 자동 모델 조회
- 수동 입력 불필요

**2. 최신성**
- LiteLLM API로 실시간 업데이트
- 새 모델 자동 반영

**3. 정확성**
- API 기반 검증
- 지원 모델만 표시

---

## 🧪 검증

### Backend 테스트

```bash
# gRPC 호출 테스트
grpcurl -d '{}' localhost:50051 caret.CaretSystemService/FetchLiteLlmModels

# 응답 확인
{
  "models": [
    {"id": "gpt-4", "provider": "openai", "displayName": "GPT-4"},
    ...
  ]
}
```

---

**작성일**: 2025-10-10
**Phase**: Phase 4 Backend 완료
**다음 단계**: Phase 5 UI 구현
