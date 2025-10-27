# 버전업 계획 (0.3.0)

## 현재 상태 요약

- **`git log`**: LiteLLM 모델 가져오기, `CaretBrandConfig` 리팩토링, 에이전트 프로토콜 강화, UI 레이아웃 수정, 시스템 프롬프트 리팩토링 및 한국어 문서 추가 등 다양한 `feat`, `fix`, `refactor`, `chore`, `docs` 커밋이 확인되었습니다.
- **`git status`**: `COLLABORATIVE_PRINCIPLES.json` 및 관련 한국어 문서 수정, 새로운 워크로그 파일 추가 등 커밋되지 않은 변경 사항들이 있습니다.
- **`CHANGELOG.md`**: 최신 버전은 `0.2.22`이며, "System Prompt Enhancements"와 "Translation Fix"가 기록되어 있습니다.
- **`webview-ui/src/caret/locale/ko/announcement.json`**: 현재 공지 내용은 `CHANGELOG.md`의 `0.2.22` 버전과 유사한 "시스템 프롬프트 보강", "페르소나 이미지 저장 개선", "다국어 지원 강화", "버그 수정 및 안정성 개선" 등을 포함합니다.
- **`package.json`**: 현재 버전은 `0.2.3`입니다.

**⚠️ 버전 불일치**: `CHANGELOG.md`의 최신 버전(`0.2.22`)과 `package.json`의 현재 버전(`0.2.3`)이 일치하지 않습니다. `package.json`의 버전이 더 낮으므로, `CHANGELOG.md`에 기록된 `0.2.22` 버전이 아직 `package.json`에 반영되지 않았거나, `package.json`의 버전이 잘못된 것으로 판단됩니다.

## 제안 버전: `0.3.0` (마이너 버전업)

`CHANGELOG.md`의 `0.2.22`를 기준으로 다음 마이너 버전인 `0.3.0`으로 버전업을 제안합니다.

## `0.3.0` 버전 주요 변경 사항 요약

- **새로운 기능**:
    - LiteLLM 모델 가져오기 구현 및 `CaretBrandConfig`를 `FeatureConfig`로 리팩토링
    - 브랜드 변환 시스템에 TSX 파일 지원 추가
- **개선 사항**:
    - 명시적 승인을 위한 에이전트 프로토콜 강화
    - 시스템 프롬프트 리팩토링 및 한국어 문서 추가 (특히 `COLLABORATIVE_PRINCIPLES.json` 관련)
- **버그 수정**:
    - 두 개의 버튼이 표시될 때 `ActionButtons` 레이아웃 오버플로우 수정
- **기타**:
    - 브랜드 변환 워크로그 업데이트 및 캐럿 브랜드 자산 복원, `caret-b2b` 브랜딩 절차 문서화

## 파일 정리 계획

### 1. `CHANGELOG.md` 업데이트

- `0.2.22` 섹션 위에 `0.3.0` 섹션을 추가합니다.
- `0.3.0` 섹션에는 위에서 요약한 주요 변경 사항들을 다음과 같이 기록합니다.

```markdown
## [0.3.0] - 2025-10-01
 - **New Feature**: Implement LiteLLM model fetching and refactor CaretBrandConfig to FeatureConfig
 - **New Feature**: Add TSX file support to brand conversion system
 - **Enhancement**: Strengthen agent protocol for explicit approval
 - **Enhancement**: Refactor system prompt and add Korean docs (especially for COLLABORATIVE_PRINCIPLES)
 - **Bug Fix**: Fix ActionButtons layout overflow when two buttons are displayed
 - **Chore**: Update brand conversion worklog and restore caret brand assets, document caret-b2b branding procedure
```

### 2. `webview-ui/src/caret/locale/ko/announcement.json` 업데이트

- `bullets.current` 섹션의 내용을 `0.3.0` 버전의 주요 변경 사항으로 업데이트합니다.
- 기존 `bullets.current` 내용은 `bullets.previous`로 이동시킵니다.
- `header`의 `v{{version}}`이 `0.3.0`을 가리키도록 합니다.

```json
{
    "header": "🎉 v0.3.0의 새로운 기능",
    "previousHeader": "이전 업데이트:",
    "bullets": {
        "current": {
            "1": "LiteLLM 모델 지원 및 설정 리팩토링",
            "1-desc": "LiteLLM 모델 가져오기 기능을 구현하고, CaretBrandConfig를 FeatureConfig로 리팩토링하여 설정 관리의 유연성을 높였습니다.",
            "2": "브랜드 변환 시스템 TSX 지원",
            "2-desc": "브랜드 변환 시스템에 TSX 파일 지원을 추가하여 더 다양한 파일 형식에 대응할 수 있게 되었습니다.",
            "3": "에이전트 프로토콜 강화",
            "3-desc": "명시적 승인을 위한 에이전트 프로토콜을 강화하여 AI의 행동 제어를 더욱 명확하게 했습니다.",
            "4": "시스템 프롬프트 개선 및 한국어 문서화",
            "4-desc": "시스템 프롬프트를 리팩토링하고 한국어 문서를 추가하여 AI의 협력적 원칙을 명확히 했습니다.",
            "5": "UI 레이아웃 버그 수정",
            "5-desc": "두 개의 버튼이 표시될 때 ActionButtons 레이아웃 오버플로우 문제를 수정하여 UI 안정성을 개선했습니다."
        },
        "previous": {
            "1": "시스템 프롬프트 보강",
            "1-desc": "Cline 병합 과정 중 누락된 캐럿 고유의 협력적 태도와 비용 절감 프롬프트를 복원하고 보완했습니다.",
            "2": "페르소나 이미지 저장 개선",
            "2-desc": "사용자 업로드 이미지가 앱 재시작 후에도 유지되도록 템플릿 선택과 동일한 로직으로 개선했습니다.",
            "3": "다국어 지원 강화",
            "3-desc": "중국어 및 일본어 누락 번역을 추가하고 UI 문구를 개선했습니다.",
            "4": "버그 수정 및 안정성 개선",
            "4-desc": "단축키 버그, UI 레이아웃 문제 등 다양한 버그를 수정하여 전반적인 안정성을 향상시켰습니다."
        }
    },
    "links": {
        "korean": "한국어",
        "japanese": "일본어",
        "chinese": "중국어",
        "english": "영어"
    }
}
```

### 3. `package.json` 업데이트

- `version` 필드를 `0.3.0`으로 업데이트합니다.

```json
{
    "name": "caret",
    "displayName": "Caret",
    "description": "🎯 Transform your coding workflow with the most intelligent AI assistant for Visual Studio Code. Autonomous code generation, multi-file refactoring, and 20+ AI models. Supports: 한국어, 日本語, 中文.",
    "version": "0.3.0",
    "icon": "assets/icons/icon.png",
    "engines": {
        "vscode": "^1.84.0"
    },
    "author": {
        "name": "Caretive Inc."
    },
    "license": "Apache-2.0",
    "publisher": "caretive",
    "repository": {
        "type": "git",
        "url": "https://github.com/aicoding-caret/caret"
    },
    "homepage": "https://caret.team",
    "categories": [
        "AI",
        "Chat",
        "Programming Languages",
        "Education",
        "Machine Learning",
        "Other"
    ],
    "keywords": [
        "ai",
        "coding assistant",
        "autonomous",
        "code generation",
        "refactoring",
        "claude",
        "gpt",
        "gemini",
        "chatgpt",
        "sonnet",
        "mcp",
        "pair programming",
        "한국어",
        "日本語",
        "中文"
    ],
    "activationEvents": [
        "onLanguage",
        "onStartupFinished",
        "workspaceContains:evals.env"
    ],
    "main": "./dist/extension.js",
    "contributes": {
        "walkthroughs": [
            {
                "id": "CaretWalkthrough",
                "title": "Meet Caret, your new coding partner",
                "description": "Caret codes like a developer because it thinks like one. Here are 5 ways to put it to work:",
                "steps": [
                    {
                        "id": "welcome",
                        "title": "Start with a Goal, Not Just a Prompt",
                        "description": "Tell Caret what you want to achieve. It plans, asks, and then codes, like a true partner.",
                        "media": {
                            "markdown": "walkthrough/step1.md"
                        }
                    },
                    {
                        "id": "learn",
                        "title": "Let Caret Learn Your Codebase",
                        "description": "Point Caret to your project. It builds understanding to make smart, context-aware changes.",
                        "media": {
                            "markdown": "walkthrough/step2.md"
                        }
                    },
                    {
                        "id": "advanced-features",
                        "title": "Always Use the Best AI Models",
                        "description": "Caret empowers you with State-of-the-Art AI, connecting to top models (Anthropic, Gemini, OpenAI & more).",
                        "media": {
                            "markdown": "walkthrough/step3.md"
                        }
                    },
                    {
                        "id": "mcp",
                        "title": "Extend with Powerful Tools (MCP)",
                        "description": "Connect to databases, APIs, or discover new capabilities in the MCP Marketplace.",
                        "media": {
                            "markdown": "walkthrough/step4.md"
                        }
                    },
                    {
                        "id": "getting-started",
                        "title": "You're Always in Control",
                        "description": "Review Caret's plans and diffs. Approve changes before they happen. No surprises.",
                        "media": {
                            "markdown": "walkthrough/step5.md"
                        },
                        "content": {
                            "path": "walkthrough/step5.md"
                        }
                    }
                ]
            }
        ],
        "viewsContainers": {
            "activitybar": [
                {
                    "id": "caret-ActivityBar",
                    "title": "Caret (⌘+')",
                    "icon": "assets/icons/icon.svg",
                    "when": "isMac"
                },
                {
                    "id": "caret-ActivityBar",
                    "title": "Caret (Ctrl+')",
                    "icon": "assets/icons/icon.svg",
                    "when": "!isMac"
                }
            ]
        },
        "views": {
            "caret-ActivityBar": [
                {
                    "type": "webview",
                    "id": "caret.SidebarProvider",
                    "name": "",
                    "icon": "assets/icons/icon.svg"
                }
            ]
        },
        "commands": [
            {
                "command": "caret.plusButtonClicked",
                "title": "New Task",
                "icon": "$(add)"
            },
            {
                "command": "caret.mcpButtonClicked",
                "title": "MCP Servers",
                "icon": "$(server)"
            },
            {
                "command": "caret.historyButtonClicked",
                "title": "History",
                "icon": "$(history)"
            },
            {
                "command": "caret.popoutButtonClicked",
                "title": "Open in Editor",
                "icon": "$(link-external)"
            },
            {
                "command": "caret.accountButtonClicked",
                "title": "Account",
                "icon": "$(account)"
            },
            {
                "command": "caret.settingsButtonClicked",
                "title": "Settings",
                "icon": "$(settings-gear)"
            },
            {
                "command": "caret.openInNewTab",
                "title": "Open In New Tab",
                "category": "Caret"
            },
            {
                "command": "caret.dev.createTestTasks",
                "title": "Create Test Tasks",
                "category": "Caret",
                "when": "caret.isDevMode"
            },
            {
                "command": "caret.addToChat",
                "title": "Add to Caret",
                "category": "Caret"
            },
            {
                "command": "caret.addTerminalOutputToChat",
                "title": "Add to Caret",
                "category": "Caret"
            },
            {
                "command": "caret.focusChatInput",
                "title": "Jump to Chat Input",
                "category": "Caret"
            },
            {
                "command": "caret.generateGitCommitMessage",
                "title": "Generate Commit Message with Caret",
                "category": "Caret",
                "icon": "$(robot)"
            },
            {
                "command": "caret.abortGitCommitMessage",
                "title": "Generate Commit Message with Caret - Stop",
                "category": "Caret",
                "icon": "$(debug-stop)"
            },
            {
                "command": "caret.explainCode",
                "title": "Explain with Caret",
                "category": "Caret"
            },
            {
                "command": "caret.improveCode",
                "title": "Improve with Caret",
                "category": "Caret"
            },
            {
                "command": "caret.openWalkthrough",
                "title": "Open Walkthrough",
                "category": "Caret"
            }
        ],
        "keybindings": [
            {
                "command": "caret.addToChat",
                "key": "cmd+'",
                "mac": "cmd+'",
                "win": "ctrl+'",
                "linux": "ctrl+'",
                "when": "editorHasSelection"
            },
            {
                "command": "caret.generateGitCommitMessage",
                "when": "config.git.enabled && scmProvider == git"
            },
            {
                "command": "caret.focusChatInput",
                "key": "cmd+'",
                "mac": "cmd+'",
                "win": "ctrl+'",
                "linux": "ctrl+'",
                "when": "!editorHasSelection"
            }
        ],
        "menus": {
            "view/title": [
                {
                    "command": "caret.plusButtonClicked",
                    "group": "navigation@1",
                    "when": "view == caret.SidebarProvider"
                },
                {
                    "command": "caret.mcpButtonClicked",
                    "group": "navigation@2",
                    "when": "view == caret.SidebarProvider"
                },
                {
                    "command": "caret.historyButtonClicked",
                    "group": "navigation@3",
                    "when": "view == caret.SidebarProvider"
                },
                {
                    "command": "caret.popoutButtonClicked",
                    "group": "navigation@4",
                    "when": "view == caret.SidebarProvider"
                },
                {
                    "command": "caret.accountButtonClicked",
                    "group": "navigation@5",
                    "when": "view == caret.SidebarProvider"
                },
                {
                    "command": "caret.settingsButtonClicked",
                    "group": "navigation@6",
                    "when": "view == caret.SidebarProvider"
                }
            ],
            "editor/title": [
                {
                    "command": "caret.plusButtonClicked",
                    "group": "navigation@1",
                    "when": "activeWebviewPanelId == caret.TabPanelProvider"
                },
                {
                    "command": "caret.mcpButtonClicked",
                    "group": "navigation@2",
                    "when": "activeWebviewPanelId == caret.TabPanelProvider"
                },
                {
                    "command": "caret.historyButtonClicked",
                    "group": "navigation@3",
                    "when": "activeWebviewPanelId == caret.TabPanelProvider"
                },
                {
                    "command": "caret.popoutButtonClicked",
                    "group": "navigation@4",
                    "when": "activeWebviewPanelId == caret.TabPanelProvider"
                },
                {
                    "command": "caret.accountButtonClicked",
                    "group": "navigation@5",
                    "when": "activeWebviewPanelId == caret.TabPanelProvider"
                },
                {
                    "command": "caret.settingsButtonClicked",
                    "group": "navigation@6",
                    "when": "activeWebviewPanelId == caret.TabPanelProvider"
                }
            ],
            "editor/context": [
                {
                    "command": "caret.addToChat",
                    "group": "navigation",
                    "when": "editorHasSelection"
                }
            ],
            "terminal/context": [
                {
                    "command": "caret.addTerminalOutputToChat",
                    "group": "navigation"
                }
            ],
            "scm/title": [
                {
                    "command": "caret.generateGitCommitMessage",
                    "group": "navigation",
                    "when": "config.git.enabled && scmProvider == git && !caret.isGeneratingCommit"
                },
                {
                    "command": "caret.abortGitCommitMessage",
                    "group": "navigation",
                    "when": "config.git.enabled && scmProvider == git && caret.isGeneratingCommit"
                }
            ],
            "commandPalette": [
                {
                    "command": "caret.generateGitCommitMessage",
                    "when": "config.git.enabled && scmProvider == git && !caret.isGeneratingCommit"
                },
                {
                    "command": "caret.abortGitCommitMessage",
                    "when": "config.git.enabled && scmProvider == git && caret.isGeneratingCommit"
                }
            ]
        },
        "configuration": {
            "title": "Caret",
            "properties": {}
        }
    },
    "scripts": {
        "vscode:prepublish": "npm run package",
        "compile": "npm run check-types && npm run lint && node esbuild.mjs",
        "compile-standalone": "npm run check-types && npm run lint && node esbuild.mjs --standalone",
        "postcompile-standalone": "node caret-scripts/build/package-standalone.mjs",
        "watch": "npm-run-all -p watch:*",
        "watch:esbuild": "node esbuild.mjs --watch",
        "watch:tsc": "tsc --noEmit --watch --project tsconfig.json",
        "package": "npm run check-types && npm run build:webview && npm run lint && node esbuild.mjs --production",
        "protos": "node caret-scripts/build/build-proto.mjs",
        "postprotos": "biome format src/shared/proto src/core/controller src/hosts/ webview-ui/src/services src/generated --write --no-errors-on-unmatched",
        "clean": "rimraf dist dist-standalone webview-ui/build src/generated out/",
        "compile-tests": "node caret-scripts/build/build-tests.js",
        "watch-tests": "tsc -p . -w --outDir out",
        "check-types": "npm run protos && npx tsc --noEmit && cd webview-ui && npx tsc -b --noEmit",
        "check-types:filtered": "npm run protos && (npx tsc --noEmit 2>&1 | findstr /v \"Unused '@ts-expect-error' directive\" || echo Build complete) && cd webview-ui && npx tsc -b --noEmit",
        "lint": "biome lint --no-errors-on-unmatched --files-ignore-unknown=true --diagnostic-level=error && buf lint",
        "format": "biome format --changed --no-errors-on-unmatched --files-ignore-unknown=true --diagnostic-level=error",
        "format:fix": "biome check --changed --no-errors-on-unmatched --files-ignore-unknown=true --write",
        "fix:all": "biome check --no-errors-on-unmatched --files-ignore-unknown=true --write --diagnostic-level=error --unsafe",
        "pretest": "npm run compile && npm run compile-tests && npm run compile-standalone && npm run lint",
        "test": "npm-run-all test:unit test:integration",
        "test:ci": "node scripts/test-ci.js",
        "test:integration": "vscode-test",
        "test:unit": "vitest run",
        "test:coverage": "vscode-test --coverage",
        "e2e": "playwright test -c playwright.config.ts",
        "test:e2e": "playwright install && vsce package --no-dependencies --allow-package-secrets sendgrid --out dist/e2e.vsix && node src/test/e2e/utils/build.mjs && playwright test",
        "test:e2e:optimal": "vsce package --no-dependencies --allow-package-secrets sendgrid --out dist/e2e.vsix && node src/test/e2e/utils/build.mjs && playwright test",
        "install:all": "npm install && cd webview-ui && npm install",
        "dev:webview": "cd webview-ui && npm run dev",
        "build:webview": "cd webview-ui && npm run build",
		"test:webview": "cd webview-ui && npm run test",
		"publish:marketplace": "vsce publish --allow-package-secrets sendgrid && ovsx publish",
		"publish:marketplace:prerelease": "vsce publish --allow-package-secrets sendgrid --pre-release && ovsx publish --pre-release",
		"prepare": "husky",
		"changeset": "changeset",
		"version-packages": "changeset version",
		"docs": "cd docs && npm run dev",
		"docs:check-links": "cd docs && npm run check",
		"docs:rename-file": "cd docs && npm run rename",
		"report-issue": "node scripts/report-issue.js",
		"package:release": "node caret-scripts/build/package-release.js",
		"report:i18n-namespace": "node caret-scripts/tools/report-i18n-missing-namespace.js",
		"report:i18n-keys": "node caret-scripts/tools/report-i18n-missing-keys.js",
		"sync:i18n-keys": "node caret-scripts/tools/i18n-key-synchronizer.js"
	},
	"lint-staged": {
		"*": [
			"biome check --write --staged --no-errors-on-unmatched --files-ignore-unknown=true"
		]
	},
	"devDependencies": {
		"@biomejs/biome": "^2.1.4",
		"@bufbuild/buf": "^1.54.0",
		"@changesets/cli": "^2.27.12",
		"@types/chai": "^5.0.1",
		"@types/cheerio": "^0.22.35",
		"@types/clone-deep": "^4.0.4",
		"@types/diff": "^5.2.1",
		"@types/get-folder-size": "^3.0.4",
		"@types/lodash": "^4.17.20",
		"@types/mocha": "^10.0.7",
		"@types/node": "20.x",
		"@types/pdf-parse": "^1.1.4",
		"@types/proxyquire": "^1.3.31",
		"@types/should": "^11.2.0",
		"@types/sinon": "^17.0.4",
		"@types/turndown": "^5.0.5",
		"@types/vscode": "^1.84.0",
		"@vitest/ui": "^3.2.4",
		"@vscode/test-cli": "^0.0.10",
		"@vscode/test-electron": "^2.5.2",
		"@vscode/vsce": "^3.6.0",
		"chai": "^4.3.10",
		"chalk": "^5.3.0",
		"esbuild": "^0.25.0",
		"grpc-tools": "^1.13.0",
		"husky": "^9.1.7",
		"lint-staged": "^16.1.0",
		"minimatch": "^3.0.3",
		"npm-run-all": "^4.1.5",
		"protoc-gen-ts": "^0.8.7",
		"proxyquire": "^2.1.3",
		"rimraf": "^6.0.1",
		"should": "^13.2.3",
		"sinon": "^19.0.2",
		"ts-node": "^10.9.2",
		"ts-proto": "^2.6.1",
		"tsconfig-paths": "^4.2.0",
		"typescript": "^5.9.2",
		"vite-tsconfig-paths": "^5.1.4",
		"vitest": "^3.2.4"
	},
	"dependencies": {
		"@anthropic-ai/sdk": "^0.37.0",
		"@anthropic-ai/vertex-sdk": "^0.6.4",
		"@aws-sdk/client-bedrock-runtime": "^3.840.0",
		"@aws-sdk/credential-providers": "^3.840.0",
		"@bufbuild/protobuf": "^2.2.5",
		"@cerebras/cerebras_cloud_sdk": "^1.35.0",
		"@google-cloud/vertexai": "^1.9.3",
		"@google/genai": "^1.16.0",
		"@grpc/grpc-js": "^1.9.15",
		"@grpc/reflection": "^1.0.4",
		"@mistralai/mistralai": "^1.5.0",
		"@modelcontextprotocol/sdk": "^1.11.1",
		"@opentelemetry/api": "^1.4.1",
		"@opentelemetry/exporter-trace-otlp-http": "^0.39.1",
		"@opentelemetry/resources": "^1.30.1",
		"@opentelemetry/sdk-node": "^0.39.1",
		"@opentelemetry/sdk-trace-node": "^1.30.1",
		"@opentelemetry/semantic-conventions": "^1.30.0",
		"@playwright/test": "^1.53.2",
		"@sap-ai-sdk/ai-api": "^1.17.0",
		"@sap-ai-sdk/orchestration": "^1.17.0",
		"@sentry/browser": "^9.12.0",
		"@streamparser/json": "^0.0.22",
		"@types/uuid": "^10.0.0",
		"@vscode/codicons": "^0.0.36",
		"archiver": "^7.0.1",
		"axios": "^1.8.2",
		"cheerio": "^1.1.2",
		"chokidar": "^4.0.1",
		"chrome-launcher": "^1.1.2",
		"clone-deep": "^4.0.1",
		"default-shell": "^2.2.0",
		"diff": "^5.2.0",
		"exceljs": "^4.4.0",
		"execa": "^9.5.2",
		"fast-deep-equal": "^3.1.3",
		"firebase": "^11.2.0",
		"fzf": "^0.5.2",
		"get-folder-size": "^5.0.0",
		"globby": "^14.0.2",
		"grpc-health-check": "^2.0.2",
		"iconv-lite": "^0.6.3",
		"ignore": "^7.0.3",
		"image-size": "^2.0.2",
		"isbinaryfile": "^5.0.2",
		"jschardet": "^3.1.4",
		"jwt-decode": "^4.0.0",
		"lodash": "^4.17.21",
		"mammoth": "^1.8.0",
		"nice-grpc": "^2.1.12",
		"ollama": "^0.5.13",
		"open": "^10.1.2",
		"open-graph-scraper": "^6.9.0",
		"openai": "^4.83.0",
		"os-name": "^6.0.0",
		"p-timeout": "^6.1.4",
		"p-wait-for": "^5.0.2",
		"pdf-parse": "^1.1.1",
		"posthog-node": "^5.8.1",
		"puppeteer-chromium-resolver": "^23.0.0",
		"puppeteer-core": "^23.4.0",
		"reconnecting-eventsource": "^1.6.4",
		"serialize-error": "^11.0.3",
		"simple-git": "^3.27.0",
		"strip-ansi": "^7.1.0",
		"tree-sitter-wasms": "^0.1.11",
		"ts-morph": "^25.0.1",
		"turndown": "^7.2.0",
		"ulid": "^2.4.0",
		"uuid": "^11.1.0",
		"vscode-uri": "^3.1.0",
		"web-tree-sitter": "^0.22.6",
		"zod": "^3.24.2"
	}
}
<environment_details>
# VSCode Visible Files
caret-docs/work-logs/luke/20251001-2-ux-improve-message-handling.md

# VSCode Open Tabs
caret-b2b/worklog/t14-persona-flag.md
caret-b2b/worklog/t12-requirements-for-ai.md
src/core/storage/StateManager.ts
caret-b2b/worklog/20250929-session-guide.md
src/shared/CaretBrandConfig.ts
caret-docs/features/f01-common-util.md
caret-src/shared/feature-config.json
caret-b2b/worklog/20250930-featureconfig-deployment-checklist.md
../../Documents/Caret/Rules/persona.md
CHANGELOG.md
caret-docs/ko/CHANGELOG.md
version_analysis_plan.md
caret-docs/work-logs/luke/2025-10-01-system-prompt-improvement.md
caret-docs/work-logs/luke/20251001-1-system-prompt-improvement.md
webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx
caret-docs/work-logs/luke/20251001-3-input-history-feature.md
webview-ui/src/caret/hooks/useInputHistory.ts
webview-ui/src/components/chat/ChatTextArea.tsx
caret-docs/work-logs/luke/20251001-3-input-history-implementation-guide.md
caret-docs/work-logs/luke/t16-document-editing-conflicts-analysis.md
caret-src/core/prompts/sections/COLLABORATIVE_PRINCIPLES.json
caret-docs/system-prompts-ko/collaborative-principles.md
caret-docs/work-logs/luke/20251001-2-ux-improve-message-handling.md
src/core/controller/task/askResponse.ts
webview-ui/src/components/chat/ChatView.tsx
webview-ui/src/components/settings/ApiOptions.tsx
caret-b2b/tools/brand-converter.js.backup
.caret-feature-config.json

# Current Time
2025. 10. 1. 오후 3:10:01 (Asia/Seoul, UTC+9:00)

# Context Window Usage
41,884 / 1,048.576K tokens used (4%)

# Current Mode
ACT MODE
</environment_details>
