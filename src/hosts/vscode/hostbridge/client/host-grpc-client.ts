import { createGrpcClient } from "@hosts/vscode/hostbridge/client/host-grpc-client-base"
import { HostBridgeClientProvider } from "@/hosts/host-provider-types"
import { WatchServiceDefinition } from "@shared/proto/host/watch"
import { WorkspaceServiceDefinition } from "@shared/proto/host/workspace"
import { EnvServiceDefinition } from "@shared/proto/host/env"
import { WindowServiceDefinition } from "@shared/proto/host/window"
import { DiffServiceDefinition } from "@shared/proto/host/diff"

export const vscodeHostBridgeClient: HostBridgeClientProvider = {
	watchServiceClient: createGrpcClient(WatchServiceDefinition),
	workspaceClient: createGrpcClient(WorkspaceServiceDefinition),
	envClient: createGrpcClient(EnvServiceDefinition),
	windowClient: createGrpcClient(WindowServiceDefinition),
	diffClient: createGrpcClient(DiffServiceDefinition),
}
