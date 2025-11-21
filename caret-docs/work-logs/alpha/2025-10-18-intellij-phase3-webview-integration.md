# IntelliJ Plugin Phase 3: JCEF Webview Integration Plan

**Date**: 2025-10-18
**Author**: Alpha Yang
**Status**: In Progress

## Phase 3 Overview

Phase 2에서 gRPC 서버 구현을 완료했으니, 이제 JCEF (Java Chromium Embedded Framework)를 사용해 Caret의 React UI를 IntelliJ에 렌더링합니다.

### 목표
1. **JCEF 통합**: IntelliJ Platform의 JCEF 기반 WebView 생성
2. **React UI 로드**: Caret의 빌드된 React UI를 WebView에 로드
3. **JavaScript ↔ Kotlin 브릿지**: 양방향 메시지 통신 구현
4. **HostBridge 연결**: WebView와 gRPC 서버 연결

### 예상 시간
- JCEF WebView 생성: 20분
- React UI 로드: 15분
- 메시지 브릿지 구현: 30분
- HostBridge 연결: 20분
**Total**: 약 1.5시간

## Step 1: JCEF WebView 생성

### CaretToolWindowFactory 구현

IntelliJ의 Tool Window에 JCEF 기반 WebView를 생성합니다.

```kotlin
package com.caret.intellij.ui

import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory

/**
 * Caret Tool Window Factory
 * Creates and manages the Caret WebView tool window
 */
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

### CaretWebView 구현

JCEF 기반 WebView 컴포넌트를 생성합니다.

```kotlin
package com.caret.intellij.ui

import com.caret.intellij.hostbridge.HostBridgeServer
import com.intellij.openapi.project.Project
import com.intellij.ui.jcef.JBCefBrowser
import com.intellij.ui.jcef.JBCefBrowserBase
import com.intellij.ui.jcef.JBCefJSQuery
import org.cef.browser.CefBrowser
import org.cef.browser.CefFrame
import org.cef.handler.CefLoadHandlerAdapter
import java.awt.BorderLayout
import javax.swing.JComponent
import javax.swing.JPanel

/**
 * Caret WebView Component
 * JCEF-based WebView for displaying Caret React UI
 */
class CaretWebView(private val project: Project) {
    private val browser: JBCefBrowser
    private val hostBridgeServer: HostBridgeServer
    private val jsToKotlinBridge: JBCefJSQuery
    
    val component: JComponent
    
    init {
        // Initialize gRPC HostBridge server
        hostBridgeServer = HostBridgeServer(project)
        val port = hostBridgeServer.start()
        
        // Create JCEF browser
        browser = JBCefBrowser()
        
        // Create JavaScript → Kotlin message bridge
        jsToKotlinBridge = JBCefJSQuery.create(browser as JBCefBrowserBase)
        jsToKotlinBridge.addHandler { message ->
            handleMessageFromWebView(message)
            null // Return value to JavaScript
        }
        
        // Setup component
        component = JPanel(BorderLayout()).apply {
            add(browser.component, BorderLayout.CENTER)
        }
        
        // Load React UI after browser is ready
        browser.jbCefClient.addLoadHandler(object : CefLoadHandlerAdapter() {
            override fun onLoadEnd(browser: CefBrowser?, frame: CefFrame?, httpStatusCode: Int) {
                if (frame?.isMain == true) {
                    injectJavaScriptBridge()
                }
            }
        }, browser.cefBrowser)
        
        // Load Caret UI
        loadCaretUI(port)
    }
    
    /**
     * Load Caret React UI
     */
    private fun loadCaretUI(hostBridgePort: Int) {
        // Get the path to the built React UI
        val pluginPath = project.basePath ?: return
        val webviewPath = "$pluginPath/webview-ui/build/index.html"
        
        // Load the HTML file
        browser.loadURL("file://$webviewPath?hostBridgePort=$hostBridgePort")
    }
    
    /**
     * Inject JavaScript bridge for communication
     */
    private fun injectJavaScriptBridge() {
        val jsCode = """
            window.caretBridge = {
                sendMessage: function(message) {
                    ${jsToKotlinBridge.inject("JSON.stringify(message)")}
                },
                onMessage: function(handler) {
                    window.caretMessageHandler = handler;
                }
            };
            
            // Notify React app that bridge is ready
            window.dispatchEvent(new CustomEvent('caretBridgeReady'));
        """.trimIndent()
        
        browser.cefBrowser.executeJavaScript(jsCode, browser.cefBrowser.url, 0)
    }
    
    /**
     * Handle messages from WebView (JavaScript)
     */
    private fun handleMessageFromWebView(message: String): String? {
        try {
            // Parse message and route to appropriate handler
            // This will interact with HostBridge gRPC services
            Logger.debug("[CaretWebView] Received message from WebView: $message")
            
            // TODO: Route message to HostBridge services
            
            return null
        } catch (e: Exception) {
            Logger.error("[CaretWebView] Failed to handle message from WebView", e)
            return null
        }
    }
    
    /**
     * Send message to WebView (Kotlin → JavaScript)
     */
    fun sendMessageToWebView(message: String) {
        val jsCode = """
            if (window.caretMessageHandler) {
                window.caretMessageHandler($message);
            }
        """.trimIndent()
        
        browser.cefBrowser.executeJavaScript(jsCode, browser.cefBrowser.url, 0)
    }
    
    /**
     * Dispose resources
     */
    fun dispose() {
        hostBridgeServer.shutdown()
        browser.dispose()
    }
}
```

## Step 2: plugin.xml 업데이트

Tool Window를 등록합니다.

```xml
<!-- caret-intellij-plugin/src/main/resources/META-INF/plugin.xml -->
<idea-plugin>
    <!-- ... existing content ... -->
    
    <extensions defaultExtensionNs="com.intellij">
        <!-- Tool Window -->
        <toolWindow 
            id="Caret" 
            anchor="right" 
            factoryClass="com.caret.intellij.ui.CaretToolWindowFactory"
            icon="/icons/caret-icon.svg"/>
    </extensions>
</idea-plugin>
```

## Step 3: React UI 빌드 통합

### build.gradle.kts 업데이트

React UI 빌드를 IntelliJ 플러그인 빌드 프로세스에 통합합니다.

```kotlin
tasks {
    // Build React UI before building plugin
    val buildReactUI by registering(Exec::class) {
        workingDir = project.file("../")
        commandLine("npm", "run", "build:webview")
    }
    
    // Copy built React UI to plugin resources
    val copyReactUI by registering(Copy::class) {
        dependsOn(buildReactUI)
        from("../webview-ui/build")
        into("build/resources/main/webview")
    }
    
    processResources {
        dependsOn(copyReactUI)
    }
}
```

## Step 4: 메시지 브릿지 프로토콜

### WebView ↔ Extension 메시지 구조

```typescript
// Message types for WebView ↔ Kotlin communication
interface WebViewMessage {
    type: 'grpc-request' | 'grpc-response' | 'event';
    requestId: string;
    payload: any;
}

// JavaScript side (React)
window.caretBridge.sendMessage({
    type: 'grpc-request',
    requestId: 'uuid-123',
    payload: {
        service: 'workspace',
        method: 'getWorkspacePaths',
        params: {}
    }
});

window.caretBridge.onMessage((message) => {
    if (message.type === 'grpc-response') {
        // Handle response
    }
});
```

### Kotlin 메시지 라우터

```kotlin
class WebViewMessageRouter(
    private val project: Project,
    private val hostBridgeServer: HostBridgeServer
) {
    suspend fun routeMessage(message: WebViewMessage): String {
        return when (message.type) {
            "grpc-request" -> handleGrpcRequest(message)
            "event" -> handleEvent(message)
            else -> throw IllegalArgumentException("Unknown message type: ${message.type}")
        }
    }
    
    private suspend fun handleGrpcRequest(message: WebViewMessage): String {
        val service = message.payload["service"] as String
        val method = message.payload["method"] as String
        val params = message.payload["params"]
        
        // Route to appropriate gRPC service
        val response = when (service) {
            "workspace" -> routeToWorkspaceService(method, params)
            "env" -> routeToEnvService(method, params)
            else -> throw IllegalArgumentException("Unknown service: $service")
        }
        
        return Json.encodeToString(WebViewMessage(
            type = "grpc-response",
            requestId = message.requestId,
            payload = response
        ))
    }
}
```

## Step 5: React UI 수정 (선택사항)

Caret의 React UI가 IntelliJ JCEF 환경에서도 작동하도록 조정합니다.

```typescript
// webview-ui/src/utils/platform.ts
export function getPlatform(): 'vscode' | 'intellij' {
    if (window.caretBridge) {
        return 'intellij';
    }
    return 'vscode';
}

// webview-ui/src/utils/messaging.ts
export function sendMessage(message: any) {
    const platform = getPlatform();
    
    if (platform === 'intellij') {
        window.caretBridge.sendMessage(message);
    } else {
        // VSCode API
        vscode.postMessage(message);
    }
}
```

## 구현 순서

1. **CaretToolWindowFactory.kt** 생성
2. **CaretWebView.kt** 생성
3. **WebViewMessageRouter.kt** 생성
4. **plugin.xml** 업데이트
5. **build.gradle.kts** React 빌드 통합
6. **테스트**: IntelliJ에서 플러그인 실행

## 예상 결과

- ✅ Caret Tool Window가 IntelliJ 우측에 표시
- ✅ React UI가 JCEF WebView에 로드
- ✅ JavaScript ↔ Kotlin 양방향 통신 작동
- ✅ gRPC HostBridge를 통한 IntelliJ API 접근

## 다음 단계 (Phase 4)

Phase 3 완료 후:
- **E2E 테스트**: 전체 workflow 테스트
- **성능 최적화**: 메시지 처리 성능 개선
- **에러 핸들링**: Robustness 강화
- **문서화**: 사용자 가이드 작성

---

**Phase 3 Status**: 🚧 **IN PROGRESS**
**Next**: CaretToolWindowFactory 및 CaretWebView 구현
