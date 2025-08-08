import { GetDocumentTextRequest, GetDocumentTextResponse } from "@shared/proto/host/diff"

export async function getDocumentText(_request: GetDocumentTextRequest): Promise<GetDocumentTextResponse> {
	throw new Error("diffService is not supported. Use the VscodeDiffViewProvider.")
}
