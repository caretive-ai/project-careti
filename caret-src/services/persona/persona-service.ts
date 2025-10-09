import { PersonaProfile } from "@shared/proto/caret/persona"

type PersonaChangeCallback = (persona: PersonaProfile | any) => void

export class PersonaService {
	private static instance: PersonaService
	private subscribers: Set<PersonaChangeCallback> = new Set()

	private constructor() {}

	public static getInstance(): PersonaService {
		if (!PersonaService.instance) {
			PersonaService.instance = new PersonaService()
		}
		return PersonaService.instance
	}

	public subscribeToPersonaChanges(callback: PersonaChangeCallback): () => void {
		this.subscribers.add(callback)
		return () => {
			this.subscribers.delete(callback)
		}
	}

	public notifyPersonaChange(persona: PersonaProfile | any): void {
		this.subscribers.forEach((callback) => {
			callback(persona)
		})
	}
}
