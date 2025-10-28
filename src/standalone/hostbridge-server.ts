import * as grpc from "@grpc/grpc-js"
import * as health from "grpc-health-check"
import * as os from "os"
import { type DiffServiceServer, DiffServiceService } from "../generated/grpc-js/host/diff"
import { type EnvServiceServer, EnvServiceService } from "../generated/grpc-js/host/env"
import { type TestingServiceServer, TestingServiceService } from "../generated/grpc-js/host/testing"
import { type WindowServiceServer, WindowServiceService } from "../generated/grpc-js/host/window"
import { type WorkspaceServiceServer, WorkspaceServiceService } from "../generated/grpc-js/host/workspace"
import { log } from "./utils"

export async function startHostBridgeServer(): Promise<grpc.Server> {
	return new Promise((resolve, reject) => {
		const server = new grpc.Server()

		// Set up health check
		const healthImpl = new health.HealthImplementation({ "": "SERVING" })
		healthImpl.addToServer(server)

		// Add host bridge services using the mock implementations
		server.addService(WorkspaceServiceService, createMockService<WorkspaceServiceServer>("WorkspaceService"))
		server.addService(WindowServiceService, createMockService<WindowServiceServer>("WindowService"))
		server.addService(EnvServiceService, createMockService<EnvServiceServer>("EnvService"))
		server.addService(DiffServiceService, createMockService<DiffServiceServer>("DiffService"))
		server.addService(TestingServiceService, createMockService<TestingServiceServer>("TestingService"))

		const bindAddress = process.env.HOST_BRIDGE_ADDRESS || `127.0.0.1:26041`

		server.bindAsync(bindAddress, grpc.ServerCredentials.createInsecure(), (err) => {
			if (err) {
				log(`Failed to bind HostBridge server to ${bindAddress}: ${err}`)
				reject(err)
				return
			}
			server.start()
			log(`HostBridge gRPC server listening on ${bindAddress}`)
			resolve(server)
		})
	})
}

/**
 * Creates a mock gRPC service implementation using Proxy
 * @param serviceName Name of the service for logging
 * @returns A proxy that implements the service interface
 */
function createMockService<T extends grpc.UntypedServiceImplementation>(_serviceName: string): T {
	const handler: ProxyHandler<T> = {
		get(_target, prop) {
			// Return a function that handles the gRPC call
			return (call: any, callback: any) => {
				// log(`Hostbridge: ${serviceName}.${String(prop)} called with:`, call.request)

				// Special cases that need specific return values
				switch (prop) {
					case "getWorkspacePaths":
						const workspaceDir = process.env.TEST_HOSTBRIDGE_WORKSPACE_DIR || "/test-workspace"
						callback(null, {
							paths: [workspaceDir],
						})
						return

					case "getMachineId":
						callback(null, {
							value: "fake-machine-id-" + os.hostname(),
						})
						return

					case "getTelemetrySettings":
						callback(null, {
							isEnabled: 2, // Setting.DISABLED
						})
						return

					case "clipboardReadText":
						callback(null, {
							value: "",
						})
						return

					case "getWebviewHtml":
						callback(null, {
							html: "<html><body>Fake Webview</body></html>",
						})
						return

					case "showTextDocument":
						callback(null, {
							document_path: call.request?.path || "",
							view_column: 1,
							is_active: true,
						})
						return

					case "openDiff":
						callback(null, {
							diff_id: "fake-diff-" + Date.now(),
						})
						return

					case "getDocumentText":
						callback(null, {
							content: "",
						})
						return

					case "getOpenTabs":
					case "getVisibleTabs":
					case "showOpenDialogue":
						callback(null, {
							paths: [],
						})
						return

					case "getDiagnostics":
						callback(null, {
							file_diagnostics: [],
						})
						return

					// For streaming methods (like subscribeToTelemetrySettings)
					case "subscribeToTelemetrySettings":
						// Just end the stream immediately
						call.end()
						return
				}

				// Default: return empty object for all other methods
				callback(null, {})
			}
		},
	}

	return new Proxy({} as T, handler)
}
