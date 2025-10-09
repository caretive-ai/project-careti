// CARET MODIFICATION: Removed node-machine-id dependency
import { expect } from "chai"
import { afterEach, beforeEach, describe, it } from "mocha"
import * as sinon from "sinon"
import * as vscode from "vscode"
import { _GENERATED_MACHINE_ID_KEY, getDistinctId, initializeDistinctId, setDistinctId } from "@/services/logging/distinctId"

describe("distinctId", () => {
	let sandbox: sinon.SinonSandbox
	let mockContext: vscode.ExtensionContext
	let mockGlobalState: any

	const MOCK_GLOBAL_STATE_ID = "existing-distinct-id-123"
	const MOCK_MACHINE_ID = "machine-id-456"
	const MOCK_UUID = "mock-uuid-12345678-1234-1234-1234-123456789012"
	const GENERATED_MACHINE_ID = "cl-" + MOCK_UUID

	const mockUuidGenerator = () => MOCK_UUID

	beforeEach(() => {
		sandbox = sinon.createSandbox()

		// Mock global state
		mockGlobalState = { get: sandbox.stub(), update: sandbox.stub() }

		// Mock extension context
		mockContext = { globalState: mockGlobalState } as unknown as vscode.ExtensionContext

		// Reset the distinctId module state
		setDistinctId("")
	})

	afterEach(() => {
		sandbox.restore()
	})

	it("should use id from extension globalstate if it exists", async () => {
		mockGlobalState.get.withArgs(_GENERATED_MACHINE_ID_KEY).returns(MOCK_GLOBAL_STATE_ID)
		// CARET MODIFICATION: No need to stub vscode.env as we prioritize globalState

		await initializeDistinctId(mockContext, mockUuidGenerator)

		expect(getDistinctId()).to.equal(MOCK_GLOBAL_STATE_ID)
		expect(mockGlobalState.update.notCalled).to.be.true
	})

	it("should use the machine ID from vscode.env", async () => {
		// CARET MODIFICATION: Mock vscode.env.machineId instead of node-machine-id
		sandbox.stub(vscode.env, "machineId").value(MOCK_MACHINE_ID)

		await initializeDistinctId(mockContext, mockUuidGenerator)

		expect(getDistinctId()).to.equal(MOCK_MACHINE_ID)
		expect(mockGlobalState.update.notCalled).to.be.true
	})

	it("distinct ID should be stable", async () => {
		mockGlobalState.get.withArgs(_GENERATED_MACHINE_ID_KEY).returns(undefined)
		// CARET MODIFICATION: Mock vscode.env.machineId instead of node-machine-id
		sandbox.stub(vscode.env, "machineId").value(MOCK_MACHINE_ID)

		await initializeDistinctId(mockContext, mockUuidGenerator)
		expect(getDistinctId()).to.equal(MOCK_MACHINE_ID)

		await initializeDistinctId(mockContext, mockUuidGenerator)
		expect(getDistinctId()).to.equal(MOCK_MACHINE_ID)

		expect(mockGlobalState.update.notCalled).to.be.true
	})

	it("should generate and store UUID if vscode.env.machineId returns empty string", async () => {
		mockGlobalState.get.withArgs(_GENERATED_MACHINE_ID_KEY).returns(undefined)
		// CARET MODIFICATION: Mock vscode.env.machineId to return empty string
		sandbox.stub(vscode.env, "machineId").value("")

		await initializeDistinctId(mockContext, mockUuidGenerator)

		expect(getDistinctId()).to.equal(GENERATED_MACHINE_ID)
		// CARET MODIFICATION: No machineIdStub to check
		expect(mockGlobalState.update.calledWith(_GENERATED_MACHINE_ID_KEY, GENERATED_MACHINE_ID)).to.be.true
	})

	it("should handle vscode.env.machineId errors gracefully", async () => {
		mockGlobalState.get.withArgs(_GENERATED_MACHINE_ID_KEY).returns(undefined)
		// CARET MODIFICATION: Mock vscode.env to throw error when accessing machineId
		sandbox.stub(vscode.env, "machineId").get(() => {
			throw new Error("Failed to get machine ID")
		})

		await initializeDistinctId(mockContext, mockUuidGenerator)

		expect(getDistinctId()).to.equal(GENERATED_MACHINE_ID)
		// CARET MODIFICATION: No machineIdStub to check
		expect(mockGlobalState.update.calledWith(_GENERATED_MACHINE_ID_KEY, GENERATED_MACHINE_ID)).to.be.true
	})
})
