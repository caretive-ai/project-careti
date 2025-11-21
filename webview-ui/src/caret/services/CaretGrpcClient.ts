// webview-ui/src/caret/services/CaretGrpcClient.ts
import * as proto from "@shared/proto/index"
import { Callbacks, ProtoBusClient } from "../../services/grpc-client-base"

// CARET MODIFICATION: A dedicated gRPC client for Caret-specific services.
// This ensures separation from Cline's auto-generated client and prevents future conflicts.
// Ported from caret-compare with path adjustments: /assets/ → /assets/
export class PersonaServiceClient extends ProtoBusClient {
	static override serviceName: string = "caret.PersonaService"

	static async getPersonaProfile(request: proto.cline.EmptyRequest): Promise<proto.caret.PersonaProfile> {
		return PersonaServiceClient.makeUnaryRequest(
			"GetPersonaProfile",
			request,
			proto.cline.EmptyRequest.toJSON,
			proto.caret.PersonaProfile.fromJSON,
		)
	}

	static async updatePersona(request: proto.caret.UpdatePersonaRequest): Promise<proto.cline.Empty> {
		return PersonaServiceClient.makeUnaryRequest(
			"UpdatePersona",
			request,
			proto.caret.UpdatePersonaRequest.toJSON,
			proto.cline.Empty.fromJSON,
		)
	}

	static subscribeToPersonaChanges(
		request: proto.cline.EmptyRequest,
		callbacks: Callbacks<proto.caret.PersonaImages>,
	): () => void {
		return PersonaServiceClient.makeStreamingRequest(
			"SubscribeToPersonaChanges",
			request,
			proto.cline.EmptyRequest.toJSON,
			proto.caret.PersonaImages.fromJSON,
			callbacks,
		)
	}

	static async uploadCustomImage(request: proto.caret.UploadCustomImageRequest): Promise<proto.cline.Empty> {
		return PersonaServiceClient.makeUnaryRequest(
			"UploadCustomImage",
			request,
			proto.caret.UploadCustomImageRequest.toJSON,
			proto.cline.Empty.fromJSON,
		)
	}
}
