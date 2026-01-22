// CARETI MODIFICATION: Webview image id helpers shared with image tooling.
const FNV_OFFSET_BASIS = 0x811c9dc5
const FNV_PRIME = 0x01000193

const fnv1aHash = (input: string): number => {
	let hash = FNV_OFFSET_BASIS
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i)
		hash = (hash * FNV_PRIME) >>> 0
	}
	return hash >>> 0
}

export const createImageId = (data: string): string => {
	const hash = fnv1aHash(data)
	const hex = hash.toString(16).padStart(8, "0")
	return `img-${hex}`
}

export const normalizeImageId = (value: string): string => {
	return value.trim().toLowerCase()
}
