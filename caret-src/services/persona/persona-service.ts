import { PersonaProfile } from "@shared/proto/caret/persona"

type PersonaChangeCallback = (profile: PersonaProfile) => void

export class PersonaService {
	private subscribers: Set<PersonaChangeCallback> = new Set()

	public subscribeToPersonaChanges(callback: PersonaChangeCallback): () => void {
		this.subscribers.add(callback)
		return () => {
			this.subscribers.delete(callback)
		}
	}

	public notifyPersonaChange(profile: PersonaProfile): void {
		this.subscribers.forEach((callback) => {
			callback(profile)
		})
	}
}