# Phase 7: WindowService Implementation Plan
**Date**: 2025-10-18  
**Author**: Alpha  
**Status**: 🔄 In Progress

## 📋 Phase Objective
WindowService의 18개 RPC 메서드를 구현하여 IntelliJ Platform에서 사용자 피드백 UI (메시지, 다이얼로그, 상태바 등)를 제공합니다.

## 🎯 Implementation Scope

### High Priority (Core UI) - 7 methods
1. ✅ **showInformationMessage**: 정보 메시지 표시
2. ✅ **showWarningMessage**: 경고 메시지 표시  
3. ✅ **showErrorMessage**: 에러 메시지 표시
4. ✅ **setStatusBarMessage**: 상태바 메시지 설정
5. ✅ **createOutputChannel**: 출력 채널 생성
6. ✅ **createTerminal**: 터미널 생성
7. ✅ **openExternal**: 외부 URL 열기

### Medium Priority (Dialogs) - 5 methods
8. ⏳ **showQuickPick**: 빠른 선택 다이얼로그
9. ⏳ **showInputBox**: 입력 다이얼로그
10. ⏳ **showOpenDialog**: 파일 열기 다이얼로그
11. ⏳ **showSaveDialog**: 파일 저장 다이얼로그
12. ⏳ **withProgress**: 진행률 표시

### Low Priority (Advanced UI) - 6 methods
13. ⏳ **createStatusBarItem**: 상태바 항목 생성
14. ⏳ **asWebviewUri**: WebView URI 변환
15. ⏳ **focusProblemsTab**: Problems 탭 포커스
16. ⏳ **focusOutputTab**: Output 탭 포커스
17. ⏳ **focusTerminalTab**: Terminal 탭 포커스
18. ⏳ **focusDebugConsoleTab**: Debug Console 탭 포커스

## 📝 Implementation Strategy

### Step 1: Create WindowServiceImpl.kt
**Location**: `caret-intellij-plugin/src/main/kotlin/com/caret/intellij/hostbridge/services/WindowServiceImpl.kt`

**Key IntelliJ APIs to Use**:
- `com.intellij.notification.Notifications` - 알림 메시지
- `com.intellij.openapi.ui.Messages` - 다이얼로그
- `com.intellij.openapi.wm.StatusBar` - 상태바
- `com.intellij.openapi.wm.ToolWindowManager` - 툴 윈도우
- `com.intellij.ide.BrowserUtil` - 외부 브라우저
- `com.intellij.execution.ui.ConsoleView` - 콘솔/출력 패널

### Step 2: Update WebViewMessageRouter.kt
`routeWindowService` 메서드에서 18개 메서드 라우팅 구현

### Step 3: Build & Test
`./gradlew build`로 컴파일 검증

## 🔍 Proto Definition Reference
**File**: `proto/host/window.proto`

```protobuf
service WindowService {
  rpc showInformationMessage(ShowMessageRequest) returns (bot.cline.proto.StringResponse);
  rpc showWarningMessage(ShowMessageRequest) returns (bot.cline.proto.StringResponse);
  rpc showErrorMessage(ShowMessageRequest) returns (bot.cline.proto.StringResponse);
  rpc showQuickPick(ShowQuickPickRequest) returns (bot.cline.proto.StringResponse);
  rpc showInputBox(ShowInputBoxRequest) returns (bot.cline.proto.StringResponse);
  rpc showOpenDialog(ShowOpenDialogRequest) returns (bot.cline.proto.StringResponse);
  rpc showSaveDialog(ShowSaveDialogRequest) returns (bot.cline.proto.StringResponse);
  rpc withProgress(WithProgressRequest) returns (bot.cline.proto.Empty);
  rpc createStatusBarItem(CreateStatusBarItemRequest) returns (bot.cline.proto.StringResponse);
  rpc createOutputChannel(CreateOutputChannelRequest) returns (bot.cline.proto.Empty);
  rpc createTerminal(CreateTerminalRequest) returns (bot.cline.proto.StringResponse);
  rpc openExternal(bot.cline.proto.StringRequest) returns (bot.cline.proto.BoolResponse);
  rpc setStatusBarMessage(bot.cline.proto.StringRequest) returns (bot.cline.proto.Empty);
  rpc asWebviewUri(bot.cline.proto.StringRequest) returns (bot.cline.proto.StringResponse);
  rpc focusProblemsTab(bot.cline.proto.EmptyRequest) returns (bot.cline.proto.Empty);
  rpc focusOutputTab(bot.cline.proto.EmptyRequest) returns (bot.cline.proto.Empty);
  rpc focusTerminalTab(bot.cline.proto.EmptyRequest) returns (bot.cline.proto.Empty);
  rpc focusDebugConsoleTab(bot.cline.proto.EmptyRequest) returns (bot.cline.proto.Empty);
}
```

## ⚠️ Implementation Notes

### 1. IntelliJ Notification System
IntelliJ는 VSCode의 `showInformationMessage`와 다르게 Notification 시스템을 사용합니다:

```kotlin
import com.intellij.notification.Notification
import com.intellij.notification.NotificationType
import com.intellij.notification.Notifications

val notification = Notification(
    "Caret",  // groupId
    "Title",
    "Message content",
    NotificationType.INFORMATION
)
Notifications.Bus.notify(notification, project)
```

### 2. Modal vs Non-Modal
VSCode는 주로 non-modal 메시지를 사용하지만, IntelliJ는 두 가지 방식 제공:
- **Non-modal**: `Notifications.Bus.notify()` - 우측 하단 팝업
- **Modal**: `Messages.showMessageDialog()` - 모달 다이얼로그

Caret은 **non-modal** 방식을 기본으로 사용합니다 (UX 일관성).

### 3. Status Bar API
IntelliJ의 StatusBar는 프로젝트별로 관리됩니다:

```kotlin
val statusBar = WindowManager.getInstance().getStatusBar(project)
statusBar?.info = "Status message"
```

## 🚀 Success Criteria
- [ ] WindowServiceImpl.kt 생성 완료
- [ ] 18개 메서드 모두 구현 완료
- [ ] WebViewMessageRouter.kt 라우팅 추가
- [ ] Build 성공 (no compilation errors)
- [ ] Phase 7 완료 리포트 작성
- [ ] Git commit

## 📊 Estimated Time
- WindowServiceImpl.kt creation: 30 min
- WebViewMessageRouter.kt update: 20 min
- Build & verification: 10 min
- **Total**: ~1 hour

---
**Phase 7 Status**: 🔄 **IN PROGRESS**  
**Next File**: WindowServiceImpl.kt
