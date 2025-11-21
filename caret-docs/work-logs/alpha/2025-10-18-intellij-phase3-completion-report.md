# IntelliJ Plugin Phase 3 완료 보고서
**Date**: 2025-10-18  
**Phase**: 3 - JCEF Webview Integration  
**Status**: ✅ Completed  
**Duration**: ~45 minutes (예상: 1.5시간)

## 개요
Phase 3에서는 JCEF 기반 웹뷰 통합을 구현하여 IntelliJ에서 Caret의 React UI를 표시할 수 있도록 했습니다.

## 구현 내용

### 1. CaretToolWindowFactory.kt
**Path**: `caret-intellij-plugin/src/main/kotlin/com/caret/intellij/ui/CaretToolWindowFactory.kt`  
**Lines**: 24  
**Purpose**: IntelliJ Tool Window 생성 팩토리

```kotlin
class CaretToolWindowFactory : ToolWindowFactory, DumbAware {
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val caretWebView = CaretWebView(project)
        val content = ContentFactory.getInstance().createContent(
            caretWebView.component,
            "",
            false
        )
        toolWindow.contentManager.addContent(content)
    }
    
    override fun shouldBeAvailable(project: Project): Boolean = true
}
```

**Key Features**:
- IntelliJ ToolWindowFactory 구현
- CaretWebView 인스턴스 생성 및 통합
- Tool window에 JCEF 컴포넌트 추가

### 2. CaretWebView.kt
**Path**: `caret-intellij-plugin/src/main/kotlin/com/caret/intellij/ui/CaretWebView.kt`  
**Lines**: 201  
**Purpose**: JCEF 브라우저 컴포넌트로 React UI 렌더링

**Core Responsibilities**:
1. **HostBridge 초기화**: gRPC 서버 시작
2. **JCEF 브라우저 생성**: JBCefBrowser 인스턴스
3. **JavaScript Bridge**: 양방향 통신 설정
4. **React UI 로딩**: webview-ui/build/index.html
5. **Message Routing**: WebViewMessageRouter 통합

**Key Implementation Details**:

#### JavaScript Bridge Injection
```javascript
window.vscode = {
    postMessage: function(message) {
        // Kotlin으로 메시지 전송
    }
};

window.__dispatchMessageFromKotlin = function(message) {
    // JavaScript로 메시지 수신
};
```

#### Development vs Production Loading
```kotlin
// Development: file:///path/to/webview-ui/build/index.html
if (webviewBuildPath.exists()) {
    browser.loadURL("file://${webviewBuildPath.absolutePath}")
}
// Production: classpath:webview/index.html (bundled)
else {
    val resourceUrl = javaClass.classLoader.getResource("webview/index.html")
    browser.loadURL(resourceUrl.toString())
}
```

#### Lifecycle Management
```kotlin
class CaretWebView(project: Project) : Disposable {
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    
    override fun dispose() {
        scope.cancel()
        hostBridgeServer.stop()
    }
}
```

### 3. WebViewMessageRouter.kt
**Path**: `caret-intellij-plugin/src/main/kotlin/com/caret/intellij/ui/WebViewMessageRouter.kt`  
**Lines**: 186  
**Purpose**: WebView ↔ HostBridge 메시지 라우팅

**Message Format**:
```json
{
  "type": "grpc_request",
  "service": "WorkspaceService",
  "method": "getWorkspacePaths",
  "requestId": "unique_id",
  "data": { ... }
}
```

**Routing Logic**:
```kotlin
suspend fun routeMessage(messageJson: String) {
    val json = JSONObject(messageJson)
    when (json.optString("type")) {
        "grpc_request" -> handleGrpcRequest(json)
        "ping" -> handlePing(json)
        else -> sendError("unknown_message_type", ...)
    }
}
```

**Service Routing**:
- WorkspaceService: 7 RPCs
- EnvService: 7 RPCs  
- WindowService: 13 RPCs
- DiffService: 7 RPCs
- TestingService: 5 RPCs

**Current Implementation**: Stub responses (TODO: 실제 gRPC 호출 연결)

### 4. Configuration Verification

#### plugin.xml
이미 CaretToolWindowFactory가 등록되어 있었음:
```xml
<toolWindow id="Caret" 
            secondary="true" 
            icon="/icons/caret.svg" 
            anchor="right"
            factoryClass="com.caret.intellij.ui.CaretToolWindowFactory"/>
```

#### build.gradle.kts
이미 WebView UI 빌드 아티팩트 포함 설정 존재:
```kotlin
resources {
    srcDir("../webview-ui/build") {
        into("webview")
    }
}
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ IntelliJ IDEA                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tool Window                                          │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │ CaretToolWindowFactory                        │  │  │
│  │  │  creates                                      │  │  │
│  │  │  ↓                                            │  │  │
│  │  │  CaretWebView (Disposable)                   │  │  │
│  │  │  ├─ HostBridgeServer (gRPC)                  │  │  │
│  │  │  ├─ JBCefBrowser (JCEF)                      │  │  │
│  │  │  ├─ JBCefJSQuery (JS→Kotlin bridge)         │  │  │
│  │  │  └─ WebViewMessageRouter                    │  │  │
│  │  │      ├─ WorkspaceService routing             │  │  │
│  │  │      ├─ EnvService routing                   │  │  │
│  │  │      ├─ WindowService routing                │  │  │
│  │  │      ├─ DiffService routing                  │  │  │
│  │  │      └─ TestingService routing               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ JCEF Browser                                         │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │ React UI (webview-ui/build/)                 │  │  │
│  │  │  ├─ window.vscode.postMessage() → Kotlin    │  │  │
│  │  │  └─ window.addEventListener('message') ← Kotlin│  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 통신 흐름

### JavaScript → Kotlin (WebView → HostBridge)
```
1. React UI: vscode.postMessage({ type: 'grpc_request', ... })
2. JBCefJSQuery: Capture JSON string
3. CaretWebView.handleWebViewMessage(json)
4. WebViewMessageRouter.routeMessage(json)
5. Route to service method (e.g., WorkspaceService.getWorkspacePaths)
6. Execute gRPC call to HostBridgeServer
7. Return response
```

### Kotlin → JavaScript (HostBridge → WebView)
```
1. HostBridgeServer: Generate response
2. WebViewMessageRouter: Format response
3. CaretWebView.sendMessageToWebView(response)
4. Execute JS: window.__dispatchMessageFromKotlin(response)
5. React UI: addEventListener('message', handler)
6. Handle response in UI
```

## VSCode Webview API 호환성

Caret의 React UI는 VSCode의 webview API를 사용하도록 작성되어 있습니다. IntelliJ에서도 동일한 API를 제공하여 코드 수정 없이 동작하도록 했습니다:

```javascript
// VSCode webview API (원본)
const vscode = acquireVsCodeApi();
vscode.postMessage({ type: 'request', data: ... });
window.addEventListener('message', (event) => {
    // Handle message from extension
});

// IntelliJ에서 제공하는 호환 API (CaretWebView가 주입)
window.vscode = {
    postMessage: function(message) {
        // JBCefJSQuery를 통해 Kotlin으로 전송
    }
};
window.__dispatchMessageFromKotlin = function(message) {
    // Kotlin에서 받은 메시지를 JavaScript로 전달
};
```

## 구현 완료 항목

- [x] CaretToolWindowFactory.kt 구현
- [x] CaretWebView.kt 구현
  - [x] HostBridge gRPC 서버 초기화
  - [x] JCEF 브라우저 생성
  - [x] JavaScript ↔ Kotlin 양방향 브릿지 설정
  - [x] React UI 로딩 (dev/prod 모드 지원)
  - [x] Disposable 리소스 관리
- [x] WebViewMessageRouter.kt 구현
  - [x] 메시지 파싱 및 라우팅
  - [x] 5개 gRPC 서비스 라우팅 구조
  - [x] Ping/pong 헬스 체크
  - [x] 에러 처리
- [x] plugin.xml 확인 (이미 등록됨)
- [x] build.gradle.kts 확인 (이미 설정됨)

## 다음 단계 (Phase 4)

### 1. gRPC 서비스 연결 완성
현재 WebViewMessageRouter는 stub 응답만 반환합니다. 실제 gRPC 호출을 연결해야 합니다:

```kotlin
// TODO in WebViewMessageRouter
private suspend fun routeWorkspaceService(method: String, data: JSONObject): Any {
    return when (method) {
        "getWorkspacePaths" -> {
            // 현재: 하드코딩된 응답
            mapOf("workspacePath" to "/path/to/workspace")
            
            // 목표: 실제 gRPC 호출
            val request = GetWorkspacePathsRequest.newBuilder().build()
            val response = hostBridgeServer.workspaceService.getWorkspacePaths(request)
            mapOf("workspacePath" to response.workspacePath)
        }
        // ... 나머지 메서드도 동일하게
    }
}
```

### 2. JSON 직렬화 개선
현재 간단한 `toString()` 사용 중. kotlinx.serialization 또는 Gson 도입:

```kotlin
// TODO in CaretWebView
fun sendMessageToWebView(message: Any) {
    val messageJson = when (message) {
        is String -> message
        else -> {
            // TODO: Use proper JSON serialization
            message.toString() // 현재
        }
    }
    // ...
}
```

### 3. 빌드 및 테스트
```bash
# WebView UI 빌드 (필수)
npm run build:webview

# IntelliJ 플러그인 빌드
cd caret-intellij-plugin
./gradlew build

# IntelliJ IDEA에서 플러그인 실행
./gradlew runIde
```

### 4. 실제 기능 검증
- Tool Window가 올바르게 표시되는지
- React UI가 로드되는지
- JavaScript ↔ Kotlin 통신이 작동하는지
- HostBridge gRPC 서버가 시작되는지

## 시간 분석

**예상 시간**: 1.5시간  
**실제 소요**: ~45분  
**차이**: -50%

**이유**:
1. plugin.xml과 build.gradle.kts가 이미 설정되어 있었음
2. JCEF와 JavaScript 브릿지 패턴이 명확했음
3. VSCode webview API 호환성 구조가 단순했음

## 결론

Phase 3 JCEF Webview 통합이 성공적으로 완료되었습니다. 

**핵심 성과**:
- ✅ JCEF 기반 웹뷰 통합 완료
- ✅ VSCode webview API 호환성 확보
- ✅ JavaScript ↔ Kotlin 양방향 통신 구현
- ✅ HostBridge gRPC 서버 통합
- ✅ 메시지 라우팅 시스템 구축

**다음 Phase**:
Phase 4에서는 실제 gRPC 서비스 연결, JSON 직렬화 개선, 빌드 및 E2E 테스트를 진행합니다.

---

**Total Lines**: 411 (CaretToolWindowFactory: 24 + CaretWebView: 201 + WebViewMessageRouter: 186)  
**Completion Time**: 2025-10-18 00:35:00 KST
