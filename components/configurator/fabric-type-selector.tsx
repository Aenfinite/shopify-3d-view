
"use client"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Shirt } from "lucide-react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
interface FabricType {
  id: string
  name: string
  price: number
  image: string
  description: string
  weight: string
  season: string
  availableColors: string[]
  performanceFeatures?: string[]
  technicalSpecs?: {
    tone: string
    pattern: string
    weave: string
    category: string
    seasonality: string
    weight: string
    composition: string
    shine: string
    opacity: string
    stretch: string
    suggestedOccasion: string
    waterRepellent?: boolean
    odorResistant?: boolean
    fastDrying?: boolean
    sweatWicking?: boolean
    breathable?: boolean
    wrinkleResistant?: boolean
    uvProtection?: boolean
  }
}

interface FabricTypeSelectorProps {
  selectedFabricType: string
  onFabricSelect: (fabricId: string, price: number) => void
  fabrics: FabricType[]
}

export function FabricTypeSelector({ 
  selectedFabricType, 
  onFabricSelect, 
  fabrics 
}: FabricTypeSelectorProps) {
  const [infoFabricId, setInfoFabricId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default fallback
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fabric images mapping
  const fabricImages = [
    '/images/fabric/IMG-20250831-WA0001.jpg',
    '/images/fabric/IMG-20250831-WA0002.jpg',
    '/images/fabric/IMG-20250831-WA0003.jpg',
    '/images/fabric/IMG-20250831-WA0004.jpg',
    '/images/fabric/IMG-20250831-WA0005.jpg',
    '/images/fabric/IMG-20250831-WA0006.jpg',
    '/images/fabric/IMG-20250831-WA0007.jpg'
  ];

  // Get fabric image for current fabric
  const getCurrentFabricImage = () => {
    const currentFabric = fabrics.find(f => f.id === infoFabricId);
    if (!currentFabric) return fabricImages[0];
    
    // Map fabric ID to image index (you can customize this mapping)
    const fabricIndex = fabrics.findIndex(f => f.id === infoFabricId);
    return fabricImages[fabricIndex % fabricImages.length] || fabricImages[0];
  };

  // Navigation functions
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % fabricImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + fabricImages.length) % fabricImages.length);
  };

  useEffect(() => {
    setMounted(true);
    
    // Function to calculate actual sidebar width
    const calculateSidebarWidth = () => {
      // Try multiple selectors to find the sidebar
      const selectors = [
        '[data-sidebar="sidebar"]',
        '.group\\/sidebar-wrapper > *:first-child', // Sidebar wrapper's first child
        '[data-state="expanded"]', // Expanded sidebar
        '.peer' // Peer class from sidebar
      ];
      
      for (const selector of selectors) {
        const sidebar = document.querySelector(selector);
        if (sidebar) {
          const rect = sidebar.getBoundingClientRect();
          const width = rect.right; // Use right edge position instead of width
          console.log(`Sidebar found with selector: ${selector}, width: ${width}px`);
          setSidebarWidth(width);
          return;
        }
      }
      
      // Fallback: try to find any element with sidebar-related classes
      const fallbackSidebar = document.querySelector('[class*="sidebar"], [class*="w-64"], [class*="w-80"]');
      if (fallbackSidebar) {
        const width = fallbackSidebar.getBoundingClientRect().right;
        console.log(`Fallback sidebar found, width: ${width}px`);
        setSidebarWidth(width);
      } else {
        console.log('No sidebar found, using default width: 256px');
        setSidebarWidth(450);
      }
    };
    
    // Calculate initial width
    calculateSidebarWidth();
    
    // Listen for window resize to update width
    window.addEventListener('resize', calculateSidebarWidth);
    
    // Use MutationObserver to watch for sidebar changes (collapse/expand)
    const observer = new MutationObserver(() => {
      setTimeout(calculateSidebarWidth, 100); // Small delay for animation
    });
    
    const sidebar = document.querySelector('[data-sidebar="sidebar"]');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class', 'style'] });
    }
    
    return () => {
      window.removeEventListener('resize', calculateSidebarWidth);
      observer.disconnect();
    };
  }, []);
  return (
    <>
      <div className="space-y-4 sm:space-y-6" style={{ fontFamily: 'Concord W00 ExtraLight, Arial, sans-serif' }}>
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </div>
        </div>

        {/* Fabric List - Optimized for Sidebar */}
        <div className="space-y-3">
          {fabrics.map((fabric) => (
            <div
              key={fabric.id}
              onClick={() => {
                if (selectedFabricType !== fabric.id) {
                  onFabricSelect(fabric.id, fabric.price);
                  setInfoFabricId(null);
                } else if (infoFabricId !== fabric.id) {
                  setInfoFabricId(fabric.id);
                  setGalleryIndex(0);
                  setCurrentImageIndex(fabrics.findIndex(f => f.id === fabric.id) % fabricImages.length);
                  // Trigger animation after state update
                  setTimeout(() => setIsAnimating(true), 10);
                } else {
                  setIsAnimating(false);
                  setShowDetailedInfo(false); // Reset detailed info when closing
                  setTimeout(() => setInfoFabricId(null), 500); // Wait for exit animation
                }
              }}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md
                ${selectedFabricType === fabric.id
                  ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Fabric Preview */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <Shirt className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1 leading-tight">{fabric.name}</p>
                    </div>
                  </div>
                </div>

                {/* Fabric Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                      {fabric.name}
                    </h4>
                    <div className="flex items-center gap-2 ml-2">
                      {fabric.price > 0 ? (
                        <Badge variant="outline" className="text-xs text-green-600 whitespace-nowrap">
                          +${fabric.price}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          Included
                        </Badge>
                      )}
                      {selectedFabricType === fabric.id && (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                    {fabric.description}
                  </p>

                  {/* Fabric Details - Compact Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight:</span>
                      <span className="font-medium">{fabric.weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Season:</span>
                      <span className="font-medium">{fabric.season}</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-gray-500">Available colors:</span>
                      <span className="font-medium">{fabric.availableColors.length} options</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fabric Guide - Collapsed for Sidebar */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
          <h4 className="font-medium text-amber-900 mb-2 text-sm">Quick Guide</h4>
          <div className="space-y-2 text-xs sm:text-sm text-amber-800">
            <div className="flex justify-between">
              <span className="font-medium">Business:</span>
              <span>Premium Wool, Wool Blend</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Luxury:</span>
              <span>Cashmere Blend</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Summer:</span>
              <span>Summer Wool, Linen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Render overlay using portal to break out of container constraints */}
      {mounted && infoFabricId && createPortal(
        <div 
          className="fixed inset-0 z-50 transition-all duration-500 ease-out" 
          style={{
            left: `${sidebarWidth}px`, // Dynamic sidebar width
            backgroundImage: `url(${fabricImages[currentImageIndex]})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            transform: isAnimating ? 'translateX(0)' : 'translateX(-100%)',
            opacity: isAnimating ? 1 : 0,
          }}
        >
          {/* Background image slideshow transition */}
          <div 
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              backgroundImage: `url(${fabricImages[currentImageIndex]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-20" />

          {/* Image counter indicator */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white bg-opacity-90 rounded-full px-4 py-2 text-sm font-medium text-gray-700">
              {currentImageIndex + 1} / {fabricImages.length}
            </div>
          </div>

          {/* Navigation arrows */}
          <button 
            className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-black text-2xl hover:bg-opacity-100 transition border border-gray-300 z-10"
            onClick={previousImage}
          >
            ←
          </button>
          <button 
            className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-black text-2xl hover:bg-opacity-100 transition border border-gray-300 z-10"
            onClick={nextImage}
          >
            →
          </button>
          {/* Close button */}
          <button 
            className="absolute top-6 right-6 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl hover:bg-opacity-30 transition" 
            onClick={() => {
              setIsAnimating(false);
              setTimeout(() => setInfoFabricId(null), 500);
            }}
          >
            ×
          </button>
          
          {/* Navigation arrows */}
          <button className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-black text-2xl hover:bg-opacity-100 transition border border-gray-300">
            ←
          </button>
          <button className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-black text-2xl hover:bg-opacity-100 transition border border-gray-300">
            →
          </button>
          
          {/* Bottom card with all content */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-8 z-20">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-8 relative overflow-hidden">
              <div className="p-8">
                {/* Close button */}
                <button 
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-black hover:text-gray-600 transition text-xl font-bold"
                  onClick={() => {
                    setIsAnimating(false);
                    setShowDetailedInfo(false);
                    setTimeout(() => setInfoFabricId(null), 500);
                  }}
                >
                  ×
                </button>
                
                {/* Fabric name - large and bold */}
                <h1 className="text-4xl font-light mb-8 text-center text-gray-900 tracking-wide">
                  {fabrics.find(f => f.id === infoFabricId)?.name}.
                </h1>
                
                {/* Feature icons */}
                <div className="flex justify-center gap-8 mb-8 flex-wrap">
                  {/* Core fabric features */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-3 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-700">
                        <path fill="currentColor" d="M2 2h6v6H2V2zm7 0h6v6H9V2zm7 0h6v6h-6V2zM2 9h6v6H2V9zm7 0h6v6H9V9zm7 0h6v6h-6V9zM2 16h6v6H2v-6zm7 0h6v6H9v-6zm7 0h6v6h-6v-6z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Comfort stretch</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-3 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-700">
                        <path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7zm2 2v6h6V9H9z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Twill weave</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-3 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-700">
                        <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Year round</span>
                  </div>

                  {/* Performance features */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-3 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-blue-600">
                        <path fill="currentColor" d="M12,3.77L11.25,4.61C11.25,4.61 9.97,6.06 8.68,7.94C7.39,9.82 6.25,12.07 6.25,14.2A5.75,5.75 0 0,0 12,20A5.75,5.75 0 0,0 17.75,14.2C17.75,12.07 16.61,9.82 15.32,7.94C14.03,6.06 12.75,4.61 12.75,4.61L12,3.77M12,6.9C12.44,7.44 12.84,7.96 13.68,9.34C14.89,11.34 15.75,13.05 15.75,14.2A3.75,3.75 0 0,1 12,18A3.75,3.75 0 0,1 8.25,14.2C8.25,13.05 9.11,11.34 10.32,9.34C11.16,7.96 11.56,7.44 12,6.9Z"/>
                      </svg>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Water repellent</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-3 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-600">
                        <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                      </svg>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Odor resistant</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-3 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500">
                        <path fill="currentColor" d="M6,14A1,1 0 0,1 7,15A1,1 0 0,1 6,16A1,1 0 0,1 5,15A1,1 0 0,1 6,14M6,10A1,1 0 0,1 7,11A1,1 0 0,1 6,12A1,1 0 0,1 5,11A1,1 0 0,1 6,10M6,6A1,1 0 0,1 7,7A1,1 0 0,1 6,8A1,1 0 0,1 5,7A1,1 0 0,1 6,6M18,15A1,1 0 0,1 19,16A1,1 0 0,1 18,17A1,1 0 0,1 17,16A1,1 0 0,1 18,15M18,11A1,1 0 0,1 19,12A1,1 0 0,1 18,13A1,1 0 0,1 17,12A1,1 0 0,1 18,11M18,7A1,1 0 0,1 19,8A1,1 0 0,1 18,9A1,1 0 0,1 17,8A1,1 0 0,1 18,7M12,2L13.09,8.26L22,9L14,14L17,22L12,18L7,22L10,14L2,9L10.91,8.26L12,2Z"/>
                      </svg>
                    </div>
                    <span className="text-xs text-orange-500 font-medium">Fast drying</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-3 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-purple-600">
                        <path fill="currentColor" d="M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2M12,4C7.6,4 4,7.6 4,12C4,16.4 7.6,20 12,20C16.4,20 20,16.4 20,12C20,7.6 16.4,4 12,4M14,6L16.5,8.5L15.08,9.92L14,8.84L12.92,9.92L11.5,8.5L14,6M10,9.5L8.5,11L9.92,12.42L11,11.34L12.08,12.42L13.5,11L12,9.5H10M8.5,13L6,15.5L7.42,16.92L8.5,15.84L9.58,16.92L11,15.5L8.5,13Z"/>
                      </svg>
                    </div>
                    <span className="text-xs text-purple-600 font-medium">Moisture wicking</span>
                  </div>
                </div>
                
                {/* Action buttons - inside the rectangle */}
                <div className="flex justify-center gap-4">
                  <button 
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition font-medium"
                    onClick={() => setShowDetailedInfo(!showDetailedInfo)}
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                    {showDetailedInfo ? 'Hide info' : 'More info'}
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition font-medium">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Real life pictures
                  </button>
                </div>
              </div>
              
              {/* Detailed info section - expandable */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showDetailedInfo ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-8 pb-8 pt-4 border-t border-gray-200">
                  {/* Performance Features Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600">
                          <path fill="currentColor" d="M12,3.77L11.25,4.61C11.25,4.61 9.97,6.06 8.68,7.94C7.39,9.82 6.25,12.07 6.25,14.2A5.75,5.75 0 0,0 12,20A5.75,5.75 0 0,0 17.75,14.2C17.75,12.07 16.61,9.82 15.32,7.94C14.03,6.06 12.75,4.61 12.75,4.61L12,3.77Z"/>
                        </svg>
                        <span className="text-sm font-medium text-blue-700">Water Repellent</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-600">
                          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"/>
                        </svg>
                        <span className="text-sm font-medium text-green-700">Odor Resistant</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-orange-500">
                          <path fill="currentColor" d="M6,14A1,1 0 0,1 7,15A1,1 0 0,1 6,16A1,1 0 0,1 5,15A1,1 0 0,1 6,14M18,15A1,1 0 0,1 19,16A1,1 0 0,1 18,17A1,1 0 0,1 17,16A1,1 0 0,1 18,15Z"/>
                        </svg>
                        <span className="text-sm font-medium text-orange-600">Fast Drying</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-600">
                          <path fill="currentColor" d="M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z"/>
                        </svg>
                        <span className="text-sm font-medium text-purple-700">Moisture Wicking</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-indigo-600">
                          <path fill="currentColor" d="M12,6A3,3 0 0,1 15,9A3,3 0 0,1 12,12A3,3 0 0,1 9,9A3,3 0 0,1 12,6M12,8A1,1 0 0,0 11,9A1,1 0 0,0 12,10A1,1 0 0,0 13,9A1,1 0 0,0 12,8Z"/>
                        </svg>
                        <span className="text-sm font-medium text-indigo-700">Breathable</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-teal-600">
                          <path fill="currentColor" d="M9,4V6H15V4H17V6H19A2,2 0 0,1 21,8V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V8A2,2 0 0,1 5,6H7V4H9M5,8V18H19V8H5Z"/>
                        </svg>
                        <span className="text-sm font-medium text-teal-700">Wrinkle Resistant</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-600">
                          <path fill="currentColor" d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/>
                        </svg>
                        <span className="text-sm font-medium text-yellow-700">UV Protection</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600">
                          <path fill="currentColor" d="M2 2h6v6H2V2zm7 0h6v6H9V2zm7 0h6v6h-6V2zM2 9h6v6H2V9zm7 0h6v6H9V9zm7 0h6v6h-6V9z"/>
                        </svg>
                        <span className="text-sm font-medium text-gray-700">4-Way Stretch</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Tone:</span>
                        <span className="text-gray-700">Navy Blue</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Weight:</span>
                        <span className="text-gray-700">Medium (8.85 oz/yd²)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Pattern:</span>
                        <span className="text-gray-700">Solid</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Shine:</span>
                        <span className="text-gray-700">Matte</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Weave:</span>
                        <span className="text-gray-700 flex items-center gap-1">
                          Twill
                          <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">i</span>
                          </div>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Opacity:</span>
                        <span className="text-gray-700">Very Opaque</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Category:</span>
                        <span className="text-gray-700 flex items-center gap-1">
                          Performance
                          <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">i</span>
                          </div>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Composition:</span>
                        <span className="text-gray-700">Technical (78% Terylene & 18% Rayon & 4% Spandex)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Seasonality:</span>
                        <span className="text-gray-700">Year round</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Care Instructions:</span>
                        <span className="text-gray-700">Machine washable, Tumble dry low</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Stretch:</span>
                        <span className="text-gray-700 flex items-center gap-1">
                          4-way comfort stretch
                          <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">i</span>
                          </div>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Suggested occasion:</span>
                        <span className="text-gray-700">Business, Smart casual, Travel, Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal for detailed info */}
      {mounted && showModal && infoFabricId && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-8 max-w-lg w-full shadow-xl relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4">{fabrics.find(f => f.id === infoFabricId)?.name}</h2>
            <img src={fabrics.find(f => f.id === infoFabricId)?.image} alt={fabrics.find(f => f.id === infoFabricId)?.name} className="w-full h-48 object-cover rounded mb-4 border" />
            <p className="text-base text-gray-700 mb-4">{fabrics.find(f => f.id === infoFabricId)?.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><span className="font-medium">Weight:</span> {fabrics.find(f => f.id === infoFabricId)?.weight}</div>
              <div><span className="font-medium">Season:</span> {fabrics.find(f => f.id === infoFabricId)?.season}</div>
              {/* Add more details as needed */}
            </div>
            <div className="flex gap-4 mb-2">
              {/* Example icons for highlights, replace with actual icons/features */}
              <span className="flex flex-col items-center"><span className="text-2xl">🏷️</span><span className="text-xs">Twill</span></span>
              <span className="flex flex-col items-center"><span className="text-2xl">💧</span><span className="text-xs">Water Repellent</span></span>
              <span className="flex flex-col items-center"><span className="text-2xl">🌞</span><span className="text-xs">Year Round</span></span>
            </div>
            {/* Add more info sections as needed */}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
