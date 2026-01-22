enum CARET_API_AUTH_ENDPOINTS {
	AUTH = "/v1/auth/authorize",
	REFRESH_TOKEN = "/v1/auth/refresh",
}

enum CARET_API_ENDPOINT_V1 {
	TOKEN_EXCHANGE = "/v1/auth/token",
	USER_INFO = "/v1/auth/me",
	BALANCE = "/v1/profile/balance",
	LOGS = "/v1/profile/logs",
	PAYMENTS = "/v1/profile/payments",
}

export const CARET_API_ENDPOINT = {
	...CARET_API_AUTH_ENDPOINTS,
	...CARET_API_ENDPOINT_V1,
}
