# IntelliJ Plugin Phase 5: gRPC Connection Implementation

**작성일**: 2025-10-18  
**작성자**: Alpha  
**Phase**: 5/5 - gRPC 실제 연결 구현 및 E2E 검증

## 1. Phase 5 목표

Phase 4까지 완성된 아키텍처를 기반으로 실제 동작하는 시스템 완성:
1. **TODO 주석 제거**: WebViewMessageRouter의 모든 TODO를 실제 gRPC 호출로 대체
2. **E2E 통합 테스트**: 전체 시스템 통합 검증
3. **성능 최적화**: 메시지 처리 성능 개선
4. **배포 준비**: 플러그인 패키징 및 배포 스크립트

## 2. 현재 상태 분석

### Phase 1-4 완료 사항
- ✅ **Phase 1**: 프로젝트 구조 생성 (Commit: 92792779c)
- ✅ **Phase 2**: gRPC 서비스 구현 (Commits: 00cdbe123, b000a4c6a)
  - WorkspaceServiceImpl.kt (7 RPCs)
  - EnvServiceImpl.kt (7 RPCs)
  - HostBridgeServer.kt (서비스 등록 완료)
- ✅ **Phase 3**: JCEF Webview 통합 (Commit: b0dbda581)
  - CaretToolWindowFactory.kt
  - CaretWebView.kt (JCEF + JS↔Kotlin bridge)
  - WebViewMessageRouter.kt (메시지 라우팅 골격)
- ✅ **Phase 4**: JSON 직렬화 개선 (Commit: aedb5b327)
  - Gson 도입 (2.10.1)
  - JSONObject → JsonObject 전환
  - HostBridgeServer 서비스 접근성 개선

### 현재 TODO 상태

**WebViewMessageRouter.kt**의 모든 route 메서드가 TODO 상태:
```kotlin
private suspend fun routeWorkspaceService(method: String, data: JsonObject): Any {
    return when (method) {
        "getWorkspacePaths" -> {
            // TODO: Implement actual gRPC call
            mapOf("workspacePath" to "/path/to/workspace")
        }
        "saveOpenDocumentIfDirty" -> {
            val path = data.get("path")?.asString ?: ""
            // TODO: Implement actual gRPC call
            mapOf("saved" to true)
        }
        // ... 모든 메서드가 TODO
    }
}
```

**총 36개 RPC 메서드가 TODO 상태**:
- WorkspaceService: 7개
- EnvService: 7개
- WindowService: 13개 (미구현)
- DiffService: 7개 (미구현)
- TestingService: 5개 (미구현)

## 3. Phase 5 상세 계획

### 3.1 gRPC 클라이언트 스텁 생성 (예상: 30분)

**작업 내용**:
1. **proto 파일 복사**: Caret 프로젝트의 proto/host/*.proto 파일들을 IntelliJ 플러그인으로 복사
2. **Gradle 설정**: build.gradle.kts에 protobuf 플러그인 추가
3. **코드 생성**: gRPC Kotlin 클라이언트 스텁 생성

**필요한 proto 파일들**:
```
proto/host/
├── workspace.proto (WorkspaceService)
├── env.proto (EnvService)
├── window.proto (WindowService)
├── diff.proto (DiffService)
└── testing.proto (TestingService)
```

**build.gradle.kts 추가 설정**:
```kotlin
plugins {
    id("com.google.protobuf") version "0.9.4"
}

dependencies {
    implementation("io.grpc:grpc-kotlin-stub:1.4.0")
    implementation("io.grpc:grpc-protobuf:1.59.0")
    implementation("com.google.protobuf:protobuf-kotlin:3.24.4")
}

protobuf {
    protoc {
        artifact = "com.google.protobuf:protoc:3.24.4"
    }
    plugins {
        id("grpc") {
            artifact = "io.grpc:protoc-gen-grpc-java:1.59.0"
        }
        id("grpckt") {
            artifact = "io.grpc:protoc-gen-grpc-kotlin:1.4.0:jdk8@jar"
        }
    }
    generateProtoTasks {
        all().forEach {
            it.plugins {
                id("grpc")
                id("grpckt")
            }
        }
    }
}
```

### 3.2 WorkspaceService 실제 구현 (예상: 45분)

**우선순위 높은 7개 RPC 구현**:

```kotlin
class WorkspaceServiceImpl(private val project: Project) : 
    WorkspaceServiceGrpcKt.WorkspaceServiceCoroutineImplBase() {
    
    override suspend fun getWorkspacePaths(request: Empty): WorkspacePathsResponse {
        val workspacePath = project.basePath ?: ""
        return WorkspacePathsResponse.newBuilder()
            .setWorkspacePath(workspacePath)
            .build()
    }
    
    override suspend fun saveOpenDocumentIfDirty(request: SaveDocumentRequest): BoolResponse {
        return withContext(Dispatchers.IO) {
            val fileDocumentManager = FileDocumentManager.getInstance()
            val virtualFile = LocalFileSystem.getInstance().findFileByPath(request.path)
            
            if (virtualFile != null) {
                val document = fileDocumentManager.getDocument(virtualFile)
                if (document != null && fileDocumentManager.isDocumentUnsaved(document)) {
                    fileDocumentManager.saveDocument(document)
                    BoolResponse.newBuilder().setValue(true).build()
                } else {
                    BoolResponse.newBuilder().setValue(false).build()
                }
            } else {
                BoolResponse.newBuilder().setValue(false).build()
            }
        }
    }
    
    override suspend fun readFile(request: PathRequest): FileContentResponse {
        return withContext(Dispatchers.IO) {
            val virtualFile = LocalFileSystem.getInstance().findFileByPath(request.path)
            if (virtualFile != null) {
                val content = VfsUtil.loadText(virtualFile)
                FileContentResponse.newBuilder().setContent(content).build()
            } else {
                throw StatusException(Status.NOT_FOUND.withDescription("File not found: ${request.path}"))
            }
        }
    }
    
    override suspend fun writeFile(request: WriteFileRequest): Empty {
        return withContext(Dispatchers.IO) {
            WriteCommandAction.runWriteCommandAction(project) {
                val virtualFile = LocalFileSystem.getInstance().findFileByPath(request.path)
                    ?: LocalFileSystem.getInstance().refreshAndFindFileByPath(request.path)
                    ?: throw StatusException(Status.NOT_FOUND.withDescription("File not found: ${request.path}"))
                
                VfsUtil.saveText(virtualFile, request.content)
            }
            Empty.getDefaultInstance()
        }
    }
    
    // ... 나머지 3개 RPC 구현
}
```

### 3.3 WebViewMessageRouter gRPC 연결 (예상: 1시간)

**TODO 제거 및 실제 gRPC 호출로 대체**:

```kotlin
class WebViewMessageRouter(
    private val project: Project,
    private val webView: CaretWebView,
    private val hostBridgeServer: HostBridgeServer
) {
    private val gson = Gson()
    
    // Phase 5: gRPC 클라이언트 채널 생성
    private val channel = ManagedChannelBuilder
        .forAddress("localhost", hostBridgeServer.getPort())
        .usePlaintext()
        .build()
    
    // Phase 5: 각 서비스별 스텁 생성
    private val workspaceStub = WorkspaceServiceGrpcKt.WorkspaceServiceCoroutineStub(channel)
    private val envStub = EnvServiceGrpcKt.EnvServiceCoroutineStub(channel)
    
    private suspend fun routeWorkspaceService(method: String, data: JsonObject): Any {
        return when (method) {
            "getWorkspacePaths" -> {
                // Phase 5: 실제 gRPC 호출
                val response = workspaceStub.getWorkspacePaths(Empty.getDefaultInstance())
                mapOf("workspacePath" to response.workspacePath)
            }
            "saveOpenDocumentIfDirty" -> {
                val path = data.get("path")?.asString ?: ""
                // Phase 5: 실제 gRPC 호출
                val request = SaveDocumentRequest.newBuilder().setPath(path).build()
                val response = workspaceStub.saveOpenDocumentIfDirty(request)
                mapOf("saved" to response.value)
            }
            "readFile" -> {
                val path = data.get("path")?.asString ?: ""
                // Phase 5: 실제 gRPC 호출
                val request = PathRequest.newBuilder().setPath(path).build()
                val response = workspaceStub.readFile(request)
                mapOf("content" to response.content)
            }
            // ... 나머지 메서드들
        }
    }
    
    // Phase 5: 리소스 정리
    fun dispose() {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS)
    }
}
```

### 3.4 EnvService 실제 구현 (예상: 30분)

**7개 RPC 구현** (WorkspaceService와 유사한 패턴):
```kotlin
class EnvServiceImpl(private val project: Project) : 
    EnvServiceGrpcKt.EnvServiceCoroutineImplBase() {
    
    override suspend fun getCwd(request: Empty): StringResponse {
        val cwd = project.basePath ?: System.getProperty("user.dir")
        return StringResponse.newBuilder().setValue(cwd).build()
    }
    
    override suspend fun getHomeDir(request: Empty): StringResponse {
        val homeDir = System.getProperty("user.home")
        return StringResponse.newBuilder().setValue(homeDir).build()
    }
    
    // ... 나머지 5개 RPC 구현
}
```

### 3.5 WindowService/DiffService/TestingService 구현 (예상: 2시간)

**우선순위**:
1. **WindowService** (13 RPCs): UI 상호작용 관련 - 높음
2. **DiffService** (7 RPCs): Diff 뷰 관련 - 중간
3. **TestingService** (5 RPCs): 테스팅 기능 - 낮음 (Phase 6로 연기 가능)

**WindowService 핵심 구현**:
```kotlin
class WindowServiceImpl(private val project: Project) :
    WindowServiceGrpcKt.WindowServiceCoroutineImplBase() {
    
    override suspend fun showInformationMessage(request: MessageRequest): Empty {
        ApplicationManager.getApplication().invokeLater {
            Messages.showInfoMessage(project, request.message, request.title)
        }
        return Empty.getDefaultInstance()
    }
    
    override suspend fun showWarningMessage(request: MessageRequest): Empty {
        ApplicationManager.getApplication().invokeLater {
            Messages.showWarningDialog(project, request.message, request.title)
        }
        return Empty.getDefaultInstance()
    }
    
    override suspend fun showErrorMessage(request: MessageRequest): Empty {
        ApplicationManager.getApplication().invokeLater {
            Messages.showErrorDialog(project, request.message, request.title)
        }
        return Empty.getDefaultInstance()
    }
    
    // ... 나머지 10개 RPC 구현
}
```

### 3.6 E2E 통합 테스트 (예상: 1시간)

**테스트 시나리오**:
1. **플러그인 로드 테스트**: IntelliJ에서 플러그인 로드 확인
2. **gRPC 서버 시작 테스트**: HostBridge 서버 정상 시작 확인
3. **Webview 로드 테스트**: JCEF 브라우저에서 React UI 로드 확인
4. **메시지 통신 테스트**: JavaScript → Kotlin → gRPC → Kotlin → JavaScript 전체 흐름
5. **파일 읽기/쓰기 테스트**: 실제 파일 시스템 작업 확인
6. **에러 핸들링 테스트**: gRPC 오류 상황 처리 확인

**테스트 코드 예시**:
```kotlin
class CaretPluginE2ETest : BasePlatformTestCase() {
    
    @Test
    fun `test gRPC server starts successfully`() {
        val server = HostBridgeServer(project)
        val port = server.start()
        
        assertTrue("Server port should be positive", port > 0)
        
        // gRPC 연결 테스트
        val channel = ManagedChannelBuilder
            .forAddress("localhost", port)
            .usePlaintext()
            .build()
        
        val stub = WorkspaceServiceGrpcKt.WorkspaceServiceCoroutineStub(channel)
        
        runBlocking {
            val response = stub.getWorkspacePaths(Empty.getDefaultInstance())
            assertNotNull(response.workspacePath)
        }
        
        channel.shutdown()
        server.stop()
    }
    
    @Test
    fun `test webview message routing`() = runBlocking {
        val webView = CaretWebView(project)
        val server = HostBridgeServer(project)
        server.start()
        
        val router = WebViewMessageRouter(project, webView, server)
        
        val message = """
        {
            "type": "hostbridge/workspace/getWorkspacePaths",
            "requestId": "test-123",
            "data": {}
        }
        """.trimIndent()
        
        router.routeMessage(message)
        
        // 응답 확인 로직
        delay(1000)
        
        router.dispose()
        server.stop()
    }
}
```

### 3.7 성능 최적화 (예상: 30분)

**최적화 포인트**:
1. **gRPC 채널 재사용**: 매 요청마다 채널 생성하지 않고 단일 채널 재사용
2. **비동기 처리 최적화**: Kotlin Coroutines Dispatcher 설정
3. **메시지 직렬화 캐싱**: Gson 인스턴스 재사용
4. **파일 시스템 캐싱**: VirtualFile 캐싱 전략

```kotlin
class WebViewMessageRouter(...) {
    // Phase 5: 채널 재사용
    private val channel by lazy {
        ManagedChannelBuilder
            .forAddress("localhost", hostBridgeServer.getPort())
            .usePlaintext()
            .executor(Dispatchers.IO.asExecutor())
            .build()
    }
    
    // Phase 5: 스텁 lazy 초기화
    private val workspaceStub by lazy { 
        WorkspaceServiceGrpcKt.WorkspaceServiceCoroutineStub(channel)
    }
}
```

### 3.8 배포 준비 (예상: 30분)

**작업 내용**:
1. **plugin.xml 최종 검토**: 버전, 설명, 의존성 확인
2. **Gradle 빌드 스크립트**: `./gradlew buildPlugin` 명령 검증
3. **패키징 테스트**: .zip 파일 생성 및 설치 테스트
4. **문서 업데이트**: README.md에 빌드/설치 가이드 추가

**Gradle 빌드 설정**:
```kotlin
intellij {
    version.set("2023.3")
    type.set("IC") // IntelliJ IDEA Community Edition
    plugins.set(listOf("com.intellij.java"))
}

tasks {
    buildPlugin {
        archiveBaseName.set("caret-intellij-plugin")
        archiveVersion.set(project.version.toString())
    }
    
    publishPlugin {
        token.set(System.getenv("JETBRAINS_MARKETPLACE_TOKEN"))
    }
}
```

## 4. 예상 소요 시간

### 단계별 예상 시간
1. gRPC 클라이언트 스텁 생성: **30분**
2. WorkspaceService 실제 구현: **45분**
3. WebViewMessageRouter gRPC 연결: **1시간**
4. EnvService 실제 구현: **30분**
5. WindowService/DiffService 구현: **2시간**
6. E2E 통합 테스트: **1시간**
7. 성능 최적화: **30분**
8. 배포 준비: **30분**

**총 예상 시간**: **6.5시간** (실제 작업 시간)

### 시간 분배 전략
- **Phase 5.1**: gRPC 설정 + WorkspaceService (1.5시간)
- **Phase 5.2**: EnvService + WebViewMessageRouter (1.5시간)
- **Phase 5.3**: WindowService + DiffService (2시간)
- **Phase 5.4**: 테스트 + 최적화 + 배포 (1.5시간)

## 5. 위험 요소 및 대응 방안

### 5.1 Protobuf 버전 호환성 문제
**위험**: Caret 프로젝트와 IntelliJ 플러그인의 protobuf 버전 불일치
**대응**: 
- Caret 프로젝트와 동일한 protobuf 버전 사용 (3.24.4)
- proto 파일을 그대로 복사하여 100% 일치 보장

### 5.2 gRPC 채널 연결 실패
**위험**: HostBridge 서버 시작 전 클라이언트 연결 시도
**대응**:
- 서버 시작 완료 확인 후 채널 생성
- 재시도 로직 구현 (최대 3회, 지수 백오프)

### 5.3 IntelliJ API 사용 오류
**위험**: IntelliJ Platform API 사용법 오류로 인한 런타임 에러
**대응**:
- WriteCommandAction, ReadAction 등 필수 래퍼 사용
- ApplicationManager.getApplication().invokeLater() 활용
- IntelliJ IDEA Platform SDK 공식 문서 참조

### 5.4 E2E 테스트 환경 구성 어려움
**위험**: IntelliJ 플러그인 테스트 환경 설정 복잡도
**대응**:
- BasePlatformTestCase 활용
- 수동 테스트로 대체 (자동화는 Phase 6로 연기)

## 6. 완료 기준

### Phase 5 완료 체크리스트
- [ ] proto 파일 복사 완료
- [ ] protobuf Gradle 플러그인 설정 완료
- [ ] gRPC 클라이언트 스텁 생성 완료
- [ ] WorkspaceServiceImpl 7개 RPC 실제 구현 완료
- [ ] EnvServiceImpl 7개 RPC 실제 구현 완료
- [ ] WindowServiceImpl 생성 및 최소 3개 RPC 구현 완료
- [ ] WebViewMessageRouter TODO 제거 및 실제 gRPC 호출 완료
- [ ] gRPC 채널 재사용 최적화 완료
- [ ] E2E 통합 테스트 최소 3개 시나리오 통과
- [ ] buildPlugin 태스크 실행 성공
- [ ] IntelliJ IDEA에서 플러그인 로드 및 동작 확인
- [ ] Phase 5 완료 보고서 작성
- [ ] 커밋 및 푸시

## 7. Next Steps (Phase 6)

Phase 5 완료 후 추가 개선 사항 (선택적):
1. **TestingService 완전 구현**: 5개 RPC 구현
2. **DiffService 고도화**: 실제 Diff 뷰 통합
3. **자동화된 E2E 테스트**: Playwright/Selenium 통합
4. **성능 모니터링**: gRPC 호출 latency 측정
5. **에러 처리 고도화**: 상세한 에러 메시지 및 로깅
6. **브랜딩 시스템 통합**: caret-b2b 브랜딩 적용

## 8. 참고 자료

### IntelliJ Platform SDK
- [IntelliJ Platform Plugin SDK](https://plugins.jetbrains.com/docs/intellij/welcome.html)
- [WriteCommandAction](https://plugins.jetbrains.com/docs/intellij/general-threading-rules.html#write-access)
- [Virtual File System](https://plugins.jetbrains.com/docs/intellij/virtual-file-system.html)

### gRPC Kotlin
- [gRPC Kotlin Documentation](https://grpc.io/docs/languages/kotlin/)
- [Kotlin Coroutines with gRPC](https://grpc.github.io/grpc-kotlin/kotlinx-coroutines/)

### Protobuf Gradle Plugin
- [Protobuf Gradle Plugin](https://github.com/google/protobuf-gradle-plugin)

---

**Phase 5 시작 준비 완료!** 🚀
