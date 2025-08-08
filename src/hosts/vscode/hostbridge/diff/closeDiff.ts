import { CloseDiffRequest, CloseDiffResponse } from "@shared/proto/host/diff"

export async function closeDiff(_request: CloseDiffRequest): Promise<CloseDiffResponse> {
	throw new Error("diffService is not supported. Use the VscodeDiffViewProvider.")
}
