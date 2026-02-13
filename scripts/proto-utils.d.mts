import type * as grpc from "@grpc/grpc-js"
import type * as protoLoader from "@grpc/proto-loader"

export function getFqn(name: string): string
export function getPackageDefinition(): Promise<protoLoader.PackageDefinition>
export function loadProtoDescriptorSet(): Promise<grpc.GrpcObject>
export function loadServicesFromProtoDescriptor(): Promise<{
	protobusServices: Array<{ name: string; def: grpc.ServiceClientConstructor; pkg: string }>
	hostServices: Record<string, grpc.ServiceClientConstructor>
}>
