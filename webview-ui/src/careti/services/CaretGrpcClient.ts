// webview-ui/src/careti/services/CaretGrpcClient.ts
import * as proto from "@shared/proto/index"
import { Callbacks, ProtoBusClient } from "../../services/grpc-client-base"

// CARETI MODIFICATION: A dedicated gRPC client for Careti-specific services.
// This ensures separation from Cline's auto-generated client and prevents future conflicts.
// Ported from careti-compare with path adjustments: /assets/ → /assets/
export class PersonaServiceClient extends ProtoBusClient {
	static override serviceName: string = "careti.PersonaService"

	static async getPersonaProfile(request: proto.cline.EmptyRequest): Promise<proto.careti.PersonaProfile> {
		return PersonaServiceClient.makeUnaryRequest(
			"GetPersonaProfile",
			request,
			proto.cline.EmptyRequest.toJSON,
			proto.careti.PersonaProfile.fromJSON,
		)
	}

	static async updatePersona(request: proto.careti.UpdatePersonaRequest): Promise<proto.cline.Empty> {
		return PersonaServiceClient.makeUnaryRequest(
			"UpdatePersona",
			request,
			proto.careti.UpdatePersonaRequest.toJSON,
			proto.cline.Empty.fromJSON,
		)
	}

	static subscribeToPersonaChanges(
		request: proto.cline.EmptyRequest,
		callbacks: Callbacks<proto.careti.PersonaImages>,
	): () => void {
		return PersonaServiceClient.makeStreamingRequest(
			"SubscribeToPersonaChanges",
			request,
			proto.cline.EmptyRequest.toJSON,
			proto.careti.PersonaImages.fromJSON,
			callbacks,
		)
	}

	static async uploadCustomImage(request: proto.careti.UploadCustomImageRequest): Promise<proto.cline.Empty> {
		return PersonaServiceClient.makeUnaryRequest(
			"UploadCustomImage",
			request,
			proto.careti.UploadCustomImageRequest.toJSON,
			proto.cline.Empty.fromJSON,
		)
	}
}
