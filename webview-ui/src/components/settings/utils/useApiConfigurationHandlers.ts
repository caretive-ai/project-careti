import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { ApiConfiguration } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { convertApiConfigurationToProto } from "@shared/proto-conversions/models/api-configuration-conversion"
import { UpdateApiConfigurationRequest } from "@shared/proto/models"

export const useApiConfigurationHandlers = () => {
	const { apiConfiguration, planActSeparateModelsSetting } = useExtensionState()

	/**
	 * Updates API configuration via gRPC
	 */
	const updateApiConfiguration = async (updatedConfig: ApiConfiguration) => {
		console.log("[DEBUG] 📡 Sending gRPC request - updateApiConfiguration:", updatedConfig)

		const protoConfig = convertApiConfigurationToProto(updatedConfig)
		console.log("[DEBUG] 📡 Converted to proto config:", protoConfig)

		try {
			await ModelsServiceClient.updateApiConfigurationProto(
				UpdateApiConfigurationRequest.create({
					apiConfiguration: protoConfig,
				}),
			)
			console.log("[DEBUG] 📡 ✅ gRPC request completed successfully")
		} catch (error) {
			console.error("[DEBUG] 📡 ❌ gRPC request failed:", error)
			throw error
		}
	}

	/**
	 * Updates a single field in the API configuration.
	 *
	 * **Warning**: If this function is called multiple times in rapid succession,
	 * it can lead to race conditions where later calls may overwrite changes from
	 * earlier calls. For updating multiple fields, use `handleFieldsChange` instead.
	 *
	 * @param field - The field key to update
	 * @param value - The new value for the field
	 */
	const handleFieldChange = async <K extends keyof ApiConfiguration>(field: K, value: ApiConfiguration[K]) => {
		const updatedConfig = {
			...apiConfiguration,
			[field]: value,
		}

		await updateApiConfiguration(updatedConfig)
	}

	/**
	 * Updates multiple fields in the API configuration at once.
	 *
	 * This function should be used when updating multiple fields to avoid race conditions
	 * that can occur when calling `handleFieldChange` multiple times in succession.
	 * All updates are applied together as a single operation.
	 *
	 * @param updates - An object containing the fields to update and their new values
	 */
	const handleFieldsChange = async (updates: Partial<ApiConfiguration>) => {
		const updatedConfig = {
			...apiConfiguration,
			...updates,
		}

		await updateApiConfiguration(updatedConfig)
	}

	const handleModeFieldChange = async <PlanK extends keyof ApiConfiguration, ActK extends keyof ApiConfiguration>(
		fieldPair: { plan: PlanK; act: ActK },
		value: ApiConfiguration[PlanK] & ApiConfiguration[ActK], // Intersection ensures value is compatible with both field types
		currentMode: Mode,
	) => {
		console.log("[DEBUG] 🔧 handleModeFieldChange called:", {
			fieldPair,
			value,
			currentMode,
			planActSeparateModelsSetting,
			currentApiConfig: apiConfiguration,
		})

		let updatedConfig: ApiConfiguration

		if (planActSeparateModelsSetting) {
			const targetField = fieldPair[currentMode]
			updatedConfig = {
				...apiConfiguration,
				[targetField]: value,
			}
			console.log("[DEBUG] 🔧 Separate models mode - updating field:", targetField, "to:", value)
		} else {
			updatedConfig = {
				...apiConfiguration,
				[fieldPair.plan]: value,
				[fieldPair.act]: value,
			}
			console.log("[DEBUG] 🔧 Unified models mode - updating both fields to:", value)
		}

		console.log("[DEBUG] 🔧 Final config to send:", updatedConfig)
		await updateApiConfiguration(updatedConfig)
	}

	/**
	 * Updates multiple mode-specific fields in a single atomic operation.
	 *
	 * This prevents race conditions that can occur when making multiple separate
	 * handleModeFieldChange calls in rapid succession.
	 *
	 * @param fieldPairs - Object mapping keys to plan/act field pairs
	 * @param values - Object with values for each key
	 * @param currentMode - The current mode being targeted
	 */
	const handleModeFieldsChange = async <T extends Record<string, any>>(
		fieldPairs: { [K in keyof T]: { plan: keyof ApiConfiguration; act: keyof ApiConfiguration } },
		values: T,
		currentMode: Mode,
	) => {
		if (planActSeparateModelsSetting) {
			// Update only the current mode's fields
			const updates: Partial<ApiConfiguration> = {}
			Object.entries(fieldPairs).forEach(([key, { plan, act }]) => {
				const targetField = currentMode === "plan" ? plan : act
				updates[targetField] = values[key]
			})
			await handleFieldsChange(updates)
		} else {
			// Update both modes' fields
			const updates: Partial<ApiConfiguration> = {}
			Object.entries(fieldPairs).forEach(([key, { plan, act }]) => {
				updates[plan] = values[key]
				updates[act] = values[key]
			})
			await handleFieldsChange(updates)
		}
	}

	return { handleFieldChange, handleFieldsChange, handleModeFieldChange, handleModeFieldsChange }
}
