// CARETI MODIFICATION: 아바타 씬 컴포넌트 테스트
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { AvatarScene } from "./AvatarScene"

// Mock React Three Fiber
vi.mock("@react-three/fiber", () => ({
	Canvas: ({ children, ...props }: { children: React.ReactNode }) => (
		<div data-testid="r3f-canvas" {...props}>
			{children}
		</div>
	),
	useFrame: vi.fn(),
	useThree: vi.fn(() => ({
		gl: {},
		scene: {},
		camera: {},
	})),
}))

// Mock Drei
vi.mock("@react-three/drei", () => ({
	OrbitControls: () => <div data-testid="orbit-controls" />,
	Environment: () => <div data-testid="environment" />,
	useProgress: vi.fn(() => ({
		progress: 100,
		loaded: 10,
		total: 10,
	})),
}))

// Mock VRM 로더 훅
vi.mock("../../hooks/avatar", () => ({
	useVRMLoader: vi.fn(() => ({
		vrm: null,
		isLoading: false,
		error: null,
		progress: 0,
		loadVRM: vi.fn(),
		dispose: vi.fn(),
		setExpression: vi.fn(),
	})),
}))

describe("AvatarScene", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("렌더링", () => {
		it("Canvas가 렌더링되어야 함", () => {
			render(<AvatarScene />)

			expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
		})

		it("컨테이너가 올바른 크기를 가져야 함", () => {
			const { container } = render(<AvatarScene width={400} height={300} />)

			const wrapper = container.firstChild as HTMLElement
			expect(wrapper).toHaveStyle({ width: "400px", height: "300px" })
		})
	})

	describe("Props", () => {
		it("modelUrl이 전달되어야 함", () => {
			render(<AvatarScene modelUrl="/test.vrm" />)

			expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument()
		})

		it("width와 height가 적용되어야 함", () => {
			const { container } = render(<AvatarScene width={400} height={300} />)

			const wrapper = container.firstChild as HTMLElement
			expect(wrapper).toHaveStyle({ width: "400px", height: "300px" })
		})
	})

	describe("로딩 상태", () => {
		it("로딩 중일 때 로딩 퍼센트가 표시되어야 함", async () => {
			const { useVRMLoader } = await import("../../hooks/avatar")
			vi.mocked(useVRMLoader).mockReturnValue({
				vrm: null,
				isLoading: true,
				error: null,
				progress: 50,
				loadVRM: vi.fn(),
				dispose: vi.fn(),
				setExpression: vi.fn(),
			})

			render(<AvatarScene modelUrl="/test.vrm" />)

			expect(screen.getByText(/로딩 50%/)).toBeInTheDocument()
		})
	})

	describe("에러 상태", () => {
		it("에러 발생 시 에러 표시가 나타나야 함", async () => {
			const { useVRMLoader } = await import("../../hooks/avatar")
			vi.mocked(useVRMLoader).mockReturnValue({
				vrm: null,
				isLoading: false,
				error: new Error("로드 실패"),
				progress: 0,
				loadVRM: vi.fn(),
				dispose: vi.fn(),
				setExpression: vi.fn(),
			})

			render(<AvatarScene modelUrl="/test.vrm" />)

			expect(screen.getByText(/에러/)).toBeInTheDocument()
		})
	})
})
