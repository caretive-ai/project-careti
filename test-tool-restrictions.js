#!/usr/bin/env node

/**
 * Simple test script to verify tool restrictions work correctly
 */

// Import the mode registry
const { modeRegistry } = require("./caret-src/core/mode-system/ModeSystemRegistry.ts")

console.log("=== Testing Caret Tool Restrictions ===\n")

// Test 1: Chatbot mode (plan mode internally) restrictions
console.log("Test 1: Chatbot mode restrictions (plan mode)")
const restrictedTools = ["write_to_file", "replace_in_file", "execute_command"]
const allowedTools = ["read_file", "list_files", "str_replace_editor"]

restrictedTools.forEach((tool) => {
	const isRestricted = modeRegistry.isToolRestricted("caret", "plan", tool)
	const message = modeRegistry.getToolRestrictionMessage("caret", "plan", tool)
	console.log(`  ${tool}: ${isRestricted ? "RESTRICTED" : "ALLOWED"}`)
	if (isRestricted) {
		console.log(`    Message: "${message}"`)
	}
})

allowedTools.forEach((tool) => {
	const isRestricted = modeRegistry.isToolRestricted("caret", "plan", tool)
	console.log(`  ${tool}: ${isRestricted ? "RESTRICTED" : "ALLOWED"}`)
})

console.log("\nTest 2: Agent mode restrictions (act mode)")
// Test 2: Agent mode (act mode internally) - should allow all tools
;[...restrictedTools, ...allowedTools].forEach((tool) => {
	const isRestricted = modeRegistry.isToolRestricted("caret", "act", tool)
	console.log(`  ${tool}: ${isRestricted ? "RESTRICTED" : "ALLOWED"}`)
})

console.log("\nTest 3: Cline mode compatibility")
// Test 3: Cline mode should not restrict any tools (preserving original behavior)
;[...restrictedTools, ...allowedTools].forEach((tool) => {
	const isRestricted = modeRegistry.isToolRestricted("cline", "plan", tool)
	console.log(`  ${tool}: ${isRestricted ? "RESTRICTED" : "ALLOWED"}`)
})

console.log("\n=== Tool Restriction Tests Complete ===")
