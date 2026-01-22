/**
 * VSCode API extensions for newer features not yet in the base VSCode types
 *
 * This file consolidates all VSCode module augmentations to prevent type conflicts.
 * Originally scattered across multiple files, now centralized for consistency.
 */

import type { LanguageModelChatSelector as LanguageModelChatSelectorFromTypes } from "@core/api/providers/types"
import * as vscode from "vscode"

declare module "vscode" {
	// Language Model API types (from vscode-lm.ts)
	// Extracted from https://github.com/microsoft/vscode/blob/131ee0ef660d600cd0a7e6058375b281553abe20/src/vscode-dts/vscode.d.ts
	enum LanguageModelChatMessageRole {
		User = 1,
		Assistant = 2,
	}

	enum LanguageModelChatToolMode {
		Auto = 1,
		Required = 2,
	}

	interface LanguageModelChatSelector extends LanguageModelChatSelectorFromTypes {}

	interface LanguageModelChatTool {
		name: string
		description: string
		inputSchema?: object
	}

	interface LanguageModelChatRequestOptions {
		justification?: string
		modelOptions?: { [name: string]: any }
		tools?: LanguageModelChatTool[]
		toolMode?: LanguageModelChatToolMode
	}

	class LanguageModelTextPart {
		value: string
		constructor(value: string)
	}

	class LanguageModelToolCallPart {
		callId: string
		name: string
		input: object
		constructor(callId: string, name: string, input: object)
	}

	class LanguageModelPromptTsxPart {
		value: unknown
		constructor(value: unknown)
	}

	class LanguageModelToolResultPart {
		callId: string
		content: (LanguageModelTextPart | LanguageModelPromptTsxPart)[]
		constructor(callId: string, content: (LanguageModelTextPart | LanguageModelPromptTsxPart)[])
	}

	interface LanguageModelChatResponse {
		text: AsyncIterable<string>
		stream: AsyncIterable<LanguageModelTextPart | LanguageModelToolCallPart | unknown>
	}

	class LanguageModelChatMessage {
		static User(
			content: string | Array<LanguageModelTextPart | LanguageModelToolResultPart>,
			name?: string,
		): LanguageModelChatMessage
		static Assistant(
			content: string | Array<LanguageModelTextPart | LanguageModelToolCallPart>,
			name?: string,
		): LanguageModelChatMessage

		role: LanguageModelChatMessageRole
		content: Array<LanguageModelTextPart | LanguageModelToolResultPart | LanguageModelToolCallPart>
		name: string | undefined

		constructor(
			role: LanguageModelChatMessageRole,
			content: string | Array<LanguageModelTextPart | LanguageModelToolResultPart | LanguageModelToolCallPart>,
			name?: string,
		)
	}

	// Terminal Integration types (from TerminalManager.ts)
	// https://github.com/microsoft/vscode/blob/f0417069c62e20f3667506f4b7e53ca0004b4e3e/src/vscode-dts/vscode.d.ts#L7442
	interface Terminal {
		shellIntegration?: {
			cwd?: vscode.Uri
			executeCommand?: (command: string) => {
				read: () => AsyncIterable<string>
			}
		}
	}

	// https://github.com/microsoft/vscode/blob/f0417069c62e20f3667506f4b7e53ca0004b4e3e/src/vscode-dts/vscode.d.ts#L10794
	interface Window {
		onDidStartTerminalShellExecution?: (
			listener: (e: any) => any,
			thisArgs?: any,
			disposables?: vscode.Disposable[],
		) => vscode.Disposable
	}
}
