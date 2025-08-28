import React from "react"
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import PersonaAvatar from "../PersonaAvatar"
import { FullPersonaProfile } from "@/caret/context/CaretStateContext"

// CARET MODIFICATION: Refactored to use PersonaProfile and standard testing practices.
describe("PersonaAvatar", () => {
	it("should render the default avatar when no profile is provided", () => {
		render(<PersonaAvatar personaProfile={null} />)
		const img = screen.getByRole("img")
		expect(img).toHaveAttribute("src")
		// More specific checks can be added if there's a known default avatar asset
	})

	it("should render the persona's avatar URI when a profile is provided", () => {
		const profile: FullPersonaProfile = {
			name: "Test Persona",
			description: "",
			customInstruction: "",
			avatarUri: "data:image/png;base64,test-avatar-uri",
		}
		render(<PersonaAvatar personaProfile={profile} />)
		const img = screen.getByRole("img") as HTMLImageElement
		expect(img.src).toContain("test-avatar-uri")
	})

	it("should apply custom className and size", () => {
		const profile: FullPersonaProfile = { name: "Test", description: "", customInstruction: "" }
		const { container } = render(<PersonaAvatar personaProfile={profile} className="my-class" size={48} />)
		const element = container.firstChild
		expect(element).toHaveClass("my-class")
		expect(element).toHaveStyle({ width: "48px", height: "48px" })
	})
})
