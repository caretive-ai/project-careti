// CARETI MODIFICATION: TDD 회귀 테스트 - 토큰 갱신 중 네트워크 오류가 나도 로그아웃(세션 초기화)되지 않도록 보장

import { expect } from "chai"
import { describe, it } from "mocha"
import * as sinon from "sinon"
import type { Controller } from "@/core/controller"
import type { ClineAuthInfo } from "../../AuthService"
import { ClineAuthProvider } from "../ClineAuthProvider"

describe("ClineAuthProvider", () => {
	it("토큰 갱신 중 네트워크 오류가 발생해도 저장된 인증 정보를 유지해야 한다", async () => {
		const provider = new ClineAuthProvider()

		const storedAuthData: ClineAuthInfo = {
			idToken: "header.payload.signature",
			refreshToken: "refresh-token",
			expiresAt: 0,
			provider: "cline",
			userInfo: {
				createdAt: new Date().toISOString(),
				displayName: "Test User",
				email: "test@example.com",
				id: "user_123",
				organizations: [],
			},
		}

		const getSecretKey = sinon.stub().withArgs("cline:clineAccountId").returns(JSON.stringify(storedAuthData))
		const setSecret = sinon.stub()

		const controller = {
			stateManager: {
				getSecretKey,
				setSecret,
			},
		} as unknown as Controller

		sinon.stub(provider, "shouldRefreshIdToken").resolves(true)
		sinon.stub(provider, "refreshToken").rejects(new TypeError("fetch failed"))

		const result = await provider.retrieveClineAuthInfo(controller)

		expect(result).to.deep.equal(storedAuthData)
		expect(setSecret.calledWith("cline:clineAccountId", undefined)).to.equal(false)
	})
})
