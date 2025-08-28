# Task #023: '최근 작업' 클릭 시 발생하는 크래시 오류 해결

**프로젝트**: Caret
**담당자**: luke
**우선순위**: 📋 **High - 앱의 기본 기능 사용 불가**
**상태**: 🆕 **신규**

## 🎯 **목표: '최근 작업' 목록의 항목을 클릭했을 때 발생하는 크래시를 해결하여, 사용자가 이전 작업을 정상적으로 불러올 수 있도록 한다.**

- **주요 현상**:
  - 홈 화면에서 '최근 작업' 목록에 있는 특정 항목을 클릭하면, 웹뷰 전체가 하얗게 변하며 크래시되고 홈으로 돌아온다.
  - VSCode 개발자 도구 콘솔에 `onUnexpectedError` 관련 로그가 출력된다.

## 🔍 **원인 분석 (2025-07-11)**

1.  **오류 발생 지점**:
    - 오류는 `webview-ui/src/components/history/HistoryPreview.tsx` 컴포넌트에서 발생합니다. 이 컴포넌트는 홈 화면의 '최근 작업' 목록을 렌더링하고 각 항목에 대한 클릭 이벤트를 처리합니다.

2.  **근본 원인**:
    - `useExtensionState()`를 통해 가져오는 `taskHistory` 배열에 비정상적인 데이터가 포함되어 있을 가능성이 매우 높습니다.
    - 코드 분석 결과, `taskHistory`의 일부 항목에 `task` 속성(작업 내용)이 `undefined`이거나, `ts` 속성(타임스탬프)이 유효하지 않은 값일 수 있습니다.
    - `HistoryPreview.tsx`에서는 `item.ts && item.task` 조건으로 필터링을 시도하지만, 이 필터링을 통과한 후에도 `formatDate(item.ts)`나 `item.task`를 직접 사용하는 부분에서 유효하지 않은 값으로 인해 런타임 에러가 발생하여 전체 웹뷰가 크래시되는 것으로 추정됩니다.

## 💡 **해결 방안 (다음 세션 가이드)**

다음 작업자는 아래 순서대로 작업을 진행하여 문제를 해결해 주세요.

### **Phase 1: 안정성 강화를 통한 긴급 조치 (Defensive Coding)**

- **목표**: 비정상적인 데이터가 들어와도 크래시가 발생하지 않도록 코드를 수정합니다.
- **수정 파일**: `webview-ui/src/components/history/HistoryPreview.tsx`
- **수정 내용**:
    1.  **데이터 필터링 강화**: `taskHistory.filter(...)` 부분의 조건을 더 엄격하게 변경하여, `task`가 비어있지 않고 `ts`가 유효한 숫자인 경우에만 렌더링하도록 합니다.
        ```typescript
        // 변경 전
        taskHistory.filter((item) => item.ts && item.task)

        // 변경 후 (예시)
        taskHistory.filter((item) => item && typeof item.ts === 'number' && item.ts > 0 && typeof item.task === 'string' && item.task.trim() !== '')
        ```
    2.  **`formatDate` 함수 안정성 강화**: `formatDate` 함수 내부에 `try-catch` 구문을 추가하거나, 입력된 `timestamp`가 유효한지 먼저 확인하여 `Invalid Date` 오류를 방지합니다.
        ```typescript
        // 변경 후 (예시)
        const formatDate = (timestamp: number) => {
            if (!timestamp || typeof timestamp !== 'number') {
                return "Invalid date";
            }
            try {
                const date = new Date(timestamp);
                // ... 기존 포맷팅 로직
            } catch (error) {
                console.error("Error formatting date:", error);
                return "Date Error";
            }
        };
        ```
    3.  **`handleHistorySelect` 안정성 강화**: 클릭 핸들러에서도 `item.id`가 유효한지 확인하는 로직을 추가합니다.

### **Phase 2: 근본 원인 추적 및 데이터 수정**

- **목표**: 어떤 과정에서 비정상적인 `taskHistory` 데이터가 저장되는지 근본 원인을 찾아 해결합니다.
- **분석 대상 파일**:
    - `src/core/controller/index.ts`: `taskHistory` 상태를 업데이트하는 로직
    - `src/core/storage/state.ts`: `GlobalState` 및 `WorkspaceState`에 데이터를 저장하는 로직
- **작업 내용**:
    1.  태스크가 종료되거나 저장될 때, `task`나 `ts` 필드가 누락되는 경우가 있는지 확인합니다.
    2.  필요하다면, 데이터를 저장하기 전에 유효성을 검사하는 로직을 추가하여 비정상적인 데이터가 애초에 저장되지 않도록 방지합니다.

## ✅ **체크리스트**

- [ ] `HistoryPreview.tsx`에 안정성 강화 코드 적용
- [ ] `formatDate` 함수에 예외 처리 추가
- [ ] 데이터 저장 로직 분석 및 수정
- [ ] 기능 테스트: 비정상적인 데이터가 있어도 크래시되지 않는지 확인
- [ ] 기능 테스트: '최근 작업' 항목 클릭 시 정상적으로 동작하는지 확인
