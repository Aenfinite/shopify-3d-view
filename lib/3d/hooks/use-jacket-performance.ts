import { useEffect } from 'react'

/**
 * Hook to monitor jacket loading and rendering performance
 */
export function useJacketPerformance() {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      console.log(`🎭 Jacket performance metrics:`)
      console.log(`Total rendering time: ${(endTime - startTime).toFixed(2)}ms`)
    }
  }, [])
}