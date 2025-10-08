# 작업 계획: `src/common.ts`의 `initialize` 함수 수정

## 1. 목표
`Controller` 생성자에 `WorkspaceRootManager`를 전달하는 경로를 만들기 위해, `src/common.ts`의 `initialize` 함수 시그니처를 수정하여 `workspaceManager`를 전달받고 이를 `VscodeWebviewProvider` 생성자로 넘겨준다.

## 2. 작업 단계
1. `WorkspaceRootManager` 타입을 import 합니다.
2. `initialize` 함수의 인자 목록에 `workspaceManager: WorkspaceRootManager`를 추가합니다.
3. `VscodeWebviewProvider` 생성자를 호출할 때 `workspaceManager`를 전달합니다.

## 3. 실행할 명령어

```xml
<replace_in_file>
<path>src/common.ts</path>
<diff>
------- SEARCH
import { migrateAuthIfNeeded } from "./core/storage/state-migrations"
import { VscodeWebviewProvider } from "./hosts/vscode/VscodeWebviewProvider"
import { PostHogClientProvider } from "./services/posthog/PostHogClientProvider"
import { TelemetryService } from "./services/telemetry"
import { WebviewProviderType } from "./shared/webview/types"
=======
import { migrateAuthIfNeeded } from "./core/storage/state-migrations"
import { WorkspaceRootManager } from "./core/workspace/WorkspaceRootManager"
import { VscodeWebviewProvider } from "./hosts/vscode/VscodeWebviewProvider"
import { PostHogClientProvider } from "./services/posthog/PostHogClientProvider"
import { TelemetryService } from "./services/telemetry"
import { WebviewProviderType } from "./shared/webview/types"
+++++++ REPLACE
------- SEARCH
export async function initialize(context: vscode.ExtensionContext) {
	// This is the first thing that should be initialized.
	const posthog = PostHogClientProvider.getInstance()
	await posthog.initialize(context)
	telemetryService.initialize(posthog)

	await migrateAuthIfNeeded(context)

	return new VscodeWebviewProvider(context, WebviewProviderType.SIDEBAR)
}
=======
export async function initialize(context: vscode.ExtensionContext, workspaceManager: WorkspaceRootManager) {
	// This is the first thing that should be initialized.
	const posthog = PostHogClientProvider.getInstance()
	await posthog.initialize(context)
	telemetryService.initialize(posthog)

	await migrateAuthIfNeeded(context)

	return new VscodeWebviewProvider(context, WebviewProviderType.SIDEBAR, workspaceManager)
}
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 4. 예상 결과
- `src/common.ts` 파일의 `initialize` 함수가 `workspaceManager`를 처리하도록 수정됩니다.
- `src/extension.ts`에서 `initialize` 함수 호출 시 인자가 부족하다는 새로운 에러가 발생합니다.
- `VscodeWebviewProvider` 생성자 호출 시 인자가 많다는 새로운 에러가 발생합니다. 이 에러들은 다음 단계에서 순차적으로 해결할 것입니다.
