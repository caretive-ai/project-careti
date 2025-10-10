import { useCallback, useEffect, useState } from "react"

interface UseInputHistoryParams {
	history: string[]
	inputValue: string
	setInputValue: (value: string) => void
}

export function useInputHistory({ history, inputValue, setInputValue }: UseInputHistoryParams) {
	const [historyIndex, setHistoryIndex] = useState(-1)
	const [originalInput, setOriginalInput] = useState("") // 사용자가 타이핑한 원본 텍스트
	const [isNavigatingHistory, setIsNavigatingHistory] = useState(false)

	useEffect(() => {
		// 히스토리 탐색 중이 아닐 때만 원본 입력을 업데이트
		if (!isNavigatingHistory) {
			setOriginalInput(inputValue)
		}

		// 사용자가 직접 입력을 변경했을 때 히스토리 모드 종료
		if (historyIndex !== -1 && !isNavigatingHistory && inputValue !== history[historyIndex]) {
			setHistoryIndex(-1)
			setOriginalInput(inputValue)
		}
	}, [inputValue, history, historyIndex, isNavigatingHistory])

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (history.length === 0) {
				return false
			}

			if (event.key === "ArrowUp" || event.key === "ArrowDown") {
				// 커서가 텍스트 시작/끝에 있을 때만 히스토리 탐색
				if (event.currentTarget.selectionStart === 0 || event.currentTarget.selectionStart === inputValue.length) {
					event.preventDefault()
				} else {
					return false
				}

				// 히스토리 탐색 시작 시 현재 입력을 원본으로 저장
				if (historyIndex === -1) {
					setOriginalInput(inputValue)
				}

				setIsNavigatingHistory(true)

				let newIndex: number
				if (event.key === "ArrowUp") {
					newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
				} else {
					newIndex = historyIndex === -1 ? -1 : Math.min(history.length, historyIndex + 1)
				}

				setHistoryIndex(newIndex)

				if (newIndex >= 0 && newIndex < history.length) {
					setInputValue(history[newIndex])
				} else {
					// 히스토리 탐색 종료 - 원본 입력으로 복구
					setInputValue(originalInput)
					setHistoryIndex(-1)
					setIsNavigatingHistory(false)
				}
				return true
			} else {
				// 다른 키를 누르면 히스토리 탐색 모드 종료
				if (isNavigatingHistory) {
					setIsNavigatingHistory(false)
				}
			}

			return false
		},
		[history, historyIndex, originalInput, inputValue, setInputValue, isNavigatingHistory],
	)

	return { handleKeyDown }
}
