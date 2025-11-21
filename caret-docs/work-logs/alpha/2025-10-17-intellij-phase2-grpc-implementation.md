# IntelliJ Plugin Phase 2: gRPC Implementation Plan
**Date**: 2025-10-17
**Author**: Alpha Yang
**Status**: In Progress

## Phase 2 Overview

Phase 1에서 기본 구조를 만들었으니, 이제 실제 gRPC 통신을 구현합니다.

### 목표
1. **Proto 분석**: Cline의 HostBridge proto 정의 분석
2. **Kotlin gRPC 서버 구현**: 5개 서비스 36개 RPC 구현
3. **빌드 검증**: Gradle 빌드 실제 테스트
4. **Webview 통합**: JCEF로 Caret UI 로드

### 예상 시간
- Proto 분석: 10분
- gRPC 서버 구현: 60-90분
- 빌드 테스트: 20분
- Webview 통합: 30분
**Total**: 약 2-2.5시간

## Step 1: Proto 분석

### HostBridge 서비스 구조
Cline의 `proto/host/` 디렉토리에 정의된 gRPC 서비스들:

1. **WorkspaceService** (proto/host/workspace.proto)
   - `readFile(FileRequest) returns (FileResponse)`
   - `writeFile(WriteFileRequest) returns (Empty)`
   - `listFiles(ListFilesRequest) returns (ListFilesResponse)`
   - `searchFiles(SearchFilesRequest) returns (SearchFilesResponse)`
   - `getDefinitionNames(GetDefinitionNamesRequest) returns (GetDefinitionNamesResponse)`

2. **EnvService** (proto/host/env.proto)
   - `getEnvVars() returns (EnvVarsResponse)`
   - `getCwd() returns (CwdResponse)`
   - `getHomeDir() returns (HomeDirResponse)`
   - `getTmpDir() returns (TmpDirResponse)`
   - `getOsInfo() returns (OsInfoResponse)`
   - `getShell() returns (ShellResponse)`

3. **WindowService** (proto/host/window.proto)
   - `showMessage(ShowMessageRequest) returns (Empty)`
   - `showInputBox(ShowInputBoxRequest) returns (ShowInputBoxResponse)`
   - `showQuickPick(ShowQuickPickRequest) returns (ShowQuickPickResponse)`
   - `showOpenDialog(ShowOpenDialogRequest) returns (ShowOpenDialogResponse)`
   - `showSaveDialog(ShowSaveDialogRequest) returns (ShowSaveDialogResponse)`
   - ... (총 13개 RPC)

4. **DiffService** (proto/host/diff.proto)
   - `showDiff(ShowDiffRequest) returns (Empty)`
   - `applyDiff(ApplyDiffRequest) returns (Empty)`
   - `revertDiff(RevertDiffRequest) returns (Empty)`
   - ... (총 7개 RPC)

5. **TestingService** (proto/host/testing.proto)
   - `runTest(RunTestRequest) returns (RunTestResponse)`
   - `debugTest(DebugTestRequest) returns (DebugTestResponse)`
   - `discoverTests(DiscoverTestsRequest) returns (DiscoverTestsResponse)`
   - ... (총 5개 RPC)

### Proto 컴파일 전략

**Option 1**: Gradle에서 protobuf-gradle-plugin 사용
```kotlin
plugins {
    id("com.google.protobuf") version "0.9.4"
}

protobuf {
    protoc {
        artifact = "com.google.protobuf:protoc:3.24.0"
    }
    plugins {
        grpc {
            artifact = "io.grpc:protoc-gen-grpc-java:1.58.0"
        }
        grpckt {
            artifact = "io.grpc:protoc-gen-grpc-kotlin:1.4.0:jdk8@jar"
        }
    }
    generateProtoTasks {
        all().forEach { task ->
            task.plugins {
                grpc {}
                grpckt {}
            }
        }
    }
}
```

**Option 2**: Caret의 npm run protos 활용
- 이미 TypeScript 코드가 생성되어 있음
- Kotlin용으로도 별도 생성 가능
- proto 파일은 변경하지 않고 재사용

## Step 2: Kotlin gRPC 서버 구현

### 구현 우선순위
1. **WorkspaceService** (최우선) - 파일 읽기/쓰기 필수
2. **EnvService** (중요) - 환경 변수 필수
3. **WindowService** (나중) - UI 인터랙션
4. **DiffService** (나중) - 파일 비교
5. **TestingService** (선택) - 테스트 실행

### WorkspaceService 구현 예시
```kotlin
class WorkspaceServiceImpl(
    private val project: Project
) : WorkspaceServiceGrpcKt.WorkspaceServiceCoroutineImplBase() {
    
    override suspend fun readFile(request: FileRequest): FileResponse {
        val virtualFile = findVirtualFile(request.path)
            ?: throw StatusException(Status.NOT_FOUND)
        
        val content = ApplicationManager.getApplication().runReadAction<String> {
            String(virtualFile.contentsToByteArray())
        }
        
        return FileResponse.newBuilder()
            .setContent(content)
            .setPath(virtualFile.path)
            .build()
    }
    
    override suspend fun writeFile(request: WriteFileRequest): Empty {
        ApplicationManager.getApplication().invokeLater {
            WriteCommandAction.runWriteCommandAction(project) {
                val virtualFile = findOrCreateVirtualFile(request.path)
                virtualFile.setBinaryContent(request.content.toByteArray())
            }
        }
        return Empty.getDefaultInstance()
    }
    
    override suspend fun listFiles(request: ListFilesRequest): ListFilesResponse {
        val directory = findVirtualFile(request.path)
            ?: throw StatusException(Status.NOT_FOUND)
        
        val files = directory.children.map { file ->
            FileInfo.newBuilder()
                .setName(file.name)
                .setPath(file.path)
                .setIsDirectory(file.isDirectory)
                .build()
        }
        
        return ListFilesResponse.newBuilder()
            .addAllFiles(files)
            .build()
    }
    
    // ... 나머지 RPC 구현
    
    private fun findVirtualFile(path: String): VirtualFile? {
        return LocalFileSystem.getInstance().findFileByPath(path)
    }
}
```

### EnvService 구현 예시
```kotlin
class EnvServiceImpl : EnvServiceGrpcKt.EnvServiceCoroutineImplBase() {
    
    override suspend fun getEnvVars(): EnvVarsResponse {
        val envVars = System.getenv()
        return EnvVarsResponse.newBuilder()
            .putAllVars(envVars)
            .build()
    }
    
    override suspend fun getCwd(): CwdResponse {
        val cwd = System.getProperty("user.dir")
        return CwdResponse.newBuilder()
            .setPath(cwd)
            .build()
    }
    
    override suspend fun getHomeDir(): HomeDirResponse {
        val home = System.getProperty("user.home")
        return HomeDirResponse.newBuilder()
            .setPath(home)
            .build()
    }
    
    override suspend fun getOsInfo(): OsInfoResponse {
        return OsInfoResponse.newBuilder()
            .setName(SystemInfo.OS_NAME)
            .setVersion(SystemInfo.OS_VERSION)
            .setArch(SystemInfo.OS_ARCH)
            .build()
    }
    
    // ... 나머지 RPC 구현
}
```

## Step 3: gRPC 서버 통합

### HostBridgeServer 업데이트
기존 skeleton에 실제 서비스 구현 추가:

```kotlin
class HostBridgeServer(
    private val project: Project,
    private val port: Int = 0
) {
    private var server: Server? = null
    private var actualPort: Int = 0
    
    fun start(): Int {
        val workspaceService = WorkspaceServiceImpl(project)
        val envService = EnvServiceImpl()
        // ... 나머지 서비스 추가
        
        server = ServerBuilder.forPort(port)
            .addService(workspaceService)
            .addService(envService)
            .addService(windowService)
            .addService(diffService)
            .addService(testingService)
            .build()
            .start()
        
        actualPort = server!!.port
        Logger.info("[HostBridge] gRPC server started on port $actualPort")
        
        return actualPort
    }
    
    fun stop() {
        server?.shutdown()
        server?.awaitTermination(5, TimeUnit.SECONDS)
        Logger.info("[HostBridge] gRPC server stopped")
    }
}
```

## Step 4: 빌드 검증

### Gradle 의존성 추가
```kotlin
dependencies {
    // gRPC & Protobuf
    implementation("io.grpc:grpc-kotlin-stub:1.4.0")
    implementation("io.grpc:grpc-protobuf:1.58.0")
    implementation("io.grpc:grpc-netty:1.58.0")
    implementation("com.google.protobuf:protobuf-kotlin:3.24.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    
    // IntelliJ Platform
    implementation("com.intellij.platform:util")
    implementation("com.intellij.platform:core-api")
}
```

### 빌드 명령어
```bash
cd caret-intellij-plugin
./gradlew build
```

### 예상 결과
- ✅ Proto 파일 컴파일 성공
- ✅ Kotlin 코드 생성 성공
- ✅ gRPC 서비스 구현 컴파일 성공
- ✅ Plugin JAR 생성 성공

## Step 5: 다음 단계 (Phase 3)

Phase 2 완료 후:
1. **Webview 통합**: JCEF로 Caret React UI 로드
2. **메시지 브릿지**: JavaScript ↔ Kotlin 통신
3. **실제 테스트**: IntelliJ에서 플러그인 실행
4. **E2E 검증**: VSCode Caret과 동일한 기능 확인

## 성공 기준

- [ ] Proto 파일 정상 컴파일
- [ ] WorkspaceService 5개 RPC 구현 완료
- [ ] EnvService 6개 RPC 구현 완료
- [ ] HostBridgeServer 정상 시작/종료
- [ ] Gradle 빌드 성공
- [ ] Plugin JAR 생성 확인

## 예상 소요 시간
**Target**: 2-2.5시간
**실제 시간**: (작업 후 기록)

---
**Next**: Phase 3 - Webview Integration & E2E Testing
