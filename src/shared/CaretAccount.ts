// CARET MODIFICATION: Caret Account types - based on ClineAccount but for Caret API server

export interface CaretUserResponse {
	id: string
	email: string
	displayName: string
	photoUrl: string
	createdAt: string
	updatedAt: string
	// CARET MODIFICATION: Support for Caret organizations structure
	organizations: [
		{
			active: boolean
			memberId: string
			name: string
			organizationId: string
			roles: ["admin" | "member" | "owner"]
		},
	]
}

export interface CaretBalanceResponse {
	balance: number
	userId: string
	// CARET MODIFICATION: Additional Caret-specific fields
	currency?: string
	lastUpdated?: string
}

export interface CaretUsageTransaction {
	// CARET MODIFICATION: Caret-specific field names aligned with Mock API
	aiInferenceProviderName: string
	aiModelName: string
	aiModelTypeName: string
	completionTokens: number
	costUsd: number
	createdAt: string
	creditsUsed: number
	generationId: string
	id: string
	metadata: {
		additionalProp1: string
		additionalProp2: string
		additionalProp3: string
	}
	organizationId: string
	promptTokens: number
	totalTokens: number
	userId: string
	// CARET MODIFICATION: Additional Caret fields for better tracking
	model?: string
	cachedTokens?: number
	totalCost: number
	timestamp: string
	taskId?: string
}

export interface CaretPaymentTransaction {
	paidAt: string
	creatorId: string
	amountCents: number
	credits: number
	// CARET MODIFICATION: Additional Caret payment fields
	currency?: string
	paymentMethod?: string
	transactionId?: string
}

// CARET MODIFICATION: Organization-specific types for Caret
export interface CaretOrganizationBalanceResponse {
	balance: number
	organizationId: string
	currency?: string
	lastUpdated?: string
}

export interface CaretOrganizationUsageTransaction {
	aiInferenceProviderName: string
	aiModelName: string
	aiModelTypeName: string
	completionTokens: number
	costUsd: number
	createdAt: string
	creditsUsed: number
	generationId: string
	id: string
	metadata: {
		additionalProp1: string
		additionalProp2: string
		additionalProp3: string
	}
	organizationId: string
	memberId: string
	promptTokens: number
	totalTokens: number
	userId: string
	// CARET MODIFICATION: Additional organization-specific fields
	model?: string
	totalCost: number
	timestamp: string
	taskId?: string
}
