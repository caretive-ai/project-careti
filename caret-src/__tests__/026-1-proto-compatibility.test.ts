/**
 * Test 026-1: Proto Message Compatibility Test
 *
 * Purpose: Verify that Caret's Account proto messages are compatible with Cline's latest version
 * and that all new functionality is properly implemented.
 */

import {
	UserCreditsData,
	UserOrganizationsResponse,
	UserOrganization,
	AuthState,
	UserInfo,
	UsageTransaction,
	PaymentTransaction,
	OrganizationCreditsData,
	UserCreditsBalance,
	UserOrganizationUpdateRequest,
	GetOrganizationCreditsRequest,
	AuthStateChangedRequest,
} from "@shared/proto/account"

describe("026-1 Proto Message Compatibility", () => {
	describe("✅ Core Proto Message Creation", () => {
		test("UserCreditsData can be created with all required fields", () => {
			const creditsData = UserCreditsData.create({
				balance: { currentBalance: 100.5 },
				usageTransactions: [],
				paymentTransactions: [],
			})

			expect(creditsData).toBeDefined()
			expect(creditsData.balance?.currentBalance).toBe(100.5)
			expect(Array.isArray(creditsData.usageTransactions)).toBe(true)
			expect(Array.isArray(creditsData.paymentTransactions)).toBe(true)
		})

		test("UserOrganization can be created with proper role structure", () => {
			const organization = UserOrganization.create({
				active: true,
				memberId: "member-123",
				name: "Caret Team",
				organizationId: "org-456",
				roles: ["admin", "developer"],
			})

			expect(organization.active).toBe(true)
			expect(organization.name).toBe("Caret Team")
			expect(organization.roles).toContain("admin")
			expect(organization.roles).toContain("developer")
		})

		test("AuthState can be created with UserInfo", () => {
			const userInfo = UserInfo.create({
				uid: "user-789",
				displayName: "Test User",
				email: "test@caret.team",
				appBaseUrl: "https://app.caret.team",
			})

			const authState = AuthState.create({
				user: userInfo,
			})

			expect(authState.user?.uid).toBe("user-789")
			expect(authState.user?.displayName).toBe("Test User")
			expect(authState.user?.email).toBe("test@caret.team")
		})
	})

	describe("✅ Transaction Data Structures", () => {
		test("UsageTransaction contains all required fields", () => {
			const transaction = UsageTransaction.create({
				aiInferenceProviderName: "anthropic",
				aiModelName: "claude-3.5-sonnet",
				aiModelTypeName: "chat",
				completionTokens: 150,
				costUsd: 0.75,
				createdAt: "2025-08-12T10:30:00Z",
				creditsUsed: 1.5,
				generationId: "gen-123",
				organizationId: "org-456",
				promptTokens: 100,
				totalTokens: 250,
				userId: "user-789",
			})

			expect(transaction.aiInferenceProviderName).toBe("anthropic")
			expect(transaction.aiModelName).toBe("claude-3.5-sonnet")
			expect(transaction.completionTokens).toBe(150)
			expect(transaction.costUsd).toBe(0.75)
			expect(transaction.creditsUsed).toBe(1.5)
		})

		test("PaymentTransaction structure is complete", () => {
			const payment = PaymentTransaction.create({
				paidAt: "2025-08-12T09:00:00Z",
				creatorId: "user-789",
				amountCents: 2000,
				credits: 20.0,
			})

			expect(payment.paidAt).toBe("2025-08-12T09:00:00Z")
			expect(payment.amountCents).toBe(2000)
			expect(payment.credits).toBe(20.0)
		})
	})

	describe("✅ Request/Response Messages", () => {
		test("UserOrganizationUpdateRequest can be created", () => {
			const request = UserOrganizationUpdateRequest.create({
				organizationId: "org-456",
			})

			expect(request.organizationId).toBe("org-456")
		})

		test("GetOrganizationCreditsRequest can be created", () => {
			const request = GetOrganizationCreditsRequest.create({
				organizationId: "org-789",
			})

			expect(request.organizationId).toBe("org-789")
		})

		test("UserOrganizationsResponse can contain multiple organizations", () => {
			const org1 = UserOrganization.create({
				active: true,
				memberId: "member-1",
				name: "Team A",
				organizationId: "org-1",
				roles: ["member"],
			})

			const org2 = UserOrganization.create({
				active: false,
				memberId: "member-2",
				name: "Team B",
				organizationId: "org-2",
				roles: ["admin"],
			})

			const response = UserOrganizationsResponse.create({
				organizations: [org1, org2],
			})

			expect(response.organizations).toHaveLength(2)
			expect(response.organizations[0].name).toBe("Team A")
			expect(response.organizations[1].name).toBe("Team B")
		})
	})

	describe("✅ Serialization/Deserialization", () => {
		test("Proto messages can be serialized and deserialized", () => {
			const original = UserCreditsData.create({
				balance: { currentBalance: 42.75 },
				usageTransactions: [
					UsageTransaction.create({
						aiInferenceProviderName: "openai",
						aiModelName: "gpt-4",
						aiModelTypeName: "chat",
						completionTokens: 200,
						costUsd: 1.2,
						createdAt: "2025-08-12T11:00:00Z",
						creditsUsed: 2.4,
						generationId: "gen-456",
						organizationId: "org-789",
						promptTokens: 150,
						totalTokens: 350,
						userId: "user-123",
					}),
				],
				paymentTransactions: [],
			})

			// Serialize to binary
			const binary = UserCreditsData.encode(original).finish()

			// Deserialize back
			const deserialized = UserCreditsData.decode(binary)

			expect(deserialized.balance?.currentBalance).toBe(42.75)
			expect(deserialized.usageTransactions).toHaveLength(1)
			expect(deserialized.usageTransactions[0].aiModelName).toBe("gpt-4")
		})

		test("JSON conversion works correctly", () => {
			const authState = AuthState.create({
				user: UserInfo.create({
					uid: "user-999",
					displayName: "JSON Test",
					email: "json@test.com",
				}),
			})

			// Convert to JSON
			const json = AuthState.toJSON(authState)

			// Convert back from JSON
			const fromJson = AuthState.fromJSON(json)

			expect(fromJson.user?.uid).toBe("user-999")
			expect(fromJson.user?.displayName).toBe("JSON Test")
			expect(fromJson.user?.email).toBe("json@test.com")
		})
	})

	describe("🔍 Cline Compatibility Check", () => {
		test("All proto message fields match Cline v3.23.0 spec", () => {
			// This test ensures our proto messages have all the fields that Cline expects

			// UserCreditsData should have: balance, usageTransactions, paymentTransactions
			const creditsData = UserCreditsData.create({})
			expect("balance" in creditsData).toBe(true)
			expect("usageTransactions" in creditsData).toBe(true)
			expect("paymentTransactions" in creditsData).toBe(true)

			// UserOrganization should have: active, memberId, name, organizationId, roles
			const org = UserOrganization.create({
				active: false,
				memberId: "",
				name: "",
				organizationId: "",
				roles: [],
			})
			expect("active" in org).toBe(true)
			expect("memberId" in org).toBe(true)
			expect("name" in org).toBe(true)
			expect("organizationId" in org).toBe(true)
			expect("roles" in org).toBe(true)

			// AuthState should have: user (optional)
			const authState = AuthState.create({})
			expect("user" in authState).toBe(true)

			// UserInfo should have: uid, displayName, email, photoUrl, appBaseUrl
			const userInfo = UserInfo.create({
				uid: "",
				displayName: undefined,
				email: undefined,
				photoUrl: undefined,
				appBaseUrl: undefined,
			})
			expect("uid" in userInfo).toBe(true)
			expect("displayName" in userInfo).toBe(true)
			expect("email" in userInfo).toBe(true)
			expect("photoUrl" in userInfo).toBe(true)
			expect("appBaseUrl" in userInfo).toBe(true)
		})
	})
})
