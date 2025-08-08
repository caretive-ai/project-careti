#!/usr/bin/env node

import * as fs from "fs/promises"
import * as path from "path"
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader"

const DESCRIPTOR_SET = path.resolve("dist-standalone/proto/descriptor_set.pb")

const typeNameToFQN = new Map()

function addTypeNameToFqn(name, fqn) {
	if (typeNameToFQN.has(name) && typeNameToFQN.get(name) !== fqn) {
		throw new Error(`Proto type ${name} redefined (${fqn}).`)
	}
	typeNameToFQN.set(name, fqn)
}
// Get the fully qualified name for a proto type, e.g. getFqn('StringRequest') returns 'cline.StringRequest'
export function getFqn(name) {
	if (!typeNameToFQN.has(name)) {
		throw Error(`No FQN for ${name}`)
	}
	return typeNameToFQN.get(name)
}

export async function loadProtoDescriptorSet() {
	const descriptorBuffer = await fs.readFile(DESCRIPTOR_SET)
	const packageDefinition = protoLoader.loadFileDescriptorSetFromBuffer(descriptorBuffer)
	return grpc.loadPackageDefinition(packageDefinition)
}

export async function loadServicesFromProtoDescriptor() {
	// Load service definitions from descriptor set
	const proto = await loadProtoDescriptorSet()
	// console.log("Inspecting proto object structure:", JSON.stringify(proto, null, 2))

	// Extract host services and proto messages from the proto definition
	const hostServices = {}
	const protobusServices = {}
	// CARET MODIFICATION: Properly separate host services (Window, Env, Watch, Diff, Workspace) from protobus services
	const hostServiceNames = new Set(["WindowService", "EnvService", "WatchService", "DiffService", "WorkspaceService"])
	
	for (const [name, def] of Object.entries(proto.caret)) {
		if (def && "service" in def) {
			if (hostServiceNames.has(name)) {
				hostServices[name] = def
			} else {
				protobusServices[name] = def
			}
		} else {
			addTypeNameToFqn(name, `proto.caret.${name}`)
		}
	}
	return { protobusServices, hostServices }
}
