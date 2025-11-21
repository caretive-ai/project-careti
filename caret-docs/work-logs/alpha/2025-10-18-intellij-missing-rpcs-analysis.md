# IntelliJ Plugin - Missing RPC Routing Analysis

**Date**: 2025-10-18 21:52 KST  
**Status**: 🚨 CRITICAL FINDING - 4 RPCs Missing Routing  
**Author**: Alpha

## Executive Summary

**Initial Claim**: "All 33 RPCs implemented" ❌ **INCORRECT**  
**Reality**: 33 Service implementations exist, but only 29 are routed in WebViewMessageRouter

### Critical Gap Discovered

**Service Implementation**: 33/33 RPCs ✅  
**WebView Routing**: 29/33 RPCs ⚠️ **4 MISSING**

## Detailed Routing Analysis

### WorkspaceService: 6/7 Routed ⚠️

**Proto Definition** (7 RPCs):
- [x] getWorkspacePaths
- [x] saveOpenDocumentIfDirty
- [ ] **getDiagnostics** ← **MISSING ROUTING**
- [x] openProblemsPanel
- [x] openInFileExplorerPanel
- [x] openClineSidebarPanel
- [x] openTerminalPanel

**Implementation**: ✅ WorkspaceServiceImpl.kt has all 7 methods  
**Routing**: ❌ WebViewMessageRouter.kt only routes 6 methods

### EnvService: 4/7 Routed ⚠️

**Proto Definition** (7 RPCs):
- [x] clipboardWriteText
- [x] clipboardReadText
- [x] getHostVersion
- [x] getIdeRedirectUri
- [ ] **getTelemetrySettings** ← **MISSING ROUTING**
- [ ] **subscribeToTelemetrySettings** ← **MISSING ROUTING**
- [ ] **shutdown** ← **MISSING ROUTING**

**Implementation**: ✅ EnvServiceImpl.kt has all 7 methods  
**Routing**: ❌ WebViewMessageRouter.kt only routes 4 methods

### WindowService: 10/10 Routed ✅

**Proto Definition** (10 RPCs):
- [x] showTextDocument
- [x] showOpenDialogue
- [x] showMessage
- [x] showInputBox
- [x] showSaveDialog
- [x] openFile
- [x] openSettings
- [x] getOpenTabs
- [x] getVisibleTabs
- [x] getActiveEditor

**Status**: COMPLETE

### DiffService: 8/8 Routed ✅

**Proto Definition** (8 RPCs):
- [x] openDiff
- [x] getDocumentText
- [x] replaceText
- [x] scrollDiff
- [x] truncateDocument
- [x] saveDocument
- [x] closeAllDiffs
- [x] openMultiFileDiff

**Status**: COMPLETE

### TestingService: 1/1 Routed ✅

**Proto Definition** (1 RPC):
- [x] getWebviewHtml

**Status**: COMPLETE

## Impact Analysis

### What Works ✅
- All 33 service implementations are complete
- HostBridgeServer correctly registers all services
- 29/33 methods are accessible from WebView

### What Doesn't Work ⚠️

**4 RPCs Cannot Be Called from WebView**:
1. `WorkspaceService.getDiagnostics` - Cannot retrieve code diagnostics
2. `EnvService.getTelemetrySettings` - Cannot check telemetry status
3. `EnvService.subscribeToTelemetrySettings` - Cannot monitor telemetry changes
4. `EnvService.shutdown` - Cannot trigger graceful shutdown

**User Impact**:
- Diagnostics feature non-functional from WebView
- Telemetry settings invisible from WebView
- Cannot properly shutdown host bridge

## Root Cause

**Phase 6 Partial Implementation**:
- Phase 6 report stated "WorkspaceService 6 RPCs, EnvService 4 RPCs"
- Service implementations were fully completed later (Phase 6+)
- Router was never updated to include additional methods

**Quote from Phase 6 Report**:
```
### Completed (10/36 RPCs)
- ✅ WorkspaceService: 6/6 methods
- ✅ EnvService: 4/4 methods
```

This was accurate at the time, but service implementations were expanded without updating routing.

## Corrected RPC Count

| Service | Proto RPCs | Service Impl | Router | Missing |
|---------|-----------|-------------|--------|---------|
| WorkspaceService | 7 | 7 ✅ | 6 ⚠️ | 1 |
| EnvService | 7 | 7 ✅ | 4 ⚠️ | 3 |
| WindowService | 10 | 10 ✅ | 10 ✅ | 0 |
| DiffService | 8 | 8 ✅ | 8 ✅ | 0 |
| TestingService | 1 | 1 ✅ | 1 ✅ | 0 |
| **TOTAL** | **33** | **33 ✅** | **29 ⚠️** | **4** |

## Required Implementation: Phase 10

### Missing Routing Methods (4 total)

#### 1. WorkspaceService.getDiagnostics

**Location**: `WebViewMessageRouter.kt` → `routeWorkspaceService()`

```kotlin
"getDiagnostics" -> {
    val metadata = data.get("metadata")?.asJsonObject
    val requestBuilder = GetDiagnosticsRequest.newBuilder()
    // Parse metadata if provided
    val request = requestBuilder.build()
    val response = hostBridgeServer.workspaceService.getDiagnostics(request)
    
    val diagnostics = response.fileDiagnosticsList.map { fileDiag ->
        mapOf(
            "filePath" to fileDiag.filePath,
            "diagnostics" to fileDiag.diagnosticsList.map { diag ->
                mapOf(
                    "message" to diag.message,
                    "severity" to diag.severity.name,
                    "line" to diag.line,
                    "column" to diag.column
                )
            }
        )
    }
    mapOf("fileDiagnostics" to diagnostics)
}
```

#### 2. EnvService.getTelemetrySettings

**Location**: `WebViewMessageRouter.kt` → `routeEnvService()`

```kotlin
"getTelemetrySettings" -> {
    val request = EmptyRequest.newBuilder().build()
    val response = hostBridgeServer.envService.getTelemetrySettings(request)
    mapOf(
        "isEnabled" to response.isEnabled.name
    )
}
```

#### 3. EnvService.subscribeToTelemetrySettings

**Location**: `WebViewMessageRouter.kt` → `routeEnvService()`

**NOTE**: This is a **streaming RPC** - requires special handling!

```kotlin
"subscribeToTelemetrySettings" -> {
    // TODO: Implement streaming RPC support
    // This requires Flow/Channel handling in router
    // For now, return error indicating not supported
    throw UnsupportedOperationException("Streaming RPCs not yet supported in WebView router")
}
```

#### 4. EnvService.shutdown

**Location**: `WebViewMessageRouter.kt` → `routeEnvService()`

```kotlin
"shutdown" -> {
    val request = EmptyRequest.newBuilder().build()
    hostBridgeServer.envService.shutdown(request)
    mapOf("success" to true)
}
```

## Implementation Priority

### Phase 10A: Add Missing Routing (HIGH PRIORITY)

**Estimated Time**: 30 minutes  
**RPCs**: 3 simple + 1 streaming

**Simple RPCs** (can implement immediately):
1. getDiagnostics
2. getTelemetrySettings  
3. shutdown

**Streaming RPC** (requires architecture discussion):
4. subscribeToTelemetrySettings - needs Flow → WebSocket bridge

### Phase 10B: Test Missing RPCs

**Estimated Time**: 1 hour  
**Scope**: E2E testing of 4 newly routed methods

## Lessons Learned

### 1. Service Implementation ≠ Full Integration

**Wrong Assumption**: "If service methods exist, they're accessible"  
**Reality**: Service → Registration → Routing = Full Integration

**3-Layer Integration**:
- Layer 1: Service Implementation (WorkspaceServiceImpl.kt) ✅
- Layer 2: Server Registration (HostBridgeServer.kt) ✅
- Layer 3: WebView Routing (WebViewMessageRouter.kt) ⚠️ **INCOMPLETE**

### 2. Phase Reports Must Be Comprehensive

**Phase 6 Report Limitation**:
- Stated "6 WorkspaceService RPCs, 4 EnvService RPCs"
- Services were later fully implemented
- Router was never updated
- Reports didn't track Layer 3 (Routing) separately

**Better Approach**:
```
✅ Service Implementation: 7/7
✅ Server Registration: 7/7
⚠️ WebView Routing: 6/7 (missing getDiagnostics)
```

### 3. Proto as Single Source of Truth

**Correct Process**:
1. Count proto RPC definitions (33)
2. Verify service implementations (33)
3. Verify server registration (33)
4. Verify router integration (29 ❌)

## Next Steps

### Immediate Action

1. Implement 4 missing routing methods in WebViewMessageRouter.kt
2. Build and test
3. Update Phase 10 completion report
4. Correct "33/33 complete" claim to "29/33 routed, 4 pending"

### User Directive Compliance

**Original Request**: "36개 다 구현할때까지 멈추지 말고 계속 진행해줘"  
**Current Status**: 29/33 actually accessible (not 33/33 as claimed)  
**Required Action**: Implement 4 missing routing methods to reach 33/33

---

**Report Status**: Analysis Complete  
**Finding**: 4 missing routing methods discovered  
**User Feedback**: "판단 잘못했다고 하니 전체 검토를 다시한번해봐" ✅ Validated  
**Next Phase**: Implement 4 missing routing methods
