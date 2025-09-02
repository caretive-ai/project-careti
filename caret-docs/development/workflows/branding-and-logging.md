Caret의 브랜딩 및 로깅 시스템의 현재 상태를 문서화하고 있습니다.

<detailed_sequence_of_steps>
# 브랜딩 및 로깅 시스템 - 현재 구현 상태

## 브랜딩 원칙 (구현됨)

### 사용자 대면 요소 → "Caret"
- **UI 텍스트**: 모든 보이는 텍스트가 "Cline" 대신 "Caret"을 표시
- **파일명**: 확장 파일이 Caret 명명 규칙 사용
- **사용자 인터페이스**: 설정, 메뉴, 대화 상자가 Caret 브랜딩 표시
- **확장 표시명**: VSCode 마켓플레이스에서 "Caret" 표시

### 내부 구현 → "cline" 유지
- **명령 ID**: VSCode 명령 식별자는 `cline.*`으로 유지
- **컨텍스트 변수**: 내부 VSCode 컨텍스트 변수는 `cline` 사용
- **함수명**: 핵심 함수명은 Cline 호환성 유지
- **API 엔드포인트**: 내부 API 호출은 Cline 구조 보존

### 구현 패턴
```typescript
// ✅ 올바름: 사용자 대면 표시
displayName: "Caret Assistant"
title: "Caret - AI Coding Assistant"

// ✅ 올바름: 내부 구현
commandId: "cline.openChat"
contextKey: "cline.isActive"
functionName: "clineProvider.handleMessage"
```

## 로깅 시스템 아키텍처 (현재 상태)

### 백엔드 로깅 → 통합된 Cline 시스템
- **상태**: ✅ **Cline Logger와 통합됨**
- **구현**: 모든 백엔드 로깅이 기존 Cline 로깅 인프라 사용
- **위치**: `@/services/logging/Logger`의 Cline `Logger` 클래스 사용
- **패턴**:
  ```typescript
  import { Logger } from "@/services/logging/Logger"
  Logger.debug("Caret 기능 메시지")
  Logger.info("백엔드 작업 완료")
  ```

### 프론트엔드 로깅 → CaretWebviewLogger
- **상태**: ✅ **별도의 CaretWebviewLogger 구현됨**
- **목적**: 웹뷰 컴포넌트를 위한 프론트엔드 전용 로깅
- **개발 모드**: 개발 빌드에서 콘솔 로깅 활성화
- **프로덕션 모드**: 콘솔 오염을 피하기 위한 최소한의 로깅

```typescript
// 프론트엔드 로깅 패턴
if (process.env.NODE_ENV === "development") {
  console.log(`[CARET UI] 컴포넌트 렌더됨: ${componentName}`)
}

// CaretWebviewLogger 사용
import { CaretWebviewLogger } from "@/caret/utils/CaretWebviewLogger"
CaretWebviewLogger.debug("사용자 상호작용", { action: "click", component: "persona-selector" })
```

## 파일 구조

### 백엔드 통합
```
src/services/logging/
├── Logger.ts                    # Cline의 메인 로거 (Caret 백엔드에서 사용)
└── (Caret은 기존 인프라 사용)

caret-src/
├── utils/                       # Caret 전용 유틸리티
└── (Cline 기능 확장)
```

### 프론트엔드 분리
```
webview-ui/src/caret/
├── utils/
│   └── CaretWebviewLogger.ts    # Caret 전용 프론트엔드 로깅
├── components/                   # 로깅이 있는 Caret UI 컴포넌트
└── hooks/                       # Caret 전용 React 훅
```

## 로깅 가이드라인

### 백엔드 (Cline Logger 사용)
```typescript
// ✅ 올바름: 통합된 백엔드 로깅
import { Logger } from "@/services/logging/Logger"

Logger.debug("Caret 기능 초기화됨")
Logger.info("사용자가 페르소나 선택: creative")
Logger.error("Caret API 호출 실패", { error: errorDetails })
```

### 프론트엔드 (CaretWebviewLogger 사용)
```typescript
// ✅ 올바름: Caret 전용 프론트엔드 로깅
import { CaretWebviewLogger } from "@/caret/utils/CaretWebviewLogger"

// 개발 전용
if (process.env.NODE_ENV === "development") {
  CaretWebviewLogger.debug("컴포넌트 상태 업데이트됨", { newState })
}

// 프로덕션 안전 로깅
CaretWebviewLogger.info("사용자 작업 완료", { action: "persona-change" })
```

## 금지된 관행

### ❌ 하지 말 것:
```typescript
// ❌ 별도의 백엔드 로거 생성하지 마세요
import { CaretLogger } from "@/services/logging/CaretLogger" // 존재하지 않음

// ❌ 프론트엔드에서 Cline Logger 사용하지 마세요
import { Logger } from "@/services/logging/Logger" // 잘못된 컨텍스트

// ❌ 프로덕션 프론트엔드에 console.log 남기지 마세요
console.log("디버그 정보") // 사용자의 DevTools에 나타남
```

## 통합의 이점

### 통합된 백엔드 로깅
- **일관성**: 모든 로그가 Cline의 확립된 패턴을 따름
- **유지보수**: 유지 및 구성할 단일 로깅 시스템
- **호환성**: Cline과 Caret 로깅 간 충돌 없음
- **성능**: 기존의 최적화된 로깅 인프라 활용

### 분리된 프론트엔드 로깅
- **개발**: 개발 중 풍부한 디버깅 정보
- **프로덕션**: 사용자를 압도하지 않는 깔끔하고 최소한의 로깅
- **격리**: 프론트엔드 문제가 백엔드 로깅을 방해하지 않음
- **유연성**: Caret 전용 요구사항에 맞게 쉽게 조정 가능

## 현재 상태 요약
- ✅ **백엔드**: Cline Logger와 성공적으로 통합
- ✅ **프론트엔드**: CaretWebviewLogger 구현 및 작동 중
- ✅ **브랜딩**: 사용자 대면 요소는 Caret, 내부는 cline 사용
- ✅ **충돌 없음**: 시스템이 독립적이고 조화롭게 작동

## 관련 워크플로우
- 기존 Cline 로깅 코드를 건드릴 때 `/cline-modification` 적용
- 로깅이 필요한 컴포넌트를 추가할 때 `/new-component` 사용
- 로깅 변경이 오류 처리에 영향을 줄 때 `/critical-verification` 고려
</detailed_sequence_of_steps>

<general_guidelines>
이 워크플로우는 브랜딩 및 로깅 시스템의 현재 구현된 상태를 문서화합니다.

통합 접근법은 관심사의 명확한 분리를 유지하면서 호환성을 보장합니다.

두 시스템 모두 프로덕션 준비가 되어 있으며 확립된 패턴을 따릅니다.
</general_guidelines>