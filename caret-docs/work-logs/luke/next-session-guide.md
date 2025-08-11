# Next Session Guide - Task #007 Proto 분리 작업 Phase 4 완료

## 📊 현재 진행 상황

### ✅ 완료된 작업들

#### Phase 1-3: Proto 패키지 분리 (완료)
- **proto/cline/**: Cline 원본 proto 파일들로 분리 완료
- **proto/caret/**: Caret 전용 proto 파일들 분리 완료  
- **proto/host/**: Host 관련 proto 파일들 분리 완료
- **생성 스크립트 수정**: 패키지별 proto 생성 로직 구현 완료

#### Phase 4: 백엔드 수정 (진행중 → 80% 완료)
- **에러 감소**: 291개 → 30개 (약 90% 해결)
- **Cline-First 전략 적용**: Cline 원본 코드 우선, Caret 기능 caret-src로 분리
- **핵심 아키텍처 수정 완료**:
  - ✅ CaretProvider: WebviewProvider 상속 구조로 재구현
  - ✅ CaretController: ClineController 상속으로 분리
  - ✅ state.ts: 최소수정원칙으로 localCaretRulesToggles, uiLanguage 추가
  - ✅ 생성 스크립트 복원: Cline 원본으로 교체하여 올바른 클라이언트 생성

### 🚨 남은 30개 에러 분석

#### 에러 유형별 분류:

1. **ExtensionState 타입 불일치** (1개)
   ```typescript
   src/core/controller/index.ts:779 - ExtensionState에서 localCaretRulesToggles, uiLanguage 누락
   ```

2. **함수 시그니처 불일치** (1개)
   ```typescript
   src/core/task/index.ts:314 - ToolExecutor 생성자에서 doesLatestTaskCompletionHaveNewChanges 매개변수 누락
   ```

3. **chatSettings 프로퍼티 누락** (2개)
   ```typescript
   src/extension.ts:81,83 - getAllExtensionState 반환값에서 chatSettings 프로퍼티 누락
   ```

4. **생성된 클라이언트 타입 정의 누락** (15개)
   ```typescript
   src/generated/hosts/standalone/host-bridge-clients.ts - 각 서비스별 Client, Definition 타입 누락
   ```

5. **proto 관련 import/export 에러** (5개)
   ```typescript
   - SaveOpenDocumentIfDirtyResponse 누락
   - WatchServiceClient import 경로 문제  
   - Metadata import 경로 문제
   ```

6. **Caret 전용 기능 에러** (6개)
   ```typescript
   - toggleChatbotAgentModeWithChatSettings 메서드 누락
   - CHATBOT_MODE_RESPOND, ASK_BROWSER_ACTION enum 누락
   - caretApiKey 프로퍼티 누락
   ```

## 🎯 다음 세션 작업 계획

### 우선순위 1: 타입 정의 문제 해결
1. **ExtensionState 인터페이스 확장**
   - 위치: `src/shared/` 또는 관련 타입 파일 찾아서 수정
   - 추가할 프로퍼티: `localCaretRulesToggles`, `uiLanguage`

2. **chatSettings 복원**
   - Cline 최신에서 chatSettings 구조 변경 확인
   - getAllExtensionState에서 적절한 방식으로 복원

### 우선순위 2: 생성된 파일 문제 해결
1. **host-bridge-clients.ts 수정**
   - 각 서비스별 Client, Definition 타입 임시 정의 또는 올바른 import
   - Cline build bug fix로 주석 달고 임시 수정

2. **ToolExecutor 시그니처 수정**
   - 누락된 매개변수 확인하고 추가

### 우선순위 3: Caret 전용 기능 복원
1. **Controller 메서드 복원**
   - `toggleChatbotAgentModeWithChatSettings` 메서드를 CaretController에 추가

2. **Proto enum 복원**
   - `CHATBOT_MODE_RESPOND`, `ASK_BROWSER_ACTION` 등 Caret 전용 enum 추가

## 📋 중요한 아키텍처 결정사항

### Cline-First 전략 확립
- **원칙**: Cline 구조 변경을 우선 따름, Caret은 그 위에 합성
- **적용 결과**: 
  - state.ts, Controller 등 핵심 파일을 Cline 최신으로 교체
  - Caret 기능을 caret-src/로 분리하여 상속/확장 패턴 적용

### 최소수정원칙 준수
- **Cline 원본 파일**: 1-3라인 내 최소 수정, CARET MODIFICATION 주석 필수
- **생성 스크립트**: Cline 원본 사용하여 올바른 클라이언트 생성
- **백업 전략**: .cline 파일로 원본 보존

## 🔧 추천 해결 전략

### 1. 타입 우선 해결
```bash
# ExtensionState 타입 찾기
find src/ -name "*.ts" -exec grep -l "ExtensionState" {} \;

# chatSettings 구조 변경 확인
grep -r "chatSettings" src/core/storage/ cline-latest/src/core/storage/
```

### 2. 임시 빌드 버그 수정
Cline build bug로 분류하여 임시 수정:
```typescript
// CARET MODIFICATION: Cline build bug fix - missing client types
// Generated clients are missing proper type definitions
// Will be removed when Cline fixes proto generation
```

### 3. 순차적 해결 접근
1. 타입 정의 먼저 해결 → 컴파일 에러 대폭 감소 예상
2. 생성된 파일 문제 해결 → proto 관련 에러 해결
3. Caret 전용 기능 복원 → 나머지 에러 해결

## 📚 참고 문서

- **머징 가이드**: `caret-docs/guides/upstream-merging.mdx` (Proto 분리 섹션 추가됨)
- **아키텍처 가이드**: `caret-docs/development/caret-architecture-and-implementation-guide.mdx`
- **테스팅 가이드**: `caret-docs/development/testing-guide.mdx`

## 🎉 성과 요약

- **에러 90% 감소**: 291개 → 30개
- **아키텍처 개선**: Cline-First 전략으로 향후 머징 용이성 확보
- **코드 분리**: Caret 전용 로직을 caret-src/로 체계적 분리
- **가이드 보강**: Proto 분리 전용 머징 가이드 작성 완료

**다음 세션에서는 남은 30개 에러를 체계적으로 해결하여 Task #007을 완료할 예정입니다!** ✨