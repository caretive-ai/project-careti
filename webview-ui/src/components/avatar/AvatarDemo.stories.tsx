// CARETI MODIFICATION: 아바타 데모 스토리
import type { Meta, StoryObj } from "@storybook/react"
import { AvatarDemo } from "./AvatarDemo"

const meta: Meta<typeof AvatarDemo> = {
	title: "Avatar/AvatarDemo",
	component: AvatarDemo,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * 기본 아바타 데모
 * - 3D 아바타 렌더링
 * - Gemini AI 채팅
 * - git 이벤트 시뮬레이션 버튼
 */
export const Default: Story = {
	args: {
		modelUrl: "/models/avatar.vrm",
		personality: `너는 "캐럿"이라는 이름의 AI 코딩 버튜버야.
개발자들을 도와주는 걸 좋아하고, 코드에 대해 이야기할 때 신나해.
짧고 친근하게 대화해. 이모티콘도 가끔 써.`,
	},
}

/**
 * API 키 없이 (채팅 비활성화)
 */
export const WithoutAPI: Story = {
	args: {
		modelUrl: "/models/avatar.vrm",
		apiKey: "",
	},
}

/**
 * 커스텀 성격
 */
export const CustomPersonality: Story = {
	args: {
		modelUrl: "/models/avatar.vrm",
		personality: `너는 시니컬한 코드 리뷰어야.
코드를 보면 항상 개선점을 찾아내고, 냉정하게 피드백해.
하지만 마음 속으로는 개발자를 응원하고 있어.`,
	},
}
