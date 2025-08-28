// eslint-rules/index.js
const noProtobufObjectLiterals = require("./no-protobuf-object-literals")
const noGrpcClientObjectLiterals = require("./no-grpc-client-object-literals")
const noDirectVscodeApi = require("./no-direct-vscode-api")
const noDirectVscodeStateApi = require("./no-direct-vscode-state-api")

module.exports = {
	rules: {
		"no-protobuf-object-literals": noProtobufObjectLiterals,
		"no-grpc-client-object-literals": noGrpcClientObjectLiterals,
		"no-direct-vscode-api": noDirectVscodeApi,
		"no-direct-vscode-state-api": noDirectVscodeStateApi,
	},
	configs: {
		recommended: {
			plugins: ["local"],
			rules: {
				"local/no-protobuf-object-literals": "error",
				"local/no-grpc-client-object-literals": "error",
			},
		},
	},
}
