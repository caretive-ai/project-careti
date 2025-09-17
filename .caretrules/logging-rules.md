# Caret 로깅 규칙

## 🚨 절대 금지

- `console.log`, `console.warn`, `console.error` 사용 금지
- 프로덕션에서도 항상 출력되어 성능과 로그 품질에 악영향

## ✅ 올바른 로깅

### Logger 사용
```typescript
import { Logger } from "@/services/logging/Logger";

// 개발용 디버그 로그 (log level로 제어됨)
Logger.debug(`[ComponentName] 🎯 Debug info`);

// 중요한 운영 이벤트
Logger.info(`[ComponentName] ✅ Operation completed`);

// 경고 (문제가 될 수 있는 상황)
Logger.warn(`[ComponentName] ⚠️ Warning message`);

// 오류 (실제 문제 발생)
Logger.error(`[ComponentName] ❌ Error occurred`, error);
```

### 로그 형식 규칙

1. **컴포넌트 이름 표시**: `[ComponentName]`
2. **아이콘 사용**: 🎯 ✅ ⚠️ ❌ 🚀 📋 등
3. **간결한 메시지**: 핵심 정보만
4. **객체 로깅**: 두 번째 매개변수로 전달

### 로그 레벨별 사용

- **Debug**: 개발 중 디버깅용, 상세한 실행 흐름
- **Info**: 중요한 작업 완료, 상태 변경
- **Warn**: 잠재적 문제, 경고 상황
- **Error**: 실제 오류, 예외 상황

## 예시

### ❌ 잘못된 사용
```typescript
console.log("Starting process...");
console.error("Something went wrong");
```

### ✅ 올바른 사용  
```typescript
Logger.debug(`[ProcessManager] 🚀 Starting process`);
Logger.error(`[ProcessManager] ❌ Process failed`, error);
```