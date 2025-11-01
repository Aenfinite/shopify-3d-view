/**
 * GLTF Loader Configuration
 * 
 * Configures Three.js GLTFLoader to properly resolve binary (.bin) files in Next.js
 */

import { LoadingManager } from "three"

// Create a custom loading manager that logs all requests
export const createCustomLoadingManager = () => {
  const manager = new LoadingManager()
  
  // Log when items start loading
  manager.onStart = (url, itemsLoaded, itemsTotal) => {
    console.log(`🔄 Loading started: ${url}`)
    console.log(`📦 Progress: ${itemsLoaded} of ${itemsTotal} files`)
  }
  
  // Log progress
  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    console.log(`📊 Loading progress: ${url}`)
    console.log(`📦 Progress: ${itemsLoaded} of ${itemsTotal} files`)
  }
  
  // Log when loading completes
  manager.onLoad = () => {
    console.log(`✅ All resources loaded successfully!`)
  }
  
  // Log errors
  manager.onError = (url) => {
    console.error(`❌ Error loading: ${url}`)
  }
  
  // Override the resolveURL method to ensure proper path resolution
  const originalResolveURL = manager.resolveURL.bind(manager)
  manager.resolveURL = (url: string) => {
    console.log(`🔍 Resolving URL: ${url}`)
    
    // If it's already an absolute URL, return it
    if (url.startsWith('http') || url.startsWith('//')) {
      console.log(`✅ Already absolute: ${url}`)
      return url
    }
    
    // If it's a relative path, prepend with the base URL
    if (!url.startsWith('/')) {
      // Extract the directory from the current model path
      const baseUrl = window.location.origin
      const resolvedUrl = `${baseUrl}/${url}`
      console.log(`🔗 Resolved to: ${resolvedUrl}`)
      return resolvedUrl
    }
    
    // For absolute paths starting with /, just prepend the origin
    const fullUrl = `${window.location.origin}${url}`
    console.log(`🔗 Full URL: ${fullUrl}`)
    return fullUrl
  }
  
  return manager
}

// Export a singleton instance
let globalLoadingManager: LoadingManager | null = null

export const getGlobalLoadingManager = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return new LoadingManager()
  }
  
  if (!globalLoadingManager) {
    globalLoadingManager = createCustomLoadingManager()
  }
  
  return globalLoadingManager
}
