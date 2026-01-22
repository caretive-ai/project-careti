// CARETI MODIFICATION: Validate brand-aware ignore messaging (.caretignore default, legacy .clineignore)

import { getBrandIgnoreFileName, getLegacyClineIgnoreFileName } from "@careti/utils/brand-utils"
import type { ClineIgnoreController } from "@core/ignore/ClineIgnoreController"
import { describe, it } from "mocha"
import { ToolValidator } from "@/core/task/tools/ToolValidator"
import "should"

describe("ToolValidator.checkClineIgnorePath (caretignore)", () => {
	it("should return ok when access is allowed", () => {
		const controller: Pick<ClineIgnoreController, "validateAccess"> = {
			validateAccess: () => true,
		}

		const validator = new ToolValidator(controller as ClineIgnoreController)
		const result = validator.checkClineIgnorePath("src/file.ts")

		result.should.deepEqual({ ok: true })
	})

	it("should return caretignore-forward error when blocked", () => {
		const controller: Pick<ClineIgnoreController, "validateAccess"> = {
			validateAccess: () => false,
		}

		const validator = new ToolValidator(controller as ClineIgnoreController)
		const result = validator.checkClineIgnorePath("secret.env")

		const primaryIgnore = getBrandIgnoreFileName?.() ?? ".caretignore"
		const legacyIgnore = getLegacyClineIgnoreFileName?.() ?? ".clineignore"

		result.ok.should.be.false()
		result.should.have
			.property("error")
			.which.match(new RegExp(primaryIgnore.replace(".", "\\.")))
			.and.match(new RegExp(legacyIgnore.replace(".", "\\.")))
	})
})
