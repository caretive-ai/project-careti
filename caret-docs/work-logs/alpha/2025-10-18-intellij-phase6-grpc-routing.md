# Phase 6 계획: WebViewMessageRouter gRPC 연결

**작성일**: 2025-10-18  
**단계**: Phase 6 - WebViewMessageRouter gRPC Connection  
**상태**: 🚧 진행 중

## 목표

WebViewMessageRouter의 TODO를 실제 gRPC 호출로 구현하여 WebView ↔ HostBridge 양방향 통신을 완성합니다.

## 현재 상태

**파일**: `caret-intellij-plugin/src/main/kotlin/com/caret/intellij/ui/WebViewMessageRouter.kt`

**구현 상태**:
- ✅ JSON 파싱 로직 (Gson)
- ✅ 메시지 라우팅 구조
- ❌ WorkspaceService TODO (5개 메서드)
- ❌ EnvService TODO (4개 메서드)
- ❌ WindowService TODO (미구현 서비스)
- ❌ DiffService TODO (미구현 서비스)
- ❌ TestingService TODO (미구현 서비스)

## 구현 계획

### Step 1: WorkspaceService gRPC 연결 (우선순위: 높음)

**대상 메서드**:
1. `getWorkspacePaths()` → `WorkspaceServiceImpl.getCurrentDirectory()`
2. `saveOpenDocumentIfDirty()` → IntelliJ FileDocumentManager API
3. `openClineSidebarPanel()` → IntelliJ ToolWindow API

**구현 방법**:
```kotlin
private suspend fun routeWorkspaceService(method: String, data: JsonObject): Any {
    return withContext(Dispatchers.IO) {
        when (method) {
            "getWorkspacePaths" -> {
                val request = bot.cline.proto.Empty.newBuilder().build()
                val response = hostBridgeServer.workspaceService.getCurrentDirectory(request)
                mapOf("workspacePath" to response.value)
            }
            // ... 추가 메서드
        }
    }
}
```

### Step 2: EnvService gRPC 연결 (우선순위: 높음)

**대상 메서드**:
1. `clipboardWriteText()` → IntelliJ CopyPasteManager API
2. `getHostVersion()` → 플러그인 버전 정보

**구현 방법**:
```kotlin
private suspend fun routeEnvService(method: String, data: JsonObject): Any {
    return withContext(Dispatchers.IO) {
        when (method) {
            "getHostVersion" -> {
                val request = bot.cline.proto.Empty.newBuilder().build()
                val osName = hostBridgeServer.envService.getOsName(request)
                mapOf(
                    "version" to "1.0.0",
                    "hostType" to "intellij",
                    "os" to osName.value
                )
            }
            // ... 추가 메서드
        }
    }
}
```

### Step 3: 에러 처리 강화 (우선순위: 중간)

**목표**: gRPC 호출 실패 시 적절한 에러 메시지 반환

**구현**:
- gRPC StatusException 캐치
- 사용자 친화적 에러 메시지 변환
- 로깅 추가

### Step 4: 테스트 작성 (우선순위: 중간)

**테스트 항목**:
1. JSON 파싱 테스트
2. 메시지 라우팅 테스트
3. gRPC 호출 테스트 (Mock)
4. 에러 처리 테스트

## Proto 타입 매핑

### WorkspaceService
```protobuf
rpc getCurrentDirectory(Empty) returns (String);
rpc getWorkspaceFolders(Empty) returns (WorkspaceFolders);
rpc getFileMetadata(StringRequest) returns (FileMetadata);
rpc searchFilesWithRegex(SearchFilesRequest) returns (FileSearchResults);
rpc showFileInEditor(StringRequest) returns (Empty);
```

### EnvService
```protobuf
rpc getHomePath(Empty) returns (String);
rpc getOsName(Empty) returns (String);
rpc getOsArch(Empty) returns (String);
rpc getPathSeparator(Empty) returns (String);
```

## 필요한 Import

```kotlin
import bot.cline.proto.Empty
import bot.cline.proto.String as ProtoString
import bot.cline.proto.StringRequest
import bot.cline.proto.SearchFilesRequest
import bot.cline.proto.FileMetadata
import bot.cline.proto.FileSearchResults
import bot.cline.proto.WorkspaceFolders
```

## 예상 작업 시간

- **Step 1**: WorkspaceService 구현 (1-1.5시간)
- **Step 2**: EnvService 구현 (0.5-1시간)
- **Step 3**: 에러 처리 (0.5시간)
- **Step 4**: 테스트 작성 (1시간)

**총 예상 시간**: 3-4시간

## 제약사항

1. **Kotlin UTF-8 이슈**: 한글 주석 사용 금지
2. **Type Alias**: `String` 타입 충돌 주의
3. **Coroutine Context**: IO Dispatcher 사용 필수
4. **IntelliJ API**: Platform 2024.1 호환성 확인

## 다음 단계 (Phase 7)

Phase 6 완료 후:
- WindowService 구현 (18 RPC)
- DiffService 구현 (7 RPC)
- TestingService 구현 (2 RPC)

**Phase 6 상태**: 🚧 진행 중
