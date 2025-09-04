// CARET MODIFICATION: Performance monitoring and optimization utilities for i18n system
// This module provides tools for monitoring and optimizing i18n performance

// Performance metrics collection
interface I18nMetrics {
	translationCalls: number
	cacheMisses: number
	cacheHits: number
	averageTranslationTime: number
	templateProcessingTime: number
	koreanParticleProcessingTime: number
}

class I18nPerformanceMonitor {
	private metrics: I18nMetrics = {
		translationCalls: 0,
		cacheMisses: 0,
		cacheHits: 0,
		averageTranslationTime: 0,
		templateProcessingTime: 0,
		koreanParticleProcessingTime: 0,
	}

	private translationTimes: number[] = []
	private translationCache = new Map<string, string>()

	/**
	 * Start timing a translation operation
	 */
	startTranslation(): () => void {
		const startTime = performance.now()
		this.metrics.translationCalls++

		return () => {
			const duration = performance.now() - startTime
			this.translationTimes.push(duration)

			// Keep only last 100 measurements for rolling average
			if (this.translationTimes.length > 100) {
				this.translationTimes = this.translationTimes.slice(-100)
			}

			this.metrics.averageTranslationTime = this.translationTimes.reduce((a, b) => a + b, 0) / this.translationTimes.length
		}
	}

	/**
	 * Record cache hit/miss
	 */
	recordCacheAccess(hit: boolean): void {
		if (hit) {
			this.metrics.cacheHits++
		} else {
			this.metrics.cacheMisses++
		}
	}

	/**
	 * Record template processing time
	 */
	recordTemplateProcessing(duration: number): void {
		this.metrics.templateProcessingTime = (this.metrics.templateProcessingTime + duration) / 2
	}

	/**
	 * Record Korean particle processing time
	 */
	recordKoreanParticleProcessing(duration: number): void {
		this.metrics.koreanParticleProcessingTime = (this.metrics.koreanParticleProcessingTime + duration) / 2
	}

	/**
	 * Get current metrics
	 */
	getMetrics(): I18nMetrics & { cacheHitRate: number } {
		const totalCacheAccess = this.metrics.cacheHits + this.metrics.cacheMisses
		return {
			...this.metrics,
			cacheHitRate: totalCacheAccess > 0 ? this.metrics.cacheHits / totalCacheAccess : 0,
		}
	}

	/**
	 * Get cached translation if available
	 */
	getCachedTranslation(key: string): string | undefined {
		const cached = this.translationCache.get(key)
		this.recordCacheAccess(!!cached)
		return cached
	}

	/**
	 * Cache a translation result
	 */
	setCachedTranslation(key: string, value: string): void {
		// Limit cache size to prevent memory bloat
		if (this.translationCache.size > 500) {
			// Remove oldest entries (simple FIFO)
			const firstKey = this.translationCache.keys().next().value
			if (firstKey !== undefined) {
				this.translationCache.delete(firstKey)
			}
		}

		this.translationCache.set(key, value)
	}

	/**
	 * Reset all metrics (useful for testing)
	 */
	reset(): void {
		this.metrics = {
			translationCalls: 0,
			cacheMisses: 0,
			cacheHits: 0,
			averageTranslationTime: 0,
			templateProcessingTime: 0,
			koreanParticleProcessingTime: 0,
		}
		this.translationTimes = []
		this.translationCache.clear()
	}

	/**
	 * Log performance summary
	 */
	logPerformanceSummary(): void {
		const metrics = this.getMetrics()

		console.group("📊 i18n Performance Summary")
		console.log(`🔄 Total translations: ${metrics.translationCalls}`)
		console.log(`⚡ Average time: ${metrics.averageTranslationTime.toFixed(2)}ms`)
		console.log(`💾 Cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`)
		console.log(`🔤 Template processing: ${metrics.templateProcessingTime.toFixed(2)}ms avg`)
		console.log(`🇰🇷 Korean particles: ${metrics.koreanParticleProcessingTime.toFixed(2)}ms avg`)
		console.groupEnd()
	}
}

// Global performance monitor instance
export const performanceMonitor = new I18nPerformanceMonitor()

/**
 * Decorator for measuring translation function performance
 */
export function measureTranslation<T extends (...args: any[]) => any>(fn: T): T {
	return ((...args: any[]) => {
		const endTimer = performanceMonitor.startTranslation()
		const result = fn(...args)
		endTimer()
		return result
	}) as T
}

/**
 * Memoization decorator for expensive operations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
	const cache = new Map<string, any>()

	return ((...args: any[]) => {
		const key = JSON.stringify(args)

		if (cache.has(key)) {
			performanceMonitor.recordCacheAccess(true)
			return cache.get(key)
		}

		performanceMonitor.recordCacheAccess(false)
		const result = fn(...args)

		// Limit memoization cache size
		if (cache.size > 200) {
			const firstKey = cache.keys().next().value
			if (firstKey !== undefined) {
				cache.delete(firstKey)
			}
		}

		cache.set(key, result)
		return result
	}) as T
}

/**
 * Performance-optimized Korean particle processing
 */
export const optimizedKoreanParticles = memoize((word: string, particle: string) => {
	const startTime = performance.now()

	// Original Korean particle logic here would go
	// For now, we'll just measure the time

	const duration = performance.now() - startTime
	performanceMonitor.recordKoreanParticleProcessing(duration)

	return `${word}${particle}` // Simplified for demo
})
