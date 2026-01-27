// CARETI MODIFICATION: GFM 테이블 렌더링 테스트

import { render, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import MarkdownBlock from "../MarkdownBlock"

// Mock the i18n function
vi.mock("@/careti/utils/i18n", () => ({
	t: (key: string) => key,
}))

// Mock the grpc-client
vi.mock("@/services/grpc-client", () => ({
	FileServiceClient: {
		ifFileExistsRelativePath: vi.fn().mockResolvedValue({ value: false }),
		openFileRelativePath: vi.fn(),
	},
	StateServiceClient: {
		togglePlanActModeProto: vi.fn(),
	},
}))

// Mock the extension state
vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		mode: "act",
	}),
}))

describe("MarkdownBlock GFM Table Rendering", () => {
	it("기본 마크다운 테이블을 렌더링해야 함", async () => {
		const tableMarkdown = `
| 이름 | 나이 | 직업 |
|------|------|------|
| 홍길동 | 25 | 개발자 |
| 김영희 | 30 | 디자이너 |
`

		const { container } = render(<MarkdownBlock markdown={tableMarkdown} />)

		// useRemark는 비동기로 동작하므로 waitFor 사용
		await waitFor(
			() => {
				const table = container.querySelector("table")
				expect(table).toBeTruthy()
			},
			{ timeout: 3000 },
		)

		// 테이블 헤더 확인
		const headers = container.querySelectorAll("th")
		expect(headers.length).toBe(3)

		// 테이블 데이터 셀 확인
		const cells = container.querySelectorAll("td")
		expect(cells.length).toBe(6) // 2행 x 3열
	})

	it("정렬이 포함된 테이블을 렌더링해야 함", async () => {
		const alignedTableMarkdown = `
| 왼쪽 정렬 | 가운데 정렬 | 오른쪽 정렬 |
|:----------|:----------:|----------:|
| Left | Center | Right |
`

		const { container } = render(<MarkdownBlock markdown={alignedTableMarkdown} />)

		await waitFor(
			() => {
				const table = container.querySelector("table")
				expect(table).toBeTruthy()
			},
			{ timeout: 3000 },
		)
	})

	it("테이블이 없는 일반 마크다운도 정상 렌더링해야 함", async () => {
		const normalMarkdown = "**굵은 글씨**와 *기울임*"

		const { container } = render(<MarkdownBlock markdown={normalMarkdown} />)

		await waitFor(
			() => {
				const strong = container.querySelector("strong")
				expect(strong).toBeTruthy()
			},
			{ timeout: 3000 },
		)
	})

	it("빈 마크다운도 에러 없이 처리해야 함", async () => {
		const { container } = render(<MarkdownBlock markdown="" />)

		// 에러 없이 렌더링되어야 함
		await waitFor(() => {
			expect(container).toBeTruthy()
		})
	})

	it("GFM 취소선을 렌더링해야 함", async () => {
		const strikethroughMarkdown = "~~취소된 텍스트~~"

		const { container } = render(<MarkdownBlock markdown={strikethroughMarkdown} />)

		await waitFor(
			() => {
				const del = container.querySelector("del")
				expect(del).toBeTruthy()
				expect(del?.textContent).toBe("취소된 텍스트")
			},
			{ timeout: 3000 },
		)
	})
})
