// CARETI MODIFICATION: 아바타 씬 스토리
import type { Meta, StoryObj } from "@storybook/react"
import { AvatarScene } from "./AvatarScene"

const meta: Meta<typeof AvatarScene> = {
	title: "Avatar/AvatarScene",
	component: AvatarScene,
	parameters: {
		layout: "centered",
		backgrounds: {
			default: "dark",
		},
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * 기본 3D 씬
 */
export const Default: Story = {
	args: {
		width: 400,
		height: 600,
		enableControls: true,
	},
}

/**
 * VRM 모델 로드
 */
export const WithModel: Story = {
	args: {
		modelUrl: "/models/avatar.vrm",
		width: 400,
		height: 600,
		enableControls: true,
	},
}

/**
 * 컨트롤 비활성화
 */
export const NoControls: Story = {
	args: {
		width: 300,
		height: 400,
		enableControls: false,
	},
}

/**
 * 다양한 상태
 */
export const States: Story = {
	args: {
		width: 400,
		height: 600,
		enableControls: true,
	},
	render: (args) => (
		<div style={{ display: "flex", gap: "16px" }}>
			<div>
				<h4 style={{ color: "#fff", marginBottom: "8px" }}>Idle</h4>
				<AvatarScene {...args} state="idle" />
			</div>
			<div>
				<h4 style={{ color: "#fff", marginBottom: "8px" }}>Thinking</h4>
				<AvatarScene {...args} state="thinking" />
			</div>
			<div>
				<h4 style={{ color: "#fff", marginBottom: "8px" }}>Speaking</h4>
				<AvatarScene {...args} state="speaking" />
			</div>
		</div>
	),
}
