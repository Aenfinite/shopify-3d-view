"use client"

import { useState, useEffect } from "react"
import { useConfigurator } from "@/context/configurator-context"
import type { FrontStyle } from "@/types/configurator"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import Image from "next/image"

interface FrontStyleOption {
  id: FrontStyle
  name: string
  description: string
  price: number
  image: string
}

const frontStyleOptions: FrontStyleOption[] = [
  {
    id: "2button",
    name: "Two Buttons",
    description: "Classic single-breasted suit with two buttons",
    price: 0,
    image: "/images/icons/2button-icon.svg"
  },
  {
    id: "3button",
    name: "Three Buttons",
    description: "Traditional single-breasted with three buttons",
    price: 10,
    image: "/images/icons/3button-icon.svg"
  },
  {
    id: "6d2",
    name: "2×3 Buttons",
    description: "Double-breasted style with six buttons",
    price: 25,
    image: "/images/icons/6d2-icon.svg"
  }
]

export function FrontStyleSelector() {
  const { frontStyle, setFrontStyle, jacketCustomizations, updateJacketCustomizations } = useConfigurator()
  const [isChanging, setIsChanging] = useState(false)

  // Only initialize if no style is set
  useEffect(() => {
    if (!frontStyle) {
      console.log("🎬 Initializing with default style")
      handleStyleChange("2button")
    }
  }, [])

  const handleStyleChange = async (style: FrontStyle) => {
    // Don't change if it's the same style or already changing
    if (frontStyle === style || isChanging) {
      console.log(`⚠️ Style change rejected:`, {
        currentStyle: frontStyle,
        requestedStyle: style,
        isChanging,
        reason: frontStyle === style ? 'Same style' : 'Change in progress'
      })
      return
    }
    
    setIsChanging(true)
    console.log(`🔄 Style change initiated:`, {
      from: frontStyle,
      to: style
    })
    
    try {
      // First update the front style state
      console.log(`🎯 Setting new front style:`, style)
      setFrontStyle(style)
      
      // Then update customizations with new style and lapel configuration
      const updatedCustomizations = {
        ...jacketCustomizations,
        frontStyle: style, // This will trigger loading new model files
        lapelStyle: style === '6d2' ? 'peaked' : 'notched' // Set appropriate lapel style based on front style
      }

      console.log(`📦 Updating jacket style:`, {
        newStyle: style,
        lapelStyle: style === '6d2' ? 'peaked' : 'notched',
        willLoad: style === '2button' 
          ? '2-button jacket model files'
          : style === '3button'
          ? '3-button jacket model files'
          : '6x2 double-breasted jacket model files'
      })
      
      // Force a complete model reload by clearing any cached state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update the customizations last to ensure model reload
      updateJacketCustomizations(updatedCustomizations)
      
      // Wait for models to actually load
      await new Promise((resolve) => {
        const checkLoading = () => {
          try {
            // Count part loading markers to determine loading state
            const loadingPartsCount = document.querySelectorAll('canvas [name$="-loading-marker"]').length;
            const totalPartsExpected = 5; // Number of parts we expect to load
            
            console.log('🔍 Checking loading status:', {
              loadedParts: totalPartsExpected - loadingPartsCount,
              totalParts: totalPartsExpected,
              isComplete: loadingPartsCount === 0
            });
            
            if (loadingPartsCount === 0) {
              console.log('✅ All parts loaded successfully');
              resolve(true);
            } else {
              setTimeout(checkLoading, 100);
            }
          } catch (error) {
            console.error('Error checking loading status:', error);
            setTimeout(checkLoading, 100);
          }
        };
        setTimeout(checkLoading, 500); // Initial delay to allow for scene setup
      });
      
      console.log(`✅ Style change completed:`, {
        newStyle: style,
        modelFiles: style === '2button'
          ? [
              '/models/jackets/Front/Bottom/2Button/Curved.gltf',
              '/models/jackets/Front/Button/2Button/S4.gltf',
              '/models/jackets/Front/Thread/2Button.gltf'
            ]
          : style === '3button'
          ? [
              '/models/jackets/Front/Bottom/3Button/Curved.gltf',
              '/models/jackets/Front/Button/3Button/S4.gltf',
              '/models/jackets/Front/Thread/3Button.gltf'
            ]
          : [
              '/models/jackets/Front/Bottom/6D2/Straight.gltf',
              '/models/jackets/Front/Button/6D2/S4.gltf',
              '/models/jackets/Front/Thread/6D2.gltf'
            ]
      })
    } catch (error) {
      console.error('❌ Error during style change:', {
        error,
        attemptedStyle: style,
        currentState: {
          frontStyle,
          jacketCustomizations
        }
      })
    } finally {
      setIsChanging(false)
      console.log(`🏁 Style change process finished:`, {
        finalStyle: style,
        isChanging: false
      })
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Choose Front Style</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {frontStyleOptions.map((option) => (
          <Card
            key={option.id}
            onClick={() => handleStyleChange(option.id)}
            className={`relative cursor-pointer transition-all ${
              frontStyle === option.id 
                ? "ring-2 ring-primary bg-primary/5" 
                : "hover:bg-gray-50"
            } ${isChanging ? "opacity-50 pointer-events-none select-none" : ""}`}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-24 h-24 relative mb-3">
                <Image
                  src={option.image}
                  alt={option.name}
                  fill
                  className={`object-contain transition-opacity duration-300 ${
                    isChanging ? "opacity-30" : "opacity-100"
                  }`}
                  priority
                />
                {isChanging && frontStyle === option.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium text-lg">
                  {option.name}
                  {isChanging && frontStyle === option.id && (
                    <span className="ml-2 text-primary text-sm">Loading...</span>
                  )}
                </h4>
                {option.price > 0 && (
                  <p className="text-sm font-semibold text-red-500 mt-1">
                    +€{option.price}
                  </p>
                )}
              </div>
              {frontStyle === option.id && (
                <div className="absolute top-2 right-2">
                  <div className="bg-primary text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}