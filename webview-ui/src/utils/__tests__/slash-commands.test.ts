// CARETI MODIFICATION: TDD 회귀 테스트 - 슬래시 커맨드(/)를 메시지 어디서든 제안/삽입해야 함

import { describe, expect, it } from "vitest"
import { insertSlashCommand, removeSlashCommand, shouldShowSlashCommandsMenu } from "../slash-commands"

describe("slash-commands utils", () => {
	it("메시지 중간의 '/'+커맨드도 제안 메뉴를 표시한다", () => {
		const text = "hello /new"
		const cursor = text.length
		expect(shouldShowSlashCommandsMenu(text, cursor)).to.equal(true)
	})

	it("URL 경로의 슬래시는 커맨드로 인식하지 않는다", () => {
		const text = "https://example.com/newtask"
		const cursor = text.length
		expect(shouldShowSlashCommandsMenu(text, cursor)).to.equal(false)
	})

	it("커서 위치 기준으로 가장 가까운 슬래시에 커맨드를 삽입한다", () => {
		const text = "hello /ne and /sm"
		const cursor = text.length
		const { newValue, commandIndex } = insertSlashCommand(text, "smol", 2, cursor)

		expect(commandIndex).to.equal(text.lastIndexOf("/"))
		expect(newValue).to.contain("/smol ")
	})

	it("메시지 중간의 슬래시 커맨드도 백스페이스 삭제가 동작한다", () => {
		const text = "hello /newtask"
		const cursor = text.length
		const { newText, newPosition } = removeSlashCommand(text, cursor)

		expect(newText).to.equal("hello ")
		expect(newPosition).to.equal("hello ".length)
	})
})
