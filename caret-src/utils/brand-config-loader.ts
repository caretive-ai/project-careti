// CARET MODIFICATION: Brand configuration loader utility for B2B white-label solutions
import fs from "fs"
import path from "path"
import { ModelInfo } from "@shared/api"

export interface BrandApiConfig {
  metadata: {
    brand: string
    target: string
    description: string
  }
  api: {
    baseUrl: string
    providerName: string
    authType: string
    timeout: number
    retryAttempts: number
    headers: Record<string, string>
    mcpMarketplaceUrl?: string
    status?: string
  }
  mappings: Record<string, string>
  ui: {
    hideOtherProviders: boolean
    showOnlyBrandedProvider: boolean
    providerDisplayName: string
    preparingMessage?: string
  }
  i18n?: {
    mcpMarketplace?: {
      tabName: string
      preparing: string
      error: string
    }
  }
  package_fields: string[]
  terminal: {
    name: string
    icon_file: string
  }
}

/**
 * Load brand configuration from JSON file
 * @param brandName - Brand name (e.g., "codecenter", "customcompany")
 * @returns Brand configuration object
 */
export function loadBrandConfig(brandName: string): BrandApiConfig {
  try {
    const configPath = path.join(process.cwd(), `caret-b2b/brands/${brandName}/brand-config.json`)
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Brand config not found for: ${brandName} at ${configPath}`)
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(configContent) as BrandApiConfig
    
    // Validate required fields
    if (!config.metadata?.brand || !config.api?.baseUrl) {
      throw new Error(`Invalid brand config for: ${brandName}`)
    }
    
    return config
  } catch (error) {
    console.error(`Failed to load brand config for ${brandName}:`, error)
    throw error
  }
}

/**
 * Detect current brand based on environment or package.json
 * @returns Current brand name or "caret" as default
 */
export function detectCurrentBrand(): string {
  try {
    // Method 1: Check environment variable
    if (process.env.CARET_BRAND) {
      return process.env.CARET_BRAND
    }
    
    // Method 2: Check if specific brand configs exist
    const brandsDir = path.join(process.cwd(), "caret-b2b/brands")
    if (fs.existsSync(brandsDir)) {
      const brands = fs.readdirSync(brandsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
      
      // For now, return first available brand config
      if (brands.length > 0) {
        return brands[0]
      }
    }
    
    // Default to caret
    return "caret"
  } catch (error) {
    console.warn("Failed to detect current brand, defaulting to 'caret':", error)
    return "caret"
  }
}

/**
 * Get current brand provider name based on brand detection
 * @returns Provider name for current brand
 */
export function getCurrentBrandProvider(): string {
  const currentBrand = detectCurrentBrand()
  
  switch (currentBrand) {
    case "codecenter": return "codecenter"
    case "customcompany": return "customcompany" 
    default: return "caret"
  }
}

/**
 * Check if a brand config exists
 * @param brandName - Brand name to check
 * @returns True if brand config exists
 */
export function hasBrandConfig(brandName: string): boolean {
  try {
    const configPath = path.join(process.cwd(), `caret-b2b/brands/${brandName}/brand-config.json`)
    return fs.existsSync(configPath)
  } catch {
    return false
  }
}