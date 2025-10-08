# `biome.jsonc` 병합 실행 계획

## 1. 목표

`biome.jsonc` 파일의 병합 충돌을 해결하고, Cline과 Caret의 설정을 통합하여 안정적이고 유지보수하기 좋은 최종 버전을 생성합니다.

## 2. 실행 계획

1.  **사용자 승인**: 아래에 제시된 `biome.jsonc`의 최종 내용에 대해 마스터의 승인을 받습니다.
2.  **파일 업데이트**: 승인 시, `write_to_file` 도구를 사용하여 `biome.jsonc` 파일을 아래 내용으로 덮어씁니다.

## 3. 최종 병합 내용

```json
{
	"$schema": "https://biomejs.dev/schemas/2.2.2/schema.json",
	"vcs": {
		"enabled": true,
		"clientKind": "git",
		"useIgnoreFile": true,
		"defaultBranch": "main"
	},
	"assist": {
		"enabled": true,
		"actions": {
			"source": {
				"organizeImports": "on",
				"useSortedAttributes": "on"
			}
		}
	},
	"linter": {
		"enabled": true,
		"domains": {
			"react": "recommended"
		},
		// Ideally we would want to turn on all the rules that are currently off,
		// keeping them off currently to make sure only changes on the migrations
		// are included in the initial PR before we apply the format and lint changes.
		// TODO: turn on all rules that are currently off if applicable.
		// TODO: Remove --diagnostic-level=error from CI commands.
		"rules": {
			"recommended": true,
			"correctness": {
				"useExhaustiveDependencies": "off",
				"noUndeclaredVariables": "off",
				"noEmptyPattern": "off",
				"useJsxKeyInIterable": "off",
				"noInnerDeclarations": "off",
				"useHookAtTopLevel": "off",
				"useYield": "off",
				"noConstructorReturn": "off",
				"noInvalidPositionAtImportRule": "off",
				"noSwitchDeclarations": "off",
				"noUnusedImports": "error"
			},
			"a11y": "off",
			"style": {
				"useNodejsImportProtocol": "off",
				"useImportType": "off",
				"useBlockStatements": "warn",
				"useNamingConvention": "off",
				"useThrowOnlyError": "info",
				"useConsistentArrayType": "off",
				"noParameterAssign": "off",
				"useAsConstAssertion": "off",
				"useDefaultParameterLast": "off",
				"noNonNullAssertion": "off",
				"useEnumInitializers": "off",
				"useSelfClosingElements": "off",
				"useSingleVarDeclarator": "off",
				"useNumberNamespace": "off",
				"noInferrableTypes": "off",
				"useTemplate": "off",
				"noUselessElse": "off"
			},
			"suspicious": {
				"noDoubleEquals": "warn",
				"noImplicitAnyLet": "info",
				"noThenProperty": "off",
				"noAsyncPromiseExecutor": "off",
				"noImportAssign": "off",
				"noExplicitAny": "off",
				"noControlCharactersInRegex": "off",
				"noShadowRestrictedNames": "off",
				"noArrayIndexKey": "info",
				"noAssignInExpressions": "warn",
				"useIterableCallbackReturn": "off",
				"noUnknownAtRules": "off"
			},
			"complexity": {
				"noUselessConstructor": "off",
				"useOptionalChain": "off",
				"noBannedTypes": "off",
				"useLiteralKeys": "off",
				"noUselessCatch": "off",
				"noUselessSwitchCase": "off",
				"noStaticOnlyClass": "off"
			},
			"security": {
				"noDangerouslySetInnerHtml": "warn"
			}
		}
	},
	"formatter": {
		"enabled": true,
		"indentStyle": "tab",
		"indentWidth": 4,
		"lineWidth": 130,
		"lineEnding": "lf",
		"formatWithErrors": true
	},
	"javascript": {
		"formatter": {
			"semicolons": "asNeeded",
			"arrowParentheses": "always",
			"bracketSameLine": true,
			"bracketSpacing": true,
			"jsxQuoteStyle": "double",
			"quoteProperties": "asNeeded",
			"trailingCommas": "all"
		}
	},
	"json": {
		"formatter": {
			"trailingCommas": "none",
			"expand": "always"
		}
	},
	"files": {
		"includes": [
			"**",
			// Cline과 Caret의 공통 제외 목록
			"!**/dist/**",
			"!**/dist-*/**",
			"!**/out/**",
			"!**/node_modules/**",
			"!**/webview-ui/build/**",
			"!**/generated/**",
			"!**/proto/**",
			// Cline의 테스트/평가 관련 제외 목록
			"!**/evals/**",
			"!**/playwright/**",
			"!**/test-results/**",
			"!**/tests/specs/**",
			// Caret의 고유 제외 목록
			"!**/webview-ui/src/caret/locale/**",
			"!**/cline-latest/**",
			"!**/cline/**",
			"!**/caret-old/**"
		]
	},
	"plugins": [
		"src/dev/grit/process-env.grit"
	],
	"overrides": [
		{
			"includes": [
				"**",
				"!**/hosts/vscode/**",
				"!**/test/**",
				"!**/*.test.ts",
				"!src/dev/**",
				"!src/extension.ts",
				"!src/integrations/git/commit-message-generator.ts",
				"!src/integrations/terminal/**",
				"!src/core/controller/ui/openWalkthrough.ts"
			],
			"plugins": [
				"src/dev/grit/vscode-api.grit"
			]
		},
		{
			"includes": [
				"**",
				"!src/core/storage/state-migrations.ts",
				"!src/core/storage/FileContextTracker.ts",
				"!src/core/context/context-tracking/FileContextTracker.ts",
				"!src/common.ts",
				"!src/services/logging/distinctId.ts",
				"!src/core/storage/utils/state-helpers.ts",
				"!src/extension.ts"
			],
			"plugins": [
				"src/dev/grit/use-cache-service.grit"
			]
		}
	]
}
