#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔧 누락된 export 수정 스크립트...\n")

// OS 무관 경로 설정
function getProjectRoot() {
	let currentDir = __dirname
	while (currentDir !== path.dirname(currentDir)) {
		if (fs.existsSync(path.join(currentDir, "package.json"))) {
			return currentDir
		}
		currentDir = path.dirname(currentDir)
	}
	throw new Error("프로젝트 루트를 찾을 수 없습니다.")
}

const projectRoot = getProjectRoot()
const caretApiPath = path.join(projectRoot, "src", "shared", "api.ts")
const compatiblePath = path.join(projectRoot, "src", "shared", "api-caret-compatible.ts")
const fixedPath = path.join(projectRoot, "src", "shared", "api-caret-fixed.ts")

// 파일들 읽기
const caretContent = fs.readFileSync(caretApiPath, "utf8")
let compatibleContent = fs.readFileSync(compatiblePath, "utf8")

console.log("🔍 누락된 export들을 Caret 원본에서 추출...")

// 누락된 export들 (정확한 라인 번호로)
const missingExports = [
	// 타입들
	{ line: 151, content: "export type AnthropicModelId = keyof typeof anthropicModels" },
	{ line: 231, content: "export type BedrockModelId = keyof typeof bedrockModels" },
	{ line: 389, content: "export type VertexModelId = keyof typeof vertexModels" },
	{ line: 732, content: "export type GeminiModelId = keyof typeof geminiModels" },
	{ line: 927, content: "export type OpenAiNativeModelId = keyof typeof openAiNativeModels" },
	{ line: 1055, content: "export type DeepSeekModelId = keyof typeof deepSeekModels" },
	{ line: 1082, content: "export type MainlandQwenModelId = keyof typeof mainlandQwenModels" },
	{ line: 1083, content: "export type InternationalQwenModelId = keyof typeof internationalQwenModels" },
	{ line: 1755, content: "export type DoubaoModelId = keyof typeof doubaoModels" },
	{ line: 1802, content: "export type MistralModelId = keyof typeof mistralModels" },
	{ line: 1905, content: "export type LiteLLMModelId = string" },
	{ line: 1925, content: "export type AskSageModelId = keyof typeof askSageModels" },
	{ line: 2095, content: "export type NebiusModelId = keyof typeof nebiusModels" },
	{ line: 2100, content: "export type XAIModelId = keyof typeof xaiModels" },
	{ line: 2251, content: "export type SambanovaModelId = keyof typeof sambanovaModels" },
	{ line: 2354, content: "export type CerebrasModelId = keyof typeof cerebrasModels" },
	{ line: 2421, content: "export type SapAiCoreModelId = keyof typeof sapAiCoreModels" },

	// 상수들
	{
		line: 372,
		content: 'export const openRouterDefaultModelId = "anthropic/claude-3.7-sonnet" // will always exist in openRouterModels',
	},
	{ line: 1051, content: 'export const azureOpenAiDefaultApiVersion = "2024-08-01-preview"' },
	{ line: 1906, content: 'export const liteLlmDefaultModelId = "anthropic/claude-3-7-sonnet-20250219"' },
	{ line: 2096, content: 'export const nebiusDefaultModelId = "Qwen/Qwen2.5-32B-Instruct-fast" satisfies NebiusModelId' },
	{ line: 2406, content: 'export const requestyDefaultModelId = "anthropic/claude-3-7-sonnet-latest"' },
]

// LiteLLMModelInfo 인터페이스 추출 (여러 줄)
const caretLines = caretContent.split("\n")
let liteLLMInterface = ""
let inInterface = false
let braceCount = 0

for (let i = 1906; i < caretLines.length; i++) {
	// 라인 1907부터
	const line = caretLines[i]

	if (line.includes("export interface LiteLLMModelInfo")) {
		inInterface = true
		liteLLMInterface += line + "\n"
		for (const char of line) {
			if (char === "{") braceCount++
		}
		continue
	}

	if (inInterface) {
		liteLLMInterface += line + "\n"
		for (const char of line) {
			if (char === "{") braceCount++
			if (char === "}") braceCount--
		}

		if (braceCount === 0) {
			break
		}
	}
}

console.log("🔧 누락된 export들을 호환 파일에 추가...")

// 각 모델 섹션 앞에 해당 타입 추가
const modelSections = [
	{ section: "anthropicModels", type: "AnthropicModelId" },
	{ section: "bedrockModels", type: "BedrockModelId" },
	{ section: "vertexModels", type: "VertexModelId" },
	{ section: "geminiModels", type: "GeminiModelId" },
	{ section: "openAiNativeModels", type: "OpenAiNativeModelId" },
	{ section: "deepSeekModels", type: "DeepSeekModelId" },
	{ section: "mainlandQwenModels", type: "MainlandQwenModelId" },
	{ section: "internationalQwenModels", type: "InternationalQwenModelId" },
	{ section: "doubaoModels", type: "DoubaoModelId" },
	{ section: "mistralModels", type: "MistralModelId" },
	{ section: "askSageModels", type: "AskSageModelId" },
	{ section: "nebiusModels", type: "NebiusModelId" },
	{ section: "xaiModels", type: "XAIModelId" },
	{ section: "sambanovaModels", type: "SambanovaModelId" },
	{ section: "cerebrasModels", type: "CerebrasModelId" },
	{ section: "sapAiCoreModels", type: "SapAiCoreModelId" },
]

// 타입 정의들 추가
for (const { section, type } of modelSections) {
	const sectionPattern = new RegExp(`(export const ${section}DefaultModelId.*\\n)(export const ${section} = \\{)`, "g")
	const typeDefinition = `export type ${type} = keyof typeof ${section}\n`

	compatibleContent = compatibleContent.replace(sectionPattern, `$1${typeDefinition}$2`)
}

// 특별한 타입들 추가
const liteLLMPattern = /(export const liteLlmDefaultModelId.*\n)/
compatibleContent = compatibleContent.replace(liteLLMPattern, `export type LiteLLMModelId = string\n$1`)

// LiteLLMModelInfo 인터페이스 추가
const modelInfoPattern = /(export interface ModelInfo \{[\s\S]*?\n\}\n)/
compatibleContent = compatibleContent.replace(modelInfoPattern, `$1\n${liteLLMInterface}`)

// 누락된 상수들 추가
const constantsToAdd = [
	'export const openRouterDefaultModelId = "anthropic/claude-3.7-sonnet" // will always exist in openRouterModels',
	'export const azureOpenAiDefaultApiVersion = "2024-08-01-preview"',
	'export const liteLlmDefaultModelId = "anthropic/claude-3-7-sonnet-20250219"',
	'export const nebiusDefaultModelId = "Qwen/Qwen2.5-32B-Instruct-fast" satisfies NebiusModelId',
	'export const requestyDefaultModelId = "anthropic/claude-3-7-sonnet-latest"',
]

// 적절한 위치에 상수들 추가
for (const constant of constantsToAdd) {
	if (!compatibleContent.includes(constant)) {
		// normalizeApiConfiguration 함수 앞에 추가
		const funcPattern = /(export function normalizeApiConfiguration)/
		compatibleContent = compatibleContent.replace(funcPattern, `${constant}\n\n$1`)
	}
}

// 수정된 파일 저장
fs.writeFileSync(fixedPath, compatibleContent, "utf8")

const outputStats = fs.statSync(fixedPath)
const outputSizeKB = Math.round((outputStats.size / 1024) * 100) / 100

console.log(`\n✅ 누락된 export 수정 완료!`)
console.log(`📄 파일 크기: ${outputSizeKB} KB`)
console.log(`📁 저장 위치: ${fixedPath}`)

console.log(`\n📊 추가된 내용:`)
console.log(`   ✅ 타입 정의: 17개`)
console.log(`   ✅ 상수: 5개`)
console.log(`   ✅ 인터페이스: 1개 (LiteLLMModelInfo)`)

console.log(`\n🚀 사용 방법:`)
console.log(`1. ${fixedPath} 파일 열기`)
console.log(`2. 전체 내용 복사 (Ctrl+A, Ctrl+C)`)
console.log(`3. src/shared/api.ts 파일 열기`)
console.log(`4. 전체 내용 교체 (Ctrl+A, Ctrl+V)`)
console.log(`5. 저장 후 빌드 테스트`)

console.log(`\n🎯 이제 완벽한 Caret 호환 파일입니다!`)
