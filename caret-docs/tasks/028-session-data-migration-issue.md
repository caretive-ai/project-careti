# Task 027: 세션 데이터 구조 호환성 문제 해결

**⚠️ 작업 환경**: 새 머징 브랜치에서 작업 (main에서 새 브랜치 생성 후)

## 1. 문제 설명
- 구버전 확장 프로그램에서 생성된 세션이 신버전으로 업데이트 후 열리지 않는 문제 발생.

## 2. 원인 분석
- `git status`를 통해 여러 파일 변경사항을 조사한 결과, `src/shared/ExtensionMessage.ts`와 `src/core/storage/state-keys.ts`가 주요 원인으로 식별됨.
- `ExtensionState`와 `LocalStateKey`에 `chatSettings` 속성이 추가되면서, 이 속성이 없는 구버전 세션 데이터와의 호환성 문제 발생.

## 3. 제안된 해결책
- 사용자가 워크스페이스 상태를 수동으로 리셋할 수 있는 VSCode 명령어(`caret.dev.resetWorkspaceState`) 추가.
- 이 명령어는 `resetState` 컨트롤러를 호출하여 오래된 세션 데이터를 안전하게 삭제하고, 업데이트된 구조에 맞는 새 데이터 생성을 가능하게 함.

## 4. (제안) 구현 코드

**작업 브랜치**: `feature/session-compatibility-fix`

### 4.1 브랜치 생성 및 설정
```bash
# main에서 새 브랜치 생성
git checkout main
git pull origin main
git checkout -b feature/session-compatibility-fix
```

### 4.2 구현 - `src/dev/commands/tasks.ts`에 명령어 추가

```typescript
// src/dev/commands/tasks.ts
import { resetState } from "@core/controller/state/resetState";
import { ResetStateRequest } from "@shared/proto/cline/state";

// ... registerTaskCommands 함수 내부에서
vscode.commands.registerCommand("caret.dev.resetWorkspaceState", async () => {
    try {
        HostProvider.window.showMessage({
            type: ShowMessageType.WINDOW_MESSAGE_INFORMATION,
            message: "워크스페이스 상태를 리셋하고 있습니다...",
        });

        const request = ResetStateRequest.create({ global: false });
        await resetState(controller, request);

        HostProvider.window.showMessage({
            type: ShowMessageType.WINDOW_MESSAGE_INFORMATION,
            message: "워크스페이스 상태가 리셋되었습니다.",
        });
    } catch (error) {
        console.error("워크스페이스 상태 리셋 중 오류 발생:", error);
        HostProvider.window.showMessage({
            type: ShowMessageType.WINDOW_MESSAGE_ERROR,
            message: `워크스페이스 상태 리셋 실패: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
}),
```

## 5. 검증 절차
1. 구버전 확장 프로그램에서 세션을 생성.
2. 최신 버전으로 업데이트하고 세션이 열리지 않는 문제를 재현.
3. 명령 팔레트에서 `Caret: Reset Workspace State` 실행.
4. 세션이 정상적으로 초기화되어 올바르게 열리는지 확인.

## 6. 추가 고려사항

### 6.1 사용자 경험 개선
- 세션 호환성 문제가 감지되었을 때 자동으로 안내 메시지 표시
- 데이터 손실에 대한 명확한 경고 및 백업 권장

### 6.2 향후 호환성 관리
- 스키마 버전 관리 시스템 도입 검토
- 마이그레이션 로직 구현으로 데이터 손실 최소화

### 6.3 개발자 도구 확장
- 세션 상태 진단 명령어 추가
- 디버깅을 위한 상세 로그 출력

## 7. 작업 완료 후

### 7.1 테스트
```bash
# 컴파일 확인
npm run compile

# 명령어 등록 확인
# F5로 Extension Host 실행 후 명령 팔레트에서 "Caret: Reset Workspace State" 검색
```

### 7.2 커밋 및 PR
```bash
git add .
git commit -m "feat: add workspace state reset command for session compatibility

- Add caret.dev.resetWorkspaceState command
- Resolves session compatibility issues after updates
- Includes Korean localized messages"

git push origin feature/session-compatibility-fix
# GitHub에서 PR 생성
```

---

**우선순위**: HIGH  
**예상 작업 시간**: 1-2시간  
**연관 작업**: 026번 Priority Merge (선행 작업)  
**작업 환경**: 새 브랜치 (`feature/session-compatibility-fix`)

**작성자**: Luke (Project Owner)  
**수정자**: Alpha (AI Assistant)  
**작성일**: 2025-01-23
