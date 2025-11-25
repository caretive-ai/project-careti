# Phase D Blocked Analysis Report

**Date**: 2025-11-25
**Subject**: Analysis of D-2 Execution Failure and Missing Components

## 1. Critical Blocker: D-2 Execution Failure (Shutdown Loop)

**Symptom**:
`cline-core` starts but immediately receives a `/host.EnvService/shutdown` RPC call and exits. This prevents the instance from being registered, causing `caret auth` and `caret task new` to fail.

**Root Cause Analysis**:
The shutdown is triggered by the **CLI Host (Go process)** via the `CleanupStaleInstances` logic in `cli/pkg/cli/global/registry.go`.

1.  **Mechanism**:
    -   The Go CLI (`caret` or `caret-host`) runs `CleanupStaleInstances` (likely during startup or `EnsureInstance`).
    -   It calls `r.lockManager.ListInstancesWithHealthCheck(ctx)`.
    -   If an instance is found but its status is **NOT** `SERVING` (e.g., it's still initializing or the health check failed), the code proceeds to cleanup.
    -   **Cleanup Action**: It calls `r.tryShutdownHostProcess(instance.HostServiceAddress)`, which sends the `shutdown` RPC to `cline-core`.
    -   `cline-core` receives the RPC (or catches the resulting signal) and exits via `shutdownGracefully`.

2.  **Trigger**:
    -   There is likely a **Race Condition**. When `caret` launches `cline-core`, it might be checking for instances too early, or `cline-core` registers itself in SQLite (`registerInstance`) *before* it is fully ready to respond to health checks (`touchInstance` or gRPC server ready).
    -   If `registerInstance` happens at line 75 of `cline-core.ts`, but `touchInstance` (marking healthy) is at line 84, there is a window where the instance exists in DB but might fail a health check if the gRPC server isn't fully responsive or if the logic assumes "in DB = ready".

**Recommendation**:
-   **Relax Cleanup Logic**: Modify `cli/pkg/cli/global/registry.go` to be less aggressive. Do not shutdown instances immediately if they are "UNKNOWN" or "STARTING". Only shutdown if they are definitely "DEAD" or after a grace period.
-   **Delay Registration**: Ensure `cline-core` only registers itself in SQLite *after* the gRPC server is fully up and ready to serve health checks.

## 2. Missing D-2 Components (Caret Branding)

**Status**: Confirmed Missing.

**Analysis of `cli/pkg/cli/auth/providers_list.go`**:
-   The code currently reflects the **Original Cline** implementation.
-   **Provider Names**: Returns "Cline (Official)", "Anthropic", etc. No "Caret" branding.
-   **Provider Enums**: Uses `cline.ApiProvider_CLINE` but treats it as "Cline".
-   **Missing Features**:
    -   No logic to display "Caret" instead of "Cline".
    -   No `caret.team` domain integration.
    -   BYO Gemini is present (`cline.ApiProvider_GEMINI`), but needs verification if it's exposed correctly in the menu.

**Action Required**:
-   Modify `cli/pkg/cli/auth/providers_list.go` and related files to:
    -   Rename "Cline (Official)" to "Caret (Official)" (or add a separate Caret provider).
    -   Update `GetProviderDisplayName` to return "Caret".
    -   Ensure `caret.team` is used for authentication URLs.

## 3. Other D-2 Gaps

-   **`cli-caret` Structure**: The `cli-caret` directory is a wrapper/packaging layer. The actual Go source is in `cli/`. This structure is valid but requires `build-local.sh` to correctly map sources.
-   **Missing Files**: `webview-ui/src/components/common/CliInstallBanner.tsx` and `src/utils/cli-detector.ts` were noted as missing/incomplete in the master plan and need to be implemented/updated for Caret detection.

## Summary

The immediate blocker is the **aggressive shutdown logic in the Go CLI**. Once this is fixed (by allowing a grace period or relaxing health checks during startup), the core should stay alive. After that, the **missing branding and provider logic** in the Go code must be implemented to meet the Phase D requirements.
