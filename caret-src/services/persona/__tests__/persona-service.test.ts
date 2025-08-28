import { describe, it, expect, vi, beforeEach } from "vitest"
import { PersonaService } from "../persona-service"
import { PersonaProfile } from "@shared/proto/caret/persona"

describe("PersonaService", () => {
	let personaService: PersonaService

	beforeEach(() => {
		personaService = new PersonaService()
	})

	it("should allow a subscriber to receive persona updates", () => {
		const mockProfile = PersonaProfile.create({ name: "Test Persona" })
		const callback = vi.fn()

		personaService.subscribeToPersonaChanges(callback)
		personaService.notifyPersonaChange(mockProfile)

		expect(callback).toHaveBeenCalledWith(mockProfile)
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it("should allow multiple subscribers to receive updates", () => {
		const mockProfile = PersonaProfile.create({ name: "Test Persona" })
		const callback1 = vi.fn()
		const callback2 = vi.fn()

		personaService.subscribeToPersonaChanges(callback1)
		personaService.subscribeToPersonaChanges(callback2)
		personaService.notifyPersonaChange(mockProfile)

		expect(callback1).toHaveBeenCalledWith(mockProfile)
		expect(callback2).toHaveBeenCalledWith(mockProfile)
	})

	it("should allow unsubscribing from persona updates", () => {
		const mockProfile = PersonaProfile.create({ name: "Test Persona" })
		const callback = vi.fn()

		const unsubscribe = personaService.subscribeToPersonaChanges(callback)
		unsubscribe()

		personaService.notifyPersonaChange(mockProfile)

		expect(callback).not.toHaveBeenCalled()
	})
})
