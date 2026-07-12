// CARETI MODIFICATION: shared test fixture extracted from integration.test.ts
// (biome lint/suspicious/noExportsInTest forbids exporting from *.test.ts files)
export const mockProviderInfo = {
	providerId: "test",
	model: {
		id: "fast",
		info: {
			supportsPromptCache: false,
		},
	},
}
