// CARETI MODIFICATION: AsyncQueue for message queuing system
// Reference: ref-opencode/packages/opencode/src/util/queue.ts

/**
 * AsyncQueue - Producer-Consumer 패턴 구현
 *
 * 특징:
 * - 항목이 없으면 resolver가 대기
 * - `for await...of` 지원 (AsyncIterable)
 * - close()로 큐 종료 가능
 *
 * @example
 * ```typescript
 * const queue = new AsyncQueue<string>()
 *
 * // Producer
 * queue.push("message1")
 * queue.push("message2")
 *
 * // Consumer
 * for await (const item of queue) {
 *   console.log(item)
 * }
 * ```
 */
export class AsyncQueue<T> implements AsyncIterable<T> {
	private queue: T[] = []
	private resolvers: ((value: T | null) => void)[] = []
	private closed = false

	/**
	 * 큐에 항목 추가
	 * 대기 중인 consumer가 있으면 즉시 전달
	 */
	push(item: T): void {
		if (this.closed) {
			return
		}

		const resolve = this.resolvers.shift()
		if (resolve) {
			resolve(item)
		} else {
			this.queue.push(item)
		}
	}

	/**
	 * 큐에서 다음 항목 가져오기
	 * 항목이 없으면 Promise로 대기
	 */
	async next(): Promise<T | null> {
		if (this.queue.length > 0) {
			return this.queue.shift()!
		}

		if (this.closed) {
			return null
		}

		return new Promise<T | null>((resolve) => {
			this.resolvers.push(resolve)
		})
	}

	/**
	 * 큐 종료
	 * 대기 중인 모든 consumer에게 null 반환
	 */
	close(): void {
		this.closed = true

		// 대기 중인 resolver들에게 null 전달
		for (const resolve of this.resolvers) {
			resolve(null)
		}
		this.resolvers = []
	}

	/**
	 * 큐가 닫혔는지 확인
	 */
	isClosed(): boolean {
		return this.closed
	}

	/**
	 * 현재 큐에 대기 중인 항목 수
	 */
	get length(): number {
		return this.queue.length
	}

	/**
	 * 대기 중인 consumer 수
	 */
	get pendingConsumers(): number {
		return this.resolvers.length
	}

	/**
	 * 큐 비우기 (항목만 제거, 닫지는 않음)
	 */
	clear(): void {
		this.queue = []
	}

	/**
	 * AsyncIterable 구현
	 * close() 호출 또는 null 반환까지 반복
	 */
	async *[Symbol.asyncIterator](): AsyncIterableIterator<T> {
		while (true) {
			const item = await this.next()
			if (item === null) {
				break
			}
			yield item
		}
	}
}
