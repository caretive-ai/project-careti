// CARETI MODIFICATION: AvatarContainer 스토리북 스토리
import type { Meta, StoryObj } from "@storybook/react"
import { AvatarContainer } from "./AvatarContainer"

const meta: Meta<typeof AvatarContainer> = {
	title: "Avatar/AvatarContainer",
	component: AvatarContainer,
	parameters: {
		layout: "padded",
		backgrounds: {
			default: "dark",
		},
	},
	tags: ["autodocs"],
	argTypes: {
		state: {
			control: "select",
			options: ["idle", "greeting", "thinking", "speaking", "complete"],
			description: "현재 아바타 상태",
		},
		modelUrl: {
			control: "select",
			options: [
				"/models/AvatarSample_A.vrm",
				"/models/AvatarSample_B.vrm",
				"/models/AvatarSample_C.vrm",
				"/models/AvatarSample_D.vrm",
			],
			description: "VRM 모델 URL",
		},
	},
}

export default meta
type Story = StoryObj<typeof AvatarContainer>

export const Default: Story = {
	args: {
		state: "idle",
		modelUrl: "/models/AvatarSample_A.vrm",
	},
}

export const Greeting: Story = {
	args: {
		state: "greeting",
		modelUrl: "/models/AvatarSample_A.vrm",
	},
}

export const Thinking: Story = {
	args: {
		state: "thinking",
		modelUrl: "/models/AvatarSample_A.vrm",
	},
}

export const Speaking: Story = {
	args: {
		state: "speaking",
		modelUrl: "/models/AvatarSample_A.vrm",
	},
}

export const Complete: Story = {
	args: {
		state: "complete",
		modelUrl: "/models/AvatarSample_A.vrm",
	},
}

export const WithCallbacks: Story = {
	args: {
		state: "thinking",
		modelUrl: "/models/AvatarSample_A.vrm",
		onMinimizeChange: (minimized) => console.log("Minimize changed:", minimized),
		onSettingsClick: () => console.log("Settings clicked"),
	},
}
