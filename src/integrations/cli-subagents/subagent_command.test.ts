import { describe, expect, it } from "vitest"
import { isSubagentCommand, transformClineCommand } from "./subagent_command"

describe("subagent_command", () => {
	describe("isSubagentCommand", () => {
		it("should detect cline commands", () => {
			expect(isSubagentCommand('cline "분석해줘"')).toBe(true)
			expect(isSubagentCommand("cline '분석해줘'")).toBe(true)
		})

		it("should detect careti commands", () => {
			expect(isSubagentCommand('careti "분석해줘"')).toBe(true)
			expect(isSubagentCommand("careti '분석해줘'")).toBe(true)
		})

		it("should not detect other commands", () => {
			expect(isSubagentCommand("ls -la")).toBe(false)
			expect(isSubagentCommand("npm install")).toBe(false)
			expect(isSubagentCommand("git status")).toBe(false)
		})
	})

	describe("transformClineCommand", () => {
		it("should transform cline commands with yolo settings", () => {
			const result = transformClineCommand('cline "분석해줘"')
			expect(result).toContain("cline")
			expect(result).toContain("-s yolo_mode_toggled=true")
			expect(result).toContain("-s max_consecutive_mistakes=6")
			expect(result).toContain("-F plain")
			expect(result).toContain("-y")
			expect(result).toContain("--oneshot")
		})

		it("should transform careti commands with yolo settings", () => {
			const result = transformClineCommand('careti "분석해줘"')
			expect(result).toContain("careti")
			expect(result).not.toContain("cline")
			expect(result).toContain("-s yolo_mode_toggled=true")
			expect(result).toContain("-s max_consecutive_mistakes=6")
			expect(result).toContain("-F plain")
			expect(result).toContain("-y")
			expect(result).toContain("--oneshot")
		})

		it("should preserve additional flags", () => {
			const result = transformClineCommand('careti "분석해줘" --workdir ./src')
			expect(result).toContain("--workdir ./src")
			expect(result).toContain("-s yolo_mode_toggled=true")
		})

		it("should not transform non-subagent commands", () => {
			expect(transformClineCommand("ls -la")).toBe("ls -la")
			expect(transformClineCommand("npm install")).toBe("npm install")
		})
	})
})
