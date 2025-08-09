import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import "@testing-library/jest-dom"
import WelcomeView from "../../../components/welcome/WelcomeView"

// Mock the ExtensionStateContext
vi.mock("../../../context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		caretBanner: "mock-banner-url",
		apiConfiguration: undefined,
	}),
}))

// Mock the vscode utility
vi.mock("../../../utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

// Mock the validate utility
vi.mock("../../../utils/validate", () => ({
	validateApiConfiguration: vi.fn(() => "Test error message"),
}))

describe("Caret WelcomeView", () => {
	it("renders welcome message", () => {
		render(<WelcomeView />)

		// 인사말이 표시되는지 확인 (이모지 포함)
		expect(screen.getByText(/👋 안녕하세요! AI 개발 파트너, \^Caret입니다/)).toBeInTheDocument()

		// 바이브 코딩 섹션이 표시되는지 확인 (catchPhrase 제거됨)
		expect(screen.getByText(/🚀 Caret과 함께 '바이브 코딩' 여정을 시작하세요/)).toBeInTheDocument()
	})

	it("displays main welcome page by default", () => {
		render(<WelcomeView />)

		// 메인 웰컴 페이지 요소가 표시되는지 확인
		expect(screen.getByTestId("caret-welcome-view")).toBeInTheDocument()
		expect(screen.queryByTestId("caret-api-setup-page")).not.toBeInTheDocument()
	})

	it("switches to API setup page when 시작하기 button is clicked", () => {
		render(<WelcomeView />)

		const setupButton = screen.getByText("시작하기")
		fireEvent.click(setupButton)

		// API 설정 페이지로 전환되는지 확인
		expect(screen.getByTestId("caret-api-setup-page")).toBeInTheDocument()
		expect(screen.queryByTestId("caret-welcome-view")).not.toBeInTheDocument()
	})

	it("displays education program section", () => {
		render(<WelcomeView />)

		expect(screen.getByText(/지금 시작! 무료 교육 \+ Google Gemini \$300 크레딧 팁/)).toBeInTheDocument()
	})

	it("displays footer component", () => {
		render(<WelcomeView />)

		// Footer의 일부 텍스트가 렌더링되는지 확인
		expect(screen.getByText(/버전: v1\.0\.0/)).toBeInTheDocument()
	})

	it("should render the main banner", () => {
		render(<WelcomeView />)

		const bannerImage = screen.getByAltText("Caret 대표 이미지")
		expect(bannerImage).toBeInTheDocument()
	})
})
