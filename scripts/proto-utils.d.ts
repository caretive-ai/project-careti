// CARET MODIFICATION: Proto helper type declarations for build scripts.
declare module "./proto-utils.mjs" {
	import type { PackageDefinition, ServiceDefinition } from "@grpc/proto-loader"
	// Some helpers return `any` for grpc responses so keep types open for now.
	export function getPackageDefinition(): Promise<PackageDefinition>
	export function loadProtoDescriptorSet(): Promise<Record<string, unknown>>
	export function loadServicesFromProtoDescriptor(): Promise<{
		protobusServices: Array<{ name: string; def: ServiceDefinition; pkg: string }>
		hostServices: Record<string, ServiceDefinition>
	}>
	export function getFqn(name: string): string
}
