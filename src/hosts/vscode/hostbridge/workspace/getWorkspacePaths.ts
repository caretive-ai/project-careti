import * as vscode from "vscode"
import { GetWorkspacePathsRequest, GetWorkspacePathsResponse } from "@/shared/proto/index.host"

export async function getWorkspacePaths(_: GetWorkspacePathsRequest): Promise<GetWorkspacePathsResponse> {
	// CARETI MODIFICATION: In tests, skip VS Code workspace access to avoid ts-node/ESM loader issues.
	if (process.env.NODE_ENV === "test") {
		return GetWorkspacePathsResponse.create({ paths: [] })
	}

	const paths = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? []
	return GetWorkspacePathsResponse.create({ paths: paths })
}
