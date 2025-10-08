# 작업 계획: `WebviewProvider.ts` 생성자 수정 (v2)

## 1. 목표
`WebviewProvider`가 `Controller`를 생성할 때 `HostProvider`로부터 `WorkspaceRootManager`를 가져와 전달하도록 `src/core/webview/WebviewProvider.ts` 파일을 수정하여, `Controller` 생성자 관련 타입 에러를 최종적으로 해결한다.

## 2. 작업 단계
1. `HostProvider`를 import 합니다.
2. `WebviewProvider`의 생성자(constructor) 내에서 `new Controller(...)`를 호출하는 부분을 수정하여, `HostProvider.get().workspaceManager`를 세 번째 인자로 전달합니다.

## 3. 실행할 명령어

```xml
<replace_in_file>
<path>src/core/webview/WebviewProvider.ts</path>
<diff>
------- SEARCH
import { Controller } from "@core/controller"
import { Logger } from "@services/logging/Logger"
import { randomId } from "@utils/random"
import * as vscode from "vscode"
=======
import { Controller } from "@core/controller"
import { HostProvider } from "@/hosts/host-provider"
import { Logger } from "@services/logging/Logger"
import { randomId } from "@utils/random"
import * as vscode from "vscode"
+++++++ REPLACE
------- SEARCH
	constructor(context: vscode.ExtensionContext, type: WebviewProviderType) {
		this.id = randomId()
		this.context = context
		this.type = type
		this.controller = new Controller(context, this.id)
		WebviewProvider.instances.set(this.id, this)
	}
=======
	constructor(context: vscode.ExtensionContext, type: WebviewProviderType) {
		this.id = randomId()
		this.context = context
		this.type = type
		this.controller = new Controller(context, this.id, HostProvider.get().workspaceManager)
		WebviewProvider.instances.set(this.id, this)
	}
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 4. 예상 결과
- `Controller` 생성자 호출과 관련된 모든 연쇄적인 타입 에러가 해결될 것으로 예상됩니다.
- `npm run compile`을 실행하여 남은 에러를 확인하고 다음 단계를 진행할 수 있습니다.
