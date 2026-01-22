// CARETI MODIFICATION: test stub for workspace path resolver to avoid VS Code/ESM loader issues
const { GetWorkspacePathsResponse } = require("../../shared/proto/index.host")

async function getWorkspacePaths() {
	return GetWorkspacePathsResponse.create({ paths: [] })
}

module.exports = { getWorkspacePaths }
