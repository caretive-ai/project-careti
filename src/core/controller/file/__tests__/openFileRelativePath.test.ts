import { Controller } from "@core/controller"
import { workspaceResolver } from "@core/workspace"
import * as openFileIntegration from "@integrations/misc/open-file"
import { Empty, StringRequest } from "@shared/proto/cline/common"
import * as pathUtils from "@utils/path"
import { expect } from "chai"
import { afterEach, beforeEach, describe, it } from "mocha"
import * as fsPromises from "fs/promises"
import os from "os"
import * as path from "path"
import * as sinon from "sinon"
import { HostProvider } from "@/hosts/host-provider"
import { Logger } from "@/services/logging/Logger"
import { openFileRelativePath } from "../openFileRelativePath"

describe("openFileRelativePath", () => {
	let sandbox: sinon.SinonSandbox
	let mockController: Controller
	let openFileIntegrationStub: sinon.SinonStub
	let getWorkspacePathStub: sinon.SinonStub
	let loggerErrorStub: sinon.SinonStub

	beforeEach(() => {
		sandbox = sinon.createSandbox()

		// CARET MODIFICATION: Initialize HostProvider for Logger usage.
		HostProvider.reset()
		HostProvider.initialize(
			() => ({}) as any,
			() => ({}) as any,
			{
				workspaceClient: {
					getWorkspacePaths: async () => ({ paths: [] }),
				} as any,
				envClient: {} as any,
				windowClient: {} as any,
				diffClient: {} as any,
			},
			() => {},
			async () => "",
			async () => "",
			"",
			"",
		)

		// Create a mock controller
		mockController = {
			getWorkspaceManager: () => ({ getRoots: () => [] }),
			stateManager: { getGlobalStateKey: () => undefined },
		} as any

		// Stub the openFileIntegration function
		openFileIntegrationStub = sandbox.stub(openFileIntegration, "openFile")

		// Stub getWorkspacePath utility
		getWorkspacePathStub = sandbox.stub(pathUtils, "getWorkspacePath")

		// CARET MODIFICATION: Stub Logger.error for assertions and to avoid HostProvider output coupling.
		loggerErrorStub = sandbox.stub(Logger, "error")
	})

	afterEach(() => {
		sandbox.restore()
	})

	it("should return Empty response on successful execution", async () => {
		getWorkspacePathStub.resolves("/workspace")

		const request = StringRequest.create({
			value: "src/test.ts",
		})

		const result = await openFileRelativePath(mockController, request)

		expect(result).to.deep.equal(Empty.create())
	})

	it("should call openFileIntegration with absolute path when relative path is provided", async () => {
		const workspacePath = await fsPromises.mkdtemp(path.join(os.tmpdir(), "open-file-test-"))
		const relativePath = "src/components/Test.tsx"
		const expectedAbsolutePath = path.resolve(workspacePath, relativePath)

		try {
			await fsPromises.mkdir(path.dirname(expectedAbsolutePath), { recursive: true })
			await fsPromises.writeFile(expectedAbsolutePath, "test")
			getWorkspacePathStub.resolves(workspacePath)
			sandbox.stub(workspaceResolver, "resolveWorkspacePath").returns(expectedAbsolutePath)

			const request = StringRequest.create({
				value: relativePath,
			})

			await openFileRelativePath(mockController, request)

			expect(openFileIntegrationStub.calledOnceWith(expectedAbsolutePath)).to.be.true
		} finally {
			await fsPromises.rm(workspacePath, { recursive: true, force: true })
		}
	})

	it("should not call openFileIntegration when path is invalid", async () => {
		getWorkspacePathStub.resolves("/workspace")

		const invalidPaths = ["", undefined]

		for (const invalidPath of invalidPaths) {
			const request = StringRequest.create({
				value: invalidPath,
			})

			await openFileRelativePath(mockController, request)

			expect(openFileIntegrationStub.called).to.be.false
			openFileIntegrationStub.resetHistory()
		}
	})

	it("should return Empty and log error when no workspace path is available", async () => {
		const noWorkspaceScenarios = [null, undefined]

		for (const workspaceValue of noWorkspaceScenarios) {
			getWorkspacePathStub.resolves(workspaceValue)
			loggerErrorStub.resetHistory()

			const request = StringRequest.create({
				value: "src/test.ts",
			})

			const result = await openFileRelativePath(mockController, request)

			expect(result).to.deep.equal(Empty.create())
			expect(loggerErrorStub.called).to.be.true
			expect(openFileIntegrationStub.called).to.be.false
		}
	})

	it("should handle nested directory paths", async () => {
		const workspacePath = await fsPromises.mkdtemp(path.join(os.tmpdir(), "open-file-test-"))
		const relativePath = "src/components/ui/Button/Button.tsx"
		const expectedAbsolutePath = path.resolve(workspacePath, relativePath)

		try {
			await fsPromises.mkdir(path.dirname(expectedAbsolutePath), { recursive: true })
			await fsPromises.writeFile(expectedAbsolutePath, "test")
			getWorkspacePathStub.resolves(workspacePath)
			sandbox.stub(workspaceResolver, "resolveWorkspacePath").returns(expectedAbsolutePath)

			const request = StringRequest.create({
				value: relativePath,
			})

			await openFileRelativePath(mockController, request)

			expect(openFileIntegrationStub.calledOnceWith(expectedAbsolutePath)).to.be.true
		} finally {
			await fsPromises.rm(workspacePath, { recursive: true, force: true })
		}
	})
})
