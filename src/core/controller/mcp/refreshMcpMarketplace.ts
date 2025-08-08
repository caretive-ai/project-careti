import type { EmptyRequest } from "@shared/proto/cline/common"
import { McpMarketplaceCatalog } from "@shared/proto/cline/mcp"
import type { Controller } from "../index"

/**
 * RPC handler that silently refreshes the MCP marketplace catalog
 * @param controller Controller instance
 * @param _request Empty request
 * @returns MCP marketplace catalog
 */
export async function refreshMcpMarketplace(controller: Controller, _request: EmptyRequest): Promise<McpMarketplaceCatalog> {
	try {
		// Call the method to refresh the catalog, which updates it internally
		await controller.silentlyRefreshMcpMarketplace()

		// Get the updated catalog from the global state
		const { getGlobalState } = await import("../../storage/state")
		const catalog = await getGlobalState(controller.context, "mcpMarketplaceCatalog")

		if (catalog) {
			// Types are structurally identical, use direct type assertion
			return catalog as McpMarketplaceCatalog
		}

		// Return empty catalog if nothing was fetched
		return McpMarketplaceCatalog.create({ items: [] })
	} catch (error) {
		console.error("Failed to refresh MCP marketplace:", error)
		return McpMarketplaceCatalog.create({ items: [] })
	}
}
