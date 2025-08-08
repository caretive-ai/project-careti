import { createGrpcClient } from "@hosts/vscode/hostbridge/client/host-grpc-client-base"
import { HostBridgeClientProvider } from "@/hosts/host-provider-types"
import * as proto from "@shared/proto/index"

// CARET MODIFICATION: Use generated host bridge clients instead of creating here
// This file might be obsolete with the new host bridge client generation
export const vscodeHostBridgeClient: HostBridgeClientProvider = {
	watchServiceClient: {} as any, // TODO: Use generated clients
	workspaceClient: {} as any,
	envClient: {} as any,
	windowClient: {} as any,
	diffClient: {} as any,
}
