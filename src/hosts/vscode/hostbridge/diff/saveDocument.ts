import { SaveDocumentRequest, SaveDocumentResponse } from "@shared/proto/host/diff"

export async function saveDocument(_request: SaveDocumentRequest): Promise<SaveDocumentResponse> {
	throw new Error("diffService is not supported. Use the VscodeDiffViewProvider.")
}
