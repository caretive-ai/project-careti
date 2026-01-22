// CARETI MODIFICATION: 테스트 환경에서 vscode 모듈 로딩(ESM/CJS 충돌) 회피를 위한 CommonJS mock
module.exports = {
	env: {
		machineId: "test-machine-id",
		isTelemetryEnabled: true,
		onDidChangeTelemetryEnabled: (_callback) => {
			return { dispose: () => {} }
		},
	},
	workspace: {
		getConfiguration: (section) => {
			return {
				get: (key, defaultValue) => {
					if (section === "cline" && key === "telemetrySetting") {
						return "enabled"
					}
					if (section === "telemetry" && key === "telemetryLevel") {
						return "all"
					}
					return defaultValue
				},
			}
		},
	},
	window: {
		showErrorMessage: (_message) => Promise.resolve(),
		showWarningMessage: (_message) => Promise.resolve(),
		showInformationMessage: (_message) => Promise.resolve(),
	},
	commands: {
		executeCommand: (_command, ..._args) => Promise.resolve(),
	},
	Uri: {
		file: (path) => ({ fsPath: path, toString: () => path }),
		parse: (uri) => ({ fsPath: uri, toString: () => uri }),
	},
	ExtensionContextMock: {},
	StatusBarAlignmentMock: { Left: 1, Right: 2 },
	ViewColumnMock: { One: 1, Two: 2, Three: 3 },
}
