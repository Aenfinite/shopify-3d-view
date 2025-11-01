// PWA Service Worker for 3D Model Caching
// This service worker caches GLTF models and DRACO files for instant loading

const CACHE_NAME = 'jacket-3d-models-v1'
const DRACO_CACHE = 'draco-decoder-v1'
const MODEL_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

// List of critical assets to cache immediately
const CRITICAL_ASSETS = [
  '/draco/draco_decoder.js',
  '/draco/draco_decoder.wasm', 
  '/draco/draco_wasm_wrapper.js'
]

// GLTF model paths to cache
const MODEL_PATHS = [
  '/models/jackets/Front/Bottom/2Button/Curved.gltf',
  '/models/jackets/Lapel/Regular/Lower/2Button/CL3.gltf',
  '/models/jackets/Lapel/Regular/Upper/2Button/CL3.gltf',
  '/models/jackets/Front/Button/2Button/S4.gltf',
  '/models/jackets/Sleeve/Sleeve.gltf',
  '/models/jackets/Front/Thread/2Button.gltf',
  '/models/jackets/Sleeve/Working/4Button/S4.gltf',
  '/models/jackets/Sleeve/Working/LastButton/S4.gltf',
  '/models/jackets/Sleeve/Working/Thread/LastThread.gltf',
  '/models/jackets/Sleeve/Working/Thread/4Button.gltf',
  '/models/jackets/Vent/CenterVent.gltf'
]

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache DRACO decoder files
      caches.open(DRACO_CACHE).then((cache) => {
        console.log('📦 Caching DRACO decoder files...')
        return cache.addAll(CRITICAL_ASSETS)
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated')
  
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DRACO_CACHE) {
              console.log('🧹 Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
    ])
  )
})

// Fetch event - handle model requests with caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Handle GLTF model requests
  if (url.pathname.endsWith('.gltf') || url.pathname.includes('/models/')) {
    event.respondWith(handleModelRequest(event.request))
  }
  
  // Handle DRACO decoder requests
  else if (url.pathname.includes('/draco/')) {
    event.respondWith(handleDRACORequest(event.request))
  }
  
  // Handle other requests normally
  else {
    event.respondWith(fetch(event.request))
  }
})

// Handle GLTF model requests with intelligent caching
async function handleModelRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  // If cached and not expired, return cached version
  if (cachedResponse) {
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date'))
    const isExpired = Date.now() - cacheDate.getTime() > MODEL_CACHE_DURATION
    
    if (!isExpired) {
      console.log('📂 Serving cached model:', request.url)
      return cachedResponse
    }
  }
  
  try {
    // Fetch fresh version
    console.log('🌐 Fetching fresh model:', request.url)
    const response = await fetch(request)
    
    if (response.ok) {
      // Clone response for caching
      const responseToCache = response.clone()
      
      // Add cache date header
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: {
          ...Object.fromEntries(responseToCache.headers.entries()),
          'sw-cache-date': new Date().toISOString()
        }
      })
      
      // Cache the response
      await cache.put(request, modifiedResponse.clone())
      console.log('💾 Cached model:', request.url)
      
      return response
    }
    
    // If fetch fails and we have cached version, return it
    if (cachedResponse) {
      console.log('⚠️ Fetch failed, serving cached model:', request.url)
      return cachedResponse
    }
    
    return response
  } catch (error) {
    console.error('❌ Model fetch error:', error)
    
    // Return cached version if available
    if (cachedResponse) {
      console.log('🔄 Serving cached model after error:', request.url)
      return cachedResponse
    }
    
    throw error
  }
}

// Handle DRACO decoder requests
async function handleDRACORequest(request) {
  const cache = await caches.open(DRACO_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    console.log('⚡ Serving cached DRACO file:', request.url)
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
      console.log('💾 Cached DRACO file:', request.url)
    }
    return response
  } catch (error) {
    console.error('❌ DRACO fetch error:', error)
    throw error
  }
}

// Background sync for preloading models
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_MODELS') {
    console.log('🎯 Preloading jacket models...')
    preloadModels()
  }
})

// Preload all jacket models in background
async function preloadModels() {
  const cache = await caches.open(CACHE_NAME)
  
  for (const modelPath of MODEL_PATHS) {
    try {
      const request = new Request(modelPath)
      const cachedResponse = await cache.match(request)
      
      if (!cachedResponse) {
        console.log('📥 Preloading model:', modelPath)
        const response = await fetch(request)
        
        if (response.ok) {
          const responseToCache = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              ...Object.fromEntries(response.headers.entries()),
              'sw-cache-date': new Date().toISOString()
            }
          })
          
          await cache.put(request, responseToCache)
          console.log('✅ Preloaded and cached:', modelPath)
        }
      } else {
        console.log('⭐ Model already cached:', modelPath)
      }
    } catch (error) {
      console.error('❌ Preload error for', modelPath, error)
    }
  }
  
  console.log('🎉 Model preloading completed!')
}