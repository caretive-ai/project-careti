import { ReplaceTextRequest, ReplaceTextResponse } from "@shared/proto/host/diff"

export async function replaceText(_request: ReplaceTextRequest): Promise<ReplaceTextResponse> {
	throw new Error("diffService is not supported. Use the VscodeDiffViewProvider.")
}
