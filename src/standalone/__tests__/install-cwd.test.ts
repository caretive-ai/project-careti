// CARETI MODIFICATION: TDD 회귀 테스트 - Standalone 실행 시 cwd를 설치 디렉토리로 보장

import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect } from "chai"
import { describe, it } from "mocha"
import { setStandaloneInstallDirCwd } from "../install-cwd"

describe("setStandaloneInstallDirCwd", () => {
	it("지정한 설치 디렉토리로 process.cwd()를 이동시킨다", () => {
		const originalCwd = process.cwd()
		const installDir = mkdtempSync(join(tmpdir(), "careti-standalone-install-"))

		try {
			const newCwd = setStandaloneInstallDirCwd(installDir)
			expect(newCwd).to.equal(installDir)
			expect(process.cwd()).to.equal(installDir)
		} finally {
			process.chdir(originalCwd)
		}
	})
})
