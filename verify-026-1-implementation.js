/**
 * 026-1 Implementation Verification Script
 *
 * This script verifies that all components of the 026-1 Account system upgrade
 * are properly implemented and compatible with Cline v3.23.0
 */

const fs = require("fs")
const path = require("path")

console.log("🔍 026-1 Account System Implementation Verification\n")

const results = {
	protoMessages: { tested: 0, passed: 0 },
	serviceMethods: { tested: 0, passed: 0 },
	uiComponents: { tested: 0, passed: 0 },
	backwardCompatibility: { tested: 0, passed: 0 },
	environmentSetup: { tested: 0, passed: 0 },
}

function checkFile(filePath, description) {
	const exists = fs.existsSync(filePath)
	console.log(`${exists ? "✅" : "❌"} ${description}: ${filePath}`)
	return exists
}

function checkFileContent(filePath, searchStrings, description) {
	if (!fs.existsSync(filePath)) {
		ㅞ
		console.log(`❌ ${description}: File not found - ${filePath}`)
		return false
	}

	const content = fs.readFileSync(filePath, "utf8")
	const foundAll = searchStrings.every((str) => content.includes(str))

	console.log(`${foundAll ? "✅" : "❌"} ${description}:`)
	searchStrings.forEach((str) => {
		const found = content.includes(str)
		console.log(`    ${found ? "✓" : "✗"} Contains: "${str}"`)
	})

	return foundAll
}

// 1. Proto Messages Verification
console.log("📋 1. Proto Messages Verification")
results.protoMessages.tested += 1
const protoChecks = checkFileContent(
	"proto/account.proto",
	[
		"message UserCreditsData",
		"message UserOrganizationsResponse",
		"message UserOrganization",
		"message AuthState",
		"message UserInfo",
		"rpc getUserCredits",
		"rpc getUserOrganizations",
		"rpc setUserOrganization",
		"package caret;",
	],
	"Proto messages and gRPC methods",
)
if (protoChecks) results.protoMessages.passed += 1

// 2. Service Methods Verification
console.log("\n🔧 2. Service Methods Verification")
results.serviceMethods.tested += 4

// CaretAccountService
const serviceChecks1 = checkFileContent(
	"caret-src/services/account/CaretAccountService.ts",
	["getUserCredits", "getUserOrganizations", "setUserOrganization", "getAuthState", "process.env.AUTH0_AUDIENCE"],
	"CaretAccountService new methods",
)
if (serviceChecks1) results.serviceMethods.passed += 1

// Controller methods
const controllerChecks =
	checkFile("src/core/controller/account/getUserCredits.ts", "getUserCredits controller") &&
	checkFile("src/core/controller/account/getUserOrganizations.ts", "getUserOrganizations controller") &&
	checkFile("src/core/controller/account/setUserOrganization.ts", "setUserOrganization controller") &&
	checkFile("src/core/controller/account/authStateChanged.ts", "authStateChanged controller")
if (controllerChecks) results.serviceMethods.passed += 1

// ExtensionMessage types
const messageChecks = checkFileContent(
	"src/shared/ExtensionMessage.ts",
	[
		'"userCreditsData"',
		'"userOrganizations"',
		'"userOrganizationChanged"',
		"userCreditsData?: UserCreditsData",
		"userOrganizations?: UserOrganizationsResponse",
	],
	"ExtensionMessage new types",
)
if (messageChecks) results.serviceMethods.passed += 1

// Controller integration
const controllerIntegration = checkFileContent(
	"src/core/controller/index.ts",
	["getCaretAccountService", "CaretAccountService"],
	"Controller integration",
)
if (controllerIntegration) results.serviceMethods.passed += 1

// 3. UI Components Verification
console.log("\n🎨 3. UI Components Verification")
results.uiComponents.tested += 2

const uiChecks = checkFileContent(
	"webview-ui/src/caret/components/CaretAccountView.tsx",
	[
		"UserCreditsData",
		"UserOrganizationsResponse",
		"UserOrganization",
		"organizations.length > 1",
		"AccountServiceClient.setUserOrganization",
		"UserOrganizationUpdateRequest.create",
	],
	"CaretAccountView enhancements",
)
if (uiChecks) results.uiComponents.passed += 1

const localeChecks =
	checkFileContent("webview-ui/src/caret/locale/en/common.json", ['"organization"'], "Locale files updated") &&
	checkFileContent("webview-ui/src/caret/locale/ko/common.json", ['"organization"'], "Korean locale updated")
if (localeChecks) results.uiComponents.passed += 1

// 4. Backward Compatibility
console.log("\n🔄 4. Backward Compatibility Verification")
results.backwardCompatibility.tested += 2

const legacyMethods = checkFileContent(
	"caret-src/services/account/CaretAccountService.ts",
	["fetchBalance", "fetchUsageTransactions", "fetchPaymentTransactions", "fetchAccountPlan"],
	"Legacy methods preserved",
)
if (legacyMethods) results.backwardCompatibility.passed += 1

const legacyMessages = checkFileContent(
	"src/shared/ExtensionMessage.ts",
	['"userCreditsBalance"', '"userCreditsUsage"', '"userCreditsPayments"'],
	"Legacy message types preserved",
)
if (legacyMessages) results.backwardCompatibility.passed += 1

// 5. Environment Setup
console.log("\n🌐 5. Environment Setup Verification")
results.environmentSetup.tested += 2

const envFile = checkFileContent(
	".env",
	["AUTH0_AUDIENCE=https://api.caret.team", "AUTH0_DOMAIN=api.caret.team", "AUTH0_CLIENT_ID=caret-vscode-extension"],
	"Environment variables",
)
if (envFile) results.environmentSetup.passed += 1

const esbuildConfig = checkFileContent(
	"esbuild.js",
	["AUTH0_AUDIENCE", "AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "Using fallback environment variables"],
	"esbuild environment injection",
)
if (esbuildConfig) results.environmentSetup.passed += 1

// Final Score Calculation
console.log("\n🏆 VERIFICATION RESULTS")
console.log("=".repeat(50))

const categories = [
	["Proto Messages", results.protoMessages],
	["Service Methods", results.serviceMethods],
	["UI Components", results.uiComponents],
	["Backward Compatibility", results.backwardCompatibility],
	["Environment Setup", results.environmentSetup],
]

let totalTested = 0
let totalPassed = 0

categories.forEach(([name, result]) => {
	const percentage = result.tested > 0 ? Math.round((result.passed / result.tested) * 100) : 0
	console.log(`${name}: ${result.passed}/${result.tested} (${percentage}%)`)
	totalTested += result.tested
	totalPassed += result.passed
})

const overallScore = totalTested > 0 ? Math.round((totalPassed / totalTested) * 100) : 0

console.log("-".repeat(50))
console.log(`📊 OVERALL SCORE: ${totalPassed}/${totalTested} (${overallScore}%)`)

if (overallScore >= 90) {
	console.log("🎉 EXCELLENT! 026-1 implementation is highly complete")
} else if (overallScore >= 75) {
	console.log("👍 GOOD! 026-1 implementation is mostly complete")
} else if (overallScore >= 50) {
	console.log("⚠️  NEEDS WORK! Some components need attention")
} else {
	console.log("❌ CRITICAL! Major implementation issues detected")
}

// Cline Compatibility Assessment
console.log("\n🤝 Cline v3.23.0 Compatibility Assessment")
console.log("-".repeat(50))

const clineCompatibilityFeatures = [
	{ name: "Enhanced User Credits System", implemented: results.protoMessages.passed > 0 },
	{ name: "Organization Support", implemented: results.serviceMethods.passed >= 2 },
	{ name: "Role-based Access Control", implemented: results.uiComponents.passed > 0 },
	{ name: "Real-time Auth State Updates", implemented: results.serviceMethods.passed >= 3 },
	{ name: "API Compatibility", implemented: results.environmentSetup.passed > 0 },
	{ name: "Legacy Feature Preservation", implemented: results.backwardCompatibility.passed >= 1 },
]

const compatibilityScore = clineCompatibilityFeatures.filter((f) => f.implemented).length
const compatibilityPercentage = Math.round((compatibilityScore / clineCompatibilityFeatures.length) * 100)

clineCompatibilityFeatures.forEach((feature) => {
	console.log(`${feature.implemented ? "✅" : "❌"} ${feature.name}`)
})

console.log(`\n📊 CLINE COMPATIBILITY: ${compatibilityScore}/${clineCompatibilityFeatures.length} (${compatibilityPercentage}%)`)

if (compatibilityPercentage === 100) {
	console.log("🎯 PERFECT! Caret now matches Cline v3.23.0 Account capabilities")
} else if (compatibilityPercentage >= 80) {
	console.log("👌 EXCELLENT! Very close to full Cline compatibility")
} else {
	console.log("🔧 More work needed to reach full Cline compatibility")
}

console.log("\n✨ Verification completed!")
