
"use client"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    careInstructions?: string
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

// Helper function to get feature icon and color
const getFeatureIconConfig = (feature: string) => {
  const featureMap: { [key: string]: { icon: string; color: string; label: string } } = {
    "Breathable": { 
      icon: "M12,6A3,3 0 0,1 15,9A3,3 0 0,1 12,12A3,3 0 0,1 9,9A3,3 0 0,1 12,6M12,8A1,1 0 0,0 11,9A1,1 0 0,0 12,10A1,1 0 0,0 13,9A1,1 0 0,0 12,8Z",
      color: "text-indigo-600",
      label: "Breathable"
    },
    "Wrinkle Resistant": {
      icon: "M9,4V6H15V4H17V6H19A2,2 0 0,1 21,8V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V8A2,2 0 0,1 5,6H7V4H9M5,8V18H19V8H5Z",
      color: "text-teal-600",
      label: "Wrinkle Resistant"
    },
    "Fast Drying": {
      icon: "M6,14A1,1 0 0,1 7,15A1,1 0 0,1 6,16A1,1 0 0,1 5,15A1,1 0 0,1 6,14M18,15A1,1 0 0,1 19,16A1,1 0 0,1 18,17A1,1 0 0,1 17,16A1,1 0 0,1 18,15Z",
      color: "text-orange-500",
      label: "Fast Drying"
    },
    "Fast drying": {
      icon: "M6,14A1,1 0 0,1 7,15A1,1 0 0,1 6,16A1,1 0 0,1 5,15A1,1 0 0,1 6,14M18,15A1,1 0 0,1 19,16A1,1 0 0,1 18,17A1,1 0 0,1 17,16A1,1 0 0,1 18,15Z",
      color: "text-orange-500",
      label: "Fast drying"
    },
    "Moisture Wicking": {
      icon: "M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z",
      color: "text-purple-600",
      label: "Moisture Wicking"
    },
    "Moisture wicking": {
      icon: "M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2Z",
      color: "text-purple-600",
      label: "Moisture wicking"
    },
    "4-Way Stretch": {
      icon: "M2 2h6v6H2V2zm7 0h6v6H9V2zm7 0h6v6h-6V2zM2 9h6v6H2V9zm7 0h6v6H9V9zm7 0h6v6h-6V9z",
      color: "text-gray-600",
      label: "4-Way Stretch"
    },
    "Mechanical Stretch": {
      icon: "M2 2h6v6H2V2zm7 0h6v6H9V2zm7 0h6v6h-6V2zM2 9h6v6H2V9zm7 0h6v6H9V9zm7 0h6v6h-6V9zM2 16h6v6H2v-6zm7 0h6v6H9v-6zm7 0h6v6h-6v-6z",
      color: "text-gray-700",
      label: "Mechanical Stretch"
    },
    "Mechanical stretch": {
      icon: "M2 2h6v6H2V2zm7 0h6v6H9V2zm7 0h6v6h-6V2zM2 9h6v6H2V9zm7 0h6v6H9V9zm7 0h6v6h-6V9zM2 16h6v6H2v-6zm7 0h6v6H9v-6zm7 0h6v6h-6v-6z",
      color: "text-gray-700",
      label: "Mechanical stretch"
    },
    "Machine washable": {
      icon: "M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z",
      color: "text-cyan-600",
      label: "Machine washable"
    },
    "Water Repellent": {
      icon: "M12,3.77L11.25,4.61C11.25,4.61 9.97,6.06 8.68,7.94C7.39,9.82 6.25,12.07 6.25,14.2A5.75,5.75 0 0,0 12,20A5.75,5.75 0 0,0 17.75,14.2C17.75,12.07 16.61,9.82 15.32,7.94C14.03,6.06 12.75,4.61 12.75,4.61L12,3.77Z",
      color: "text-blue-600",
      label: "Water Repellent"
    },
    "Odor Resistant": {
      icon: "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z",
      color: "text-green-600",
      label: "Odor Resistant"
    },
    "UV Protection": {
      icon: "M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z",
      color: "text-yellow-600",
      label: "UV Protection"
    }
  };
  
  return featureMap[feature] || { 
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", 
    color: "text-gray-600",
    label: feature 
  };
};

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
  
  // Get current fabric data
  const currentFabric = fabrics.find(f => f.id === infoFabricId);

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
          <div className="flex items-center justify-center gap-2 mb-1">
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
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    {fabric.image && !fabric.image.includes('placeholder') ? (
                      <img
                        src={fabric.image}
                        alt={fabric.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shirt className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Fabric Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm sm:text-base text-gray-900 truncate">
                      {fabric.name}
                    </h4>
                    <div className="flex items-center gap-2 ml-2">
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
                      <span className="font-medium">{fabric.availableColors.length} colors available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                  {currentFabric?.name}.
                </h1>
                
                {/* Feature icons - dynamically rendered */}
                <div className="flex justify-center gap-8 mb-8 flex-wrap">
                  {/* Core fabric features - always shown */}
                  {currentFabric?.technicalSpecs?.stretch && (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-3 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-700">
                          <path fill="currentColor" d="M2 2h6v6H2V2zm7 0h6v6H9V2zm7 0h6v6h-6V2zM2 9h6v6H2V9zm7 0h6v6H9V9zm7 0h6v6h-6V9zM2 16h6v6H2v-6zm7 0h6v6H9v-6zm7 0h6v6h-6v-6z"/>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{currentFabric.technicalSpecs.stretch}</span>
                    </div>
                  )}
                  {currentFabric?.technicalSpecs?.weave && (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-3 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-700">
                          <path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7zm2 2v6h6V9H9z"/>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{currentFabric.technicalSpecs.weave} weave</span>
                    </div>
                  )}
                  {currentFabric?.technicalSpecs?.seasonality && (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 mb-3 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-700">
                          <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{currentFabric.technicalSpecs.seasonality}</span>
                    </div>
                  )}

                  {/* Performance features - dynamically rendered from fabric data */}
                  {currentFabric?.performanceFeatures?.slice(0, 4).map((feature, index) => {
                    const config = getFeatureIconConfig(feature);
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className="w-12 h-12 mb-3 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className={`w-8 h-8 ${config.color}`}>
                            <path fill="currentColor" d={config.icon} />
                          </svg>
                        </div>
                        <span className={`text-xs ${config.color} font-medium`}>{config.label}</span>
                      </div>
                    );
                  })}
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
                  {/* Performance Features Section - Dynamic */}
                  {currentFabric?.performanceFeatures && currentFabric.performanceFeatures.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {currentFabric.performanceFeatures.map((feature, index) => {
                          const config = getFeatureIconConfig(feature);
                          const bgColorMap: { [key: string]: string } = {
                            "text-blue-600": "bg-blue-50",
                            "text-green-600": "bg-green-50",
                            "text-orange-500": "bg-orange-50",
                            "text-purple-600": "bg-purple-50",
                            "text-indigo-600": "bg-indigo-50",
                            "text-teal-600": "bg-teal-50",
                            "text-yellow-600": "bg-yellow-50",
                            "text-gray-600": "bg-gray-50",
                            "text-gray-700": "bg-gray-50",
                            "text-cyan-600": "bg-cyan-50"
                          };
                          const bgColor = bgColorMap[config.color] || "bg-gray-50";
                          
                          return (
                            <div key={index} className={`flex items-center gap-2 p-3 ${bgColor} rounded-lg`}>
                              <svg viewBox="0 0 24 24" className={`w-5 h-5 ${config.color}`}>
                                <path fill="currentColor" d={config.icon} />
                              </svg>
                              <span className={`text-sm font-medium ${config.color.replace('text-', 'text-')}`}>{config.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Technical Specifications - Dynamic */}
                  {currentFabric?.technicalSpecs && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        {currentFabric.technicalSpecs.tone && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Tone:</span>
                            <span className="text-gray-700">{currentFabric.technicalSpecs.tone}</span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.weight && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Weight:</span>
                            <span className="text-gray-700">{currentFabric.technicalSpecs.weight}</span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.pattern && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Pattern:</span>
                            <span className="text-gray-700">{currentFabric.technicalSpecs.pattern}</span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.shine && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Shine:</span>
                            <span className="text-gray-700">{currentFabric.technicalSpecs.shine}</span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.weave && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Weave:</span>
                            <span className="text-gray-700 flex items-center gap-1">
                              {currentFabric.technicalSpecs.weave}
                              <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xs text-gray-600">i</span>
                              </div>
                            </span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.opacity && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Opacity:</span>
                            <span className="text-gray-700">{currentFabric.technicalSpecs.opacity}</span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.category && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Category:</span>
                            <span className="text-gray-700 flex items-center gap-1">
                              {currentFabric.technicalSpecs.category}
                              <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xs text-gray-600">i</span>
                              </div>
                            </span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.composition && (
                          <div className="flex justify-between col-span-2">
                            <span className="font-medium text-gray-900">Composition:</span>
                            <span className="text-gray-700">{currentFabric.technicalSpecs.composition}</span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.seasonality && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Seasonality:</span>
                            <span className="text-gray-700">{currentFabric.technicalSpecs.seasonality}</span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.careInstructions && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Care Instructions:</span>
                            <span className="text-gray-700">{currentFabric.technicalSpecs.careInstructions}</span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.stretch && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Stretch:</span>
                            <span className="text-gray-700 flex items-center gap-1">
                              {currentFabric.technicalSpecs.stretch}
                              <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-xs text-gray-600">i</span>
                              </div>
                            </span>
                          </div>
                        )}
                        {currentFabric.technicalSpecs.suggestedOccasion && (
                          <div className="flex justify-between col-span-2">
                            <span className="font-medium text-gray-900">Suggested occasion:</span>
                            <span className="text-gray-700">{currentFabric.technicalSpecs.suggestedOccasion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
