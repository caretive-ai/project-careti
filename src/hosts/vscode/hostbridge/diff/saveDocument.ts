import { SaveDocumentRequest, SaveDocumentResponse } from "@shared/proto/host/window"

export async function saveDocument(_request: SaveDocumentRequest): Promise<SaveDocumentResponse> {
	throw new Error("diffService is not supported. Use the VscodeDiffViewProvider.")
}
