// CARET MODIFICATION: TDD 회귀 테스트 - 슬래시 커맨드(/)를 메시지 어디서든 인식해야 함

import { expect } from "chai"
import fs from "fs/promises"
import { describe, it } from "mocha"
import os from "os"
import path from "path"
import type { ApiProviderInfo } from "@/core/api"
import { parseSlashCommands } from "../index"

describe("parseSlashCommands", () => {
	const providerInfo: ApiProviderInfo = {
		providerId: "openai-native",
		model: {
			id: "gpt-4o-mini",
			// info는 matcher에서 직접 사용하지 않으므로 최소 필드만 채움
			info: { supportsPromptCache: false },
		},
	}

	it("슬래시 커맨드가 태그 콘텐츠 중간에 있어도 처리한다", async () => {
		const input = "<user_message>Hello /newtask world</user_message>"
		const { processedText } = await parseSlashCommands(input, {}, {}, "ulid_test", { enabled: false }, false, providerInfo)

		expect(processedText).to.not.equal(input)
		expect(processedText.includes("/newtask")).to.equal(false)
	})

	it("URL/경로 내부의 슬래시는 커맨드로 오인하지 않는다", async () => {
		const input = "<user_message>https://example.com/newtask</user_message>"
		const { processedText } = await parseSlashCommands(input, {}, {}, "ulid_test", { enabled: false }, false, providerInfo)
		expect(processedText).to.equal(input)
	})

	it("/init 커맨드가 표준 템플릿을 스캐폴드한다", async () => {
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "agents-init-"))
		try {
			const input = "<user_message>/init</user_message>"
			const { processedText } = await parseSlashCommands(
				input,
				{},
				{},
				"ulid_test",
				{ enabled: false },
				false,
				providerInfo,
				tempDir,
			)

			expect(processedText.includes("/init")).to.equal(false)

			const requiredPaths = [
				"AGENTS.md",
				path.join(".agents", "context", "caret-rules.json"),
				path.join(".agents", "context", "caret-rules.md"),
				path.join(".agents", "context", "ai-work-index.yaml"),
				path.join(".agents", "context", "workflows", "agents-init.md"),
				path.join(".agents", "context", "workflows", "README.md"),
			]

			for (const relPath of requiredPaths) {
				const fullPath = path.join(tempDir, relPath)
				const stat = await fs.stat(fullPath)
				expect(stat.isFile()).to.equal(true)
			}
		} finally {
			await fs.rm(tempDir, { recursive: true, force: true })
		}
	})
})
