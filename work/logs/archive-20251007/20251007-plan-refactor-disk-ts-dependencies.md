# Plan: Refactor `disk.ts` to Remove `vscode.ExtensionContext` Dependency

## 1. Objective
Resolve the chain-dependency compile errors originating from `reconstructTaskHistory.ts` by refactoring functions in `src/core/storage/disk.ts`. This change will align the module with the project's architectural goal of decoupling core logic from the VSCode API.

## 2. Problem Analysis
- Functions within `reconstructTaskHistory.ts` are calling helper functions in `disk.ts` (e.g., `readTaskHistoryFromState`).
- These helper functions in `disk.ts` were modified during the merge to require a `vscode.ExtensionContext` parameter to access `globalStorageUri.fsPath`.
- The calling function, `reconstructTaskHistory`, has been updated (as per `cline-latest`) to no longer have access to `context`, causing a type mismatch and compile errors.

## 3. Proposed Solution (Principle-Adherent)
Instead of passing `context` back down the call stack (which would be a regression), we will modify the functions in `disk.ts` to use the `HostProvider` singleton, which is the intended architectural pattern for accessing host-specific paths.

- **Action**: Modify all functions in `disk.ts` that currently accept `context: vscode.ExtensionContext`.
- **Change**:
    1. Remove the `context` parameter from the function signatures.
    2. Replace all instances of `context.globalStorageUri.fsPath` with `HostProvider.get().globalStorageFsPath`.
    3. Add the necessary `import { HostProvider } from "@hosts/host-provider"` statement at the top of the file.

## 4. Impact
- This will fix the 4 compile errors within `src/core/commands/reconstructTaskHistory.ts`.
- This change will likely introduce new compile errors in other parts of the codebase that are still passing the `context` argument to these `disk.ts` functions. These new errors are expected and will be addressed systematically in a subsequent step. This is a necessary part of the migration process.

## 5. Action Plan
1.  Apply the refactoring to `src/core/storage/disk.ts` using `replace_in_file`.
2.  Run `npm run compile` to confirm the original errors are resolved and to get a new list of errors caused by the updated function signatures.
