export enum Environment {
	production = "production",
	staging = "staging",
	local = "local",
}

export interface EnvironmentConfig {
	environment: Environment
	appBaseUrl: string
	apiBaseUrl: string
	mcpBaseUrl: string
}

class CaretEndpoint {
	public static instance = new CaretEndpoint()
	public static get config() {
		return CaretEndpoint.instance.config()
	}

	private environment: Environment = Environment.production

	private constructor() {
		// Set environment at module load. Use override if provided.
		const _env = process?.env?.CARET_ENVIRONMENT_OVERRIDE || process?.env?.CARET_ENVIRONMENT
		if (_env && Object.values(Environment).includes(_env as Environment)) {
			this.environment = _env as Environment
			return
		}
	}

	public config(): EnvironmentConfig {
		return this.getEnvironment()
	}

	public setEnvironment(env: string) {
		switch (env.toLowerCase()) {
			case "staging":
				this.environment = Environment.staging
				break
			case "local":
				this.environment = Environment.local
				break
			default:
				this.environment = Environment.production
				break
		}
		console.info("Careti environment updated: ", this.environment)
	}

	public getEnvironment(): EnvironmentConfig {
		switch (this.environment) {
			case Environment.staging:
				return {
					environment: Environment.staging,
					appBaseUrl: "https://staging-app.cline.bot",
					apiBaseUrl: "https://core-api.staging.int.cline.bot",
					mcpBaseUrl: "https://core-api.staging.int.cline.bot/v1/mcp",
				}
			case Environment.local:
				return {
					environment: Environment.local,
					appBaseUrl: "http://localhost:4001",
					apiBaseUrl: "http://localhost:8000",
					mcpBaseUrl: "http://localhost:8000/v1/mcp",
				}
			default:
				return {
					environment: Environment.production,
					appBaseUrl: "https://careti.ai",
					apiBaseUrl: "https://api.careti.ai",
					mcpBaseUrl: "https://api.careti.ai/v1/mcp",
				}
		}
	}
}

/**
 * Singleton instance to access the current environment configuration.
 * Usage:
 * - CaretEnv.config() to get the current config.
 * - CaretEnv.setEnvironment(Environment.local) to change the environment.
 */
export const CaretEnv = CaretEndpoint.instance
