"use client"

import { useEffect } from "react"

// PWA Manager for registering service worker and managing 3D model caching
export function PWAManager() {
  useEffect(() => {
    // Register service worker if supported
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    } else {
      console.log('📱 Service Worker not supported in this browser')
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      console.log('🚀 Registering PWA Service Worker...')
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('✅ Service Worker registered successfully:', registration)

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          console.log('🔄 New Service Worker available')
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('🎉 New Service Worker ready - models will load faster!')
                showUpdateNotification()
              } else {
                console.log('🎯 Service Worker installed - 3D models will be cached')
              }
            }
          })
        }
      })

      // Start preloading models once service worker is ready
      if (registration.active) {
        startModelPreloading()
      } else {
        registration.addEventListener('controllerchange', () => {
          startModelPreloading()
        })
      }

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
    }
  }

  const startModelPreloading = () => {
    if (navigator.serviceWorker.controller) {
      console.log('📦 Starting background model preloading...')
      navigator.serviceWorker.controller.postMessage({
        type: 'PRELOAD_MODELS'
      })
    }
  }

  const showUpdateNotification = () => {
    // Could show a toast notification here
    console.log('💾 App updated! Jacket models will load even faster now.')
  }

  // Return null since this is a utility component
  return null
}

// Hook for PWA functionality
export function usePWA() {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const isPWAInstalled = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches

  const checkCacheStatus = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      const hasModelCache = cacheNames.some(name => name.includes('jacket-3d-models'))
      const hasDRACOCache = cacheNames.some(name => name.includes('draco-decoder'))
      
      return {
        hasModelCache,
        hasDRACOCache,
        totalCaches: cacheNames.length
      }
    }
    return { hasModelCache: false, hasDRACOCache: false, totalCaches: 0 }
  }

  const clearModelCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      const modelCaches = cacheNames.filter(name => 
        name.includes('jacket-3d-models') || name.includes('draco-decoder')
      )
      
      await Promise.all(modelCaches.map(cacheName => caches.delete(cacheName)))
      console.log('🧹 Model caches cleared')
    }
  }

  const preloadModelsManually = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PRELOAD_MODELS'
      })
      console.log('🎯 Manual model preload initiated')
    }
  }

  return {
    isOnline,
    isPWAInstalled,
    checkCacheStatus,
    clearModelCache,
    preloadModelsManually
  }
}

// Add PWA meta tags and manifest
export function PWAHead() {
  return (
    <>
      <meta name="theme-color" content="#1a237e" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="3D Jacket Configurator" />
      <meta name="description" content="Customize your jacket in real-time 3D with instant loading" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
    </>
  )
}