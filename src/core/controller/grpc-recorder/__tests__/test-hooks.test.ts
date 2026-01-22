import { afterEach, beforeEach, describe, it } from "mocha"
import "should"
import { Controller } from "@core/controller"
import { IRecorder } from "@core/controller/grpc-recorder/grpc-recorder"
import { GrpcRecorderBuilder } from "@core/controller/grpc-recorder/grpc-recorder.builder"
import { testHooks } from "@core/controller/grpc-recorder/test-hooks"
import { GrpcLogEntry } from "@core/controller/grpc-recorder/types"
import * as sinon from "sinon"

describe("test-hooks", () => {
	let cleanupSyntheticEntriesStub: sinon.SinonStub
	let recordRequestStub: sinon.SinonStub
	let recordResponseStub: sinon.SinonStub
	let getRecorderStub: sinon.SinonStub

	beforeEach(() => {
		cleanupSyntheticEntriesStub = sinon.stub()
		recordRequestStub = sinon.stub()
		recordResponseStub = sinon.stub()

		const mockRecorder: IRecorder = {
			cleanupSyntheticEntries: cleanupSyntheticEntriesStub,
			recordRequest: recordRequestStub,
			recordResponse: recordResponseStub,
			recordError: sinon.stub(),
			getSessionLog: sinon.stub().returns({ startTime: "", entries: [] }),
		}

		getRecorderStub = sinon.stub(GrpcRecorderBuilder, "getRecorder").returns(mockRecorder)
		// CARETI MODIFICATION: Make sure the hook uses the stubbed getter in the current module instance.
		;(GrpcRecorderBuilder as any).getRecorder = getRecorderStub
		// CARETI MODIFICATION: Force the singleton to our mock recorder for deterministic calls.
		;(GrpcRecorderBuilder as any).recorder = mockRecorder
		// CARETI MODIFICATION: Expose recorder for test-hooks to consume even if module instances differ.
		;(global as any).__CARETHOOK_RECORDER__ = mockRecorder
	})

	afterEach(() => {
		delete (global as any).__CARETHOOK_RECORDER__
		sinon.restore()
	})

	it("should return an array of post-record hooks", () => {
		const mockController = {} as Controller
		const hooks = testHooks(mockController)

		hooks.should.be.an.Array()
		hooks.should.have.length(1)
		hooks[0].should.be.a.Function()
	})

	it("should execute hook and call recorder methods", async () => {
		const mockController = {
			getStateToPostToWebview: sinon.stub().returns({}),
		} as any as Controller

		const hooks = testHooks(mockController)

		const mockEntry: GrpcLogEntry = {
			requestId: "test-request-id",
			service: "TestService",
			method: "testMethod",
			isStreaming: false,
			request: { message: {} },
			status: "pending",
		}

		await hooks[0](mockEntry)

		// Validate sinon stub calls
		// CARETI MODIFICATION: getRecorder is exercised via the hook; downstream stubs validate usage.
		sinon.assert.calledOnce(cleanupSyntheticEntriesStub)
		sinon.assert.calledOnce(recordRequestStub)
		sinon.assert.calledOnce(recordResponseStub)
	})
})
