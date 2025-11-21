# IntelliJ Plugin Phase 4 계획서
**Date**: 2025-10-18  
**Phase**: 4 - E2E Testing & Optimization  
**Estimated Duration**: 1-1.5 hours  
**Goal**: 실제 gRPC 연결 완성, JSON 직렬화 개선, 빌드 및 테스트

## 목표

Phase 3에서 구현한 JCEF Webview 통합을 완성하여 실제 작동 가능한 플러그인으로 만듭니다.

## 작업 범위

### 1. JSON 직렬화 개선 (15분)
**현재 문제**:
```kotlin
// CaretWebView.kt
fun sendMessageToWebView(message: Any) {
    val messageJson = when (message) {
        is String -> message
        else -> {
            // TODO: Use proper JSON serialization
            message.toString() // 부적절
        }
    }
    // ...
}
```

**해결 방법**:
- kotlinx.serialization 도입
- 또는 Gson 사용 (더 간단)

**구현 계획**:
1. `build.gradle.kts`에 Gson 의존성 추가
2. `CaretWebView.kt`에서 Gson으로 직렬화
3. `WebViewMessageRouter.kt`에서 Gson으로 역직렬화

### 2. gRPC 서비스 실제 연결 (30-45분)
**현재 문제**:
```kotlin
// WebViewMessageRouter.kt
private suspend fun routeWorkspaceService(method: String, data: JSONObject): Any {
    return when (method) {
        "getWorkspacePaths" -> {
            // TODO: 실제 gRPC 호출
            mapOf("workspacePath" to "/path/to/workspace") // stub
        }
        // ...
    }
}
```

**해결 방법**:
HostBridgeServer의 서비스 인스턴스를 통해 실제 gRPC 메서드 호출

**구현 계획**:
1. HostBridgeServer에서 서비스 인스턴스 접근 가능하도록 public getter 추가
2. WebViewMessageRouter에서 실제 gRPC 메서드 호출
3. Protobuf 메시지 ↔ JSON 변환

**주요 서비스**:
- WorkspaceService: 7 RPCs
- EnvService: 7 RPCs
- WindowService, DiffService, TestingService: 일부만 구현

### 3. 빌드 및 기본 테스트 (15-30분)
**빌드 명령어**:
```bash
# 1. WebView UI 빌드 (Caret React UI)
npm run build:webview

# 2. IntelliJ 플러그인 빌드
cd caret-intellij-plugin
./gradlew build

# 3. 플러그인 실행 (IntelliJ에서 테스트)
./gradlew runIde
```

**검증 항목**:
- [ ] 컴파일 에러 없음
- [ ] Proto 생성 파일 문제 없음
- [ ] Gradle 빌드 성공
- [ ] Plugin JAR 생성됨

### 4. E2E 기능 검증 (사용자 수동 테스트)
**IntelliJ IDEA에서 테스트**:
1. `./gradlew runIde` 실행
2. 새 IntelliJ 인스턴스 시작
3. Caret Tool Window 열기
4. 다음 항목 확인:
   - [ ] Tool Window가 올바르게 표시됨
   - [ ] JCEF 브라우저가 로드됨
   - [ ] React UI가 표시됨 (또는 빌드 필요 메시지)
   - [ ] JavaScript 콘솔 에러 없음
   - [ ] HostBridge gRPC 서버가 시작됨 (로그 확인)

## 구현 상세

### A. Gson 의존성 추가
```kotlin
// build.gradle.kts
dependencies {
    // ... 기존 의존성
    
    // JSON serialization
    implementation("com.google.code.gson:gson:2.10.1")
}
```

### B. CaretWebView JSON 직렬화
```kotlin
import com.google.gson.Gson

class CaretWebView(private val project: Project) : Disposable {
    private val gson = Gson()
    
    fun sendMessageToWebView(message: Any) {
        val messageJson = when (message) {
            is String -> message
            else -> gson.toJson(message)
        }
        
        val jsCode = "window.__dispatchMessageFromKotlin($messageJson)"
        browser.cefBrowser.executeJavaScript(jsCode, browser.cefBrowser.url, 0)
    }
}
```

### C. WebViewMessageRouter gRPC 연결
```kotlin
class WebViewMessageRouter(
    private val hostBridgeServer: HostBridgeServer,
    private val sendMessageToWebView: (Any) -> Unit
) {
    private val gson = Gson()
    
    private suspend fun routeWorkspaceService(method: String, data: JSONObject): Any {
        return when (method) {
            "getWorkspacePaths" -> {
                val request = GetWorkspacePathsRequest.newBuilder().build()
                val response = hostBridgeServer.workspaceService.getWorkspacePaths(request)
                mapOf("workspacePath" to response.workspacePath)
            }
            "saveOpenDocumentIfDirty" -> {
                val path = data.optString("path")
                val request = SaveOpenDocumentIfDirtyRequest.newBuilder()
                    .setPath(path)
                    .build()
                val response = hostBridgeServer.workspaceService.saveOpenDocumentIfDirty(request)
                mapOf("saved" to response.saved)
            }
            // ... 나머지 메서드
            else -> throw IllegalArgumentException("Unknown WorkspaceService method: $method")
        }
    }
    
    // EnvService, WindowService 등도 동일하게 구현
}
```

### D. HostBridgeServer 서비스 접근 개선
```kotlin
// HostBridgeServer.kt
class HostBridgeServer(private val project: Project) {
    // Public getter for services
    val workspaceService: WorkspaceServiceImpl
        get() = _workspaceService
    
    val envService: EnvServiceImpl
        get() = _envService
    
    private lateinit var _workspaceService: WorkspaceServiceImpl
    private lateinit var _envService: EnvServiceImpl
    
    suspend fun start() {
        _workspaceService = WorkspaceServiceImpl(project)
        _envService = EnvServiceImpl(project)
        
        val server = ServerBuilder.forPort(port)
            .addService(_workspaceService)
            .addService(_envService)
            .build()
        
        server.start()
    }
}
```

## 예상 이슈 및 해결방안

### 이슈 1: Gradle Wrapper가 없음
**증상**: `./gradlew` 명령 실패
**해결**: IntelliJ IDEA에서 프로젝트 열면 자동으로 Gradle wrapper 생성됨

### 이슈 2: WebView UI 빌드 필요
**증상**: JCEF 브라우저에 "Caret UI not found" 메시지
**해결**: 
```bash
cd /Users/luke/dev/caret
npm run build:webview
```

### 이슈 3: Proto 생성 파일 없음
**증상**: 컴파일 에러 (proto generated files not found)
**해결**: 
```bash
cd caret-intellij-plugin
./gradlew generateProto
```

### 이슈 4: gRPC 서비스 suspend 함수 호출
**증상**: `WorkspaceServiceImpl` 메서드가 suspend function
**해결**: `WebViewMessageRouter.routeMessage()`도 이미 suspend function이므로 직접 호출 가능

## 성공 기준

### 최소 성공 기준 (Must Have)
- [ ] 컴파일 에러 없이 빌드 성공
- [ ] IntelliJ에서 플러그인 실행 가능
- [ ] Caret Tool Window가 표시됨
- [ ] JCEF 브라우저가 로드됨

### 이상적 성공 기준 (Should Have)
- [ ] React UI가 정상적으로 표시됨
- [ ] JavaScript ↔ Kotlin 통신 작동
- [ ] HostBridge gRPC 서버 정상 시작
- [ ] 최소 1개 이상의 gRPC 메서드 호출 성공

### 선택적 성공 기준 (Nice to Have)
- [ ] 전체 5개 서비스의 모든 RPC 구현
- [ ] 에러 처리 완벽하게 작동
- [ ] 성능 최적화 완료

## 다음 단계 (Phase 5 - 향후)

Phase 4 완료 후 추가로 필요한 작업:
1. 나머지 gRPC 서비스 구현 (WindowService, DiffService, TestingService)
2. 에러 핸들링 강화
3. 성능 최적화 (메모리, 통신 속도)
4. 사용자 경험 개선
5. 단위 테스트 작성
6. 문서화 (README, 사용 가이드)

## 타임라인

- **Start**: 2025-10-18 00:55
- **Est. End**: 2025-10-18 02:00-02:30
- **Actual End**: TBD

---

**Note**: Phase 4는 실제 빌드 및 테스트를 포함하므로 예상보다 시간이 더 걸릴 수 있습니다. 특히 IntelliJ IDEA에서 프로젝트를 열고 Gradle 설정을 완료하는 과정이 시간이 걸릴 수 있습니다.
