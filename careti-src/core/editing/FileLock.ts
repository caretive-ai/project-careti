/**
 * FileLock - File locking system for concurrent edit prevention
 *
 * CARETI MODIFICATION: New file for file locking
 * Sourced from OpenCode implementation
 *
 * Supports two patterns:
 * 1. withLock(path, fn) - for single async operations
 * 2. acquireLock/releaseLock - for long-lived editing sessions (VS Code diff editor)
 */

const locks = new Map<string, Promise<void>>()
const lockResolvers = new Map<string, () => void>()

/**
 * Execute a function while holding an exclusive lock on a file
 * Prevents concurrent modifications to the same file
 *
 * @param filepath The absolute path to the file
 * @param fn The function to execute while holding the lock
 * @returns The result of the function
 */
export async function withLock<T>(filepath: string, fn: () => Promise<T>): Promise<T> {
	// Wait for any existing lock on this file
	while (locks.has(filepath)) {
		await locks.get(filepath)
	}

	// Create a new lock
	let resolve: () => void
	const lockPromise = new Promise<void>((r) => {
		resolve = r
	})
	locks.set(filepath, lockPromise)

	try {
		return await fn()
	} finally {
		locks.delete(filepath)
		resolve!()
	}
}

/**
 * Check if a file is currently locked
 * @param filepath The absolute path to the file
 * @returns true if the file is locked
 */
export function isLocked(filepath: string): boolean {
	return locks.has(filepath)
}

/**
 * Get the number of currently locked files
 * @returns The count of locked files
 */
export function getLockedCount(): number {
	return locks.size
}

/**
 * Acquire an exclusive lock on a file for long-lived editing sessions
 * Use this with releaseLock() for VS Code diff editor workflows
 *
 * @param filepath The absolute path to the file
 * @returns A promise that resolves when the lock is acquired
 */
export async function acquireLock(filepath: string): Promise<void> {
	// Wait for any existing lock on this file
	while (locks.has(filepath)) {
		await locks.get(filepath)
	}

	// Create a new lock
	let resolve: () => void
	const lockPromise = new Promise<void>((r) => {
		resolve = r
	})
	locks.set(filepath, lockPromise)
	lockResolvers.set(filepath, resolve!)
}

/**
 * Release a previously acquired lock on a file
 * Must be called after acquireLock() to prevent deadlocks
 *
 * @param filepath The absolute path to the file
 */
export function releaseLock(filepath: string): void {
	const resolver = lockResolvers.get(filepath)
	if (resolver) {
		locks.delete(filepath)
		lockResolvers.delete(filepath)
		resolver()
	}
}
