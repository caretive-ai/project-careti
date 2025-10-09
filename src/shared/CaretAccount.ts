// CARET MODIFICATION: Caret Account types - based on ClineAccount but for Caret API server

export interface CaretUsage {
	spend: number
	currency?: string
	prompt_tokens: number
	completion_tokens: number
	total_tokens: number
}
export interface CaretUser {
	id: string
	email: string
	displayName: string
	photoUrl?: string
	appBaseUrl?: string
	apiKey: string
	models: string[]
	dailyUsage: CaretUsage
	monthlyUsage: CaretUsage
	organizations: CaretUserOrganization[]
}

export interface CaretProfileResponse {
	user_info: {
		user_id: string
		user_alias: string
		user_email: string
		metadata: { display_name: string; avatar_url: string }
		models: string[]
	}
	daily_usage: CaretUsage
	monthly_usage: CaretUsage
	key: string
}

export type CaretUserOrganization = {
	active: boolean
	memberId: string
	name: string
	organizationId: string
	roles: Array<"admin" | "member" | "owner">
}

export interface CaretUserResponse extends CaretUser {
	createdAt?: string
	updatedAt?: string
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
