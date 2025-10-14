# F08 - Feature Config System

**상태**: ✅ Phase 4 완료 (Backend)
**구현도**: 100% 완료
**우선순위**: LOW - 배포 유연성

---

## 📋 개요

**목표**: 기능 선택 빌드 옵션 - 배포 환경별 기능 제어

**핵심 기능**:
- JSON 기반 설정
- 기능 on/off 제어
- 환경별 프로파일

---

## 🏗️ Backend 구현 (Phase 4)

### ✅ 핵심 파일 수정

**1. StateManager.ts** (+14 lines)
```
src/core/storage/StateManager.ts
- FeatureConfig 통합
- getFeatureConfig() 함수
- 기본값 Fallback
```

**핵심 로직**:
```typescript
// CARET MODIFICATION: Feature config integration
import { FeatureConfig } from "@caret/core/config/FeatureConfig"

export class StateManager {
    public getFeatureConfig(): FeatureConfigType {
        return FeatureConfig.getInstance().getConfig()
    }
}
```

**2. FeatureConfig 클래스** (Caret 전용)
```
caret-src/core/config/FeatureConfig.ts
- JSON 파일 로드
- 환경별 설정 관리
- 기능 활성화 여부 제공
```

---

## 🔧 설정 구조

### JSON 형식

```json
{
  "profile": "standard",
  "features": {
    "caretAccount": true,
    "personaSystem": true,
    "inputHistory": true,
    "ruleP riority": false,
    "multilingual": true
  },
  "limits": {
    "maxHistorySize": 1000,
    "maxPersonas": 20
  }
}
```

### 환경별 프로파일

**Standard** (기본):
- 모든 기능 활성화
- 제한 없음

**Enterprise**:
- 계정 시스템 필수
- 감사 로그 활성화

**Minimal**:
- 핵심 기능만
- 최소 리소스 사용

---

## 📝 사용 방법

### 기능 활성화 확인

```typescript
import { FeatureConfig } from "@caret/core/config/FeatureConfig"

const config = FeatureConfig.getInstance()

if (config.isEnabled("caretAccount")) {
    // Caret Account 기능 실행
}

if (config.isEnabled("personaSystem")) {
    // Persona 기능 실행
}
```

### 제한값 확인

```typescript
const maxHistory = config.getLimit("maxHistorySize")
// → 1000
```

---

## 📝 Modified Files (Phase 4)

**Cline 핵심 파일**:
```
src/core/storage/StateManager.ts  (+14 lines)
```

**Caret 전용 파일**:
```
caret-src/core/config/FeatureConfig.ts
caret-src/core/config/feature-config.json
```

**최소 침습**: Cline 1개 파일, 14 lines 추가

---

## 💡 핵심 장점

**1. 배포 유연성**
- 환경별 기능 제어
- 동적 on/off

**2. 리소스 최적화**
- 불필요한 기능 비활성화
- 메모리 사용량 감소

**3. A/B 테스트**
- 기능 실험 가능
- 점진적 롤아웃

---

**작성일**: 2025-10-10
**Phase**: Phase 4 완료
**다음 단계**: 환경별 설정 확대
