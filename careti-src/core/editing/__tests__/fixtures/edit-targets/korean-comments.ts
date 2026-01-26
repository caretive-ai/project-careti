/**
 * 한글 주석이 포함된 파일
 * Korean comments file for Unicode testing
 */

// 사용자 정보를 처리하는 함수
export function processUser(name: string, age: number): string {
	// 나이 검증
	if (age < 0 || age > 150) {
		throw new Error("유효하지 않은 나이입니다")
	}

	// 이름 정규화
	const normalizedName = name.trim()

	// 결과 반환
	return `${normalizedName} (${age}세)`
}

// 배열을 필터링하는 함수
export function filterItems(items: string[], keyword: string): string[] {
	// 키워드가 비어있으면 전체 반환
	if (!keyword) {
		return items
	}

	// 키워드 포함 항목만 필터링
	return items.filter((item) => item.includes(keyword))
}

// 숫자 배열의 평균을 계산
export function calculateAverage(numbers: number[]): number {
	if (numbers.length === 0) {
		return 0
	}
	const sum = numbers.reduce((a, b) => a + b, 0)
	return sum / numbers.length
}
